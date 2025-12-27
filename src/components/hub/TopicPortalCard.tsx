/**
 * Topic Portal Card Component
 * 
 * Portal card for navigating between workspaces.
 * Clean, minimal design with arrow indicator.
 * 
 * @file TopicPortalCard.tsx
 * @created 2025-12-26T12:50:00Z
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronRight } from 'lucide-react';

// Design tokens from 8-bit design system
const TRANSITION_DURATION = 'var(--transition-duration-base, 200ms)';
const SHADOW_SM = 'var(--shadow-sm)';
const SHADOW_MD = 'var(--shadow-md)';
const RADIUS_MD = 'var(--radius-md)';

const portalCardVariants = cva(
  'relative overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-200 cursor-pointer group',
  {
    variants: {
      hover: {
        true: 'shadow-md border-[var(--color-primary)]',
        false: 'shadow-sm hover:shadow-md',
      },
    },
  }
);

interface TopicPortalCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  badge?: string;
  className?: ClassValue;
  onClick?: () => void;
}

export const TopicPortalCard: React.FC<TopicPortalCardProps> = ({
  titleKey,
  descriptionKey,
  icon,
  badge,
  className,
  onClick,
}) => {
  const { t } = useTranslation('portal');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={twMerge(
        portalCardVariants({ hover: false }),
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={t(titleKey)}
    >
      {/* Content */}
      <div className="p-6">
        {/* Header with icon and badge */}
        <div className="flex items-start gap-4 mb-3">
          {/* Icon */}
          <div className="flex-shrink-0 text-[var(--color-primary)]">
            {React.cloneElement(icon as React.ReactElement, {
              size: 24,
              className: 'fill-current',
            })}
          </div>

          {/* Badge (optional) */}
          {badge && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-foreground)] text-xs font-semibold">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold mb-2 text-[var(--color-foreground)] flex items-center justify-between">
          <span>{t(titleKey)}</span>
          <ChevronRight size={16} className="text-[var(--color-muted-foreground)] transition-transform duration-200 group-hover:translate-x-1" />
        </h4>

        {/* Description */}
        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  );
};
