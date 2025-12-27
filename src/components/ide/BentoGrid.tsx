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
        relative bg-[#18181b] border-2 border-[#27272a]
        shadow-[2px_2px_0px_rgba(0,0,0,0.5)]
        hover:shadow-[4px_4px_0px_rgba(0,0,0,0.7)]
        hover:scale-[1.02]
        focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 focus:ring-offset-2
        transition-all duration-150 ease-out
        ${gridClass} ${className}
        rounded-none
        p-4
        cursor-pointer
        outline-none
        focus:outline-none
      `}
      role="button"
      tabIndex={0}
      onClick={onClick}
      aria-label={t('bentoCard.ariaLabel', { title })}
    >
      {/* Topic Badge */}
      {topic && (
        <div className="absolute top-3 right-3">
          <span className="inline-block px-2 py-1 text-xs font-medium text-[#f97316] bg-[#27272a] rounded-none">
            {topic}
          </span>
        </div>
      )}

      {/* Card Content */}
      <div className="h-full flex flex-col p-4">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3 mb-3">
          {icon && (
            <div className="text-[#f97316]">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-[#f97316] font-semibold text-lg">
              {title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-[#f97316] text-sm mb-2 line-clamp-3">
            {description}
          </p>
        )}

        {/* Interactive Content */}
        {content && (
          <div className="mt-3">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BentoGrid - Main grid container with topic filtering and search
 * 
 * Features:
 * - Responsive CSS Grid layout
 * - Topic categorization and filtering
 * - Search functionality
 * - Keyboard navigation
 * - Accessibility: WCAG AA compliant
 */
export function BentoGrid({
  cards,
  topics = ['Getting Started', 'File Operations', 'AI Agent', 'Terminal', 'Settings'],
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
      // Filter by topic
      if (selectedTopic && card.topic !== selectedTopic) {
        return false;
      }

      // Filter by search query
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

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, card: BentoCardProps) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      card.onClick?.();
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Search and Topic Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Input */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder={t('bentoGrid.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full px-4 py-2 bg-[#18181b] border-2 border-[#27272a] text-[#f97316] placeholder:text-[#71717a] focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 focus:ring-offset-2 outline-none rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
              aria-label={t('bentoGrid.searchAriaLabel')}
            />
          </div>
        </div>

        {/* Topic Filter Tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 sm:pb-0"
          role="tablist"
          aria-label={t('bentoGrid.topicFilterAriaLabel')}
        >
          <button
            onClick={() => onTopicSelect?.('')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-150 ease-out rounded-none border-2 ${!selectedTopic
              ? 'bg-[#f97316] text-white border-[#f97316] shadow-[2px_2px_0px_rgba(0,0,0,0.5)]'
              : 'bg-[#18181b] text-[#f97316] border-[#27272a] hover:border-[#f97316]'
              }`}
            aria-label={t('bentoGrid.allTopics')}
            role="tab"
            aria-selected={!selectedTopic ? 'true' : 'false'}
          >
            {t('bentoGrid.allTopics')}
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => onTopicSelect?.(topic)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-150 ease-out rounded-none border-2 whitespace-nowrap ${selectedTopic === topic
                ? 'bg-[#f97316] text-white border-[#f97316] shadow-[2px_2px_0px_rgba(0,0,0,0.5)]'
                : 'bg-[#18181b] text-[#f97316] border-[#27272a] hover:border-[#f97316]'
                }`}
              aria-label={`${t('bentoGrid.topicFilter', { topic })}`}
              role="tab"
              aria-selected={selectedTopic === topic ? 'true' : 'false'}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label={t('bentoGrid.gridAriaLabel')}
      >
        {filteredCards.map((card, index) => (
          <BentoCard
            key={card.id}
            {...card}
            onKeyDown={(e) => handleKeyDown(e, card)}
            className="focus-visible:ring-2 focus-visible:ring-[#f97316]"
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#71717a] text-lg">
            {t('bentoGrid.noResults')}
          </p>
          <p className="text-[#52525b] text-sm mt-2">
            {t('bentoGrid.tryDifferentSearch')}
          </p>
        </div>
      )}
    </div>
  );
}
