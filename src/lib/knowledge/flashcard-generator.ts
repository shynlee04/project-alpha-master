/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

import type { Flashcard, FlashcardGenerationResult } from './types';

export async function generateFlashcards(): Promise<FlashcardGenerationResult> {
  return {
    success: false,
    error: 'Knowledge module archived - flashcard generation not available in MVP',
  };
}
