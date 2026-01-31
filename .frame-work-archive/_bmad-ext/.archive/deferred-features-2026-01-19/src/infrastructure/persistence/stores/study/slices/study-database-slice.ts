/**
 * @fileoverview Study Database Slice - Dexie persistence layer
 * @module infrastructure/persistence/stores/study/slices/study-database-slice
 */

import Dexie from 'dexie';
import type { SRSData } from '@/lib/study/srs-types';

// ============================================================================
// Database Schema
// ============================================================================

/**
 * Study session record for IndexedDB
 */
export interface StudySessionRecord {
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
export interface StudyCardRecord {
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

// ============================================================================
// Singleton Instance Management
// ============================================================================

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

// ============================================================================
// Persistence Functions
// ============================================================================

/**
 * Persist a study card with SRS data to IndexedDB
 */
export async function persistStudyCard(
    cardId: string,
    sessionId: string,
    srsData: SRSData,
    rating: string
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
export async function persistStudySession(session: {
    id: string;
    cardIds: string[];
    currentIndex: number;
    startTime: number;
    endTime?: number;
    ratings: Map<string, string>;
    completed: boolean;
}): Promise<void> {
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
 * Initialize study store from IndexedDB
 */
export async function initializeStudyState(): Promise<{
    totalCardsStudied: number;
    currentStreak: number;
}> {
    try {
        const db = getSafeStudyDb();
        if (!db) {
            return { totalCardsStudied: 0, currentStreak: 0 };
        }

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

        return { totalCardsStudied: totalStudied, currentStreak: maxStreak };
    } catch (error) {
        console.error('Failed to initialize study state:', error);
        return { totalCardsStudied: 0, currentStreak: 0 };
    }
}

/**
 * Calculate streak from ratings
 */
export function calculateStreakFromRatings(ratings: string[]): number {
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

// ============================================================================
// Slice Interface
// ============================================================================

export interface StudyDatabaseState {
    /** Total cards studied across all sessions */
    totalCardsStudied: number;
    /** Current consecutive correct answer streak */
    currentStreak: number;
}

export interface StudyDatabaseActions {
    /** Clear all study data from IndexedDB and state */
    clearAll: () => Promise<void>;
}

export type StudyDatabaseSlice = StudyDatabaseState & StudyDatabaseActions;

// ============================================================================
// Slice Implementation
// ============================================================================

import { StateCreator } from 'zustand';

export const createStudyDatabaseSlice: StateCreator<
    StudyDatabaseSlice,
    [],
    [],
    StudyDatabaseSlice
> = (set, _get, _api) => ({
    totalCardsStudied: 0,
    currentStreak: 0,

    clearAll: async () => {
        const db = getSafeStudyDb();
        if (!db) return;
        await db.transaction('rw', 'studySessions', 'studyCards', async () => {
            await db.table('studySessions').clear();
            await db.table('studyCards').clear();
        });
        set({
            totalCardsStudied: 0,
            currentStreak: 0,
        });
    },
});
