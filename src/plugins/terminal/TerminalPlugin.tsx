/**
 * @fileoverview Terminal Plugin - Main component for terminal feature
 * @module plugins/terminal/TerminalPlugin
 *
 * **ARCH-02-07**: Terminal Feature Plugin (POC Simplified)
 *
 * Simplified version for proof of concept.
 * Uses ProjectContext.gateway for WebContainer terminal access.
 * Wraps existing XTerminal and TerminalPanel components.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-07
 * @team Team B
 * @created 2026-01-21
 */

import React from 'react';
import { Terminal as TerminalIcon, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// Context
import { useProjectContext } from '@/infrastructure/context/project-context';

// Terminal components (existing - facade pattern)
import { TerminalPanel } from '@/presentation/components/terminal/TerminalPanel';

// ============================================================================
// Main Terminal Plugin Component
// ============================================================================

/**
 * Terminal Plugin - Main component for terminal feature
 *
 * @param props - PluginMainProps from plugin system
 * @returns Terminal JSX element
 *
 * @remarks
 * Receives ProjectContext through plugin system.
 * Wraps existing TerminalPanel component.
 * Simplified version for POC - integrates with WebContainer terminal.
 *
 * Features:
 * - Display xterm.js terminal with shell support
 * - Execute commands in WebContainer
 * - File system operations via terminal
 * - Multiple terminal tabs (handled by TerminalPanel)
 *
 * Constraints:
 * - Desktop ONLY (blocked on mobile per ADR-033)
 * - FSA storage ONLY (IndexedDB has no file system access)
 * - Requires WebContainer to be booted
 */
function TerminalComponent({ width, height }: PluginMainProps) {
  const { t } = useTranslation();

  // Get context from provider
  const projectContext = useProjectContext();
  const { project, gateway } = projectContext;

  // ============================================================================
  // Validation: Device Type
  // ============================================================================

  /**
   * Terminal is blocked on mobile per ADR-033
   */
  if (project.deviceType !== 'desktop') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center font-semibold">{t('terminal.mobileNotSupported')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          {t('terminal.desktopOnlyFeature')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Validation: Storage Type
  // ============================================================================

  /**
   * Terminal is blocked for IndexedDB (no file system access)
   * Terminal requires FSA for real file system operations
   */
  if (project.storageType !== 'fsa') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
        <AlertCircle size={32} className="mb-2 text-muted-foreground/70" />
        <p className="text-sm text-center font-semibold">{t('terminal.fsaRequired')}</p>
        <p className="text-xs text-muted-foreground/70 text-center mt-2">
          {t('terminal.fsaRequiredExplanation')}
        </p>
      </div>
    );
  }

  // ============================================================================
  // Validation: Gateway
  // ============================================================================

  /**
   * Gateway must be available for WebContainer operations
   */
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

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div
      className="h-full w-full flex flex-col overflow-auto"
    >
      {/* Terminal Header */}
      <div className="h-7 px-3 flex items-center justify-between border-b border-border/30 bg-card/30 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TerminalIcon size={16} className="text-muted-foreground/70" />
          <span className="font-semibold">{t('terminal.title')}</span>
        </div>
        <div className="text-xs text-muted-foreground/70">
          {project.name}
        </div>
      </div>

      {/* Terminal Panel - Facade Pattern */}
      {/* TerminalPanel wraps XTerminal with tab management */}
      <div className="flex-1 overflow-hidden">
        <TerminalPanel
          cwd={project.folderPath || '/project'}
          initialSyncCompleted={true} // Assume sync complete for POC
          permissionState="granted"
          className="h-full"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Terminal Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Critical Constraints (per CORRECT-COURSE Part 8.3):
 * - Desktop ONLY (blocked on mobile per ADR-033)
 * - FSA storage ONLY (IndexedDB has no file system access)
 */
export const terminalPlugin: FeaturePlugin = {
  // ========================================================================
  // Identity
  // ========================================================================

  id: 'terminal',
  name: 'Terminal',
  icon: React.createElement(TerminalIcon, { size: 16 }),
  description: 'Execute commands in WebContainer terminal',

  // ========================================================================
  // Requirements
  // ========================================================================

  requirements: {
    storageType: 'fsa', // FSA ONLY - IndexedDB has no file system access
    deviceType: 'desktop', // Desktop ONLY - Mobile blocked per ADR-033
    minWidth: 400, // Minimum 400px width for terminal
    maxInstances: 2, // Allow up to 2 terminal instances (for multiple tabs)
  },

  // ========================================================================
  // Rendering
  // ========================================================================

  MainComponent: TerminalComponent,

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
  // ========================================================================

  onMount: async (context) => {
    console.log('[TerminalPlugin] Mounted for project:', context.projectId);
    // TerminalPanel will initialize xterm.js when component mounts
    // WebContainer boot is handled by existing infrastructure
  },

  onUnmount: async () => {
    console.log('[TerminalPlugin] Unmounted');
    // Cleanup if needed - TerminalPanel handles xterm.js disposal
  },

  onProjectChange: async (newProjectId) => {
    console.log('[TerminalPlugin] Project changed to:', newProjectId);
    // Terminal will reset on project change via component re-render
  },
};

// ============================================================================
// No additional exports - plugin exported via index.ts
// ============================================================================
