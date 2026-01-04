/**
 * @fileoverview Tool Execution Log Helpers Tests
 * @module lib/state/dexie-db-helpers/__tests__/tool-execution-log-helpers.test
 * @governance ARC-DUP-IMPROVE-4
 *
 * Tests for tool execution log helpers.
 * P1 important file - requires 80% coverage.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { dexieDB } from '@/infrastructure/persistence/dexie-db-class';
import type { ToolExecutionLogRecord } from '@/infrastructure/persistence/dexie-db-session-types';
import {
    addToolExecutionLog,
    getToolExecutionLogs,
    getToolExecutionLog,
    updateToolExecutionLog,
    getApprovedTools,
    clearOldToolExecutionLogs,
    clearToolExecutionLogs,
} from '../tool-execution-log-helpers';

describe('Tool Execution Log Helpers', () => {
    const mockLog: ToolExecutionLogRecord = {
        id: 'log-1',
        toolName: 'read',
        toolArgs: { path: '/test/file.txt' },
        executionTime: Date.now(),
        duration: 150,
        status: 'success',
        result: { content: 'test content' },
        errorMessage: null,
        projectId: 'test-project-1',
        conversationId: 'conv-1',
    };

    beforeEach(async () => {
        // Clear toolExecutionLogs table before each test
        await dexieDB.toolExecutionLogs.clear();
    });

    afterEach(async () => {
        // Clear toolExecutionLogs table after each test
        await dexieDB.toolExecutionLogs.clear();
    });

    describe('addToolExecutionLog', () => {
        it('should add tool execution log', async () => {
            await addToolExecutionLog(mockLog);

            const result = await getToolExecutionLog('log-1');
            expect(result).not.toBeNull();
            expect(result?.toolName).toBe('read');
        });

        it('should auto-generate ID if not provided', async () => {
            const logWithoutId = { ...mockLog, id: undefined as unknown as string };
            await addToolExecutionLog(logWithoutId);

            const logs = await getToolExecutionLogs('test-project-1', 'conv-1');
            expect(logs).toHaveLength(1);
            expect(logs[0].id).toBeDefined();
        });

        it('should set execution timestamp if not provided', async () => {
            const logWithoutTime = { ...mockLog, executionTime: undefined as unknown as number };
            const beforeAdd = Date.now();

            await addToolExecutionLog(logWithoutTime);

            const result = await getToolExecutionLogs('test-project-1', 'conv-1');
            expect(result[0].executionTime).toBeGreaterThanOrEqual(beforeAdd);
        });

        it('should handle concurrent log additions', async () => {
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(addToolExecutionLog({
                    ...mockLog,
                    id: `log-${i}`,
                    toolName: `tool-${i}`,
                }));
            }
            await Promise.all(promises);

            const logs = await getToolExecutionLogs('test-project-1', 'conv-1');
            expect(logs).toHaveLength(10);
        });
    });

    describe('getToolExecutionLogs', () => {
        beforeEach(async () => {
            // Add sample logs
            await dexieDB.toolExecutionLogs.bulkPut([
                mockLog,
                { ...mockLog, id: 'log-2', toolName: 'write' },
                { ...mockLog, id: 'log-3', conversationId: 'conv-2' },
                { ...mockLog, id: 'log-4', projectId: 'test-project-2' },
            ]);
        });

        it('should get all logs for project and conversation', async () => {
            const logs = await getToolExecutionLogs('test-project-1', 'conv-1');
            expect(logs).toHaveLength(2);
        });

        it('should filter by project ID', async () => {
            const logs = await getToolExecutionLogs('test-project-1', 'conv-2');
            expect(logs).toHaveLength(1);
            expect(logs[0].id).toBe('log-3');
        });

        it('should filter by conversation ID', async () => {
            const logs = await getToolExecutionLogs('test-project-1', 'conv-2');
            expect(logs).toHaveLength(1);
            expect(logs[0].conversationId).toBe('conv-2');
        });

        it('should return empty array for non-existent project', async () => {
            const logs = await getToolExecutionLogs('non-existent', 'conv-1');
            expect(logs).toEqual([]);
        });

        it('should order logs by execution time descending', async () => {
            const now = Date.now();
            await dexieDB.toolExecutionLogs.bulkPut([
                { ...mockLog, id: 'log-1', executionTime: now - 3000 },
                { ...mockLog, id: 'log-2', executionTime: now - 2000 },
                { ...mockLog, id: 'log-3', executionTime: now - 1000 },
            ]);

            const logs = await getToolExecutionLogs('test-project-1', 'conv-1');
            expect(logs[0].executionTime).toBe(now - 1000);
            expect(logs[1].executionTime).toBe(now - 2000);
            expect(logs[2].executionTime).toBe(now - 3000);
        });
    });

    describe('getToolExecutionLog', () => {
        it('should get log by ID', async () => {
            await addToolExecutionLog(mockLog);

            const result = await getToolExecutionLog('log-1');
            expect(result).not.toBeNull();
            expect(result?.id).toBe('log-1');
        });

        it('should return null for non-existent log', async () => {
            const result = await getToolExecutionLog('non-existent');
            expect(result).toBeNull();
        });

        it('should return log with all properties', async () => {
            await addToolExecutionLog(mockLog);

            const result = await getToolExecutionLog('log-1');
            expect(result).toMatchObject({
                id: 'log-1',
                toolName: 'read',
                toolArgs: { path: '/test/file.txt' },
                status: 'success',
                result: { content: 'test content' },
            });
        });
    });

    describe('updateToolExecutionLog', () => {
        it('should update existing log', async () => {
            await addToolExecutionLog(mockLog);
            await updateToolExecutionLog('log-1', {
                status: 'failed',
                errorMessage: 'Test error',
            });

            const result = await getToolExecutionLog('log-1');
            expect(result?.status).toBe('failed');
            expect(result?.errorMessage).toBe('Test error');
        });

        it('should handle non-existent log gracefully', async () => {
            await expect(updateToolExecutionLog('non-existent', { status: 'failed' })).resolves.toBeUndefined();
        });

        it('should allow partial updates', async () => {
            await addToolExecutionLog(mockLog);
            const originalDuration = (await getToolExecutionLog('log-1'))?.duration;

            await updateToolExecutionLog('log-1', { status: 'success' });

            const result = await getToolExecutionLog('log-1');
            expect(result?.status).toBe('success');
            expect(result?.duration).toBe(originalDuration);
        });

        it('should update duration property', async () => {
            await addToolExecutionLog(mockLog);
            await updateToolExecutionLog('log-1', { duration: 500 });

            const result = await getToolExecutionLog('log-1');
            expect(result?.duration).toBe(500);
        });
    });

    describe('getApprovedTools', () => {
        beforeEach(async () => {
            // Add logs with different tools
            await dexieDB.toolExecutionLogs.bulkPut([
                { ...mockLog, id: 'log-1', toolName: 'read', status: 'success' },
                { ...mockLog, id: 'log-2', toolName: 'read', status: 'success' },
                { ...mockLog, id: 'log-3', toolName: 'write', status: 'success' },
                { ...mockLog, id: 'log-4', toolName: 'execute', status: 'failed' },
                { ...mockLog, id: 'log-5', toolName: 'delete', status: 'success' },
            ]);
        });

        it('should return tools with 100% success rate', async () => {
            const approved = await getApprovedTools('test-project-1', 'conv-1');
            expect(approved).toContain('read');
            expect(approved).toContain('write');
            expect(approved).toContain('delete');
        });

        it('should not include tools with failures', async () => {
            const approved = await getApprovedTools('test-project-1', 'conv-1');
            expect(approved).not.toContain('execute');
        });

        it('should return empty array for no logs', async () => {
            await dexieDB.toolExecutionLogs.clear();
            const approved = await getApprovedTools('test-project-1', 'conv-1');
            expect(approved).toEqual([]);
        });

        it('should filter by project and conversation', async () => {
            await dexieDB.toolExecutionLogs.put({
                ...mockLog,
                id: 'log-other',
                projectId: 'test-project-2',
            });

            const approved = await getApprovedTools('test-project-1', 'conv-1');
            expect(approved.length).toBeGreaterThan(0);
        });
    });

    describe('clearOldToolExecutionLogs', () => {
        it('should remove logs older than specified age', async () => {
            const now = Date.now();
            const oldLogs = [
                { ...mockLog, id: 'old-1', executionTime: now - 86400000 * 8 }, // 8 days ago
                { ...mockLog, id: 'old-2', executionTime: now - 86400000 * 10 }, // 10 days ago
            ];
            const newLogs = [
                { ...mockLog, id: 'new-1', executionTime: now - 86400000 * 3 }, // 3 days ago
                { ...mockLog, id: 'new-2', executionTime: now }, // Now
            ];

            await dexieDB.toolExecutionLogs.bulkPut([...oldLogs, ...newLogs]);

            const count = await clearOldToolExecutionLogs(7); // Keep last 7 days
            expect(count).toBe(2); // Should delete 2 old logs

            const remaining = await dexieDB.toolExecutionLogs.toArray();
            expect(remaining).toHaveLength(2);
            expect(remaining.every(log => log.executionTime >= now - 86400000 * 7)).toBe(true);
        });

        it('should keep all logs if maxAge is 0', async () => {
            await addToolExecutionLog(mockLog);

            const count = await clearOldToolExecutionLogs(0);
            expect(count).toBe(0);

            const logs = await dexieDB.toolExecutionLogs.toArray();
            expect(logs).toHaveLength(1);
        });

        it('should handle empty database gracefully', async () => {
            const count = await clearOldToolExecutionLogs(7);
            expect(count).toBe(0);
        });
    });

    describe('clearToolExecutionLogs', () => {
        it('should clear all logs for project and conversation', async () => {
            await dexieDB.toolExecutionLogs.bulkPut([
                mockLog,
                { ...mockLog, id: 'log-2' },
                { ...mockLog, id: 'log-3', conversationId: 'conv-2' },
                { ...mockLog, id: 'log-4', projectId: 'test-project-2' },
            ]);

            await clearToolExecutionLogs('test-project-1', 'conv-1');

            const logs = await getToolExecutionLogs('test-project-1', 'conv-1');
            expect(logs).toHaveLength(0);
        });

        it('should not affect other conversations', async () => {
            await dexieDB.toolExecutionLogs.bulkPut([
                mockLog,
                { ...mockLog, id: 'log-2', conversationId: 'conv-2' },
            ]);

            await clearToolExecutionLogs('test-project-1', 'conv-1');

            const conv2Logs = await getToolExecutionLogs('test-project-1', 'conv-2');
            expect(conv2Logs).toHaveLength(1);
        });

        it('should not affect other projects', async () => {
            await dexieDB.toolExecutionLogs.bulkPut([
                mockLog,
                { ...mockLog, id: 'log-2', projectId: 'test-project-2' },
            ]);

            await clearToolExecutionLogs('test-project-1', 'conv-1');

            const project2Logs = await getToolExecutionLogs('test-project-2', 'conv-1');
            expect(project2Logs).toHaveLength(1);
        });

        it('should handle non-existent project gracefully', async () => {
            await expect(clearToolExecutionLogs('non-existent', 'conv-1')).resolves.toBeUndefined();
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete tool execution workflow', async () => {
            // 1. Add tool execution log
            await addToolExecutionLog({
                ...mockLog,
                status: 'pending',
            });

            // 2. Update status to success
            await updateToolExecutionLog('log-1', {
                status: 'success',
                duration: 250,
                result: { output: 'test' },
            });

            // 3. Verify log updated
            const result = await getToolExecutionLog('log-1');
            expect(result?.status).toBe('success');
            expect(result?.duration).toBe(250);

            // 4. Check if tool is approved
            const approved = await getApprovedTools('test-project-1', 'conv-1');
            expect(approved).toContain('read');
        });

        it('should handle batch cleanup workflow', async () => {
            const now = Date.now();
            await dexieDB.toolExecutionLogs.bulkPut([
                { ...mockLog, id: 'old-1', executionTime: now - 86400000 * 20 },
                { ...mockLog, id: 'old-2', executionTime: now - 86400000 * 15 },
                { ...mockLog, id: 'recent-1', executionTime: now - 86400000 },
            ]);

            // Clear logs older than 7 days
            await clearOldToolExecutionLogs(7);

            const logs = await dexieDB.toolExecutionLogs.toArray();
            expect(logs).toHaveLength(1);
            expect(logs[0].id).toBe('recent-1');
        });
    });
});
