-- ShadowWork v3.1: Gamification & Recruitment Update
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. Update profiles table with gamification
-- ============================================

-- Add email column (CRITICAL for recruitment)
ALTER TABLE IF EXISTS profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Add gamification columns
ALTER TABLE IF EXISTS profiles
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS offers_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS github_username TEXT,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(total_points DESC);

-- ============================================
-- 2. Update submissions table with points
-- ============================================

ALTER TABLE IF EXISTS submissions
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS speed_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS session_time INTEGER; -- in seconds

-- ============================================
-- 3. Create offers table (for tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  company_name TEXT,
  position TEXT,
  points_at_time INTEGER,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  offered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- ============================================
-- 4. Enable RLS (Row Level Security)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and update their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid()::text = id);

CREATE POLICY IF NOT EXISTS "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid()::text = id);

-- Policy: Users can insert their profile on first login
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Policy: Users can view their own offers
CREATE POLICY IF NOT EXISTS "Users can view own offers"
ON offers FOR SELECT
USING (auth.uid()::text = user_id);

-- ============================================
-- 5. Functions for points calculation
-- ============================================

-- Function to add points and check for offer threshold
CREATE OR REPLACE FUNCTION add_points_and_check_offer(
  p_user_id TEXT,
  p_points INTEGER,
  p_speed_bonus INTEGER DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_new_total INTEGER;
  v_offer_qualified BOOLEAN := FALSE;
  v_result JSON;
BEGIN
  -- Update total points
  UPDATE profiles
  SET 
    total_points = total_points + p_points + p_speed_bonus,
    last_active = NOW()
  WHERE id = p_user_id
  RETURNING total_points INTO v_new_total;

  -- Check if user qualifies for offer (threshold: 300 points)
  IF v_new_total >= 300 THEN
    v_offer_qualified := TRUE;
  END IF;

  -- Build result JSON
  v_result := json_build_object(
    'user_id', p_user_id,
    'points_earned', p_points + p_speed_bonus,
    'new_total', v_new_total,
    'offer_qualified', v_offer_qualified
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Sample data for testing (optional)
-- ============================================

-- Uncomment to insert test data
/*
INSERT INTO profiles (id, email, total_points) VALUES
  ('test-user-1', 'alice@example.com', 150),
  ('test-user-2', 'bob@example.com', 350)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================
-- 7. Migration notes
-- ============================================

-- To verify the migration:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
-- SELECT * FROM profiles LIMIT 5;

-- ============================================
-- 8. Resume insights storage (for AI personalization)
-- ============================================

CREATE TABLE IF NOT EXISTS resume_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  tech_stack TEXT[],
  domains TEXT[],
  years_experience INTEGER,
  roles TEXT[],
  expertise TEXT[],
  project_highlights JSONB,
  task_hints TEXT[],
  recommended_repos TEXT[],
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allow anon inserts if RLS disabled; adjust policies as needed.
ALTER TABLE resume_insights DISABLE ROW LEVEL SECURITY;
