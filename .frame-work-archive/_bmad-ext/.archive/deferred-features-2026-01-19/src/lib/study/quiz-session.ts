/**
 * @file Stub for archived study module
 * @deprecated This module is archived for MVP
 */

import type { Quiz, QuizQuestion, QuizResult, QuizAnswer } from './quiz-types';

// Re-export types and functions from quiz-types for convenience
export type { QuizAnswer, QuizResult } from './quiz-types';
export { calculateGrade } from './quiz-types';

/**
 * Extended QuizSession interface for hook compatibility
 */
export interface QuizSession {
  quizId: string;
  currentQuestionIndex: number;
  answers: Map<string, { selectedIndex: number; timeSpent: number }>;
  startedAt: Date;
  startTime: number;
  completed?: boolean;
  endTime?: number;
}

/**
 * Create a new quiz session
 */
export function createQuizSession(quiz: Quiz): QuizSession {
  return {
    quizId: quiz.id,
    currentQuestionIndex: 0,
    answers: new Map(),
    startedAt: new Date(),
    startTime: Date.now(),
  };
}

/**
 * Select an answer for the current question
 */
export function selectAnswer(
  session: QuizSession,
  question: QuizQuestion,
  selectedIndex: number,
  timeSpent: number
): QuizSession {
  const newAnswers = new Map(session.answers);
  newAnswers.set(question.id, { selectedIndex, timeSpent });
  return {
    ...session,
    answers: newAnswers,
  };
}

/**
 * Move to the next question
 */
export function nextQuestion(session: QuizSession, totalQuestions: number): QuizSession {
  if (session.currentQuestionIndex < totalQuestions - 1) {
    return {
      ...session,
      currentQuestionIndex: session.currentQuestionIndex + 1,
    };
  }
  return session;
}

/**
 * Move to the previous question
 */
export function previousQuestion(session: QuizSession): QuizSession {
  if (session.currentQuestionIndex > 0) {
    return {
      ...session,
      currentQuestionIndex: session.currentQuestionIndex - 1,
    };
  }
  return session;
}

/**
 * Complete the quiz session and return results
 */
export function completeQuizSession(
  session: QuizSession,
  quiz: Quiz,
  _timeSpent: number
): QuizResult {
  const answers: QuizAnswer[] = [];
  let correctAnswers = 0;

  session.answers.forEach((answer, questionId) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    const isCorrect = question ? question.correctAnswer === answer.selectedIndex : false;
    if (isCorrect) correctAnswers++;
    
    answers.push({
      questionId,
      selectedAnswer: answer.selectedIndex,
      isCorrect,
      timeSpentMs: answer.timeSpent,
    });
  });

  const score = quiz.questions.length > 0 
    ? Math.round((correctAnswers / quiz.questions.length) * 100) 
    : 0;

  return {
    quizId: quiz.id,
    answers,
    score,
    completedAt: new Date(),
  };
}

export function getDifficultyBreakdown(): Record<string, number> {
  return {};
}

export function estimateQuizTime(): number {
  return 0;
}

export function getQuizTopics(): string[] {
  return [];
}

/**
 * Quiz history record for persistence
 */
export interface QuizHistoryRecord {
  id: string;
  quizId: string;
  projectId: string;
  startedAt: number;
  completedAt?: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
}
