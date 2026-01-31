/**
 * @file Knowledge Types
 * @module lib/knowledge/types
 * @deprecated This module is archived for MVP
 */

import type { SRSData } from '@/lib/study/srs-types';

/**
 * Flashcard difficulty levels
 */
export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Flashcard interface for study materials
 */
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
  topic: string;
  projectId: string;
  sourceIds: string[];
  createdAt: number;
  srsData?: SRSData;
}

/**
 * Flashcard set for organizing related cards
 */
export interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  sourceIds: string[];
  createdAt: number;
  updatedAt: number;
  isAutomatic: boolean;
}

/**
 * Filter options for flashcards
 */
export interface FlashcardFilter {
  searchQuery?: string;
  tags?: string[];
  difficulty?: FlashcardDifficulty;
  topic?: string;
  sourceId?: string;
  sourceIds?: string[];
  projectId?: string;
  setId?: string;
  hasSrsData?: boolean;
  dueForReview?: boolean;
}

/**
 * Flashcard generation options
 */
export interface FlashcardGenerationOptions {
  sourceId: string;
  sourceType: 'pdf' | 'text' | 'url';
  title?: string;
  autoGenerate: boolean;
  extractKeyConcepts: boolean;
  generateSummary: boolean;
  customPrompt?: string;
}

/**
 * Result of flashcard generation
 */
export interface FlashcardGenerationResult {
  success: boolean;
  flashcards?: Flashcard[];
  error?: string;
  sourceTitle?: string;
  cardsGenerated: number;
}
