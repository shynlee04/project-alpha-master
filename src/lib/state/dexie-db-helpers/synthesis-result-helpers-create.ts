/**
 * @fileoverview Synthesis Result Helper Functions (Create & Update)
 * @module lib/state/dexie-db-helpers/synthesis-result-helpers-create
 * @governance ARC-1.1
 *
 * Helper functions for synthesis result creation and status updates (Part 2 of 2).
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { SynthesisResultRecord } from '../dexie-db-knowledge-types';
import { db } from '../dexie-db';

/**
 * Create a new synthesis result
 *
 * @param sourceId - The source ID being synthesized
 * @param projectId - The project ID
 * @param sourceType - The source type (pdf, url, or text)
 * @param initialStatus - The initial synthesis status (default: 'pending')
 * @returns The ID of the created synthesis result
 */
export async function createSynthesisResult(
    sourceId: string,
    projectId: string,
    sourceType: 'pdf' | 'url' | 'text',
    initialStatus: 'pending' | 'in_progress' | 'completed' | 'failed' = 'pending'
): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();

    await db.synthesisResults.add({
        id,
        sourceId,
        projectId,
        sourceType,
        status: initialStatus,
        frontmatter: null,
        createdAt: now,
        updatedAt: now,
    });

    return id;
}

/**
 * Update synthesis result status
 *
 * @param resultId - The synthesis result ID
 * @param newStatus - The new status
 * @param frontmatter - Optional frontmatter to update (required when status is 'completed')
 * @returns The updated synthesis result or undefined if not found
 */
export async function updateSynthesisResultStatus(
    resultId: string,
    newStatus: 'pending' | 'in_progress' | 'completed' | 'failed',
    frontmatter?: SynthesisResultRecord['frontmatter']
): Promise<SynthesisResultRecord | undefined> {
    const result = await db.synthesisResults.get(resultId);
    if (!result) return undefined;

    const updatedResult: Partial<SynthesisResultRecord> = {
        status: newStatus,
        updatedAt: Date.now(),
    };

    // Only update frontmatter if provided
    if (frontmatter !== undefined) {
        updatedResult.frontmatter = frontmatter;
    }

    await db.synthesisResults.update(resultId, updatedResult);

    return {
        ...result,
        ...updatedResult,
    } as SynthesisResultRecord;
}
