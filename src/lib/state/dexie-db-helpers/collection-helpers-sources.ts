/**
 * @fileoverview Collection Helper Functions (Source Management)
 * @module lib/state/dexie-db-helpers/collection-helpers-sources
 * @governance ARC-1.1
 *
 * Helper functions for managing sources within collections (Part 2 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { CollectionRecord } from '../dexie-db-knowledge-types';
import { db } from '../dexie-db';

/**
 * Add a source to a collection
 *
 * @param collectionId - The collection ID
 * @param sourceId - The source ID to add
 * @returns The updated collection or undefined if not found
 */
export async function addSourceToCollection(
    collectionId: string,
    sourceId: string
): Promise<CollectionRecord | undefined> {
    const collection = await db.collections.get(collectionId);
    if (!collection) return undefined;

    if (!collection.sourceIds.includes(sourceId)) {
        collection.sourceIds.push(sourceId);
        await db.collections.put({
            ...collection,
            updatedAt: Date.now(),
        });
    }

    return collection;
}

/**
 * Remove a source from a collection
 *
 * @param collectionId - The collection ID
 * @param sourceId - The source ID to remove
 * @returns The updated collection or undefined if not found
 */
export async function removeSourceFromCollection(
    collectionId: string,
    sourceId: string
): Promise<CollectionRecord | undefined> {
    const collection = await db.collections.get(collectionId);
    if (!collection) return undefined;

    const index = collection.sourceIds.indexOf(sourceId);
    if (index > -1) {
        collection.sourceIds.splice(index, 1);
        await db.collections.put({
            ...collection,
            updatedAt: Date.now(),
        });
    }

    return collection;
}

/**
 * Get all source IDs for a collection
 *
 * @param collectionId - The collection ID
 * @returns Array of source IDs or empty array if collection not found
 */
export async function getSourcesForCollection(
    collectionId: string
): Promise<string[]> {
    const collection = await db.collections.get(collectionId);
    return collection?.sourceIds ?? [];
}
