/**
 * @fileoverview Notes Workspace Binding
 * @module infrastructure/sync/workspace-bindings/notes
 *
 * Workspace-specific sync binding for Notes workspace.
 * Medium priority sync.
 *
 * **Exclusions:**
 * - (None - notes sync all files)
 */

import { BaseWorkspaceBinding } from './base';
import type { WorkspaceBindingConfig } from './base';

/**
 * Notes Workspace Binding
 *
 * Manages sync for the Notes workspace.
 */
export class NotesWorkspaceBinding extends BaseWorkspaceBinding {
  constructor(config: WorkspaceBindingConfig) {
    super(config);
  }

  /**
   * Notes workspace has no additional exclusions
   */
  getExcludedPatterns(): string[] {
    return [];
  }

  /**
   * Notes has medium sync priority
   */
  getSyncPriority(): number {
    return 5;
  }
}

/**
 * Create Notes workspace binding
 */
export function createNotesWorkspaceBinding(
  config: WorkspaceBindingConfig
): NotesWorkspaceBinding {
  return new NotesWorkspaceBinding(config);
}
