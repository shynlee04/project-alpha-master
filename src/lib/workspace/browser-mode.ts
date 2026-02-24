/**
 * @fileoverview DEPRECATED - Browser Mode stub
 * @deprecated This module is deprecated. Use platform detection instead.
 */

/** @deprecated Use platform detection utilities */
export const browserMode = {
  isActive: false,
  enable: () => {},
  disable: () => {},
};

/** @deprecated */
export function isBrowserMode(): boolean {
  return false;
}

/**
 * @deprecated Use ProjectService for browser mode projects
 * Stub function for backward compatibility - returns object with id
 */
export async function getOrCreateBrowserModeProject(): Promise<{ id: string }> {
  console.warn('getOrCreateBrowserModeProject is deprecated. Use ProjectService instead.');
  return { id: `browser-mode-${Date.now()}` };
}
