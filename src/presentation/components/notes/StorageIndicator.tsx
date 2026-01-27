/**
 * @fileoverview StorageIndicator Component
 * @module presentation/components/notes/StorageIndicator
 *
 * 8-bit styled storage mode badge component.
 * Shows 'FSA' for desktop File System Access API storage
 * Shows 'BrowserDB' for mobile/tablet IndexedDB storage
 *
 * Design follows 8-bit principles:
 * - Sharp corners (border-radius: 0)
 * - Pixel shadows (box-shadow: 4px 4px 0 0)
 * - Solid colors (no glassmorphism)
 * - Bold, blocky typography
 *
 * @epic EPIC-CC-DESKTOP-FSA (Desktop FSA Migration)
 * @story CC-DF-04 - User Experience Updates
 * @created 2026-01-18
 */

import { HardDrive, Database } from 'lucide-react';
import type { StorageMode } from '@/presentation/hooks/useStorageMode';
import { cn } from '@/lib/utils';

// ============================================================================
// StorageIndicator Props
// ============================================================================

export interface StorageIndicatorProps {
  /** Storage mode information */
  storageMode: StorageMode;

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes */
  className?: string;

  /** Whether to show icon */
  showIcon?: boolean;

  /** Whether to show description */
  showDescription?: boolean;
}

// ============================================================================
// Component Implementation
// ============================================================================

/**
 * Storage Mode Indicator Badge (8-bit Design)
 *
 * Displays storage type with 8-bit retro aesthetic.
 *
 * @example
 * ```tsx
 * const project = useActiveProject();
 * const storageInfo = useStorageMode(project);
 *
 * <StorageIndicator
 *   storageMode={storageInfo}
 *   size="md"
 *   showDescription
 * />
 * ```
 */
export function StorageIndicator({
  storageMode,
  size = 'md',
  className,
  showIcon = true,
  showDescription = false,
}: StorageIndicatorProps) {
  // Size variants (8-bit design - consistent spacing)
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Color variants based on storage type
  const isFSA = storageMode.isFSA;
  const bgColor = isFSA ? 'bg-muted' : 'bg-orange-700';
  const borderColor = 'border-white';
  const textColor = 'text-white';

  // Icon selection
  const Icon = isFSA ? HardDrive : Database;

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      {/* Main Badge */}
      <div
        className={cn(
          'inline-flex items-center gap-2',
          sizeClasses[size],
          bgColor,
          textColor,
          'font-bold font-mono',
          'border-4',
          borderColor,
          // 8-bit pixel shadow
          'shadow-[4px_4px_0_0_rgba(0,0,0,1)]',
          // Transition for smooth state changes
          'transition-all duration-150 ease-in-out',
          // Accessibility: high contrast
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white'
        )}
        role="status"
        aria-label={`Storage mode: ${storageMode.storageLabel}`}
        aria-live="polite"
      >
        {/* Icon */}
        {showIcon && (
          <Icon
            className={cn(
              size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5',
              'flex-shrink-0'
            )}
            aria-hidden="true"
          />
        )}

        {/* Label */}
        <span className="whitespace-nowrap">{storageMode.storageLabel}</span>

        {/* Platform indicator */}
        <span
          className={cn(
            'text-xs',
            'opacity-75',
            size === 'sm' ? 'ml-1' : 'ml-2'
          )}
          aria-hidden="true"
        >
          ({storageMode.platform === 'desktop' ? 'Desktop' : storageMode.platform === 'mobile' ? 'Mobile' : 'Tablet'})
        </span>
      </div>

      {/* Description (optional) */}
      {showDescription && (
        <p
          className={cn(
            'text-xs',
            'text-muted-foreground',
            'max-w-xs',
            size === 'sm' ? 'mt-0.5' : 'mt-1'
          )}
        >
          {storageMode.storageDescription}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Simplified Variants
// ============================================================================

/**
 * Compact storage badge (no icon, no description)
 */
export function StorageBadge({ storageMode, size = 'sm' }: Omit<StorageIndicatorProps, 'showIcon' | 'showDescription'>) {
  return (
    <StorageIndicator
      storageMode={storageMode}
      size={size}
      showIcon={false}
      showDescription={false}
    />
  );
}

/**
 * Full storage card with icon and description
 */
export function StorageCard({ storageMode }: { storageMode: StorageMode }) {
  return (
    <div
      className={cn(
        'p-4',
        'border-2 border-border',
        'rounded-none',
        'shadow-[4px_4px_0_0_rgba(0,0,0,1)]',
        'bg-background'
      )}
    >
      <StorageIndicator
        storageMode={storageMode}
        size="lg"
        showIcon
        showDescription
      />
    </div>
  );
}
