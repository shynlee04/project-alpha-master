/**
 * @fileoverview FSA Permission Manager - Permission handling for File System Access API
 * @module infrastructure/sync/adapters/fsa-permission-manager
 *
 * Handles permission requests, checks, and enforcement for File System Access API.
 */

import { PermissionDeniedError } from './base-adapter';

// ============================================================================
// Permission Management
// ============================================================================

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface PermissionManagerConfig {
  debug?: boolean;
  onPermissionGranted?: (handle: FileSystemDirectoryHandle) => void;
}

/**
 * Request directory access from user
 * @param adapterName - Name of the adapter for error messages
 * @param config - Permission manager configuration
 * @returns Directory handle
 * @throws {PermissionDeniedError} If user cancels the picker
 * @throws {Error} If File System Access API is not supported
 */
export async function requestDirectoryAccess(
  adapterName: string,
  config: PermissionManagerConfig = {}
): Promise<FileSystemDirectoryHandle> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('File System Access API not supported');
  }

  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents',
    });

    config.onPermissionGranted?.(handle);
    return handle;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new PermissionDeniedError(adapterName, 'Directory picker was cancelled');
    }
    throw error;
  }
}

/**
 * Check permission status without prompting
 * @param directoryHandle - Directory handle to check
 * @returns Permission status
 */
export async function checkPermissionStatus(
  directoryHandle: FileSystemDirectoryHandle | null
): Promise<PermissionStatus> {
  if (!directoryHandle) {
    return 'prompt';
  }

  try {
    // Try to query permission state
    if ((directoryHandle as any).queryPermissionDescriptor) {
      const permission = await (directoryHandle as any)
        .queryPermissionDescriptor({ mode: 'readwrite' });

      if (permission.state === 'granted') {
        return 'granted';
      } else if (permission.state === 'prompt') {
        return 'prompt';
      } else if (permission.state === 'denied') {
        return 'denied';
      }
    }
    // Fallback: assume granted if we have a handle
    return 'granted';
  } catch {
    return 'unsupported';
  }
}

/**
 * Check if File System Access API is supported
 * @returns true if supported, false otherwise
 */
export function isFSSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Ensure permission is granted
 * @param adapterName - Name of the adapter
 * @param permissionGranted - Current permission state
 * @param directoryHandle - Directory handle
 * @throws {PermissionDeniedError} If permission not granted
 */
export function ensurePermissionGranted(
  adapterName: string,
  permissionGranted: boolean,
  directoryHandle: FileSystemDirectoryHandle | null
): void {
  if (!permissionGranted || !directoryHandle) {
    throw new PermissionDeniedError(
      adapterName,
      'No directory access. Call mount() or requestAccess() first.'
    );
  }
}
