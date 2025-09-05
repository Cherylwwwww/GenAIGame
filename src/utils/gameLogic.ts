import { GameImage, GameState } from '../types';
import { categories } from './gameData';

export const simulateModelPrediction = (images: GameImage[], modelAccuracy: number): GameImage[] => {
  return images.map(image => {
    // Simulate model prediction based on current accuracy
    const random = Math.random();
    const shouldBeCorrect = random < (modelAccuracy / 100);
    
    const prediction = shouldBeCorrect ? image.actualLabel : !image.actualLabel;
    const confidence = shouldBeCorrect 
      ? 0.7 + Math.random() * 0.3  // High confidence for correct predictions
      : 0.4 + Math.random() * 0.3; // Lower confidence for incorrect predictions
    
    return {
      ...image,
      modelPrediction: prediction,
      confidence
    };
  });
};

export const calculateAccuracy = (images: GameImage[]): number => {
  const annotatedImages = images.filter(img => img.userAnnotation !== undefined);
  if (annotatedImages.length === 0) return 30; // Base accuracy without training
  
  const correctAnnotations = annotatedImages.filter(
    img => (img.userAnnotation !== null) === img.actualLabel
  ).length;
  
  const userAccuracy = (correctAnnotations / annotatedImages.length) * 100;
  
  // Model accuracy improves based on quantity and quality of annotations
  const quantityBonus = Math.min(annotatedImages.length * 2, 40); // Up to 40% bonus for quantity
  const qualityMultiplier = userAccuracy / 100;
  
  const modelAccuracy = Math.min(30 + (quantityBonus * qualityMultiplier), 95);
  
  return Math.round(modelAccuracy);
};

export const determineModelState = (annotatedCount: number, accuracy: number) => {
  // 5 images is the optimal point
  if (annotatedCount < 5) return 'underfitting';
  if (annotatedCount > 5) return 'overfitting';
  // Exactly 5 images is correct
  return 'correct';
};

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