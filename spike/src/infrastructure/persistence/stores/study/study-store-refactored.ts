/**
 * @fileoverview Study store refactored (stub for deferred Study workspace)
 * @module infrastructure/persistence/stores/study/study-store-refactored
 * @status DEFERRED - Study workspace is post-MVP
 *
 * This is a stub file that exports empty implementations.
 * The actual study functionality will be implemented when
 * the Study workspace epic begins.
 */

import { create } from 'zustand';

/**
 * Study store state interface (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export interface StudyStoreState {
  sessions: never[];
  currentSession: null;
  isLoading: boolean;
  error: null;
}

/**
 * Study state type alias (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export type StudyState = StudyStoreState;

/**
 * Study store (stub implementation)
 * @deprecated Study workspace is deferred to post-MVP
 */
export const useStudyStore = create<StudyStoreState>(() => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,
}));

/**
 * Study session hook (stub)
 * @deprecated Study workspace is deferred to post-MVP
 */
export function useStudySession() {
  const store = useStudyStore();
  return {
    session: store.currentSession,
    isLoading: store.isLoading,
    error: store.error,
  };
}
