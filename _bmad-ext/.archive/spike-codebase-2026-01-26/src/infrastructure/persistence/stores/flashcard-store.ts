/**
 * @fileoverview Flashcard store facade (backward compatibility)
 * @module infrastructure/persistence/stores/flashcard-store
 * @governance S-012-b | Phase 4 | API-001-REFACTOR
 * @deprecated Import from @/infrastructure/persistence/stores/flashcard instead
 */

/**
 * FACADE PATTERN - Re-exports from new modular location
 *
 * This file maintains backward compatibility by re-exporting all APIs
 * from the new modular flashcard store architecture.
 *
 * NEW LOCATION:
 * @/infrastructure/persistence/stores/flashcard
 */

// ============================================================
// Re-export everything from new location
// ============================================================

export * from './flashcard';

// ============================================================
// Re-export stores for convenience
// ============================================================

export {
  useFlashcardStore,
  useFlashcardSetStore,
  useFlashcardOperations,
  getCardsForSet,
  FlashcardDatabase,
  getFlashcardDb,
  setFlashcardDbForTesting,
  generateFlashcardId,
  generateFlashcardSetId,
  getSafeFlashcardDb,
} from './flashcard';

// ============================================================
// Re-export types
// ============================================================

export type {
  FlashcardStoreState,
  FlashcardSetStoreState,
  FlashcardOperations,
  FlashcardRecord,
  FlashcardSetRecord,
  FlashcardCrudState,
  FlashcardFilterState,
  FlashcardPersistenceState,
  FlashcardSetPersistenceState,
  FlashcardSetCrudState,
} from './flashcard';

/**
 * @deprecated Type alias - Kept for backward compatibility
 */
export type { FlashcardState } from './flashcard';