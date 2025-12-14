import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import type { CodeFileSnapshot, EvaluationResult } from '@/types';

const evaluatorSpecPath = path.join(process.cwd(), 'specMd.md');
const evaluatorSpec = fs.existsSync(evaluatorSpecPath)
  ? fs.readFileSync(evaluatorSpecPath, 'utf-8')
  : '';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    })
  : null;

const model = process.env.OPENAI_MODEL || 'gpt-4o';

export interface EvaluationInput {
  taskContext?: {
    title?: string;
    description?: string;
    requirements?: string[];
    estimatedTime?: number;
  };
  codeSnapshot: CodeFileSnapshot[];
  difficulty: number;
  category: string;
  techStack: string[];
  sessionTime?: number;
}

export interface EvaluationResponse {
  success: boolean;
  data?: EvaluationResult;
  error?: string;
  rawOutput?: string;
}

export async function evaluateSubmission(
  input: EvaluationInput
): Promise<EvaluationResponse> {
  if (!openai) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  if (!evaluatorSpec) {
    return { success: false, error: 'Evaluator spec missing' };
  }

  const payload = {
    task: input.taskContext,
    difficulty: input.difficulty,
    category: input.category,
    techStack: input.techStack,
    sessionTime: input.sessionTime,
    codeSnapshot: input.codeSnapshot,
  };

  const userPrompt = `Evaluate the following candidate submission.\nAll available evidence is provided as JSON below:\n\n${JSON.stringify(
    payload,
    null,
    2
  )}\n\nProduce a response using the required JSON format. If information is missing, reflect that conservatively in both rationale and scores.`;

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: evaluatorSpec,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'Empty evaluation response' };
    }

    const parsed = JSON.parse(content) as EvaluationResult;
    return {
      success: true,
      data: parsed,
      rawOutput: content,
    };
  } catch (error) {
    console.error('[evaluator] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run evaluator',
    };
  }
}
