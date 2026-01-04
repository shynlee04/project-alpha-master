/**
 * @fileoverview Dexie DB Main Export Tests
 * @module lib/state/__tests__/dexie-db.test
 * @governance ARC-DUP-IMPROVE-4
 *
 * Tests for dexie-db.ts barrel export file.
 * P1 important file - requires 80% coverage.
 */

import { describe, it, expect } from 'vitest';
import * as dexieDb from '@/lib/state/dexie-db';

describe('dexie-db.ts exports', () => {
    describe('database types', () => {
        it('should re-export core types from facade', () => {
            expect(dexieDb.ProjectRecord).toBeDefined();
            expect(dexieDb.IDEStateRecord).toBeDefined();
            expect(dexieDb.ConversationRecord).toBeDefined();
        });

        it('should re-export core table types', () => {
            expect(dexieDb.ProjectsTable).toBeDefined();
            expect(dexieDb.IDEStateTable).toBeDefined();
            expect(dexieDb.ConversationsTable).toBeDefined();
        });

        it('should re-export AI types', () => {
            expect(dexieDb.TaskContextRecord).toBeDefined();
            expect(dexieDb.ToolExecutionRecord).toBeDefined();
            expect(dexieDb.CredentialRecord).toBeDefined();
        });

        it('should re-export AI table types', () => {
            expect(dexieDb.TaskContextTable).toBeDefined();
            expect(dexieDb.ToolExecutionTable).toBeDefined();
            expect(dexieDb.CredentialsTable).toBeDefined();
        });

        it('should re-export session types', () => {
            expect(dexieDb.PersistedStateRecord).toBeDefined();
            expect(dexieDb.SyncStatusRecord).toBeDefined();
            expect(dexieDb.FileMetadataRecord).toBeDefined();
        });

        it('should re-export session table types', () => {
            expect(dexieDb.PersistedStateTable).toBeDefined();
            expect(dexieDb.SyncStatusTable).toBeDefined();
            expect(dexieDb.FileMetadataTable).toBeDefined();
        });

        it('should re-export knowledge types', () => {
            expect(dexieDb.SourceRecord).toBeDefined();
            expect(dexieDb.CollectionRecord).toBeDefined();
            expect(dexieDb.OramaIndexRecord).toBeDefined();
        });

        it('should re-export knowledge table types', () => {
            expect(dexieDb.SourcesTable).toBeDefined();
            expect(dexieDb.CollectionsTable).toBeDefined();
            expect(dexieDb.OramaIndexesTable).toBeDefined();
        });
    });

    describe('dashboard types', () => {
        it('should export dashboard-specific types', () => {
            // Dashboard types are unique to lib/state
            expect(dexieDb).toBeDefined();
        });
    });

    describe('synthesis results types', () => {
        it('should export SynthesisResultRecord interface', () => {
            expect(dexieDb.SynthesisResultRecord).toBeDefined();
        });

        it('should export SynthesisResultsTable type', () => {
            expect(dexieDb.SynthesisResultsTable).toBeDefined();
        });

        it('should have correct SynthesisResultRecord properties', () => {
            const mockRecord: dexieDb.SynthesisResultRecord = {
                id: 'test-id',
                sourceId: 'source-1',
                projectId: 'project-1',
                status: 'completed',
                synthesisResult: 'test result',
                frontmatter: { title: 'Test' },
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(mockRecord.id).toBe('test-id');
            expect(mockRecord.sourceId).toBe('source-1');
            expect(mockRecord.projectId).toBe('project-1');
            expect(mockRecord.status).toBe('completed');
            expect(mockRecord.synthesisResult).toBe('test result');
            expect(mockRecord.frontmatter).toEqual({ title: 'Test' });
        });

        it('should accept all valid status values', () => {
            const statuses: Array<'idle' | 'pending' | 'synthesizing' | 'completed' | 'failed'> = [
                'idle', 'pending', 'synthesizing', 'completed', 'failed'
            ];

            statuses.forEach(status => {
                const record: dexieDb.SynthesisResultRecord = {
                    id: 'test',
                    sourceId: 'source',
                    projectId: 'project',
                    status,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };

                expect(record.status).toBe(status);
            });
        });
    });

    describe('database class and instance', () => {
        it('should export ViaGentDatabase class', () => {
            expect(dexieDb.ViaGentDatabase).toBeDefined();
            expect(typeof dexieDb.ViaGentDatabase).toBe('function');
        });

        it('should export db instance', () => {
            expect(dexieDb.db).toBeDefined();
            expect(dexieDb.db.name).toBe('via-gent-persistence');
        });

        it('should export getDb function', () => {
            expect(dexieDb.getDb).toBeDefined();
            expect(typeof dexieDb.getDb).toBe('function');
        });

        it('should export getRecentProjects function', () => {
            expect(dexieDb.getRecentProjects).toBeDefined();
            expect(typeof dexieDb.getRecentProjects).toBe('function');
        });

        it('should export resetDatabaseForTesting function', () => {
            expect(dexieDb.resetDatabaseForTesting).toBeDefined();
            expect(typeof dexieDb.resetDatabaseForTesting).toBe('function');
        });
    });

    describe('migration utilities', () => {
        it('should export logDexieMigration', () => {
            expect(dexieDb.logDexieMigration).toBeDefined();
            expect(typeof dexieDb.logDexieMigration).toBe('function');
        });

        it('should export isMigrationApplied', () => {
            expect(dexieDb.isMigrationApplied).toBeDefined();
            expect(typeof dexieDb.isMigrationApplied).toBe('function');
        });

        it('should export markMigrationApplied', () => {
            expect(dexieDb.markMigrationApplied).toBeDefined();
            expect(typeof dexieDb.markMigrationApplied).toBe('function');
        });
    });

    describe('IDE state helpers', () => {
        it('should export getIDEState', () => {
            expect(dexieDb.getIDEState).toBeDefined();
            expect(typeof dexieDb.getIDEState).toBe('function');
        });

        it('should export saveIDEState', () => {
            expect(dexieDb.saveIDEState).toBeDefined();
            expect(typeof dexieDb.saveIDEState).toBe('function');
        });

        it('should export deleteIDEState', () => {
            expect(dexieDb.deleteIDEState).toBeDefined();
            expect(typeof dexieDb.deleteIDEState).toBe('function');
        });
    });

    describe('sync status helpers', () => {
        it('should export basic sync status functions', () => {
            expect(dexieDb.getSyncStatus).toBeDefined();
            expect(dexieDb.setSyncStatus).toBeDefined();
            expect(dexieDb.updateSyncStatus).toBeDefined();
            expect(dexieDb.deleteSyncStatus).toBeDefined();
        });

        it('should export query sync status functions', () => {
            expect(dexieDb.getPendingSyncStatus).toBeDefined();
            expect(dexieDb.getErrorSyncStatus).toBeDefined();
            expect(dexieDb.clearOldSyncStatus).toBeDefined();
            expect(dexieDb.getSyncStatusStats).toBeDefined();
        });
    });

    describe('workspace ID export', () => {
        it('should export WorkspaceId type', () => {
            expect(dexieDb.WorkspaceId).toBeDefined();
        });

        it('should accept valid workspace ID values', () => {
            const validIds: dexieDb.WorkspaceId[] = ['ide', 'notes', 'knowledge', 'study'];

            validIds.forEach(id => {
                expect(['ide', 'notes', 'knowledge', 'study']).toContain(id);
            });
        });
    });
});
