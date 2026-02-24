/**
 * @fileoverview IDB Adapter Types
 * @module infrastructure/sync/adapters/idb-adapter-types
 *
 * Type definitions for IndexedDB storage adapter.
 */

// ============================================================================
// IDB Adapter Configuration
// ============================================================================

/**
 * IDB adapter configuration options
 */
export interface IDBAdapterConfig {
  /** Database name (defaults to 'via-gent-persistence') */
  databaseName?: string;
  /** Table name for storing file content (defaults to 'fileContentCache') */
  tableName?: string;
  /** Project ID for namespacing (required) */
  projectId: string;
  /** Quota threshold (0-1, defaults to 0.9 = 90%) */
  quotaThreshold?: number;
  /** Eviction policy (defaults to 'least-recently-used') */
  evictionPolicy?: EvictionPolicy;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Eviction policy for quota management
 */
export type EvictionPolicy =
  | 'least-recently-used'    // Evict files not accessed recently
  | 'least-frequently-used'  // Evict files rarely accessed
  | 'largest-first'         // Evict largest files first
  | 'oldest-first';          // Evict oldest synced files first

/**
 * Internal file record for IndexedDB storage
 */
export interface FileRecord {
  /** Composite key: projectId:path */
  id: string;
  /** Project ID for namespacing */
  projectId: string;
  /** File path relative to project root */
  path: string;
  /** File content as base64-encoded Uint8Array */
  content: string;
  /** File size in bytes */
  size: number;
  /** Last modified timestamp */
  lastModified: number;
  /** Content MIME type */
  contentType?: string;
  /** Last access timestamp (for LRU eviction) */
  lastAccessedAt: number;
  /** Access count (for LFU eviction) */
  accessCount: number;
  /** Created timestamp */
  createdAt: number;
}

/**
 * Quota information
 */
export interface QuotaInfo {
  /** Used bytes */
  used: number;
  /** Total available bytes */
  total: number;
  /** Available bytes (total - used) */
  available: number;
  /** Usage percentage (0-100) */
  usagePercentage: number;
}

/**
 * Eviction result
 */
export interface EvictionResult {
  /** Bytes freed from storage */
  bytesFreed: number;
  /** Number of files evicted */
  filesEvicted: number;
  /** Paths of evicted files */
  evictedPaths: string[];
}
