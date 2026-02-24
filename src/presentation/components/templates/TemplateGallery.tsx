/**
 * @fileoverview Template Gallery Component
 * @module presentation/components/templates/TemplateGallery
 * @governance S-042
 * @created 2026-01-06T15:15:00+07:00
 *
 * Template browser with category filter, search, and template cards.
 * Mobile-optimized with responsive layout.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Code2,
  Server,
  Layers,
  Box,
  Star,
  Clock,
  Cpu,
  Globe,
  Smartphone,
  Monitor,
  GitBranch,
  Container,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getAllTemplates,
  getTemplateById,
  type ProjectTemplate,
  type TemplateCategory,
} from '@/lib/templates/template-registry';
import type { TemplateFilterOptions } from '@/lib/templates/template-types';

// ============================================================================
// Types
// ============================================================================

export interface TemplateGalleryProps {
  /** Currently selected template ID */
  selectedTemplateId?: string;
  /** Callback when template is selected */
  onSelectTemplate: (template: ProjectTemplate) => void;
  /** Featured templates only */
  featuredOnly?: boolean;
  /** Maximum complexity to show */
  maxComplexity?: number;
  /** Number of templates to show */
  limit?: number;
  /** Show template preview */
  showPreview?: boolean;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Atom: Box,
  Box: Box,
  Triangle: Sparkles,
  Layers: Layers,
  Server: Server,
  FileCode: Code2,
  Database: Server,
  Cpu: Cpu,
  Globe: Globe,
  Smartphone: Smartphone,
  Monitor: Monitor,
  GitBranch: GitBranch,
  Container: Container,
};

function getTemplateIcon(iconName: string) {
  return ICON_MAP[iconName] || Box;
}

// ============================================================================
// Category Icons
// ============================================================================>

const CATEGORY_ICONS: Record<
  TemplateCategory | 'all',
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  all: { icon: Layers, label: 'All' },
  frontend: { icon: Code2, label: 'Frontend' },
  backend: { icon: Server, label: 'Backend' },
  fullstack: { icon: Layers, label: 'Full-Stack' },
  specialized: { icon: Cpu, label: 'Specialized' },
};

// ============================================================================
// Template Card Component
// ============================================================================

