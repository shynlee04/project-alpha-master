/**
 * @fileoverview Chat Panel Wrapper Component
 * @module components/layout/ChatPanelWrapper
 * 
 * Right sidebar containing AI chat platform with conversation threads.
 * Shows ThreadCard list when no thread is active.
 * Shows AgentChatPanel when a thread is selected.
 * 
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-7 Chat Panel Mobile
 */

import { useCallback, useMemo, useState } from 'react';
import { X, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AgentChatPanel } from '../ide/AgentChatPanel';
import { ThreadCard } from '../chat/ThreadCard';
import { useThreadsStore, useActiveThread } from '@/stores/conversation-threads-store';
import { useDeviceType } from '@/hooks/useMediaQuery';

/**
 * Props for ChatPanelWrapper component.
 */
export interface ChatPanelWrapperProps {
    /** Current project ID */
    projectId: string | null;
    /** Display name for project */
    projectName: string;
    /** Callback to close chat panel */
    onClose: () => void;
    /** File tools facade for agent */
    fileTools?: any;
    /** Terminal tools facade for agent */
    terminalTools?: any;
    /** Event bus for tool operations */
    eventBus?: any;
}

/**
 * ChatPanelWrapper - Right sidebar with AI chat platform.
 * 
 * View States:
 * 1. ThreadsList: When no thread is active (shows paginated cards)
 * 2. AgentChatPanel: When a thread is selected (existing working chat)
 * 
 * Styling matches AgentChatPanel using semantic classes:
 * - bg-surface-dark, bg-surface-darker
 * - border-border-dark
 * - font-pixel, text-xs, tracking-wider uppercase
 */
