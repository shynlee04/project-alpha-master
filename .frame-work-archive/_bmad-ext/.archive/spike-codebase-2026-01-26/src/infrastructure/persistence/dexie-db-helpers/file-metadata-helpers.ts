/**
 * @fileoverview File Metadata Helper Functions
 * @module infrastructure/persistence/dexie-db-helpers/file-metadata-helpers
 * @governance ARC-1.1
 *
 * Helper functions for file metadata CRUD operations.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { FileMetadataRecord } from '../dexie-db-types';
import { db } from '../dexie-db';

/**
 * Get file metadata for a specific file in a project
 *
 * @param projectId - The project ID
 * @param filePath - The file path relative to project root
 * @returns File metadata record or undefined if not found
 */
export async function getFileMetadata(
    projectId: string,
    filePath: string
): Promise<FileMetadataRecord | undefined> {
    return db.fileMetadata
        .where('[projectId+path]')
        .equals([projectId, filePath])
        .first();
}

/**
 * Get all file metadata for a project
 *
 * @param projectId - The project ID to query
 * @returns Array of file metadata records for the project
 */
export async function getAllFileMetadata(
    projectId: string
): Promise<FileMetadataRecord[]> {
    return db.fileMetadata.where('projectId').equals(projectId).toArray();
}

/**
 * Upsert file metadata (insert or update)
 *
 * @param record - File metadata record (without createdAt, updatedAt)
 */
export async function upsertFileMetadata(
    record: Omit<FileMetadataRecord, 'createdAt' | 'updatedAt'>
): Promise<void> {
    const now = Date.now();
    const existing = await getFileMetadata(record.projectId, record.path);

    await db.fileMetadata.put({
        ...record,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

/**
 * Bulk upsert file metadata for efficient syncing
 *
 * @param records - Array of file metadata records (without timestamps)
 */
export async function bulkUpsertFileMetadata(
    records: Omit<FileMetadataRecord, 'createdAt' | 'updatedAt'>[]
): Promise<void> {
    const now = Date.now();
    const enrichedRecords = records.map((record) => ({
        ...record,
        createdAt: now,
        updatedAt: now,
    }));

    await db.fileMetadata.bulkPut(enrichedRecords);
}

/**
 * Delete file metadata
 *
 * @param projectId - The project ID
 * @param filePath - The file path to delete
 */
export async function deleteFileMetadata(
    projectId: string,
    filePath: string
): Promise<void> {
    await db.fileMetadata
        .where('[projectId+path]')
        .equals([projectId, filePath])
        .delete();
}

/**
 * Clear all file metadata for a project
 *
 * @param projectId - The project ID
 * @returns Number of records deleted
 */
export async function clearProjectFileMetadata(projectId: string): Promise<number> {
    return db.fileMetadata.where('projectId').equals(projectId).delete();
}

/**
 * Get files that need syncing (lastModified > syncedAt)
 *
 * @param projectId - The project ID to query
 * @returns Array of file metadata records that need syncing
 */
export async function getFilesNeedingSync(projectId: string): Promise<FileMetadataRecord[]> {
    const allFiles = await getAllFileMetadata(projectId);
    return allFiles.filter((f) => f.lastModified > f.syncedAt);
}
