/**
 * @fileoverview useFileTreeOperations Hook
 * @module plugins/filetree/hooks/useFileTreeOperations
 *
 * React hook providing file and project CRUD operations for the FileTree.
 * All operations go through FileService (for files) or ProjectStore (for projects)
 * to ensure domain events are emitted for cross-operator communication.
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PLAT-01 - Project CRUD, PLAT-02 - File CRUD, PLAT-05 - Project Switching
 */

import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { fileService } from '@/domain/services/file-service';
import { domainEventBus } from '@/infrastructure/events/domain-event-bus';
import { useProjectStore } from '@/infrastructure/persistence/stores/project';
import { useFileTreeStore } from '@/infrastructure/persistence/stores/file-tree-store';
import type { CrudResult, FileMetadata } from '@/domain/services/file-crud/file-crud-types';
import type { Project, CreateProjectInput } from '@/infrastructure/persistence/stores/project';

// ============================================================================
// Types
// ============================================================================

/**
 * Result type for project operations
 */
export interface ProjectResult {
  success: boolean;
  projectId?: string;
  error?: string;
}

/**
 * File tree operations hook return type
 */
export interface FileTreeOperations {
  // File CRUD operations
  createFile: (path: string, content?: string) => Promise<CrudResult<FileMetadata>>;
  renameFile: (oldPath: string, newPath: string) => Promise<CrudResult<FileMetadata>>;
  deleteFile: (path: string) => Promise<CrudResult<void>>;

  // Project CRUD operations
  listProjects: () => Project[];
  createProject: (input: CreateProjectInput) => Promise<ProjectResult>;
  updateProject: (projectId: string, updates: Partial<CreateProjectInput>) => ProjectResult;
  deleteProject: (projectId: string) => ProjectResult;

  // Project switching (PLAT-05)
  switchProject: (projectId: string) => void;

  // Current state
  activeProjectId: string | null;
  activeProject: Project | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useFileTreeOperations - Hook for file and project CRUD operations
 *
 * All file operations go through FileService (service-gated writes).
 * All project operations go through ProjectStore.
 * Project switching emits project:switched domain event.
 *
 * @returns FileTreeOperations object with CRUD functions and state
 *
 * @example
 * ```typescript
 * const {
 *   createFile,
 *   renameFile,
 *   deleteFile,
 *   listProjects,
 *   createProject,
 *   switchProject,
 *   activeProject,
 * } = useFileTreeOperations();
 *
 * // Create a file in the active project
 * await createFile('src/newFile.ts', 'export const hello = "world";');
 *
 * // Switch to a different project
 * switchProject('proj_123_abc');
 * ```
 */
export function useFileTreeOperations(): FileTreeOperations {
  // Get project store state with useShallow for performance
  const {
    activeProjectId,
    projects,
    setActiveProject,
    getProject,
    getAllProjects,
    createProject: storeCreateProject,
    updateProject: storeUpdateProject,
    deleteProject: storeDeleteProject,
  } = useProjectStore(
    useShallow((state) => ({
      activeProjectId: state.activeProjectId,
      projects: state.projects,
      setActiveProject: state.setActiveProject,
      getProject: state.getProject,
      getAllProjects: state.getAllProjects,
      createProject: state.createProject,
      updateProject: state.updateProject,
      deleteProject: state.deleteProject,
    }))
  );

  // Get file tree store state for tree updates
  const { selectedPath, clearSelection } = useFileTreeStore(
    useShallow((state) => ({
      selectedPath: state.selectedPath,
      clearSelection: state.clearSelection,
    }))
  );

  // ==========================================================================
  // File CRUD Operations
  // ==========================================================================

  /**
   * Create a new file in the active project
   *
   * @param path - File path relative to project root
   * @param content - Optional file content (defaults to empty string)
   * @returns CrudResult with FileMetadata on success
   */
  const createFile = useCallback(
    async (path: string, content: string = ''): Promise<CrudResult<FileMetadata>> => {
      if (!activeProjectId) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No active project. Please select a project first.',
          },
        };
      }

