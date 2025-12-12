import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

/**
 * API Route: /api/generate-task
 * 
 * Module B: The Synthesis Engine (Data Pipeline)
 * 
 * Features:
 * 1. Mock Mode: Returns local mock data when ?mock=true
 * 2. LLM Generation: Uses OpenAI with strict versioning
 * 3. Privacy-First: Never includes original PR IDs
 */

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mockMode = searchParams.get('mock') === 'true';

    // Mock Mode Switch - for offline testing
    if (mockMode) {
      console.log('[generate-task] Using Mock Mode');
      const mockPath = path.join(process.cwd(), 'src/data/mock-task.json');
      const mockData = await fs.readFile(mockPath, 'utf-8');
      return NextResponse.json(JSON.parse(mockData));
    }

    // Production Mode - Generate task from real data
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Use ?mock=true for offline testing.' },
        { status: 500 }
      );
    }

    // Step 1: Fetch real PR data from Apify (placeholder)
    // In production, you would call Apify API here
    const prData = await fetchPRFromApify();

    // Step 2: Generate task with OpenAI using "Strict Mode"
    const task = await generateTaskWithOpenAI(prData);

    return NextResponse.json(task);
  } catch (error) {
    console.error('[generate-task] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate task' },
      { status: 500 }
    );
  }
}

/**
 * Fetch PR data from Apify (placeholder)
 */
async function fetchPRFromApify() {
  // TODO: Implement Apify integration
  // For now, return placeholder data
  return {
    title: 'Fix race condition in user authentication',
    description: 'Handle concurrent login requests',
    code: 'Sample code snippet',
    techStack: ['Node.js', 'Express', 'JWT'],
  };
}

/**
 * Generate task using OpenAI with strict constraints
 * 
 * Key Requirements:
 * 1. Scenario Swapping: Transform business context (e.g., Fintech -> Gaming)
 * 2. Exact Versions: Use EXACT versions in package.json (e.g., "18.2.0", not "^18.0.0")
 * 3. Privacy: Never include original PR/Repo identifiers
 */
async function generateTaskWithOpenAI(prData: any) {
  if (!openai) {
    throw new Error('OpenAI not initialized');
  }

  const systemPrompt = `You are a coding challenge generator for ShadowWork, a privacy-first technical assessment platform.

CRITICAL CONSTRAINTS:

1. SCENARIO SWAPPING: Transform the original business context completely.
   - If the PR is about Fintech, make it Gaming
   - If it's Healthcare, make it E-commerce
   - If it's Enterprise SaaS, make it Social Media
   - NEVER reveal the original company or domain

2. EXACT VERSIONING: The generated package.json MUST use EXACT versions.
   - CORRECT: "react": "18.2.0"
   - WRONG: "react": "^18.2.0" or "react": "~18.2.0"
   - This prevents long install times in WebContainers

3. PRIVACY: Do NOT include:
   - Original PR ID or number
   - Repository name
   - Company name
   - Any identifying information

4. OUTPUT FORMAT: Return valid JSON with this structure:
{
  "id": "generated-uuid",
  "title": "Brief title (swapped scenario)",
  "description": "What the challenge is about",
  "difficulty": 1-100,
  "category": "High-Concurrency|Data-Structures|API-Design|etc",
  "techStack": ["React", "Node.js"],
  "estimatedTime": 30,
  "requirements": ["Requirement 1", "Requirement 2"],
  "files": {
    "package.json": {
      "name": "challenge-name",
      "version": "1.0.0",
      "dependencies": {
        "express": "4.18.2"
      }
    },
    "index.js": {
      "content": "// Starter code with TODO comments"
    }
  }
}`;

  const userPrompt = `Transform this engineering problem into a coding challenge:

Title: ${prData.title}
Description: ${prData.description}
Tech Stack: ${prData.techStack.join(', ')}

Remember: Swap the scenario, use exact versions, protect privacy.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const result = completion.choices[0].message.content;
  return JSON.parse(result || '{}');
}

