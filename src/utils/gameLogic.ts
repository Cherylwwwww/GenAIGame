import { GameImage, GameState } from '../types';
import { categories } from './gameData';

export const generateTestImages = (testUrls: string[]): GameImage[] => {
  return testUrls.map((url, index) => ({
    id: `test-${Date.now()}-${index}`,
    url,
    // First half are positive examples (contain target object)
    actualLabel: index < testUrls.length / 2
  }));
};

export const generateRandomImages = (urls: string[], count?: number): GameImage[] => {
  // Use all available images if count not specified
  const imageCount = count || urls.length;
  const shuffled = [...urls].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(imageCount, urls.length));
  
  return selected.map((url, index) => ({
    id: `image-${Date.now()}-${index}`,
    url,
    actualLabel: index < selected.length / 2, // First half are positive examples
  }));
};

export const simulateModelPrediction = () => {
  // Simulation function for model predictions
};