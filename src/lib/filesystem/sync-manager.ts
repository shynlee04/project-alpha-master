/**
 * @fileoverview Sync Manager (Compatibility Shim)
 * @module lib/filesystem/sync-manager
 *
 * @deprecated This file has been split into focused modules.
 * Import from @/lib/filesystem/sync-manager instead.
 *
 * Provides synchronization between the local file system (via File System Access API)
 * and WebContainers' in-memory file system.
 */

// Re-export everything from the new module location
export * from './sync-manager/index';
