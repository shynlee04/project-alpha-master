/**
 * @fileoverview Mobile Bottom Navigation Component
 * @module components/layout/MobileBottomNav
 * @created 2026-01-26
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-17
 * 
 * Bottom navigation bar for mobile devices.
 * Shows primary tabs for Files, Notes, Chat, and More actions.
 * 
 * Design: 8-bit compliant with tungsten color palette
 * - Fixed at bottom
 * - 4 primary tabs
 * - Active state indicator
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from '@tanstack/react-router';
import {
    Folder,
    NotebookPen,
    MessageSquare,
    MoreHorizontal,
    Home,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import type { PluginId } from '@/domain/types/plugin-types';

interface NavItem {
    id: string;
    pluginId?: PluginId;
    icon: LucideIcon;
    label: string;
    isMore?: boolean;
}

interface MobileBottomNavProps {
    /** Callback when "More" menu is opened */
    onMoreClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

// Navigation items for mobile bottom bar
const NAV_ITEMS: NavItem[] = [
    {
        id: 'files',
        pluginId: 'filetree',
        icon: Folder,
        label: 'Files',
    },
    {
        id: 'notes',
        pluginId: 'notes',
        icon: NotebookPen,
        label: 'Notes',
    },
    {
        id: 'chat',
        pluginId: 'chat',
        icon: MessageSquare,
        label: 'Chat',
    },
    {
        id: 'more',
        icon: MoreHorizontal,
        label: 'More',
        isMore: true,
    },
];

/**
 * Mobile bottom navigation bar.
 * 
 * Features:
 * - Fixed position at bottom
 * - 4 primary tabs (Files, Notes, Chat, More)
 * - Active state indicator
 * - Touch-optimized (48px min height)
 * - Safe area inset handling
 * 
 * @example
 * ```tsx
 * <MobileBottomNav onMoreClick={() => setMoreOpen(true)} />
 * ```
 */
export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    onMoreClick,
    className,
}) => {
    const { t } = useTranslation();
    const params = useParams({ strict: false });
    const projectId = (params as { projectId?: string }).projectId;

    // Plugin layout store
    const currentPlugin = usePluginLayoutStore((s) => s.currentPlugin);
    const switchPlugin = usePluginLayoutStore((s) => s.switchPlugin);
    const addPlugin = usePluginLayoutStore((s) => s.addPlugin);
    const activePlugins = usePluginLayoutStore((s) => s.activePlugins);

    // Handle tab click
    const handleTabClick = (item: NavItem) => {
        if (item.isMore) {
            onMoreClick?.();
            return;
        }

        if (item.pluginId) {
            // Ensure plugin is active
            if (!activePlugins.includes(item.pluginId)) {
                addPlugin(item.pluginId);
            }
            // Switch to this plugin
            switchPlugin(item.pluginId);
        }
    };

    // Check if tab is active
    const isActive = (item: NavItem): boolean => {
        if (item.isMore) return false;
        return currentPlugin === item.pluginId;
    };

    // Don't render if no project (show hub nav instead)
    if (!projectId) {
        return (
            <nav
                className={cn(
                    'fixed bottom-0 left-0 right-0',
                    'flex items-center justify-around',
                    'h-14 pb-safe',
                    'bg-zinc-900 border-t-2 border-zinc-700',
                    'md:hidden',
                    className
                )}
                role="navigation"
                aria-label={t('mobile.bottomNav', 'Bottom navigation')}
            >
                {/* Hub mode - just Home button */}
                <button
                    className={cn(
                        'flex flex-col items-center justify-center',
                        'flex-1 h-full',
                        'text-orange-500',
                        'transition-colors duration-150'
                    )}
                    aria-current="page"
                >
                    <Home size={24} className="mb-0.5" />
                    <span className="text-[10px] font-medium">Home</span>
                </button>
            </nav>
        );
    }

    return (
        <nav
            className={cn(
                'fixed bottom-0 left-0 right-0',
                'flex items-center justify-around',
                'h-14 pb-safe',
                'bg-zinc-900 border-t-2 border-zinc-700',
                'md:hidden',
                'shadow-[0_-2px_0_0_rgba(0,0,0,0.5)]',
                className
            )}
            role="navigation"
            aria-label={t('mobile.bottomNav', 'Bottom navigation')}
        >
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                    <button
                        key={item.id}
                        onClick={() => handleTabClick(item)}
                        className={cn(
                            'flex flex-col items-center justify-center',
                            'flex-1 h-full',
                            'min-w-[60px]',
                            'transition-colors duration-150',
                            'touch-manipulation',
                            'focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-500',
                            // Active state
                            active
                                ? 'text-orange-500'
                                : 'text-zinc-500 active:text-zinc-300'
                        )}
                        aria-current={active ? 'page' : undefined}
                        aria-label={item.label}
                    >
                        {/* Icon with active indicator */}
                        <div className="relative">
                            <Icon size={22} className="mb-0.5" />
                            {active && (
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />
                            )}
                        </div>

                        {/* Label */}
                        <span className={cn(
                            'text-[10px] font-medium',
                            active && 'font-bold'
                        )}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default MobileBottomNav;
