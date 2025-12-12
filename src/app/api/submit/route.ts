import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSlackNotification } from '@/lib/slack';

/**
 * API Route: /api/submit
 * 
 * Handles challenge submission:
 * 1. Upload rrweb recording to Supabase Storage
 * 2. Save submission metadata to database
 * 3. Send privacy-safe notification to Slack
 */

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, taskId, events, difficulty, category, techStack } = body;

    if (!supabase) {
      console.warn('[submit] Supabase not configured - skipping upload');
      return NextResponse.json({ 
        success: true, 
        message: 'Submission received (Supabase not configured)' 
      });
    }

    // Step 1: Upload rrweb recording to Supabase Storage
    const recordingFileName = `${userId}-${taskId}-${Date.now()}.json`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(recordingFileName, JSON.stringify(events), {
        contentType: 'application/json',
      });

    if (uploadError) {
      console.error('[submit] Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL for the recording
    const { data: urlData } = supabase.storage
      .from('recordings')
      .getPublicUrl(recordingFileName);

    const recordingUrl = urlData?.publicUrl || '';

    // Step 2: Save submission metadata
    const { error: dbError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        task_id: taskId,
        recording_url: recordingUrl,
        difficulty,
        category,
        tech_stack: techStack,
        completed_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('[submit] Database error:', dbError);
      throw dbError;
    }

    // Step 3: Send privacy-safe Slack notification
    const slackResult = await sendSlackNotification({
      userId,
      difficulty,
      category,
      techStack,
      replayUrl: recordingUrl,
    });

    if (!slackResult.success) {
      console.warn('[submit] Slack notification failed:', slackResult.error);
    }

    return NextResponse.json({
      success: true,
      recordingUrl,
    });
  } catch (error) {
    console.error('[submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit challenge' },
      { status: 500 }
    );
  }
}


