/**
 * @fileoverview Core Sync Types - Unified Sync Infrastructure (Barrel Export)
 * @module infrastructure/sync/core/sync-types
 *
 * Re-exports all types from split modules for backwards compatibility.
 * This file maintains the original API while organizing types into focused modules.
 *
 * **Split Modules:**
 * - sync-core-types.ts: Basic enums (WorkspaceType, SyncDirection, etc.)
 * - file-types.ts: File metadata and content types
 * - event-types.ts: All event-related types
 * - sync-result-types.ts: Sync options, results, storage adapter interface
 * - quota-types.ts: IndexedDB quota and eviction types
 * - sync-config.ts: Configuration and default values
 */

// ============================================================================
// Core Types
// ============================================================================

export type {
  WorkspaceType,
  SyncDirection,
  ConflictStrategy,
  SyncStatusType,
  FileSyncState,
} from './sync-core-types.js';

// ============================================================================
// File Types
// ============================================================================

export type {
  FileMetadata,
  FileContent,
  FileChangeEvent,
} from './file-types.js';

// ============================================================================
// Event Types
// ============================================================================

export type {
  SyncEvent,
  SyncEventType,
  SyncEventData,
  SyncStartedData,
  SyncProgressData,
  SyncCompletedData,
  SyncFailedData,
  FileSyncedData,
  FileConflictData,
  FileErrorData,
  QuotaWarningData,
  QuotaExceededData,
} from './event-types.js';

// ============================================================================
// Result Types
// ============================================================================

export type {
  FileConflict,
  ConflictResolution,
  SyncOptions,
  SyncResult,
  FailedFile,
  StorageAdapter,
  FileChangeCallback,
} from './sync-result-types.js';

// ============================================================================
// Quota Types
// ============================================================================

export type {
  QuotaInfo,
  QuotaCheckResult,
  EvictionPolicy,
  EvictionResult,
} from './quota-types.js';

// ============================================================================
// Configuration
// ============================================================================

export type {
  EventEmitter,
  SyncEngineConfig,
} from './sync-config.js';

// ============================================================================
// Default Values
// ============================================================================

export {
  DEFAULT_EXCLUSIONS,
  DEFAULT_SYNC_OPTIONS,
  WORKSPACE_EXCLUSIONS,
} from './sync-config.js';

// ============================================================================
// Utility Functions
// ============================================================================

export {
  isStorageAdapter,
  isSyncSuccess,
  hasConflicts,
} from './sync-config.js';
