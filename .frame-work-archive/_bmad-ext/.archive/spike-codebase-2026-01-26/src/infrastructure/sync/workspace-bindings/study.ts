/**
 * @fileoverview Study Workspace Binding
 * @module infrastructure/sync/workspace-bindings/study
 *
 * Workspace-specific sync binding for Study workspace.
 * Lower priority sync (runs after IDE, Notes, Knowledge).
 *
 * **Exclusions:**
 * - `.spaced-repetition/` - SRS algorithm state (ephemeral)
 */

import { BaseWorkspaceBinding } from './base';
import type { WorkspaceBindingConfig } from './base';

/**
 * Study Workspace Binding
 *
 * Manages sync for the Study workspace with SRS exclusions.
 */
export class StudyWorkspaceBinding extends BaseWorkspaceBinding {
  constructor(config: WorkspaceBindingConfig) {
    super(config);
  }

  /**
   * Study workspace exclusions for SRS state
   */
  getExcludedPatterns(): string[] {
    return [
      '**/.spaced-repetition/**',
    ];
  }

  /**
   * Study has lower sync priority (runs after others)
   */
  getSyncPriority(): number {
    return 10;
  }
}

/**
 * Create Study workspace binding
 */
export function createStudyWorkspaceBinding(
  config: WorkspaceBindingConfig
): StudyWorkspaceBinding {
  return new StudyWorkspaceBinding(config);
}
