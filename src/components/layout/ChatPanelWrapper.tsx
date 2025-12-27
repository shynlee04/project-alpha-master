/**
 * @fileoverview Chat Panel Wrapper Component
 * @module components/layout/ChatPanelWrapper
 * 
 * Right sidebar containing AI chat platform with conversation threads.
 * Shows ThreadCard list when no thread is active.
 * Shows AgentChatPanel when a thread is selected.
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { useCallback, useMemo, useState } from 'react';
import { X, MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AgentChatPanel } from '../ide/AgentChatPanel';
import { ThreadCard } from '../chat/ThreadCard';
import { useThreadsStore, useActiveThread } from '@/stores/conversation-threads-store';

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
                {/* Header - matches AgentChatPanel styling */}
                <div className="h-9 px-3 flex items-center justify-between border-b border-border-dark bg-surface-darker">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBackToList}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title={t('chat.backToList', 'Back to threads')}
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel truncate max-w-[120px]">
                            {activeThread.title || t('chat.newConversation', 'New Chat')}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={t('chat.close', 'Close chat panel')}
                    >
                        <X className="w-4 h-4" />
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
            {/* Header - matches AgentChatPanel styling */}
            <div className="h-9 px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker">
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel">
                    {t('chat.conversations', 'Conversations')}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleNewThread}
                        disabled={!projectId}
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 text-[10px] font-pixel',
                            'text-green-400 hover:text-green-300 transition-colors',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    >
                        <MessageSquarePlus className="w-3 h-3" />
                        {t('chat.newConversation', 'NEW')}
                    </button>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title={t('chat.close', 'Close chat panel')}
                    >
                        <X className="w-4 h-4" />
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

            {/* Pagination - matches pixel aesthetic */}
            {totalPages > 1 && (
                <div className="h-8 px-4 flex items-center justify-center gap-3 border-t border-border-dark bg-surface-darker">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                        disabled={currentPage === 0}
                        className="text-[10px] font-pixel text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                        ◀
                    </button>
                    <span className="text-[10px] font-pixel text-muted-foreground">
                        {currentPage + 1}/{totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="text-[10px] font-pixel text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                        ▶
                    </button>
                </div>
            )}
        </div>
    );
}
