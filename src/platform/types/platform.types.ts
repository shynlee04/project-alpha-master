/**
 * Platform capabilities detected at runtime
 * @module @/platform/types/platform
 * 
 * NO workspaceId - use projectId only
 * Platform detection for FSA vs IndexedDB storage decisions
 */

/**
 * Runtime platform capabilities
 * Used to determine available features and storage strategies
 */
export interface PlatformCapabilities {
  /** Current device platform type */
  platform: 'desktop' | 'tablet' | 'mobile';
  /** Whether File System Access API is available */
  hasFileSystemAccess: boolean;
  /** Whether WebContainer is available (StackBlitz) */
  hasWebContainer: boolean;
}

/**
 * Storage type based on platform capabilities
 * - fsa: File System Access API (desktop)
 * - indexeddb: IndexedDB via Dexie (mobile/fallback)
 */
export type StorageType = 'fsa' | 'indexeddb';

/**
 * Detect current platform capabilities
 * @returns PlatformCapabilities object with runtime environment info
 */
export function detectPlatform(): PlatformCapabilities {
  const hasFileSystemAccess =
    typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const isMobile =
    typeof window !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const isTablet =
    typeof window !== 'undefined' &&
    /iPad|Android/i.test(navigator.userAgent) &&
    window.innerWidth >= 768;

  return {
    platform: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    hasFileSystemAccess,
    hasWebContainer: hasFileSystemAccess,
  };
}
