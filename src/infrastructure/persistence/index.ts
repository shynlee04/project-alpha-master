/**
 * Infrastructure Persistence Layer
 *
 * Consolidated state management and database persistence
 *
 * All stores previously in:
 * - src/stores/
 * - src/lib/state/
 *
 * Now centralized in src/infrastructure/persistence/
 */

// Stores
export * from './stores/index';

// Database
export { default as DexieDB } from './dexie-db';
export * from './dexie-db-class';
export * from './dexie-storage';
export * from './dexie-db-migrations';
export * from './dexie-db-core-types';
export * from './dexie-db-ai-types';
export * from './dexie-db-session-types';
export * from './dexie-db-knowledge-types';
export * from './dexie-db-helpers';

// RAG Store
export * from './rag-store';
export * from './rag-store-helpers';
export * from './rag-store-types';

// Helpers
export * from './stores/conversation-auto-restore';
export * from './session-snapshot-manager';
export * from './hydration-manager';
