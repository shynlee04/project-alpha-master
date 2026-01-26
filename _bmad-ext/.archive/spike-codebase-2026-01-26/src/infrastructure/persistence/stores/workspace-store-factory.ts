import { createStore } from 'zustand/vanilla';
import type { StoreApi } from 'zustand/vanilla';

/**
 * Workspace Store Configuration
 * Enforces composite key pattern [workspaceId + projectId]
 */
export interface WorkspaceStoreConfig {
  workspaceId: 'notes' | 'ide' | 'study' | 'knowledge' | 'marketing' | 'settings';
  projectId: string;
}

/**
 * Workspace Store State
 * Base state shared by all workspace stores
 */
export interface WorkspaceStoreState {
  currentProject: string | null;
  setCurrentProject: (projectId: string) => void;
  // Workspace-specific state will be extended per workspace
}

/**
 * Store Registry for Memoization
 * Maps composite keys to store instances
 */
const storeRegistry = new Map<string, StoreApi<WorkspaceStoreState>>();

/**
 * Create Composite Key
 * Combines workspaceId + projectId for isolation
 */
function createCompositeKey(workspaceId: string, projectId: string): string {
  return `${workspaceId}:${projectId}`;
}

/**
 * Workspace-Scoped Store Factory
 *
 * Creates isolated Zustand store instances per workspace+project combination.
 * Uses memoization to return same instance for same composite key.
 *
 * @example
 * ```typescript
 * const notesStore = createWorkspaceStore('notes', 'proj-A');
 * const ideStore = createWorkspaceStore('ide', 'proj-B');
 *
 * // These are completely isolated:
 * notesStore.setState({ currentProject: 'proj-A' });
 * ideStore.setState({ currentProject: 'proj-B' });
 *
 * // Switching back to notes keeps state:
 * expect(notesStore.getState().currentProject).toBe('proj-A'); ✅
 * ```
 */
export function createWorkspaceStore<T extends WorkspaceStoreState>(
  workspaceId: WorkspaceStoreConfig['workspaceId'],
  projectId: string
): StoreApi<T> {
  const compositeKey = createCompositeKey(workspaceId, projectId);

  // Return existing store if already created (memoization)
  if (storeRegistry.has(compositeKey)) {
    return storeRegistry.get(compositeKey) as StoreApi<T>;
  }

  // Create new store instance
  const store = createStore<WorkspaceStoreState>((set) => ({
    currentProject: null,
    setCurrentProject: (projectId: string) => set({ currentProject: projectId }),
  }));

  // Register in memoization registry
  storeRegistry.set(compositeKey, store);

  return store as unknown as StoreApi<T>;
}

/**
 * Clear Store Registry
 * Utility for testing and project switching cleanup
 */
export function clearStoreRegistry(): void {
  storeRegistry.clear();
}

/**
 * Get Store Count
 * Utility for debugging and leak detection
 */
export function getStoreCount(): number {
  return storeRegistry.size;
}
