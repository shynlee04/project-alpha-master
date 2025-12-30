/**
 * @fileoverview Stat Item Component
 * @module components/about/stats/StatItem
 * @governance EPIC-29-3
 *
 * Individual statistic display with icon, value, label, and hover effects.
 *
 * Story 29.3: Stats Bar Implementation
 */

import { type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export interface StatItemProps {
  /**
   * Unique identifier for the stat
   */
  id: string;

  /**
   * Stat value (number or string)
   */
  value: string | number;

  /**
   * Translation key for the label
   */
  labelKey: string;

  /**
   * Icon component to display
   */
  icon: LucideIcon;

  /**
   * Color token (CSS variable or class)
   */
  color?: string;

  /**
   * Current animated value (for count-up animation)
   */
  animatedValue?: number;

  /**
   * Whether to show tooltip on hover
   */
  showTooltip?: boolean;

  /**
   * Tooltip content
   */
  tooltip?: string;
}

export function StatItem({
  id,
  value,
  labelKey,
  icon: Icon,
  color = 'var(--primary)',
  animatedValue,
  showTooltip = false,
  tooltip,
}: StatItemProps) {
  const { t } = useTranslation();

  // Display animated value if provided, otherwise use original value
  const displayValue = animatedValue !== undefined ? animatedValue : value;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-lg',
        'transition-all duration-300 ease-in-out',
        'hover:scale-110 hover:shadow-lg',
        'group relative'
      )}
      style={{ '--stat-color': color } as React.CSSProperties}
    >
      {/* Icon */}
      <div
        className="mb-2 transition-colors"
        style={{ color: 'var(--stat-color)' }}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Value */}
      <div
        className={cn(
          'text-2xl md:text-3xl lg:text-4xl font-bold',
          'transition-all duration-300'
        )}
        style={{ color: 'var(--stat-color)' }}
      >
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
      </div>

      {/* Label */}
      <div className="text-xs md:text-sm text-muted-foreground mt-1 text-center">
        {t(labelKey)}
      </div>

      {/* Tooltip (optional) */}
      {showTooltip && tooltip && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
            'px-3 py-2 bg-card border border-border rounded-md',
            'text-xs text-foreground whitespace-nowrap',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            'pointer-events-none z-10',
            'shadow-md'
          )}
        >
          {tooltip}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div
              className="border-4 border-transparent"
              style={{ borderTopColor: 'var(--card)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
