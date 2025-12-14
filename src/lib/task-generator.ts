/**
 * Task Generator using LLM (OpenAI or Ollama)
 * 
 * Transforms real GitHub bug fixes into obfuscated coding challenges
 * The "Magic" of ShadowWork - preserving technical complexity while hiding business context
 */

import { createChatCompletion } from './llm-client';
import type { Task } from '@/types';

/**
 * Generate a coding challenge from a Git diff
 * 
 * This is the core transformation engine
 */
export async function generateTaskFromDiff(
  prTitle: string,
  diffText: string,
  repoContext: { owner: string; repo: string }
): Promise<Task> {
  const provider = process.env.LLM_PROVIDER || 'ollama';
  if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are a Senior Engineering Challenge Designer for ShadowWork, a privacy-first technical assessment platform.

Your task: Transform a REAL Git Diff from an open-source project into a standalone, runnable coding challenge.

CRITICAL TRANSFORMATION RULES:

1. **DOMAIN OBFUSCATION** (Protect Company IP):
   - If the bug is in Finance → Make it E-commerce
   - If it's Healthcare → Make it Gaming
   - If it's Enterprise SaaS → Make it Social Media
   - If it's a specific product (React, Next.js) → Make it a generic app context
   - NEVER mention the original repository or company name
   
2. **PRESERVE TECHNICAL COMPLEXITY**:
   - Keep the exact bug type (race condition, off-by-one, memory leak, etc.)
   - Maintain the same solution pattern
   - Use similar data structures
   - Keep similar edge cases
   
3. **MAKE IT RUNNABLE**:
   - Create a minimal, self-contained Node.js project
   - Include a package.json with EXACT versions (e.g., "express": "4.18.2", NOT "^4.18.2")
   - Add starter code with the bug already present
   - Include test cases that FAIL initially
   - Tests should PASS when the bug is fixed
   
4. **OUTPUT FORMAT** (STRICT JSON):
{
  "id": "generated-uuid",
  "title": "Brief, catchy title (obfuscated scenario)",
  "description": "Markdown description of what to fix (2-3 paragraphs)",
  "difficulty": 1-100,
  "category": "Race-Condition|Memory-Leak|Off-By-One|API-Design|etc",
  "techStack": ["Node.js", "Express"],
  "estimatedTime": 30-60,
  "requirements": [
    "Fix the identified bug",
    "Ensure all tests pass",
    "Maintain code quality"
  ],
  "files": {
    "package.json": {
      "name": "challenge-name",
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "dev": "node server.js",
        "test": "node test.js"
      },
      "dependencies": {
        "express": "4.18.2"
      }
    },
    "server.js": {
      "content": "// Starter code WITH the bug present\\n// TODO: Fix the bug\\n..."
    },
    "test.js": {
      "content": "// Test cases that fail with the bug\\n// and pass when fixed\\n..."
    },
    "README.md": {
      "content": "# Challenge Title\\n\\nTask description..."
    }
  }
}

5. **DIFFICULTY SCORING**:
   - Simple fixes (typo, missing check): 20-40
   - Logic errors (conditional, loop): 40-60
   - Concurrency bugs (race, deadlock): 60-80
   - Architecture issues (design, pattern): 80-95
   
6. **ESTIMATED TIME**:
   - Based on code complexity and testing needs
   - Range: 15-60 minutes
   - Account for: understanding + fixing + testing

EXAMPLE TRANSFORMATION:

Input Diff:
\`\`\`diff
- if (payment.amount > balance) {
+ if (payment.amount >= balance) {
    throw new Error('Insufficient funds');
  }
\`\`\`

Output Task:
- Scenario: "Game Inventory System" (not payment)
- Bug: Off-by-one error in item purchase check
- Same fix pattern: Change > to >=
- Different variable names and context

Remember: The hiring team wants to see if candidates can fix THIS TYPE of bug, not specifically "their" bug.`;

  const userPrompt = `Transform this real bug fix into a coding challenge:

Repository Context: ${repoContext.owner}/${repoContext.repo}
PR Title: ${prTitle}

Git Diff:
\`\`\`diff
${diffText}
\`\`\`

Generate a complete, runnable coding challenge based on this bug. Change the business domain completely, but keep the technical bug pattern identical. Use exact versions in dependencies.`;

  console.log('[LLM] Generating task from diff...');

  try {
    const result = await createChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      {
        response_format: { type: 'json_object' },
        temperature: 0.8, // Higher creativity for better obfuscation
        max_tokens: 4000,
      }
    );

    const content = result.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    const task = JSON.parse(content);
    console.log('[LLM] Task generated successfully:', task.title);

    return task as Task;
  } catch (error) {
    console.error('[LLM] Generation failed:', error);
    throw error;
  }
}

/**
 * Analyze diff complexity to suggest difficulty
 */
export function analyzeDiffComplexity(diffText: string): {
  difficulty: number;
  category: string;
  estimatedTime: number;
} {
  const lines = diffText.split('\n');
  const changedLines = lines.filter((l) => l.startsWith('+') || l.startsWith('-')).length;

  // Detect patterns
  const hasAsync = /async|await|Promise/.test(diffText);
  const hasLock = /mutex|semaphore|lock|synchronized/.test(diffText);
  const hasRace = /race|concurrent|parallel/.test(diffText);
  const hasMemory = /memory|leak|gc|delete|free/.test(diffText);

  let difficulty = 50;
  let category = 'Bug-Fix';
  let estimatedTime = 30;

  // Adjust based on complexity indicators
  if (hasRace || hasLock) {
    difficulty = 75;
    category = 'Race-Condition';
    estimatedTime = 45;
  } else if (hasAsync) {
    difficulty = 60;
    category = 'Async-Logic';
    estimatedTime = 35;
  } else if (hasMemory) {
    difficulty = 70;
    category = 'Memory-Management';
    estimatedTime = 40;
  }

  // Adjust for size
  if (changedLines > 50) {
    difficulty += 10;
    estimatedTime += 15;
  } else if (changedLines < 10) {
    difficulty -= 10;
    estimatedTime -= 5;
  }

  // Clamp values
  difficulty = Math.max(20, Math.min(95, difficulty));
  estimatedTime = Math.max(15, Math.min(60, estimatedTime));

  return { difficulty, category, estimatedTime };
}
