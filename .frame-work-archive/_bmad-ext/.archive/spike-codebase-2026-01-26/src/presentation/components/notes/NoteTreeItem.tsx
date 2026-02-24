/**
 * @fileoverview Note Tree Item Component
 * @module components/notes/NoteTreeItem
 * @governance EPIC-26-5
 *
 * Individual tree item with expand/collapse toggle and favorite button.
 *
 * Story 26.5: Note Hierarchy & Sidebar Navigation
 */

import { useTranslation } from 'react-i18next';
import { ChevronRight, Star } from 'lucide-react';
import { useNoteNavigationStore } from '@/lib/notes/note-navigation-store';
import { useNoteStore } from '@/lib/notes/note-store';
import type { TreeNode } from '@/lib/notes/note-tree-utils';
import { TruncatedText } from '@/presentation/components/ui/truncated-text';

interface NoteTreeItemProps {
    node: TreeNode;
    isActive: boolean;
    onNoteSelect: (noteId: string) => void;
    level?: number;
    /** 45-04: Show project badge in browser mode */
    isBrowserMode?: boolean;
}

/**
 * Note tree item component
 *
 * Features:
 * - Expand/collapse toggle for nodes with children
 * - Favorite star button
 * - Keyboard navigation support
 * - Indentation based on level
 * - Active state highlighting
 */
export function NoteTreeItem({
    node,
    isActive,
    onNoteSelect,
    level = 0,
    isBrowserMode = false,
}: NoteTreeItemProps) {
    const { t } = useTranslation();
    const { toggleExpanded, expandedNodes } = useNoteNavigationStore();
    const { toggleFavorite } = useNoteStore();

    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const paddingLeft = `${level * 16 + 8}px`;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) {
            toggleExpanded(node.id);
        }
    };

    const handleFavoriteToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await toggleFavorite(node.id);
    };

    const handleClick = () => {
        onNoteSelect(node.id);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        } else if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
            e.preventDefault();
            toggleExpanded(node.id);
        } else if (e.key === 'ArrowLeft' && isExpanded) {
            e.preventDefault();
            toggleExpanded(node.id);
        }
    };

    return (
        <div>
            {/* Tree Item */}
            <div
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                role="treeitem"
                aria-expanded={hasChildren ? isExpanded : undefined}
                aria-selected={isActive}
                tabIndex={0}
                className={`
                    flex items-center gap-2 py-1.5 pr-2 cursor-pointer select-none min-w-0
                    ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'}
                    focus:outline-none focus:ring-1 focus:ring-primary
                `}
                style={{ paddingLeft }}
            >
                {/* Expand/Collapse Toggle */}
                {hasChildren ? (
                    <button
                        onClick={handleToggle}
                        className={`
                            flex-shrink-0 p-0.5 rounded hover:bg-accent/50
                            transition-transform duration-150
                            ${isExpanded ? 'rotate-90' : ''}
                        `}
                        aria-label={isExpanded ? t('notes.collapse', 'Collapse') : t('notes.expand', 'Expand')}
                    >
                        <ChevronRight size={14} />
                    </button>
                ) : (
                    <div className="w-5 flex-shrink-0" />
                )}

                {/* Emoji Icon */}
                <span className="text-lg flex-shrink-0">{node.note.emoji || '📄'}</span>

                {/* Title */}
                <TruncatedText text={node.note.title || t('notes.untitled', 'Untitled')} className="flex-1 text-sm font-mono" />

                {/* 45-04: Project Badge (browser mode only) */}
                {isBrowserMode && node.note.projectId && (
                    <span
                        className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono max-w-[60px] truncate"
                        title={`Project: ${node.note.projectId}`}
                    >
                        {node.note.projectId.split(':')[0] || node.note.projectId}
                    </span>
                )}

                {/* Favorite Star */}
                <button
                    onClick={handleFavoriteToggle}
                    className={`
                        flex-shrink-0 p-0.5 rounded hover:bg-accent/50 transition-colors
                        ${node.note.isFavorite ? 'text-warning fill-warning' : 'text-muted-foreground'}
                    `}
                    aria-label={node.note.isFavorite ? t('notes.unfavorite', 'Unfavorite') : t('notes.favorite', 'Favorite')}
                    aria-pressed={node.note.isFavorite}
                >
                    <Star size={14} />
                </button>
            </div>

            {/* Children (if expanded) */}
            {hasChildren && isExpanded && (
                <div role="group">
                    {node.children.map((child) => (
                        <NoteTreeItem
                            key={child.id}
                            node={child}
                            isActive={isActive}
                            onNoteSelect={onNoteSelect}
                            level={level + 1}
                            isBrowserMode={isBrowserMode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
