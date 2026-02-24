/**
 * @fileoverview Notes Plugin Types
 * @module plugins/notes/types
 *
 * **ARCH-02-06**: Convert Notes/BlockNote to Plugin
 *
 * Local types for Notes plugin storage abstraction and conflict handling.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-06
 * @team Team A
 * @created 2026-01-21
 */

// ============================================================================
// Notes Plugin State
// ============================================================================

/**
 * State interface for Notes plugin
 *
 * @remarks
 * Returned by useNotesPlugin hook to NotesPlugin component.
 * Encapsulates storage-specific logic and actions.
 */
export interface NotesPluginState {
  /** Note identifier (path for FSA, ID for IndexedDB) */
  noteId: string | undefined;

  /** Whether editor is read-only (e.g., file locked) */
  isReadOnly: boolean;

  /** Whether content is being loaded */
  isLoading: boolean;

  /** Current note content as markdown string */
  content: string;

  /** Whether note has unsaved changes */
  isDirty: boolean;

  /** Save handler (delegates to storage) */
  onSave: () => Promise<void>;

  /** Reload handler (clears editor and reloads from storage) */
  onReload: () => Promise<void>;
}

// ============================================================================
// Conflict Resolution Types
// ============================================================================

/**
 * Conflict detection state for FSA mode
 */
export interface ConflictState {
  /** Whether a conflict is currently detected */
  hasConflict: boolean;

  /** External change timestamp (if detected) */
  externalTimestamp: number | undefined;

  /** Local change timestamp (if applicable) */
  localTimestamp: number | undefined;
}

/**
 * Conflict resolution choice
 */
export type ConflictResolution = 'keep-local' | 'reload-external' | 'cancel';

/**
 * Conflict dialog state
 */
export interface ConflictDialogState {
  /** Whether conflict dialog is open */
  isOpen: boolean;

  /** Resolution action selected by user */
  resolution: ConflictResolution | undefined;

  /** External file content (for preview) */
  externalContent: string | undefined;

  /** Local file content (for preview) */
  localContent: string | undefined;
}

// ============================================================================
// Storage Mode
// ============================================================================

/**
 * Storage mode for Notes plugin
 */
export type NotesStorageMode = 'fsa' | 'indexeddb';

// ============================================================================
// No additional exports - types already exported above
// ============================================================================
