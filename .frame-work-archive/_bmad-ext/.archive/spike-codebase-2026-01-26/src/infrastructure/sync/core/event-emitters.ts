/**
 * @fileoverview Sync Event Emitter Functions
 * @module infrastructure/sync/core/event-emitters
 *
 * Convenience functions for emitting specific sync events.
 * These wrap the SyncEventBus.emit method with type-safe parameters.
 */

import { syncEventBus } from './sync-event-bus.js';
import type { SyncDirection } from './sync-core-types.js';
import type { FileMetadata } from './sync-types';

// ============================================================================
// Sync Lifecycle Events
// ============================================================================

/**
 * Emit sync started event
 */
export function emitSyncStarted(
  totalFiles: number,
  direction: SyncDirection
): void {
  syncEventBus.emit('sync:started', { totalFiles, direction });
}

/**
 * Emit sync progress event
 */
export function emitSyncProgress(
  current: number,
  total: number,
  currentFile?: string
): void {
  syncEventBus.emit('sync:progress', {
    current,
    total,
    currentFile,
    percentage: total > 0 ? (current / total) * 100 : 0,
  });
}

/**
 * Emit sync completed event
 */
export function emitSyncCompleted(
  totalFiles: number,
  syncedFiles: number,
  skippedFiles: number,
  duration: number
): void {
  syncEventBus.emit('sync:completed', {
    totalFiles,
    syncedFiles,
    skippedFiles,
    duration,
  });
}

/**
 * Emit sync failed event
 */
export function emitSyncFailed(
  error: string,
  failedAt?: string,
  partialSuccess?: boolean
): void {
  syncEventBus.emit('sync:failed', {
    error,
    failedAt,
    partialSuccess,
  });
}

// ============================================================================
// File Events
// ============================================================================

/**
 * Emit file synced event
 */
export function emitFileSynced(
  path: string,
  direction: 'uploaded' | 'downloaded' | 'synced'
): void {
  syncEventBus.emit('file:synced', { path, direction });
}

/**
 * Emit file conflict event
 */
export function emitFileConflict(
  path: string,
  localVersion: FileMetadata,
  remoteVersion: FileMetadata
): void {
  syncEventBus.emit('file:conflict', {
    path,
    localVersion,
    remoteVersion,
  });
}

/**
 * Emit file error event
 */
export function emitFileError(path: string, error: string): void {
  syncEventBus.emit('file:error', { path, error });
}

// ============================================================================
// Quota Events
// ============================================================================

/**
 * Emit quota warning event
 */
export function emitQuotaWarning(
  used: number,
  total: number,
  available: number,
  threshold: number
): void {
  syncEventBus.emit('quota:warning', {
    used,
    total,
    available,
    threshold,
  });
}

/**
 * Emit quota exceeded event
 */
export function emitQuotaExceeded(required: number, available: number): void {
  syncEventBus.emit('quota:exceeded', { required, available });
}
