/**
 * Sync Module - Barrel Export
 * 
 * Centralized exports for sync-related utilities and services.
 */

export { FileMetadataCache, fileMetadataCache } from './file-metadata-cache';

// Event Types
export type {
  SyncEventType,
  FileEventType,
  TerminalEventType,
  NavigationEventType,
  BaseEventPayload,
  FileEventPayload,
  TerminalEventPayload,
  NavigationEventPayload,
  FileEventMap,
  TerminalEventMap,
  NavigationEventMap,
  SyncEventMap,
  SyncEventListener,
  TypedEventListener,
  EventOptions,
} from './event-types';

// Sync Event Bus
export { 
  SyncEventBus,
  createSyncEventBus,
  SYNC_EVENT_BUS_DEFAULT_SOURCE,
  type SyncEventListener,
  type TypedEventListener,
} from './sync-event-bus';

export { createSyncEventBus as syncEventBus } from './sync-event-bus';

// Reverse Sync Service
export {
  ReverseSyncService,
  createReverseSyncService,
  type ReverseSyncOptions,
  type ReverseSyncProgress,
  type ReverseSyncError,
  type ConflictResolutionStrategy,
} from './reverse-sync-service';
