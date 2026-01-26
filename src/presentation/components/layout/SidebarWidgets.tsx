/**
 * @fileoverview Sidebar Status Widgets Component
 * @module components/layout/SidebarWidgets
 * @created 2026-01-26
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-13
 * 
 * Context-aware status widgets for sidebar displaying:
 * - Build status (running/passed/failed)
 * - Sync status (file tree sync state)
 * - Active thread (current chat thread)
 * 
 * Design: 8-bit compliant with tungsten color palette
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from '@tanstack/react-router';
import {
    Play,
    CheckCircle2,
    RefreshCw,
    MessageCircle,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WidgetStatus = 'success' | 'warning' | 'error' | 'neutral' | 'loading';

interface Widget {
    id: string;
    icon: LucideIcon;
    label: string;
    value: string;
    status: WidgetStatus;
    onClick?: () => void;
}

interface SidebarWidgetsProps {
    /** Whether sidebar is collapsed (hide widgets in collapsed mode) */
    collapsed?: boolean;
    /** Additional CSS classes */
    className?: string;
}

// Status color mappings (8-bit palette)
const statusColors: Record<WidgetStatus, string> = {
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    neutral: 'text-zinc-400',
    loading: 'text-blue-400',
};

const statusBgColors: Record<WidgetStatus, string> = {
    success: 'bg-green-500/10 border-green-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    neutral: 'bg-zinc-800 border-zinc-700',
    loading: 'bg-blue-500/10 border-blue-500/30',
};

/**
 * Status widgets for sidebar showing build, sync, and context info.
 * 
 * Features:
 * - Build status indicator (placeholder for WebContainer integration)
 * - Sync status (FileTree sync state)
 * - Active chat thread name
 * - 8-bit styled with status colors
 * 
 * @example
 * ```tsx
 * <SidebarWidgets collapsed={false} />
 * ```
 */
export const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({
    collapsed = false,
    className,
}) => {
    const { t } = useTranslation();
    const params = useParams({ strict: false });
    const projectId = (params as { projectId?: string }).projectId;

    // Placeholder states - will be connected to actual stores later
    // TODO: Connect to WebContainer store when available
    // TODO: Connect to ChatThread store when available
    const buildStatus: { status: WidgetStatus; label: string } = projectId
        ? { status: 'success', label: t('sidebar.widgets.ready', 'Ready') }
        : { status: 'neutral', label: t('sidebar.widgets.noProject', 'No project') };

    const syncStatus: { status: WidgetStatus; label: string } = projectId
        ? { status: 'success', label: t('sidebar.widgets.synced', 'Synced') }
        : { status: 'neutral', label: '-' };

    const activeThreadName: string | null = null; // Placeholder

    const widgets: Widget[] = [
        {
            id: 'build',
            icon: buildStatus.status === 'loading' ? RefreshCw :
                buildStatus.status === 'success' ? CheckCircle2 : Play,
            label: t('sidebar.widgets.build', 'Build'),
            value: buildStatus.label,
            status: buildStatus.status,
        },
        {
            id: 'sync',
            icon: RefreshCw,
            label: t('sidebar.widgets.sync', 'Sync'),
            value: syncStatus.label,
            status: syncStatus.status,
        },
        {
            id: 'thread',
            icon: MessageCircle,
            label: t('sidebar.widgets.thread', 'Thread'),
            value: activeThreadName || t('sidebar.widgets.noThread', 'None'),
            status: 'neutral',
        },
    ];

    // Don't render widgets in collapsed mode
    if (collapsed) {
        return null;
    }

    // Don't render if no project is selected
    if (!projectId) {
        return null;
    }

    return (
        <div className={cn('px-4 py-3 border-t border-zinc-800', className)}>
            <h3 className="text-xs font-pixel uppercase tracking-wider text-zinc-500 mb-2">
                {t('sidebar.status', 'Status')}
            </h3>
            <div className="space-y-1.5">
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        className={cn(
                            'flex items-center justify-between px-2 py-1.5',
                            'rounded-none border',
                            statusBgColors[widget.status],
                            widget.onClick && 'cursor-pointer hover:brightness-110',
                            'transition-all duration-150'
                        )}
                        onClick={widget.onClick}
                    >
                        <div className="flex items-center gap-2">
                            <widget.icon
                                size={14}
                                className={cn(
                                    statusColors[widget.status],
                                    widget.status === 'loading' && 'animate-spin'
                                )}
                            />
                            <span className="text-xs text-zinc-400">{widget.label}</span>
                        </div>
                        <span className={cn('text-xs font-medium', statusColors[widget.status])}>
                            {widget.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
