/**
 * @fileoverview LiveRegion - ARIA Live Region for Screen Reader Announcements
 * @module presentation/components/layout/LiveRegion
 * @story UXUI-03-11
 * @team Team B
 * @created 2026-01-28
 *
 * Provides accessible announcements for sync status changes.
 * Uses aria-live="polite" to announce status changes without interrupting
 * the user. Visually hidden using sr-only class.
 *
 * @accessibility
 * - aria-live="polite": Announces changes when user is idle
 * - aria-atomic="true": Announces entire content as a unit
 * - role="status": Indicates this is a status message
 * - sr-only class: Visually hidden but accessible to screen readers
 */

import { useTranslation } from 'react-i18next';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Sync status states supported by LiveRegion
 */
export type LiveRegionSyncStatus = 'syncing' | 'synced' | 'error' | 'idle';

/**
 * LiveRegion Props
 */
export interface LiveRegionProps {
  /** Current sync status to announce */
  syncStatus: LiveRegionSyncStatus;
  /** Optional additional CSS class names */
  className?: string;
  /** Optional custom message override (for testing) */
  customMessage?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Default announcement messages for each sync status
 */
const DEFAULT_ANNOUNCEMENTS: Record<LiveRegionSyncStatus, string> = {
  syncing: 'Syncing files...',
  synced: 'All files synced',
  error: 'Sync error. Please retry.',
  idle: '',
};

/**
 * Gets the appropriate announcement message for the sync status
 */
function getSyncAnnouncement(status: LiveRegionSyncStatus, t: (key: string) => string): string {
  const key = `liveRegion.${status}`;
  const translated = t(key);
  // If translation returns the key itself (not found), use default
  return translated === key ? DEFAULT_ANNOUNCEMENTS[status] : translated;
}

// ============================================================================
// LiveRegion Component
// ============================================================================

/**
 * LiveRegion Component - Announces sync status changes to screen readers
 *
 * @param props - LiveRegionProps
 * @returns Live region JSX element (visually hidden)
 *
 * @example
 * ```tsx
 * // In StatusBar or layout root
 * <LiveRegion syncStatus={syncStatus} />
 *
 * // With custom styling
 * <LiveRegion syncStatus={syncStatus} className="my-live-region" />
 * ```
 *
 * @accessibility
 * - Uses aria-live="polite" to avoid interrupting the user
 * - aria-atomic="true" ensures complete message is announced
 * - role="status" provides semantic meaning
 * - sr-only class hides visually but keeps accessible
 */
export function LiveRegion({
  syncStatus,
  className = '',
  customMessage,
}: LiveRegionProps) {
  const { t } = useTranslation();

  const announcement = customMessage || getSyncAnnouncement(syncStatus, t);

  // Don't render empty announcements (idle state)
  if (!announcement && syncStatus === 'idle') {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`sr-only ${className}`}
      data-testid="live-region"
      data-sync-status={syncStatus}
    >
      {announcement}
    </div>
  );
}

/**
 * LiveRegionWithHook - LiveRegion that auto-wires to workspace sync status
 *
 * Convenience component that uses useWorkspaceSync hook internally.
 * Use this when you want automatic sync status binding.
 *
 * @example
 * ```tsx
 * // In layout root - automatically binds to sync state
 * <LiveRegionWithHook />
 * ```
 */
export function LiveRegionWithHook({ className = '' }: { className?: string }) {
  // Use static import (added at top of file)
  const { syncStatus } = useWorkspaceSync();

  return <LiveRegion syncStatus={syncStatus} className={className} />;
}

// ============================================================================
// Default Export
// ============================================================================

export default LiveRegion;
