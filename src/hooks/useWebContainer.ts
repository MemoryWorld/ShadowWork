import { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import type { Task } from '@/types';

/**
 * Hook for managing WebContainer instance
 * 
 * WebContainer provides a Node.js runtime in the browser,
 * allowing users to run real code challenges.
 * 
 * CRITICAL: Uses global singleton to prevent "Unable to create more instances" error
 */

// Global singleton instance - prevents multiple WebContainer instances
let globalWebContainerInstance: WebContainer | null = null;
let globalBootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
  const [container, setContainer] = useState<WebContainer | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Boot WebContainer on mount
    bootContainer();

    return () => {
      isMounted.current = false;
      // Note: We DON'T teardown the global instance on unmount
      // to prevent "Unable to create more instances" errors
      // The instance will be reused across component remounts
    };
  }, []);

  const bootContainer = async () => {
    // If already booted, just use the existing instance
    if (globalWebContainerInstance) {
      console.log('[WebContainer] Using existing instance');
      if (isMounted.current) {
        setContainer(globalWebContainerInstance);
      }
      return;
    }

    // If currently booting, wait for that promise
    if (globalBootPromise) {
      console.log('[WebContainer] Waiting for existing boot process...');
      if (isMounted.current) {
        setIsBooting(true);
      }
      try {
        const instance = await globalBootPromise;
        if (isMounted.current) {
          setContainer(instance);
          setIsBooting(false);
        }
      } catch (error) {
        if (isMounted.current) {
          const message = error instanceof Error ? error.message : 'Failed to boot WebContainer';
          setBootError(message);
          setIsBooting(false);
        }
      }
      return;
    }

    // Start new boot process
    console.log('[WebContainer] Booting new instance...');
    if (isMounted.current) {
      setIsBooting(true);
      setBootError(null);
    }

    globalBootPromise = WebContainer.boot();

    try {
      const instance = await globalBootPromise;
      globalWebContainerInstance = instance;
      
      if (isMounted.current) {
        setContainer(instance);
        console.log('[WebContainer] Boot successful');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to boot WebContainer';
      console.error('[WebContainer] Boot failed:', message);
      
      if (isMounted.current) {
        setBootError(message);
      }
      
      // Clear the failed boot promise so we can retry
      globalBootPromise = null;
    } finally {
      if (isMounted.current) {
        setIsBooting(false);
      }
    }
  };

  const loadTask = async (task: Task) => {
    if (!globalWebContainerInstance) {
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

    await globalWebContainerInstance.mount(files);

    // Install dependencies
    console.log('[WebContainer] Installing dependencies...');
    const installProcess = await globalWebContainerInstance.spawn('npm', ['install']);
    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error('npm install failed');
    }

    console.log('[WebContainer] Task loaded successfully');
  };

  const runCommand = async (command: string, args: string[] = []) => {
    if (!globalWebContainerInstance) {
      throw new Error('WebContainer not ready');
    }

    console.log(`[WebContainer] Running: ${command} ${args.join(' ')}`);
    const process = await globalWebContainerInstance.spawn(command, args);
    return process;
  };

  const writeFile = async (path: string, content: string) => {
    if (!globalWebContainerInstance) {
      throw new Error('WebContainer not ready');
    }

    await globalWebContainerInstance.fs.writeFile(path, content);
  };

  const readFile = async (path: string): Promise<string> => {
    if (!globalWebContainerInstance) {
      throw new Error('WebContainer not ready');
    }

    const content = await globalWebContainerInstance.fs.readFile(path, 'utf-8');
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

