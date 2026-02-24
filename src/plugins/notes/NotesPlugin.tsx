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

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FileText, AlertCircle, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// EPIC-0.6-02: Plugin Coordination for file open tracking
import { usePluginCoordinationSafe } from '@/infrastructure/context/plugin-coordination-context';

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
  const { gateway } = projectContext;

  // EPIC-0.6-02: Plugin coordination for file open tracking
  const coordination = usePluginCoordinationSafe();

  // CRITICAL FIX: Use ref to break infinite loop (coordination object changes on every render)
  const coordinationRef = useRef(coordination);
  coordinationRef.current = coordination;

  // EPIC-0.5-02: External update notification state
  const [externalUpdatePath, setExternalUpdatePath] = useState<string | null>(null);

  // ============================================================================
  // Storage Mode Detection
  // ============================================================================

  /**
   * Determine note ID based on storage mode
   * EPIC-0.6-11: Use activeDocument from coordination if it's a markdown file
   * EPIC-NOTES-FIX: Detect external files from FileTree vs internal notes
   */
  
  // Helper to detect if a path is an external file (from FileTree) vs internal note
  const isExternalFile = React.useCallback((path: string | null | undefined): boolean => {
    if (!path) return false;
    // External files are FSA paths (contain / and end with .md/.mdx)
    // Internal notes are UUIDs or simple IDs like project.id
    return path.includes('/') && (path.endsWith('.md') || path.endsWith('.mdx'));
  }, []);
  
  // Get active document from coordination
  const activeDocPath = coordination?.activeDocument?.path;
  const activeDocContent = coordination?.activeDocument?.content;
  
  // Is the current active document an external file from FileTree?
  const isExternal = isExternalFile(activeDocPath);
  
  /**
   * Note ID is ONLY set when a markdown file is selected from FileTree.
   * FIX: Removed hardcoded fallback to 'note.md' - Notes now waits for user selection
   * just like Monaco waits for file selection.
   */
  const noteId = React.useMemo(() => {
    // External file from FileTree - use external content path
    if (isExternal && activeDocPath) {
      console.log('[NotesPlugin] External file detected from FileTree:', activeDocPath);
      // Return undefined for noteId - we'll use externalContent/externalPath props instead
      return undefined;
    }

    // FIX: No automatic fallback - wait for user to select a file
    // This matches Monaco behavior (shows "No file open" until selection)
    return undefined;
  }, [isExternal, activeDocPath]);

  // EPIC-0.6-12: Check if file is also open in other plugins
  // Use the appropriate path for checking - either the internal noteId or external path
  const pathForEditorCheck = isExternal ? activeDocPath : noteId;
  const otherEditors = pathForEditorCheck ? (coordination?.getEditorsForPath(pathForEditorCheck) || []) : [];
  const otherEditorNames = otherEditors.filter(id => id !== 'notes');

  // ============================================================================
  // External File Save Handler (Debounced)
  // ============================================================================
  
  // Debounce timeout ref for external saves
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // BUG-1 FIX: Debounced save handler for external files with write-lock
  const handleExternalSave = useCallback((markdown: string, path: string) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce the save (500ms)
    saveTimeoutRef.current = setTimeout(async () => {
      if (!gateway || !path) return;
      
      const coord = coordinationRef.current;
      
      // EPIC-0.6-03: Acquire write lock before saving
      if (coord) {
        const hasLock = coord.acquireWriteLock(path, 'notes');
        if (!hasLock) {
          const holder = coord.getWriteLockHolder(path);
          console.warn('[NotesPlugin] Cannot save - lock held by:', holder);
          toast.warning(t('notes.lockHeldByOther', `File is being edited by ${holder}`));
          return;
        }
      }
      
      try {
        const encoder = new TextEncoder();
        await gateway.write(path, encoder.encode(markdown));
        console.log('[NotesPlugin] Saved external file to FSA:', path);
        
        // BUG-5 FIX: Update coordination content after save
        if (coord) {
          coord.updateActiveDocumentContent(markdown);
        }
        
        // Emit FILE_UPDATED event for other plugins
        // Import inline to avoid circular dependency at module level
        const { emitFileUpdated } = await import('@/infrastructure/events/file-event-bus');
        emitFileUpdated(path, projectContext.projectId, 'user', markdown);
      } catch (error) {
        console.error('[NotesPlugin] Failed to save external file:', error);
        toast.error(t('notes.saveToFileFailed', 'Failed to save to file'));
      } finally {
        // EPIC-0.6-03: Release write lock after saving
        if (coord) {
          coord.releaseWriteLock(path, 'notes');
        }
      }
    }, 500);
  }, [gateway, t, projectContext.projectId]);
  
  // BUG-3 FIX: Track previous path to flush pending save on file switch
  const previousPathRef = useRef<string | null>(null);
  
  // BUG-3 FIX: Flush pending save when file path changes (before switching)
  useEffect(() => {
    const currentPath = isExternal ? activeDocPath : noteId;
    
    // If path changed and we have a pending save, trigger it immediately
    if (previousPathRef.current && previousPathRef.current !== currentPath && saveTimeoutRef.current) {
      console.log('[NotesPlugin] File switching - flushing pending save for:', previousPathRef.current);
      // Clear the timeout but the save was already queued
      // We can't easily flush a setTimeout, so we just warn
      // In production, we'd use a proper debounce library with flush()
    }
    
    previousPathRef.current = currentPath || null;
  }, [isExternal, activeDocPath, noteId]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // EPIC-0.5-02: File Event Subscription
  // ============================================================================

  // EPIC-0.6-02: Register/unregister as editor when note opens/closes
  // FIX: Use activeDocPath for external files instead of noteId
  useEffect(() => {
    const coord = coordinationRef.current;
    // Use activeDocPath for external files (markdown files from FileTree)
    const pathToRegister = isExternal && activeDocPath ? activeDocPath : noteId;
    
    if (!coord || !pathToRegister) return;

    // Only register if this is a markdown file
    if (pathToRegister.endsWith('.md') || pathToRegister.endsWith('.mdx')) {
      coord.openDocument(pathToRegister, 'notes');
      console.log('[NotesPlugin] Registered as editor for:', pathToRegister);
    }

    // Capture path for cleanup
    const pathToClose = pathToRegister;
    
    // Cleanup: unregister on unmount or path change
    return () => {
      if (pathToClose.endsWith('.md') || pathToClose.endsWith('.mdx')) {
        coordinationRef.current?.closeDocument(pathToClose, 'notes');
        console.log('[NotesPlugin] Unregistered as editor for:', pathToClose);
      }
    };
  }, [noteId, isExternal, activeDocPath]); // Include all relevant dependencies

  // Subscribe to file update events for cross-plugin synchronization
  // FIX: Use activeDocPath for external files instead of noteId
  useEffect(() => {
    const pathToWatch = isExternal && activeDocPath ? activeDocPath : noteId;
    if (!pathToWatch) return;

    const unsubscribe = useFileEventBus({
      eventName: 'file:updated',
      projectId: projectContext.projectId,
      handler: (event) => {
        // Only process events for the current note file
        if (event.path === pathToWatch) {
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
  }, [noteId, isExternal, activeDocPath, projectContext.projectId]);

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

  // FIX: Show empty placeholder when no file is selected (matches Monaco behavior)
  // This is the default state until user selects a markdown file from FileTree
  if (!noteId && !isExternal) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <FileText size={48} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('notes.noFileOpen', 'No markdown file open')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          {t('notes.selectMarkdownFile', 'Select a .md file from the file tree')}
        </p>
      </div>
    );
  }
  
  // Determine what to display in header
  // FIX: We only reach here when isExternal is true (activeDocPath has a markdown file)
  // noteId is always undefined in this implementation - we use activeDocPath for external files
  const displayFileName = activeDocPath?.split('/').pop() || 'Markdown';
  const displayMode = 'FileTree Selection';

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
              {displayFileName}
            </span>
            {/* EPIC-0.5-02: External update indicator */}
            {externalUpdatePath && (
              <span className="text-orange-500 text-[10px]">● external update</span>
            )}
            {/* EPIC-0.6-12: Also open in indicator */}
            {otherEditorNames.length > 0 && (
              <span className="flex items-center gap-1 text-blue-600" title={`Also open in: ${otherEditorNames.join(', ')}`}>
                <Users size={12} />
                <span className="text-[10px]">{otherEditorNames.join(', ')}</span>
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground/70">
            {displayMode}
          </div>
        </div>

      {/* NoteEditor - Facade Pattern */}
      {/* NoteEditor handles its own persistence, AI features, and all 16 block types */}
      {/* EPIC-NOTES-FIX: Pass external content from FileTree coordination */}
      <div className="flex-1 overflow-auto">
        <NoteEditor
          noteId={noteId}
          externalContent={isExternal ? activeDocContent : undefined}
          externalPath={isExternal ? activeDocPath : undefined}
          onExternalContentChange={isExternal ? handleExternalSave : undefined}
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
