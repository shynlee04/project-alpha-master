/**
 * @fileoverview Monaco Plugin - Code Editor with Full Monaco Integration
 * @module plugins/monaco/MonacoPlugin
 *
 * **CC-AR-05**: Replace Monaco POC with Real Monaco Editor
 *
 * Full Monaco Editor integration with:
 * - Syntax highlighting for TypeScript, JavaScript, JSON, CSS, HTML, etc.
 * - Language auto-detection from file extension
 * - File loading from storage gateway
 * - File saving with Cmd+S / Ctrl+S keyboard shortcut
 * - FILE_OPENED event listening for FileTree integration
 * - Dark theme (vs-dark)
 *
 * @epic EPIC-CC-AR02AR03
 * @story CC-AR-05
 * @team Team B
 * @created 2026-01-21
 * @updated 2026-01-26
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Code2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Monaco Editor (CC-AR-05: Real Monaco integration)
import Editor from '@monaco-editor/react';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// Event bus for file open events (CC-AR-05)
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

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
function MonacoComponent({ width, height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { gateway, saveFile } = projectContext;

  // Local state for Monaco-specific UI
  const [activePath, setActivePath] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [language, setLanguage] = useState<string>('plaintext');

  // ============================================================================
  // Language Detection (CC-AR-05)
  // ============================================================================

  /**
   * Detect language from file extension
   */
  const detectLanguage = useCallback((path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescriptreact',
      js: 'javascript',
      jsx: 'javascriptreact',
      json: 'json',
      md: 'markdown',
      css: 'css',
      html: 'html',
      py: 'python',
      rs: 'rust',
      go: 'go',
      yaml: 'yaml',
      yml: 'yaml',
      scss: 'scss',
      less: 'less',
      sh: 'shell',
      bash: 'shell',
    };
    return langMap[ext || ''] || 'plaintext';
  }, []);

  // ============================================================================
  // Actions
  // ============================================================================

  /**
   * Save file content to storage
   */
  const handleSave = useCallback(async () => {
    if (!gateway || !activePath) {
      return;
    }

    try {
      await saveFile(activePath, content); // Use ProjectContext.saveFile
      setIsModified(false);
      console.log('[MonacoPlugin] Saved file:', activePath);
    } catch (err) {
      setError(`Failed to save file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('[MonacoPlugin] Error saving file:', err);
    }
  }, [gateway, activePath, content, saveFile]);

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
        setLanguage(detectLanguage(activePath));
        setIsModified(false);
      } catch (err) {
        setError(`Failed to load file: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('[MonacoPlugin] Error loading file:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [activePath, gateway, detectLanguage]);

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
        <button
          onClick={handleSave}
          disabled={!isModified}
          className="rounded-none bg-primary text-primary-foreground px-2 py-0.5 text-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {t('ide.save')}
        </button>
      </div>

      {/* Monaco Editor (CC-AR-05: Real Monaco integration) */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={content}
          onChange={(value) => {
            if (value !== undefined) {
              setContent(value);
              setIsModified(true);
            }
          }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            renderWhitespace: 'selection',
          }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Monaco Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 */
export const monacoPlugin: FeaturePlugin = {
  // ========================================================================
  // Identity
  // ========================================================================

  id: 'monaco',
  name: 'Code Editor',
  icon: React.createElement(Code2, { size: 16 }),
  description: 'Edit code with syntax highlighting and IntelliSense',

  // ========================================================================
  // Requirements
  // ========================================================================

  requirements: {
    storageType: 'any', // Works with FSA and IndexedDB
    deviceType: 'desktop', // Desktop only (mobile has IDE blocked per ADR-033)
    minWidth: 400, // Minimum 400px width for code editor
    maxInstances: 1, // Only one code editor per project
  },

  // ========================================================================
  // Rendering
  // ========================================================================

  MainComponent: MonacoComponent,

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
  // ========================================================================

  onMount: async (context) => {
    console.log('[MonacoPlugin] Mounted for project:', context.projectId);
    // Monaco editor will load when user selects a file
  },

  onUnmount: async () => {
    console.log('[MonacoPlugin] Unmounted');
    // Cleanup if needed
  },

  onProjectChange: async (newProjectId) => {
    console.log('[MonacoPlugin] Project changed to:', newProjectId);
    // Clear editor state on project change
    // In full implementation, this would close all open tabs
  },
};

// ============================================================================
// No additional exports - plugin exported via index.ts
// ============================================================================