interface TemplateCardProps {
  template: ProjectTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
}) => {
  const IconComponent = getTemplateIcon(template.icon);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 border-2 rounded-[4px] transition-all duration-150",
        "hover:border-primary hover:bg-primary/5 hover:scale-[1.02]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        isSelected
          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
          : "border-border bg-card"
      )}
      aria-label={`Select ${template.name} template`}
      aria-pressed={isSelected}
    >
      {/* Header: Icon + Name + Popularity */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 min-w-[48px] min-h-[48px]",
              "flex items-center justify-center",
              "border-2 rounded-[4px]",
              isSelected ? "border-primary bg-primary/20" : "border-border bg-muted"
            )}
          >
            <IconComponent className="w-6 h-6 text-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-base">
              {template.name}
            </h3>
            {template.meta?.featured && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-xs text-primary font-medium">
                  Featured
                </span>
              </div>
            )}
          </div>
        </div>
        {template.meta?.popularity !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-muted text-muted" />
            <span>{template.meta.popularity}%</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {template.tags.slice(0, 4).map((tag: string) => (
          <span
            key={tag}
            className="px-2 py-0.5 text-xs border border-border rounded-[2px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
        {template.tags.length > 4 && (
          <span className="px-2 py-0.5 text-xs text-muted-foreground">
            +{template.tags.length - 4}
          </span>
        )}
      </div>

      {/* Footer: Complexity + Setup Time */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {template.meta?.complexity && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Difficulty:</span>
            <span>
              {'★'.repeat(template.meta.complexity)}
              {'☆'.repeat(5 - template.meta.complexity)}
            </span>
          </div>
        )}
        {template.meta?.setupTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{template.meta.setupTime} min</span>
          </div>
        )}
      </div>
    </button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * TemplateGallery - Browse and select project templates
 *
 * Features:
 * - Category filter (All, Frontend, Backend, Full-Stack, Specialized)
 * - Search by name, description, or tags
 * - Template cards with icon, name, description, tags, popularity
 * - Featured templates highlighted
 * - Mobile-optimized (responsive grid)
 * - Touch targets ≥44px
 * - 8-bit gaming style (no glassmorphism)
 *
 * @example
 * ```tsx
 * <TemplateGallery
 *   selectedTemplateId={selectedTemplate?.id}
 *   onSelectTemplate={handleTemplateSelect}
 *   featuredOnly={false}
 * />
 * ```
 */
export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  featuredOnly = false,
  maxComplexity,
  limit,
  showPreview = false,
}) => {
  const { t } = useTranslation();

  // Filter state
  const [selectedCategory, setSelectedCategory] =
    useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter templates
  const filteredTemplates = useMemo(() => {
    const filterOptions: TemplateFilterOptions = {
      category: selectedCategory,
      search: searchQuery || undefined,
      featuredOnly,
      maxComplexity,
    };

    let templates = getAllTemplates();

    // Apply additional filters
    if (filterOptions.category && filterOptions.category !== 'all') {
      templates = templates.filter((t) => t.category === filterOptions.category);
    }

    if (filterOptions.search) {
      const query = filterOptions.search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filterOptions.featuredOnly) {
      templates = templates.filter((t) => t.meta?.featured);
    }

    if (filterOptions.maxComplexity) {
      templates = templates.filter(
        (t) => (t.meta?.complexity || 5) <= filterOptions.maxComplexity!
      );
    }

    // Sort by popularity (desc)
    templates.sort((a, b) => (b.meta?.popularity || 0) - (a.meta?.popularity || 0));

    // Apply limit
    if (limit) {
      templates = templates.slice(0, limit);
    }

    return templates;
  }, [selectedCategory, searchQuery, featuredOnly, maxComplexity, limit]);

  // Handle template selection
  const handleSelectTemplate = useCallback(
    (template: ProjectTemplate) => {
      onSelectTemplate(template);
    },
    [onSelectTemplate]
  );

  // Handle category change
  const handleCategoryChange = useCallback(
    (category: TemplateCategory | 'all') => {
      setSelectedCategory(category);
    },
    []
  );

  // Handle search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            {t('templates.gallery.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('templates.gallery.description')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('templates.gallery.searchPlaceholder')}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 min-h-[44px]",
              "border-2 border-border bg-background text-foreground",
              "rounded-[4px] placeholder:text-muted-foreground",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            )}
            aria-label="Search templates"
          />
        </div>

        {/* Category Filter */}
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Template categories"
        >
          {Object.entries(CATEGORY_ICONS).map(([key, { icon: Icon, label }]) => {
            const isActive = selectedCategory === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key as TemplateCategory | 'all')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 min-h-[44px] border-2 rounded-[4px]",
                  "transition-colors duration-150 font-medium text-sm",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-muted"
                )}
                role="tab"
                aria-selected={isActive}
                aria-label={`Filter by ${label}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        {t('templates.gallery.results', { count: filteredTemplates.length })}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="listbox"
          aria-label="Available templates"
        >
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplateId === template.id}
              onSelect={() => handleSelectTemplate(template)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 border-2 border-dashed border-border rounded-[4px]">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-muted rounded-full">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {t('templates.gallery.empty.title')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('templates.gallery.empty.description')}
          </p>
        </div>
      )}

      {/* Template Preview (optional) */}
      {showPreview && selectedTemplateId && (
        <div className="border-2 border-border rounded-[4px] p-6 bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {t('templates.gallery.preview.title')}
          </h3>
          {(() => {
            const template = getTemplateById(selectedTemplateId);
            if (!template) return null;

            return (
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">
                    {t('templates.gallery.preview.description')}:
                  </span>
                  <p className="text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-foreground">
                    {t('templates.gallery.preview.dependencies')}:
                  </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.keys(template.config.dependencies).map((dep) => (
                      <code
                        key={dep}
                        className="px-2 py-0.5 bg-muted border border-border rounded text-xs"
                      >
                        {dep}
                      </code>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-medium text-foreground">
                    {t('templates.gallery.preview.setupTime')}:
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {template.meta?.setupTime} {t('templates.gallery.preview.minutes')}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
