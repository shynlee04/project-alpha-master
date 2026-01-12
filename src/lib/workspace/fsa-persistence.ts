/**
 * @fileoverview FSA Folder Picker & Persistence (Phase 1)
 * @module lib/workspace/fsa-persistence
 *
 * PHASE 1: Desktop folder picker flow
 * - Wraps FSA showDirectoryPicker() with error handling
 * - Integrates with existing fsaHandleManager
 * - Fallback to temp project on permission denied
 *
 * Usage:
 * ```ts
 * import { pickFolder, createProjectFromFolder } from '@/lib/workspace/fsa-persistence';
 *
 * const result = await pickFolder();
 * if (result.success) {
 *   const projectId = await createProjectFromFolder(result.handle, result.folderName);
 *   navigate({ to: '/ide/$projectId', params: { projectId } });
 * } else if (result.reason === 'not_supported') {
 *   // Show toast: FSA not supported on this device
 * } else if (result.reason === 'aborted') {
 *   // User cancelled - fallback to temp project
 * }
 * ```
 */

import { fsaHandleManager } from '@/lib/filesystem/fsa-handle-manager';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { CreateProjectInput } from '@/infrastructure/persistence/stores/project';
import type { WorkspaceBindings } from '@/infrastructure/persistence/stores/project';

// ============================================================================
// Types
// ============================================================================

export interface FolderPickResult {
  success: boolean;
  reason?: 'aborted' | 'not_supported' | 'error';
  handle?: FileSystemDirectoryHandle;
  folderName?: string;
  error?: Error;
}

export interface CreateFromFolderOptions {
  workspaceBindings?: WorkspaceBindings;
  autoSync?: boolean;
  tags?: string[];
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if File System Access API is supported
 */
export function isFSASupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'showDirectoryPicker' in window;
}

// FIX C-04: Removed duplicate isDesktopPlatform() - now re-exported from canonical source
// @see src/lib/utils/platform-detection.ts for implementation
// Re-export for backward compatibility
export { isDesktopPlatform } from '@/lib/utils/platform-detection';

/**
 * Pick a folder using File System Access API
 *
 * Returns:
 * - success: true with handle and folderName
 * - success: false with reason ('aborted' | 'not_supported' | 'error')
 */
export async function pickFolder(): Promise<FolderPickResult> {
  // Check FSA support
  if (!isFSASupported()) {
    return {
      success: false,
      reason: 'not_supported',
    };
  }

  try {
    // Open directory picker
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      id: undefined, // No persistent ID - user selects fresh each time
    });

    return {
      success: true,
      handle,
      folderName: handle.name,
    };
  } catch (error) {
    const err = error as Error;

    // User aborted the picker
    if (err.name === 'AbortError') {
      return {
        success: false,
        reason: 'aborted',
      };
    }

    // Other error
    return {
      success: false,
      reason: 'error',
      error: err,
    };
  }
}

/**
 * Create a project from a selected folder handle
 *
 * This function:
 * 1. Creates a new project with 'fsa' storage type
 * 2. Persists the FSA handle via fsaHandleManager
 * 3. Returns the project ID for navigation
 */
export async function createProjectFromFolder(
  handle: FileSystemDirectoryHandle,
  folderName: string,
  options?: CreateFromFolderOptions
): Promise<string> {
  const projectInput: CreateProjectInput = {
    name: folderName,
    folderPath: handle.name,
    fsaHandle: handle,
    storageType: 'fsa', // Desktop uses File System Access API
    autoSync: options?.autoSync ?? true,
    bindings: options?.workspaceBindings ?? {
      ide: true,
      knowledge: false,
      notes: false,
      study: false,
    },
    tags: options?.tags ?? [],
  };

  // Use project store to create project
  // This handles:
  // - Zustand store update
  // - Dexie persistence
  // - FSA handle persistence
  const projectId = useProjectStore.getState().createProject(projectInput);

  // Explicitly persist FSA handle for instant re-grant on next visit
  await fsaHandleManager.persistHandle(handle, projectId, 'ide');

  console.log('[FSA-Persistence] Created project from folder:', projectId, folderName);
  return projectId;
}

/**
 * Restore a previously granted folder handle
 *
 * Attempts silent re-grant using stored handle ID.
 * Returns null if silent re-grant fails.
 */
export async function restoreFolderHandle(projectId: string): Promise<FileSystemDirectoryHandle | null> {
  return await fsaHandleManager.restoreHandle(projectId);
}

/**
 * Check if a project folder can be silently restored
 */
export async function canRestoreFolder(projectId: string): Promise<boolean> {
  return await fsaHandleManager.canSilentRestore(projectId);
}
