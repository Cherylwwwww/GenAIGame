import { aiModelService } from './aiModelService';
import { GameImage } from '../types';

export class TestImageService {
  private availableTestImages: string[] = [
    // Crowd scenes that might contain Wally-like patterns
    "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/2747450/pexels-photo-2747450.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800",
    // Non-crowd scenes (should be negative examples)
    "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184297/pexels-photo-3184297.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/3184299/pexels-photo-3184299.jpeg?auto=compress&cs=tinysrgb&w=800"
  ];

  /**
   * AI自动选择最适合的测试图像
   * 基于当前训练数据的特征来选择挑战性适中的测试图像
   */
  async selectOptimalTestImage(
    trainingImages: GameImage[], 
    currentLevel: number,
    annotatedCount: number
  ): Promise<GameImage> {
    console.log('🤖 AI正在智能选择测试图像...');
    console.log(`📊 基于 ${annotatedCount} 个训练样本选择测试图像`);

    if (!aiModelService.isLoaded() || annotatedCount < 3) {
      // 如果AI模型未加载或训练样本不足，使用预设逻辑
      return this.selectTestImageByLevel(currentLevel);
    }

    try {
      // 分析所有候选测试图像
      const candidateAnalysis = await Promise.all(
        this.availableTestImages.map(async (imageUrl, index) => {
          try {
            // 使用AI模型预测每个候选图像
            const prediction = await aiModelService.predict(imageUrl);
            
            return {
              id: `ai-selected-test-${Date.now()}-${index}`,
              url: imageUrl,
              confidence: prediction?.confidence || 0,
              predictedLabel: prediction?.label || 'unknown',
              actualLabel: this.determineActualLabel(imageUrl, index),
              difficulty: this.calculateDifficulty(prediction?.confidence || 0, annotatedCount)
            };
          } catch (error) {
            console.warn(`⚠️ 无法分析图像 ${imageUrl}:`, error);
            return null;
          }
        })
      );

      // 过滤掉分析失败的图像
      const validCandidates = candidateAnalysis.filter(candidate => candidate !== null);

      if (validCandidates.length === 0) {
        console.log('⚠️ AI分析失败，使用默认测试图像');
        return this.selectTestImageByLevel(currentLevel);
      }

      // 根据训练进度选择合适难度的测试图像
      const optimalCandidate = this.selectByDifficulty(validCandidates, annotatedCount, currentLevel);

      console.log('✅ AI选择了最优测试图像:', {
        confidence: Math.round(optimalCandidate.confidence * 100) + '%',
        difficulty: optimalCandidate.difficulty,
        predictedLabel: optimalCandidate.predictedLabel,
        actualLabel: optimalCandidate.actualLabel
      });

      return {
        id: optimalCandidate.id,
        url: optimalCandidate.url,
        actualLabel: optimalCandidate.actualLabel,
        modelPrediction: optimalCandidate.predictedLabel === 'Wally',
        confidence: optimalCandidate.confidence
      };

    } catch (error) {
      console.error('❌ AI测试图像选择失败:', error);
      return this.selectTestImageByLevel(currentLevel);
    }
  }

  /**
   * 基于级别选择测试图像（备用方案）
   */
  private selectTestImageByLevel(currentLevel: number): GameImage {
    const imageIndex = (currentLevel - 1) % this.availableTestImages.length;
    const selectedUrl = this.availableTestImages[imageIndex];
    
    return {
      id: `level-test-${currentLevel}-${Date.now()}`,
      url: selectedUrl,
      actualLabel: imageIndex < this.availableTestImages.length / 2, // 前半部分为正例
    };
  }

  /**
   * 确定图像的实际标签（基于图像索引和内容类型）
   */
  private determineActualLabel(imageUrl: string, index: number): boolean {
    // 前8张图像是人群场景，可能包含类似Wally的模式
    // 后4张图像是非人群场景，不太可能包含Wally
    return index < 8;
  }

  /**
   * 计算测试图像的难度级别
   */
  private calculateDifficulty(confidence: number, annotatedCount: number): 'easy' | 'medium' | 'hard' {
    // 根据AI预测置信度和训练样本数量计算难度
    if (annotatedCount < 5) {
      // 训练样本少时，选择简单的测试图像
      return confidence > 0.7 || confidence < 0.3 ? 'easy' : 'medium';
    } else if (annotatedCount < 8) {
      // 训练样本中等时，选择中等难度
      return confidence > 0.8 || confidence < 0.2 ? 'easy' : 
             confidence > 0.4 && confidence < 0.6 ? 'hard' : 'medium';
    } else {
      // 训练样本充足时，可以选择困难的测试图像
      return confidence > 0.4 && confidence < 0.6 ? 'hard' : 'medium';
    }
  }

