/**
 * @fileoverview Dexie Database Migrations
 * @module lib/state/dexie-db-migrations
 * @governance EPIC-27-1c
 *
 * All schema version migrations for ViaGentDatabase.
 * Extracted from dexie-db.ts for better code organization.
 *
 * Story 27-1: State Architecture Stabilization
 * Story 27-1c: Persistence Migration (idb → Dexie)
 */

import type { ViaGentDatabase } from './dexie-db-class';
// import type { SyncStatusRecord } from './dexie-db-session-types';
// import { queueItemToSyncStatus } from './dexie-db-helpers';

// ============================================================================
// Migration Logging (RC-011)
// ============================================================================

/**
 * Log a Dexie migration event for audit trail
 */
export function logDexieMigration(
    version: number,
    operation: string,
    status: 'started' | 'completed' | 'failed',
    details?: { tableName?: string; itemsCount?: number; error?: string }
): void {
    const entry = {
        timestamp: Date.now(),
        type: 'dexie-migration',
        version,
        operation,
        status,
        ...details,
    };

    if (status === 'failed') {
        console.error('[Dexie Migration]', JSON.stringify(entry, null, 2));
    } else {
        console.log('[Dexie Migration]', JSON.stringify(entry, null, 2));
    }
}

/**
 * Check if a migration has already been applied
 */
export function isMigrationApplied(version: number): boolean {
    if (typeof localStorage === 'undefined') return false;

    try {
        const appliedKey = `dexie-migration-v${version}-applied`;
        return localStorage.getItem(appliedKey) === 'true';
    } catch {
        return false;
    }
}

/**
 * Mark a migration as applied
 */
export function markMigrationApplied(version: number): void {
    if (typeof localStorage === 'undefined') return;

    try {
        const appliedKey = `dexie-migration-v${version}-applied`;
        localStorage.setItem(appliedKey, 'true');
    } catch {
        // Ignore storage errors
    }
}

// ============================================================================
// Migration Registration
// ============================================================================

/**
 * Register all migrations with the database instance.
 * This function is called from the ViaGentDatabase constructor.
 */
