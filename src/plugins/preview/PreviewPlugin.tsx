/**
 * @fileoverview Preview Plugin - Dev Server Preview
 * @module plugins/preview/PreviewPlugin
 *
 * **CC-AR-06**: Preview Plugin Implementation
 */

import React, { lazy, Suspense } from 'react';
import { Monitor } from 'lucide-react';

// Plugin system
import type { FeaturePlugin, PluginMainProps } from '@/domain/interfaces/feature-plugin.interface';

const PreviewMain = lazy(() => import('./PreviewMain'));

function PreviewMainWrapper(props: PluginMainProps) {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-sm animate-pulse">
          Loading preview...
        </div>
      }
    >
      <PreviewMain {...props} />
    </Suspense>
  );
}

/**
 * Preview Feature Plugin
 *
 * @remarks
 * Implements FeaturePlugin interface per ADR-034 Section 3.
 * Registered in plugin-registry at app startup.
 *
 * Critical Constraints (per CORRECT-COURSE Part 8.3):
 * - Desktop ONLY (blocked on mobile per ADR-033)
 * - FSA storage ONLY (IndexedDB has no file system access)
 */
export const previewPlugin: FeaturePlugin = {
  // ========================================================================
  // Identity
  // ========================================================================

  id: 'preview',
  name: 'Preview',
  icon: React.createElement(Monitor, { size: 16 }),
  description: 'Preview running dev server',

  // ========================================================================
  // Requirements
  // ========================================================================

  requirements: {
    storageType: 'fsa', // FSA ONLY - Needs real files for dev server
    deviceType: 'desktop', // Desktop ONLY - Mobile blocked per ADR-033
    minWidth: 300, // Minimum 300px width for preview
    maxInstances: 1, // Only one preview instance needed
  },

  // ========================================================================
  // Rendering
  // ========================================================================

  MainComponent: PreviewMainWrapper,

  // No sidebar or toolbar components for POC
  // SidebarComponent: undefined,
  // ToolbarComponent: undefined,

  // ========================================================================
  // Lifecycle Hooks (POC: Minimal implementation)
  // ========================================================================

  onMount: async (context) => {
    console.log('[PreviewPlugin] Mounted for project:', context.projectId);
    // Preview will listen for dev-server-ready event when component mounts
  },

  onUnmount: async () => {
    console.log('[PreviewPlugin] Unmounted');
    // Cleanup if needed - iframe is disposed with component
  },

  onProjectChange: async (newProjectId) => {
    console.log('[PreviewPlugin] Project changed to:', newProjectId);
    // Preview will reset on project change via component re-render
  },
};
