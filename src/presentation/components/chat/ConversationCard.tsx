/**
 * @fileoverview Conversation Card Component
 * @module presentation/components/chat/ConversationCard
 *
 * Displays conversation preview card with title, last message, timestamp, and actions.
 * 8-bit gaming style - no blur effects.
 */

import { useCallback, useMemo } from 'react';
import { Trash2, Archive, ArchiveRestore, Star, StarOff, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import type { ConversationMetadataWithId } from '@/infrastructure/persistence/stores/conversation/types';

/**
 * Conversation card props
 */
export interface ConversationCardProps {
  /** Conversation data */
  conversation: ConversationMetadataWithId;

  /** Last message preview */
  lastMessage?: string;

  /** Whether this is the active conversation */
  isActive?: boolean;

  /** Click handler */
  onClick?: (conversationId: string) => void;

  /** Delete handler */
  onDelete?: (conversationId: string) => void;

  /** Archive handler */
  onArchive?: (conversationId: string) => void;

  /** Unarchive handler */
  onUnarchive?: (conversationId: string) => void;

  /** Toggle favorite handler */
  onToggleFavorite?: (conversationId: string) => void;

  /** Rename handler */
  onRename?: (conversationId: string, newTitle: string) => void;

  /** Add tag handler */
  onAddTag?: (conversationId: string, tag: string) => void;

  /** Message count */
  messageCount?: number;

  /** className for styling */
  className?: string;
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: string | number): string {
  try {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Truncate text to max length
 */
function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Conversation Card Component
 *
 * Displays conversation preview with:
 * - Title (editable)
 * - Last message preview (100 chars)
 * - Relative timestamp
 * - Message count badge
 * - Favorite (star) indicator
 * - Tags display
 * - Action menu (delete, archive, rename, add tag)
 *
 * @example
 * ```tsx
 * <ConversationCard
 *   conversation={conversation}
 *   lastMessage="How do I implement..."
 *   isActive={true}
 *   onClick={(id) => selectConversation(id)}
 *   onDelete={(id) => deleteConversation(id)}
 *   onToggleFavorite={(id) => toggleFavorite(id)}
 * />
 * ```
 */
export function ConversationCard({
  conversation,
  lastMessage,
  isActive = false,
  onClick,
  onDelete,
  onArchive,
  onUnarchive,
  onToggleFavorite,
  onRename,
  // onAddTag, // TODO: Implement tag addition
  messageCount = 0,
  className,
}: ConversationCardProps) {
  const { t } = useTranslation();

  const {
    id,
    title,
    tags = [],
    pinned = false,
    status,
    updatedAt,
    createdAt,
  } = conversation;

  // Format timestamp
  const timestamp = useMemo(() => {
    return formatTimestamp(updatedAt || createdAt);
  }, [updatedAt, createdAt]);

  // Handle click
  const handleClick = useCallback(() => {
    onClick?.(id);
  }, [id, onClick]);

  // Handle delete
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  }, [id, onDelete]);

  // Handle archive/unarchive
  const handleArchiveToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === 'archived') {
      onUnarchive?.(id);
    } else {
      onArchive?.(id);
    }
  }, [id, status, onArchive, onUnarchive]);

  // Handle toggle favorite
  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(id);
  }, [id, onToggleFavorite]);

  // Handle rename
  const handleRename = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = prompt(t('chat.history.renamePrompt', 'Enter new title:'), title);
    if (newTitle && newTitle.trim() !== '' && newTitle !== title) {
      onRename?.(id, newTitle.trim());
    }
  }, [id, title, onRename, t]);

  // TODO: Implement tag addition UI
  /*
  const _handleAddTag = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newTag = prompt(t('chat.history.addTagPrompt', 'Enter tag:'));
    if (newTag && newTag.trim() !== '') {
      onAddTag?.(id, newTag.trim());
    }
  }, [id, onAddTag, t]);
  */

  // Truncate last message
  const preview = useMemo(() => {
    if (!lastMessage) return '';
    return truncateText(lastMessage, 100);
  }, [lastMessage]);

  // Display title (fallback if empty)
  const displayTitle = useMemo(() => {
    return title && title.trim() !== '' ? title : t('chat.history.untitled', 'New Conversation');
  }, [title, t]);

  return (
    <div
      className={cn(
        'group relative p-3 rounded-sm border-2 cursor-pointer transition-colors',
        // 8-bit style: sharp corners, solid colors, no blur
        isActive
          ? 'bg-blue-900/40 border-blue-500'
          : 'bg-slate-800/40 border-slate-700 hover:bg-slate-700/40 hover:border-slate-600',
        // 8-bit shadow
        'shadow-md',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Header: Title + Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-mono font-bold text-sm truncate',
              isActive ? 'text-blue-300' : 'text-slate-200'
            )}
            title={displayTitle}
          >
            {displayTitle}
          </h3>
        </div>

        {/* Actions: Favorite + Menu */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Favorite toggle */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={cn(
              'p-1 rounded-sm border-2 transition-colors',
              'hover:bg-slate-700',
              pinned
                ? 'text-yellow-400 border-yellow-500'
                : 'text-slate-500 border-slate-600'
            )}
            title={pinned ? t('chat.history.unfavorite') : t('chat.history.favorite')}
          >
            {pinned ? <Star className="h-3 w-3" /> : <StarOff className="h-3 w-3" />}
          </button>

          {/* Archive toggle */}
          <button
            type="button"
            onClick={handleArchiveToggle}
            className={cn(
              'p-1 rounded-sm border-2 text-slate-500 border-slate-600',
              'hover:bg-slate-700 transition-colors'
            )}
            title={status === 'archived' ? t('chat.history.unarchive') : t('chat.history.archive')}
          >
            {status === 'archived' ? (
              <ArchiveRestore className="h-3 w-3" />
            ) : (
              <Archive className="h-3 w-3" />
            )}
          </button>

          {/* Rename */}
          <button
            type="button"
            onClick={handleRename}
            className={cn(
              'p-1 rounded-sm border-2 text-slate-500 border-slate-600',
              'hover:bg-slate-700 transition-colors'
            )}
            title={t('chat.history.rename')}
          >
            <MoreVertical className="h-3 w-3" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            className={cn(
              'p-1 rounded-sm border-2 text-red-400 border-red-600',
              'hover:bg-red-900/30 transition-colors'
            )}
            title={t('chat.history.delete')}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Last message preview */}
      {preview && (
        <p className="text-xs text-slate-400 font-mono mb-2 line-clamp-2">
          {preview}
        </p>
      )}

      {/* Footer: Metadata */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Timestamp + Message count */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">
            {timestamp}
          </span>
          {messageCount > 0 && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold',
              'border border-slate-600',
              isActive ? 'bg-blue-800/40 text-blue-300 border-blue-500' : 'bg-slate-700/40 text-slate-400'
            )}>
              {messageCount}
            </span>
          )}
        </div>

        {/* Right: Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'px-1.5 py-0.5 rounded-sm text-[10px] font-mono',
                  'bg-purple-900/40 text-purple-300 border border-purple-600'
                )}
                title={tag}
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-slate-500 font-mono">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Archived indicator */}
      {status === 'archived' && (
        <div className={cn(
          'absolute top-1 right-1 px-1 py-0.5 rounded-sm',
          'bg-slate-700/80 text-slate-400 text-[10px] font-mono border border-slate-600'
        )}>
          {t('chat.history.archived')}
        </div>
      )}
    </div>
  );
}
