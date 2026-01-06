/**
 * @fileoverview Project Store Types
 * @module infrastructure/persistence/stores/project/project-types
 * @governance EPIC-CP-1
 *
 * Type definitions for project metadata store.
 * Based on ProjectMetadata from lib/workspace/project-store.ts.
 */

import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';
import type { WorkspaceType } from '@/infrastructure/persistence/stores/rag/rag-types';
import type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';

// ============================================================================
// PROJECT ENTITY TYPES
// ============================================================================

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
 * Core project metadata (migrated from ProjectMetadata in lib/workspace/project-store.ts)
 *
 * Represents a local folder project with:
 * - FSA handle for browser-native file system access
 * - Workspace bindings (IDE, Knowledge, Notes, Study)
 * - Permission state for dashboard display
 * - Soft delete support (recoverable for 30 days)
 */
export interface Project {
  /** UUID v4 or generated ID */
  id: string;
  /** Display name (typically folder name) */
  name: string;
  /** Display path for UI (not actual path due to FSA security) */
  folderPath: string;
  /** FSA handle for directory access restoration */
  fsaHandle: FileSystemDirectoryHandle;
  /** Last time project was opened */
  lastOpened: Date;
  /** When project was created */
  createdAt: Date;
  /** Auto-sync flag (default: true) */
  autoSync: boolean;
  /** Optional layout state for IDE restoration */
  layoutState?: LayoutConfig;
  /** Custom exclusion patterns for sync (glob syntax) */
  exclusionPatterns?: string[];
  /** Last known permission state for faster dashboard load */
  lastKnownPermissionState?: FsaPermissionState;
  /** Workspace binding configuration (IDE, Knowledge, Notes, Study) */
  bindings: WorkspaceBindings;
  /** File snapshot feature flag */
  fileSnapshotEnabled?: boolean;
  /** Project description (optional) */
  description?: string;
  /** Project tags (optional) */
  tags: string[];
  /** Soft delete flag (true = marked as deleted, recoverable for 30 days) */
  deleted?: boolean;
  /** Timestamp when project was soft deleted */
  deletedAt?: Date;
}

// ============================================================================
// CRUD OPERATION TYPES
// ============================================================================

/**
 * Input for creating a new project
 */
export interface CreateProjectInput {
  name: string;
  folderPath: string;
  fsaHandle: FileSystemDirectoryHandle;
  autoSync?: boolean;
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
  bindings?: WorkspaceBindings;
  fileSnapshotEnabled?: boolean;
  description?: string;
  tags?: string[];
}

/**
 * Input for updating an existing project (all fields optional)
 */
export interface UpdateProjectInput {
  name?: string;
  folderPath?: string;
  fsaHandle?: FileSystemDirectoryHandle;
  lastOpened?: Date;
  autoSync?: boolean;
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
  lastKnownPermissionState?: FsaPermissionState;
  bindings?: WorkspaceBindings;
  fileSnapshotEnabled?: boolean;
  description?: string;
  tags?: string[];
  deleted?: boolean;
  deletedAt?: Date;
}

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * Project store state (data only)
 */
export interface ProjectState {
  /** All projects indexed by ID */
  projects: Record<string, Project>;
  /** Currently active project ID */
  activeProjectId: string | null;
  /** Hydration flag */
  _hasHydrated?: boolean;
}

// ============================================================================
// SLICE METHOD INTERFACES
// ============================================================================

/**
 * Project CRUD methods
 */
export interface ProjectMethods {
  createProject: (input: CreateProjectInput) => string;
  updateProject: (projectId: string, updates: UpdateProjectInput) => void;
  deleteProject: (projectId: string) => void;
  setActiveProject: (projectId: string | null) => void;
  getProject: (projectId: string) => Project | undefined;
  getAllProjects: () => Project[];
  getActiveProject: () => Project | null;
}

/**
 * Project binding methods
 */
export interface ProjectBindingMethods {
  updateProjectBindings: (projectId: string, bindings: WorkspaceBindings) => Promise<void>;
  getProjectBindings: (projectId: string) => WorkspaceBindings | null;
  validateBindings: (bindings: WorkspaceBindings) => ValidationResult;
  getEnabledWorkspaces: (projectId: string) => (keyof WorkspaceBindings)[];
  getDefaultWorkspace: (projectId: string) => keyof WorkspaceBindings;
}

/**
 * Project utility methods
 */
export interface ProjectUtilsMethods {
  updateLastOpened: (projectId: string) => Promise<void>;
  hydrateProjects: () => Promise<void>;
  getRecentProjects: (limit?: number) => Project[];
  searchProjects: (query: string) => Project[];
  getProjectsByWorkspace: (workspaceType: WorkspaceType) => Project[];
  getDefaultProjectForWorkspace: (workspaceType: WorkspaceType) => Project | null;
  getProjectStats: () => ProjectStats;
}

/**
 * Project permissions methods
 */
export interface ProjectPermissionsMethods {
  updateProjectPermission: (projectId: string, permissionState: FsaPermissionState) => void;
  getProjectPermission: (projectId: string) => FsaPermissionState | undefined;
  getProjectsWithPermission: (permissionState: FsaPermissionState) => Project[];
  checkProjectPermission: (projectId: string) => Promise<FsaPermissionState>;
  invalidateProjectPermission: (projectId: string) => void;
}

/**
 * Project layout methods
 */
export interface ProjectLayoutMethods {
  saveProjectLayout: (projectId: string, layout: LayoutConfig) => void;
  getProjectLayout: (projectId: string) => LayoutConfig | undefined;
  clearProjectLayout: (projectId: string) => void;
}

// ============================================================================
// VALIDATION & STATS TYPES
// ============================================================================

/**
 * Validation result for workspace bindings
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Project statistics
 */
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  deletedProjects: number;
  projectsByWorkspace: Record<WorkspaceType, number>;
  recentlyCreated: Project[];
  recentlyOpened: Project[];
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

/**
 * Re-export WorkspaceBindings for convenience
 * WorkspaceBindings is defined in dexie-db-core-types.ts
 */
export type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';

/**
 * Re-export WorkspaceType for convenience
 * WorkspaceType is defined in rag-types.ts
 */
export type { WorkspaceType } from '@/infrastructure/persistence/stores/rag/rag-types';

/**
 * Re-export FsaPermissionState for convenience
 * FsaPermissionState is defined in permission-lifecycle.ts
 */
export type { FsaPermissionState } from '@/lib/filesystem/permission-lifecycle';
