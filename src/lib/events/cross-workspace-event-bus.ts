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

// Re-export domain event bus as cross-workspace alias
export { domainEventBus as CrossWorkspaceEventBus } from '@/infrastructure/events/domain-event-bus';
export { DomainEventBus } from '@/infrastructure/events/domain-event-bus';

// Re-export domain event type as cross-workspace alias
export type { DomainEvent as CrossWorkspaceEvent } from '@/domain/types/domain-events';
export type { DomainEventType, DomainEventMap } from '@/domain/types/domain-events';
