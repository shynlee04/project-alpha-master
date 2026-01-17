// src/infrastructure/persistence/stores/project/wait-for-hydration.ts
// Utility function to wait for Zustand store hydration before resolving
// Fixes: Route loading race condition where loader runs before hydration completes

import { useProjectStore } from '../infrastructure/persistence/stores/project/useProjectStore';

/**
 * Wait for Zustand store to hydrate before resolving
 * 
 * Fixes the race condition where TanStack Router loaders run BEFORE
 * hydrateProjects() completes, causing projects to not be found.
 * 
 * @returns Promise that resolves when hydration is complete
 */
export function waitForHydration(): Promise<void> {
  const state = useProjectStore.getState();
  
  // If already hydrated, return immediately
  if (state._hasHydrated) {
    return Promise.resolve();
  }
  
  // Otherwise, wait for hydration event using Zustand subscribe
  return new Promise((resolve) => {
    const unsubscribe = useProjectStore.subscribe(
      (state: { _hasHydrated?: boolean }) => {
        if (state._hasHydrated) {
          unsubscribe();
          resolve();
        }
      }
    );
  });
}

/**
 * Check if store is already hydrated (synchronous)
 * 
 * @returns true if hydration is complete, false otherwise
 */
export function isHydrated(): boolean {
  return useProjectStore.getState()._hasHydrated === true;
}
