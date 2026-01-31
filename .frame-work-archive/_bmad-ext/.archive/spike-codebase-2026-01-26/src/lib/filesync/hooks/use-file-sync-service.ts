/**
 * @fileoverview File Sync Service Hook
 * @module lib/filesync/hooks/use-file-sync-service
 *
 * Custom hook for initializing file sync services with storage type selection.
 * Supports both IndexedDB (mobile-friendly) and File System Access API (desktop).
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story P0-3 - Implement fileSyncService for Study & Notes Workspaces
 * @epic STORAGE-UNIFICATION - Storage type architecture gap remediation
 *
 * @see {@link https://developer.chrome.com/docs/capabilities/file-system-access | File System Access API}
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { UnifiedStorageAdapter, type StorageType } from '../../filesystem/unified-storage-adapter';
import { isStorageTypeSupported } from '@/infrastructure/sync/adapters/adapter-factory';
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
    /** Storage type to use (indexeddb for mobile, fsa for desktop) */
    storageType?: StorageType;
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
    /** Initialize service (must be user-triggered for FSA) */
    initializeService: () => Promise<void>;
    /** Dispose service */
    disposeService: () => void;
    /** Service ready for use */
    isReady: boolean;
    /** Storage type supported for current platform */
    isSupported: boolean;
}

/**
 * Custom hook for initializing file sync services with storage type selection
 *
 * Features:
 * - IndexedDB support (works on all platforms including mobile)
 * - File System Access API support (desktop browsers only)
 * - User-triggered directory prompts for FSA (required by browser security)
 * - Automatic cleanup on unmount
 * - Browser compatibility detection with appropriate error messages
 *
 * @example
 * ```tsx
 * const { service, initializeService, isReady, isSupported } = useFileSyncService({
 *     projectId: 'project-123',
 *     workspaceType: 'study',
 *     storageType: 'indexeddb', // or 'fsa' for desktop
 * });
 *
 * if (!isSupported) {
 *     return <div>Storage type not supported</div>;
 * }
 *
 * return <button onClick={initializeService}>Initialize Sync</button>;
 * ```
 */
export function useFileSyncService({
    projectId,
    workspaceType,
    storageType = 'indexeddb',
    noteStore,
}: UseFileSyncServiceOptions): UseFileSyncServiceResult {
    const [service, setService] = useState<FileSyncService | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const adapterRef = useRef<UnifiedStorageAdapter | null>(null);

    // Check if storage type is supported on current platform
    const isSupported = isStorageTypeSupported(storageType);

    /**
     * Initialize file sync service
     * For FSA: MUST be called from user gesture (click, keypress)
     * For IndexedDB: Can be called automatically
     */
    const initializeService = useCallback(async () => {
        if (!projectId) {
            setError('No project selected');
            return;
        }

        if (!isSupported) {
            const supportMsg = storageType === 'fsa'
                ? 'File System Access API not supported. Please use Chrome, Edge, or Opera on desktop, or switch to IndexedDB storage.'
                : 'IndexedDB not supported in this browser.';
            setError(supportMsg);
            return;
        }

        setIsInitializing(true);
        setError(null);

        try {
            let adapter: UnifiedStorageAdapter;

            if (storageType === 'fsa') {
                // FSA mode: Prompt user to select directory (must be user-triggered)
                if (!('showDirectoryPicker' in window)) {
                    throw new Error('File System Access API not supported in this browser');
                }
                const directoryHandle = await window.showDirectoryPicker();

                // Create UnifiedStorageAdapter with FSA handle
                adapter = new UnifiedStorageAdapter({
                    storageType: 'fsa',
                    projectId,
                    fsaHandle: directoryHandle,
                });
                await adapter.initialize();
                adapterRef.current = adapter;
            } else {
                // IndexedDB mode: No user prompt required
                adapter = new UnifiedStorageAdapter({
                    storageType: 'indexeddb',
                    projectId,
                });
                await adapter.initialize();
                adapterRef.current = adapter;
            }

            // Create appropriate service based on workspace type
            if (workspaceType === 'study') {
                const studyConfig: StudyFileSyncConfig = {
                    workspaceType: 'study',
                    projectId,
                    localAdapter: adapter,
                };
                const studyService = new StudyFileSyncService(studyConfig);
                setService(studyService);
                console.log('[useFileSyncService] Study file sync service initialized with', storageType);
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
                console.log('[useFileSyncService] Notes file sync service initialized with', storageType);
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
    }, [projectId, workspaceType, noteStore, isSupported, storageType]);

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
