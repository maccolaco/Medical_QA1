/*
  # Create Claims Table

  1. New Tables
    - `claims`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `filename` (text)
      - `status` (text) - uploaded, processing, processed, error
      - `queue` (text) - critical_errors, warnings, approved
      - `payer` (text)
      - `patient_name` (text)
      - `patient_id` (text)
      - `cpt_codes` (text array)
      - `modifiers` (text array)
      - `charges` (numeric array)
      - `service_dates` (text array)
      - `provider_name` (text)
      - `provider_npi` (text)
      - `diagnosis_codes` (text array)
      - `raw_text` (text)
      - `validation_errors` (jsonb)
      - `assigned_to` (uuid, nullable, foreign key to profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `claims` table
    - Add policy for users to read their own claims
    - Add policy for users to create their own claims
    - Add policy for users to update their own claims
    - Add policy for users to delete their own claims
*/

CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded',
  queue text,
  payer text,
  patient_name text,
  patient_id text,
  cpt_codes text[] DEFAULT '{}',
  modifiers text[] DEFAULT '{}',
  charges numeric[] DEFAULT '{}',
  service_dates text[] DEFAULT '{}',
  provider_name text,
  provider_npi text,
  diagnosis_codes text[] DEFAULT '{}',
  raw_text text,
  validation_errors jsonb DEFAULT '[]',
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own claims"
  ON claims FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own claims"
  ON claims FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS claims_user_id_idx ON claims(user_id);
CREATE INDEX IF NOT EXISTS claims_queue_idx ON claims(queue);
CREATE INDEX IF NOT EXISTS claims_status_idx ON claims(status);
CREATE INDEX IF NOT EXISTS claims_created_at_idx ON claims(created_at DESC);
