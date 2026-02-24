/**
 * Migration State Hook
 *
 * Manages loading and error states for provider state migration.
 * Provides UI feedback during backup, migration, and restore operations.
 *
 * @module providers/use-migration-state
 * @story 3.2 Phase 2.1 - Add loading states to UI
 * @priority P0 CRITICAL (User experience during migration)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Migration phases
 */
export type MigrationPhase =
  | 'idle'
  | 'backup'
  | 'migrating'
  | 'verifying'
  | 'complete'
  | 'error'
  | 'rollback';

/**
 * Migration state interface
 */
export interface MigrationState {
  // Current phase
  phase: MigrationPhase;

  // Progress tracking
  progress: number; // 0-100
  currentStep: string;

  // Error handling
  error: string | null;
  errorDetails: any;

  // Timestamps
  startTime: number | null;
  completeTime: number | null;

  // Backup info
  backupTimestamp: number | null;
  backupAvailable: boolean;

  // Actions
  setPhase: (phase: MigrationPhase) => void;
  setProgress: (progress: number, step: string) => void;
  setError: (error: string, details?: any) => void;
  clearError: () => void;
  reset: () => void;
  setBackupAvailable: (timestamp: number) => void;
}

/**
 * Migration state store
 *
 * Uses Zustand with localStorage persistence for crash recovery.
 * If migration is interrupted, UI can show appropriate state on reload.
 */
export const useMigrationState = create<MigrationState>()(
  persist(
    (set) => ({
      // Initial state
      phase: 'idle',
      progress: 0,
      currentStep: '',
      error: null,
      errorDetails: null,
      startTime: null,
      completeTime: null,
      backupTimestamp: null,
      backupAvailable: false,

      // Actions
      setPhase: (phase) => {
        console.log('[MigrationState] Phase:', phase);
        set((state) => ({
          phase,
          startTime: phase === 'backup' && !state.startTime ? Date.now() : state.startTime,
          completeTime: phase === 'complete' ? Date.now() : state.completeTime,
        }));
      },

      setProgress: (progress, step) => {
        console.log(`[MigrationState] Progress: ${progress}% - ${step}`);
        set({ progress, currentStep: step });
      },

      setError: (error, details) => {
        console.error('[MigrationState] Error:', error, details);
        set({
          phase: 'error',
          error,
          errorDetails: details,
          completeTime: Date.now(),
        });
      },

      clearError: () => {
        set({ error: null, errorDetails: null });
      },

      reset: () => {
        console.log('[MigrationState] Resetting');
        set({
          phase: 'idle',
          progress: 0,
          currentStep: '',
          error: null,
          errorDetails: null,
          startTime: null,
          completeTime: null,
        });
      },

      setBackupAvailable: (timestamp) => {
        set({ backupAvailable: true, backupTimestamp: timestamp });
      },
    }),
    {
      name: 'migration-state',
      partialize: (state) => ({
        // Persist error state for crash recovery
        phase: state.phase === 'error' ? 'error' : 'idle',
        error: state.phase === 'error' ? state.error : null,
        backupAvailable: state.backupAvailable,
        backupTimestamp: state.backupTimestamp,

        // Don't persist:
        // - progress, currentStep (ephemeral)
        // - startTime, completeTime (not needed after reload)
      }),
    }
  )
);

/**
 * Hook to check if migration is in progress
 *
 * Use this to block user actions during migration.
 */
export const useIsMigrating = () => {
  const phase = useMigrationState((state) => state.phase);
  return ['backup', 'migrating', 'verifying', 'rollback'].includes(phase);
};

/**
 * Hook to get migration status message
 *
 * Returns user-friendly message based on current phase.
 */
export const useMigrationMessage = () => {
  const phase = useMigrationState((state) => state.phase);
  const currentStep = useMigrationState((state) => state.currentStep);
  const progress = useMigrationState((state) => state.progress);
  const error = useMigrationState((state) => state.error);

  if (error) {
    return `Migration failed: ${error}`;
  }

  switch (phase) {
    case 'backup':
      return currentStep || `Backing up data... ${progress}%`;
    case 'migrating':
      return currentStep || `Migrating... ${progress}%`;
    case 'verifying':
      return 'Verifying migration...';
    case 'rollback':
      return 'Rolling back changes...';
    case 'complete':
      return 'Migration complete!';
    default:
      return null;
  }
};
