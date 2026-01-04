/**
 * @fileoverview DEPRECATED: Dexie Database Helpers Facade
 * @module lib/state/dexie-db-helpers
 * @governance Epic 53 Story 53-2
 * 
 * ⚠️ DEPRECATION WARNING:
 * This location is deprecated. All dexie-db-helpers have been moved to:
 * src/infrastructure/persistence/dexie-db-helpers/
 * 
 * Please update your imports to use the new canonical path:
 * @example
 * // OLD (deprecated):
 * import { getIDEState } from '@/lib/state/dexie-db-helpers/ide-state-helpers';
 * 
 * // NEW (canonical):
 * import { getIDEState } from '@/infrastructure/persistence/dexie-db-helpers/ide-state-helpers';
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(
        '[DEPRECATED] lib/state/dexie-db-helpers is deprecated. ' +
        'Use infrastructure/persistence/dexie-db-helpers instead. ' +
        'See ADR-024: State Management Consolidation.'
    );
}

// Re-export all helpers from canonical location
export * from '@/infrastructure/persistence/dexie-db-helpers/ide-state-helpers';
export * from '@/infrastructure/persistence/dexie-db-helpers/sync-status-helpers-basic';
export * from '@/infrastructure/persistence/dexie-db-helpers/sync-status-helpers-query';
export * from '@/infrastructure/persistence/dexie-db-helpers/file-metadata-helpers';
export * from '@/infrastructure/persistence/dexie-db-helpers/additional-file-metadata-helpers';
export * from '@/infrastructure/persistence/dexie-db-helpers/tool-execution-log-helpers';
export * from '@/infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers';
export * from '@/infrastructure/persistence/dexie-db-helpers/session-snapshot-helpers';
export * from '@/infrastructure/persistence/dexie-db-helpers/conversation-thread-helpers';
export * from '@/infrastructure/persistence/dexie-db-helpers/source-helpers-basic';
export * from '@/infrastructure/persistence/dexie-db-helpers/source-helpers-search';
export * from '@/infrastructure/persistence/dexie-db-helpers/collection-helpers-basic';
export * from '@/infrastructure/persistence/dexie-db-helpers/collection-helpers-sources';
export * from '@/infrastructure/persistence/dexie-db-helpers/synthesis-result-helpers-crud';
export * from '@/infrastructure/persistence/dexie-db-helpers/synthesis-result-helpers-create';
