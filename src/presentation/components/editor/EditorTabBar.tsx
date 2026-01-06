/**
 * Editor Tab Bar Component
 *
 * Multi-tab interface with drag-drop reordering, context menu,
 * and keyboard shortcuts. Supports desktop and mobile layouts.
 *
 * @module components/editor/EditorTabBar
 * @story S-030 - Multi-Tab File Editor
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useEditorTabs } from '@/hooks/useEditorTabs';
import { EditorTab } from './EditorTab';
import { shouldShowScroll, calculateNewOrder, isContextMenuActionAvailable } from '@/lib/editor/tab-manager';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { EditorTab as EditorTabType } from '@/infrastructure/persistence/stores/editor-tabs-store';

// ============================================================================
// Props
// ============================================================================

export interface EditorTabBarProps {
    /** Optional: Override active tab from store */
    activeFilePath?: string | null;
    /** Optional: Override tab click handler */
    onTabClick?: (path: string) => void;
    /** Optional: Override tab close handler */
    onTabClose?: (path: string) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Tab bar with drag-drop reordering, context menu, and mobile support
 */
export function EditorTabBar({
    activeFilePath,
    onTabClick,
    onTabClose,
}: EditorTabBarProps) {
    const { t } = useTranslation();
    const { isMobile } = useMediaQuery();

    // Get tab state and actions
    const {
        tabs,
        activeTab,
        switchTab,
        closeTab,
        closeAllTabs,
        closeOtherTabs,
        closeSavedTabs,
        togglePinTab,
        reorderTabs,
    } = useEditorTabs();

    // Use provided overrides or store defaults
    const activePath = activeFilePath ?? activeTab?.path ?? null;
    const handleTabClick = onTabClick ?? switchTab;
    const handleTabClose = onTabClose ?? closeTab;

    // DnD sensors (configure drag behavior)
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px drag threshold to prevent accidental drags
            },
        })
    );

    // Handle drag end event
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const fromPath = active.id as string;
        const toPath = over.id as string;

        if (fromPath === toPath) return;

        // Reorder tabs in store
        reorderTabs(fromPath, toPath);
    }, [reorderTabs]);

    // Handle context menu action
    const handleContextMenuAction = useCallback((action: string, tab: EditorTabType) => {
        switch (action) {
            case 'close':
                handleTabClose(tab.path);
                break;

            case 'close-others':
                closeOtherTabs(tab.path);
                break;

            case 'close-saved':
                closeSavedTabs();
                break;

            case 'close-all':
                closeAllTabs();
                break;

            case 'pin':
            case 'unpin':
                togglePinTab(tab.path);
                break;

            case 'copy-path':
                // Copy to clipboard
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(tab.path);
                    console.log('[EditorTabBar] Copied path:', tab.path);
                }
                break;

            case 'reveal-in-finder':
                // Reveal in Finder (would need IPC/bridge)
                console.log('[EditorTabBar] Reveal in Finder:', tab.path);
                break;

            default:
                console.warn('[EditorTabBar] Unknown context menu action:', action);
        }
    }, [handleTabClose, closeOtherTabs, closeSavedTabs, closeAllTabs, togglePinTab]);

    // Check if tabs should show scroll
    const showScroll = useMemo(() => {
        return shouldShowScroll(tabs.length);
    }, [tabs.length]);

    // Mobile: Bottom tab bar (iOS style)
    if (isMobile) {
        return (
            <div className="h-12 bg-card border-t border-border flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
                {tabs.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                            {t('editor.noFilesOpen', 'No files open')}
                        </span>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tabs.map(t => t.path)}
                            strategy={horizontalListSortingStrategy}
                        >
                            <div className="flex items-stretch h-full">
                                {tabs.map((tab) => (
                                    <EditorTab
                                        key={tab.path}
                                        tab={tab}
                                        isActive={tab.path === activePath}
                                        onClick={handleTabClick}
                                        onClose={handleTabClose}
                                        onTogglePin={togglePinTab}
                                        onContextMenuAction={handleContextMenuAction}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        );
    }

    // Desktop: Top tab bar
    return (
        <div className="h-9 bg-card border-b border-border flex items-center">
            {tabs.length === 0 ? (
                <div className="flex-1 flex items-center px-2">
                    <span className="text-xs text-muted-foreground">
                        {t('editor.noFilesOpen', 'No files open')}
                    </span>
                </div>
            ) : (
                <div
                    className={`
                        flex items-stretch h-full overflow-x-auto
                        scrollbar-thin scrollbar-thumb-muted
                        ${showScroll ? 'scrollbar-thin' : ''}
                    `}
                >
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={tabs.map(t => t.path)}
                            strategy={horizontalListSortingStrategy}
                        >
                            {tabs.map((tab) => (
                                <EditorTab
                                    key={tab.path}
                                    tab={tab}
                                    isActive={tab.path === activePath}
                                    onClick={handleTabClick}
                                    onClose={handleTabClose}
                                    onTogglePin={togglePinTab}
                                    onContextMenuAction={handleContextMenuAction}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}

            {/* Tab count indicator (if scrollable) */}
            {showScroll && (
                <div className="px-2 text-xs text-muted-foreground border-l border-border">
                    {tabs.length}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// Re-exports for backward compatibility
// ============================================================================

/**
 * @deprecated Use EditorTab component instead
 */
export interface OpenFile {
    path: string;
    content: string;
    isDirty: boolean;
}

/**
 * @deprecated Use EditorTabBar with useEditorTabs hook instead
 */
export interface EditorTabBarPropsLegacy {
    openFiles: OpenFile[];
    activeFilePath: string | null;
    onTabClick: (path: string) => void;
    onTabClose: (path: string) => void;
}
