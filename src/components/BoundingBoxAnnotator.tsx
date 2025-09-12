import React, { useState, useRef, useCallback } from 'react';
import { BoundingBox } from '../types';

interface BoundingBoxAnnotatorProps {
  imageUrl: string;
  onAnnotate: (box: BoundingBox | null) => void;
  existingBox?: BoundingBox | null;
  disabled?: boolean;
  currentCategory: string;
  onNextImage?: () => void;
}

export const BoundingBoxAnnotator: React.FC<BoundingBoxAnnotatorProps> = ({
  imageUrl,
  onAnnotate,
  existingBox,
  disabled = false,
  currentCategory,
  onNextImage
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update currentBox when existingBox changes (new image)
  React.useEffect(() => {
    setCurrentBox(existingBox || null);
  }, [existingBox]);

  const getRelativeCoordinates = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    
    const point = getRelativeCoordinates(e);
    setStartPoint(point);
    setIsDrawing(true);
    setCurrentBox(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || disabled) return;
    
    const currentPoint = getRelativeCoordinates(e);
    const box: BoundingBox = {
      x: Math.min(startPoint.x, currentPoint.x),
      y: Math.min(startPoint.y, currentPoint.y),
      width: Math.abs(currentPoint.x - startPoint.x),
      height: Math.abs(currentPoint.y - startPoint.y)
    };
    
    setCurrentBox(box);
  };

  const handleMouseUp = () => {
    if (!isDrawing || disabled) return;
    
    setIsDrawing(false);
    if (currentBox && currentBox.width > 2 && currentBox.height > 2) {
      onAnnotate(currentBox);
      // Automatically advance to next image after drawing a box
      if (onNextImage) {
        setTimeout(() => onNextImage(), 500); // Small delay for visual feedback
      }
    }
  };

  const handleClearAnnotation = () => {
    if (disabled) return;
    setCurrentBox(null);
    onAnnotate(null);
    // Automatically advance to next image after marking "no object"
    if (onNextImage) {
      setTimeout(() => onNextImage(), 300); // Small delay for visual feedback
    }
  };

  const displayBox = currentBox || existingBox;

  return (
    <div className="space-y-5">
      <div
        ref={containerRef}
        className="relative w-full h-80 border-2 border-gray-200 rounded-xl overflow-hidden cursor-crosshair bg-gray-50 hover:border-blue-300 transition-colors duration-200"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
      >
        <img
          src={imageUrl}
          alt="Annotation target"
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
        
        {displayBox && (
          <div
            className="absolute border-3 border-red-400 bg-red-400 bg-opacity-25 shadow-lg"
            style={{
              left: `${displayBox.x}%`,
              top: `${displayBox.y}%`,
              width: `${displayBox.width}%`,
              height: `${displayBox.height}%`
            }}
          >
            <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
              {currentCategory}
            </div>
          </div>
        )}
        
        {/* Crosshair cursor indicator */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Click & drag to draw box
        </div>
      </div>
      
      {/* Instructions and Controls */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-blue-800 font-medium">
            <span className="text-lg">🎯</span>
            <span>How to annotate:</span>
          </div>
          
          <p className="text-sm text-blue-700 leading-relaxed">
            <strong>Found {currentCategory}?</strong> Click and drag to draw a box around it.<br/>
            <strong>No {currentCategory} visible?</strong> Click the button below.
          </p>
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={handleClearAnnotation}
          disabled={disabled}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>No {currentCategory} Found</span>
          </div>
        </button>
      </div>
      
      {/* Quick Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Tip: Draw tight boxes around the object for better accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>Auto-advance: Annotation automatically moves to next image</span>
          </div>
      </div>
    </div>
  );
};