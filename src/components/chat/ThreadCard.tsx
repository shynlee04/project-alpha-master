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
                // Base: Match AgentChatPanel styling
                'group relative cursor-pointer',
                'border border-border-dark',
                'bg-surface-dark',
                'hover:bg-surface-darker',
                'transition-all duration-150',
                // Pixel-art shadow effect matching existing components
                'shadow-md',
                'hover:shadow-sm',
                'hover:translate-x-[1px] hover:translate-y-[1px]',
                // Active state
                isActive && [
                    'border-primary',
                    'bg-primary/10',
                    'ring-1 ring-primary/30',
                ],
                // Size
                'p-3 rounded-none min-h-[90px]'
            )}
            onClick={() => onSelect(thread.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(thread.id)}
        >
            {/* Header: Title + Delete */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className={cn(
                    'font-pixel text-xs font-bold truncate flex-1 tracking-wider uppercase',
                    'text-foreground',
                    isActive && 'text-primary'
                )}>
                    {thread.title || t('chat.newConversation', 'New Conversation')}
                </h3>

                {/* Delete button - visible on hover */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity',
                        'text-destructive hover:text-destructive hover:bg-destructive/10'
                    )}
                    onClick={handleDelete}
                >
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>

            {/* Preview text */}
            <p className={cn(
                'text-[10px] text-muted-foreground',
                'line-clamp-2 mb-2'
            )}>
                {thread.preview || t('chat.noMessages', 'No messages yet')}
            </p>

            {/* Footer: Stats */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                {/* Message count */}
                <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="font-mono">{thread.messageCount}</span>
                </div>

                {/* Agents used */}
                {thread.agentsUsed.length > 0 && (
                    <div className="flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        <span className="font-mono">{thread.agentsUsed.length}</span>
                    </div>
                )}

                {/* Time */}
                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">
                        {formatRelativeTime(thread.updatedAt)}
                    </span>
                </div>
            </div>

            {/* Active indicator - pixel corner */}
            {isActive && (
                <div className={cn(
                    'absolute -top-[2px] -right-[2px] w-2 h-2',
                    'bg-primary border border-primary-foreground'
                )} />
            )}
        </div>
    );
}

export const ThreadCard = memo(ThreadCardComponent);
ThreadCard.displayName = 'ThreadCard';

export default ThreadCard;
