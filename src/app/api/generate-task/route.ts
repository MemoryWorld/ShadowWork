import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getLatestBugFix, parseRepoUrl } from '@/lib/github-scraper';
import { generateTaskFromDiff, analyzeDiffComplexity } from '@/lib/task-generator';
import type { Task } from '@/types';

/**
 * API Route: /api/generate-task
 * 
 * Module B: The Synthesis Engine (Data Pipeline)
 * 
 * Features:
 * 1. Mock Mode: Returns local mock data when ?mock=true
 * 2. GitHub Mode: Scrapes real PRs from public repos when source=github
 * 3. LLM Generation: Uses OpenAI with strict versioning
 * 4. Privacy-First: Never includes original PR IDs
 */

const MOCK_TASK_PATH = path.join(process.cwd(), 'src/data/mock-task.json');

async function saveMockTask(task: Task) {
  if (!task || !task.files) {
    console.warn('[generate-task] Skip updating mock task - invalid payload');
    return;
  }

  try {
    await fs.writeFile(MOCK_TASK_PATH, JSON.stringify(task, null, 2), 'utf-8');
    console.log('[generate-task] mock-task.json updated with latest task');
  } catch (error) {
    console.error('[generate-task] Failed to update mock-task.json:', error);
  }
}

async function loadMockTask() {
  const mockData = await fs.readFile(MOCK_TASK_PATH, 'utf-8');
  return JSON.parse(mockData);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mockMode = searchParams.get('mock') === 'true';
    const source = searchParams.get('source');
    const repo = searchParams.get('repo');
    const techStackParam = searchParams.get('techStack') || '';
    const userTechStack = techStackParam
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Mock Mode Switch - for offline testing
    if (mockMode) {
      console.log('[generate-task] Using Mock Mode');
      const mock = await loadMockTask();
      if (userTechStack.length) {
        mock.techStack = Array.from(new Set([...(mock.techStack || []), ...userTechStack]));
      }
      return NextResponse.json(mock);
    }

    // GitHub Real-World Mode
    if (source === 'github' && repo) {
      console.log('[generate-task] Using GitHub Pipeline for:', repo);
      
      try {
        // Step 1: Parse repo URL
        const { owner, repo: repoName } = parseRepoUrl(repo);
        
        // Step 2: Scrape latest bug fix from GitHub
        const bugFix = await getLatestBugFix(owner, repoName);
        
        console.log(`[generate-task] Found bug fix: PR #${bugFix.prNumber}`);
        
        // Step 3: Analyze complexity
        const analysis = analyzeDiffComplexity(bugFix.diffText);
        
        // Step 4: Generate task using LLM
        const task = await generateTaskFromDiff(
          bugFix.title,
          bugFix.diffText,
          { owner, repo: repoName }
        );
        
        // Merge analysis with task
        task.difficulty = analysis.difficulty;
        task.category = analysis.category;
        task.estimatedTime = analysis.estimatedTime;
        if (userTechStack.length) {
          task.techStack = Array.from(new Set([...(task.techStack || []), ...userTechStack]));
        }
        
        console.log('[generate-task] Task generated:', task.title);
        
        // Persist latest generated task for offline mock mode
        await saveMockTask(task as Task);
        
        return NextResponse.json(task);
      } catch (error) {
        console.error('[generate-task] GitHub pipeline failed:', error);
        
        // Fallback to mock data with warning
        console.warn('[generate-task] Falling back to mock data');
        const fallbackTask = await loadMockTask();
        
        // Add warning flag
        fallbackTask._warning = 'Generated from fallback data due to pipeline error';
        fallbackTask._error = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(fallbackTask);
      }
    }

    // Default: Return mock data with hint
    console.log('[generate-task] No mode specified, using mock data');
    return NextResponse.json(await loadMockTask());
    
  } catch (error) {
    console.error('[generate-task] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate task' },
      { status: 500 }
    );
  }
}

// Keep POST for backward compatibility and repo input
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo } = body;

    if (!repo) {
      return NextResponse.json(
        { error: 'Missing repo parameter' },
        { status: 400 }
      );
    }

    // Redirect to GET with query params
    const url = new URL(request.url);
    url.searchParams.set('source', 'github');
    url.searchParams.set('repo', repo);

    // Call ourselves with GET
    return GET(new NextRequest(url));
    
  } catch (error) {
    console.error('[generate-task] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
