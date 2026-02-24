/**
 * @fileoverview Project to Knowledge sync service (stub - DEFERRED)
 * @module infrastructure/sync/workspace-services/project-knowledge-sync
 * @status DEFERRED - Knowledge workspace is post-MVP
 *
 * Provides sync capabilities between IDE Project and Knowledge workspace.
 * Actual implementation will be added when Knowledge workspace epic begins.
 */

// ============================================================
// Types
// ============================================================

/**
 * Sync configuration
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface SyncConfig {
  projectId: string;
  autoSync?: boolean;
  syncInterval?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  maxFileSize?: number;
}

/**
 * Default sync configuration
 */
export const DEFAULT_SYNC_CONFIG: Partial<SyncConfig> = {
  autoSync: false,
  syncInterval: 30000, // 30 seconds
  includePatterns: ['**/*.md', '**/*.txt', '**/*.json'],
  excludePatterns: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
  maxFileSize: 1024 * 1024, // 1MB
};

/**
 * Sync result
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export interface ProjectKnowledgeSyncResult {
  success: boolean;
  filesProcessed: number;
  filesIndexed: number;
  errors: string[];
  duration: number;
}

// ============================================================
// Service Class
// ============================================================

/**
 * Project to Knowledge sync service (stub)
 * @deprecated Knowledge workspace is deferred to post-MVP
 */
export class ProjectKnowledgeSync {
  private config: SyncConfig;
  private isRunning = false;

  constructor(config: SyncConfig) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    console.warn('[ProjectKnowledgeSync] Knowledge sync is deferred to post-MVP');
  }

  /**
   * Start sync process
   */
  async start(): Promise<void> {
    this.isRunning = true;
    // Stub - no-op
  }

  /**
   * Stop sync process
   */
  async stop(): Promise<void> {
    this.isRunning = false;
  }

  /**
   * Run sync manually
   */
  async sync(): Promise<ProjectKnowledgeSyncResult> {
    return {
      success: true,
      filesProcessed: 0,
      filesIndexed: 0,
      errors: [],
      duration: 0,
    };
  }

  /**
   * Check if sync is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current config
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Dispose service
   */
  async dispose(): Promise<void> {
    await this.stop();
  }
}

/**
 * Create project knowledge sync service (factory)
 * @param config - Sync configuration
 * @returns Project knowledge sync service instance
 */
export function createProjectKnowledgeSync(
  config: SyncConfig
): ProjectKnowledgeSync {
  return new ProjectKnowledgeSync(config);
}
