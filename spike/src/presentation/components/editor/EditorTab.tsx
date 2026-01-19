/**
 * Editor Tab Component
 *
 * Individual tab with drag-drop, context menu, and file icon.
 * Supports desktop and mobile interactions.
 *
 * @module components/editor/EditorTab
 * @story S-030 - Multi-Tab File Editor
 */

import { useCallback, useState } from 'react';
import { X, Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EditorTab as EditorTabType } from '@/infrastructure/persistence/stores/editor-tabs-store';
import { FileIcon } from '@/presentation/components/ide/FileTree/icons';
import { getDisplayFilename } from '@/lib/editor/tab-manager';

// ============================================================================
// Props
// ============================================================================

export interface EditorTabProps {
    /** Tab data */
    tab: EditorTabType;
    /** Whether this tab is active */
    isActive: boolean;
    /** Tab click handler */
    onClick: (path: string) => void;
    /** Tab close handler */
    onClose: (path: string) => void;
    /** Tab pin toggle handler */
    onTogglePin: (path: string) => void;
    /** Context menu action handler */
    onContextMenuAction: (action: string, tab: EditorTabType) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Individual editor tab with drag-drop and context menu
 */
export function EditorTab({
    tab,
    isActive,
    onClick,
    onClose,
    onTogglePin: _onTogglePin,
    onContextMenuAction,
}: EditorTabProps) {
    const { t } = useTranslation();
    const [showContextMenu, setShowContextMenu] = useState(false);

    // DnD Kit sortable hook
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: tab.path,
        disabled: tab.isPinned, // Pinned tabs can't be moved
    });

    // Calculate drag styles
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // Handle tab click
    const handleClick = useCallback(() => {
        onClick(tab.path);
    }, [tab.path, onClick]);

    // Handle close button click
    const handleClose = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onClose(tab.path);
    }, [tab.path, onClose]);

    // Handle middle-click (close tab)
    const handleMiddleClick = useCallback((e: React.MouseEvent) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            onClose(tab.path);
        }
    }, [tab.path, onClose]);

    // Handle context menu
    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowContextMenu(true);
    }, []);

    // Handle context menu action
    const handleMenuAction = useCallback((action: string) => {
        setShowContextMenu(false);
        onContextMenuAction(action, tab);
    }, [tab, onContextMenuAction]);

    // Close context menu when clicking outside
    const handleCloseContextMenu = useCallback(() => {
        setShowContextMenu(false);
    }, []);

    // Truncate filename for display
    const displayName = getDisplayFilename(tab.path);

    // Tab styles
    const tabClasses = [
        'group flex items-center gap-2 h-full px-3 cursor-pointer',
        'border-r border-border min-w-[120px] max-w-[200px]',
        'transition-colors select-none',
        isActive
            ? 'bg-accent text-foreground border-t-2 border-t-primary'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
        tab.isPinned ? 'opacity-90' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={tabClasses}
                onClick={handleClick}
                onMouseUp={handleMiddleClick}
                onContextMenu={handleContextMenu}
                title={`${tab.path}${tab.isDirty ? ' •' : ''}`}
                {...attributes}
                {...listeners}
            >
                {/* Pin icon (for pinned tabs) */}
                {tab.isPinned && (
                    <Pin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                )}

                {/* File icon */}
                <FileIcon
                    filename={displayName}
                    isDirectory={false}
                    size={14}
                    className="flex-shrink-0"
                />

                {/* File name */}
                <span className="truncate text-sm">{displayName}</span>

                {/* Modified indicator */}
                {tab.isDirty && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}

                {/* Close button */}
                <button
                    className={`
                        p-0.5 rounded hover:bg-muted flex-shrink-0
                        ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        transition-opacity
                    `}
                    onClick={handleClose}
                    title={t('editor.closeTab', 'Close tab')}
                    type="button"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Context Menu */}
            {showContextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-50"
                        onClick={handleCloseContextMenu}
                    />
                    <div className="absolute z-50 min-w-[180px] bg-popover border border-border rounded-md shadow-md py-1">
                        {/* Pin/Unpin */}
                        {!tab.isPinned && (
                            <button
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
                                onClick={() => handleMenuAction('pin')}
                                type="button"
                            >
                                <Pin className="w-4 h-4" />
                                {t('editor.pinTab', 'Pin Tab')}
                            </button>
                        )}
                        {tab.isPinned && (
                            <button
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
                                onClick={() => handleMenuAction('unpin')}
                                type="button"
                            >
                                <Pin className="w-4 h-4" />
                                {t('editor.unpinTab', 'Unpin Tab')}
                            </button>
                        )}

                        <div className="h-px bg-border my-1" />

                        {/* Close (if not pinned) */}
                        {!tab.isPinned && (
                            <button
                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent flex items-center gap-2"
                                onClick={() => handleMenuAction('close')}
                                type="button"
                            >
                                <X className="w-4 h-4" />
                                {t('editor.close', 'Close')}
                            </button>
                        )}

                        {/* Close Others */}
                        <button
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                            onClick={() => handleMenuAction('close-others')}
                            type="button"
                        >
                            {t('editor.closeOthers', 'Close Others')}
                        </button>

                        {/* Close Saved */}
                        <button
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                            onClick={() => handleMenuAction('close-saved')}
                            type="button"
                        >
                            {t('editor.closeSaved', 'Close Saved')}
                        </button>

                        <div className="h-px bg-border my-1" />

                        {/* Copy Path */}
                        <button
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                            onClick={() => handleMenuAction('copy-path')}
                            type="button"
                        >
                            {t('editor.copyPath', 'Copy Path')}
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
