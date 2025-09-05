import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface EducationalTooltipProps {
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const EducationalTooltip: React.FC<EducationalTooltipProps> = ({
  title,
  content,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 ${
          position === 'top' ? 'bottom-full mb-2' :
          position === 'bottom' ? 'top-full mt-2' :
          position === 'left' ? 'right-full mr-2' :
          'left-full ml-2'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
};