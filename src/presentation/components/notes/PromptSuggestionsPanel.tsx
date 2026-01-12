/**
 * @fileoverview AI Prompt Suggestions Panel
 * @module components/notes/PromptSuggestionsPanel
 * @created 2026-01-13
 * @story 43-04: AI prompt suggestion based on context
 *
 * Displays AI-suggested prompts based on note content analysis.
 * Users can click suggestions to execute them in the editor.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import {
    Sparkles,
    Brain,
    PenTool,
    ListTodo,
    FileQuestion,
    Loader2,
    RefreshCw,
    X,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { toast } from 'sonner';
import type { BlockNoteEditor } from '@blocknote/core';
import {
    usePromptSuggestionStore,
    type PromptSuggestion,
} from '@/lib/notes/prompt-suggestion-store';
import {
    generatePromptSuggestions,
    SUGGESTION_CATEGORIES,
    type SuggestionCategory,
} from '@/lib/notes/prompt-suggestion-service';
import { executeAICommand } from './AISlashCommand';

// ============================================================================
// Icon Map
// ============================================================================

const ICON_MAP: Record<SuggestionCategory, React.ComponentType<{ className?: string }>> = {
    analysis: Brain,
    writing: PenTool,
    productivity: ListTodo,
    improvement: Sparkles,
    question: FileQuestion,
};

// ============================================================================
// Props
// ============================================================================

interface PromptSuggestionsPanelProps {
    editor: BlockNoteEditor | null;
    noteContent: string;
    onExecute?: (prompt: string) => Promise<void>;
    className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function PromptSuggestionsPanel({
    editor,
    noteContent,
    onExecute,
    className = '',
}: PromptSuggestionsPanelProps) {
    const { t } = useTranslation();

    const {
        suggestions,
        isLoading,
        isEnabled,
        setSuggestions,
        setLoading,
        setEnabled,
    } = usePromptSuggestionStore(
        useShallow((state) => ({
            suggestions: state.suggestions,
            isLoading: state.isLoading,
            isEnabled: state.isEnabled,
            setSuggestions: state.setSuggestions,
            setLoading: state.setLoading,
            clearSuggestions: state.clearSuggestions,
            setEnabled: state.setEnabled,
        }))
    );

    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<SuggestionCategory | 'all'>('all');

    // Debounced content analysis
    useEffect(() => {
        if (!isEnabled || !noteContent || noteContent.trim().length < 50) {
            return;
        }

        const timeoutId = setTimeout(() => {
            generateSuggestions();
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timeoutId);
    }, [noteContent, isEnabled]);

    const generateSuggestions = async () => {
        if (!editor || !noteContent || !isEnabled) {
            return;
        }

        setLoading(true);
        try {
            const newSuggestions = await generatePromptSuggestions(noteContent, {
                maxSuggestions: 5,
                minConfidence: 50,
            });

            setSuggestions(newSuggestions);
        } catch (error) {
            console.error('[PromptSuggestionsPanel] Failed to generate suggestions:', error);
            // Don't show toast for expected errors (empty content, etc.)
            if (!(error as Error).message.includes('empty') &&
                !(error as Error).message.includes('short')) {
                toast.error('Failed to generate suggestions', {
                    description: (error as Error).message,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (noteContent && noteContent.trim().length >= 50) {
            generateSuggestions();
        } else {
            toast.error('Need more content', {
                description: 'Write at least 50 characters to get suggestions',
            });
        }
    };

    const handleSuggestionClick = async (suggestion: PromptSuggestion) => {
        if (!editor) {
            toast.error('Editor not available');
            return;
        }

        const handleExec = onExecute ||
            ((prompt: string) => executeAICommand(editor, prompt, suggestion.title));

        try {
            await handleExec(suggestion.suggestedPrompt);
            toast.success('Prompt executed', {
                description: suggestion.title,
            });
        } catch (error) {
            console.error('Failed to execute suggestion:', error);
        }
    };

    const toggleEnabled = () => {
        setEnabled(!isEnabled);
        if (!isEnabled && noteContent.trim().length >= 50) {
            generateSuggestions();
        }
    };

    // Filter suggestions by category
    const filteredSuggestions = selectedCategory === 'all'
        ? suggestions
        : suggestions.filter((s) => s.category === selectedCategory);

    return (
        <div className={`prompt-suggestions-panel border border-border rounded-none bg-background ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-muted rounded-sm"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronUp className="w-4 h-4" />
                        )}
                    </button>
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                        {t('notes.suggestions.title', 'AI Suggestions')}
                    </span>
                    {suggestions.length > 0 && !isLoading && (
                        <span className="px-1.5 py-0.5 text-xs font-mono bg-primary/10 text-primary rounded-sm">
                            {suggestions.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        title={t('notes.suggestions.refresh', 'Refresh suggestions')}
                    >
                        {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3 h-3" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 ${isEnabled ? 'text-green-500' : 'text-muted-foreground'}`}
                        onClick={toggleEnabled}
                        title={isEnabled
                            ? t('notes.suggestions.enabled', 'Suggestions enabled')
                            : t('notes.suggestions.disabled', 'Suggestions disabled')}
                    >
                        {isEnabled ? (
                            <Sparkles className="w-3 h-3" />
                        ) : (
                            <X className="w-3 h-3" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 space-y-3">
                    {/* Category Filter */}
                    {suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-2 py-1 text-xs font-mono rounded-none border-2 ${
                                    selectedCategory === 'all'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                                }`}
                            >
                                {t('common.all', 'All')}
                            </button>
                            {Object.entries(SUGGESTION_CATEGORIES).map(([catId, cat]) => (
                                <button
                                    key={catId}
                                    onClick={() => setSelectedCategory(catId as SuggestionCategory)}
                                    className={`px-2 py-1 text-xs font-mono rounded-none border-2 ${
                                        selectedCategory === catId
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-6 text-muted-foreground">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            <span className="text-sm">
                                {t('notes.suggestions.analyzing', 'Analyzing content...')}
                            </span>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && suggestions.length === 0 && isEnabled && (
                        <div className="text-center py-6 text-muted-foreground">
                            <Sparkles className="w-8 h-8 mx-auto opacity-20 mb-2" />
                            <p className="text-sm">
                                {t('notes.suggestions.empty', 'Write more content to get AI suggestions')}
                            </p>
                            <p className="text-xs mt-1">
                                {t('notes.suggestions.hint', 'Minimum 50 characters')}
                            </p>
                        </div>
                    )}

                    {!isLoading && !isEnabled && (
                        <div className="text-center py-6 text-muted-foreground">
                            <X className="w-8 h-8 mx-auto opacity-20 mb-2" />
                            <p className="text-sm">
                                {t('notes.suggestions.disabledMessage', 'AI suggestions are disabled')}
                            </p>
                        </div>
                    )}

                    {/* Suggestions List */}
                    {!isLoading && filteredSuggestions.length > 0 && (
                        <div className="space-y-2">
                            {filteredSuggestions.map((suggestion) => {
                                const Icon = ICON_MAP[suggestion.category];
                                return (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left p-2 border border-border hover:border-primary/50 hover:bg-accent/30 rounded-none transition-colors group"
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded-sm mt-0.5">
                                                <Icon className="w-3 h-3 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm flex items-center gap-2">
                                                    {suggestion.title}
                                                    <span className="text-[10px] px-1 py-0.5 bg-muted text-muted-foreground rounded-sm">
                                                        {suggestion.confidence}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {suggestion.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default PromptSuggestionsPanel;