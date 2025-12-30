/**
 * @fileoverview Flashcard types and Zod schemas for the Knowledge Synthesis system
 * @module lib/knowledge/types
 */

import { z } from 'zod';

/**
 * Difficulty levels for flashcards
 */
export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Individual flashcard structure
 */
export interface Flashcard {
  id: string;
  projectId: string;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

/**
 * Flashcard set for organizing multiple cards
 */
export interface FlashcardSet {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  sourceIds: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Preview state for generated flashcards before saving
 */
export interface FlashcardPreview {
  cards: Flashcard[];
  topics: string[];
  sourcesUsed: string[];
  totalCards: number;
}

/**
 * Flashcard generation request
 */
export interface FlashcardGenerationRequest {
  sourceIds: string[];
  options?: {
    minCards?: number;
    maxCards?: number;
    topics?: string[];
  };
}

/**
 * Zod schema for individual flashcard validation
 */
export const flashcardSchema = z.object({
  question: z.string().describe('The question or prompt on the front of the flashcard'),
  answer: z.string().describe('The answer on the back of the flashcard'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level of the card'),
  topic: z.string().describe('Topic or category for this card'),
  sourceIds: z.array(z.string()).describe('Source IDs used for this card'),
});

/**
 * Zod schema for flashcard generation response
 */
export const flashcardGenerationSchema = z.object({
  cards: z.array(flashcardSchema).describe('Array of generated flashcards'),
  totalCards: z.number().describe('Total number of cards generated'),
  topics: z.array(z.string()).describe('Unique topics identified in the cards'),
  sourcesUsed: z.array(z.string()).describe('Source IDs referenced in the cards'),
});

/**
 * Zod schema for flashcard set
 */
export const flashcardSetSchema = z.object({
  id: z.string().describe('Unique identifier for the flashcard set'),
  name: z.string().describe('Name of the flashcard set'),
  description: z.string().optional().describe('Optional description of the set'),
  cardIds: z.array(z.string()).describe('IDs of flashcards in this set'),
  sourceIds: z.array(z.string()).describe('Source IDs used to generate this set'),
  createdAt: z.number().describe('Timestamp when the set was created'),
  updatedAt: z.number().describe('Timestamp when the set was last updated'),
});

/**
 * Type inference from Zod schemas
 */
export type FlashcardInput = z.infer<typeof flashcardSchema>;
export type FlashcardGenerationResult = z.infer<typeof flashcardGenerationSchema>;
export type FlashcardSetInput = z.infer<typeof flashcardSetSchema>;

/**
 * Flashcard filter options
 */
export interface FlashcardFilter {
  topic?: string;
  difficulty?: FlashcardDifficulty;
  sourceId?: string;
  searchQuery?: string;
}

/**
 * Dexie store types for IndexedDB persistence
 */
export interface FlashcardRecord {
  id: string;
  question: string;
  answer: string;
  difficulty: FlashcardDifficulty;
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

export interface FlashcardSetRecord {
  id: string;
  name: string;
  description?: string;
  cardIds: string[];
  sourceIds: string[];
  createdAt: number;
  updatedAt: number;
}
