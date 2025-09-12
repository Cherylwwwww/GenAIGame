import React, { useState, useEffect } from 'react';
import { AnnotationPanel } from './AnnotationPanel';
import { ModelPanel } from './ModelPanel';
import { Header } from './Header';
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
  const [playerName] = useState('Player');
  const [isRecordingAnnotation, setIsRecordingAnnotation] = useState(false);

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
    setIsRecordingAnnotation(true);
    
    // Record annotation to Supabase
    recordAnnotation(imageId, annotation).finally(() => {
      setIsRecordingAnnotation(false);
    });
    
    setGameState(prev => {
      const updatedImages = prev.images.map(img =>
        img.id === imageId ? { ...img, userAnnotation: annotation } : img
      );
      
      const annotatedCount = updatedImages.filter(img => img.userAnnotation !== undefined).length;
      
      // Calculate progressive accuracy based on annotation count
      const progressiveAccuracy = calculateProgressiveAccuracy(annotatedCount, updatedImages);
      
      return {
        ...prev,
        images: updatedImages,
        annotatedCount,
        modelAccuracy: progressiveAccuracy
      };
    });
  };

  const recordAnnotation = async (imageId: string, annotation: BoundingBox | null) => {
    if (!isUsingRealTraining) return;
    
    try {
      const currentImage = gameState.images.find(img => img.id === imageId);
      if (!currentImage) return;
      
      await trainingService.recordAnnotation({
        imageId,
        imageUrl: currentImage.url,
        hasObject: annotation !== null,
        boundingBox: annotation,
        actualLabel: currentImage.actualLabel
      });
      
      console.log('Annotation recorded successfully');
    } catch (error) {
      console.warn('Failed to record annotation:', error);
    }
  };

  const calculateProgressiveAccuracy = (annotatedCount: number, images: GameImage[]): number => {
    if (annotatedCount === 0) return 30; // Base accuracy
    
    // Calculate quality of annotations
    const annotatedImages = images.filter(img => img.userAnnotation !== undefined);
    const correctAnnotations = annotatedImages.filter(
      img => (img.userAnnotation !== null) === img.actualLabel
    ).length;
    
    const qualityScore = annotatedImages.length > 0 ? (correctAnnotations / annotatedImages.length) : 0;
    
    // Progressive improvement formula
    const baseAccuracy = 30;
    const quantityBonus = Math.min(annotatedCount * 3, 50); // Up to 50% bonus for quantity
    const qualityMultiplier = 0.3 + (qualityScore * 0.7); // Quality affects 70% of the bonus
    
    const finalAccuracy = Math.min(baseAccuracy + (quantityBonus * qualityMultiplier), 95);
    
    return Math.round(finalAccuracy);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Bar */}
      <Header
        currentLevel={gameState.currentLevel}
        currentCategory={gameState.currentCategory}
        score={gameState.score}
        modelAccuracy={gameState.modelAccuracy}
        playerName={playerName}
        isUsingRealTraining={isUsingRealTraining}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Task Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-800 mb-2">
            Find {gameState.currentCategory} 🎯
          </h1>
          <p className="text-xl text-gray-600">Annotate images to train your AI model</p>
        </div>
        
        {/* Main Area - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Panel - Annotation Zone */}
          <AnnotationPanel
            images={gameState.images}
            onAnnotate={handleAnnotate}
            currentCategory={gameState.currentCategory}
            annotatedCount={gameState.annotatedCount}
            disabled={gameState.isTraining}
            currentImageIndex={currentImageIndex}
            onNextImage={handleNextImage}
            onPrevImage={handlePrevImage}
            onNextLevel={handleNextLevel}
            modelAccuracy={gameState.modelAccuracy}
            hasTrainedModel={gameState.hasTrainedModel}
            modelState={gameState.modelState}
          />
          
          {/* Center - AI Training Section */}
          <div className="lg:col-span-2 flex justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  AI Model Training 🤖
                </h2>
                <p className="text-gray-600">Train your AI to recognize {gameState.currentCategory}</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleTrainModel}
                  disabled={gameState.isTraining || gameState.annotatedCount === 0}
                  className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    gameState.isTraining || gameState.annotatedCount === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3">
                    {gameState.isTraining ? (
                      <>
                        <div className="animate-spin">🔄</div>
                        <span>Training AI...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="w-6 h-6" />
                        <span>Train AI Model</span>
                        <Zap className="w-6 h-6" />
                      </>
                    )}
                  </div>
                </button>
                
                {gameState.annotatedCount === 0 && (
                  <p className="mt-3 text-gray-500 text-sm">
                    📝 Annotate at least 1 image to start training
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Model Feedback Zone */}
          <div className="lg:col-span-2">
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
        </div>
        
        {/* Bottom Bar - Tips */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 inline-block shadow-lg">
            <p className="text-gray-700 text-lg">
              💡 <strong>Tip:</strong> Better annotations = better AI performance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};