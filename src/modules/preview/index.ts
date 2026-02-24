/**
 * @fileoverview Preview Module Definition
 * @description Live preview module for dev server output.
 *
 * **Strangler Fig Pattern**: Wraps existing implementation.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 *
 * @module modules/preview
 * @layer modules
 */

import type { IFeatureModule } from '../types';
import { PreviewModule } from './PreviewModule';

/**
 * Preview Module - Dev server preview
 *
 * Features:
 * - Live iframe preview of running dev server
 * - URL bar with refresh controls
 * - External link to open in new tab
 * - Empty state when no server running
 *
 * Constraints:
 * - Desktop ONLY (blocked on mobile per ADR-033)
 * - FSA storage ONLY (needs real file system)
 */
const previewModule: IFeatureModule = {
  id: 'preview',
  name: 'Preview',
  icon: 'eye',
  description: 'Live preview of development server',
  component: PreviewModule,
  requiresProject: true,
  supportsOffline: false, // Needs dev server

  onMount: async (projectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Preview] Mounted for project: ${projectId}`);
    }
  },

  onUnmount: () => {
    if (import.meta.env.DEV) {
      console.log('[Preview] Unmounted');
    }
  },

  onProjectChange: async (newProjectId) => {
    if (import.meta.env.DEV) {
      console.log(`[Preview] Project changed to: ${newProjectId}`);
    }
  },
};

export default previewModule;
