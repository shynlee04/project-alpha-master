/**
 * @fileoverview Markdown Sync Service Hook
 * @module lib/filesync/hooks/use-markdown-sync-service
 *
 * Custom hook for integrating MarkdownSyncService with NotesPage.
 * Provides bidirectional sync between BlockNote notes and .md files for FSA projects.
 *
 * **CC-V2-B04**: Connect MarkdownSyncService to NotesPage for FSA projects
 *
 * Per ADR-033 Decision D4:
 * - Desktop notes save as .md files in /project/notes/
 * - Bidirectional sync: BlockNote editor ↔ .md files
 * - Uses StorageGateway abstraction (FSA/IDB transparent)
 *
 * @epic EPIC-CC-ARC
 * @story CC-V2-B04
 * @author Team B
 * @created 2026-01-21
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';
import { MarkdownSyncService } from '@/infrastructure/filesystem/markdown-sync-service';
import { storageGatewayFactory } from '@/infrastructure/filesystem/storage-gateway-factory';
import { useNoteStore } from '@/lib/notes/note-store';
import { toast } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface UseMarkdownSyncServiceOptions {
    /** Current project */
    project: Project | null | undefined;
    /** Directory handle for FSA projects */
    directoryHandle?: FileSystemDirectoryHandle;
}

