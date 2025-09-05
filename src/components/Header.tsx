import React from 'react';
import { Brain, Trophy } from 'lucide-react';

interface HeaderProps {
  currentLevel: number;
  currentCategory: string;
  score: number;
  modelAccuracy: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  currentCategory,
  score,
  modelAccuracy
}) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8" />
            <h1 className="text-2xl font-bold">AI Annotation Training Game</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm opacity-90">Level</div>
              <div className="text-xl font-bold">{currentLevel}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm opacity-90">Current Task</div>
              <div className="text-lg font-semibold">Identify {currentCategory}</div>
            </div>
            
            <div className="text-center">
              <div className="text-sm opacity-90">Model Accuracy</div>
              <div className="text-xl font-bold text-green-300">{modelAccuracy}%</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span className="text-lg font-bold">{score}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-white/20 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(modelAccuracy, 100)}%` }}
          />
        </div>
      </div>
    </header>
  );
};