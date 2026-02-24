/**
 * @fileoverview Terminal Module Component
 * @description Wrapper component for terminal.
 * 
 * **Strangler Fig Pattern**: Wraps existing TerminalMain.
 * **NO-WORKSPACE COMPLIANT**: Uses projectId only.
 * 
 * @module modules/terminal
 * @layer modules
 */

import type { ModuleProps } from '../types';
// Import the existing Terminal implementation (Strangler Fig)
import TerminalMain from '@/plugins/terminal/TerminalMain';

/**
 * Terminal Module - Wrapper for existing implementation
 * 
 * This thin wrapper allows us to:
 * 1. Conform to IFeatureModule interface
 * 2. Add any project-specific props
 * 3. Handle module lifecycle
 * 4. Future: Gradual migration of internals
 * 
 * @param props - Module props with projectId and className
 * @returns Terminal component
 */
export function TerminalModule({ projectId, className }: ModuleProps) {
  // TerminalMain gets project context via ProjectContextProvider
  // It doesn't take projectId directly - it uses useProjectContext()
  return (
    <div 
      className={className} 
      data-module="terminal" 
      data-project={projectId}
      style={{ height: '100%', width: '100%' }}
    >
      <TerminalMain />
    </div>
  );
}
