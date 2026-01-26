/**
 * @fileoverview Snapshot Quota Slice
 * @module infrastructure/persistence/stores/filesystem/snapshot-quota-slice
 * @governance EPIC-CP-1.10
 *
 * IndexedDB quota management with LRU eviction.
 * Prevents QuotaExceededError by monitoring cache size and evicting stale entries.
 */

import { StateCreator } from 'zustand';
import type { SnapshotQuotaState, SnapshotQuotaMethods, EvictionResult } from './snapshot-types';

const DEFAULT_QUOTA_MB = 50;
const BYTES_PER_MB = 1024 * 1024;
const SAFETY_MARGIN_RATIO = 0.9; // Evict at 90% of quota

export const createSnapshotQuotaSlice: StateCreator<
  SnapshotQuotaState,
  [],
  [],
  SnapshotQuotaMethods
> = (set, get) => ({
  // State
  quotaLimitMb: DEFAULT_QUOTA_MB,

  // Calculate total cache size in bytes
  getCacheSize: () => {
    const content = (get() as any).content || {};
    let totalBytes = 0;

    Object.values(content).forEach((entry: any) => {
      // Estimate size from content string (2 bytes per char for UTF-16)
      if (entry.content) {
        totalBytes += entry.content.length * 2;
      }
    });

    return totalBytes;
  },

  // Get quota statistics
  getQuotaStats: () => {
    const totalBytes = (get() as any).getCacheSize();
    const totalMb = totalBytes / BYTES_PER_MB;
    const quotaLimitMb = (get() as any).quotaLimitMb;
    const usagePercentage = (totalMb / quotaLimitMb) * 100;
    const entryCount = Object.keys((get() as any).content || {}).length;

    return {
      totalBytes,
      totalMb: Math.round(totalMb * 100) / 100,
      quotaLimitMb,
      usagePercentage: Math.round(usagePercentage * 10) / 10,
      nearLimit: usagePercentage >= (SAFETY_MARGIN_RATIO * 100),
      entryCount,
    };
  },

  // Evict oldest entries (LRU strategy)
  evictOldestEntries: async (targetBytes?: number): Promise<EvictionResult> => {
    const content = (get() as any).content || {};
    const entries = Object.entries(content);

    // Sort by expiresAt (oldest first = least recently used)
    const sorted = entries.sort(([, a]: any, [, b]: any) => a.expiresAt - b.expiresAt);

    let bytesFreed = 0;
    let entriesEvicted = 0;
    const target = targetBytes || (get() as any).getCacheSize() * 0.2; // Default: free 20%

    // Delete oldest entries until target freed
    for (const [key, entry] of sorted) {
      if (bytesFreed >= target) break;

      const size = (entry as any).content.length * 2;
      bytesFreed += size;
      entriesEvicted++;

      // Delete from cache (cross-slice call)
      delete content[key];
    }

    // Update cache state
    set({ content } as any);

    // Persist to Dexie
    // TODO: Add Dexie persistence for quota evictions

    const newTotalMb = (get() as any).getCacheSize() / BYTES_PER_MB;

    return {
      entriesEvicted,
      bytesFreed,
      newTotalMb: Math.round(newTotalMb * 100) / 100,
    };
  },

  // Enforce quota limit (auto-evict if near limit)
  enforceQuotaLimit: async (): Promise<EvictionResult> => {
    const stats = (get() as any).getQuotaStats();

    if (!stats.nearLimit) {
      return {
        entriesEvicted: 0,
        bytesFreed: 0,
        newTotalMb: stats.totalMb,
      };
    }

    // Calculate bytes to free (free enough to get below 80% of quota)
    const targetBytes = stats.totalBytes - (get() as any).quotaLimitMb * BYTES_PER_MB * 0.8;

    return (get() as any).evictOldestEntries(targetBytes);
  },

  // Set quota limit
  setQuotaLimit: (limitMb: number) => {
    set({ quotaLimitMb: limitMb });

    // Auto-enforce new limit
    (get() as any).enforceQuotaLimit();
  },
});
