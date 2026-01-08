/**
 * @fileoverview Temp Project Banner (Phase 1)
 * @module presentation/components/workspace/TempProjectBanner
 *
 * Displays a banner when user is in a temporary project.
 * Shows:
 * - Temporary project warning
 * - Platform indicator (mobile/desktop)
 * - Creation time
 * - Upgrade hint (for desktop users to pick a folder)
 */

import { AlertCircle, Smartphone, Monitor, FolderOpen } from 'lucide-react';
import type { TempProjectMetadata } from '@/lib/workspace/temp-project';

export interface TempProjectBannerProps {
  tempProject: TempProjectMetadata;
  onUpgradeClick?: () => void;
  className?: string;
}

/**
 * Temp Project Banner Component
 *
 * Shows a warning banner when user is in a temporary project.
 * - Yellow/amber background for visibility
 * - Platform-specific messaging
 * - Upgrade call-to-action
 */
export function TempProjectBanner({
  tempProject,
  onUpgradeClick,
  className = '',
}: TempProjectBannerProps) {
  const { name, platform, createdAt } = tempProject;
  const timeAgo = getTimeAgo(createdAt);

  return (
    <div
      className={`w-full bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon */}
        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />

        {/* Message */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 truncate">
            {name}
          </span>
          <span className="text-xs text-amber-500/70 hidden sm:inline">
            •
          </span>
          <span className="text-xs text-amber-500/70">
            Created {timeAgo} • {platform === 'mobile' ? 'Mobile' : 'Desktop'} view
          </span>
        </div>
      </div>

      {/* Platform Icon + Upgrade CTA */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {platform === 'mobile' ? (
          <Smartphone className="h-4 w-4 text-amber-500" />
        ) : (
          <Monitor className="h-4 w-4 text-amber-500" />
        )}

        {platform === 'desktop' && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium transition-colors flex items-center gap-1.5"
          >
            <FolderOpen className="h-3 w-3" />
            <span>Select Folder</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Get relative time string (e.g., "5 minutes ago")
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 360000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return 'today';
}

/**
 * Compact version for smaller screens
 */
export function TempProjectBannerCompact({
  tempProject,
  className = '',
}: { tempProject: TempProjectMetadata; className?: string }) {
  return (
    <div
      className={`w-full bg-amber-500/10 border-b border-amber-500/30 px-3 py-1.5 flex items-center gap-2 ${className}`}
    >
      <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
      <span className="text-xs text-amber-600 dark:text-amber-400 truncate flex-1">
        {tempProject.name}
      </span>
      {tempProject.platform === 'mobile' ? (
        <Smartphone className="h-3 w-3 text-amber-500 flex-shrink-0" />
      ) : (
        <Monitor className="h-3 w-3 text-amber-500 flex-shrink-0" />
      )}
    </div>
  );
}
