/**
 * @fileoverview Shared types for file snapshot store
 * @module filesystem/file-snapshot-store/types
 */

export interface CacheLookupResult {
  /** Whether cache hit was found */
  hit: boolean;
  /** Whether cached content is fresh (within TTL) */
  fresh: boolean;
  /** Snapshot metadata if found */
  snapshot?: any;
  /** File content if loaded */
  content?: string;
}

export interface SnapshotSaveResult {
  /** Number of metadata records saved */
  metadataCount: number;
  /** Number of content records saved */
  contentCount: number;
  /** Time taken in milliseconds */
  durationMs: number;
}
