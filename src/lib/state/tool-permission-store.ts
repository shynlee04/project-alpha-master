/**
 * @fileoverview Tool Permission Store Facade - DEPRECATED
 * @module lib/state/tool-permission-store
 * @deprecated Use `@/infrastructure/persistence/stores/permissions` instead
 *
 * This file is a backward-compatibility facade that re-exports from the
 * canonical location in infrastructure/persistence/stores/permissions.
 *
 * Migration (ADR-024, Epic 53):
 * - Old import: `import { useToolPermissionStore } from '@/lib/state/tool-permission-store'`
 * - New import: `import { useToolPermissionStore } from '@/infrastructure/persistence/stores/permissions'`
 *
 * This facade will be removed after Story 53-7 (Update All Import Paths).
 */

// Emit deprecation warning in development
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] Import from @/lib/state/tool-permission-store is deprecated.\n' +
      'Please update your import to: @/infrastructure/persistence/stores/permissions\n' +
      'See: ADR-024, Epic 53 - State Management Consolidation'
  );
}

// Re-export everything from canonical location
export {
  useToolPermissionStore,
  selectNeedsApproval,
  selectCanExecute,
  selectToolsByLevel,
  selectTrustLevel,
} from '@/infrastructure/persistence/stores/permissions';

export type {
  ToolTrustLevel,
  ToolPermissionState,
} from '@/infrastructure/persistence/stores/permissions';
