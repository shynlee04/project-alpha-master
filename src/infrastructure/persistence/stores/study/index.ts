/**
 * @fileoverview Study Store Barrel Export
 * @module infrastructure/persistence/stores/study
 * @governance ADR-024 State Management Consolidation, Epic 53
 *
 * CANONICAL LOCATION for study-related stores.
 * Includes Quiz CRUD operations and study session management.
 *
 * @migration-status CANONICAL (Epic 53 Story 53-5)
 * @last-reviewed 2026-01-04
 */

// Quiz Store (Quiz CRUD operations)
export { useQuizStore, initializeQuizStore } from './quiz-store';
export type { QuizState } from './quiz-store';

// Note: study-store.ts (SRS/Spaced Repetition) remains in lib/state
// as it's complementary to quiz-store, not a replacement
