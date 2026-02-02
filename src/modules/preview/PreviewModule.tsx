/**
 * @fileoverview Preview Module Component
 * @description Wrapper component for preview iframe.
 *
 * **Strangler Fig Pattern**: Wraps existing PreviewMain.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 *
 * @module modules/preview
 * @layer modules
 */

import type { ModuleProps } from '../types';
// Import existing implementation (Strangler Fig pattern)
import PreviewMain from '@/plugins/preview/PreviewMain';

/**
 * Preview Module - Wrapper for existing implementation
 *
 * @param props - Module props with projectId and className
 * @returns Preview iframe component
 */
export function PreviewModule({ projectId, className }: ModuleProps) {
  // PreviewMain uses useProjectContext() - no direct props needed
  return (
    <div
      className={className}
      data-module="preview"
      data-project={projectId}
      style={{ height: '100%', width: '100%' }}
    >
      <PreviewMain />
    </div>
  );
}
