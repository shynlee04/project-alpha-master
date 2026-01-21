/**
 * @fileoverview Notes Plugin Public API
 * @module plugins/notes
 *
 * **ARCH-02-06**: Notes Plugin Exports
 *
 * Public API for Notes plugin.
 * Exports plugin definition for registration in plugin-registry.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-06
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Notes Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Exported for:
 * - Plugin registration: `registerPlugin(notesPlugin)`
 * - Component usage: `<notesPlugin.MainComponent />`
 *
 * @see NotesPlugin.tsx for implementation details
 */
export { notesPlugin } from './NotesPlugin';

// ============================================================================
// Types
// ============================================================================

/**
 * Notes plugin types
 *
 * @remarks
 * Types for Notes plugin integration.
 */
export type {
  NotesPluginState,
  ConflictState,
  ConflictDialogState,
  NotesStorageMode,
} from './useNotesPlugin';

/**
 * Notes plugin hook
 *
 * @remarks
 * Hook for accessing ProjectContext in Notes plugin.
 * Provides direct access to gateway and file operations.
 */
export { useNotesPlugin } from './useNotesPlugin';
