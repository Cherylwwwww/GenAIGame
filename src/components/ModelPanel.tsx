import React from 'react';
import { GameImage, BoundingBox } from '../types';

interface ModelPanelProps {
  images: GameImage[];
  modelAccuracy: number;
  isTraining: boolean;
  hasTrainedModel: boolean;
  onTrainModel: () => void;
  canTrain: boolean;
  modelState: 'underfitting' | 'correct' | 'overfitting';
  currentCategory: string;
  annotatedCount: number;
}

export const ModelPanel: React.FC<ModelPanelProps> = ({
  images,
  modelAccuracy,
  isTraining,
  hasTrainedModel,
  onTrainModel,
  canTrain,
  modelState,
  currentCategory,
  annotatedCount
}) => {
  const testImage = images[0];
  
  const getModelStateDisplay = () => {
    switch (modelState) {
      case 'underfitting':
        return { 
          text: 'Underfitting', 
          color: 'text-gray-600', 
          bg: 'bg-gray-50',
          barColor: 'from-gray-400 to-gray-500',
          description: 'Model needs more training data'
        };
      case 'correct':
        return { 
          text: 'Good Fit', 
          color: 'text-green-600', 
          bg: 'bg-green-50',
          barColor: 'from-blue-500 to-green-500',
          description: '✅ Model learned the right patterns'
        };
      case 'overfitting':
        return { 
          text: 'Overfitting', 
          color: 'text-red-600', 
          bg: 'bg-red-50',
          barColor: 'from-red-500 to-orange-500',
          description: '⚠️ Model memorized data, poor generalization'
        };
    }
  };

  const stateDisplay = getModelStateDisplay();

  // Dynamic accuracy range calculation
  const getAccuracyRange = () => {
    switch (modelState) {
      case 'underfitting':
        return { min: 30, max: 50 };
      case 'correct':
        return { min: 85, max: 90 };
      case 'overfitting':
        return { min: 60, max: 70 };
    }
  };

  const accuracyRange = getAccuracyRange();
  const displayAccuracy = hasTrainedModel ? modelAccuracy : Math.min(30 + annotatedCount * 3, 50);

  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 AI Model Training</h3>
        
        {!hasTrainedModel && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Annotate a few images to start training!
              Better annotation quality leads to better model performance.
            </p>
          </div>
        )}
      </div>
      
      {/* Training Button */}
      <div className="text-center mb-6">
        <button
          onClick={onTrainModel}
          disabled={isTraining || !canTrain}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg ${
            isTraining || !canTrain
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isTraining ? '🔄 Training Model...' : '🚀 Start Training Model'}
        </button>
        
        {!canTrain && (
          <p className="mt-2 text-sm text-gray-500">
            Please annotate at least 1 image to start training
          </p>
        )}
        
        {isTraining && (
          <div className="mt-3">
            <div className="animate-pulse text-sm text-gray-600">
              Analyzing your annotations and building AI model...
            </div>
          </div>
        )}
      </div>
      
      {/* Test Image Area */}
      {testImage && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <h4 className="text-md font-semibold text-gray-700">📸 Test Image</h4>
          </div>
          
          <div className="relative">
            <img
              src={testImage.url}
              alt="Test image"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
            />
            
            {/* Model Prediction Box */}
            {hasTrainedModel && testImage.modelPrediction === true && (
              <div
                className="absolute border-3 border-green-500 bg-green-500 bg-opacity-20 animate-pulse"
                style={{
                  left: '25%',
                  top: '20%', 
                  width: '50%',
                  height: '60%'
                }}
              />
            )}
            
            {/* Prediction Result Label */}
            {hasTrainedModel && testImage.modelPrediction !== undefined && (
              <div className="absolute top-2 right-2">
                <div className={`px-3 py-1 rounded-lg text-sm font-medium animate-fadeIn ${
                  testImage.modelPrediction ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {testImage.modelPrediction ? `✓ Found ${currentCategory}` : `✗ No ${currentCategory} found`}
                  {testImage.confidence && (
                    <div className="text-xs opacity-90">
                      Confidence: {Math.round(testImage.confidence * 100)}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Dynamic Accuracy Progress Bar */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-semibold text-gray-800 mb-3 text-center">📊 Model Performance Analysis</h4>
        
        {/* Real-time Accuracy Display */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Accuracy:</span>
            <span className={`font-bold text-lg ${stateDisplay.color}`}>
              {displayAccuracy}%
            </span>
          </div>
          
          {/* Dynamic Progress Bar */}
          <div className="relative">
            <div className="bg-gray-200 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${stateDisplay.barColor} h-3 rounded-full transition-all duration-1000 ease-out ${
                  modelState === 'overfitting' ? 'animate-pulse' : ''
                }`}
                style={{ width: `${Math.min(displayAccuracy, 100)}%` }}
              />
            </div>
            
            {/* Accuracy Range Markers */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-yellow-600">50%</span>
              <span className="text-green-600">85%</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Model State Indicator */}
          <div className={`text-center py-3 px-4 rounded-lg border ${stateDisplay.bg} ${
            stateDisplay.color === 'text-green-600' ? 'border-green-200' : 
            stateDisplay.color === 'text-red-600' ? 'border-red-200' : 'border-gray-200'
          }`}>
            <div className={`font-semibold ${stateDisplay.color} mb-1`}>
              Model State: {stateDisplay.text}
            </div>
            <div className="text-sm text-gray-700">
              {stateDisplay.description}
            </div>
          </div>
          
          {/* Training Suggestions */}
          {!hasTrainedModel && annotatedCount > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                <strong>Training Suggestion:</strong>
                {annotatedCount < 3 && " Continue annotating more images to improve accuracy"}
                {annotatedCount >= 3 && annotatedCount < 7 && " Current data amount is good, ready to train"}
                {annotatedCount >= 7 && " Sufficient data, watch out for overfitting"}
              </div>
            </div>
          )}
          
          {/* Real-time Feedback */}
          {annotatedCount > 0 && !hasTrainedModel && (
            <div className="text-center">
              <div className="text-sm text-gray-600">
                Annotated: {annotatedCount} images
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Estimated accuracy: {Math.min(30 + annotatedCount * 5, 85)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};