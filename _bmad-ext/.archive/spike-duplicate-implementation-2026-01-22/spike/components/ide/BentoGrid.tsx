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

  // Size-based styling - optimized for 120px base row height
  const sizeStyles: Record<BentoCardSize, string> = {
    small: 'col-span-1 row-span-1',         // 1x1 (Standard square)
    medium: 'col-span-2 row-span-2',        // 2x2 (Featured item)
    large: 'col-span-3 row-span-3',         // 3x3 (Hero content)
    'extra-large': 'col-span-4 row-span-4', // 4x4 (Full dashboard)
    wide: 'col-span-2 row-span-1',          // 2x1 (Banner/Header)
    tall: 'col-span-1 row-span-2',          // 1x2 (Sidebar/List)
  };

  const gridClass = sizeStyles[size] || 'col-span-2 row-span-2';

  // Dynamic typography based on card size
  const titleSizeClass = size === 'small' || size === 'tall'
    ? 'text-base'
    : 'text-lg md:text-xl';

  return (
    <div
      id={id}
      className={`
        relative bg-card border-2 border-border
        shadow-pixel hover:shadow-pixel-lg
        hover:scale-[1.01] hover:border-primary/50
        focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-2
        transition-all duration-200 ease-out
        ${gridClass} ${className}
        rounded-none
        p-4
        cursor-pointer
        outline-none
        focus:outline-none
        group
        flex flex-col
      `}
      role="button"
      tabIndex={0}
      onClick={onClick}
      aria-label={t('bentoCard.ariaLabel', { title })}
    >
      {/* Topic Badge - Subtle placement */}
      {topic && (
        <div className="absolute top-2 right-2 z-10 opacity-70 group-hover:opacity-100 transition-opacity">
          <span className="inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-pixel text-muted-foreground bg-background border border-border/50">
            {topic}
          </span>
        </div>
      )}

      {/* Card Content Container */}
      <div className="flex-1 flex flex-col h-full relative z-0">

        {/* Header: Icon + Title */}
        <div className="flex flex-col gap-3 mb-2">
          {icon && (
            <div className="text-primary/80 group-hover:text-primary transition-colors duration-300 group-hover:scale-110 origin-left">
              {React.cloneElement(icon as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                className: `w-6 h-6 ${size === 'medium' ? 'md:w-8 md:h-8' : ''}`
              })}
            </div>
          )}

          <div className="pr-12">
            <h3 className={`text-foreground font-pixel-heavy leading-tight group-hover:text-primary transition-colors break-words line-clamp-2 ${titleSizeClass}`}>
              {title}
            </h3>
          </div>
        </div>

        {/* Description - Shown mainly on larger cards */}
        {description && size !== 'small' && (
          <p className="text-muted-foreground text-xs md:text-sm font-sans leading-relaxed line-clamp-3 mt-1">
            {description}
          </p>
        )}

        {/* Custom Content Slot */}
        {content && (
          <div className="mt-auto pt-4">
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

  // Filter cards logic remains same...
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
    <div className={`flex flex-col gap-6 ${className}`}>

      {/* Controls Bar: Unified visual line */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between border-b-2 border-border/50 pb-4">

        {/* Search Input - Compact design */}
        <div className="relative w-full md:w-64 group transition-all duration-300 focus-within:md:w-80">
          <input
            type="text"
            placeholder={t('bentoGrid.searchPlaceholder', 'SEARCH_PORTAL...')}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-background/50 border-2 border-border text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background outline-none transition-all font-mono text-xs uppercase"
            aria-label={t('bentoGrid.searchAriaLabel')}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-[10px] text-muted-foreground font-pixel opacity-50">/</span>
          </div>
        </div>

        {/* Topic Filter Tabs - Minimalist */}
        <div
          className="flex gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0"
          role="tablist"
        >
          <button
            onClick={() => onTopicSelect?.('')}
            className={`px-3 py-1.5 text-xs font-pixel uppercase tracking-wide transition-all border-2 shrink-0 ${!selectedTopic
              ? 'bg-primary/10 border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
          >
            {t('bentoGrid.allTopics', 'ALL')}
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => onTopicSelect?.(topic)}
              className={`px-3 py-1.5 text-xs font-pixel uppercase tracking-wide transition-all border-2 shrink-0 ${selectedTopic === topic
                ? 'bg-primary/10 border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid - Tighter gaps and rows */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(120px,auto)]"
      >
        {filteredCards.map((card) => (
          <BentoCard
            key={card.id}
            {...card}
            onKeyDown={(e) => handleKeyDown(e, card)}
            className="h-full w-full"
          />
        ))}
      </div>

      {/* Empty State - Minimal */}
      {filteredCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border/50 opacity-70">
          <p className="text-muted-foreground font-pixel text-lg">
            {t('bentoGrid.noResults', 'VOID_DETECTED')}
          </p>
        </div>
      )}
    </div>
  );
}
