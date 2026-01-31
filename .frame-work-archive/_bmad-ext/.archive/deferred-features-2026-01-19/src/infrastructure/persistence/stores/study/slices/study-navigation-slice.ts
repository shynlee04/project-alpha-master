/**
 * @fileoverview Study Navigation Slice - Card rating and navigation
 * @module infrastructure/persistence/stores/study/slices/study-navigation-slice
 */

import { StateCreator } from 'zustand';
import type { Flashcard } from '@/lib/knowledge/types';
import type { SRSData, SRSRating, StudySession } from '@/lib/study/srs-types';
import { calculateNextReview, DEFAULT_SRS_DATA } from '@/lib/study/srs-types';
import { persistStudyCard } from '../slices/study-database-slice';

// ============================================================================
// Types
// ============================================================================

export interface StudyNavigationState {
  /** No additional state - uses StudySessionSlice state */
}

export interface StudyNavigationActions {
  /** Rate the current card with an SRS rating and move to next card */
  rateCard: (rating: SRSRating) => void;
  /** Move to the next card in the session */
  nextCard: () => void;
  /** Move to the previous card in the session */
  previousCard: () => void;
  /** Get all cards that are due for review */
  getDueCards: () => Flashcard[];
}

export type StudyNavigationSlice = StudyNavigationState & StudyNavigationActions;

// ============================================================================
// Slice Implementation
// ============================================================================

export const createStudyNavigationSlice: StateCreator<
  StudyNavigationSlice,
  [],
  [],
  StudyNavigationSlice
> = (set, get) => ({
  // Actions
  rateCard: (rating: SRSRating) => {
    // Access combined store state - all slices are available via get()
    const state = get() as unknown as {
      currentSession: StudySession | null;
      cards: Flashcard[];
      cardSrsData: Map<string, SRSData>;
    };

    const { currentSession, cards, cardSrsData } = state;

    if (!currentSession || currentSession.completed) {
      return;
    }

    const currentCard = cards[currentSession.currentIndex];
    if (!currentCard) {
      return;
    }

    // Get existing SRS data or use defaults
    const currentSrsData = cardSrsData.get(currentCard.id) || {
      ...DEFAULT_SRS_DATA,
    };

    // Calculate next review based on SM-2 algorithm
    const newSrsData = calculateNextReview(rating, currentSrsData);

    // Update session with rating
    currentSession.ratings.set(currentCard.id, rating);

    // Update SRS data
    const newCardSrsData = new Map(cardSrsData);
    newCardSrsData.set(currentCard.id, newSrsData);

    // Update the state (cardSrsData is from StudySessionSlice)
    set({ cardSrsData: newCardSrsData } as unknown as Partial<StudyNavigationSlice>);

    // Persist to IndexedDB
    persistStudyCard(currentCard.id, currentSession.id, newSrsData, rating);
  },

  nextCard: () => {
    const state = get() as unknown as {
      currentSession: StudySession | null;
      cards: Flashcard[];
    };
    const { currentSession, cards } = state;

    if (!currentSession || currentSession.completed) {
      return;
    }

    if (currentSession.currentIndex < cards.length - 1) {
      // Update currentSession in the store
      const updatedSession = { ...currentSession, currentIndex: currentSession.currentIndex + 1 };
      set({ currentSession: updatedSession } as unknown as Partial<StudyNavigationSlice>);
    }
  },

  previousCard: () => {
    const state = get() as unknown as { currentSession: StudySession | null };
    const { currentSession } = state;

    if (!currentSession || currentSession.completed) {
      return;
    }

    if (currentSession.currentIndex > 0) {
      const updatedSession = { ...currentSession, currentIndex: currentSession.currentIndex - 1 };
      set({ currentSession: updatedSession } as unknown as Partial<StudyNavigationSlice>);
    }
  },

  getDueCards: () => {
    const state = get() as unknown as {
      cards: Flashcard[];
      cardSrsData: Map<string, SRSData>;
    };
    const { cards, cardSrsData } = state;

    // Create cards with SRS data for filtering
    const cardsWithSrs = cards.map((card) => ({
      id: card.id,
      srsData: cardSrsData.get(card.id) || {
        ...DEFAULT_SRS_DATA,
        nextReview: Date.now(),
      },
    }));

    // Filter due cards (nextReview <= now)
    return cardsWithSrs
      .filter((c) => c.srsData.nextReview <= Date.now())
      .map((c) => {
        const card = cards.find((card) => card.id === c.id);
        if (!card) {
          console.warn(`Card with id ${c.id} not found in cards array`);
          return null;
        }
        return card;
      })
      .filter((c): c is Flashcard => c !== null);
  },
});
