/**
 * @fileoverview Save Block Dialog - Save blocks to library for reuse
 * @module components/notes/SaveBlockDialog
 * @story UX-13 - Database Backed Blocks
 * @created 2026-01-16
 */

import { useState, useCallback } from 'react';
import type { Block } from '@blocknote/core';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Textarea } from '@/presentation/components/ui/textarea';
import { Badge } from '@/presentation/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/presentation/components/ui/select';
import { useSavedBlocksStore } from '@/lib/notes/saved-blocks-store';
import { createTemplateFromBlock, extractBlockType } from '@/lib/notes/saved-blocks-store';
import { toast } from 'sonner';
import { X, Star, Copy, Palette } from 'lucide-react';
import i18next from 'i18next';

// Translation helper
function t(key: string, defaultValue?: string): string {
    try {
        const result = i18next.t(key, { defaultValue });
        return typeof result === 'string' ? result : defaultValue || key;
    } catch {
        return defaultValue || key;
    }
}

// ============================================================================
// Types
// ============================================================================

export interface SaveBlockDialogProps {
    /** Block to save */
    block: Block;
    /** Whether dialog is open */
    open: boolean;
    /** Close dialog callback */
    onOpenChange: (open: boolean) => void;
    /** Optional initial name suggestion */
    suggestedName?: string;
}

// ============================================================================
// Default Categories (from saved-blocks-store)
// ============================================================================

const DEFAULT_CATEGORIES = [
    { id: 'writing', label: 'Writing' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'documentation', label: 'Documentation' },
    { id: 'technical', label: 'Technical' },
    { id: 'creative', label: 'Creative' },
];

// ============================================================================
// Component
// ============================================================================

