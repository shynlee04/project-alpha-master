/**
 * @fileoverview Permissions Store Barrel Export
 * @module infrastructure/persistence/stores/permissions
 * @governance ADR-024 State Management Consolidation, Epic 53
 *
 * CANONICAL LOCATION for permission-related stores.
 * Includes tool permission trust levels with workspace-scoped v2 architecture.
 *
 * @migration-status CANONICAL (Epic 53 Story 53-5)
 * @last-reviewed 2026-01-04
 */

// Tool Permission Store
export {
  useToolPermissionStore,
  selectNeedsApproval,
  selectCanExecute,
  selectToolsByLevel,
  selectTrustLevel,
} from './tool-permission-store';

export type {
  ToolTrustLevel,
  ToolPermissionState,
} from './tool-permission-store';
