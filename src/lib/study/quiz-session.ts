/**
 * @fileoverview Quiz session types and utilities for quiz taking
 * @module lib/study/quiz-session
 */

import type { Quiz, QuizQuestion } from './quiz-types';

/**
 * Quiz session state types
 */
export type QuizSessionState = 'intro' | 'in-progress' | 'completed' | 'review';

/**
 * Individual answer in a quiz session
 */
export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

/**
 * Quiz session record
 */
export interface QuizSession {
  quizId: string;
  startTime: number;
  endTime?: number;
  currentQuestionIndex: number;
  answers: Map<string, QuizAnswer>;
  timeSpent: number;
  completed: boolean;
}

/**
 * Quiz result after completion
 */
export interface QuizResult {
  quizId: string;
  sessionId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  timeSpent: number;
  answers: QuizAnswer[];
  completedAt: number;
}

/**
 * Quiz history record for IndexedDB
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

/**
 * Create a new quiz session
 */
export function createQuizSession(quiz: Quiz): QuizSession {
  return {
    quizId: quiz.id,
    startTime: Date.now(),
    currentQuestionIndex: 0,
    answers: new Map(),
    timeSpent: 0,
    completed: false,
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
  const isCorrect = selectedIndex === question.correctIndex;
  const answer: QuizAnswer = {
    questionId: question.id,
    selectedIndex,
    isCorrect,
    timeSpent,
  };

  const newAnswers = new Map(session.answers);
  newAnswers.set(question.id, answer);

  return {
    ...session,
    answers: newAnswers,
  };
}

/**
 * Move to next question
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
 * Move to previous question
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
 * Complete a quiz session
 */
export function completeQuizSession(
  session: QuizSession,
  quiz: Quiz,
  totalTimeSpent: number
): QuizResult {
  let correctAnswers = 0;
  const answers: QuizAnswer[] = [];

  for (const question of quiz.questions) {
    const answer = session.answers.get(question.id);
    if (answer) {
      answers.push(answer);
      if (answer.isCorrect) {
        correctAnswers++;
      }
    }
  }

  const percentage = (correctAnswers / quiz.questions.length) * 100;

  return {
    quizId: quiz.id,
    sessionId: session.quizId,
    quizTitle: quiz.title,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    percentage,
    timeSpent: totalTimeSpent,
    answers,
    completedAt: Date.now(),
  };
}

/**
 * Calculate grade from percentage
 */
export function calculateGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

/**
 * Estimate quiz time (seconds per question)
 */
export function estimateQuizTime(questions: QuizQuestion[], secondsPerQuestion = 30): number {
  return questions.length * secondsPerQuestion;
}

/**
 * Get difficulty breakdown for quiz
 */
export function getDifficultyBreakdown(questions: QuizQuestion[]): Record<string, number> {
  const breakdown = { easy: 0, medium: 0, hard: 0 };
  for (const question of questions) {
    breakdown[question.difficulty]++;
  }
  return breakdown;
}

/**
 * Get topics used in quiz
 */
export function getQuizTopics(questions: QuizQuestion[]): string[] {
  const topics = new Set(questions.map((q) => q.topic));
  return Array.from(topics);
}
