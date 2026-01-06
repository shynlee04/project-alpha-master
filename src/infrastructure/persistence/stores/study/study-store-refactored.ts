/**
 * @fileoverview Study Store Refactored - Combined store with all slices
 * @module infrastructure/persistence/stores/study/study-store-refactored
 */

import { create } from 'zustand';
import type { Flashcard } from '@/lib/knowledge/types';
import type { SRSData, SRSRating, StudySession, StudyStats } from '@/lib/study/srs-types';
import { createStudyDatabaseSlice, type StudyDatabaseSlice, initializeStudyState } from './slices/study-database-slice';
import { createStudySessionSlice, type StudySessionSlice } from './slices/study-session-slice';
import { createStudyNavigationSlice, type StudyNavigationSlice } from './slices/study-navigation-slice';
import { createStudyStatsSlice, type StudyStatsSlice } from './slices/study-stats-slice';

// ============================================================================
// Combined Store Type
// ============================================================================

export interface StudyStoreState extends
  StudyDatabaseSlice,
  StudySessionSlice,
  StudyNavigationSlice,
  StudyStatsSlice {
  // UI State (not persisted)
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Combined Store Implementation
// ============================================================================

export const useStudyStore = create<StudyStoreState>()((set, get, api) => ({
  // Database slice
  ...createStudyDatabaseSlice(set, get, api),

  // Session slice
  ...createStudySessionSlice(set, get, api),

  // Navigation slice
  ...createStudyNavigationSlice(set, get, api),

  // Stats slice
  ...createStudyStatsSlice(set, get, api),

  // UI state (not persisted)
  isLoading: false,
  error: null,
}));

// ============================================================================
// Initialize store from IndexedDB
// ============================================================================

async function initializeStudyStore(): Promise<void> {
  try {
    const { totalCardsStudied, currentStreak } = await initializeStudyState();
    useStudyStore.setState({
      totalCardsStudied,
      currentStreak,
    });
  } catch (error) {
    console.error('[StudyStore] Failed to initialize:', error);
  }
}

// Only initialize in browser environment
if (typeof window !== 'undefined') {
  initializeStudyStore();
}

// ============================================================================
// Backward Compatibility: Enhanced completeSession
// ============================================================================

// Override completeSession to also update stats
const originalCompleteSession = useStudyStore.getState().completeSession;
useStudyStore.setState({
  completeSession: () => {
    const stats = originalCompleteSession();
    const { ratings } = useStudyStore.getState().currentSession || { ratings: new Map() };
    const ratingArray = Array.from(ratings.values());
    useStudyStore.getState().updateStreakFromRatings(ratingArray);
    useStudyStore.getState().incrementTotalCardsStudied(stats.cardsStudied);
    return stats;
  },
});

// ============================================================================
// Study Session Hook
// ============================================================================

/**
 * Hook for using study session state with navigation helpers
 */
export function useStudySession() {
  const store = useStudyStore();

  return {
    // State
    currentSession: store.currentSession,
    cards: store.cards,
    currentCard:
      store.currentSession && store.cards[store.currentSession.currentIndex],
    sessionStats: store.sessionStats,
    isComplete: store.currentSession?.completed ?? false,

    // Actions
    startSession: store.startSession,
    rateCard: store.rateCard,
    nextCard: store.nextCard,
    previousCard: store.previousCard,
    completeSession: store.completeSession,
    getDueCards: store.getDueCards,
    getCardSrsData: store.getCardSrsData,
    updateCardSrsData: store.updateCardSrsData,
    resetSession: store.resetCurrentSession,

    // Progress
    progress: store.currentSession
      ? (store.currentSession.currentIndex + 1) / store.cards.length
      : 0,
    currentIndex: store.currentSession?.currentIndex ?? 0,
    totalCards: store.cards.length,
  };
}

// ============================================================================
// Type Exports
// ============================================================================

// Create a StudyState alias for backward compatibility
export type StudyState = StudyStoreState;
