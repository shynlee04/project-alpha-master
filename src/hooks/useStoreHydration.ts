/**
 * @fileoverview Store Hydration Hook
 * @module hooks/useStoreHydration
 *
 * Custom hook for waiting until Zustand store has finished hydrating from persistence
 * before rendering components that depend on persisted state.
 *
 * @example
 * ```tsx
 * import { useStoreHydration } from '@/hooks/useStoreHydration';
 * import { useIDEStore } from '@/infrastructure/persistence/stores/ide';
 *
 * function MyComponent() {
 *   const openFiles = useIDEStore(s => s.openFiles);
 *   const hasHydrated = useIDEStore(s => s._hasHydrated);
 *
 *   const isReady = useStoreHydration(hasHydrated);
 *
 *   if (!isReady) {
 *     return <LoadingSkeleton />;
 *   }
 *
 *   return <FileExplorer files={openFiles} />;
 * }
 * ```
 *
 * @governance P1-1 - Add Hydration Flags to 6 Stores
 * @created 2026-01-03
 */

import { useEffect, useState } from 'react';

/**
 * Wait for store to hydrate from persistence before rendering
 *
 * Prevents UI from flashing empty/default state while Zustand rehydrates from
 * IndexedDB or localStorage. Returns true only when both client-side rendering
 * is active AND store has finished hydrating.
 *
 * @param hasHydrated - The store's _hasHydrated flag value
 * @returns true when store is ready (client + hydrated), false otherwise
 *
 * @example
 * ```tsx
 * const hasHydrated = useIDEStore(s => s._hasHydrated);
 * const isReady = useStoreHydration(hasHydrated);
 *
 * if (!isReady) {
 *   return <LoadingSkeleton />;
 * }
 * ```
 */
export function useStoreHydration(hasHydrated: boolean): boolean {
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after first render (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return true only when we're on client AND store has hydrated
  return isClient && hasHydrated;
}

/**
 * Alternative: Use Zustand's built-in hydration tracking
 *
 * Zustand persist middleware provides built-in hydration tracking via:
 * - store.persist.hasHydrated() - Check if store has hydrated
 * - store.persist.onFinishHydration(callback) - Listen for hydration complete
 *
 * This hook is a simpler alternative that works with the _hasHydrated flag pattern.
 */
