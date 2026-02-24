/**
 * @fileoverview Monaco Module Definition
 * @description Monaco code editor module for the platform.
 * 
 * **Strangler Fig Pattern**: Wraps existing implementation.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 * 
 * @module modules/monaco
 * @layer modules
 */

import type { IFeatureModule } from '../types';
import { MonacoModule } from './MonacoModule';

/**
 * Monaco Module - Code editor with syntax highlighting
 * 
 * Features:
 * - Real Monaco Editor integration
 * - Syntax highlighting for multiple languages
 * - Auto-save with debouncing
 * - File event bus integration
 * - Plugin coordination support
 */
const monacoModule: IFeatureModule = {
  id: 'monaco',
  name: 'Code Editor',
  icon: 'code',
  description: 'Monaco-based code editor with syntax highlighting',
  component: MonacoModule,
  requiresProject: true,
  supportsOffline: true,
  
  onMount: async (projectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Monaco] Mounted for project: ${projectId}`);
    }
    // Future: Initialize Monaco environment if needed
  },
  
  onUnmount: () => {
    if (import.meta.env.DEV) {
      console.log('[Monaco] Unmounted');
    }
    // Future: Cleanup Monaco resources
  },
  
  onProjectChange: async (newProjectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Monaco] Project changed to: ${newProjectId}`);
    }
    // Future: Reload files for new project
  },
};

export default monacoModule;
