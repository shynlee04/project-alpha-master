/**
 * @fileoverview Notes Workspace Route
 * @module routes/notes
 * @governance Story UJ-000: ProjectPickerDialog & Empty States
 * @updated 2026-01-06T04:00:00+07:00
 * @updated 2026-01-06T05:00:00+07:00 - Phase 1A.5: Add enable notes action
 * @updated 2026-01-07T06:00:00+07:00 - P0-2: Auto-create temp project for standalone Notes access
 *
 * Route to access Notes workspace when no project is specified.
 * Shows empty state or redirects to hub with project picker.
 *
 * NS-2026-01-07: Users can now access Notes WITHOUT creating a project.
 * A temp "Quick Notes" project is auto-created with IndexedDB storage.
 *
 * User flow:
 * 1. User navigates to /notes without projectId
 * 2. If no projects exist: Auto-create temp "Quick Notes" project, navigate to it
 * 3. If projects exist but none have Notes binding: Show empty state with "Enable Notes" button
 * 4. If 1+ Notes-enabled projects: Redirect to /hub?workspace=notes with project picker
 * 5. User selects project → navigates to /notes/$projectId
 */

import { useEffect, useMemo, useState } from 'react';
import { createLazyFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { db } from '@/infrastructure/persistence/dexie-db';
import { toast } from 'sonner';

// ============================================================================
// Temp Project Constants
// ============================================================================

const TEMP_NOTES_PROJECT_ID = 'temp-notes-project';
const TEMP_NOTES_PROJECT_NAME = 'Quick Notes';

export const Route = createLazyFileRoute('/notes')({
  component: NotesEmptyState,
});

// ============================================================================
// Temp Project Creation (NS-2026-01-07)
// ============================================================================

/**
 * Ensures a temp "Quick Notes" project exists for standalone Notes access.
 * Creates one if it doesn't exist, returns the existing one otherwise.
 *
 * NS-2026-01-07: This unblocks users who don't want to create a project
 * but still want to use Notes workspace.
 */
async function ensureTempProject(): Promise<{ id: string; name: string } | null> {
  try {
    // Check if temp project already exists
    const existing = await db.projects.get(TEMP_NOTES_PROJECT_ID);
    if (existing) {
      // Update lastOpened for recurrence tracking
      await db.projects.update(TEMP_NOTES_PROJECT_ID, { lastOpened: new Date() });
      return { id: existing.id, name: existing.name };
    }

    // Create new temp project
    const now = new Date();
    const tempProject = {
      id: TEMP_NOTES_PROJECT_ID,
      name: TEMP_NOTES_PROJECT_NAME,
      path: '/temp-notes', // Virtual path for temp project
      workspaceId: 'notes' as const,
      storageType: 'indexeddb' as const,
      lastOpened: now,
      createdAt: now,
      bindings: { notes: true, knowledge: true, study: true },
      isTemp: true,
      autoCreated: true,
      folderPath: undefined,
      fileSnapshotEnabled: false,
    };

    await db.projects.put(tempProject);
    console.log('[NotesEmptyState] Temp project created:', tempProject.id);
    return { id: tempProject.id, name: tempProject.name };
  } catch (error) {
    console.error('[NotesEmptyState] Failed to create temp project:', error);
    return null;
  }
}

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
  const [isCreatingTemp, setIsCreatingTemp] = useState(false);

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

  // NS-2026-01-07: Auto-create temp project and redirect
  useEffect(() => {
    const initNotesAccess = async () => {
      // If Notes-enabled projects exist, redirect to hub with project picker
      if (hasNotesProjects) {
        redirect({
          to: '/hub',
          search: {
            workspace: 'notes',
          },
        });
        return;
      }

      // If NO projects exist, auto-create temp project and navigate to it
      if (!hasAnyProjects) {
        setIsCreatingTemp(true);
        try {
          const tempProject = await ensureTempProject();
          if (tempProject) {
            // Navigate directly to Notes with temp project
            navigate({
              to: '/notes/$projectId',
              params: { projectId: tempProject.id },
            });
            return;
          }
        } catch (error) {
          console.error('[NotesEmptyState] Failed to create temp project:', error);
          toast.error('Failed to create Quick Notes project. Please try again.');
        } finally {
          setIsCreatingTemp(false);
        }
      }
    };

    initNotesAccess();
  }, [hasNotesProjects, hasAnyProjects, navigate]);

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
          {isCreatingTemp || isEnabling ? (
            <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
          ) : (
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center">
          {isCreatingTemp ? 'Setting up Quick Notes...' : t('notes.emptyState.title')}
        </h1>

        {/* Description */}
        {!isCreatingTemp && (hasAnyProjects ? (
          <p className="text-muted-foreground text-center">
            {t('notes.emptyState.hasProjectsNoneNotes')}
          </p>
        ) : (
          <p className="text-muted-foreground text-center">
            {t('notes.emptyState.noProjects')}
          </p>
        ))}

        {/* Action Buttons */}
        {!isCreatingTemp && (
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
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          {isCreatingTemp ? 'Creating your Quick Notes space...' : t('notes.emptyState.helpText')}
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
