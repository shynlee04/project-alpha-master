/**
 * @fileoverview Provider Workspace Slice
 * @module infrastructure/persistence/stores/providers/provider-store-workspace
 * @governance EPIC-7-1
 *
 * Workspace-scoped provider selection and availability.
 * Each workspace can have a different active provider.
 *
 * December 2025 Patterns:
 * - Workspace-aware state management
 * - Cross-workspace provider availability
 * - Event-driven workspace sync
 */

import { StateCreator } from 'zustand';
import type { WorkspaceType } from '@/stores/agents-store';
import { crossWorkspaceEventBus } from '@/lib/events';
import type { ProviderConfigChangeEvent } from '@/lib/events';

// ============================================================================
// State
// ============================================================================

/**
 * Provider workspace slice state
 */
export interface ProviderWorkspaceState {
  /** Active provider ID for each workspace */
  workspaceProviders: Partial<Record<WorkspaceType, string>>;
  /** Which workspaces each provider is available in */
  providerAvailability: Record<string, WorkspaceType[]>;
  /** Default provider for each workspace (fallback) */
  defaultProviders: Partial<Record<WorkspaceType, string>>;
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Provider workspace slice actions
 */
export interface ProviderWorkspaceActions {
  /** Set active provider for specific workspace */
  setActiveProvider: (workspace: WorkspaceType, providerId: string) => void;
  /** Get active provider for specific workspace */
  getActiveProvider: (workspace: WorkspaceType) => string | null;
  /** Set which workspaces a provider is available in */
  setProviderWorkspaces: (providerId: string, workspaces: WorkspaceType[]) => void;
  /** Check if provider is available in workspace */
  isProviderAvailableInWorkspace: (providerId: string, workspace: WorkspaceType) => boolean;
  /** Get all available providers for workspace */
  getAvailableProvidersForWorkspace: (workspace: WorkspaceType) => string[];
  /** Clear provider selection for workspace */
  clearWorkspaceProvider: (workspace: WorkspaceType) => void;
}

// ============================================================================
// Slice Type
// ============================================================================

/**
 * Combined workspace slice type
 */
export type ProviderWorkspaceSlice =
  ProviderWorkspaceState & ProviderWorkspaceActions;

// ============================================================================
// Slice Creator
// ============================================================================

/**
 * Create provider workspace slice
 *
 * @param set - Zustand set function
 * @param get - Zustand get function
 * @returns Workspace slice state and actions
 */
export const createProviderWorkspaceSlice: StateCreator<
  ProviderWorkspaceSlice,
  [],
  [],
  ProviderWorkspaceSlice
> = (set, get) => ({
  workspaceProviders: {
    ide: null,
    knowledge: null,
    study: null,
    notes: null,
  },
  providerAvailability: {},
  defaultProviders: {
    ide: 'openrouter', // Default for IDE
    knowledge: null,
    study: null,
    notes: null,
  },

  setActiveProvider: (workspace, providerId) => {
    console.log('[ProviderStore] Setting active provider:', workspace, '→', providerId);

    set((state) => ({
      workspaceProviders: {
        ...state.workspaceProviders,
        [workspace]: providerId,
      },
    }));

    // Emit event for cross-workspace sync
    crossWorkspaceEventBus.emitProviderConfigChange({
      workspaceId: workspace,
      providerId,
      changeType: 'selection-changed',
    } as ProviderConfigChangeEvent);
  },

  getActiveProvider: (workspace) => {
    const providerId = get().workspaceProviders[workspace];

    // Fallback to default if no active provider
    if (!providerId) {
      const defaultProvider = get().defaultProviders[workspace];
      if (defaultProvider) {
        console.log('[ProviderStore] Using default provider:', workspace, '→', defaultProvider);
        return defaultProvider;
      }
    }

    return providerId || null;
  },

  setProviderWorkspaces: (providerId, workspaces) => {
    console.log('[ProviderStore] Setting provider workspaces:', providerId, workspaces);

    set((state) => ({
      providerAvailability: {
        ...state.providerAvailability,
        [providerId]: workspaces,
      },
    }));

    // Emit event
    crossWorkspaceEventBus.emitProviderConfigChange({
      workspaceId: 'ide', // Emit from IDE as source
      providerId,
      changeType: 'workspace-availability-updated',
    } as ProviderConfigChangeEvent);
  },

  isProviderAvailableInWorkspace: (providerId, workspace) => {
    const availability = get().providerAvailability[providerId];

    // If no explicit availability, assume available in all workspaces
    if (!availability || availability.length === 0) {
      return true;
    }

    return availability.includes(workspace);
  },

  getAvailableProvidersForWorkspace: (workspace) => {
    const availability = get().providerAvailability;

    // Get all providers available in this workspace
    const availableProviders = Object.entries(availability)
      .filter(([, workspaces]) => workspaces.includes(workspace))
      .map(([providerId]) => providerId);

    // Add providers with no workspace restrictions (assume all)
    const unrestrictedProviders = Object.keys(get().workspaceProviders || {})
      .filter(providerId => !availability[providerId]);

    return [...new Set([...availableProviders, ...unrestrictedProviders])];
  },

  clearWorkspaceProvider: (workspace) => {
    console.log('[ProviderStore] Clearing workspace provider:', workspace);

    set((state) => {
      const { [workspace]: cleared, ...remaining } = state.workspaceProviders;
      return { workspaceProviders: remaining };
    });

    // Emit event
    crossWorkspaceEventBus.emitProviderConfigChange({
      workspaceId: workspace,
      providerId: null,
      changeType: 'selection-cleared',
    } as ProviderConfigChangeEvent);
  },
});
