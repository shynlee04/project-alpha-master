/**
 * @fileoverview Conversation Thread Helper Functions
 * @module lib/state/dexie-db-helpers/conversation-thread-helpers
 * @governance ARC-1.1
 *
 * Helper functions for conversation thread management.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { ConversationThreadRecord } from '../dexie-db-ai-types';
import { db } from '../dexie-db';

/**
 * Get a conversation thread by ID
 *
 * @param threadId - The thread ID to retrieve
 * @returns The thread record or undefined if not found
 */
export async function getConversationThread(
    threadId: string
): Promise<ConversationThreadRecord | undefined> {
    return db.threads.get(threadId);
}

/**
 * Save a conversation thread (insert or update)
 *
 * @param thread - The thread record to save
 */
export async function saveConversationThread(
    thread: ConversationThreadRecord
): Promise<void> {
    await db.threads.put(thread);
}

/**
 * Get the most recent conversation thread for a project
 *
 * @param projectId - The project ID to query
 * @returns The most recently updated thread or undefined if none exist
 */
export async function getMostRecentThread(
    projectId: string
): Promise<ConversationThreadRecord | undefined> {
    const threads = await db.threads
        .where('projectId')
        .equals(projectId)
        .sortBy('updatedAt');

    // Return the last element (most recent)
    return threads.length > 0 ? threads[threads.length - 1] : undefined;
}

/**
 * Get all threads for a project sorted by most recently updated
 *
 * @param projectId - The project ID to query
 * @returns Array of threads sorted by updatedAt descending
 */
export async function getThreadsForProject(
    projectId: string
): Promise<ConversationThreadRecord[]> {
    const threads = await db.threads
        .where('projectId')
        .equals(projectId)
        .sortBy('updatedAt');

    // Reverse to get most recent first
    return threads.reverse();
}

/**
 * Delete a conversation thread
 *
 * @param threadId - The thread ID to delete
 */
export async function deleteConversationThread(
    threadId: string
): Promise<void> {
    await db.threads.delete(threadId);
}

/**
 * Update scroll position for a thread
 *
 * @param threadId - The thread ID
 * @param scrollPosition - The new scroll position
 */
export async function updateThreadScrollPosition(
    threadId: string,
    scrollPosition: number
): Promise<void> {
    await db.threads.update(threadId, {
        scrollPosition,
        updatedAt: Date.now(),
    });
}
