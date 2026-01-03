/**
 * @fileoverview Tool Execution Log Helper Functions
 * @module lib/state/dexie-db-helpers/tool-execution-log-helpers
 * @governance ARC-1.1
 *
 * Helper functions for tool execution logging.
 * Part of Story ARC-1.1: Split dexie-db.ts (1,267 lines)
 */

import type { ToolExecutionLogRecord } from '../dexie-db-types';
import { db } from '../dexie-db';

/**
 * Add a tool execution log entry
 *
 * @param record - Tool execution log record (without createdAt)
 * @returns The created log entry ID
 */
export async function addToolExecutionLog(
    record: Omit<ToolExecutionLogRecord, 'createdAt'>
): Promise<string> {
    const enrichedRecord: ToolExecutionLogRecord = {
        ...record,
        createdAt: Date.now(),
    };

    await db.toolExecutionLogs.put(enrichedRecord);
    return record.id;
}

/**
 * Get all tool execution logs for a conversation
 *
 * @param conversationId - The conversation ID to query
 * @returns Array of tool execution logs sorted by timestamp
 */
export async function getToolExecutionLogs(
    conversationId: string
): Promise<ToolExecutionLogRecord[]> {
    return db.toolExecutionLogs
        .where('conversationId')
        .equals(conversationId)
        .sortBy('timestamp');
}

/**
 * Get tool execution log by ID
 *
 * @param id - The log entry ID
 * @returns Tool execution log record or undefined if not found
 */
export async function getToolExecutionLog(
    id: string
): Promise<ToolExecutionLogRecord | undefined> {
    return db.toolExecutionLogs.get(id);
}

/**
 * Update tool execution log (e.g., after execution completes)
 *
 * @param id - The log entry ID
 * @param updates - Partial log record to update
 */
export async function updateToolExecutionLog(
    id: string,
    updates: Partial<Omit<ToolExecutionLogRecord, 'id' | 'createdAt'>>
): Promise<void> {
    await db.toolExecutionLogs.update(id, updates);
}

/**
 * Get approved tools from a conversation (for session trust)
 *
 * @param conversationId - The conversation ID to query
 * @returns Array of approved tool names
 */
export async function getApprovedTools(
    conversationId: string
): Promise<string[]> {
    const logs = await db.toolExecutionLogs
        .where('conversationId')
        .equals(conversationId)
        .filter((log) => log.approved && log.status === 'executed')
        .toArray();

    return [...new Set(logs.map((log) => log.toolName))];
}

/**
 * Clear old tool execution logs (older than 30 days)
 *
 * @param maxAgeMs - Maximum age in milliseconds (default: 30 days)
 * @returns Number of logs deleted
 */
export async function clearOldToolExecutionLogs(
    maxAgeMs = 30 * 24 * 60 * 60 * 1000
): Promise<number> {
    const cutoff = Date.now() - maxAgeMs;
    return db.toolExecutionLogs.where('timestamp').below(cutoff).delete();
}

/**
 * Clear all tool execution logs for a specific conversation, or all logs if no conversationId provided
 *
 * @param conversationId - Optional conversation ID to filter by
 */
export async function clearToolExecutionLogs(
    conversationId?: string
): Promise<void> {
    if (conversationId) {
        await db.toolExecutionLogs
            .where('conversationId')
            .equals(conversationId)
            .delete();
    } else {
        await db.toolExecutionLogs.clear();
    }
}
