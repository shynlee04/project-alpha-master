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
   * PHASE-4-V4 FIX: Allows passing FileSystemDirectoryHandle via navigation state
   * to avoid async restoration delay and second picker dialog.
   *
   * @see HubHomePage.tsx - handleNewProject()
   * @see ide.$projectId.tsx - IDEWorkspace()
   */
  module '@tanstack/history' {
    interface HistoryState {
      fsaHandle?: FileSystemDirectoryHandle;
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

export {};
