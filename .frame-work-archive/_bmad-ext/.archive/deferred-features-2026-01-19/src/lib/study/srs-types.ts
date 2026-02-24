/**
 * @file Stub for archived study module
 * @deprecated This module is archived for MVP
 */

export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export type SRSRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface StudySession {
  id: string;
  cardsStudied: number;
  correctAnswers: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface StudyStats {
  totalCards: number;
  dueCards: number;
  learnedCards: number;
  averageAccuracy: number;
  totalStudyTime: number;
}

export function calculateNextReview(rating: SRSRating): SRSData {
  return {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date(),
  };
}

export const DEFAULT_SRS_DATA: SRSData = {
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  nextReview: new Date(),
};

/**
 * Create a new study session
 */
export function createStudySession(): StudySession {
  return {
    id: `session-${Date.now()}`,
    cardsStudied: 0,
    correctAnswers: 0,
    startedAt: new Date(),
  };
}

/**
 * Complete a study session
 */
export function completeStudySession(session: StudySession): StudySession {
  return {
    ...session,
    completedAt: new Date(),
  };
}

/**
 * Calculate study statistics
 */
export function calculateStudyStats(session: StudySession): StudyStats {
  return {
    totalCards: session.cardsStudied,
    dueCards: 0,
    learnedCards: session.correctAnswers,
    averageAccuracy: session.cardsStudied > 0 
      ? (session.correctAnswers / session.cardsStudied) * 100 
      : 0,
    totalStudyTime: 0,
  };
}
