/*
  # AI Training Game Database Schema

  1. New Tables
    - `training_sessions` - Track each training session
    - `annotations` - Store user annotations with bounding boxes
    - `model_predictions` - Store model prediction results
    - `training_jobs` - Track background training jobs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Training sessions table
CREATE TABLE IF NOT EXISTS training_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  category text NOT NULL,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Annotations table
CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES training_sessions(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_id text NOT NULL,
  has_object boolean,
  bounding_box jsonb, -- {x, y, width, height}
  actual_label boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Training jobs table
CREATE TABLE IF NOT EXISTS training_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES training_sessions(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'training', 'completed', 'failed')),
  accuracy real,
  model_state text CHECK (model_state IN ('underfitting', 'correct', 'overfitting')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Model predictions table
CREATE TABLE IF NOT EXISTS model_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES training_jobs(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_id text NOT NULL,
  predicted_label boolean NOT NULL,
  confidence real NOT NULL,
  actual_label boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own training sessions"
  ON training_sessions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own annotations"
  ON annotations
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM training_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own training jobs"
  ON training_jobs
  FOR ALL
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM training_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own model predictions"
  ON model_predictions
  FOR ALL
  TO authenticated
  USING (
    job_id IN (
      SELECT tj.id FROM training_jobs tj
      JOIN training_sessions ts ON tj.session_id = ts.id
      WHERE ts.user_id = auth.uid()
    )
  );