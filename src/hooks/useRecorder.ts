import { useEffect, useRef, useState } from 'react';
import * as rrweb from 'rrweb';
import type { RecordingEvent } from '@/types';

/**
 * Module C: Optimized rrweb Recorder
 * 
 * Features:
 * 1. Sampling: Throttle mouse movement to 200ms
 * 2. Checkpointing: Create snapshot every 200 events
 * 3. Hard Limit: Prevent memory overflow with max 5000 events
 * 
 * This prevents the recording JSON from becoming too large.
 */

interface UseRecorderOptions {
  autoStart?: boolean;
  maxEvents?: number;
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const { autoStart = false, maxEvents = 5000 } = options;

  const [isRecording, setIsRecording] = useState(false);
  const eventsRef = useRef<RecordingEvent[]>([]);
  const stopFnRef = useRef<(() => void) | null>(null);

  const startRecording = () => {
    if (isRecording) {
      console.warn('[useRecorder] Already recording');
      return;
    }

    console.log('[useRecorder] Starting recording with optimization');
    eventsRef.current = [];

    const stopFn = rrweb.record({
      emit(event) {
        // Hard limit to prevent memory overflow
        if (eventsRef.current.length >= maxEvents) {
          // Remove oldest events to make room (FIFO)
          eventsRef.current.shift();
        }
        eventsRef.current.push(event as RecordingEvent);
      },
      // Sampling configuration to reduce data volume
      sampling: {
        // Throttle mouse movement to every 200ms
        mousemove: true,
        mouseInteraction: {
          MouseMove: 200, // ms
        },
        // Throttle scroll events
        scroll: 150, // ms
        // Throttle input events
        input: 'last', // Only record the last input value
      },
      // Create a full snapshot every 200 events to enable seeking
      checkoutEveryNth: 200,
      // Performance optimizations
      recordCanvas: false, // Disable canvas recording (not needed for code editor)
      inlineImages: false, // Don't inline images as base64
      collectFonts: false, // Don't collect fonts
    });

    stopFnRef.current = stopFn;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!isRecording || !stopFnRef.current) {
      console.warn('[useRecorder] Not recording');
      return [];
    }

    console.log('[useRecorder] Stopping recording');
    stopFnRef.current();
    stopFnRef.current = null;
    setIsRecording(false);

    return eventsRef.current;
  };

  const stopAndGetEvents = (): RecordingEvent[] => {
    return stopRecording();
  };

  const getEventCount = () => eventsRef.current.length;

  const getDataSize = () => {
    // Calculate approximate size in bytes
    const json = JSON.stringify(eventsRef.current);
    return new Blob([json]).size;
  };

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startRecording();
    }

    // Cleanup on unmount
    return () => {
      if (stopFnRef.current) {
        stopFnRef.current();
      }
    };
  }, [autoStart]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    stopAndGetEvents,
    getEventCount,
    getDataSize,
  };
}

