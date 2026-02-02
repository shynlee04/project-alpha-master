/**
 * @fileoverview Monaco Module Component
 * @description Wrapper component for Monaco editor.
 * 
 * **Strangler Fig Pattern**: Wraps existing MonacoMain.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 * 
 * @module modules/monaco
 * @layer modules
 */

import type { ModuleProps } from '../types';
// Import the existing Monaco implementation (Strangler Fig)
import MonacoMain from '@/plugins/monaco/MonacoMain';

/**
 * Monaco Module - Wrapper for existing implementation
 * 
 * This thin wrapper allows us to:
 * 1. Conform to IFeatureModule interface
 * 2. Add any project-specific props
 * 3. Handle module lifecycle
 * 4. Future: Gradual migration of internals
 * 
 * @param props - Module props with projectId and className
 * @returns Monaco editor component
 */
export function MonacoModule({ projectId, className }: ModuleProps) {
  // MonacoMain gets project context via ProjectContextProvider
  // It doesn't take projectId directly - it uses useProjectContext()
  return (
    <div 
      className={className} 
      data-module="monaco" 
      data-project={projectId}
      style={{ height: '100%', width: '100%' }}
    >
      <MonacoMain />
    </div>
  );
}
