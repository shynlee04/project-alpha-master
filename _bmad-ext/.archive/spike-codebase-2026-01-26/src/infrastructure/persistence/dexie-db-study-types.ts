/**
 * @fileoverview Study Database Types - Consolidated Tables
 * @module infrastructure/persistence/dexie-db-study-types
 *
 * Type definitions for consolidated study tables in ViaGentDatabase.
 * Consolidates tables from FlashcardDB, StudyDB, and QuizDB.
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-03 - Consolidate Dexie Databases
 */

import type { Table } from 'dexie';

// ============================================================================
// Flashcard Types (from FlashcardDB)
// ============================================================================

/**
 * Flashcard record for IndexedDB persistence
 */
export interface FlashcardRecord {
  id: string;
  workspaceId: string;
  projectId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  sourceIds: string[];
  createdAt: number;
  updatedAt?: number;
}

/**
 * Flashcard set record for IndexedDB persistence
 */
export interface FlashcardSetRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  name: string;
  description?: string;
  cardIds: string[];
  sourceIds: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Study Session Types (from StudyDB)
// ============================================================================

/**
 * Study session record for IndexedDB
 */
export interface StudySessionRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
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
  workspaceId: string;
  cardId: string;
  sessionId?: string;
  srsData: string; // JSON stringified SRSData
  lastRating?: string;
}

// ============================================================================
// Quiz Types (from QuizDB)
// ============================================================================

/**
 * Quiz record for IndexedDB
 */
export interface QuizRecord {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  description?: string;
  questionIds: string[];
  sourceIds: string[];
  settings: string; // JSON stringified QuizSettings
  createdAt: number;
  updatedAt: number;
}

/**
 * Quiz question record for IndexedDB
 */
export interface QuizQuestionRecord {
  id: string;
  workspaceId: string;
  quizId: string;
  question: string;
  options: string[]; // JSON stringified for IndexedDB
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  sourceIds: string[];
  createdAt: number;
}

// ============================================================================
// Table Type Aliases
// ============================================================================

export type FlashcardsTable = Table<FlashcardRecord, string, FlashcardRecord>;
export type FlashcardSetsTable = Table<FlashcardSetRecord, string, FlashcardSetRecord>;
export type StudySessionsTable = Table<StudySessionRecord, string, StudySessionRecord>;
export type StudyCardsTable = Table<StudyCardRecord, string, StudyCardRecord>;
export type QuizzesTable = Table<QuizRecord, string, QuizRecord>;
export type QuizQuestionsTable = Table<QuizQuestionRecord, string, QuizQuestionRecord>;
