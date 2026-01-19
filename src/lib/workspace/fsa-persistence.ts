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

import { handlePersistenceService } from '@/infrastructure/filesystem/handle-persistence';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import type { CreateProjectInput } from '@/infrastructure/persistence/stores/project';
import type { WorkspaceBindings } from '@/infrastructure/persistence/stores/project';
import { serializeHandle } from '@/infrastructure/filesystem/handle-persistence';
import { FSAGateway } from '@/infrastructure/filesystem/fsa-gateway';
import { initializeViagentFolder } from '@/infrastructure/filesystem/viagent-service';
import { db } from '@/infrastructure/persistence/dexie-db';

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
 * Check if a project with the given folder path already exists
 *
 * Returns the existing project ID if found, null otherwise.
 * This prevents duplicate projects pointing to the same folder.
 */
async function checkForDuplicateProject(folderPath: string): Promise<string | null> {
  try {
    const allProjects = await db.projects.toArray();
    const duplicate = allProjects.find(p => p.folderPath === folderPath);
    return duplicate?.id ?? null;
  } catch (error) {
    console.error('[FSA-Persistence] Error checking for duplicate projects:', error);
    return null; // On error, allow creation (better than blocking)
  }
}

/**
 * Verify that a FileSystemDirectoryHandle is valid and can read the directory
 *
 * This prevents creating projects with invalid handles or insufficient permissions.
 */
async function verifyHandleAccess(handle: FileSystemDirectoryHandle): Promise<boolean> {
  try {
    // Try to read the first entry from the directory to verify permission
    // Note: TypeScript may not have full FSA types - using type assertion
    const iterator = (handle as any).entries();
    await iterator.next();
    // If we get here without throwing, we have access
    return true;
  } catch (error) {
    const err = error as { name?: string; message?: string };
    console.error('[FSA-Persistence] Handle verification failed:', err.name, err.message);
    return false;
  }
}

/**
 * Create a project from a selected folder handle
 *
 * **ARC-B10**: Initialize .viagent/ metadata folder on project creation
 *
 * This function:
 * 1. Checks for duplicate projects with same folder
 * 2. Verifies handle is valid and accessible
 * 3. Creates a new project with 'fsa' storage type
 * 4. Persists the FSA handle via handlePersistenceService
 * 5. Initializes .viagent/ folder with metadata files
 * 6. Returns the project ID for navigation
 */
export async function createProjectFromFolder(
  handle: FileSystemDirectoryHandle,
  folderName: string,
  options?: CreateFromFolderOptions
): Promise<string> {
  // BUG-FIX-001: Check for duplicate project with same folder
  const folderPath = handle.name;
  const existingProjectId = await checkForDuplicateProject(folderPath);
  if (existingProjectId) {
    console.warn(`[FSA-Persistence] Project already exists for folder: ${folderPath}, returning existing project: ${existingProjectId}`);
    // Update the existing project's lastOpened timestamp
    useProjectStore.getState().updateLastOpened?.(existingProjectId);
    return existingProjectId;
  }

  // BUG-FIX-002: Verify handle is accessible before creating project
  const hasAccess = await verifyHandleAccess(handle);
  if (!hasAccess) {
    throw new Error(`Cannot access folder "${folderName}". Please ensure you have granted read/write permissions.`);
  }

  console.log('[FSA-Persistence] Creating new project for folder:', folderPath);

  // BUG-FIX-005: Desktop FSA projects should enable Notes by default
  // Users expect to take notes in the same folder they're coding in
  const defaultBindings = {
    ide: true,
    knowledge: false,
    notes: true,  // Changed: Enable Notes for FSA projects by default
    study: false,
  };

  const projectInput: CreateProjectInput = {
    name: folderName,
    folderPath: handle.name,
    storageMetadata: serializeHandle(handle, 'ide'), // PS-04: Use serializable metadata instead of handle
    storageType: 'fsa', // Desktop uses File System Access API
    autoSync: options?.autoSync ?? true,
    bindings: options?.workspaceBindings ?? defaultBindings,
    tags: options?.tags ?? [],
  };

  // Use project store to create project
  // This handles:
  // - Zustand store update
  // - Dexie persistence
  // - FSA handle persistence
  const projectId = await useProjectStore.getState().createProject(projectInput);

  // Explicitly persist FSA handle for instant re-grant on next visit
  await handlePersistenceService.persistHandle(projectId, handle, 'ide');

  // BUG-FIX-006: Initialize /notes folder for note storage
  // Desktop users expect notes to be stored alongside their code
  try {
    const gateway = new FSAGateway(handle);
    await gateway.createDirectory('/notes');
    console.log('[FSA-Persistence] Created /notes folder for project:', projectId);
  } catch (error) {
    const err = error as Error;
    console.warn('[FSA-Persistence] Failed to create /notes folder:', err.message);
    // Non-fatal - notes can still work in Dexie mode or will be created on first write
  }

  // ARC-B10: Initialize .viagent/ metadata folder
  try {
    const gateway = new FSAGateway(handle);
    const bindings = options?.workspaceBindings ?? defaultBindings;
    // Convert optional WorkspaceBindings to required { ide: boolean; knowledge: boolean; notes: boolean; study: boolean; }
    const requiredBindings = {
      ide: bindings.ide ?? defaultBindings.ide,
      knowledge: bindings.knowledge ?? defaultBindings.knowledge,
      notes: bindings.notes ?? defaultBindings.notes,
      study: bindings.study ?? defaultBindings.study,
    };
    await initializeViagentFolder(gateway, {
      projectId,
      projectName: folderName,
      storageType: 'fsa',
      workspaceBindings: requiredBindings,
    });
    console.log('[FSA-Persistence] Initialized .viagent/ folder for project:', projectId);
  } catch (error) {
    const err = error as Error;
    console.warn('[FSA-Persistence] Failed to initialize .viagent/ folder:', err.message);
    // Don't fail project creation if metadata initialization fails
    // User can still use the project, metadata will be created on next access
  }

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
  const result = await handlePersistenceService.restoreHandle(projectId);
  return result.handle;
}

/**
 * Check if a project folder can be silently restored
 */
export async function canRestoreFolder(projectId: string): Promise<boolean> {
  return await handlePersistenceService.canSilentRestore(projectId);
}
