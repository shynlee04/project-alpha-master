/**
 * @fileoverview SRS (Spaced Repetition System) types and SM-2 algorithm
 * @module lib/study/srs-types
 */

/**
 * SRS rating for card review
 */
export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * SRS scheduling data for a flashcard
 */
export interface SRSData {
  interval: number;      // Days until next review
  easeFactor: number;    // Difficulty multiplier (default 2.5)
  repetitions: number;   // Number of successful reviews
  lastReview: number;    // Timestamp of last review
  nextReview: number;    // Timestamp of next review
}

/**
 * Default SRS data for new cards
 */
export const DEFAULT_SRS_DATA: SRSData = {
  interval: 0,
  easeFactor: 2.5,
  repetitions: 0,
  lastReview: 0,
  nextReview: Date.now(),
};

/**
 * Study session state
 */
export interface StudySession {
  id: string;
  cardIds: string[];
  currentIndex: number;
  startTime: number;
  endTime?: number;
  ratings: Map<string, SRSRating>;
  completed: boolean;
}

/**
 * Study statistics
 */
export interface StudyStats {
  cardsStudied: number;
  timeSpent: number;  // seconds
  correct: number;
  incorrect: number;
  streak: number;
  ratingDistribution: Record<SRSRating, number>;
}

/**
 * Default study stats
 */
export const DEFAULT_STUDY_STATS: StudyStats = {
  cardsStudied: 0,
  timeSpent: 0,
  correct: 0,
  incorrect: 0,
  streak: 0,
  ratingDistribution: {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  },
};

/**
 * Rating to quality mapping (SM-2 quality 0-5)
 */
const RATING_QUALITY_MAP: Record<SRSRating, number> = {
  again: 0,
  hard: 2,
  good: 4,
  easy: 5,
};

/**
 * SM-2 algorithm constants
 */
// const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

/**
 * Calculate the next review schedule using simplified SM-2 algorithm
 *
 * @param rating - User's rating (again, hard, good, easy)
 * @param current - Current SRS data for the card
 * @returns Updated SRS data for next review
 */
export function calculateNextReview(
  rating: SRSRating,
  current: SRSData = DEFAULT_SRS_DATA
): SRSData {
  const quality = RATING_QUALITY_MAP[rating];

  // Update ease factor using SM-2 formula
  let newEaseFactor =
    current.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor);

  // Calculate interval and repetitions
  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed - reset repetitions
    newRepetitions = 0;
    newInterval = 1; // Review tomorrow
  } else {
    // Passed - increase interval
    newRepetitions = current.repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(current.interval * newEaseFactor);
    }
  }

  const now = Date.now();
  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    lastReview: now,
    nextReview: now + newInterval * 24 * 60 * 60 * 1000,
  };
}

/**
 * Check if a card is due for review
 *
 * @param srsData - SRS data for the card
 * @returns True if the card is due
 */
export function isCardDue(srsData: SRSData): boolean {
  return Date.now() >= srsData.nextReview;
}

/**
 * Get cards that are due for review
 *
 * @param cards - Array of cards with SRS data
 * @returns Array of due cards
 */
export function getDueCards<T extends { srsData: SRSData }>(
  cards: T[]
): T[] {
  return cards.filter((card) => isCardDue(card.srsData));
}

/**
 * Calculate study statistics from a session
 *
 * @param session - Completed study session
 * @returns Study statistics
 */
export function calculateStudyStats(session: StudySession): StudyStats {
  const ratings = Array.from(session.ratings.values());
  const timeSpent = session.endTime
    ? Math.round((session.endTime - session.startTime) / 1000)
    : 0;

  const ratingDistribution: Record<SRSRating, number> = {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  };

  let correct = 0;
  let incorrect = 0;

  for (const rating of ratings) {
    ratingDistribution[rating]++;

    if (rating === 'again') {
      incorrect++;
    } else if (rating === 'hard') {
      // Hard counts as partially correct
      correct += 0.5;
      incorrect += 0.5;
    } else {
      correct++;
    }
  }

  return {
    cardsStudied: ratings.length,
    timeSpent,
    correct: Math.round(correct),
    incorrect: Math.round(incorrect),
    streak: calculateStreak(ratings),
    ratingDistribution,
  };
}

/**
 * Calculate streak (consecutive good/easy ratings)
 *
 * @param ratings - Array of ratings
 * @returns Streak count
 */
export function calculateStreak(ratings: SRSRating[]): number {
  let streak = 0;

  for (const rating of ratings) {
    if (rating === 'good' || rating === 'easy') {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Create a new study session
 *
 * @param cardIds - Array of flashcard IDs to study
 * @returns New study session
 */
export function createStudySession(cardIds: string[]): StudySession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    cardIds,
    currentIndex: 0,
    startTime: Date.now(),
    ratings: new Map(),
    completed: false,
  };
}

/**
 * Complete a study session
 *
 * @param session - Study session to complete
 * @returns Completed session
 */
export function completeStudySession(session: StudySession): StudySession {
  return {
    ...session,
    endTime: Date.now(),
    completed: true,
  };
}
