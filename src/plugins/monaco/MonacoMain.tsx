/**
 * @fileoverview Monaco Plugin Main Component - Code Editor with Full Monaco Integration
 * @module plugins/monaco/MonacoMain
 *
 * **CC-AR-05**: Replace Monaco POC with Real Monaco Editor
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Code2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Monaco Editor (CC-AR-05: Real Monaco integration)
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

// Plugin system
import type { PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// Event bus for file open events (CC-AR-05)
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// EPIC-0.5-02: File event bus for reactive updates
import { useFileEventBus } from '@/infrastructure/events/file-event-bus';

// ============================================================================
// Language Detection (Monaco Syntax Highlighting)
// ============================================================================

const getLanguage = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    md: 'markdown',
    css: 'css',
    html: 'html',
    py: 'python',
    rs: 'rust',
    go: 'go',
  };

  return languageMap[ext] || 'plaintext';
};

// ============================================================================
// Main Monaco Plugin Component
// ============================================================================

/**
 * Monaco Plugin - Main component for code editor feature
 *
 * @param props - PluginMainProps from plugin system
 * @returns Monaco JSX element
 *
 * @remarks
 * Receives ProjectContext through plugin system.
 * Uses gateway for file operations.
 * Simplified version for POC - includes file loading, basic editor, and save.
 *
 * Features:
 * - Display code editor with syntax highlighting
 * - Load files from project storage
 * - Save files to storage
 * - Tab interface for multiple open files
 * - Language detection based on file extension
 */
function MonacoMain({ width: _width, height: _height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { gateway, saveFile, markDirty, markClean } = projectContext;

  // Local state for Monaco-specific UI
  const [activePath, setActivePath] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // EPIC-0.5-03: Save status for visual feedback
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Theme detection for light/dark mode support
  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs';

  // ============================================================================
  // Auto-Save (Debounced, In-Component)
  // ============================================================================

  const debouncedSave = useCallback(
    (newContent: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        if (!activePath || !gateway) return;

        setIsSaving(true);

        try {
          const encoded = new TextEncoder().encode(newContent);
          await gateway.write(activePath, encoded);
          markClean(activePath);
          setIsModified(false);
          setLastSaved(new Date());
          console.log('[MonacoPlugin] Auto-saved:', activePath);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError(`Auto-save failed: ${message}`);
          console.error('[MonacoPlugin] Auto-save failed:', err);
        } finally {
          setIsSaving(false);
        }
      }, 500);
    },
    [activePath, gateway, markClean]
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // Actions
  // ============================================================================

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newContent = value ?? '';
      setContent(newContent);
      setIsModified(true);
      if (activePath) {
        markDirty(activePath);
      }
      debouncedSave(newContent);
    },
    [activePath, debouncedSave, markDirty]
  );

  /**
   * Save file content to storage (manual Ctrl+S)
   */
  const handleSave = useCallback(async () => {
    if (!gateway || !activePath) {
      return;
    }

    try {
      // Immediate save (bypasses debounce)
      setIsSaving(true);
      await saveFile(activePath, content);
      setIsModified(false);
      markClean(activePath); // Mark clean after manual save
      setLastSaved(new Date());

      console.log('[MonacoPlugin] Saved file (manual):', activePath);
    } catch (err) {
      setError(`Failed to save file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[MonacoPlugin] Error saving file:', err);
    } finally {
      setIsSaving(false);
    }
  }, [gateway, activePath, content, saveFile, markClean]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load file when activePath changes (CC-AR-05)
  useEffect(() => {
    if (!activePath || !gateway) return;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fileContent = await gateway.read(activePath);
        const decoder = new TextDecoder();
        setContent(decoder.decode(fileContent));
        setIsModified(false);
      } catch (err) {
        setError(`Failed to load file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('[MonacoPlugin] Error loading file:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [activePath, gateway]);

  // Keyboard shortcut for save (Cmd+S / Ctrl+S) - CC-AR-05
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Listen for FILE_OPENED events from FileTree (CC-AR-05)
  useEffect(() => {
    const unsubscribe = eventBus.on(
      DomainEventType.FILE_OPENED,
      (event: { payload: { path: string; projectId: string } }) => {
        console.log('[MonacoPlugin] Received FILE_OPENED event:', event.payload.path);
        setActivePath(event.payload.path);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // EPIC-0.5-02: Listen for FILE_UPDATED events from FileEventBus
  // When a file is externally modified or saved by another plugin,
  // reload file content if it's currently open in the editor
  useEffect(() => {
    if (!activePath) return;

    const unsubscribe = useFileEventBus({
      eventName: 'file:updated',
      projectId: projectContext.projectId,
      handler: (event) => {
        // Skip if this is the file being edited by user
        if (event.path === activePath && !isModified) {
          console.log('[MonacoPlugin] External FILE_UPDATED detected, reloading:', event.path);

          // Reload file content from storage
          (async () => {
            try {
              const data = await gateway.read(event.path);
              const content = new TextDecoder().decode(data);
              setContent(content);
              setIsModified(false); // Clear modified flag on external update

              // Show notification to user
              toast.info('File was updated externally, content reloaded');
            } catch (err) {
              console.error('[MonacoPlugin] Error reloading file:', err);
              toast.error('Failed to reload file content');
            }
          })();
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [activePath, isModified, gateway, projectContext.projectId]);

  // ============================================================================
  // Render States
  // ============================================================================

  // No gateway error state
  if (!gateway) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('ide.noFolderSelected')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          {t('ide.openFolderToView')}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive p-4">
        <AlertCircle size={32} className="mb-2" />
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  // No file loaded state
  if (!activePath) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
        <Code2 size={48} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center">{t('ide.noFileOpen')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-1">
          Select a file from the file tree to open it in the editor
        </p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p className="text-sm">{t('ide.loading')}</p>
      </div>
    );
  }

  // ============================================================================
  // Main Render
  // ============================================================================

  const fileName = activePath.split('/').pop() || activePath;

  return (
    <div className="h-full w-full flex flex-col">
      {/* Editor Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{fileName}</span>
          {isModified && <span className="text-orange-500">●</span>}
        </div>
        <div className="flex items-center gap-2">
          {/* EPIC-0.5-03: Save status indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving && <span className="animate-pulse">{t('editor.saving')}</span>}
            {!isSaving && lastSaved && (
              <span>
                {t('editor.saved')} {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={!isModified}
            className="rounded-none bg-primary text-primary-foreground px-2 py-0.5 text-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {t('ide.save')}
          </button>
        </div>
      </div>

      {/* Monaco Editor (CC-AR-05: Real Monaco integration with enhanced syntax) */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(activePath || '')}
          value={content}
          onChange={handleEditorChange}
          theme={editorTheme}
          options={{
            // Enhanced syntax highlighting options
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 14,
            lineHeight: 1.6,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            renderWhitespace: 'selection',
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 8, bottom: 8 },
            // Bracket pair colorization (enhanced syntax)
            bracketPairColorization: { enabled: true },
            // Indentation guides
            guides: { bracketPairs: true, indentation: true },
            // Code folding
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'mouseover',
          }}
        />
      </div>
    </div>
  );
}

export default MonacoMain;
