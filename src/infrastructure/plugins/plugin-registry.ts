/**
 * @fileoverview Plugin Registry - Centralized plugin storage and discovery
 * @module infrastructure/plugins/plugin-registry
 *
 * **ARCH-02-02**: Create Plugin Registry
 *
 * Implements a singleton registry for feature plugins with:
 * - Module-level singleton (no class instance needed)
 * - Plugin registration with duplicate detection
 * - Plugin retrieval by ID
 * - Filtering by context requirements (storageType, deviceType)
 *
 * Per ADR-034 Decision D3:
 * Plugins are self-contained and registered at app startup.
 * Registry filters plugins based on platform capabilities.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-02
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Imports
// ============================================================================

import type { FeaturePlugin, ProjectContext } from '@/domain/interfaces/feature-plugin.interface';
import type { PluginId } from '@/domain/types/plugin-types';
import type { PlatformContract } from '@/infrastructure/filesystem/storage-types';
import type { Project } from '@/domain/entities/project';

// ============================================================================
// Singleton Registry Instance
// ============================================================================

/**
 * Plugin Registry - Singleton Map for storing all registered plugins
 *
 * @remarks
 * Module-level const creates automatic singleton behavior.
 * All imports share the same registry instance.
 *
 * Storage: Map<PluginId, FeaturePlugin>
 * - Key: Plugin ID (e.g., 'filetree', 'monaco')
 * - Value: Complete FeaturePlugin object
 */
const pluginRegistry = new Map<PluginId, FeaturePlugin>();

// ============================================================================
// Registration Function
// ============================================================================

/**
 * Register a plugin in the registry
 *
 * @param plugin - FeaturePlugin to register
 * @returns void
 *
 * @remarks
 * - Checks for duplicate ID before registration
 * - Logs warning on duplicate (overwrites existing)
 * - No errors thrown (graceful overwrite)
 *
 * @example
 * ```ts
 * registerPlugin({
 *   id: 'filetree',
 *   name: 'File Tree',
 *   icon: <FileTreeIcon />,
 *   description: 'Browse and manage project files',
 *   requirements: {
 *     storageType: 'any',
 *     deviceType: 'any',
 *     minWidth: 200,
 *     maxInstances: 1,
 *   },
 *   MainComponent: FileTreeComponent,
 * });
 * ```
 */
export function registerPlugin(plugin: FeaturePlugin): void {
  if (pluginRegistry.has(plugin.id)) {
    console.warn(
      `[PluginRegistry] Plugin "${plugin.id}" already registered, overwriting`
    );
  }
  pluginRegistry.set(plugin.id, plugin);
}

// ============================================================================
// Retrieval Functions
// ============================================================================

/**
 * Get a plugin by its ID
 *
 * @param id - Plugin ID to retrieve
 * @returns Plugin object if found, undefined if not found
 *
 * @remarks
 * - Returns exact reference from registry (not a copy)
 * - Returns undefined for non-existent plugins
 * - Type-safe: only returns valid FeaturePlugin or undefined
 *
 * @example
 * ```ts
 * const fileTreePlugin = getPlugin('filetree');
 * if (fileTreePlugin) {
 *   // Plugin found, can use it
 *   console.log(fileTreePlugin.name);
 * }
 * ```
 */
export function getPlugin(id: PluginId): FeaturePlugin | undefined {
  return pluginRegistry.get(id);
}

/**
 * Get all plugins compatible with given project context
 *
 * @param context - Project context containing storage and platform info
 * @returns Array of compatible plugins (empty if none match)
 *
 * @remarks
 * - Filters by BOTH storageType AND deviceType requirements
 * - 'any' values match any context value
 * - Returns array of FeaturePlugin objects
 *
 * Filtering Logic:
 * 1. Check storage type compatibility
 *    - Plugin requirement 'any' → Compatible with any storage
 *    - Plugin requirement 'fsa' → Compatible only if context.project.storageType === 'fsa'
 *    - Plugin requirement 'indexeddb' → Compatible only if context.project.storageType === 'indexeddb'
 *
 * 2. Check device type compatibility
 *    - Plugin requirement 'any' → Compatible with any device
 *    - Plugin requirement 'desktop' → Compatible only if context.platform.deviceType === 'desktop'
 *    - Plugin requirement 'mobile' → Compatible only if context.platform.deviceType === 'mobile'
 *
 * 3. Include only plugins that pass BOTH checks
 *
 * @example
 * ```ts
 * // Desktop FSA project
 * const context = {
 *   project: { storageType: 'fsa' },
 *   platform: { deviceType: 'desktop' }
 * };
 *
 * const availablePlugins = getAvailablePlugins(context);
 * // Returns: ['filetree' (any/any), 'monaco' (any/any), 'terminal' (fsa/desktop)]
 * // Excludes: 'notes-mobile-only' (indexeddb/mobile)
 * ```
 */
export function getAvailablePlugins(context: ProjectContext): FeaturePlugin[] {
  return Array.from(pluginRegistry.values()).filter((plugin) => {
    const { storageType, deviceType } = plugin.requirements;

    // ProjectContext is now fully defined (ARCH-02-03 complete)
    // No type assertions needed
    const project = context.project as Project;
    const platform = context.platform as PlatformContract;

    // Check storage type compatibility
    if (storageType !== 'any' && storageType !== project.storageType) {
      return false;
    }

    // Check device type compatibility
    if (deviceType !== 'any' && deviceType !== platform.deviceType) {
      return false;
    }

    // Both storage and device type requirements are compatible
    return true;
  });
}

/**
 * Get all registered plugins
 *
 * @returns Array of all registered plugins
 *
 * @remarks
 * - Useful for debugging, inspection, or rendering plugin lists
 * - Returns shallow copy (Array.from) to prevent direct Map mutation
 * - Order not guaranteed (Map iteration order depends on insertion order)
 *
 * @example
 * ```ts
 * const allPlugins = getAllPlugins();
 * console.log(`Registered ${allPlugins.length} plugins:`);
 * allPlugins.forEach(plugin => console.log(`- ${plugin.name}`));
 * ```
 */
export function getAllPlugins(): FeaturePlugin[] {
  return Array.from(pluginRegistry.values());
}

// ============================================================================
// No additional exports - all functions exported above
// ============================================================================
