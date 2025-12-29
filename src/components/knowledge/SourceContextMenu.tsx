/**
 * @fileoverview Source Context Menu Component
 * @module components/knowledge/SourceContextMenu
 * @governance EPIC-6-3
 *
 * Context menu for source management actions (rename, delete, move to collection, export).
 * Uses Radix UI Dropdown Menu for accessibility and keyboard navigation.
 */

import { MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SourceRecord } from '@/lib/state/dexie-db';
import { cn } from '@/lib/utils';

export interface SourceContextMenuProps {
    /** The source to manage */
    source: SourceRecord;

    /** Callback when rename is selected */
    onRename: (source: SourceRecord) => void;

    /** Callback when delete is selected */
    onDelete: (source: SourceRecord) => void;

    /** Callback when move to collection is selected */
    onMoveToCollection: (source: SourceRecord) => void;

    /** Callback when export is selected */
    onExport: (source: SourceRecord) => void;

    /** Whether the menu is disabled */
    disabled?: boolean;

    /** Custom className for trigger button */
    className?: string;
}

/**
 * SourceContextMenu Component
 *
 * Provides a dropdown menu with actions for managing a knowledge source.
 * Includes:
 * - Rename: Edit source title
 * - Delete: Remove source with undo
 * - Move to Collection: Add to existing collection
 * - Export: Download as PDF or text
 *
 * Features:
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Click outside to close
 * - Accessible ARIA attributes
 * - 8-bit design styling
 */
export function SourceContextMenu({
    source,
    onRename,
    onDelete,
    onMoveToCollection,
    onExport,
    disabled = false,
    className,
}: SourceContextMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex items-center justify-center w-6 h-6',
                        'hover:bg-surface-darker',
                        'transition-colors focus:outline-none',
                        'text-muted-foreground hover:text-foreground',
                        'rounded-none',
                        disabled && 'opacity-50 cursor-not-allowed',
                        className
                    )}
                    aria-label="More options"
                    disabled={disabled}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="w-48 rounded-none border border-border-dark bg-surface-dark shadow-pixel"
            >
                <DropdownMenuItem
                    onClick={() => onRename(source)}
                    className="rounded-none cursor-pointer"
                >
                    Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onDelete(source)}
                    className="rounded-none cursor-pointer text-destructive focus:text-destructive"
                >
                    Delete
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onMoveToCollection(source)}
                    className="rounded-none cursor-pointer"
                >
                    Move to Collection
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => onExport(source)}
                    className="rounded-none cursor-pointer"
                >
                    Export
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
