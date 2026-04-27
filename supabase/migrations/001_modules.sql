-- Create modules table
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  colour text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: users can only access their own modules
CREATE POLICY "users own modules" ON modules
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_modules_user_id ON modules(user_id);
