/**
 * @fileoverview Chat History Sidebar Component
 * @module presentation/components/chat/ChatHistory
 *
 * Sidebar displaying conversation history with search, filters, and actions.
 * 8-bit gaming style - no blur effects, mobile-responsive with collapsible sidebar.
 */

import { useCallback, useMemo, useState } from 'react';
import { Search, Plus, X, Star, Archive, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { ConversationCard } from './ConversationCard';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';

/**
 * Filter options
 */
type FilterType = 'all' | 'favorites' | 'archived' | 'tag';

/**
 * Chat history sidebar props
 */
export interface ChatHistoryProps {
  /** Workspace type for filtering */
  workspaceType?: string;

  /** Project ID for filtering */
  projectId?: string | null;

  /** Currently selected conversation ID */
  selectedConversationId?: string | null;

  /** Conversation select handler */
  onSelectConversation?: (conversationId: string) => void;

  /** New conversation handler */
  onNewConversation?: () => void;

  /** Whether sidebar is collapsed (mobile) */
  collapsed?: boolean;

  /** Toggle collapse handler */
  onToggleCollapse?: () => void;

  /** className for styling */
  className?: string;
}

/**
 * Chat History Sidebar Component
 *
 * Displays:
 * - New conversation button
 * - Search bar
 * - Filter buttons (all, favorites, archived, tags)
 * - Conversation list with cards
 * - Mobile: Collapsible with swipe gesture support
 *
 * @example
 * ```tsx
 * <ChatHistory
 *   workspaceType="ide"
 *   projectId="project-123"
 *   selectedConversationId="conv-456"
 *   onSelectConversation={(id) => loadConversation(id)}
 *   onNewConversation={() => createNewConversation()}
 * />
 * ```
 */
export function ChatHistory({
  workspaceType = 'ide',
  projectId = null,
  selectedConversationId = null,
  onSelectConversation,
  onNewConversation,
  collapsed = false,
  onToggleCollapse: _onToggleCollapse,
  className,
}: ChatHistoryProps) {
  const { t } = useTranslation();

  // Chat history hook
  const {
    conversations,
    deleteConversation,
    archiveConversation,
    unarchiveConversation,
    toggleFavorite,
    addTag,
    searchConversations,
    getFavoriteConversations: _getFavoriteConversations,
    getArchivedConversations: _getArchivedConversations,
    getConversationsByTag: _getConversationsByTag,
  } = useChatHistory();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get messages for last message preview (from thread store)
  const getMessages = useConversationStore((s) => s.getMessagesByThread);

  /**
   * Get last message preview for a conversation
   */
  const getLastMessage = useCallback((conversationId: string): string | undefined => {
    // Get threads for this conversation
    const threads = useConversationStore.getState().getThreadsByConversation(conversationId);
    if (threads.length === 0) return undefined;

    // Get messages from root thread
    const rootThread = threads.find((t) => t.isRoot) || threads[0];
    const messages = getMessages(rootThread.id);
    if (messages.length === 0) return undefined;

    // Get last user or assistant message
    const lastMessage = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .pop();

    return lastMessage?.content;
  }, [getMessages]);

  /**
   * Filter conversations by workspace and project
   */
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      // Filter by workspace type
      if (c.workspaceType !== workspaceType) return false;

      // Filter by project (if specified)
      if (projectId && c.projectId !== projectId) return false;

      // Apply active filter
      if (activeFilter === 'favorites' && !c.pinned) return false;
      if (activeFilter === 'archived' && c.status !== 'archived') return false;
      if (activeFilter === 'tag' && selectedTag) {
        if (!c.tags || !c.tags.includes(selectedTag)) return false;
      }

      return true;
    });
  }, [conversations, workspaceType, projectId, activeFilter, selectedTag]);

  /**
   * Search conversations (if query provided)
   */
  const displayConversations = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return filteredConversations;
    }

    return searchConversations(searchQuery).filter((c) => {
      // Still apply workspace/project filters
      if (c.workspaceType !== workspaceType) return false;
      if (projectId && c.projectId !== projectId) return false;

      return true;
    });
  }, [filteredConversations, searchQuery, searchConversations, workspaceType, projectId]);

  /**
   * Sort conversations: active first, then by updated date
   */
  const sortedConversations = useMemo(() => {
    return [...displayConversations].sort((a, b) => {
      // Selected conversation first
      if (a.id === selectedConversationId) return -1;
      if (b.id === selectedConversationId) return 1;

      // Then by updated date (newest first)
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [displayConversations, selectedConversationId]);

  /**
   * Get unique tags from all conversations
   */
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    conversations.forEach((c) => {
      c.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [conversations]);

  /**
   * Handle select conversation
   */
  const handleSelectConversation = useCallback((conversationId: string) => {
    onSelectConversation?.(conversationId);
  }, [onSelectConversation]);

  /**
   * Handle new conversation
   */
  const handleNewConversation = useCallback(() => {
    onNewConversation?.();
  }, [onNewConversation]);

  /**
   * Handle delete conversation
   */
  const handleDeleteConversation = useCallback((conversationId: string) => {
    if (confirm(t('chat.history.confirmDelete', 'Are you sure you want to delete this conversation?'))) {
      deleteConversation(conversationId);
    }
  }, [deleteConversation, t]);

  /**
   * Handle archive conversation
   */
  const handleArchiveConversation = useCallback((conversationId: string) => {
    archiveConversation(conversationId);
  }, [archiveConversation]);

  /**
   * Handle unarchive conversation
   */
  const handleUnarchiveConversation = useCallback((conversationId: string) => {
    unarchiveConversation(conversationId);
  }, [unarchiveConversation]);

  /**
   * Handle rename conversation
   */
  const handleRenameConversation = useCallback((conversationId: string, newTitle: string) => {
    const { updateConversation } = useChatHistory();
    updateConversation(conversationId, { title: newTitle });
  }, []);

  /**
   * Handle add tag
   */
  const handleAddTag = useCallback((conversationId: string, tag: string) => {
    addTag(conversationId, tag);
  }, [addTag]);

  /**
   * Clear search
   */
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  /**
   * Set filter
   */
  const handleSetFilter = useCallback((filter: FilterType, tag?: string) => {
    setActiveFilter(filter);
    if (tag) setSelectedTag(tag);
    else setSelectedTag(null);
  }, []);

  // Don't render if collapsed
  if (collapsed) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-slate-900/95 border-l-2 border-slate-700',
        className
      )}
    >
      {/* Header: Title + New Button */}
      <div className="flex items-center justify-between p-3 border-b-2 border-slate-700">
        <h2 className="font-mono font-bold text-sm text-slate-200">
          {t('chat.history.title', 'History')}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewConversation}
          className={cn(
            'px-2 py-1 rounded-sm border-2',
            'bg-blue-600/20 border-blue-500 text-blue-300',
            'hover:bg-blue-600/30 transition-colors',
            'shadow-md'
          )}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b-2 border-slate-700">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('chat.history.searchPlaceholder', 'Search conversations...')}
            className={cn(
              'pl-9 pr-8 py-2 rounded-sm border-2',
              'bg-slate-800 border-slate-600 text-slate-200',
              'placeholder:text-slate-500',
              'focus:border-blue-500 focus:outline-none',
              'font-mono text-sm',
              'shadow-md'
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-1 p-2 border-b-2 border-slate-700 overflow-x-auto">
        <FilterButton
          active={activeFilter === 'all'}
          onClick={() => handleSetFilter('all')}
          label={t('chat.history.filterAll', 'All')}
        />

        <FilterButton
          active={activeFilter === 'favorites'}
          onClick={() => handleSetFilter('favorites')}
          icon={<Star className="h-3 w-3" />}
          label={t('chat.history.filterFavorites', 'Favorites')}
        />

        <FilterButton
          active={activeFilter === 'archived'}
          onClick={() => handleSetFilter('archived')}
          icon={<Archive className="h-3 w-3" />}
          label={t('chat.history.filterArchived', 'Archived')}
        />

        {/* Tag filters */}
        {allTags.slice(0, 3).map((tag) => (
          <FilterButton
            key={tag}
            active={activeFilter === 'tag' && selectedTag === tag}
            onClick={() => handleSetFilter('tag', tag)}
            icon={<Tag className="h-3 w-3" />}
            label={tag}
          />
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <p className="font-mono text-sm">
              {searchQuery
                ? t('chat.history.noSearchResults', 'No conversations found')
                : t('chat.history.noConversations', 'No conversations yet')}
            </p>
            <p className="font-mono text-xs mt-1">
              {t('chat.history.startNewConversation', 'Start a new conversation to begin')}
            </p>
          </div>
        ) : (
          sortedConversations.map((conversation) => {
            // Get last message preview
            const lastMessage = getLastMessage(conversation.id);
            const threads = useConversationStore.getState().getThreadsByConversation(conversation.id);
            const messageCount = threads.reduce((count, thread) => {
              return count + getMessages(thread.id).length;
            }, 0);

            return (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                lastMessage={lastMessage}
                isActive={conversation.id === selectedConversationId}
                messageCount={messageCount}
                onClick={handleSelectConversation}
                onDelete={handleDeleteConversation}
                onArchive={handleArchiveConversation}
                onUnarchive={handleUnarchiveConversation}
                onToggleFavorite={toggleFavorite}
                onRename={handleRenameConversation}
                onAddTag={handleAddTag}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Filter Button Component
 */
interface FilterButtonProps {
  active?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
}

function FilterButton({ active = false, onClick, icon, label }: FilterButtonProps) {
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
