/**
 * @fileoverview Sync Infrastructure Barrel Export
 * @module infrastructure/sync
 *
 * Unified sync system for bidirectional file synchronization.
 * Consolidates 7+ fragmented sync implementations into one robust system.
 *
 * **Architecture:**
 * - **Adapters**: Storage backend abstraction (FSA, IndexedDB, WebContainer)
 * - **Strategies**: Sync logic (bidirectional, conflict resolution)
 * - **Core Engine**: Orchestrates adapters and strategies, emits events
 * - **Events**: Event bus for UI integration
 *
 * **Key Features:**
 * - P0: IndexedDB quota management (prevents data loss)
 * - P0: Conflict resolution (4 strategies with user notification)
 * - P0: Event emission (UI uses real data, not mock)
 *
 * @example
 * ```ts
 * import { createSyncEngine, fsaAdapter, idbAdapter } from '@/infrastructure/sync';
 *
 * const engine = createSyncEngine({
 *   adapters: { fsa: fsaAdapter, idb: idbAdapter },
 *   defaults: { direction: 'bidirectional' },
 * });
 *
 * await engine.sync();
 * ```
 */

// ============================================================================
// Core Engine
// ============================================================================

export {
  SyncEngine,
  createSyncEngine,
} from './core/sync-engine';
export type {
  SyncEngineConfig,
  SyncEngineState,
} from './core/sync-engine';

// ============================================================================
// Types
// ============================================================================

export type {
  // Basic types
  WorkspaceType,
  SyncDirection,
  ConflictStrategy,
  SyncStatusType,
  FileSyncState,

  // File types
  FileMetadata,
  FileContent,

  // Events
  SyncEvent,
  SyncEventType,
  SyncEventData,
  FileChangeEvent,

  // Sync options and results
  SyncOptions,
  SyncResult,
  FailedFile,

  // Conflicts
  FileConflict,
  ConflictResolution,

  // Quota
  QuotaInfo,
  QuotaCheckResult,
  EvictionPolicy,
  EvictionResult,

  // Storage adapter interface
  StorageAdapter,

  // Event emitter
  EventEmitter,

  // File change callback
  FileChangeCallback,
} from './core/sync-types';

// Export constants
export { DEFAULT_EXCLUSIONS, DEFAULT_SYNC_OPTIONS, WORKSPACE_EXCLUSIONS } from './core/sync-types';

// ============================================================================
// Events
// ============================================================================

export {
  SyncEventBus,
  syncEventBus,
  FileWatcher,
} from './core/sync-events';
export type {
  EventHandler,
  EventListener,
} from './core/sync-events';

// Export convenience functions
export {
  emitSyncStarted,
  emitSyncProgress,
  emitSyncCompleted,
  emitSyncFailed,
  emitFileSynced,
  emitFileConflict,
  emitFileError,
  emitQuotaWarning,
  emitQuotaExceeded,
} from './core/sync-events';

// ============================================================================
// Adapters
// ============================================================================

export {
  BaseStorageAdapter,
  // Error classes
  AdapterError,
  FileNotFoundError,
  PermissionDeniedError,
  QuotaExceededError,
  AdapterNotReadyError,
  // Type guards
  isAdapterError,
  isPermissionDeniedError,
  isQuotaExceededError,
} from './adapters/base-adapter';

export {
  FSAAdapter,
  fsaAdapter,
} from './adapters/fsa-adapter';
export type { FSAAdapterConfig } from './adapters/fsa-adapter';

export {
  IDBAdapter,
  idbAdapter,
} from './adapters/idb-adapter';
export type { IDBAdapterConfig } from './adapters/idb-adapter';

// ============================================================================
// Strategies
// ============================================================================

export {
  BidirectionalSync,
  createBidirectionalSync,
} from './strategies/bidirectional-sync';
export type {
  FileChangeStatus,
  FileComparison,
  FileSyncOperation,
} from './strategies/bidirectional-sync';

export {
  ConflictResolver,
  createConflictResolver,
  conflictResolver,
  detectConflicts,
} from './strategies/conflict-resolution';
export type {
  ConflictDetectionConfig,
  UserConflictChoice,
  UserPromptResult,
  ConflictPromptCallback,
} from './strategies/conflict-resolution';

// ============================================================================
// Legacy SyncManager (being migrated)
// ============================================================================
// TODO: Move implementation from src/lib/filesystem/sync-manager to here
// For now, re-exporting from old location for backward compatibility

export type {
  SyncConfig,
  SyncProgress,
  SyncResult as LegacySyncResult,
  SyncStatus,
} from '@/lib/filesystem/sync-manager/sync-manager-types';
export { SyncError } from '@/lib/filesystem/sync-manager/sync-manager-types';
export { SyncManager } from '@/lib/filesystem/sync-manager/sync-manager';
export { createSyncManager } from '@/lib/filesystem/sync-manager/sync-manager-factory';
export { syncToWebContainer, incrementalSyncToWebContainer } from '@/lib/filesystem/sync-manager/sync-batch-sync';
export {
  writeFile,
  deleteFile,
  createDirectory,
  deleteDirectory,
} from '@/lib/filesystem/sync-manager/sync-file-ops';
