import React from 'react';
import { RotateCcw, ArrowRight, Play } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  onNextLevel: () => void;
  canProceed: boolean;
  hasTrainedModel: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onReset,
  onNextLevel,
  canProceed,
  hasTrainedModel
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onReset}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="font-medium">Reset</span>
        </button>
        
        <div className="flex-1" />
        
        <button
          onClick={onNextLevel}
          disabled={!canProceed}
          className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            canProceed
              ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover:scale-105 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          <span>Next Level</span>
        </button>
      </div>
      
      {!hasTrainedModel && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            💡 Complete annotations and train the model to proceed to the next level
          </p>
        </div>
      )}
    </div>
  );
};