/**
 * @fileoverview Thread Persistence - Dexie-backed thread storage
 * @module lib/workspace/thread-store
 * @governance MVP-2
 * 
 * Provides async persistence for conversation threads using Dexie.
 * This replaces the Zustand localStorage persist for future indexing.
 * 
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { db, type ConversationThreadRecord, type ThreadMessageRecord } from '../state/dexie-db';
import type { ConversationThread, ThreadMessage } from '@/stores/conversation-threads-store';

/**
 * Convert Zustand thread to Dexie record
 */
function toRecord(thread: ConversationThread): ConversationThreadRecord {
    return {
        id: thread.id,
        projectId: thread.projectId,
        title: thread.title,
        preview: thread.preview,
        messages: thread.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            agentId: m.agentId,
            agentName: m.agentName,
            agentModel: m.agentModel,
            timestamp: m.timestamp,
            toolCalls: m.toolCalls?.map(tc => ({
                id: tc.id,
                name: tc.name,
                status: tc.status,
                input: tc.input,
                output: tc.output,
                duration: tc.duration,
            })),
        })),
        agentsUsed: thread.agentsUsed,
        messageCount: thread.messageCount,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
    };
}

/**
 * Convert Dexie record to Zustand thread
 */
function fromRecord(record: ConversationThreadRecord): ConversationThread {
    return {
        id: record.id,
        projectId: record.projectId,
        title: record.title,
        preview: record.preview,
        messages: record.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            agentId: m.agentId,
            agentName: m.agentName,
            agentModel: m.agentModel,
            timestamp: m.timestamp,
            toolCalls: m.toolCalls?.map(tc => ({
                id: tc.id,
                name: tc.name,
                status: tc.status,
                input: tc.input,
                output: tc.output,
                duration: tc.duration,
            })),
        })) as ThreadMessage[],
        agentsUsed: record.agentsUsed,
        messageCount: record.messageCount,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

/**
 * Get all threads for a project, sorted by updatedAt descending
 */
export async function getThreadsForProject(projectId: string): Promise<ConversationThread[]> {
    await db.open();
    const records = await db.threads
        .where('projectId')
        .equals(projectId)
        .reverse()
        .sortBy('updatedAt');
    return records.map(fromRecord);
}

/**
 * Get a single thread by ID
 */
export async function getThread(threadId: string): Promise<ConversationThread | null> {
    await db.open();
    const record = await db.threads.get(threadId);
    return record ? fromRecord(record) : null;
}

/**
 * Save a thread (create or update)
 */
export async function saveThread(thread: ConversationThread): Promise<void> {
    await db.open();
    await db.threads.put(toRecord(thread));
}

/**
 * Delete a thread
 */
export async function deleteThread(threadId: string): Promise<void> {
    await db.open();
    await db.threads.delete(threadId);
}

/**
 * Clear all threads for a project
 */
export async function clearProjectThreads(projectId: string): Promise<void> {
    await db.open();
    await db.threads.where('projectId').equals(projectId).delete();
}

/**
 * Get all threads (for migration or backup)
 */
export async function getAllThreads(): Promise<ConversationThread[]> {
    await db.open();
    const records = await db.threads.toArray();
    return records.map(fromRecord);
}

/**
 * Bulk save threads (for migration from localStorage)
 */
export async function bulkSaveThreads(threads: ConversationThread[]): Promise<void> {
    await db.open();
    await db.threads.bulkPut(threads.map(toRecord));
}
