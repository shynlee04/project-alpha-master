/**
 * ChatPanel - Main orchestrator for AI chat platform
 * 
 * Manages the view state between:
 * - ThreadsList: When no thread is active (paginated cards)
 * - ChatConversation: When a thread is selected
 * 
 * @epic MVP - AI Coding Agent Vertical Slice
 * @story MVP-2 - Chat Interface with Rich Streaming
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { ThreadsList } from './ThreadsList';
import { ChatConversation } from './ChatConversation';
import {
    useThreadsStore,
    useActiveThread,
} from '@/stores/conversation-threads-store';
import { useAgentsStore } from '@/stores/agents-store';
import { useAgentSelection } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import type { Agent } from '@/mocks/agents';
import { useResponsive } from '@/hooks/useResponsive';
import { useTranslation } from 'react-i18next';

interface ChatPanelProps {
    projectId: string;
    className?: string;
}

/**
 * ChatPanel Component
 * 
 * Main entry point for the AI chat platform.
 * Orchestrates between threads list view and active conversation view.
 */
export function ChatPanel({ projectId, className }: ChatPanelProps) {
    // Store hooks
    const {
        activeThreadId,
        setActiveThread,
        createThread,
        deleteThread,
        addMessage,
        getThreadsForProject,
    } = useThreadsStore();

    const activeThread = useActiveThread();
    const { agents } = useAgentsStore();
    const { activeAgentId, setActiveAgent } = useAgentSelection();

    // Hooks for mobile/demo mode
    const { isMobile } = useResponsive();
    const { updateThreadTitle } = useThreadsStore();
    const { t } = useTranslation();

    // Local state
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    // Get threads for this project
    const projectThreads = useMemo(
        () => getThreadsForProject(projectId),
        [getThreadsForProject, projectId]
    );

    // Get selected agent
    const selectedAgent = useMemo(
        () => agents.find((a) => a.id === activeAgentId) || agents[0] || null,
        [agents, activeAgentId]
    );

    // Ensure an agent is selected if we have agents
    useEffect(() => {
        if (!activeAgentId && agents.length > 0) {
            setActiveAgent(agents[0].id);
        }
    }, [activeAgentId, agents, setActiveAgent]);

    // Demo Mode Seeding (Story 1.3)
    useEffect(() => {
        const seedDemoData = async () => {
            // Only seed if mobile, no threads exist, and no agent is active (implies no key/setup)
            if (isMobile && projectThreads.length === 0 && !activeAgentId && agents.length === 0) {
                try {
                    console.log('[ChatPanel] Seeding demo conversations for mobile...');
                    const demoData = await import('@/lib/demo/sample-conversations.json');

                    for (const conv of demoData.conversations) {
                        const thread = createThread(projectId);
                        updateThreadTitle(thread.id, conv.title);

                        // Add messages in sequence
                        for (const msg of conv.messages) {
                            addMessage(thread.id, {
                                role: msg.role as 'user' | 'assistant',
                                content: msg.content
                            });
                        }
                    }
                } catch (err) {
                    console.error('[ChatPanel] Failed to seed demo data:', err);
                }
            }
        };

        seedDemoData();
    }, [isMobile, projectThreads.length, activeAgentId, agents.length, projectId, createThread, updateThreadTitle, addMessage]);

    /**
     * Create new thread and enter it
     */
    const handleNewThread = useCallback(() => {
        const thread = createThread(projectId);
        setActiveThread(thread.id);
        setError(null);
    }, [createThread, projectId, setActiveThread]);

    /**
     * Select and enter a thread
     */
    const handleSelectThread = useCallback((threadId: string) => {
        setActiveThread(threadId);
        setError(null);
    }, [setActiveThread]);

    /**
     * Delete a thread
     */
    const handleDeleteThread = useCallback((threadId: string) => {
        deleteThread(threadId);
    }, [deleteThread]);

    /**
     * Go back to threads list
     */
    const handleBack = useCallback(() => {
        setActiveThread(null);
        setIsStreaming(false);
        setStreamingContent('');
        setError(null);
    }, [setActiveThread]);

    /**
     * Select an agent
     */
    const handleSelectAgent = useCallback((agent: Agent) => {
        setActiveAgent(agent.id);
    }, [setActiveAgent]);

    /**
     * Send a message
     */
    const handleSendMessage = useCallback(async (content: string) => {
        // Block sending in mobile demo mode if no agent/key
        if (isMobile && agents.length === 0) {
            setError(t('chat.demoModeReadOnly'));
            return;
        }

        if (!activeThreadId || !selectedAgent) return;

        setError(null);
        setIsStreaming(true);
        setStreamingContent('');

        // Add user message
        addMessage(activeThreadId, {
            role: 'user',
            content,
        });

        try {
            // Call the chat API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        ...useThreadsStore.getState().threads[activeThreadId]?.messages
                            .filter(m => m.role !== 'system')
                            .map(m => ({ role: m.role, content: m.content })) || []
                    ],
                    provider: selectedAgent.providerId.toLowerCase(),
                    model: selectedAgent.modelId,
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Handle SSE streaming
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta?.content || '';
                            fullContent += delta;
                            setStreamingContent(fullContent);
                        } catch {
                            // Skip non-JSON lines
                        }
                    }
                }
            }

            // Add assistant message with agent attribution
            addMessage(activeThreadId, {
                role: 'assistant',
                content: fullContent,
                agentId: selectedAgent.id,
                agentName: selectedAgent.name,
                agentModel: selectedAgent.modelId,
            });

        } catch (err) {
            console.error('[ChatPanel] Send error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
        } finally {
            setIsStreaming(false);
            setStreamingContent('');
        }
    }, [activeThreadId, selectedAgent, addMessage]);

    // Render threads list or active conversation
    return (
        <div className={cn('h-full', className)}>
            {activeThread ? (
                <ChatConversation
                    thread={activeThread}
                    agents={agents}
                    selectedAgent={selectedAgent}
                    onSelectAgent={handleSelectAgent}
                    onSendMessage={handleSendMessage}
                    onBack={handleBack}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                    error={error}
                />
            ) : (
                <ThreadsList
                    threads={projectThreads}
                    activeThreadId={activeThreadId}
                    onSelectThread={handleSelectThread}
                    onDeleteThread={handleDeleteThread}
                    onNewThread={handleNewThread}
                />
            )}
        </div>
    );
}

export default ChatPanel;
