import { supabase } from '../lib/supabase';
import { GameImage, BoundingBox } from '../types';

interface AnnotationData {
  imageId: string;
  imageUrl: string;
  hasObject: boolean;
  boundingBox: BoundingBox | null;
  actualLabel: boolean;
}

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

  async recordAnnotation(annotationData: AnnotationData): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active training session');
    }

    const { error } = await supabase
      .from('annotations')
      .insert({
        session_id: this.sessionId,
        image_url: annotationData.imageUrl,
        image_id: annotationData.imageId,
        has_object: annotationData.hasObject,
        bounding_box: annotationData.boundingBox,
        actual_label: annotationData.actualLabel
      });

    if (error) throw error;
  }

  async getAnnotationCount(): Promise<number> {
    if (!this.sessionId) return 0;

    const { count, error } = await supabase
      .from('annotations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', this.sessionId);

    if (error) throw error;
    return count || 0;
  }

  async trainModel(images: GameImage[]): Promise<{
    jobId: string;
    accuracy: number;
    modelState: 'underfitting' | 'correct' | 'overfitting';
  }> {
    if (!this.sessionId) {
      throw new Error('No active training session');
    }

    console.log('🚀 Starting model training...');
    console.log('Session ID:', this.sessionId);
    console.log('Annotations count:', annotations.length);

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

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/train-model`;
    console.log('📡 Calling edge function:', edgeFunctionUrl);

    // Call training edge function
    const response = await fetch(
      edgeFunctionUrl,
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

    console.log('📊 Edge function response status:', response.status);
    console.log('📊 Edge function response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Edge function error:', error);
      throw new Error(error.details || 'Training failed');
    }

    const result = await response.json();
    console.log('✅ Training completed:', result);
    
    return {
      jobId: result.jobId,
      accuracy: result.accuracy,
      modelState: result.modelState
    };
  }

  async getPredictions(jobId: string, testImages: GameImage[]): Promise<GameImage[]> {
    console.log('🔮 Getting predictions for job:', jobId);
    console.log('🔮 Test images count:', testImages.length);
    
    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-predictions`;
    console.log('📡 Calling predictions endpoint:', edgeFunctionUrl);

    const response = await fetch(
      edgeFunctionUrl,
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

    console.log('📊 Predictions response status:', response.status);
    console.log('📊 Predictions response ok:', response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Predictions error:', error);
      throw new Error(error.details || 'Prediction failed');
    }

    const result = await response.json();
    console.log('✅ Predictions received:', result);
    
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