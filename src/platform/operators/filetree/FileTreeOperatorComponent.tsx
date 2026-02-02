/**
 * @fileoverview FileTree Operator Component
 * @module @/platform/operators/filetree/FileTreeOperatorComponent
 *
 * React component wrapper for FileTree operator.
 * Renders the FileTree UI as part of PlatformLayout.
 *
 * NO workspaceId - uses projectId only (per architecture mandate)
 *
 * @phase R-1 (Platform Layer)
 * @task R-1-01
 * @created 2026-02-02
 */

import React from 'react';
import type { OperatorProps } from '@/platform/types';

// Import the FileTree component from existing plugin (Strangler Fig)
import { fileTreePlugin } from '@/plugins/filetree';

// ============================================================================
// FileTree Operator Component
// ============================================================================

/**
 * FileTreeOperatorComponent - Platform operator UI wrapper
 *
 * Wraps the FileTree plugin component for use in PlatformLayout.
 * Receives projectId from the platform layer, not workspace context.
 *
 * @param props - OperatorProps with projectId and optional className
 * @returns FileTree JSX element
 *
 * @example
 * ```tsx
 * // Used by PlatformLayout to render FileTree panel
 * <FileTreeOperatorComponent
 *   projectId={activeProject.id}
 *   className="h-full"
 * />
 * ```
 */
export function FileTreeOperatorComponent({
  projectId: _projectId,
  className,
}: OperatorProps): React.JSX.Element {
  // Get the main component from the plugin definition
  const FileTreeMain = fileTreePlugin.MainComponent;

  return (
    <div className={className} data-operator="filetree">
      {/*
        The FileTree plugin gets project context from ProjectContext provider.
        projectId prop is available for future use if needed.
        Plugin dimensions handled by parent container.
      */}
      <FileTreeMain width={0} height={0} />
    </div>
  );
}

/**
 * Display name for React DevTools
 */
FileTreeOperatorComponent.displayName = 'FileTreeOperatorComponent';

// ============================================================================
// Exports
// ============================================================================

export default FileTreeOperatorComponent;
