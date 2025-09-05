import React, { useState, useEffect } from 'react';
import { AnnotationPanel } from './AnnotationPanel';
import { ModelPanel } from './ModelPanel';
import { GameState, GameImage, BoundingBox } from '../types';
import { categories } from '../utils/gameData';
import { generateRandomImages, calculateAccuracy, simulateModelPrediction, generateTestImages } from '../utils/gameLogic';

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
  }, [gameState.currentLevel]);

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
    
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setGameState(prev => {
      const newAccuracy = calculateAccuracy(prev.images);
      const newModelState = determineModelState(prev.annotatedCount, newAccuracy);
      const testImagesWithPredictions = simulateModelPrediction(testImages.slice(0, 1), newAccuracy);
      
      return {
        ...prev,
        modelAccuracy: newAccuracy,
        isTraining: false,
        hasTrainedModel: true,
        modelState: newModelState,
        score: prev.score + Math.round(newAccuracy * 0.5)
      };
    });
    
    setTestImages(testImagesWithPredictions);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Main Task Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 border-2 border-blue-500 rounded-lg px-8 py-4 inline-block bg-white">
            Task: {gameState.currentCategory}
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
            canTrain={true}
            modelState={gameState.modelState}
            currentCategory={gameState.currentCategory}
          />
        </div>
      </div>
    </div>
  );
};