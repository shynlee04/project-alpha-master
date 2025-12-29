/**
 * @fileoverview Quiz timer hook with pause/resume support
 * @module hooks/useQuizTimer
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Quiz timer state and actions
 */
interface QuizTimer {
  elapsedSeconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  formatTime: (seconds?: number) => string;
}

/**
 * Timer hook for quiz taking
 * Provides counting, pause/resume, and formatting
 */
export function useQuizTimer(initialSeconds = 0): QuizTimer {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Start the timer
  const start = useCallback(() => {
    if (isRunning) return;

    lastTickRef.current = Date.now();
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta > 0) {
        setElapsedSeconds((prev) => prev + delta);
        lastTickRef.current = now;
      }
    }, 100);
  }, [isRunning]);

  // Pause the timer
  const pause = useCallback(() => {
    if (!isRunning) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, [isRunning]);

  // Reset the timer
  const reset = useCallback(() => {
    pause();
    setElapsedSeconds(initialSeconds);
  }, [initialSeconds, pause]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = useCallback((seconds = elapsedSeconds): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    elapsedSeconds,
    isRunning,
    start,
    pause,
    reset,
    formatTime,
  };
}

/**
 * Count-down timer hook for quizzes with time limits
 */
interface CountdownTimer extends QuizTimer {
  remainingSeconds: number;
  isExpired: boolean;
  setTimeLimit: (seconds: number) => void;
}

export function useQuizCountdown(initialLimit?: number): CountdownTimer {
  const [limitSeconds, setLimitSeconds] = useState(initialLimit ?? 0);
  const timer = useQuizTimer(0);

  const remainingSeconds = Math.max(0, limitSeconds - timer.elapsedSeconds);
  const isExpired = limitSeconds > 0 && remainingSeconds <= 0;

  // Auto-pause when expired
  useEffect(() => {
    if (isExpired && timer.isRunning) {
      timer.pause();
    }
  }, [isExpired, timer.isRunning, timer]);

  const setTimeLimit = useCallback((seconds: number) => {
    setLimitSeconds(seconds);
    timer.reset();
  }, [timer]);

  return {
    ...timer,
    remainingSeconds,
    isExpired,
    setTimeLimit,
  };
}
