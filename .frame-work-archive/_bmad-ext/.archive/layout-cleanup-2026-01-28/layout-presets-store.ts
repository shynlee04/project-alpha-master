/**
 * @fileoverview Layout Presets Store - Zustand store for layout preset management
 * @module infrastructure/persistence/stores/layout-presets-store
 *
 * **ARCH-03-03**: Layout Presets System
 *
 * Provides Zustand store with persist middleware for layout preset management.
 * Persists custom layout presets per project in localStorage.
 * Built-in presets are hardcoded and not persisted.
 *
 * **ADR-034-001 COMPLIANCE:**
 * - Presets are "saved layouts", NOT "workspace modes"
 * - Built-in preset names: "Coding", "Writing", "Focus" (NOT "IDE Mode", "Notes Mode", "Focus Mode")
 * - Platform determines available plugins (not user-selected "modes")
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-03
 * @team Team A
 * @created 2026-01-23
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PluginId } from '@/domain/types/plugin-types';
import type { LayoutMode } from '@/presentation/layouts/PluginLayoutStore';

// ============================================================================
// Get Current Project ID from localStorage
// ============================================================================

/**
 * Get current project ID from localStorage
 * / Lấy ID dự án hiện tại từ localStorage
 *
 * @remarks
 * - Reads project ID from project store's storage
 * - Returns undefined if no active project
 * - Used to prefix layout-preset storage key
 */
function getCurrentProjectId(): string | undefined {
  try {
    const projectStoreKey = 'project-storage';
    const projectData = localStorage.getItem(projectStoreKey);
    if (!projectData) return undefined;

    const parsed = JSON.parse(projectData);
    return parsed.state?.activeProjectId || undefined;
  } catch (error) {
    console.warn('[LayoutPresetsStore] Failed to read current project ID:', error);
    return undefined;
  }
}

// ============================================================================
// Layout Preset Types
// ============================================================================

/**
 * Layout Preset Interface
 * / Giao diện Preset Layout
 *
 * @remarks
 * - Represents a saved layout configuration
 * - Can be built-in (Coding, Writing, Focus) or user-defined
 * - Contains plugins, layout mode, and panel sizes
 * - isBuiltIn flag prevents deletion of built-in presets
 */
export interface LayoutPreset {
  id: string;
  name: string;  // "Coding", "Writing", "Focus" (built-ins) or custom name
  plugins: PluginId[];
  layoutMode: LayoutMode;
  panelSizes: Record<string, number>;
  isBuiltIn: boolean;
  projectId?: string | undefined;  // null = global preset (but we use per-project)
}

/**
 * Layout Presets State Interface
 * / Giao diện Trạng thái Layout Presets
 */
export interface LayoutPresetsState {
  presets: LayoutPreset[];
  activePresetId: string | null;

  // Actions
  loadPreset: (presetId: string) => void;
  savePreset: (name: string, plugins: PluginId[], mode: LayoutMode, panelSizes: Record<string, number>) => void;
  deletePreset: (presetId: string) => void;
  setActivePreset: (presetId: string | null) => void;

  // Persistence
  initializePresets: () => void;  // Load saved presets from localStorage
}

// ============================================================================
// Built-in Presets (NOT "workspace modes")
// ============================================================================

/**
 * Built-in Layout Presets
 * / Các Preset Layout tích hợp sẵn
 *
 * @remarks
 * - **ADR-034-001 COMPLIANCE:**
 *   - Presets are "saved layouts", NOT "workspace modes"
 *   - Names: "Coding", "Writing", "Focus" (NOT "IDE Mode", "Notes Mode", "Focus Mode")
 *   - Platform determines available plugins
 *
 * - preset-coding: Full development experience (FileTree + Monaco + Terminal + Chat)
 * - preset-writing: Writing-focused (FileTree + Notes + Chat)
 * - preset-focus: Single plugin fullscreen (Monaco or Notes)
 *
 * - Built-in presets have isBuiltIn: true
 * - Built-in presets cannot be deleted
 */
