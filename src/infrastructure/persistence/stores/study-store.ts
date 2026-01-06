/**
 * @fileoverview Study session store with Dexie persistence for SRS data
 * @module lib/state/study-store
 *
 * ⚠️ DEPRECATED: This file now re-exports from the refactored store.
 * New imports should use: @/infrastructure/persistence/stores/study/study-store-refactored
 *
 * Breaking Changes:
 * - StudyDatabase, getStudyDb, setStudyDbForTesting now exported from study-database-slice
 * - All slice types now exported from their respective slice files
 */

// Re-export from refactored store for backward compatibility
export {
  useStudyStore,
  useStudySession,
  type StudyStoreState,
  type StudyState,
} from './study/study-store-refactored';

// Re-export database types for backward compatibility
export type { StudySessionRecord, StudyCardRecord } from './study/slices/study-database-slice';

// Re-export database class and helpers for backward compatibility
export { StudyDatabase, getStudyDb, setStudyDbForTesting } from './study/slices/study-database-slice';

// ============================================================
// Legacy Code (kept for reference, no longer used)
// TODO: Remove after verifying all imports have been migrated
// ============================================================

/*
LEGACY IMPLEMENTATION REMOVED - Refactored into 4 slices:
- study-database-slice.ts: Database class, initialization, persistence
- study-session-slice.ts: Session CRUD, SRS data management
- study-navigation-slice.ts: Card rating and navigation
- study-stats-slice.ts: Statistics and streak tracking
- study-store-refactored.ts: Combined store with all slices
*/
