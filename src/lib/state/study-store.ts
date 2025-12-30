/**
 * @fileoverview Study session store with Dexie persistence for SRS data
 * @module lib/state/study-store
 */

import { create } from 'zustand';
import Dexie from 'dexie';
import type { Flashcard } from '../knowledge/types';
import type { SRSData, SRSRating, StudySession, StudyStats } from '../study/srs-types';
import {
  calculateNextReview,
  isCardDue,
  getDueCards,
  calculateStudyStats,
  createStudySession,
  completeStudySession,
  DEFAULT_SRS_DATA,
} from '../study/srs-types';

// ============================================================
// IndexedDB database for study session persistence
// ============================================================

/**
 * Study session record for IndexedDB
 */
interface StudySessionRecord {
  id: string;
  cardIds: string[];
  currentIndex: number;
  startTime: number;
  endTime?: number;
  ratings: string; // JSON stringified Map<string, SRSRating>
  completed: boolean;
}

/**
 * Study card record with SRS data for IndexedDB
 */
interface StudyCardRecord {
  id: string;
  cardId: string;
  sessionId?: string;
  srsData: string; // JSON stringified SRSData
  lastRating?: string;
}

/**
 * Study session database class extending Dexie
 */
export class StudyDatabase extends Dexie {
  studySessions!: Dexie.Table<StudySessionRecord, string>;
  studyCards!: Dexie.Table<StudyCardRecord, string>;

  constructor() {
    super('StudyDB');
    this.version(1).stores({
      studySessions: 'id, startTime, completed',
      studyCards: 'id, cardId, sessionId, *srsData',
    });
  }
}

// Singleton instance
let studyDbInstance: StudyDatabase | null = null;

export function getStudyDb(): StudyDatabase {
  if (!studyDbInstance) {
    studyDbInstance = new StudyDatabase();
  }
  return studyDbInstance;
}

export function setStudyDbForTesting(db: StudyDatabase | null): void {
  studyDbInstance = db;
}

// For backwards compatibility - lazy initialization to avoid SSR issues
const getSafeStudyDb = (): StudyDatabase | null => {
  if (typeof window === 'undefined') return null;
  return getStudyDb();
};

// ============================================================
// Study Store State
// ============================================================

interface StudyStoreState {
  // Study session
  currentSession: StudySession | null;
  cards: Flashcard[];
  cardSrsData: Map<string, SRSData>;

  // Statistics
  sessionStats: StudyStats | null;
  totalCardsStudied: number;
  currentStreak: number;

  // UI State
  isLoading: boolean;
  error: string | null;

  // Actions
  startSession: (cards: Flashcard[]) => StudySession;
  rateCard: (rating: SRSRating) => void;
  nextCard: () => void;
  previousCard: () => void;
  completeSession: () => StudyStats;
  getDueCards: () => Flashcard[];
  getCardSrsData: (cardId: string) => SRSData;
  updateCardSrsData: (cardId: string, srsData: SRSData) => void;
  resetCurrentSession: () => void;
  clearAll: () => Promise<void>;
}

// ============================================================
// Study Store Implementation
// ============================================================

