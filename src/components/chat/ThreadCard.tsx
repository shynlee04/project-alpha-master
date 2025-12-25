/**
 * ThreadCard - 8-bit styled conversation thread card
 * 
 * Displays a conversation thread as a box-like card with:
 * - Thread title and preview
 * - Message count and agents used
 * - Delete button
 * - Click to enter conversation
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { memo } from 'react';
import { MessageSquare, Trash2, Bot, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ConversationThread } from '@/stores/conversation-threads-store';
import { useTranslation } from 'react-i18next';

interface ThreadCardProps {
    thread: ConversationThread;
    isActive?: boolean;
    onSelect: (threadId: string) => void;
    onDelete: (threadId: string) => void;
}

/**
 * Format relative time (e.g., "2 hours ago", "Yesterday")
 */
function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

/**
 * ThreadCard Component
 * 
 * 8-bit/16-bit styled card for displaying conversation threads.
 * Features pixel borders, retro hover effects, and bitmap-style icons.
 */
function ThreadCardComponent({
    thread,
    isActive = false,
    onSelect,
    onDelete,
}: ThreadCardProps) {
    const { t } = useTranslation();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t('chat.deleteThreadConfirm', 'Delete this conversation?'))) {
            onDelete(thread.id);
        }
    };

    return (
        <div
            className={cn(
                // Base: 8-bit box styling
                'group relative cursor-pointer',
                'border-2 border-slate-600 dark:border-slate-500',
                'bg-slate-800/50 dark:bg-slate-900/80',
                'hover:bg-slate-700/60 dark:hover:bg-slate-800/90',
                'transition-all duration-150',
                // Pixel-art shadow effect
                'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]',
                'hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
                'hover:translate-x-[2px] hover:translate-y-[2px]',
                // Active state
                isActive && [
                    'border-blue-500 dark:border-blue-400',
                    'bg-blue-900/30 dark:bg-blue-950/50',
                    'ring-2 ring-blue-500/30',
                ],
                // Size
                'p-3 rounded-sm min-h-[100px]'
            )}
            onClick={() => onSelect(thread.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(thread.id)}
        >
            {/* Header: Title + Delete */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={cn(
                    'font-mono text-sm font-bold truncate flex-1',
                    'text-slate-100 dark:text-slate-50',
                    isActive && 'text-blue-300'
                )}>
                    {thread.title || t('chat.newConversation', 'New Conversation')}
                </h3>

                {/* Delete button - visible on hover */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
                        'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                    )}
                    onClick={handleDelete}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Preview text */}
            <p className={cn(
                'text-xs font-mono text-slate-400 dark:text-slate-500',
                'line-clamp-2 mb-3'
            )}>
                {thread.preview || t('chat.noMessages', 'No messages yet')}
            </p>

            {/* Footer: Stats */}
            <div className="flex items-center justify-between text-xs">
                {/* Message count */}
                <div className="flex items-center gap-1 text-slate-500">
                    <MessageSquare className="h-3 w-3" />
                    <span className="font-mono">{thread.messageCount}</span>
                </div>

                {/* Agents used */}
                {thread.agentsUsed.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-500">
                        <Bot className="h-3 w-3" />
                        <span className="font-mono">{thread.agentsUsed.length}</span>
                    </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono text-[10px]">
                        {formatRelativeTime(thread.updatedAt)}
                    </span>
                </div>
            </div>

            {/* Active indicator - pixel corner */}
            {isActive && (
                <div className={cn(
                    'absolute -top-1 -right-1 w-3 h-3',
                    'bg-blue-500 border border-blue-400',
                    'shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)]'
                )} />
            )}
        </div>
    );
}

export const ThreadCard = memo(ThreadCardComponent);
ThreadCard.displayName = 'ThreadCard';

export default ThreadCard;
