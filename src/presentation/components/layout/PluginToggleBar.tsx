/**
 * @fileoverview Plugin Toggle Bar Component
 * @module components/layout/PluginToggleBar
 * @created 2026-01-26
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-15
 * 
 * Toolbar for toggling plugins using progressive disclosure pattern.
 * Shows toggle buttons for available plugins with visual active/locked states.
 * 
 * Design: 8-bit compliant with tungsten color palette
 * - Toggle buttons with icons + labels
 * - Locked indicator for always-loaded plugins (FileTree, Chat)
 * - Disabled state for platform-incompatible plugins
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from '@tanstack/react-router';
import {
    Folder,
    FileCode,
    Terminal,
    Eye,
    MessageSquare,
    NotebookPen,
    Lock,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import type { PluginId } from '@/domain/types/plugin-types';

interface PluginToggle {
    pluginId: PluginId;
    name: string;
    icon: LucideIcon;
    shortcut?: string;
    isLocked: boolean;
    requiresFSA: boolean;
}

interface PluginToggleBarProps {
    /** Additional CSS classes */
    className?: string;
    /** Compact mode (icons only) */
    compact?: boolean;
}

// Plugin definitions with metadata
const PLUGIN_DEFINITIONS: PluginToggle[] = [
    {
        pluginId: 'filetree',
        name: 'Files',
        icon: Folder,
        shortcut: '⌘1',
        isLocked: true,
        requiresFSA: false,
    },
    {
        pluginId: 'monaco',
        name: 'Code',
        icon: FileCode,
        shortcut: '⌘2',
        isLocked: false,
        requiresFSA: true,
    },
    {
        pluginId: 'terminal',
        name: 'Terminal',
        icon: Terminal,
        shortcut: '⌘3',
        isLocked: false,
        requiresFSA: true,
    },
    {
        pluginId: 'preview',
        name: 'Preview',
        icon: Eye,
        shortcut: '⌘4',
        isLocked: false,
        requiresFSA: true,
    },
    {
        pluginId: 'chat',
        name: 'Chat',
        icon: MessageSquare,
        shortcut: '⌘5',
        isLocked: true,
        requiresFSA: false,
    },
    {
        pluginId: 'notes',
        name: 'Notes',
        icon: NotebookPen,
        shortcut: '⌘6',
        isLocked: false,
        requiresFSA: false,
    },
];

// Maximum plugins (including locked ones)
const MAX_PLUGINS_DESKTOP = 5;

/**
 * Plugin toggle bar for progressive disclosure.
 * 
 * Features:
 * - Toggle buttons with icons + labels
 * - Locked indicator for always-loaded (FileTree, Chat)
 * - Disabled state for platform-incompatible
 * - Max plugins enforcement (toast on overflow)
 * - Keyboard shortcuts shown
 * 
 * @example
 * ```tsx
 * <PluginToggleBar compact={false} />
 * ```
 */
export const PluginToggleBar: React.FC<PluginToggleBarProps> = ({
    className,
    compact = false,
}) => {
    const { t } = useTranslation();
    const params = useParams({ strict: false });
    const projectId = (params as { projectId?: string }).projectId;

    // Plugin layout store
    const activePlugins = usePluginLayoutStore((s) => s.activePlugins);
    const addPlugin = usePluginLayoutStore((s) => s.addPlugin);
    const removePlugin = usePluginLayoutStore((s) => s.removePlugin);

    // Check if FSA is supported
    const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

    // Filter available plugins based on platform
    const availablePlugins = useMemo(() => {
        return PLUGIN_DEFINITIONS.filter(plugin => {
            // Hide FSA-required plugins on non-FSA platforms
            if (plugin.requiresFSA && !isFSASupported) {
                return false;
            }
            return true;
        });
    }, [isFSASupported]);

    // Check if plugin is active
    const isPluginActive = (pluginId: PluginId): boolean => {
        return activePlugins.includes(pluginId);
    };

    // Handle plugin toggle
    const handleToggle = (plugin: PluginToggle) => {
        // Locked plugins cannot be toggled off
        if (plugin.isLocked) {
            // Ensure it's active if not already
            if (!isPluginActive(plugin.pluginId)) {
                addPlugin(plugin.pluginId);
            }
            return;
        }

        if (isPluginActive(plugin.pluginId)) {
            // Deactivate
            removePlugin(plugin.pluginId);
        } else {
            // Check max plugins limit
            const currentCount = activePlugins.length;
            if (currentCount >= MAX_PLUGINS_DESKTOP) {
                toast.warning(
                    t('plugins.maxReached', 'Maximum {{max}} plugins allowed', { max: MAX_PLUGINS_DESKTOP }),
                    {
                        description: t('plugins.removeFirst', 'Please deactivate a plugin first'),
                    }
                );
                return;
            }
            // Activate
            addPlugin(plugin.pluginId);
        }
    };

    // Don't render if no project is selected
    if (!projectId) {
        return null;
    }

    return (
        <div
            className={cn(
                'flex items-center gap-1',
                'px-2 py-1',
                'border-b border-border',
                'bg-card/50',
                'overflow-x-auto scrollbar-thin',
                className
            )}
            role="toolbar"
            aria-label={t('plugins.toolbar', 'Plugin toolbar')}
        >
            {/* Plugin Toggle Buttons */}
            {availablePlugins.map((plugin) => {
                const isActive = isPluginActive(plugin.pluginId);
                const Icon = plugin.icon;

                return (
                    <button
                        key={plugin.pluginId}
                        onClick={() => handleToggle(plugin)}
                        title={`${plugin.name}${plugin.shortcut ? ` (${plugin.shortcut})` : ''}${plugin.isLocked ? ' - Always active' : ''}`}
                        className={cn(
                            'flex items-center gap-1.5',
                            compact ? 'p-2' : 'px-2.5 py-1.5',
                            'rounded-none border-2',
                            'transition-all duration-150',
                            'group',
                            // Active state
                            isActive
                                ? 'border-primary bg-card text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-background',
                            // Locked indicator (always-on plugins)
                            plugin.isLocked && isActive && 'border-primary/70',
                            // Focus style
                            'focus:outline-none focus-visible:ring-1 focus-visible:ring-primary'
                        )}
                        aria-pressed={isActive}
                        aria-label={`${plugin.name} ${isActive ? 'active' : 'inactive'}${plugin.isLocked ? ', always active' : ''}`}
                    >
                        <Icon
                            size={16}
                            className={cn(
                                'shrink-0',
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            )}
                        />
                        {!compact && (
                            <span className="text-xs font-medium">
                                {plugin.name}
                            </span>
                        )}
                        {/* Lock icon for always-active plugins */}
                        {plugin.isLocked && (
                            <Lock
                                size={10}
                                className={cn(
                                    'shrink-0',
                                    isActive ? 'text-primary-400' : 'text-muted-foreground'
                                )}
                            />
                        )}
                    </button>
                );
            })}

            {/* Separator */}
            <div className="w-px h-6 bg-border mx-1" />

            {/* Plugin Count */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground px-2">
                <span>{activePlugins.length}</span>
                <span>/</span>
                <span>{MAX_PLUGINS_DESKTOP}</span>
            </div>
        </div>
    );
};

export default PluginToggleBar;
