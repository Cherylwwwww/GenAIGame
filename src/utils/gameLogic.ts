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

export const generateRandomImages = (urls: string[], count: number = 20): GameImage[] => {
  const shuffled = [...urls].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);
  
  return selected.map((url, index) => ({
    id: `image-${Date.now()}-${index}`,
    url,
    actualLabel: index < count / 2, // First half are positive examples
  }));
};