import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Bot } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Checkbox } from '@/presentation/components/ui/checkbox';
import { useAIPromptStore } from '@/lib/notes/ai-prompt-store';
import { generateNoteContent, NoteAIError } from '@/lib/notes/note-ai-service';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import type { Block } from '@blocknote/core';

import { toast } from 'sonner';

export function AIPromptDialog() {
    const { t } = useTranslation();
    const { isOpen, closePrompt, editor } = useAIPromptStore();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [includeContext, setIncludeContext] = useState(true); // Default: include context

    // Get active agent info for display - SPECIFICALLY for Notes workspace
    const getAgentForWorkspace = useAgentSelectionStore(s => s.getAgentForWorkspace);

    // Derive the active agent for notes
    const activeAgent = getAgentForWorkspace('notes');

    // Get all note content as context blocks
    const getContextBlocks = (): Block[] => {
        if (!editor) return [];
        return editor.document;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !editor) return;

        setIsLoading(true);

        try {
            // Build options with or without context
            const options = includeContext ? { contextBlocks: getContextBlocks() } : undefined;
            const generatedContent = await generateNoteContent(prompt, options);

            // Insert the generated content
            const blocks = await editor.tryParseMarkdownToBlocks(generatedContent);
            editor.insertBlocks(blocks, editor.getTextCursorPosition().block, 'after');

            setPrompt('');
            closePrompt();
            toast.success(t('notes.ai.success', 'Content generated successfully'));
        } catch (error) {
            console.error('AI Generation failed:', error);

            // Handle specific error types
            if (error instanceof NoteAIError) {
                switch (error.code) {
                    case 'NO_AGENT':
                        toast.error(t('notes.ai.error.noAgent', 'Please select an AI agent first'));
                        break;
                    case 'NO_API_KEY':
                        toast.error(t('notes.ai.error.noApiKey', 'No API key configured. Please add your API key in Settings.'));
                        break;
                    case 'AGENT_NOT_FOUND':
                        toast.error(t('notes.ai.error.agentNotFound', 'Selected agent not found. Please select a different agent.'));
                        break;
                    case 'API_ERROR':
                        toast.error(t('notes.ai.error.apiError', 'AI service error. Please try again.'));
                        break;
                    default:
                        toast.error(t('notes.ai.error.generic', 'Failed to generate content'));
                }
            } else {
                toast.error(t('notes.ai.error.generic', 'Failed to generate content'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closePrompt();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t('notes.ai.title', 'AI Magic')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('notes.ai.description', 'Ask the AI to write, summarize, or explain something for you.')}
                    </DialogDescription>
                    {/* Show active agent */}
                    {activeAgent && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Bot className="w-4 h-4" />
                            <span>{t('notes.ai.usingAgent', 'Using')}: <strong>{activeAgent.name}</strong></span>
                        </div>
                    )}
                    {!activeAgent && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-amber-600 dark:text-amber-400">
                            <Bot className="w-4 h-4" />
                            <span>{t('notes.ai.noAgentSelected', 'No agent selected. Please select an agent.')}</span>
                        </div>
                    )}
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <Input
                            placeholder={t('notes.ai.promptPlaceholder', 'What would you like to generate?')}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />

                        {/* Include context checkbox */}
                        <Checkbox
                            id="include-context"
                            checked={includeContext}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncludeContext(e.target.checked)}
                            disabled={isLoading}
                            label={t('notes.ai.includeContext', 'Include note content as context')}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closePrompt} disabled={isLoading}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                        <Button type="submit" disabled={isLoading || !prompt.trim() || !activeAgent}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('notes.ai.generate', 'Generate')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
