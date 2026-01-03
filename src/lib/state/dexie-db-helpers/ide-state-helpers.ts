/**
 * @fileoverview IDE State Helper Functions
 * @module lib/state/dexie-db-helpers/ide-state-helpers
 * @governance ARC-1.1
 *
 * Helper functions for IDE state CRUD operations.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { IDEStateRecord, ProjectRecord } from '../dexie-db-core-types';
import { db } from '../dexie-db';

/**
 * Get IDE state for a project, or create default if not exists
 *
 * @param projectId - The project ID to query
 * @returns IDE state record or undefined if not found
 */
export async function getIDEState(projectId: string): Promise<IDEStateRecord | undefined> {
    return db.ideState.get(projectId);
}

/**
 * Save IDE state for a project
 *
 * @param state - The IDE state record to save
 */
export async function saveIDEState(state: IDEStateRecord): Promise<void> {
    await db.ideState.put({
        ...state,
        updatedAt: new Date(),
    });
}

/**
 * Delete old IDE state (cleanup)
 *
 * @param projectId - The project ID to delete
 */
export async function deleteIDEState(projectId: string): Promise<void> {
    await db.ideState.delete(projectId);
}

/**
 * Get all projects, sorted by last opened
 *
 * @param limit - Maximum number of projects to return (default: 10)
 * @returns Array of project records sorted by lastOpened descending
 */
export async function getRecentProjects(limit = 10): Promise<ProjectRecord[]> {
    return db.projects
        .orderBy('lastOpened')
        .reverse()
        .limit(limit)
        .toArray();
}

/**
 * Reset database for testing
 *
 * Deletes and recreates the database. Use with caution!
 */
export async function resetDatabaseForTesting(): Promise<void> {
    const dbInstance = db;
    if (!dbInstance) return;
    await dbInstance.delete();
    await dbInstance.open();
}
