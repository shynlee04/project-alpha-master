/**
 * Unit tests for unified persistence DB with IdbCompatWrapper.
 *
 * Story 5-1: Set Up IndexedDB Schema (Original)
 * Story 27-1c: Migrated to Dexie.js with IdbCompatWrapper
 * 
 * @governance EPIC-27-1c
 */

// Import fake-indexeddb polyfill BEFORE any module imports
import 'fake-indexeddb/auto';

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    getPersistenceDB,
    _resetPersistenceDBForTesting,
    PERSISTENCE_DB_NAME,
    PERSISTENCE_DB_VERSION,
} from '../db';

describe('PersistenceDB - IdbCompatWrapper', () => {
    beforeEach(async () => {
        await _resetPersistenceDBForTesting();
    });

    afterEach(async () => {
        await _resetPersistenceDBForTesting();
    });

    describe('initialization', () => {
        it('returns wrapper instance', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();
        });

        it('exports correct DB constants', () => {
            expect(PERSISTENCE_DB_NAME).toBe('via-gent-persistence');
            expect(PERSISTENCE_DB_VERSION).toBe(3);
        });

        it('objectStoreNames.contains() works for valid stores', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            expect(db!.objectStoreNames.contains('projects')).toBe(true);
            expect(db!.objectStoreNames.contains('conversations')).toBe(true);
            expect(db!.objectStoreNames.contains('ideState')).toBe(true);
            expect(db!.objectStoreNames.contains('taskContexts')).toBe(true);
            expect(db!.objectStoreNames.contains('toolExecutions')).toBe(true);
            expect(db!.objectStoreNames.contains('nonexistent')).toBe(false);
        });
    });

    describe('CRUD operations - projects', () => {
        const testProject = {
            id: 'test-project-1',
            name: 'Test Project',
            folderPath: '/test/path',
            lastOpened: new Date(),
            // Note: fsaHandle cannot be mocked easily, so we test without it
        };

        it('put() stores a record', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            const key = await db!.put('projects', testProject);
            expect(key).toBe('test-project-1');
        });

        it('get() retrieves a stored record', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            await db!.put('projects', testProject);
            const retrieved = await db!.get<typeof testProject>('projects', 'test-project-1');

            expect(retrieved).not.toBeUndefined();
            expect(retrieved?.name).toBe('Test Project');
        });

        it('get() returns undefined for non-existent key', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            const result = await db!.get('projects', 'non-existent');
            expect(result).toBeUndefined();
        });

        it('getAll() returns all records', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            await db!.put('projects', testProject);
            await db!.put('projects', { ...testProject, id: 'test-project-2', name: 'Project 2' });

            const all = await db!.getAll<typeof testProject>('projects');
            expect(all).toHaveLength(2);
        });

        it('delete() removes a record', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            await db!.put('projects', testProject);
            await db!.delete('projects', 'test-project-1');

            const result = await db!.get('projects', 'test-project-1');
            expect(result).toBeUndefined();
        });

        it('count() returns record count', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            expect(await db!.count('projects')).toBe(0);

            await db!.put('projects', testProject);
            expect(await db!.count('projects')).toBe(1);
        });

        it('clear() removes all records', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            await db!.put('projects', testProject);
            await db!.put('projects', { ...testProject, id: 'test-project-2' });

            expect(await db!.count('projects')).toBe(2);

            await db!.clear('projects');
            expect(await db!.count('projects')).toBe(0);
        });
    });

    describe('CRUD operations - ideState', () => {
        const testIdeState = {
            projectId: 'project-1',
            openFiles: ['/src/index.ts'],
            activeFile: '/src/index.ts',
            updatedAt: new Date(),
        };

        it('stores and retrieves IDE state', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            await db!.put('ideState', testIdeState);
            const retrieved = await db!.get<typeof testIdeState>('ideState', 'project-1');

            expect(retrieved?.openFiles).toEqual(['/src/index.ts']);
        });
    });

    describe('deprecated transaction API', () => {
        it('transaction() logs warning and returns stub', async () => {
            const db = await getPersistenceDB();
            expect(db).not.toBeNull();

            // Should not throw, but warn
            const tx = db!.transaction('projects', 'readonly');
            expect(tx).toBeDefined();
            expect(tx.done).toBeInstanceOf(Promise);
        });
    });
});
