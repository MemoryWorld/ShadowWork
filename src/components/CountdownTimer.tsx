'use client';

import { useState, useEffect } from 'react';

/**
 * Countdown Timer Component
 * 
 * Creates urgency by showing remaining time
 * Turns red when under 5 minutes
 */

interface CountdownTimerProps {
  initialMinutes?: number;
  onTimeout?: () => void;
}

export function CountdownTimer({ 
  initialMinutes = 45, 
  onTimeout 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && onTimeout) {
        onTimeout();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Formatting: Always 2 digits
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Color logic: red when under 5 minutes
  const isUrgent = timeLeft < 300; // 5 minutes
  const isCritical = timeLeft < 60; // 1 minute

  return (
    <div className="flex items-center gap-2">
      <svg 
        className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-gray-400'}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span 
        className={`font-mono text-sm font-semibold ${
          isCritical 
            ? 'text-red-600 animate-pulse' 
            : isUrgent 
            ? 'text-red-500' 
            : 'text-gray-700'
        }`}
      >
        {formattedTime}
      </span>
      {isUrgent && (
        <span className="text-xs text-red-500 animate-pulse">
          {isCritical ? '⚠️' : '⏰'}
        </span>
      )}
    </div>
  );
}

