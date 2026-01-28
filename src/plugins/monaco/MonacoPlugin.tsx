/**
 * @fileoverview Monaco Plugin - Code Editor with Full Monaco Integration
 * @module plugins/monaco/MonacoPlugin
 *
 * **CC-AR-05**: Replace Monaco POC with Real Monaco Editor
 */

import React, { lazy, Suspense } from 'react';
import { Code2 } from 'lucide-react';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

const MonacoMain = lazy(() => import('./MonacoMain'));

function MonacoMainWrapper(props: PluginMainProps) {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-sm animate-pulse">
          Loading editor...
        </div>
      }
    >
      <MonacoMain {...props} />
    </Suspense>
  );
}

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

  MainComponent: MonacoMainWrapper,

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
  // ========================================================================

  onMount: async (context) => {
    if (import.meta.env.DEV) {
      console.log('[MonacoPlugin] Mounted for project:', context.projectId);
    }
    // Monaco editor will load when user selects a file
  },

  onUnmount: async () => {
    if (import.meta.env.DEV) {
      console.log('[MonacoPlugin] Unmounted');
    }
    // Cleanup if needed
  },

  onProjectChange: async (newProjectId) => {
    if (import.meta.env.DEV) {
      console.log('[MonacoPlugin] Project changed to:', newProjectId);
    }
    // Clear editor state on project change
    // In full implementation, this would close all open tabs
  },
};
