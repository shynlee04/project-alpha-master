/**
 * @fileoverview Synthesis Result Helper Functions (Create & Update)
 * @module infrastructure/persistence/dexie-db-helpers/synthesis-result-helpers-create
 * @governance Epic 53 Story 53-2
 *
 * Helper functions for synthesis result creation and status updates (Part 2 of 2).
 * Part of Story 53-2: Move Dexie Helpers to Infrastructure
 */

import type { SynthesisResultRecord } from '../dexie-db-types';
import { db } from '../dexie-db';

/**
 * Create a new synthesis result
 *
 * @param sourceId - The source ID being synthesized
 * @param projectId - The project ID
 * @param initialStatus - The initial synthesis status (default: 'pending')
 * @returns The ID of the created synthesis result
 */
export async function createSynthesisResult(
    sourceId: string,
    projectId: string,
    initialStatus: 'idle' | 'pending' | 'synthesizing' | 'completed' | 'failed' = 'pending'
): Promise<string> {
    const id = crypto.randomUUID();
    const now = Date.now();

    await db.synthesisResults.add({
        id,
        sourceId,
        projectId,
        status: initialStatus,
        frontmatter: undefined,
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
    newStatus: 'idle' | 'pending' | 'synthesizing' | 'completed' | 'failed',
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
