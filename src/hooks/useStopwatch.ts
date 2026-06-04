"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function useStopwatch(enabled = true) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [clearTimer]);

  const reset = useCallback(() => {
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
