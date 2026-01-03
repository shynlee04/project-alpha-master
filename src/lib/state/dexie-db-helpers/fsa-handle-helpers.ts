/**
 * @fileoverview FSA Handle Helper Functions
 * @module lib/state/dexie-db-helpers/fsa-handle-helpers
 * @governance ARC-1.1
 *
 * Helper functions for File System Access API handle management.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { FSAHandleRecord } from '../dexie-db-types';
import { db } from '../dexie-db';

/**
 * Store FSA handle for a project
 *
 * @param record - FSA handle record (without timestamps)
 */
export async function storeFSAHandle(
    record: Omit<FSAHandleRecord, 'createdAt' | 'updatedAt'>
): Promise<void> {
    const now = Date.now();
    const existing = await db.fsaHandles.get(record.projectId);

    await db.fsaHandles.put({
        ...record,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

/**
 * Get FSA handle for a project
 *
 * @param projectId - The project ID to query
 * @returns FSA handle record or undefined if not found
 */
export async function getFSAHandle(
    projectId: string
): Promise<FSAHandleRecord | undefined> {
    return db.fsaHandles.get(projectId);
}

/**
 * Update FSA handle permission status
 *
 * @param projectId - The project ID
 * @param status - The new permission status
 */
export async function updateFSAHandleStatus(
    projectId: string,
    status: FSAHandleRecord['permissionStatus']
): Promise<void> {
    await db.fsaHandles.update(projectId, {
        permissionStatus: status,
        lastAccessedAt: Date.now(),
        updatedAt: Date.now(),
    });
}

/**
 * Update FSA handle permission
 *
 * @param projectId - The project ID
 * @param status - The new permission status
 */
export async function updateFSAHandlePermission(
    projectId: string,
    status: FSAHandleRecord['permissionStatus']
): Promise<void> {
    await db.fsaHandles.update(projectId, {
        permissionStatus: status,
        updatedAt: Date.now()
    });
}

/**
 * Delete FSA handle (e.g., when revoked)
 *
 * @param projectId - The project ID
 */
export async function deleteFSAHandle(projectId: string): Promise<void> {
    await db.fsaHandles.delete(projectId);
}

/**
 * Clear all FSA handles (privacy operation)
 */
export async function clearAllFSAHandles(): Promise<void> {
    await db.fsaHandles.clear();
}

/**
 * Get all valid FSA handles (for dashboard display)
 *
 * @returns Array of FSA handle records with 'granted' status
 */
export async function getAllValidFSAHandles(): Promise<FSAHandleRecord[]> {
    return db.fsaHandles
        .where('permissionStatus')
        .equals('granted')
        .toArray();
}
