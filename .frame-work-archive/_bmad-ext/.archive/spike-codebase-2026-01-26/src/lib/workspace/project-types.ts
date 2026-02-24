/**
 * @fileoverview Project Domain Types
 * @module lib/workspace/project-types
 *
 * Domain types for project metadata.
 * Extracted from project-store.ts to break circular dependency with persistence layer.
 */

import type { FsaPermissionState } from '../filesystem/permission-lifecycle';
import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';

/**
 * Layout configuration stored per project.
 * Optional - used for restoring IDE state.
 */
export interface LayoutConfig {
    panelSizes?: number[];
    activeFile?: string;
    openDirectories?: string[];
}

/**
 * Project Metadata - Domain Type
 *
 * Core project information that can be persisted to IndexedDB.
 * This is a domain type with NO dependencies on persistence or store layers.
 *
 * FSA-010 REMEDIATION NOTE: lastKnownPermissionState is deprecated.
 * Permission state should now be sourced from FSAHandleRecord.permissionStatus.
 * This field is kept for backward compatibility with legacy code.
 */
export interface ProjectMetadata {
    /** UUID v4 or generated ID */
    id: string;
    /** Display name (typically folder name) */
    name: string;
    /** Display path for UI (not actual path due to FSA security) */
    folderPath: string;
    /** Storage type: FSA folder mount or IndexedDB local storage */
    storageType: 'indexeddb' | 'fsa';
    /** FSA handle for directory access restoration (only for fsa storage type) */
    fsaHandle?: FileSystemDirectoryHandle | null;
    /** Last time project was opened */
    lastOpened: Date;
    autoSync?: boolean;
    /** Optional layout state for IDE restoration */
    layoutState?: LayoutConfig;
    /** Custom exclusion patterns for sync (glob syntax) */
    exclusionPatterns?: string[];
    /** @deprecated FSA-010: Permission state is now in FSAHandleRecord.permissionStatus */
    lastKnownPermissionState?: FsaPermissionState;
    /** Story WB-1: Workspace binding configuration */
    workspaceBindings?: WorkspaceBindings;
    /** Story WB-1: File snapshot feature flag */
    fileSnapshotEnabled?: boolean;
    /** Soft delete flag (true = marked as deleted, recoverable for 30 days) */
    deleted?: boolean;
    /** Timestamp when project was soft deleted */
    deletedAt?: Date;
}

/**
 * Project with permission state for dashboard display.
 */
export interface ProjectWithPermission extends ProjectMetadata {
    permissionState: FsaPermissionState;
}
