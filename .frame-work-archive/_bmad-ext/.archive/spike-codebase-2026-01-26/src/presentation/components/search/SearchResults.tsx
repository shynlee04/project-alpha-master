/**
 * @fileoverview Search Results Component
 * @module presentation/components/search/SearchResults
 *
 * Search results UI with text highlighting, grouping, and pagination.
 *
 * @story S-027 Advanced Search with Filters
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  User,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult, SearchMatch } from '@/lib/search/search-indexer';

export interface SearchResultsProps {
  /** Search results */
  results: SearchResult[];

  /** Grouped results by project/folder (unused, can be removed) */
  groupedResults?: Map<string, SearchResult[]>;

  /** Loading state */
  isLoading?: boolean;

  /** Current page */
  page: number;

  /** Results per page */
  perPage: number;

  /** Set page callback */
  onPageChange: (page: number) => void;

  /** Select result callback */
  onSelectResult?: (result: SearchResult, match?: SearchMatch) => void;

  /** CSS class name */
  className?: string;
}

/**
 * Highlight matching text in preview
 */
function HighlightedText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  if (!query) return <span className={className}>{text}</span>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-400/80 text-foreground px-0.5 rounded-[2px]"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

/**
 * Single search result item
 */
function SearchResultItem({
  result,
  query,
  onSelect,
}: {
  result: SearchResult;
  query: string;
  onSelect?: (result: SearchResult, match?: SearchMatch) => void;
}) {
  const [isExpanded, setExpanded] = useState(true);
  const { t } = useTranslation();
  const { document, matches, matchCount } = result;

  return (
    <div className="mb-2">
      {/* File header */}
      <button
        onClick={() => setExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary rounded-none transition-colors duration-150"
      >
        <FileText className="w-4 h-4 text-primary shrink-0" />
        <span className="flex-1 text-sm text-foreground truncate">
          <HighlightedText text={document.filename} query={query} />
        </span>
        <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-secondary rounded-none">
          {matchCount} {t('search.matches', 'matches')}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Expanded matches */}
      {isExpanded && (
        <div className="pl-9 pr-2 pb-2">
          {/* File path */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span className="truncate">{document.path}</span>
            <span className="shrink-0">
              {new Date(document.modifiedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Matches list */}
          <div className="space-y-1">
            {matches.slice(0, 5).map((match, i) => (
              <button
                key={i}
                onClick={() => onSelect?.(result, match)}
                className="w-full flex items-start gap-2 px-2 py-1 text-left hover:bg-secondary/50 rounded-none transition-colors duration-150"
              >
                <span className="text-xs text-muted-foreground shrink-0 font-mono w-8">
                  {match.line}
                </span>
                <span className="text-xs text-muted-foreground truncate flex-1">
                  <HighlightedText text={match.preview} query={query} />
                </span>
              </button>
            ))}
            {matches.length > 5 && (
              <div className="text-xs text-muted-foreground pl-2 italic">
                +{matches.length - 5} {t('search.moreMatches', 'more matches')}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
            {document.author && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>{document.author}</span>
              </div>
            )}
            {document.tags.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="w-3 h-3" />
                <span>{document.tags.slice(0, 2).join(', ')}</span>
                {document.tags.length > 2 && <span>+{document.tags.length - 2}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Results group by project/folder
 */
function ResultsGroup({
  groupName,
  results,
  query,
  onSelect,
}: {
  groupName: string;
  results: SearchResult[];
  query: string;
  onSelect?: (result: SearchResult, match?: SearchMatch) => void;
}) {
  const [isExpanded, setExpanded] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary rounded-none transition-colors duration-150"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm font-semibold uppercase tracking-wider">
          {groupName}
        </span>
        <span className="text-xs text-muted-foreground">
          ({results.length} {results.length === 1 ? 'result' : 'results'})
        </span>
      </button>

      {isExpanded && (
        <div className="pl-2">
          {results.map((result) => (
            <SearchResultItem
              key={result.document.id}
              result={result}
              query={query}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Pagination controls
 */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-border">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'px-3 py-1 text-sm rounded-none transition-colors duration-150',
          currentPage === 1
            ? 'text-muted-foreground cursor-not-allowed'
            : 'hover:bg-secondary text-foreground'
        )}
      >
        {t('search.previous', 'Previous')}
      </button>

      {pages.map((page, i) =>
        typeof page === 'number' ? (
          <button
            key={i}
            onClick={() => onPageChange(page)}
            className={cn(
              'px-3 py-1 text-sm rounded-none transition-colors duration-150',
              page === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary text-foreground'
            )}
          >
            {page}
          </button>
        ) : (
          <span key={i} className="px-2 text-muted-foreground">
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'px-3 py-1 text-sm rounded-none transition-colors duration-150',
          currentPage === totalPages
            ? 'text-muted-foreground cursor-not-allowed'
            : 'hover:bg-secondary text-foreground'
        )}
      >
        {t('search.next', 'Next')}
      </button>
    </div>
  );
}

/**
 * Search results component
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading = false,
  page,
  perPage,
  onPageChange,
  onSelectResult,
  className,
}) => {
  const { t } = useTranslation();

  // Get query from first result (assuming all results share the same query)
  const query = results[0]?.matches[0]?.matchedText || '';

  // Calculate pagination
  const totalPages = Math.ceil(results.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedResults = results.slice(startIndex, endIndex);

  // Group paginated results
  const paginatedGroups = new Map<string, SearchResult[]>();
  paginatedResults.forEach(result => {
    const key = result.document.projectId || result.document.path.split('/')[0] || 'root';
    if (!paginatedGroups.has(key)) {
      paginatedGroups.set(key, []);
    }
    paginatedGroups.get(key)!.push(result);
  });

  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="text-sm text-muted-foreground">
          {t('search.loading', 'Searching...')}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          {t('search.noResults', 'No results found')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Results count */}
      <div className="px-4 py-3 border-b border-border text-sm text-muted-foreground">
        {t('search.resultCount', `${results.length} results found`)}
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto">
        {paginatedGroups.size > 1 ? (
          // Grouped view
          Array.from(paginatedGroups.entries()).map(([groupName, groupResults]) => (
            <ResultsGroup
              key={groupName}
              groupName={groupName}
              results={groupResults}
              query={query}
              onSelect={onSelectResult}
            />
          ))
        ) : (
          // Flat view
          paginatedResults.map((result) => (
            <div key={result.document.id} className="px-2">
              <SearchResultItem
                result={result}
                query={query}
                onSelect={onSelectResult}
              />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
