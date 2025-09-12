import React, { useState } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface NextLevelButtonProps {
  modelAccuracy: number;
  modelState: 'underfitting' | 'correct' | 'overfitting';
  hasTrainedModel: boolean;
  onNextLevel: () => void;
  currentLevel: number;
}

export const NextLevelButton: React.FC<NextLevelButtonProps> = ({
  modelAccuracy,
  modelState,
  hasTrainedModel,
  onNextLevel,
  currentLevel
}) => {
  const [showOverfitWarning, setShowOverfitWarning] = useState(false);

  const canProceed = hasTrainedModel && modelAccuracy >= 70;
  const isOverfitting = modelState === 'overfitting';

  const getButtonConfig = () => {
    if (!canProceed) {
      return {
        className: 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-200',
        text: 'Complete Training First',
        icon: <XCircle className="w-5 h-5" />,
        disabled: true
      };
    }
    
    if (isOverfitting) {
      return {
        className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-red-400',
        text: 'Continue Anyway',
        icon: <AlertTriangle className="w-5 h-5" />,
        disabled: false
      };
    }
    
    return {
      className: 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-green-400',
      text: 'Next Challenge',
      icon: <CheckCircle className="w-5 h-5" />,
      disabled: false
    };
  };

  const buttonConfig = getButtonConfig();

  const handleClick = () => {
    if (!canProceed) return;
    
    if (isOverfitting && !showOverfitWarning) {
      setShowOverfitWarning(true);
      return;
    }
    
    onNextLevel();
    setShowOverfitWarning(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          Ready for Next Challenge?
        </h3>
        <p className="text-sm text-gray-600">
          Level {currentLevel} → Level {currentLevel + 1}
        </p>
      </div>

      <div className="p-6">
        {/* Overfitting Warning Modal */}
        {showOverfitWarning && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-800 text-lg mb-2">
                  ⚠️ Overfitting Detected
                </h4>
                <div className="space-y-2 text-sm text-red-700 mb-4">
                  <p>
                    <strong>What this means:</strong> Your model has memorized the training data 
                    but may not work well on new, unseen images.
                  </p>
                  <p>
                    <strong>Why it happened:</strong> Too many annotations or repetitive data 
                    can cause the model to "overlearn."
                  </p>
                  <p>
                    <strong>Recommendation:</strong> Try training with fewer, more diverse annotations.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onNextLevel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    Continue Anyway
                  </button>
                  <button
                    onClick={() => setShowOverfitWarning(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Go Back & Retrain
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Action Button */}
        <div className="text-center space-y-4">
          <button
            onClick={handleClick}
            disabled={buttonConfig.disabled}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${buttonConfig.className}`}
          >
            <div className="flex items-center justify-center gap-3">
              {buttonConfig.icon}
              <span>{buttonConfig.text}</span>
              {canProceed && <ArrowRight className="w-5 h-5" />}
            </div>
          </button>
          
          {/* Status Messages */}
          <div className="space-y-2">
            {!hasTrainedModel && (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Train your model to unlock next level</span>
              </div>
            )}
            
            {hasTrainedModel && modelAccuracy < 70 && (
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-sm">
                  Need 70%+ accuracy (currently {modelAccuracy}%)
                </span>
              </div>
            )}
            
            {canProceed && modelState === 'correct' && !showOverfitWarning && (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Excellent! Your model is ready for the next challenge
                </span>
              </div>
            )}
            
            {canProceed && modelState === 'overfitting' && !showOverfitWarning && (
              <div className="flex items-center justify-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  Model may be overfitted - click to see details
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>Level {currentLevel}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((modelAccuracy / 100) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};