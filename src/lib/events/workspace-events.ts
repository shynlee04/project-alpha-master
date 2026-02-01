/**
 * @fileoverview Bridge file for workspace-events backward compatibility
 * @module lib/events/workspace-events
 *
 * @deprecated Use DomainEventBus from @/infrastructure/events/domain-event-bus
 * This file exists only for backward compatibility during migration.
 *
 * Migration path:
 * - workspaceEventBus → domainEventBus
 * - WorkspaceEvent types → DomainEvent types
 */

// Re-export domain event types for backward compatibility
export type {
  DomainEvent,
  DomainEventType,
  DomainEventMap,
} from '@/domain/types/domain-events';

// Re-export domain event bus as workspace event bus alias
export { domainEventBus as workspaceEventBus } from '@/infrastructure/events/domain-event-bus';
export { DomainEventBus as WorkspaceEventBus } from '@/infrastructure/events/domain-event-bus';
