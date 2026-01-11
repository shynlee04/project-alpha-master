/**
 * @fileoverview Chat Panel Wrapper Component - INTEGRATED WITH UNIFIED CHAT STORE
 * @module components/layout/ChatPanelWrapper
 * 
 * Right sidebar containing AI chat platform with conversation threads.
 * Shows ThreadManager when no thread is active (uses UnifiedChatStore - Dexie).
 * Shows AgentChatPanel when a thread is selected.
 * 
 * @epic EPIC-CHAT - Thread Management Integration
 * @story CHAT-006-INTEGRATED - ThreadManager now properly integrated
 * 
 * ARCHITECTURE:
 * - Uses UnifiedChatStore with Dexie persistence (correct for RAG, indexing)
 * - Replaces legacy ThreadCard + ConversationStore pattern
 * - ThreadManager provides full CRUD: create, rename, archive, delete
 * 
 * @created 2026-01-11 - Integrated ThreadManager with UnifiedChatStore
 */

import { X, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AgentChatPanel } from '../ide/AgentChatPanel';
import { ThreadManager } from '../chat/ThreadManager';
import { useActiveThread } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';
import { useDeviceType } from '@/hooks/useMediaQuery';
import type { WorkspaceType } from '@/domain/entities/chat';

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
}

/**
 * ChatPanelWrapper - Right sidebar with AI chat platform
 * 
 * INTEGRATED WITH UNIFIED CHAT STORE (Dexie) via ThreadManager
 * 
 * View States:
 * 1. ThreadManager: When no thread is active (full CRUD thread management)
 * 2. AgentChatPanel: When a thread is selected (chat interface)
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
}: ChatPanelWrapperProps): React.JSX.Element {
    const { t } = useTranslation();
    const { isMobile } = useDeviceType();

    // Determine workspace type - ThreadManager needs this for filtering
    const workspaceType: WorkspaceType = projectId ? 'ide' : 'notes';

    // Get active thread from facade (maps to UnifiedChatStore)
    const activeThread = useActiveThread();

    // Get setActiveThread from facade for back navigation
    const { setActiveThread } = useConversationStore();

    // If a thread is active, show AgentChatPanel
    if (activeThread) {
        return (
            <div className="h-full flex flex-col bg-surface-dark border-l border-border-dark">
                {/* Header */}
                <div className={cn(
                    "px-3 flex items-center justify-between border-b border-border-dark bg-surface-darker",
                    isMobile ? 'h-11' : 'h-9'
                )}>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveThread(null)}
                            className={cn(
                                'text-muted-foreground hover:text-foreground transition-colors',
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
                            isMobile ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation' : ''
                        )}
                        title={t('chat.close', 'Close chat panel')}
                    >
                        <X className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
                    </button>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 min-h-0">
                    <AgentChatPanel
                        projectId={projectId}
                        projectName={projectName}
                    />
                </div>
            </div>
        );
    }

    // No active thread - show ThreadManager (INTEGRATED with UnifiedChatStore - Dexie)
    return (
        <div className="h-full flex flex-col bg-surface-dark border-l border-border-dark">
            {/* Header */}
            <div className={cn(
                "px-4 flex items-center justify-between border-b border-border-dark bg-surface-darker",
                isMobile ? 'h-11' : 'h-9'
            )}>
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase font-pixel">
                    {t('chat.conversations', 'Conversations')}
                </span>
                <button
                    onClick={onClose}
                    className={cn(
                        'text-muted-foreground hover:text-foreground transition-colors',
                        isMobile ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation' : ''
                    )}
                    title={t('chat.close', 'Close chat panel')}
                >
                    <X className={cn(isMobile ? 'w-5 h-5' : 'w-4 h-4')} />
                </button>
            </div>

            {/* ThreadManager - Uses UnifiedChatStore with Dexie (CORRECT ARCHITECTURE) */}
            <div className="flex-1 overflow-auto">
                <ThreadManager
                    workspaceType={workspaceType}
                    onThreadSelect={(threadId) => {
                        // Sync with facade for back navigation
                        setActiveThread(threadId);
                    }}
                />
            </div>
        </div>
    );
}

export default ChatPanelWrapper;
