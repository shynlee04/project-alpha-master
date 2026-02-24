/**
 * @fileoverview Bridge file for cross-workspace-event-bus backward compatibility
 * @module lib/events/cross-workspace-event-bus
 *
 * @deprecated Use DomainEventBus from @/infrastructure/events/domain-event-bus
 * This file exists only for backward compatibility during migration.
 *
 * Migration path:
 * - CrossWorkspaceEventBus → domainEventBus
 * - CrossWorkspaceEvent → DomainEvent
 */

import {
  domainEventBus,
  DomainEventBus,
} from '@/infrastructure/events/domain-event-bus';
import type { PluginType } from '@/domain/schemas/plugin.schema';
import type {
  DomainEvent,
  DomainEventType,
  DomainEventMap,
  WorkspaceChangedPayload,
  SyncStatusPayload,
  FileChangedPayload,
} from '@/domain/types/domain-events';

// Re-export domain event bus as cross-workspace alias
export { DomainEventBus as CrossWorkspaceEventBus };

// Re-export domain event types
export type { DomainEvent as CrossWorkspaceEvent };
export type { DomainEventType, DomainEventMap };

// ============================================================================
// Extended Event Bus with Convenience Methods
// ============================================================================

/**
 * Extended CrossWorkspaceEventBus with convenience methods
 * for backward compatibility during migration.
 */
class ExtendedCrossWorkspaceEventBus {
  private bus: DomainEventBus;

  constructor(bus: DomainEventBus) {
    this.bus = bus;
  }

  // ============================================================================
  // Core DomainEventBus Methods (proxied)
  // ============================================================================

  emit<K extends DomainEventType>(
    type: K,
    payload: DomainEventMap[K],
    source: string
  ): void {
    this.bus.emit(type, payload, source);
  }

  on<K extends DomainEventType>(
    type: K,
    handler: (event: DomainEvent<DomainEventMap[K]>) => void
  ): () => void {
    return this.bus.on(type, handler);
  }

  off<K extends DomainEventType>(
    type: K,
    handler: (event: DomainEvent<DomainEventMap[K]>) => void
  ): void {
    this.bus.off(type, handler);
  }

  once<K extends DomainEventType>(
    type: K,
    handler: (event: DomainEvent<DomainEventMap[K]>) => void
  ): () => void {
    return this.bus.once(type, handler);
  }

  clear(type: DomainEventType): void {
    this.bus.clear(type);
  }

  clearAll(): void {
    this.bus.clearAll();
  }

  getHandlerCount(type: DomainEventType): number {
    return this.bus.getHandlerCount(type);
  }

  setDebugMode(enabled: boolean): void {
    this.bus.setDebugMode(enabled);
  }

  // ============================================================================
  // Convenience Methods (backward compatibility)
  // ============================================================================

  /** @deprecated Use emit('sync:status', payload, source) */
  emitSyncStatus(payload: SyncStatusPayload): void {
    this.bus.emit('sync:status', payload, 'CrossWorkspaceEventBus');
  }

  /** @deprecated Use on('sync:status', handler) */
  onSyncStatus(
    handler: (event: DomainEvent<SyncStatusPayload>) => void
  ): () => void {
    return this.bus.on('sync:status', handler);
  }

  /** @deprecated Use off('sync:status', handler) */
  offSyncStatus(
    handler: (event: DomainEvent<SyncStatusPayload>) => void
  ): void {
    this.bus.off('sync:status', handler);
  }

  /** @deprecated Use emit('file:changed', payload, source) */
  emitFileChange(payload: FileChangedPayload): void {
    this.bus.emit('file:changed', payload, 'CrossWorkspaceEventBus');
  }

  /** @deprecated Use on('file:changed', handler) */
  onFileChange(
    handler: (event: DomainEvent<FileChangedPayload>) => void
  ): () => void {
    return this.bus.on('file:changed', handler);
  }

  /** @deprecated Use off('file:changed', handler) */
  offFileChange(
    handler: (event: DomainEvent<FileChangedPayload>) => void
  ): void {
    this.bus.off('file:changed', handler);
  }

  /** @deprecated Use emit('workspace:changed', payload, source) */
  emitWorkspaceChanged(payload: WorkspaceChangedPayload): void {
    this.bus.emit('workspace:changed', payload, 'CrossWorkspaceEventBus');
  }

  /** @deprecated Use on('workspace:changed', handler) */
  onWorkspaceChanged(
    handler: (event: DomainEvent<WorkspaceChangedPayload>) => void
  ): () => void {
    return this.bus.on('workspace:changed', handler);
  }

  /** @deprecated Use off('workspace:changed', handler) */
  offWorkspaceChanged(
    handler: (event: DomainEvent<WorkspaceChangedPayload>) => void
  ): void {
    this.bus.off('workspace:changed', handler);
  }
}

/** @deprecated Use domainEventBus from @/infrastructure/events/domain-event-bus */
export const crossWorkspaceEventBus = new ExtendedCrossWorkspaceEventBus(
  domainEventBus
);

// ============================================================================
// Deprecated Event Types (backward compatibility)
// ============================================================================

/** @deprecated Use PluginType from @/domain/schemas/plugin.schema */
export type WorkspaceId = PluginType;

/** @deprecated Use FileEventPayload from @/domain/types/domain-events */
export interface FileChangeEvent {
  workspaceId: WorkspaceId;
  path: string;
  type: 'created' | 'modified' | 'deleted';
}

/** @deprecated */
export interface AgentConfigChangeEvent {
  workspaceId: WorkspaceId;
  agentId: string;
  changes: Record<string, unknown>;
}

/** @deprecated */
export interface SyncStatusEvent {
  workspaceId: WorkspaceId;
  status: 'syncing' | 'synced' | 'error';
}

/** @deprecated Use ProjectEventPayload from @/domain/types/domain-events */
export interface ProjectStateChangeEvent {
  projectId: string;
  state: 'opened' | 'closed' | 'switched';
}

/** @deprecated Use WorkspaceChangedPayload */
export interface WorkspaceChangeEvent {
  from: string;
  to: string;
  timestamp: string;
}

/** @deprecated */
export interface ProviderConfigChangeEvent {
  providerId: string;
  changes: Record<string, unknown>;
}

/** @deprecated */
export interface ModelsUpdatedEvent {
  providerId: string;
  models: string[];
}

/** @deprecated */
export interface ChatMessageSentEvent {
  workspaceId: WorkspaceId;
  threadId: string;
  messageId: string;
}

/** @deprecated */
export interface ChatStateUpdateEvent {
  workspaceId: WorkspaceId;
  threadId: string;
  state: 'idle' | 'streaming' | 'error';
}
