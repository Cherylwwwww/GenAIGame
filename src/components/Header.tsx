import React from 'react';
import { Brain, Trophy, User } from 'lucide-react';

interface HeaderProps {
  currentLevel: number;
  currentCategory: string;
  score: number;
  modelAccuracy: number;
  playerName: string;
  isUsingRealTraining: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentLevel,
  currentCategory,
  score,
  modelAccuracy,
  playerName,
  isUsingRealTraining
}) => {
  return (
    <header className="bg-white shadow-lg border-b-4 border-blue-500">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Where's Wally - AI Training</h1>
              <p className="text-sm text-gray-600">Level {currentLevel}</p>
            </div>
          </div>
          
          {/* Center - Current Task */}
          <div className="text-center">
            <div className="bg-blue-50 px-6 py-3 rounded-2xl border-2 border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800">
                Find {currentCategory}! 🔍
              </h2>
              {isUsingRealTraining && (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1 inline-block">
                  🤖 Real AI Training
                </span>
              )}
            </div>
          </div>
          
          {/* Right - Player Info */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">🔴⚪</div>
              <div className="text-xs text-gray-600">Wally Hunter</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};