/**
 * Workspace Permissions Component Types
 *
 * Shared type definitions for workspace permission components.
 *
 * @module WorkspacePermissions/types
 * @layer Presentation
 */

import type { WorkspaceType } from '@/lib/state/workspace-types'

/**
 * Workspace metadata for display
 */
export interface WorkspaceInfo {
    readonly label: string
    readonly description: string
}

/**
 * Workspace type to metadata mapping
 */
export type WorkspaceLabels = Record<WorkspaceType, string>
export type WorkspaceDescriptions = Record<WorkspaceType, string>

/**
 * Tool permission data
 */
export interface ToolPermission {
    readonly toolId: string
    readonly toolName: string
}

/**
 * Permission checker function signature
 */
export type PermissionChecker = (toolId: string, workspace: WorkspaceType) => boolean

/**
 * Permission toggle handler signature
 */
export type PermissionToggleHandler = (
    toolId: string,
    workspace: WorkspaceType,
    enabled: boolean
) => void
