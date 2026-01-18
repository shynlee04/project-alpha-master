/**
 * @file Stub for archived knowledge module
 * @deprecated This module is archived for MVP
 */

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  sourceId: string;
  setId: string;
  createdAt: Date;
  srsData?: SRSData;
}

export interface FlashcardSet {
  id: string;
  name: string;
  sourceId: string;
  cardCount: number;
  createdAt: Date;
}

export interface FlashcardFilter {
  sourceId?: string;
  setId?: string;
  dueOnly?: boolean;
}

export interface FlashcardGenerationResult {
  success: boolean;
  flashcards?: Flashcard[];
  error?: string;
}

export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}
