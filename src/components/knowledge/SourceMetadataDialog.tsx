import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save, Edit2, Loader2, RefreshCw, X } from 'lucide-react';
import type { SourceRecord, SourceMetadata } from '@/lib/state/dexie-db';
import { useKnowledgeStore } from '@/lib/state/knowledge-store';
import { createMetadataExtractor } from '@/lib/knowledge/metadata-extractor';

interface SourceMetadataDialogProps {
    source: SourceRecord;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SourceMetadataDialog({ source, open, onOpenChange }: SourceMetadataDialogProps) {
    const { t } = useTranslation();
    const { updateSourceMetadata, updateProcessingStatus } = useKnowledgeStore();

    // Local edit state
    const [isEditing, setIsEditing] = useState(false);
    const [summary, setSummary] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Sync state when source changes or dialog opens
    useEffect(() => {
        if (source.metadata) {
            setSummary(source.metadata.summary || '');
            setTags(source.metadata.keyConcepts || []);
        } else {
            setSummary('');
            setTags([]);
        }
    }, [source, open]);

    const handleSave = async () => {
        const updatedMetadata: SourceMetadata = {
            ...source.metadata,
            summary,
            keyConcepts: tags,
        };
        await updateSourceMetadata(source.id, updatedMetadata);
        setIsEditing(false);
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
            await updateProcessingStatus(source.id, 'processing');
            const extractor = createMetadataExtractor();

            // Re-run basic stats
            const basicStats = extractor.extractBasicStats(source.content);

            if (extractor.isAvailable()) {
                const analysis = await extractor.generateAnalysis(source.content);
                await updateSourceMetadata(source.id, { ...basicStats, ...analysis });
            } else {
                await updateSourceMetadata(source.id, basicStats);
            }

            await updateProcessingStatus(source.id, 'completed');
        } catch (error) {
            console.error('Regeneration failed', error);
            await updateProcessingStatus(source.id, 'failed', (error as Error).message);
        } finally {
            setIsRegenerating(false);
        }
    };

    const isProcessing = source.processingStatus === 'processing' || isRegenerating;

    return (
        <Dialog open={open} onOpenChange={(val) => !isEditing && onOpenChange(val)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {t('knowledge.metadata.title', 'Source Metadata')}
                        {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Status Banner */}
                    {source.processingStatus === 'failed' && (
                        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                            Processing Failed: {source.processingError}
                        </div>
                    )}

                    {/* Summary Section */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">{t('knowledge.metadata.summary', 'Summary')}</Label>
                        </div>
                        {isEditing ? (
                            <Textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        ) : (
                            <div className="bg-muted/30 p-3 rounded-md text-sm leading-relaxed min-h-[80px]">
                                {summary || <span className="text-muted-foreground italic">No summary available.</span>}
                            </div>
                        )}
                    </div>

                    {/* Key Concepts / Tags */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">{t('knowledge.metadata.concepts', 'Key Concepts')}</Label>
                        <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                                    {tag}
                                    {isEditing && (
                                        <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                                            <X size={12} />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                            {isEditing && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                        placeholder="Add tag..."
                                        className="h-7 w-32 text-xs"
                                    />
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleAddTag}>
                                        <Plus size={14} />
                                    </Button>
                                </div>
                            )}
                            {!isEditing && tags.length === 0 && (
                                <span className="text-muted-foreground text-sm italic">No concepts extracted.</span>
                            )}
                        </div>
                    </div>

                    {/* Additional Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-muted/30 p-3 rounded-md">
                            <span className="text-muted-foreground block mb-1">Reading Time</span>
                            <span className="font-medium">{source.metadata?.readingTime || '-'}</span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-md">
                            <span className="text-muted-foreground block mb-1">Language</span>
                            <span className="font-medium uppercase">{source.metadata?.language || '-'}</span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-md">
                            <span className="text-muted-foreground block mb-1">Source Type</span>
                            <span className="font-medium uppercase">{source.type}</span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-md">
                            <span className="text-muted-foreground block mb-1">Word Count</span>
                            <span className="font-medium">{source.wordCount?.toLocaleString() || '-'}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isProcessing}>
                                <Save size={14} className="mr-2" /> Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleRegenerate} disabled={isProcessing}>
                                <RefreshCw size={14} className={`mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                                Regenerate
                            </Button>
                            <Button onClick={() => setIsEditing(true)}>
                                <Edit2 size={14} className="mr-2" /> Edit Metadata
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
