/**
 * @fileoverview Note Context Menu
 * @module presentation/components/notes/NoteContextMenu
 * @governance NR-08: Markdown Import/Export UI
 *
 * Context menu for note items with export, rename, delete, and favorite options.
 */

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { 
    MoreHorizontal, 
    Download, 
    Trash2, 
    Edit2, 
    Star, 
    StarOff,
    Copy,
    FolderInput,
    ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { useNoteStore } from '@/lib/notes/note-store';
import type { NoteRecord } from '@/infrastructure/persistence/dexie-db';

interface NoteContextMenuProps {
    note: NoteRecord;
    children: React.ReactNode;
    onExport?: (note: NoteRecord) => void;
    onImportInto?: (note: NoteRecord) => void;
    onOpenInEditor?: (note: NoteRecord) => void;
    className?: string;
}

export function NoteContextMenu({
    note,
    children,
    onExport,
    onImportInto,
    onOpenInEditor,
    className: _className,
}: NoteContextMenuProps) {
    const { t } = useTranslation();
    const { toggleFavorite, deleteNote, updateNote } = useNoteStore();
    const [isRenaming, setIsRenaming] = React.useState(false);
    const [newTitle, setNewTitle] = React.useState(note.title);

    const handleRename = async () => {
        if (newTitle.trim() && newTitle !== note.title) {
            await updateNote({ id: note.id, title: newTitle.trim() });
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRename();
        } else if (e.key === 'Escape') {
            setNewTitle(note.title);
            setIsRenaming(false);
        }
    };

    const handleExport = () => {
        onExport?.(note);
    };

    const handleDelete = () => {
        if (window.confirm(t('notes.deleteConfirm', 'Are you sure you want to delete this note?'))) {
            deleteNote(note.id);
        }
    };

    const handleToggleFavorite = () => {
        toggleFavorite(note.id);
    };

    const handleImportInto = () => {
        onImportInto?.(note);
    };

    const handleOpenInEditor = () => {
        onOpenInEditor?.(note);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent 
                align="end" 
                className="w-48"
                collisionPadding={8}
            >
                {isRenaming ? (
                    <div className="flex items-center gap-2 p-2">
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={handleKeyDown}
                            className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                        />
                    </div>
                ) : (
                    <>
                        {/* Primary Actions */}
                        <DropdownMenuItem onClick={handleOpenInEditor}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('notes.openInEditor', 'Open in Editor')}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            {t('notes.rename', 'Rename')}
                        </DropdownMenuItem>

                        {/* Export Section */}
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={handleExport}>
                            <Download className="w-4 h-4 mr-2" />
                            {t('notes.exportToFile', 'Export to File')}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handleImportInto}>
                            <FolderInput className="w-4 h-4 mr-2" />
                            {t('notes.importInto', 'Import into Folder')}
                        </DropdownMenuItem>

                        {/* Organization Section */}
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={handleToggleFavorite}>
                            {note.isFavorite ? (
                                <>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    {t('notes.removeFavorite', 'Remove from Favorites')}
                                </>
                            ) : (
                                <>
                                    <Star className="w-4 h-4 mr-2" />
                                    {t('notes.addFavorite', 'Add to Favorites')}
                                </>
                            )}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(note.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            {t('notes.copyId', 'Copy ID')}
                        </DropdownMenuItem>

                        {/* Danger Zone */}
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem 
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('notes.delete', 'Delete')}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ============================================================================
// Note List Item with Context Menu
// ============================================================================

interface NoteListItemProps {
    note: NoteRecord;
    isSelected?: boolean;
    onSelect?: (noteId: string) => void;
    onExport?: (note: NoteRecord) => void;
    onImportInto?: (note: NoteRecord) => void;
    onOpenInEditor?: (note: NoteRecord) => void;
}

export function NoteListItem({
    note,
    isSelected,
    onSelect,
    onExport,
    onImportInto,
    onOpenInEditor,
}: NoteListItemProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = React.useState(false);

    // Check if note has children (NoteRecord doesn't have children property, default to false)
    const hasChildren = false;
    const displayTitle = note.title || t('notes.untitled', 'Untitled');
    const formattedDate = note.updatedAt 
        ? new Date(note.updatedAt).toLocaleDateString()
        : '';

    return (
        <div 
            className={cn(
                'group flex items-center gap-1 px-2 py-1 rounded cursor-pointer',
                'hover:bg-accent/50 transition-colors duration-150',
                isSelected && 'bg-accent'
            )}
            onClick={() => onSelect?.(note.id)}
        >
            {/* Expand toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }}
                className={cn(
                    'p-0.5 rounded hover:bg-muted transition-colors',
                    !hasChildren && 'invisible group-hover:visible'
                )}
            >
                <MoreHorizontal 
                    className={cn(
                        'w-3 h-3 transition-transform duration-150',
                        expanded && 'rotate-90'
                    )} 
                />
            </button>

            {/* Note title */}
            <span className="flex-1 truncate text-sm">
                {displayTitle}
            </span>

            {/* Favorite indicator */}
            {note.isFavorite && (
                <Star className="w-3 h-3 text-amber-500" />
            )}

            {/* Date */}
            {formattedDate && (
                <span className="text-xs text-muted-foreground ml-auto">
                    {formattedDate}
                </span>
            )}

            {/* Context menu */}
            <NoteContextMenu
                note={note}
                onExport={onExport}
                onImportInto={onImportInto}
                onOpenInEditor={onOpenInEditor}
            >
                <button 
                    className={cn(
                        'opacity-0 group-hover:opacity-100 p-0.5 rounded',
                        'hover:bg-muted transition-all duration-150'
                    )}
                >
                    <MoreHorizontal className="w-3 h-3" />
                </button>
            </NoteContextMenu>
        </div>
    );
}
