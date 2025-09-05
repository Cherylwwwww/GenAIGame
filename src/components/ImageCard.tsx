import React from 'react';
import { Check, X } from 'lucide-react';
import { GameImage } from '../types';

interface ImageCardProps {
  image: GameImage;
  onAnnotate: (imageId: string, annotation: boolean) => void;
  disabled?: boolean;
  showPrediction?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onAnnotate,
  disabled = false,
  showPrediction = false
}) => {
  const getCardBorder = () => {
    if (showPrediction && image.modelPrediction !== undefined) {
      const isCorrect = image.modelPrediction === image.actualLabel;
      return isCorrect ? 'border-green-500 border-4' : 'border-red-500 border-4';
    }
    
    if (image.userAnnotation !== undefined) {
      return 'border-blue-500 border-2';
    }
    
    return 'border-gray-200 border-2';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${getCardBorder()}`}>
      <div className="relative">
        <img 
          src={image.url} 
          alt={`Image ${image.id}`}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        
        {showPrediction && image.modelPrediction !== undefined && (
          <div className="absolute top-2 right-2">
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
              image.modelPrediction === image.actualLabel 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              AI Prediction: {image.modelPrediction ? 'Yes' : 'No'}
              {image.confidence && ` (${Math.round(image.confidence * 100)}%)`}
            </div>
          </div>
        )}
        
        {image.userAnnotation !== undefined && (
          <div className="absolute top-2 left-2">
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              Annotated: {image.userAnnotation ? 'Yes' : 'No'}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex space-x-3">
          <button
            onClick={() => onAnnotate(image.id, true)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
              image.userAnnotation === true
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 hover:shadow-md'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <Check className="w-5 h-5" />
            <span>Yes</span>
          </button>
          
          <button
            onClick={() => onAnnotate(image.id, false)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
              image.userAnnotation === false
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 hover:shadow-md'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            <X className="w-5 h-5" />
            <span>No</span>
          </button>
        </div>
      </div>
    </div>
  );
};