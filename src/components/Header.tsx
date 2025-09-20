import React from 'react';
import { Trophy, User } from 'lucide-react';
import wallyLogo from '../assets/Wally-Website-Character-Roundel-Links.png';

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
    <header className="bg-gradient-to-r from-red-500 via-white to-blue-500 shadow-lg border-b-4 border-yellow-400">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src={wallyLogo} 
              alt="Wally Logo" 
              className="w-16 h-16 rounded-xl shadow-lg"
            />
            <div>
              <h1 className="text-4xl font-black tracking-wider transform -skew-x-3 drop-shadow-lg">
                <span className="text-blue-600">WHERE'S</span>{' '}
                <span className="text-red-600">WALLY</span>
              </h1>
              <p className="text-sm text-gray-600">Level {currentLevel}</p>
            </div>
          </div>
          
          {/* Center - Current Task */}
          <div className="text-center">
            <div className="bg-white px-6 py-3 rounded-2xl border-4 border-red-500 shadow-lg">
              <h2 className="text-2xl font-bold text-red-700 drop-shadow-md">
                Find Wally's RED-WHITE Stripes! 🔍
              </h2>
              {isUsingRealTraining && (
                <span className="text-sm bg-yellow-200 text-blue-800 px-3 py-1 rounded-full mt-1 inline-block border-2 border-blue-400 font-bold">
                  🤖 Real AI Training
                </span>
              )}
              <p className="text-xs text-blue-700 mt-1 font-semibold bg-yellow-100 px-2 py-1 rounded-full inline-block">
                Look for: RED-WHITE horizontal striped shirt, bobble hat, round glasses
              </p>
            </div>
          </div>
          
          {/* Right - Player Info */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold bg-white px-3 py-2 rounded-full border-3 border-red-500 shadow-md">🔴⚪</div>
              <div className="text-xs text-red-700 font-bold mt-1 bg-yellow-100 px-2 py-1 rounded-full">Wally Hunter</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};