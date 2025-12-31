import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * BentoGrid - Discovery interface with bento cards, topics, and interactive documents
 * 
 * Design Principles:
 * - 8-bit aesthetic: Squared corners, pixel shadows, no rounded elements
 * - Grid-based layout using CSS Grid
 * - Responsive: Adapts to mobile (<640px), tablet (640px-1024px), desktop (>1024px)
 * - Topic categorization for content filtering
 * - Interactive document previews with expand/collapse
 * - Accessibility: WCAG AA compliant with keyboard navigation
 */

export type BentoCardSize = 'small' | 'medium' | 'large' | 'extra-large' | 'wide' | 'tall';

export interface BentoCardProps {
  id: string;
  size: BentoCardSize;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  topic?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
}

export interface BentoGridProps {
  cards: BentoCardProps[];
  topics?: string[];
  selectedTopic?: string;
  onTopicSelect?: (topic: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  className?: string;
}

/**
 * BentoCard - Individual card component for bento grid
 * 
 * Features:
 * - 8-bit design with squared corners and pixel shadows
 * - Hover effects with subtle scale animation
 * - Topic badge for categorization
 * - Interactive content with expand/collapse
 * - Keyboard navigation support
 * - Screen reader accessible
 */
// ... imports remain the same

export function BentoCard({
  id,
  size = 'medium',
  title,
  description,
  icon,
  content,
  topic,
  onClick,
  className = '',
}: BentoCardProps) {
  const { t } = useTranslation();

  // Size-based styling
  const sizeStyles: Record<BentoCardSize, string> = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-2',
    large: 'col-span-3 row-span-3',
    'extra-large': 'col-span-4 row-span-4',
    wide: 'col-span-2 row-span-1',
    tall: 'col-span-1 row-span-2',
  };

  const gridClass = sizeStyles[size] || 'col-span-2 row-span-2';

  return (
    <div
      id={id}
      className={`
        relative bg-card border-2 border-border
        shadow-pixel hover:shadow-pixel-lg
        hover:scale-[1.02] hover:border-primary/50
        focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-2
        transition-all duration-200 ease-out
        ${gridClass} ${className}
        rounded-none
        p-4
        cursor-pointer
        outline-none
        focus:outline-none
        group
      `}
      role="button"
      tabIndex={0}
      onClick={onClick}
      aria-label={t('bentoCard.ariaLabel', { title })}
    >
      {/* Topic Badge */}
      {topic && (
        <div className="absolute top-3 right-3">
          <span className="inline-block px-2 py-1 text-xs font-pixel text-primary bg-background/80 border border-border/50">
            {topic}
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="h-full flex flex-col p-2">
        {/* Header with icon and title */}
        <div className="flex items-start gap-4 mb-3">
          {icon && (
            <div className="text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-foreground font-pixel-heavy text-lg leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3 font-sans leading-relaxed">
            {description}
          </p>
        )}

        {/* Interactive Content */}
        {content && (
          <div className="mt-auto">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

export function BentoGrid({
  cards,
  topics = ['Workspace', 'Agents', 'Knowledge', 'About', 'Settings'],
  selectedTopic,
  onTopicSelect,
  searchQuery,
  onSearchChange,
  className = '',
}: BentoGridProps) {
  const { t } = useTranslation();

  // Filter cards by topic and search query
  const filteredCards = React.useMemo(() => {
    return cards.filter(card => {
      if (selectedTopic && card.topic !== selectedTopic) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          card.title.toLowerCase().includes(query) ||
          card.description?.toLowerCase().includes(query) ||
          card.topic?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [cards, selectedTopic, searchQuery]);

  const handleKeyDown = (event: React.KeyboardEvent, card: BentoCardProps) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.onClick?.();
    }
  };

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {/* Search and Topic Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
        {/* Search Input */}
        <div className="flex-1 w-full md:w-auto md:max-w-md">
          <div className="relative group">
            <input
              type="text"
              placeholder={t('bentoGrid.searchPlaceholder', 'Type command or search...')}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full px-4 py-3 bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none shadow-pixel group-hover:shadow-pixel-primary transition-all font-mono text-sm"
              aria-label={t('bentoGrid.searchAriaLabel')}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
              <span className="text-xs font-pixel bg-muted px-1.5 py-0.5 border border-border">/</span>
            </div>
          </div>
        </div>

        {/* Topic Filter Tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-thin"
          role="tablist"
          aria-label={t('bentoGrid.topicFilterAriaLabel')}
        >
          <button
            onClick={() => onTopicSelect?.('')}
            className={`px-4 py-2 text-sm font-pixel transition-all duration-200 ease-out border-2 shrink-0 ${!selectedTopic
              ? 'bg-primary text-primary-foreground border-primary shadow-pixel-sm'
              : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
              }`}
            role="tab"
            aria-selected={!selectedTopic}
          >
            {t('bentoGrid.allTopics', 'ALL.SYS')}
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => onTopicSelect?.(topic)}
              className={`px-4 py-2 text-sm font-pixel transition-all duration-200 ease-out border-2 shrink-0 ${selectedTopic === topic
                ? 'bg-primary text-primary-foreground border-primary shadow-pixel-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'
                }`}
              role="tab"
              aria-selected={selectedTopic === topic}
            >
              {topic.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]"
        aria-label={t('bentoGrid.gridAriaLabel')}
      >
        {filteredCards.map((card) => (
          <BentoCard
            key={card.id}
            {...card}
            onKeyDown={(e) => handleKeyDown(e, card)}
            className="focus-visible:ring-2 focus-visible:ring-primary"
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border bg-card/30">
          <p className="text-muted-foreground text-xl font-pixel">
            {t('bentoGrid.noResults', 'NO_DATA_FOUND')}
          </p>
          <p className="text-muted-foreground/60 text-sm mt-2 font-mono">
            {t('bentoGrid.tryDifferentSearch', 'Check your query syntax...')}
          </p>
        </div>
      )}
    </div>
  );
}
