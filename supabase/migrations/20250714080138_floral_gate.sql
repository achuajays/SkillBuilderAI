/*
  # Create learning_plans table

  1. New Tables
    - `learning_plans`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `plan` (jsonb, stores the learning plan data)
      - `created_at` (timestamp, default now())
      - `updated_at` (timestamp, default now())

  2. Security
    - Enable RLS on `learning_plans` table
    - Add policies for authenticated users to manage their own learning plans
    - Users can SELECT, INSERT, UPDATE, DELETE their own plans
*/

-- Create the learning_plans table
CREATE TABLE IF NOT EXISTS learning_plans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to manage their own learning plans
CREATE POLICY "Users can view own learning plans"
  ON learning_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning plans"
  ON learning_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning plans"
  ON learning_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own learning plans"
  ON learning_plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_learning_plans_updated_at
  BEFORE UPDATE ON learning_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();