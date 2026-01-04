/**
 * Migration Status Component
 *
 * Displays migration progress and error states to users.
 * Shows loading indicators, progress bars, and error messages.
 *
 * @module agent/MigrationStatus
 * @story 3.2 Phase 2.1 - Add loading states to UI
 * @priority P0 CRITICAL (User experience during migration)
 */

import React from 'react';
import { useMigrationState, useMigrationMessage, useIsMigrating } from '@/infrastructure/persistence/stores/providers/use-migration-state';

/**
 * Migration status display component
 *
 * Shows loading spinner and progress message during migration.
 * Shows error message if migration fails.
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   return (
 *     <>
 *       <MigrationStatus />
 *       <AppContent />
 *     </>
 *   );
 * }
 * ```
 */
export function MigrationStatus(): React.ReactElement | null {
  const phase = useMigrationState((state) => state.phase);
  const progress = useMigrationState((state) => state.progress);
  const message = useMigrationMessage();
  const error = useMigrationState((state) => state.error);

  // Don't render if idle or complete
  if (phase === 'idle' || phase === 'complete') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Loading indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>

        {/* Status message */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {phase === 'backup' && 'Creating Backup'}
            {phase === 'migrating' && 'Migrating'}
            {phase === 'verifying' && 'Verifying'}
            {phase === 'rollback' && 'Rolling Back'}
            {phase === 'error' && 'Migration Failed'}
          </h2>

          <p className="text-sm text-muted-foreground mb-4">
            {message || 'Please wait...'}
          </p>

          {/* Progress bar */}
          {phase !== 'error' && (
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded p-3 mb-4">
              <p className="text-sm text-destructive font-medium mb-1">
                Migration Error
              </p>
              <p className="text-xs text-destructive/80">
                {error}
              </p>
            </div>
          )}

          {/* Warning message */}
          {phase === 'backup' && (
            <p className="text-xs text-muted-foreground mt-4">
              Creating backup before migration. Your data is safe.
            </p>
          )}

          {phase === 'rollback' && (
            <p className="text-xs text-muted-foreground mt-4">
              Rolling back to previous state. No data will be lost.
            </p>
          )}

          {phase === 'verifying' && (
            <p className="text-xs text-muted-foreground mt-4">
              Verifying migration integrity. This will only take a moment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Migration banner for non-blocking status display
 *
 * Shows a smaller banner at the top of the screen when migration is in progress.
 * Use this when you want to allow the user to continue using the app.
 *
 * @example
 * ```tsx
 * function Layout() {
 *   return (
 *     <>
 *       <MigrationBanner />
 *       <MainContent />
 *     </>
 *   );
 * }
 * ```
 */
export function MigrationBanner(): React.ReactElement | null {
  const isMigrating = useIsMigrating();
  const message = useMigrationMessage();

  if (!isMigrating) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-primary text-primary-foreground px-4 py-2 shadow-md">
      <div className="flex items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
        <span className="text-sm font-medium">
          {message || 'Working...'}
        </span>
      </div>
    </div>
  );
}

/**
 * Migration status hook for custom UI
 *
 * Use this if you want to build a custom status display.
 *
 * @example
 * ```tsx
 * function CustomStatus() {
 *   const { phase, progress, error } = useMigrationStatus();
 *
 *   return (
 *     <div>
 *       <div>Phase: {phase}</div>
 *       <div>Progress: {progress}%</div>
 *       {error && <div>Error: {error}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMigrationStatus() {
  const phase = useMigrationState((state) => state.phase);
  const progress = useMigrationState((state) => state.progress);
  const currentStep = useMigrationState((state) => state.currentStep);
  const error = useMigrationState((state) => state.error);
  const backupAvailable = useMigrationState((state) => state.backupAvailable);

  return {
    phase,
    progress,
    currentStep,
    error,
    backupAvailable,
    isMigrating: ['backup', 'migrating', 'verifying', 'rollback'].includes(phase),
    hasError: phase === 'error',
  };
}

/**
 * Migration blocker component
 *
 * Prevents user interaction during migration by blocking clicks.
 * Wrap critical UI sections with this component.
 *
 * @example
 * ```tsx
 * function ProviderConfig() {
 *   return (
 *     <MigrationBlocker>
 *       <ProviderConfigDialog />
 *     </MigrationBlocker>
 *   );
 * }
 * ```
 */
export function MigrationBlocker({ children }: { children: React.ReactNode }): React.ReactElement {
  const isMigrating = useIsMigrating();

  return (
    <div className={isMigrating ? 'pointer-events-none opacity-50' : ''}>
      {children}
    </div>
  );
}
