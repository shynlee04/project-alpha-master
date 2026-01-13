/**
 * @fileoverview AI Transform Menu for Text Selection
 * @module components/notes/AITransformMenu
 * @story NR-04 - Add Text Selection AI Transform
 * @story EPIC-42-07 - AI commands in transform bar
 * @story UX-16 - Replacement Modal with Preview
 * @created 2025-12-31
 * @updated 2026-01-13 - Added custom AI prompt in transform bar
 * @updated 2026-01-16 - Integrated replacement preview modal
 *
 * Floating menu that appears when text is selected in the editor.
 * Provides AI-powered text transformation actions with preview before applying.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Sparkles,
    Wand2,
    Shrink,
    Expand,
    Languages,
    FileText,
    Loader2,
    X,
    AlertCircle,
    MessageSquare,
    Send
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { generateNoteContent, NoteAIError } from '@/lib/notes/note-ai-service';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import { ReplacementPreviewDialog } from './ReplacementPreviewDialog';
import { toast } from 'sonner';
import type { BlockNoteEditor } from '@blocknote/core';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AITransformAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    prompt: (text: string) => string;
}

interface AITransformMenuProps {
    editor: BlockNoteEditor;
}

// ============================================================================
// Transform Actions
// ============================================================================

const createTransformActions = (t: (key: string, fallback: string) => string): AITransformAction[] => [
    {
        id: 'summarize',
        label: t('notes.ai.transform.summarize', 'Summarize'),
        icon: <Shrink className="w-4 h-4" />,
        prompt: (text) => `Summarize the following text concisely while preserving key information:\n\n${text}`,
    },
    {
        id: 'expand',
        label: t('notes.ai.transform.expand', 'Expand'),
        icon: <Expand className="w-4 h-4" />,
        prompt: (text) => `Expand on the following text with more detail and examples:\n\n${text}`,
    },
    {
        id: 'improve',
        label: t('notes.ai.transform.improve', 'Improve'),
        icon: <Wand2 className="w-4 h-4" />,
        prompt: (text) => `Improve the following text for clarity, grammar, and readability while keeping the same meaning:\n\n${text}`,
    },
    {
        id: 'explain',
        label: t('notes.ai.transform.explain', 'Explain'),
        icon: <FileText className="w-4 h-4" />,
        prompt: (text) => `Explain the following text in simple terms that anyone can understand:\n\n${text}`,
    },
    {
        id: 'translate',
        label: t('notes.ai.transform.translate', 'Translate'),
        icon: <Languages className="w-4 h-4" />,
        prompt: (text) => `Translate the following text to the opposite language (if English, translate to Vietnamese; if Vietnamese, translate to English):\n\n${text}`,
    },
];

// ============================================================================
// Component
// ============================================================================

export function AITransformMenu({ editor }: AITransformMenuProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [selectedText, setSelectedText] = useState('');
    // EPIC-42-07 & 42-08: Custom prompt input in transform bar
    const [showCustomPrompt, setShowCustomPrompt] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');

    // UX-16: Replacement preview dialog state
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

    // Ref to track the current transformation context (action + text)
    const transformContextRef = useRef<{
        action: AITransformAction | null;
        text: string;
        isCustomPrompt: boolean;
    }>({ action: null, text: '', isCustomPrompt: false });

    // TODO: EPIC-42-03 - Integrate block-level loading with transform actions
    // const { startBlockLoading, stopBlockLoading } = useAILoadingStore.getState();

    // Get active agent info - SPECIFICALLY for Notes workspace
    const getAgentForWorkspace = useAgentSelectionStore(s => s.getAgentForWorkspace);

    const hasAgent = !!getAgentForWorkspace('notes');

    const actions = createTransformActions(t);

    // Use BlockNote's onSelectionChange event for proper selection detection
    useEffect(() => {
        const checkSelection = () => {
            try {
                // Use getSelectedText() which is the proper BlockNote API
                const text = editor.getSelectedText();

                if (text && text.trim().length > 0) {
                    setSelectedText(text);
                    setIsOpen(true);
                } else {
                    setIsOpen(false);
                    setSelectedText('');
                }
            } catch (error) {
                // Editor might not be fully initialized
                console.debug('Selection check skipped:', error);
            }
        };

        // Use BlockNote's selection change event
        const unsubscribe = editor.onSelectionChange(() => {
            // Small delay to ensure selection is finalized
            setTimeout(checkSelection, 50);
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [editor]);

    const handleTransform = useCallback(async (action: AITransformAction) => {
        if (!selectedText.trim() || !hasAgent) return;

        // UX-16: Store transformation context and open preview dialog
        transformContextRef.current = {
            action,
            text: selectedText,
            isCustomPrompt: false,
        };
        setIsPreviewDialogOpen(true);
    }, [selectedText, hasAgent]);

    /**
     * UX-16: Generate replacement text for preview dialog
     */
    const handlePreviewGenerate = useCallback(async () => {
        const { action, text, isCustomPrompt } = transformContextRef.current;
        if (!text || !hasAgent || (!action && !isCustomPrompt)) {
            throw new Error('No transformation context available');
        }

        // For custom prompts, we need different handling
        if (isCustomPrompt) {
            const prompt = `${customPrompt}\n\nText to work with:\n${text}`;
            return await generateNoteContent(prompt);
        }

        // For predefined actions
        if (action) {
            const prompt = action.prompt(text);
            return await generateNoteContent(prompt);
        }

        throw new Error('No valid transformation available');
    }, [hasAgent, customPrompt]);

    /**
     * UX-16: Apply the replacement text to the editor
     */
    const applyReplacement = useCallback((replacementText: string) => {
        const selection = editor.getSelection();
        if (selection && selection.blocks.length > 0) {
            // Parse the result as blocks
            editor.tryParseMarkdownToBlocks(replacementText).then((newBlocks) => {
                if (newBlocks.length > 0) {
                    // Get the first selected block ID
                    const firstBlockId = selection.blocks[0].id;

                    // Insert new blocks after the first selected block
                    editor.insertBlocks(newBlocks, firstBlockId, 'after');

                    // Remove the original selected blocks
                    const blockIdsToRemove = selection.blocks.map(b => b.id);
                    editor.removeBlocks(blockIdsToRemove);
                }
            });
        }

        toast.success(t('notes.ai.transform.success', 'Text transformed successfully'));
        setIsOpen(false);
        setSelectedText('');
    }, [editor, t]);

    /**
     * UX-16: Handle accept from preview dialog
     */
    const handlePreviewAccept = useCallback((replacementText: string) => {
        applyReplacement(replacementText);
    }, [applyReplacement]);

    /**
     * UX-16: Handle reject from preview dialog
     */
    const handlePreviewReject = useCallback(() => {
        // Dialog will close via onOpenChange
        setIsPreviewDialogOpen(false);
    }, []);

    /**
     * EPIC-42-07 & 42-08: Custom prompt handler for inline quick prompt
     * UX-16: Now uses preview dialog instead of direct replacement
     */
    const handleCustomPrompt = useCallback(() => {
        if (!customPrompt.trim() || !selectedText.trim() || !hasAgent) return;

        // UX-16: Store transformation context and open preview dialog
        transformContextRef.current = {
            action: null,
            text: selectedText,
            isCustomPrompt: true,
        };
        setIsPreviewDialogOpen(true);
    }, [customPrompt, selectedText, hasAgent]);

    const handleCancel = () => {
        setIsOpen(false);
        setIsLoading(false);
        setLoadingAction(null);
        setSelectedText('');
        setShowCustomPrompt(false);
        setCustomPrompt('');
    };

    // Don't render if nothing is selected
    if (!isOpen || !selectedText.trim()) {
        return null;
    }

    return (
        <>
            <div className="ai-transform-menu fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="bg-popover border border-border rounded-lg shadow-lg p-2 flex items-center gap-1">
                    {/* AI indicator */}
                    <div className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground border-r border-border mr-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>{t('notes.ai.transform.title', 'AI Transform')}</span>
                    </div>

                    {/* Action buttons */}
                    {actions.map((action) => (
                        <Button
                            key={action.id}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 gap-1"
                            onClick={() => handleTransform(action)}
                            disabled={!hasAgent}
                            title={action.label}
                        >
                            {action.icon}
                            <span className="text-xs hidden sm:inline">{action.label}</span>
                        </Button>
                    ))}

                    {/* EPIC-42-07 & 42-08: Custom AI prompt input */}
                    {showCustomPrompt ? (
                        <div className="flex items-center gap-1 ml-1 border-l border-border pl-2">
                            <Input
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder={t('notes.ai.customPrompt.placeholder', 'What should AI do with this text?')}
                                className="h-7 w-48 text-xs"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleCustomPrompt();
                                    }
                                    if (e.key === 'Escape') {
                                        setShowCustomPrompt(false);
                                        setCustomPrompt('');
                                    }
                                }}
                                autoFocus
                            />
                            <Button
                                size="sm"
                                className="h-7 px-2"
                                onClick={handleCustomPrompt}
                                disabled={!customPrompt.trim() || !hasAgent}
                                title={t('notes.ai.customPrompt.send', 'Send')}
                            >
                                <Send className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => {
                                    setShowCustomPrompt(false);
                                    setCustomPrompt('');
                                }}
                                title={t('common.cancel', 'Cancel')}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-2 gap-1 ml-1 border-l border-border",
                                "hover:bg-primary/10 hover:text-primary"
                            )}
                            onClick={() => setShowCustomPrompt(true)}
                            disabled={!hasAgent}
                            title={t('notes.ai.customPrompt.title', 'Custom AI Command')}
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs hidden sm:inline">{t('notes.ai.custom', 'Custom')}</span>
                        </Button>
                    )}

                    {/* Cancel button - only show when not in custom prompt mode */}
                    {!showCustomPrompt && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            onClick={handleCancel}
                            title={t('common.cancel', 'Cancel')}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}

                    {/* No agent warning */}
                    {!hasAgent && (
                        <div className="flex items-center gap-1 px-2 text-xs text-warning">
                            <AlertCircle className="w-3 h-3" />
                            <span>{t('notes.ai.noAgentSelected', 'No agent')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* UX-16: Replacement preview dialog */}
            <ReplacementPreviewDialog
                open={isPreviewDialogOpen}
                onOpenChange={(open) => {
                    setIsPreviewDialogOpen(open);
                    // Clear custom prompt input when dialog closes
                    if (!open) {
                        setShowCustomPrompt(false);
                        setCustomPrompt('');
                    }
                }}
                originalText={transformContextRef.current.text}
                actionName={
                    transformContextRef.current.isCustomPrompt
                        ? t('notes.ai.customPrompt.title', 'Custom')
                        : transformContextRef.current.action?.label || ''
                }
                onGenerate={handlePreviewGenerate}
                onAccept={handlePreviewAccept}
                onReject={handlePreviewReject}
            />
        </>
    );
}

export default AITransformMenu;
