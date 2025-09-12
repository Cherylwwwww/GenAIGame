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
        {/* Main Game Layout */}
        <div className="flex items-center justify-center min-h-[600px] gap-8">
          {/* Left Side - Annotation Image */}
          <div className="flex-1 max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
              {/* Annotation Image */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Annotation Image 🖼️
                </h3>
                <div className="relative">
                  <img
                    src={gameState.images[currentImageIndex]?.url}
                    alt="Annotation target"
                    className="w-full h-64 object-cover rounded-xl border-4 border-gray-200"
                  />
                  
                  {/* Bounding Box Display */}
                  {gameState.images[currentImageIndex]?.userAnnotation && (
                    <div
                      className="absolute border-3 border-red-400 bg-red-400 bg-opacity-25 shadow-lg"
                      style={{
                        left: `${gameState.images[currentImageIndex].userAnnotation.x}%`,
                        top: `${gameState.images[currentImageIndex].userAnnotation.y}%`,
                        width: `${gameState.images[currentImageIndex].userAnnotation.width}%`,
                        height: `${gameState.images[currentImageIndex].userAnnotation.height}%`
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        {gameState.currentCategory}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Annotation Tools */}
              <div className="space-y-4">
                <button
                  onClick={() => handleAnnotate(gameState.images[currentImageIndex]?.id, null)}
                  disabled={gameState.isTraining || isRecordingAnnotation}
                  className={`w-full px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
                    gameState.isTraining || isRecordingAnnotation
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isRecordingAnnotation ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🚫</span>
                        <span>No {gameState.currentCategory}</span>
                      </>
                    )}
                  </div>
                </button>
                
                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentImageIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {currentImageIndex + 1} / {gameState.images.length}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNextImage}
                    disabled={currentImageIndex === gameState.images.length - 1}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentImageIndex === gameState.images.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Center - Animated Conveyor Belt */}
          <div className="flex flex-col items-center justify-center px-8">
            {/* Flowing Data Animation */}
            <div className="relative w-32 h-16 mb-6">
              {/* Conveyor Belt Track */}
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full shadow-inner">
                {/* Moving Belt Segments */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                  <div className="flex space-x-2 animate-pulse">
                    <div className="w-2 h-8 bg-blue-400 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-8 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-8 bg-blue-400 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    <div className="w-2 h-8 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </div>
              </div>
              
              {/* Flow Direction Arrow */}
              <div className="absolute -right-10 top-1/2 transform -translate-y-1/2">
                <div className="text-4xl text-blue-600 animate-pulse">→</div>
              </div>
            </div>
            
            {/* Train AI Button */}
            <button
              onClick={handleTrainModel}
              disabled={gameState.isTraining || gameState.annotatedCount === 0}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                gameState.isTraining || gameState.annotatedCount === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                {gameState.isTraining ? (
                  <>
                    <div className="animate-spin">🔄</div>
                    <span>Training...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>Train AI</span>
                    <span>⚡</span>
                  </>
                )}
              </div>
            </button>
            
            {gameState.annotatedCount === 0 && (
              <p className="mt-3 text-center text-gray-500 text-sm">
                📝 Annotate images first
              </p>
            )}
          </div>
          
          {/* Right Side - Test Image */}
          <div className="flex-1 max-w-md">
            {testImages[0] && (
              <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Test Image 📸
                  </h3>
                  <div className="relative">
                    <img
                      src={testImages[0].url}
                      alt="Test image"
                      className="w-full h-64 object-cover rounded-xl border-4 border-gray-200"
                    />
                    
                    {/* Model Prediction Overlay */}
                    {gameState.hasTrainedModel && testImages[0].modelPrediction === true && (
                      <div
                        className="absolute border-4 border-green-400 bg-green-400 bg-opacity-20 animate-pulse rounded-lg"
                        style={{
                          left: '20%',
                          top: '15%', 
                          width: '60%',
                          height: '70%'
                        }}
                      />
                    )}
                    
                    {/* Prediction Result */}
                    {gameState.hasTrainedModel && testImages[0].modelPrediction !== undefined && (
                      <div className="absolute top-4 right-4">
                        <div className={`px-4 py-2 rounded-xl font-bold text-lg shadow-lg ${
                          testImages[0].modelPrediction ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {testImages[0].modelPrediction ? `✓ Found ${gameState.currentCategory}!` : `✗ No ${gameState.currentCategory}`}
                          {testImages[0].confidence && (
                            <div className="text-sm opacity-90 mt-1">
                              {Math.round(testImages[0].confidence * 100)}% confident
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Placeholder when no model */}
                    {!gameState.hasTrainedModel && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="w-12 h-12 mx-auto mb-2 opacity-70">🎯</div>
                          <p className="text-lg font-medium">Train AI to see predictions</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* AI Performance Display */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {gameState.hasTrainedModel ? gameState.modelAccuracy : Math.min(30 + gameState.annotatedCount * 3, 50)}%
                    </div>
                    <div className="text-gray-600 text-sm">AI Accuracy</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r ${
                        gameState.modelState === 'underfitting' ? 'from-yellow-400 to-orange-400' :
                        gameState.modelState === 'correct' ? 'from-green-400 to-blue-400' :
                        'from-red-400 to-pink-400'
                      } h-3 rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${Math.min(gameState.hasTrainedModel ? gameState.modelAccuracy : Math.min(30 + gameState.annotatedCount * 3, 50), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
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