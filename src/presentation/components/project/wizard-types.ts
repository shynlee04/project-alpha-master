/**
 * @fileoverview Project Creation Wizard Types (Simplified)
 *
 * Simplified wizard types for ARCH-01-04: Reduce from 23 to 10 options
 *
 * Changes from original:
 * - projectType: 4 values → 2 values (app/library)
 * - workspaceType: Removed (always 'local' for simplified UX)
 * - workspaceBindings: Simplified (only notes/ide)
 * - agentPermissions: 3 toggles → 1 simplified toggle
 * - fileSetupEnabled: Merged into single createReadme option
 * - Removed: template, templateValidationError, packageManager
 *
 * @module presentation/components/project/wizard-types
 * @updated 2026-01-21 ARCH-01-04
 */

import type { WorkspaceBindings } from '@/infrastructure/persistence/dexie-db-core-types';

/** Storage type for project data - auto-detected based on platform */
export type ProjectStorageType = 'indexeddb' | 'fsa';

/**
 * Simplified Wizard form data (10 essential options)
 *
 * Total fields: 14 (down from 23)
 * Active options: 10 (down from 23)
 */
export interface WizardFormData {
  // ========================================
  // Step 1: Project Details (4 options)
  // ========================================
  /** Project name (required, 2-50 chars) */
  projectName: string;
  /** Project description (optional, max 500 chars) */
  projectDescription: string;
  /** Project type: simplified to app/library (was 4 options) */
  projectType: 'app' | 'library';
  /** Project icon: reduced to 6 essential emojis (was 10) */
  projectIcon: string;

  // ========================================
  // Step 2: Storage (1 option - auto-detected)
  // ========================================
  /** Storage type: auto-detected based on platform (FSA for desktop, IndexedDB for mobile) */
  storageType: ProjectStorageType;
  /** FSA folder handle (auto-set when user picks folder for FSA storage) */
  fsaHandle?: FileSystemDirectoryHandle | null;

  // ========================================
  // Step 3: Workspace Setup (2 options)
  // ========================================
  /** Enable workspace setup (default: true) */
  workspaceEnabled: boolean;
  /** Workspace template: simplified to blank/react/next (was 4 options, removed node-lib) */
  workspaceTemplate: 'blank' | 'react-app' | 'next-app';

  // ========================================
  // Step 4: Agent & Files (3 options)
  // ========================================
  /** Enable agent features (default: true, simplified from complex selection) */
  agentEnabled: boolean;
  /** Simplified permissions: just a single "Full Access" toggle vs 3 separate toggles */
  agentFullAccess: boolean;
  /** Create README.md (default: true, simplified from fileSetupEnabled + 2 options) */
  createReadme: boolean;

  // ========================================
  // Internal: Workspace Bindings
  // ========================================
  /** Workspace bindings: simplified to only active workspaces (knowledge/study removed) */
  workspaceBindings: Omit<WorkspaceBindings, 'knowledge' | 'study'>;
}
