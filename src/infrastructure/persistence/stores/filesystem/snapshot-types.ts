/**
 * @fileoverview File Snapshot Store Types
 * @module infrastructure/persistence/stores/filesystem/snapshot-types
 * @governance EPIC-CP-1
 *
 * Type definitions for file snapshot store.
 * Exports all slice state interfaces for unified store composition.
 */

import type { FileSnapshotRecord } from '@/infrastructure/persistence/dexie-db-core-types';

// ============================================================================
// METADATA SLICE TYPES
// ============================================================================

export interface SnapshotMetadataState {
  /** File metadata indexed by key (projectId:path) */
  metadata: Record<string, FileSnapshotRecord>;
}

export interface SnapshotMetadataMethods {
  /** Save file metadata */
  saveSnapshotMetadata: (projectId: string, path: string, metadata: FileSnapshotRecord) => void;

  /** Get file metadata */
  getSnapshotMetadata: (projectId: string, path: string) => FileSnapshotRecord | undefined;

  /** Build hierarchical file tree */
  getFileTree: (projectId: string) => FileTree;

  /** Invalidate cached metadata */
  invalidateSnapshot: (projectId: string, path: string) => void;
}

// ============================================================================
// CACHE SLICE TYPES
// ============================================================================

export interface CacheEntry {
  content: string;
  expiresAt: number;
}

export interface CacheLookupResult {
  hit: boolean;
  fresh: boolean;
  content?: string;
}

export interface SnapshotCacheState {
  /** Content cache indexed by key (projectId:path) */
  content: Record<string, CacheEntry>;
}

export interface SnapshotCacheMethods {
  /** Get cached content with freshness check */
  getCachedContent: (projectId: string, path: string) => CacheLookupResult;

  /** Save content to cache with TTL */
  saveCachedContent: (projectId: string, path: string, content: string) => Promise<void>;

  /** Check if cache entry is fresh */
  isCacheFresh: (projectId: string, path: string) => boolean;

  /** Clear all expired cache entries */
  clearExpiredCache: () => Promise<void>;
}

// ============================================================================
// BULK OPS SLICE TYPES
// ============================================================================

export interface SnapshotSaveResult {
  /** Number of metadata records saved */
  metadataCount: number;
  /** Number of content records saved */
  contentCount: number;
  /** Time taken in milliseconds */
  durationMs: number;
}

export interface SnapshotBulkOpsState {
  // No state properties (methods only)
}

export interface SnapshotBulkOpsMethods {
  /** Save multiple snapshots in chunks */
  saveBulkSnapshots: (projectId: string, snapshots: FileSnapshotRecord[]) => Promise<SnapshotSaveResult>;

  /** Get multiple snapshots efficiently */
  getBulkSnapshots: (projectId: string, paths: string[]) => Promise<FileSnapshotRecord[]>;

  /** Clear all cache entries for a project */
  clearProjectCache: (projectId: string) => Promise<void>;
}

// ============================================================================
// QUOTA SLICE TYPES
// ============================================================================

export interface QuotaStats {
  /** Total cache size in bytes */
  totalBytes: number;
  /** Total cache size in MB */
  totalMb: number;
  /** Configured quota limit in MB */
  quotaLimitMb: number;
  /** Percentage of quota used (0-100) */
  usagePercentage: number;
  /** Whether quota is near limit (≥90%) */
  nearLimit: boolean;
  /** Number of content entries */
  entryCount: number;
}

export interface EvictionResult {
  /** Number of entries evicted */
  entriesEvicted: number;
  /** Bytes freed */
  bytesFreed: number;
  /** New total size in MB */
  newTotalMb: number;
}

export interface SnapshotQuotaState {
  /** Quota limit in MB */
  quotaLimitMb: number;
}

export interface SnapshotQuotaMethods {
  /** Calculate total cache size in bytes */
  getCacheSize: () => number;

  /** Get quota statistics */
  getQuotaStats: () => QuotaStats;

  /** Evict oldest entries (LRU strategy) */
  evictOldestEntries: (targetBytes?: number) => Promise<EvictionResult>;

  /** Enforce quota limit (auto-evict if near limit) */
  enforceQuotaLimit: () => Promise<EvictionResult>;

  /** Set quota limit */
  setQuotaLimit: (limitMb: number) => void;
}

// ============================================================================
// FILE TREE TYPES
// ============================================================================

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  hash?: string;
}

export interface FileTree {
  root: FileTreeNode;
  metadata: Record<string, FileSnapshotRecord>;
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

/**
 * Re-export FileSnapshotRecord for convenience
 * FileSnapshotRecord is defined in dexie-db-core-types.ts
 */
export type { FileSnapshotRecord } from '@/infrastructure/persistence/dexie-db-core-types';
