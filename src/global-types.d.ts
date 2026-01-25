/**
 * Global Type Declarations
 *
 * Type augmentations for experimental browser APIs.
 */

declare global {
  // ============================================================================
  // TanStack Router State Extension
  // ============================================================================

  /**
   * Augment TanStack Router's HistoryState to include custom FSA handle
   *
   * CC-03.5 FIX (2026-01-25): Properly extend BOTH modules to ensure
   * navigate() accepts fsaHandle in state parameter.
   *
   * TanStack Router internally imports HistoryState from @tanstack/history,
   * but the navigate() function type checking also needs the react-router
   * module augmentation for full TypeScript compatibility.
   *
   * @see HubHomePage.tsx - handleProjectCreated()
   * @see ProjectsPage.tsx - handleProjectCreated()
   * @see ide.$projectId.tsx - IDEWorkspace()
   * @see EPIC-ARCH-04-CC-AUDIT-AND-TAKEOVER-2026-01-25.md
   */
  module '@tanstack/history' {
    interface HistoryState {
      fsaHandle?: FileSystemDirectoryHandle | null;
    }
  }

  /**
   * CC-03.5 FIX: Also augment @tanstack/react-router to ensure navigate()
   * type inference correctly accepts our custom state shape.
   */
  module '@tanstack/react-router' {
    interface HistoryState {
      fsaHandle?: FileSystemDirectoryHandle | null;
    }
  }

  // ============================================================================
  // File System Access API
  // ============================================================================

  interface Window {
    showDirectoryPicker(options?: {
      id?: string;
      mode?: 'read' | 'readwrite';
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(options?: {
      multiple?: boolean;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
      id?: string;
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemFileHandle[]>;
    showSaveFilePicker(options?: {
      suggestedName?: string;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
      id?: string;
      startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }): Promise<FileSystemFileHandle>;
  }

  // ============================================================================
  // WebGPU API
  // ============================================================================

  interface GPU {
    requestAdapter(): Promise<GPUAdapter | null>;
  }

  interface Navigator {
    readonly gpu?: GPU;
  }
}

export { };
