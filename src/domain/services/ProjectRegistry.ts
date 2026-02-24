/**
 * @fileoverview ProjectRegistry Service
 * @module domain/services/ProjectRegistry
 * @governance EPIC-FS, FS-02
 *
 * Centralized project registration service with conflict detection.
 * Prevents the same folder from being opened in multiple workspaces simultaneously,
 * which could cause data corruption and sync conflicts.
 *
 * Key Features:
 * - Project ID conflict detection
 * - Workspace-specific namespacing
 * - Lifecycle state tracking
 * - Cross-workspace project coordination
 *
 * Usage:
 * ```ts
 * import { ProjectRegistry } from '@/domain/services/ProjectRegistry';
 *
 * // Register a project
 * const result = ProjectRegistry.register({
 *   projectId: 'project-123',
 *   folderPath: '/Users/xxx/my-project',
 *   workspaceType: 'ide'
 * });
 *
 * if (result.hasConflict) {
 *   console.warn('Folder already open in:', result.existingWorkspaceType);
 * }
 * ```
 */

import type {
  ProjectConflictResult,
  ProjectLifecycleState,
  ProjectRegistration,
  ProjectRegistrationOptions,
  ProjectRegistrationResult,
  ProjectRegistrySnapshot,
  ProjectRegistryStats,
  ProjectNamespace,
} from './project-registry-types';
import type { WorkspaceType } from '@/domain/entities/workspace';

// ============================================================================
// PROJECT REGISTRY CLASS
// ============================================================================

/**
 * ProjectRegistry - Centralized project registration with conflict detection
 *
 * Responsibilities:
 * 1. Track all registered projects across workspaces
 * 2. Detect folder path conflicts (same folder in multiple workspaces)
 * 3. Manage project lifecycle states
 * 4. Provide workspace-scoped project IDs
 *
 * Design:
 * - Singleton pattern for global coordination
 * - In-memory state (not persisted - recreated on each session)
 * - Workspace namespacing for isolation
 */
class ProjectRegistryClass {
  /** Registry storage: folderPath → registration record */
  private readonly folderIndex: Map<string, ProjectRegistration>;

  /** Registry storage: projectId → registration record */
  private readonly projectIndex: Map<string, ProjectRegistration>;

  /** Registry storage: namespace → projectId (for namespacing lookups) */
  private readonly namespaceIndex: Map<ProjectNamespace, string>;

  /** Current session ID */
  private currentSessionId: string;

  /** Registry creation timestamp (used in getSnapshot() for debugging) */
  readonly createdAt: Date;

  /** Last updated timestamp */
  private lastUpdated: Date;

  // -------------------------------------------------------------------------
  // CONSTRUCTOR
  // -------------------------------------------------------------------------

  constructor() {
    this.folderIndex = new Map();
    this.projectIndex = new Map();
    this.namespaceIndex = new Map();
    this.currentSessionId = this.generateSessionId();
    this.createdAt = new Date();
    this.lastUpdated = new Date();
  }

  // -------------------------------------------------------------------------
  // PUBLIC API - REGISTRATION
  // -------------------------------------------------------------------------

  /**
   * Register a project in the registry
   *
   * @param projectId - Unique project identifier
   * @param folderPath - Normalized folder path
   * @param workspaceType - Workspace type registering this project
   * @param options - Registration options
   * @returns Registration result with conflict detection
   */
  register(
    projectId: string,
    folderPath: string,
    workspaceType: WorkspaceType,
    options: ProjectRegistrationOptions = {}
  ): ProjectRegistrationResult {
    // Normalize folder path for consistent comparison
    const normalizedPath = this.normalizePath(folderPath);

    // Check for conflicts
    const conflict = this.detectConflict(normalizedPath, projectId, workspaceType);

    if (conflict.hasConflict) {
      // Auto-resolve if requested and possible
      if (options.autoResolve && conflict.isResolvable) {
        return this.resolveConflict(projectId, normalizedPath, workspaceType, conflict, options);
      }

      // Return conflict result without registering
      return {
        success: false,
        projectId,
        isNew: false,
        conflict,
        error: this.formatConflictError(conflict),
      };
    }

    // Create registration record
    const now = new Date();
    const registration: ProjectRegistration = {
      projectId,
      folderPath: normalizedPath,
      workspaceType,
      state: 'active',
      registeredAt: now,
      lastStateChange: now,
      sessionId: options.sessionId ?? this.currentSessionId,
    };

    // Add to indexes
    this.folderIndex.set(normalizedPath, registration);
    this.projectIndex.set(projectId, registration);

    // Create namespace entry
    const namespace = this.createNamespace(workspaceType, projectId);
    this.namespaceIndex.set(namespace, projectId);

    this.lastUpdated = now;

    return {
      success: true,
      projectId,
      isNew: true,
    };
  }

