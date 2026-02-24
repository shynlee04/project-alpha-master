/**
 * @fileoverview AI Content Insertion Dialog
 * @module components/notes/AIInsertionDialog
 * @story EPIC-42-04 - Smart content insertion (replace/append)
 * 
 * Shows a preview of AI-generated content and lets user choose how to insert it.
 */

import { useTranslation } from 'react-i18next';
import { ArrowDown, Replace, ArrowUp, X, Sparkles, Settings2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Switch } from '@/presentation/components/ui/switch';
import { Label } from '@/presentation/components/ui/label';
import { ScrollArea } from '@/presentation/components/ui/scroll-area';
import { 
    useAIInsertionStore, 
    type InsertionMode 
} from '@/lib/notes/ai-insertion-store';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function AIInsertionDialog() {
    const { t } = useTranslation();
    const { 
        pendingContent, 
        isDialogOpen, 
        defaultMode,
        autoInsert,
        clearPendingContent, 
        executeInsertion,
        setDefaultMode,
        setAutoInsert,
    } = useAIInsertionStore();
    
    const [showSettings, setShowSettings] = useState(false);

    if (!pendingContent) {
        return null;
    }

    const handleInsert = (mode: InsertionMode) => {
        executeInsertion(mode);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            clearPendingContent();
        }
    };

    const insertionOptions: { mode: InsertionMode; icon: typeof ArrowDown; label: string; description: string }[] = [
        {
            mode: 'append',
            icon: ArrowDown,
            label: t('notes.ai.insertion.append', 'Insert Below'),
            description: t('notes.ai.insertion.appendDesc', 'Add content after current block'),
        },
        {
            mode: 'replace',
            icon: Replace,
            label: t('notes.ai.insertion.replace', 'Replace Block'),
            description: t('notes.ai.insertion.replaceDesc', 'Replace the current block'),
        },
        {
            mode: 'before',
            icon: ArrowUp,
            label: t('notes.ai.insertion.before', 'Insert Above'),
            description: t('notes.ai.insertion.beforeDesc', 'Add content before current block'),
        },
    ];

    return (
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        {t('notes.ai.contentReady', 'AI Content Ready')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('notes.ai.insertionPrompt', 'Choose how to insert the generated content.')}
                    </DialogDescription>
                </DialogHeader>

                {/* Content Preview */}
                <div className="border-2 border-border rounded-none bg-muted/30">
                    <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center justify-between">
                        <span className="text-sm font-medium">
                            {pendingContent.commandName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {pendingContent.blocks.length} {t('notes.ai.blocks', 'blocks')}
                        </span>
                    </div>
                    <ScrollArea className="max-h-48">
                        <pre className="p-3 text-sm text-foreground/80 whitespace-pre-wrap font-mono">
                            {pendingContent.rawContent.slice(0, 500)}
                            {pendingContent.rawContent.length > 500 && '...'}
                        </pre>
                    </ScrollArea>
                </div>

                {/* Insertion Options */}
                <div className="space-y-2">
                    {insertionOptions.map((option) => (
                        <Button
                            key={option.mode}
                            variant={defaultMode === option.mode ? 'primary' : 'outline'}
                            className={cn(
                                'w-full justify-start gap-3 h-auto py-3',
                                'border-2',
                                defaultMode === option.mode && 'ring-2 ring-primary ring-offset-1'
                            )}
                            onClick={() => handleInsert(option.mode)}
                        >
                            <option.icon className="w-5 h-5 shrink-0" />
                            <div className="flex flex-col items-start text-left">
                                <span className="font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground">
                                    {option.description}
                                </span>
                            </div>
                        </Button>
                    ))}
                </div>

                {/* Settings Toggle */}
                <div className="pt-2 border-t border-border">
                    <button
                        type="button"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings2 className="w-4 h-4" />
                        {t('notes.ai.insertionSettings', 'Settings')}
                    </button>
                    
                    {showSettings && (
                        <div className="mt-3 space-y-3 p-3 bg-muted/30 rounded-none border">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="auto-insert" className="text-sm">
                                    {t('notes.ai.autoInsert', 'Auto-insert without asking')}
                                </Label>
                                <Switch
                                    id="auto-insert"
                                    checked={autoInsert}
                                    onCheckedChange={setAutoInsert}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label className="text-sm">
                                    {t('notes.ai.defaultMode', 'Default mode')}
                                </Label>
                                <select
                                    className="px-2 py-1 text-sm bg-background border rounded-none"
                                    value={defaultMode}
                                    onChange={(e) => setDefaultMode(e.target.value as InsertionMode)}
                                >
                                    <option value="append">{t('notes.ai.insertion.append', 'Insert Below')}</option>
                                    <option value="replace">{t('notes.ai.insertion.replace', 'Replace Block')}</option>
                                    <option value="before">{t('notes.ai.insertion.before', 'Insert Above')}</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => handleInsert('cancel')}
                        className="gap-2"
                    >
                        <X className="w-4 h-4" />
                        {t('common.cancel', 'Cancel')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
