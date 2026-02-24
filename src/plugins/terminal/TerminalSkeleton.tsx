/**
 * @fileoverview Terminal Skeleton
 * @module plugins/terminal/TerminalSkeleton
 *
 * **EPIC-0.6-05**: Boot WebContainer on Terminal Mount
 *
 * Loading skeleton shown while WebContainer is booting or mounting.
 *
 * @epic EPIC-0.6
 * @story 0.6-05
 * @team Team B
 * @created 2026-01-27
 */

import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * Terminal skeleton status
 */
type SkeletonStatus = 'booting' | 'mounting' | 'initializing';

/**
 * TerminalSkeleton props
 */
interface TerminalSkeletonProps {
  /** Current skeleton status */
  status: SkeletonStatus;
}

/**
 * TerminalSkeleton component
 *
 * Shows loading skeleton while WebContainer boots or mounts files.
 * Provides visual feedback with 8-bit styling (no glassmorphism).
 *
 * @param props - Skeleton props
 * @returns Loading skeleton JSX element
 */
export function TerminalSkeleton({ status }: TerminalSkeletonProps) {
  const { t } = useTranslation();

  const getMessage = () => {
    switch (status) {
      case 'booting':
        return t('terminal.bootingWebContainer', 'Booting WebContainer...');
      case 'mounting':
        return t('terminal.mountingFiles', 'Mounting project files...');
      case 'initializing':
        return t('terminal.initializing', 'Initializing...');
      default:
        return t('terminal.loading', 'Loading...');
    }
  };

  return (
    <div className="w-full h-full bg-black p-4 flex flex-col">
      {/* Header with status */}
      <div className="h-7 px-3 flex items-center gap-2 border-b border-border/30 bg-card/30 shrink-0">
        <RotateCw size={16} className="animate-spin text-green-500" />
        <span className="text-xs font-mono text-green-500">
          {getMessage()}
        </span>
      </div>

      {/* Skeleton lines */}
      <div className="flex-1 p-4 space-y-2">
        {/* Terminal prompt skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500" />
          <div className="w-3 h-3 bg-yellow-500" />
          <div className="w-3 h-3 bg-green-500" />
          <div className="ml-2 h-4 w-1/3 bg-gray-800" />
        </div>

        {/* Command line skeleton */}
        <div className="flex items-center gap-2">
          <span className="text-green-500 text-sm">$</span>
          <div className="h-4 w-1/4 bg-gray-800 animate-pulse" />
        </div>

        {/* Output lines skeleton */}
        <div className="space-y-1 mt-2">
          <div className="h-4 w-1/2 bg-gray-800 animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-800 animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
