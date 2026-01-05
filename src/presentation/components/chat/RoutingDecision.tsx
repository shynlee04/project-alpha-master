/**
 * @fileoverview Routing Decision Display Component
 * @module presentation/components/chat/RoutingDecision
 * @governance EPIC-E4-3
 * @created 2026-01-06
 *
 * UI component for displaying routing decisions and enabling user feedback.
 *
 * Story E4-3: Content-Based Routing Agent
 */

import { useState } from 'react';
import { Code2, Search, FileText, MessageSquare, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RoutingDecision, IntentType } from '@/lib/workflow';

// ============================================================================
// Types
// ============================================================================

export interface RoutingDecisionProps {
    /** Routing decision to display */
    decision: RoutingDecision;
    /** Callback when user provides feedback */
    onFeedback?: (correct: boolean) => void;
    /** Callback when user wants to override routing */
    onOverride?: (intent: IntentType) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Routing Decision Display
 *
 * Shows the user what intent was detected and allows feedback.
 */
export function RoutingDecisionDisplay({
    decision,
    onFeedback,
    onOverride,
}: RoutingDecisionProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(false);

    const intentInfo = getIntentInfo(decision.intent);
    const confidencePercent = Math.round(decision.confidence * 100);

    const handleFeedback = (correct: boolean) => {
        setFeedbackGiven(true);
        onFeedback?.(correct);
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            {/* Icon */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${intentInfo.bgColor} ${intentInfo.textColor}`}>
                {intentInfo.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${intentInfo.textColor}`}>
                        {t(`chat.routing.intent.${decision.intent}`, intentInfo.label)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {confidencePercent}% {t('chat.routing.confidence', 'confidence')}
                    </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                    {decision.reasoning}
                </p>

                {expanded && (
                    <div className="mt-2 space-y-2">
                        {/* Suggested Agent */}
                        <div className="text-xs">
                            <span className="text-muted-foreground">{t('chat.routing.suggestedAgent', 'Agent')}:</span>{' '}
                            <span className="font-mono">{decision.suggestedAgent}</span>
                        </div>

                        {/* Suggested Tools */}
                        <div className="text-xs">
                            <span className="text-muted-foreground">{t('chat.routing.tools', 'Tools')}:</span>{' '}
                            <span className="font-mono">{decision.suggestedTools.join(', ')}</span>
                        </div>

                        {/* Override Options */}
                        {onOverride && (
                            <div className="pt-2 border-t border-border/50">
                                <span className="text-xs text-muted-foreground">{t('chat.routing.override', 'Override')}:</span>
                                <div className="flex gap-1 mt-1 flex-wrap">
                                    {(
                                        [
                                            { intent: 'coding' as IntentType, label: 'Coding' },
                                            { intent: 'research' as IntentType, label: 'Research' },
                                            { intent: 'writing' as IntentType, label: 'Writing' },
                                            { intent: 'general' as IntentType, label: 'General' },
                                        ] as const
                                    ).map(({ intent, label }) => (
                                        <button
                                            key={intent}
                                            onClick={() => onOverride(intent)}
                                            className={`text-xs px-2 py-1 rounded transition-colors ${
                                                decision.intent === intent
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background hover:bg-accent'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                {/* Feedback */}
                {onFeedback && !feedbackGiven && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => handleFeedback(true)}
                            className="p-1 rounded hover:bg-success/20 text-muted-foreground hover:text-success transition-colors"
                            title={t('chat.routing.correct', 'Correct')}
                        >
                            <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleFeedback(false)}
                            className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                            title={t('chat.routing.incorrect', 'Incorrect')}
                        >
                            <ThumbsDown className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Expand */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1 rounded hover:bg-accent text-muted-foreground transition-colors"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// Loading State Component
// ============================================================================

export interface RoutingLoadingProps {
    /** Optional message to display */
    message?: string;
}

/**
 * Loading state for routing classification
 */
export function RoutingLoading({ message }: RoutingLoadingProps) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>{message || t('chat.routing.classifying', 'Detecting intent...')}</span>
        </div>
    );
}

// ============================================================================
// Helpers
// ============================================================================

interface IntentInfo {
    label: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
}

function getIntentInfo(intent: IntentType): IntentInfo {
    switch (intent) {
        case 'coding':
            return {
                label: 'Coding',
                icon: <Code2 {...{ className: 'w-4 h-4' }} />,
                bgColor: 'bg-blue-500/20',
                textColor: 'text-blue-500',
            };
        case 'research':
            return {
                label: 'Research',
                icon: <Search {...{ className: 'w-4 h-4' }} />,
                bgColor: 'bg-green-500/20',
                textColor: 'text-green-500',
            };
        case 'writing':
            return {
                label: 'Writing',
                icon: <FileText {...{ className: 'w-4 h-4' }} />,
                bgColor: 'bg-purple-500/20',
                textColor: 'text-purple-500',
            };
        case 'general':
        default:
            return {
                label: 'General',
                icon: <MessageSquare {...{ className: 'w-4 h-4' }} />,
                bgColor: 'bg-gray-500/20',
                textColor: 'text-gray-500',
            };
    }
}
