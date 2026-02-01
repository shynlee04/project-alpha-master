/**
 * @fileoverview DEPRECATED - FSA Persistence stub
 * @deprecated This module is deprecated. Use @/infrastructure/filesystem/fsa-storage-adapter instead.
 */

/** @deprecated Use FileService from @/domain/interfaces/storage-adapter.interface */
export const fsaPersistenceManager = {
  save: async () => {},
  load: async () => null,
  delete: async () => {},
};

/** @deprecated */
export const FSAPersistenceManager = fsaPersistenceManager;

/** @deprecated */
export function createFSAPersistenceManager() {
  return fsaPersistenceManager;
}

/**
 * @deprecated Options for creating a project from a folder
 */
export interface CreateFromFolderOptions {
  name?: string;
  folderPath?: string;
  autoSync?: boolean;
}

/**
 * @deprecated Use ProjectService from @/domain/services/ProjectService instead
 * Stub function for backward compatibility - returns project ID
 */
export async function createProjectFromFolder(
  _handle: FileSystemDirectoryHandle,
  _folderName?: string,
  _options?: CreateFromFolderOptions
): Promise<string> {
  console.warn('createProjectFromFolder is deprecated. Use ProjectService instead.');
  // Return a generated project ID for backward compatibility
  return `proj-${Date.now()}`;
}

/**
 * @deprecated Use window.showDirectoryPicker() directly
 */
export async function pickFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await window.showDirectoryPicker();
  } catch {
    return null;
  }
}

/**
 * @deprecated Check for FileSystemAccessAPI directly
 */
export function isFSASupported(): boolean {
  return 'showDirectoryPicker' in window;
}

/**
 * @deprecated Use platform detection
 */
export function isDesktopPlatform(): boolean {
  return typeof window !== 'undefined' && !('ontouchstart' in window);
}
