import React from 'react';
import { GameImage } from '../types';
import { Brain, Zap, Target } from 'lucide-react';

interface ModelPanelProps {
  images: GameImage[];
  modelAccuracy: number;
  isTraining: boolean;
  hasTrainedModel: boolean;
  onTrainModel: () => void;
  canTrain: boolean;
  modelState: 'underfitting' | 'correct' | 'overfitting';
  currentCategory: string;
  annotatedCount: number;
}

export const ModelPanel: React.FC<ModelPanelProps> = ({
  // Remove all the complex model panel content since it's now integrated into the main layout
}) => {
  // This component is now simplified since the functionality moved to GameContainer
  return null;
};