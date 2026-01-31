/**
 * @fileoverview Workspace Switcher Component (DEPRECATED)
 * @module presentation/components/common/WorkspaceSwitcher
 * @governance Story HOOKS-FIX-01: Migrate to Unified ProjectContext
 *
 * DEPRECATED (2026-01-25): Workspace navigation now handled via router directly.
 * Old ProjectContext with workspace-specific properties has been archived.
 * New ProjectContext focuses on data and storage, not workspace navigation.
 *
 * To implement workspace switching in new architecture:
 * - Use TanStack Router navigation
 * - Navigate to /ide/$projectId, /notes/$projectId, etc.
 * - Handle platform validation in route guards
 *
 * @see _bmad-ext/.archive/ProjectContext-2026-01-25.tsx for archived implementation
 */

import * as React from 'react';

// ============================================================================
// Component Props
// ============================================================================

export interface WorkspaceSwitcherProps {
  /** Additional className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * WorkspaceSwitcher (DEPRECATED)
 *
 * This component has been deprecated as part of ProjectContext migration.
 * Workspace navigation is now handled via TanStack Router directly.
 *
 * @deprecated Use router navigation instead
 * @returns Always returns null (component hidden)
 */
export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = () => {
  // Console warning for developers
  React.useEffect(() => {
    console.warn(
      '[WorkspaceSwitcher] DEPRECATED: This component is no longer functional.\n' +
      'Workspace navigation is now handled via TanStack Router.\n' +
      'See implementation in archived file: _bmad-ext/.archive/ProjectContext-2026-01-25.tsx'
    );
  }, []);

  return null;
};
