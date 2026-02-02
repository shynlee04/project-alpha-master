/**
 * @fileoverview Terminal Module Definition
 * @description Integrated terminal module using xterm.js.
 * 
 * **Strangler Fig Pattern**: Wraps existing implementation.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 * 
 * @module modules/terminal
 * @layer modules
 */

import type { IFeatureModule } from '../types';
import { TerminalModule } from './TerminalModule';

/**
 * Terminal Module - Integrated terminal
 * 
 * Features:
 * - xterm.js terminal integration
 * - WebContainer command execution
 * - File system operations
 * - Multiple terminal tabs
 */
const terminalModule: IFeatureModule = {
  id: 'terminal',
  name: 'Terminal',
  icon: 'terminal',
  description: 'Integrated terminal for command execution',
  component: TerminalModule,
  requiresProject: true,
  supportsOffline: false, // Needs WebContainer
  
  onMount: async (projectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Terminal] Mounted for project: ${projectId}`);
    }
    // Future: Initialize terminal sessions if needed
  },
  
  onUnmount: () => {
    if (import.meta.env.DEV) {
      console.log('[Terminal] Unmounted');
    }
    // Future: Kill terminal sessions
  },
  
  onProjectChange: async (newProjectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Terminal] Project changed to: ${newProjectId}`);
    }
    // Future: Update terminal working directory
  },
};

export default terminalModule;
