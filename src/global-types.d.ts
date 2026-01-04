/**
 * Global Type Declarations
 *
 * Type augmentations for experimental browser APIs.
 */

declare global {
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
