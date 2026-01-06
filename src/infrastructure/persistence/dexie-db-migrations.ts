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

import type { Dexie } from 'dexie';
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
    details?: { tableName?: string; itemsCount?: number; error?: string } | string
): void {
    const entry = {
        timestamp: Date.now(),
        type: 'dexie-migration',
        version,
        operation,
        status,
        ...(typeof details === 'string' ? { message: details } : details),
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
 *
 * @param db - Dexie database instance (ViaGentDatabase extends Dexie)
 */
export function registerMigrations(db: Dexie): void {
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
                logDexieMigration(8, 'sync-status-migration', 'completed', 'Already applied, skipping');
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
                logDexieMigration(9, 'epic-24-schema', 'completed', 'Already applied, skipping');
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
                logDexieMigration(11, 'epic-6-source-ingestion', 'completed', 'Already applied, skipping');
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
                logDexieMigration(12, 'epic-6-source-management', 'completed', 'Already applied, skipping');
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
                logDexieMigration(13, 'epic-7-orama-indexes', 'completed', 'Already applied, skipping');
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
                logDexieMigration(14, 'epic-7-3-embedding-models', 'completed', 'Already applied, skipping');
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
                logDexieMigration(15, 'epic-26-notes', 'completed', 'Already applied, skipping');
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

        // Schema version 16: Epic E4-7 - Workflow Builder Persistence
        // Adds workflows table for visual workflow builder
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
            // NEW: Workflows table for workflow builder (Epic E4-7)
            workflows: 'id, name, createdAt, updatedAt, tags, [name], [createdAt], [updatedAt]',
        }).upgrade(async () => {
            logDexieMigration(16, 'epic-e4-7-workflows', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(16)) {
                logDexieMigration(16, 'epic-e4-7-workflows', 'completed', 'Already applied, skipping');
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(16);

            logDexieMigration(16, 'epic-e4-7-workflows', 'completed', {
                tableName: 'workflows',
                itemsCount: 0
            });
        });

        // Schema version 17: Epic 7 - RAG State Persistence
        // Adds ragState table for Zustand RAG store persistence
        // P0 FIX: Resolves storage middleware failure - database initialization race condition
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
            workflows: 'id, name, createdAt, updatedAt, tags, [name], [createdAt], [updatedAt]',
            // NEW: RAG state persistence for knowledge indexing (Epic 7)
            ragState: 'id, updatedAt',
        }).upgrade(async () => {
            logDexieMigration(17, 'epic-7-rag-state', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(17)) {
                logDexieMigration(17, 'epic-7-rag-state', 'completed', 'Already applied, skipping');
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(17);

            logDexieMigration(17, 'epic-7-rag-state', 'completed', {
                tableName: 'ragState',
                itemsCount: 0
            });
        });

        // Schema version 18: Story S-031 - Code Snippets Manager
        // Adds codeSnippets table for reusable code fragments
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
            workflows: 'id, name, createdAt, updatedAt, tags, [name], [createdAt], [updatedAt]',
            ragState: 'id, updatedAt',
            // NEW: Code snippets table for reusable code fragments (Story S-031)
            codeSnippets: 'id, language, folder, tags, shortcut, createdAt, updatedAt, isBuiltIn, [language], [folder], [shortcut]',
        }).upgrade(async () => {
            logDexieMigration(18, 'story-s-031-snippets', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(18)) {
                logDexieMigration(18, 'story-s-031-snippets', 'completed', 'Already applied, skipping');
                return;
            }

            // No data migration needed - table is new
            // Mark migration as applied
            markMigrationApplied(18);

            logDexieMigration(18, 'story-s-031-snippets', 'completed', {
                tableName: 'codeSnippets',
                itemsCount: 0
            });
        });

        // Schema version 19: Story S-037 - Plugin System
        // Adds plugins, pluginSettings, pluginMarketplace, and pluginStorage tables
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
            workflows: 'id, name, createdAt, updatedAt, tags, [name], [createdAt], [updatedAt]',
            ragState: 'id, updatedAt',
            codeSnippets: 'id, language, folder, tags, shortcut, createdAt, updatedAt, isBuiltIn, [language], [folder], [shortcut]',
            // NEW: Plugin system tables for extensibility (Story S-037)
            plugins: 'id, source, state, installedAt, [source], [state], [installedAt]',
            pluginSettings: 'pluginId, updatedAt',
            pluginMarketplace: 'id, category, cachedAt, expiresAt, [category], [cachedAt]',
            pluginStorage: 'id, pluginId, [pluginId]',
        }).upgrade(async () => {
            logDexieMigration(19, 'story-s-037-plugins', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(19)) {
                logDexieMigration(19, 'story-s-037-plugins', 'completed', 'Already applied, skipping');
                return;
            }

            // No data migration needed - tables are new
            // Mark migration as applied
            markMigrationApplied(19);

            logDexieMigration(19, 'story-s-037-plugins', 'completed', {
                tableName: 'plugins',
                itemsCount: 0
            });
        });

        // ========================================================================
        // PERSIST-S002: Workspace Isolation Migration (Version 20)
        // ========================================================================
        // CRITICAL FIX: Add workspaceId to ALL tables for cross-workspace data isolation
        // User issue: "File system sync broken across workspaces"
        // Root cause: No workspaceId in IndexedDB tables → data leaks between workspaces
        // Solution: Add workspaceId column with default 'ide' for existing records

        db.version(20).stores({
            // Core tables with workspaceId
            projects: 'id, workspaceId, lastOpened, name',
            ideState: 'projectId, workspaceId, updatedAt',
            conversations: 'id, projectId, workspaceId, updatedAt',

            // AI tables with workspaceId
            taskContexts: 'id, projectId, workspaceId, agentId, status, [projectId+status]',
            toolExecutions: 'id, taskId, workspaceId, toolName, status, [taskId+status]',
            credentials: 'providerId, workspaceId, createdAt',
            threads: 'id, projectId, workspaceId, updatedAt, [projectId+updatedAt]',

            // State tables with workspaceId
            providerConfigs: 'id, workspaceId, updatedAt',
            agentConfigs: 'id, workspaceId, updatedAt',
            conversationState: 'id, workspaceId, updatedAt',
            ragState: 'id, workspaceId, updatedAt',

            // Sync tables with workspaceId
            syncStatus: 'id, workspaceId, path, syncStatus, lastSyncedAt, [path+syncStatus]',
            fileSyncStatus: 'id, workspaceId, updatedAt',

            // File tables with workspaceId
            fileMetadata: '[projectId+workspaceId+path], projectId, workspaceId, lastModified, syncedAt',
            toolExecutionLogs: 'id, workspaceId, conversationId, messageId, toolName, timestamp, [conversationId+timestamp]',
            fsaHandles: 'projectId, workspaceId, lastAccessedAt',
            sessionSnapshots: 'id, projectId, workspaceId, createdAt, expiresAt, [projectId+createdAt]',

            // File snapshot tables with workspaceId
            fileSnapshots: 'projectId, workspaceId, path, [projectId+workspaceId+path]',
            fileContentCache: '[projectId+workspaceId+path]',

            // Knowledge tables with workspaceId
            sources: 'id, projectId, workspaceId, type, createdAt, deleted, [projectId+type], [projectId+createdAt], [projectId+deleted]',
            collections: 'id, projectId, workspaceId, name, createdAt, [projectId+name]',
            synthesisResults: 'id, workspaceId, createdAt',
            oramaIndexes: 'projectId, workspaceId, lastUpdated, schemaVersion',
            embedding_models: 'modelId, workspaceId, name, version, quantization, downloadedAt',
            notes: 'id, projectId, workspaceId, parentId, isFavorite, order, createdAt, updatedAt, [projectId+parentId], [projectId+isFavorite], [projectId+createdAt]',

            // Other tables with workspaceId
            workflows: 'id, workspaceId, name, createdAt, updatedAt, tags, [name], [createdAt], [updatedAt]',
            codeSnippets: 'id, workspaceId, language, folder, tags, shortcut, createdAt, updatedAt, isBuiltIn, [language], [folder], [shortcut]',

            // Plugin tables with workspaceId
            plugins: 'id, workspaceId, source, state, installedAt, [source], [state], [installedAt]',
            pluginSettings: 'pluginId, workspaceId, updatedAt',
            pluginMarketplace: 'id, workspaceId, category, cachedAt, expiresAt, [category], [cachedAt]',
            pluginStorage: 'id, pluginId, workspaceId, [pluginId]',
        }).upgrade(async (tx) => {
            logDexieMigration(20, 'persist-s-002-workspace-isolation', 'started');

            // Check if already applied (idempotency)
            if (isMigrationApplied(20)) {
                logDexieMigration(20, 'persist-s-002-workspace-isolation', 'completed', 'Already applied, skipping');
                return;
            }

            let totalUpdated = 0;
            const db = tx.db;

            // Update ALL existing records to have workspaceId = 'ide' (default workspace)
            for (const tableKey of ['projects', 'ideState', 'conversations', 'taskContexts', 'toolExecutions',
                                     'credentials', 'threads', 'providerConfigs', 'agentConfigs', 'conversationState',
                                     'syncStatus', 'fileSyncStatus', 'fileMetadata', 'toolExecutionLogs', 'fsaHandles',
                                     'sessionSnapshots', 'fileSnapshots', 'fileContentCache', 'sources', 'collections',
                                     'synthesisResults', 'oramaIndexes', 'embedding_models', 'notes', 'workflows',
                                     'codeSnippets', 'plugins', 'pluginSettings', 'pluginMarketplace', 'pluginStorage']) {
                const table = (db as any)[tableKey];
                try {
                    const count = await table.count();
                    const records = await table.toArray();

                    let updatedCount = 0;
                    for (const record of records) {
                        // Only update if workspaceId doesn't exist
                        if (!record.workspaceId) {
                            await table.update(record as any, { workspaceId: 'ide' });
                            updatedCount++;
                        }
                    }

                    totalUpdated += updatedCount;
                    logDexieMigration(20, 'persist-s-002-workspace-isolation', 'completed', {
                        tableName: tableKey,
                        itemsCount: count,
                        error: updatedCount > 0 ? undefined : `${updatedCount} records updated`
                    });
                } catch (error: unknown) {
                    console.error(`[Migration v20] Failed to update table ${tableKey}:`, error);
                }
            }

            markMigrationApplied(20);

            logDexieMigration(20, 'persist-s-002-workspace-isolation', 'completed', {
                itemsCount: totalUpdated,
                error: totalUpdated > 0 ? undefined : `All tables now have workspaceId for cross-workspace isolation`
            });
        });
}
