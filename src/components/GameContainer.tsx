import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const getRelativeCoordinates = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (gameState.isTraining || isRecordingAnnotation) return;
    
    e.preventDefault();
    
    const point = getRelativeCoordinates(e);
    setStartPoint(point);
    setIsDrawing(true);
    setCurrentBox({
      x: point.x,
      y: point.y,
      width: 0,
      height: 0
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || gameState.isTraining || isRecordingAnnotation) return;
    
    e.preventDefault();
    
    const currentPoint = getRelativeCoordinates(e);
    
    // Normalize bounding box to handle all drag directions
    const left = Math.max(0, Math.min(startPoint.x, currentPoint.x));
    const top = Math.max(0, Math.min(startPoint.y, currentPoint.y));
    const right = Math.min(100, Math.max(startPoint.x, currentPoint.x));
    const bottom = Math.min(100, Math.max(startPoint.y, currentPoint.y));
    
    const box: BoundingBox = {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
    
    setCurrentBox(box);
  };

  const handleMouseUp = () => {
    if (!isDrawing || gameState.isTraining || isRecordingAnnotation) return;
    
    setIsDrawing(false);
    if (currentBox && currentBox.width > 2 && currentBox.height > 2) {
      handleAnnotate(gameState.images[currentImageIndex]?.id, currentBox);
    } else {
      setCurrentBox(null);
    }
  };

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
      console.log('🔍 Checking Supabase connection...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      await trainingService.createSession(category, gameState.currentLevel);
      console.log('✅ Supabase training session created successfully');
      setIsUsingRealTraining(true);
    } catch (error) {
      console.error('❌ Failed to create training session:', error);
      console.log('🔄 Falling back to simulation mode');
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
      
      // Auto-generate test predictions when first annotation is made
      if (annotatedCount === 1 && !prev.hasTrainedModel) {
        // Simulate initial model predictions for test images
        const updatedTestImages = simulateModelPrediction(testImages.slice(0, 1), progressiveAccuracy);
        setTestImages(updatedTestImages);
        
        return {
          ...prev,
          images: updatedImages,
          annotatedCount,
          modelAccuracy: progressiveAccuracy,
          hasTrainedModel: true // Enable test predictions
        };
      }
      
      // Update test predictions as more annotations are added
      if (annotatedCount > 0) {
        const updatedTestImages = simulateModelPrediction(testImages.slice(0, 1), progressiveAccuracy);
        setTestImages(updatedTestImages);
      }
      
      return {
        ...prev,
        images: updatedImages,
        annotatedCount,
        modelAccuracy: progressiveAccuracy,
        hasTrainedModel: annotatedCount > 0 // Enable test predictions once annotation starts
      };
    });
    
    // Auto-advance to next image after annotation
    setTimeout(() => {
      if (currentImageIndex < gameState.images.length - 1) {
        handleNextImage();
      }
    }, 800);
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
      setCurrentBox(null); // Clear any temporary bounding box
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setCurrentBox(null); // Clear any temporary bounding box
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
                  {(gameState.images[currentImageIndex]?.userAnnotation || currentBox) && (
                    <div
                      className={`absolute shadow-lg pointer-events-none ${
                        gameState.images[currentImageIndex]?.userAnnotation 
                          ? 'border-4 border-red-500 bg-red-500 bg-opacity-30' 
                          : 'border-3 border-dashed border-red-400 bg-red-400 bg-opacity-20'
                      }`}
                      style={{
                        left: `${(gameState.images[currentImageIndex]?.userAnnotation || currentBox)?.x}%`,
                        top: `${(gameState.images[currentImageIndex]?.userAnnotation || currentBox)?.y}%`,
                        width: `${(gameState.images[currentImageIndex]?.userAnnotation || currentBox)?.width}%`,
                        height: `${(gameState.images[currentImageIndex]?.userAnnotation || currentBox)?.height}%`
                      }}
                    >
                      {gameState.images[currentImageIndex]?.userAnnotation && (
                        <div className="absolute -top-7 left-0 bg-red-600 text-white text-sm px-3 py-1 rounded font-bold shadow-md">
                          {gameState.currentCategory}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Mouse interaction overlay */}
                  <div 
                    ref={imageRef}
                    className="absolute inset-0 cursor-crosshair z-10"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setIsDrawing(false)}
                  >
                    {/* Drawing box preview - RED DASHED BOX */}
                    {isDrawing && currentBox && (
                      <div
                        className="absolute border-4 border-dashed border-red-600 bg-red-600 bg-opacity-20 pointer-events-none"
                        style={{
                          left: `${currentBox.x}%`,
                          top: `${currentBox.y}%`,
                          width: `${currentBox.width}%`,
                          height: `${currentBox.height}%`
                        }}
                      />
                    )}
                    
                    {/* Instruction overlay when no annotation exists */}
                    {!gameState.images[currentImageIndex]?.userAnnotation && !currentBox && (
                      <div className="absolute top-3 left-3 bg-black bg-opacity-80 text-white text-sm px-3 py-2 rounded-lg font-bold">
                        Click & drag to mark {gameState.currentCategory}
                      </div>
                    )}
                  </div>
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
              {/* Left Flow Direction Arrow */}
              <div className="absolute -left-10 top-1/2 transform -translate-y-1/2">
                <div className="text-4xl text-blue-600 animate-pulse">→</div>
              </div>
              
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
          </div>
          
          {/* Right Side - Test Image */}
          <div className="flex-1 max-w-md">
            {testImages[0] && (
              <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Test Image 📸
                  </h3>
                  <div className="relative w-full">
                    <img
                      src={testImages[0].url}
                      alt="Test image"
                      className="w-full h-64 object-cover rounded-xl border-4 border-gray-200 pointer-events-none"
                    />
                    
                    {/* Existing Bounding Box Display */}
                    {gameState.hasTrainedModel && testImages[0].modelPrediction === true && (
                      <div
                        className="absolute border-4 border-green-500 bg-green-500 bg-opacity-30 shadow-lg pointer-events-none z-40"
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
                          {testImages[0].modelPrediction ? `✓ ${gameState.currentCategory} found!` : `✗ No ${gameState.currentCategory}`}
                        </div>
                      </div>
                    )}

                    {/* Placeholder when no model */}
                    {!gameState.hasTrainedModel && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                        <div className="text-white text-center">
                          <p className="text-lg font-medium">Train AI to see predictions</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Dynamic Confidence Progress Bar */}
                <div className="space-y-4">
                  {/* Confidence Meter Labels */}
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-red-600">Not confident</span>
                    <span className="text-green-600">Very confident</span>
                  </div>
                  
                  {/* Confidence Meter with Moving Ball */}
                  <div className="relative">
                    {/* Background Track */}
                    <div className="bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full h-6 shadow-inner border-2 border-gray-300">
                    </div>
                    
                    {/* Moving Red Ball */}
                    <div 
                      className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                      style={{ 
                        left: `${Math.min(20 + (gameState.annotatedCount * 6), 85)}%`
                      }}
                    >
                      <div className="w-6 h-6 bg-red-500 rounded-full shadow-lg border-2 border-white animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Dynamic Confidence Messages */}
                  <div className="text-center min-h-[3rem] flex items-center justify-center">
                    <p className="text-sm font-medium text-gray-700 italic animate-pulse">
                      {gameState.annotatedCount === 0 && "🤔 I have no idea what this is..."}
                      {gameState.annotatedCount > 0 && gameState.annotatedCount < 3 && "🤷‍♂️ Hmm... maybe it's a cat? Not sure..."}
                      {gameState.annotatedCount >= 3 && gameState.annotatedCount < 6 && "🧐 Getting some clues... building confidence!"}
                      {gameState.annotatedCount >= 6 && gameState.annotatedCount < 10 && "😊 I'm starting to understand cats better!"}
                      {gameState.annotatedCount >= 10 && gameState.annotatedCount < 15 && "😎 Pretty confident about cats now!"}
                      {gameState.annotatedCount >= 15 && "🎯 Very confident! I know cats when I see them!"}
                    </p>
                  </div>
                  
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Bar - Tips */}
      </div>
    </div>
  );
};