import React from 'react';
import { GameImage } from '../types';
import { Brain, Zap, Target } from 'lucide-react';

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
          text: 'Too Little Data', 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-50',
          barColor: 'from-yellow-400 to-orange-400',
          icon: '🤔',
          description: 'Need more training examples'
        };
      case 'correct':
        return { 
          text: 'Perfect Balance', 
          color: 'text-green-600', 
          bg: 'bg-green-50',
          barColor: 'from-green-400 to-blue-400',
          icon: '🎯',
          description: 'AI learned correctly!'
        };
      case 'overfitting':
        return { 
          text: 'Memorized Only', 
          color: 'text-red-600', 
          bg: 'bg-red-50',
          barColor: 'from-red-400 to-pink-400',
          icon: '😅',
          description: 'Too much training data'
        };
    }
  };

  const stateDisplay = getModelStateDisplay();
  const displayAccuracy = hasTrainedModel ? modelAccuracy : Math.min(30 + annotatedCount * 3, 50);

  return (
    <div className="space-y-6">
      {/* Train Model Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Model Training 🤖</h2>
          <p className="text-gray-600">Train your AI to recognize {currentCategory}</p>
        </div>
        
        {/* Large Train Button */}
        <div className="text-center mb-8">
          <button
            onClick={onTrainModel}
            disabled={isTraining || !canTrain}
            className={`w-full px-8 py-6 rounded-2xl font-bold text-2xl transition-all duration-300 ${
              isTraining || !canTrain
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105'
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              {isTraining ? (
                <>
                  <div className="animate-spin">🔄</div>
                  <span>Training AI...</span>
                </>
              ) : (
                <>
                  <Brain className="w-8 h-8" />
                  <span>Train AI Model</span>
                  <Zap className="w-8 h-8" />
                </>
              )}
            </div>
          </button>
          
          {!canTrain && (
            <p className="mt-3 text-gray-500">
              📝 Annotate at least 1 image to start training
            </p>
          )}
        </div>

        {/* Training Progress Animation */}
        {isTraining && (
          <div className="mb-8">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2 text-blue-700 mb-3">
                <Brain className="w-5 h-5 animate-pulse" />
                <span className="font-medium">AI is learning from your annotations...</span>
              </div>
              <div className="bg-blue-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Image Section */}
      {testImage && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Test Image 📸</h3>
            <p className="text-gray-600">See how your AI performs</p>
          </div>
          
          <div className="relative">
            <img
              src={testImage.url}
              alt="Test image"
              className="w-full h-64 object-cover rounded-xl border-4 border-gray-200"
            />
            
            {/* Model Prediction Overlay */}
            {hasTrainedModel && testImage.modelPrediction === true && (
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
            {hasTrainedModel && testImage.modelPrediction !== undefined && (
              <div className="absolute top-4 right-4">
                <div className={`px-4 py-2 rounded-xl font-bold text-lg shadow-lg ${
                  testImage.modelPrediction ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {testImage.modelPrediction ? `✓ Found ${currentCategory}!` : `✗ No ${currentCategory}`}
                  {testImage.confidence && (
                    <div className="text-sm opacity-90 mt-1">
                      {Math.round(testImage.confidence * 100)}% confident
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder when no model */}
            {!hasTrainedModel && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="text-white text-center">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-70" />
                  <p className="text-lg font-medium">Train AI to see predictions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Model Performance Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">AI Performance 📊</h3>
        </div>
        
        {/* Large Accuracy Display */}
        <div className="text-center mb-6">
          <div className="text-6xl font-bold text-gray-800 mb-2 transition-all duration-1000">
            {displayAccuracy}%
          </div>
          <div className="text-gray-600">
            AI Confidence
            {annotatedCount > 0 && (
              <div className="text-sm text-blue-600 mt-1">
                📈 +{Math.min(annotatedCount * 3, 50)}% from {annotatedCount} annotations
              </div>
            )}
          </div>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="mb-6">
          <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
            <div 
              className={`bg-gradient-to-r ${stateDisplay.barColor} h-6 rounded-full transition-all duration-1000 ease-out ${
                modelState === 'overfitting' ? 'animate-pulse' : ''
              }`}
              style={{ width: `${Math.min(displayAccuracy, 100)}%` }}
            />
          </div>
          
          {/* Accuracy Markers */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0%</span>
            <span className="text-yellow-600">50%</span>
            <span className="text-green-600">85%</span>
            <span>100%</span>
          </div>
        </div>
        
        {/* Model State Display */}
        <div className={`text-center py-4 px-6 rounded-xl border-2 ${stateDisplay.bg} ${
          stateDisplay.color === 'text-green-600' ? 'border-green-200' : 
          stateDisplay.color === 'text-red-600' ? 'border-red-200' : 'border-yellow-200'
        }`}>
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-3xl">{stateDisplay.icon}</span>
            <span className={`text-xl font-bold ${stateDisplay.color}`}>
              {stateDisplay.text}
            </span>
          </div>
          <div className="text-gray-700">
            {stateDisplay.description}
          </div>
        </div>
        
        {/* Training Tips */}
        {!hasTrainedModel && annotatedCount > 0 && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="text-center text-blue-800">
              <div className="text-lg font-bold mb-1">💡 Training Tip</div>
              <div className="text-sm">
                {annotatedCount < 3 && "Keep annotating for better accuracy!"}
                {annotatedCount >= 3 && annotatedCount < 7 && "Good amount of data - ready to train!"}
                {annotatedCount >= 7 && "Lots of data - watch for overfitting!"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};