/**
 * Clean Project types - canonical project definition
 * @module @/platform/types/project
 *
 * NO workspaceId - use projectId only
 * NO workspaceBindings - this is BANNED
 */

import type { StorageType } from './platform.types';

/**
 * Module types available in the platform
 * Each module provides specific functionality within a project
 */
export type ModuleType = 'monaco' | 'notes' | 'terminal' | 'preview';

/**
 * Project-level settings
 * Controls which modules are enabled and their defaults
 */
export interface ProjectSettings {
  /** List of enabled modules for this project */
  enabledModules: ModuleType[];
  /** Default module to open when project loads */
  defaultModule: ModuleType;
  /** Theme preference for this project */
  theme?: 'light' | 'dark';
}

/**
 * Clean Project type - the canonical project definition
 * Files belong to PROJECTS (projectId only)
 * Plugins/modules offer FEATURES (editor, notes, terminal)
 *
 * NO workspaceBindings - this is BANNED
 * NO workspaceId - use projectId only
 */
export interface Project {
  /** Unique project identifier (UUID) */
  id: string;
  /** Human-readable project name */
  name: string;
  /** Optional project description */
  description?: string;
  /** Storage strategy based on platform */
  storageType: StorageType;
  /** FSA directory handle (desktop only) */
  directoryHandle?: FileSystemDirectoryHandle;
  /** Project-specific settings */
  settings: ProjectSettings;
  /** Project creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}
