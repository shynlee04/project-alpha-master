/**
 * @fileoverview Markdown Sync Conflict Hook
 * @module presentation/hooks/useMarkdownSyncConflict
 *
 * **ARC-B12**: Hook for managing markdown sync conflict detection
 *
 * Integrates MarkdownSyncService with the conflict dialog to:
 * - Detect external file changes during editing
 * - Track unsaved local changes
 * - Auto-reload when local is clean
 * - Show conflict dialog when both have changes
 *
 * @epic EPIC-CC-ARC
 * @story ARC-B12
 * @author Team B
 * @created 2026-01-18
 */

import { useCallback, useEffect, useRef } from 'react';
import type { SyncConflictEvent } from '@/infrastructure/filesystem/markdown-sync-service';
import type { MarkdownSyncService } from '@/infrastructure/filesystem/markdown-sync-service';

/**
 * Hook configuration
 */
export interface UseMarkdownSyncConflictOptions {
  /** Markdown sync service instance */
  syncService: MarkdownSyncService | null;
  /** Current note being edited */
  currentNoteId: string | null;
  /** Whether editor has unsaved changes */
  hasUnsavedChanges: boolean;
  /** Callback when conflict needs resolution */
  onConflict?: (conflict: SyncConflictEvent) => void;
  /** Callback when auto-reload happens */
  onAutoReload?: (noteId: string) => void;
}

/**
 * Track unsaved changes per note
 */
interface UnsavedState {
  /** Note IDs with unsaved changes */
  unsavedNotes: Set<string>;
  /** Last modified time per note (when changes started) */
  modifiedTimes: Map<string, number>;
}

/**
 * Markdown Sync Conflict Hook
 *
 * Manages conflict detection and resolution for markdown sync.
 * Auto-reloads when local is clean, prompts for resolution when dirty.
 *
 * @example
 * ```ts
 * const conflictState = useMarkdownSyncConflict({
 *   syncService: markdownSyncService,
 *   currentNoteId: activeNoteId,
 *   hasUnsavedChanges: editorHasChanges,
 *   onConflict: (conflict) => showDialog(conflict),
 *   onAutoReload: (noteId) => loadNote(noteId),
 * });
 * ```
 */
export function useMarkdownSyncConflict({
  syncService,
  currentNoteId,
  hasUnsavedChanges,
  onConflict,
  onAutoReload,
}: UseMarkdownSyncConflictOptions) {
  // Track unsaved state
  const unsavedState = useRef<UnsavedState>({
    unsavedNotes: new Set(),
    modifiedTimes: new Map(),
  });

  /**
   * Mark current note as unsaved
   */
  const markUnsaved = useCallback(() => {
    if (!currentNoteId) return;

    const state = unsavedState.current;
    if (!state.unsavedNotes.has(currentNoteId)) {
      state.unsavedNotes.add(currentNoteId);
      state.modifiedTimes.set(currentNoteId, Date.now());
    }
  }, [currentNoteId]);

  /**
   * Mark current note as saved
   */
  const markSaved = useCallback(() => {
    if (!currentNoteId) return;

    const state = unsavedState.current;
    state.unsavedNotes.delete(currentNoteId);
    state.modifiedTimes.delete(currentNoteId);
  }, [currentNoteId]);

  /**
   * Check if a note has unsaved changes
   */
  const hasUnsaved = useCallback((noteId: string): boolean => {
    return unsavedState.current.unsavedNotes.has(noteId);
  }, []);

  /**
   * Get modified time for a note
   */
  const getModifiedTime = useCallback((noteId: string): number => {
    return unsavedState.current.modifiedTimes.get(noteId) ?? 0;
  }, []);

  /**
   * Handle conflict from sync service
   */
  const handleConflict = useCallback((event: SyncConflictEvent) => {
    const noteUnsaved = hasUnsaved(event.noteId);

    if (noteUnsaved) {
      // Local has unsaved changes - show conflict dialog
      onConflict?.(event);
    } else {
      // Local is clean - auto-reload
      onAutoReload?.(event.noteId);
    }
  }, [hasUnsaved, onConflict, onAutoReload]);

  // Track unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      markUnsaved();
    } else if (currentNoteId) {
      markSaved();
    }
  }, [hasUnsavedChanges, currentNoteId, markUnsaved, markSaved]);

  // Register conflict handler with sync service
  useEffect(() => {
    if (!syncService) return;

    // Update sync service config with conflict handler
    const originalConfig = (syncService as any).config;
    if (originalConfig && onConflict) {
      (syncService as any).config = {
        ...originalConfig,
        onConflict: handleConflict,
      };
    }

    return () => {
      // Restore original config on cleanup
      if (originalConfig) {
        (syncService as any).config = originalConfig;
      }
    };
  }, [syncService, handleConflict, onConflict]);

  return {
    /** Mark current note as unsaved */
    markUnsaved,
    /** Mark current note as saved */
    markSaved,
    /** Check if note has unsaved changes */
    hasUnsaved,
    /** Get modified time for a note */
    getModifiedTime,
    /** Set of note IDs with unsaved changes */
    unsavedNotes: unsavedState.current.unsavedNotes,
  };
}