  /**
   * 根据难度和训练进度选择最合适的测试图像
   */
  private selectByDifficulty(
    candidates: any[], 
    annotatedCount: number, 
    currentLevel: number
  ): any {
    // 根据训练进度确定目标难度
    let targetDifficulty: 'easy' | 'medium' | 'hard';
    
    if (annotatedCount < 4) {
      targetDifficulty = 'easy';
      console.log('🎯 选择简单测试图像 - 训练样本较少');
    } else if (annotatedCount < 7) {
      targetDifficulty = 'medium';
      console.log('🎯 选择中等难度测试图像 - 训练进展良好');
    } else {
      targetDifficulty = 'hard';
      console.log('🎯 选择困难测试图像 - 训练样本充足');
    }

    // 首先尝试找到目标难度的图像
    const targetDifficultyImages = candidates.filter(c => c.difficulty === targetDifficulty);
    
    if (targetDifficultyImages.length > 0) {
      // 在目标难度中随机选择
      const randomIndex = Math.floor(Math.random() * targetDifficultyImages.length);
      return targetDifficultyImages[randomIndex];
    }

    // 如果没有目标难度的图像，选择最接近的
    const difficultyOrder = ['easy', 'medium', 'hard'];
    const targetIndex = difficultyOrder.indexOf(targetDifficulty);
    
    // 尝试相邻难度级别
    for (let offset = 1; offset < difficultyOrder.length; offset++) {
      const lowerIndex = targetIndex - offset;
      const higherIndex = targetIndex + offset;
      
      if (lowerIndex >= 0) {
        const lowerDiffImages = candidates.filter(c => c.difficulty === difficultyOrder[lowerIndex]);
        if (lowerDiffImages.length > 0) {
          return lowerDiffImages[Math.floor(Math.random() * lowerDiffImages.length)];
        }
      }
      
      if (higherIndex < difficultyOrder.length) {
        const higherDiffImages = candidates.filter(c => c.difficulty === difficultyOrder[higherIndex]);
        if (higherDiffImages.length > 0) {
          return higherDiffImages[Math.floor(Math.random() * higherDiffImages.length)];
        }
      }
    }

    // 最后备选：随机选择任意候选图像
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * 生成多个测试图像供选择
   */
  async generateTestImageSet(
    trainingImages: GameImage[], 
    currentLevel: number,
    annotatedCount: number,
    count: number = 3
  ): Promise<GameImage[]> {
    console.log(`🎲 AI生成 ${count} 个测试图像集合`);
    
    const testImages: GameImage[] = [];
    const usedUrls = new Set<string>();

    for (let i = 0; i < count; i++) {
      try {
        const testImage = await this.selectOptimalTestImage(trainingImages, currentLevel, annotatedCount);
        
        // 避免重复选择相同的图像
        if (!usedUrls.has(testImage.url)) {
          testImages.push({
            ...testImage,
            id: `ai-test-set-${i}-${Date.now()}`
          });
          usedUrls.add(testImage.url);
        } else {
          // 如果选中了重复图像，使用备用方案
          const backupImage = this.selectTestImageByLevel(currentLevel + i);
          testImages.push(backupImage);
          usedUrls.add(backupImage.url);
        }
      } catch (error) {
        console.warn(`⚠️ 生成第 ${i+1} 个测试图像失败:`, error);
        const backupImage = this.selectTestImageByLevel(currentLevel + i);
        testImages.push(backupImage);
        usedUrls.add(backupImage.url);
      }
    }

    console.log(`✅ 成功生成 ${testImages.length} 个AI选择的测试图像`);
    return testImages;
  }

  /**
   * 分析训练数据特征，为测试图像选择提供依据
   */
  async analyzeTrainingPatterns(trainingImages: GameImage[]): Promise<{
    positiveExamples: number;
    negativeExamples: number;
    averageBoxSize: number;
    recommendedDifficulty: 'easy' | 'medium' | 'hard';
  }> {
    const annotatedImages = trainingImages.filter(img => img.userAnnotation !== undefined);
    const positiveExamples = annotatedImages.filter(img => img.userAnnotation !== null).length;
    const negativeExamples = annotatedImages.filter(img => img.userAnnotation === null).length;
    
    // 计算平均边界框大小
    const boundingBoxes = annotatedImages
      .filter(img => img.userAnnotation !== null)
      .map(img => img.userAnnotation!);
    
    const averageBoxSize = boundingBoxes.length > 0 
      ? boundingBoxes.reduce((sum, box) => sum + (box.width * box.height), 0) / boundingBoxes.length
      : 0;

    // 推荐难度级别
    let recommendedDifficulty: 'easy' | 'medium' | 'hard';
    const totalExamples = positiveExamples + negativeExamples;
    
    if (totalExamples < 4) {
      recommendedDifficulty = 'easy';
    } else if (totalExamples < 7) {
      recommendedDifficulty = 'medium';
    } else {
      recommendedDifficulty = 'hard';
    }

    return {
      positiveExamples,
      negativeExamples,
      averageBoxSize,
      recommendedDifficulty
    };
  }
}

export const testImageService = new TestImageService();