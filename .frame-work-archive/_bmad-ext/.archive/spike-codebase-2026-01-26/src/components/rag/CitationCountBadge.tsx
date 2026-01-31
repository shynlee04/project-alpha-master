/**
 * @fileoverview Citation Count Badge Component
 * @module components/rag/CitationCountBadge
 * @governance Story 32-3 - Semantic Citation System
 *
 * Displays citation count in chat header with click-to-open functionality.
 */

import { Link2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { twMerge } from 'tailwind-merge';

import type { CitationCountBadgeProps } from '@/lib/rag/citation-types';

/**
 * Formats the citation count for display
 * @param count - Number of citations
 * @returns Formatted count string
 */
function formatCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

/**
 * CitationCountBadge Component
 *
 * Displays a badge showing the number of citations in the current response.
 * Clicking the badge opens the citation sidebar.
 *
 * @example
 * ```tsx
 * <CitationCountBadge
 *   count={5}
 *   onClick={() => setIsCitationsOpen(true)}
 *   isOpen={isCitationsOpen}
 * />
 * ```
 */
export function CitationCountBadge({
  count,
  onClick,
  isOpen = false,
}: CitationCountBadgeProps) {
  const { t } = useTranslation('rag');

  if (count === 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'font-mono text-xs font-medium transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--color-surface)]',
        isOpen
          ? 'bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-white'
          : 'bg-[var(--color-surface-subtle)] border-[var(--color-border-subtle)]',
        'text-[var(--color-text-primary)] hover:border-[var(--color-accent-primary)]',
        'hover:bg-[var(--color-surface-hover)]',
      )}
      aria-label={t('citation.badge.ariaLabel', { count })}
      aria-pressed={isOpen}
      aria-expanded={isOpen}
    >
      <Link2
        className={twMerge(
          'w-3.5 h-3.5',
          isOpen ? 'text-white' : 'text-[var(--color-accent-primary)]',
        )}
        aria-hidden="true"
      />
      <span className="tabular-nums">
        {formatCount(count)}
      </span>
      <span className="sr-only">
        {t('citation.badge.srCitations')}
      </span>
    </button>
  );
}

export default CitationCountBadge;
