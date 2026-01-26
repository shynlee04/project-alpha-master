/**
 * @fileoverview Knowledge Workspace Binding
 * @module infrastructure/sync/workspace-bindings/knowledge
 *
 * Workspace-specific sync binding for Knowledge workspace.
 * Medium priority sync with RAG-specific exclusions.
 *
 * **Exclusions:**
 * - `.embeddings/` - Vector embeddings (large binary files)
 * - `.chunks/` - RAG chunks (generated content)
 */

import { BaseWorkspaceBinding } from './base';
import type { WorkspaceBindingConfig } from './base';

/**
 * Knowledge Workspace Binding
 *
 * Manages sync for the Knowledge workspace with RAG exclusions.
 */
export class KnowledgeWorkspaceBinding extends BaseWorkspaceBinding {
  constructor(config: WorkspaceBindingConfig) {
    super(config);
  }

  /**
   * Knowledge workspace exclusions for RAG data
   */
  getExcludedPatterns(): string[] {
    return [
      '**/.embeddings/**',
      '**/.chunks/**',
    ];
  }

  /**
   * Knowledge has medium sync priority
   */
  getSyncPriority(): number {
    return 5;
  }
}

/**
 * Create Knowledge workspace binding
 */
export function createKnowledgeWorkspaceBinding(
  config: WorkspaceBindingConfig
): KnowledgeWorkspaceBinding {
  return new KnowledgeWorkspaceBinding(config);
}
