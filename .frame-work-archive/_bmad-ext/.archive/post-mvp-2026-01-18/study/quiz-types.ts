/**
 * @fileoverview Quiz types
 * @module lib/study/quiz-types
 *
 * **DEFERRED - Post-MVP Archive**
 */

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  tags?: string[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSettings {
  timeLimit?: number; // minutes
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanations: boolean;
  passingScore: number; // percentage
  allowRetakes: boolean;
}

export interface QuizSession {
  id: string;
  quizId: string;
  userId?: string;
  answers: QuizAnswer[];
  score: number;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // seconds
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  timeSpent: number; // seconds
}

export interface QuizResult {
  sessionId: string;
  quizId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  timeSpent: number;
  questionResults: {
    questionId: string;
    correct: boolean;
    userAnswer: string | string[];
    correctAnswer: string | string[];
  }[];
}
