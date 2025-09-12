import React, { useState, useEffect } from 'react';
import { AnnotationPanel } from './AnnotationPanel';
import { ModelPanel } from './ModelPanel';
import { NextLevelButton } from './NextLevelButton';
import { GameState, GameImage, BoundingBox } from '../types';
import { categories } from '../utils/gameData';
import { generateRandomImages, calculateAccuracy, simulateModelPrediction, generateTestImages } from '../utils/gameLogic';
import { trainingService } from '../services/trainingService';

export const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    currentCategory: categories[0].targetObject,
    images: [],
    modelAccuracy: 30,
    annotatedCount: 0,
    isTraining: false,
    hasTrainedModel: false,
    score: 0,
    modelState: 'underfitting'
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [testImages, setTestImages] = useState<GameImage[]>([]);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isUsingRealTraining, setIsUsingRealTraining] = useState(false);

  // Initialize game images
  useEffect(() => {
    const categoryIndex = (gameState.currentLevel - 1) % categories.length;
    const category = categories[categoryIndex];
    const newImages = generateRandomImages(category.images);
    const newTestImages = generateTestImages(category.testImages);
    
    setGameState(prev => ({
      ...prev,
      images: newImages,
      currentCategory: category.targetObject,
      hasTrainedModel: false,
      modelAccuracy: 30,
      annotatedCount: 0,
      modelState: 'underfitting'
    }));
    setTestImages(newTestImages);
    setCurrentImageIndex(0);
    
    // Create new training session
    initializeTrainingSession(category.targetObject);
  }, [gameState.currentLevel]);

  const initializeTrainingSession = async (category: string) => {
    try {
      await trainingService.createSession(category, gameState.currentLevel);
      setIsUsingRealTraining(true);
    } catch (error) {
      console.warn('Failed to create training session, using simulation mode:', error);
      setIsUsingRealTraining(false);
    }
  };

  const handleAnnotate = (imageId: string, annotation: BoundingBox | null) => {
    setGameState(prev => {
      const updatedImages = prev.images.map(img =>
        img.id === imageId ? { ...img, userAnnotation: annotation } : img
      );
      
      const annotatedCount = updatedImages.filter(img => img.userAnnotation !== undefined).length;
      
      return {
        ...prev,
        images: updatedImages,
        annotatedCount
      };
    });
  };

  const determineModelState = (annotatedCount: number, accuracy: number) => {
    if (annotatedCount < 5) return 'underfitting';
    if (annotatedCount > 15 && accuracy < 70) return 'overfitting';
    if (accuracy >= 70 && accuracy <= 90) return 'correct';
    if (accuracy < 60) return 'underfitting';
    return 'overfitting';
  };

  const handleTrainModel = async () => {
    setGameState(prev => ({ ...prev, isTraining: true }));
    
    // 模拟训练过程中的动态更新
    const trainingSteps = 5;
    for (let i = 0; i < trainingSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const progress = ((i + 1) / trainingSteps) * 100;
      // 这里可以添加训练进度的视觉反馈
    }
    
    try {
      if (isUsingRealTraining) {
        // Use real training service
        const result = await trainingService.trainModel(gameState.images);
        setCurrentJobId(result.jobId);
        
        // Get predictions for test images
        const updatedTestImages = await trainingService.getPredictions(
          result.jobId, 
          testImages.slice(0, 1)
        );
        
        setGameState(prev => ({
          ...prev,
          modelAccuracy: result.accuracy,
          isTraining: false,
          hasTrainedModel: true,
          modelState: result.modelState,
          score: prev.score + Math.round(result.accuracy * 0.5)
        }));
        
        setTestImages(updatedTestImages);
      } else {
        // Fallback to simulation mode
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const calculatedAccuracy = calculateAccuracy(gameState.images);
        const calculatedModelState = determineModelState(gameState.annotatedCount, calculatedAccuracy);
        const updatedTestImages = simulateModelPrediction(testImages.slice(0, 1), calculatedAccuracy);
        
        setGameState(prev => ({
          ...prev,
          modelAccuracy: calculatedAccuracy,
          isTraining: false,
          hasTrainedModel: true,
          modelState: calculatedModelState,
          score: prev.score + Math.round(calculatedAccuracy * 0.5)
        }));
        
        setTestImages(updatedTestImages);
      }
    } catch (error) {
      console.error('Training failed:', error);
      
      // Fallback to simulation if real training fails
      const calculatedAccuracy = calculateAccuracy(gameState.images);
      const calculatedModelState = determineModelState(gameState.annotatedCount, calculatedAccuracy);
      const updatedTestImages = simulateModelPrediction(testImages.slice(0, 1), calculatedAccuracy);
      
      setGameState(prev => ({
        ...prev,
        modelAccuracy: calculatedAccuracy,
        isTraining: false,
        hasTrainedModel: true,
        modelState: calculatedModelState,
        score: prev.score + Math.round(calculatedAccuracy * 0.5)
      }));
      
      setTestImages(updatedTestImages);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < gameState.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };
  const handleNextLevel = () => {
    setGameState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1,
      hasTrainedModel: false,
      modelAccuracy: 30,
      annotatedCount: 0,
      modelState: 'underfitting',
      isTraining: false
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Task Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 border-2 border-blue-500 rounded-lg px-8 py-4 inline-block bg-white">
            Task: {gameState.currentCategory}
            {isUsingRealTraining && (
              <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                🤖 Real AI Training
              </span>
            )}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnnotationPanel
            images={gameState.images}
            onAnnotate={handleAnnotate}
            currentCategory={gameState.currentCategory}
            annotatedCount={gameState.annotatedCount}
            disabled={gameState.isTraining}
            currentImageIndex={currentImageIndex}
            onNextImage={handleNextImage}
            onPrevImage={handlePrevImage}
          />
          
          <ModelPanel
            images={testImages}
            modelAccuracy={gameState.modelAccuracy}
            isTraining={gameState.isTraining}
            hasTrainedModel={gameState.hasTrainedModel}
            onTrainModel={handleTrainModel}
            canTrain={gameState.annotatedCount > 0}
            modelState={gameState.modelState}
            currentCategory={gameState.currentCategory}
            annotatedCount={gameState.annotatedCount}
          />
        </div>
        
        {/* 下一关按钮 */}
        <div className="mt-8">
          <NextLevelButton
            modelAccuracy={gameState.modelAccuracy}
            modelState={gameState.modelState}
            hasTrainedModel={gameState.hasTrainedModel}
            onNextLevel={handleNextLevel}
            currentLevel={gameState.currentLevel}
          />
        </div>
      </div>
    </div>
  );
};