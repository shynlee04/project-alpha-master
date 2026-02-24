/**
 * @fileoverview Notes Module Component
 * @description Wrapper component for Notes/BlockNote.
 * 
 * **Strangler Fig Pattern**: Wraps existing NotesPlugin.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 * 
 * @module modules/notes
 * @layer modules
 */

import type { ModuleProps } from '../types';
// Strangler Fig Pattern: Import from existing plugin location
import { notesPlugin } from '@/plugins/notes';

// Get the component from the plugin
const NotesPluginComponent = notesPlugin.MainComponent;

/**
 * Notes Module - Wrapper for existing implementation
 * 
 * This thin wrapper allows us to:
 * 1. Conform to IFeatureModule interface
 * 2. Add any project-specific props
 * 3. Handle module lifecycle
 * 4. Future: Gradual migration of internals
 * 
 * @param props - Module props with projectId and className
 * @returns Notes editor component
 */
export function NotesModule({ projectId, className }: ModuleProps) {
  // NotesPlugin gets project context via ProjectContextProvider
  // It doesn't take projectId directly - it uses useProjectContext()
  return (
    <div 
      className={className} 
      data-module="notes" 
      data-project={projectId}
      style={{ height: '100%', width: '100%' }}
    >
      <NotesPluginComponent />
    </div>
  );
}
