/**
 * Topic Card Component
 * 
 * Topic-based onboarding card with warm gradient backgrounds.
 * Communicates value propositions for different audiences.
 * 
 * @file TopicCard.tsx
 * @created 2025-12-26T12:50:00Z
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens from 8-bit design system
const TRANSITION_DURATION = 'var(--transition-duration-base, 200ms)';
const SHADOW_SM = 'var(--shadow-sm)';
const SHADOW_LG = 'var(--shadow-lg)';
const RADIUS_LG = 'var(--radius-lg)';

const topicCardVariants = cva(
  'relative overflow-hidden rounded-[var(--radius-lg)] transition-all duration-200 cursor-pointer',
  {
    variants: {
      gradient: {
        orange: 'bg-gradient-to-br from-[var(--gradient-orange-start)] to-[var(--gradient-orange-end)]',
        coral: 'bg-gradient-to-br from-[var(--gradient-coral-start)] to-[var(--gradient-coral-end)]',
        teal: 'bg-gradient-to-br from-[var(--gradient-teal-start)] to-[var(--gradient-teal-end)]',
        purple: 'bg-gradient-to-br from-[var(--gradient-purple-start)] to-[var(--gradient-purple-end)]',
        blue: 'bg-gradient-to-br from-[var(--gradient-blue-start)] to-[var(--gradient-blue-end)]',
      },
      hover: {
        true: 'scale-105 shadow-lg',
        false: 'shadow-sm hover:shadow-md',
      },
    },
  }
);

interface TopicCardProps {
  gradient: 'orange' | 'coral' | 'teal' | 'purple' | 'blue';
  titleKey: string;
  descriptionKey: string;
  actionKey: string;
  icon: React.ReactNode;
  className?: ClassValue;
  onAction?: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  gradient,
  titleKey,
  descriptionKey,
  actionKey,
  icon,
  className,
  onAction,
}) => {
  const { t } = useTranslation('topic');

  const handleClick = () => {
    if (onAction) {
      onAction();
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
        topicCardVariants({ gradient, hover: false }),
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={t(titleKey)}
    >
      {/* Icon */}
      <div className="absolute top-4 right-4 text-[var(--color-primary-foreground)] opacity-80">
        {React.cloneElement(icon as React.ReactElement, {
          size: 24,
          className: 'fill-current',
        })}
      </div>

      {/* Content */}
      <div className="p-6 text-[var(--color-primary-foreground)]">
        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 flex items-start gap-3">
          {React.cloneElement(icon as React.ReactElement, {
            size: 28,
            className: 'fill-current flex-shrink-0',
          })}
          <span>{t(titleKey)}</span>
        </h3>

        {/* Description */}
        <p className="text-base mb-6 leading-relaxed opacity-90">
          {t(descriptionKey)}
        </p>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary-foreground)] text-[var(--gradient-orange-start)] rounded-[var(--radius-md)] font-semibold hover:opacity-90 transition-opacity duration-200"
          aria-label={t(actionKey)}
        >
          {t(actionKey)}
          <svg
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200"
          >
            <polyline points="9 18 15 12 21 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
