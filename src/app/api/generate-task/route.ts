import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getLatestBugFix, parseRepoUrl } from '@/lib/github-scraper';
import { generateTaskFromDiff, analyzeDiffComplexity } from '@/lib/task-generator';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mockMode = searchParams.get('mock') === 'true';
    const source = searchParams.get('source');
    const repo = searchParams.get('repo');

    // Mock Mode Switch - for offline testing
    if (mockMode) {
      console.log('[generate-task] Using Mock Mode');
      const mockPath = path.join(process.cwd(), 'src/data/mock-task.json');
      const mockData = await fs.readFile(mockPath, 'utf-8');
      return NextResponse.json(JSON.parse(mockData));
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
        
        console.log('[generate-task] Task generated:', task.title);
        
        return NextResponse.json(task);
      } catch (error) {
        console.error('[generate-task] GitHub pipeline failed:', error);
        
        // Fallback to mock data with warning
        console.warn('[generate-task] Falling back to mock data');
        const mockPath = path.join(process.cwd(), 'src/data/mock-task.json');
        const mockData = await fs.readFile(mockPath, 'utf-8');
        const fallbackTask = JSON.parse(mockData);
        
        // Add warning flag
        fallbackTask._warning = 'Generated from fallback data due to pipeline error';
        fallbackTask._error = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(fallbackTask);
      }
    }

    // Default: Return mock data with hint
    console.log('[generate-task] No mode specified, using mock data');
    const mockPath = path.join(process.cwd(), 'src/data/mock-task.json');
    const mockData = await fs.readFile(mockPath, 'utf-8');
    return NextResponse.json(JSON.parse(mockData));
    
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
