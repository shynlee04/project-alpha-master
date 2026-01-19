/**
 * @fileoverview Study file sync service (stub - DEFERRED)
 * @module infrastructure/sync/workspace-services/study-file-sync-service
 * @status DEFERRED - Study workspace is post-MVP
 *
 * Provides file sync capabilities for Study workspace.
 * Actual implementation will be added when Study workspace epic begins.
 */

import type {
  FileSyncService,
  SyncResult,
  SyncOptions,
  FileChangeEvent,
  FileMetadata,
  SyncStatus,
} from './file-sync-service';
import type { SyncError } from '@/infrastructure/sync/types';

// ============================================================
// Types
// ============================================================

/**
 * Study file sync configuration
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface StudyFileSyncConfig {
  projectId: string;
  studyPath?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

// ============================================================
// Service Class
// ============================================================

/**
 * Study file sync service (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export class StudyFileSyncService implements FileSyncService {
  private _config: StudyFileSyncConfig;
  private listeners: Set<(event: FileChangeEvent) => void> = new Set();
  private _status: SyncStatus = {
    syncing: false,
    lastSync: null,
    filesProcessed: 0,
    error: null,
  };

  constructor(config: StudyFileSyncConfig) {
    this._config = config;
    console.warn('[StudyFileSyncService] Study sync is deferred to post-MVP');
  }

  async readFile(_path: string): Promise<string> {
    throw new Error('StudyFileSyncService: Not implemented (deferred)');
  }

  async writeFile(_path: string, _content: string): Promise<void> {
    throw new Error('StudyFileSyncService: Not implemented (deferred)');
  }

  async deleteFile(_path: string): Promise<void> {
    throw new Error('StudyFileSyncService: Not implemented (deferred)');
  }

  async listFiles(_path: string, _recursive?: boolean): Promise<string[]> {
    return [];
  }

  async getFileMetadata(_path: string): Promise<FileMetadata> {
    return {
      path: _path,
      size: 0,
      lastModified: Date.now(),
    };
  }

  async writeBatch(_operations: Array<{ path: string; content: string }>): Promise<SyncResult> {
    return {
      success: true,
      filesProcessed: 0,
      errors: [] as SyncError[],
      duration: 0,
    };
  }

  async mount(_source: FileSystemDirectoryHandle): Promise<void> {
    // Stub - no-op
  }

  async sync(_options?: SyncOptions): Promise<SyncResult> {
    return {
      success: true,
      filesProcessed: 0,
      errors: [] as SyncError[],
      duration: 0,
    };
  }

  getSyncStatus(): SyncStatus {
    return this._status;
  }

  onFileChange(callback: (event: FileChangeEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async dispose(): Promise<void> {
    this.listeners.clear();
  }
}

/**
 * Create study file sync service (factory)
 * @param config - Sync configuration
 * @returns Study file sync service instance
 */
export function createStudyFileSyncService(
  config: StudyFileSyncConfig
): StudyFileSyncService {
  return new StudyFileSyncService(config);
}
