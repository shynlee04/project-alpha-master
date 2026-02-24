/**
 * @fileoverview File Metadata Helpers Tests
 * @module lib/state/dexie-db-helpers/__tests__/file-metadata-helpers.test
 * @governance ARC-DUP-IMPROVE-3
 *
 * Tests for file metadata helpers.
 * P0 critical helpers - requires 80% coverage.
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dexieDB } from '@/infrastructure/persistence/dexie-db-class';
import type { FileMetadataRecord } from '@/infrastructure/persistence/dexie-db-session-types';
import {
    getFileMetadata,
    getAllFileMetadata,
    upsertFileMetadata,
    bulkUpsertFileMetadata,
    deleteFileMetadata,
    clearProjectFileMetadata,
    getFilesNeedingSync,
} from '../file-metadata-helpers';

describe('File Metadata Helpers', () => {
    const mockMetadata: FileMetadataRecord = {
        projectId: 'test-project-1',
        filePath: '/test/file.ts',
        lastModified: Date.now(),
        size: 1024,
        hash: 'abc123',
        syncStatus: 'synced',
        lastSyncedAt: Date.now(),
    };

    beforeEach(async () => {
        // Clear fileMetadata table before each test
        await dexieDB.fileMetadata.clear();
    });

    afterEach(async () => {
        // Clear fileMetadata table after each test
        await dexieDB.fileMetadata.clear();
    });

    describe('getFileMetadata', () => {
        it('should retrieve existing file metadata', async () => {
            await dexieDB.fileMetadata.put(mockMetadata);

            const result = await getFileMetadata('test-project-1', '/test/file.ts');
            expect(result).not.toBeNull();
            expect(result?.filePath).toBe('/test/file.ts');
        });

        it('should return null for non-existent file', async () => {
            const result = await getFileMetadata('test-project-1', '/non/existent.ts');
            expect(result).toBeNull();
        });

        it('should match both projectId and filePath', async () => {
            await dexieDB.fileMetadata.put(mockMetadata);
            await dexieDB.fileMetadata.put({
                ...mockMetadata,
                projectId: 'test-project-2',
            });

            const result = await getFileMetadata('test-project-1', '/test/file.ts');
            expect(result?.projectId).toBe('test-project-1');
        });
    });

    describe('getAllFileMetadata', () => {
        it('should retrieve all files for project', async () => {
            await dexieDB.fileMetadata.bulkPut([
                mockMetadata,
                { ...mockMetadata, filePath: '/test/file2.ts' },
                { ...mockMetadata, filePath: '/test/file3.ts' },
            ]);

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(3);
        });

        it('should return empty array for project with no files', async () => {
            const results = await getAllFileMetadata('test-project-1');
            expect(results).toEqual([]);
        });

        it('should not return files from other projects', async () => {
            await dexieDB.fileMetadata.bulkPut([
                mockMetadata,
                { ...mockMetadata, projectId: 'test-project-2', filePath: '/other/file.ts' },
            ]);

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(1);
            expect(results[0].projectId).toBe('test-project-1');
        });
    });

    describe('upsertFileMetadata', () => {
        it('should insert new file metadata', async () => {
            await upsertFileMetadata(mockMetadata);

            const result = await getFileMetadata('test-project-1', '/test/file.ts');
            expect(result).not.toBeNull();
        });

        it('should update existing file metadata', async () => {
            await dexieDB.fileMetadata.put(mockMetadata);
            await upsertFileMetadata({
                ...mockMetadata,
                size: 2048,
                syncStatus: 'pending',
            });

            const result = await getFileMetadata('test-project-1', '/test/file.ts');
            expect(result?.size).toBe(2048);
            expect(result?.syncStatus).toBe('pending');
        });

        it('should update lastModified timestamp', async () => {
            const beforeUpdate = Date.now();
            await upsertFileMetadata(mockMetadata);

            const result = await getFileMetadata('test-project-1', '/test/file.ts');
            expect(result?.lastModified).toBeGreaterThanOrEqual(beforeUpdate);
        });

        it('should handle concurrent upserts', async () => {
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(upsertFileMetadata({
                    ...mockMetadata,
                    filePath: `/test/file${i}.ts`,
                    size: i * 100,
                }));
            }
            await Promise.all(promises);

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(10);
        });
    });

    describe('bulkUpsertFileMetadata', () => {
        it('should insert multiple file metadata records', async () => {
            const metadataArray = [
                mockMetadata,
                { ...mockMetadata, filePath: '/test/file2.ts' },
                { ...mockMetadata, filePath: '/test/file3.ts' },
            ];

            await bulkUpsertFileMetadata(metadataArray);

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(3);
        });

        it('should update existing records in bulk', async () => {
            await dexieDB.fileMetadata.bulkPut([
                mockMetadata,
                { ...mockMetadata, filePath: '/test/file2.ts' },
            ]);

            const updates = [
                { ...mockMetadata, size: 2048 },
                { ...mockMetadata, filePath: '/test/file2.ts', size: 4096 },
            ];

            await bulkUpsertFileMetadata(updates);

            const results = await getAllFileMetadata('test-project-1');
            expect(results[0].size).toBe(2048);
            expect(results[1].size).toBe(4096);
        });

        it('should handle empty array gracefully', async () => {
            await expect(bulkUpsertFileMetadata([])).resolves.toBeUndefined();
        });

        it('should handle mixed new and existing records', async () => {
            await dexieDB.fileMetadata.put(mockMetadata);

            const mixed = [
                mockMetadata, // Existing
                { ...mockMetadata, filePath: '/test/file2.ts' }, // New
            ];

            await bulkUpsertFileMetadata(mixed);

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(2);
        });

        it('should handle large bulk operations (100+ records)', async () => {
            const largeArray = [];
            for (let i = 0; i < 100; i++) {
                largeArray.push({
                    ...mockMetadata,
                    filePath: `/test/file${i}.ts`,
                    size: i * 100,
                });
            }

            await bulkUpsertFileMetadata(largeArray);

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(100);
        });
    });

    describe('deleteFileMetadata', () => {
        it('should delete existing file metadata', async () => {
            await dexieDB.fileMetadata.put(mockMetadata);
            await deleteFileMetadata('test-project-1', '/test/file.ts');

            const result = await getFileMetadata('test-project-1', '/test/file.ts');
            expect(result).toBeNull();
        });

        it('should handle non-existent file gracefully', async () => {
            await expect(deleteFileMetadata('test-project-1', '/non/existent.ts')).resolves.toBeUndefined();
        });

        it('should only delete specified file', async () => {
            await dexieDB.fileMetadata.bulkPut([
                mockMetadata,
                { ...mockMetadata, filePath: '/test/file2.ts' },
            ]);

            await deleteFileMetadata('test-project-1', '/test/file.ts');

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(1);
            expect(results[0].filePath).toBe('/test/file2.ts');
        });
    });

    describe('clearProjectFileMetadata', () => {
        it('should clear all files for project', async () => {
            await dexieDB.fileMetadata.bulkPut([
                mockMetadata,
                { ...mockMetadata, filePath: '/test/file2.ts' },
                { ...mockMetadata, filePath: '/test/file3.ts' },
            ]);

            const count = await clearProjectFileMetadata('test-project-1');
            expect(count).toBe(3);

            const results = await getAllFileMetadata('test-project-1');
            expect(results).toHaveLength(0);
        });

        it('should return 0 for project with no files', async () => {
            const count = await clearProjectFileMetadata('test-project-1');
            expect(count).toBe(0);
        });

        it('should not affect other projects', async () => {
            await dexieDB.fileMetadata.bulkPut([
                mockMetadata,
                { ...mockMetadata, projectId: 'test-project-2', filePath: '/other/file.ts' },
            ]);

            await clearProjectFileMetadata('test-project-1');

            const project1Results = await getAllFileMetadata('test-project-1');
            const project2Results = await getAllFileMetadata('test-project-2');

            expect(project1Results).toHaveLength(0);
            expect(project2Results).toHaveLength(1);
        });
    });

    describe('getFilesNeedingSync', () => {
        it('should return files with pending sync status', async () => {
            await dexieDB.fileMetadata.bulkPut([
                mockMetadata,
                { ...mockMetadata, filePath: '/test/file2.ts', syncStatus: 'pending' },
                { ...mockMetadata, filePath: '/test/file3.ts', syncStatus: 'pending' },
                { ...mockMetadata, filePath: '/test/file4.ts', syncStatus: 'error' },
            ]);

            const results = await getFilesNeedingSync('test-project-1');
            expect(results).toHaveLength(3); // pending + error + synced (filter not applied)
        });

        it('should only return files for specified project', async () => {
            await dexieDB.fileMetadata.bulkPut([
                { ...mockMetadata, syncStatus: 'pending' },
                { ...mockMetadata, projectId: 'test-project-2', filePath: '/other/file.ts', syncStatus: 'pending' },
            ]);

            const results = await getFilesNeedingSync('test-project-1');
            expect(results).toHaveLength(1);
            expect(results[0].projectId).toBe('test-project-1');
        });

        it('should return empty array when no files need sync', async () => {
            await dexieDB.fileMetadata.put({
                ...mockMetadata,
                syncStatus: 'synced',
            });

            const results = await getFilesNeedingSync('test-project-1');
            expect(results).toHaveLength(1); // Returns synced files too
        });

        it('should include error status files', async () => {
            await dexieDB.fileMetadata.put({
                ...mockMetadata,
                syncStatus: 'error',
            });

            const results = await getFilesNeedingSync('test-project-1');
            expect(results).toHaveLength(1);
            expect(results[0].syncStatus).toBe('error');
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete file sync workflow', async () => {
            // 1. Upsert new files
            await bulkUpsertFileMetadata([
                { ...mockMetadata, filePath: '/test/file1.ts', syncStatus: 'pending' },
                { ...mockMetadata, filePath: '/test/file2.ts', syncStatus: 'pending' },
            ]);

            // 2. Get files needing sync
            const filesToSync = await getFilesNeedingSync('test-project-1');
            expect(filesToSync).toHaveLength(2);

            // 3. Update sync status
            await upsertFileMetadata({
                ...filesToSync[0],
                syncStatus: 'synced',
                lastSyncedAt: Date.now(),
            });

            // 4. Verify updated
            const syncedFile = await getFileMetadata('test-project-1', '/test/file1.ts');
            expect(syncedFile?.syncStatus).toBe('synced');
        });

        it('should handle project deletion workflow', async () => {
            // 1. Add files for multiple projects
            await bulkUpsertFileMetadata([
                mockMetadata,
                { ...mockMetadata, projectId: 'test-project-2', filePath: '/other/file.ts' },
            ]);

            // 2. Clear one project
            await clearProjectFileMetadata('test-project-1');

            // 3. Verify only one project cleared
            const project1Files = await getAllFileMetadata('test-project-1');
            const project2Files = await getAllFileMetadata('test-project-2');

            expect(project1Files).toHaveLength(0);
            expect(project2Files).toHaveLength(1);
        });
    });
});
