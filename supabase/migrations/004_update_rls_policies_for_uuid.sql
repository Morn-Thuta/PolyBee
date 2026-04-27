-- Update RLS policies to use UUID format mock user
-- This migration updates all RLS policies to use the new UUID format mock user ID

-- Update modules table RLS policy
DROP POLICY IF EXISTS "users own modules" ON modules;
CREATE POLICY "users own modules" ON modules
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000001'); -- Updated to UUID format

-- Update notes table RLS policy
DROP POLICY IF EXISTS "users own notes" ON notes;
CREATE POLICY "users own notes" ON notes
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000001'); -- Updated to UUID format

-- Update module_files table RLS policy
DROP POLICY IF EXISTS "users own module_files" ON module_files;
CREATE POLICY "users own module_files" ON module_files
  FOR ALL
  USING (user_id = '00000000-0000-0000-0000-000000000001'); -- Updated to UUID format
