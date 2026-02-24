/**
 * @fileoverview PlatformProvider - Core context for platform layer
 * @module @/platform/core/platform-context
 *
 * This is SIMPLE - no complex hydration, no store-driven state.
 * Platform is either loading or ready, that's it.
 *
 * PHASE R-0: Foundation context for Strategic Rebuild
 * NO workspaceId - use projectId only
 *
 * @created 2026-02-02
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Project, PlatformCapabilities } from '@/platform/types';
import { detectPlatform } from '@/platform/types';

/**
 * Platform context value type
 * Provides platform capabilities, project state, and actions
 */
interface PlatformContextValue {
  // Platform capabilities (immutable after detection)
  readonly platform: PlatformCapabilities;

  // Project state
  readonly project: Project | null;
  readonly projectId: string;
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Actions
  loadProject: (projectId: string) => Promise<void>;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);
PlatformContext.displayName = 'PlatformContext';

interface PlatformProviderProps {
  /** Current project ID from route params */
  projectId: string;
  /** Child components */
  children: ReactNode;
}

/**
 * PlatformProvider Component
 *
 * Provides platform context to all child components.
 * Handles project loading and platform capability detection.
 *
 * @example
 * ```tsx
 * <PlatformProvider projectId={projectId}>
 *   <PlatformLayout>
 *     <Outlet />
 *   </PlatformLayout>
 * </PlatformProvider>
 * ```
 */
export function PlatformProvider({
  projectId,
  children,
}: PlatformProviderProps): React.JSX.Element {
  // Platform detection (runs once on mount)
  const [platform] = useState<PlatformCapabilities>(() => detectPlatform());

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load project by ID
   * TODO: R-2 will implement actual Dexie loading
   */
  const loadProject = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: R-2 will implement actual loading from Dexie
      // For now, simulate project loading
      console.log('[PlatformProvider] Loading project:', id);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create minimal project stub for R-0
      // Real implementation in R-2 will query Dexie
      const stubProject: Project = {
        id,
        name: `Project ${id.substring(0, 8)}`,
        storageType: platform.hasFileSystemAccess ? 'fsa' : 'indexeddb',
        settings: {
          enabledModules: ['monaco', 'notes'],
          defaultModule: 'monaco',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setProject(stubProject);
      console.log('[PlatformProvider] Project loaded:', stubProject.name);
    } catch (err) {
      const loadError =
        err instanceof Error ? err : new Error('Failed to load project');
      setError(loadError);
      console.error('[PlatformProvider] Load error:', loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [platform.hasFileSystemAccess]);

  // Load project when projectId changes
  useEffect(() => {
    if (projectId) {
      void loadProject(projectId);
    }
  }, [projectId, loadProject]);

  const value: PlatformContextValue = {
    platform,
    project,
    projectId,
    isLoading,
    error,
    loadProject,
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

/**
 * Hook to access platform context
 * Throws if used outside PlatformProvider
 *
 * @throws {Error} If used outside PlatformProvider
 *
 * @example
 * ```tsx
 * const { projectId, isLoading, platform } = usePlatform();
 * ```
 */
export function usePlatform(): PlatformContextValue {
  const context = useContext(PlatformContext);

  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }

  return context;
}

/**
 * Safe hook to access platform context
 * Returns null if used outside PlatformProvider (no throw)
 *
 * @example
 * ```tsx
 * const platform = usePlatformSafe();
 * if (platform) {
 *   // Safe to use platform context
 * }
 * ```
 */
export function usePlatformSafe(): PlatformContextValue | null {
  return useContext(PlatformContext);
}
