/**
 * Project Store Barrel Export
 *
 * Exports all project-related types and stores.
 */

// Main store
export { useProjectStore } from './useProjectStore';
export {
  useActiveProject,
  useAllProjects,
  useRecentProjects,
  useProjectStats,
  useProjectStoreHydration,
  resetProjectStore,
  getProjectStoreState,
} from './useProjectStore';

// Types
export type {
  Project,
  WorkspaceBindings,
  WorkspaceType,
  CreateProjectInput,
  UpdateProjectInput,
  ValidationResult,
  ProjectStats,
} from './project-types';

export type {
  ProjectState,
  ProjectMethods,
  ProjectBindingMethods,
  ProjectUtilsMethods,
} from './project-types';
