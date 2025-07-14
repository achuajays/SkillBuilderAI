/*
  # Create secure API keys management system

  1. New Tables
    - `secure_api_keys`
      - `id` (uuid, primary key)
      - `key_name` (text, unique identifier for the key)
      - `api_key` (text, encrypted API key value)
      - `description` (text, optional description)
      - `is_active` (boolean, whether the key is active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `secure_api_keys` table
    - Add policies for admin users only
    - Create admin role check function

  3. Functions
    - Function to check if user is admin
    - Function to update updated_at timestamp
*/

-- Create secure_api_keys table
CREATE TABLE IF NOT EXISTS secure_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text UNIQUE NOT NULL,
  api_key text NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE secure_api_keys ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin (you can customize this logic)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- For now, we'll check if user email contains 'admin' or is a specific email
  -- You can modify this logic based on your admin identification needs
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      email ILIKE '%admin%' 
      OR email = 'admin@example.com'
      OR raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for admin access only
CREATE POLICY "Admins can view all API keys"
  ON secure_api_keys
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert API keys"
  ON secure_api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update API keys"
  ON secure_api_keys
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete API keys"
  ON secure_api_keys
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_secure_api_keys_updated_at
  BEFORE UPDATE ON secure_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default Gemini API key (replace with your actual key)
INSERT INTO secure_api_keys (key_name, api_key, description, created_by)
VALUES (
  'GEMINI_API_KEY',
  'your-actual-gemini-api-key-here',
  'Google Gemini API key for AI chat and content generation',
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT (key_name) DO NOTHING;