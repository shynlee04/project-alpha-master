/**
 * @fileoverview Replacement Preview Dialog
 * @module components/notes/ReplacementPreviewDialog
 * @story UX-16 - Replacement Modal with Preview
 * @created 2026-01-16
 *
 * Shows a preview of AI-generated text replacement with before/after comparison.
 * Allows user to accept or reject the replacement before applying changes.
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Loader2, Check, X, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import i18next from 'i18next';

// ============================================================================
// Types
// ============================================================================

// Translation helper
function t(key: string, defaultValue?: string): string {
    try {
        const result = i18next.t(key, { defaultValue });
        return typeof result === 'string' ? result : defaultValue || key;
    } catch {
        return defaultValue || key;
    }
}

export interface ReplacementPreviewProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Called when dialog open state changes */
    onOpenChange: (open: boolean) => void;
    /** Original text to be replaced */
    originalText: string;
    /** Action name that was performed (e.g., "Summarize", "Improve") */
    actionName: string;
    /** Function to generate the replacement text */
    onGenerate: () => Promise<string>;
    /** Called when user accepts the replacement */
    onAccept: (replacementText: string) => void;
    /** Called when user rejects the replacement */
    onReject: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function ReplacementPreviewDialog({
    open,
    onOpenChange,
    originalText,
    actionName,
    onGenerate,
    onAccept,
    onReject,
}: ReplacementPreviewProps) {
    const { t: translate } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [replacementText, setReplacementText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Generate replacement when dialog opens
    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setReplacementText(null);

        try {
            const result = await onGenerate();
            setReplacementText(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Generation failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [onGenerate]);

    // Auto-generate when dialog opens
    const handleOpenChange = useCallback((newOpen: boolean) => {
        onOpenChange(newOpen);
        if (newOpen) {
            handleGenerate();
        } else {
            // Reset state when closing
            setReplacementText(null);
            setError(null);
        }
    }, [onOpenChange, handleGenerate]);

    // Handle accept
    const handleAccept = useCallback(() => {
        if (replacementText) {
            onAccept(replacementText);
            onOpenChange(false);
            setReplacementText(null);
        }
    }, [replacementText, onAccept, onOpenChange]);

    // Handle reject
    const handleReject = useCallback(() => {
        onReject();
        onOpenChange(false);
        setReplacementText(null);
    }, [onReject, onOpenChange]);

    // Handle retry
    const handleRetry = useCallback(() => {
        handleGenerate();
    }, [handleGenerate]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl" size="lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t('notes.replacement.title', 'Preview Replacement')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('notes.replacement.description', 'Review the AI-generated replacement before applying changes')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    {/* Action badge */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {t('notes.replacement.action', 'Action')}:
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {actionName}
                        </span>
                    </div>

                    {/* Before/After comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original text (before) */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                {t('notes.replacement.original', 'Original')}
                                <span className="text-xs text-muted-foreground">
                                    ({originalText.length} {t('common.characters', 'chars')})
                                </span>
                            </div>
                            <div className="p-3 bg-muted/30 border-2 border-border rounded text-sm text-muted-foreground max-h-[200px] overflow-y-auto whitespace-pre-wrap">
                                {originalText}
                            </div>
                        </div>

                        {/* Replacement text (after) */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Sparkles className="w-4 h-4 text-primary" />
                                {t('notes.replacement.preview', 'Preview')}
                                {replacementText && (
                                    <span className="text-xs text-muted-foreground">
                                        ({replacementText.length} {t('common.characters', 'chars')})
                                    </span>
                                )}
                            </div>
                            <div
                                className={cn(
                                    "p-3 border-2 rounded text-sm max-h-[200px] overflow-y-auto whitespace-pre-wrap transition-colors",
                                    isLoading || error
                                        ? "bg-muted/30 border-border text-muted-foreground"
                                        : "bg-primary/5 border-primary/30 text-foreground"
                                )}
                            >
                                {isLoading && (
                                    <div className="flex items-center justify-center h-full py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            {t('notes.replacement.generating', 'Generating replacement...')}
                                        </span>
                                    </div>
                                )}
                                {error && (
                                    <div className="flex flex-col items-center justify-center h-full py-4 gap-2">
                                        <span className="text-destructive">{error}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRetry}
                                            className="gap-1"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            {t('common.retry', 'Retry')}
                                        </Button>
                                    </div>
                                )}
                                {replacementText && !isLoading && !error && replacementText}
                                {!isLoading && !error && !replacementText && (
                                    <div className="flex items-center justify-center h-full py-8 text-muted-foreground">
                                        {t('notes.replacement.empty', 'No replacement generated')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Length comparison indicator */}
                    {replacementText && !isLoading && !error && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                {t('notes.replacement.diff', 'Difference')}:{' '}
                                <span
                                    className={cn(
                                        'font-medium',
                                        replacementText.length > originalText.length
                                            ? 'text-warning'
                                            : replacementText.length < originalText.length
                                            ? 'text-success'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    {replacementText.length > originalText.length
                                        ? `+${replacementText.length - originalText.length}`
                                        : replacementText.length < originalText.length
                                        ? replacementText.length - originalText.length
                                        : 0}
                                    </span>
                            </span>
                            <span>
                                {Math.round(
                                    (replacementText.length / originalText.length) * 100
                                )}% {t('notes.replacement.ofOriginal', 'of original')}
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleReject}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <X className="w-4 h-4" />
                        {t('common.reject', 'Reject')}
                    </Button>
                    <Button
                        onClick={handleAccept}
                        disabled={!replacementText || isLoading}
                        className="gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {t('common.accept', 'Apply Replacement')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Hook for managing replacement preview dialog state
 */
interface ReplacementPreviewState {
    isOpen: boolean;
    originalText: string;
    actionName: string;
    onGenerate: () => Promise<string>;
    onAccept: (replacementText: string) => void;
    onReject: () => void;
}

let previewState: ReplacementPreviewState | null = null;
const previewListeners = new Set<(state: ReplacementPreviewState | null) => void>();

function notifyPreviewListeners() {
    previewListeners.forEach((listener) => listener(previewState));
}

/**
 * Open the replacement preview dialog
 */
export function openReplacementPreview(options: Omit<ReplacementPreviewState, 'onAccept' | 'onReject'>) {
    previewState = {
        ...options,
        onAccept: (replacementText) => {
            // Will be called by dialog component
        },
        onReject: () => {
            // Will be called by dialog component
        },
    };
    notifyPreviewListeners();
}

/**
 * Close the replacement preview dialog
 */
export function closeReplacementPreview() {
    previewState = null;
    notifyPreviewListeners();
}

/**
 * Hook to use the replacement preview dialog
 */
export function useReplacementPreview() {
    const [state, setState] = useState<ReplacementPreviewState | null>(null);

    useState(() => {
        const listener = (newState: ReplacementPreviewState | null) => setState(newState);
        previewListeners.add(listener);
        return () => {
            previewListeners.delete(listener);
        };
    });

    const open = useCallback((options: Omit<ReplacementPreviewState, 'onAccept' | 'onReject'>) => {
        previewState = {
            ...options,
            onAccept: options.onAccept || (() => {}),
            onReject: options.onReject || (() => {}),
        };
        notifyPreviewListeners();
    }, []);

    const close = useCallback(() => {
        previewState = null;
        notifyPreviewListeners();
    }, []);

    return {
        isOpen: !!state,
        originalText: state?.originalText || '',
        actionName: state?.actionName || '',
        onGenerate: state?.onGenerate || (() => Promise.resolve('')),
        open,
        close,
    };
}

export default ReplacementPreviewDialog;
