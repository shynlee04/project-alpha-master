/**
 * @fileoverview Platform Contract - Canonical platform detection for EPIC-CC-ARC
 * @module infrastructure/filesystem/platform-contract
 *
 * **ARC-A01**: Create getPlatformContract() service
 *
 * Per ADR-033 Decision D1:
 * - Storage type auto-detected (no user choice)
 * - Desktop → FSA (File System Access API)
 * - Mobile/Tablet → IndexedDB
 * - IDE → Desktop only (mobile blocked)
 *
 * **IMPORTANT**: Call getPlatformContract() ONCE at app startup.
 * The result is cached and returned for all subsequent calls.
 * This ensures consistent platform detection throughout the session.
 *
 * @epic EPIC-CC-ARC
 * @story ARC-A01
 * @author Team A + Team B (cross-team coordination)
 * @created 2026-01-17
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Device type classification
 *
 * @remarks
 * - desktop: Full keyboard, mouse, large screen, FSA support
 * - mobile: Touch-only, small screen, no FSA support
 * - tablet: Touch + keyboard, medium screen, no FSA support
 */
export type DeviceType = 'desktop' | 'mobile' | 'tablet';

/**
 * Storage type selection
 *
 * @remarks
 * - fsa: File System Access API (Chrome/Edge/Opera desktop)
 * - indexeddb: Browser storage (fallback for mobile/tablet)
 */
export type StorageType = 'fsa' | 'indexeddb';

/**
 * Platform Contract Interface
 *
 * @remarks
 * This is the SINGLE SOURCE OF TRUTH for platform capabilities.
 * All routing, storage, and feature decisions MUST use this contract.
 *
 * Per ADR-033, these fields are:
 * - deviceType: Auto-detected from user agent and screen size
 * - storageType: Auto-detected (fsa for desktop, indexeddb for mobile/tablet)
 * - canAccessFSA: true if showDirectoryPicker is available
 * - canWatchFiles: true if FSA + FileSystemObserver or polling available
 * - canRunTerminal: true if WebContainer supported (desktop only)
 * - canDoAgenticCoding: true if canAccessFSA && canRunTerminal
 * - canAccessIDE: true if canDoAgenticCoding (desktop with FSA + terminal)
 *
 * @example
 * ```ts
 * const platform = getPlatformContract();
 *
 * if (!platform.canAccessIDE) {
 *   // Redirect mobile users to Notes workspace
 *   redirect({ to: '/notes/$projectId' });
 * }
 *
 * const gateway = StorageGatewayFactory.create(platform.storageType);
 * ```
 */
export interface PlatformContract {
  /** Device classification: desktop | mobile | tablet */
  readonly deviceType: DeviceType;

  /** Storage type: fsa (desktop) | indexeddb (mobile/tablet) */
  readonly storageType: StorageType;

  /** File System Access API support (showDirectoryPicker available) */
  readonly canAccessFSA: boolean;

  /** File watching capability (FileSystemObserver or polling) */
  readonly canWatchFiles: boolean;

  /** WebContainer terminal support (requires COOP/COEP headers) */
  readonly canRunTerminal: boolean;

  /** Full agentic coding capability (FSA + Terminal) */
  readonly canDoAgenticCoding: boolean;

  /** IDE workspace access (desktop with FSA + Terminal) */
  readonly canAccessIDE: boolean;
}

// ============================================================================
// Feature Detection (Internal)
// ============================================================================

/**
 * Check if File System Access API is supported
 *
 * @returns true if showDirectoryPicker is available
 */
function detectFSASupport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return 'showDirectoryPicker' in window;
}

/**
 * Check if WebContainer is supported
 *
 * @returns true if SharedArrayBuffer and cross-origin isolation are available
 */
function detectWebContainerSupport(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const hasSharedArrayBuffer = typeof window.SharedArrayBuffer !== 'undefined';
  const isIsolated = window.crossOriginIsolated === true;
  return hasSharedArrayBuffer && isIsolated;
}

/**
 * Detect device type from user agent and screen characteristics
 *
 * @returns detected device type
 */
function detectDeviceType(): DeviceType {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return 'desktop'; // SSR default
  }

  const ua = navigator.userAgent;
  const screenWidth = window.screen.width;
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Tablet detection (iPad or similar)
  const isTablet =
    /iPad/i.test(ua) ||
    /Tablet/i.test(ua) ||
    /Nexus 10/i.test(ua) ||
    /Nexus 7/i.test(ua) ||
    /SM-T/i.test(ua) ||
    (hasTouch && screenWidth >= 768 && screenWidth < 1024);

  if (isTablet) {
    return 'tablet';
  }

  // Mobile detection
  const isMobile =
    /Android/i.test(ua) && !/Mobile/i.test(ua) === false ||
    /webOS/i.test(ua) ||
    /iPhone/i.test(ua) ||
    /iPod/i.test(ua) ||
    /BlackBerry/i.test(ua) ||
    /IEMobile/i.test(ua) ||
    /Opera Mini/i.test(ua) ||
    /Mobile/i.test(ua) ||
    (hasTouch && screenWidth < 768);

  if (isMobile) {
    return 'mobile';
  }

  // Desktop (default)
  return 'desktop';
}

