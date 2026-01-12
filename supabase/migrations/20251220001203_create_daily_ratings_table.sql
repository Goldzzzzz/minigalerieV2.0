/*
  # Create daily_ratings table for calendar feature

  1. New Tables
    - `daily_ratings`
      - `id` (uuid, primary key) - Unique identifier for each rating
      - `user_id` (uuid) - Reference to the user who owns this rating
      - `rating_date` (date, unique per user) - The date being rated
      - `rating_value` (integer) - Rating value (1-5 stars/points)
      - `notes` (text, optional) - Optional notes from parent about the day
      - `created_at` (timestamptz) - When the rating was created
      - `updated_at` (timestamptz) - When the rating was last modified

  2. Security
    - Enable RLS on `daily_ratings` table
    - Add policy for authenticated users to read their own ratings
    - Add policy for authenticated users to insert their own ratings
    - Add policy for authenticated users to update their own ratings
    - Add policy for authenticated users to delete their own ratings

  3. Important Notes
    - Each user can have only one rating per date (enforced by unique constraint)
    - Rating values should be between 1 and 5
    - Ratings can be modified at any time by the parent
*/

-- Create daily_ratings table
CREATE TABLE IF NOT EXISTS daily_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating_date date NOT NULL,
  rating_value integer NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, rating_date)
);

-- Enable RLS
ALTER TABLE daily_ratings ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_ratings_user_date ON daily_ratings(user_id, rating_date DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_ratings_updated_at'
  ) THEN
    CREATE TRIGGER update_daily_ratings_updated_at
      BEFORE UPDATE ON daily_ratings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS Policies
CREATE POLICY "Users can view own daily ratings"
  ON daily_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily ratings"
  ON daily_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily ratings"
  ON daily_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily ratings"
  ON daily_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);