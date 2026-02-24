/**
 * @fileoverview Journey Card Component
 * @module components/about/journey/JourneyCard
 * @governance EPIC-29-4
 *
 * Individual journey card with icon, title, and description.
 * Supports multiple card variants (background, transition, value).
 *
 * Story 29.4: Journey Section Implementation
 */

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JourneyCardProps {
  /**
   * Card title
   */
  title: string;

  /**
   * Card description/content
   */
  description: string;

  /**
   * Icon component
   */
  icon: LucideIcon;

  /**
   * Card variant for styling
   */
  variant?: 'default' | 'background' | 'transition' | 'value';

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function JourneyCard({
  title,
  description,
  icon: Icon,
  variant = 'default',
  className,
}: JourneyCardProps) {
  return (
    <div
      className={cn(
        'journey-card',
        'bg-card border border-border rounded-lg p-6',
        'transition-all duration-300 ease-in-out',
        'hover:shadow-lg hover:scale-[1.02]',
        // Variant-specific styles
        variant === 'background' && 'border-l-4 border-l-primary',
        variant === 'transition' && 'border-l-4 border-l-accent',
        variant === 'value' && 'border-l-4 border-l-success',
        className
      )}
    >
      {/* Icon */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            'p-2 rounded-md bg-muted',
            variant === 'background' && 'text-primary',
            variant === 'transition' && 'text-accent',
            variant === 'value' && 'text-success'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
