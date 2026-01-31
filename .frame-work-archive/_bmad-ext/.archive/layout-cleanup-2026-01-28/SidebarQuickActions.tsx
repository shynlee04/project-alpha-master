/**
 * @fileoverview Sidebar Quick Actions Component
 * @module components/layout/SidebarQuickActions
 * @created 2026-01-26
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-13
 * 
 * Quick action buttons grid for sidebar navigation.
 * Provides fast access to common actions like new file, search, terminal, etc.
 * 
 * Design: 8-bit compliant with tungsten color palette
 * - rounded-none everywhere
 * - shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] for pixel shadows on hover
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from '@tanstack/react-router';
import {
    FilePlus,
    FolderPlus,
    Search,
    Terminal,
    Eye,
    MessageSquare,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';

interface QuickAction {
    id: string;
    icon: LucideIcon;
    label: string;
    shortcut?: string;
    onClick: () => void;
    requiresFSA?: boolean;
    disabled?: boolean;
}

interface SidebarQuickActionsProps {
    /** Whether sidebar is collapsed (show icons only) */
    collapsed?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Quick action buttons grid for sidebar.
 * 
 * Features:
 * - 6 quick action buttons with icons
 * - Keyboard shortcuts displayed
 * - Platform-aware (some actions FSA-only)
 * - 8-bit styled with pixel shadows
 * 
 * @example
 * ```tsx
 * <SidebarQuickActions collapsed={false} />
 * ```
 */
export const SidebarQuickActions: React.FC<SidebarQuickActionsProps> = ({
    collapsed = false,
    className,
}) => {
    const { t } = useTranslation();
    const params = useParams({ strict: false });
    const projectId = (params as { projectId?: string }).projectId;

    // Plugin layout store for managing plugins
    const activePlugins = usePluginLayoutStore((s) => s.activePlugins);
    const addPlugin = usePluginLayoutStore((s) => s.addPlugin);
    const removePlugin = usePluginLayoutStore((s) => s.removePlugin);

    // Check if FSA is supported
    const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    // Toggle plugin helper (add if not present, remove if present)
    const togglePlugin = (pluginId: string) => {
        const typedPluginId = pluginId as Parameters<typeof addPlugin>[0];
        if (activePlugins.includes(typedPluginId)) {
            removePlugin(typedPluginId);
        } else {
            addPlugin(typedPluginId);
        }
    };

    // Handle new file creation
    const handleNewFile = () => {
        if (!projectId) {
            toast.info(t('sidebar.noProjectSelected', 'Select a project first'));
            return;
        }
        // Trigger file creation dialog (via file tree plugin event)
        window.dispatchEvent(new CustomEvent('sidebar:new-file', { detail: { projectId } }));
        toast.info(t('sidebar.newFile', 'New file dialog opened'));
    };

    // Handle new folder creation
    const handleNewFolder = () => {
        if (!projectId) {
            toast.info(t('sidebar.noProjectSelected', 'Select a project first'));
            return;
        }
        window.dispatchEvent(new CustomEvent('sidebar:new-folder', { detail: { projectId } }));
        toast.info(t('sidebar.newFolder', 'New folder dialog opened'));
    };

    // Handle global search
    const handleSearch = () => {
        // Dispatch global search event (Cmd+K)
        window.dispatchEvent(new CustomEvent('sidebar:open-search'));
    };

    // Handle terminal toggle
    const handleTerminal = () => {
        if (!projectId) {
            toast.info(t('sidebar.noProjectSelected', 'Select a project first'));
            return;
        }
        if (!isFSASupported) {
            toast.info(t('sidebar.terminalNotAvailable', 'Terminal requires desktop browser'));
            return;
        }
        togglePlugin('terminal');
    };

    // Handle preview toggle
    const handlePreview = () => {
        if (!projectId) {
            toast.info(t('sidebar.noProjectSelected', 'Select a project first'));
            return;
        }
        if (!isFSASupported) {
            toast.info(t('sidebar.previewNotAvailable', 'Preview requires desktop browser'));
            return;
        }
        togglePlugin('preview');
    };

    // Handle AI chat focus
    const handleAIChat = () => {
        // Dispatch event to focus chat input
        window.dispatchEvent(new CustomEvent('sidebar:focus-chat'));
        // Ensure chat plugin is active
        const typedChatId = 'chat' as Parameters<typeof addPlugin>[0];
        if (!activePlugins.includes(typedChatId)) {
            addPlugin(typedChatId);
        }
    };

    const actions: QuickAction[] = [
        {
            id: 'new-file',
            icon: FilePlus,
            label: t('sidebar.actions.newFile', 'New File'),
            shortcut: '⌘N',
            onClick: handleNewFile,
            requiresFSA: true,
        },
        {
            id: 'new-folder',
            icon: FolderPlus,
            label: t('sidebar.actions.newFolder', 'New Folder'),
            shortcut: '⇧⌘N',
            onClick: handleNewFolder,
            requiresFSA: true,
        },
        {
            id: 'search',
            icon: Search,
            label: t('sidebar.actions.search', 'Search'),
            shortcut: '⌘K',
            onClick: handleSearch,
        },
        {
            id: 'terminal',
            icon: Terminal,
            label: t('sidebar.actions.terminal', 'Terminal'),
            shortcut: '⌘`',
            onClick: handleTerminal,
            requiresFSA: true,
            disabled: !isFSASupported,
        },
        {
            id: 'preview',
            icon: Eye,
            label: t('sidebar.actions.preview', 'Preview'),
            shortcut: '⇧⌘P',
            onClick: handlePreview,
            requiresFSA: true,
            disabled: !isFSASupported,
        },
        {
            id: 'chat',
            icon: MessageSquare,
            label: t('sidebar.actions.chat', 'AI Chat'),
            shortcut: '⇧⌘C',
            onClick: handleAIChat,
        },
    ];

    // Filter out disabled actions based on platform
    const availableActions = actions.filter((action) => !action.disabled);

    if (collapsed) {
        // Collapsed view: icon-only grid
        return (
            <div className={cn('px-2 py-2', className)}>
                <div className="flex flex-col gap-1">
                    {availableActions.slice(0, 4).map((action) => (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            title={`${action.label}${action.shortcut ? ` (${action.shortcut})` : ''}`}
                            className={cn(
                                'flex items-center justify-center w-10 h-10 mx-auto',
                                'rounded-none border-2 border-transparent',
                                'hover:border-border hover:bg-background',
                                'text-muted-foreground hover:text-foreground',
                                'transition-all duration-150',
                                'active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                            )}
                        >
                            <action.icon size={18} />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Expanded view: 2-column grid with labels
    return (
        <div className={cn('px-4 py-3', className)}>
            <h3 className="text-xs font-pixel uppercase tracking-wider text-muted-foreground mb-3">
                {t('sidebar.quickActions', 'Quick Actions')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {availableActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={action.onClick}
                        className={cn(
                            'flex flex-col items-center gap-1 p-2',
                            'rounded-none border-2 border-border',
                            'hover:border-muted hover:bg-background',
                            'text-muted-foreground hover:text-foreground',
                            'transition-all duration-150',
                            'active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]',
                            'group'
                        )}
                    >
                        <action.icon
                            size={18}
                            className="text-muted-foreground group-hover:text-primary transition-colors"
                        />
                        <span className="text-xs font-medium truncate">{action.label}</span>
                        {action.shortcut && (
                            <kbd className="text-[10px] text-muted-foreground font-mono">
                                {action.shortcut}
                            </kbd>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
