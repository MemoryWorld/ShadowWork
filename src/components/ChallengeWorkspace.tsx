'use client';

import { useState, useEffect } from 'react';
import { CodeEditor } from './CodeEditor';
import { useWebContainer } from '@/hooks/useWebContainer';
import { useRecorder } from '@/hooks/useRecorder';
import type { Task } from '@/types';

/**
 * Challenge Workspace Component
 * 
 * The main coding environment where users solve challenges.
 */

interface ChallengeWorkspaceProps {
  task: Task;
  onSubmit: (events: any[]) => void;
}

export function ChallengeWorkspace({ task, onSubmit }: ChallengeWorkspaceProps) {
  const [currentFile, setCurrentFile] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const { isReady, isBooting, bootError, loadTask, runCommand, writeFile, readFile } =
    useWebContainer();

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

  const handleSubmit = () => {
    const events = stopAndGetEvents();
    console.log(`[Workspace] Submitting ${events.length} events`);
    onSubmit(events);
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
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {task.category} • Difficulty: {task.difficulty}/100 • {task.estimatedTime} min
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRecording && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Recording ({getEventCount()} events)
              </div>
            )}
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button
              onClick={handleTest}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File List */}
        <div className="w-48 bg-gray-900 text-gray-200 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-xs font-semibold uppercase">Files</h3>
          </div>
          {Object.keys(task.files).map((filename) => (
            <button
              key={filename}
              onClick={() => {
                setCurrentFile(filename);
                readFile(filename).then(setFileContent);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 ${
                currentFile === filename ? 'bg-gray-800 text-white' : ''
              }`}
            >
              {filename}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gray-800 text-white px-4 py-2 text-sm">
            {currentFile || 'No file selected'}
          </div>
          <div className="flex-1">
            <CodeEditor
              value={fileContent}
              onChange={handleFileChange}
              language={getLanguageFromFilename(currentFile)}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="w-96 bg-gray-900 text-gray-200 flex flex-col">
          <div className="bg-gray-800 px-4 py-2 text-sm font-semibold">Output</div>
          <pre className="flex-1 overflow-auto p-4 text-xs font-mono">{output || 'No output yet.'}</pre>
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

