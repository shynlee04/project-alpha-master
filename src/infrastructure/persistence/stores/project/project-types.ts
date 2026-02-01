/**
 * @fileoverview Project Store Types
 * @module infrastructure/persistence/stores/project/project-types
 * @governance EPIC-CP-1
 *
 * Type definitions for project metadata store.
 * 
 * @mandate NO-WORKSPACE - See SOURCE-OF-TRUTH.md Part 6
 */

import type { PluginType, ProjectPlugins, Project as DomainProject, LayoutConfig } from '@/domain/entities/project';
import type { FsaPermissionState } from '@/infrastructure/filesystem';
import type { StorageHandleMetadata } from '@/infrastructure/filesystem/handle-types';

// ============================================================================
// PROJECT ENTITY TYPES
// ============================================================================

/**
 * Re-export LayoutConfig
 */
export type { LayoutConfig };

/**
 * Core project metadata (Infrastructure Layer)
 *
 * PS-04: Changed from fsaHandle (FileSystemDirectoryHandle - UNSERIALIZABLE)
 *        to storageMetadata (StorageHandleMetadata - SERIALIZABLE)
 *
 * The FileSystemDirectoryHandle cannot be persisted to IndexedDB (causes DataCloneError).
 * Instead, we store metadata about the handle and restore it with user interaction.
 *
 * FSA-010 REMEDIATION: Permission state is now sourced from FSAHandleRecord only.
 * lastKnownPermissionState was removed - use handlePersistenceService.getPermissionStatus() instead.
 */
export interface Project extends DomainProject {
  /** Storage type: 'fsa' for desktop, 'indexeddb' for mobile */
  storageType: 'fsa' | 'indexeddb';

  /** Serializable handle metadata (NOT the actual FileSystemDirectoryHandle!) */
  storageMetadata?: StorageHandleMetadata | null;
}

// ============================================================================
// CRUD OPERATION TYPES
// ============================================================================

/**
 * Input for creating a new project
 * PS-04: Replaced fsaHandle with storageMetadata
 * 
 * @mandate NO-WORKSPACE - Uses plugins field, not workspaceBindings
 */
export interface CreateProjectInput {
  name: string;
  folderPath: string;
  storageType?: 'indexeddb' | 'fsa';  // Defaults to 'fsa' for backward compatibility
  storageMetadata?: StorageHandleMetadata | null;  // PS-04: Serializable metadata instead of handle
  autoSync?: boolean;
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
  plugins?: ProjectPlugins;  // Plugin configuration
  fileSnapshotEnabled?: boolean;
  description?: string;
  tags?: string[];
}

/**
 * Input for updating an existing project (all fields optional)
 * PS-04: Replaced fsaHandle with storageMetadata
 * FSA-010: lastKnownPermissionState removed - permission state is in FSAHandleRecord
 * 
 * @mandate NO-WORKSPACE - Uses plugins field, not workspaceBindings
 */
export interface UpdateProjectInput {
  name?: string;
  folderPath?: string;
  storageType?: 'indexeddb' | 'fsa';
  storageMetadata?: StorageHandleMetadata | null;  // PS-04: Serializable metadata
  lastOpened?: Date;
  autoSync?: boolean;
  layoutState?: LayoutConfig;
  exclusionPatterns?: string[];
  plugins?: ProjectPlugins;  // Plugin configuration
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
 * PS-04: Changed restoreProjectHandle to return HandleRestoreResult
 */
export interface ProjectMethods {
  createProject: (input: CreateProjectInput) => Promise<string>;
  updateProject: (projectId: string, updates: UpdateProjectInput) => void;
  deleteProject: (projectId: string) => void;
  setActiveProject: (projectId: string | null) => void;
  getProject: (projectId: string) => Project | undefined;
  getAllProjects: () => Project[];
  getActiveProject: () => Project | null;
  restoreProjectHandle: (projectId: string) => Promise<import('@/infrastructure/filesystem/handle-types').HandleRestoreResult>;
}

/**
 * Project plugin methods (replaces ProjectBindingMethods)
 * 
 * @mandate NO-WORKSPACE - Uses PluginType, not WorkspaceBindings
 */
export interface ProjectPluginMethods {
  updateProjectPlugins: (projectId: string, plugins: ProjectPlugins) => Promise<void>;
  getProjectPlugins: (projectId: string) => ProjectPlugins | null;
  togglePlugin: (projectId: string, pluginType: PluginType) => Promise<void>;
  setDefaultPlugin: (projectId: string, pluginType: PluginType) => Promise<void>;
  getEnabledPlugins: (projectId: string) => PluginType[];
  getDefaultPlugin: (projectId: string) => PluginType;
  validatePlugins: (plugins: ProjectPlugins) => ValidationResult;
}

/**
 * Project utility methods
 * 
 * @mandate NO-WORKSPACE - Uses PluginType, not WorkspaceType
 */
export interface ProjectUtilsMethods {
  updateLastOpened: (projectId: string) => Promise<void>;
  hydrateProjects: () => Promise<void>;
  getRecentProjects: (limit?: number) => Project[];
  searchProjects: (query: string) => Project[];
  getProjectsByPlugin: (pluginType: PluginType) => Project[];
  getDefaultProjectForPlugin: (pluginType: PluginType) => Project | null;
  getProjectStats: () => ProjectStats;
}

/**
 * Project permissions methods
 * FSA-010: Permission state is now sourced from FSAHandleRecord via handlePersistenceService
 * All methods are async since they query Dexie for permission state
 */
export interface ProjectPermissionsMethods {
  updateProjectPermission: (projectId: string, permissionState: FsaPermissionState) => Promise<void>;
  getProjectPermission: (projectId: string) => Promise<FsaPermissionState | undefined>;
  getProjectsWithPermission: (permissionState: FsaPermissionState) => Promise<Project[]>;
  checkProjectPermission: (projectId: string) => Promise<FsaPermissionState>;
  invalidateProjectPermission: (projectId: string) => Promise<void>;
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
 * Validation result for plugin configuration
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Project statistics
 * 
 * @mandate NO-WORKSPACE - Uses PluginType, not WorkspaceType
 */
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  deletedProjects: number;
  projectsByPlugin: Record<PluginType, number>;
  recentlyCreated: Project[];
  recentlyOpened: Project[];
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

/**
 * Re-export PluginType and ProjectPlugins for convenience
 */
export type { PluginType, ProjectPlugins } from '@/domain/entities/project';

/**
 * Re-export FsaPermissionState for convenience
 * FsaPermissionState is defined in permission-lifecycle.ts
 */
export type { FsaPermissionState } from '@/infrastructure/filesystem';
