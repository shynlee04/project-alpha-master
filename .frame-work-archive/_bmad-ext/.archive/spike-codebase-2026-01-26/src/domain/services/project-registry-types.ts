/**
 * @fileoverview Project Registry Domain Types
 * @module domain/services/project-registry-types
 * @governance EPIC-FS, FS-02
 *
 * Type definitions for ProjectRegistry service.
 * Tracks project registration across workspaces with conflict detection.
 */

import type { WorkspaceType } from '@/domain/entities/workspace';

/**
 * Project lifecycle states
 * - pending: Project created but not yet active
 * - active: Project currently in use by a workspace
 * - inactive: Project loaded but not currently focused
 * - closed: Project explicitly closed (resources released)
 */
export type ProjectLifecycleState = 'pending' | 'active' | 'inactive' | 'closed';

/**
 * Registration record for a project in the registry
 */
export interface ProjectRegistration {
  /** Unique project ID */
  projectId: string;
  /** Folder path (normalized) for conflict detection */
  folderPath: string;
  /** Workspace type that registered this project */
  workspaceType: WorkspaceType;
  /** Current lifecycle state */
  state: ProjectLifecycleState;
  /** Timestamp when project was registered */
  registeredAt: Date;
  /** Timestamp when state was last updated */
  lastStateChange: Date;
  /** Session ID (for multi-session support) */
  sessionId?: string;
}

/**
 * Conflict detection result
 */
export interface ProjectConflictResult {
  /** Whether a conflict exists */
  hasConflict: boolean;
  /** Existing project ID that conflicts */
  existingProjectId?: string;
  /** Workspace type of the conflicting project */
  existingWorkspaceType?: WorkspaceType;
  /** Whether conflict is resolvable (same folder, same workspace) */
  isResolvable: boolean;
  /** Suggested resolution action */
  suggestedAction: 'use_existing' | 'replace_existing' | 'create_new' | 'abort';
}

/**
 * Project registration options
 */
export interface ProjectRegistrationOptions {
  /** Session ID (optional, defaults to current) */
  sessionId?: string;
  /** Whether to auto-resolve conflicts */
  autoResolve?: boolean;
  /** Whether to force re-registration if already exists */
  force?: boolean;
}

/**
 * Project registration result
 */
export interface ProjectRegistrationResult {
  /** Whether registration succeeded */
  success: boolean;
  /** Project ID (may be new or existing) */
  projectId: string;
  /** Whether this was a new registration */
  isNew: boolean;
  /** Conflict information (if any) */
  conflict?: ProjectConflictResult;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Registry state snapshot (for debugging/validation)
 */
export interface ProjectRegistrySnapshot {
  /** Total number of registered projects */
  totalProjects: number;
  /** Projects by lifecycle state */
  byState: Record<ProjectLifecycleState, number>;
  /** Projects by workspace type */
  byWorkspace: Record<WorkspaceType, number>;
  /** All registration records */
  registrations: ProjectRegistration[];
  /** Potential conflicts detected */
  conflicts: Array<{
    projectId: string;
    folderPath: string;
    conflictingWith: string[];
  }>;
}

/**
 * Registry statistics
 */
export interface ProjectRegistryStats {
  /** Total registered projects */
  totalRegistered: number;
  /** Active projects count */
  activeCount: number;
  /** Projects by workspace */
  byWorkspace: Record<WorkspaceType, number>;
  /** Detected conflicts count */
  conflictCount: number;
  /** Last updated timestamp */
  lastUpdated: Date;
  /** Registry creation timestamp */
  createdAt: Date;
}

/**
 * Project namespace format: {workspace}:{projectId}
 * This ensures workspace-specific project isolation.
 */
export type ProjectNamespace = `${WorkspaceType}:${string}`;