/**
 * Determine optimal storage type for device
 *
 * @param deviceType - The detected device type
 * @param hasFSA - Whether FSA is supported
 * @returns optimal storage type
 */
function determineStorageType(deviceType: DeviceType, hasFSA: boolean): StorageType {
  // Desktop with FSA support → Use FSA
  if (deviceType === 'desktop' && hasFSA) {
    return 'fsa';
  }

  // Everything else → IndexedDB
  return 'indexeddb';
}

// ============================================================================
// Platform Contract Builder
// ============================================================================

/**
 * Build platform contract from current environment
 *
 * @returns complete platform contract
 */
function buildPlatformContract(): PlatformContract {
  const deviceType = detectDeviceType();
  const canAccessFSA = detectFSASupport();
  const canRunTerminal = detectWebContainerSupport();
  const storageType = determineStorageType(deviceType, canAccessFSA);

  // File watching requires FSA support
  const canWatchFiles = canAccessFSA;

  // Agentic coding requires FSA + Terminal
  const canDoAgenticCoding = canAccessFSA && canRunTerminal;

  // TASK-3 FIX: IDE access only requires FSA for MVP
  // WebContainer (terminal) is optional - IDE can work without it
  // Original: const canAccessIDE = canDoAgenticCoding;
  const canAccessIDE = canAccessFSA;

  return {
    deviceType,
    storageType,
    canAccessFSA,
    canWatchFiles,
    canRunTerminal,
    canDoAgenticCoding,
    canAccessIDE,
  } as const;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Cached platform contract (set once, reused)
 */
let cachedContract: PlatformContract | null = null;

/**
 * Get the Platform Contract for the current session
 *
 * @remarks
 * **IMPORTANT**: This function caches its result.
 * Call once at app startup and reuse the result.
 * The contract is consistent for the entire session.
 *
 * Per ADR-033 Decision D1:
 * - Desktop with FSA → storageType: 'fsa', canAccessIDE: true
 * - Desktop without FSA → storageType: 'indexeddb', canAccessIDE: false
 * - Mobile/Tablet → storageType: 'indexeddb', canAccessIDE: false
 *
 * @example
 * ```ts
 * // At app startup (single call)
 * const platform = getPlatformContract();
 *
 * // Use throughout the app
 * if (platform.canAccessIDE) {
 *   // Show IDE workspace
 * } else {
 *   // Show Notes workspace
 * }
 * ```
 *
 * @returns The platform contract for this session
 */
export function getPlatformContract(): PlatformContract {
  if (cachedContract) {
    return cachedContract;
  }

  cachedContract = buildPlatformContract();
  return cachedContract;
}

/**
 * Invalidate the cached platform contract
 *
 * @remarks
 * Use this for testing or after significant environment changes.
 * In production, the contract should remain stable for the session.
 *
 * @example
 * ```ts
 * // Testing only
 * invalidatePlatformCache();
 * const newContract = getPlatformContract();
 * ```
 */
export function invalidatePlatformCache(): void {
  cachedContract = null;
}

/**
 * Check if current platform matches requirements
 *
 * @param requirements - Partial platform contract to match against
 * @returns true if all requirements are met
 *
 * @example
 * ```ts
 * if (!meetsPlatformRequirements({ canAccessIDE: true })) {
 *   toast.error('IDE requires desktop with File System Access');
 * }
 * ```
 */
export function meetsPlatformRequirements(
  requirements: Partial<Pick<PlatformContract, 'canAccessFSA' | 'canWatchFiles' | 'canRunTerminal' | 'canDoAgenticCoding' | 'canAccessIDE'>>
): boolean {
  const platform = getPlatformContract();

  for (const [key, value] of Object.entries(requirements)) {
    if (platform[key as keyof PlatformContract] !== value) {
      return false;
    }
  }

  return true;
}

/**
 * Get platform info as a plain object (for logging/debugging)
 *
 * @returns platform contract as a plain object
 */
export function getPlatformInfoForLogging(): Record<string, unknown> {
  const platform = getPlatformContract();
  return {
    deviceType: platform.deviceType,
    storageType: platform.storageType,
    canAccessFSA: platform.canAccessFSA,
    canWatchFiles: platform.canWatchFiles,
    canRunTerminal: platform.canRunTerminal,
    canDoAgenticCoding: platform.canDoAgenticCoding,
    canAccessIDE: platform.canAccessIDE,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 'SSR',
  };
}

// ============================================================================
// No additional exports - types already exported above
// ============================================================================
