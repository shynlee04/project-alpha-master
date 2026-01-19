/**
 * @fileoverview Quota Management Type Definitions
 * @module infrastructure/sync/core/quota-types
 *
 * IndexedDB quota and eviction policy types.
 * P0-critical for preventing data loss.
 */

// ============================================================================
// Quota Management (for IndexedDB adapter)
// ============================================================================

/**
 * IndexedDB quota information
 */
export interface QuotaInfo {
  /** Used bytes */
  used: number;
  /** Total available bytes */
  total: number;
  /** Available bytes (total - used) */
  available: number;
  /** Usage percentage */
  usagePercentage: number;
}

/**
 * Quota check result
 */
export interface QuotaCheckResult {
  /** Whether there's enough space */
  hasEnoughSpace: boolean;
  /** Current quota info */
  quota: QuotaInfo;
  /** Required bytes */
  required: number;
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
 * Eviction result
 */
export interface EvictionResult {
  /** Number of bytes freed */
  bytesFreed: number;
  /** Number of files evicted */
  filesEvicted: number;
  /** Evicted file paths */
  evictedPaths: string[];
}
