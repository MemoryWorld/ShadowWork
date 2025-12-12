-- ShadowWork Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  recording_url TEXT NOT NULL,
  difficulty INTEGER NOT NULL,
  category TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- Create storage bucket for recordings
-- Note: Run this in Supabase Storage UI or via API
-- Bucket name: recordings
-- Public: true (or use signed URLs for private access)

-- Enable Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to insert their own submissions
CREATE POLICY "Users can insert their own submissions"
ON submissions
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- RLS Policy: Allow users to view their own submissions
CREATE POLICY "Users can view their own submissions"
ON submissions
FOR SELECT
USING (auth.uid()::text = user_id);

-- For MVP: If not using auth, you can disable RLS temporarily
-- ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

