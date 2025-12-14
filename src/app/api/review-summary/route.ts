import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    })
  : null;

const model = process.env.OPENAI_MODEL || 'gpt-4o';

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { taskTitle, points, offerQualified, evaluation } = body || {};

    const prompt = [
      'You are an interview bar-raiser. Write an English review summary (180-220 words) for a coding challenge submission.',
      'Tone: concise, evidence-based, balanced (strengths, risks), suggest next steps for interview.',
      'Use only the provided data; do not invent details.',
      'Input:',
      `Task: ${taskTitle || 'Unknown task'}`,
      `Points: ${points ? `${points.earned} earned, total ${points.total}` : 'N/A'}`,
      `Offer qualified: ${offerQualified ? 'yes' : 'no'}`,
      evaluation
        ? `Evaluation scores: understanding ${evaluation.scores?.understanding}, implementation ${evaluation.scores?.implementation}, validation ${evaluation.scores?.validation}, communication ${evaluation.scores?.communication}, total ${evaluation.scores?.total}, match ${evaluation.scores?.matchScore}`
        : 'No evaluation scores',
      evaluation?.rationale
        ? `Rationales: ${JSON.stringify(evaluation.rationale)}`
        : 'No rationale',
      evaluation?.risks?.length ? `Risks: ${evaluation.risks.join('; ')}` : 'No risks provided',
      evaluation?.nextInterviewQuestions?.length
        ? `Follow-up: ${evaluation.nextInterviewQuestions.join('; ')}`
        : 'No follow-up questions',
      'Output: one paragraph, no bullets, no headings, 180-220 words.',
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.35,
      max_tokens: 320,
    });

    const summary = completion.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('[review-summary] error:', error);
    return NextResponse.json({ error: 'Failed to generate review summary' }, { status: 500 });
  }
}

