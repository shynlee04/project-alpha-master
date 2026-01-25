/**
 * @fileoverview Monaco Plugin - Simplified POC Version
 * @module plugins/monaco/MonacoPlugin
 *
 * **ARCH-02-05**: Monaco Feature Plugin (POC Simplified)
 *
 * Simplified version for proof of concept.
 * Uses ProjectContext.gateway directly for file operations.
 * Integrates with @monaco-editor/react.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-05
 * @team Team B
 * @created 2026-01-21
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Code2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Monaco editor (full integration will come later - POC placeholder)
// import Editor from '@monaco-editor/react';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

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
  const [activePath, _setActivePath] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [isLoading, _setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);

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

  // Load file when FileTree triggers openFile via ProjectContext
  useEffect(() => {
    // Listen for file opening from FileTree or other sources
    // For POC, this is a placeholder - full integration would
    // listen to ProjectContext.openFile changes

    // Example: when FileTree selects a file, it calls context.openFile(path)
    // This effect would detect that and load the file
    console.log('[MonacoPlugin] Listening for file open events');
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
    <div className="h-full flex flex-col" style={{ width, height }}>
      {/* Editor Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{fileName}</span>
          {isModified && <span className="text-orange-500">●</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={!isModified}
          className="rounded-none bg-blue-600 text-white px-2 py-0.5 text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('ide.save')}
        </button>
      </div>

      {/* Editor Content (POC: Textarea placeholder for Monaco) */}
      {/* In full implementation, this would be <Editor /> from @monaco-editor/react */}
      <div className="flex-1 overflow-auto p-4 bg-background">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsModified(true);
          }}
          className="w-full h-full bg-transparent text-foreground font-mono text-sm resize-none outline-none border-none"
          style={{
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          spellCheck={false}
          autoFocus
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
