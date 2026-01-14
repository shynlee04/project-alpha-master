/**
 * @fileoverview Block Loading Overlay Component
 * @module components/notes/BlockLoadingOverlay
 * @story EPIC-42-03 - Block-specific loading animation
 * @story UX-15 - Streaming Animations (enhanced with tokens and typing indicator)
 *
 * Displays a loading overlay on a block when AI is generating content.
 * Shows spinner, progress message, typing indicator, token counter, and subtle blur effect.
 */

import { useTranslation } from 'react-i18next';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlockLoadingState, type BlockLoadingState } from '@/lib/notes/ai-loading-store';

interface BlockLoadingOverlayProps {
    /** Block ID to check loading state for */
    blockId: string;
    /** Optional className for styling */
    className?: string;
}

/**
 * Overlay component that shows loading state for a specific block
 * Position this as a sibling to the block content with relative parent
 */
export function BlockLoadingOverlay({ blockId, className }: BlockLoadingOverlayProps) {
    const loadingState = useBlockLoadingState(blockId);

    if (!loadingState) {
        return null;
    }

    return <BlockLoadingContent state={loadingState} className={className} />;
}

interface BlockLoadingContentProps {
    state: BlockLoadingState;
    className?: string;
}

// ============================================================================
// UX-15: Streaming Animation Components
// ============================================================================

/**
 * Typing indicator with animated dots
 * Shows when AI is actively streaming content
 */
interface TypingIndicatorProps {
    /** Whether the indicator is currently typing */
    isTyping?: boolean;
    /** Optional className for styling */
    className?: string;
}

function TypingIndicator({ isTyping = true, className }: TypingIndicatorProps) {
    if (!isTyping) return null;

    return (
        <div className={cn('flex items-center gap-1', className)}>
            {/* Three animated dots */}
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[typing-bounce_1.4s_infinite_0.1s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[typing-bounce_1.4s_infinite_0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-[typing-bounce_1.4s_infinite_0.5s]" />
        </div>
    );
}

/**
 * Token counter with progress bar
 * Shows tokens used vs maximum context window
 */
interface TokenCounterProps {
    /** Number of tokens consumed */
    tokensUsed?: number;
    /** Maximum token context (default 128k) */
    maxTokens?: number;
    /** Optional className for styling */
    className?: string;
}

function TokenCounter({ tokensUsed, maxTokens = 128000, className }: TokenCounterProps) {
    if (tokensUsed === undefined) return null;

    const percentage = Math.min((tokensUsed / maxTokens) * 100, 100);
    const formatTokens = (num: number): string => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    // Determine color based on usage
    const getColorClass = (): string => {
        if (percentage >= 90) return 'bg-destructive';
        if (percentage >= 70) return 'bg-warning';
        return 'bg-primary';
    };

    return (
        <div className={cn('flex flex-col gap-1 w-full', className)}>
            <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tokens</span>
                <span className="font-medium tabular-nums">
                    {formatTokens(tokensUsed)} / {formatTokens(maxTokens)}
                </span>
            </div>
            {/* Progress bar */}
            <div className="h-1 w-full bg-muted rounded-none overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-300 ease-out',
                        getColorClass()
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

/**
 * Character count indicator
 * Shows the number of characters generated so far
 */
interface CharCounterProps {
    /** Number of characters generated */
    charCount?: number;
    /** Optional className for styling */
    className?: string;
}

function CharCounter({ charCount, className }: CharCounterProps) {
    if (charCount === undefined || charCount < 10) return null;

    return (
        <div className={cn('text-xs text-muted-foreground/70 tabular-nums', className)}>
            {charCount.toLocaleString()} {charCount === 1 ? 'char' : 'chars'}
        </div>
    );
}

// ============================================================================
// Main Content Component
// ============================================================================

/**
 * Inner content component that displays the loading animation
 * UX-15: Enhanced with typing indicator, token counter, and character count
 */
function BlockLoadingContent({ state, className }: BlockLoadingContentProps) {
    const { t } = useTranslation();

    // Calculate elapsed time for display
    const elapsedMs = Date.now() - state.startedAt;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    return (
        <div
            className={cn(
                // Position absolute over the block
                'absolute inset-0 z-20',
                // Solid background (8-bit design - no transparency)
                'bg-background',
                // Flex center
                'flex items-center justify-center',
                // Animation
                'animate-in fade-in duration-200',
                className
            )}
        >
            <div className="flex flex-col items-center gap-3 px-4 py-3 bg-card border-2 border-primary/20 shadow-pixel min-w-[200px]">
                {/* Header: Spinner with sparkle icon and command name */}
                <div className="flex items-center gap-2 w-full">
                    <div className="relative">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-warning animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">
                        {state.commandName}
                    </span>
                    {/* UX-15: Typing indicator */}
                    <TypingIndicator isTyping={state.isTyping} />
                </div>

                {/* Progress message */}
                {state.message && (
                    <span className="text-xs text-muted-foreground text-center w-full">
                        {state.message}
                    </span>
                )}

                {/* UX-15: Token counter with progress bar */}
                <TokenCounter
                    tokensUsed={state.tokensUsed}
                    maxTokens={state.maxTokens}
                    className="w-full"
                />

                {/* UX-15: Character count and elapsed time row */}
                <div className="flex items-center justify-between w-full gap-4">
                    <CharCounter charCount={state.charCount} />
                    {/* Elapsed time indicator (shows after 3 seconds) */}
                    {elapsedSeconds >= 3 && (
                        <span className="text-xs text-muted-foreground/70 tabular-nums">
                            {t('notes.ai.elapsed', '{{seconds}}s', { seconds: elapsedSeconds })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Inline loading indicator for smaller spaces
 * Use this when overlay is not appropriate
 */
export function InlineAILoadingIndicator({ 
    commandName = 'AI',
    className 
}: { 
    commandName?: string;
    className?: string;
}) {
    return (
        <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{commandName}...</span>
        </div>
    );
}

/**
 * Global AI loading indicator for the editor toolbar
 * Shows when any block is generating content
 */
export function GlobalAILoadingIndicator() {
    const { t } = useTranslation();
    
    // This component should be connected to useIsAnyAILoading()
    // But for simplicity, we'll accept a prop or use context
    return (
        <div className="flex items-center gap-2 px-2 py-1 bg-primary/10 text-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{t('notes.ai.generating', 'AI generating...')}</span>
        </div>
    );
}
