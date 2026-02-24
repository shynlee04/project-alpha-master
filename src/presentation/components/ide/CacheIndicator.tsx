/**
 * @fileoverview Cache Indicator Component
 * @module presentation/components/ide/CacheIndicator
 * @governance Story WB-7: Lazy Content Loading
 *
 * Story: LT-4.19 (Light Theme Migration)
 * UPDATED_AT: 2026-01-04T10:30:00Z
 *
 * Visual indicator for cache hit/miss status on file tree items.
 * Shows whether file content was loaded from cache (instant) or FSA (slower).
 *
 * Features:
 * - Small dot indicator with color coding
 * - Tooltip with cache status details
 * - 8-bit styling (pixel borders, hard colors)
 * - Accessibility: ARIA labels, keyboard navigation
 * - Light/dark theme support via CSS custom properties
 *
 * @see Research: VS Code file tree cache indicators
 */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface CacheIndicatorProps {
  /** Whether content was loaded from cache */
  fromCache: boolean;
  /** Whether cache was fresh (within TTL) */
  cacheHit: boolean;
  /** File size in bytes (for tooltip) */
  fileSize?: number;
  /** Additional className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * CacheIndicator - Visual cache hit/miss indicator
 *
 * Shows a colored dot indicating cache status:
 * - 🟢 Green dot: Cache hit (fresh snapshot, instant load)
 * - 🟡 Yellow dot: Cache miss (loaded from FSA, saved to snapshot)
 * - 🔴 Red dot: Error loading file
 *
 * @example
 * ```tsx
 * <CacheIndicator
 *   fromCache={true}
 *   cacheHit={true}
 *   fileSize={1024}
 * />
 * ```
 */
export const CacheIndicator: React.FC<CacheIndicatorProps> = ({
  fromCache,
  cacheHit,
  fileSize,
  className,
}) => {
  const { t } = useTranslation();

  // Determine indicator color and label
  let colorClass = 'bg-muted-foreground/30';
  let label = t('cacheIndicator.unknown', 'UNKNOWN');

  if (fromCache && cacheHit) {
    // Cache hit - fresh snapshot
    colorClass = 'bg-[var(--success)]';
    label = t('cacheIndicator.cached', 'CACHED');
  } else if (fromCache && !cacheHit) {
    // Cache miss - stale or no snapshot
    colorClass = 'bg-[var(--warning)]';
    label = t('cacheIndicator.stale', 'STALE');
  } else {
    // Loaded from FSA - not cached
    colorClass = 'bg-[var(--primary)]';
    label = t('cacheIndicator.loaded', 'LOADED');
  }

  // Format file size for tooltip
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>
        <div
          className={cn(
            'shrink-0 w-2 h-2 rounded-full border border-border/50',
            colorClass,
            className
          )}
          aria-label={label}
        />
      </Tooltip.Trigger>

      <Tooltip.Portal>
        <Tooltip.Content
          className={cn(
            'max-w-xs px-3 py-2 text-xs font-mono bg-background border-2 border-border shadow-pixel z-50',
            'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
          )}
          sideOffset={5}
        >
          <div className="font-medium text-foreground mb-1">{label}</div>

          <div className="text-muted-foreground space-y-0.5">
            {fromCache && cacheHit && (
              <>
                <div>✓ {t('cacheIndicator.instantLoad', 'Instant load')}</div>
                {fileSize && (
                  <div>{formatFileSize(fileSize)}</div>
                )}
              </>
            )}

            {fromCache && !cacheHit && (
              <>
                <div>⚠ {t('cacheIndicator.staleSnapshot', 'Stale snapshot')}</div>
                <div>{t('cacheIndicator.refreshed', 'Refreshed from filesystem')}</div>
              </>
            )}

            {!fromCache && (
              <>
                <div>📂 {t('cacheIndicator.fromFilesystem', 'Loaded from filesystem')}</div>
                <div>{t('cacheIndicator.nowCached', 'Now cached for next time')}</div>
              </>
            )}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
