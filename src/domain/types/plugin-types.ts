/**
 * @fileoverview Plugin Types - Plugin identifiers and categories
 * @module domain/types/plugin-types
 *
 * **ARCH-02-01**: Define PluginId and PluginCategory types
 *
 * Provides union types and constants for all planned feature plugins:
 * - FileTree: File browser with folder navigation
 * - Monaco: Code editor with syntax highlighting
 * - Notes: BlockNote markdown editor
 * - Terminal: Command-line interface (desktop only)
 * - Chat: Conversational AI assistant
 * - Agents: Agentic tool execution (deferred)
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-01
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Plugin Identifier
// ============================================================================

/**
 * Plugin ID Union Type
 *
 * @remarks
 * All valid plugin identifiers in the system.
 * Used for type-safe plugin registration and lookup.
 *
 * Plugins by category:
 * - Editor: filetree, monaco, notes
 * - Tool: terminal
 * - Communication: chat, agents
 */
export type PluginId =
  | 'filetree'
  | 'monaco'
  | 'notes'
  | 'terminal'
  | 'chat'
  | 'agents';

/**
 * All Plugin IDs (constant array)
 *
 * @remarks
 * Complete list of valid plugin IDs.
 * Use for iteration, validation, or generating plugin selectors.
 *
 * @example
 * ```ts
 * // Validate plugin ID
 * if (!PLUGIN_IDS.includes(pluginId)) {
 *   throw new Error(`Invalid plugin ID: ${pluginId}`);
 * }
 *
 * // Iterate over all plugins
 * for (const id of PLUGIN_IDS) {
 *   const plugin = getPluginById(id);
 *   // ...
 * }
 * ```
 */
export const PLUGIN_IDS: PluginId[] = [
  'filetree',
  'monaco',
  'notes',
  'terminal',
  'chat',
  'agents',
] as const;

// ============================================================================
// Plugin Category
// ============================================================================

/**
 * Plugin Category Type
 *
 * @remarks
 * Categorizes plugins for UI organization and filtering.
 * Used for grouping plugins in plugin selection dialogs.
 */
export type PluginCategory = 'editor' | 'tool' | 'communication';

/**
 * Plugin Category Map
 *
 * @remarks
 * Maps each plugin ID to its category.
 * Used for organizing plugins in the UI and filtering by category.
 *
 * @example
 * ```ts
 * // Get plugin category
 * const category = PLUGIN_CATEGORIES['filetree']; // 'editor'
 *
 * // Get all plugins in a category
 * const editorPlugins = PLUGIN_IDS.filter(
 *   id => PLUGIN_CATEGORIES[id] === 'editor'
 * ); // ['filetree', 'monaco', 'notes']
 * ```
 */
export const PLUGIN_CATEGORIES: Record<PluginId, PluginCategory> = {
  filetree: 'editor',
  monaco: 'editor',
  notes: 'editor',
  terminal: 'tool',
  chat: 'communication',
  agents: 'communication',
} as const;

// ============================================================================
// Plugin Type Guards
// ============================================================================

/**
 * Check if a string is a valid PluginId
 *
 * @param value - Value to check
 * @returns true if value is a valid PluginId
 *
 * @example
 * ```ts
 * if (isValidPluginId(pluginId)) {
 *   // Type-safe to use as PluginId
 *   const plugin = getPluginById(pluginId);
 * }
 * ```
 */
export function isValidPluginId(value: string): value is PluginId {
  return PLUGIN_IDS.includes(value as PluginId);
}

/**
 * Get plugins by category
 *
 * @param category - Category to filter by
 * @returns Array of plugin IDs in the category
 *
 * @example
 * ```ts
 * const editorPlugins = getPluginsByCategory('editor');
 * // ['filetree', 'monaco', 'notes']
 * ```
 */
export function getPluginsByCategory(category: PluginCategory): PluginId[] {
  return PLUGIN_IDS.filter(id => PLUGIN_CATEGORIES[id] === category);
}

// ============================================================================
// No additional exports - types already exported above
// ============================================================================
