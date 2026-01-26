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

import React, { useEffect, useState } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// NoteEditor (facade pattern - keep in original location)
import { NoteEditor } from '@/presentation/components/notes/NoteEditor';

// EPIC-0.5-02: File event bus for reactive updates
import { useFileEventBus } from '@/infrastructure/events/file-event-bus';

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
 * Features:\n * - Display BlockNote editor with 16 custom block types\n * - Load/save content from FSA or IndexedDB\n * - Detect external file changes (FSA mode only)\n * - Auto-save with debounce (handled by NoteEditor)\n * - EPIC-0.5-02: Subscribe to file events for cross-plugin sync\n */
function NotesComponent({ width: _width, height: _height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { project, gateway } = projectContext;

  // EPIC-0.5-02: External update notification state
  const [externalUpdatePath, setExternalUpdatePath] = useState<string | null>(null);

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
  // EPIC-0.5-02: File Event Subscription
  // ============================================================================

  // Subscribe to file update events for cross-plugin synchronization
  useEffect(() => {
    if (!noteId) return;

    const unsubscribe = useFileEventBus({
      eventName: 'file:updated',
      projectId: projectContext.projectId,
      handler: (event) => {
        // Only process events for the current note file
        if (event.path === noteId || event.path.endsWith('note.md')) {
          // Skip if the event source is 'user' (came from this plugin)
          if (event.source === 'user') return;

          console.log('[NotesPlugin] External FILE_UPDATED detected:', event.path);
          setExternalUpdatePath(event.path);

          // Show toast notification
          toast.info('Note was updated externally', {
            description: 'Reload the editor to see changes',
          });
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [noteId, projectContext.projectId]);

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
            {/* EPIC-0.5-02: External update indicator */}
            {externalUpdatePath && (
              <span className="text-orange-500 text-[10px]">● external update</span>
            )}
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
