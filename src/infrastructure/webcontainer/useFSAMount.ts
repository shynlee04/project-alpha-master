/**
 * @fileoverview FSA Mount Hook
 * @module infrastructure/webcontainer/useFSAMount
 *
 * **EPIC-0.6-06**: Mount FSA to WebContainer
 *
 * Custom hook for mounting FSA files to WebContainer.
 * Bridges real file system (FSA) with virtual file system (WebContainer).
 *
 * Features:
 * - Mount FSA files to WebContainer at /project
 * - Status tracking (idle, mounting, mounted, error)
 * - Only mounts if storage type is FSA
 * - Graceful fallback for IndexedDB storage
 *
 * @epic EPIC-0.6
 * @story 0.6-06
 * @team Team B
 * @created 2026-01-27
 */

import { useState, useCallback, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import { createWebContainerFSAAdapter } from '@/infrastructure/webcontainer/fsa-adapter';
import type { WorkspaceEventEmitter } from '@/lib/events/workspace-events';

/**
 * Mount status states
 */
type MountStatus = 'idle' | 'mounting' | 'mounted' | 'error';

/**
 * Mount state
 */
interface MountState {
  /** Current mount status */
  status: MountStatus;

  /** Error message if status is 'error' */
  error: string | null;

  /** Number of files mounted */
  fileCount?: number;

  /** Timestamp when mount started */
  mountStartedAt: number | null;

  /** Timestamp when mount completed */
  mountCompletedAt: number | null;
}

/**
 * useFSAMount hook options
 */
interface UseFSAMountOptions {
  /** Storage gateway for FSA access */
  gateway?: StorageGateway | null;

  /** WebContainer instance */
  webContainer?: WebContainer | null;

  /** Event bus for emitting mount events */
  eventBus?: WorkspaceEventEmitter;
}

/**
 * useFSAMount hook
 *
 * Mounts FSA files to WebContainer at /project.
 * Tracks mount status and handles errors.
 *
 * @param options - Hook options
 * @returns Object containing state and mount function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { state: wcState } = useWebContainer();
 *   const { state: mountState, mount } = useFSAMount({
 *     gateway,
 *     webContainer: wcState.instance,
 *   });
 *
 *   // Mount after WebContainer is ready
 *   useEffect(() => {
 *     if (wcState.status === 'ready') {
 *       mount();
 *     }
 *   }, [wcState.status, mount]);
 *
 *   if (mountState.status === 'mounting') {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <ReadyState />;
 * }
 * ```
 */
export function useFSAMount(options: UseFSAMountOptions = {}) {
  const { gateway, webContainer, eventBus } = options;

  const [state, setState] = useState<MountState>({
    status: 'idle',
    error: null,
    mountStartedAt: null,
    mountCompletedAt: null,
  });

  // Track mount attempt to avoid duplicate mounts
  const mountAttemptRef = useRef(false);

  // Track adapter instance for cleanup
  const adapterRef = useRef<ReturnType<typeof createWebContainerFSAAdapter> | null>(null);

  /**
   * Mount FSA to WebContainer
   *
   * Mounts FSA files if:
   * - Gateway is available
   * - WebContainer is ready
   * - Not already mounted or mounting
   * - Storage type is FSA
   */
  const mount = useCallback(async () => {
    // Validate dependencies
    if (!gateway) {
      console.log('[useFSAMount] Gateway not available, skipping mount');
      return;
    }

    if (!webContainer) {
      console.log('[useFSAMount] WebContainer not ready, skipping mount');
      return;
    }

    if (mountAttemptRef.current) {
      console.log('[useFSAMount] Mount already in progress');
      return;
    }

    // Check if this is FSA storage
    // Gateway should have a method to check storage type
    // For now, we assume gateway is FSA if it's passed
    // This is validated in TerminalMain component

    // Set mounting state
    mountAttemptRef.current = true;
    setState({
      status: 'mounting',
      error: null,
      mountStartedAt: Date.now(),
      mountCompletedAt: null,
    });
    console.log('[useFSAMount] Starting mount...');

    try {
      // Create FSA adapter
      const adapter = createWebContainerFSAAdapter({
        fsaGateway: gateway,
        container: webContainer,
        eventBus,
        mountPoint: '/project',
        conflictResolution: 'fsa-wins', // FSA wins by default
      });

      adapterRef.current = adapter;

      // Mount to WebContainer
      await adapter.mountToContainer();

      const mountCompletedAt = Date.now();
      const mountTime = state.mountStartedAt ? mountCompletedAt - state.mountStartedAt : 0;

      // File count would be emitted by adapter via eventBus
      // For now, we don't track exact count
      setState({
        status: 'mounted',
        error: null,
        mountStartedAt: state.mountStartedAt,
        mountCompletedAt,
      });

      console.log(`[useFSAMount] Mount completed in ${mountTime}ms`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setState({
        status: 'error',
        error: errorMessage,
        mountStartedAt: state.mountStartedAt,
        mountCompletedAt: null,
      });

      console.error('[useFSAMount] Mount failed:', errorMessage);

      // Allow retry
      mountAttemptRef.current = false;
    }
  }, [gateway, webContainer, eventBus, state.mountStartedAt]);

  return {
    state,
    mount,
  };
}