export const BUILT_IN_PRESETS: LayoutPreset[] = [
  {
    id: 'preset-coding',
    name: 'Coding',  // NOT "IDE Mode"
    plugins: ['filetree', 'monaco', 'terminal', 'chat'],
    layoutMode: '2+1',
    panelSizes: { filetree: 20, monaco: 50, terminal: 30 },
    isBuiltIn: true,
  },
  {
    id: 'preset-writing',
    name: 'Writing',  // NOT "Notes Mode"
    plugins: ['filetree', 'notes', 'chat'],
    layoutMode: '2-column',
    panelSizes: { filetree: 25, notes: 75 },
    isBuiltIn: true,
  },
  {
    id: 'preset-focus',
    name: 'Focus',
    plugins: ['monaco'],  // or ['notes'] depending on available plugins
    layoutMode: '1-column',
    panelSizes: { monaco: 100 },
    isBuiltIn: true,
  },
] as const;

// ============================================================================
// Create Store with Persist Middleware
// ============================================================================

/**
 * Layout Presets Store
 * / Store Layout Presets
 *
 * @remarks
 * - Zustand v5 store with persist middleware
 * - Uses project-specific localStorage key: `layout-presets-${projectId}`
 * - Merges built-in presets with custom presets from localStorage
 * - loadPreset() updates PluginLayoutStore with preset configuration
 * - Custom presets can be deleted (built-ins cannot)
 */