export function registerMigrations(db: ViaGentDatabase): void {
        db.version(1).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
        });

        // Schema version 2: No schema change, just standardization
        db.version(2).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v2 (standardization)');
        });

        // Schema version 3: Add AI Foundation tables (Epic 25 prep)
        // Added in Story 27-1c for forward compatibility
        db.version(3).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            // AI agent task tracking
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            // AI tool execution audit trail
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v3 (AI Foundation tables)');
        });

        // Schema version 4: Add credentials table (Story 25-0)
        // For encrypted API key storage in CredentialVault
        db.version(4).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            // Encrypted API credentials for AI providers
            credentials: 'providerId, createdAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v4 (credentials table)');
        });

        // Schema version 5: Add conversation threads table (MVP-2)
        // For persistent thread storage with indexing support
        db.version(5).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            // Conversation threads for chat interface
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v5 (conversation threads)');
        });

        // Schema version 6: Add providerConfigs table (Epic 25)
        // For Zustand store persistence
        db.version(6).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            // Generic state persistence
            providerConfigs: 'id, updatedAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v6 (provider configs)');
        });

        // Schema version 7: Add agentConfigs + conversationState tables (Story 2.1)
        // For unified state management with Zustand + Dexie
        db.version(7).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            // Agent configuration persistence (Story 2.1)
            agentConfigs: 'id, updatedAt',
            // Conversation state persistence (Story 2.1)
            conversationState: 'id, updatedAt',
        }).upgrade(async () => {
            console.log('[Dexie] Running migration to v7 (agent configs + conversation state)');
        });

        // Schema version 8: Add syncStatus table (RC-005 - Sprint 27B)
        // Migrates SyncStatusStore from localStorage to Dexie
        db.version(8).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            // Sync status table with indexes for efficient queries
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
        }).upgrade(async (tx) => {
            logDexieMigration(8, 'sync-status-migration', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(8)) {
                logDexieMigration(8, 'sync-status-migration', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // Migrate data from localStorage if exists
            let itemsMigrated = 0;
            try {
                const localStorageData = localStorage.getItem('sync-status-store');
                if (localStorageData) {
                    const parsed = JSON.parse(localStorageData);
                    const state = parsed.state || parsed;
                    const queue = state.queue || [];

                    if (Array.isArray(queue) && queue.length > 0) {
                        const syncStatusTable = tx.table('syncStatus');
                        const now = Date.now();

                        for (const item of queue) {
                            if (item.status !== 'completed') {
                                await syncStatusTable.put({
                                    id: item.id || `sync-${item.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
                                    path: item.path,
                                    syncStatus: item.status === 'pending' ? 'pending' :
                                        item.status === 'active' ? 'syncing' :
                                            item.status === 'failed' ? 'error' : 'synced',
                                    errorMessage: item.error,
                                    retryCount: item.status === 'failed' ? 1 : 0,
                                    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : now,
                                    updatedAt: now,
                                });
                                itemsMigrated++;
                            }
                        }
                    }
                }

                // Mark migration as applied
                markMigrationApplied(8);

                logDexieMigration(8, 'sync-status-migration', 'completed', {
                    tableName: 'syncStatus',
                    itemsCount: itemsMigrated
                });
            } catch (error) {
                logDexieMigration(8, 'sync-status-migration', 'failed', {
                    tableName: 'syncStatus',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });

        // Schema version 9: Epic 24 - Performance & UX Optimization
        // Adds tables for incremental sync, tool context, FSA handles, and session snapshots
        db.version(9).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            // NEW: Epic 24 tables
            // Story 24-1: File metadata cache for incremental sync
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            // Story 24-4: Tool execution logs for context persistence
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            // Story 24-2: FSA handle persistence for instant re-grant
            fsaHandles: 'projectId, lastAccessedAt',
            // Story 24-5: Session snapshots for complete restoration
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
        }).upgrade(async () => {
            logDexieMigration(9, 'epic-24-schema', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(9)) {
                logDexieMigration(9, 'epic-24-schema', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - tables are new
            // Mark migration as applied
            markMigrationApplied(9);

            logDexieMigration(9, 'epic-24-schema', 'completed', {
                tableName: 'fileMetadata, toolExecutionLogs, fsaHandles, sessionSnapshots',
                itemsCount: 0
            });
        });

        // Schema version 10: Add fileSyncStatus table for Zustand store persistence
        // CC-2025-12-29: File sync status was not persisting because table was missing
        db.version(10).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            // NEW: File sync status store persistence (CC-2025-12-29)
            fileSyncStatus: 'id, updatedAt',
        }).upgrade(async () => {
            logDexieMigration(10, 'file-sync-status-store', 'started');
            markMigrationApplied(10);
            logDexieMigration(10, 'file-sync-status-store', 'completed', {
                tableName: 'fileSyncStatus',
                itemsCount: 0
            });
        });

        // Schema version 11: Epic 6 - Source Ingestion & Management
        // Adds sources table for PDF, URL, and text imports
        db.version(11).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            // NEW: Sources table for knowledge base content (Story 6-1)
            sources: 'id, projectId, type, createdAt, [projectId+type], [projectId+createdAt]',
        }).upgrade(async () => {
            logDexieMigration(11, 'epic-6-source-ingestion', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(11)) {
                logDexieMigration(11, 'epic-6-source-ingestion', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(11);

            logDexieMigration(11, 'epic-6-source-ingestion', 'completed', {
                tableName: 'sources',
                itemsCount: 0
            });
        });

        // Schema version 12: Epic 6 - Source Management
        // Adds collections table and extends sources with soft delete
        db.version(12).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            // UPDATED: Sources table with soft delete support (Story 6-3)
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            // NEW: Collections table for organizing sources (Story 6-3)
            collections: 'id, projectId, name, createdAt, [projectId+name]',
        }).upgrade(async () => {
            logDexieMigration(12, 'epic-6-source-management', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(12)) {
                logDexieMigration(12, 'epic-6-source-management', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(12);

            logDexieMigration(12, 'epic-6-source-management', 'completed', {
                tableName: 'collections',
                itemsCount: 0
            });
        });

        // Schema version 13: Epic 7 - RAG Infrastructure (Orama WASM)
        // Adds oramaIndexes table for Orama search index persistence
        db.version(13).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, name, createdAt, [projectId+name]',
            // NEW: Orama indexes table for RAG search (Story 7-1)
            oramaIndexes: 'projectId, lastUpdated, schemaVersion',
        }).upgrade(async () => {
            logDexieMigration(13, 'epic-7-orama-indexes', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(13)) {
                logDexieMigration(13, 'epic-7-orama-indexes', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(13);

            logDexieMigration(13, 'epic-7-orama-indexes', 'completed', {
                tableName: 'oramaIndexes',
                itemsCount: 0
            });
        });

        // Schema version 14: Add embedding models table (Story 7-3)
        db.version(14).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, name, createdAt, [projectId+name]',
            oramaIndexes: 'projectId, lastUpdated, schemaVersion',
            // NEW: Embedding models table for local semantic search (Story 7-3)
            embedding_models: 'modelId, name, version, quantization, downloadedAt',
        }).upgrade(async () => {
            logDexieMigration(14, 'epic-7-3-embedding-models', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(14)) {
                logDexieMigration(14, 'epic-7-3-embedding-models', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(14);

            logDexieMigration(14, 'epic-7-3-embedding-models', 'completed', {
                tableName: 'embedding_models',
                itemsCount: 0
            });
        });

        // Schema version 15: Epic 26 - Intelligent Knowledge Base (Notes)
        // Adds notes table for BlockNote editor with hierarchical organization
        db.version(15).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, name, createdAt, [projectId+name]',
            oramaIndexes: 'projectId, lastUpdated, schemaVersion',
            embedding_models: 'modelId, name, version, quantization, downloadedAt',
            // NEW: Notes table for BlockNote editor (Story 26-1)
            notes: 'id, projectId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',
        }).upgrade(async () => {
            logDexieMigration(15, 'epic-26-notes', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(15)) {
                logDexieMigration(15, 'epic-26-notes', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(15);

            logDexieMigration(15, 'epic-26-notes', 'completed', {
                tableName: 'notes',
                itemsCount: 0
            });
        });

        // Schema version 16: KSI Module - Synthesis Results
        // Adds synthesisResults table for AI-generated knowledge frontmatter
        db.version(16).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, name, createdAt, [projectId+name]',
            oramaIndexes: 'projectId, lastUpdated, schemaVersion',
            embedding_models: 'modelId, name, version, quantization, downloadedAt',
            notes: 'id, projectId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',
            // NEW: Synthesis results table for AI-generated frontmatter (KSI Module)
            synthesisResults: 'id, sourceId, projectId, status, synthesizedAt, [sourceId+projectId], [projectId+status]',
        }).upgrade(async () => {
            logDexieMigration(16, 'ksi-synthesis-results', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(16)) {
                logDexieMigration(16, 'ksi-synthesis-results', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(16);

            logDexieMigration(16, 'ksi-synthesis-results', 'completed', {
                tableName: 'synthesisResults',
                itemsCount: 0
            });
        });

        // Schema version 17: Story WB-1 - Project Metadata Enhancement
        // Adds workspaceBindings and fileSnapshotEnabled fields to projects table
        db.version(17).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, name, createdAt, [projectId+name]',
            oramaIndexes: 'projectId, lastUpdated, schemaVersion',
            embedding_models: 'modelId, name, version, quantization, downloadedAt',
            notes: 'id, projectId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',
            synthesisResults: 'id, sourceId, projectId, status, synthesizedAt, [sourceId+projectId], [projectId+status]',
        }).upgrade(async (tx) => {
            logDexieMigration(17, 'project-metadata-enhancement', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(17)) {
                logDexieMigration(17, 'project-metadata-enhancement', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // Default values for migration
            const DEFAULT_WORKSPACE_BINDINGS = {
                ide: true,
                notes: false,
                knowledge: false,
                study: false,
            };
            const DEFAULT_FILE_SNAPSHOT_ENABLED = false;

            // Migrate existing projects
            let migratedCount = 0;
            const projectsTable = tx.table('projects');

            await projectsTable.toCollection().modify((project) => {
                // Only add fields if they don't exist
                if (!project.workspaceBindings) {
                    project.workspaceBindings = DEFAULT_WORKSPACE_BINDINGS;
                }
                if (project.fileSnapshotEnabled === undefined) {
                    project.fileSnapshotEnabled = DEFAULT_FILE_SNAPSHOT_ENABLED;
                }
                migratedCount++;
            });

            // Mark migration as applied
            markMigrationApplied(17);

            logDexieMigration(17, 'project-metadata-enhancement', 'completed', {
                tableName: 'projects',
                itemsCount: migratedCount
            });
        });

        // Schema version 18: Story WB-2 - File Snapshot Store
        // Adds fileSnapshots and fileContentCache tables for instant file tree loads
        db.version(18).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, name, createdAt, [projectId+name]',
            oramaIndexes: 'projectId, lastUpdated, schemaVersion',
            embedding_models: 'modelId, name, version, quantization, downloadedAt',
            notes: 'id, projectId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',
            synthesisResults: 'id, sourceId, projectId, status, synthesizedAt, [sourceId+projectId], [projectId+status]',
            // Story WB-2: File snapshot tables (two-table architecture for lazy loading)
            fileSnapshots: '++id, projectId, path, [projectId+path], expiresAt, lastCachedAt',
            fileContentCache: '[projectId+path], projectId',
        }).upgrade(async () => {
            logDexieMigration(18, 'file-snapshot-store', 'completed', {
                details: 'Added fileSnapshots and fileContentCache tables'
            });
        });

        // Schema version 19: Story AC-1.7 - Single Bounded Store (Unified App Store)
        // Adds appState table for Zustand persist middleware with Dexie storage
        // This table stores the combined agent + provider state from use-app-store.ts
        db.version(19).stores({
            projects: 'id, lastOpened, name',
            ideState: 'projectId, updatedAt',
            conversations: 'id, projectId, updatedAt',
            taskContexts: 'id, projectId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, toolName, status, [taskId+status]',
            credentials: 'providerId, createdAt',
            threads: 'id, projectId, updatedAt, [projectId+updatedAt]',
            providerConfigs: 'id, updatedAt',
            agentConfigs: 'id, updatedAt',
            conversationState: 'id, updatedAt',
            syncStatus: 'id, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileMetadata: '[projectId+path], projectId, lastModified, syncedAt',
            toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, createdAt, expiresAt, [projectId+createdAt]',
            fileSyncStatus: 'id, updatedAt',
            sources: 'id, projectId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, name, createdAt, [projectId+name]',
            oramaIndexes: 'projectId, lastUpdated, schemaVersion',
            embedding_models: 'modelId, name, version, quantization, downloadedAt',
            notes: 'id, projectId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',
            synthesisResults: 'id, sourceId, projectId, status, synthesizedAt, [sourceId+projectId], [projectId+status]',
            fileSnapshots: '++id, projectId, path, [projectId+path], expiresAt, lastCachedAt',
            fileContentCache: '[projectId+path], projectId',
            // Story AC-1.7: Unified app state table (combines agents + providers)
            appState: 'id, updatedAt',
        }).upgrade(async () => {
            logDexieMigration(19, 'single-bounded-store', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(19)) {
                logDexieMigration(19, 'single-bounded-store', 'completed', {
                    details: 'Already applied, skipping'
                });
                return;
            }

            // Migrate data from agentConfigs and providerConfigs to appState
            const agentData = await db.agentConfigs.toArray();
            const providerData = await db.providerConfigs.toArray();

            // Merge agent and provider state
            const mergedState = {
                ...(agentData[0]?.state || {}),
                ...(providerData[0]?.state || {}),
            };

            // Store in appState table
            if (Object.keys(mergedState).length > 0) {
                await db.appState.put({
                    id: 'app-state',
                    state: mergedState,
                    updatedAt: new Date()
                });
            }

            // Mark migration as applied
            markMigrationApplied(19);

            logDexieMigration(19, 'single-bounded-store', 'completed', {
                tableName: 'appState',
                itemsCount: Object.keys(mergedState).length
            });
        });
}
