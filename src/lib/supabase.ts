import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Used for:
 * 1. Authentication (GitHub OAuth)
 * 2. Database (submissions storage)
 * 3. Storage (rrweb recordings)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database Schema (for reference):
 * 
 * Table: submissions
 * - id: uuid (primary key)
 * - user_id: text
 * - task_id: text
 * - recording_url: text
 * - difficulty: integer
 * - category: text
 * - tech_stack: text[]
 * - completed_at: timestamp
 * - created_at: timestamp
 * 
 * Storage Bucket: recordings
 * - Public bucket for storing rrweb JSON files
 */

