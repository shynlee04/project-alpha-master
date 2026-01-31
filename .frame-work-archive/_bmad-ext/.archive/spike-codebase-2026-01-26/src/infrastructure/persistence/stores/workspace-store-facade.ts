/**
 * BACKWARD COMPATIBILITY FACADE
 *
 * Provides facade pattern to maintain compatibility with existing code
 * while transitioning to workspace-scoped stores.
 *
 * @deprecated Use createWorkspaceStore() instead
 */

import { createWorkspaceStore } from './workspace-store-factory';

// Get current workspace from route (TanStack Router)
function getCurrentWorkspace(): 'notes' | 'ide' | 'study' | 'knowledge' | 'marketing' | 'settings' {
  // Extract from URL path
  const path = window.location.pathname;

  if (path.startsWith('/ide')) return 'ide';
  if (path.startsWith('/knowledge')) return 'knowledge';
  if (path.startsWith('/study')) return 'study';
  if (path.startsWith('/settings')) return 'settings';
  if (path.startsWith('/marketing')) return 'marketing';

  return 'notes'; // Default
}

// Get current project ID from URL path
function getCurrentProjectId(): string {
  // Extract projectId from URL path: /ide/proj-123 → proj-123
  const path = window.location.pathname;
  const match = path.match(/\/(ide|notes|study|knowledge|settings|marketing)\/([^\/]+)/);

  return match ? match[2] : '';
}

/**
 * Facade for Legacy Code
 * Mimics global store behavior but uses scoped stores internally
 *
 * @example
 * ```typescript
 * // Old code (still works):
 * import { useWorkspaceStoreFacade } from '@/infrastructure/persistence/stores/workspace-store-facade';
 * useWorkspaceStoreFacade.getState().setCurrentProject('proj-1');
 *
 * // New code (recommended):
 * import { createWorkspaceStore } from '@/infrastructure/persistence/stores/workspace-store-factory';
 * const store = createWorkspaceStore('notes', 'proj-1');
 * store.getState().setCurrentProject('proj-1');
 * ```
 */
export const useWorkspaceStoreFacade = {
  getState: () => {
    const workspaceId = getCurrentWorkspace();
    const projectId = getCurrentProjectId();

    if (!projectId) {
      console.warn('[useWorkspaceStoreFacade] No project ID found in URL, returning default store');
      return createWorkspaceStore(workspaceId, 'default').getState();
    }

    return createWorkspaceStore(workspaceId, projectId).getState();
  },

  setState: (state: any) => {
    const workspaceId = getCurrentWorkspace();
    const projectId = getCurrentProjectId();

    if (!projectId) {
      console.warn('[useWorkspaceStoreFacade] No project ID found in URL, using default store');
      const store = createWorkspaceStore(workspaceId, 'default');
      return store.setState(state);
    }

    const store = createWorkspaceStore(workspaceId, projectId);
    return store.setState(state);
  },

  subscribe: (listener: any) => {
    const workspaceId = getCurrentWorkspace();
    const projectId = getCurrentProjectId();

    if (!projectId) {
      console.warn('[useWorkspaceStoreFacade] No project ID found in URL, using default store');
      const store = createWorkspaceStore(workspaceId, 'default');
      return store.subscribe(listener);
    }

    const store = createWorkspaceStore(workspaceId, projectId);
    return store.subscribe(listener);
  },
};
