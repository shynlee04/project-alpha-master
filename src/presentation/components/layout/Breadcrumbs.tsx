/**
 * @fileoverview Breadcrumbs Component
 * @module components/layout/Breadcrumbs
 * @governance UX-04
 * @ai-observable false
 *
 * Navigation breadcrumbs for the application with 8-bit design compliance.
 * Dynamically generates breadcrumb path from current TanStack Router location.
 *
 * @epic EPIC-UX-GLOBAL-UI
 * @story UX-04 Implement Breadcrumbs
 *
 * 8-Bit Design Mandates (NON-NEGOTIABLE):
 * - border-radius: 0px (rounded-none)
 * - NO glassmorphism, NO opacity < 1
 *
 * Mobile Behavior:
 * - Truncate to last 2 segments on small screens
 * - Use ellipsis (...) as prefix when truncated
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbsProps {
  /** Additional CSS class names */
  className?: string;
}

interface BreadcrumbItem {
  /** Display label for the breadcrumb segment */
  label: string;
  /** Path to navigate to (undefined = current segment, not clickable) */
  path?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Breadcrumbs - Navigation breadcrumbs for route context
 *
 * Features:
 * - Height: 32px (h-8)
 * - Background: bg-zinc-950
 * - Text: text-zinc-400 for paths, text-zinc-50 for current
 * - Separator: ChevronRight icon in text-zinc-600
 * - Font: font-mono text-sm
 * - Mobile: Truncates to last 2 segments with ellipsis prefix
 *
 * Route Parsing:
 * - `/` → Hub
 * - `/workspace` → Hub > Projects
 * - `/ide/$projectId` → Hub > {projectName} > IDE
 * - `/notes/$projectId` → Hub > {projectName} > Notes
 * - `/settings` → Hub > Settings
 *
 * @param props - Component props
 * @returns Breadcrumbs JSX element
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ className }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams({ strict: false });
  const { getProject } = useProjectStore();

  // Generate breadcrumb items based on current route
  const items = React.useMemo((): BreadcrumbItem[] => {
    const path = location.pathname;
    const projectId = (params as { projectId?: string }).projectId;
    const project = projectId ? getProject(projectId) : null;

    // Always start with Hub
    const crumbs: BreadcrumbItem[] = [
      { label: t('global.breadcrumb.home', 'Hub'), path: '/' },
    ];

    // Parse routes
    if (path === '/') {
      // On home, Hub is current (no path = not clickable)
      crumbs[0].path = undefined;
    } else if (path.startsWith('/workspace') || path.startsWith('/projects')) {
      crumbs.push({ label: t('sidebar.projects', 'Projects') });
    } else if (path.startsWith('/ide/')) {
      if (project) {
        crumbs.push({ label: project.name, path: `/projects` });
      }
      crumbs.push({ label: t('navigation.ide', 'IDE') });
    } else if (path.startsWith('/notes/')) {
      if (project) {
        crumbs.push({ label: project.name, path: `/projects` });
      }
      crumbs.push({ label: t('sidebar.notes', 'Notes') });
    } else if (path.startsWith('/ide')) {
      // /ide without project
      crumbs.push({ label: t('navigation.ide', 'IDE') });
    } else if (path.startsWith('/notes')) {
      // /notes without project
      crumbs.push({ label: t('sidebar.notes', 'Notes') });
    } else if (path.startsWith('/settings')) {
      crumbs.push({ label: t('sidebar.settings', 'Settings') });
    } else if (path.startsWith('/agents')) {
      crumbs.push({ label: t('sidebar.agents', 'Agents') });
    } else if (path.startsWith('/knowledge')) {
      crumbs.push({ label: t('sidebar.knowledge', 'Knowledge') });
    } else if (path.startsWith('/about')) {
      crumbs.push({ label: t('about.title', 'About') });
    }

    return crumbs;
  }, [location.pathname, params, getProject, t]);

  // For mobile, truncate to last 2 items
  const isTruncated = items.length > 2;
  const displayItems = React.useMemo(() => {
    return items;
  }, [items]);

  // Mobile items (last 2 only)
  const mobileItems = React.useMemo(() => {
    if (items.length <= 2) return items;
    return items.slice(-2);
  }, [items]);

  return (
    <nav
      className={cn(
        // Layout: Fixed height, flex container
        'flex items-center h-8 px-4',
        // Colors: 8-bit compliant - solid bg-zinc-950
        'bg-zinc-950',
        // Typography
        'text-sm font-mono',
        // No rounded corners (8-bit mandate)
        'rounded-none',
        className
      )}
      aria-label={t('global.breadcrumb.ariaLabel', 'Breadcrumb navigation')}
    >
      {/* Desktop: Show all items */}
      <div className="hidden sm:flex items-center">
        {displayItems.map((item, index) => (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 mx-2 text-zinc-600 shrink-0"
                aria-hidden="true"
              />
            )}
            {item.path ? (
              <Link
                to={item.path}
                className={cn(
                  'text-zinc-400 hover:text-zinc-50',
                  'transition-colors duration-150',
                  'truncate max-w-[200px]',
                  // 8-bit: NO rounded corners
                  'rounded-none',
                  // Focus state
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-50 truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Mobile: Show only last 2 items with ellipsis prefix */}
      <div className="flex sm:hidden items-center">
        {isTruncated && (
          <>
            <span className="text-zinc-600" aria-hidden="true">
              ...
            </span>
            <ChevronRight
              className="w-4 h-4 mx-1 text-zinc-600 shrink-0"
              aria-hidden="true"
            />
          </>
        )}
        {mobileItems.map((item, index) => (
          <React.Fragment key={`mobile-${item.label}-${index}`}>
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 mx-1 text-zinc-600 shrink-0"
                aria-hidden="true"
              />
            )}
            {item.path ? (
              <Link
                to={item.path}
                className={cn(
                  'text-zinc-400 hover:text-zinc-50',
                  'transition-colors duration-150',
                  'truncate max-w-[100px]',
                  // 8-bit: NO rounded corners
                  'rounded-none',
                  // Focus state
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-50 truncate max-w-[100px]">
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

// Display name for React DevTools
Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;
