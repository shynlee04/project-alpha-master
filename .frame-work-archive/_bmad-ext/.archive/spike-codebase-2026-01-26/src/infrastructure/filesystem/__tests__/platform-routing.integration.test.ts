/**
 * @fileoverview Platform Routing Integration Tests - End-to-end platform routing tests
 * @module infrastructure/filesystem/__tests__/platform-routing.integration.test.ts
 *
 * **CC-SG-02**: Create Platform Routing Tests
 *
 * Tests for:
 * - Desktop platform routes to FSA gateway for note operations
 * - Mobile platform routes to IDB gateway for note operations
 * - Factory.createFromPlatform() routes correctly
 * - End-to-end routing flow tests
 *
 * @epic EPIC-CC-ARC
 * @story CC-SG-02
 * @created 2026-01-18
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getPlatformContract, invalidatePlatformCache } from '../platform-contract';
import { createStorageGateway } from '../storage-gateway-factory';
import type { StorageGateway } from '../../../domain/interfaces/storage-gateway.interface';
import { FSAGateway } from '../fsa-gateway';
import { IDBGateway } from '../idb-gateway';
import type { StorageType, DeviceType } from '../platform-contract';

// ============================================================================
// Mock Setup
// ============================================================================

/**
 * Mock FileSystemDirectoryHandle for testing
 */
class MockFileSystemDirectoryHandle {
  constructor(public name: string = 'mock-project') {}
}

/**
 * Setup mock browser environment for specific device type
 */
function mockPlatformEnvironment(deviceType: DeviceType, hasFSA: boolean) {
  let userAgent: string;
  let screenWidth: number;
  let hasTouch: boolean;
  let maxTouchPoints: number;

  switch (deviceType) {
    case 'desktop':
      userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
      screenWidth = 1920;
      hasTouch = false;
      maxTouchPoints = 0;
      break;
    case 'mobile':
      userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
      screenWidth = 390;
      hasTouch = true;
      maxTouchPoints = 5;
      break;
    case 'tablet':
      userAgent = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
      screenWidth = 1024;
      hasTouch = true;
      maxTouchPoints = 5;
      break;
  }

  // Mock navigator
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent,
      maxTouchPoints,
    },
    writable: true,
  });

  // Mock window.screen
  Object.defineProperty(globalThis, 'screen', {
    value: { width: screenWidth, height: 1080 },
    writable: true,
  });

  // Mock window.showDirectoryPicker
  if (hasFSA) {
    Object.defineProperty(globalThis, 'showDirectoryPicker', {
      value: vi.fn(),
      writable: true,
    });
  } else {
    // @ts-ignore - Intentionally undefined
    delete globalThis.showDirectoryPicker;
  }

  // Mock window.SharedArrayBuffer (for WebContainer)
  if (hasFSA) {
    Object.defineProperty(globalThis, 'SharedArrayBuffer', {
      value: class MockSharedArrayBuffer {
        constructor(length: number) {
          return new Uint8Array(length);
        }
      },
      writable: true,
    });
  } else {
    // @ts-ignore - Intentionally undefined
    delete globalThis.SharedArrayBuffer;
  }

  // Mock window.crossOriginIsolated
  Object.defineProperty(globalThis, 'crossOriginIsolated', {
    value: hasFSA,
    writable: true,
  });

  // Mock window.ontouchstart
  if (hasTouch) {
    Object.defineProperty(globalThis, 'ontouchstart', {
      value: {},
      writable: true,
    });
  } else {
    // @ts-ignore - Intentionally undefined
    delete globalThis.ontouchstart;
  }
}

/**
 * Cleanup mock browser environment
 */
function cleanupMockEnvironment() {
  // @ts-ignore - Cleanup
  delete globalThis.navigator;
  // @ts-ignore - Cleanup
  delete globalThis.screen;
  // @ts-ignore - Cleanup
  delete globalThis.showDirectoryPicker;
  // @ts-ignore - Cleanup
  delete globalThis.SharedArrayBuffer;
  // @ts-ignore - Cleanup
  delete globalThis.crossOriginIsolated;
  // @ts-ignore - Cleanup
  delete globalThis.ontouchstart;
}

// ============================================================================
// Test Suites
// ============================================================================

