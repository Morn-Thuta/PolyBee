-- Fix user_id type to support mock user (text instead of uuid)
-- This migration drops and recreates tables with correct types

-- Drop existing tables (cascade will handle foreign keys)
DROP TABLE IF EXISTS module_files CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS modules CASCADE;

-- Recreate modules table with text user_id
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  colour text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for mock user
CREATE POLICY "users own modules" ON modules
  FOR ALL
  USING (user_id = 'test-user-123');

-- Create index
CREATE INDEX idx_modules_user_id ON modules(user_id);

-- Recreate notes table with text user_id
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  style text NOT NULL CHECK (style IN ('notion-friendly', 'deep-dive', 'quick-summary', 'custom')),
  source_file_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for mock user
CREATE POLICY "users own notes" ON notes
  FOR ALL
  USING (user_id = 'test-user-123');

-- Create indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_module_id ON notes(module_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Recreate module_files table with text user_id
CREATE TABLE module_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE module_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for mock user
CREATE POLICY "users own module_files" ON module_files
  FOR ALL
  USING (user_id = 'test-user-123');

-- Create indexes
CREATE INDEX idx_module_files_user_id ON module_files(user_id);
CREATE INDEX idx_module_files_module_id ON module_files(module_id);
