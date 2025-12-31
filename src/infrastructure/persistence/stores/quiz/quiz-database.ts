/**
 * @fileoverview Quiz database schema and initialization
 * @module infrastructure/persistence/stores/quiz/quiz-database
 */

import Dexie, { type Table } from 'dexie';

/**
 * Quiz record for IndexedDB storage
 */
export interface QuizRecord {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
  sourceIds: string[];
  settings: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Quiz question record for IndexedDB storage
 */
export interface QuizQuestionRecord {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

/**
 * Dexie database for quiz persistence
 */
export class QuizDatabase extends Dexie {
  quizzes!: Table<QuizRecord>;
  quizQuestions!: Table<QuizQuestionRecord>;

  constructor() {
    super('ProjectAlphaQuizDB');
    this.version(1).stores({
      quizzes: 'id, title, createdAt, topic, *sourceIds',
      quizQuestions: 'id, quizId, difficulty, topic, *sourceIds',
    });
  }
}

// Lazy initialization of database
let db: QuizDatabase | null = null;

/**
 * Get or create the quiz database instance
 */
export function getQuizDB(): QuizDatabase {
  if (!db) {
    db = new QuizDatabase();
  }
  return db;
}
