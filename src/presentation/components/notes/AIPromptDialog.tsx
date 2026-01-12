import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Bot, ChevronDown, FileText, ArrowUp, Ban, TextSelect, Eye, EyeOff, AlertTriangle } from 'lucide-react';
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
import { 
    useAIPromptStore, 
    CONTEXT_MODE_LABELS,
    type ContextMode 
} from '@/lib/notes/ai-prompt-store';
import { generateNoteContent, NoteAIError } from '@/lib/notes/note-ai-service';
import { useAgentSelectionStore } from '@/infrastructure/persistence/stores/agents/agent-selection-store';
import type { Block } from '@blocknote/core';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';

import { toast } from 'sonner';

export function AIPromptDialog() {
    const { t, i18n } = useTranslation();
    const { isOpen, closePrompt, editor, contextMode, setContextMode, hasSelection } = useAIPromptStore();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const locale = i18n.language?.startsWith('vi') ? 'vi' : 'en';

    // Get active agent info for display - SPECIFICALLY for Notes workspace
    const getAgentForWorkspace = useAgentSelectionStore(s => s.getAgentForWorkspace);

    // Derive the active agent for notes
    const activeAgent = getAgentForWorkspace('notes');

    // Get context based on current mode
    const getContextByMode = (): { text: string; blocks: Block[] | undefined } => {
        if (!editor) return { text: '', blocks: undefined };
        
        switch (contextMode) {
            case 'above_cursor': {
                try {
                    const cursorPosition = editor.getTextCursorPosition();
                    if (!cursorPosition?.block?.id) {
                        return { text: '', blocks: undefined };
                    }
                    const currentBlockId = cursorPosition.block.id;
                    const allBlocks = editor.document;
                    const currentIndex = allBlocks.findIndex(b => b.id === currentBlockId);
                    if (currentIndex <= 0) {
                        return { text: '', blocks: undefined };
                    }
                    const blocksAbove = allBlocks.slice(0, currentIndex);
                    const text = blocksAbove
                        .map(block => extractBlockText(block))
                        .filter(Boolean)
                        .join('\n\n');
                    return { text, blocks: blocksAbove };
                } catch {
                    return { text: '', blocks: undefined };
                }
            }
            case 'all': {
                const allBlocks = editor.document;
                const text = allBlocks
                    .map(block => extractBlockText(block))
                    .filter(Boolean)
                    .join('\n\n');
                return { text, blocks: allBlocks };
            }
            case 'selection': {
                const selectedText = editor.getSelectedText?.() || '';
                return { text: selectedText, blocks: undefined };
            }
            case 'none':
            default:
                return { text: '', blocks: undefined };
        }
    };

    // Helper to extract text from a block
    const extractBlockText = (block: Block): string => {
        if (!block.content) return '';
        if (Array.isArray(block.content)) {
            return block.content
                .map(item => {
                    if (typeof item === 'object' && item !== null && 'text' in item) {
                        return (item as { text: string }).text;
                    }
                    return '';
                })
                .join('');
        }
        return '';
    };

    // Get icon for context mode
    const getContextModeIcon = (mode: ContextMode) => {
        switch (mode) {
            case 'above_cursor': return <ArrowUp className="w-4 h-4" />;
            case 'all': return <FileText className="w-4 h-4" />;
            case 'selection': return <TextSelect className="w-4 h-4" />;
            case 'none': return <Ban className="w-4 h-4" />;
        }
    };

    // EPIC-42-09: Memoized context preview computation
    const contextPreview = useMemo(() => {
        const context = getContextByMode();
        const text = context.text || '';
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const blockCount = context.blocks?.length || 0;
        
        // Truncate preview if too long (max 500 chars)
        const maxPreviewLength = 500;
        const truncatedText = text.length > maxPreviewLength 
            ? text.slice(0, maxPreviewLength) + '...' 
            : text;
        
        // Token estimation (rough: ~4 chars per token)
        const estimatedTokens = Math.ceil(charCount / 4);
        
        // Warning thresholds
        const isLarge = charCount > 2000;
        const isVeryLarge = charCount > 5000;
        
        return {
            text: truncatedText,
            fullText: text,
            charCount,
            wordCount,
            blockCount,
            estimatedTokens,
            isLarge,
            isVeryLarge,
            isEmpty: charCount === 0,
        };
    }, [editor, contextMode]);
    // Note: getContextByMode depends on editor and contextMode, so we add them as deps

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !editor) return;

        setIsLoading(true);

        try {
            // Get context based on selected mode
            const context = getContextByMode();
            
            // Build full prompt with context if available
            let fullPrompt = prompt;
            if (context.text && context.text.trim().length > 0) {
                fullPrompt = `${prompt}\n\n---\nContext from note:\n${context.text}`;
            }
            
            // Build options
            const options = context.blocks ? { contextBlocks: context.blocks } : undefined;
            const generatedContent = await generateNoteContent(fullPrompt, options);

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

                        {/* Context mode selector - EPIC-42-02 */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {t('notes.ai.context', 'Context')}:
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 gap-2"
                                        disabled={isLoading}
                                    >
                                        {getContextModeIcon(contextMode)}
                                        <span className="text-sm">
                                            {CONTEXT_MODE_LABELS[contextMode][locale]}
                                        </span>
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64">
                                    <DropdownMenuRadioGroup 
                                        value={contextMode} 
                                        onValueChange={(value) => setContextMode(value as ContextMode)}
                                    >
                                        <DropdownMenuRadioItem value="above_cursor" className="flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <ArrowUp className="w-4 h-4" />
                                                <span>{CONTEXT_MODE_LABELS.above_cursor[locale]}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground pl-6">
                                                {CONTEXT_MODE_LABELS.above_cursor.description[locale]}
                                            </span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="all" className="flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                <span>{CONTEXT_MODE_LABELS.all[locale]}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground pl-6">
                                                {CONTEXT_MODE_LABELS.all.description[locale]}
                                            </span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem 
                                            value="selection" 
                                            className="flex-col items-start gap-1"
                                            disabled={!hasSelection}
                                        >
                                            <div className="flex items-center gap-2">
                                                <TextSelect className="w-4 h-4" />
                                                <span>{CONTEXT_MODE_LABELS.selection[locale]}</span>
                                                {!hasSelection && (
                                                    <span className="text-xs text-muted-foreground">(no selection)</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground pl-6">
                                                {CONTEXT_MODE_LABELS.selection.description[locale]}
                                            </span>
                                        </DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="none" className="flex-col items-start gap-1">
                                            <div className="flex items-center gap-2">
                                                <Ban className="w-4 h-4" />
                                                <span>{CONTEXT_MODE_LABELS.none[locale]}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground pl-6">
                                                {CONTEXT_MODE_LABELS.none.description[locale]}
                                            </span>
                                        </DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {/* EPIC-42-09: Context preview toggle button */}
                            {contextMode !== 'none' && !contextPreview.isEmpty && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    {showPreview ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                    <span className="text-xs">
                                        {showPreview 
                                            ? t('notes.ai.hidePreview', 'Hide') 
                                            : t('notes.ai.showPreview', 'Preview')
                                        }
                                    </span>
                                </Button>
                            )}
                        </div>

                        {/* EPIC-42-09: Context preview panel */}
                        {contextMode !== 'none' && (
                            <div className="space-y-2">
                                {/* Context stats bar */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {contextPreview.isEmpty ? (
                                        <span className="text-amber-600 dark:text-amber-400">
                                            {t('notes.ai.noContextAvailable', 'No context available for this mode')}
                                        </span>
                                    ) : (
                                        <>
                                            <span>{contextPreview.wordCount} {t('notes.ai.words', 'words')}</span>
                                            <span className="text-muted-foreground/50">•</span>
                                            <span>{contextPreview.charCount} {t('notes.ai.chars', 'chars')}</span>
                                            <span className="text-muted-foreground/50">•</span>
                                            <span>~{contextPreview.estimatedTokens} {t('notes.ai.tokens', 'tokens')}</span>
                                            {contextPreview.blockCount > 0 && (
                                                <>
                                                    <span className="text-muted-foreground/50">•</span>
                                                    <span>{contextPreview.blockCount} {t('notes.ai.blocks', 'blocks')}</span>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Large context warning */}
                                {contextPreview.isVeryLarge && (
                                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        <span>{t('notes.ai.veryLargeContext', 'Very large context may increase cost and response time')}</span>
                                    </div>
                                )}
                                {contextPreview.isLarge && !contextPreview.isVeryLarge && (
                                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                        <FileText className="w-3 h-3" />
                                        <span>{t('notes.ai.largeContext', 'Large context - may take longer to process')}</span>
                                    </div>
                                )}

                                {/* Collapsible preview content */}
                                {showPreview && !contextPreview.isEmpty && (
                                    <div className="border border-border rounded-md p-2 bg-muted/30 max-h-32 overflow-y-auto">
                                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words font-mono">
                                            {contextPreview.text}
                                        </pre>
                                        {contextPreview.text !== contextPreview.fullText && (
                                            <div className="text-xs text-muted-foreground/60 mt-1 italic">
                                                ... {t('notes.ai.truncatedPreview', 'Preview truncated')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
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
