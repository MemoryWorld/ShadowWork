import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type SubmissionRecord = {
  id?: string;
  user_id?: string;
  user_email?: string;
  task_id?: string;
  task_title?: string;
  points_earned?: number;
  speed_bonus?: number;
  session_time?: number;
  evaluation_json?: any;
  review_summary?: string | null;
  recording_url?: string | null;
  created_at?: string;
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const scope = url.searchParams.get('scope') || 'mine';
    const email = url.searchParams.get('email') || undefined;
    const roleHeader = req.headers.get('x-demo-role') || 'user';
    const role: 'user' | 'enterprise' = roleHeader === 'enterprise' ? 'enterprise' : 'user';

    // If Supabase not configured, return hint; client can fallback to localStorage
    if (!supabase) {
      return NextResponse.json({
        source: 'local',
        scope,
        submissions: [],
        message: 'Supabase not configured; using local demo data on client.',
      });
    }

    let query = supabase.from('submissions').select(
      'id,user_id,user_email,task_id,task_title,points_earned,speed_bonus,session_time,review_summary,recording_url,evaluation_json,created_at'
    );

    if (scope === 'mine' && email) {
      query = query.eq('user_email', email);
    } else if (scope === 'mine' && !email) {
      // Without email, cannot filter; return empty to avoid leaking data
      return NextResponse.json({
        source: 'supabase',
        submissions: [],
        message: 'Missing email for user scope',
      });
    } else if (scope === 'all' && role !== 'enterprise') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      source: 'supabase',
      scope,
      submissions: (data as SubmissionRecord[]) || [],
    });
  } catch (error) {
    console.error('[submissions] error:', error);
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
  }
}

