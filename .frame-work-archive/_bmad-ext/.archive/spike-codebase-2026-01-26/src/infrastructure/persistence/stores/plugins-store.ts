/**
 * Plugins Store - Zustand State Management
 *
 * Manages plugin state, marketplace, and UI state.
 * Follows December 2025 Zustand patterns with slice architecture.
 *
 * @module stores/plugins-store
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  PluginMetadata,
  PluginMarketplaceEntry,
  PluginLifecycleState,
  PluginSource,
  PluginPermission,
} from '@/lib/plugins/types';

// ============================================================================
// Types
// ============================================================================

export interface PluginsState {
  // Plugin registry
  plugins: PluginMetadata[];
  activePluginId: string | null;

  // Marketplace
  marketplaceEntries: PluginMarketplaceEntry[];
  marketplaceLastFetch: number | null;

  // UI state
  showMarketplace: boolean;
  showManager: boolean;
  selectedPluginId: string | null;

  // Filters
  filterCategory: string | null;
  filterSearch: string;

  // Loading states
  isLoadingPlugins: boolean;
  isLoadingMarketplace: boolean;

  // Error state
  error: string | null;
}

export interface PluginsActions {
  // CRUD operations
  setPlugins: (plugins: PluginMetadata[]) => void;
  addPlugin: (plugin: PluginMetadata) => void;
  updatePlugin: (pluginId: string, updates: Partial<PluginMetadata>) => void;
  removePlugin: (pluginId: string) => void;

  // Active plugin
  setActivePlugin: (pluginId: string | null) => void;

  // Marketplace
  setMarketplaceEntries: (entries: PluginMarketplaceEntry[]) => void;
  setMarketplaceLastFetch: (timestamp: number) => void;

  // UI state
  setShowMarketplace: (show: boolean) => void;
  setShowManager: (show: boolean) => void;
  setSelectedPlugin: (pluginId: string | null) => void;

  // Filters
  setFilterCategory: (category: string | null) => void;
  setFilterSearch: (search: string) => void;

  // Loading states
  setIsLoadingPlugins: (loading: boolean) => void;
  setIsLoadingMarketplace: (loading: boolean) => void;

  // Error state
  setError: (error: string | null) => void;

  // Computed selectors (reusable functions)
  getPluginById: (id: string) => PluginMetadata | undefined;
  getPluginsByState: (state: PluginLifecycleState) => PluginMetadata[];
  getPluginsBySource: (source: PluginSource) => PluginMetadata[];
  getActivePlugin: () => PluginMetadata | undefined;
  getFilteredMarketplaceEntries: () => PluginMarketplaceEntry[];
  getPluginPermissionStatus: (pluginId: string, permission: PluginPermission) => boolean | undefined;
}

// ============================================================================
// Slice
// ============================================================================

export interface PluginsSlice extends PluginsState, PluginsActions {}

export const createPluginsSlice: StateCreator<PluginsSlice> = (set, get) => ({
  // ========================================================================
  // Initial State
  // ========================================================================

  plugins: [],
  activePluginId: null,

  marketplaceEntries: [],
  marketplaceLastFetch: null,

  showMarketplace: false,
  showManager: false,
  selectedPluginId: null,

  filterCategory: null,
  filterSearch: '',

  isLoadingPlugins: false,
  isLoadingMarketplace: false,

  error: null,

  // ========================================================================
  // CRUD Operations
  // ========================================================================

  setPlugins: (plugins) => set({ plugins }),

  addPlugin: (plugin) =>
    set((state) => ({
      plugins: [...state.plugins, plugin],
    })),

  updatePlugin: (pluginId, updates) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === pluginId ? { ...p, ...updates } : p
      ),
    })),

  removePlugin: (pluginId) =>
    set((state) => ({
      plugins: state.plugins.filter((p) => p.id !== pluginId),
      selectedPluginId:
        state.selectedPluginId === pluginId ? null : state.selectedPluginId,
    })),

  // ========================================================================
  // Active Plugin
  // ========================================================================

  setActivePlugin: (pluginId) => set({ activePluginId: pluginId }),

  // ========================================================================
  // Marketplace
  // ========================================================================

  setMarketplaceEntries: (entries) => set({ marketplaceEntries: entries }),

  setMarketplaceLastFetch: (timestamp) =>
    set({ marketplaceLastFetch: timestamp }),

  // ========================================================================
  // UI State
  // ========================================================================

  setShowMarketplace: (show) => set({ showMarketplace: show }),

  setShowManager: (show) => set({ showManager: show }),

  setSelectedPlugin: (pluginId) => set({ selectedPluginId: pluginId }),

  // ========================================================================
  // Filters
  // ========================================================================

  setFilterCategory: (category) => set({ filterCategory: category }),

  setFilterSearch: (search) => set({ filterSearch: search }),

  // ========================================================================
  // Loading States
  // ========================================================================

  setIsLoadingPlugins: (loading) => set({ isLoadingPlugins: loading }),

  setIsLoadingMarketplace: (loading) =>
    set({ isLoadingMarketplace: loading }),

  // ========================================================================
  // Error State
  // ========================================================================

  setError: (error) => set({ error }),

  // ========================================================================
  // Computed Selectors
  // ========================================================================

  getPluginById: (id) => {
    const state = get();
    return state.plugins.find((p) => p.id === id);
  },

  getPluginsByState: (state) => {
    const currentState = get();
    return currentState.plugins.filter((p) => p.state === state);
  },

  getPluginsBySource: (source) => {
    const currentState = get();
    return currentState.plugins.filter((p) => p.source === source);
  },

  getActivePlugin: () => {
    const state = get();
    return state.activePluginId
      ? state.plugins.find((p) => p.id === state.activePluginId)
      : undefined;
  },

  getFilteredMarketplaceEntries: () => {
    const state = get();
    let filtered = state.marketplaceEntries;

    // Filter by category
    if (state.filterCategory) {
      filtered = filtered.filter(
        (entry) => entry.category === state.filterCategory
      );
    }

    // Filter by search
    if (state.filterSearch) {
      const searchLower = state.filterSearch.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchLower) ||
          entry.description.toLowerCase().includes(searchLower) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  },

  getPluginPermissionStatus: (pluginId, permission) => {
    const state = get();
    const plugin = state.plugins.find((p) => p.id === pluginId);
    return plugin?.permissions.find((p) => p.permission === permission)?.granted;
  },
});

// ============================================================================
// Store Creation
// ============================================================================

export const usePluginsStore = create<PluginsSlice>()(
  persist(
    createPluginsSlice,
    {
      name: 'plugins-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist only these fields
        plugins: state.plugins,
        activePluginId: state.activePluginId,
        marketplaceEntries: state.marketplaceEntries,
        marketplaceLastFetch: state.marketplaceLastFetch,
        filterCategory: state.filterCategory,
        filterSearch: state.filterSearch,
      }),
    }
  )
);

// ============================================================================
// Individual Selectors (optimized re-renders)
// ============================================================================

export const usePlugins = () => usePluginsStore((s) => s.plugins);
export const useActivePluginId = () => usePluginsStore((s) => s.activePluginId);
export const useMarketplaceEntries = () =>
  usePluginsStore((s) => s.marketplaceEntries);
export const useShowMarketplace = () =>
  usePluginsStore((s) => s.showMarketplace);
export const useShowManager = () => usePluginsStore((s) => s.showManager);
export const useSelectedPluginId = () =>
  usePluginsStore((s) => s.selectedPluginId);
export const useFilterCategory = () =>
  usePluginsStore((s) => s.filterCategory);
export const useFilterSearch = () => usePluginsStore((s) => s.filterSearch);
export const useIsLoadingPlugins = () =>
  usePluginsStore((s) => s.isLoadingPlugins);
export const useIsLoadingMarketplace = () =>
  usePluginsStore((s) => s.isLoadingMarketplace);
export const usePluginError = () => usePluginsStore((s) => s.error);

// Action selectors
export const useSetPlugins = () => usePluginsStore((s) => s.setPlugins);
export const useAddPlugin = () => usePluginsStore((s) => s.addPlugin);
export const useUpdatePlugin = () => usePluginsStore((s) => s.updatePlugin);
export const useRemovePlugin = () => usePluginsStore((s) => s.removePlugin);
export const useSetActivePlugin = () =>
  usePluginsStore((s) => s.setActivePlugin);
export const useSetShowMarketplace = () =>
  usePluginsStore((s) => s.setShowMarketplace);
export const useSetShowManager = () => usePluginsStore((s) => s.setShowManager);
export const useSetSelectedPlugin = () =>
  usePluginsStore((s) => s.setSelectedPlugin);
export const useSetFilterCategory = () =>
  usePluginsStore((s) => s.setFilterCategory);
export const useSetFilterSearch = () =>
  usePluginsStore((s) => s.setFilterSearch);
export const useSetIsLoadingPlugins = () =>
  usePluginsStore((s) => s.setIsLoadingPlugins);
export const useSetIsLoadingMarketplace = () =>
  usePluginsStore((s) => s.setIsLoadingMarketplace);
export const useSetPluginError = () => usePluginsStore((s) => s.setError);
