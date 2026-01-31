/**
 * @fileoverview SRS (Spaced Repetition System) types
 * @module lib/study/srs-types
 *
 * **DEFERRED - Post-MVP Archive**
 */

export interface SRSItem {
  id: string;
  front: string;
  back: string;
  deckId: string;
  schedule: SRSSchedule;
  stats: SRSStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface SRSSchedule {
  interval: number; // days
  easeFactor: number;
  repetitions: number;
  nextReview: string; // ISO date
}

export interface SRSStats {
  totalReviews: number;
  correctReviews: number;
  streak: number;
  lastReview?: string;
}

export interface SRSCard extends SRSItem {
  isDue: boolean;
  isNew: boolean;
}

export interface SRSReviewResult {
  itemId: string;
  quality: number; // 0-5
  newInterval: number;
  newEaseFactor: number;
  shouldReviewAgain: boolean;
}

export interface SRSSettings {
  defaultEaseFactor: number;
  minEaseFactor: number;
  intervalModifiers: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
  newCardsPerDay: number;
  reviewCardsPerDay: number;
}