describe('Platform Routing Integration', () => {
  afterEach(() => {
    invalidatePlatformCache();
    cleanupMockEnvironment();
  });

  // ------------------------------------------------------------------------
  // Desktop Platform Tests
  // ------------------------------------------------------------------------

  describe('Desktop Platform', () => {
    let gateway: StorageGateway;
    let platform: ReturnType<typeof getPlatformContract>;

    beforeEach(() => {
      mockPlatformEnvironment('desktop', true);
      platform = getPlatformContract();
    });

    it('should have deviceType = desktop', () => {
      expect(platform.deviceType).toBe('desktop');
    });

    it('should have storageType = fsa', () => {
      expect(platform.storageType).toBe('fsa');
    });

    it('should have canAccessFSA = true', () => {
      expect(platform.canAccessFSA).toBe(true);
    });

    it('should have canWatchFiles = true', () => {
      expect(platform.canWatchFiles).toBe(true);
    });

    it('should have canRunTerminal = true', () => {
      expect(platform.canRunTerminal).toBe(true);
    });

    it('should have canDoAgenticCoding = true', () => {
      expect(platform.canDoAgenticCoding).toBe(true);
    });

    it('should have canAccessIDE = true', () => {
      expect(platform.canAccessIDE).toBe(true);
    });

    it('should route to FSAGateway', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      gateway = createStorageGateway(platform, {
        directoryHandle: mockHandle as any,
      });
      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should route correctly via factory', () => {
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      gateway = createStorageGateway(
        { storageType: platform.storageType },
        { directoryHandle: mockHandle as any }
      );
      expect(gateway).toBeInstanceOf(FSAGateway);
    });

    it('should have full IDE capabilities', () => {
      expect(platform.canAccessIDE).toBe(true);
      expect(platform.canDoAgenticCoding).toBe(true);
      expect(platform.canAccessFSA).toBe(true);
      expect(platform.canRunTerminal).toBe(true);
    });
  });

  // ------------------------------------------------------------------------
  // Mobile Platform Tests
  // ------------------------------------------------------------------------

  describe('Mobile Platform', () => {
    let gateway: StorageGateway;
    let platform: ReturnType<typeof getPlatformContract>;

    beforeEach(() => {
      mockPlatformEnvironment('mobile', false);
      platform = getPlatformContract();
    });

    it('should have deviceType = mobile', () => {
      expect(platform.deviceType).toBe('mobile');
    });

    it('should have storageType = indexeddb', () => {
      expect(platform.storageType).toBe('indexeddb');
    });

    it('should have canAccessFSA = false', () => {
      expect(platform.canAccessFSA).toBe(false);
    });

    it('should have canWatchFiles = false', () => {
      expect(platform.canWatchFiles).toBe(false);
    });

    it('should have canRunTerminal = false', () => {
      expect(platform.canRunTerminal).toBe(false);
    });

    it('should have canDoAgenticCoding = false', () => {
      expect(platform.canDoAgenticCoding).toBe(false);
    });

    it('should have canAccessIDE = false', () => {
      expect(platform.canAccessIDE).toBe(false);
    });

    it('should route to IDBGateway', () => {
      gateway = createStorageGateway(platform, {
        projectId: 'proj_test123',
      });
      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should route correctly via factory', () => {
      gateway = createStorageGateway(
        { storageType: platform.storageType },
        { projectId: 'proj_test123' }
      );
      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should restrict IDE access', () => {
      expect(platform.canAccessIDE).toBe(false);
      expect(platform.canDoAgenticCoding).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Tablet Platform Tests
  // ------------------------------------------------------------------------

  describe('Tablet Platform', () => {
    let gateway: StorageGateway;
    let platform: ReturnType<typeof getPlatformContract>;

    beforeEach(() => {
      mockPlatformEnvironment('tablet', false);
      platform = getPlatformContract();
    });

    it('should have deviceType = tablet', () => {
      expect(platform.deviceType).toBe('tablet');
    });

    it('should have storageType = indexeddb', () => {
      expect(platform.storageType).toBe('indexeddb');
    });

    it('should have canAccessFSA = false', () => {
      expect(platform.canAccessFSA).toBe(false);
    });

    it('should have canWatchFiles = false', () => {
      expect(platform.canWatchFiles).toBe(false);
    });

    it('should have canRunTerminal = false', () => {
      expect(platform.canRunTerminal).toBe(false);
    });

    it('should have canDoAgenticCoding = false', () => {
      expect(platform.canDoAgenticCoding).toBe(false);
    });

    it('should have canAccessIDE = false', () => {
      expect(platform.canAccessIDE).toBe(false);
    });

    it('should route to IDBGateway', () => {
      gateway = createStorageGateway(platform, {
        projectId: 'proj_tablet123',
      });
      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should restrict IDE access', () => {
      expect(platform.canAccessIDE).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Desktop Without FSA Tests
  // ------------------------------------------------------------------------

  describe('Desktop Without FSA Support', () => {
    let gateway: StorageGateway;
    let platform: ReturnType<typeof getPlatformContract>;

    beforeEach(() => {
      mockPlatformEnvironment('desktop', false);
      platform = getPlatformContract();
    });

    it('should have deviceType = desktop', () => {
      expect(platform.deviceType).toBe('desktop');
    });

    it('should have storageType = indexeddb (fallback)', () => {
      expect(platform.storageType).toBe('indexeddb');
    });

    it('should have canAccessFSA = false', () => {
      expect(platform.canAccessFSA).toBe(false);
    });

    it('should have canWatchFiles = false', () => {
      expect(platform.canWatchFiles).toBe(false);
    });

    it('should have canRunTerminal = false', () => {
      expect(platform.canRunTerminal).toBe(false);
    });

    it('should have canDoAgenticCoding = false', () => {
      expect(platform.canDoAgenticCoding).toBe(false);
    });

    it('should have canAccessIDE = false', () => {
      expect(platform.canAccessIDE).toBe(false);
    });

    it('should route to IDBGateway (fallback)', () => {
      gateway = createStorageGateway(platform, {
        projectId: 'proj_fallback123',
      });
      expect(gateway).toBeInstanceOf(IDBGateway);
    });

    it('should restrict IDE access without FSA', () => {
      expect(platform.canAccessIDE).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // End-to-End Routing Flow Tests
  // ------------------------------------------------------------------------

  describe('End-to-End Routing Flow', () => {
    it('should route desktop with FSA to IDE-capable gateway', () => {
      mockPlatformEnvironment('desktop', true);
      const platform = getPlatformContract();

      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const gateway = createStorageGateway(platform, {
        directoryHandle: mockHandle as any,
      });

      expect(gateway).toBeInstanceOf(FSAGateway);
      expect(platform.canAccessIDE).toBe(true);
    });

    it('should route mobile to Notes-only gateway', () => {
      mockPlatformEnvironment('mobile', false);
      const platform = getPlatformContract();

      const gateway = createStorageGateway(platform, {
        projectId: 'proj_mobile123',
      });

      expect(gateway).toBeInstanceOf(IDBGateway);
      expect(platform.canAccessIDE).toBe(false);
    });

    it('should route tablet to Notes-only gateway', () => {
      mockPlatformEnvironment('tablet', false);
      const platform = getPlatformContract();

      const gateway = createStorageGateway(platform, {
        projectId: 'proj_tablet123',
      });

      expect(gateway).toBeInstanceOf(IDBGateway);
      expect(platform.canAccessIDE).toBe(false);
    });

    it('should route desktop without FSA to fallback gateway', () => {
      mockPlatformEnvironment('desktop', false);
      const platform = getPlatformContract();

      const gateway = createStorageGateway(platform, {
        projectId: 'proj_fallback123',
      });

      expect(gateway).toBeInstanceOf(IDBGateway);
      expect(platform.canAccessIDE).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Storage Type Routing Tests
  // ------------------------------------------------------------------------

  describe('Storage Type Routing', () => {
    it('should correctly identify FSA as storage type for desktop with FSA', () => {
      mockPlatformEnvironment('desktop', true);
      const platform = getPlatformContract();

      expect(platform.storageType).toBe('fsa');
    });

    it('should correctly identify IndexedDB as storage type for mobile', () => {
      mockPlatformEnvironment('mobile', false);
      const platform = getPlatformContract();

      expect(platform.storageType).toBe('indexeddb');
    });

    it('should correctly identify IndexedDB as storage type for tablet', () => {
      mockPlatformEnvironment('tablet', false);
      const platform = getPlatformContract();

      expect(platform.storageType).toBe('indexeddb');
    });

    it('should correctly identify IndexedDB as storage type for desktop without FSA', () => {
      mockPlatformEnvironment('desktop', false);
      const platform = getPlatformContract();

      expect(platform.storageType).toBe('indexeddb');
    });
  });

  // ------------------------------------------------------------------------
  // Capability Flag Integration Tests
  // ------------------------------------------------------------------------

  describe('Capability Flag Integration', () => {
    it('should set all flags correctly for full desktop IDE', () => {
      mockPlatformEnvironment('desktop', true);
      const platform = getPlatformContract();

      expect(platform.canAccessFSA).toBe(true);
      expect(platform.canWatchFiles).toBe(true);
      expect(platform.canRunTerminal).toBe(true);
      expect(platform.canDoAgenticCoding).toBe(true);
      expect(platform.canAccessIDE).toBe(true);
    });

    it('should set all flags correctly for mobile', () => {
      mockPlatformEnvironment('mobile', false);
      const platform = getPlatformContract();

      expect(platform.canAccessFSA).toBe(false);
      expect(platform.canWatchFiles).toBe(false);
      expect(platform.canRunTerminal).toBe(false);
      expect(platform.canDoAgenticCoding).toBe(false);
      expect(platform.canAccessIDE).toBe(false);
    });

    it('should set canDoAgenticCoding correctly (FSA + Terminal)', () => {
      mockPlatformEnvironment('desktop', true);
      const platform = getPlatformContract();

      expect(platform.canDoAgenticCoding).toBe(true);
      expect(platform.canDoAgenticCoding).toBe(
        platform.canAccessFSA && platform.canRunTerminal
      );
    });

    it('should set canAccessIDE correctly (matches canDoAgenticCoding)', () => {
      mockPlatformEnvironment('desktop', true);
      const platform = getPlatformContract();

      expect(platform.canAccessIDE).toBe(platform.canDoAgenticCoding);
    });
  });

  // ------------------------------------------------------------------------
  // Platform Switching Tests
  // ------------------------------------------------------------------------

  describe('Platform Switching', () => {
    it('should handle platform switch from desktop to mobile', () => {
      // Start with desktop
      mockPlatformEnvironment('desktop', true);
      let platform = getPlatformContract();
      expect(platform.deviceType).toBe('desktop');
      expect(platform.storageType).toBe('fsa');

      // Switch to mobile
      invalidatePlatformCache();
      mockPlatformEnvironment('mobile', false);
      platform = getPlatformContract();
      expect(platform.deviceType).toBe('mobile');
      expect(platform.storageType).toBe('indexeddb');
    });

    it('should handle platform switch from mobile to desktop', () => {
      // Start with mobile
      mockPlatformEnvironment('mobile', false);
      let platform = getPlatformContract();
      expect(platform.deviceType).toBe('mobile');
      expect(platform.storageType).toBe('indexeddb');

      // Switch to desktop
      invalidatePlatformCache();
      mockPlatformEnvironment('desktop', true);
      platform = getPlatformContract();
      expect(platform.deviceType).toBe('desktop');
      expect(platform.storageType).toBe('fsa');
    });

    it('should handle platform switch with FSA support change', () => {
      // Start with FSA support
      mockPlatformEnvironment('desktop', true);
      let platform = getPlatformContract();
      expect(platform.canAccessFSA).toBe(true);

      // Switch to no FSA support
      invalidatePlatformCache();
      mockPlatformEnvironment('desktop', false);
      platform = getPlatformContract();
      expect(platform.canAccessFSA).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Factory Routing Verification Tests
  // ------------------------------------------------------------------------

  describe('Factory Routing Verification', () => {
    it('should create correct gateway type for each platform', () => {
      // Desktop with FSA
      mockPlatformEnvironment('desktop', true);
      const desktopPlatform = getPlatformContract();
      const mockHandle = new MockFileSystemDirectoryHandle('test-project');
      const desktopGateway = createStorageGateway(desktopPlatform, {
        directoryHandle: mockHandle as any,
      });
      expect(desktopGateway).toBeInstanceOf(FSAGateway);

      // Mobile
      invalidatePlatformCache();
      mockPlatformEnvironment('mobile', false);
      const mobilePlatform = getPlatformContract();
      const mobileGateway = createStorageGateway(mobilePlatform, {
        projectId: 'proj_mobile123',
      });
      expect(mobileGateway).toBeInstanceOf(IDBGateway);

      // Tablet
      invalidatePlatformCache();
      mockPlatformEnvironment('tablet', false);
      const tabletPlatform = getPlatformContract();
      const tabletGateway = createStorageGateway(tabletPlatform, {
        projectId: 'proj_tablet123',
      });
      expect(tabletGateway).toBeInstanceOf(IDBGateway);

      // Desktop without FSA
      invalidatePlatformCache();
      mockPlatformEnvironment('desktop', false);
      const fallbackPlatform = getPlatformContract();
      const fallbackGateway = createStorageGateway(fallbackPlatform, {
        projectId: 'proj_fallback123',
      });
      expect(fallbackGateway).toBeInstanceOf(IDBGateway);
    });
  });
});
