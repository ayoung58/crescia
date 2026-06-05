// Elapsed-time stopwatch hook for optional per-question timing in study sessions.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseStopwatchResult {
  elapsedSeconds: number;
  formattedTime: string;
  reset: () => void;
  isRunning: boolean;
}

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Counts elapsed seconds while enabled; resets when enabled toggles on.
 */
export function useStopwatch(enabled = true): UseStopwatchResult {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((): void => {
    clearTimer();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [clearTimer]);

  const reset = useCallback((): void => {
    setElapsedSeconds(0);
    if (enabled) {
      startTimer();
    }
  }, [enabled, startTimer]);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      setIsRunning(false);
      return;
    }

    setElapsedSeconds(0);
    startTimer();
    return () => {
      clearTimer();
    };
  }, [enabled, startTimer, clearTimer]);

  return {
    elapsedSeconds,
    formattedTime: formatElapsed(elapsedSeconds),
    reset,
    isRunning,
  };
}
