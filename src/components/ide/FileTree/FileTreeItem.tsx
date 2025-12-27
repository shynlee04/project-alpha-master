/**
 * @fileoverview FileTreeItem Component
 * Renders a single item in the file tree (file or folder)
 * 
 * @epic Epic-MRT Mobile Responsive Transformation
 * @story MRT-4 FileTree Mobile Adaptation
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2, Check, Clock, AlertTriangle } from 'lucide-react';
import { FileIcon } from './icons';
import type { FileTreeItemProps } from './types';
import { useSyncStatusStore } from '../../../lib/workspace';
import { isPathExcluded } from '../../../lib/filesystem/exclusion-config';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

/**
 * FileTreeItem - Renders a single file or folder in the tree
 */
export function FileTreeItem({
    node,
    depth,
    selectedPath,
    focusedPath,
    onSelect,
    onToggle,
    onContextMenu,
    onRetryFile,
    isExcluded = false,
}: FileTreeItemProps): React.JSX.Element {
    // MRT-4: Mobile responsive detection
    const { isMobile } = useDeviceType();

    const isSelected = selectedPath === node.path;
    const isFocused = focusedPath === node.path;
    const isDirectory = node.type === 'directory';
    const isExpanded = node.expanded ?? false;
    const isLoading = node.loading ?? false;

    const [isErrorDetailsOpen, setIsErrorDetailsOpen] = useState(false);
    // Story 27-1b: Migrated from TanStack Store to Zustand
    const fileSyncStatus = useSyncStatusStore((s) => s.statuses[node.path]);

    const isError = !isDirectory && fileSyncStatus?.state === 'error';
    const isPending = !isDirectory && fileSyncStatus?.state === 'pending';
    const isSynced = !isDirectory && fileSyncStatus?.state === 'synced';

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDirectory) {
            onToggle(node);
        } else {
            onSelect(node);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (isDirectory) {
                    onToggle(node);
                } else {
                    onSelect(node);
                }
                break;
            case 'ArrowRight':
            case 'ArrowLeft':
                if (isDirectory) {
                    e.preventDefault();
                    onToggle(node);
                }
                break;
            case 'Home':
            case 'End':
                e.preventDefault();
                break;
        }
    };

    const handleContextMenuEvent = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, node);
    };

    return (
        <div
            role="treeitem"
            aria-label={`${isDirectory ? 'Folder' : 'File'}: ${node.name}`}
            aria-selected={isSelected}
            aria-expanded={isDirectory ? isExpanded : undefined}
            aria-level={depth + 1}
            tabIndex={isFocused ? 0 : -1}
            className="outline-none"
            onClick={handleClick}
            onContextMenu={handleContextMenuEvent}
            onKeyDown={handleKeyDown}
        >
            <div
                className={cn(
                    // Base layout
                    'flex items-center gap-1 cursor-pointer select-none',
                    'text-sm transition-colors duration-75',
                    // MRT-4: Mobile touch targets (44px) vs Desktop compact (28px)
                    isMobile ? 'min-h-[44px] py-2 px-1' : 'h-7',
                    // MRT-4: Touch optimization for mobile
                    isMobile && 'touch-manipulation',
                    // Hover/selection states
                    'hover:bg-accent/50',
                    isExcluded ? 'text-muted-foreground opacity-60' : 'text-foreground',
                    isSelected && 'bg-primary/20 text-primary',
                    isFocused && 'outline outline-1 outline-primary/50 outline-offset-[-1px]'
                )}
                title={isExcluded ? 'Excluded from sync' : undefined}
            >
                {/* Chevron for directories - MRT-4: Larger touch area on mobile */}
                <div
                    className={cn(
                        'flex items-center justify-center shrink-0',
                        // MRT-4: 40x40 touch area on mobile, 16x16 on desktop
                        isMobile ? 'w-10 h-10 -ml-1' : 'w-4 h-4'
                    )}
                >
                    {isDirectory && (
                        isLoading ? (
                            <Loader2 size={isMobile ? 16 : 12} className="text-muted-foreground animate-spin" />
                        ) : isExpanded ? (
                            <ChevronDown size={isMobile ? 16 : 12} className="text-muted-foreground" />
                        ) : (
                            <ChevronRight size={isMobile ? 16 : 12} className="text-muted-foreground" />
                        )
                    )}
                </div>

                {/* File/Folder Icon */}
                <FileIcon
                    filename={node.name}
                    isDirectory={isDirectory}
                    isExpanded={isExpanded}
                    size={16}
                />

                {/* Name */}
                <span className="truncate">{node.name}</span>

                {/* Per-file sync status */}
                {!isDirectory && fileSyncStatus && (
                    <div className="ml-auto flex items-center gap-1 shrink-0">
                        {isSynced && (
                            <span title="Synced">
                                <Check size={14} className="text-emerald-400" />
                            </span>
                        )}

                        {isPending && (
                            <span title="Pending">
                                <Clock size={14} className="text-amber-400" />
                            </span>
                        )}

                        {isError && (
                            <button
                                type="button"
                                className="text-red-400 hover:text-red-300 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                                aria-label={fileSyncStatus.errorMessage || 'Sync error'}
                                title={fileSyncStatus.errorMessage || 'Sync error'}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setIsErrorDetailsOpen((prev) => !prev)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsErrorDetailsOpen((prev) => !prev);
                                    }
                                }}
                            >
                                <AlertTriangle size={14} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {isError && isErrorDetailsOpen && (
                <div
                    role="alert"
                    aria-live="polite"
                    aria-atomic="true"
                    className="pl-10 pr-3 py-2 text-xs text-foreground bg-card/60 border-b border-border/40"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-red-300 break-words">
                        {fileSyncStatus?.errorMessage ?? 'Unknown error'}
                    </div>
                    <div className="mt-2 flex items-center gap-2" role="group" aria-label="Error actions">
                        <button
                            type="button"
                            className="px-2 py-1 rounded bg-accent hover:bg-accent/80 text-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                            aria-label="Retry file sync"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onRetryFile?.(node.path)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRetryFile?.(node.path);
                                }
                            }}
                        >
                            Retry
                        </button>
                        <button
                            type="button"
                            className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring"
                            aria-label="Close error details"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setIsErrorDetailsOpen(false)
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsErrorDetailsOpen(false);
                                }
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {isDirectory && isExpanded && node.children && (
                <div role="group" className={cn(isMobile ? 'pl-2' : 'pl-3')}>
                    <FileTreeItemList
                        nodes={node.children}
                        depth={depth + 1}
                        selectedPath={selectedPath}
                        focusedPath={focusedPath}
                        onSelect={onSelect}
                        onToggle={onToggle}
                        onContextMenu={onContextMenu}
                        onRetryFile={onRetryFile}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * FileTreeItemList - Renders a list of tree items with their children
 */
interface FileTreeItemListProps {
    nodes: Array<import('./types').TreeNode>;
    depth: number;
    selectedPath?: string;
    focusedPath?: string;
    onSelect: (node: import('./types').TreeNode) => void;
    onToggle: (node: import('./types').TreeNode) => void;
    onContextMenu: (event: React.MouseEvent, node: import('./types').TreeNode) => void;
    onRetryFile?: (path: string) => void;
    /** Exclusion patterns to check against */
    exclusionPatterns?: string[];
}

export function FileTreeItemList({
    nodes,
    depth,
    selectedPath,
    focusedPath,
    onSelect,
    onToggle,
    onContextMenu,
    onRetryFile,
    exclusionPatterns = [],
}: FileTreeItemListProps): React.JSX.Element {
    // Sort: folders first, then files, both alphabetically
    const sortedNodes = [...nodes].sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });

    return (
        <>
            {sortedNodes.map((node) => (
                <FileTreeItem
                    key={node.path}
                    node={node}
                    depth={depth}
                    selectedPath={selectedPath}
                    focusedPath={focusedPath}
                    onSelect={onSelect}
                    onToggle={onToggle}
                    onContextMenu={onContextMenu}
                    onRetryFile={onRetryFile}
                    isExcluded={exclusionPatterns.length > 0 && isPathExcluded(node.path, exclusionPatterns)}
                />
            ))}
        </>
    );
}
