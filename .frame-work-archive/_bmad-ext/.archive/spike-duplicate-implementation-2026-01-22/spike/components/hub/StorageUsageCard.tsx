/**
 * @fileoverview Storage Usage Summary Card
 * @module spike/components/hub/StorageUsageCard
 * @created 2026-01-03T00:40:00+07:00
 *
 * Summary card displaying storage usage metrics.
 * Shows estimated storage used (in MB/KB) with visual progress bar.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HardDrive } from 'lucide-react';
import { cn } from '@/spike/lib/utils';

export interface StorageUsageCardProps {
  /** Estimated storage usage in kilobytes */
  estimatedStorageKB: number;
  /** Estimated storage usage in megabytes */
  estimatedStorageMB: number;
  /** Optional storage quota limit in MB (default: 50MB) */
  quotaLimitMB?: number;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Summary card for storage usage metrics.
 *
 * Features:
 * - Storage display in MB or KB
 * - Visual progress bar against quota limit
 * - Color-coded (green < 50%, yellow < 80%, red >= 80%)
 * - 8-bit themed styling
 *
 * @example
 * ```tsx
 * <StorageUsageCard
 *   estimatedStorageKB={5120}
 *   estimatedStorageMB={5}
 *   quotaLimitMB={50}
 * />
 * ```
 */
export const StorageUsageCard: React.FC<StorageUsageCardProps> = ({
  estimatedStorageKB,
  estimatedStorageMB,
  quotaLimitMB = 50,
  className,
}) => {
  const { t } = useTranslation();

  // Calculate percentage of quota used
  const percentageUsed = Math.min((estimatedStorageMB / quotaLimitMB) * 100, 100);

  // Determine progress bar color based on usage
  const getProgressColor = () => {
    if (percentageUsed < 50) return 'bg-success';
    if (percentageUsed < 80) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div
      className={cn(
        'p-4 border-2 border-border rounded-md bg-background',
        'hover:border-primary/50 transition-colors',
        className
      )}
    >
      {/* Card Header */}
      <div className="flex items-center gap-2 mb-3">
        <HardDrive className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-pixel text-foreground uppercase">
          {t('hub.dashboard.storage', 'STORAGE')}
        </h3>
      </div>

      {/* Storage Display */}
      <div className="space-y-2">
        {/* Storage Amount */}
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted-foreground">
            {t('hub.dashboard.used', 'Used')}
          </span>
          <div className="text-right">
            {estimatedStorageMB > 0 ? (
              <span className="text-lg font-mono font-bold text-foreground">
                {estimatedStorageMB} MB
              </span>
            ) : (
              <span className="text-lg font-mono font-bold text-foreground">
                {estimatedStorageKB} KB
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-1">
              / {quotaLimitMB} MB
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              {t('hub.dashboard.quota', 'Quota')}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {percentageUsed.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-sm overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                getProgressColor()
              )}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
        </div>

        {/* Storage Status Message */}
        <div className="text-xs text-muted-foreground text-center">
          {percentageUsed < 50 && t('hub.dashboard.storageGood', 'Storage usage is good.')}
          {percentageUsed >= 50 && percentageUsed < 80 && t('hub.dashboard.storageWarning', 'Storage usage is moderate.')}
          {percentageUsed >= 80 && t('hub.dashboard.storageCritical', 'Storage usage is high!')}
        </div>
      </div>
    </div>
  );
};