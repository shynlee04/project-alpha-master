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
export { ViaGentDatabase as DexieDB } from './dexie-db';
export * from './dexie-db-class';
export { createDexieStorage } from '@/infrastructure/persistence/dexie-storage';
export * from './dexie-db-migrations';
export * from './dexie-db-core-types';
export * from './dexie-db-ai-types';
export * from './dexie-db-session-types';
export * from './dexie-db-knowledge-types';
export * from './dexie-db-workflow-types';
export * from './dexie-db-helpers';

// Workflow Persistence (Epic E4-7)
export * from './workflow-persistence';

// RAG Store (types and helpers only - store moved to stores/)
export * from './rag-store-helpers';
export * from './rag-store-types';

// Helpers
export * from './stores/conversation-auto-restore';
