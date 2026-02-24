/**
 * @fileoverview Debate Timeline Component
 * @module presentation/components/chat/DebateTimeline
 * @governance EPIC-E4-4
 * @created 2026-01-05
 *
 * Displays multi-agent debate results with timeline, agreements, and synthesis.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DebateResults,
    DebateArgument,
    DebatePersona,
} from '@/lib/workflow/agents/debate-agent';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface DebateTimelineProps {
    /** Complete debate results to display */
    results: DebateResults;
    /** Callback when user provides feedback on synthesis */
    onFeedback?: (helpful: boolean) => void;
    /** Callback to explore a disagreement in more detail */
    onExploreDisagreement?: (topic: string) => void;
    /** Additional CSS classes */
    className?: string;
}

export interface DebateTimelineLoadingProps {
    /** Topic being debated */
    topic: string;
    /** Current round (1-based) */
    currentRound: number;
    /** Total rounds */
    totalRounds: number;
    /** Current persona speaking */
    currentPersona?: DebatePersona;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// Persona Utilities
// ============================================================================

const PERSONA_INFO: Record<DebatePersona, { name: string; color: string; icon: string }> = {
    [DebatePersona.OPTIMIST]: {
        name: 'optimist',
        color: 'text-success',
        icon: '🌟',
    },
    [DebatePersona.SKEPTIC]: {
        name: 'skeptic',
        color: 'text-warning',
        icon: '🔍',
    },
    [DebatePersona.EXPERT]: {
        name: 'expert',
        color: 'text-info',
        icon: '🎓',
    },
    [DebatePersona.DEVILS_ADVOCATE]: {
        name: "devil's advocate",
        color: 'text-purple-400',
        icon: '😈',
    },
    [DebatePersona.SYNTHESIZER]: {
        name: 'synthesizer',
        color: 'text-info',
        icon: '🔄',
    },
};

function getPersonaInfo(persona: DebatePersona) {
    return PERSONA_INFO[persona] || { name: persona, color: 'text-muted-foreground', icon: '💬' };
}

// ============================================================================
// Loading Component
// ============================================================================

export function DebateLoading({
    topic: _topic,
    currentRound,
    totalRounds,
    currentPersona,
    className = '',
}: DebateTimelineLoadingProps) {
    const { t } = useTranslation();
    const personaInfo = currentPersona ? getPersonaInfo(currentPersona) : null;
    const progress = (currentRound / totalRounds) * 100;

    return (
        <div className={`p-4 rounded-none border bg-card ${className}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center animate-pulse">
                    <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium">{t('chat.debate.inProgress')}</p>
                    <p className="text-xs text-muted-foreground">Round {currentRound} of {totalRounds}</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-none overflow-hidden mb-3">
                <div
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {personaInfo && (
                <div className="flex items-center gap-2 text-sm">
                    <span>{personaInfo.icon}</span>
                    <span className={personaInfo.color}>
                        {t(`chat.debate.personas.${personaInfo.name}`)}
                    </span>
                    <span className="text-muted-foreground">is reasoning...</span>
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Main Timeline Component
// ============================================================================

export function DebateTimeline({
    results,
    onFeedback,
    onExploreDisagreement,
    className = '',
}: DebateTimelineProps) {
    const { t } = useTranslation();
    const [expandedRound, setExpandedRound] = useState<number | null>(null);
    const [feedbackGiven, setFeedbackGiven] = useState(false);
    const [selectedAgreement, setSelectedAgreement] = useState<number | null>(null);

    const { synthesis, agreementMatrix, roundsCompleted, duration } = results;
    const confidencePercent = Math.round(synthesis.confidence * 100);

    // Group arguments by round
    const argumentsByRound: Record<number, DebateArgument[]> = {};
    for (const arg of results.arguments) {
        if (!argumentsByRound[arg.round]) {
            argumentsByRound[arg.round] = [];
        }
        argumentsByRound[arg.round].push(arg);
    }

    const handleFeedback = (helpful: boolean) => {
        setFeedbackGiven(true);
        onFeedback?.(helpful);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('chat.debate.title')}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{roundsCompleted} {t('chat.debate.rounds')}</span>
                    <span>•</span>
                    <span>{Math.round(duration / 1000)}s</span>
                </div>
            </div>

            {/* Synthesis Card */}
            <div className="p-4 rounded-none border bg-card">
                <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{t('chat.debate.synthesis.title')}</p>
                        <p className="text-sm">{synthesis.answer}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold">{confidencePercent}%</div>
                        <div className="text-xs text-muted-foreground">{t('chat.debate.confidence')}</div>
                    </div>
                </div>

                {/* Consensus points */}
                {synthesis.consensusPoints.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            {t('chat.debate.consensus')}
                        </p>
                        <ul className="space-y-1">
                            {synthesis.consensusPoints.map((point, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <span className="text-success">✓</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Open questions */}
                {synthesis.openQuestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                            {t('chat.debate.openQuestions')}
                        </p>
                        <ul className="space-y-1">
                            {synthesis.openQuestions.map((question, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 text-warning mt-1" />
                                    <span>{question}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Feedback buttons */}
                {!feedbackGiven && (
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t('chat.debate.feedbackPrompt')}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleFeedback(true)}
                                className="p-2 rounded hover:bg-success/10 transition-colors"
                                aria-label="Helpful"
                            >
                                <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFeedback(false)}
                                className="p-2 rounded hover:bg-destructive/10 transition-colors"
                                aria-label="Not helpful"
                            >
                                <ThumbsDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Agreement Matrix */}
            {agreementMatrix.disagreements.length > 0 && (
                <div className="p-4 rounded-none border bg-card">
                    <p className="text-sm font-medium mb-3">{t('chat.debate.disagreements.title')}</p>
                    <div className="space-y-2">
                        {agreementMatrix.disagreements.map((disagreement, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-none border cursor-pointer transition-colors ${
                                    selectedAgreement === i
                                        ? 'bg-warning/10 border-warning/30'
                                        : 'bg-muted/30 hover:bg-muted/50'
                                }`}
                                onClick={() => setSelectedAgreement(selectedAgreement === i ? null : i)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{disagreement.topic}</span>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded ${
                                            disagreement.severity === 'high'
                                                ? 'bg-destructive/20 text-destructive'
                                                : disagreement.severity === 'medium'
                                                  ? 'bg-warning/20 text-warning'
                                                  : 'bg-info/20 text-info'
                                        }`}
                                    >
                                        {disagreement.severity}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                    <span>{getPersonaInfo(disagreement.personas[0]).icon}</span>
                                    <span>vs</span>
                                    <span>{getPersonaInfo(disagreement.personas[1]).icon}</span>
                                    {onExploreDisagreement && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onExploreDisagreement(disagreement.topic);
                                            }}
                                            className="ml-auto text-primary hover:underline"
                                        >
                                            {t('chat.debate.explore')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Arguments Timeline */}
            <div className="space-y-3">
                <p className="text-sm font-medium">{t('chat.debate.arguments.title')}</p>

                {Array.from({ length: roundsCompleted }, (_, i) => i + 1).map((round) => {
                    const roundArgs = argumentsByRound[round] || [];
                    const isExpanded = expandedRound === round;

                    return (
                        <div key={round} className="border rounded-none overflow-hidden">
                            <button
                                onClick={() => setExpandedRound(isExpanded ? null : round)}
                                className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                            >
                                <span className="text-sm font-medium">
                                    {t('chat.debate.round')} {round}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {roundArgs.length} {t('chat.debate.arguments')}
                                </span>
                            </button>

                            {isExpanded && (
                                <div className="p-3 pt-0 space-y-3 border-t">
                                    {roundArgs.map((arg) => {
                                        const personaInfo = getPersonaInfo(arg.persona);
                                        return (
                                            <div
                                                key={arg.id}
                                                className="p-3 rounded bg-muted/20"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-lg">{personaInfo.icon}</span>
                                                    <span className={`text-sm font-medium ${personaInfo.color}`}>
                                                        {t(`chat.debate.personas.${personaInfo.name}`)}
                                                    </span>
                                                    <div className="flex-1" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {Math.round(arg.confidence * 100)}% {t('chat.debate.confidence').toLowerCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm mb-2">{arg.content}</p>
                                                {arg.keyPoints.length > 0 && (
                                                    <ul className="space-y-1">
                                                        {arg.keyPoints.map((point, pi) => (
                                                            <li
                                                                key={pi}
                                                                className="text-xs text-muted-foreground flex items-start gap-2"
                                                            >
                                                                <span className="text-primary">•</span>
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Influential Arguments */}
            {synthesis.influentialArguments.length > 0 && (
                <div className="p-4 rounded-none border bg-muted/20">
                    <p className="text-sm font-medium mb-2">{t('chat.debate.influential.title')}</p>
                    <div className="space-y-2">
                        {synthesis.influentialArguments.map((influential, i) => {
                            const personaInfo = getPersonaInfo(influential.persona);
                            return (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                    <span>{personaInfo.icon}</span>
                                    <span className={personaInfo.color}>
                                        {t(`chat.debate.personas.${personaInfo.name}`)}
                                    </span>
                                    <span className="text-muted-foreground">—</span>
                                    <span className="text-xs">{influential.reason}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