export const useStudyStore = create<StudyStoreState>((set, get) => ({
  currentSession: null,
  cards: [],
  cardSrsData: new Map(),
  sessionStats: null,
  totalCardsStudied: 0,
  currentStreak: 0,
  isLoading: false,
  error: null,

  startSession: (cards: Flashcard[]) => {
    // Get cards with their SRS data
    const cardSrsData = get().cardSrsData;

    // Filter to only include cards that are due or new
    const dueCards = cards.filter((card) => {
      const srsData = cardSrsData.get(card.id);
      return !srsData || isCardDue(srsData);
    });

    if (dueCards.length === 0) {
      // If no cards are due, use all cards
      dueCards.push(...cards);
    }

    const session = createStudySession(dueCards.map((c) => c.id));

    set({
      cards: dueCards,
      currentSession: session,
      sessionStats: null,
    });

    return session;
  },

  rateCard: (rating: SRSRating) => {
    const { currentSession, cards, cardSrsData } = get();

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
    cardSrsData.set(currentCard.id, newSrsData);

    set({
      cardSrsData: new Map(cardSrsData),
    });

    // Persist to IndexedDB
    persistStudyCard(currentCard.id, currentSession.id, newSrsData, rating);
  },

  nextCard: () => {
    const { currentSession, cards } = get();

    if (!currentSession || currentSession.completed) {
      return;
    }

    if (currentSession.currentIndex < cards.length - 1) {
      currentSession.currentIndex++;
      set({ currentSession: { ...currentSession } });
    }
  },

  previousCard: () => {
    const { currentSession } = get();

    if (!currentSession || currentSession.completed) {
      return;
    }

    if (currentSession.currentIndex > 0) {
      currentSession.currentIndex--;
      set({ currentSession: { ...currentSession } });
    }
  },

  completeSession: () => {
    const { currentSession, cards, cardSrsData } = get();

    if (!currentSession) {
      throw new Error('No active session');
    }

    // Complete the session
    const completedSession = completeStudySession(currentSession);

    // Calculate statistics
    const stats = calculateStudyStats(completedSession);

    // Update streak
    const newStreak = calculateStreakFromRatings(
      Array.from(completedSession.ratings.values())
    );

    // Save session to IndexedDB
    persistStudySession(completedSession);

    // Update totals
    set({
      currentSession: completedSession,
      sessionStats: stats,
      totalCardsStudied: get().totalCardsStudied + stats.cardsStudied,
      currentStreak: newStreak,
    });

    return stats;
  },

  getDueCards: () => {
    const { cards, cardSrsData } = get();

    // Create cards with SRS data for filtering
    const cardsWithSrs = cards.map((card) => ({
      id: card.id,
      srsData: cardSrsData.get(card.id) || {
        ...DEFAULT_SRS_DATA,
        nextReview: Date.now(),
      },
    }));

    return getDueCards(cardsWithSrs as readonly { id: string; srsData: SRSData }[]).map(
      (c) => {
        const card = cards.find((card) => card.id === c.id);
        if (!card) {
          console.warn(`Card with id ${c.id} not found in cards array`);
          return null;
        }
        return card;
      }
    ).filter((c): c is Flashcard => c !== null);
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

  resetCurrentSession: () => {
    set({
      currentSession: null,
      cards: [],
      sessionStats: null,
    });
  },

  clearAll: async () => {
    const db = getSafeStudyDb();
    if (!db) return;
    await db.transaction('rw', 'studySessions', 'studyCards', async () => {
      await db.table('studySessions').clear();
      await db.table('studyCards').clear();
    });
    set({
      currentSession: null,
      cards: [],
      cardSrsData: new Map(),
      sessionStats: null,
      totalCardsStudied: 0,
      currentStreak: 0,
    });
  },
}));

// ============================================================
// Helper Functions
// ============================================================

/**
 * Persist a study card with SRS data to IndexedDB
 */
async function persistStudyCard(
  cardId: string,
  sessionId: string,
  srsData: SRSData,
  rating: SRSRating
): Promise<void> {
  try {
    const db = getSafeStudyDb();
    if (!db) return;
    await db.table('studyCards').put({
      id: `sc-${cardId}-${sessionId}`,
      cardId,
      sessionId,
      srsData: JSON.stringify(srsData),
      lastRating: rating,
    });
  } catch (error) {
    console.error('Failed to persist study card:', error);
  }
}

/**
 * Persist a completed study session to IndexedDB
 */
async function persistStudySession(session: StudySession): Promise<void> {
  try {
    const db = getSafeStudyDb();
    if (!db) return;
    await db.table('studySessions').put({
      id: session.id,
      cardIds: session.cardIds,
      currentIndex: session.currentIndex,
      startTime: session.startTime,
      endTime: session.endTime,
      ratings: JSON.stringify(Array.from(session.ratings.entries())),
      completed: session.completed,
    });
  } catch (error) {
    console.error('Failed to persist study session:', error);
  }
}

/**
 * Calculate streak from ratings
 */
function calculateStreakFromRatings(ratings: SRSRating[]): number {
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

// ============================================================
// Initialize store from IndexedDB
// ============================================================

async function initializeStudyStore(): Promise<void> {
  try {
    const db = getSafeStudyDb();
    if (!db) return;
    // Load total cards studied
    const sessions = await db.table('studySessions').toArray();
    let totalStudied = 0;
    let maxStreak = 0;

    for (const session of sessions) {
      if (session.completed) {
        const ratings = new Map(JSON.parse(session.ratings));
        totalStudied += session.cardIds.length;

        // Calculate streak for this session
        let sessionStreak = 0;
        for (const [, rating] of ratings) {
          if (rating === 'good' || rating === 'easy') {
            sessionStreak++;
          } else {
            break;
          }
        }
        maxStreak = Math.max(maxStreak, sessionStreak);
      }
    }

    useStudyStore.setState({
      totalCardsStudied: totalStudied,
      currentStreak: maxStreak,
    });
  } catch (error) {
    console.error('Failed to initialize study store:', error);
  }
}

// Only initialize in browser environment
if (typeof window !== 'undefined') {
  initializeStudyStore();
}

// ============================================================
// Study Session Hook
// ============================================================

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
