'use client';

import { useEffect, useState } from 'react';

/**
 * Task Generator Test Page
 * 
 * Allows testing the real-world task generation pipeline
 * Input a GitHub repo → Get a generated challenge
 */

export default function GeneratePage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('shadowwork_user_techstack');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [resumeProfile, setResumeProfile] = useState<{
    techStack: string[];
    domains: string[];
    recommendedRepos: string[];
    roles?: string[];
    taskHints?: string[];
  }>({ techStack: [], domains: [], recommendedRepos: [], roles: [], taskHints: [] });
  const [githubProfile] = useState(() => {
    if (typeof window === 'undefined') return null as null | { username: string; suggestedRepos: string[] };
    try {
      const stored = localStorage.getItem('shadowwork_github_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [repoPrefilled, setRepoPrefilled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedProfile = localStorage.getItem('shadowwork_resume_profile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        setResumeProfile({
          techStack: parsed.techStack || [],
          domains: parsed.domains || [],
          recommendedRepos: parsed.recommendedRepos || [],
          roles: parsed.roles || [],
          taskHints: parsed.taskHints || [],
        });
        // merge tech stack
        if (parsed.techStack?.length) {
          setTechStack((prev) => Array.from(new Set([...(prev || []), ...parsed.techStack])));
        }
      }
    } catch {}
    // Autofill repo from stored profile if available
    if (!repoPrefilled) {
      if (githubProfile?.suggestedRepos?.length) {
        setRepoUrl(githubProfile.suggestedRepos[0]);
        setRepoPrefilled(true);
      } else if (resumeProfile.recommendedRepos?.length) {
        setRepoUrl(resumeProfile.recommendedRepos[0]);
        setRepoPrefilled(true);
      }
    }
  }, [githubProfile, repoPrefilled, resumeProfile.recommendedRepos]);

  const popularRepos = [
    'vercel/next.js',
    'facebook/react',
    'microsoft/typescript',
    'shadcn-ui/ui',
    'tailwindlabs/tailwindcss',
  ];

  const handleGenerate = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL');
      return;
    }

      setIsLoading(true);
      setError(null);
      setResult(null);

      try {
        console.log('[Generate] Requesting task from:', repoUrl);

        const response = await fetch(
        `/api/generate-task?source=github&repo=${encodeURIComponent(repoUrl)}&techStack=${encodeURIComponent(techStack.join(','))}`
        );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);

      console.log('[Generate] Task received:', data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate task';
      setError(message);
      console.error('[Generate] Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🔬 Task Generator
              </h1>
              <p className="text-gray-600">
                Prefill with your profile (GitHub / resume / LinkedIn) to auto-suggest repo and tech stack
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-white"
          >
            ← Back
          </button>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            GitHub Repository URL
          </label>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="e.g., vercel/next.js or https://github.com/facebook/react"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚪</span>
                  Generating...
                </span>
              ) : (
                '🚀 Generate'
              )}
            </button>
          </div>

          {/* Resume insights banner */}
          {(resumeProfile.techStack.length > 0 || resumeProfile.recommendedRepos.length > 0) && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">Using resume insights</span>
                {resumeProfile.domains.map((d) => (
                  <span key={d} className="px-2 py-1 rounded bg-white/80 text-blue-800 text-xs font-medium border border-blue-200">
                    {d}
                  </span>
                ))}
              </div>
              {resumeProfile.recommendedRepos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {resumeProfile.recommendedRepos.map((repo) => (
                    <button
                      key={repo}
                      onClick={() => setRepoUrl(repo)}
                      className="px-3 py-1 bg-white text-blue-700 rounded-lg text-xs border border-blue-200 hover:bg-blue-100"
                      disabled={isLoading}
                    >
                      {repo}
                    </button>
                  ))}
                </div>
              )}
              {resumeProfile.roles && resumeProfile.roles.length > 0 && (
                <p className="mt-2 text-xs text-blue-800">
                  Suggested roles: {resumeProfile.roles.join(', ')}
                </p>
              )}
              {resumeProfile.taskHints && resumeProfile.taskHints.length > 0 && (
                <p className="text-xs text-blue-800">
                  Task hints: {resumeProfile.taskHints.join('; ')}
                </p>
              )}
            </div>
          )}

          {/* Quick Select */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Quick select popular repos{githubProfile ? ' or from your GitHub handle' : ''}:</p>
            <div className="flex flex-wrap gap-2">
              {(githubProfile?.suggestedRepos || []).map((repo) => (
                <button
                  key={repo}
                  onClick={() => setRepoUrl(repo)}
                  className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {repo}
                </button>
              ))}
              {popularRepos.map((repo) => (
                <button
                  key={repo}
                  onClick={() => setRepoUrl(repo)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {repo}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Tech Stack */}
          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Candidate tech stack (optional)</p>
            <p className="text-xs text-gray-500 mb-2">Imported from resume/LinkedIn locally. Not uploaded to server; used as a hint for generation.</p>
            <div className="flex gap-3 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add a tech e.g. React"
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                disabled={isLoading}
              />
              <button
                onClick={() => {
                  if (!techInput.trim()) return;
                  const value = techInput.trim();
                  setTechStack((prev) => Array.from(new Set([...prev, value])));
                  setTechInput('');
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('shadowwork_user_techstack', JSON.stringify(Array.from(new Set([...techStack, value]))));
                  }
                }}
                disabled={isLoading}
                className="px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-2"
                  >
                    {tech}
                    <button
                      onClick={() => {
                        const next = techStack.filter((t) => t !== tech);
                        setTechStack(next);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('shadowwork_user_techstack', JSON.stringify(next));
                        }
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">How it works:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Fetch recent merged PRs with "fix" or "bug" keywords</li>
              <li>Extract the code diff (changes)</li>
              <li>Use OpenAI to transform into obfuscated challenge</li>
              <li>Generate runnable code with tests</li>
            </ol>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              💡 Tip: Make sure OpenAI API key is configured in .env.local
            </p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="space-y-4">
            {/* Warning if fallback */}
            {result._warning && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                <p className="text-yellow-900 font-semibold">⚠️ Fallback Mode</p>
                <p className="text-yellow-700 text-sm">{result._warning}</p>
                {result._error && (
                  <p className="text-yellow-600 text-xs mt-1">Error: {result._error}</p>
                )}
              </div>
            )}

            {/* Task Preview */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">✅ Generated Task</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Metadata */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{result.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📊 Difficulty: {result.difficulty}/100</span>
                    <span>🏷️ {result.category}</span>
                    <span>⏱️ ~{result.estimatedTime} min</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                    {result.description}
                  </p>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tech Stack:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.techStack?.map((tech: string) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Files */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Generated Files:</h4>
                  <div className="space-y-2">
                    {Object.keys(result.files || {}).map((filename) => (
                      <details key={filename} className="bg-gray-900 rounded-lg">
                        <summary className="px-4 py-2 text-white font-mono text-sm cursor-pointer hover:bg-gray-800">
                          📄 {filename}
                        </summary>
                        <pre className="px-4 py-3 text-gray-300 text-xs font-mono overflow-auto max-h-60">
                          {typeof result.files[filename] === 'object' && 'content' in result.files[filename]
                            ? result.files[filename].content
                            : JSON.stringify(result.files[filename], null, 2)}
                        </pre>
                      </details>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      // Save to localStorage for use in challenge
                      localStorage.setItem('custom_task', JSON.stringify(result));
                      window.location.href = '/challenge?source=custom';
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg"
                  >
                    ▶️ Try This Challenge
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                      alert('Task JSON copied to clipboard!');
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200"
                  >
                    📋 Copy JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Generating Task...
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>⏳ Fetching recent PRs from GitHub...</p>
              <p>🔍 Finding bug fixes...</p>
              <p>🤖 Transforming with OpenAI...</p>
              <p className="text-xs text-gray-500 mt-4">
                This may take 10-30 seconds depending on API response times
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
