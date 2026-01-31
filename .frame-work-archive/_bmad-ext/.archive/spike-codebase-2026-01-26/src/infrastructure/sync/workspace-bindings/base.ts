/**
 * @fileoverview Base Workspace Binding
 * @module infrastructure/sync/workspace-bindings/base
 *
 * Abstract base class for workspace-specific sync bindings.
 * Eliminates 80% code duplication between workspace sync services.
 *
 * **Pattern:**
 * - Each workspace extends BaseWorkspaceBinding
 * - Provides workspace-specific exclusion patterns
 * - Configures sync priority and conflict strategy
 *
 * @example
 * ```ts
 * class IDEWorkspaceBinding extends BaseWorkspaceBinding {
 *   getExcludedPatterns() { return ['.vscode-test', 'coverage']; }
 *   getSyncPriority() { return 1; } // Highest priority
 * }
 * ```
 */

import type { WorkspaceType, SyncOptions } from '../core/sync-types';
import type { SyncEngine } from '../core/sync-engine';

// ============================================================================
// Base Workspace Binding Configuration
// ============================================================================

/**
 * Workspace binding configuration
 */
export interface WorkspaceBindingConfig {
  /** Sync engine instance */
  syncEngine: SyncEngine;
  /** Workspace type */
  workspaceType: WorkspaceType;
  /** Project ID */
  projectId: string;
  /** Enable debug logging */
  debug?: boolean;
}

// ============================================================================
// Base Workspace Binding
// ============================================================================

/**
 * Base Workspace Binding
 *
 * Provides workspace-specific sync configuration and operations.
 * All workspace bindings (IDE, Notes, Knowledge, Study) extend this class.
 */
export abstract class BaseWorkspaceBinding {
  protected syncEngine: SyncEngine;
  protected workspaceType: WorkspaceType;
  protected projectId: string;
  protected debugMode: boolean;

  constructor(config: WorkspaceBindingConfig) {
    this.syncEngine = config.syncEngine;
    this.workspaceType = config.workspaceType;
    this.projectId = config.projectId;
    this.debugMode = config.debug ?? false;
  }

  /**
   * Get workspace-specific exclusion patterns
   * @returns Array of glob patterns to exclude
   */
  abstract getExcludedPatterns(): string[];

  /**
   * Get sync priority (lower = higher priority)
   * @returns Priority value (1-10)
   */
  abstract getSyncPriority(): number;

  /**
   * Get default sync options for this workspace
   * @returns Sync options
   */
  getDefaultSyncOptions(): Partial<SyncOptions> {
    return {
      direction: 'bidirectional',
      conflictStrategy: 'last-write-wins',
      exclusions: this.getExcludedPatterns(),
      emitEvents: true,
      showProgress: true,
    };
  }

  /**
   * Execute sync for this workspace
   * @param options - Override options
   * @returns Sync result
   */
  async sync(options: Partial<SyncOptions> = {}): ReturnType<SyncEngine['sync']> {
    const mergedOptions: SyncOptions = {
      ...this.getDefaultSyncOptions(),
      ...options,
    };

    this.debug(`[${this.workspaceType}] Starting sync`);

    try {
      const result = await this.syncEngine.sync(mergedOptions);
      this.debug(`[${this.workspaceType}] Sync completed: ${result.syncedFiles} files`);
      return result;
    } catch (error) {
      this.debug(`[${this.workspaceType}] Sync failed:`, error);
      throw error;
    }
  }

  /**
   * Get sync engine state
   */
  getState() {
    return this.syncEngine.getState();
  }

  /**
   * Check if sync is available for this workspace
   */
  isAvailable(): boolean {
    return this.syncEngine.isReady();
  }

  /**
   * Log debug message
   */
  protected debug(message: string, ...args: unknown[]): void {
    if (this.debugMode) {
      console.log(`[${this.workspaceType}] ${message}`, ...args);
    }
  }
}
