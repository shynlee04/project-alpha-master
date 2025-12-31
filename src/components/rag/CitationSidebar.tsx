/**
 * @fileoverview Citation Sidebar Component
 * @module components/rag/CitationSidebar
 * @governance Story 32-3 - Semantic Citation System
 *
 * Displays citations with source information and click-to-navigate functionality.
 */

import { useState, useMemo } from 'react';

import { X, Link2, FileText, Search, Filter } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import { clsx } from 'clsx';

import { tailwindMerge } from 'tailwind-merge';

import type { DisplayCitation, CitationSidebarProps } from '@/lib/rag/citation-types';

import type { Citation } from '@/lib/rag/types';

/**
 * Formats the relevance score as a percentage
 * @param score - Relevance score (0-1)
 * @returns Formatted percentage string
 */
function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Individual citation card component
 */
function CitationCard({
  citation,
  isSelected,
  onClick,
}: {
  citation: DisplayCitation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { t } = useTranslation('rag');

  return (
    <button
      type="button"
      onClick={onClick}
      className={tailwindMerge(
        'w-full text-left p-3 rounded-lg border transition-all duration-200',
        'hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-surface-hover)]',
        isSelected
          ? 'border-[var(--color-accent-primary)] bg-[var(--color-surface-selected)]'
          : 'border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)]',
      )}
      aria-pressed={isSelected}
      aria-label={t('citation.sidebar.citationCardAriaLabel', {
        id: citation.id,
        title: citation.title,
      })}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-[var(--color-accent-primary)]">
            [{citation.id}]
          </span>
          <span className="font-medium text-[var(--color-text-primary)] truncate max-w-[180px]">
            {citation.title}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          {formatScore(citation.score)}
        </span>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
        {truncateText(citation.excerpt, 150)}
      </p>
    </button>
  );
}

/**
 * Filter section component for filtering citations by source
 */
function FilterSection({
  citations,
  selectedSources,
  onFilterChange,
}: {
  citations: DisplayCitation[];
  selectedSources: string[];
  onFilterChange: (ids: string[]) => void;
}) {
  const { t } = useTranslation('rag');

  const uniqueSources = useMemo(() => {
    const sources = new Map<string, DisplayCitation>();
    citations.forEach((citation) => {
      if (!sources.has(citation.sourceId)) {
        sources.set(citation.sourceId, citation);
      }
    });
    return Array.from(sources.values());
  }, [citations]);

  const allSelected = uniqueSources.length === selectedSources.length;
  const someSelected = selectedSources.length > 0 && !allSelected;

  const handleToggleAll = () => {
    if (allSelected) {
      onFilterChange([]);
    } else {
      onFilterChange(uniqueSources.map((s) => s.sourceId));
    }
  };

  const handleToggleSource = (sourceId: string) => {
    if (selectedSources.includes(sourceId)) {
      onFilterChange(selectedSources.filter((id) => id !== sourceId));
    } else {
      onFilterChange([...selectedSources, sourceId]);
    }
  };

  return (
    <div className="mb-4 p-3 bg-[var(--color-surface-subtle)] rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {t('citation.sidebar.filterBySource')}
        </span>
        <button
          type="button"
          onClick={handleToggleAll}
          className="text-xs text-[var(--color-accent-primary)] hover:underline"
        >
          {allSelected
            ? t('citation.sidebar.clearAll')
            : t('citation.sidebar.selectAll')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {uniqueSources.map((citation) => (
          <button
            key={citation.sourceId}
            type="button"
            onClick={() => handleToggleSource(citation.sourceId)}
            className={tailwindMerge(
              'px-2 py-1 text-xs rounded-full border transition-colors',
              selectedSources.includes(citation.sourceId)
                ? 'bg-[var(--color-accent-primary)] border-[var(--color-accent-primary)] text-white'
                : 'border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]',
            )}
          >
            [{citation.id}]
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * CitationSidebar Component
 *
 * Displays a sidebar panel with citations extracted from AI responses.
 * Provides source attribution, click-to-navigate, and filtering functionality.
 *
 * @example
 * ```tsx
 * <CitationSidebar
 *   citations={citations}
 *   isOpen={true}
 *   onClose={() => setIsOpen(false)}
 *   onCitationClick={(citation) => navigateToSource(citation.sourceId)}
 * />
 * ```
 */
export function CitationSidebar({
  citations,
  isOpen,
  onClose,
  onCitationClick,
  selectedSources = [],
  onFilterChange,
}: CitationSidebarProps) {
  const { t } = useTranslation('rag');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCitations = useMemo(() => {
    let result = citations;

    // Apply source filter
    if (selectedSources.length > 0) {
      result = result.filter((c) => selectedSources.includes(c.sourceId));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.excerpt.toLowerCase().includes(query),
      );
    }

    return result;
  }, [citations, selectedSources, searchQuery]);

  const groupedCitations = useMemo(() => {
    const groups = new Map<string, DisplayCitation[]>();
    filteredCitations.forEach((citation) => {
      const existing = groups.get(citation.sourceId) || [];
      groups.set(citation.sourceId, [...existing, citation]);
    });
    return groups;
  }, [filteredCitations]);

  if (!isOpen) return null;

  return (
    <aside
      className="w-80 h-full bg-[var(--color-surface)] border-l border-[var(--color-border-subtle)] flex flex-col"
      role="complementary"
      aria-label={t('citation.sidebar.ariaLabel')}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[var(--color-accent-primary)]" />
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            {t('citation.sidebar.title')}
          </h2>
          <span className="px-2 py-0.5 text-xs font-mono bg-[var(--color-accent-primary)] text-white rounded-full">
            {filteredCitations.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          aria-label={t('citation.sidebar.close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 pb-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder={t('citation.sidebar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)]"
            aria-label={t('citation.sidebar.searchAriaLabel')}
          />
        </div>
      </div>

      {/* Filter Section */}
      {onFilterChange && citations.length > 1 && (
        <div className="px-4">
          <FilterSection
            citations={citations}
            selectedSources={selectedSources}
            onFilterChange={onFilterChange}
          />
        </div>
      )}

      {/* Citation List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredCitations.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-text-muted)]">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchQuery
                ? t('citation.sidebar.noResults')
                : t('citation.sidebar.empty')}
            </p>
          </div>
        ) : (
          <div
            className="space-y-3"
            role="list"
            aria-label={t('citation.sidebar.citationListAriaLabel')}
          >
            {groupedCitations.size === 1 ? (
              // Single source - show all citations
              filteredCitations.map((citation) => (
                <CitationCard
                  key={citation.id}
                  citation={citation}
                  isSelected={false}
                  onClick={() => onCitationClick(citation)}
                />
              ))
            ) : (
              // Multiple sources - group by source
              Array.from(groupedCitations.entries()).map(([sourceId, sourceCitations]) => (
                <div key={sourceId} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-[var(--color-border-subtle)]">
                    <FileText className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm font-medium text-[var(--color-text-secondary)] truncate">
                      {sourceCitations[0].title}
                    </span>
                  </div>
                  {sourceCitations.map((citation) => (
                    <CitationCard
                      key={citation.id}
                      citation={citation}
                      isSelected={false}
                      onClick={() => onCitationClick(citation)}
                    />
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface-subtle)]">
        <p className="text-xs text-[var(--color-text-muted)] text-center">
          {t('citation.sidebar.footer')}
        </p>
      </div>
    </aside>
  );
}

export default CitationSidebar;
