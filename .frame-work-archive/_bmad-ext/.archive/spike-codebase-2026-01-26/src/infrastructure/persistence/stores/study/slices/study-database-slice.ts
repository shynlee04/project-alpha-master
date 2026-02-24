/**
 * @fileoverview Study database slice (stub for deferred Study workspace)
 * @module infrastructure/persistence/stores/study/slices/study-database-slice
 * @status DEFERRED - Study workspace is post-MVP
 */

import Dexie from 'dexie';

/**
 * Study session record type (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface StudySessionRecord {
  id: string;
  projectId: string;
  startedAt: number;
  endedAt?: number;
  cardCount: number;
}

/**
 * Study card record type (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface StudyCardRecord {
  id: string;
  sessionId: string;
  flashcardId: string;
  rating: number;
  reviewedAt: number;
}

/**
 * Study database class (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export class StudyDatabase extends Dexie {
  constructor() {
    super('ProjectAlphaStudyDB');
    this.version(1).stores({
      sessions: 'id, projectId, startedAt',
      cards: 'id, sessionId, flashcardId',
    });
  }
}

// Lazy initialization
let db: StudyDatabase | null = null;

/**
 * Get study database instance (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export function getStudyDb(): StudyDatabase {
  if (!db) {
    db = new StudyDatabase();
  }
  return db;
}

/**
 * Set study database for testing (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export function setStudyDbForTesting(testDb: StudyDatabase | null): void {
  db = testDb;
}