  /**
   * Unregister a project from the registry
   *
   * @param projectId - Project ID to unregister
   * @param workspaceType - Workspace type (for namespacing cleanup)
   * @returns Whether unregistration succeeded
   */
  unregister(projectId: string, workspaceType?: WorkspaceType): boolean {
    const registration = this.projectIndex.get(projectId);
    if (!registration) {
      return false;
    }

    // Remove from folder index
    this.folderIndex.delete(registration.folderPath);

    // Remove from project index
    this.projectIndex.delete(projectId);

    // Remove from namespace index
    if (workspaceType) {
      const namespace = this.createNamespace(workspaceType, projectId);
      this.namespaceIndex.delete(namespace);
    } else {
      // Remove all namespace entries for this project
      for (const [namespace, pid] of this.namespaceIndex.entries()) {
        if (pid === projectId) {
          this.namespaceIndex.delete(namespace);
        }
      }
    }

    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Update project lifecycle state
   *
   * @param projectId - Project ID to update
   * @param newState - New lifecycle state
   * @returns Whether update succeeded
   */
  updateState(projectId: string, newState: ProjectLifecycleState): boolean {
    const registration = this.projectIndex.get(projectId);
    if (!registration) {
      return false;
    }

    // Update state
    registration.state = newState;
    registration.lastStateChange = new Date();

    // Update all indexes
    this.folderIndex.set(registration.folderPath, registration);
    this.projectIndex.set(projectId, registration);

    this.lastUpdated = new Date();
    return true;
  }

  /**
   * Get project registration by project ID
   */
  getRegistration(projectId: string): ProjectRegistration | undefined {
    return this.projectIndex.get(projectId);
  }

  /**
   * Get project registration by folder path
   */
  getRegistrationByPath(folderPath: string): ProjectRegistration | undefined {
    const normalizedPath = this.normalizePath(folderPath);
    return this.folderIndex.get(normalizedPath);
  }

  /**
   * Check if a folder path is already registered
   *
   * @param folderPath - Folder path to check
   * @param excludeProjectId - Optional project ID to exclude from check
   * @returns Whether folder is registered
   */
  isFolderRegistered(folderPath: string, excludeProjectId?: string): boolean {
    const normalizedPath = this.normalizePath(folderPath);
    const registration = this.folderIndex.get(normalizedPath);

    if (!registration) {
      return false;
    }

    // Exclude specific project from check
    if (excludeProjectId && registration.projectId === excludeProjectId) {
      return false;
    }

    return true;
  }

  /**
   * Check for conflicts before registration
   *
   * @param folderPath - Folder path to check
   * @param projectId - Project ID being registered
   * @param workspaceType - Workspace type
   * @returns Conflict detection result
   */
  detectConflict(
    folderPath: string,
    projectId: string,
    workspaceType: WorkspaceType
  ): ProjectConflictResult {
    const normalizedPath = this.normalizePath(folderPath);
    const existing = this.folderIndex.get(normalizedPath);

    if (!existing) {
      return { hasConflict: false, isResolvable: true, suggestedAction: 'create_new' };
    }

    // Same project, same workspace - no conflict (re-registration)
    if (existing.projectId === projectId && existing.workspaceType === workspaceType) {
      return { hasConflict: false, isResolvable: true, suggestedAction: 'use_existing' };
    }

    // Different project, same folder - CONFLICT
    return {
      hasConflict: true,
      existingProjectId: existing.projectId,
      existingWorkspaceType: existing.workspaceType,
      isResolvable: false, // Same folder in different workspace = data corruption risk
      suggestedAction: 'abort',
    };
  }

  /**
   * Get projects by workspace type
   *
   * @param workspaceType - Workspace type to filter by
   * @returns Array of project IDs
   */
  getProjectsByWorkspace(workspaceType: WorkspaceType): string[] {
    const projectIds: string[] = [];

    for (const registration of this.projectIndex.values()) {
      if (registration.workspaceType === workspaceType) {
        projectIds.push(registration.projectId);
      }
    }

    return projectIds;
  }

  /**
   * Get projects by lifecycle state
   *
   * @param state - Lifecycle state to filter by
   * @returns Array of project IDs
   */
  getProjectsByState(state: ProjectLifecycleState): string[] {
    const projectIds: string[] = [];

    for (const registration of this.projectIndex.values()) {
      if (registration.state === state) {
        projectIds.push(registration.projectId);
      }
    }

    return projectIds;
  }

  /**
   * Get all registered project IDs
   */
  getAllProjectIds(): string[] {
    return Array.from(this.projectIndex.keys());
  }

  /**
   * Get registry statistics
   */
  getStats(): ProjectRegistryStats {
    const byWorkspace: Record<WorkspaceType, number> = {
      editor: 0,
      notes: 0,
      chat: 0,
      terminal: 0,
      preview: 0,
      knowledge: 0,
      study: 0,
    };

    let activeCount = 0;
    let conflictCount = 0;

    for (const registration of this.projectIndex.values()) {
      byWorkspace[registration.workspaceType]++;
      if (registration.state === 'active') {
        activeCount++;
      }
    }

    // Detect conflicts (same folder in different workspaces)
    const folderPaths = new Map<string, number>();
    for (const [folderPath] of this.folderIndex) {
      const count = folderPaths.get(folderPath) || 0;
      folderPaths.set(folderPath, count + 1);
      if (count > 0) {
        conflictCount++;
      }
    }

    return {
      totalRegistered: this.projectIndex.size,
      activeCount,
      byWorkspace,
      conflictCount,
      lastUpdated: this.lastUpdated,
      createdAt: this.createdAt,
    };
  }

  /**
   * Get registry snapshot (for debugging)
   */
  getSnapshot(): ProjectRegistrySnapshot {
    const byState: Record<ProjectLifecycleState, number> = {
      pending: 0,
      active: 0,
      inactive: 0,
      closed: 0,
    };

    const byWorkspace: Record<WorkspaceType, number> = {
      editor: 0,
      notes: 0,
      chat: 0,
      terminal: 0,
      preview: 0,
      knowledge: 0,
      study: 0,
    };

    const registrations = Array.from(this.projectIndex.values());

    for (const registration of registrations) {
      byState[registration.state]++;
      byWorkspace[registration.workspaceType]++;
    }

    // Detect conflicts
    const conflicts: Array<{
      projectId: string;
      folderPath: string;
      conflictingWith: string[];
    }> = [];

    const folderMap = new Map<string, string[]>();
    for (const registration of registrations) {
      const existing = folderMap.get(registration.folderPath) || [];
      existing.push(registration.projectId);
      folderMap.set(registration.folderPath, existing);
    }

    for (const [folderPath, projectIds] of folderMap) {
      if (projectIds.length > 1) {
        conflicts.push({
          projectId: projectIds[0],
          folderPath,
          conflictingWith: projectIds.slice(1),
        });
      }
    }

    return {
      totalProjects: registrations.length,
      byState,
      byWorkspace,
      registrations,
      conflicts,
    };
  }

  /**
   * Clear all registrations (for testing/session reset)
   */
  clear(): void {
    this.folderIndex.clear();
    this.projectIndex.clear();
    this.namespaceIndex.clear();
    this.currentSessionId = this.generateSessionId();
    this.lastUpdated = new Date();
  }

  /**
   * Create a workspace-scoped namespace for a project
   *
   * @param workspaceType - Workspace type
   * @param projectId - Project ID
   * @returns Namespaced project ID
   */
  createNamespace(workspaceType: WorkspaceType, projectId: string): ProjectNamespace {
    return `${workspaceType}:${projectId}` as ProjectNamespace;
  }

  /**
   * Resolve project ID from namespace
   *
   * @param namespace - Namespaced project ID
   * @returns Project ID or undefined
   */
  resolveNamespace(namespace: ProjectNamespace): string | undefined {
    return this.namespaceIndex.get(namespace);
  }

  // -------------------------------------------------------------------------
  // PRIVATE METHODS
  // -------------------------------------------------------------------------

  /**
   * Normalize folder path for consistent comparison
   *
   * @param folderPath - Raw folder path
   * @returns Normalized path
   */
  private normalizePath(folderPath: string): string {
    // Remove trailing slashes
    let normalized = folderPath.replace(/[/\\]+$/, '');

    // Convert backslashes to forward slashes (Windows compatibility)
    normalized = normalized.replace(/\\/g, '/');

    // Convert to lowercase for case-insensitive comparison
    // (file systems may be case-insensitive or case-sensitive)
    return normalized.toLowerCase();
  }

  /**
   * Resolve a conflict during registration
   */
  private resolveConflict(
    projectId: string,
    folderPath: string,
    workspaceType: WorkspaceType,
    conflict: ProjectConflictResult,
    options: ProjectRegistrationOptions
  ): ProjectRegistrationResult {
    // Same project, different workspace - update workspace binding
    if (conflict.existingProjectId === projectId) {
      const existing = this.projectIndex.get(projectId);
      if (existing) {
        existing.workspaceType = workspaceType;
        existing.lastStateChange = new Date();
        return {
          success: true,
          projectId,
          isNew: false,
        };
      }
    }

    // Force re-registration if requested
    if (options.force && conflict.existingProjectId) {
      this.unregister(conflict.existingProjectId);
      return this.register(projectId, folderPath, workspaceType);
    }

    return {
      success: false,
      projectId,
      isNew: false,
      conflict,
      error: this.formatConflictError(conflict),
    };
  }

  /**
   * Format conflict error message
   */
  private formatConflictError(conflict: ProjectConflictResult): string {
    if (!conflict.hasConflict) {
      return 'No conflict';
    }

    return `Folder already registered to project "${conflict.existingProjectId}" in workspace "${conflict.existingWorkspaceType}". Cannot open same folder in multiple workspaces simultaneously.`;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * ProjectRegistry singleton instance
 *
 * Use this instance to register and track projects across workspaces.
 */
export const ProjectRegistry = new ProjectRegistryClass();

/**
 * Type export for testing (allows creating test instances)
 */
export { ProjectRegistryClass };

/**
 * Export types for consumer use
 */
export type {
  ProjectConflictResult,
  ProjectLifecycleState,
  ProjectNamespace,
  ProjectRegistration,
  ProjectRegistrationOptions,
  ProjectRegistrationResult,
  ProjectRegistrySnapshot,
  ProjectRegistryStats,
};
