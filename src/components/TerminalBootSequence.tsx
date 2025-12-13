'use client';

import { useState, useEffect } from 'react';

/**
 * Terminal Boot Sequence Component
 * 
 * Simulates a realistic server boot-up sequence
 * Creates immersion and makes the experience feel more authentic
 */

const BOOT_MESSAGES = [
  '> System initializing...',
  '> Connecting to ShadowWork container...',
  '> Loading environment variables...',
  '> Mounting virtual file system...',
  '> Starting Node.js runtime...',
  '> Server ready on port 3000.',
  '> Happy coding! 🚀',
];

export function TerminalBootSequence({ onComplete }: { onComplete?: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < BOOT_MESSAGES.length) {
        setLines((prev) => [...prev, BOOT_MESSAGES[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        if (onComplete) {
          setTimeout(onComplete, 500);
        }
      }
    }, 150); // 150ms between each line for smooth typing effect

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="font-mono text-xs space-y-1">
      {lines.map((line, index) => (
        <div 
          key={index}
          className={`${
            index === lines.length - 1 && !isComplete
              ? 'text-green-400 animate-pulse'
              : 'text-gray-400'
          }`}
        >
          {line}
          {index === lines.length - 1 && !isComplete && (
            <span className="inline-block w-2 h-3 bg-green-400 ml-1 animate-pulse"></span>
          )}
        </div>
      ))}
    </div>
  );
}

