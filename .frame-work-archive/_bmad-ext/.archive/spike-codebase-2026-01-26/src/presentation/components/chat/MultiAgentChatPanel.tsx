/**
 * @fileoverview Multi-Agent Chat Panel
 * @module presentation/components/chat/MultiAgentChatPanel
 * @governance CHAT-013
 * @created 2026-01-13
 *
 * Orchestrates multi-agent chat modes including debate, content routing,
 * and sequential expansion. Integrates backend agents with UI components.
 */

import { useCallback } from 'react';
import { Users, GitBranch, Sparkles, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

// Multi-agent hook
import {
    useMultiAgentChat,
    type MultiAgentConfig,
    type UseMultiAgentChatOptions,
} from '@/lib/agent/hooks/use-multi-agent-chat';

// Multi-agent UI components
import {
    DebateTimeline,
    DebateLoading,
} from './DebateTimeline';
import {
    RoutingDecisionDisplay,
    RoutingLoading,
} from './RoutingDecision';
import {
    SequentialExpansionOptions,
    SequentialExpansionLoading,
} from './SequentialExpansionOptions';

// Store for thread management
import { useConversationStore } from '@/infrastructure/persistence/stores/conversation/useConversationStore';

// ============================================================================
// Types
// ============================================================================

export interface MultiAgentChatPanelProps {
    /** Provider ID for AI calls */
    providerId?: string;
    /** Model to use */
    modelId?: string;
    /** Current conversation ID for context */
    conversationId?: string;
    /** Current thread ID */
    threadId?: string;
    /** Available messages for context */
    messages?: Array<{ role: string; content: string }>;
    /** Callback when results are ready */
    onResults?: (results: { debate?: unknown; routing?: unknown; expansion?: unknown }) => void;
    /** Additional CSS classes */
    className?: string;
}

export interface MultiAgentTriggerButtonsProps {
    /** Start debate callback */
    onStartDebate: () => void;
    /** Start routing callback */
    onStartRouting: () => void;
    /** Start expansion callback */
    onStartExpansion: () => void;
    /** Whether any operation is in progress */
    isLoading?: boolean;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// Trigger Buttons Component
// ============================================================================

/**
 * Multi-Agent Trigger Buttons
 *
 * Displays buttons to trigger different multi-agent modes.
 */
export function MultiAgentTriggerButtons({
    onStartDebate,
    onStartRouting,
    onStartExpansion,
    isLoading = false,
    className = '',
}: MultiAgentTriggerButtonsProps) {
    const { t } = useTranslation();

    return (
        <div className={`flex items-center gap-2 flex-wrap ${className}`}>
            <span className="text-xs text-muted-foreground">
                {t('multiAgent.triggerLabel', 'Multi-Agent')}:
            </span>

            <button
                onClick={onStartDebate}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-none border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t('multiAgent.debate.tooltip', 'Start multi-agent debate')}
            >
                <Users className="w-3.5 h-3.5" />
                <span>{t('multiAgent.debate.short', 'Debate')}</span>
            </button>

            <button
                onClick={onStartRouting}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-none border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t('multiAgent.routing.tooltip', 'Classify intent and route')}
            >
                <GitBranch className="w-3.5 h-3.5" />
                <span>{t('multiAgent.routing.short', 'Route')}</span>
            </button>

            <button
                onClick={onStartExpansion}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-none border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t('multiAgent.expansion.tooltip', 'Generate follow-up questions')}
            >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('multiAgent.expansion.short', 'Expand')}</span>
            </button>
        </div>
    );
}

// ============================================================================
// Main Panel Component
// ============================================================================

/**
 * Multi-Agent Chat Panel
 *
 * Orchestrates multi-agent chat modes:
 * - Debate: Multiple AI agents discuss and synthesize an answer
 * - Routing: Classify intent and route to specialized handler
 * - Expansion: Generate follow-up questions for deeper exploration
 */
