/**
 * @fileoverview Unified flashcard stores (composed from slices)
 * @module infrastructure/persistence/stores/flashcard
 * @governance S-012-b | Phase 3 | API-001-REFACTOR
 */

import { create } from 'zustand';
import {
  createFlashcardCrudSlice,
  type FlashcardStoreState,
  type FlashcardCrudState,
} from './slices/flashcard-crud-slice';
import { createFlashcardFilterSlice } from './slices/flashcard-filter-slice';
import { createFlashcardPersistenceSlice } from './slices/flashcard-persistence-slice';
import {
  createFlashcardSetCrudSlice,
  type FlashcardSetStoreState,
} from './slices/flashcard-set-crud-slice';
import { createFlashcardSetPersistenceSlice } from './slices/flashcard-persistence-slice';
import { createFlashcardOperations, type FlashcardOperations } from './slices/flashcard-operations-slice';

// ============================================================
// Unified Flashcard Store (composes 3 slices)
// ============================================================

/**
 * Unified flashcard store with CRUD + Filter + Persistence
 * Composed from 3 slices: crud, filter, persistence
 */
export const useFlashcardStore = create<FlashcardStoreState>()((set, get) => ({
  ...createFlashcardCrudSlice(set, get),
  ...createFlashcardFilterSlice(get),
  ...createFlashcardPersistenceSlice(set, get),
}));

// ============================================================
// Unified Flashcard Set Store (composes 2 slices)
// ============================================================

/**
 * Unified flashcard set store with CRUD + Persistence
 * Composed from 2 slices: set-crud, set-persistence
 */
export const useFlashcardSetStore = create<FlashcardSetStoreState>()((set, get) => ({
  ...createFlashcardSetCrudSlice(set, get),
  ...createFlashcardSetPersistenceSlice(set, get),
}));

// ============================================================
// Cross-Store Operations Hook
// ============================================================

/**
 * Flashcard operations hook
 * Coordinates between flashcard-store and flashcard-set-store
 * Avoids circular dependencies by injecting stores at call time
 */
export const useFlashcardOperations = (): FlashcardOperations => {
  return createFlashcardOperations(
    useFlashcardStore.getState(),
    useFlashcardSetStore.getState()
  );
};

// ============================================================
// Auto-Initialization
// ============================================================

/**
 * Initialize all flashcard stores on module load
 * Only runs in browser environment
 */
async function initializeFlashcardStores() {
  try {
    await useFlashcardStore.getState().loadFlashcards();
    await useFlashcardSetStore.getState().loadFlashcardSets();
  } catch (error) {
    console.error('[flashcard-store] Failed to initialize flashcard stores:', error);
  }
}

if (typeof window !== 'undefined') {
  initializeFlashcardStores();
}

// ============================================================
// Type Re-exports for Backward Compatibility
// ============================================================

/**
 * @deprecated Use FlashcardStoreState instead
 */
export type FlashcardState = FlashcardStoreState;

/**
 * @deprecated Type kept for migration compatibility
 */
export type FlashcardStoreLegacyState = FlashcardStoreState & {
  flashcards: import('@/lib/knowledge/types').Flashcard[];
  activeSetId: string | null;
};

// ============================================================
// Legacy FlashcardOperations (backwards compatibility)
// ============================================================

/**
 * Legacy flashcard operations type
 * Maintained for backward compatibility
 */
export interface FlashcardOperationsLegacy extends FlashcardOperations {
  saveGeneratedFlashcards: (cards: import('@/lib/knowledge/types').Flashcard[], sourceIds: string[]) => Promise<string>;
  initialize: () => Promise<void>;
  clearAll: () => Promise<void>;
}

// ============================================================
// Helper: Get cards for flashcard set
// ============================================================

/**
 * Helper function to get cards for a flashcard set
 * Cross-store coordination utility
 *
 * @param setId - Flashcard set ID
 * @returns Array of flashcards in the set
 */
export function getCardsForSet(setId: string): import('@/lib/knowledge/types').Flashcard[] {
  const { flashcardSets } = useFlashcardSetStore.getState();
  const flashcards = useFlashcardStore.getState().flashcards;
  const set = flashcardSets.find((s) => s.id === setId);
  if (!set) return [];
  return flashcards.filter((fc) => set.cardIds.includes(fc.id));
}

// ============================================================
// Database and Utility Exports
// ============================================================

export { FlashcardDatabase, getFlashcardDb, setFlashcardDbForTesting } from './flashcard-db';
export { generateFlashcardId, generateFlashcardSetId, getSafeFlashcardDb } from './flashcard-utils';
export type { FlashcardRecord, FlashcardSetRecord } from './flashcard-db';

// ============================================================
// Slice Exports (for advanced use cases)
// ============================================================

export type {
  FlashcardCrudState,
  FlashcardStoreState as FlashcardStoreSliceState,
} from './slices/flashcard-crud-slice';
export type { FlashcardFilterState } from './slices/flashcard-filter-slice';
export type {
  FlashcardPersistenceState,
  FlashcardSetPersistenceState,
} from './slices/flashcard-persistence-slice';
export type {
  FlashcardSetCrudState,
  FlashcardSetStoreState as FlashcardSetStoreSliceState,
} from './slices/flashcard-set-crud-slice';
export type { FlashcardOperations } from './slices/flashcard-operations-slice';

// ============================================================
// Export useFlashcardOperations as denoted operation(s)
// ============================================================

// Slice creators (each from its correct source file)
export { createFlashcardCrudSlice } from './slices/flashcard-crud-slice';
export { createFlashcardFilterSlice } from './slices/flashcard-filter-slice';
export {
  createFlashcardPersistenceSlice,
  createFlashcardSetPersistenceSlice,
} from './slices/flashcard-persistence-slice';
export { createFlashcardSetCrudSlice } from './slices/flashcard-set-crud-slice';
export { createFlashcardOperations } from './slices/flashcard-operations-slice';