/**
 * @fileoverview Notes Plugin - Main component for notes/BlockNote feature
 * @module plugins/notes/NotesPlugin
 *
 * **ARCH-02-06**: Notes/BlockNote Plugin (POC Simplified)
 *
 * Simplified version for proof of concept.
 * Uses ProjectContext.gateway directly for file operations.
 * Wraps existing NoteEditor from presentation layer.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-06
 * @team Team A
 * @created 2026-01-21
 */

import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// NoteEditor (facade pattern - keep in original location)
import { NoteEditor } from '@/presentation/components/notes/NoteEditor';

// ============================================================================
// Main Notes Plugin Component
// ============================================================================

/**
 * Notes Plugin - Main component for notes/BlockNote feature
 *
 * @param props - PluginMainProps from plugin system
 * @returns Notes JSX element
 *
 * @remarks
 * Receives ProjectContext through plugin system.
 * Uses gateway for file operations.
 * Simplified version for POC - wraps NoteEditor with storage abstraction.
 *
 * Features:
 * - Display BlockNote editor with 16 custom block types
 * - Load/save content from FSA or IndexedDB
 * - Detect external file changes (FSA mode only)
 * - Auto-save with debounce (handled by NoteEditor)
 */
function NotesComponent({ width, height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { project, gateway } = projectContext;

  // ============================================================================
  // Storage Mode Detection
  // ============================================================================

  /**
   * Determine note ID based on storage mode
   */
  const noteId = React.useMemo(() => {
    // Only work with FSA mode for POC
    // IndexedDB mode integration will be added in full implementation
    if (project.storageType === 'fsa') {
      // FSA mode: Use project folder path + notes/note.md
      return `${project.folderPath}/notes/note.md`;
    } else {
      // IndexedDB mode: Use project ID as note ID
      return project.id;
    }
  }, [project]);

  // ============================================================================
  // Render States
  // ============================================================================

  // No gateway error state
  if (!gateway) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('notes.storageNotAvailable')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          {t('notes.tryReloadingProject')}
        </p>
      </div>
    );
  }

  // No note ID error state
  if (!noteId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('notes.noteNotFound')}</p>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div
      className="h-full w-full flex flex-col overflow-auto"
    >
      {/* Notes Header */}
      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText size={16} className="text-muted-foreground/70" />
          <span className="font-semibold">
            {project.storageType === 'fsa' ? 'note.md' : project.name}
          </span>
        </div>
        <div className="text-xs text-muted-foreground/70">
          {project.storageType === 'fsa' ? 'FSA Mode' : 'IndexedDB Mode'}
        </div>
      </div>

      {/* NoteEditor - Facade Pattern */}
      {/* NoteEditor handles its own persistence, AI features, and all 16 block types */}
      <div className="flex-1 overflow-auto">
        <NoteEditor
          noteId={noteId}
          readOnly={false}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Notes Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 */
export const notesPlugin: FeaturePlugin = {
  // ========================================================================
  // Identity
  // ========================================================================

  id: 'notes',
  name: 'Notes',
  icon: React.createElement(FileText, { size: 16 }),
  description: 'BlockNote editor with 16 custom block types and AI features',

  // ========================================================================
  // Requirements
  // ========================================================================

  requirements: {
    storageType: 'any', // Works with FSA and IndexedDB
    deviceType: 'any', // Works on desktop and mobile
    minWidth: 400, // Minimum 400px width for BlockNote editor
    maxInstances: 1, // Only one notes editor per project
  },

  // ========================================================================
  // Rendering
  // ========================================================================

  MainComponent: NotesComponent,

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
  // ========================================================================

  onMount: async (context) => {
    console.log('[NotesPlugin] Mounted for project:', context.projectId);
    // NoteEditor will load automatically when noteId prop changes
  },

  onUnmount: async () => {
    console.log('[NotesPlugin] Unmounted');
    // Cleanup if needed
  },

  onProjectChange: async (newProjectId) => {
    console.log('[NotesPlugin] Project changed to:', newProjectId);
    // Notes editor will reload automatically via noteId prop change
  },
};

// ============================================================================
// No additional exports - plugin exported via index.ts
// ============================================================================
