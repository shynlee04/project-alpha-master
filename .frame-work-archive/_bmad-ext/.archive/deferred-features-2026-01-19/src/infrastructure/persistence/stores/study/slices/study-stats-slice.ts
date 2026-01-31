/**
 * @fileoverview Study Stats Slice - Statistics and streak tracking
 * @module infrastructure/persistence/stores/study/slices/study-stats-slice
 */

import { StateCreator } from 'zustand';
import type { SRSRating } from '@/lib/study/srs-types';
import { calculateStreakFromRatings } from '../slices/study-database-slice';

// ============================================================================
// Types
// ============================================================================

export interface StudyStatsState {
  /** Total cards studied across all sessions */
  totalCardsStudied: number;
  /** Current consecutive correct answer streak */
  currentStreak: number;
}

export interface StudyStatsActions {
  /** Update streak based on session ratings */
  updateStreakFromRatings: (ratings: SRSRating[]) => number;
  /** Increment total cards studied */
  incrementTotalCardsStudied: (count: number) => void;
}

export type StudyStatsSlice = StudyStatsState & StudyStatsActions;

// ============================================================================
// Slice Implementation
// ============================================================================

export const createStudyStatsSlice: StateCreator<
  StudyStatsSlice,
  [],
  [],
  StudyStatsSlice
> = (set) => ({
  // State
  totalCardsStudied: 0,
  currentStreak: 0,

  // Actions
  updateStreakFromRatings: (ratings: SRSRating[]) => {
    const newStreak = calculateStreakFromRatings(ratings);
    set({ currentStreak: newStreak });
    return newStreak;
  },

  incrementTotalCardsStudied: (count: number) => {
    set((state) => ({
      totalCardsStudied: state.totalCardsStudied + count,
    }));
  },
});
