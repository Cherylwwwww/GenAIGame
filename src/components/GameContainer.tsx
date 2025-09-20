import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnnotationPanel } from './AnnotationPanel';
import { ModelPanel } from './ModelPanel';
import { Header } from './Header';
import { GameState, GameImage, BoundingBox } from '../types';
import { categories } from '../utils/gameData';
import { generateRandomImages, calculateAccuracy, simulateModelPrediction, generateTestImages } from '../utils/gameLogic';
import { trainingService } from '../services/trainingService';
import { aiModelService } from '../services/aiModelService';
import { supabase } from '../lib/supabase';

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
  const [isModelLoading, setIsModelLoading] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [aiModeStatus, setAiModeStatus] = useState<'loading' | 'real' | 'simulation'>('loading');

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
    initializeAIModel();
    const categoryIndex = (gameState.currentLevel - 1) % categories.length;
    const category = categories[categoryIndex];
    const newImages = generateRandomImages(category.images); // Use all available images
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

  const initializeAIModel = async () => {
    try {
      setIsModelLoading(true);
      setAiModeStatus('loading');
      // Force simulation mode for better control
      setAiModeStatus('simulation');
      console.log('🔄 USING SIMULATION MODE - Controlled Wally Detection');
      console.log('🎯 Looking for: RED-WHITE horizontal striped shirt, bobble hat, round glasses');
    } catch (error) {
      console.error('❌ Failed to initialize AI model:', error);
      setAiModeStatus('simulation');
      console.log('🔄 FALLING BACK TO SIMULATION MODE');
    } finally {
      setIsModelLoading(false);
    }
  };

  const initializeTrainingSession = async (category: string) => {
    try {
      console.log('🔍 Checking Supabase connection...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('❌ User not authenticated, falling back to simulation mode');
        setIsUsingRealTraining(false);
        return;
      }
      
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
    
    // Add example to AI model
    addExampleToAIModel(imageId, annotation);
    
    // Record annotation to Supabase
    recordAnnotation(imageId, annotation).finally(() => {
      setIsRecordingAnnotation(false);
    });
    
    // Calculate updated images and annotation count outside setGameState
    const updatedImages = gameState.images.map(img =>
      img.id === imageId ? { ...img, userAnnotation: annotation } : img
    );
    
    const newAnnotatedCount = updatedImages.filter(img => img.userAnnotation !== undefined).length;
    
    setGameState(prev => {
      return {
        ...prev,
        images: updatedImages,
        annotatedCount: newAnnotatedCount,
        hasTrainedModel: newAnnotatedCount > 0
      };
    });
    
    // Update test predictions after state is updated
    setTimeout(() => {
      if (newAnnotatedCount >= 3) {
        updateTestPredictions();
      }
    }, 100);
    
    // Auto-advance to next image after annotation
    setTimeout(() => {
      if (currentImageIndex < gameState.images.length - 1) {
        handleNextImage();
      }
    }, 800);
  };

  const addExampleToAIModel = async (imageId: string, annotation: BoundingBox | null) => {
    if (!aiModelService.isLoaded()) {
      console.log('⚠️ AI model not loaded yet, skipping example addition');
      return;
    }

    try {
      const currentImage = gameState.images.find(img => img.id === imageId);
      if (!currentImage) return;

      // Determine label based on annotation
      const label = annotation !== null ? gameState.currentCategory : `not_${gameState.currentCategory}`;
      
      if (annotation !== null) {
        console.log(`🎯 Training AI on cropped Wally region: red-white striped shirt, bobble hat, round glasses`);
        console.log(`📏 Bounding box: ${Math.round(annotation.width)}% × ${Math.round(annotation.height)}% of image`);
      } else {
        console.log(`🚫 Training AI on random crop from non-Wally image`);
      }
      
      await aiModelService.addExample(currentImage.url, annotation, label);
      
    } catch (error) {
      console.error('❌ Failed to add example to AI model:', error);
    }
  };

  const updateTestPredictions = async () => {
    if (testImages.length === 0) return;
    
    // In simulation mode, use annotation count for predictions
    if (aiModeStatus !== 'real') {
      console.log('🔍 Simulation mode: Analyzing test image for Wally features...');
      simulateModelPrediction(testImages, setTestImages, gameState.annotatedCount, gameState.currentCategory);
      return;
    }

    console.log('🔍 updateTestPredictions called');
    console.log('📊 AI model loaded:', aiModelService.isLoaded());
    console.log('📊 Example count:', aiModelService.getExampleCount());
    
    if (!aiModelService.isLoaded()) {
      console.log('⚠️ AI model not loaded yet, skipping test predictions');
      return;
    }
    
    // Check if we have both positive and negative examples
    const annotatedImages = gameState.images.filter(img => img.userAnnotation !== undefined);
    const positiveExamples = annotatedImages.filter(img => img.userAnnotation !== null).length;
    const negativeExamples = annotatedImages.filter(img => img.userAnnotation === null).length;
    
    console.log(`📊 Training examples: ${positiveExamples} positive, ${negativeExamples} negative`);
    
    // Allow predictions with fewer examples for testing
    if (positiveExamples === 0 && negativeExamples === 0) {
      console.log('⚠️ Need at least some training examples');
      return;
    }
    
    try {
      const testImage = testImages[0];
      console.log('🔍 Analyzing test image for Wally (red-white stripes, bobble hat, round glasses, blue jeans, brown shoes)...');
      const prediction = await aiModelService.predict(testImage.url);
      
      if (prediction) {
        const hasObject = prediction.label === gameState.currentCategory;
        const confidence = prediction.confidence;
        
        console.log(`🎯 AI Decision: ${hasObject ? '✅ WALLY SPOTTED!' : '❌ NO WALLY FOUND'} (${Math.round(confidence * 100)}% confidence)`);
        console.log(`🔍 Looking for: RED-WHITE horizontal stripes, bobble hat, round black glasses, blue jeans, brown shoes`);
        console.log(`❌ NOT looking for: Black-yellow stripes or other color combinations`);
        
        setTestImages(prev => prev.map(img => 
          img.id === testImage.id 
            ? { ...img, modelPrediction: hasObject, confidence }
            : img
        ));
      } else {
        console.log('❌ No prediction returned from AI model');
      }
      
    } catch (error) {
      console.error('❌ Failed to update Wally predictions:', error);
    }
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

  const calculateRealModelAccuracy = async (): Promise<{ accuracy: number; modelState: 'underfitting' | 'correct' | 'overfitting' }> => {
    if (!aiModelService.isLoaded()) {
      console.log('⚠️ AI model not loaded yet, using fallback accuracy');
      return { accuracy: 30, modelState: 'underfitting' };
    }

    const exampleCount = aiModelService.getExampleCount();
    
    if (exampleCount === 0) {
      return { accuracy: 30, modelState: 'underfitting' };
    }
    
    // Test the model on a subset of training images to calculate real accuracy
    const annotatedImages = gameState.images.filter(img => img.userAnnotation !== undefined);
    let correctPredictions = 0;
    let totalPredictions = 0;
    
    for (const image of annotatedImages.slice(0, Math.min(5, annotatedImages.length))) {
      try {
        const prediction = await aiModelService.predict(image.url);
        if (prediction) {
          const predictedHasObject = prediction.label === gameState.currentCategory;
          const actualHasObject = image.actualLabel;
          
          if (predictedHasObject === actualHasObject) {
            correctPredictions++;
          }
          totalPredictions++;
        }
      } catch (error) {
        console.warn('Failed to test prediction on training image:', error);
      }
    }
    
    const accuracy = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 30;
    
    // Determine model state based on example count and accuracy
    let modelState: 'underfitting' | 'correct' | 'overfitting';
    if (exampleCount < 3) {
      modelState = 'underfitting';
    } else if (exampleCount > 12) {
      modelState = 'overfitting';
    } else if (accuracy >= 70 && accuracy <= 95) {
      modelState = 'correct';
    } else if (accuracy < 60) {
      modelState = 'underfitting';
    } else {
      modelState = 'overfitting';
    }
    
    return { accuracy, modelState };
  };

  const handleTrainModel = async () => {
    setGameState(prev => ({ ...prev, isTraining: true }));
    
    // Show training progress
    const trainingSteps = 5;
    for (let i = 0; i < trainingSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    try {
      let accuracy, modelState;
      
      if (aiModeStatus === 'real') {
        // Calculate real model accuracy by testing on training data
        const result = await calculateRealModelAccuracy();
        accuracy = result.accuracy;
        modelState = result.modelState;
        
        // Get real AI predictions for test images
        const testImage = testImages[0];
        if (testImage && aiModelService.isLoaded() && aiModelService.getExampleCount() >= 3) {
          console.log(`🔍 Analyzing test image for Wally (RED-WHITE horizontal stripes, bobble hat, round glasses, blue jeans, brown shoes)...`);
          const prediction = await aiModelService.predict(testImage.url);
          if (prediction) {
            const hasObject = prediction.label === gameState.currentCategory;
            const confidence = prediction.confidence;
            
            // Only update if confidence is reasonable
            if (confidence >= 0.4) {
              setTestImages(prev => prev.map(img => 
                img.id === testImage.id 
                  ? { ...img, modelPrediction: hasObject, confidence }
                  : img
              ));
            }
          }
        }
      } else {
        // Simulation mode: Calculate accuracy based on annotation quality
        const annotatedImages = gameState.images.filter(img => img.userAnnotation !== undefined);
        const correctAnnotations = annotatedImages.filter(img => 
          (img.userAnnotation !== null) === img.actualLabel
        ).length;
        
        accuracy = annotatedImages.length > 0 
          ? Math.round((correctAnnotations / annotatedImages.length) * 100)
          : 30;
        
        // Determine model state
        if (gameState.annotatedCount < 3) {
          modelState = 'underfitting';
        } else if (gameState.annotatedCount > 12) {
          modelState = 'overfitting';
        } else if (accuracy >= 70 && accuracy <= 95) {
          modelState = 'correct';
        } else if (accuracy < 60) {
          modelState = 'underfitting';
        } else {
          modelState = 'overfitting';
        }
        
        // Update test predictions in simulation mode
        simulateModelPrediction(testImages, setTestImages, gameState.annotatedCount, gameState.currentCategory);
      }
      
      setGameState(prev => ({
        ...prev,
        modelAccuracy: accuracy,
        isTraining: false,
        hasTrainedModel: true,
        modelState: modelState,
        score: prev.score + Math.round(accuracy * 0.5)
      }));
      
    } catch (error) {
      console.error('Training failed:', error);
      
      // Fallback values if AI training fails
      const fallbackAccuracy = Math.max(30, gameState.annotatedCount * 5);
      
      setGameState(prev => ({
        ...prev,
        modelAccuracy: fallbackAccuracy,
        isTraining: false,
        hasTrainedModel: true,
        modelState: 'underfitting',
        score: prev.score + Math.round(fallbackAccuracy * 0.5)
      }));
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-100 to-orange-100 relative overflow-hidden">
      {/* Wally-themed decorative elements */}
      <div className="absolute inset-0 opacity-10">
        {/* Scattered stripes pattern */}
        <div className="absolute top-10 left-10 w-20 h-4 bg-red-500 transform rotate-12 rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-3 bg-blue-500 transform -rotate-45 rounded-full"></div>
        <div className="absolute bottom-32 left-32 w-24 h-4 bg-red-500 transform rotate-45 rounded-full"></div>
        <div className="absolute bottom-20 right-40 w-18 h-3 bg-blue-500 transform -rotate-12 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-22 h-4 bg-red-500 transform rotate-75 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-3 bg-blue-500 transform -rotate-30 rounded-full"></div>
        
        {/* Scattered circles (glasses) */}
        <div className="absolute top-24 left-1/2 w-8 h-8 border-4 border-black rounded-full"></div>
        <div className="absolute bottom-40 right-1/4 w-6 h-6 border-3 border-black rounded-full"></div>
        <div className="absolute top-2/3 left-1/5 w-7 h-7 border-3 border-black rounded-full"></div>
        
        {/* Small bobble hat shapes */}
        <div className="absolute top-16 right-1/3 w-6 h-8 bg-red-600 rounded-t-full"></div>
        <div className="absolute bottom-28 left-1/3 w-5 h-7 bg-blue-600 rounded-t-full"></div>
        <div className="absolute top-1/2 right-1/5 w-6 h-8 bg-red-600 rounded-t-full"></div>
        
        {/* Wally's Iconic Accessories */}
        {/* Round Black Glasses - more scattered around */}
        <div className="absolute top-1/4 left-1/6 w-10 h-10 border-4 border-black rounded-full"></div>
        <div className="absolute top-3/4 right-1/6 w-8 h-8 border-3 border-black rounded-full"></div>
        <div className="absolute top-1/3 left-3/4 w-9 h-9 border-4 border-black rounded-full"></div>
        <div className="absolute bottom-1/4 left-2/3 w-7 h-7 border-3 border-black rounded-full"></div>
        
        {/* Red-and-White Bobble Hats with pom-poms */}
        <div className="absolute top-12 left-1/4">
          <div className="w-8 h-10 bg-red-600 rounded-t-full relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full"></div>
            <div className="absolute top-2 left-0 w-full h-2 bg-white"></div>
          </div>
        </div>
        <div className="absolute bottom-16 right-1/4">
          <div className="w-7 h-9 bg-red-600 rounded-t-full relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="absolute top-2 left-0 w-full h-1 bg-white"></div>
          </div>
        </div>
        <div className="absolute top-2/3 left-1/8">
          <div className="w-6 h-8 bg-red-600 rounded-t-full relative">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="absolute top-1 left-0 w-full h-1 bg-white"></div>
          </div>
        </div>
        
        {/* Walking Sticks / Canes */}
        <div className="absolute top-1/5 right-1/5 w-1 h-16 bg-amber-800 transform rotate-12 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/8 w-1 h-14 bg-amber-700 transform -rotate-25 rounded-full"></div>
        <div className="absolute top-1/2 right-2/3 w-1 h-12 bg-amber-800 transform rotate-45 rounded-full"></div>
        
        {/* Backpacks / Rucksacks */}
        <div className="absolute top-1/6 left-3/4 w-8 h-10 bg-green-700 rounded-lg transform rotate-12"></div>
        <div className="absolute bottom-1/5 right-1/8 w-7 h-9 bg-brown-600 rounded-lg transform -rotate-15"></div>
        <div className="absolute top-3/5 left-1/12 w-6 h-8 bg-green-600 rounded-lg transform rotate-30"></div>
        
        {/* Odlaw's Yellow-Black Stripes (nemesis colors) */}
        <div className="absolute top-1/8 right-1/2 w-16 h-3 bg-yellow-500 transform rotate-25 rounded-full"></div>
        <div className="absolute bottom-1/6 left-1/2 w-14 h-3 bg-black transform -rotate-35 rounded-full"></div>
        <div className="absolute top-2/5 right-1/6 w-18 h-3 bg-yellow-600 transform rotate-60 rounded-full"></div>
        <div className="absolute bottom-2/5 left-1/3 w-12 h-2 bg-black transform -rotate-20 rounded-full"></div>
        
        {/* Wenda's Elements (female friend with stripes) */}
        <div className="absolute top-1/7 left-1/2 w-12 h-2 bg-pink-500 transform rotate-15 rounded-full"></div>
        <div className="absolute bottom-1/7 right-1/3 w-10 h-2 bg-pink-400 transform -rotate-40 rounded-full"></div>
        
        {/* Wizard Whitebeard Elements (magical vibe) */}
        <div className="absolute top-1/4 right-1/8">
          <div className="w-4 h-12 bg-purple-700 transform rotate-20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
        </div>
        <div className="absolute bottom-1/4 left-1/6">
          <div className="w-3 h-10 bg-purple-600 transform -rotate-30" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
        </div>
        
        {/* Woof the Dog Elements (tail shapes) */}
        <div className="absolute top-1/3 left-1/10 w-8 h-3 bg-brown-500 rounded-full transform rotate-45"></div>
        <div className="absolute bottom-1/3 right-1/10 w-6 h-2 bg-brown-400 rounded-full transform -rotate-25"></div>
        
        {/* Additional Wally Watchers Stripes (crowd elements) */}
        <div className="absolute top-1/12 left-2/3 w-8 h-2 bg-red-400 transform rotate-10 rounded-full"></div>
        <div className="absolute top-1/12 left-2/3 w-8 h-2 bg-white transform rotate-10 rounded-full mt-1"></div>
        <div className="absolute bottom-1/12 right-2/3 w-10 h-2 bg-red-500 transform -rotate-20 rounded-full"></div>
        <div className="absolute bottom-1/12 right-2/3 w-10 h-2 bg-white transform -rotate-20 rounded-full mt-1"></div>
        
        {/* More scattered accessories for richness */}
        <div className="absolute top-1/8 left-1/3 w-5 h-5 border-2 border-black rounded-full"></div>
        <div className="absolute bottom-1/8 right-1/2 w-4 h-6 bg-red-500 rounded-t-full"></div>
        <div className="absolute top-5/6 left-1/5 w-1 h-8 bg-amber-700 transform rotate-75 rounded-full"></div>
        <div className="absolute top-1/10 right-3/4 w-5 h-6 bg-green-600 rounded transform rotate-45"></div>
      </div>
      
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-50 to-transparent opacity-30 -z-50"></div>
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
          <div className="flex-1 max-w-md h-full">
            <div className="bg-white rounded-2xl shadow-xl border-4 border-red-500 p-6 h-full flex flex-col">
              {/* Annotation Image */}
              <div className="mb-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-red-700 mb-4 text-center bg-yellow-100 py-2 px-4 rounded-lg border-2 border-red-300">
                  Training Image 🔍
                </h3>
                <div className="relative flex-1">
                  <img
                    src={gameState.images[currentImageIndex]?.url}
                    alt="Find Wally training image"
                    className="w-full h-80 object-cover rounded-xl border-4 border-blue-500 pointer-events-none"
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
                        <div className="absolute -top-7 left-0 bg-red-700 text-white text-sm px-3 py-1 rounded-full font-bold shadow-md border-2 border-yellow-400">
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
                      <div className="absolute top-3 left-3 bg-red-600 bg-opacity-90 text-white text-sm px-3 py-2 rounded-lg font-bold border-2 border-yellow-300">
                        Click & drag to find Wally!
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Annotation Tools */}
              <div className="space-y-4 flex-shrink-0">
                <button
                  onClick={() => handleAnnotate(gameState.images[currentImageIndex]?.id, null)}
                  disabled={gameState.isTraining || isRecordingAnnotation}
                  className={`w-full px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
                    gameState.isTraining || isRecordingAnnotation
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 border-2 border-yellow-400'
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
                        <span>No Wally Here</span>
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
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-700 bg-yellow-100 px-3 py-1 rounded-full border-2 border-red-300">
                      {currentImageIndex + 1} / {gameState.images.length}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNextImage}
                    disabled={currentImageIndex === gameState.images.length - 1}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      currentImageIndex === gameState.images.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300'
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
                <div className="text-4xl text-red-600 animate-pulse">→</div>
              </div>
              
              {/* Conveyor Belt Track */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-blue-600 rounded-full shadow-inner border-4 border-yellow-400">
                {/* Moving Belt Segments */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                  <div className="flex space-x-2 animate-pulse">
                    <div className="w-2 h-8 bg-white rounded-full opacity-90 animate-bounce border border-yellow-300" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-8 bg-yellow-300 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-8 bg-white rounded-full opacity-90 animate-bounce border border-yellow-300" style={{ animationDelay: '0.4s' }}></div>
                    <div className="w-2 h-8 bg-yellow-300 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.6s' }}></div>
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
          <div className="flex-1 max-w-md h-full">
            {testImages[0] && (
              <div className="bg-white rounded-2xl shadow-xl border-4 border-blue-500 p-6 h-full flex flex-col">
                <div className="mb-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-blue-700 mb-4 text-center bg-yellow-100 py-2 px-4 rounded-lg border-2 border-blue-300">
                    Test Image 🧪
                  </h3>
                  <div className="relative w-full flex-1">
                    <img
                      src={testImages[0].url}
                      alt="Where's Wally test image"
                      className="w-full h-80 object-cover rounded-xl border-4 border-red-500 pointer-events-none"
                    />
                    
                    {/* Existing Bounding Box Display */}
                    {gameState.hasTrainedModel && testImages[0].modelPrediction === true && (
                      <div
                        className="absolute border-4 border-yellow-500 bg-yellow-500 bg-opacity-40 shadow-lg pointer-events-none z-40"
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
                          testImages[0].modelPrediction ? 'bg-yellow-500 text-red-700 border-2 border-red-500' : 'bg-red-600 text-white border-2 border-yellow-400'
                        }`}>
                          {testImages[0].modelPrediction ? `✓ Wally spotted!` : `✗ Wally not found`}
                        </div>
                      </div>
                    )}

                    {/* Placeholder when no model */}
                    {(testImages[0].modelPrediction === undefined) && (
                      <div className="absolute inset-0 bg-red-600 bg-opacity-70 rounded-xl flex items-center justify-center border-4 border-yellow-400">
                        <div className="text-white text-center">
                          <p className="text-lg font-medium">
                            {gameState.annotatedCount === 0
                              ? "Give 3 annotating images to train AI!"
                              : gameState.annotatedCount === 1
                                ? "Give 2 more annotating images to train AI!"
                                : gameState.annotatedCount === 2
                                  ? "Give 1 more annotating image to train AI!"
                                  : "AI is analyzing..."
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Dynamic Confidence Progress Bar */}
                <div className="space-y-4 flex-shrink-0">
                  {/* Confidence Meter Labels */}
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full border border-red-300">Not confident</span>
                    <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded-full border border-blue-300">Very confident</span>
                  </div>
                  
                  {/* Confidence Meter with Moving Ball */}
                  <div className="relative">
                    {/* Background Track */}
                    <div className="bg-gradient-to-r from-red-300 via-yellow-300 to-blue-300 rounded-full h-6 shadow-inner border-4 border-white">
                    </div>
                    
                    {/* Moving Red Ball */}
                    <div 
                      className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out"
                      style={{ 
                        left: `${Math.min(15 + (gameState.annotatedCount * 7), 85)
                        }%`
                      }}
                    >
                      <div className="w-6 h-6 bg-red-600 rounded-full shadow-lg border-3 border-yellow-400 animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Dynamic Confidence Messages */}
                  <div className="text-center min-h-[3rem] flex items-center justify-center">
                    <p className="text-sm font-bold text-red-800 italic animate-pulse bg-yellow-100 px-4 py-3 rounded-lg border-2 border-red-400 shadow-md">
                      {isModelLoading && "🤖 Loading AI brain..."}
                      {!isModelLoading && testImages[0]?.confidence !== undefined 
                        ? aiModelService.getConfidenceMessage(testImages[0].confidence, gameState.annotatedCount)
                        : aiModelService.getConfidenceMessage(0, gameState.annotatedCount)
                      }
                    </p>
                  </div>
                  
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Bar - Tips */}
        
        {/* Next Level Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleNextLevel}
            disabled={!gameState.hasTrainedModel || gameState.modelAccuracy < 70}
            className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl border-4 ${
              gameState.hasTrainedModel && gameState.modelAccuracy >= 70
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 hover:shadow-2xl hover:scale-105 border-yellow-400 transform hover:-translate-y-1'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-400'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">🎯</span>
              <span>Next Level</span>
              <span className="text-2xl">→</span>
            </div>
            {gameState.hasTrainedModel && gameState.modelAccuracy >= 70 && (
              <div className="text-sm mt-1 opacity-90">
                Ready for Level {gameState.currentLevel + 1}!
              </div>
            )}
          </button>
        </div>
        
        {/* Status Message */}
        <div className="mt-4 text-center">
          {!gameState.hasTrainedModel && (
            <p className="text-lg font-bold text-red-700 bg-yellow-100 px-6 py-3 rounded-full border-2 border-red-300 inline-block">
              🤖 Train your AI model first!
            </p>
          )}
          
          {gameState.hasTrainedModel && gameState.modelAccuracy < 70 && (
            <p className="text-lg font-bold text-orange-700 bg-yellow-100 px-6 py-3 rounded-full border-2 border-orange-300 inline-block">
              📈 Need {70 - gameState.modelAccuracy}% more accuracy (Current: {gameState.modelAccuracy}%)
            </p>
          )}
          
          {gameState.hasTrainedModel && gameState.modelAccuracy >= 70 && (
            <p className="text-lg font-bold text-green-700 bg-green-100 px-6 py-3 rounded-full border-2 border-green-300 inline-block animate-pulse">
              ✅ Perfect! Ready for the next challenge?
            </p>
          )}
        </div>
      </div>
    </div>
  );
};