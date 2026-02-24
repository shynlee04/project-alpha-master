/**
 * @fileoverview Sync Configuration and Default Values
 * @module infrastructure/sync/core/sync-config
 *
 * Sync engine configuration, default options, and utility functions.
 */

import type { WorkspaceType } from './sync-core-types.js';
import type { SyncEventType, SyncEventData } from './event-types.js';
import type { SyncOptions, StorageAdapter } from './sync-result-types.js';

// ============================================================================
// Sync Engine Configuration
// ============================================================================

/**
 * Event emitter interface for sync events
 */
export interface EventEmitter {
  emit(event: SyncEventType, data: SyncEventData): void;
  on(event: SyncEventType, handler: (data: SyncEventData) => void): () => void;
}

/**
 * Sync engine configuration
 */
export interface SyncEngineConfig {
  /** Storage adapters */
  adapters: {
    fsa: StorageAdapter;
    idb: StorageAdapter;
    webcontainer?: StorageAdapter;
  };
  /** Default sync options */
  defaults?: Partial<SyncOptions>;
  /** Event bus for emitting events (optional) */
  eventBus?: EventEmitter;
  /** Whether to enable debug logging */
  debug?: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default exclusion patterns for all workspaces
 * These are always excluded regardless of workspace-specific exclusions
 */
export const DEFAULT_EXCLUSIONS: readonly string[] = [
  '**/.git/**',
  '**/node_modules/**',
  '**/.DS_Store',
  '**/Thumbs.db',
  '**/.vscode/**',
  '**/.idea/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.cache/**',
] as const;

/**
 * Default sync options
 */
export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  direction: 'bidirectional',
  conflictStrategy: 'last-write-wins',
  exclusions: [...DEFAULT_EXCLUSIONS],
  batchSize: 50,
  debounceMs: 300,
  emitEvents: true,
  showProgress: true,
  maxConcurrent: 5,
} as const;

/**
 * Workspace-specific exclusion patterns
 */
export const WORKSPACE_EXCLUSIONS: Record<WorkspaceType, string[]> = {
  ide: [
    '**/.vscode-test/**',
    '**/coverage/**',
  ],
  knowledge: [
    '**/.embeddings/**',
    '**/.chunks/**',
  ],
  study: [
    '**/.spaced-repetition/**',
  ],
  notes: [],
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Storage adapter type guard
 */
export function isStorageAdapter(value: unknown): value is StorageAdapter {
  return (
    typeof value === 'object' &&
    value !== null &&
    'readFile' in value &&
    'writeFile' in value &&
    'deleteFile' in value &&
    'listFiles' in value &&
    'getMetadata' in value &&
    'exists' in value
  );
}

/**
 * Check if sync result indicates success
 */
export function isSyncSuccess(result: import('./sync-result-types.js').SyncResult): boolean {
  return result.success && result.failedFiles.length === 0;
}

/**
 * Check if sync result has conflicts
 */
export function hasConflicts(result: import('./sync-result-types.js').SyncResult): boolean {
  return result.conflicts !== undefined && result.conflicts.length > 0;
}
