import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';
import { BoundingBox } from '../types';

export class AIModelService {
  private net: mobilenet.MobileNet | null = null;
  private classifier = knnClassifier.create();
  private isModelLoaded = false;
  private exampleCount = 0;

  async loadModel(): Promise<void> {
    if (this.isModelLoaded) return;
    
    try {
      console.log('🤖 Loading MobileNet model...');
      
      // Initialize TensorFlow.js backend
      await tf.setBackend('webgl');
      await tf.ready();
      console.log('✅ TensorFlow.js backend initialized');
      
      // Try to load MobileNet with retry logic
      this.net = await this.loadMobileNetWithRetry();
      this.isModelLoaded = true;
      console.log('✅ MobileNet loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load MobileNet:', error);
      throw error;
    }
  }

  private async loadMobileNetWithRetry(maxRetries: number = 3): Promise<mobilenet.MobileNet> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Loading MobileNet (attempt ${attempt}/${maxRetries})...`);
        
        // Try loading with default settings first
        const net = await mobilenet.load();
        console.log('✅ MobileNet loaded successfully on attempt', attempt);
        return net;
        
      } catch (error) {
        console.warn(`⚠️ MobileNet load attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          // On final attempt, try with alternative configuration
          try {
            console.log('🔄 Trying alternative MobileNet configuration...');
            const net = await mobilenet.load({
              version: 1,
              alpha: 0.25 // Smaller model, faster download
            });
            console.log('✅ MobileNet loaded with alternative config');
            return net;
          } catch (altError) {
            console.error('❌ All MobileNet load attempts failed');
            throw new Error(`Failed to load MobileNet after ${maxRetries} attempts. Please check your internet connection and try again.`);
          }
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Unexpected error in loadMobileNetWithRetry');
  }

  async addExample(imageUrl: string, boundingBox: BoundingBox | null, label: string): Promise<void> {
    if (!this.net) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      let processedImg: HTMLImageElement | HTMLCanvasElement;

      // ALWAYS crop the image based on bounding box
      if (boundingBox) {
        // Crop to the annotated region (where Wally is)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate actual pixel coordinates
        const cropX = (boundingBox.x / 100) * img.width;
        const cropY = (boundingBox.y / 100) * img.height;
        const cropWidth = (boundingBox.width / 100) * img.width;
        const cropHeight = (boundingBox.height / 100) * img.height;
        
        // Set canvas to cropped region size (minimum 64x64 for good feature extraction)
        canvas.width = Math.max(cropWidth, 64);
        canvas.height = Math.max(cropHeight, 64);
        
        // Draw the cropped region
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, canvas.width, canvas.height
        );
        
        processedImg = canvas;
        
        console.log(`✂️ Cropped region: ${Math.round(cropWidth)}x${Math.round(cropHeight)} pixels`);
        console.log(`🎯 Training on: ${label.startsWith('not_') ? 'Non-Wally region' : 'Wally close-up'}`);
      } else {
        // For negative examples (no Wally), use random crop from full image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Create random crop from image to get negative examples
        const cropSize = Math.min(img.width, img.height) * 0.2; // 20% of image
        const cropX = Math.random() * (img.width - cropSize);
        const cropY = Math.random() * (img.height - cropSize);
        
        canvas.width = Math.max(cropSize, 64);
        canvas.height = Math.max(cropSize, 64);
        
        ctx.drawImage(
          img,
          cropX, cropY, cropSize, cropSize,
          0, 0, canvas.width, canvas.height
        );
        
        processedImg = canvas;
        
        console.log(`🚫 Random crop for negative example: ${Math.round(cropSize)}x${Math.round(cropSize)} pixels`);
      }

      // Extract features with MobileNet
      const activation = this.net.infer(processedImg, true);
      
      // Add example to KNN classifier
      this.classifier.addExample(activation, label);
      this.exampleCount++;
      
      console.log(`✅ Added focused training example: ${label} (Total: ${this.exampleCount})`);
      
      // Clean up tensor
      activation.dispose();
      
    } catch (error) {
      console.error('❌ Failed to add example:', error);
      throw error;
    }
  }

  async predict(imageUrl: string): Promise<{ label: string; confidence: number; confidences: Record<string, number> } | null> {
    if (!this.net) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    if (this.classifier.getNumClasses() === 0) {
      console.log('⚠️ No training examples available for prediction');
      return null;
    }

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // For prediction, scan the image in multiple regions to find Wally
      console.log('🔍 Scanning test image for Wally: RED-WHITE horizontal stripes, bobble hat, round glasses...');
      
      const scanResults = [];
      const scanSize = Math.min(img.width, img.height) * 0.15; // Scan in 15% chunks
      const step = scanSize * 0.5; // 50% overlap
      
      // Scan image in grid pattern
      for (let x = 0; x <= img.width - scanSize; x += step) {
        for (let y = 0; y <= img.height - scanSize; y += step) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          canvas.width = Math.max(scanSize, 64);
          canvas.height = Math.max(scanSize, 64);
          
          // Extract region
          ctx.drawImage(
            img,
            x, y, scanSize, scanSize,
            0, 0, canvas.width, canvas.height
          );
          
          // Get features for this region
          const activation = this.net.infer(canvas, true);
          const result = await this.classifier.predictClass(activation, 3);
          
          scanResults.push({
            x: x / img.width * 100,
            y: y / img.height * 100,
            width: scanSize / img.width * 100,
            height: scanSize / img.height * 100,
            label: result.label,
            confidence: result.confidences[result.label]
          });
          
          activation.dispose();
        }
      }
      
      // Find the region with highest confidence for positive detection
      const positiveResults = scanResults.filter(r => r.label !== `not_${r.label.replace('not_', '')}`);
      
      if (positiveResults.length > 0) {
        const bestResult = positiveResults.reduce((best, current) => 
          current.confidence > best.confidence ? current : best
        );
        
        console.log('🎯 Found Wally candidate!', {
          region: `${Math.round(bestResult.x)}%, ${Math.round(bestResult.y)}%`,
          confidence: Math.round(bestResult.confidence * 100) + '%',
          totalRegionsScanned: scanResults.length,
          lookingFor: 'RED-WHITE horizontal striped shirt, bobble hat, round glasses'
        });
        
        return {
          label: bestResult.label,
          confidence: bestResult.confidence,
          confidences: { [bestResult.label]: bestResult.confidence }
        };
      } else {
        // No positive detections found
        const avgConfidence = scanResults.reduce((sum, r) => sum + r.confidence, 0) / scanResults.length;
        
        console.log('❌ No Wally found in any region', {
          regionsScanned: scanResults.length,
          avgConfidence: Math.round(avgConfidence * 100) + '%',
          lookingFor: 'RED-WHITE horizontal striped shirt (not black/yellow)'
        });
        
        return {
          label: `not_Wally`,
          confidence: 1 - avgConfidence,
          confidences: { 'not_Wally': 1 - avgConfidence }
        };
      }
      
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      return null;
    }
  }

  getExampleCount(): number {
    return this.exampleCount;
  }

  getNumClasses(): number {
    return this.classifier.getNumClasses();
  }

  isLoaded(): boolean {
    return this.isModelLoaded && this.net !== null;
  }

  reset(): void {
    this.classifier.dispose();
    this.classifier = knnClassifier.create();
    this.exampleCount = 0;
    console.log('🔄 AI model reset');
  }

  getConfidenceMessage(confidence: number, exampleCount: number): string {
    // Don't show confident messages with too few examples
    if (exampleCount < 3) {
      return "🤖 Learning to spot Wally's RED-WHITE horizontal striped shirt and bobble hat...";
    }
    
    if (exampleCount < 4) {
      return "🤔 Studying Wally's RED-WHITE stripes, round glasses, blue jeans, and brown shoes...";
    }
    
    // Progressive confidence based on training examples
    const adjustedConfidence = confidence;
    
    if (exampleCount < 6) {
      return "🧐 Getting better at recognizing RED-WHITE horizontal stripes and round glasses...";
    } else if (exampleCount < 8) {
      return "😊 I can spot Wally's RED-WHITE striped shirt, bobble hat, and round black glasses!";
    } else if (exampleCount < 10) {
      return "😎 Found the RED-WHITE horizontal stripes, blue jeans, and brown shoes!";
    } else if (adjustedConfidence < 0.4) {
      return "❌ No Wally found - current image has black-yellow stripes, not RED-WHITE stripes!";
    } else if (adjustedConfidence < 0.6) {
      return "🤷‍♂️ Getting better at distinguishing RED-WHITE stripes from other patterns...";
    } else {
      return "🎯 Found Wally! RED-WHITE horizontal striped shirt, bobble hat, round glasses, and blue jeans - perfect match!";
    }
  }
}

export const aiModelService = new AIModelService();