/**
 * @fileoverview Snippet Manager Component
 * @module presentation/components/snippets/SnippetManager
 * @governance S-031
 * @ai-observable true
 *
 * Snippet browser with folder tree view, search, and filtering.
 * Full-screen on mobile with 8-bit gaming style.
 *
 * Story S-031: Code Snippets Manager
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Folder, Tag, Code2, Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/presentation/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useSnippetStore, useFilteredSnippets, useSnippetFolders, useSnippetTags } from '@/lib/snippets/snippet-store';
import type { CodeSnippetRecord } from '@/infrastructure/persistence/dexie-db-snippet-types';
import { SnippetEditor } from './SnippetEditor';

interface SnippetManagerProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Callback when dialog open state changes */
    onOpenChange: (open: boolean) => void;
    /** Callback when a snippet is selected for insertion */
    onSnippetSelect: (snippet: CodeSnippetRecord) => void;
}

/**
 * Snippet Manager Dialog
 *
 * Features:
 * - Folder tree view
 * - Search by name, description, tags, language
 * - Filter by folder and tags
 * - Create/edit/delete snippets
 * - Mobile full-screen layout
 */
export function SnippetManager({ open, onOpenChange, onSnippetSelect }: SnippetManagerProps) {
    const { t } = useTranslation();
    const { isMobile } = useDeviceType();

    const searchQuery = useSnippetStore((s) => s.searchQuery);
    const selectedFolder = useSnippetStore((s) => s.selectedFolder);
    const selectedTags = useSnippetStore((s) => s.selectedTags);
    const setSearchQuery = useSnippetStore((s) => s.setSearchQuery);
    const setSelectedFolder = useSnippetStore((s) => s.setSelectedFolder);
    const setSelectedTags = useSnippetStore((s) => s.setSelectedTags);
    const clearFilters = useSnippetStore((s) => s.clearFilters);
    const loadSnippets = useSnippetStore((s) => s.loadSnippets);

    const snippets = useFilteredSnippets();
    const folders = useSnippetFolders();
    const tags = useSnippetTags();

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingSnippet, setEditingSnippet] = useState<CodeSnippetRecord | null>(null);

    // Load snippets on mount
    useEffect(() => {
        if (open) {
            loadSnippets();
        }
    }, [open, loadSnippets]);

    // Toggle folder expansion
    const toggleFolder = (folder: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folder)) {
                next.delete(folder);
            } else {
                next.add(folder);
            }
            return next;
        });
    };

    // Clear filters when dialog closes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            clearFilters();
        }
        onOpenChange(newOpen);
    };

    // Handle snippet selection
    const handleSnippetClick = (snippet: CodeSnippetRecord) => {
        onSnippetSelect(snippet);
        onOpenChange(false);
    };

    // Handle create new snippet
    const handleCreateSnippet = () => {
        setEditingSnippet(null);
        setIsEditorOpen(true);
    };

    // Handle edit snippet
    const handleEditSnippet = (snippet: CodeSnippetRecord) => {
        setEditingSnippet(snippet);
        setIsEditorOpen(true);
    };

    // Get snippets for selected folder (all if none selected)
    const visibleSnippets = useMemo(() => {
        if (!selectedFolder) return snippets;
        return snippets.filter((s) => s.folder === selectedFolder);
    }, [snippets, selectedFolder]);

    // Check if filters are active
    const hasActiveFilters = searchQuery.length > 0 || selectedFolder !== null || selectedTags.length > 0;

    return (
        <>
            <Dialog open={open && !isEditorOpen} onOpenChange={handleOpenChange}>
                <DialogContent
                    size="xl"
                    className={cn(
                        'flex flex-col p-0 gap-0',
                        isMobile && 'w-screen h-screen max-w-none max-h-none rounded-none'
                    )}
                >
                    {/* Header */}
                    <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-border">
                        <div className="flex items-center justify-between gap-4">
                            <DialogTitle className="flex items-center gap-2">
                                <Code2 className="w-5 h-5" />
                                {t('snippets.title', { defaultValue: 'Code Snippets' })}
                            </DialogTitle>

                            {/* Desktop: Create button */}
                            {!isMobile && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={handleCreateSnippet}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>{t('snippets.create', { defaultValue: 'New Snippet' })}</span>
                                </Button>
                            )}
                        </div>

                        {/* Search bar */}
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder={t('snippets.searchPlaceholder', {
                                    defaultValue: 'Search snippets...',
                                })}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-none border-2"
                            />
                        </div>
                    </DialogHeader>

                    {/* Content */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar: Folder tree and tags (desktop only) */}
                        {!isMobile && (
                            <div className="w-64 border-r-2 border-border p-4 overflow-y-auto">
                                {/* Folder tree */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Folder className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="font-semibold text-sm">
                                            {t('snippets.folders', { defaultValue: 'Folders' })}
                                        </h3>
                                    </div>

                                    <div className="space-y-1">
                                        <button
                                            onClick={() => setSelectedFolder(null)}
                                            className={cn(
                                                'w-full text-left px-2 py-1 text-sm rounded-md transition-colors',
                                                selectedFolder === null
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted'
                                            )}
                                        >
                                            {t('snippets.allFolders', { defaultValue: 'All Folders' })}
                                        </button>

                                        {folders.map((folder) => (
                                            <button
                                                key={folder}
                                                onClick={() => setSelectedFolder(folder)}
                                                className={cn(
                                                    'w-full text-left px-2 py-1 text-sm rounded-md transition-colors',
                                                    selectedFolder === folder
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-muted'
                                                )}
                                            >
                                                {folder}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Tag className="w-4 h-4 text-muted-foreground" />
                                        <h3 className="font-semibold text-sm">
                                            {t('snippets.tags', { defaultValue: 'Tags' })}
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {tags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const newTags = selectedTags.includes(tag)
                                                        ? selectedTags.filter((t) => t !== tag)
                                                        : [...selectedTags, tag];
                                                    setSelectedTags(newTags);
                                                }}
                                                className={cn(
                                                    'px-2 py-1 text-xs rounded-md border transition-colors',
                                                    selectedTags.includes(tag)
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'border-border hover:bg-muted'
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main content: Snippet list */}
                        <div className={cn(
                            'flex-1 overflow-y-auto',
                            isMobile ? 'p-4' : 'p-6'
                        )}>
                            {/* Active filters indicator */}
                            {hasActiveFilters && (
                                <div className="mb-4 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        {t('snippets.activeFilters', { defaultValue: 'Active filters' })}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-7 gap-1"
                                    >
                                        <X className="w-3 h-3" />
                                        <span>{t('common.clear', { defaultValue: 'Clear' })}</span>
                                    </Button>
                                </div>
                            )}

                            {/* Mobile: Filter dropdowns */}
                            {isMobile && (
                                <div className="mb-4 space-y-2">
                                    <select
                                        value={selectedFolder || ''}
                                        onChange={(e) => setSelectedFolder(e.target.value || null)}
                                        className="w-full px-3 py-2 text-sm rounded-none border-2 border-border bg-background"
                                    >
                                        <option value="">
                                            {t('snippets.allFolders', { defaultValue: 'All Folders' })}
                                        </option>
                                        {folders.map((folder) => (
                                            <option key={folder} value={folder}>
                                                {folder}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Snippet list */}
                            {visibleSnippets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                    <Code2 className="w-12 h-12 mb-4 opacity-50" />
                                    <p className="text-sm">
                                        {t('snippets.noSnippets', { defaultValue: 'No snippets found' })}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {visibleSnippets.map((snippet) => (
                                        <div
                                            key={snippet.id}
                                            className="border-2 border-border rounded-none p-3 hover:border-primary transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div
                                                    className="flex-1"
                                                    onClick={() => handleSnippetClick(snippet)}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm">{snippet.name}</h4>
                                                        <span className="px-1.5 py-0.5 text-xs bg-muted rounded-md">
                                                            {snippet.language}
                                                        </span>
                                                        {snippet.shortcut && (
                                                            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-md">
                                                                {snippet.shortcut}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {snippet.description && (
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            {snippet.description}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap gap-1">
                                                        <span className="text-xs text-muted-foreground">
                                                            {snippet.folder}
                                                        </span>
                                                        {snippet.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-1.5 py-0.5 text-xs bg-muted rounded-md"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {!snippet.isBuiltIn && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditSnippet(snippet);
                                                        }}
                                                        className="h-7 px-2"
                                                    >
                                                        {t('common.edit', { defaultValue: 'Edit' })}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Code preview */}
                                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                                <code>{snippet.code.slice(0, 200)}...</code>
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer: Mobile create button */}
                    {isMobile && (
                        <div className="p-4 border-t-2 border-border">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleCreateSnippet}
                                className="w-full min-h-[44px] gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>{t('snippets.create', { defaultValue: 'New Snippet' })}</span>
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Snippet Editor Dialog */}
            <SnippetEditor
                open={isEditorOpen}
                onOpenChange={setIsEditorOpen}
                snippet={editingSnippet}
            />
        </>
    );
}
