/**
 * @fileoverview Knowledge Store (FACADE)
 * @module lib/state/knowledge/knowledge-store
 * @governance Epic 53-3 (State Management Consolidation) - ADR-024
 * @deprecated Import from '@/infrastructure/persistence/stores/knowledge' instead
 *
 * MIGRATION NOTE: This file is a FACADE that re-exports from the canonical location.
 * The canonical implementation is at src/infrastructure/persistence/stores/knowledge/knowledge-store.ts
 */

// Re-export main store from canonical location
export { useKnowledgeStore } from '@/infrastructure/persistence/stores/knowledge';
