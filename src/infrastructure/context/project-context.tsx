/**
 * @fileoverview Project Context Provider - Centralized project context for all plugins
 * @module infrastructure/context/project-context
 *
 * **ARCH-02-03**: Create ProjectContext Provider
 *
 * Per ADR-034 Decision D1:
 * Single ProjectContext provider that loads project data,
 * initializes storage gateway, and provides shared state to all plugins.
 *
 * Provider responsibilities:
 * - Load project from Dexie by projectId
 * - Initialize storage gateway based on storageType
 * - Create shared file tree state
 * - Provide platform contract
 * - Provide placeholder chat service (ARCH-02-08)
 * - Expose file operations (openFile, saveFile, refreshFileTree)
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-03
 * @team Team B
 * @created 2026-01-21
 */

import React, { createContext, useEffect, useState, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useProjectStore } from '@/infrastructure/persistence/stores/project/useProjectStore';
import { storageAdapterFactory } from '@/infrastructure/filesystem/StorageAdapterFactory';
import { useFileTreeStore } from '@/infrastructure/persistence/stores/file-tree-store';
import type { Project } from '@/domain/entities/project';
import type { StorageGateway } from '@/domain/interfaces/storage-gateway.interface';
import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
import type { PlatformContract } from '@/infrastructure/filesystem/storage-types';
import { detectPlatform } from '@/infrastructure/filesystem/platform-detection';
import { NULL_CHAT_SERVICE } from '@/infrastructure/services/chat-service';
import { PermissionOverlay } from '@/presentation/components/layout/PermissionOverlay';

// ============================================================================
// ProjectContext Interface (ADR-034 Specification)
// ============================================================================

/**
 * Project Context - Full definition (ARCH-02-03)
 *
 * @remarks
 * Per ADR-034 Decision D1, ProjectContext provides:
 * - Project data (project object, projectId)
 * - Storage access (gateway for file I/O)
 * - Platform info (PlatformContract for device/platform capabilities)
 * - Shared services (fileTree, chatService)
 * - Actions (openFile, saveFile, refreshFileTree)
 *
 * This is the complete definition replacing the forward reference
 * in feature-plugin.interface.ts (ARCH-02-01).
 *
 * Plugins receive this via useProjectContext() hook.
 */
export interface ProjectContext {
  // ========================================================================
  // Project Data
  // ========================================================================

  /** Complete project object from Dexie */
  project: Project;

  /** Project ID (for convenience) */
  projectId: string;

  // ========================================================================
  // Storage Access
  // ========================================================================

  /** Storage gateway for file I/O operations */
  gateway: StorageGateway;

  // ========================================================================
  // Platform Info
  // ========================================================================

  /** Platform contract with device and capability info */
  platform: PlatformContract;

  // ========================================================================
  // Shared Services
  // ========================================================================

  /** File tree state (Zustand store) */
  fileTree: ReturnType<typeof useFileTreeStore>;

  /** Chat service (placeholder - ARCH-02-08 will implement) */
  chatService: typeof NULL_CHAT_SERVICE;

  // ========================================================================
  // Actions
  // ========================================================================

  /** Open a file in project */
  openFile: (path: string) => void;

  /** Save file content to storage */
  saveFile: (path: string, content: string) => Promise<void>;

  /** Refresh file tree from storage */
  refreshFileTree: () => Promise<void>;
}

// ============================================================================
// React Context & Exports
// ============================================================================

/**
 * Project Context (Internal)
 *
 * @remarks
 * React context with null initial value.
 * Only populated after provider successfully loads project.
 */
const ProjectContextInternal = createContext<ProjectContext | null>(null);

/**
 * Project Context (Exported)
 *
 * @remarks
 * Re-exported as ProjectContext for external use.
 * This allows use-project-context.ts to import it cleanly.
 */
export const ProjectContext = ProjectContextInternal;

// ============================================================================
// Provider Component
// ============================================================================

/**
 * Project Context Provider
 *
 * @param projectId - Project ID to load
 * @param children - Child components to render
 *
 * @remarks
 * Loads project from Dexie, initializes gateway and shared state,
 * provides context to all descendants.
 *
 * Shows loading state while initializing.
 * Shows error message if project not found or load fails.
 */
