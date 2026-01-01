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

/**
 * File access level for cross-workspace file operations
 *
 * Defines what level of file access a workspace has to other workspaces.
 */
export type FileAccessLevel = 'none' | 'read-only' | 'read-write'

/**
 * Workspace file permission configuration
 *
 * Controls cross-workspace file reference permissions.
 * This is part of the File System Access Expansion (CW-1.4).
 *
 * @epic CW-01 - Abstract File Sync Service
 * @story CW-1.4 - File System Access Expansion
 */
export interface WorkspaceFilePermission {
    /** Workspace this permission applies to */
    readonly workspace: WorkspaceType
    /** Access level for cross-workspace file operations */
    readonly accessLevel: FileAccessLevel
    /** Whether workspace file system is currently mounted */
    readonly mounted: boolean
    /** Mount path (if mounted) */
    readonly mountPath?: string
}

/**
 * File permission change handler
 */
export type FilePermissionChangeHandler = (
    workspace: WorkspaceType,
    accessLevel: FileAccessLevel
) => void

/**
 * File mount handler
 */
export type FileMountHandler = (
    workspace: WorkspaceType
) => Promise<void>

/**
 * File unmount handler
 */
export type FileUnmountHandler = (
    workspace: WorkspaceType
) => Promise<void>
