/**
 * @fileoverview Orama Index IndexedDB Storage
 * @module lib/rag/indexeddb-storage
 * @governance EPIC-7-1
 *
 * Provides Dexie-based persistence for Orama index data.
 * Stores serialized Orama indexes in IndexedDB.
 */

import { db } from '@/lib/state/dexie-db';

// ============================================================================
// Types
// ============================================================================

/**
 * Orama index record for IndexedDB storage
 * Stores serialized Orama index data as JSON.
 *
 * @epic Epic 7 - RAG Infrastructure
 * @story 7-1 - Orama Index Management
 */
export interface OramaIndexRecord {
  /** Primary key - project ID */
  projectId: string;

  /** Serialized Orama index data (JSON string) */
  data: string;

  /** Schema version for migration */
  schemaVersion: number;

  /** Number of documents in index */
  documentCount: number;

  /** Size of serialized data in bytes */
  size: number;

  /** Last updated timestamp */
  lastUpdated: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Orama index data for a project
 *
 * @param projectId - Project ID
 * @returns Promise resolving to parsed Orama data, or null if not found
 */
export async function getOramaIndexData(projectId: string): Promise<unknown | null> {
  try {
    const record = await db.oramaIndexes.get(projectId);
    if (!record) {
      return null;
    }

    return JSON.parse(record.data);
  } catch (error) {
    console.error(`[OramaStorage] Failed to get index data for project "${projectId}":`, error);
    return null;
  }
}

/**
 * Save Orama index data for a project
 *
 * @param projectId - Project ID
 * @param data - Serialized Orama index data
 * @returns Promise resolving when saved
 */
export async function saveOramaIndexData(projectId: string, data: unknown): Promise<void> {
  try {
    const dataString = JSON.stringify(data);
    const size = new Blob([dataString]).size;

    // Estimate document count from data (Orama doesn't expose this directly)
    // This is a rough approximation - actual count will vary
    const documentCount = estimateDocumentCount(data);

    await db.oramaIndexes.put({
      projectId,
      data: dataString,
      schemaVersion: 1,
      documentCount,
      size,
      lastUpdated: Date.now(),
    });
  } catch (error) {
    console.error(`[OramaStorage] Failed to save index data for project "${projectId}":`, error);
    throw error;
  }
}

/**
 * Delete Orama index data for a project
 *
 * @param projectId - Project ID
 * @returns Promise resolving when deleted
 */
export async function deleteOramaIndexData(projectId: string): Promise<void> {
  try {
    await db.oramaIndexes.delete(projectId);
  } catch (error) {
    console.error(`[OramaStorage] Failed to delete index data for project "${projectId}":`, error);
    throw error;
  }
}

/**
 * Get all Orama index IDs
 *
 * @returns Promise resolving to array of project IDs with indexes
 */
export async function getAllOramaIndexIds(): Promise<string[]> {
  try {
    const records = await db.oramaIndexes.toArray();
    return records.map((r) => r.projectId);
  } catch (error) {
    console.error('[OramaStorage] Failed to get all index IDs:', error);
    return [];
  }
}

/**
 * Get total size of all Orama indexes
 *
 * @returns Promise resolving to total size in bytes
 */
export async function getTotalIndexesSize(): Promise<number> {
  try {
    const records = await db.oramaIndexes.toArray();
    return records.reduce((total, record) => total + record.size, 0);
  } catch (error) {
    console.error('[OramaStorage] Failed to get total indexes size:', error);
    return 0;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Estimate document count from Orama index data
 * This is a rough approximation based on the data structure
 *
 * @param data - Orama index data
 * @returns Estimated document count
 */
function estimateDocumentCount(data: unknown): number {
  if (!data || typeof data !== 'object') {
    return 0;
  }

  // Orama stores documents in a specific structure
  // This is a simplified estimate - actual implementation may vary
  const dataObj = data as Record<string, unknown>;
  const docs = dataObj.docs as Record<string, unknown> | undefined;

  if (docs && typeof docs === 'object') {
    return Object.keys(docs).length;
  }

  return 0;
}

/**
 * Check if an index exists for a project
 *
 * @param projectId - Project ID
 * @returns Promise resolving to true if index exists
 */
export async function hasOramaIndex(projectId: string): Promise<boolean> {
  try {
    const count = await db.oramaIndexes.where('projectId').equals(projectId).count();
    return count > 0;
  } catch (error) {
    console.error(`[OramaStorage] Failed to check index existence for project "${projectId}":`, error);
    return false;
  }
}

/**
 * Get all index metadata
 *
 * @returns Promise resolving to array of index metadata
 */
export async function getAllIndexesMetadata(): Promise<
  Array<{
    projectId: string;
    documentCount: number;
    size: number;
    lastUpdated: number;
  }>
> {
  try {
    const records = await db.oramaIndexes.toArray();
    return records.map((r) => ({
      projectId: r.projectId,
      documentCount: r.documentCount,
      size: r.size,
      lastUpdated: r.lastUpdated,
    }));
  } catch (error) {
    console.error('[OramaStorage] Failed to get all indexes metadata:', error);
    return [];
  }
}
