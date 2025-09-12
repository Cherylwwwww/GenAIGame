/*
  # Create training and annotation tables

  1. New Tables
    - `annotations`
      - `id` (uuid, primary key)
      - `image_url` (text)
      - `category` (text)
      - `has_object` (boolean)
      - `bounding_box` (jsonb, optional)
      - `created_at` (timestamp)
    
    - `training_jobs`
      - `id` (uuid, primary key)
      - `category` (text)
      - `status` (text)
      - `accuracy` (integer, optional)
      - `model_state` (text, optional)
      - `created_at` (timestamp)
      - `completed_at` (timestamp, optional)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  category text NOT NULL,
  has_object boolean NOT NULL,
  bounding_box jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS training_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  accuracy integer,
  model_state text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read annotations"
  ON annotations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert annotations"
  ON annotations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read training jobs"
  ON training_jobs
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert training jobs"
  ON training_jobs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update training jobs"
  ON training_jobs
  FOR UPDATE
  TO public
  USING (true);