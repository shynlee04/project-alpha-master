/**
 * @fileoverview Provider Events Slice
 * @module infrastructure/persistence/stores/providers/provider-store-events
 * @governance EPIC-7-1
 *
 * Event emission and subscriptions for provider configuration changes.
 * Integrates with cross-workspace event bus for system-wide sync.
 *
 * December 2025 Patterns:
 * - Event-driven architecture
 * - React hooks for auto-subscription
 * - Cleanup on unmount
 */

import { StateCreator } from 'zustand';
import { useEffect } from 'react';
import { crossWorkspaceEventBus } from '@/lib/events';
import type {
  ProviderConfigChangeEvent,
  WorkspaceChangeEvent,
} from '@/lib/events';
import { useWorkspaceStore } from '@/lib/state';
import type { WorkspaceType } from '@/stores/agents-store';

// ============================================================================
// State
// ============================================================================

/**
 * Provider events slice state
 */
export interface ProviderEventsState {
  /** Event subscription active flag */
  isListening: boolean;
  /** Event history for debugging (max 50 events) */
  eventHistory: ProviderConfigChangeEvent[];
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Provider events slice actions
 */
export interface ProviderEventsActions {
  /** Start listening to cross-workspace events */
  startListening: () => () => void;
  /** Stop listening to events */
  stopListening: () => void;
  /** Emit provider config change event */
  emitChange: (event: ProviderConfigChangeEvent) => void;
  /** Clear event history */
  clearEventHistory: () => void;
}

// ============================================================================
// Slice Type
// ============================================================================

/**
 * Combined events slice type
 */
export type ProviderEventsSlice = ProviderEventsState & ProviderEventsActions;

// ============================================================================
// Slice Creator
// ============================================================================

/**
 * Create provider events slice
 *
 * @param set - Zustand set function
 * @param get - Zustand get function
 * @returns Events slice state and actions
 */
export const createProviderEventsSlice: StateCreator<
  ProviderEventsSlice,
  [],
  [],
  ProviderEventsSlice
> = (set, get) => ({
  isListening: false,
  eventHistory: [],

  startListening: () => {
    if (get().isListening) {
      console.warn('[ProviderStore] Already listening to events');
      return () => {};
    }

    console.log('[ProviderStore] Starting to listen to workspace events');

    // Listen for workspace changes
    const unsubWorkspace = crossWorkspaceEventBus.onWorkspaceChanged(
      (event: WorkspaceChangeEvent) => {
        console.log('[ProviderStore] Workspace changed:', event);

        // Refresh active provider for new workspace
        const newWorkspace = event.to as WorkspaceType;
        const providerId = get().getActiveProvider?.(newWorkspace);

        console.log(
          '[ProviderStore] Active provider in',
          newWorkspace,
          ':',
          providerId || 'none'
        );
      }
    );

    // Listen for provider config changes from other workspaces
    const unsubProviderConfig = crossWorkspaceEventBus.onProviderConfigChange(
      (event: ProviderConfigChangeEvent) => {
        console.log('[ProviderStore] Provider config changed:', event);

        // Add to event history (max 50)
        set((state) => ({
          eventHistory: [...state.eventHistory, event].slice(-50),
        }));
      }
    );

    set({ isListening: true });

    // Return cleanup function
    return () => {
      unsubWorkspace();
      unsubProviderConfig();
      set({ isListening: false });
      console.log('[ProviderStore] Stopped listening to events');
    };
  },

  stopListening: () => {
    if (!get().isListening) {
      console.warn('[ProviderStore] Not currently listening');
      return;
    }

    console.log('[ProviderStore] Stopping event listeners');
    set({ isListening: false });
  },

  emitChange: (event) => {
    console.log('[ProviderStore] Emitting change:', event);
    crossWorkspaceEventBus.emitProviderConfigChange(event);

    // Add to event history
    set((state) => ({
      eventHistory: [...state.eventHistory, event].slice(-50),
    }));
  },

  clearEventHistory: () => {
    set({ eventHistory: [] });
  },
});

// ============================================================================
// React Hooks
// ============================================================================

/**
 * React hook to auto-start event listening
 *
 * Automatically subscribes to cross-workspace events on mount
 * and cleans up on unmount.
 *
 * @example
 * ```tsx
 * function ProviderConfigPanel() {
 *   useProviderEvents(); // Auto-start listening
 *   // ...
 * }
 * ```
 */
export function useProviderEvents() {
  const startListening = useProviderStore((state) => state.startListening);

  useEffect(() => {
    const cleanup = startListening();
    return cleanup;
  }, [startListening]);
}

/**
 * React hook to get provider config for current workspace
 *
 * Automatically switches provider when workspace changes.
 *
 * @returns Active provider ID for current workspace
 */
export function useCurrentWorkspaceProvider() {
  const currentWorkspace = useWorkspaceStore(
    (state) => state.currentWorkspaceType
  ) as WorkspaceType;
  const getActiveProvider = useProviderStore(
    (state) => state.getActiveProvider
  );

  return getActiveProvider(currentWorkspace);
}

/**
 * React hook for provider selection with workspace awareness
 *
 * @returns Provider selection state and actions
 */
export function useProviderSelection() {
  const currentWorkspace = useWorkspaceStore(
    (state) => state.currentWorkspaceType
  ) as WorkspaceType;

  const setActiveProvider = useProviderStore((state) => state.setActiveProvider);
  const getActiveProvider = useProviderStore((state) => state.getActiveProvider);
  const isProviderAvailableInWorkspace = useProviderStore(
    (state) => state.isProviderAvailableInWorkspace
  );

  const activeProvider = getActiveProvider(currentWorkspace);

  return {
    activeProvider,
    setActiveProvider: (providerId: string) =>
      setActiveProvider(currentWorkspace, providerId),
    isProviderAvailableInWorkspace: (providerId: string) =>
      isProviderAvailableInWorkspace(providerId, currentWorkspace),
  };
}

// Forward import for useProviderStore (circular dependency workaround)
// This will be properly resolved in the combined index.ts
import type { ProviderStoreState } from './index';

declare const useProviderStore: import('zustand').UseBoundStore<
  ProviderStoreState
>;
