/**
 * @fileoverview Flashcard utility functions
 * @module lib/knowledge/flashcard-utils
 */

import type { Flashcard, Deck, ReviewSchedule } from './flashcard-types';

/**
 * Create a new empty deck
 */
export function createEmptyDeck(name: string, description?: string): Deck {
  return {
    id: crypto.randomUUID(),
    name,
    description: description || '',
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Add a card to a deck
 */
export function addCardToDeck(deck: Deck, card: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Deck {
  const newCard: Flashcard = {
    ...card,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    ...deck,
    cards: [...deck.cards, newCard],
    updatedAt: new Date(),
  };
}

/**
 * Remove a card from a deck
 */
export function removeCardFromDeck(deck: Deck, cardId: string): Deck {
  return {
    ...deck,
    cards: deck.cards.filter((c) => c.id !== cardId),
    updatedAt: new Date(),
  };
}

/**
 * Update a card in a deck
 */
export function updateCardInDeck(
  deck: Deck,
  cardId: string,
  updates: Partial<Flashcard>
): Deck {
  return {
    ...deck,
    cards: deck.cards.map((c) =>
      c.id === cardId
        ? { ...c, ...updates, updatedAt: new Date() }
        : c
    ),
    updatedAt: new Date(),
  };
}

/**
 * Get cards due for review
 */
export function getCardsDueForReview(
  deck: Deck,
  limit?: number
): Flashcard[] {
  const now = new Date();

  return deck.cards
    .filter((card) => {
      if (!card.nextReview) return true;
      return new Date(card.nextReview) <= now;
    })
    .sort((a, b) => {
      // Prioritize cards that have never been reviewed
      if (!a.nextReview && !b.nextReview) return 0;
      if (!a.nextReview) return -1;
      if (!b.nextReview) return 1;

      // Then by due date
      return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
    })
    .slice(0, limit);
}

/**
 * Calculate next review schedule using SM-2 algorithm
 */
export function calculateNextReview(
  card: Flashcard,
  quality: number // 0-5 rating
): ReviewSchedule {
  const now = new Date();
  let { interval, easeFactor, repetitions } = card.schedule || {
    interval: 0,
    easeFactor: 2.5,
    repetitions: 0,
  };

  if (quality < 3) {
    // Failed - reset
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate next review date
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview: nextReview.toISOString(),
  };
}

/**
 * Apply review result to card
 */
export function applyReviewResult(
  card: Flashcard,
  quality: number
): Flashcard {
  const schedule = calculateNextReview(card, quality);

  return {
    ...card,
    schedule,
    lastReview: new Date().toISOString(),
    updatedAt: new Date(),
  };
}

/**
 * Shuffle cards in deck
 */
export function shuffleCards(deck: Deck): Deck {
  const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);

  return {
    ...deck,
    cards: shuffled,
    updatedAt: new Date(),
  };
}

/**
 * Filter cards by tags
 */
export function filterCardsByTags(deck: Deck, tags: string[]): Flashcard[] {
  if (!tags.length) return deck.cards;

  return deck.cards.filter((card) =>
    tags.some((tag) => card.tags?.includes(tag))
  );
}

/**
 * Get all unique tags from deck
 */
export function getAllTags(deck: Deck): string[] {
  const tags = new Set<string>();

  for (const card of deck.cards) {
    for (const tag of card.tags || []) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort();
}

/**
 * Clone a deck
 */
export function cloneDeck(deck: Deck): Deck {
  return {
    ...deck,
    id: crypto.randomUUID(),
    cards: deck.cards.map((card) => ({
      ...card,
      id: crypto.randomUUID(),
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Merge two decks
 */
export function mergeDecks(deck1: Deck, deck2: Deck): Deck {
  // Combine cards, avoiding duplicates by content
  const cardSet = new Map<string, Flashcard>();

  for (const card of deck1.cards) {
    cardSet.set(`${card.front}|${card.back}`, card);
  }

  for (const card of deck2.cards) {
    const key = `${card.front}|${card.back}`;
    if (!cardSet.has(key)) {
      cardSet.set(key, { ...card, id: crypto.randomUUID() });
    }
  }

  return {
    id: crypto.randomUUID(),
    name: `${deck1.name} + ${deck2.name}`,
    description: `Merged deck from "${deck1.name}" and "${deck2.name}"`,
    cards: Array.from(cardSet.values()),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get deck statistics
 */
export function getDeckStats(deck: Deck): {
  totalCards: number;
  dueToday: number;
  mastered: number;
  averageEaseFactor: number;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let dueToday = 0;
  let mastered = 0;
  let easeFactorSum = 0;

  for (const card of deck.cards) {
    // Count due today
    if (!card.nextReview) {
      dueToday++;
    } else {
      const reviewDate = new Date(card.nextReview);
      if (reviewDate <= now) {
        dueToday++;
      }
    }

    // Count mastered (interval > 21 days)
    if (card.schedule?.interval && card.schedule.interval > 21) {
      mastered++;
    }

    // Sum ease factors
    if (card.schedule?.easeFactor) {
      easeFactorSum += card.schedule.easeFactor;
    }
  }

  return {
    totalCards: deck.cards.length,
    dueToday,
    mastered,
    averageEaseFactor:
      deck.cards.length > 0
        ? easeFactorSum / deck.cards.length
        : 2.5,
  };
}
