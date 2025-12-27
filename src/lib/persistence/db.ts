/**
 * Persistence DB - Dexie Compatibility Layer
 * 
 * @module lib/persistence/db
 * @governance EPIC-27-1c
 * 
 * Story 5-1: Set Up IndexedDB Schema (Original)
 * Story 27-1c: Migrated to Dexie.js with idb-compatible wrapper
 * 
 * This module wraps the Dexie database to provide backward compatibility
 * with code that used the idb-style API patterns.
 * 
 * @example
 * ```tsx
 * // Using the compatibility wrapper (existing code works unchanged):
 * const db = await getPersistenceDB();
 * await db.put('projects', project);             // ✅ Works
 * const project = await db.get('projects', id);  // ✅ Works
 * 
 * // NEW code should use Dexie directly:
 * import { db } from '@/lib/state';
 * await db.projects.put(project);
 * ```
 */

import { db as dexieDb, resetDatabaseForTesting } from '../state/dexie-db';
import type { ProjectMetadata } from '../workspace/project-store';

// ============================================================================
// Legacy Types (Backward Compatibility)
// ============================================================================

export interface ConversationRecord {
    id: string;
    projectId: string;
    messages: unknown[];
    toolResults?: unknown[];
    updatedAt: Date;
}

export interface IdeStateRecord {
    projectId: string;
    panelLayouts?: Record<string, number[]>;
    panelSizes?: number[];
    openFiles?: string[];
    activeFile?: string | null;
    activeFileScrollTop?: number;
    terminalTab?: 'terminal' | 'output' | 'problems';
    chatVisible?: boolean;
    updatedAt: Date;
}

/**
 * Legacy schema type for backward compatibility
 * @deprecated Use Dexie db.table directly
 */
export interface ViaGentPersistenceDB {
    projects: {
        key: string;
        value: ProjectMetadata;
        indexes: { 'by-last-opened': Date };
    };
    conversations: {
        key: string;
        value: ConversationRecord;
        indexes: { 'by-project-id': string; 'by-updated-at': Date };
    };
    ideState: {
        key: string;
        value: IdeStateRecord;
        indexes: { 'by-project-id': string; 'by-updated-at': Date };
    };
}

// ============================================================================
// IDB-Compatible Wrapper
// ============================================================================

type TableName = 'projects' | 'conversations' | 'ideState';

/**
 * Wrapper that provides idb-like API on top of Dexie
 * This allows existing code to work without modification.
 */
class IdbCompatWrapper {
    private getTable(storeName: TableName) {
        switch (storeName) {
            case 'projects':
                return dexieDb.projects;
            case 'conversations':
                return dexieDb.conversations;
            case 'ideState':
                return dexieDb.ideState;
            default:
                throw new Error(`Unknown store: ${storeName}`);
        }
    }

    /** idb-style put */
    async put(storeName: TableName, value: unknown): Promise<string> {
        const table = this.getTable(storeName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const key = await (table as any).put(value);
        return String(key);
    }

    /** idb-style get */
    async get<T>(storeName: TableName, key: string): Promise<T | undefined> {
        const table = this.getTable(storeName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (table as any).get(key) as Promise<T | undefined>;
    }

    /** idb-style getAll */
    async getAll<T>(storeName: TableName): Promise<T[]> {
        const table = this.getTable(storeName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (table as any).toArray() as Promise<T[]>;
    }

    /** idb-style delete */
    async delete(storeName: TableName, key: string): Promise<void> {
        const table = this.getTable(storeName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (table as any).delete(key);
    }

    /** idb-style count */
    async count(storeName: TableName): Promise<number> {
        const table = this.getTable(storeName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (table as any).count();
    }

    /** idb-style clear */
    async clear(storeName: TableName): Promise<void> {
        const table = this.getTable(storeName);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (table as any).clear();
    }

    /** idb-style transaction (simplified) */
    transaction(_storeName: TableName, _mode: 'readonly' | 'readwrite') {
        // Legacy transaction not needed with Dexie - operations are auto-transactional
        console.warn('[IdbCompatWrapper] transaction() is deprecated, use direct db operations');
        return {
            store: {
                put: async () => { throw new Error('Use db.put directly'); },
                get: async () => { throw new Error('Use db.get directly'); },
            },
            done: Promise.resolve(),
        };
    }

    /** Check if object store exists */
    get objectStoreNames(): { contains: (name: string) => boolean } {
        const validNames = ['projects', 'conversations', 'ideState', 'taskContexts', 'toolExecutions'];
        return {
            contains: (name: string) => validNames.includes(name),
        };
    }

    /** Close database (no-op for Dexie, it manages connections) */
    close(): void {
        // No-op - Dexie manages its own connections
    }
}

// Singleton wrapper instance
let wrapperInstance: IdbCompatWrapper | null = null;

// ============================================================================
// Public API
// ============================================================================

const DB_NAME = 'via-gent-persistence';
const DB_VERSION = 3;

/**
 * Get the persistence database (idb-compatible wrapper on Dexie)
 * 
 * @returns IDB-compatible wrapper for backward compatibility
 */
export async function getPersistenceDB(): Promise<IdbCompatWrapper | null> {
    if (typeof indexedDB === 'undefined') {
        console.warn('[PersistenceDB] IndexedDB is not available.');
        return null;
    }

    // Ensure Dexie database is open
    await dexieDb.open();

    // Return singleton wrapper
    if (!wrapperInstance) {
        wrapperInstance = new IdbCompatWrapper();
    }
    return wrapperInstance;
}

/**
 * Reset database for testing
 */
export async function _resetPersistenceDBForTesting(): Promise<void> {
    wrapperInstance = null;
    await resetDatabaseForTesting();
}

// Re-export Dexie instance for direct access
export { dexieDb as db };

export const PERSISTENCE_DB_NAME = DB_NAME;
export const PERSISTENCE_DB_VERSION = DB_VERSION;
