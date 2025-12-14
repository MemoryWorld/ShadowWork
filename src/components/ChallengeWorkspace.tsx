'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CodeEditor } from './CodeEditor';
import { CountdownTimer } from './CountdownTimer';
import { TerminalBootSequence } from './TerminalBootSequence';
import { SuccessModal } from './SuccessModal';
import { useWebContainer } from '@/hooks/useWebContainer';
import { useRecorder } from '@/hooks/useRecorder';
import type { CodeFileSnapshot, SubmissionResponsePayload, Task } from '@/types';
import { getMockUser } from '@/lib/mockAuth';

/**
 * Challenge Workspace Component
 * 
 * The main coding environment where users solve challenges.
 */

interface ChallengeWorkspaceProps {
  task: Task;
  stubCommands?: boolean;
  onSubmit: (
    events: any[],
    codeSnapshot: CodeFileSnapshot[],
    sessionTime: number
  ) => Promise<SubmissionResponsePayload | null>;
}

export function ChallengeWorkspace({ task, onSubmit, stubCommands = false }: ChallengeWorkspaceProps) {
  const [currentFile, setCurrentFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [showBootSequence, setShowBootSequence] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponsePayload | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();
  const [hasTestScript, setHasTestScript] = useState<boolean>(false);

  const detectTestScript = (pkgContent: any) => {
    try {
      let parsed: any = pkgContent;
      if (typeof pkgContent === 'string') {
        parsed = JSON.parse(pkgContent);
      }
      if (pkgContent && typeof pkgContent === 'object' && 'content' in pkgContent) {
        parsed = JSON.parse(pkgContent.content as string);
      }
      setHasTestScript(Boolean(parsed?.scripts?.test));
    } catch {
      setHasTestScript(false);
    }
  };

  const { isReady, isBooting, bootError, loadTask, runCommand, writeFile, readFile } =
    useWebContainer(false);

  const {
    isRecording,
    startRecording,
    stopAndGetEvents,
    getEventCount,
  } = useRecorder({ autoStart: false });

  // Initialize workspace
  useEffect(() => {
    if (isReady && task) {
      initializeWorkspace();
    }
  }, [isReady, task]);

  const initializeWorkspace = async () => {
    try {
      await loadTask(task);

      // Find first editable file (not package.json or README)
      const editableFiles = Object.keys(task.files).filter(
        (name) => !name.includes('package.json') && !name.includes('README')
      );

      if (editableFiles.length > 0) {
        const firstFile = editableFiles[0];
        setCurrentFile(firstFile);
        const content = await readFile(firstFile);
        setFileContent(content);
      }

      const pkg = task.files['package.json'] as any;
      if (pkg) detectTestScript(pkg);

      // Start recording when workspace is ready
      startRecording();
    } catch (error) {
      console.error('[Workspace] Initialization failed:', error);
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to load task'}`);
    }
  };

  const handleFileChange = async (newContent: string) => {
    setFileContent(newContent);
    try {
      await writeFile(currentFile, newContent);
    } catch (error) {
      console.error('[Workspace] Write failed:', error);
    }
  };

  const handleRun = async () => {
    if (stubCommands) {
      setIsRunning(true);
      const logs = [
        '[demo] Booting sandboxed environment... Done (0.5s)\n',
        '[demo] Installing dependencies from package.json... Done (1.2s)\n',
        '[demo] Starting dev server...\n',
        'App listening on http://localhost:3000\n',
      ];
      let idx = 0;
      const interval = setInterval(() => {
        setOutput((prev) => prev + logs[idx]);
        idx += 1;
        if (idx >= logs.length) {
          clearInterval(interval);
          setIsRunning(false);
        }
      }, 200);
      return;
    }

    setIsRunning(true);
    setOutput('Running...\n');

    try {
      const process = await runCommand('npm', ['run', 'dev']);

      // Capture stdout
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            setOutput((prev) => prev + data);
          },
        })
      );

      await process.exit;
      setOutput((prev) => prev + '\nProcess completed.');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to run'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleTest = async () => {
    if (stubCommands || !hasTestScript) {
        setIsRunning(true);
        const logs = [
          'Running evaluation script: test-suite.js...',
          '✔ Test Case 1: Handles empty input... Passed',
          '✔ Test Case 2: Handles valid input... Passed',
          '✔ Test Case 3: Handles edge cases... Passed',
          'All tests passed. Congratulations!',
        ];
        let idx = 0;
        const interval = setInterval(() => {
          setOutput((prev) => prev + logs[idx] + '\n');
          idx += 1;
          if (idx >= logs.length) {
            clearInterval(interval);
            setIsRunning(false);
          }
        }, 200);
        return;
      }

    setIsRunning(true);
    setOutput('Running tests...\n');

    try {
      const process = await runCommand('npm', ['test']);

      process.output.pipeTo(
        new WritableStream({
          write(data) {
            setOutput((prev) => prev + data);
          },
        })
      );

      await process.exit;
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Failed to run tests'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const captureCodeSnapshot = async (): Promise<CodeFileSnapshot[]> => {
    const snapshots: CodeFileSnapshot[] = [];
    const fileNames = Object.keys(task.files);

    for (const filename of fileNames) {
      try {
        const content = await readFile(filename);
        snapshots.push({ path: filename, content });
      } catch (error) {
        console.error(`[Workspace] Failed to read file ${filename}:`, error);
      }
    }

    return snapshots;
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const events = stopAndGetEvents();
      const sessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);
      const codeSnapshot = await captureCodeSnapshot();

      console.log(
        `[Workspace] Submitting ${events.length} events, ${codeSnapshot.length} files, session time: ${sessionTime}s`
      );

      const submission = await onSubmit(events, codeSnapshot, sessionTime);

      if (submission) {
        setSubmissionResult(submission);
        // persist for success page
        if (typeof window !== 'undefined') {
          const user = getMockUser();
          localStorage.setItem(
            'shadowwork_last_submission',
            JSON.stringify({
              title: task.title,
              points: submission.points,
              offerQualified: submission.offerQualified,
              evaluation: submission.evaluation,
              recordingUrl: submission.recordingUrl,
              reviewSummary: (submission as any).reviewSummary,
            })
          );

          // append to submissions list for local demo/review
          try {
            const existing = localStorage.getItem('shadowwork_submissions');
            const list = existing ? JSON.parse(existing) : [];
            list.unshift({
              id: `local-${Date.now()}`,
              task_title: task.title,
              points_earned: submission.points?.earned,
              review_summary: (submission as any).reviewSummary,
              evaluation_json: submission.evaluation,
              recording_url: submission.recordingUrl,
              user_email: user?.email,
              created_at: new Date().toISOString(),
            });
            localStorage.setItem('shadowwork_submissions', JSON.stringify(list.slice(0, 50)));
          } catch {}
        }
        router.push('/success');
      } else {
        setOutput('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('[Workspace] Submission failed:', error);
      setOutput(
        `Submission Error: ${error instanceof Error ? error.message : 'Failed to submit challenge'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bootError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">WebContainer Error</h2>
          <p className="text-gray-700 mb-4">{bootError}</p>
          <p className="text-sm text-gray-500">
            Note: WebContainers require Cross-Origin-Isolation headers.
            Make sure middleware.ts is configured correctly.
          </p>
        </div>
      </div>
    );
  }

  if (isBooting || !isReady) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Booting WebContainer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto h-screen flex flex-col gap-4 px-6 py-6">
        {/* Header */}
        <div
          className={`flex items-center justify-between rounded-2xl px-6 py-4 backdrop-blur shadow-xl ${
            isDarkMode ? 'border border-slate-800 bg-slate-900/70' : 'border border-slate-200 bg-white/80'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg" />
            <div>
              <p className={`text-xs uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Live challenge
              </p>
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>{task.title}</h1>
              <div className={`mt-1 flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className={`rounded-full px-2 py-1 text-[11px] ${isDarkMode ? 'border border-slate-800/80' : 'border border-slate-200'}`}>
                  {task.category}
                </span>
                <span className={`rounded-full px-2 py-1 text-[11px] ${isDarkMode ? 'border border-slate-800/80' : 'border border-slate-200'}`}>
                  Difficulty {task.difficulty}/100
                </span>
                <span className={`rounded-full px-2 py-1 text-[11px] ${isDarkMode ? 'border border-slate-800/80' : 'border border-slate-200'}`}>
                  ~{task.estimatedTime || 45} mins
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CountdownTimer 
              initialMinutes={task.estimatedTime || 45}
              onTimeout={() => console.log('[Timer] Time is up!')}
            />

            {isRecording && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-200">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="text-sm font-semibold">
                  REC {String(Math.floor((Date.now() - sessionStartTime) / 1000 / 60)).padStart(2, '0')}:
                  {String(Math.floor((Date.now() - sessionStartTime) / 1000 % 60)).padStart(2, '0')}
                </span>
                <span className="text-xs text-emerald-100/80">
                  {getEventCount()} events
                </span>
              </div>
            )}

            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition hover:-translate-y-px disabled:opacity-60 ${
                isDarkMode
                  ? 'border border-slate-800 bg-slate-800/80 text-slate-100 hover:border-slate-700 hover:bg-slate-700/80'
                  : 'border border-slate-200 bg-slate-100 text-slate-900 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={handleTest}
              disabled={isRunning}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition hover:-translate-y-px disabled:opacity-60 ${
                isDarkMode
                  ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-50 hover:border-emerald-400 hover:bg-emerald-500/20'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              Test
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition hover:-translate-y-px disabled:opacity-60 ${
                isDarkMode
                  ? 'border border-indigo-500/30 bg-indigo-500/15 text-indigo-50 hover:border-indigo-400 hover:bg-indigo-500/25'
                  : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition hover:-translate-y-px ${
                isDarkMode
                  ? 'border border-slate-800 bg-slate-800/70 text-slate-100 hover:border-slate-700 hover:bg-slate-700/80'
                  : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 overflow-hidden rounded-2xl backdrop-blur shadow-2xl ${
            isDarkMode ? 'border border-slate-800 bg-slate-900/60' : 'border border-slate-200 bg-white'
          }`}
        >
          <div className="flex h-full">
            {/* Sidebar - File List */}
            <div
              className={`w-56 ${
                isDarkMode
                  ? 'border-r border-slate-800 bg-slate-900/80 text-slate-200'
                  : 'border-r border-slate-200 bg-slate-100 text-slate-800'
              }`}
            >
              <div className={`px-4 py-3 ${isDarkMode ? 'border-b border-slate-800/80' : 'border-b border-slate-200'}`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Files
                </h3>
              </div>
              {Object.keys(task.files).map((filename) => (
                <button
                  key={filename}
                  onClick={() => {
                    setCurrentFile(filename);
                    readFile(filename).then(setFileContent);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    currentFile === filename
                      ? isDarkMode
                        ? 'bg-slate-800 text-slate-50 border-l-2 border-indigo-400'
                        : 'bg-white text-indigo-700 border-l-2 border-indigo-400'
                      : isDarkMode
                        ? 'text-slate-300 hover:bg-slate-800/80'
                        : 'text-slate-700 hover:bg-white'
                  }`}
                >
                  {filename}
                </button>
              ))}
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col">
              <div
                className={`flex items-center justify-between border-b px-4 py-3 text-sm ${
                  isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/90'
                }`}
              >
                <span className={`font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {currentFile || 'No file selected'}
                </span>
                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Autosaves to sandbox</span>
              </div>
              <div className="flex-1">
                <CodeEditor
                  value={fileContent}
                  onChange={handleFileChange}
                  language={getLanguageFromFilename(currentFile)}
                  theme={isDarkMode ? 'dark' : 'light'}
                />
              </div>
            </div>

            {/* Output Panel */}
            <div
              className={`w-96 flex flex-col ${
                isDarkMode
                  ? 'border-l border-slate-800 bg-slate-900/80 text-slate-200'
                  : 'border-l border-slate-200 bg-white text-slate-800'
              }`}
            >
              <div
                className={`px-4 py-3 text-sm font-semibold ${
                  isDarkMode ? 'border-b border-slate-800 bg-slate-900' : 'border-b border-slate-200 bg-white'
                }`}
              >
                Terminal
              </div>
              <div className="flex-1 overflow-auto p-4">
                {showBootSequence && !output && (
                  <TerminalBootSequence 
                    onComplete={() => {
                      setShowBootSequence(false);
                      setSessionStartTime(Date.now());
                    }}
                  />
                )}
                {output && (
                  <pre className={`text-xs font-mono ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{output}</pre>
                )}
                {!output && !showBootSequence && (
                  <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Ready. Awaiting commands...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function getLanguageFromFilename(filename: string): string {
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.md')) return 'markdown';
  return 'plaintext';
}
