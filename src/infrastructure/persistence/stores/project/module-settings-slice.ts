/**
 * @fileoverview Module Settings Slice
 * @module infrastructure/persistence/stores/project/module-settings-slice
 * @governance EPIC-CP-1.2
 *
 * Plugin/module configuration management for projects.
 * Replaces project-bindings-slice.ts (workspaceBindings → plugins).
 *
 * @mandate NO-WORKSPACE - See SOURCE-OF-TRUTH.md Part 6
 */

import { StateCreator } from 'zustand';
import { db } from '@/infrastructure/persistence/dexie-db';
import type { PluginType, ProjectPlugins } from '@/domain/entities/project';

// ============================================================================
// Types
// ============================================================================

/**
 * Project state interface (for slice composition)
 */
interface ProjectState {
  projects: Record<string, { plugins?: ProjectPlugins }>;
  activeProjectId: string | null;
}

/**
 * Module settings slice interface
 */
export interface ModuleSettingsSlice {
  // Actions
  updateProjectPlugins: (projectId: string, plugins: ProjectPlugins) => Promise<void>;
  getProjectPlugins: (projectId: string) => ProjectPlugins | null;
  togglePlugin: (projectId: string, pluginType: PluginType) => Promise<void>;
  setDefaultPlugin: (projectId: string, pluginType: PluginType) => Promise<void>;
  getEnabledPlugins: (projectId: string) => PluginType[];
  getDefaultPlugin: (projectId: string) => PluginType;
  validatePlugins: (plugins: ProjectPlugins) => PluginValidationResult;
}

/**
 * Validation result for plugin configuration
 */
export interface PluginValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_PLUGINS: ProjectPlugins = {
  enabled: ['editor'],
  default: 'editor',
};

const VALID_PLUGIN_TYPES: PluginType[] = [
  'editor',
  'notes',
  'chat',
  'terminal',
  'preview',
  'knowledge',
  'study',
];

// ============================================================================
// Slice Implementation
// ============================================================================

export const createModuleSettingsSlice: StateCreator<
  ProjectState & ModuleSettingsSlice,
  [],
  [],
  ModuleSettingsSlice
> = (set, get) => ({
  /**
   * Update project plugin configuration
   */
  updateProjectPlugins: async (projectId: string, plugins: ProjectPlugins) => {
    const existing = get().projects[projectId];
    if (!existing) {
      console.warn('[ModuleSettingsSlice] Project not found:', projectId);
      return;
    }

    console.log('[ModuleSettingsSlice] Updating plugins for project:', projectId, plugins);

    // Validate plugins
    const validation = get().validatePlugins(plugins);
    if (!validation.isValid) {
      console.error('[ModuleSettingsSlice] Invalid plugins:', validation.errors);
      throw new Error(validation.errors.join(', '));
    }

    // Update state
    set((state) => ({
      projects: {
        ...state.projects,
        [projectId]: { ...existing, plugins },
      },
    }));

    // Persist to Dexie
    db.projects.update(projectId, { plugins }).catch((error: unknown) => {
      const err = error as Error;
      console.error('[ModuleSettingsSlice] Failed to persist plugins to Dexie:', err.message);
    });
  },

  /**
   * Get project plugin configuration
   */
  getProjectPlugins: (projectId: string) => {
    const project = get().projects[projectId];
    return project?.plugins || null;
  },

  /**
   * Toggle a plugin on/off for a project
   */
  togglePlugin: async (projectId: string, pluginType: PluginType) => {
    const plugins = get().getProjectPlugins(projectId) || DEFAULT_PLUGINS;
    const isEnabled = plugins.enabled.includes(pluginType);

    const newEnabled = isEnabled
      ? plugins.enabled.filter((p) => p !== pluginType)
      : [...plugins.enabled, pluginType];

    // Ensure at least one plugin remains enabled
    if (newEnabled.length === 0) {
      console.warn('[ModuleSettingsSlice] Cannot disable all plugins');
      return;
    }

    // If we're disabling the default, pick a new default
    let newDefault = plugins.default;
    if (isEnabled && plugins.default === pluginType) {
      newDefault = newEnabled[0];
    }

    await get().updateProjectPlugins(projectId, {
      enabled: newEnabled,
      default: newDefault,
    });
  },

  /**
   * Set the default plugin for a project
   */
  setDefaultPlugin: async (projectId: string, pluginType: PluginType) => {
    const plugins = get().getProjectPlugins(projectId) || DEFAULT_PLUGINS;

    // Ensure the plugin is enabled first
    const enabled = plugins.enabled.includes(pluginType)
      ? plugins.enabled
      : [...plugins.enabled, pluginType];

    await get().updateProjectPlugins(projectId, {
      enabled,
      default: pluginType,
    });
  },

  /**
   * Get list of enabled plugins for a project
   */
  getEnabledPlugins: (projectId: string) => {
    const plugins = get().getProjectPlugins(projectId);
    return plugins?.enabled || DEFAULT_PLUGINS.enabled;
  },

  /**
   * Get default plugin for a project
   */
  getDefaultPlugin: (projectId: string) => {
    const plugins = get().getProjectPlugins(projectId);
    if (plugins?.default && plugins.enabled.includes(plugins.default)) {
      return plugins.default;
    }
    // Fallback: first enabled or 'editor'
    return plugins?.enabled[0] || 'editor';
  },

  /**
   * Validate plugin configuration
   */
  validatePlugins: (plugins: ProjectPlugins): PluginValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Rule: At least one plugin must be enabled
    if (!plugins.enabled || plugins.enabled.length === 0) {
      errors.push('At least one plugin must be enabled');
    }

    // Rule: Warn if fewer than 2 plugins enabled
    if (plugins.enabled && plugins.enabled.length < 2) {
      warnings.push('Only one plugin enabled - consider enabling more');
    }

    // Rule: Validate plugin types
    if (plugins.enabled) {
      const invalidPlugins = plugins.enabled.filter(
        (p) => !VALID_PLUGIN_TYPES.includes(p)
      );
      if (invalidPlugins.length > 0) {
        errors.push(`Unknown plugin types: ${invalidPlugins.join(', ')}`);
      }
    }

    // Rule: Default must be in enabled list
    if (plugins.default && plugins.enabled && !plugins.enabled.includes(plugins.default)) {
      errors.push('Default plugin must be in enabled list');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },
});
