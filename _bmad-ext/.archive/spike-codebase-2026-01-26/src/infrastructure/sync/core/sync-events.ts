/**
 * @fileoverview Sync Event System - Barrel Export
 * @module infrastructure/sync/core/sync-events
 *
 * Re-exports all event system components for backwards compatibility.
 * This file maintains the original API while organizing into focused modules.
 *
 * **Split Modules:**
 * - sync-event-bus.ts: SyncEventBus class and event handling
 * - event-emitters.ts: Convenience emit* functions
 * - file-watcher.ts: FileWatcher class for FSA integration
 */

// ============================================================================
// Event Bus
// ============================================================================

export {
  SyncEventBus,
  syncEventBus,
  type EventHandler,
  type EventListener,
} from './sync-event-bus.js';

// Export as default for backwards compatibility
export { default } from './sync-event-bus.js';

// ============================================================================
// Event Emitters
// ============================================================================

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
} from './event-emitters.js';

// ============================================================================
// File Watcher
// ============================================================================

export { FileWatcher } from './file-watcher.js';
