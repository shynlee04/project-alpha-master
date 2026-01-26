/**
 * @fileoverview IDE Workspace Binding
 * @module infrastructure/sync/workspace-bindings/ide
 *
 * Workspace-specific sync binding for IDE workspace.
 * Highest priority sync (runs before other workspaces).
 *
 * **Exclusions:**
 * - `.vscode-test/` - Test output directories
 * - `coverage/` - Code coverage reports
 */

import { BaseWorkspaceBinding } from './base';
import type { WorkspaceBindingConfig } from './base';

/**
 * IDE Workspace Binding
 *
 * Manages sync for the IDE workspace with highest priority.
 */
export class IDEWorkspaceBinding extends BaseWorkspaceBinding {
  constructor(config: WorkspaceBindingConfig) {
    super(config);
  }

  /**
   * IDE workspace exclusion patterns
   */
  getExcludedPatterns(): string[] {
    return [
      '**/.vscode-test/**',
      '**/coverage/**',
    ];
  }

  /**
   * IDE has highest sync priority (runs first)
   */
  getSyncPriority(): number {
    return 1;
  }
}

/**
 * Create IDE workspace binding
 */
export function createIDEWorkspaceBinding(
  config: WorkspaceBindingConfig
): IDEWorkspaceBinding {
  return new IDEWorkspaceBinding(config);
}