export interface UseMarkdownSyncServiceResult {
    /** Service ready for use */
    isReady: boolean;
    /** Service initialization in progress */
    isInitializing: boolean;
    /** Initialization error */
    error: string | null;
    /** Export a single note to .md file */
    exportNote: (note: NoteRecord) => Promise<void>;
    /** Import all .md files from notes directory */
    importAll: () => Promise<void>;
    /** Dispose the service */
    dispose: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Custom hook for MarkdownSyncService integration
 *
 * Features:
 * - Only initializes for FSA projects (storageType === 'fsa')
 * - Skips IndexedDB projects (no file sync needed)
 * - Auto-exports notes when edited
 * - Watches for external .md file changes
 * - Handles conflict resolution
 *
 * @example
 * ```tsx
 * const { isReady, exportNote } = useMarkdownSyncService({
 *     project,
 *     directoryHandle: fsaHandle,
 * });
 *
 * // Auto-export on note edit
 * useEffect(() => {
 *     if (activeNote && isReady) {
 *         exportNote(activeNote);
 *     }
 * }, [activeNote, isReady]);
 * ```
 */
export function useMarkdownSyncService({
    project,
    directoryHandle,
}: UseMarkdownSyncServiceOptions): UseMarkdownSyncServiceResult {
    const [service, setService] = useState<MarkdownSyncService | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const serviceRef = useRef<MarkdownSyncService | null>(null);
    const exportQueueRef = useRef<Set<string>>(new Set());

    // Initialize service for FSA projects
    useEffect(() => {
        // Only initialize for FSA projects
        if (!project || project.storageType !== 'fsa') {
            return;
        }

        // Skip if directory handle not available yet
        if (!directoryHandle) {
            console.log('[useMarkdownSyncService] No directory handle, skipping initialization');
            return;
        }

        const initializeService = async () => {
            if (serviceRef.current) {
                return; // Already initialized
            }

            setIsInitializing(true);
            setError(null);

            try {
                console.log('[useMarkdownSyncService] Initializing for FSA project:', project.id);

                // Create FSAGateway from directory handle
                const gateway = storageGatewayFactory.createFSAGateway(directoryHandle);

                // Create MarkdownSyncService
                const syncService = new MarkdownSyncService({
                    gateway,
                    notesPath: 'notes/',
                    enableWatching: true,
                    writeDebounceMs: 1000,
                    onConflict: (event) => {
                        // Show conflict resolution dialog
                        handleConflict(event);
                    },
                    onProgress: (stats) => {
                        console.log('[useMarkdownSyncService] Sync progress:', stats);
                    },
                    onError: (err, ctx) => {
                        console.error(`[useMarkdownSyncService] ${ctx}:`, err);
                    },
                });

                serviceRef.current = syncService;
                setService(syncService);
                setIsReady(true);

                // Start watching for external file changes
                syncService.startWatching();

                console.log('[useMarkdownSyncService] Service initialized and watching');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to initialize markdown sync service';
                setError(errorMessage);
                console.error('[useMarkdownSyncService] Initialization error:', err);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeService();

        // Cleanup on unmount
        return () => {
            if (serviceRef.current) {
                console.log('[useMarkdownSyncService] Disposing service');
                serviceRef.current.dispose();
                serviceRef.current = null;
                setService(null);
                setIsReady(false);
            }
        };
    }, [project, directoryHandle]);

    /**
     * Export a single note to .md file
     */
    const exportNote = useCallback(async (note: NoteRecord) => {
        if (!service || !isReady) {
            return;
        }

        // Skip if note has no content
        if (!note.title && (!note.blocks || note.blocks.length === 0)) {
            console.log('[useMarkdownSyncService] Skipping empty note:', note.id);
            return;
        }

        // Queue the export (debounced)
        exportQueueRef.current.add(note.id);

        // Clear existing timer and set new one
        setTimeout(async () => {
            if (!service || !exportQueueRef.current.has(note.id)) {
                return;
            }

            try {
                await service.exportNote(note);
                exportQueueRef.current.delete(note.id);
                console.log('[useMarkdownSyncService] Exported note:', note.id);
            } catch (err) {
                console.error('[useMarkdownSyncService] Export failed for note:', note.id, err);
            }
        }, 1000);
    }, [service, isReady]);

    /**
     * Import all .md files from notes directory
     */
    const importAll = useCallback(async () => {
        if (!service || !isReady) {
            console.warn('[useMarkdownSyncService] Service not ready for import');
            return;
        }

        try {
            const stats = await service.importAll(
                // createNote callback
                async (data) => {
                    const { createNote } = useNoteStore.getState();
                    return await createNote(data);
                },
                // updateNote callback - note store expects { id, ...data }
                async (id, data) => {
                    const { updateNote } = useNoteStore.getState();
                    await updateNote({ id, ...data });
                }
            );

            console.log('[useMarkdownSyncService] Import complete:', stats);

            if (stats.imported > 0) {
                toast.success(`Imported ${stats.imported} note${stats.imported > 1 ? 's' : ''}`, {
                    description: `${stats.skipped > 0 ? `${stats.skipped} skipped` : ''}`,
                });
            }
        } catch (err) {
            console.error('[useMarkdownSyncService] Import failed:', err);
            toast.error('Failed to import notes', {
                description: err instanceof Error ? err.message : String(err),
            });
        }
    }, [service, isReady]);

    /**
     * Handle sync conflict
     */
    const handleConflict = useCallback((event: {
        filePath: string;
        noteId: string;
        resolve: (direction: 'local-to-file' | 'file-to-local' | 'merge' | 'skip') => Promise<void>;
    }) => {
        const { filePath, resolve } = event;

        toast.warning('Sync conflict detected', {
            description: `File ${filePath} was modified externally`,
            action: {
                label: 'Resolve',
                onClick: async () => {
                    // For now, auto-resolve: file takes precedence (external edits win)
                    await resolve('file-to-local');
                    toast.success('Conflict resolved', {
                        description: 'External file changes were applied',
                    });
                },
            },
        });
    }, []);

    /**
     * Dispose the service
     */
    const dispose = useCallback(() => {
        if (serviceRef.current) {
            serviceRef.current.dispose();
            serviceRef.current = null;
            setService(null);
            setIsReady(false);
        }
    }, []);

    return {
        isReady: project?.storageType === 'fsa' ? isReady : false,
        isInitializing,
        error,
        exportNote,
        importAll,
        dispose,
    };
}
