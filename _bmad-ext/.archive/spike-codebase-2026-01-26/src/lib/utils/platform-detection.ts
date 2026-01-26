/**
 * @fileoverview Platform Detection Utilities
 * @module lib/utils/platform-detection
 * @governance EPIC-10-2
 *
 * Platform detection for desktop-only features and capabilities.
 *
 * Story 10.2: Multimodal Source Vision (Desktop Only)
 */

/**
 * Check if current platform is desktop
 * Uses screen width, touch support, and user agent detection
 *
 * @returns true if running on desktop platform
 */
export function isDesktopPlatform(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side = not desktop
  }

  // Check for touch support (mobile/tablet typically have touch)
  const hasTouchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check screen width (desktop typically > 1024px)
  const hasLargeScreen = window.screen.width >= 1024;

  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  // Desktop: no touch OR large screen AND not mobile user agent
  return !hasTouchSupport || (hasLargeScreen && !isMobileUA);
}

/**
 * Check if current platform supports high-bandwidth features
 *
 * @returns true if platform supports high-bandwidth features (desktop only)
 */
export function supportsHighBandwidthFeatures(): boolean {
  return isDesktopPlatform();
}

/**
 * Check if current browser supports required APIs for multimodal vision
 *
 * @returns true if all required APIs are available
 */
export function supportsMultimodalVision(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  // Check for canvas support
  const hasCanvas = !!document.createElement('canvas').getContext;

  // Check for WebSocket support (required for Gemini Live API)
  const hasWebSocket = typeof WebSocket !== 'undefined';

  // Check for FileReader support (for reading PDF files)
  const hasFileReader = typeof FileReader !== 'undefined';

  // Check for Blob support
  const hasBlob = typeof Blob !== 'undefined';

  return hasCanvas && hasWebSocket && hasFileReader && hasBlob;
}

/**
 * Get platform capability summary
 *
 * @returns Object with platform capabilities
 */
export function getPlatformCapabilities(): {
  isDesktop: boolean;
  supportsHighBandwidth: boolean;
  supportsMultimodalVision: boolean;
  supportsWebSockets: boolean;
  supportsCanvas: boolean;
  platform: 'desktop' | 'mobile' | 'tablet' | 'unknown';
} {
  return {
    isDesktop: isDesktopPlatform(),
    supportsHighBandwidth: supportsHighBandwidthFeatures(),
    supportsMultimodalVision: supportsMultimodalVision(),
    supportsWebSockets: typeof WebSocket !== 'undefined',
    supportsCanvas: typeof document !== 'undefined' && !!document.createElement('canvas').getContext,
    platform: detectPlatformType(),
  };
}

/**
 * Detect platform type
 *
 * @returns Platform type string
 */
function detectPlatformType(): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  // const userAgent = navigator.userAgent.toLowerCase();
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenWidth = window.screen.width;

  // Tablet detection
  if (hasTouch && screenWidth >= 768 && screenWidth < 1024) {
    return 'tablet';
  }

  // Mobile detection
  if (hasTouch && screenWidth < 768) {
    return 'mobile';
  }

  // Desktop detection
  if (!hasTouch || screenWidth >= 1024) {
    return 'desktop';
  }

  return 'unknown';
}

/**
 * Show desktop-only feature tooltip message
 *
 * @param featureName - Name of the feature
 * @returns Localized message key
 */
export function getDesktopOnlyMessageKey(featureName?: string): string {
  return featureName
    ? 'errors.desktop_only_feature_named'
    : 'errors.desktop_only_feature';
}

/**
 * Estimate bandwidth cost for features
 *
 * @param kilobytes - Size in KB
 * @returns Formatted bandwidth cost string
 */
export function formatBandwidthCost(kilobytes: number): string {
  if (kilobytes < 1024) {
    return `${kilobytes} KB`;
  }
  return `${(kilobytes / 1024).toFixed(1)} MB`;
}
