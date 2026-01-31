/**
 * Project Creation Wizard Types
 *
 * Shared types for project creation wizard to avoid circular dependencies.
 * Separated from ProjectCreationWizard.tsx and step components.
 *
 * @module spike/components/project/wizard-types
 */

import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';

/** Storage type for project data */
export type ProjectStorageType = 'indexeddb' | 'fsa';

/** Wizard form data */
export interface WizardFormData {
  // Step 1: Project Details (required)
  projectName: string;
  projectDescription: string;
  projectType: 'app' | 'library' | 'experiment' | 'learning';
  projectIcon: string;
  template?: string;

  // Storage type: browser DB (mobile) vs file system access (desktop)
  storageType: ProjectStorageType;

  // FSA folder handle (required for 'fsa' storage type)
  // When user selects 'fsa' storage, they must pick a folder via showDirectoryPicker
  fsaHandle?: FileSystemDirectoryHandle | null;

  // Workspace bindings: which workspaces this project is available in
  workspaceBindings: WorkspaceBindings;

  // Step 2: Workspace Setup (optional)
  workspaceEnabled: boolean;
  workspaceName: string;
  workspaceType: 'local' | 'webcontainer';
  workspaceTemplate: 'blank' | 'react-app' | 'next-app' | 'node-lib';

  // Step 3: Agent Selection (optional)
  agentEnabled: boolean;
  selectedAgent: string;
  agentPermissions: {
    read: boolean;
    write: boolean;
    execute: boolean;
  };

  // Step 4: File Setup (optional)
  fileSetupEnabled: boolean;
  createReadme: boolean;
  createGitignore: boolean;
  initialFiles: Array<{ name: string; content: string }>;

  // Additional validation and metadata fields
  templateValidationError?: string;
  packageManager?: string;
}
