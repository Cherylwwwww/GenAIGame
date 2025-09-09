import React from 'react';
import { BoundingBoxAnnotator } from './BoundingBoxAnnotator';
import { GameImage, BoundingBox } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AnnotationPanelProps {
  images: GameImage[];
  onAnnotate: (imageId: string, annotation: BoundingBox | null) => void;
  currentCategory: string;
  annotatedCount: number;
  disabled?: boolean;
  currentImageIndex: number;
  onNextImage: () => void;
  onPrevImage: () => void;
}

export const AnnotationPanel: React.FC<AnnotationPanelProps> = ({
  images,
  onAnnotate,
  currentCategory,
  annotatedCount,
  disabled = false,
  currentImageIndex,
  onNextImage,
  onPrevImage
}) => {
  const currentImage = images[currentImageIndex];
  const totalImages = images.length;

  if (!currentImage) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-300 p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">No images available</div>
      </div>
    );
  }

  const handleAnnotation = (box: BoundingBox | null) => {
    onAnnotate(currentImage.id, box);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
      <div className="mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 mb-4">
          <span className="text-blue-800 font-medium">Task: {currentCategory}</span>
        </div>
      <BoundingBoxAnnotator
        imageUrl={currentImage.url}
        onAnnotate={handleAnnotation}
        existingBox={currentImage.userAnnotation}
        disabled={disabled}
        currentCategory={currentCategory}
        onNextImage={onNextImage}
      />
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onPrevImage}
          disabled={currentImageIndex === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            currentImageIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>←</span>
        </button>
        
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800">
            {currentImageIndex + 1} / {totalImages}
          </div>
        </div>
        
        <button
          onClick={onNextImage}
          disabled={currentImageIndex === totalImages - 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            currentImageIndex === totalImages - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>→</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          <p className="mb-2">Progress: {annotatedCount} images annotated</p>
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((annotatedCount / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};