export const useLayoutPresetsStore = create<LayoutPresetsState>()(
  persist(
    (set, _get) => ({
      presets: [...BUILT_IN_PRESETS],
      activePresetId: null,

      /**
       * Initialize presets from localStorage
       * / Khởi tạo presets từ localStorage
       *
       * @remarks
       * - Merges built-in presets with custom presets from localStorage
       * - Custom presets are project-specific
       * - Called on store initialization
       */
      initializePresets: () => {
        const projectId = getCurrentProjectId();
        if (!projectId) return;

        const storageKey = `layout-presets-${projectId}`;
        const customPresetsData = localStorage.getItem(storageKey);

        if (!customPresetsData) {
          set({ presets: [...BUILT_IN_PRESETS] });
          return;
        }

        try {
          const customPresets = JSON.parse(customPresetsData) as LayoutPreset[];
          set({
            presets: [...BUILT_IN_PRESETS, ...customPresets],
          });
        } catch (error) {
          console.warn('[LayoutPresetsStore] Failed to parse custom presets:', error);
          set({ presets: [...BUILT_IN_PRESETS] });
        }
      },

      /**
       * Load preset and apply to PluginLayoutStore
        const projectId = getCurrentProjectId();
        if (!projectId) return;

        const storageKey = `layout-presets-${projectId}`;
        const customPresetsData = localStorage.getItem(storageKey);

        if (!customPresetsData) {
          set({ presets: [...BUILT_IN_PRESETS] });
          return;
        }

        try {
          const customPresets = JSON.parse(customPresetsData) as LayoutPreset[];
          set({
            presets: [...BUILT_IN_PRESETS, ...customPresets],
          });
        } catch (error) {
          console.warn('[LayoutPresetsStore] Failed to parse custom presets:', error);
          set({ presets: [...BUILT_IN_PRESETS] });
        }
      },

      /**
       * Load preset and apply to PluginLayoutStore
       * / Tải preset và áp dụng vào PluginLayoutStore
       *
       * @param presetId - ID of preset to load
       *
       * @remarks
       * - Finds preset by ID
       * - Updates PluginLayoutStore with preset configuration
       * - Sets active preset ID
       * - Logs warning if preset not found
       */
      loadPreset: (presetId) => {
        const preset = _get().presets.find(p => p.id === presetId);
        if (!preset) {
          console.warn(`[LayoutPresetsStore] Preset not found: ${presetId}`);
          return;
        }

        // Update PluginLayoutStore with preset configuration
        // Dynamic import to avoid circular dependency
        import('@/presentation/layouts/PluginLayoutStore').then(({ usePluginLayoutStore }) => {
          const layoutStore = usePluginLayoutStore.getState();

          // Clear existing plugins and add preset plugins one by one
          layoutStore.clearActivePlugins();
          preset.plugins.forEach(pluginId => {
            layoutStore.addPlugin(pluginId);
          });

          // Set layout mode
          layoutStore.setLayoutMode(preset.layoutMode);

          // Set panel sizes if available
          if (preset.panelSizes && Object.keys(preset.panelSizes).length > 0) {
            Object.entries(preset.panelSizes).forEach(([pluginId, size]) => {
              layoutStore.setPanelSize(pluginId as PluginId, size);
            });
          }

          console.log(`[LayoutPresetsStore] Loaded preset: ${preset.name}`, preset);
        });

        set({ activePresetId: presetId });
      },

      /**
       * Save custom preset
       * / Lưu preset tùy chỉnh
       *
       * @param name - Preset name
       * @param plugins - Active plugins to save
       * @param mode - Layout mode to save
       * @param panelSizes - Panel sizes to save
       *
       * @remarks
       * - Saves custom preset to project-specific localStorage
       * - Merges with built-in presets
       * - Generates unique ID using timestamp
       */
      savePreset: (name, plugins, mode, panelSizes) => {
        const projectId = getCurrentProjectId();
        if (!projectId) {
          console.warn('[LayoutPresetsStore] Cannot save preset: no active project');
          return;
        }

        const storageKey = `layout-presets-${projectId}`;

        const newPreset: LayoutPreset = {
          id: `custom-${Date.now()}`,
          name,
          plugins,
          layoutMode: mode,
          panelSizes,
          isBuiltIn: false,
          projectId,
        };

        // Get current custom presets (filter out built-ins)
        const customPresets = _get().presets.filter(p => !p.isBuiltIn);
        const updatedPresets = [...customPresets, newPreset];

        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedPresets));

        // Update state (built-ins + updated custom presets)
        set({
          presets: [...BUILT_IN_PRESETS, ...updatedPresets],
          activePresetId: newPreset.id,
        });

        console.log(`[LayoutPresetsStore] Saved custom preset: ${name}`, newPreset);
      },

      /**
       * Delete custom preset
       * / Xóa preset tùy chỉnh
       *
       * @param presetId - ID of preset to delete
       *
       * @remarks
       * - Built-in presets cannot be deleted (isBuiltIn: true)
       * - Removes custom preset from localStorage
       * - Updates state to reflect deletion
       */
      deletePreset: (presetId) => {
        const preset = _get().presets.find(p => p.id === presetId);
        if (!preset) {
          console.warn(`[LayoutPresetsStore] Preset not found: ${presetId}`);
          return;
        }

        // Prevent deletion of built-in presets
        if (preset.isBuiltIn) {
          console.warn(`[LayoutPresetsStore] Cannot delete built-in preset: ${preset.name}`);
          return;
        }

        const projectId = getCurrentProjectId();
        if (!projectId) return;

        const storageKey = `layout-presets-${projectId}`;

        // Remove preset from custom presets
        const customPresets = _get().presets.filter(p => !p.isBuiltIn && p.id !== presetId);

        // Update localStorage
        localStorage.setItem(storageKey, JSON.stringify(customPresets));

        // Update state
        set({
          presets: [...BUILT_IN_PRESETS, ...customPresets],
          activePresetId: null,  // Clear active preset if deleted
        });

        console.log(`[LayoutPresetsStore] Deleted custom preset: ${preset.name}`);
      },

      /**
       * Set active preset ID
       * / Đặt ID preset hoạt động
       *
       * @param presetId - ID of preset to set as active, or null to clear
       */
      setActivePreset: (presetId) => {
        set({ activePresetId: presetId });
      },
    }),
    {
      name: 'via-gent-layout-presets-storage',
    }
  )
);

// ============================================================================
// No additional exports - store and types already exported above
// ============================================================================
