/**
 * @fileoverview Platform Contract Tests - Device and platform detection tests
 * @module infrastructure/filesystem/__tests__/platform-contract.test.ts
 *
 * **CC-SG-02**: Create Platform Routing Tests
 *
 * Tests for:
 * - Device type detection (desktop, mobile, tablet)
 * - Storage type determination (FSA vs IndexedDB)
 * - Capability flags (canWatchFiles, canRunTerminal, etc.)
 * - Caching behavior
 *
 * @epic EPIC-CC-ARC
 * @story CC-SG-02
 * @created 2026-01-18
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPlatformContract,
  invalidatePlatformCache,
  meetsPlatformRequirements,
  getPlatformInfoForLogging,
} from '../platform-contract';
import type { PlatformContract, DeviceType, StorageType } from '../platform-contract';

// ============================================================================
// Mock Setup
// ============================================================================

/**
 * Default browser properties for testing
 */
const defaultBrowserProps = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  screenWidth: 1920,
  screenHeight: 1080,
  hasTouch: false,
  maxTouchPoints: 0,
  hasShowDirectoryPicker: true,
  hasSharedArrayBuffer: true,
  crossOriginIsolated: true,
};

/**
 * Setup mock browser environment
 */
function mockBrowserEnvironment(props: Partial<typeof defaultBrowserProps> = {}) {
  const merged = { ...defaultBrowserProps, ...props };

  // Mock navigator
  vi.stubGlobal('navigator', {
    userAgent: merged.userAgent,
    maxTouchPoints: merged.maxTouchPoints,
  });

  // Mock window.screen
  vi.stubGlobal('screen', {
    width: merged.screenWidth,
    height: merged.screenHeight,
  });

  // Mock window.showDirectoryPicker
  if (merged.hasShowDirectoryPicker) {
    vi.stubGlobal('showDirectoryPicker', vi.fn());
  }

  // Mock window.SharedArrayBuffer
  if (merged.hasSharedArrayBuffer) {
    vi.stubGlobal('SharedArrayBuffer', class MockSharedArrayBuffer {
      constructor(length: number) {
        return new Uint8Array(length);
      }
    });
  }

  // Mock window.crossOriginIsolated
  vi.stubGlobal('crossOriginIsolated', merged.crossOriginIsolated);

  // Mock window.ontouchstart
  if (merged.hasTouch) {
    vi.stubGlobal('ontouchstart', {});
  }
}

/**
 * Cleanup mock browser environment
 */
function cleanupMockEnvironment() {
  vi.unstubAllGlobals();
}

// ============================================================================
// Test Suites
// ============================================================================

