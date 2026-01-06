/**
 * @fileoverview File Diff Hook
 * @module hooks/useFileDiff
 *
 * Custom hook for managing file diff state and operations.
 * Provides diff generation, caching, and view management.
 *
 * @story S-029 File Comparison and Diff Viewer
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { generateDiff, type DiffResult, ChangeType } from '@/lib/diff/diff-generator';

/**
 * File comparison pair
 */
export interface FileComparison {
  /** Original file path */
  oldPath: string;
  /** Modified file path */
  newPath: string;
  /** Original content */
  oldContent: string;
  /** Modified content */
  newContent: string;
}

/**
 * Diff state
 */
interface DiffState {
  /** Current diff result */
  diff: DiffResult | null;
  /** Whether diff is being computed */
  isComputing: boolean;
  /** Computation error */
  error: Error | null;
  /** Cache key for memoization */
  cacheKey: string;
}

/**
 * Options for useFileDiff hook
 */
export interface UseFileDiffOptions {
  /** Enable diff caching (default: true) */
  enableCache?: boolean;
  /** Debounce delay in ms for diff computation (default: 100) */
  debounceMs?: number;
}

/**
 * Hook return value
 */
interface UseFileDiffReturn {
  /** Current diff result */
  diff: DiffResult | null;
  /** Whether diff is being computed */
  isComputing: boolean;
  /** Computation error */
  error: Error | null;
  /** Compute diff for given comparison */
  computeDiff: (comparison: FileComparison) => void;
  /** Clear current diff */
  clearDiff: () => void;
  /** Get diff statistics */
  getStats: () => { additions: number; deletions: number; modifications: number } | null;
  /** Navigate to next change */
  goToNextChange: () => void;
  /** Navigate to previous change */
  goToPreviousChange: () => void;
  /** Get current line index */
  currentLineIndex: number;
  /** Go to specific line */
  goToLine: (index: number) => void;
}

/**
 * Custom hook for file diff management
 *
 * Features:
 * - Diff computation with caching
 * - Debounced computation for performance
 * - Navigation between changes
 * - Error handling
 * - Memory-efficient for large files
 *
 * @param options - Hook options
 * @returns Diff state and operations
 *
 * @example
 * ```tsx
 * const { diff, computeDiff, goToNextChange, goToPreviousChange } = useFileDiff({
 *   enableCache: true,
 *   debounceMs: 100,
 * });
 *
 * // Compute diff
 * computeDiff({
 *   oldPath: '/path/to/original.txt',
 *   newPath: '/path/to/modified.txt',
 *   oldContent: 'line1\nline2',
 *   newContent: 'line1\nline2-modified',
 * });
 * ```
 */
export function useFileDiff(options: UseFileDiffOptions = {}): UseFileDiffReturn {
  const {
    enableCache = true,
    debounceMs = 100,
  } = options;

  // State
  const [state, setState] = useState<DiffState>({
    diff: null,
    isComputing: false,
    error: null,
    cacheKey: '',
  });

  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Refs for debouncing and caching
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, DiffResult>>(new Map());

  /**
   * Generate cache key from comparison
   */
  const getCacheKey = useCallback((comparison: FileComparison): string => {
    return `${comparison.oldPath}:${comparison.newPath}:${comparison.oldContent.length}:${comparison.newContent.length}`;
  }, []);

  /**
   * Compute diff for given comparison
   */
  const computeDiff = useCallback((comparison: FileComparison) => {
    const cacheKey = getCacheKey(comparison);

    // Check cache first
    if (enableCache && cacheRef.current.has(cacheKey)) {
      const cachedDiff = cacheRef.current.get(cacheKey)!;
      setState({
        diff: cachedDiff,
        isComputing: false,
        error: null,
        cacheKey,
      });
      setCurrentLineIndex(0);
      return;
    }

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set loading state
    setState(prev => ({
      ...prev,
      isComputing: true,
      error: null,
    }));

    // Debounce computation
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        const diffResult = generateDiff(comparison.oldContent, comparison.newContent);

        // Cache result
        if (enableCache) {
          cacheRef.current.set(cacheKey, diffResult);
        }

        setState({
          diff: diffResult,
          isComputing: false,
          error: null,
          cacheKey,
        });
        setCurrentLineIndex(0);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to compute diff');
        setState(prev => ({
          ...prev,
          isComputing: false,
          error,
        }));
      }
    }, debounceMs);
  }, [enableCache, debounceMs, getCacheKey]);

  /**
   * Clear current diff and cache
   */
  const clearDiff = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    setState({
      diff: null,
      isComputing: false,
      error: null,
      cacheKey: '',
    });
    setCurrentLineIndex(0);

    // Optionally clear cache
    if (enableCache) {
      cacheRef.current.clear();
    }
  }, [enableCache]);

  /**
   * Get diff statistics
   */
  const getStats = useCallback((): ReturnType<UseFileDiffReturn['getStats']> => {
    if (!state.diff) {
      return null;
    }

    return {
      additions: state.diff.stats.added,
      deletions: state.diff.stats.removed,
      modifications: state.diff.stats.modified,
    };
  }, [state.diff]);

  /**
   * Get indices of changed lines
   */
  const getChangeIndices = useCallback((): number[] => {
    if (!state.diff) {
      return [];
    }

    const indices: number[] = [];
    state.diff.lines.forEach((line, index) => {
      if (line.type !== ChangeType.UNCHANGED) {
        indices.push(index);
      }
    });

    return indices;
  }, [state.diff]);

  /**
   * Navigate to next change
   */
  const goToNextChange = useCallback(() => {
    const changeIndices = getChangeIndices();
    if (changeIndices.length === 0) {
      return;
    }

    // Find next change after current position
    const nextChange = changeIndices.find(index => index > currentLineIndex);

    if (nextChange !== undefined) {
      setCurrentLineIndex(nextChange);
    } else {
      // Wrap to first change
      setCurrentLineIndex(changeIndices[0]);
    }
  }, [currentLineIndex, getChangeIndices]);

  /**
   * Navigate to previous change
   */
  const goToPreviousChange = useCallback(() => {
    const changeIndices = getChangeIndices();
    if (changeIndices.length === 0) {
      return;
    }

    // Find previous change before current position
    const reversedIndices = [...changeIndices].reverse();
    const previousChange = reversedIndices.find(index => index < currentLineIndex);

    if (previousChange !== undefined) {
      setCurrentLineIndex(previousChange);
    } else {
      // Wrap to last change
      setCurrentLineIndex(changeIndices[changeIndices.length - 1]);
    }
  }, [currentLineIndex, getChangeIndices]);

  /**
   * Go to specific line
   */
  const goToLine = useCallback((index: number) => {
    if (!state.diff) {
      return;
    }

    const maxIndex = state.diff.lines.length - 1;
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentLineIndex(clampedIndex);
  }, [state.diff]);

  return {
    diff: state.diff,
    isComputing: state.isComputing,
    error: state.error,
    computeDiff,
    clearDiff,
    getStats,
    goToNextChange,
    goToPreviousChange,
    currentLineIndex,
    goToLine,
  };
}