export function MultiAgentChatPanel({
    providerId,
    modelId,
    conversationId,
    threadId,
    messages,
    onResults,
    className = '',
}: MultiAgentChatPanelProps) {
    const { t } = useTranslation();

    // Get thread ID from store if not provided
    const activeThreadId = useConversationStore(
        useShallow((state) => state.activeThreadId)
    );

    const currentThreadId = threadId || activeThreadId || undefined;

    // Multi-agent configuration
    const config: MultiAgentConfig = {
        providerId,
        modelId,
    };

    // Hook options
    const hookOptions: UseMultiAgentChatOptions = {
        config,
        conversationId,
        threadId: currentThreadId,
        messages,
        onResults,
    };

    // Use multi-agent hook
    const {
        mode,
        isLoading,
        error,
        currentRound,
        totalRounds,
        results,
        actions,
    } = useMultiAgentChat(hookOptions);

    /**
     * Handle feedback from debate synthesis
     */
    const handleDebateFeedback = useCallback((helpful: boolean) => {
        console.log('[MultiAgentChatPanel] Debate feedback:', helpful);
        // TODO: Send feedback to analytics or learning system
    }, []);

    /**
     * Handle exploring a disagreement in detail
     */
    const handleExploreDisagreement = useCallback((topic: string) => {
        console.log('[MultiAgentChatPanel] Explore disagreement:', topic);
        // TODO: Start a new debate focused on this topic
    }, []);

    /**
     * Handle routing feedback
     */
    const handleRoutingFeedback = useCallback((correct: boolean) => {
        console.log('[MultiAgentChatPanel] Routing feedback:', correct);
        // TODO: Send feedback to routing agent for learning
    }, []);

    /**
     * Handle routing override
     */
    const handleRoutingOverride = useCallback((intent: unknown) => {
        console.log('[MultiAgentChatPanel] Routing override:', intent);
        // TODO: Re-route using the specified intent
    }, []);

    /**
     * Handle expansion complete
     */
    const handleExpansionComplete = useCallback((childThreadId: string) => {
        console.log('[MultiAgentChatPanel] Expansion complete:', childThreadId);
        // TODO: Navigate to the new thread
    }, []);

    /**
     * Handle expansion error
     */
    const handleExpansionError = useCallback((error: Error) => {
        console.error('[MultiAgentChatPanel] Expansion error:', error);
    }, []);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Trigger Buttons */}
            <MultiAgentTriggerButtons
                onStartDebate={actions.startDebate}
                onStartRouting={actions.startRouting}
                onStartExpansion={actions.startExpansion}
                isLoading={isLoading}
            />

            {/* Loading State */}
            {isLoading && mode === 'debate' && (
                <DebateLoading
                    topic={messages?.slice(-1)[0]?.content || ''}
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                />
            )}

            {isLoading && mode === 'routing' && (
                <RoutingLoading />
            )}

            {isLoading && mode === 'expansion' && (
                <SequentialExpansionLoading />
            )}

            {/* Error State */}
            {error && (
                <div className="p-3 rounded-none border border-destructive/50 bg-destructive/10 text-destructive text-sm">
                    {error}
                </div>
            )}

            {/* Results Display */}
            {results && !isLoading && (
                <div className="relative">
                    {/* Close button */}
                    <button
                        onClick={actions.clearResults}
                        className="absolute top-0 right-0 p-1 rounded-none hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={t('common.close', 'Close')}
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Debate Results */}
                    {results.debate && mode === 'debate' && (
                        <DebateTimeline
                            results={results.debate}
                            onFeedback={handleDebateFeedback}
                            onExploreDisagreement={handleExploreDisagreement}
                        />
                    )}

                    {/* Routing Results */}
                    {results.routing && mode === 'routing' && (
                        <RoutingDecisionDisplay
                            decision={results.routing}
                            onFeedback={handleRoutingFeedback}
                            onOverride={handleRoutingOverride}
                        />
                    )}

                    {/* Expansion Results */}
                    {results.expansion && mode === 'expansion' && currentThreadId && (
                        <SequentialExpansionOptions
                            expansion={results.expansion}
                            parentThreadId={currentThreadId}
                            onExpansionComplete={handleExpansionComplete}
                            onError={handleExpansionError}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Standalone Trigger Component (for embedding in other UIs)
// ============================================================================

export interface MultiAgentInlineTriggerProps {
    /** Mode to trigger */
    mode: 'debate' | 'routing' | 'expansion';
    /** Click handler */
    onClick: () => void;
    /** Disabled state */
    disabled?: boolean;
    /** Button variant */
    variant?: 'default' | 'compact' | 'icon-only';
}

/**
 * Inline trigger button for a specific multi-agent mode
 */
export function MultiAgentInlineTrigger({
    mode,
    onClick,
    disabled = false,
    variant = 'default',
}: MultiAgentInlineTriggerProps) {
    const { t } = useTranslation();

    const config = {
        debate: {
            icon: <Users className="w-4 h-4" />,
            label: t('multiAgent.debate.short', 'Debate'),
            tooltip: t('multiAgent.debate.tooltip', 'Start multi-agent debate'),
        },
        routing: {
            icon: <GitBranch className="w-4 h-4" />,
            label: t('multiAgent.routing.short', 'Route'),
            tooltip: t('multiAgent.routing.tooltip', 'Classify intent and route'),
        },
        expansion: {
            icon: <Sparkles className="w-4 h-4" />,
            label: t('multiAgent.expansion.short', 'Expand'),
            tooltip: t('multiAgent.expansion.tooltip', 'Generate follow-up questions'),
        },
    }[mode];

    if (variant === 'icon-only') {
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className="p-1.5 rounded-none hover:bg-accent text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={config.tooltip}
            >
                {config.icon}
            </button>
        );
    }

    if (variant === 'compact') {
        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className="inline-flex items-center gap-1 px-1.5 py-1 text-xs rounded-none border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={config.tooltip}
            >
                {config.icon}
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-none border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={config.tooltip}
        >
            {config.icon}
            <span>{config.label}</span>
        </button>
    );
}

// ============================================================================
// Loading Spinner (for standalone use)
// ============================================================================

export interface MultiAgentLoadingProps {
    /** Mode being loaded */
    mode: 'debate' | 'routing' | 'expansion';
    /** Optional message */
    message?: string;
}

/**
 * Standalone loading indicator for multi-agent operations
 */
export function MultiAgentLoading({ mode, message }: MultiAgentLoadingProps) {
    const { t } = useTranslation();

    const defaultMessage = {
        debate: t('multiAgent.debate.loading', 'Conducting debate...'),
        routing: t('multiAgent.routing.loading', 'Classifying intent...'),
        expansion: t('multiAgent.expansion.loading', 'Generating expansions...'),
    }[mode];

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{message || defaultMessage}</span>
        </div>
    );
}
