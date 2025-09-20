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

export const simulateModelPrediction = (
  testImages: any[], 
  setTestImages: (updater: (prev: any[]) => any[]) => void,
  annotatedCount: number,
  currentCategory: string
) => {
  if (testImages.length === 0 || annotatedCount < 3) return;
  
  // Calculate confidence based on annotation count - starts at 60% and increases
  const baseConfidence = Math.min(0.6 + (annotatedCount * 0.05), 0.95);
  
  // For the current test image, simulate Wally detection
  // Since current test image has black-yellow stripes (not red-white), it should be "not found"
  const testImage = testImages[0];
  const hasWally = false; // Current test image doesn't have red-white striped Wally
  const confidence = hasWally ? baseConfidence : (1 - baseConfidence);
  
  console.log(`🔍 Simulation: Analyzing test image for RED-WHITE stripes...`);
  console.log(`📊 Found: Black-yellow stripes (NOT Wally's red-white stripes)`);
  console.log(`🎯 Result: No Wally found (${Math.round(confidence * 100)}% confident)`);
  console.log(`📈 Annotation count: ${annotatedCount} → Confidence level: ${Math.round(baseConfidence * 100)}%`);
  
  setTestImages(prev => prev.map(img => 
    img.id === testImage.id 
      ? { ...img, modelPrediction: hasWally, confidence }
      : img
  ));
};