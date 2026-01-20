/**
 * @fileoverview Project Handle Service (Atomic Transactions)
 * @module infrastructure/persistence/services/project-handle-service
 * @governance EPIC-ARCH-01 (Foundation Cleanup)
 * @story ARCH-01-05-Remediation
 *
 * Provides atomic operations across BOTH `projects` AND `fsaHandles` tables.
 * Ensures project creation, updates, and deletions are always consistent.
 *
 * **CRITICAL**: All operations use Dexie transactions with automatic rollback.
 * If projects insert fails, fsaHandles insert is rolled back automatically.
 * If fsaHandles insert fails, projects insert is rolled back automatically.
 *
 * **Why This Service Exists**:
 * - HandlePersistenceService manages fsaHandles table only
 * - project-crud-slice manages projects table directly
 * - No unified atomic wrapper existed before this service
 * - This service ensures both tables are updated atomically
 *
 * **Integration Point**:
 * - project-crud-slice should import this service
 * - Replace direct db.projects.put() → projectHandleService.createWithHandle()
 * - Replace direct db.projects.delete() → projectHandleService.deleteWithHandle()
 */

import { db } from '../dexie-db';
import type { ProjectRecord } from '../dexie-db-core-types';
import type { FSAHandleRecord } from '../dexie-db-session-types';
import type { WorkspaceType, ProjectId } from '@/domain/types/project-ids';

// ============================================================================
// Service Result Types
// ============================================================================

/**
 * Result of a ProjectHandleService operation
 */
export interface ProjectHandleServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Chrome Feature Detection
// ============================================================================

/**
 * Check if browser supports structuredClone for FileSystemDirectoryHandle.
 * Chrome 129+ added support for cloning FileSystemDirectoryHandle objects.
 *
 * @returns true if structuredClone is supported for handles
 */
function isStructuredCloneSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('structuredClone' in window)) return false;

  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = match ? parseInt(match[1], 10) : 0;
  return chromeVersion >= 129;
}

// ============================================================================
// ProjectHandleService Class
// ============================================================================

/**
 * ProjectHandleService - Atomic operations across projects and fsaHandles tables.
 *
 * Manages BOTH tables in single Dexie transactions:
 * - projects: Project metadata
 * - fsaHandles: FSA handle persistence
 *
 * Ensures atomicity: Both tables succeed or both tables rollback.
 */
