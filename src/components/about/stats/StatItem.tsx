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

  // Tooltip visibility (showTooltip determines behavior, id is available for data attributes)
  const showTooltipOverlay = showTooltip && tooltip;

  return (
    <div
      className={cn(
        'stat-item',
        'group relative flex flex-col items-center justify-center',
        'p-4 md:p-6 transition-all duration-300'
      )}
      data-stat-id={id}
    >
      {/* Icon with color and hover effect */}
      <div
        className="mb-2 md:mb-3 transition-transform duration-300 group-hover:scale-110"
        style={{ color }}
      >
        <Icon className="w-6 h-6 md:w-8 md:h-8" />
      </div>

      {/* Stat Value */}
      <div className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">
        {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
      </div>

      {/* Stat Label */}
      <div className="text-xs md:text-sm text-muted-foreground text-center">
        {t(labelKey, labelKey)}
      </div>

      {/* Tooltip */}
      {showTooltipOverlay && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          <p className="text-xs text-foreground">{tooltip}</p>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
        </div>
      )}
    </div>
  );
}
