/**
 * @fileoverview File Loader Slice - Project Loading Logic
 * @module infrastructure/persistence/stores/workspace/slices/use-file-loader-slice
 * @governance EPIC-CC-01 - Project Space Foundation
 * @story PS-01 - Split useWorkspaceFileSystem God Store
 *
 * Manages:
 * - Project loading/hydration from Dexie
 * - Permission state detection
 * - IndexedDB adapter initialization for browser-only projects
 *
 * Part of the 3-slice architecture:
 * 1. use-file-loader-slice (THIS) - Project loading
 * 2. use-file-ops-slice - CRUD folder actions
 * 3. use-storage-adapter-slice - Sync/adapter management
 */

import { useState, useEffect, useRef, type RefObject, type Dispatch, type SetStateAction } from 'react';
import { LocalFSAdapter } from '@/infrastructure/filesystem';
import { UnifiedStorageAdapter } from '@/lib/filesystem/unified-storage-adapter';
// ARC-E04: Use canonical path for type
import type { FsaPermissionState } from '@/infrastructure/filesystem';
import { getProject, type ProjectMetadata } from '@/infrastructure/persistence/stores/project';
import { useWorkspaceStore } from '../workspace-store';
// INF-04-02: Use handlePersistenceService for handle restoration
import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';

/**
 * File loader slice configuration
 */
export interface UseFileLoaderSliceOptions {
  /** Initial project ID from route params */
  initialProjectId?: string | null;
  /** Initial directory handle restored from persistence (INF-04-02) */
  initialHandle?: FileSystemDirectoryHandle | null;
}

/**
 * File loader slice return type
 */
export interface FileLoaderSliceResult {
  // State
  projectMetadata: ProjectMetadata | null;
  setProjectMetadata: Dispatch<SetStateAction<ProjectMetadata | null>>;
  directoryHandle: FileSystemDirectoryHandle | null;
  setDirectoryHandle: Dispatch<SetStateAction<FileSystemDirectoryHandle | null>>;
  permissionState: FsaPermissionState;
  setPermissionState: Dispatch<SetStateAction<FsaPermissionState>>;
  autoSync: boolean;
  setAutoSyncState: Dispatch<SetStateAction<boolean>>;
  exclusionPatterns: string[];
  setExclusionPatterns: Dispatch<SetStateAction<string[]>>;

  // Refs
  localAdapterRef: RefObject<LocalFSAdapter | UnifiedStorageAdapter | null>;
}

/**
 * File Loader Slice Hook
 *
 * Handles project loading from Dexie, permission state detection,
 * and IndexedDB adapter initialization for browser-only projects.
 *
 * @param options - Configuration options
 * @returns File loader state and setters
 */
