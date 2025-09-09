import React from 'react';
import { GameImage } from '../types';

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
      <div className="text-center mb-6">
        <button
          onClick={onTrainModel}
          disabled={isTraining}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isTraining
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isTraining ? 'Training...' : 'Train Model'}
        </button>
      </div>
      
      {testImage && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={testImage.url}
              alt="Test image"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
            />
            
            {hasTrainedModel && testImage.modelPrediction !== undefined && (
              <div className="absolute top-2 right-2">
                <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  testImage.modelPrediction ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {testImage.modelPrediction ? `Has ${currentCategory}` : `No ${currentCategory}`}
                </div>
              </div>
            )}
          </div>
          
          {hasTrainedModel && (
            <div className={`text-center py-2 px-4 rounded-lg ${stateDisplay.bg}`}>
              <span className={`font-medium ${stateDisplay.color}`}>
                {stateDisplay.text}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-center">
    {hasTrainedModel && (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Model Performance</h4>
        <div className="text-sm text-gray-600">
          <p>Accuracy: <span className="font-bold text-blue-600">{modelAccuracy}%</span></p>
          <p className="mt-1">
            {modelState === 'correct' && '✅ Model is well-trained with optimal data'}
            {modelState === 'underfitting' && '⚠️ Model needs more training data'}
            {modelState === 'overfitting' && '⚠️ Model may be overfitted - too much data'}
          </p>
        </div>
      </div>
    )}
  );
};