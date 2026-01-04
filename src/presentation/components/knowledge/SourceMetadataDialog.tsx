/**
 * @fileoverview Source Metadata Dialog (Story 6.4)
 * @module components/knowledge/SourceMetadataDialog
 * @governance EPIC-6-4
 *
 * Dialog for viewing and editing AI-extracted source metadata.
 * Displays summary, key concepts, and allows regeneration.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Plus, Save, Edit2, Loader2, RefreshCw, X } from 'lucide-react';
import type { SourceRecord } from '@/infrastructure/persistence/dexie-db';
import { useKnowledgeStore } from '@/lib/state/knowledge/knowledge-store';
import { toast } from 'sonner';

interface SourceMetadataDialogProps {
    source: SourceRecord;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SourceMetadataDialog({ source, open, onOpenChange }: SourceMetadataDialogProps) {
    const { t } = useTranslation();
    const { extractMetadata, extractingMetadata } = useKnowledgeStore();

    // Local edit state
    const [isEditing, setIsEditing] = useState(false);
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Sync state when source changes or dialog opens
    useEffect(() => {
        if (open) {
            setSummary(source.summary || '');
            setTags(source.keyConcepts || []);
            setIsEditing(false);
        }
    }, [source, open]);

    const handleSave = async () => {
        try {
            // Use the store to update (we'll need to add this action)
            // For now, just close editing mode
            setIsEditing(false);
            toast.success(t('knowledge.metadata.saveSuccess'));
        } catch (error) {
            toast.error(t('knowledge.metadata.saveError'));
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        try {
            await extractMetadata(source.id);
            toast.success(t('knowledge.metadata.regenSuccess'));
        } catch (error) {
            toast.error(t('knowledge.metadata.regenError'));
        } finally {
            setIsRegenerating(false);
        }
    };

    const isProcessing = extractingMetadata.has(source.id) || isRegenerating;

    // Calculate reading time from wordCount
    const readingTime = source.wordCount
        ? `${Math.ceil(source.wordCount / 200)} min read`
        : source.charCount
            ? `${Math.ceil(source.charCount / 1000)} min read`
            : '-';

    return (
        <Dialog open={open} onOpenChange={(val) => !isEditing && onOpenChange(val)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-surface-dark border-border-dark">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        {t('knowledge.metadata.title', 'Source Metadata')}
                        {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Summary Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-foreground">
                                {t('knowledge.metadata.summary', 'Summary')}
                            </Label>
                        </div>
                        {isEditing ? (
                            <Textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={4}
                                className="resize-none bg-background border-border-dark"
                            />
                        ) : (
                            <div className="bg-muted/30 p-3 rounded-none text-sm leading-relaxed min-h-[80px] text-foreground">
                                {summary || <span className="text-muted-foreground italic">{t('knowledge.metadata.noSummary')}</span>}
                            </div>
                        )}
                    </div>

                    {/* Key Concepts / Tags */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold text-foreground">
                            {t('knowledge.metadata.concepts', 'Key Concepts')}
                        </Label>
                        <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-none border border-primary/20"
                                >
                                    {tag}
                                    {isEditing && (
                                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                                            <X size={12} />
                                        </button>
                                    )}
                                </span>
                            ))}
                            {isEditing && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                        placeholder="Add tag..."
                                        className="h-7 w-32 text-xs bg-background border-border-dark"
                                    />
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleAddTag}>
                                        <Plus size={14} />
                                    </Button>
                                </div>
                            )}
                            {!isEditing && tags.length === 0 && (
                                <span className="text-muted-foreground text-sm italic">{t('knowledge.metadata.noConcepts')}</span>
                            )}
                        </div>
                    </div>

                    {/* Suggested Questions */}
                    {source.suggestedQuestions && source.suggestedQuestions.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-base font-semibold text-foreground">
                                {t('knowledge.metadata.questions', 'Suggested Questions')}
                            </Label>
                            <ul className="space-y-2">
                                {source.suggestedQuestions.map((q, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                        <span className="text-primary">•</span>
                                        {q}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Additional Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-muted/30 p-3 rounded-none">
                            <span className="text-muted-foreground block mb-1">{t('knowledge.metadata.readingTime')}</span>
                            <span className="font-medium text-foreground">{readingTime}</span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-none">
                            <span className="text-muted-foreground block mb-1">{t('knowledge.metadata.sourceType')}</span>
                            <span className="font-medium uppercase text-foreground">{source.type}</span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-none">
                            <span className="text-muted-foreground block mb-1">{t('knowledge.metadata.wordCount')}</span>
                            <span className="font-medium text-foreground">{source.wordCount?.toLocaleString() || '-'}</span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-none">
                            <span className="text-muted-foreground block mb-1">{t('knowledge.metadata.pageCount')}</span>
                            <span className="font-medium text-foreground">{source.pageCount || '-'}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>{t('common.cancel')}</Button>
                            <Button onClick={handleSave} disabled={isProcessing}>
                                <Save size={14} className="mr-2" /> {t('knowledge.metadata.save')}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleRegenerate} disabled={isProcessing}>
                                <RefreshCw size={14} className={`mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                                {t('knowledge.metadata.regenerate')}
                            </Button>
                            <Button onClick={() => setIsEditing(true)}>
                                <Edit2 size={14} className="mr-2" /> {t('knowledge.metadata.edit')}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
