/**
 * @fileoverview Advanced Search Dialog Component
 * @module presentation/components/search/AdvancedSearchDialog
 *
 * Main advanced search dialog with keyboard shortcut (Cmd+Shift+F).
 *
 * @story S-027 Advanced Search with Filters
 */

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  X,
  Filter,
  SlidersHorizontal,
  Bookmark,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutDefinitions } from '@/lib/keyboard/shortcuts';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { SearchFilters } from './SearchFilters';
import { SearchResults } from './SearchResults';
import { SavedSearches } from './SavedSearches';
import { cn } from '@/lib/utils';

export interface AdvancedSearchDialogProps {
  /** Open state */
  open: boolean;

  /** Close callback */
  onOpenChange: (open: boolean) => void;

  /** Available tags for filtering */
  availableTags?: string[];

  /** Available authors for filtering */
  availableAuthors?: string[];

  /** Select result callback */
  onSelectResult?: (result: any) => void;
}

/**
 * Advanced search dialog
 */
export const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({
  open,
  onOpenChange,
  availableTags = [],
  availableAuthors = [],
  onSelectResult,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Search state
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isLoading,
    page,
    setPage,
    perPage,
    sortBy,
    setSortBy,
    groupedResults,
    savedSearches,
    saveSearch,
    loadSearch,
    deleteSearch,
    clearSearch,
  } = useAdvancedSearch({
    debounceMs: 300,
    maxResults: 100,
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Register Cmd+Shift+F shortcut
  useKeyboardShortcuts([
    ShortcutDefinitions.searchFiles(() => {
      onOpenChange(true);
    }),
  ]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Escape closes dialog
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  const handleClose = () => {
    onOpenChange(false);
  };

  const dialogSize = isMobile ? 'full' : 'xl';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size={dialogSize}
        className={cn(
          'flex flex-col max-h-[85vh]',
          isMobile && 'h-[100dvh] max-h-[100dvh] rounded-none'
        )}
        hideOverlay={isMobile}
      >
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('search.advancedSearch', 'Advanced Search')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search input */}
        <div className="shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef as any}
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder={t('search.placeholder', 'Search files...')}
              className="w-full h-10 pl-10 pr-10 bg-background border border-border rounded-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger size="sm" className="w-32">
                <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">{t('search.sortByRelevance', 'Relevance')}</SelectItem>
                <SelectItem value="date">{t('search.sortByDate', 'Date')}</SelectItem>
                <SelectItem value="name">{t('search.sortByName', 'Name')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Filters toggle */}
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1"
            >
              <Filter className="w-3.5 h-3.5 mr-2" />
              {t('search.filters', 'Filters')}
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-primary-foreground text-primary text-xs rounded-none">
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>

            {/* Saved searches toggle */}
            <Button
              variant={showSaved ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowSaved(!showSaved)}
              className="flex-1"
            >
              <Bookmark className="w-3.5 h-3.5 mr-2" />
              {t('search.saved', 'Saved')}
              {savedSearches.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-primary-foreground text-primary text-xs rounded-none">
                  {savedSearches.length}
                </span>
              )}
            </Button>

            {/* Clear */}
            {(query || Object.keys(filters).length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
              >
                <X className="w-3.5 h-3.5 mr-2" />
                {t('search.clear', 'Clear')}
              </Button>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Filters panel */}
          {showFilters && (
            <div className="w-64 shrink-0 overflow-y-auto border-r border-border">
              <SearchFilters
                filters={filters}
                onFiltersChange={setFilters}
                availableTags={availableTags}
                availableAuthors={availableAuthors}
              />
            </div>
          )}

          {/* Results panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {showSaved ? (
              <SavedSearches
                savedSearches={savedSearches}
                onSaveSearch={saveSearch}
                onLoadSearch={loadSearch}
                onDeleteSearch={deleteSearch}
                currentQuery={query}
                className="h-full overflow-y-auto"
              />
            ) : (
              <SearchResults
                results={results}
                groupedResults={groupedResults}
                isLoading={isLoading}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onSelectResult={onSelectResult}
                className="h-full"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 pt-3 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {t('search.shortcutHint', 'Press Cmd+Shift+F to open')}
            </span>
            {query && (
              <span>
                {t('search.resultCount', `${results.length} results`)}
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Export types
 */
export type { SearchResult, SearchFilters as SearchFiltersType } from '@/lib/search/search-indexer';
