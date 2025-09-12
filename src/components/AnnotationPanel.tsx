import React from 'react';
import { BoundingBoxAnnotator } from './BoundingBoxAnnotator';
import { GameImage, BoundingBox } from '../types';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

interface AnnotationPanelProps {
  images: GameImage[];
  onAnnotate: (imageId: string, annotation: BoundingBox | null) => void;
  currentCategory: string;
  annotatedCount: number;
  disabled?: boolean;
  isRecordingAnnotation?: boolean;
  currentImageIndex: number;
  onNextImage: () => void;
  onPrevImage: () => void;
  onNextLevel: () => void;
  modelAccuracy: number;
  hasTrainedModel: boolean;
  modelState: 'underfitting' | 'correct' | 'overfitting';
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  images,
  onAnnotate,
  currentCategory,
  annotatedCount,
  disabled = false,
  isRecordingAnnotation = false,
  currentImageIndex,
  onNextImage,
  onPrevImage,
  onNextLevel,
  modelAccuracy,
  hasTrainedModel,
  modelState
}) => {
  const currentImage = images[currentImageIndex];
  const totalImages = images.length;
  const canProceed = hasTrainedModel && modelAccuracy >= 70;

  if (!currentImage) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">No images available</div>
      </div>
    );
  }

  const handleAnnotation = (box: BoundingBox | null) => {
    onAnnotate(currentImage.id, box);
  };

  const getNextLevelButtonStyle = () => {
    if (!canProceed) {
      return {
        className: 'bg-gray-300 text-gray-500 cursor-not-allowed',
        text: 'Train AI First',
        icon: '🤖'
      };
    }
    
    if (modelState === 'overfitting') {
      return {
        className: 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105',
        text: 'Next Level',
        icon: '⚠️'
      };
    }
    
    return {
      className: 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105',
      text: 'Next Level',
      icon: '🎉'
    };
  };

  const buttonStyle = getNextLevelButtonStyle();

  return (
    <div className="space-y-6">
      {/* Annotation Zone */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <BoundingBoxAnnotator
          imageUrl={currentImage.url}
          onAnnotate={handleAnnotation}
          existingBox={currentImage.userAnnotation}
          disabled={disabled || isRecordingAnnotation}
          currentCategory={currentCategory}
          onNextImage={onNextImage}
          isRecording={isRecordingAnnotation}
        />
        
        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={onPrevImage}
            disabled={currentImageIndex === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              currentImageIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'
            }`}
            title="Previous image"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {currentImageIndex + 1} / {totalImages}
            </div>
            <div className="text-sm text-gray-600">Images</div>
          </div>
          
          <button
            onClick={onNextImage}
            disabled={currentImageIndex === totalImages - 1}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
              currentImageIndex === totalImages - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'
            }`}
            title="Next image"
          >
            <span>Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Next Level Button */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <button
            onClick={onNextLevel}
            disabled={!canProceed}
            className={`w-full px-8 py-4 rounded-xl font-bold text-xl transition-all duration-200 ${buttonStyle.className}`}
            title={!canProceed ? "Complete training first" : "Advance to next level"}
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">{buttonStyle.icon}</span>
              <span>{buttonStyle.text}</span>
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </button>
          
          {/* Status Message */}
          <div className="mt-4 text-sm">
            {!hasTrainedModel && (
              <p className="text-gray-500">
                🤖 Train your AI model to unlock next level
              </p>
            )}
            
            {hasTrainedModel && modelAccuracy < 70 && (
              <p className="text-orange-600">
                📈 Need {70 - modelAccuracy}% more accuracy (Current: {modelAccuracy}%)
              </p>
            )}
            
            {canProceed && modelState === 'correct' && (
              <p className="text-green-600">
                ✅ Perfect! Ready for the next challenge?
              </p>
            )}
            
            {canProceed && modelState === 'overfitting' && (
              <p className="text-red-600">
                ⚠️ Model may be overfitting, but you can proceed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};