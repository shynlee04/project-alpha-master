// @ts-nocheck
/**
 * @fileoverview Note Sidebar Chat Panel
 * @module components/notes/NoteSidebarChat
 * @governance E1-9
 *
 * Compact chat panel for Notes sidebar.
 * Provides quick AI chat access without leaving the sidebar context.
 *
 * CHAT-021: Refactored to use EnhancedChatInterface for consistency
 *
 * E1-9: Add chat to Notes sidebar
 */

import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot } from 'lucide-react';
import { EnhancedChatInterface } from '@/presentation/components/ide/EnhancedChatInterface';
import { useAgentChatWithTools } from '@/lib/agent/hooks/use-agent-chat-with-tools';
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { useAgents } from '@/hooks/useAgents';
import { getNotesAgentSystemPrompt } from '@/lib/agent/system-prompt';
import { useAgentChatToolFacades } from '../ide/AgentChatPanel/index';
import { useAgentChatAPIKeyManager } from '../ide/AgentChatPanel/AgentChatAPIKeyManager';
import { useWorkspaceSync } from '@/infrastructure/persistence/stores/workspace';
import { toast } from 'sonner';
import type { ChatMessage } from '@/presentation/components/ide/EnhancedChatInterface';

interface NoteSidebarChatProps {
    projectId: string;
    projectName?: string;
    className?: string;
}

/**
 * NoteSidebarChat - Refactored to use EnhancedChatInterface
 *
 * CHAT-021: This component now wraps EnhancedChatInterface with a sidebar header,
 * providing a consistent chat UI while maintaining the sidebar-specific layout.
 */
export function NoteSidebarChat({
    projectId: _projectId, // Reserved for future context-based features
    projectName = 'Notes',
    className = '',
}: NoteSidebarChatProps) {
    const { t } = useTranslation();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get selected agent from Zustand store
    const { activeAgentId } = useAgentSelection();
    const { agents } = useAgents();
    const activeAgent = agents.find(a => a.id === activeAgentId);

    // API key management - retrieve from credential vault
    const { apiKey, apiKeyError, providerId } = useAgentChatAPIKeyManager({
        agentProviderId: activeAgent?.providerId
    });

    // Get workspace context for tool facades (Notes workspace only gets file read tools)
    const { localAdapterRef, syncManagerRef, eventBus, initialSyncCompleted } = useWorkspaceSync();

    // Create tool facades - Notes workspace gets file read and note CRUD tools
    const { fileTools, noteTools } = useAgentChatToolFacades({
        localAdapterRef,
        syncManagerRef,
        eventBus,
        initialSyncCompleted,
        workspaceType: 'notes'
    });

    // Notes-specific system prompt
    const systemPrompt = `Notebook: ${projectName}\n\n${getNotesAgentSystemPrompt(projectName)}`;

    // Use the real TanStack AI hook with tools (file read + note CRUD for Notes workspace)
    const {
        messages: hookMessages,
        sendMessage,
        isLoading,
    } = useAgentChatWithTools({
        fileTools,
        terminalTools: undefined, // Notes workspace doesn't get terminal tools
        noteTools, // EPIC-40: Note CRUD tools for Notes workspace
        eventBus: eventBus || null,
        systemMessage: systemPrompt,
        providerId,
        modelId: activeAgent?.modelId ?? undefined,
        apiKey: apiKey ?? undefined,
        enableTools: true,
        workspaceType: 'notes',
    });

    // Show error toast when API key is missing
    useEffect(() => {
        if (apiKeyError) {
            toast.error('Agent API Key Missing', {
                description: apiKeyError,
            });
        }
    }, [apiKeyError]);

    // Convert hook messages to EnhancedChatInterface format
    const enhancedMessages: ChatMessage[] = hookMessages.map((msg, index) => ({
        id: `msg_${index}_${Date.now()}`,
        role: msg.role === 'tool' ? 'assistant' : (msg.role as 'user' | 'assistant'),
        content: msg.content,
        timestamp: new Date(),
    }));

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [enhancedMessages, isLoading]);

    const handleSendMessage = (content: string) => {
        try {
            sendMessage(content);
        } catch (err) {
            console.error('[NoteSidebarChat] Failed to send message:', err);
            toast.error('Failed to send message', {
                description: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Chat Header */}
            <div className="p-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <h3 className="font-mono text-sm font-bold">
                        {t('chat.title', 'Chat')}
                    </h3>
                </div>
            </div>

            {/* CHAT-021: Use shared EnhancedChatInterface component */}
            <EnhancedChatInterface
                messages={enhancedMessages}
                onSendMessage={handleSendMessage}
                isTyping={isLoading}
                className="flex-1"
                setScrollRef={messagesEndRef}
            />

            {/* Invisible anchor for auto-scroll */}
            <div ref={messagesEndRef} className="hidden" />
        </div>
    );
}
