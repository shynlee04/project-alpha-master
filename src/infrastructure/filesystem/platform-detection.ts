/**
 * @fileoverview Platform Detection - Platform detection utilities
 * @module infrastructure/filesystem/platform-detection
 *
 * Provides functions for detecting platform capabilities:
 * - File System Access API support
 * - WebContainer support
 * - Device type detection
 * - Optimal storage type selection
 *
 * @epic EPIC-CC-01 - Project Space Foundation
 * @story PS-02-A - Platform Detection & Storage Routing
 */

import type { PlatformInfo, PlatformType, StorageType, StorageCapabilities } from './storage-types';

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Check if File System Access API is supported
 * 
 * FSA is supported in:
 * - Chrome 86+
 * - Edge 86+
 * - Opera 72+
 * - Safari 15.2+ (partial support)
 * 
 * @returns true if showDirectoryPicker is available
 */
export function isFSASupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'showDirectoryPicker' in window;
}

/**
 * Check if WebContainer API is available
 * 
 * WebContainer requires:
 * - SharedArrayBuffer support
 * - Cross-Origin-Isolated (COOP/COEP headers)
 * 
 * @returns true if WebContainer can boot
 */
export function isWebContainerSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hasSharedArrayBuffer = typeof window.SharedArrayBuffer !== 'undefined';
  const isIsolated = window.crossOriginIsolated === true;

  return hasSharedArrayBuffer && isIsolated;
}

/**
 * Check if device is mobile based on user agent
 * 
 * Note: This is a fallback. Prefer useDeviceType() hook for React components.
 * User agent detection can be unreliable due to bot detection and spoofing.
 * 
 * @returns true if user agent indicates mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  
  // Check for common mobile indicators
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /IEMobile/i,
    /Opera Mini/i,
    /Mobile/i,
    /mobile/i,
  ];

  return mobilePatterns.some(pattern => pattern.test(ua));
}

/**
 * Check if device is a tablet
 * 
 * @returns true if user agent indicates tablet
 */
export function isTabletDevice(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  
  // Tablet patterns (iPad is included here, not in mobile)
  const tabletPatterns = [
    /iPad/i,
    /Tablet/i,
    /Nexus 10/i,
    /Nexus 7/i,
    /GT-N5110/i,
    /SM-T/i,
  ];

  return tabletPatterns.some(pattern => pattern.test(ua));
}

/**
 * Check if device is desktop (not mobile or tablet)
 * 
 * @returns true if device appears to be desktop
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice() && !isTabletDevice();
}

/**
 * Get the device type as PlatformType
 * 
 * @returns 'desktop' | 'mobile' | 'tablet'
 */
export function getDeviceType(): PlatformType {
  if (isTabletDevice()) {
    return 'tablet';
  }
  if (isMobileDevice()) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Check if device can write to file system
 * 
 * Desktop devices with FSA support can write.
 * Mobile devices use IndexedDB (no file system access).
 * 
 * @returns true if device supports file system writes
 */
export function canWriteToFileSystem(): boolean {
  return isFSASupported() && isDesktopDevice();
}

// ============================================================================
// Storage Type Detection
// ============================================================================

/**
 * Get the optimal storage type for the current platform
 * 
 * Logic:
 * - Desktop with FSA → 'fsa' (use File System Access)
 * - Desktop without FSA → 'indexeddb' (fallback)
 * - Mobile/Tablet → 'indexeddb' (no file system access)
 * - WebContainer → 'indexeddb' (preview only)
 * 
 * @returns Optimal storage type for this platform
 */
export function getOptimalStorageType(): StorageType {
  // Desktop with FSA support uses FSA
  if (isFSASupported() && isDesktopDevice()) {
    return 'fsa';
  }

  // Everything else uses IndexedDB
  return 'indexeddb';
}

/**
 * Get the optimal storage type for a given device type
 * 
 * @param deviceType - The device type to check
 * @returns Optimal storage type for the device
 */
export function getStorageTypeForDevice(deviceType: PlatformType): StorageType {
  switch (deviceType) {
    case 'desktop':
      // Desktop can use FSA if supported
      return isFSASupported() ? 'fsa' : 'indexeddb';
    case 'tablet':
    case 'mobile':
      // Mobile/tablet always use IndexedDB (no file system access)
      return 'indexeddb';
    default:
      return 'indexeddb';
  }
}

// ============================================================================
// Platform Information
// ============================================================================

/**
 * Detect platform information
 * 
 * Combines all detection functions into a single PlatformInfo object.
 * 
 * @returns Complete platform information
 */
export function detectPlatform(): PlatformInfo {
  const deviceType = getDeviceType();
  const supportsFSA = isFSASupported();
  const supportsWebContainer = isWebContainerSupported();
  const canWrite = canWriteToFileSystem();
  const storageType = getStorageTypeForDevice(deviceType);

  return {
    type: deviceType,
    isFSASupported: supportsFSA,
    isWebContainer: supportsWebContainer,
    canWrite,
    storageType,
  };
}

/**
 * Detect platform capabilities
 * 
 * Provides detailed capability information for a platform.
 * Useful for feature flags and conditional rendering.
 * 
 * @returns Storage capabilities for the current platform
 */
export function detectCapabilities(): StorageCapabilities {
  const platform = detectPlatform();

  return {
    supportsFSA: platform.isFSASupported,
    supportsWebContainer: platform.isWebContainer,
    hasPersistentStorage: true,
    storageQuota: 0, // 0 = unknown (browser handles quota)
    deviceType: platform.type,
  };
}

// ============================================================================
// React Hook Integration (for use in components)
// ============================================================================

/**
 * Create a React hook-compatible platform detection function
 * 
 * This is designed to be used with useState/useEffect in React components.
 * For most cases, prefer using the existing useCapabilityDetection() hook.
 * 
 * @returns Current platform info (static, doesn't re-render)
 */
export function createPlatformDetector() {
  let cachedPlatform: PlatformInfo | null = null;
  let cacheTime: number = 0;
  const CACHE_DURATION = 5000; // 5 seconds

  /**
   * Get platform info (with caching)
   */
  function getPlatform(): PlatformInfo {
    const now = Date.now();

    // Return cached value if still valid
    if (cachedPlatform && (now - cacheTime) < CACHE_DURATION) {
      return cachedPlatform;
    }

    // Detect and cache
    cachedPlatform = detectPlatform();
    cacheTime = now;

    return cachedPlatform;
  }

  /**
   * Force refresh of cached platform info
   */
  function refresh(): PlatformInfo {
    cachedPlatform = null;
    cacheTime = 0;
    return getPlatform();
  }

  /**
   * Invalidate cache (call when visibility changes, etc.)
   */
  function invalidate(): void {
    cachedPlatform = null;
    cacheTime = 0;
  }

  return {
    getPlatform,
    refresh,
    invalidate,
    isSupported: isFSASupported,
    isWebContainerSupported,
    getDeviceType,
    getOptimalStorageType,
  };
}

// ============================================================================
// Export singleton instance for convenience
// ============================================================================

/**
 * Platform detector singleton
 * 
 * Use this for non-React code that needs platform detection.
 * For React components, use useCapabilityDetection() instead.
 */
export const platformDetector = createPlatformDetector();
