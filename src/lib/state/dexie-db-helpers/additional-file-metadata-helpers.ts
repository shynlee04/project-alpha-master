/**
 * @fileoverview Additional File Metadata Helper Functions
 * @module lib/state/dexie-db-helpers/additional-file-metadata-helpers
 * @governance ARC-1.1
 *
 * Helper functions for advanced file metadata operations.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { FileMetadataRecord } from '../dexie-db-knowledge-types';
import { db } from '../dexie-db';

/**
 * Get files changed since a specific timestamp
 *
 * @param projectId - The project ID
 * @param since - Timestamp to filter from (ms since epoch)
 * @returns Array of file metadata records changed since the timestamp
 */
export async function getChangedFilesSince(
    projectId: string,
    since: number
): Promise<FileMetadataRecord[]> {
    const allMetadata = await db.fileMetadata
        .where('projectId')
        .equals(projectId)
        .toArray();

    return allMetadata.filter(metadata => metadata.updatedAt > since);
}

/**
 * Clear all file metadata cache for a project
 *
 * @param projectId - The project ID
 * @returns The number of deleted metadata records
 */
export async function clearFileMetadataCache(
    projectId: string
): Promise<number> {
    return db.fileMetadata
        .where('projectId')
        .equals(projectId)
        .delete();
}
