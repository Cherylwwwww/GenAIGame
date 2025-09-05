export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameImage {
  id: string;
  url: string;
  actualLabel: boolean; // true if contains target object
  userAnnotation?: BoundingBox | null; // null means "no object", undefined means not annotated
  modelPrediction?: boolean;
  confidence?: number;
}

export interface GameState {
  currentLevel: number;
  currentCategory: string;
  images: GameImage[];
  modelAccuracy: number;
  annotatedCount: number;
  isTraining: boolean;
  hasTrainedModel: boolean;
  score: number;
  modelState: 'underfitting' | 'correct' | 'overfitting';
}

export interface Category {
  name: string;
  targetObject: string;
  description: string;
  images: string[];
  testImages: string[];
}