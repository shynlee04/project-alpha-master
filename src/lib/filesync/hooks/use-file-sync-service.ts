/**
 * @fileoverview File Sync Service Hook
 * @module lib/filesync/hooks/use-file-sync-service
 *
 * Custom hook for initializing file sync services
 * with user-triggered File System Access API prompts.
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story P0-3 - Implement fileSyncService for Study & Notes Workspaces
 *
 * @see {@link https://developer.chrome.com/docs/capabilities/file-system-access | File System Access API}
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { LocalFSAdapter } from '../../filesystem/local-fs-adapter';
import { StudyFileSyncService } from '../study-file-sync-service';
import { NotesFileSyncService } from '../notes-file-sync-service';
import type { StudyFileSyncConfig } from '../study-file-sync-service';
import type { NotesFileSyncConfig } from '../notes-file-sync-service';
import type { FileSyncService } from '../file-sync-service';

export interface UseFileSyncServiceOptions {
    /** Current project ID */
    projectId: string | null;
    /** Workspace type */
    workspaceType: 'study' | 'notes';
    /** Note store (required for notes workspace) */
    noteStore?: NotesFileSyncConfig['noteStore'];
}

export interface UseFileSyncServiceResult {
    /** Initialized file sync service */
    service: FileSyncService | null;
    /** Service initialization in progress */
    isInitializing: boolean;
    /** Initialization error message */
    error: string | null;
    /** Initialize service (must be user-triggered) */
    initializeService: () => Promise<void>;
    /** Dispose service */
    disposeService: () => void;
    /** Service ready for use */
    isReady: boolean;
    /** File System Access API supported */
    isSupported: boolean;
}

/**
 * Custom hook for initializing file sync services
 *
 * Features:
 * - User-triggered File System Access API prompts (required by browser security)
 * - Automatic cleanup on unmount
 * - Browser compatibility detection (mobile fallback)
 * - Clear error messages for users
 *
 * @example
 * ```tsx
 * const { service, initializeService, isReady, isSupported } = useFileSyncService({
 *     projectId: 'project-123',
 *     workspaceType: 'study',
 * });
 *
 * if (!isSupported) {
 *     return <div>Desktop only</div>;
 * }
 *
 * return <button onClick={initializeService}>Select Directory</button>;
 * ```
 */
export function useFileSyncService({
    projectId,
    workspaceType,
    noteStore,
}: UseFileSyncServiceOptions): UseFileSyncServiceResult {
    const [service, setService] = useState<FileSyncService | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const adapterRef = useRef<LocalFSAdapter | null>(null);

    // Check for File System Access API support
    const isSupported = 'showDirectoryPicker' in window;

    /**
     * Initialize file sync service
     * MUST be called from user gesture (click, keypress)
     */
    const initializeService = useCallback(async () => {
        if (!projectId) {
            setError('No project selected');
            return;
        }

        if (!isSupported) {
            setError('File System Access API not supported. Please use Chrome, Edge, or Opera on desktop.');
            return;
        }

        setIsInitializing(true);
        setError(null);

        try {
            // Prompt user to select directory (must be user-triggered)
            const directoryHandle = await window.showDirectoryPicker();

            // Create LocalFSAdapter and set directory handle
            const adapter = new LocalFSAdapter();
            await adapter.setDirectoryHandle(directoryHandle);
            adapterRef.current = adapter;

            // Create appropriate service based on workspace type
            if (workspaceType === 'study') {
                const studyConfig: StudyFileSyncConfig = {
                    workspaceType: 'study',
                    projectId,
                    localAdapter: adapter,
                };
                const studyService = new StudyFileSyncService(studyConfig);
                setService(studyService);
                console.log('[useFileSyncService] Study file sync service initialized');
            } else if (workspaceType === 'notes' && noteStore) {
                const notesConfig: NotesFileSyncConfig = {
                    workspaceType: 'notes',
                    projectId,
                    localAdapter: adapter,
                    noteStore,
                    targetDirectory: '/notes',
                    autoSync: true,
                    syncInterval: 5000,
                    enableFileWatching: true,
                };
                const notesService = new NotesFileSyncService(notesConfig);
                setService(notesService);
                console.log('[useFileSyncService] Notes file sync service initialized');
            } else {
                throw new Error('Invalid workspace type or missing noteStore');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initialize file sync service';
            setError(errorMessage);
            console.error('[useFileSyncService] Initialization error:', err);
        } finally {
            setIsInitializing(false);
        }
    }, [projectId, workspaceType, noteStore, isSupported]);

    /**
     * Dispose service and cleanup
     */
    const disposeService = useCallback(() => {
        if (service && 'dispose' in service) {
            (service as any).dispose();
            console.log('[useFileSyncService] Service disposed');
        }
        setService(null);
        adapterRef.current = null;
    }, [service]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disposeService();
        };
    }, [disposeService]);

    return {
        service,
        isInitializing,
        error,
        initializeService,
        disposeService,
        isReady: service !== null,
        isSupported,
    };
}
