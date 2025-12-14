import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSlackNotification } from '@/lib/slack';
import { evaluateSubmission } from '@/lib/evaluator';
import type { CodeFileSnapshot, EvaluationResult, SubmissionResponsePayload } from '@/types';
import OpenAI from 'openai';

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
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    })
  : null;
const model = process.env.OPENAI_MODEL || 'gpt-4o';

async function generateReviewSummary(payload: {
  taskTitle?: string;
  points?: SubmissionResponsePayload['points'];
  offerQualified?: boolean;
  evaluation?: EvaluationResult | null;
}) {
  if (!openai) return null;
  const { taskTitle, points, offerQualified, evaluation } = payload;
  const prompt = [
    'You are an interview bar-raiser. Write an English review summary (180-220 words) for a coding challenge submission.',
    'Tone: concise, evidence-based, balanced (strengths, risks), suggest next steps.',
    'Use only the provided data; do not invent details.',
    `Task: ${taskTitle || 'Unknown task'}`,
    `Points: ${points ? `${points.earned} earned, total ${points.total}` : 'N/A'}`,
    `Offer qualified: ${offerQualified ? 'yes' : 'no'}`,
    evaluation
      ? `Scores: understanding ${evaluation.scores?.understanding}, implementation ${evaluation.scores?.implementation}, validation ${evaluation.scores?.validation}, communication ${evaluation.scores?.communication}, total ${evaluation.scores?.total}, match ${evaluation.scores?.matchScore}`
      : 'No evaluation scores',
    evaluation?.rationale ? `Rationale: ${JSON.stringify(evaluation.rationale)}` : 'No rationale',
    evaluation?.risks?.length ? `Risks: ${evaluation.risks.join('; ')}` : 'No risks provided',
    evaluation?.nextInterviewQuestions?.length
      ? `Follow-up: ${evaluation.nextInterviewQuestions.join('; ')}`
      : 'No follow-up questions',
    'Output: one paragraph, no bullets, 180-220 words.',
  ].join('\n');

  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.35,
    max_tokens: 320,
  });
  return completion.choices?.[0]?.message?.content?.trim() || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userEmail,
      taskId,
      taskContext,
      events,
      difficulty,
      category,
      techStack,
      codeSnapshot = [],
      sessionTime,
    } = body;
    
    console.log('[submit] Received submission from:', userEmail || userId);
    
    // Calculate points
    const basePoints = 100;
    const speedBonus = sessionTime && sessionTime < 1800 ? 50 : 0; // Bonus if under 30 min
    const totalPoints = basePoints + speedBonus;
    let userTotalPoints = totalPoints;
    let offerQualified = false;
    let reviewSummary: string | null = null;

    const normalizedSnapshot: CodeFileSnapshot[] = Array.isArray(codeSnapshot)
      ? codeSnapshot
      : [];

    let evaluationResult: EvaluationResult | null = null;

    if (normalizedSnapshot.length > 0) {
      const evaluation = await evaluateSubmission({
        taskContext,
        codeSnapshot: normalizedSnapshot,
        difficulty,
        category,
        techStack,
        sessionTime,
      });

      if (evaluation.success && evaluation.data) {
        evaluationResult = evaluation.data;
      } else if (evaluation.error) {
        console.warn('[submit] Evaluation skipped:', evaluation.error);
      }
    }

    if (!supabase) {
      console.warn('[submit] Supabase not configured - skipping upload');
      reviewSummary = await generateReviewSummary({
        taskTitle: taskContext?.title,
        points: {
          earned: totalPoints,
          base: basePoints,
          bonus: speedBonus,
          total: userTotalPoints,
        },
        offerQualified,
        evaluation: evaluationResult,
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Submission received (Supabase not configured)',
        evaluation: evaluationResult,
        recordingUrl: null,
        reviewSummary,
        points: {
          earned: totalPoints,
          base: basePoints,
          bonus: speedBonus,
          total: totalPoints,
        },
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

    // Step 2: Update user's total points and check offer qualification
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

    // Step 3: Generate review summary after we know offerQualified/userTotalPoints
    reviewSummary = await generateReviewSummary({
      taskTitle: taskContext?.title,
      points: {
        earned: totalPoints,
        base: basePoints,
        bonus: speedBonus,
        total: userTotalPoints,
      },
      offerQualified,
      evaluation: evaluationResult,
    });

    // Step 4: Save submission metadata with points
    const { error: dbError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        task_id: taskId,
        task_title: taskContext?.title || null,
        recording_url: recordingUrl,
        difficulty,
        category,
        tech_stack: techStack,
        points_earned: basePoints,
        speed_bonus: speedBonus,
        session_time: sessionTime,
        code_snapshot: normalizedSnapshot,
        evaluation_json: evaluationResult,
        review_summary: reviewSummary,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('[submit] Database error:', dbError);
      throw dbError;
    }

    // Step 5: Send enhanced Slack notification with points
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
      reviewSummary,
      points: {
        earned: totalPoints,
        base: basePoints,
        bonus: speedBonus,
        total: userTotalPoints,
      },
      offerQualified,
      evaluation: evaluationResult,
    });
  } catch (error) {
    console.error('[submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit challenge' },
      { status: 500 }
    );
  }
}
