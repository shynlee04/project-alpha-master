/**
 * @fileoverview Conversation Card Component
 * @module components/agent/ConversationCard
 * @governance EPIC-31-1
 *
 * Displays individual conversation from memory with insights and tags.
 *
 * Story 31.1: Conversation Memory & Long-Term Context
 */

import { useTranslation } from 'react-i18next';
import { MessageSquare, Tag, Clock, MessageSquareText } from 'lucide-react';
import { useState } from 'react';
import type { ConversationMemory } from '@/lib/agent/memory/conversation-memory';

interface ConversationCardProps {
  /**
   * Conversation memory data
   */
  conversation: ConversationMemory;

  /**
   * Relevance score (0-1)
   */
  score?: number;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Compact mode (default: false)
   */
  compact?: boolean;
}

/**
 * Conversation card component
 *
 * Displays conversation summary, insights, tags, and metadata.
 */
export function ConversationCard({
  conversation,
  score,
  onClick,
  compact = false,
}: ConversationCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      return t('memory.date.today', 'Today');
    } else if (daysDiff === 1) {
      return t('memory.date.yesterday', 'Yesterday');
    } else if (daysDiff < 7) {
      return t('memory.date.daysAgo', '{{days}} days ago', { days: daysDiff });
    } else {
      return date.toLocaleDateString();
    }
  };

  const toggleExpanded = () => {
    if (onClick) {
      onClick();
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const displayedInsights = isExpanded || compact
    ? conversation.insights
    : conversation.insights.slice(0, 2);

  const hasMoreInsights = !compact && conversation.insights.length > 2;

  return (
    <div
      className={`
        bg-panel border border-border rounded-lg p-4
        hover:border-border-hover hover:bg-panel-hover
        transition-all cursor-pointer
        ${compact ? 'mb-2' : 'mb-4'}
      `}
      onClick={toggleExpanded}
    >
      {/* Header with score and date */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-primary line-clamp-2">
            {conversation.summary}
          </h4>
        </div>

        {score !== undefined && score > 0 && (
          <div className="ml-3 flex-shrink-0">
            <div className={`
              px-2 py-1 rounded text-xs font-medium
              ${score >= 0.8 ? 'bg-success/20 text-success' :
                score >= 0.6 ? 'bg-warning/20 text-warning' :
                'bg-muted text-muted-foreground'}
            `}>
              {Math.round(score * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Insights */}
      {conversation.insights.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquareText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {t('memory.insights.label', 'Key Insights')}
            </span>
          </div>

          <ul className="space-y-1">
            {displayedInsights.map((insight, idx) => (
              <li
                key={idx}
                className="text-xs text-secondary-foreground pl-6 relative"
              >
                <span className="absolute left-0 top-0 text-muted-foreground">
                  •
                </span>
                {insight}
              </li>
            ))}
          </ul>

          {hasMoreInsights && !isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className="mt-2 text-xs text-accent hover:underline"
            >
              {t('memory.insights.showMore', 'Show {{count}} more', {
                count: conversation.insights.length - 2,
              })}
            </button>
          )}
        </div>
      )}

      {/* Tags */}
      {conversation.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {t('memory.tags.label', 'Tags')}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {conversation.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer metadata */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatDate(conversation.accessedAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          <span>
            {t('memory.messages.count', '{{count}} messages', {
              count: conversation.messageCount,
            })}
          </span>
        </div>

        {conversation.isExcluded && (
          <span className="text-warning">
            {t('memory.status.excluded', 'Excluded from search')}
          </span>
        )}
      </div>
    </div>
  );
}
