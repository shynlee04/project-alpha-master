/**
 * ThreadsList - Paginated conversation threads display
 * 
 * Displays conversation threads as box-like cards in a grid.
 * Features:
 * - Paginated view (no sidebar)
 * - "New Conversation" button
 * - Click card to enter conversation
 * - Delete button on each card
 * - 8-bit/16-bit pixel aesthetic
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { useState, useMemo } from 'react';
import { Plus, MessageSquarePlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThreadCard } from './ThreadCard';
import type { ConversationThread } from '@/stores/conversation-threads-store';
import { useTranslation } from 'react-i18next';

interface ThreadsListProps {
    threads: ConversationThread[];
    activeThreadId: string | null;
    onSelectThread: (threadId: string) => void;
    onDeleteThread: (threadId: string) => void;
    onNewThread: () => void;
    className?: string;
    /** Items per page (default: 6) */
    pageSize?: number;
}

/**
 * ThreadsList Component
 * 
 * Replaces the chat view when no thread is active.
 * Shows paginated grid of conversation threads.
 */
export function ThreadsList({
    threads,
    activeThreadId,
    onSelectThread,
    onDeleteThread,
    onNewThread,
    className,
    pageSize = 6,
}: ThreadsListProps) {
    const { t } = useTranslation();
    const [currentPage, setCurrentPage] = useState(0);

    // Calculate pagination
    const totalPages = Math.ceil(threads.length / pageSize);
    const paginatedThreads = useMemo(() => {
        const start = currentPage * pageSize;
        return threads.slice(start, start + pageSize);
    }, [threads, currentPage, pageSize]);

    // Reset to first page if current page is out of bounds
    if (currentPage >= totalPages && totalPages > 0) {
        setCurrentPage(0);
    }

    return (
        <div className={cn(
            'flex flex-col h-full',
            'bg-slate-900/50 dark:bg-slate-950/60',
            className
        )}>
            {/* Header */}
            <div className={cn(
                'flex items-center justify-between p-4',
                'border-b-2 border-slate-700 dark:border-slate-600'
            )}>
                <h2 className={cn(
                    'font-mono font-bold text-lg',
                    'text-blue-400 dark:text-blue-300',
                    // 8-bit text shadow
                    'drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]'
                )}>
                    {t('chat.conversations', 'CONVERSATIONS')}
                </h2>

                {/* New Conversation Button */}
                <Button
                    onClick={onNewThread}
                    className={cn(
                        'font-mono text-sm',
                        // 8-bit button styling
                        'bg-green-600 hover:bg-green-500',
                        'border-2 border-green-400',
                        'shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]',
                        'hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)]',
                        'hover:translate-x-[2px] hover:translate-y-[2px]',
                        'transition-all duration-100'
                    )}
                >
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    {t('chat.newConversation', 'NEW CHAT')}
                </Button>
            </div>

            {/* Threads Grid */}
            <div className="flex-1 overflow-auto p-4">
                {threads.length === 0 ? (
                    // Empty state
                    <div className={cn(
                        'flex flex-col items-center justify-center h-full',
                        'text-slate-500 dark:text-slate-400'
                    )}>
                        <div className={cn(
                            'w-20 h-20 mb-4 rounded-sm',
                            'border-2 border-dashed border-slate-600',
                            'flex items-center justify-center'
                        )}>
                            <Plus className="h-8 w-8" />
                        </div>
                        <p className="font-mono text-sm mb-2">
                            {t('chat.noConversations', 'No conversations yet')}
                        </p>
                        <p className="font-mono text-xs text-slate-600">
                            {t('chat.startConversation', 'Click "NEW CHAT" to start')}
                        </p>
                    </div>
                ) : (
                    // Thread cards grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedThreads.map((thread) => (
                            <ThreadCard
                                key={thread.id}
                                thread={thread}
                                isActive={thread.id === activeThreadId}
                                onSelect={onSelectThread}
                                onDelete={onDeleteThread}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={cn(
                    'flex items-center justify-center gap-4 p-4',
                    'border-t-2 border-slate-700 dark:border-slate-600'
                )}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className={cn(
                            'font-mono',
                            'border border-slate-600 hover:border-slate-500'
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="font-mono text-sm text-slate-400">
                        {currentPage + 1} / {totalPages}
                    </span>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className={cn(
                            'font-mono',
                            'border border-slate-600 hover:border-slate-500'
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ThreadsList;
