/**
 * @fileoverview Flashcard utilities (ID generators, safe DB access)
 * @module infrastructure/persistence/stores/flashcard/flashcard-utils
 * @governance S-012-b | Phase 1 | API-001-REFACTOR
 */

import type { FlashcardDatabase } from './flashcard-db';
import { getFlashcardDb } from './flashcard-db';

/**
 * Generate a unique flashcard ID
 *
 * Format: fc-{timestamp}-{random}
 *
 * @returns Unique flashcard ID
 */
export function generateFlashcardId(): string {
  return `fc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a unique flashcard set ID
 *
 * Format: fcs-{timestamp}-{random}
 *
 * @returns Unique flashcard set ID
 */
export function generateFlashcardSetId(): string {
  return `fcs-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safe database getter with SSR check
 * Returns null in server-side rendering context
 *
 * @returns FlashcardDatabase instance or null if not available
 */
export function getSafeFlashcardDb(): FlashcardDatabase | null {
  if (typeof window === 'undefined') return null;
  return getFlashcardDb();
}