export function useFileLoaderSlice({
  initialProjectId,
  initialHandle,
}: UseFileLoaderSliceOptions): FileLoaderSliceResult {
  // Get currentProjectId from workspace store for reactive loading
  const currentProjectId = useWorkspaceStore((s) => s.currentProjectId);

  // Infrastructure refs
  const localAdapterRef = useRef<LocalFSAdapter | UnifiedStorageAdapter | null>(null);

  // Core state
  const [projectMetadata, setProjectMetadata] = useState<ProjectMetadata | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  // Initial state 'unknown' prevents flash of "No Folder Selected" overlay before project load
  const [permissionState, setPermissionState] = useState<FsaPermissionState>('unknown');
  const [autoSync, setAutoSyncState] = useState(true);
  const [exclusionPatterns, setExclusionPatterns] = useState<string[]>([]);

  // Load project on mount (if initialProjectId provided) OR when currentProjectId changes
  useEffect(() => {
    const projectIdToLoad = currentProjectId || initialProjectId;

    if (!projectIdToLoad || (projectMetadata && projectMetadata.id === projectIdToLoad)) {
      return;
    }

    let active = true;
    const load = async () => {
      try {
        const project = await getProject(projectIdToLoad);
        if (!active) return;

        if (project) {
          console.log('[FileLoaderSlice] Hydrated project:', project.name);
          setProjectMetadata(project);

          // PS-04: FSA handle not stored in Project - set to null initially
          // Handle will be restored via restoreProjectHandle when needed
          setDirectoryHandle(null);

          // Check actual permission state based on storage type
          if (project.storageType === 'indexeddb') {
            // Dexie-stored projects have no FSA handle - auto-grant permission
            setPermissionState('granted');

            // Create UnifiedStorageAdapter for IndexedDB projects
            try {
              const indexedDbAdapter = new UnifiedStorageAdapter({
                storageType: 'indexeddb',
                projectId: project.id,
              });
              await indexedDbAdapter.initialize();
              localAdapterRef.current = indexedDbAdapter;
              console.log('[FileLoaderSlice] Created UnifiedStorageAdapter for IndexedDB project:', project.id);
            } catch (err) {
              console.error('[FileLoaderSlice] Failed to create UnifiedStorageAdapter:', err);
            }
          } else {
            // FSA projects - restore handle via handlePersistenceService
            // INF-04-02: Use handlePersistenceService instead of projectStore.restoreProjectHandle
            console.log('[FileLoaderSlice] FSA project - attempting handle restoration for:', project.id);

            // PHASE-5-V4 FIX: Set 'restoring' state to prevent overlay flash
            setPermissionState('restoring');

            try {
              // INF-04-02: Use pre-restored handle if available, otherwise restore it
              let restoredHandle: FileSystemDirectoryHandle | null = null;
              
              if (initialHandle) {
                console.log('[FileLoaderSlice] Using pre-restored handle from initialHandle');
                restoredHandle = initialHandle;
              } else {
                // Restore handle via handlePersistenceService
                const result = await handlePersistenceService.restoreHandle(project.id);
                if (!active) return; // Check if component is still mounted
                
                if (result.success && result.handle) {
                  console.log('[FileLoaderSlice] FSA handle restored successfully via handlePersistenceService');
                  restoredHandle = result.handle;
                } else if (result.requiresUserInteraction) {
                  console.log('[FileLoaderSlice] FSA handle requires user interaction');
                  setPermissionState('prompt');
                } else {
                  console.warn('[FileLoaderSlice] FSA handle restoration failed:', result.error);
                  setPermissionState('prompt');
                }
              }
              
              if (restoredHandle) {
                setDirectoryHandle(restoredHandle);
                setPermissionState('granted');
                
                // Create FSA adapter for this handle
                const fsaAdapter = new LocalFSAdapter();
                fsaAdapter.setDirectoryHandle(restoredHandle);
                localAdapterRef.current = fsaAdapter;
                console.log('[FileLoaderSlice] Created LocalFSAdapter for FSA project:', project.id);
              }
            } catch (err) {
              console.error('[FileLoaderSlice] Failed to restore FSA handle:', err);
              if (active) {
                setPermissionState('prompt');
              }
            }
          }

          if (project.autoSync !== undefined) {
            setAutoSyncState(project.autoSync);
          }
          if (project.exclusionPatterns) {
            setExclusionPatterns(project.exclusionPatterns);
          }
        } else {
          console.warn('[FileLoaderSlice] Project not found:', projectIdToLoad);
        }
      } catch (err) {
        console.error('[FileLoaderSlice] Failed to load project:', err);
      }
    };
    load();
    return () => { active = false; };
  }, [currentProjectId, initialProjectId, initialHandle, projectMetadata?.id]);

  return {
    // State
    projectMetadata,
    setProjectMetadata,
    directoryHandle,
    setDirectoryHandle,
    permissionState,
    setPermissionState,
    autoSync,
    setAutoSyncState,
    exclusionPatterns,
    setExclusionPatterns,

    // Refs
    localAdapterRef,
  };
}
