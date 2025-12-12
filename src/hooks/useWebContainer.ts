import { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import type { Task } from '@/types';

/**
 * Hook for managing WebContainer instance
 * 
 * WebContainer provides a Node.js runtime in the browser,
 * allowing users to run real code challenges.
 */

export function useWebContainer() {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const containerRef = useRef<WebContainer | null>(null);

  useEffect(() => {
    // Boot WebContainer on mount
    bootContainer();

    return () => {
      // Cleanup on unmount
      if (containerRef.current) {
        containerRef.current.teardown();
      }
    };
  }, []);

  const bootContainer = async () => {
    if (containerRef.current || isBooting) {
      return;
    }

    console.log('[WebContainer] Booting...');
    setIsBooting(true);
    setBootError(null);

    try {
      const instance = await WebContainer.boot();
      containerRef.current = instance;
      setContainer(instance);
      console.log('[WebContainer] Boot successful');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to boot WebContainer';
      console.error('[WebContainer] Boot failed:', message);
      setBootError(message);
    } finally {
      setIsBooting(false);
    }
  };

  const loadTask = async (task: Task) => {
    if (!containerRef.current) {
      throw new Error('WebContainer not ready');
    }

    console.log('[WebContainer] Loading task files...');

    // Mount the file system with task files
    const files: Record<string, any> = {};

    for (const [filename, content] of Object.entries(task.files)) {
      if (filename === 'package.json') {
        files[filename] = {
          file: {
            contents: JSON.stringify(content, null, 2),
          },
        };
      } else if (typeof content === 'object' && 'content' in content) {
        files[filename] = {
          file: {
            contents: content.content,
          },
        };
      }
    }

    await containerRef.current.mount(files);

    // Install dependencies
    console.log('[WebContainer] Installing dependencies...');
    const installProcess = await containerRef.current.spawn('npm', ['install']);
    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error('npm install failed');
    }

    console.log('[WebContainer] Task loaded successfully');
  };

  const runCommand = async (command: string, args: string[] = []) => {
    if (!containerRef.current) {
      throw new Error('WebContainer not ready');
    }

    console.log(`[WebContainer] Running: ${command} ${args.join(' ')}`);
    const process = await containerRef.current.spawn(command, args);
    return process;
  };

  const writeFile = async (path: string, content: string) => {
    if (!containerRef.current) {
      throw new Error('WebContainer not ready');
    }

    await containerRef.current.fs.writeFile(path, content);
  };

  const readFile = async (path: string): Promise<string> => {
    if (!containerRef.current) {
      throw new Error('WebContainer not ready');
    }

    const content = await containerRef.current.fs.readFile(path, 'utf-8');
    return content;
  };

  return {
    container,
    isBooting,
    bootError,
    isReady: !!container && !isBooting,
    loadTask,
    runCommand,
    writeFile,
    readFile,
  };
}