export const ProjectContextProvider: React.FC<{
  projectId: string;
  children: ReactNode;
}> = ({ projectId, children }) => {
  // ========================================================================
  // Router
  // ========================================================================

  const navigate = useNavigate();

  // ========================================================================
  // State
  // ========================================================================

  const { getProject, setActiveProject } = useProjectStore();
  const fileTreeStore = useFileTreeStore(); // ✅ MOVED TO TOP LEVEL (TEAM A - ARCH-04-01)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [platform, setPlatform] = useState<PlatformContract | null>(null);
  const [gateway, setGateway] = useState<StorageGateway | null>(null);

  // ARCH-04-03 TEAM B: Permission prompt state
  const [showPermissionOverlay, setShowPermissionOverlay] = useState<boolean>(false);

  // ========================================================================
  // Initialize on Mount
  // ========================================================================

  useEffect(() => {
    async function initializeProject() {
      setLoading(true);
      setError(null);

      try {
        // 1. Get platform contract
        const platformInfo = detectPlatform();
        const platformContract: PlatformContract = {
          deviceType: platformInfo.type,
          storageType: platformInfo.storageType,
          canAccessFSA: platformInfo.isFSASupported,
          canWatchFiles: false, // TODO: Implement file watching
          canRunTerminal: platformInfo.isFSASupported && platformInfo.type === 'desktop',
          canDoAgenticCoding: platformInfo.isFSASupported && platformInfo.type === 'desktop',
          canAccessIDE: true, // IDE always accessible
        };
        setPlatform(platformContract);

        // 2. Load project from Dexie
        const loadedProject = getProject(projectId);

        if (!loadedProject) {
          setError(`Project "${projectId}" not found`);
          setLoading(false);
          return;
        }

        setProject(loadedProject);
        setActiveProject(projectId);

        // 3. Initialize gateway based on storageType
        // Use StorageAdapterFactory with projectId
        // Note: FSA handle will be retrieved from context when needed
        const storageAdapter: StorageAdapter = storageAdapterFactory.createAdapter({
          projectId,
          storageType: loadedProject.storageType,
        });

        // Create gateway from storage adapter
        // Map StorageAdapter methods to StorageGateway interface
        const storageGateway: StorageGateway = {
          read: async (path) => {
            const result = await storageAdapter.readFile(path);
            if (result.text !== undefined) {
              return new TextEncoder().encode(result.text);
            } else {
              return result.data;
            }
          },
          write: async (path, data) => {
            await storageAdapter.writeFile(path, data);
          },
          delete: async (path) => {
            await storageAdapter.deleteFile(path);
          },
          list: async (path) => {
            const files = await storageAdapter.listFiles(path);
            return files.map((file) => ({
              path: file,
              kind: 'file',
              size: 0,
              lastModified: 0,
            }));
          },
          exists: async (path) => {
            return await storageAdapter.exists(path);
          },
          watch: () => {
            // TODO: Implement file watching
            return { dispose: () => {} };
          },
        };

        setGateway(storageGateway);

        // 4. Initialize file tree state (using top-level hook)
        // fileTreeStore is already available from component top level

        // Load initial file tree
        const entries = await storageGateway.list('.');
        // Use top-level fileTreeStore directly
        if (fileTreeStore.load) {
          fileTreeStore.load(entries);
        }

        setLoading(false);
      } catch (err) {
        setError(`Failed to load project: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    }

    initializeProject();
  }, [projectId]);

  // ========================================================================
  // Action Implementations
  // ========================================================================

  const refreshFileTree = useCallback(async () => {
    if (!gateway) return;
    const entries = await gateway.list('.');
    if (fileTreeStore.load) {
      fileTreeStore.load(entries);
    }
  }, [gateway, fileTreeStore]);

  const openFile = useCallback((path: string) => {
    console.log('[ProjectContext] Opening file:', path);
    // TODO: Implement file opening logic
    // This will open file in Monaco editor or BlockNote
    // For now, just log
  }, []);

  const saveFile = useCallback(async (path: string, content: string) => {
    if (!gateway) return;
    const data = new TextEncoder().encode(content);
    await gateway.write(path, data);
    await refreshFileTree();
  }, [gateway, refreshFileTree]);

  // Only provide context value when everything is loaded
  const contextValue: ProjectContext | null = (loading || error || !project || !platform || !gateway)
    ? null
    : {
        project,
        projectId,
        gateway: gateway!,
        platform: platform!,
        fileTree: fileTreeStore, // ✅ Use top-level hook result directly
        chatService: NULL_CHAT_SERVICE,
        openFile,
        saveFile,
        refreshFileTree,
      };

  // ========================================================================
  // Render
  // ========================================================================

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="rounded-none border-2 border-red-500 bg-white p-6 shadow-4">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Project</h2>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="mt-4 rounded-none bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              Go to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}

      {/* ARCH-04-03 TEAM B: Permission Overlay */}
      {showPermissionOverlay && project && (
        <PermissionOverlay
          projectId={project.id}
          projectName={project.name}
          onPermissionGranted={async (_handle) => {
            // Handle granted - store and restart initialization
            setShowPermissionOverlay(false);

            // Trigger project reload with handle
            // TODO: This needs proper FSA handle persistence integration (ARCH-04-02)
            // For now, just hide overlay
          }}
          onCancel={() => {
            // Cancel - navigate back to hub
            setShowPermissionOverlay(false);
            navigate({ to: '/' });
          }}
        />
      )}
    </ProjectContext.Provider>
  );
};

// ============================================================================
// Hook for accessing ProjectContext
// ============================================================================

/**
 * Hook to access ProjectContext
 *
 * @throws Error if called outside ProjectContextProvider
 * @returns ProjectContext value
 */
export function useProjectContext(): ProjectContext {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProjectContext must be used within ProjectContextProvider');
  }

  return context;
}

/**
 * Safe version of useProjectContext that returns null instead of throwing
 *
 * Use this in components that may be rendered both inside and outside
 * of ProjectContextProvider (e.g., components in header that can appear
 * in non-project routes like the Hub).
 *
 * @returns Project context value or null if outside ProjectContextProvider
 */
export function useProjectContextSafe(): ProjectContext | null {
  const context = useContext(ProjectContext);
  return context ?? null;
}

// ============================================================================
// No additional exports
// ============================================================================
