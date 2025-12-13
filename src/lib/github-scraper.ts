/**
 * GitHub Bug Fix Scraper
 * 
 * Fetches recent merged PRs with bug fixes from public repositories
 * Uses GitHub REST API (no token required for public repos)
 */

interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  diff_url: string;
  state: string;
  merged_at: string | null;
  labels: Array<{ name: string }>;
}

interface BugFixData {
  prNumber: number;
  title: string;
  description: string;
  diffUrl: string;
  diffText: string;
  labels: string[];
  repoOwner: string;
  repoName: string;
}

/**
 * Fetch recent merged PRs from a GitHub repository
 */
export async function fetchRecentPRs(
  owner: string,
  repo: string,
  limit: number = 20
): Promise<GitHubPR[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=${limit}`;

  console.log(`[GitHub] Fetching PRs from ${owner}/${repo}...`);

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ShadowWork-TaskGenerator',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const prs: GitHubPR[] = await response.json();
  return prs;
}

/**
 * Check if a PR is likely a bug fix
 */
function isBugFix(pr: GitHubPR): boolean {
  const title = pr.title.toLowerCase();
  const labels = pr.labels.map((l) => l.name.toLowerCase());

  // Keywords that indicate a bug fix
  const bugKeywords = ['fix', 'bug', 'patch', 'error', 'issue', 'crash', 'resolve'];
  const hasBugKeyword = bugKeywords.some((kw) => title.includes(kw));

  // Check labels
  const hasBugLabel = labels.some((l) => 
    l.includes('bug') || l.includes('fix') || l.includes('patch')
  );

  // Must be merged
  const isMerged = pr.merged_at !== null;

  return isMerged && (hasBugKeyword || hasBugLabel);
}

/**
 * Fetch the diff text from a PR
 */
async function fetchDiff(diffUrl: string): Promise<string> {
  console.log(`[GitHub] Fetching diff from ${diffUrl}...`);

  const response = await fetch(diffUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3.diff',
      'User-Agent': 'ShadowWork-TaskGenerator',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch diff: ${response.statusText}`);
  }

  const diffText = await response.text();
  return diffText;
}

/**
 * Get the latest bug fix from a GitHub repository
 * 
 * This is the main entry point for the scraper
 */
export async function getLatestBugFix(
  owner: string,
  repo: string
): Promise<BugFixData> {
  try {
    // Fetch recent PRs
    const prs = await fetchRecentPRs(owner, repo, 30);

    // Filter for bug fixes
    const bugFixes = prs.filter(isBugFix);

    if (bugFixes.length === 0) {
      throw new Error('No bug fix PRs found in recent history');
    }

    // Take the first (most recent) bug fix
    const pr = bugFixes[0];

    console.log(`[GitHub] Found bug fix: PR #${pr.number} - ${pr.title}`);

    // Fetch the diff
    const diffText = await fetchDiff(pr.diff_url);

    // Limit diff size to prevent token overflow
    const maxDiffLength = 5000; // ~1500 tokens
    const truncatedDiff = diffText.length > maxDiffLength
      ? diffText.substring(0, maxDiffLength) + '\n... (diff truncated)'
      : diffText;

    return {
      prNumber: pr.number,
      title: pr.title,
      description: pr.body || '',
      diffUrl: pr.diff_url,
      diffText: truncatedDiff,
      labels: pr.labels.map((l) => l.name),
      repoOwner: owner,
      repoName: repo,
    };
  } catch (error) {
    console.error('[GitHub] Scraper error:', error);
    throw error;
  }
}

/**
 * Parse GitHub repo URL into owner and repo name
 * 
 * Supports formats:
 * - https://github.com/facebook/react
 * - github.com/facebook/react
 * - facebook/react
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } {
  // Remove protocol and domain
  let path = url
    .replace(/^https?:\/\//, '')
    .replace(/^github\.com\//, '')
    .replace(/\.git$/, '')
    .trim();

  // Remove trailing slash
  path = path.replace(/\/$/, '');

  const parts = path.split('/');

  if (parts.length < 2) {
    throw new Error('Invalid GitHub repo URL. Format: owner/repo or https://github.com/owner/repo');
  }

  return {
    owner: parts[0],
    repo: parts[1],
  };
}

