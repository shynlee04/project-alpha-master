import type { FileMetadataRecord } from '../state/dexie-db';
import { db, getChangedFilesSince, clearFileMetadataCache as clearCache } from '../state/dexie-db';

/**
 * FileMetadataCache service for managing file metadata cache.
 * Used for incremental sync to detect changed files efficiently.
 * 
 * @epic Epic 24 - Performance & UX Optimization
 * @story 24-1 - Incremental Sync with Metadata Cache
 */
export class FileMetadataCache {
  /**
   * Get metadata for a specific file path in any project.
   * Searches by path across all projects.
   */
  async get(path: string): Promise<FileMetadataRecord | undefined> {
    // Query by path field directly
    return db.fileMetadata.where('path').equals(path).first();
  }

  /**
   * Get metadata for a specific file in a specific project.
   */
  async getByProjectAndPath(projectId: string, path: string): Promise<FileMetadataRecord | undefined> {
    return db.fileMetadata
      .where('[projectId+path]')
      .equals([projectId, path])
      .first();
  }

  /**
   * Store metadata for a file path.
   */
  async set(metadata: FileMetadataRecord): Promise<void> {
    const now = Date.now();
    await db.fileMetadata.put({
      ...metadata,
      createdAt: metadata.createdAt || now,
      updatedAt: now,
    });
  }

  /**
   * Get all files that have changed since the given timestamp.
   */
  async getChangedFiles(sinceTimestamp: number): Promise<FileMetadataRecord[]> {
    return getChangedFilesSince(sinceTimestamp);
  }

  /**
   * Check if a file has changed compared to cached metadata.
   * Returns true if file is new, has different lastModified, or different size.
   */
  async hasChanged(path: string, currentMetadata: FileMetadataRecord): Promise<boolean> {
    const cached = await this.get(path);

    if (!cached) {
      // File is new (not in cache)
      return true;
    }

    // Check if lastModified or size has changed
    return cached.lastModified !== currentMetadata.lastModified || cached.size !== currentMetadata.size;
  }

  /**
   * Invalidate cached metadata for a specific file.
   */
  async invalidate(path: string): Promise<void> {
    await db.fileMetadata.where('path').equals(path).delete();
  }

  /**
   * Clear all cached metadata.
   */
  async clear(): Promise<void> {
    await clearCache();
  }

  /**
   * Update cache with a batch of file metadata.
   * Uses bulk operation for efficiency.
   */
  async updateBatch(files: FileMetadataRecord[]): Promise<void> {
    const now = Date.now();
    const enrichedFiles = files.map(f => ({
      ...f,
      createdAt: f.createdAt || now,
      updatedAt: now,
    }));
    await db.fileMetadata.bulkPut(enrichedFiles);
  }

  /**
   * Get the last sync timestamp from cache.
   * Returns 0 if no previous sync.
   */
  async getLastSyncTime(): Promise<number> {
    const latestFile = await db.fileMetadata
      .orderBy('lastModified')
      .last();

    return latestFile?.lastModified ?? 0;
  }
}

// Export singleton instance
export const fileMetadataCache = new FileMetadataCache();

