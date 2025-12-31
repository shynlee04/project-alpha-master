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
  syncEventBus,
  type SubscribeOptions,
  type SyncEventBusConfig,
  type EventCallback,
  SYNC_EVENT_BUS_DEFAULT_SOURCE,
} from './sync-event-bus';
