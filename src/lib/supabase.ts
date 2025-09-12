import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface TrainingSession {
  id: string;
  user_id: string;
  category: string;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface Annotation {
  id: string;
  session_id: string;
  image_url: string;
  image_id: string;
  has_object: boolean;
  bounding_box: any;
  actual_label: boolean;
  created_at: string;
}

export interface TrainingJob {
  id: string;
  session_id: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  accuracy: number;
  model_state: 'underfitting' | 'correct' | 'overfitting';
  error_message?: string;
  created_at: string;
  completed_at?: string;
}