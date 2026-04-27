-- PolyBee Database Setup Script
-- Run this in your Supabase SQL Editor to create all tables

-- ============================================
-- 1. MODULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS modules (
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

-- Create RLS policy: users can only access their own modules
DROP POLICY IF EXISTS "users own modules" ON modules;
CREATE POLICY "users own modules" ON modules
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000001'); -- Temporary: allow mock user

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_modules_user_id ON modules(user_id);

-- ============================================
-- 2. NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notes (
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

-- Create RLS policy: users can only access their own notes
DROP POLICY IF EXISTS "users own notes" ON notes;
CREATE POLICY "users own notes" ON notes
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000001'); -- Temporary: allow mock user

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_module_id ON notes(module_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. MODULE_FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS module_files (
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

-- Create RLS policy: users can only access their own files
DROP POLICY IF EXISTS "users own module_files" ON module_files;
CREATE POLICY "users own module_files" ON module_files
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000001'); -- Temporary: allow mock user

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_module_files_user_id ON module_files(user_id);
CREATE INDEX IF NOT EXISTS idx_module_files_module_id ON module_files(module_id);

-- ============================================
-- 4. CALENDAR_EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('ca', 'submission', 'quiz', 'exam', 'other')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: users can only access their own events
DROP POLICY IF EXISTS "users own calendar_events" ON calendar_events;
CREATE POLICY "users own calendar_events" ON calendar_events
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000001'); -- Temporary: allow mock user

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_module_id ON calendar_events(module_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify tables were created successfully:

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('modules', 'notes', 'module_files', 'calendar_events');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('modules', 'notes', 'module_files', 'calendar_events');

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
