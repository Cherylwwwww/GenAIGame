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
}

export const ModelPanel: React.FC<ModelPanelProps> = ({
  images,
  modelAccuracy,
  isTraining,
  hasTrainedModel,
  onTrainModel,
  canTrain,
  modelState,
  currentCategory
}) => {
  const testImage = images[0];
  
  const getModelStateDisplay = () => {
    switch (modelState) {
      case 'underfitting':
        return { text: 'Underfitting', color: 'text-red-600', bg: 'bg-red-50' };
      case 'correct':
        return { text: 'Correct', color: 'text-green-600', bg: 'bg-green-50' };
      case 'overfitting':
        return { text: 'Overfitting', color: 'text-orange-600', bg: 'bg-orange-50' };
    }
  };

  const stateDisplay = getModelStateDisplay();

  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Model Training</h3>
        <p className="text-sm text-gray-600 mb-4">
          After annotating your training data, use this panel to train and validate your AI model.
        </p>
        
        {!hasTrainedModel && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> The optimal number of annotations is 5 images. 
              Too few leads to underfitting, too many can cause overfitting.
            </p>
          </div>
        )}
      </div>
      
      <div className="text-center mb-6">
        <button
          onClick={onTrainModel}
          disabled={isTraining}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg ${
            isTraining
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {isTraining ? '🔄 Training Model...' : '🚀 Train Model'}
        </button>
        
        {isTraining && (
          <div className="mt-3">
            <div className="animate-pulse text-sm text-gray-600">
              Analyzing your annotations and building the AI model...
            </div>
          </div>
        )}
      </div>
      
      {testImage && (
        <div className="space-y-4">
          <div className="text-center mb-2">
            <h4 className="font-medium text-gray-700">Test Image</h4>
            <p className="text-xs text-gray-500">
              {hasTrainedModel ? 'Model prediction shown below' : 'Train the model to see predictions'}
            </p>
          </div>
          
          <div className="relative">
            <img
              src={testImage.url}
              alt="Test image"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
            />
            
            {/* Show bounding box if model predicts object exists */}
            {hasTrainedModel && testImage.modelPrediction === true && (
              <div
                className="absolute border-3 border-green-500 bg-green-500 bg-opacity-20"
                style={{
                  left: '25%',
                  top: '20%', 
                  width: '50%',
                  height: '60%'
                }}
              />
            )}
            
            {hasTrainedModel && testImage.modelPrediction !== undefined && (
              <div className="absolute top-2 right-2">
                <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  testImage.modelPrediction ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {testImage.modelPrediction ? `✓ Found ${currentCategory}` : `✗ No ${currentCategory} Found`}
                  {testImage.confidence && (
                    <div className="text-xs opacity-90">
                      {Math.round(testImage.confidence * 100)}% confident
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {hasTrainedModel && (
            <div className={`text-center py-3 px-4 rounded-lg border ${stateDisplay.bg} ${
              stateDisplay.color === 'text-green-600' ? 'border-green-200' : 
              stateDisplay.color === 'text-red-600' ? 'border-red-200' : 'border-orange-200'
            }`}>
              <span className={`font-semibold ${stateDisplay.color}`}>
                Model State: {stateDisplay.text}
              </span>
            </div>
          )}
        </div>
      )}
      
      {hasTrainedModel && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">📊 Model Performance</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Accuracy:</span>
              <span className="font-bold text-lg text-blue-600">{modelAccuracy}%</span>
            </div>
            
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(modelAccuracy, 100)}%` }}
              />
            </div>
            
            <div className="text-center mt-3">
              <p className="text-sm text-gray-700">
                {modelState === 'correct' && '✅ Perfect! Model is well-trained with optimal data'}
                {modelState === 'underfitting' && '⚠️ Model needs more training data to improve'}
                {modelState === 'overfitting' && '⚠️ Too much data may cause overfitting - try with fewer annotations'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};