/**
 * @fileoverview Storage Badge Component
 * @module presentation/components/ide
 *
 * **CC-IDE-06**: IDE UX Updates
 *
 * Shows storage type indicator (FSA/BrowserDB) in IDE header.
 * Updates when platform changes.
 * Explains current storage in tooltip.
 *
 * @epic EPIC-CC-IDE-FSA
 * @story CC-IDE-06
 * @author Team B
 * @created 2026-01-18
 */

import { useTranslation } from 'react-i18next';
import { HardDrive, Database } from 'lucide-react';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';

/**
 * StorageBadge component props
 */
export interface StorageBadgeProps {
  /** Optional class name for styling */
  className?: string;
}

/**
 * Storage Badge - Shows storage type indicator
 *
 * Displays icon and label based on platform storage type:
 * - Desktop with FSA → HardDrive icon + "FSA"
 * - Mobile/Tablet → Database icon + "BrowserDB"
 *
 * @remarks
 * Badge is read-only - it shows state, doesn't change it.
 * Storage type is determined by getPlatformContract().
 *
 * @example
 * ```tsx
 * <StorageBadge />
 *
 * // With custom styling
 * <StorageBadge className="text-xs" />
 * ```
 */
export function StorageBadge({ className = '' }: StorageBadgeProps): React.JSX.Element {
  const { t } = useTranslation();
  const platform = getPlatformContract();

  // Determine icon and label based on storage type
  const isFSA = platform.storageType === 'fsa';
  const Icon = isFSA ? HardDrive : Database;
  const label = isFSA ? 'FSA' : 'BrowserDB';
  const tooltipKey = isFSA ? 'storage.fsa.tooltip' : 'storage.browserDb.tooltip';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground rounded-none ${className}`}
      title={t(tooltipKey)}
      role="status"
      aria-label={t('storage.current', { type: label })}
    >
      <Icon size={12} className="text-muted-foreground/70" />
      <span className="font-medium">{label}</span>
    </div>
  );
}