export function ChatPanelWrapper({
    projectId,
    projectName,
    onClose,
    fileTools,
    terminalTools,
    eventBus,
}: ChatPanelWrapperProps): React.JSX.Element {
    const { t } = useTranslation();
    // MRT-7: Mobile responsive detection for touch targets
    const { isMobile } = useDeviceType();

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 6;

    // Thread store
    const {
        activeThreadId,
        setActiveThread,
        createThread,
        deleteThread,
        getThreadsForProject,
    } = useThreadsStore();

    const activeThread = useActiveThread();

    // Get threads for current project
    const projectThreads = useMemo(() => {
        if (!projectId) return [];
        return getThreadsForProject(projectId);
    }, [getThreadsForProject, projectId]);

    // Pagination
    const totalPages = Math.ceil(projectThreads.length / pageSize);
    const paginatedThreads = useMemo(() => {
        const start = currentPage * pageSize;
        return projectThreads.slice(start, start + pageSize);
    }, [projectThreads, currentPage, pageSize]);

    // Handlers
    const handleNewThread = useCallback(() => {
        if (!projectId) return;
        const thread = createThread(projectId);
        setActiveThread(thread.id);
    }, [createThread, projectId, setActiveThread]);

    const handleSelectThread = useCallback((threadId: string) => {
        setActiveThread(threadId);
    }, [setActiveThread]);

    const handleDeleteThread = useCallback((threadId: string) => {
        deleteThread(threadId);
    }, [deleteThread]);

    const handleBackToList = useCallback(() => {
        setActiveThread(null);
    }, [setActiveThread]);

    // If a thread is active, show existing AgentChatPanel
    if (activeThread) {
        return (
            <div className="h-full flex flex-col bg-surface-dark border-l border-border-dark">
                {/* Header - MRT-7: 44px height on mobile for touch targets */}
                <div className={cn(
                    "px-3 flex items-center justify-between border-b border-border-dark bg-surface-darker",
                    isMobile ? 'h-11' : 'h-9'
                )}>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBackToList}
                            className={cn(
                                'text-muted-foreground hover:text-foreground transition-colors',
                                // MRT-7: Larger touch target on mobile
                                isMobile ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation' : 'p-1'
                            )}
                            title={t('chat.backToList', 'Back to threads')}
                        >
                            <ArrowLeft className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
                        </button>
                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel truncate max-w-[120px]">
                            {activeThread.title || t('chat.newConversation', 'New Chat')}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            'text-muted-foreground hover:text-foreground transition-colors',
                            // MRT-7: Larger touch target on mobile
                            isMobile ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation' : ''
                        )}
                        title={t('chat.close', 'Close chat panel')}
                    >
                        <X className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
                    </button>
                </div>

                {/* Existing working AgentChatPanel */}
                <div className="flex-1 min-h-0">
                    <AgentChatPanel
                        projectId={projectId}
                        projectName={projectName}
                        fileTools={fileTools}
                        terminalTools={terminalTools}
                        eventBus={eventBus}
                    />
                </div>
            </div>
        );
    }

    // No active thread - show ThreadCard list (box-like cards)
    return (
        <div className="h-full flex flex-col bg-surface-dark border-l border-border-dark">
            {/* Header - MRT-7: 44px height on mobile for touch targets */}
            <div className={cn(
                "px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker",
                isMobile ? 'h-11' : 'h-9'
            )}>
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel">
                    {t('chat.conversations', 'Conversations')}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleNewThread}
                        disabled={!projectId}
                        className={cn(
                            'flex items-center gap-1 font-pixel',
                            'text-green-400 hover:text-green-300 transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            // MRT-7: Larger touch target on mobile
                            isMobile ? 'px-3 py-2 text-xs min-h-[44px] touch-manipulation' : 'px-2 py-1 text-[10px]'
                        )}
                    >
                        <MessageSquarePlus className={cn(isMobile ? 'w-4 h-4' : 'w-3 h-3')} />
                        {t('chat.newConversation', 'NEW')}
                    </button>
                    <button
                        onClick={onClose}
                        className={cn(
                            'text-muted-foreground hover:text-foreground transition-colors',
                            // MRT-7: Larger touch target on mobile
                            isMobile ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation' : ''
                        )}
                        title={t('chat.close', 'Close chat panel')}
                    >
                        <X className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
                    </button>
                </div>
            </div>

            {/* Threads Grid */}
            <div className="flex-1 overflow-auto p-3 bg-background">
                {!projectId ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <p className="text-xs font-pixel">{t('chat.noProject', 'Open a project to start chatting')}</p>
                    </div>
                ) : projectThreads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <MessageSquarePlus className="w-8 h-8 mb-3 opacity-40" />
                        <p className="text-xs font-pixel mb-3">{t('chat.noConversations', 'No conversations yet')}</p>
                        <button
                            onClick={handleNewThread}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2',
                                'border border-border-dark bg-surface-dark',
                                'text-xs font-pixel text-green-400 hover:text-green-300',
                                'hover:bg-surface-darker transition-colors',
                                'shadow-md'
                            )}
                        >
                            <MessageSquarePlus className="w-4 h-4" />
                            {t('chat.startConversation', 'START CHAT')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2">
                        {paginatedThreads.map((thread) => (
                            <ThreadCard
                                key={thread.id}
                                thread={thread}
                                isActive={thread.id === activeThreadId}
                                onSelect={handleSelectThread}
                                onDelete={handleDeleteThread}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination - MRT-7: Larger touch targets on mobile */}
            {totalPages > 1 && (
                <div className={cn(
                    "px-4 flex items-center justify-center gap-3 border-t border-border-dark bg-surface-darker",
                    isMobile ? 'h-11' : 'h-8'
                )}>
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className={cn(
                            'font-pixel text-muted-foreground hover:text-foreground disabled:opacity-30',
                            isMobile ? 'text-sm min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation' : 'text-[10px]'
                        )}
                    >
                        ◀
                    </button>
                    <span className={cn('font-pixel text-muted-foreground', isMobile ? 'text-sm' : 'text-[10px]')}>
                        {currentPage + 1}/{totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className={cn(
                            'font-pixel text-muted-foreground hover:text-foreground disabled:opacity-30',
                            isMobile ? 'text-sm min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation' : 'text-[10px]'
                        )}
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
}
