/**
 * @fileoverview AI Transform Menu for Text Selection
 * @module components/notes/AITransformMenu
 * @story NR-04 - Add Text Selection AI Transform
 * @story EPIC-42-07 - AI commands in transform bar
 * @created 2025-12-31
 * @updated 2026-01-13 - Added custom AI prompt in transform bar
 * 
 * Floating menu that appears when text is selected in the editor.
 * Provides AI-powered text transformation actions.
 */

import { useState, useEffect, useCallback } from 'react';
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
// TODO: EPIC-42-03 - Integrate block-level loading with transform actions
// import { useAILoadingStore } from '@/lib/notes/ai-loading-store';
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

        setIsLoading(true);
        setLoadingAction(action.id);

        try {
            const prompt = action.prompt(selectedText);
            const result = await generateNoteContent(prompt);

            // Get current selection and replace with transformed content
            const selection = editor.getSelection();
            if (selection && selection.blocks.length > 0) {
                // Parse the result as blocks
                const newBlocks = await editor.tryParseMarkdownToBlocks(result);

                // Get the first and last selected block IDs
                const firstBlockId = selection.blocks[0].id;

                // Insert new blocks after the first selected block
                editor.insertBlocks(newBlocks, firstBlockId, 'after');

                // Remove the original selected blocks
                const blockIdsToRemove = selection.blocks.map(b => b.id);
                editor.removeBlocks(blockIdsToRemove);
            }

            toast.success(t('notes.ai.transform.success', 'Text transformed successfully'));
            setIsOpen(false);
            setSelectedText('');
        } catch (error) {
            console.error('Transform failed:', error);

            if (error instanceof NoteAIError) {
                switch (error.code) {
                    case 'NO_AGENT':
                        toast.error(t('notes.ai.error.noAgent', 'Please select an AI agent first'));
                        break;
                    case 'NO_API_KEY':
                        toast.error(t('notes.ai.error.noApiKey', 'No API key configured'));
                        break;
                    default:
                        toast.error(t('notes.ai.transform.error', 'Transform failed'));
                }
            } else {
                toast.error(t('notes.ai.transform.error', 'Transform failed'));
            }
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    }, [editor, selectedText, hasAgent, t]);

    /**
     * EPIC-42-07 & 42-08: Custom prompt handler for inline quick prompt
     * Allows users to enter a custom AI command directly in the transform bar
     */
    const handleCustomPrompt = useCallback(async () => {
        if (!customPrompt.trim() || !selectedText.trim() || !hasAgent) return;

        setIsLoading(true);
        setLoadingAction('custom');

        try {
            const prompt = `${customPrompt}\n\nText to work with:\n${selectedText}`;
            const result = await generateNoteContent(prompt);

            // Get current selection and replace with transformed content
            const selection = editor.getSelection();
            if (selection && selection.blocks.length > 0) {
                // Parse the result as blocks
                const newBlocks = await editor.tryParseMarkdownToBlocks(result);

                // Get the first selected block ID
                const firstBlockId = selection.blocks[0].id;

                // Insert new blocks after the first selected block
                editor.insertBlocks(newBlocks, firstBlockId, 'after');

                // Remove the original selected blocks
                const blockIdsToRemove = selection.blocks.map(b => b.id);
                editor.removeBlocks(blockIdsToRemove);
            }

            toast.success(t('notes.ai.customPrompt.success', 'Custom transform applied'));
            setIsOpen(false);
            setSelectedText('');
            setShowCustomPrompt(false);
            setCustomPrompt('');
        } catch (error) {
            console.error('Custom prompt transform failed:', error);

            if (error instanceof NoteAIError) {
                switch (error.code) {
                    case 'NO_AGENT':
                        toast.error(t('notes.ai.error.noAgent', 'Please select an AI agent first'));
                        break;
                    case 'NO_API_KEY':
                        toast.error(t('notes.ai.error.noApiKey', 'No API key configured'));
                        break;
                    default:
                        toast.error(t('notes.ai.customPrompt.error', 'Custom transform failed'));
                }
            } else {
                toast.error(t('notes.ai.customPrompt.error', 'Custom transform failed'));
            }
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    }, [editor, selectedText, customPrompt, hasAgent, t]);

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
                        disabled={isLoading || !hasAgent}
                        title={action.label}
                    >
                        {loadingAction === action.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            action.icon
                        )}
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
                            disabled={isLoading}
                        />
                        <Button
                            size="sm"
                            className="h-7 px-2"
                            onClick={handleCustomPrompt}
                            disabled={!customPrompt.trim() || isLoading || !hasAgent}
                            title={t('notes.ai.customPrompt.send', 'Send')}
                        >
                            {loadingAction === 'custom' ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Send className="w-3 h-3" />
                            )}
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
                        disabled={isLoading || !hasAgent}
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
    );
}

export default AITransformMenu;
