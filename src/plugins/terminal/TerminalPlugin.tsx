/**
 * @fileoverview Terminal Plugin - Main component for terminal feature
 * @module plugins/terminal/TerminalPlugin
 *
 * **ARCH-02-07**: Terminal Feature Plugin (POC Simplified)
 */

import React, { lazy, Suspense } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

// WebContainer manager
import { boot, isBooted } from '@/lib/webcontainer';

const TerminalMain = lazy(() => import('./TerminalMain'));

function TerminalMainWrapper(props: PluginMainProps) {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-sm animate-pulse">
          Loading terminal...
        </div>
      }
    >
      <TerminalMain {...props} />
    </Suspense>
  );
}

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

  MainComponent: TerminalMainWrapper,

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
  // ========================================================================

  onMount: async (context) => {
    console.log('[TerminalPlugin] Mounted for project:', context.projectId);

    // Boot WebContainer if not already booted
    if (!isBooted()) {
      console.log('[TerminalPlugin] Booting WebContainer...');
      await boot();
      console.log('[TerminalPlugin] WebContainer booted successfully');
    } else {
      console.log('[TerminalPlugin] WebContainer already booted');
    }
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