      console.log('[useFileTreeOperations] Creating file:', path);
      return fileService.create(activeProjectId, path, content);
    },
    [activeProjectId]
  );

  /**
   * Rename a file in the active project
   *
   * @param oldPath - Current file path
   * @param newPath - New file path
   * @returns CrudResult with FileMetadata on success
   */
  const renameFile = useCallback(
    async (oldPath: string, newPath: string): Promise<CrudResult<FileMetadata>> => {
      if (!activeProjectId) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No active project. Please select a project first.',
          },
        };
      }

      console.log('[useFileTreeOperations] Renaming file:', oldPath, '->', newPath);

      // Read old file content
      const readResult = await fileService.read(activeProjectId, oldPath);
      if (!readResult.success) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No active project. Please select a project first.',
          },
        };
      }

      // Create new file with old content
      const createResult = await fileService.create(activeProjectId, newPath, readResult.data);
      if (!createResult.success) {
        return createResult;
      }

      // Delete old file
      await fileService.delete(activeProjectId, oldPath);

      // Emit renamed event for operators to handle
      domainEventBus.emit(
        'file:renamed',
        { projectId: activeProjectId, path: newPath, previousPath: oldPath },
        'useFileTreeOperations'
      );

      // Clear selection if renamed file was selected
      if (selectedPath === oldPath) {
        clearSelection();
      }

      return createResult;
    },
    [activeProjectId, selectedPath, clearSelection]
  );

  /**
   * Delete a file from the active project
   *
   * @param path - File path to delete
   * @returns CrudResult with void on success
   */
  const deleteFile = useCallback(
    async (path: string): Promise<CrudResult<void>> => {
      if (!activeProjectId) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No active project. Please select a project first.',
          },
        };
      }

      console.log('[useFileTreeOperations] Deleting file:', path);

      // Clear selection if deleted file was selected
      if (selectedPath === path) {
        clearSelection();
      }

      return fileService.delete(activeProjectId, path);
    },
    [activeProjectId, selectedPath, clearSelection]
  );

  // ==========================================================================
  // Project CRUD Operations
  // ==========================================================================

  /**
   * List all projects
   *
   * @returns Array of all projects
   */
  const listProjects = useCallback((): Project[] => {
    return getAllProjects();
  }, [getAllProjects]);

  /**
   * Create a new project
   *
   * @param input - Project creation input
   * @returns ProjectResult with projectId on success
   */
  const createProject = useCallback(
    async (input: CreateProjectInput): Promise<ProjectResult> => {
      try {
        console.log('[useFileTreeOperations] Creating project:', input.name);
        const projectId = await storeCreateProject(input);

        // Emit project created event
        domainEventBus.emit(
          'project:created',
          { projectId, name: input.name },
          'useFileTreeOperations'
        );

        return { success: true, projectId };
      } catch (error) {
        console.error('[useFileTreeOperations] Failed to create project:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create project',
        };
      }
    },
    [storeCreateProject]
  );

  /**
   * Update an existing project
   *
   * @param projectId - Project ID to update
   * @param updates - Partial updates to apply
   * @returns ProjectResult indicating success
   */
  const updateProject = useCallback(
    (projectId: string, updates: Partial<CreateProjectInput>): ProjectResult => {
      try {
        console.log('[useFileTreeOperations] Updating project:', projectId);
        storeUpdateProject(projectId, updates);
        return { success: true, projectId };
      } catch (error) {
        console.error('[useFileTreeOperations] Failed to update project:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update project',
        };
      }
    },
    [storeUpdateProject]
  );

  /**
   * Delete a project
   *
   * @param projectId - Project ID to delete
   * @returns ProjectResult indicating success
   */
  const deleteProject = useCallback(
    (projectId: string): ProjectResult => {
      try {
        console.log('[useFileTreeOperations] Deleting project:', projectId);
        storeDeleteProject(projectId);

        // Emit project deleted event
        domainEventBus.emit(
          'project:deleted',
          { projectId },
          'useFileTreeOperations'
        );

        return { success: true };
      } catch (error) {
        console.error('[useFileTreeOperations] Failed to delete project:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to delete project',
        };
      }
    },
    [storeDeleteProject]
  );

  // ==========================================================================
  // Project Switching (PLAT-05)
  // ==========================================================================

  /**
   * Switch to a different project
   *
   * Emits project:switched domain event for FileTreeOperator
   * to reload the file tree.
   *
   * @param projectId - Project ID to switch to
   */
  const switchProject = useCallback(
    (projectId: string): void => {
      const project = getProject(projectId);
      if (!project) {
        console.warn('[useFileTreeOperations] Project not found:', projectId);
        return;
      }

      console.log('[useFileTreeOperations] Switching to project:', projectId);

      // Set active project in store
      setActiveProject(projectId);

      // Emit domain event for FileTreeOperator to handle
      domainEventBus.emit(
        'project:switched',
        { projectId, name: project.name },
        'useFileTreeOperations'
      );
    },
    [getProject, setActiveProject]
  );

  // ==========================================================================
  // Current State
  // ==========================================================================

  /**
   * Get the active project object
   */
  const activeProject = useMemo((): Project | null => {
    if (!activeProjectId) return null;
    return projects[activeProjectId] || null;
  }, [activeProjectId, projects]);

  // ==========================================================================
  // Return Operations
  // ==========================================================================

  return {
    // File operations
    createFile,
    renameFile,
    deleteFile,

    // Project operations
    listProjects,
    createProject,
    updateProject,
    deleteProject,

    // Project switching
    switchProject,

    // State
    activeProjectId,
    activeProject,
  };
}
