/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

import type { FlashcardGenerationResult } from './types';

export async function generateFlashcards(): Promise<FlashcardGenerationResult> {
  return {
    success: false,
    error: 'Knowledge module archived - flashcard generation not available in MVP',
    cardsGenerated: 0,
  };
}

/**
 * Mock flashcard generator for testing
 */
export class MockFlashcardGenerator {
  async generate(_sourceId: string): Promise<FlashcardGenerationResult> {
    return {
      success: false,
      error: 'Mock generator not available in MVP',
      cardsGenerated: 0,
    };
  }
}
