import type { FileMetadataRecord } from '../state/dexie-db';
import { db, upsertFileMetadata, getFileMetadata, getChangedFilesSince, clearFileMetadataCache } from '../state/dexie-db';

/**
 * FileMetadataCache service for managing file metadata cache.
 * Used for incremental sync to detect changed files efficiently.
 */
export class FileMetadataCache {
  /**
   * Get metadata for a specific file path.
   */
  async get(path: string): Promise<FileMetadataRecord | undefined> {
    return getFileMetadata(path);
  }

  /**
   * Store metadata for a file path.
   */
  async set(path: string, metadata: FileMetadataRecord): Promise<void> {
    await upsertFileMetadata(metadata);
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
    await db.fileMetadata.delete(path);
  }

  /**
   * Clear all cached metadata.
   */
  async clear(): Promise<void> {
    await clearFileMetadataCache();
  }

  /**
   * Update cache with a batch of file metadata.
   * Uses bulk operation for efficiency.
   */
  async updateBatch(files: FileMetadataRecord[]): Promise<void> {
    await db.fileMetadata.bulkPut(files);
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
