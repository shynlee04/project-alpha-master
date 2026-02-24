/**
 * @fileoverview Bridge barrel export for events backward compatibility
 * @module lib/events
 *
 * @deprecated Import from @/infrastructure/events instead
 * This file exists only for backward compatibility during migration.
 */

export * from './workspace-events';
export * from './cross-workspace-event-bus';
