/**
 * @fileoverview Multi-Agent Chat Hook
 * @module lib/agent/hooks/use-multi-agent-chat
 * @governance CHAT-013
 * @created 2026-01-13
 *
 * Orchestrates multi-agent chat modes including debate, content routing,
 * and sequential expansion. Integrates backend agents with UI components.
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Backend agents
import {
    DebatePersona,
    DebateResults,
    DebateConfig,
    debateTopicWithContext,
} from '@/lib/workflow/agents/debate-agent';

import {
    RoutingDecision,
    createRoutingAgent,
} from '@/lib/workflow/agents/content-routing-agent';

import {
    ExpansionResult,
    createExpansionAgent,
} from '@/lib/workflow/agents/sequential-expansion-agent';

// ============================================================================
// Types
// ============================================================================

/**
 * Multi-agent modes available
 */
export type MultiAgentMode = 'debate' | 'routing' | 'expansion' | null;

/**
 * Configuration for multi-agent operations
 */
export interface MultiAgentConfig {
    /** Provider ID for AI calls */
    providerId?: string;
    /** Model to use */
    modelId?: string;
}

/**
 * State of multi-agent operation
 */
export interface MultiAgentState {
    /** Current active mode */
    mode: MultiAgentMode;
    /** Whether operation is in progress */
    isLoading: boolean;
    /** Error if any */
    error: string | null;
    /** Current round (for debates) */
    currentRound: number;
    /** Total rounds */
    totalRounds: number;
    /** Current persona (for debates) */
    currentPersona?: DebatePersona;
}

/**
 * Multi-agent results
 */
export interface MultiAgentResults {
    /** Debate results (if mode was debate) */
    debate?: DebateResults;
    /** Routing decision (if mode was routing) */
    routing?: RoutingDecision;
    /** Expansion results (if mode was expansion) */
    expansion?: ExpansionResult;
}

/**
 * Hook options
 */
export interface UseMultiAgentChatOptions {
    /** Configuration */
    config?: MultiAgentConfig;
    /** Current conversation ID for context */
    conversationId?: string;
    /** Current thread ID */
    threadId?: string;
    /** Available messages for context */
    messages?: Array<{ role: string; content: string }>;
    /** Callback when results are ready */
    onResults?: (results: MultiAgentResults) => void;
}

/**
 * Hook return value
 */
export interface UseMultiAgentChatActions {
    /** Start a debate on the current topic */
    startDebate: (topic?: string) => Promise<void>;
    /** Start content routing analysis */
    startRouting: (query?: string) => Promise<void>;
    /** Start sequential expansion */
    startExpansion: (lastMessage?: string) => Promise<void>;
    /** Cancel current operation */
    cancel: () => void;
    /** Clear results */
    clearResults: () => void;
}

