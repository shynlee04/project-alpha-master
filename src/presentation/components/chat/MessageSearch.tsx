/**
 * @fileoverview Message Search Component
 * @module presentation/components/chat/MessageSearch
 *
 * Full-text search across messages with filters and highlighted results.
 * 8-bit gaming style - no blur effects.
 */

import { useCallback, useMemo, useState } from 'react';
import { Search, X, User, Bot, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Input } from '@/presentation/components/ui/input';
import { Button } from '@/presentation/components/ui/button';
import { useChatHistory } from '@/hooks/useChatHistory';
import type { MessageSearchFilters, MessageSearchResult } from '@/lib/chat/message-search';
import type { ThreadMessage } from '@/infrastructure/persistence/stores/conversation/types';

/**
 * Message search props
 */
export interface MessageSearchProps {
  /** Messages grouped by conversation ID */
  conversationMessages: Record<string, ThreadMessage[]>;

  /** Conversation metadata map */
  conversations: Record<string, { title?: string; id: string }>;

  /** Jump to message handler */
  onJumpToMessage?: (conversationId: string, messageId: string) => void;

  /** className for styling */
  className?: string;
}

/**
 * Message Search Component
 *
 * Provides:
 * - Full-text search input
 * - Date range filter
 * - Agent filter
 * - Role filter
 * - Search results with highlighted snippets
 * - Jump to message action
 *
 * @example
 * ```tsx
 * <MessageSearch
 *   conversationMessages={messagesByConversation}
 *   conversations={conversationsById}
 *   onJumpToMessage={(convId, msgId) => navigateToMessage(convId, msgId)}
 * />
 * ```
 */
