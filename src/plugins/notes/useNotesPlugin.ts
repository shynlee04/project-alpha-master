/**
 * @fileoverview Notes Plugin Hook
 * @module plugins/notes/useNotesPlugin
 *
 * **ARCH-02-06**: Convert Notes/BlockNote to Plugin
 *
 * Custom hook for Notes plugin that:
 * - Abstracts storage operations (FSA vs IndexedDB)
 * - Manages note content loading/saving
 * - Handles conflict detection for FSA mode
 * - Debounces file watch events
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-06
 * @team Team A
 * @created 2026-01-21
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Plugin system
import type { ProjectContext } from '@/infrastructure/context/project-context';

// Local types
import type {
  NotesPluginState,
  ConflictState,
  ConflictDialogState,
  NotesStorageMode,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/** Debounce delay for file watch events (500ms per story requirements) */
const FILE_WATCH_DEBOUNCE_MS = 500;

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Notes Plugin Hook
 *
 * @param projectContext - Project context from ProjectContextProvider
 * @returns Notes plugin state and actions
 *
 * @remarks
 * This hook abstracts storage-specific logic for both FSA and IndexedDB modes.
 * - FSA mode: Uses gateway.read/write for markdown files
 * - IndexedDB mode: Uses Dexie notes table
 * - Conflict resolution: Debounced watch events for FSA
 *
 * Storage Strategy:
 * - FSA (Desktop): /notes/*.md markdown files
 * - IndexedDB (Mobile): Virtual storage in notes table
 */
export function useNotesPlugin(projectContext: ProjectContext): NotesPluginState {
  // Extract context values
  const { project, gateway, saveFile } = projectContext;

  // Local state
  const [content, setContent] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Refs for debounce and watch cleanup
  const watchCleanupRef = useRef<(() => void) | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================================
  // Storage Mode Detection
  // ============================================================================

  /**
   * Determine storage mode based on ProjectContext
   */
  const storageMode: NotesStorageMode = useMemo(() => {
    return project.storageType === 'fsa' ? 'fsa' : 'indexeddb';
  }, [project.storageType]);

  /**
   * Note ID - now undefined by default to match NotesPlugin.tsx behavior.
   * The hook is retained for API compatibility but NotesPlugin.tsx uses
   * inline logic instead.
   * 
   * FIX: Removed hardcoded fallback to 'note.md' - Notes now waits for
   * user to select a markdown file from FileTree.
   */
  const noteId: string | undefined = useMemo(() => {
    // FIX: No automatic fallback - wait for user to select a file
    // This matches Monaco behavior (shows "No file open" until selection)
    return undefined;
  }, []);

  // ============================================================================
  // Load Content
  // ============================================================================

  /**
   * Load note content from storage
   */
  const loadContent = useCallback(async () => {
    if (!noteId || !gateway) {
      return;
    }

    setIsLoading(true);

    try {
      if (storageMode === 'fsa') {
        // FSA mode: Read markdown file
        const data = await gateway.read(noteId);
        const text = new TextDecoder().decode(data);
        setContent(text);
        console.log('[NotesPlugin] Loaded FSA note:', noteId);
      } else {
        // IndexedDB mode: Query Dexie notes table
        // Note: For POC, this is a placeholder
        // Full implementation would use DexieDB.notes.get(projectId)
        // TODO: Integrate with Dexie notes table when available
        console.log('[NotesPlugin] Loaded IndexedDB note:', noteId);
      }

      setIsDirty(false);
    } catch (err) {
      console.error('[NotesPlugin] Error loading note:', err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId, gateway, storageMode]);

  // Load on mount and when note ID changes
  useEffect(() => {
    loadContent();
  }, [loadContent, noteId]);

  // ============================================================================
  // Save Content
  // ============================================================================

  /**
   * Save note content to storage
   */
  const saveContent = useCallback(async () => {
    if (!noteId || !saveFile) {
      return;
    }

    try {
      if (storageMode === 'fsa') {
        // FSA mode: Write markdown file directly
        const data = new TextEncoder().encode(content);
        await gateway.write(noteId, data);
        console.log('[NotesPlugin] Saved FSA note:', noteId);
      } else {
        // IndexedDB mode: Use ProjectContext.saveFile
        await saveFile(noteId, content);
        console.log('[NotesPlugin] Saved IndexedDB note:', noteId);
      }

      setIsDirty(false);
    } catch (err) {
      console.error('[NotesPlugin] Error saving note:', err);
    }
  }, [noteId, saveFile, gateway, storageMode, content]);

  // ============================================================================
  // File Watch (FSA Mode Only)
  // ============================================================================

  /**
   * Setup file watch for FSA mode
   */
  useEffect(() => {
    // Only watch in FSA mode
    if (storageMode !== 'fsa' || !noteId || !gateway) {
      return;
    }

    const watchHandle = gateway.watch((change) => {
      // Debounce watch events to avoid multiple conflict dialogs
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        console.log('[NotesPlugin] File change detected:', change);

        // For POC: Log file change but don't implement full conflict resolution
        // Full implementation would:
        // - Track local save operations
        // - Detect external changes
        // - Show conflict dialog with user choices
      }, FILE_WATCH_DEBOUNCE_MS);
    });

    // Store cleanup function
    watchCleanupRef.current = () => watchHandle.dispose();

    // Cleanup on unmount
    return () => {
      if (watchCleanupRef.current) {
        watchCleanupRef.current();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [storageMode, noteId, gateway, content]);

  // ============================================================================
  // Manual Save Handler
  // ============================================================================

  /**
   * Manual save handler (for toolbar button)
   */
  const onSave = useCallback(async () => {
    await saveContent();
  }, [saveContent]);

  // ============================================================================
  // Manual Reload Handler
  // ============================================================================

  /**
   * Manual reload handler (for toolbar button)
   */
  const onReload = useCallback(async () => {
    await loadContent();
  }, [loadContent]);

  // ============================================================================
  // Return State
  // ============================================================================

  return {
    noteId,
    isReadOnly: false, // Notes editor is always editable
    content,
    isDirty,
    isLoading,
    onSave,
    onReload,
  };
}

// ============================================================================
// Export Types for External Use
// ============================================================================

export type { NotesPluginState, ConflictState, ConflictDialogState, NotesStorageMode };
