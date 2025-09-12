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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📷</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const handleAnnotation = (box: BoundingBox | null) => {
    onAnnotate(currentImage.id, box);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🎯 Image Annotation
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Draw boxes around {currentCategory} or mark as "not found"
        </p>
      </div>

      <div className="p-6">
      <BoundingBoxAnnotator
        imageUrl={currentImage.url}
        onAnnotate={handleAnnotation}
        existingBox={currentImage.userAnnotation}
        disabled={disabled}
        currentCategory={currentCategory}
        onNextImage={onNextImage}
      />
      
      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6 bg-gray-50 rounded-lg p-4">
        <button
          onClick={onPrevImage}
          disabled={currentImageIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentImageIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
        
        <div className="text-center px-4">
          <div className="text-lg font-bold text-gray-800 mb-1">
            {currentImageIndex + 1} / {totalImages}
          </div>
          <div className="text-xs text-gray-500">
            Image Navigation
          </div>
        </div>
        
        <button
          onClick={onNextImage}
          disabled={currentImageIndex === totalImages - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentImageIndex === totalImages - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md'
          }`}
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            Annotation Progress
          </span>
          <span className="text-sm text-gray-600">
            {annotatedCount} / {totalImages} completed
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((annotatedCount / totalImages) * 100, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Start</span>
            <span>{Math.round((annotatedCount / totalImages) * 100)}% Complete</span>
            <span>Finish</span>
          </div>
        </div>
        
        {annotatedCount > 0 && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Great progress! Keep going
            </span>
          </div>
        )}
      </div>
        </div>
    </div>
  );
};