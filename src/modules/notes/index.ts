/**
 * @fileoverview Notes Module Definition
 * @description Notes/BlockNote module with 19 custom blocks.
 * 
 * **Strangler Fig Pattern**: Wraps existing NotesPlugin.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 * 
 * @module modules/notes
 * @layer modules
 */

import type { IFeatureModule } from '../types';
import { NotesModule } from './NotesModule';

/**
 * Notes Module - Rich notes editor with AI-powered blocks
 * 
 * Features:
 * - BlockNote editor integration
 * - 19 custom block types
 * - AI-powered features
 * - Markdown file editing
 * - Auto-save with debouncing
 * - File event bus integration
 */
const notesModule: IFeatureModule = {
  id: 'notes',
  name: 'Notes',
  icon: 'book',
  description: 'BlockNote editor with 19 custom block types and AI features',
  component: NotesModule,
  requiresProject: true,
  supportsOffline: true,
  
  onMount: async (projectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Notes] Mounted for project: ${projectId}`);
    }
  },
  
  onUnmount: () => {
    if (import.meta.env.DEV) {
      console.log('[Notes] Unmounted');
    }
  },
  
  onProjectChange: async (newProjectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Notes] Project changed to: ${newProjectId}`);
    }
  },
};

export default notesModule;
