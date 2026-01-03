/**
 * @fileoverview Knowledge Store Facade (Backwards Compatibility)
 * @module lib/state/knowledge-store
 * @governance Epic GS-001 (God Store Splitting)
 * @iteration 1147
 *
 * FACADE EXPORT - Re-exports from new location for backwards compatibility.
 *
 * The knowledge store has been split into focused slices:
 * @see {@link ../knowledge/slices/} - Slice files
 * @see {@link ../knowledge/knowledge-store.ts} - Main store
 *
 * @deprecated Import from '@/lib/state/knowledge' instead
 * This facade will be removed after all consumers migrate.
 */

export { useKnowledgeStore } from './knowledge/knowledge-store';
export type { KnowledgeStoreState } from './knowledge/types';
export type { SourceRecord, CollectionRecord, SourceMetadata, SynthesisResultRecord } from './dexie-db';
