import React, { useState, useEffect } from 'react';
import { AnnotationPanel } from './AnnotationPanel';
import { ModelPanel } from './ModelPanel';
import { GameState, GameImage, BoundingBox } from '../types';
import { categories } from '../utils/gameData';
import { generateRandomImages, calculateAccuracy, simulateModelPrediction, generateTestImages } from '../utils/gameLogic';
import { ModelTrainingService } from '../services/modelTrainingService';

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
  const [currentTrainingJobId, setCurrentTrainingJobId] = useState<string | null>(null);

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
      
      // Save annotation to database
      const image = updatedImages.find(img => img.id === imageId);
      if (image) {
        ModelTrainingService.saveAnnotation({
          image_url: image.url,
          category: prev.currentCategory,
          has_object: annotation !== null,
          bounding_box: annotation || undefined
        }).catch(console.error);
      }
      
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
    
    try {
      // Get annotations for current category
      const annotations = await ModelTrainingService.getAnnotations(gameState.currentCategory);
      
      // Start real model training
      const jobId = await ModelTrainingService.startTraining(gameState.currentCategory, annotations);
      setCurrentTrainingJobId(jobId);
      
      // Poll for training completion
      const pollInterval = setInterval(async () => {
        const job = await ModelTrainingService.getTrainingStatus(jobId);
        
        if (job && job.status === 'completed') {
          clearInterval(pollInterval);
          
          // Get predictions for test images
          const predictions = await ModelTrainingService.getPredictions(
            gameState.currentCategory,
            testImages.map(img => img.url)
          );
          
          const updatedTestImages = testImages.map((img, index) => ({
            ...img,
            modelPrediction: predictions[index]?.prediction,
            confidence: predictions[index]?.confidence
          }));
          
          setGameState(prev => ({
            ...prev,
            modelAccuracy: job.accuracy || 30,
            isTraining: false,
            hasTrainedModel: true,
            modelState: job.model_state || 'underfitting',
            score: prev.score + Math.round((job.accuracy || 30) * 0.5)
          }));
          
          setTestImages(updatedTestImages);
        } else if (job && job.status === 'failed') {
          clearInterval(pollInterval);
          // Fallback to simulation
          const result = await ModelTrainingService.simulateTraining(gameState.images);
          const updatedTestImages = simulateModelPrediction(testImages.slice(0, 1), result.accuracy);
          
          setGameState(prev => ({
            ...prev,
            modelAccuracy: result.accuracy,
            isTraining: false,
            hasTrainedModel: true,
            modelState: result.modelState,
            score: prev.score + Math.round(result.accuracy * 0.5)
          }));
          
          setTestImages(updatedTestImages);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Training failed, falling back to simulation:', error);
      
      // Fallback to simulation if backend is not available
      const result = await ModelTrainingService.simulateTraining(gameState.images);
      const updatedTestImages = simulateModelPrediction(testImages.slice(0, 1), result.accuracy);
      
      setGameState(prev => ({
        ...prev,
        modelAccuracy: result.accuracy,
        isTraining: false,
        hasTrainedModel: true,
        modelState: result.modelState,
        score: prev.score + Math.round(result.accuracy * 0.5)
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