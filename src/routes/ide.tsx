/**
 * @fileoverview IDE Workspace Route
 * @module routes/ide
 * @governance Story UJ-000: ProjectPickerDialog & Empty States
 * @updated 2026-01-06T06:15:00+07:00
 *
 * Route to access IDE workspace when no project is specified.
 * Shows empty state or redirects to hub with project picker.
 *
 * User flow:
 * 1. User navigates to /ide without projectId
 * 2. Check for projects with bindings.ide === true (from Dexie)
 * 3. If 0 IDE-enabled projects: Show empty state with "Create Project" button
 * 4. If 1+ IDE-enabled projects: Redirect to /hub?workspace=ide with project picker
 * 5. User selects project → navigates to /ide/$projectId
 *
 * Does NOT load Monaco/editor in empty state.
 */

import { useEffect, useMemo } from 'react';
import { createFileRoute, useNavigate, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FolderOpen, Plus, Loader2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/infrastructure/persistence/dexie-db';

export const Route = createFileRoute('/ide')({
  ssr: false,
  component: IDEEmptyState,
});

/**
 * IDE Empty State Component
 *
 * Displays when user navigates to /ide without a project ID.
 * Shows helpful empty state with action buttons.
 */
function IDEEmptyState() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // FIX-2026-01-06: Use Dexie via useLiveQuery (same source as Hub)
  // This ensures consistency - Hub and IDE read from the same data source
  const allProjects = useLiveQuery(() => db.projects.toArray(), []) ?? [];

  // Derive IDE-enabled projects
  const ideProjects = useMemo(() => {
    return allProjects.filter(p => p.bindings?.ide === true);
  }, [allProjects]);

  const hasIdeProjects = ideProjects.length > 0;
  const hasAnyProjects = allProjects.length > 0;
  const isLoading = allProjects === undefined;

  // FIX-2026-01-06: Check if we're rendering a child route (/ide/$projectId)
  // If so, don't redirect - let the child route handle the project
  const isOnChildRoute = window.location.pathname !== '/ide';

  useEffect(() => {
    // Don't redirect if we're on a child route like /ide/$projectId
    if (isOnChildRoute) {
      console.log('[IDERoute] On child route, skipping redirect');
      return;
    }

    // If IDE-enabled projects exist, redirect to hub with project picker
    if (!isLoading && hasIdeProjects) {
      console.log('[IDERoute] IDE projects exist, redirecting to hub');
      navigate({
        to: '/hub',
        search: {
          workspace: 'ide',
        },
      });
    }
  }, [hasIdeProjects, isLoading, navigate, isOnChildRoute]);

  // FIX-2026-01-06: If on child route, render Outlet to show child component (IDE workspace)
  if (isOnChildRoute) {
    return <Outlet />;
  }

  // Show loading state while Dexie query runs
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6 max-w-md px-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center">
          {t('ide.emptyState.title')}
        </h1>

        {/* Description */}
        {hasAnyProjects ? (
          <p className="text-muted-foreground text-center">
            {t('ide.emptyState.hasProjectsNoneIde')}
          </p>
        ) : (
          <p className="text-muted-foreground text-center">
            {t('ide.emptyState.noProjects')}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Create Project Button */}
          <button
            onClick={() => navigate({ to: '/hub' })}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('ide.emptyState.createProject')}
          </button>

          {/* Enable IDE Button (only shows when projects exist but none have IDE) */}
          {hasAnyProjects && !hasIdeProjects && (
            <button
              onClick={() => navigate({ to: '/hub' })}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              {t('ide.emptyState.enableIde')}
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          {t('ide.emptyState.helpText')}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// i18n Resource Keys (to be added to translation files)
// ============================================================================

/**
 * English keys to add:
 * ide.emptyState.title: "No Project Selected for IDE"
 * ide.emptyState.noProjects: "Mount a project folder to start using the IDE with file editing, terminal, and more."
 * ide.emptyState.hasProjectsNoneIde: "None of your projects have IDE workspace enabled. Go to project settings to enable it."
 * ide.emptyState.createProject: "Create Project"
 * ide.emptyState.enableIde: "Enable IDE"
 * ide.emptyState.helpText: "Need help? See documentation for setting up projects."
 *
 * Vietnamese keys to add:
 * ide.emptyState.title: "Chưa Chọn Dự Án Cho IDE"
 * ide.emptyState.noProjects: "Gắn thư mục dự án để bắt đầu sử dụng IDE với chỉnh sửa file, terminal, và hơn nữa."
 * ide.emptyState.hasProjectsNoneIde: "Không có dự án nào bật không gian IDE. Vào cài đặt dự án để bật."
 * ide.emptyState.createProject: "Tạo Dự Án"
 * ide.emptyState.enableIde: "Bật IDE"
 * ide.emptyState.helpText: "Cần trợ giúp? Xem tài liệu để thiết lập dự án."
 */
