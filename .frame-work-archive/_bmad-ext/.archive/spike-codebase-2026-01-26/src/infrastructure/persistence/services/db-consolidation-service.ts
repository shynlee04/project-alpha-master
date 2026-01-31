/**
 * @fileoverview Database Consolidation Service
 * @module infrastructure/persistence/services/db-consolidation-service
 *
 * Service to migrate data from separate databases (FlashcardDB, StudyDB, QuizDB)
 * into the consolidated ViaGentDatabase.
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-03 - Consolidate Dexie Databases
 */

import Dexie from 'dexie';
import { db } from '../dexie-db';
import type {
  FlashcardRecord,
  FlashcardSetRecord,
  StudySessionRecord,
  StudyCardRecord,
  QuizRecord,
  QuizQuestionRecord,
} from '../dexie-db-study-types';

// ============================================================================
// Consolidation Status
// ============================================================================

const CONSOLIDATION_STATUS_KEY = 'via-gent-db-consolidation-v21';

interface ConsolidationStatus {
  flashcardsConsolidated: boolean;
  studyConsolidated: boolean;
  quizzesConsolidated: boolean;
  completedAt?: number;
}

function getConsolidationStatus(): ConsolidationStatus {
  if (typeof localStorage === 'undefined') {
    return { flashcardsConsolidated: false, studyConsolidated: false, quizzesConsolidated: false };
  }
  try {
    const stored = localStorage.getItem(CONSOLIDATION_STATUS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { flashcardsConsolidated: false, studyConsolidated: false, quizzesConsolidated: false };
}

function setConsolidationStatus(status: ConsolidationStatus): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CONSOLIDATION_STATUS_KEY, JSON.stringify(status));
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// Legacy Database Access
// ============================================================================

/**
 * Open a legacy database for reading only
 */
async function openLegacyDb(name: string, version: number, stores: Record<string, string>): Promise<Dexie | null> {
  try {
    const db = new Dexie(name);
    db.version(version).stores(stores);
    await db.open();
    return db;
  } catch (error) {
    console.log(`[DB Consolidation] Legacy database ${name} not found or empty:`, error);
    return null;
  }
}

// ============================================================================
// Consolidation Functions
// ============================================================================

/**
 * Consolidate flashcards from FlashcardDB
 */
async function consolidateFlashcards(): Promise<number> {
  const status = getConsolidationStatus();
  if (status.flashcardsConsolidated) {
    console.log('[DB Consolidation] Flashcards already consolidated, skipping');
    return 0;
  }

  const legacyDb = await openLegacyDb('FlashcardDB', 1, {
    flashcards: 'id, topic, difficulty, createdAt, *sourceIds',
    flashcardSets: 'id, name, createdAt, updatedAt, *cardIds',
  });

  if (!legacyDb) {
    // No legacy database, mark as done
    setConsolidationStatus({ ...status, flashcardsConsolidated: true });
    return 0;
  }

  try {
    let count = 0;

    // Migrate flashcards
    const flashcards = await legacyDb.table('flashcards').toArray();
    for (const card of flashcards) {
      const record: FlashcardRecord = {
        id: card.id,
        workspaceId: card.workspaceId || 'study',
        projectId: card.projectId || 'default',
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        topic: card.topic,
        sourceIds: card.sourceIds || [],
        createdAt: card.createdAt,
        updatedAt: Date.now(),
      };
      await db.flashcards.put(record);
      count++;
    }

    // Migrate flashcard sets
    const sets = await legacyDb.table('flashcardSets').toArray();
    for (const set of sets) {
      const record: FlashcardSetRecord = {
        id: set.id,
        workspaceId: set.workspaceId || 'study',
        projectId: set.projectId,
        name: set.name,
        description: set.description,
        cardIds: set.cardIds || [],
        sourceIds: set.sourceIds || [],
        createdAt: set.createdAt,
        updatedAt: set.updatedAt || Date.now(),
      };
      await db.flashcardSets.put(record);
      count++;
    }

    await legacyDb.close();
    setConsolidationStatus({ ...status, flashcardsConsolidated: true });
    console.log(`[DB Consolidation] Migrated ${count} flashcard records`);
    return count;
  } catch (error) {
    console.error('[DB Consolidation] Failed to consolidate flashcards:', error);
    await legacyDb.close();
    return 0;
  }
}

/**
 * Consolidate study sessions from StudyDB
 */
async function consolidateStudy(): Promise<number> {
  const status = getConsolidationStatus();
  if (status.studyConsolidated) {
    console.log('[DB Consolidation] Study data already consolidated, skipping');
    return 0;
  }

  const legacyDb = await openLegacyDb('StudyDB', 1, {
    studySessions: 'id, startTime, completed',
    studyCards: 'id, cardId, sessionId, *srsData',
  });

  if (!legacyDb) {
    setConsolidationStatus({ ...status, studyConsolidated: true });
    return 0;
  }

  try {
    let count = 0;

    // Migrate study sessions
    const sessions = await legacyDb.table('studySessions').toArray();
    for (const session of sessions) {
      const record: StudySessionRecord = {
        id: session.id,
        workspaceId: session.workspaceId || 'study',
        projectId: session.projectId,
        cardIds: session.cardIds || [],
        currentIndex: session.currentIndex || 0,
        startTime: session.startTime,
        endTime: session.endTime,
        ratings: session.ratings || '[]',
        completed: session.completed || false,
      };
      await db.studySessions.put(record);
      count++;
    }

    // Migrate study cards
    const cards = await legacyDb.table('studyCards').toArray();
    for (const card of cards) {
      const record: StudyCardRecord = {
        id: card.id,
        workspaceId: card.workspaceId || 'study',
        cardId: card.cardId,
        sessionId: card.sessionId,
        srsData: card.srsData || '{}',
        lastRating: card.lastRating,
      };
      await db.studyCards.put(record);
      count++;
    }

    await legacyDb.close();
    setConsolidationStatus({ ...status, studyConsolidated: true });
    console.log(`[DB Consolidation] Migrated ${count} study records`);
    return count;
  } catch (error) {
    console.error('[DB Consolidation] Failed to consolidate study data:', error);
    await legacyDb.close();
    return 0;
  }
}

/**
 * Consolidate quizzes from ProjectAlphaQuizDB
 */
async function consolidateQuizzes(): Promise<number> {
  const status = getConsolidationStatus();
  if (status.quizzesConsolidated) {
    console.log('[DB Consolidation] Quizzes already consolidated, skipping');
    return 0;
  }

  const legacyDb = await openLegacyDb('ProjectAlphaQuizDB', 2, {
    quizzes: 'id, workspaceId, title, createdAt, topic, *sourceIds',
    quizQuestions: 'id, workspaceId, quizId, difficulty, topic, *sourceIds',
  });

  if (!legacyDb) {
    setConsolidationStatus({ ...status, quizzesConsolidated: true });
    return 0;
  }

  try {
    let count = 0;

    // Migrate quizzes
    const quizzes = await legacyDb.table('quizzes').toArray();
    for (const quiz of quizzes) {
      const record: QuizRecord = {
        id: quiz.id,
        workspaceId: quiz.workspaceId || 'study',
        projectId: quiz.projectId,
        title: quiz.title,
        description: quiz.description,
        questionIds: quiz.questionIds || [],
        sourceIds: quiz.sourceIds || [],
        settings: typeof quiz.settings === 'string' ? quiz.settings : JSON.stringify(quiz.settings || {}),
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt || Date.now(),
      };
      await db.quizzes.put(record);
      count++;
    }

    // Migrate quiz questions
    const questions = await legacyDb.table('quizQuestions').toArray();
    for (const q of questions) {
      const record: QuizQuestionRecord = {
        id: q.id,
        workspaceId: q.workspaceId || 'study',
        quizId: q.quizId,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: q.correctIndex,
        explanation: q.explanation || '',
        difficulty: q.difficulty,
        topic: q.topic || '',
        sourceIds: q.sourceIds || [],
        createdAt: q.createdAt,
      };
      await db.quizQuestions.put(record);
      count++;
    }

    await legacyDb.close();
    setConsolidationStatus({ ...status, quizzesConsolidated: true });
    console.log(`[DB Consolidation] Migrated ${count} quiz records`);
    return count;
  } catch (error) {
    console.error('[DB Consolidation] Failed to consolidate quizzes:', error);
    await legacyDb.close();
    return 0;
  }
}

// ============================================================================
// Main Consolidation Entry Point
// ============================================================================

/**
 * Run database consolidation if needed.
 * Safe to call multiple times - idempotent.
 * 
 * @returns Total number of records migrated
 */
export async function runDatabaseConsolidation(): Promise<number> {
  if (typeof window === 'undefined') {
    // SSR - skip
    return 0;
  }

  const status = getConsolidationStatus();
  if (status.flashcardsConsolidated && status.studyConsolidated && status.quizzesConsolidated) {
    console.log('[DB Consolidation] All databases already consolidated');
    return 0;
  }

  console.log('[DB Consolidation] Starting database consolidation...');
  
  let total = 0;
  total += await consolidateFlashcards();
  total += await consolidateStudy();
  total += await consolidateQuizzes();

  // Mark complete
  const newStatus = getConsolidationStatus();
  if (newStatus.flashcardsConsolidated && newStatus.studyConsolidated && newStatus.quizzesConsolidated) {
    setConsolidationStatus({ ...newStatus, completedAt: Date.now() });
  }

  console.log(`[DB Consolidation] Complete. Total records migrated: ${total}`);
  return total;
}

/**
 * Check if consolidation is complete
 */
export function isConsolidationComplete(): boolean {
  const status = getConsolidationStatus();
  return status.flashcardsConsolidated && status.studyConsolidated && status.quizzesConsolidated;
}

/**
 * Reset consolidation status (for testing/debugging)
 */
export function resetConsolidationStatus(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(CONSOLIDATION_STATUS_KEY);
}
