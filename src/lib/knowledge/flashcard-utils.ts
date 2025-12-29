/**
 * @fileoverview Flashcard filter and search utilities
 * @module lib/knowledge/flashcard-utils
 */

import type { Flashcard, FlashcardFilter, FlashcardDifficulty, FlashcardSet } from './types';

/**
 * Filter flashcards by multiple criteria
 */
export function filterFlashcards(cards: Flashcard[], filter: FlashcardFilter): Flashcard[] {
  return cards.filter((card) => {
    // Filter by topic (exact match)
    if (filter.topic && card.topic !== filter.topic) {
      return false;
    }

    // Filter by difficulty
    if (filter.difficulty && card.difficulty !== filter.difficulty) {
      return false;
    }

    // Filter by sourceId (must be in the card's sourceIds)
    if (filter.sourceId && !card.sourceIds.includes(filter.sourceId)) {
      return false;
    }

    // Search query (case-insensitive, searches question, answer, and topic)
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase().trim();
      if (!query) return true;

      const questionMatch = card.question.toLowerCase().includes(query);
      const answerMatch = card.answer.toLowerCase().includes(query);
      const topicMatch = card.topic.toLowerCase().includes(query);

      if (!questionMatch && !answerMatch && !topicMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Search flashcards by query (shorthand for filterFlashcards)
 */
export function searchFlashcards(cards: Flashcard[], query: string): Flashcard[] {
  return filterFlashcards(cards, { searchQuery: query });
}

/**
 * Get unique topics from flashcards
 */
export function getUniqueTopics(cards: Flashcard[]): string[] {
  const topics = new Set(cards.map((card) => card.topic));
  return Array.from(topics).sort();
}

/**
 * Get unique difficulties from flashcards
 */
export function getUniqueDifficulties(cards: Flashcard[]): FlashcardDifficulty[] {
  const difficulties = new Set(cards.map((card) => card.difficulty));
  return Array.from(difficulties);
}

/**
 * Get unique source IDs from flashcards
 */
export function getUniqueSourceIds(cards: Flashcard[]): string[] {
  const sourceIds = new Set(cards.flatMap((card) => card.sourceIds));
  return Array.from(sourceIds).sort();
}

/**
 * Group flashcards by topic
 */
export function groupFlashcardsByTopic(cards: Flashcard[]): Record<string, Flashcard[]> {
  return cards.reduce((acc, card) => {
    if (!acc[card.topic]) {
      acc[card.topic] = [];
    }
    acc[card.topic].push(card);
    return acc;
  }, {} as Record<string, Flashcard[]>);
}

/**
 * Group flashcards by difficulty
 */
export function groupFlashcardsByDifficulty(cards: Flashcard[]): Record<FlashcardDifficulty, Flashcard[]> {
  return cards.reduce(
    (acc, card) => {
      if (!acc[card.difficulty]) {
        acc[card.difficulty] = [];
      }
      acc[card.difficulty].push(card);
      return acc;
    },
    {} as Record<FlashcardDifficulty, Flashcard[]>
  );
}

/**
 * Sort flashcards by various criteria
 */
export function sortFlashcards(
  cards: Flashcard[],
  criteria: 'newest' | 'oldest' | 'topic' | 'difficulty' | 'random'
): Flashcard[] {
  const sorted = [...cards];

  switch (criteria) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    case 'oldest':
      return sorted.sort((a, b) => a.createdAt - b.createdAt);
    case 'topic':
      return sorted.sort((a, b) => a.topic.localeCompare(b.topic));
    case 'difficulty':
      const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
      return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    case 'random':
      return sorted.sort(() => Math.random() - 0.5);
    default:
      return sorted;
  }
}

/**
 * Get flashcards statistics
 */
export interface FlashcardStats {
  total: number;
  byTopic: Record<string, number>;
  byDifficulty: Record<FlashcardDifficulty, number>;
  bySource: Record<string, number>;
}

export function getFlashcardStats(cards: Flashcard[]): FlashcardStats {
  return {
    total: cards.length,
    byTopic: getUniqueTopics(cards).reduce((acc, topic) => {
      acc[topic] = cards.filter((c) => c.topic === topic).length;
      return acc;
    }, {} as Record<string, number>),
    byDifficulty: getUniqueDifficulties(cards).reduce((acc, difficulty) => {
      acc[difficulty] = cards.filter((c) => c.difficulty === difficulty).length;
      return acc;
    }, {} as Record<FlashcardDifficulty, number>),
    bySource: getUniqueSourceIds(cards).reduce((acc, sourceId) => {
      acc[sourceId] = cards.filter((c) => c.sourceIds.includes(sourceId)).length;
      return acc;
    }, {} as Record<string, number>),
  };
}

/**
 * Shuffle flashcards for study session
 */
export function shuffleFlashcards(cards: Flashcard[]): Flashcard[] {
  const shuffled = [...cards];
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Filter flashcards for a specific flashcard set
 */
export function getFlashcardsForSet(cards: Flashcard[], set: FlashcardSet): Flashcard[] {
  return cards.filter((card) => set.cardIds.includes(card.id));
}

/**
 * Create a study session with shuffled cards from a set
 */
export function createStudySession(
  allCards: Flashcard[],
  set: FlashcardSet,
  options: {
    shuffle?: boolean;
    limit?: number;
    difficulty?: FlashcardDifficulty;
  } = {}
): Flashcard[] {
  let cards = getFlashcardsForSet(allCards, set);

  // Filter by difficulty if specified
  if (options.difficulty) {
    cards = cards.filter((c) => c.difficulty === options.difficulty);
  }

  // Limit the number of cards
  if (options.limit && options.limit > 0) {
    cards = cards.slice(0, options.limit);
  }

  // Shuffle if requested
  if (options.shuffle !== false) {
    cards = shuffleFlashcards(cards);
  }

  return cards;
}

/**
 * Debounce search query for performance
 */
export function debounceSearch<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