export interface UseMultiAgentChatReturn extends MultiAgentState {
    /** Actions */
    actions: UseMultiAgentChatActions;
    /** Results from last operation */
    results: MultiAgentResults | null;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Multi-Agent Chat Hook
 *
 * Orchestrates multi-agent chat modes:
 * - Debate: Multiple AI agents discuss and synthesize an answer
 * - Routing: Classify intent and route to specialized handler
 * - Expansion: Generate follow-up questions for deeper exploration
 */
export function useMultiAgentChat(options: UseMultiAgentChatOptions = {}): UseMultiAgentChatReturn {
    const { t } = useTranslation();
    const { config, onResults, messages } = options;

    // State
    const [mode, setMode] = useState<MultiAgentMode>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<MultiAgentResults | null>(null);

    // Debate progress state
    const [currentRound, setCurrentRound] = useState(0);
    const [totalRounds, setTotalRounds] = useState(0);
    const [currentPersona, setCurrentPersona] = useState<DebatePersona>();

    // Abort controller for cancelling operations
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Reset state between operations
     */
    const resetState = useCallback(() => {
        setMode(null);
        setIsLoading(false);
        setError(null);
        setCurrentRound(0);
        setTotalRounds(0);
        setCurrentPersona(undefined);
    }, []);

    /**
     * Convert messages to conversation history format
     */
    const getConversationHistory = useCallback(() => {
        return messages?.slice(-10).map(m => ({
            role: m.role,
            content: m.content || '',
        })) || [];
    }, [messages]);

    /**
     * Start a debate on the given topic
     */
    const startDebate = useCallback(async (topic?: string) => {
        // If no topic provided, use last user message
        const debateTopic = topic || messages?.filter(m => m.role === 'user').slice(-1)[0]?.content;
        if (!debateTopic?.trim()) {
            toast.error(t('multiAgent.debate.noTopic', 'No topic to debate'));
            return;
        }

        // Cancel any ongoing operation
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setMode('debate');
        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const debateConfig: DebateConfig = {
                providerId: config?.providerId || 'gemini',
                model: config?.modelId || 'gemini-2.0-flash',
                rounds: 3,
                personas: [
                    DebatePersona.OPTIMIST,
                    DebatePersona.SKEPTIC,
                    DebatePersona.EXPERT,
                ],
            };

            const conversationHistory = getConversationHistory();

            // Track progress for UI
            setTotalRounds(debateConfig.rounds || 3);
            setCurrentRound(1);

            const debateResults = await debateTopicWithContext(
                debateTopic,
                undefined, // domain
                conversationHistory,
                debateConfig
            );

            const newResults: MultiAgentResults = {
                debate: debateResults,
            };
            setResults(newResults);
            onResults?.(newResults);

            toast.success(
                t('multiAgent.debate.complete', 'Debate complete'),
                {
                    description: t('multiAgent.debate.roundsCompleted', `${debateResults.roundsCompleted} rounds`),
                }
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            toast.error(t('multiAgent.debate.failed', 'Debate failed'), {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
            setCurrentRound(0);
        }
    }, [messages, config, getConversationHistory, onResults, t]);

    /**
     * Start content routing analysis
     */
    const startRouting = useCallback(async (query?: string) => {
        const routingQuery = query || messages?.slice(-1)[0]?.content;
        if (!routingQuery?.trim()) {
            toast.error(t('multiAgent.routing.noQuery', 'No query to analyze'));
            return;
        }

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setMode('routing');
        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const routingAgent = createRoutingAgent({
                providerId: config?.providerId || 'gemini',
                model: config?.modelId || 'gemini-2.0-flash',
                minConfidence: 0.5,
                enableLearning: true,
            });

            const conversationHistory = getConversationHistory();

            const routingDecision = await routingAgent.classifyIntent({
                query: routingQuery,
                workspaceType: 'ide', // TODO: get from context
                history: conversationHistory,
            });

            const newResults: MultiAgentResults = {
                routing: routingDecision,
            };
            setResults(newResults);
            onResults?.(newResults);

            // Log routing decision for analytics
            console.log('[MultiAgentChat] Routing decision:', {
                intent: routingDecision.intent,
                confidence: routingDecision.confidence,
                suggestedAgent: routingDecision.suggestedAgent,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            toast.error(t('multiAgent.routing.failed', 'Routing failed'), {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }, [messages, config, getConversationHistory, onResults, t]);

    /**
     * Start sequential expansion
     */
    const startExpansion = useCallback(async (lastMessage?: string) => {
        // Find last assistant message
        const assistantMsg = lastMessage ||
            [...(messages || [])].reverse().find(m => m.role === 'assistant')?.content;

        if (!assistantMsg?.trim()) {
            toast.error(t('multiAgent.expansion.noContent', 'No content to expand'));
            return;
        }

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setMode('expansion');
        setIsLoading(true);
        setError(null);
        setResults(null);

        try {
            const expansionAgent = createExpansionAgent({
                providerId: config?.providerId || 'gemini',
                modelId: config?.modelId || 'gemini-2.0-flash',
                questionCount: 3,
            });

            const conversationHistory = getConversationHistory();
            const lastUserMsg = [...(messages || [])].reverse().find(m => m.role === 'user');

            const expansionResult = await expansionAgent.generateExpansions({
                lastMessage: assistantMsg,
                lastUserMessage: lastUserMsg?.content,
                threadTitle: undefined, // TODO: get from thread metadata
                recentHistory: conversationHistory,
            });

            const newResults: MultiAgentResults = {
                expansion: expansionResult,
            };
            setResults(newResults);
            onResults?.(newResults);

            console.log('[MultiAgentChat] Generated expansions:', {
                count: expansionResult.questions.length,
                coherence: expansionResult.coherenceScore,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            toast.error(t('multiAgent.expansion.failed', 'Expansion failed'), {
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }, [messages, config, getConversationHistory, onResults, t]);

    /**
     * Cancel current operation
     */
    const cancel = useCallback(() => {
        abortControllerRef.current?.abort();
        resetState();
        toast.info(t('multiAgent.cancelled', 'Operation cancelled'));
    }, [resetState, t]);

    /**
     * Clear results
     */
    const clearResults = useCallback(() => {
        setResults(null);
        resetState();
    }, [resetState]);

    return {
        mode,
        isLoading,
        error,
        currentRound,
        totalRounds,
        currentPersona,
        results,
        actions: {
            startDebate,
            startRouting,
            startExpansion,
            cancel,
            clearResults,
        },
    };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Debate-specific hook
 */
export function useDebate(options?: UseMultiAgentChatOptions) {
    const multiAgent = useMultiAgentChat(options);

    return {
        ...multiAgent,
        startDebate: multiAgent.actions.startDebate,
        debateResults: multiAgent.results?.debate,
    };
}

/**
 * Routing-specific hook
 */
export function useRouting(options?: UseMultiAgentChatOptions) {
    const multiAgent = useMultiAgentChat(options);

    return {
        ...multiAgent,
        startRouting: multiAgent.actions.startRouting,
        routingDecision: multiAgent.results?.routing,
    };
}

/**
 * Expansion-specific hook
 */
export function useExpansion(options?: UseMultiAgentChatOptions) {
    const multiAgent = useMultiAgentChat(options);

    return {
        ...multiAgent,
        startExpansion: multiAgent.actions.startExpansion,
        expansionResult: multiAgent.results?.expansion,
    };
}
