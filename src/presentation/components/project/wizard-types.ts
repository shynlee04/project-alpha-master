/**
 * Project Creation Wizard Types
 *
 * Shared types for the project creation wizard to avoid circular dependencies.
 * Separated from ProjectCreationWizard.tsx and step components.
 *
 * @module presentation/components/project/wizard-types
 */

/** Wizard form data */
export interface WizardFormData {
  // Step 1: Project Details (required)
  projectName: string;
  projectDescription: string;
  projectType: 'app' | 'library' | 'experiment' | 'learning';
  projectIcon: string;
  template?: string;

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
