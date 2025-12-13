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
    const { userId, userEmail, taskId, events, difficulty, category, techStack, sessionTime } = body;
    
    console.log('[submit] Received submission from:', userEmail || userId);
    
    // Calculate points
    const basePoints = 100;
    const speedBonus = sessionTime && sessionTime < 1800 ? 50 : 0; // Bonus if under 30 min
    const totalPoints = basePoints + speedBonus;

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

    // Step 2: Save submission metadata with points
    const { error: dbError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        task_id: taskId,
        recording_url: recordingUrl,
        difficulty,
        category,
        tech_stack: techStack,
        points_earned: basePoints,
        speed_bonus: speedBonus,
        session_time: sessionTime,
        completed_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('[submit] Database error:', dbError);
      throw dbError;
    }

    // Step 2.5: Update user's total points and check offer qualification
    let userTotalPoints = totalPoints;
    let offerQualified = false;

    try {
      // Get current user points
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single();

      if (!userError && userData) {
        userTotalPoints = (userData.total_points || 0) + totalPoints;
        
        // Update user points
        await supabase
          .from('profiles')
          .update({ 
            total_points: userTotalPoints,
            last_active: new Date().toISOString()
          })
          .eq('id', userId);

        // Check offer threshold (300 points)
        offerQualified = userTotalPoints >= 300;
      }
    } catch (error) {
      console.warn('[submit] Points update skipped:', error);
    }

    // Step 3: Send enhanced Slack notification with points
    const slackResult = await sendSlackNotification({
      userId,
      difficulty,
      category,
      techStack,
      replayUrl: recordingUrl,
      pointsEarned: totalPoints,
      totalPoints: userTotalPoints,
      offerQualified,
    });

    if (!slackResult.success) {
      console.warn('[submit] Slack notification failed:', slackResult.error);
    }

    return NextResponse.json({
      success: true,
      recordingUrl,
      points: {
        earned: totalPoints,
        base: basePoints,
        bonus: speedBonus,
        total: userTotalPoints,
      },
      offerQualified,
    });
  } catch (error) {
    console.error('[submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit challenge' },
      { status: 500 }
    );
  }
}