export function MessageSearch({
  conversationMessages,
  conversations,
  onJumpToMessage,
  className,
}: MessageSearchProps) {
  const { t } = useTranslation();
  const { searchMessages } = useChatHistory();

  // Local state
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<MessageSearchFilters>>({
    role: undefined,
    agentId: undefined,
    dateRange: undefined,
  });

  /**
   * Execute search
   */
  const searchResults = useMemo(() => {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return searchMessages({
      ...filters,
      query,
      conversationMessages,
    });
  }, [query, filters, conversationMessages, searchMessages]);

  /**
   * Update query
   */
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  /**
   * Clear search
   */
  const handleClearSearch = useCallback(() => {
    setQuery('');
    setFilters({
      role: undefined,
      agentId: undefined,
      dateRange: undefined,
    });
  }, []);

  /**
   * Toggle role filter
   */
  const handleToggleRole = useCallback((role: 'user' | 'assistant' | 'system') => {
    setFilters((prev) => ({
      ...prev,
      role: prev.role === role ? undefined : role,
    }));
  }, []);

  /**
   * Jump to message
   */
  const handleJumpToMessage = useCallback((result: MessageSearchResult) => {
    onJumpToMessage?.(result.conversationId, result.message.id);
  }, [onJumpToMessage]);

  /**
   * Get conversation title
   */
  const getConversationTitle = useCallback((conversationId: string) => {
    const conv = conversations[conversationId];
    return conv?.title || t('chat.search.untitledConversation', 'Untitled Conversation');
  }, [conversations, t]);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-slate-900/95 border-l-2 border-slate-700',
        className
      )}
    >
      {/* Header: Search Input */}
      <div className="p-3 border-b-2 border-slate-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder={t('chat.search.placeholder', 'Search messages...')}
            className={cn(
              'pl-9 pr-8 py-2 rounded-sm border-2',
              'bg-slate-800 border-slate-600 text-slate-200',
              'placeholder:text-slate-500',
              'focus:border-blue-500 focus:outline-none',
              'font-mono text-sm',
              'shadow-md'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Toggle Filters Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'mt-2 w-full px-2 py-1 rounded-sm border-2',
            'bg-slate-800/40 border-slate-600 text-slate-400',
            'hover:bg-slate-700/40 hover:border-slate-500',
            'transition-colors shadow-md font-mono text-xs',
            'flex items-center justify-center gap-1'
          )}
        >
          <Filter className="h-3 w-3" />
          <span>{t('chat.search.filters', 'Filters')}</span>
          {showFilters ? <X className="h-3 w-3" /> : null}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-3 border-b-2 border-slate-700 space-y-2">
          {/* Role Filter */}
          <div className="space-y-1">
            <label className="font-mono text-xs text-slate-400">
              {t('chat.search.filterByRole', 'Filter by role:')}
            </label>
            <div className="flex gap-1">
              <FilterToggle
                active={filters.role === 'user'}
                onClick={() => handleToggleRole('user')}
                label={t('chat.search.roleUser', 'User')}
                icon={<User className="h-3 w-3" />}
              />
              <FilterToggle
                active={filters.role === 'assistant'}
                onClick={() => handleToggleRole('assistant')}
                label={t('chat.search.roleAssistant', 'AI')}
                icon={<Bot className="h-3 w-3" />}
              />
              <FilterToggle
                active={filters.role === 'system'}
                onClick={() => handleToggleRole('system')}
                label={t('chat.search.roleSystem', 'System')}
              />
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-1">
            <label className="font-mono text-xs text-slate-400">
              {t('chat.search.filterByDate', 'Filter by date:')}
            </label>
            <div className="flex gap-1">
              <Input
                type="date"
                className={cn(
                  'flex-1 px-2 py-1 rounded-sm border-2',
                  'bg-slate-800 border-slate-600 text-slate-200',
                  'font-mono text-xs'
                )}
                onChange={(e) => {
                  const start = new Date(e.target.value).getTime();
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: prev.dateRange
                      ? { ...prev.dateRange, start }
                      : { start, end: Date.now() },
                  }));
                }}
              />
              <span className="text-slate-500">-</span>
              <Input
                type="date"
                className={cn(
                  'flex-1 px-2 py-1 rounded-sm border-2',
                  'bg-slate-800 border-slate-600 text-slate-200',
                  'font-mono text-xs'
                )}
                onChange={(e) => {
                  const end = new Date(e.target.value).getTime() + 86_400_000; // End of day
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: prev.dateRange
                      ? { ...prev.dateRange, end }
                      : { start: 0, end },
                  }));
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {!query || query.trim().length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Search className="h-8 w-8 mb-2" />
            <p className="font-mono text-sm">
              {t('chat.search.enterQuery', 'Enter a search query to find messages')}
            </p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p className="font-mono text-sm">
              {t('chat.search.noResults', 'No messages found')}
            </p>
          </div>
        ) : (
          searchResults.map((result) => (
            <MessageSearchResultCard
              key={`${result.conversationId}-${result.message.id}`}
              result={result}
              conversationTitle={getConversationTitle(result.conversationId)}
              onJump={() => handleJumpToMessage(result)}
            />
          ))
        )}

        {/* Result count */}
        {query && searchResults.length > 0 && (
          <div className="px-2 py-1 text-center">
            <span className="font-mono text-xs text-slate-500">
              {t('chat.search.resultCount', '{{count}} results', { count: searchResults.length })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Filter Toggle Button
 */
interface FilterToggleProps {
  active?: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

function FilterToggle({ active = false, onClick, label, icon }: FilterToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-sm border-2 transition-colors',
        'font-mono text-xs whitespace-nowrap',
        active
          ? 'bg-blue-600/30 border-blue-500 text-blue-300'
          : 'bg-slate-800/40 border-slate-600 text-slate-400 hover:bg-slate-700/40 hover:border-slate-500',
        'shadow-md'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/**
 * Message Search Result Card
 */
interface MessageSearchResultCardProps {
  result: MessageSearchResult;
  conversationTitle: string;
  onJump: () => void;
}

function MessageSearchResultCard({ result, conversationTitle, onJump }: MessageSearchResultCardProps) {
  const { t } = useTranslation();

  const { message, snippet, score } = result;
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'p-3 rounded-sm border-2 cursor-pointer',
        'bg-slate-800/40 border-slate-700',
        'hover:bg-slate-700/40 hover:border-slate-600',
        'transition-colors shadow-md'
      )}
      onClick={onJump}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onJump();
        }
      }}
    >
      {/* Header: Role + Conversation */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Role badge */}
          <span
            className={cn(
              'px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold',
              'border-2',
              isUser
                ? 'bg-blue-900/40 text-blue-300 border-blue-600'
                : 'bg-purple-900/40 text-purple-300 border-purple-600'
            )}
          >
            {isUser ? (
              <User className="h-3 w-3 inline mr-1" />
            ) : (
              <Bot className="h-3 w-3 inline mr-1" />
            )}
            {t(`chat.search.role${message.role.charAt(0).toUpperCase() + message.role.slice(1)}`)}
          </span>

          {/* Conversation title */}
          <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">
            {conversationTitle}
          </span>
        </div>

        {/* Relevance score */}
        <span
          className={cn(
            'px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold',
            'bg-slate-700/40 text-slate-500 border border-slate-600'
          )}
          title={t('chat.search.relevanceScore', 'Relevance score')}
        >
          {Math.round(score * 100)}%
        </span>
      </div>

      {/* Snippet with highlighted match */}
      <p className="text-xs text-slate-300 font-mono line-clamp-3 mb-2">
        {snippet}
      </p>

      {/* Footer: Timestamp */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">
          {new Date(message.timestamp).toLocaleString()}
        </span>

        {/* Agent attribution */}
        {!isUser && message.agentName && (
          <span className="text-[10px] text-slate-500 font-mono">
            {message.agentName}
          </span>
        )}
      </div>
    </div>
  );
}
