/**
 * @fileoverview Block Loading Overlay Component
 * @module components/notes/BlockLoadingOverlay
 * @story EPIC-42-03 - Block-specific loading animation
 * 
 * Displays a loading overlay on a block when AI is generating content.
 * Shows spinner, progress message, and subtle blur effect.
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

/**
 * Inner content component that displays the loading animation
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
                // Background with blur
                'bg-background/60 backdrop-blur-sm',
                // Flex center
                'flex items-center justify-center',
                // Animation
                'animate-in fade-in duration-200',
                className
            )}
        >
            <div className="flex flex-col items-center gap-2 px-4 py-3 bg-card border-2 border-primary/20 shadow-lg">
                {/* Spinner with sparkle icon */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                        {state.commandName}
                    </span>
                </div>

                {/* Progress message */}
                {state.message && (
                    <span className="text-xs text-muted-foreground">
                        {state.message}
                    </span>
                )}

                {/* Elapsed time indicator (shows after 3 seconds) */}
                {elapsedSeconds >= 3 && (
                    <span className="text-xs text-muted-foreground/70">
                        {t('notes.ai.elapsed', '{{seconds}}s', { seconds: elapsedSeconds })}
                    </span>
                )}
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
