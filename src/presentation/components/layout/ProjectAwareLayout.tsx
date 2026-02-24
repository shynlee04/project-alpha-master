/**
 * @fileoverview Project-Aware Layout
 * @module components/layout/ProjectAwareLayout
 *
 * EPIC-0: Project-Centric Architecture
 *
 * This component conditionally renders the global layout based on route:
 *
 * ON HUB/GLOBAL ROUTES (/hub, /projects, /settings):
 * - GlobalHeader (always)
 * - MainSidebar (navigation to projects, settings)
 * - Breadcrumbs
 * - Outlet (page content)
 *
 * ON PROJECT ROUTE (/$projectId):
 * - GlobalHeader (always)
 * - NO MainSidebar (FileTree plugin handles project navigation as tabbed component)
 * - Outlet (renders ProjectContextProvider → FileTree tabbed panel + Monaco)
 *
 * This follows new-fundamental-truths.md:
 * - FileTree is the "always-loaded-plugin" for project management
 * - FileTree is a tabbed component (Files, Search, Git, etc.), NOT a sidebar
 * - MainSidebar is for global navigation only
 */

import { Outlet, useLocation } from '@tanstack/react-router';
import { GlobalHeader } from './GlobalHeader';
import { MainSidebar } from './MainSidebar';
import { Breadcrumbs } from './Breadcrumbs';

/**
 * Detects if current route is a project route (/$projectId)
 * Project routes have path like /abc123-def456 (UUID-like)
 */
function isProjectRoute(pathname: string): boolean {
    // Hub, projects, settings, about, agents, debug routes are NOT project routes
    const globalRoutes = [
        '/',
        '/',
        '/projects',
        '/settings',
        '/about',
        '/agents',
        '/debug',
        '/api',
        '/test-error-boundary',
        '/test-fs-adapter',
        '/webcontainer',
    ];

    // Check if path is a global route or starts with a global route prefix
    for (const route of globalRoutes) {
        if (pathname === route || pathname.startsWith(route + '/')) {
            return false;
        }
    }

    // Any other path is considered a project route (e.g., /some-project-id)
    // Project IDs are typically UUIDs or slugs
    return pathname !== '/' && pathname.length > 1;
}

export function ProjectAwareLayout() {
    const location = useLocation();
    const inProjectRoute = isProjectRoute(location.pathname);

    // Project route: minimal chrome, FileTree plugin handles navigation
    if (inProjectRoute) {
        return (
            <div className="h-dvh flex flex-col bg-canvas overflow-hidden">
                {/* Minimal header for project context */}
                <GlobalHeader />

                {/* Full height for project workspace - NO MainSidebar */}
                {/* The /$projectId route renders its own FileTree tabbed panel + Monaco */}
                <div className="flex-1 overflow-hidden">
                    <Outlet />
                </div>
            </div>
        );
    }

    // Global routes: full layout with MainSidebar
    return (
        <div className="h-dvh flex flex-col bg-canvas overflow-hidden">
            {/* Fixed Header - Always visible at top */}
            <GlobalHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Global Navigation Sidebar */}
                <MainSidebar />

                {/* Main Content Area */}
                <main id="main-content" className="flex-1 flex flex-col overflow-hidden" tabIndex={-1}>
                    {/* Breadcrumbs - Navigation context */}
                    <Breadcrumbs />

                    {/* Page Content - Outlet renders child routes */}
                    <div className="flex-1 overflow-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
