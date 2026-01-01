/**
 * @fileoverview AI Transform Menu for Text Selection
 * @module components/notes/AITransformMenu
 * @story NR-04 - Add Text Selection AI Transform
 * @created 2025-12-31
 * @updated 2026-01-01 - Fixed selection detection using BlockNote API
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
    AlertCircle
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { generateNoteContent, NoteAIError } from '@/lib/notes/note-ai-service';
import { useAgentsStore } from '@/infrastructure/persistence/stores/agents';
import { toast } from 'sonner';
import type { BlockNoteEditor } from '@blocknote/core';

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

    // Use individual selectors to avoid infinite re-renders
    const activeAgentId = useAgentsStore(s => s.activeAgentId)
    const getAgent = useAgentsStore(s => s.getAgent)
    const hasAgent = activeAgentId && getAgent(activeAgentId);

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

    const handleCancel = () => {
        setIsOpen(false);
        setIsLoading(false);
        setLoadingAction(null);
        setSelectedText('');
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

                {/* Cancel button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 ml-1 border-l border-border"
                    onClick={handleCancel}
                    title={t('common.cancel', 'Cancel')}
                >
                    <X className="w-4 h-4" />
                </Button>

                {/* No agent warning */}
                {!hasAgent && (
                    <div className="flex items-center gap-1 px-2 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>{t('notes.ai.noAgentSelected', 'No agent')}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AITransformMenu;
