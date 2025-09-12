import { supabase, AnnotationData, ModelTrainingJob } from './supabaseClient'
import { GameImage } from '../types'

export class ModelTrainingService {
  // Save annotation data to database
  static async saveAnnotation(annotation: AnnotationData): Promise<void> {
    const { error } = await supabase
      .from('annotations')
      .insert([annotation])
    
    if (error) {
      console.error('Error saving annotation:', error)
      throw error
    }
  }

  // Get all annotations for a category
  static async getAnnotations(category: string): Promise<AnnotationData[]> {
    const { data, error } = await supabase
      .from('annotations')
      .select('*')
      .eq('category', category)
    
    if (error) {
      console.error('Error fetching annotations:', error)
      throw error
    }
    
    return data || []
  }

  // Start model training
  static async startTraining(category: string, annotations: AnnotationData[]): Promise<string> {
    // Create training job record
    const { data: job, error: jobError } = await supabase
      .from('training_jobs')
      .insert([{
        category,
        status: 'pending'
      }])
      .select()
      .single()
    
    if (jobError) {
      console.error('Error creating training job:', jobError)
      throw jobError
    }

    // Call edge function to start training
    const { data, error } = await supabase.functions.invoke('train-model', {
      body: {
        jobId: job.id,
        category,
        annotations
      }
    })

    if (error) {
      console.error('Error starting training:', error)
      throw error
    }

    return job.id
  }

  // Check training status
  static async getTrainingStatus(jobId: string): Promise<ModelTrainingJob | null> {
    const { data, error } = await supabase
      .from('training_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (error) {
      console.error('Error fetching training status:', error)
      return null
    }
    
    return data
  }

  // Get model predictions for test images
  static async getPredictions(category: string, imageUrls: string[]): Promise<any[]> {
    const { data, error } = await supabase.functions.invoke('get-predictions', {
      body: {
        category,
        imageUrls
      }
    })

    if (error) {
      console.error('Error getting predictions:', error)
      throw error
    }

    return data.predictions || []
  }

  // Simulate training locally (fallback when no backend)
  static simulateTraining(annotations: GameImage[]): Promise<{
    accuracy: number
    modelState: 'underfitting' | 'correct' | 'overfitting'
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const annotatedCount = annotations.filter(img => img.userAnnotation !== undefined).length
        const correctAnnotations = annotations.filter(
          img => img.userAnnotation !== undefined && 
                 (img.userAnnotation !== null) === img.actualLabel
        ).length
        
        const userAccuracy = annotatedCount > 0 ? (correctAnnotations / annotatedCount) * 100 : 0
        const quantityBonus = Math.min(annotatedCount * 2, 40)
        const qualityMultiplier = userAccuracy / 100
        const modelAccuracy = Math.min(30 + (quantityBonus * qualityMultiplier), 95)
        
        let modelState: 'underfitting' | 'correct' | 'overfitting'
        if (annotatedCount < 5) modelState = 'underfitting'
        else if (annotatedCount > 15 && modelAccuracy < 70) modelState = 'overfitting'
        else if (modelAccuracy >= 70 && modelAccuracy <= 90) modelState = 'correct'
        else if (modelAccuracy < 60) modelState = 'underfitting'
        else modelState = 'overfitting'
        
        resolve({
          accuracy: Math.round(modelAccuracy),
          modelState
        })
      }, 2000)
    })
  }
}