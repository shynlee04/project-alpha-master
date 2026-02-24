/**
 * @fileoverview Dexie DB Class Tests
 * @module infrastructure/persistence/__tests__/dexie-db-class.test
 * @governance ARC-DUP-IMPROVE-4
 *
 * Tests for ViaGentDatabase class definition.
 * P1 important file - requires 80% coverage.
 */

import { describe, it, expect } from 'vitest';
import { ViaGentDatabase, dexieDB } from '@/infrastructure/persistence/dexie-db-class';

describe('ViaGentDatabase', () => {
    describe('database initialization', () => {
        it('should create database instance', () => {
            expect(dexieDB).toBeInstanceOf(ViaGentDatabase);
        });

        it('should have correct database name', () => {
            expect(dexieDB.name).toBe('via-gent-persistence');
        });

        it('should be open', () => {
            expect(dexieDB.isOpen).toBe(true);
        });
    });

    describe('core tables', () => {
        it('should have projects table', () => {
            expect(dexieDB.projects).toBeDefined();
        });

        it('should have ideState table', () => {
            expect(dexieDB.ideState).toBeDefined();
        });

        it('should have conversations table', () => {
            expect(dexieDB.conversations).toBeDefined();
        });
    });

    describe('AI foundation tables', () => {
        it('should have taskContexts table', () => {
            expect(dexieDB.taskContexts).toBeDefined();
        });

        it('should have toolExecutions table', () => {
            expect(dexieDB.toolExecutions).toBeDefined();
        });

        it('should have credentials table', () => {
            expect(dexieDB.credentials).toBeDefined();
        });

        it('should have threads table', () => {
            expect(dexieDB.threads).toBeDefined();
        });
    });

    describe('state persistence tables', () => {
        it('should have providerConfigs table', () => {
            expect(dexieDB.providerConfigs).toBeDefined();
        });

        it('should have agentConfigs table', () => {
            expect(dexieDB.agentConfigs).toBeDefined();
        });

        it('should have conversationState table', () => {
            expect(dexieDB.conversationState).toBeDefined();
        });
    });

    describe('sync status tables', () => {
        it('should have syncStatus table', () => {
            expect(dexieDB.syncStatus).toBeDefined();
        });

        it('should have fileSyncStatus table', () => {
            expect(dexieDB.fileSyncStatus).toBeDefined();
        });
    });

    describe('performance tables', () => {
        it('should have fileMetadata table', () => {
            expect(dexieDB.fileMetadata).toBeDefined();
        });

        it('should have toolExecutionLogs table', () => {
            expect(dexieDB.toolExecutionLogs).toBeDefined();
        });

        it('should have fsaHandles table', () => {
            expect(dexieDB.fsaHandles).toBeDefined();
        });

        it('should have sessionSnapshots table', () => {
            expect(dexieDB.sessionSnapshots).toBeDefined();
        });
    });

    describe('file snapshot tables', () => {
        it('should have fileSnapshots table', () => {
            expect(dexieDB.fileSnapshots).toBeDefined();
        });

        it('should have fileContentCache table', () => {
            expect(dexieDB.fileContentCache).toBeDefined();
        });
    });

    describe('knowledge tables', () => {
        it('should have sources table', () => {
            expect(dexieDB.sources).toBeDefined();
        });

        it('should have collections table', () => {
            expect(dexieDB.collections).toBeDefined();
        });

        it('should have synthesisResults table', () => {
            expect(dexieDB.synthesisResults).toBeDefined();
        });
    });

    describe('RAG infrastructure tables', () => {
        it('should have oramaIndexes table', () => {
            expect(dexieDB.oramaIndexes).toBeDefined();
        });

        it('should have embedding_models table', () => {
            expect(dexieDB.embedding_models).toBeDefined();
        });
    });

    describe('notes tables', () => {
        it('should have notes table', () => {
            expect(dexieDB.notes).toBeDefined();
        });
    });

    describe('table count', () => {
        it('should have all expected tables', () => {
            const expectedTables = [
                'projects', 'ideState', 'conversations',
                'taskContexts', 'toolExecutions', 'credentials', 'threads',
                'providerConfigs', 'agentConfigs', 'conversationState',
                'syncStatus', 'fileSyncStatus',
                'fileMetadata', 'toolExecutionLogs', 'fsaHandles', 'sessionSnapshots',
                'fileSnapshots', 'fileContentCache',
                'sources', 'collections', 'synthesisResults',
                'oramaIndexes', 'embedding_models',
                'notes',
            ];

            expectedTables.forEach(tableName => {
                expect(dexieDB.tables.some(t => t.name === tableName)).toBe(true);
            });
        });

        it('should have 24 tables total', () => {
            expect(dexieDB.tables.length).toBe(24);
        });
    });

    describe('singleton instance', () => {
        it('should export singleton instance', () => {
            expect(dexieDB).toBeInstanceOf(ViaGentDatabase);
        });

        it('should return same instance on multiple imports', async () => {
            const { dexieDB: db1 } = await import('@/infrastructure/persistence/dexie-db-class');
            const { dexieDB: db2 } = await import('@/infrastructure/persistence/dexie-db-class');

            expect(db1).toBe(db2);
        });
    });
});
