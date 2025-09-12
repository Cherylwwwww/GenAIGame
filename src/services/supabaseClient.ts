import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AnnotationData {
  id?: string
  image_url: string
  category: string
  has_object: boolean
  bounding_box?: {
    x: number
    y: number
    width: number
    height: number
  }
  created_at?: string
}

export interface ModelTrainingJob {
  id?: string
  category: string
  status: 'pending' | 'training' | 'completed' | 'failed'
  accuracy?: number
  model_state?: 'underfitting' | 'correct' | 'overfitting'
  created_at?: string
  completed_at?: string
}