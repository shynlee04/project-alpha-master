/**
 * @fileoverview Workspace Type Definitions - FACADE
 * @module lib/state/workspace-types
 * @deprecated Import from '@/infrastructure/persistence/stores/workspace' instead
 *
 * This file is a backward-compatibility facade.
 * The canonical source is now in infrastructure.
 *
 * @migration ARCH-01.2 - State Consolidation (2026-01-05)
 */

// Re-export from infrastructure
export type {
  WorkspaceType,
  WorkspaceMetadata,
  WorkspaceTransitionEvent
} from '@/infrastructure/persistence/stores/workspace';

export { WORKSPACES } from '@/infrastructure/persistence/stores/workspace';
