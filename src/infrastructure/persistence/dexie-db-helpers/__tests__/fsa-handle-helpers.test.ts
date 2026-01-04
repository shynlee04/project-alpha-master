/**
 * @fileoverview FSA Handle Helpers Tests
 * @module lib/state/dexie-db-helpers/__tests__/fsa-handle-helpers.test
 * @governance ARC-DUP-IMPROVE-3
 *
 * Tests for FSA (File System Access) handle helpers.
 * P0 critical helpers - requires 80% coverage.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dexieDB } from '@/infrastructure/persistence/dexie-db-class';
import type { FSAHandleRecord } from '@/infrastructure/persistence/dexie-db-session-types';
import {
    storeFSAHandle,
    getFSAHandle,
    updateFSAHandleStatus,
    updateFSAHandlePermission,
    deleteFSAHandle,
    clearAllFSAHandles,
    getAllValidFSAHandles,
} from '../fsa-handle-helpers';

describe('FSA Handle Helpers', () => {
    const mockHandle: FSAHandleRecord = {
        projectId: 'test-project-1',
        handle: null as unknown as FileSystemFileHandle, // Mock handle
        permissionStatus: 'granted',
        lastAccessed: Date.now(),
        expiresAt: Date.now() + 3600000, // 1 hour from now
    };

    beforeEach(async () => {
        // Clear fsaHandles table before each test
        await dexieDB.fsaHandles.clear();
    });

    afterEach(async () => {
        // Clear fsaHandles table after each test
        await dexieDB.fsaHandles.clear();
    });

    describe('storeFSAHandle', () => {
        it('should store FSA handle in database', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);

            const result = await getFSAHandle('test-project-1');
            expect(result).not.toBeNull();
            expect(result?.projectId).toBe('test-project-1');
        });

        it('should update existing handle', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);

            const count = await dexieDB.fsaHandles.where('projectId').equals('test-project-1').count();
            expect(count).toBe(1); // Should update, not duplicate
        });

        it('should set initial permission status to granted', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);

            const result = await getFSAHandle('test-project-1');
            expect(result?.permissionStatus).toBe('granted');
        });

        it('should set expiration time correctly', async () => {
            const beforeStore = Date.now();
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            const afterStore = Date.now();

            const result = await getFSAHandle('test-project-1');
            expect(result?.expiresAt).toBeGreaterThanOrEqual(beforeStore + 3600000);
            expect(result?.expiresAt).toBeLessThanOrEqual(afterStore + 3600000);
        });
    });

    describe('getFSAHandle', () => {
        it('should retrieve existing FSA handle', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);

            const result = await getFSAHandle('test-project-1');
            expect(result).not.toBeNull();
            expect(result?.projectId).toBe('test-project-1');
        });

        it('should return null for non-existent handle', async () => {
            const result = await getFSAHandle('non-existent');
            expect(result).toBeNull();
        });

        it('should update lastAccessed timestamp on retrieval', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            const firstResult = await getFSAHandle('test-project-1');
            const firstAccessed = firstResult?.lastAccessed;

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 10));

            await getFSAHandle('test-project-1');
            const secondResult = await getFSAHandle('test-project-1');
            const secondAccessed = secondResult?.lastAccessed;

            expect(secondAccessed).toBeGreaterThan(firstAccessed || 0);
        });

        it('should return null for expired handles', async () => {
            const expiredHandle: FSAHandleRecord = {
                ...mockHandle,
                expiresAt: Date.now() - 1000, // Expired 1 second ago
            };
            await dexieDB.fsaHandles.put(expiredHandle);

            const result = await getFSAHandle('test-project-1');
            expect(result).toBeNull();
        });
    });

    describe('updateFSAHandleStatus', () => {
        it('should update permission status', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await updateFSAHandleStatus('test-project-1', 'denied');

            const result = await getFSAHandle('test-project-1');
            expect(result?.permissionStatus).toBe('denied');
        });

        it('should handle non-existent handle gracefully', async () => {
            await expect(updateFSAHandleStatus('non-existent', 'denied')).resolves.toBeUndefined();
        });

        it('should update expired_at timestamp when status is denied', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            const beforeUpdate = Date.now();
            await updateFSAHandleStatus('test-project-1', 'denied');

            const result = await getFSAHandle('test-project-1');
            expect(result?.expiresAt).toBeLessThan(beforeUpdate); // Should shorten expiration
        });

        it('should handle all status values', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);

            const statuses: Array<'granted' | 'denied' | 'prompt'> = ['granted', 'denied', 'prompt'];
            for (const status of statuses) {
                await updateFSAHandleStatus('test-project-1', status);
                const result = await getFSAHandle('test-project-1');
                expect(result?.permissionStatus).toBe(status);
            }
        });
    });

    describe('updateFSAHandlePermission', () => {
        it('should update permission status to granted', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await dexieDB.fsaHandles.update('test-project-1', { permissionStatus: 'denied' });

            await updateFSAHandlePermission('test-project-1', true);

            const result = await getFSAHandle('test-project-1');
            expect(result?.permissionStatus).toBe('granted');
        });

        it('should update permission status to denied', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await updateFSAHandlePermission('test-project-1', false);

            const result = await getFSAHandle('test-project-1');
            expect(result?.permissionStatus).toBe('denied');
        });

        it('should handle non-existent handle gracefully', async () => {
            await expect(updateFSAHandlePermission('non-existent', true)).resolves.toBeUndefined();
        });

        it('should update expiration when granted', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await dexieDB.fsaHandles.update('test-project-1', { permissionStatus: 'denied' });

            await updateFSAHandlePermission('test-project-1', true);

            const result = await getFSAHandle('test-project-1');
            expect(result?.expiresAt).toBeGreaterThan(Date.now());
        });
    });

    describe('deleteFSAHandle', () => {
        it('should delete existing handle', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await deleteFSAHandle('test-project-1');

            const result = await getFSAHandle('test-project-1');
            expect(result).toBeNull();
        });

        it('should handle non-existent handle gracefully', async () => {
            await expect(deleteFSAHandle('non-existent')).resolves.toBeUndefined();
        });

        it('should only delete specified project handle', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await storeFSAHandle('test-project-2', mockHandle.handle as FileSystemFileHandle);

            await deleteFSAHandle('test-project-1');

            expect(await getFSAHandle('test-project-1')).toBeNull();
            expect(await getFSAHandle('test-project-2')).not.toBeNull();
        });
    });

    describe('clearAllFSAHandles', () => {
        it('should clear all handles', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await storeFSAHandle('test-project-2', mockHandle.handle as FileSystemFileHandle);
            await storeFSAHandle('test-project-3', mockHandle.handle as FileSystemFileHandle);

            await clearAllFSAHandles();

            const count = await dexieDB.fsaHandles.count();
            expect(count).toBe(0);
        });

        it('should handle empty database gracefully', async () => {
            await expect(clearAllFSAHandles()).resolves.toBeUndefined();
        });
    });

    describe('getAllValidFSAHandles', () => {
        it('should return all non-expired handles', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            await storeFSAHandle('test-project-2', mockHandle.handle as FileSystemFileHandle);

            const handles = await getAllValidFSAHandles();
            expect(handles).toHaveLength(2);
        });

        it('should exclude expired handles', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);

            const expiredHandle: FSAHandleRecord = {
                ...mockHandle,
                projectId: 'test-project-2',
                expiresAt: Date.now() - 1000, // Expired
            };
            await dexieDB.fsaHandles.put(expiredHandle);

            const handles = await getAllValidFSAHandles();
            expect(handles).toHaveLength(1);
            expect(handles[0].projectId).toBe('test-project-1');
        });

        it('should exclude denied handles', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);

            const deniedHandle: FSAHandleRecord = {
                ...mockHandle,
                projectId: 'test-project-2',
                permissionStatus: 'denied',
            };
            await dexieDB.fsaHandles.put(deniedHandle);

            const handles = await getAllValidFSAHandles();
            expect(handles).toHaveLength(1);
            expect(handles[0].projectId).toBe('test-project-1');
        });

        it('should return empty array when no handles exist', async () => {
            const handles = await getAllValidFSAHandles();
            expect(handles).toEqual([]);
        });

        it('should update lastAccessed for retrieved handles', async () => {
            await storeFSAHandle('test-project-1', mockHandle.handle as FileSystemFileHandle);
            const firstAccessed = (await getFSAHandle('test-project-1'))?.lastAccessed;

            await new Promise(resolve => setTimeout(resolve, 10));
            await getAllValidFSAHandles();

            const secondAccessed = (await getFSAHandle('test-project-1'))?.lastAccessed;
            expect(secondAccessed).toBeGreaterThan(firstAccessed || 0);
        });
    });
});
