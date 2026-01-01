/**
 * Workspace Permissions Components
 *
 * Barrel export for workspace permission components.
 *
 * @module WorkspacePermissions
 * @layer Presentation
 *
 * Ralph Loop Cycle 17 Phase 2:
 * - Split WorkspaceToolPermissionsConfig (318 → 7 files)
 * - All components <120 lines
 * - December 2025 React patterns applied
 */

export { PermissionBadge } from './PermissionBadge'
export type { PermissionBadgeProps } from './PermissionBadge'

export { PermissionSwitch } from './PermissionSwitch'
export type { PermissionSwitchProps } from './PermissionSwitch'

export { PermissionGridHeader } from './PermissionGridHeader'
export type { PermissionGridHeaderProps } from './PermissionGridHeader'

export { ToolPermissionRow } from './ToolPermissionRow'
export type { ToolPermissionRowProps } from './ToolPermissionRow'

export { PermissionLegend } from './PermissionLegend'

export * from './types'
export * from './hooks'
