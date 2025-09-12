import { supabase } from '../lib/supabase';
import { GameImage, BoundingBox } from '../types';

export class TrainingService {
  private sessionId: string | null = null;

  async createSession(category: string, level: number = 1): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create training session');
    }

    const { data, error } = await supabase
      .from('training_sessions')
      .insert({
        user_id: user.id,
        category,
        level
      })
      .select()
      .single();

    if (error) throw error;
    
    this.sessionId = data.id;
    return data.id;
  }

  async trainModel(images: GameImage[]): Promise<{
    jobId: string;
    accuracy: number;
    modelState: 'underfitting' | 'correct' | 'overfitting';
  }> {
    if (!this.sessionId) {
      throw new Error('No active training session');
    }

    // Prepare annotations data
    const annotations = images
      .filter(img => img.userAnnotation !== undefined)
      .map(img => ({
        imageId: img.id,
        imageUrl: img.url,
        hasObject: img.userAnnotation !== null,
        boundingBox: img.userAnnotation,
        actualLabel: img.actualLabel
      }));

    if (annotations.length === 0) {
      throw new Error('Please annotate at least 1 image before training');
    }

    // Call training edge function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/train-model`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          annotations
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Training failed');
    }

    const result = await response.json();
    return {
      jobId: result.jobId,
      accuracy: result.accuracy,
      modelState: result.modelState
    };
  }

  async getPredictions(jobId: string, testImages: GameImage[]): Promise<GameImage[]> {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-predictions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          testImages: testImages.map(img => ({
            id: img.id,
            url: img.url,
            actualLabel: img.actualLabel
          }))
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Prediction failed');
    }

    const result = await response.json();
    
    // Update test images with predictions
    return testImages.map(img => {
      const prediction = result.predictions.find((p: any) => p.imageId === img.id);
      return {
        ...img,
        modelPrediction: prediction?.prediction,
        confidence: prediction?.confidence
      };
    });
  }

  async getTrainingHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('training_jobs')
      .select(`
        *,
        training_sessions (category, level)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export const trainingService = new TrainingService();