describe('PlatformContract', () => {
  afterEach(() => {
    invalidatePlatformCache();
    cleanupMockEnvironment();
  });

  // ------------------------------------------------------------------------
  // Device Type Detection Tests
  // ------------------------------------------------------------------------

  describe('Device Type Detection', () => {
    it('should detect desktop browser (Chrome on macOS)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        screenWidth: 1920,
        hasTouch: false,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('desktop');
    });

    it('should detect desktop browser (Firefox on Windows)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
        screenWidth: 1920,
        hasTouch: false,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('desktop');
    });

    it('should detect mobile browser (iPhone)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        screenWidth: 390,
        hasTouch: true,
        maxTouchPoints: 5,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('mobile');
    });

    it('should detect mobile browser (Android)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        screenWidth: 412,
        hasTouch: true,
        maxTouchPoints: 5,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('mobile');
    });

    it('should detect tablet (iPad)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        screenWidth: 1024,
        hasTouch: true,
        maxTouchPoints: 5,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('tablet');
    });

    it('should detect tablet (Samsung Galaxy Tab)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-T860) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        screenWidth: 800,
        hasTouch: true,
        maxTouchPoints: 5,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('tablet');
    });

    it('should detect tablet by screen size (touch device with width 768-1024)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Generic Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        screenWidth: 900,
        hasTouch: true,
        maxTouchPoints: 5,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('tablet');
    });

    it('should detect mobile by screen size (touch device with width < 768)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Generic Phone) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        screenWidth: 600,
        hasTouch: true,
        maxTouchPoints: 5,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('mobile');
    });

    it('should detect desktop by screen size (no touch device)', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        screenWidth: 1920,
        hasTouch: false,
        maxTouchPoints: 0,
      });

      const contract = getPlatformContract();
      expect(contract.deviceType).toBe('desktop');
    });
  });

  // ------------------------------------------------------------------------
  // Storage Type Determination Tests
  // ------------------------------------------------------------------------

  describe('Storage Type Determination', () => {
    it('should use FSA for desktop with FSA support', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        hasShowDirectoryPicker: true,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const contract = getPlatformContract();
      expect(contract.storageType).toBe('fsa');
      expect(contract.canAccessFSA).toBe(true);
      expect(contract.canAccessIDE).toBe(true);
    });

    it('should use IndexedDB for mobile', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        screenWidth: 390,
        hasTouch: true,
        hasShowDirectoryPicker: false,
        hasSharedArrayBuffer: false,
        crossOriginIsolated: false,
      });

      const contract = getPlatformContract();
      expect(contract.storageType).toBe('indexeddb');
      expect(contract.canAccessFSA).toBe(false);
      expect(contract.canAccessIDE).toBe(false);
    });

    it('should use IndexedDB for tablet', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        screenWidth: 1024,
        hasTouch: true,
        hasShowDirectoryPicker: false,
        hasSharedArrayBuffer: false,
        crossOriginIsolated: false,
      });

      const contract = getPlatformContract();
      expect(contract.storageType).toBe('indexeddb');
      expect(contract.canAccessFSA).toBe(false);
      expect(contract.canAccessIDE).toBe(false);
    });

    it('should use IndexedDB for desktop without FSA support', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        hasShowDirectoryPicker: false,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const contract = getPlatformContract();
      expect(contract.storageType).toBe('indexeddb');
      expect(contract.canAccessFSA).toBe(false);
      expect(contract.canAccessIDE).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Capability Flags Tests
  // ------------------------------------------------------------------------

  describe('Capability Flags', () => {
    it('should set canWatchFiles correctly for FSA', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: true,
      });

      const contract = getPlatformContract();
      expect(contract.canWatchFiles).toBe(true);
    });

    it('should set canWatchFiles correctly for IndexedDB', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: false,
      });

      const contract = getPlatformContract();
      expect(contract.canWatchFiles).toBe(false);
    });

    it('should set canRunTerminal for WebContainer support', () => {
      mockBrowserEnvironment({
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const contract = getPlatformContract();
      expect(contract.canRunTerminal).toBe(true);
    });

    it('should set canRunTerminal to false without WebContainer support', () => {
      mockBrowserEnvironment({
        hasSharedArrayBuffer: false,
        crossOriginIsolated: true,
      });

      const contract = getPlatformContract();
      expect(contract.canRunTerminal).toBe(false);
    });

    it('should set canDoAgenticCoding correctly (FSA + Terminal)', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: true,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const contract = getPlatformContract();
      expect(contract.canDoAgenticCoding).toBe(true);
    });

    it('should set canDoAgenticCoding to false without FSA', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: false,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const contract = getPlatformContract();
      expect(contract.canDoAgenticCoding).toBe(false);
    });

    it('should set canDoAgenticCoding to false without Terminal', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: true,
        hasSharedArrayBuffer: false,
        crossOriginIsolated: false,
      });

      const contract = getPlatformContract();
      expect(contract.canDoAgenticCoding).toBe(false);
    });

    it('should set canAccessIDE correctly (FSA + Terminal)', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: true,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const contract = getPlatformContract();
      expect(contract.canAccessIDE).toBe(true);
    });

    it('should set canAccessIDE to false for mobile', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        screenWidth: 390,
        hasTouch: true,
        hasShowDirectoryPicker: false,
        hasSharedArrayBuffer: false,
        crossOriginIsolated: false,
      });

      const contract = getPlatformContract();
      expect(contract.canAccessIDE).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Caching Behavior Tests
  // ------------------------------------------------------------------------

  describe('Caching', () => {
    it('should cache platform contract and return same instance', () => {
      mockBrowserEnvironment();

      const contract1 = getPlatformContract();
      const contract2 = getPlatformContract();
      expect(contract1).toBe(contract2);
    });

    it('should invalidate cache when requested', () => {
      mockBrowserEnvironment();

      const contract1 = getPlatformContract();
      invalidatePlatformCache();
      const contract2 = getPlatformContract();
      expect(contract1).not.toBe(contract2);
    });

    it('should rebuild contract after cache invalidation', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: true,
      });

      const contract1 = getPlatformContract();
      expect(contract1.canAccessFSA).toBe(true);

      // Change environment
      cleanupMockEnvironment();
      mockBrowserEnvironment({
        hasShowDirectoryPicker: false,
      });

      invalidatePlatformCache();
      const contract2 = getPlatformContract();
      expect(contract2.canAccessFSA).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Platform Requirements Tests
  // ------------------------------------------------------------------------

  describe('Platform Requirements Validation', () => {
    it('should return true when all requirements match', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: true,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const result = meetsPlatformRequirements({
        canAccessFSA: true,
        canWatchFiles: true,
        canRunTerminal: true,
        canDoAgenticCoding: true,
        canAccessIDE: true,
      });

      expect(result).toBe(true);
    });

    it('should return false when requirement does not match', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: false,
      });

      const result = meetsPlatformRequirements({
        canAccessFSA: true,
      });

      expect(result).toBe(false);
    });

    it('should validate partial requirements', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: true,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const result = meetsPlatformRequirements({
        canAccessFSA: true,
        canAccessIDE: true,
      });

      expect(result).toBe(true);
    });

    it('should return false for missing capability', () => {
      mockBrowserEnvironment({
        hasShowDirectoryPicker: false,
        hasSharedArrayBuffer: false,
        crossOriginIsolated: false,
      });

      const result = meetsPlatformRequirements({
        canAccessIDE: true,
      });

      expect(result).toBe(false);
    });
  });

  // ------------------------------------------------------------------------
  // Platform Info for Logging Tests
  // ------------------------------------------------------------------------

  describe('Platform Info for Logging', () => {
    it('should return platform info as plain object', () => {
      mockBrowserEnvironment({
        userAgent: 'Mozilla/5.0 (Test Browser)',
        screenWidth: 1920,
        hasShowDirectoryPicker: true,
        hasSharedArrayBuffer: true,
        crossOriginIsolated: true,
      });

      const info = getPlatformInfoForLogging();

      expect(info).toHaveProperty('deviceType');
      expect(info).toHaveProperty('storageType');
      expect(info).toHaveProperty('canAccessFSA');
      expect(info).toHaveProperty('canWatchFiles');
      expect(info).toHaveProperty('canRunTerminal');
      expect(info).toHaveProperty('canDoAgenticCoding');
      expect(info).toHaveProperty('canAccessIDE');
      expect(info).toHaveProperty('userAgent');
      expect(info).toHaveProperty('screenWidth');
    });

    it('should include user agent in log info', () => {
      const testUserAgent = 'Mozilla/5.0 (Test Browser)';
      mockBrowserEnvironment({ userAgent: testUserAgent });

      const info = getPlatformInfoForLogging();
      expect(info.userAgent).toBe(testUserAgent);
    });

    it('should include screen width in log info', () => {
      const testWidth = 1920;
      mockBrowserEnvironment({ screenWidth: testWidth });

      const info = getPlatformInfoForLogging();
      expect(info.screenWidth).toBe(testWidth);
    });

    it('should handle SSR environment (no navigator/window)', () => {
      // @ts-ignore - Intentionally undefined
      delete globalThis.navigator;
      // @ts-ignore - Intentionally undefined
      delete globalThis.window;

      invalidatePlatformCache();
      const info = getPlatformInfoForLogging();

      expect(info.userAgent).toBe('SSR');
      expect(info.screenWidth).toBe('SSR');
    });
  });

  // ------------------------------------------------------------------------
  // Type Safety Tests
  // ------------------------------------------------------------------------

  describe('Type Safety', () => {
    it('should have correct device type union type', () => {
      mockBrowserEnvironment();
      const contract = getPlatformContract();
      const deviceType: DeviceType = contract.deviceType;

      expect(['desktop', 'mobile', 'tablet']).toContain(deviceType);
    });

    it('should have correct storage type union type', () => {
      mockBrowserEnvironment();
      const contract = getPlatformContract();
      const storageType: StorageType = contract.storageType;

      expect(['fsa', 'indexeddb']).toContain(storageType);
    });

    it('should have all readonly properties', () => {
      mockBrowserEnvironment();
      const contract = getPlatformContract();

      expect(contract.deviceType).toBeDefined();
      expect(contract.storageType).toBeDefined();
      expect(contract.canAccessFSA).toBeDefined();
      expect(contract.canWatchFiles).toBeDefined();
      expect(contract.canRunTerminal).toBeDefined();
      expect(contract.canDoAgenticCoding).toBeDefined();
      expect(contract.canAccessIDE).toBeDefined();
    });
  });
});
