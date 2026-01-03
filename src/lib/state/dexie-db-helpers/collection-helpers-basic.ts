/**
 * @fileoverview Collection Helper Functions (Basic Operations)
 * @module lib/state/dexie-db-helpers/collection-helpers-basic
 * @governance ARC-1.1
 *
 * Helper functions for collection CRUD operations (Part 1 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { CollectionRecord, SourceRecord } from '../dexie-db-knowledge-types';
import { db } from '../dexie-db';

/**
 * Get all collections for a project
 *
 * @param projectId - The project ID
 * @returns Array of collections sorted by name
 */
export async function getCollectionsForProject(
    projectId: string
): Promise<CollectionRecord[]> {
    const collections = await db.collections
        .where('projectId')
        .equals(projectId)
        .sortBy('name');

    return collections;
}

/**
 * Get a collection by ID
 *
 * @param collectionId - The collection ID to retrieve
 * @returns The collection record or undefined if not found
 */
export async function getCollection(
    collectionId: string
): Promise<CollectionRecord | undefined> {
    return db.collections.get(collectionId);
}

/**
 * Save a collection (insert or update)
 *
 * @param collection - The collection record to save
 */
export async function saveCollection(
    collection: CollectionRecord
): Promise<void> {
    await db.collections.put({
        ...collection,
        updatedAt: Date.now(),
    });
}

/**
 * Create a new collection
 *
 * @param projectId - The project ID
 * @param name - The collection name
 * @returns The created collection ID
 */
export async function createCollection(
    projectId: string,
    name: string
): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();

    await db.collections.add({
        id,
        projectId,
        name,
        sourceIds: [],
        createdAt: now,
        updatedAt: now,
    });

    return id;
}

/**
 * Delete a collection
 *
 * @param collectionId - The collection ID to delete
 */
export async function deleteCollection(
    collectionId: string
): Promise<void> {
    await db.collections.delete(collectionId);
}