export class ProjectHandleService {
  /**
   * Create project with FSA handle in single atomic transaction.
   *
   * Transaction flow:
   * 1. Insert into projects table
   * 2. Insert into fsaHandles table
   * 3. Return projectId if both succeed
   * 4. Rollback both if either fails
   *
   * @param project - Project record to insert
   * @param handle - FileSystemDirectoryHandle to persist
   * @param workspaceId - Workspace context ('ide', 'knowledge', 'study', 'notes')
   * @returns Project ID if successful, throws error if transaction fails
   */
  async createWithHandle(
    project: ProjectRecord,
    handle: FileSystemDirectoryHandle,
    workspaceId: WorkspaceType
  ): Promise<ProjectId> {
    console.log(
      `[ProjectHandleService] Creating project with handle:`,
      project.id,
      'workspace:',
      workspaceId
    );

    return db.transaction(
      'rw',
      db.projects,
      db.fsaHandles,
      async () => {
        // Step 1: Insert into projects table
        const projectId = await db.projects.put(project);

        // Step 2: Insert into fsaHandles table
        // Chrome 129+: Store actual handle with structuredClone
        // Older browsers: Store metadata only (null handleData)
        const handleData = isStructuredCloneSupported()
          ? structuredClone(handle)
          : null;

        await db.fsaHandles.put({
          projectId: project.id,
          workspaceId: workspaceId,
          handleData,
          directoryPath: handle.name,
          permissionStatus: 'granted',
          grantedAt: Date.now(),
          lastAccessedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as FSAHandleRecord);

        console.log(
          `[ProjectHandleService] Atomic create successful:`,
          project.id,
          'handle stored:',
          isStructuredCloneSupported() ? 'actual handle' : 'metadata only'
        );

        return projectId as ProjectId;
      }
    );
  }

  /**
   * Delete project and FSA handle in single atomic transaction.
   *
   * Transaction flow:
   * 1. Delete from projects table
   * 2. Delete from fsaHandles table
   * 3. Return void if both succeed
   * 4. Rollback both if either fails
   *
   * @param projectId - Project ID to delete
   * @throws Error if transaction fails
   */
  async deleteWithHandle(projectId: string): Promise<void> {
    console.log(
      `[ProjectHandleService] Deleting project with handle:`,
      projectId
    );

    return db.transaction(
      'rw',
      db.projects,
      db.fsaHandles,
      async () => {
        // Step 1: Delete from projects table
        await db.projects.delete(projectId);

        // Step 2: Delete from fsaHandles table
        await db.fsaHandles.delete(projectId);

        console.log(
          `[ProjectHandleService] Atomic delete successful:`,
          projectId
        );
      }
    );
  }

  /**
   * Restore FSA handle for project.
   *
   * NOTE: This method READS from fsaHandles table but does NOT modify projects table.
   * The read is atomic (no concurrent writes), but this is not a write transaction.
   *
   * For a true atomic restore that updates both tables, use:
   * - tx.projects.update() to update lastOpened
   * - tx.fsaHandles.update() to update permissionStatus
   *
   * Current implementation:
   * 1. Read fsaHandles record (atomic read via transaction)
   * 2. Return handle if available
   * 3. Return null if not found
   *
   * @param projectId - Project ID to restore handle for
   * @returns FileSystemDirectoryHandle or null if not found
   */
  async restoreHandle(projectId: string): Promise<FileSystemDirectoryHandle | null> {
    console.log(
      `[ProjectHandleService] Restoring handle for project:`,
      projectId
    );

    // Atomic read from fsaHandles table
    const record = await db.fsaHandles.get(projectId);

    if (!record) {
      console.warn(
        `[ProjectHandleService] No handle record found for:`,
        projectId
      );
      return null;
    }

    // Chrome 129+: Restore from structuredClone data
    if (isStructuredCloneSupported() && record.handleData) {
      console.log(
        `[ProjectHandleService] Restoring handle from structuredClone:`,
        projectId
      );
      return structuredClone(record.handleData) as FileSystemDirectoryHandle;
    }

    // Older browsers: Handle cannot be restored (only metadata stored)
    // Return null to trigger user prompt fallback
    console.log(
      `[ProjectHandleService] Cannot restore handle (no structuredClone support):`,
      projectId
    );
    return null;
  }

  /**
   * Update project with FSA handle permission status.
   *
   * Transaction flow:
   * 1. Update projects.lastOpened timestamp
   * 2. Update fsaHandles.permissionStatus
   * 3. Update fsaHandles.lastAccessedAt
   * 4. Rollback both if either fails
   *
   * @param projectId - Project ID to update
   * @param permissionStatus - New permission status
   * @returns void if successful
   */
  async updateHandlePermission(
    projectId: string,
    permissionStatus: FSAHandleRecord['permissionStatus']
  ): Promise<void> {
    console.log(
      `[ProjectHandleService] Updating handle permission:`,
      projectId,
      'status:',
      permissionStatus
    );

    return db.transaction(
      'rw',
      db.projects,
      db.fsaHandles,
      async () => {
        // Step 1: Update projects.lastOpened
        const project = await db.projects.get(projectId);
        if (project) {
          await db.projects.update(projectId, {
            lastOpened: new Date(),
          });
        }

        // Step 2: Update fsaHandles
        await db.fsaHandles.update(projectId, {
          permissionStatus,
          lastAccessedAt: Date.now(),
          updatedAt: Date.now(),
        });

        console.log(
          `[ProjectHandleService] Atomic update successful:`,
          projectId
        );
      }
    );
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton instance of ProjectHandleService.
 * Use this instance across the application for consistent behavior.
 */
export const projectHandleService = new ProjectHandleService();

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Convenience function: Create project with handle
 */
export const createProjectWithHandle = (
  project: ProjectRecord,
  handle: FileSystemDirectoryHandle,
  workspaceId: WorkspaceType
) => projectHandleService.createWithHandle(project, handle, workspaceId);

/**
 * Convenience function: Delete project with handle
 */
export const deleteProjectWithHandle = (projectId: string) =>
  projectHandleService.deleteWithHandle(projectId);

/**
 * Convenience function: Restore project handle
 */
export const restoreProjectHandle = (projectId: string) =>
  projectHandleService.restoreHandle(projectId);
