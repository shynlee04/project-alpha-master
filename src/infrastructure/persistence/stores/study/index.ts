/**
 * @fileoverview Study Store Barrel Export
 * @module infrastructure/persistence/stores/study
 * @governance ADR-024 State Management Consolidation, Epic 53
 *
 * CANONICAL LOCATION for study-related stores.
 * Includes Quiz CRUD operations and study session management.
 *
 * @migration-status CANONICAL (Epic 53 Story 53-5)
 * @last-reviewed 2026-01-06
 */

// ============================================================
// Quiz Store (Quiz CRUD operations)
// ============================================================

export { useQuizStore, initializeQuizStore } from './quiz-store';
export type { QuizState } from './quiz-store';

// ============================================================
// Study Store (SRS/Spaced Repetition - Refactored)
// ============================================================

// Re-export main store (backward compatibility - facade pattern)
export { useStudyStore, useStudySession } from '../study-store';
export type { StudyStoreState, StudyState } from '../study-store';

// Re-export refactored store (new canonical location)
export { useStudyStore as useStudyStoreRefactored } from './study-store-refactored';
export type { StudyStoreState as StudyStoreStateRefactored } from './study-store-refactored';

// Re-export database (for backward compatibility)
export { StudyDatabase, getStudyDb, setStudyDbForTesting } from './slices/study-database-slice';
export type { StudySessionRecord, StudyCardRecord } from './slices/study-database-slice';

// Re-export slices (for composition)
export { createStudyDatabaseSlice } from './slices/study-database-slice';
export type { StudyDatabaseSlice, StudyDatabaseState, StudyDatabaseActions } from './slices/study-database-slice';

export { createStudySessionSlice } from './slices/study-session-slice';
export type { StudySessionSlice, StudySessionState, StudySessionActions } from './slices/study-session-slice';

export { createStudyNavigationSlice } from './slices/study-navigation-slice';
export type { StudyNavigationSlice, StudyNavigationState, StudyNavigationActions } from './slices/study-navigation-slice';

export { createStudyStatsSlice } from './slices/study-stats-slice';
export type { StudyStatsSlice, StudyStatsState, StudyStatsActions } from './slices/study-stats-slice';
