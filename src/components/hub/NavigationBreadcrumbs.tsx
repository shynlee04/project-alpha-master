/**
 * Navigation Breadcrumbs Component
 * 
 * Breadcrumbs for navigation signposting.
 * Provides clickable breadcrumbs for navigation.
 * 
 * @file NavigationBreadcrumbs.tsx
 * @created 2025-12-26T12:50:00Z
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens from 8-bit design system
const TRANSITION_DURATION = 'var(--transition-duration-base, 200ms)';
const RADIUS_SM = 'var(--radius-sm)';

const breadcrumbVariants = cva(
  'flex items-center gap-2 text-sm',
  {
    variants: {
      interactive: {
        true: 'cursor-pointer hover:text-[var(--color-primary)] transition-colors duration-200',
        false: 'text-[var(--color-muted-foreground)]',
      },
    },
  }
);

const separatorVariants = cva(
  'text-[var(--color-muted-foreground)]',
  {
    variants: {
      size: {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
      },
    },
  },
);

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  interactive?: boolean;
}

interface NavigationBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: ClassValue;
}

export const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({ items, className }) => {
  const { t } = useTranslation('breadcrumbs');

  const handleItemClick = (item: BreadcrumbItem, event: React.MouseEvent) => {
    if (item.onClick) {
      event.preventDefault();
      item.onClick();
    }
  };

  const handleItemKeyDown = (item: BreadcrumbItem, event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && item.onClick) {
      event.preventDefault();
      item.onClick();
    }
  };

  return (
    <nav
      className={twMerge(
        'flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-background)]',
        className
      )}
      aria-label={t('navigateTo')}
    >
      <ol className="flex items-center gap-2" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2" role="listitem">
            {/* Breadcrumb item */}
            {item.interactive ? (
              <a
                href={item.href}
                onClick={(e) => handleItemClick(item, e)}
                onKeyDown={(e) => handleItemKeyDown(item, e)}
                className={breadcrumbVariants({ interactive: true })}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </a>
            ) : (
              <span className={breadcrumbVariants({ interactive: false })}>
                {item.label}
              </span>
            )}

            {/* Separator (not for last item) */}
            {index < items.length - 1 && (
              <ChevronRight
                className={separatorVariants({ size: 'sm' })}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