export function SaveBlockDialog({
    block,
    open,
    onOpenChange,
    suggestedName = '',
}: SaveBlockDialogProps) {
    const [name, setName] = useState(suggestedName);
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('writing');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // UX-14: Template options
    const [isTemplate, setIsTemplate] = useState(false);
    const [templateIcon, setTemplateIcon] = useState<string>('file-text');
    const [templateColor, setTemplateColor] = useState<string>('default');

    const { saveBlock, saveAsTemplate } = useSavedBlocksStore();

    // Get block type for display
    const blockType = extractBlockType(block);

    // Reset form when dialog opens
    const handleOpenChange = useCallback((newOpen: boolean) => {
        if (!newOpen) {
            // Reset when closing
            setName(suggestedName);
            setDescription('');
            setSelectedCategory('writing');
            setTags([]);
            setTagInput('');
            setIsFavorite(false);
            // UX-14: Reset template options
            setIsTemplate(false);
            setTemplateIcon('file-text');
            setTemplateColor('default');
        }
        onOpenChange(newOpen);
    }, [onOpenChange, suggestedName]);

    // Add a tag
    const addTag = useCallback(() => {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput('');
    }, [tags, tagInput]);

    // Remove a tag
    const removeTag = useCallback((tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    }, [tags]);

    // Handle tag input keydown
    const handleTagKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    }, [addTag]);

    // Save the block
    const handleSave = useCallback(async () => {
        if (!name.trim()) {
            toast.error(t('notes.blocks.save.error.noName', 'Please enter a name for this block'));
            return;
        }

        setIsSaving(true);

        try {
            const template = createTemplateFromBlock(
                block,
                name.trim(),
                description.trim() || undefined,
                tags.length > 0 ? tags : undefined,
                selectedCategory
            );

            // UX-14: Use saveAsTemplate if isTemplate is true
            const id = isTemplate
                ? await saveAsTemplate(template, {
                    icon: templateIcon !== 'file-text' ? templateIcon : undefined,
                    color: templateColor !== 'default' ? templateColor : undefined,
                })
                : await saveBlock(template);

            // Set favorite state after saving
            if (isFavorite) {
                const { updateBlock } = useSavedBlocksStore.getState();
                await updateBlock(id, { isFavorite: true });
            }

            const successMsg = isTemplate
                ? t('notes.blocks.save.successTemplate', 'Template saved to library')
                : t('notes.blocks.save.success', 'Block saved to library');
            toast.success(successMsg);

            // Close dialog
            handleOpenChange(false);
        } catch (error) {
            console.error('[SaveBlockDialog] Failed to save block:', error);
            toast.error(t('notes.blocks.save.error.failed', 'Failed to save block'));
        } finally {
            setIsSaving(false);
        }
    }, [name, description, tags, selectedCategory, isFavorite, isTemplate, templateIcon, templateColor, block, saveBlock, saveAsTemplate, handleOpenChange]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('notes.blocks.save.title', 'Save Block to Library')}</DialogTitle>
                    <DialogDescription>
                        {t('notes.blocks.save.description', 'Save this block for reuse across your notes')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="block-name">{t('notes.blocks.save.name', 'Name')}</Label>
                        <Input
                            id="block-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('notes.blocks.save.namePlaceholder', 'My awesome block')}
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="block-description">
                            {t('notes.blocks.save.descriptionLabel', 'Description')} <span className="text-muted-foreground">({t('common.optional', 'optional')})</span>
                        </Label>
                        <Textarea
                            id="block-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('notes.blocks.save.descriptionPlaceholder', 'What is this block for?')}
                            rows={2}
                            maxLength={500}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>{t('notes.blocks.save.category', 'Category')}</Label>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_CATEGORIES.map((cat) => (
                                <Badge
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="block-tags">{t('notes.blocks.save.tags', 'Tags')}</Label>
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="gap-1">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </Badge>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                onBlur={addTag}
                                placeholder={t('notes.blocks.save.addTag', 'Add tag...')}
                                className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('notes.blocks.save.tagsHint', 'Press Enter or comma to add a tag')}
                        </p>
                    </div>

                    {/* Favorite Toggle */}
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant={isFavorite ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setIsFavorite(!isFavorite)}
                            className="gap-2"
                        >
                            <Star size={16} className={isFavorite ? 'fill-current' : ''} />
                            {isFavorite ? t('notes.blocks.save.favorited', 'Favorited') : t('notes.blocks.save.favorite', 'Add to favorites')}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {t('notes.blocks.save.favoriteHint', 'Favorite blocks appear first in the menu')}
                        </span>
                    </div>

                    {/* UX-14: Save as Template Toggle */}
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2 cursor-pointer">
                                <Copy size={16} />
                                {t('notes.blocks.save.templateLabel', 'Save as Template')}
                            </Label>
                            <Button
                                type="button"
                                variant={isTemplate ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setIsTemplate(!isTemplate)}
                            >
                                {isTemplate ? t('common.on', 'On') : t('common.off', 'Off')}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t('notes.blocks.save.templateHint', 'Templates are reusable blocks that appear in the Templates section of the slash menu')}
                        </p>

                        {isTemplate && (
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                {/* Template Icon */}
                                <div className="space-y-1">
                                    <Label className="text-xs">{t('notes.blocks.save.templateIcon', 'Icon')}</Label>
                                    <Select value={templateIcon} onValueChange={setTemplateIcon}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="file-text">FileText</SelectItem>
                                            <SelectItem value="heading">Heading</SelectItem>
                                            <SelectItem value="list">List</SelectItem>
                                            <SelectItem value="check-square">CheckSquare</SelectItem>
                                            <SelectItem value="info">Info</SelectItem>
                                            <SelectItem value="alert-circle">Alert</SelectItem>
                                            <SelectItem value="code">Code</SelectItem>
                                            <SelectItem value="image">Image</SelectItem>
                                            <SelectItem value="columns">Columns</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Template Color */}
                                <div className="space-y-1">
                                    <Label className="text-xs flex items-center gap-1">
                                        <Palette size={12} />
                                        {t('notes.blocks.save.templateColor', 'Color')}
                                    </Label>
                                    <Select value={templateColor} onValueChange={setTemplateColor}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-border" />
                                                    Default
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="blue">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                                                    Blue
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="green">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-green-500" />
                                                    Green
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="yellow">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                                                    Yellow
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="red">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-red-500" />
                                                    Red
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="purple">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                                                    Purple
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Block Type Info */}
                    <div className="text-xs text-muted-foreground">
                        {t('notes.blocks.save.type', 'Type')}: <span className="font-medium">{blockType}</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSaving}
                    >
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !name.trim()}
                    >
                        {isSaving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// Hook for managing save block dialog
// ============================================================================

interface SaveBlockDialogState {
    isOpen: boolean;
    block: Block | null;
    suggestedName: string;
}

let dialogState: SaveBlockDialogState = {
    isOpen: false,
    block: null,
    suggestedName: '',
};

const listeners = new Set<(state: SaveBlockDialogState) => void>();

function notifyListeners() {
    listeners.forEach(listener => listener({ ...dialogState }));
}

/**
 * Open the save block dialog
 */
export function openSaveBlockDialog(block: Block, suggestedName?: string): void {
    dialogState = {
        isOpen: true,
        block,
        suggestedName: suggestedName || '',
    };
    notifyListeners();
}

/**
 * Close the save block dialog
 */
export function closeSaveBlockDialog(): void {
    dialogState = {
        isOpen: false,
        block: null,
        suggestedName: '',
    };
    notifyListeners();
}

/**
 * Hook to use the save block dialog state
 */
export function useSaveBlockDialog(): SaveBlockDialogState & {
    close: () => void;
} {
    const [state, setState] = useState<SaveBlockDialogState>(dialogState);

    // Subscribe to changes
    useState(() => {
        const listener = (newState: SaveBlockDialogState) => setState(newState);
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    });

    return {
        ...state,
        close: closeSaveBlockDialog,
    };
}
