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
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full h-80 border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair bg-gray-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
      >
        <img
          src={imageUrl}
          alt="Annotation target"
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {displayBox && (
          <div
            className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20"
            style={{
              left: `${displayBox.x}%`,
              top: `${displayBox.y}%`,
              width: `${displayBox.width}%`,
              height: `${displayBox.height}%`
            }}
          />
        )}
      </div>
      
      <div className="flex space-x-3">
  );
};
  )
}