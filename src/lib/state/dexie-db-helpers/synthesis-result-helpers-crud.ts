/**
 * @fileoverview Synthesis Result Helper Functions (CRUD Operations)
 * @module lib/state/dexie-db-helpers/synthesis-result-helpers-crud
 * @governance ARC-1.1
 *
 * Helper functions for synthesis result CRUD operations (Part 1 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SynthesisResultRecord } from '../dexie-db-knowledge-types';
import { db } from '../dexie-db';

/**
 * Get a synthesis result by ID
 *
 * @param resultId - The synthesis result ID
 * @returns The synthesis result record or undefined if not found
 */
export async function getSynthesisResult(
    resultId: string
): Promise<SynthesisResultRecord | undefined> {
    return db.synthesisResults.get(resultId);
}

/**
 * Get the latest synthesis result for a specific source
 *
 * @param sourceId - The source ID
 * @returns The latest synthesis result or undefined if not found
 */
export async function getSynthesisResultForSource(
    sourceId: string
): Promise<SynthesisResultRecord | undefined> {
    return db.synthesisResults
        .where('sourceId')
        .equals(sourceId)
        .reverse() // Get latest first
        .first();
}

/**
 * Get all synthesis results for a project
 *
 * @param projectId - The project ID
 * @returns Array of synthesis results sorted by creation date (newest first)
 */
export async function getSynthesisResultsForProject(
    projectId: string
): Promise<SynthesisResultRecord[]> {
    return db.synthesisResults
        .where('projectId')
        .equals(projectId)
        .reverse()
        .toArray();
}

/**
 * Get synthesis results by status
 *
 * @param projectId - The project ID
 * @param status - The synthesis status to filter by
 * @returns Array of synthesis results with the specified status
 */
export async function getSynthesisResultsByStatus(
    projectId: string,
    status: 'idle' | 'pending' | 'synthesizing' | 'completed' | 'failed'
): Promise<SynthesisResultRecord[]> {
    return db.synthesisResults
        .where('[projectId+status]')
        .equals([projectId, status])
        .toArray();
}

/**
 * Save a synthesis result (insert or update)
 *
 * @param result - The synthesis result record to save
 * @returns The ID of the saved result
 */
export async function saveSynthesisResult(
    result: SynthesisResultRecord
): Promise<string> {
    const updatedAt = Date.now();
    await db.synthesisResults.put({
        ...result,
        updatedAt,
    });
    return result.id;
}

/**
 * Delete a synthesis result
 *
 * @param resultId - The synthesis result ID to delete
 */
export async function deleteSynthesisResult(resultId: string): Promise<void> {
    await db.synthesisResults.delete(resultId);
}

/**
 * Delete all synthesis results for a specific source
 *
 * @param sourceId - The source ID
 * @returns The number of deleted results
 */
export async function deleteSynthesisResultForSource(
    sourceId: string
): Promise<number> {
    return db.synthesisResults
        .where('sourceId')
        .equals(sourceId)
        .delete();
}

/**
 * Clear all synthesis results for a project
 *
 * @param projectId - The project ID
 * @returns The number of deleted results
 */
export async function clearProjectSynthesisResults(
    projectId: string
): Promise<number> {
    return db.synthesisResults
        .where('projectId')
        .equals(projectId)
        .delete();
}
