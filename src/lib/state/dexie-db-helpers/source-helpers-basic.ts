/**
 * @fileoverview Source Helper Functions (Basic Operations)
 * @module lib/state/dexie-db-helpers/source-helpers-basic
 * @governance ARC-1.1
 *
 * Helper functions for source CRUD operations (Part 1 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SourceRecord } from '../dexie-db-knowledge-types';
import { db } from '../dexie-db';

/**
 * Get a source by ID
 *
 * @param sourceId - The source ID to retrieve
 * @returns The source record or undefined if not found
 */
export async function getSource(
    sourceId: string
): Promise<SourceRecord | undefined> {
    return db.sources.get(sourceId);
}

/**
 * Save a source (insert or update)
 *
 * @param source - The source record to save
 */
export async function saveSource(
    source: SourceRecord
): Promise<void> {
    await db.sources.put({
        ...source,
        updatedAt: Date.now(),
    });
}

/**
 * Get all sources for a project sorted by most recently created
 *
 * @param projectId - The project ID to query
 * @returns Array of sources sorted by createdAt descending
 */
export async function getSourcesForProject(
    projectId: string
): Promise<SourceRecord[]> {
    const sources = await db.sources
        .where('projectId')
        .equals(projectId)
        .sortBy('createdAt');

    // Reverse to get most recent first
    return sources.reverse();
}

/**
 * Get sources by type for a project
 *
 * @param projectId - The project ID
 * @param type - The source type filter
 * @returns Array of sources matching the type
 */
export async function getSourcesByType(
    projectId: string,
    type: SourceRecord['type']
): Promise<SourceRecord[]> {
    return db.sources
        .where('[projectId+type]')
        .equals([projectId, type])
        .toArray();
}

/**
 * Delete a source
 *
 * @param sourceId - The source ID to delete
 */
export async function deleteSource(
    sourceId: string
): Promise<void> {
    await db.sources.delete(sourceId);
}

/**
 * Clear all sources for a project
 *
 * @param projectId - The project ID
 * @returns Number of sources deleted
 */
export async function clearProjectSources(projectId: string): Promise<number> {
    return db.sources.where('projectId').equals(projectId).delete();
}
