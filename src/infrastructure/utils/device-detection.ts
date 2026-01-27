/**
 * @fileoverview Device Detection Utilities - Plugin support detection
 * @module infrastructure/utils/device-detection
 *
 * **EPIC-0.6-10**: Graceful Device Fallback
 *
 * Provides utilities for detecting device type and checking plugin support.
 * Used by PluginLayout to show fallback UI for unsupported plugins.
 *
 * @epic EPIC-0.6
 * @story 0.6-10
 * @team Team A
 * @created 2026-01-27
 */

import type { DeviceType, PluginDeclaration } from '@/domain/interfaces/plugin-capability.interface';
import { getPluginDeclaration } from '@/domain/interfaces/plugin-capability.interface';
import { detectPlatform } from '@/infrastructure/filesystem/platform-detection';
import type { PluginId } from '@/domain/types/plugin-types';

// ============================================================================
// Device Type Detection
// ============================================================================

/**
 * Get the current device type
 *
 * @returns Device type: 'desktop' | 'tablet' | 'mobile'
 *
 * @remarks
 * Uses window.innerWidth for responsive detection.
 * Falls back to platform-detection.ts for user agent detection.
 */
export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const width = window.innerWidth;

  // Responsive breakpoints matching useBreakpoint.ts
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get device type using platform detection (user agent based)
 *
 * @returns Device type from platform detection
 */
export function getDeviceTypeFromPlatform(): DeviceType {
  return detectPlatform().type;
}

// ============================================================================
// Plugin Support Detection
// ============================================================================

/**
 * Check if a plugin is supported on the current device
 *
 * @param pluginId - Plugin ID to check
 * @param deviceType - Device type (optional, defaults to current device)
 * @returns true if plugin is supported on the device
 *
 * @example
 * ```tsx
 * const isSupported = isPluginSupportedOnDevice('terminal', 'mobile');
 * // Returns false (Terminal is desktop only)
 * ```
 */
export function isPluginSupportedOnDevice(
  pluginId: PluginId,
  deviceType?: DeviceType
): boolean {
  const device = deviceType ?? getDeviceType();
  const declaration = getPluginDeclaration(pluginId);

  if (!declaration) {
    // If no declaration found, assume plugin is universally supported
    console.warn(`[DeviceDetection] No declaration found for plugin: ${pluginId}`);
    return true;
  }

  return declaration.supportedDevices.includes(device);
}

/**
 * Get the reason why a plugin is not supported
 *
 * @param pluginId - Plugin ID
 * @param deviceType - Device type (optional)
 * @returns Fallback reason or null if supported
 */
export function getPluginFallbackReason(
  pluginId: PluginId,
  deviceType?: DeviceType
): 'no-desktop' | 'no-fsa' | 'requires-plugin' | null {
  const device = deviceType ?? getDeviceType();
  const declaration = getPluginDeclaration(pluginId);
  const platform = detectPlatform();

  if (!declaration) {
    return null;
  }

  // Check device support first
  if (!declaration.supportedDevices.includes(device)) {
    return 'no-desktop';
  }

  // Check FSA requirement
  if (declaration.requires.fileSystem && !platform.isFSASupported) {
    return 'no-fsa';
  }

  // Check WebContainer requirement
  if (declaration.requires.webContainer && !platform.isWebContainer) {
    return 'requires-plugin';
  }

  return null;
}

/**
 * Get all plugins that are unsupported on the current device
 *
 * @param pluginIds - Array of plugin IDs to check
 * @param deviceType - Device type (optional)
 * @returns Map of pluginId to fallback reason
 */
export function getUnsupportedPlugins(
  pluginIds: PluginId[],
  deviceType?: DeviceType
): Map<PluginId, 'no-desktop' | 'no-fsa' | 'requires-plugin'> {
  const device = deviceType ?? getDeviceType();
  const unsupported = new Map<PluginId, 'no-desktop' | 'no-fsa' | 'requires-plugin'>();

  for (const pluginId of pluginIds) {
    const reason = getPluginFallbackReason(pluginId, device);
    if (reason) {
      unsupported.set(pluginId, reason);
    }
  }

  return unsupported;
}

// ============================================================================
// React Hook for Device Type
// ============================================================================

/**
 * Hook-compatible device detection
 *
 * @returns Current device type
 *
 * @remarks
 * For React components, use useDeviceType() from @/hooks/useMediaQuery.ts
 * This function is for non-React code.
 */
export function getCurrentDeviceType(): DeviceType {
  return getDeviceType();
}

// ============================================================================
// Plugin Capability Check
// ============================================================================

/**
 * Check if a plugin capability is available
 *
 * @param capability - Plugin declaration
 * @param deviceType - Device type to check
 * @returns true if plugin can run
 */
export function canPluginRunOnDevice(
  capability: PluginDeclaration,
  deviceType: DeviceType
): boolean {
  return capability.supportedDevices.includes(deviceType);
}
