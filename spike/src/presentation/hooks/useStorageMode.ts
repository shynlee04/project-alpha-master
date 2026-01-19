/**
 * @fileoverview useStorageMode Hook
 * @module presentation/hooks/useStorageMode
 *
 * Hook to detect and expose storage mode for current project.
 * Integrates with platform contract and project store.
 *
 * Provides:
 * - storageMode: 'fsa' | 'indexeddb'
 * - platform: 'desktop' | 'mobile' | 'tablet'
 * - isFSA: boolean
 * - isBrowserDB: boolean
 * - storageLabel: 'FSA' | 'BrowserDB'
 *
 * @epic EPIC-CC-DESKTOP-FSA (Desktop FSA Migration)
 * @story CC-DF-04 - User Experience Updates
 * @created 2026-01-18
 */

import { useMemo } from 'react';
import { getPlatformContract } from '@/infrastructure/filesystem/platform-contract';
import type { Project } from '@/infrastructure/persistence/stores/project/project-types';

// ============================================================================
// Storage Mode Hook Return Type
// ============================================================================

export interface StorageMode {
  /** Storage type: 'fsa' | 'indexeddb' */
  storageMode: 'fsa' | 'indexeddb';

  /** Platform device type: 'desktop' | 'mobile' | 'tablet' */
  platform: 'desktop' | 'mobile' | 'tablet';

  /** Whether using FSA storage */
  isFSA: boolean;

  /** Whether using BrowserDB (IndexedDB) storage */
  isBrowserDB: boolean;

  /** Display label: 'FSA' or 'BrowserDB' */
  storageLabel: 'FSA' | 'BrowserDB';

  /** Platform-specific storage description */
  storageDescription: string;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to detect storage mode for a given project
 *
 * @param project - The project to check storage mode for
 * @returns Storage mode information
 *
 * @example
 * ```tsx
 * const project = useActiveProject();
 * const { storageMode, storageLabel, isFSA } = useStorageMode(project);
 *
 * return (
 *   <div>
 *     Storage: {storageLabel}
 *     {isFSA && '(File System Access API)'}
 *   </div>
 * );
 * ```
 */
export function useStorageMode(project: Project | null): StorageMode {
  const platform = useMemo(() => getPlatformContract(), []);

  return useMemo(() => {
    if (!project) {
      // Default to platform detection if no project
      const isFSA = platform.storageType === 'fsa';
      return {
        storageMode: platform.storageType,
        platform: platform.deviceType,
        isFSA,
        isBrowserDB: !isFSA,
        storageLabel: isFSA ? 'FSA' : 'BrowserDB',
        storageDescription: isFSA
          ? 'File System Access API - Native desktop file storage'
          : 'Browser Storage (IndexedDB) - Local browser database',
      };
    }

    // Use project's storage type if available
    const storageMode = project.storageType || platform.storageType;
    const isFSA = storageMode === 'fsa';

    return {
      storageMode,
      platform: platform.deviceType,
      isFSA,
      isBrowserDB: !isFSA,
      storageLabel: isFSA ? 'FSA' : 'BrowserDB',
      storageDescription: isFSA
        ? 'File System Access API - Native desktop file storage'
        : 'Browser Storage (IndexedDB) - Local browser database',
    };
  }, [project, platform]);
}
