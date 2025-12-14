import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

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
    const resumeText: string = body.resumeText || '';
    const techStack: string[] = Array.isArray(body.techStack) ? body.techStack : [];
    const userEmail: string | undefined = body.userEmail;

    if (!resumeText.trim()) {
      return NextResponse.json({ error: 'Missing resumeText' }, { status: 400 });
    }

    const prompt = [
      'You are a senior tech recruiter reviewing a software engineer resume.',
      'Produce JSON with these keys: techStack[], domains[], yearsExperience (number), roles[], expertise[], projectHighlights[], taskHints[], recommendedRepos[], summary.',
      'summary must be a single English paragraph of 180-220 words, written like an HR evaluator: evidence-based, balanced on strengths/risks, clear next-step guidance, no bullet points.',
      'techStack should be sorted by strength. domains can include Backend, Frontend, Full-stack, Data, ML, Cloud, Mobile, DevOps, etc. roles should be title-like suggestions. expertise should describe focus areas. projectHighlights should cite concrete impact. taskHints are 2-4 realistic tasks to assess the candidate. recommendedRepos should be well-known public GitHub repos that match the stack; avoid private/company content.',
      'If resume text is sparse, use the provided techStack hints but keep summary honest about gaps.',
      `Resume text:\n${resumeText}`,
      techStack.length ? `Known tech stack hints: ${techStack.join(', ')}` : '',
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const parsed = JSON.parse(completion.choices[0].message.content || '{}');

    // Optional: store to Supabase if available
    if (supabase) {
      try {
        await supabase.from('resume_insights').insert({
          user_email: userEmail || null,
          tech_stack: parsed.techStack || techStack || [],
          domains: parsed.domains || [],
          years_experience: parsed.yearsExperience || null,
          roles: parsed.roles || [],
          expertise: parsed.expertise || [],
          project_highlights: parsed.projectHighlights || [],
          task_hints: parsed.taskHints || [],
          recommended_repos: parsed.recommendedRepos || [],
          summary: parsed.summary || null,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[analyze-resume] supabase insert skipped:', err);
      }
    }

    return NextResponse.json({ success: true, insights: parsed });
  } catch (error) {
    console.error('[analyze-resume] error:', error);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}
