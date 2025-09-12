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
          description: 'Model needs more training data',
          icon: '📊'
        };
      case 'correct':
        return { 
          text: 'Well Fitted', 
          color: 'text-green-600', 
          bg: 'bg-green-50',
          barColor: 'from-blue-500 to-green-500',
          description: '✅ Model learned the real patterns',
          icon: '🎯'
        };
      case 'overfitting':
        return { 
          text: 'Overfitting', 
          color: 'text-red-600', 
          bg: 'bg-red-50',
          barColor: 'from-red-500 to-orange-500',
          description: '⚠️ Model memorized data, poor generalization',
          icon: '🔴'
        };
    }
  };

  const stateDisplay = getModelStateDisplay();
  const displayAccuracy = hasTrainedModel ? modelAccuracy : Math.min(30 + annotatedCount * 3, 50);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🤖 AI Model Training
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Train your AI to recognize {currentCategory}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Training Button Section */}
        <div className="text-center space-y-3">
          <button
            onClick={onTrainModel}
            disabled={isTraining || !canTrain}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
              isTraining || !canTrain
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            {isTraining ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Training Model...
              </div>
            ) : (
              '🚀 Train AI Model'
            )}
          </button>
          
          {!canTrain && (
            <p className="text-sm text-gray-500">
              Please annotate at least 1 image to start training
            </p>
          )}
        </div>

        {/* Test Image Preview */}
        {testImage && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-700">Test Image</h4>
              {hasTrainedModel && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  AI Prediction Ready
                </span>
              )}
            </div>
            
            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={testImage.url}
                alt="Test image for AI prediction"
                className="w-full h-48 object-cover"
              />
              
              {/* AI Prediction Overlay */}
              {hasTrainedModel && testImage.modelPrediction === true && (
                <div
                  className="absolute border-3 border-green-400 bg-green-400 bg-opacity-20 animate-pulse"
                  style={{
                    left: '25%',
                    top: '20%', 
                    width: '50%',
                    height: '60%'
                  }}
                />
              )}
              
              {/* Prediction Label */}
              {hasTrainedModel && testImage.modelPrediction !== undefined && (
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
                    testImage.modelPrediction 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    <div className="flex items-center gap-1">
                      {testImage.modelPrediction ? '✓' : '✗'}
                      <span>
                        {testImage.modelPrediction 
                          ? `Found ${currentCategory}` 
                          : `No ${currentCategory}`
                        }
                      </span>
                    </div>
                    {testImage.confidence && (
                      <div className="text-xs opacity-90 mt-1">
                        Confidence: {Math.round(testImage.confidence * 100)}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Model Performance Dashboard */}
        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">Model Performance</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{stateDisplay.icon}</span>
              <span className={`font-bold text-xl ${stateDisplay.color}`}>
                {displayAccuracy}%
              </span>
            </div>
          </div>
          
          {/* Dynamic Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stateDisplay.barColor} transition-all duration-1000 ease-out ${
                  modelState === 'overfitting' ? 'animate-pulse' : ''
                }`}
                style={{ width: `${Math.min(displayAccuracy, 100)}%` }}
              />
              
              {/* Threshold markers */}
              <div className="absolute inset-0 flex justify-between items-center px-1">
                <div className="w-0.5 h-2 bg-white opacity-50"></div>
                <div className="w-0.5 h-2 bg-white opacity-50"></div>
                <div className="w-0.5 h-2 bg-white opacity-50"></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>85%</span>
              <span>100%</span>
            </div>
          </div>
          
          {/* Model State Indicator */}
          <div className={`rounded-lg p-4 border-2 ${
            stateDisplay.color === 'text-green-600' ? 'border-green-200 bg-green-50' : 
            stateDisplay.color === 'text-red-600' ? 'border-red-200 bg-red-50' : 
            'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{stateDisplay.icon}</span>
              <span className={`font-bold ${stateDisplay.color}`}>
                {stateDisplay.text}
              </span>
            </div>
            <p className="text-sm text-gray-700">
              {stateDisplay.description}
            </p>
          </div>
          
          {/* Training Progress Indicator */}
          {annotatedCount > 0 && !hasTrainedModel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">
                  Training Progress
                </span>
                <span className="text-xs text-blue-600">
                  {annotatedCount} images annotated
                </span>
              </div>
              
              <div className="text-xs text-blue-700">
                {annotatedCount < 3 && "💡 Add more annotations for better accuracy"}
                {annotatedCount >= 3 && annotatedCount < 7 && "✅ Good amount of data, ready to train"}
                {annotatedCount >= 7 && "⚠️ Lots of data - watch out for overfitting"}
              </div>
              
              <div className="mt-2 text-xs text-blue-600">
                Estimated accuracy: {Math.min(30 + annotatedCount * 5, 85)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};