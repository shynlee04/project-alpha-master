/**
 * @fileoverview Shared types for project store
 * @module workspace/project-store/types
 */

/**
 * Layout configuration stored per project.
 * Optional - used for restoring IDE state.
 */
export interface LayoutConfig {
  panelSizes?: number[];
  openFiles?: string[];
  activeFile?: string | null;
}

/**
 * Core project metadata stored in IndexedDB.
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
  /** Story 13-5: Last known permission state for faster dashboard load */
  lastKnownPermissionState?: any;
  /** Story WB-1: Workspace binding configuration */
  workspaceBindings?: Record<string, boolean>;
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
  permissionState: any;
}
