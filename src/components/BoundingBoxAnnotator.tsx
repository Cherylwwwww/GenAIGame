import React, { useState, useRef, useCallback } from 'react';
import { BoundingBox } from '../types';

interface BoundingBoxAnnotatorProps {
  imageUrl: string;
  onAnnotate: (box: BoundingBox | null) => void;
  existingBox?: BoundingBox | null;
  disabled?: boolean;
  currentCategory: string;
  onNextImage?: () => void;
  isRecording?: boolean;
}

export const BoundingBoxAnnotator: React.FC<BoundingBoxAnnotatorProps> = ({
  imageUrl,
  onAnnotate,
  existingBox,
  disabled = false,
  currentCategory,
  onNextImage,
  isRecording = false
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
    // Auto-advance to next image after marking "No Wally"
    if (onNextImage) {
      setTimeout(() => onNextImage(), 500);
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
          Click & drag to find Wally
        </div>
      </div>
      
      {/* Instructions and Controls */}
      <div className="text-center mt-6">
        {/* Show current annotation status */}
        {existingBox !== undefined && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              {existingBox === null ? (
                <>✓ Marked as "No Wally" - Use Previous button to change</>
              ) : (
                <>✓ Wally found and marked - Use Previous button to change</>
              )}
            </p>
          </div>
        )}
        
        <button
          onClick={handleClearAnnotation}
          disabled={disabled || isRecording}
          className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            disabled || isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : existingBox === null
                ? 'bg-gray-400 text-white cursor-default'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105 active:scale-95'
          }`}
          title={`Mark this image as having no Wally`}
        >
          <div className="flex items-center gap-2">
            {isRecording ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Recording...</span>
              </>
            ) : existingBox === null ? (
              <>
                <span className="text-xl">✓</span>
                <span>Already marked "No Wally"</span>
              </>
            ) : (
              <>
                <span className="text-xl">🚫</span>
                <span>No Wally Here</span>
              </>
            )}
          </div>
        </button>
        
        {/* Navigation hint */}
        <div className="mt-4 text-sm text-gray-600">
          <p>💡 Tip: Use "Previous" button to go back and change your decision</p>
        </div>
      </div>
    </div>
  );
};