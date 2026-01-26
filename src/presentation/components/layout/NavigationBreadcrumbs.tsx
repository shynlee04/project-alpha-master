/**
 * @fileoverview Navigation Breadcrumbs Component
 * @module components/layout/NavigationBreadcrumbs
 * @created 2026-01-26
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-14
 * 
 * Smart breadcrumb navigation showing current location.
 * Features truncation, click navigation, and copy path functionality.
 * 
 * Design: 8-bit compliant with tungsten color palette
 * - rounded-none everywhere
 * - Clickable items navigate to location
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useLocation } from '@tanstack/react-router';
import {
    Home,
    ChevronRight,
    Copy,
    Folder,
    FileCode,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';

interface BreadcrumbItem {
    id: string;
    label: string;
    path: string;
    icon?: LucideIcon;
    isActive: boolean;
}

interface NavigationBreadcrumbsProps {
    /** Current file path within project (optional) */
    currentFilePath?: string;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Smart breadcrumb navigation component.
 * 
 * Shows: Hub > Project Name > [Current File Path]
 * 
 * Features:
 * - Clickable items navigate to that location
 * - Truncation for long paths (ellipsis in middle)
 * - Copy path button on hover
 * - Current item highlighted
 * - 8-bit styled
 * 
 * @example
 * ```tsx
 * <NavigationBreadcrumbs currentFilePath="src/routes/$projectId.tsx" />
 * ```
 */
export const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({
    currentFilePath,
    className,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams({ strict: false });
    const projectId = (params as { projectId?: string }).projectId;

    // Get project name from store
    const project = useProjectStore((s) =>
        projectId ? s.getProject(projectId) : null
    );

    // Build breadcrumb items based on current route
    const breadcrumbs = useMemo((): BreadcrumbItem[] => {
        const items: BreadcrumbItem[] = [];

        // Always start with Hub
        items.push({
            id: 'hub',
            label: t('breadcrumbs.hub', 'Hub'),
            path: '/',
            icon: Home,
            isActive: location.pathname === '/',
        });

        // Add project if we're on a project route
        if (projectId && project) {
            items.push({
                id: 'project',
                label: project.name || 'Project',
                path: `/${projectId}`,
                icon: Folder,
                isActive: location.pathname === `/${projectId}` && !currentFilePath,
            });
        }

        // Add file path segments if provided
        if (currentFilePath && projectId) {
            const segments = currentFilePath.split('/').filter(Boolean);
            let accumulatedPath = '';

            segments.forEach((segment, index) => {
                accumulatedPath += `/${segment}`;
                const isLast = index === segments.length - 1;

                items.push({
                    id: `segment-${index}`,
                    label: segment,
                    path: accumulatedPath,
                    icon: isLast ? FileCode : Folder,
                    isActive: isLast,
                });
            });
        }

        return items;
    }, [t, location.pathname, projectId, project, currentFilePath]);

    // Handle breadcrumb click
    const handleClick = (item: BreadcrumbItem) => {
        if (item.isActive) return;

        if (item.id === 'hub') {
            navigate({ to: '/' });
        } else if (item.id === 'project' && projectId) {
            navigate({ to: '/$projectId', params: { projectId } });
        } else {
            // File navigation would go here
            toast.info(`Would navigate to: ${item.path}`);
        }
    };

    // Handle copy path
    const handleCopyPath = () => {
        const fullPath = breadcrumbs.map(b => b.label).join(' / ');
        navigator.clipboard.writeText(fullPath).then(() => {
            toast.success(t('breadcrumbs.copied', 'Path copied to clipboard'));
        }).catch(() => {
            toast.error(t('breadcrumbs.copyFailed', 'Failed to copy path'));
        });
    };

    // Truncate long labels
    const truncateLabel = (label: string, maxLength: number = 20): string => {
        if (label.length <= maxLength) return label;
        const halfLength = Math.floor((maxLength - 3) / 2);
        return `${label.slice(0, halfLength)}...${label.slice(-halfLength)}`;
    };

    // Don't render if only Hub
    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <nav
            className={cn(
                'flex items-center gap-1 px-3 py-1.5',
                'overflow-x-auto scrollbar-thin',
                'text-sm',
                className
            )}
            aria-label={t('breadcrumbs.ariaLabel', 'Breadcrumb navigation')}
        >
            {breadcrumbs.map((item, index) => (
                <React.Fragment key={item.id}>
                    {/* Separator */}
                    {index > 0 && (
                        <ChevronRight
                            size={14}
                            className="text-zinc-600 shrink-0"
                            aria-hidden="true"
                        />
                    )}

                    {/* Breadcrumb Item */}
                    <button
                        onClick={() => handleClick(item)}
                        disabled={item.isActive}
                        className={cn(
                            'flex items-center gap-1.5 px-2 py-1',
                            'rounded-none border border-transparent',
                            'transition-all duration-150',
                            'max-w-[150px]',
                            item.isActive
                                ? 'text-orange-500 font-medium cursor-default bg-zinc-900/50'
                                : 'text-zinc-400 hover:text-zinc-50 hover:border-zinc-700 hover:bg-zinc-950',
                            'focus:outline-none focus-visible:ring-1 focus-visible:ring-orange-500'
                        )}
                        title={item.label}
                    >
                        {item.icon && (
                            <item.icon
                                size={14}
                                className={cn(
                                    'shrink-0',
                                    item.isActive ? 'text-orange-500' : 'text-zinc-500'
                                )}
                            />
                        )}
                        <span className="truncate">
                            {truncateLabel(item.label)}
                        </span>
                    </button>
                </React.Fragment>
            ))}

            {/* Copy Path Button */}
            <button
                onClick={handleCopyPath}
                className={cn(
                    'ml-2 p-1',
                    'rounded-none border border-transparent',
                    'text-zinc-600 hover:text-zinc-400 hover:border-zinc-700',
                    'transition-all duration-150',
                    'opacity-0 group-hover:opacity-100',
                    'focus:opacity-100 focus:outline-none'
                )}
                title={t('breadcrumbs.copyPath', 'Copy path')}
                aria-label={t('breadcrumbs.copyPath', 'Copy path')}
            >
                <Copy size={12} />
            </button>
        </nav>
    );
};

export default NavigationBreadcrumbs;
