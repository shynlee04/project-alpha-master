/**
 * @fileoverview Search Filters Component
 * @module presentation/components/search/SearchFilters
 *
 * Search filters UI with file type, date range, tags, author, and file size filters.
 *
 * @story S-027 Advanced Search with Filters
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCode,
  FileText,
  Database,
  Image,
  Calendar,
  Tag,
  User,
  HardDrive,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Label } from '@/presentation/components/ui/label';
import { Button } from '@/presentation/components/ui/button';
import { cn } from '@/lib/utils';
import type { SearchFilters as SearchFiltersType } from '@/lib/search/search-indexer';

export interface SearchFiltersProps {
  /** Current filters */
  filters: SearchFiltersType;

  /** Update filters */
  onFiltersChange: (filters: SearchFiltersType) => void;

  /** Available tags */
  availableTags?: string[];

  /** Available authors */
  availableAuthors?: string[];

  /** CSS class name */
  className?: string;
}

/**
 * Search filters component
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  availableTags = [],
  availableAuthors = [],
  className,
}) => {
  const { t } = useTranslation();

  const updateFilter = <K extends keyof SearchFiltersType>(
    key: K,
    value: SearchFiltersType[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={cn('space-y-4 p-4 border-b border-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold font-pixel uppercase tracking-wider">
          {t('search.filters', 'Filters')}
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            {t('search.clearFilters', 'Clear')}
          </Button>
        )}
      </div>

      {/* File Type Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <FileCode className="w-3.5 h-3.5" />
          {t('search.fileType', 'File Type')}
        </Label>
        <Select
          value={filters.fileTypes?.[0] || 'all'}
          onValueChange={(value) =>
            updateFilter('fileTypes', value === 'all' ? undefined : [value])
          }
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder={t('search.allFileTypes', 'All file types')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.allFileTypes', 'All file types')}</SelectItem>
            <SelectItem value="code">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5" />
                {t('search.codeFiles', 'Code Files')}
              </div>
            </SelectItem>
            <SelectItem value="markup">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                {t('search.markupFiles', 'Markup & Styles')}
              </div>
            </SelectItem>
            <SelectItem value="data">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                {t('search.dataFiles', 'Data Files')}
              </div>
            </SelectItem>
            <SelectItem value="asset">
              <div className="flex items-center gap-2">
                <Image className="w-3.5 h-3.5" />
                {t('search.assetFiles', 'Asset Files')}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          {t('search.dateRange', 'Date Modified')}
        </Label>
        <Select
          value={
            filters.dateRange?.lastDays
              ? `${filters.dateRange.lastDays}d`
              : 'all'
          }
          onValueChange={(value) => {
            if (value === 'all') {
              const { dateRange, ...rest } = filters;
              onFiltersChange(rest);
            } else {
              updateFilter('dateRange', { lastDays: parseInt(value) });
            }
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder={t('search.anyTime', 'Any time')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.anyTime', 'Any time')}</SelectItem>
            <SelectItem value="1">{t('search.today', 'Today')}</SelectItem>
            <SelectItem value="7">{t('search.last7Days', 'Last 7 days')}</SelectItem>
            <SelectItem value="30">{t('search.last30Days', 'Last 30 days')}</SelectItem>
            <SelectItem value="90">{t('search.last90Days', 'Last 90 days')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" />
            {t('search.tags', 'Tags')}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.slice(0, 10).map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const currentTags = filters.tags || [];
                  const newTags = currentTags.includes(tag)
                    ? currentTags.filter(t => t !== tag)
                    : [...currentTags, tag];
                  updateFilter('tags', newTags.length > 0 ? newTags : undefined);
                }}
                className={cn(
                  'px-2 py-1 text-xs rounded-[4px] border transition-colors duration-150',
                  filters.tags?.includes(tag)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary text-secondary-foreground border-border hover:bg-muted'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Author Filter */}
      {availableAuthors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            {t('search.author', 'Author')}
          </Label>
          <Select
            value={filters.author || 'all'}
            onValueChange={(value) =>
              updateFilter('author', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder={t('search.allAuthors', 'All authors')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('search.allAuthors', 'All authors')}</SelectItem>
              {availableAuthors.map((author) => (
                <SelectItem key={author} value={author}>
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* File Size Filter */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5" />
          {t('search.fileSize', 'File Size')}
        </Label>
        <Select
          value={
            filters.sizeRange
              ? `${filters.sizeRange.min || 0}-${filters.sizeRange.max || 'inf'}`
              : 'all'
          }
          onValueChange={(value) => {
            if (value === 'all') {
              const { sizeRange, ...rest } = filters;
              onFiltersChange(rest);
            } else {
              const [min, max] = value.split('-').map(Number);
              updateFilter('sizeRange', {
                min: min || undefined,
                max: max === Infinity ? undefined : max,
              });
            }
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue placeholder={t('search.anySize', 'Any size')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('search.anySize', 'Any size')}</SelectItem>
            <SelectItem value="0-10240">{t('search.small', '< 10KB')}</SelectItem>
            <SelectItem value="10240-102400">
              {t('search.medium', '10KB - 100KB')}
            </SelectItem>
            <SelectItem value="102400-1048576">
              {t('search.large', '100KB - 1MB')}
            </SelectItem>
            <SelectItem value="1048576-inf">{t('search.extraLarge', '> 1MB')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
