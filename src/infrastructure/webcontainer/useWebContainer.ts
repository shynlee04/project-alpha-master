/**
 * @fileoverview WebContainer Hook
 * @module infrastructure/webcontainer/useWebContainer
 *
 * **EPIC-0.6-05**: Boot WebContainer on Terminal Mount
 *
 * Custom hook for managing WebContainer lifecycle.
 * Provides boot status, error handling, and singleton instance management.
 *
 * Features:
 * - Boot WebContainer on demand
 * - Status tracking (idle, booting, ready, error)
 * - Singleton pattern (only one instance)
 * - Error handling with retry
 *
 * @epic EPIC-0.6
 * @story 0.6-05
 * @team Team B
 * @created 2026-01-27
 */

import { useState, useCallback, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import { boot as bootWebContainer, isBooted, getInstance } from '@/lib/webcontainer/manager';

/**
 * WebContainer status states
 */
type WebContainerStatus = 'idle' | 'booting' | 'ready' | 'error';

/**
 * WebContainer state
 */
interface WebContainerState {
  /** Current status of WebContainer */
  status: WebContainerStatus;

  /** Error message if status is 'error' */
  error: string | null;

  /** Timestamp when boot started */
  bootStartedAt: number | null;

  /** Timestamp when boot completed */
  bootCompletedAt: number | null;
}

/**
 * useWebContainer hook
 *
 * Manages WebContainer lifecycle with status tracking.
 * Ensures only one boot attempt occurs (singleton pattern).
 *
 * @returns Object containing state, boot function, and instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state, boot, instance } = useWebContainer();
 *
 *   useEffect(() => {
 *     boot();
 *   }, [boot]);
 *
 *   if (state.status === 'booting') {
 *     return <LoadingSpinner />;
 *   }
 *
 *   if (state.status === 'error') {
 *     return <ErrorMessage error={state.error} />;
 *   }
 *
 *   return <ReadyState instance={instance} />;
 * }
 * ```
 */
export function useWebContainer() {
  const [state, setState] = useState<WebContainerState>({
    status: 'idle',
    error: null,
    bootStartedAt: null,
    bootCompletedAt: null,
  });

  // Track boot attempt to avoid duplicate boots
  const bootAttemptRef = useRef(false);

  // Track WebContainer instance
  const [instance, setInstance] = useState<WebContainer | null>(null);

  /**
   * Boot WebContainer
   *
   * Boots WebContainer if not already booted or booting.
   * Tracks boot timing and errors.
   */
  const boot = useCallback(async () => {
    // Check if already booted
    if (isBooted()) {
      setState({
        status: 'ready',
        error: null,
        bootStartedAt: null,
        bootCompletedAt: Date.now(),
      });
      console.log('[useWebContainer] Already booted');
      return;
    }

    // Check if boot in progress
    if (bootAttemptRef.current) {
      console.log('[useWebContainer] Boot already in progress');
      return;
    }

    // Set booting state
    bootAttemptRef.current = true;
    setState({
      status: 'booting',
      error: null,
      bootStartedAt: Date.now(),
      bootCompletedAt: null,
    });
    console.log('[useWebContainer] Starting boot...');

    try {
      // Boot WebContainer
      await bootWebContainer();

      const bootCompletedAt = Date.now();
      const bootTime = state.bootStartedAt ? bootCompletedAt - state.bootStartedAt : 0;
      const wcInstance = getInstance();

      setState({
        status: 'ready',
        error: null,
        bootStartedAt: state.bootStartedAt,
        bootCompletedAt,
      });

      setInstance(wcInstance);

      console.log(`[useWebContainer] Boot completed in ${bootTime}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setState({
        status: 'error',
        error: errorMessage,
        bootStartedAt: state.bootStartedAt,
        bootCompletedAt: null,
      });

      console.error('[useWebContainer] Boot failed:', errorMessage);

      // Allow retry
      bootAttemptRef.current = false;
    }
  }, [state.bootStartedAt]);

  return {
    state,
    boot,
    instance,
  };
}
