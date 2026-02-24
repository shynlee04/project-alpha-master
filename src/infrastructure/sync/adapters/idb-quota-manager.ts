/**
 * @fileoverview IDB Quota Manager - Storage quota checking and eviction orchestration
 * @module infrastructure/sync/adapters/idb-quota-manager
 *
 * P0-critical quota management to prevent data loss when IndexedDB is full.
 * Emits quota:warning at 90% threshold and quota:exceeded when write fails.
 */

import type { QuotaInfo, EvictionResult, EvictionPolicy } from './idb-adapter-types';
import { syncEventBus } from '../core/sync-events';

// ============================================================================
// Type Exports
// ============================================================================

/** Exported types for testing */
export type { QuotaInfo, EvictionResult, EvictionPolicy };

// ============================================================================
// Quota Manager Interface
// ============================================================================

export interface IDBQuotaManagerConfig {
  quotaThreshold: number;
  evictionPolicy: EvictionPolicy;
  debug?: boolean;
}

export interface QuotaCheckResult {
  hasEnoughSpace: boolean;
  quota: QuotaInfo;
}

/**
 * Check current storage quota using navigator.storage.estimate()
 * @param config - Quota manager configuration
 * @returns Quota information including usage, total, available
 */
export async function checkStorageQuota(
  config: IDBQuotaManagerConfig
): Promise<QuotaCheckResult> {
  try {
    const estimate = await navigator.storage.estimate();
    if (!estimate) {
      if (config.debug) {
        console.debug('[IDBQuotaManager] Storage estimate not available');
      }
      return {
        hasEnoughSpace: true, // Optimistic default
        quota: {
          used: 0,
          total: Number.MAX_SAFE_INTEGER,
          available: Number.MAX_SAFE_INTEGER,
          usagePercentage: 0,
        },
      };
    }

    const used = estimate.usage || 0;
    const total = estimate.quota || 0;
    const available = total - used;
    const usagePercentage = total > 0 ? (used / total) * 100 : 0;

    return {
      hasEnoughSpace: usagePercentage < (config.quotaThreshold * 100),
      quota: {
        used,
        total,
        available,
        usagePercentage,
      },
    };
  } catch (error) {
    if (config.debug) {
      console.debug('[IDBQuotaManager] Failed to check quota:', error);
    }
    return {
      hasEnoughSpace: true, // Fail open
      quota: {
        used: 0,
        total: Number.MAX_SAFE_INTEGER,
        available: Number.MAX_SAFE_INTEGER,
        usagePercentage: 0,
      },
    };
  }
}

/**
 * Emit quota warning event
 * @param quota - Current quota information
 * @param threshold - Configured threshold (0-1)
 */
export function emitQuotaWarning(
  quota: QuotaInfo,
  threshold: number
): void {
  syncEventBus.emit('quota:warning', {
    used: quota.used,
    total: quota.total,
    available: quota.available,
    threshold,
  });
}

/**
 * Emit quota exceeded event
 * @param required - Bytes required
 * @param available - Bytes available
 */
export function emitQuotaExceeded(
  required: number,
  available: number
): void {
  syncEventBus.emit('quota:exceeded', {
    required,
    available,
  });
}

/**
 * Calculate bytes to free for a write operation
 * @param requiredBytes - Bytes needed for the write
 * @param available - Bytes currently available
 * @returns Bytes to free (with 10% buffer)
 */
export function calculateBytesToFree(
  requiredBytes: number,
  available: number
): number {
  const neededBytes = requiredBytes * 1.1; // 10% buffer
  return Math.max(0, neededBytes - available);
}

/**
 * Result of eviction attempt
 */
export interface EvictionAttemptResult {
  success: boolean;
  bytesFreed: number;
  filesEvicted: number;
}

/**
 * Execute eviction if needed before a write operation
 * @param requiredBytes - Bytes needed for the write
 * @param quotaCheck - Current quota check result
 * @param config - Quota manager configuration
 * @param evictFn - Function to execute eviction (bytesToFree) => Promise<EvictionResult>
 * @returns Eviction attempt result
 */
export async function executeEvictionIfNeeded(
  requiredBytes: number,
  quotaCheck: QuotaCheckResult,
  config: IDBQuotaManagerConfig,
  evictFn: (bytesToFree: number) => Promise<EvictionResult>
): Promise<EvictionAttemptResult> {
  const bytesToFree = calculateBytesToFree(requiredBytes, quotaCheck.quota.available);

  if (bytesToFree <= 0) {
    if (config.debug) {
      console.debug('[IDBQuotaManager] No eviction needed, enough space available');
    }
    return { success: true, bytesFreed: 0, filesEvicted: 0 };
  }

  if (config.debug) {
    console.debug(`[IDBQuotaManager] Need to free ${Math.round(bytesToFree)} bytes`);
  }

  try {
    const result = await evictFn(bytesToFree);
    if (config.debug) {
      console.debug(
        `[IDBQuotaManager] Evicted ${result.filesEvicted} files, freed ${Math.round(result.bytesFreed)} bytes`
      );
    }

    // Verify we now have enough space
    const newQuotaCheck = await checkStorageQuota(config);
    const success = newQuotaCheck.quota.available >= requiredBytes;

    return {
      success,
      bytesFreed: result.bytesFreed,
      filesEvicted: result.filesEvicted,
    };
  } catch (error) {
    if (config.debug) {
      console.error('[IDBQuotaManager] Eviction failed:', error);
    }
    return { success: false, bytesFreed: 0, filesEvicted: 0 };
  }
}
