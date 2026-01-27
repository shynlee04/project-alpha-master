/**
 * @fileoverview Quick Action Card for Hub page
 * @module presentation/components/hub/QuickActionCard
 * @created 2026-01-26T10:00:00+07:00
 *
 * 8-bit design compliant quick action card with:
 * - Lucide icons (orange color)
 * - Hover shadow effect (larger shadow on hover)
 * - Pressed effect on click
 * - NO rounded corners (rounded-none)
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface QuickActionCardProps {
  /** Lucide icon component */
  icon: React.ReactNode;
  /** Translated label text */
  label: string;
  /** Optional translated description */
  description?: string;
  /** Click handler */
  onClick: () => void;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * QuickActionCard Component
 *
 * A clickable action card for the Hub page following 8-bit design:
 * - Sharp corners (rounded-none)
 * - Pixel shadow effect
 * - Hover state with larger shadow
 * - Active/pressed state with translate
 *
 * @example
 * ```tsx
 * <QuickActionCard
 *   icon={<Plus size={24} />}
 *   label={t('hub.quickActions.newProject')}
 *   description={t('hub.newProjectDesc')}
 *   onClick={handleNewProject}
 * />
 * ```
 */
export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  label,
  description,
  onClick,
  className,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={label}
      className={cn(
        // Base styles - 8-bit compliant
        'flex flex-col items-center justify-center gap-2',
        'min-w-[120px] min-h-[100px] p-4',
        'bg-card border-2 border-border',
        'rounded-none', // 8-bit: NO rounded corners
        'cursor-pointer select-none',
        'transition-all duration-150',
        // Shadow - pixel shadow effect
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        // Hover state - larger shadow
        'hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        'hover:border-orange-500/50',
        // Active/pressed state - pressed effect
        'active:translate-x-[2px] active:translate-y-[2px]',
        'active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
        // Focus state for accessibility
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-background',
        className
      )}
    >
      {/* Icon - Lucide only, orange color */}
      <div className="text-orange-500">
        {icon}
      </div>

      {/* Label - mono font */}
      <span className="font-mono text-sm text-foreground text-center">
        {label}
      </span>

      {/* Optional description */}
      {description && (
        <span className="font-mono text-xs text-muted-foreground text-center line-clamp-2">
          {description}
        </span>
      )}
    </div>
  );
};
