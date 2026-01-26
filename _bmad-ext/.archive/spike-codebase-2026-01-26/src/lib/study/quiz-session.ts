/**
 * @fileoverview Quiz session types (stub for deferred Study workspace)
 * @module lib/study/quiz-session
 * @status DEFERRED - Study workspace is post-MVP
 */

/**
 * Quiz result type
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface QuizResult {
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  timeSpent: number;
  completedAt: number;
}

/**
 * Quiz history record type
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface QuizHistoryRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  timeSpent: number;
  completedAt: number;
}
