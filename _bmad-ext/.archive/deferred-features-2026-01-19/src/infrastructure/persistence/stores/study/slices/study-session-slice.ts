/**
 * @fileoverview Study Session Slice - Session CRUD and SRS data management
 * @module infrastructure/persistence/stores/study/slices/study-session-slice
 */

import { StateCreator } from 'zustand';
import type { Flashcard } from '@/lib/knowledge/types';
import type { SRSData, StudySession, StudyStats } from '@/lib/study/srs-types';
import {
  createStudySession,
  completeStudySession,
  calculateStudyStats,
  DEFAULT_SRS_DATA,
} from '@/lib/study/srs-types';
import { persistStudySession } from '../slices/study-database-slice';

// ============================================================================
// Types
// ============================================================================

export interface StudySessionState {
  /** Current active study session */
  currentSession: StudySession | null;
  /** Cards in the current session */
  cards: Flashcard[];
  /** SRS data for all cards (map of cardId -> SRSData) */
  cardSrsData: Map<string, SRSData>;
  /** Statistics from the last completed session */
  sessionStats: StudyStats | null;
}

export interface StudySessionActions {
  /** Start a new study session with the given cards */
  startSession: (cards: Flashcard[]) => StudySession;
  /** Complete the current session and calculate statistics */
  completeSession: () => StudyStats;
  /** Reset the current session state */
  resetCurrentSession: () => void;
  /** Get SRS data for a specific card */
  getCardSrsData: (cardId: string) => SRSData;
  /** Update SRS data for a specific card */
  updateCardSrsData: (cardId: string, srsData: SRSData) => void;
}

export type StudySessionSlice = StudySessionState & StudySessionActions;

// ============================================================================
// Slice Implementation
// ============================================================================

export const createStudySessionSlice: StateCreator<
  StudySessionSlice,
  [],
  [],
  StudySessionSlice
> = (set, get) => ({
  // State
  currentSession: null,
  cards: [],
  cardSrsData: new Map(),
  sessionStats: null,

  // Actions
  startSession: (cards: Flashcard[]) => {
    const cardSrsData = get().cardSrsData;

    // Filter to only include cards that are due or new
    const dueCards = cards.filter((card) => {
      const srsData = cardSrsData.get(card.id);
      return !srsData || srsData.nextReview <= Date.now();
    });

    // If no cards are due, use all cards
    const cardsToStudy = dueCards.length > 0 ? dueCards : cards;

    const session = createStudySession(cardsToStudy.map((c) => c.id));

    set({
      cards: cardsToStudy,
      currentSession: session,
      sessionStats: null,
    });

    return session;
  },

  completeSession: () => {
    const { currentSession } = get();

    if (!currentSession) {
      throw new Error('No active session');
    }

    // Complete the session
    const completedSession = completeStudySession(currentSession);

    // Calculate statistics
    const stats = calculateStudyStats(completedSession);

    // Save session to IndexedDB
    persistStudySession(completedSession);

    set({
      currentSession: completedSession,
      sessionStats: stats,
    });

    return stats;
  },

  resetCurrentSession: () => {
    set({
      currentSession: null,
      cards: [],
      sessionStats: null,
    });
  },

  getCardSrsData: (cardId: string) => {
    const { cardSrsData } = get();
    return cardSrsData.get(cardId) || { ...DEFAULT_SRS_DATA };
  },

  updateCardSrsData: (cardId: string, srsData: SRSData) => {
    const { cardSrsData } = get();
    cardSrsData.set(cardId, srsData);
    set({ cardSrsData: new Map(cardSrsData) });
  },
});
