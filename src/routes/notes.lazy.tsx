/**
 * @fileoverview Notes Workspace Route
 * @module routes/notes
 * @governance Story UJ-000: ProjectPickerDialog & Empty States
 * @updated 2026-01-06T04:00:00+07:00
 * @updated 2026-01-06T05:00:00+07:00 - Phase 1A.5: Add enable notes action
 *
 * Route to access Notes workspace when no project is specified.
 * Shows empty state or redirects to hub with project picker.
 *
 * IMPORTANT: Notes workspace REQUIRES a project. Notes are stored as synced files
 * in the project folder (Markdown files), NOT in local browser storage.
 *
 * User flow:
 * 1. User navigates to /notes without projectId
 * 2. Check for projects with bindings.notes === true
 * 3. If 0 Notes-enabled projects: Show empty state with "Create Project" button
 * 4. If 1+ Notes-enabled projects: Redirect to /hub?workspace=notes with project picker
 * 5. User selects project → navigates to /notes/$projectId
 *
 * Does NOT allow notes without project folder (no standalone mode).
 */

import { useEffect, useMemo, useState } from 'react';
import { createLazyFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { toast } from 'sonner';

export const Route = createLazyFileRoute('/notes')({
  component: NotesEmptyState,
});

/**
 * Notes Empty State Component
 *
 * Displays when user navigates to /notes without a project ID.
 * Shows helpful empty state with action buttons.
 */
function NotesEmptyState() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isEnabling, setIsEnabling] = useState(false);

  // Get projects from Zustand store (stable reference - prevents infinite loops in v5)
  // Then filter by workspace binding using useMemo
  const projects = useProjectStore((state) => state.projects);
  const updateProjectBindings = useProjectStore((state) => state.updateProjectBindings);

  const allProjects = useMemo(() => Object.values(projects), [projects]);
  const notesProjects = useMemo(() =>
    allProjects.filter((project) => project.bindings?.notes === true),
    [allProjects]
  );

  const hasNotesProjects = notesProjects.length > 0;
  const hasAnyProjects = allProjects.length > 0;

  useEffect(() => {
    // If Notes-enabled projects exist, redirect to hub with project picker
    if (hasNotesProjects) {
      redirect({
        to: '/hub',
        search: {
          workspace: 'notes',
        },
      });
    }
  }, [hasNotesProjects]);

  /**
   * Enable Notes workspace for the most recent project and navigate to it.
   *
   * Phase 1A.5: This fixes the P0 blocker where users couldn't access Notes
   * after mounting a project without manually enabling it in settings.
   */
  const handleEnableNotes = async () => {
    setIsEnabling(true);
    try {
      // Find the most recently opened project
      const mostRecentProject = allProjects.sort((a, b) => {
        const timeA = a.lastOpened ? new Date(a.lastOpened).getTime() : 0;
        const timeB = b.lastOpened ? new Date(b.lastOpened).getTime() : 0;
        return timeB - timeA;
      })[0];

      if (!mostRecentProject) {
        toast.error('No projects found. Please create a project first.');
        return;
      }

      // Enable Notes binding for this project
      await updateProjectBindings(mostRecentProject.id, {
        ...mostRecentProject.bindings,
        notes: true,
      } as any);

      toast.success(`Notes enabled for "${mostRecentProject.name}"`);

      // Navigate directly to notes workspace with this project
      navigate({
        to: '/notes/$projectId',
        params: { projectId: mostRecentProject.id },
      });
    } catch (error) {
      console.error('[NotesEmptyState] Failed to enable Notes:', error);
      toast.error('Failed to enable Notes. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6 max-w-md px-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center">
          {t('notes.emptyState.title')}
        </h1>

        {/* Description */}
        {hasAnyProjects ? (
          <p className="text-muted-foreground text-center">
            {t('notes.emptyState.hasProjectsNoneNotes')}
          </p>
        ) : (
          <p className="text-muted-foreground text-center">
            {t('notes.emptyState.noProjects')}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {/* Create Project Button */}
          <button
            onClick={() => navigate({ to: '/hub', search: { action: 'create-project' } })}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('notes.emptyState.createProject')}
          </button>

          {/* Enable Notes Button (only shows when projects exist but none have Notes) */}
          {hasAnyProjects && !hasNotesProjects && (
            <button
              onClick={handleEnableNotes}
              disabled={isEnabling}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border bg-background text-foreground font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnabling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              {isEnabling ? 'Enabling...' : t('notes.emptyState.enableNotes')}
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          {t('notes.emptyState.helpText')}
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
 * notes.emptyState.title: "No Project Selected for Notes"
 * notes.emptyState.noProjects: "Mount a project folder to start using Notes. Your notes are saved as Markdown files in your project."
 * notes.emptyState.hasProjectsNoneNotes: "None of your projects have Notes workspace enabled. Go to project settings to enable it."
 * notes.emptyState.createProject: "Create Project"
 * notes.emptyState.enableNotes: "Enable Notes"
 * notes.emptyState.helpText: "Notes are synced to your project folder as .md files."
 *
 * Vietnamese keys to add:
 * notes.emptyState.title: "Chưa Chọn Dự Án Cho Notes"
 * notes.emptyState.noProjects: "Gắn thư mục dự án để bắt đầu sử dụng Notes. Ghi chú của bạn được lưu dưới dạng file Markdown trong dự án."
 * notes.emptyState.hasProjectsNoneNotes: "Không có dự án nào bật không gian Notes. Vào cài đặt dự án để bật."
 * notes.emptyState.createProject: "Tạo Dự Án"
 * notes.emptyState.enableNotes: "Bật Notes"
 * notes.emptyState.helpText: "Ghi chú được đồng bộ vào thư mục dự án dưới dạng file .md."
 */
