/**
 * @fileoverview Theme Management Hook
 * @module lib/hooks/use-theme
 *
 * Custom React hook for managing theme state with:
 * - Theme mode tracking (light/dark/system)
 * - LocalStorage persistence
 * - System preference detection
 * - DOM class application
 */

import { useState, useEffect } from 'react';
import type { ThemeMode, ResolvedTheme } from '@/types/theme';

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = 'via-gent-theme';

const DEFAULT_THEME: ResolvedTheme = 'dark';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Detect OS theme preference using matchMedia API
 * @returns Detected system theme (dark or light)
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Read saved theme preference from localStorage
 * @returns Saved theme or default theme
 */
function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as ThemeMode) || DEFAULT_THEME;
  } catch (error) {
    console.error('Failed to read theme from localStorage:', error);
    return DEFAULT_THEME;
  }
}

/**
 * Save theme preference to localStorage
 * @param theme - Theme to save
 */
function saveTheme(theme: ThemeMode): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

// =============================================================================
// Main Hook
// =============================================================================

/**
 * Custom hook for managing theme state
 *
 * Provides theme mode management with:
 * - Theme state (light, dark, or system)
 * - Resolved theme (actual theme applied, respects system preference)
 * - Theme setter function
 * - Toggle function for quick switching
 *
 * @returns Theme state and control functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Toggle theme (current: {theme}, resolved: {resolvedTheme})
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  // Theme mode state (light, dark, or system)
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);

  // Resolved theme (matches OS preference when theme='system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getSystemTheme);

  // -------------------------------------------------------------------------
  // Effect 1: Apply theme class to document root
  // -------------------------------------------------------------------------
  useEffect(() => {
    const root = document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Apply appropriate class based on theme mode
    if (theme === 'system') {
      const system = getSystemTheme();
      setResolvedTheme(system);
      root.classList.add(system);
    } else {
      // Theme is either 'light' or 'dark' here, safe to cast
      const actualTheme: ResolvedTheme = theme as ResolvedTheme;
      setResolvedTheme(actualTheme);
      root.classList.add(actualTheme);
    }
  }, [theme]);

  // -------------------------------------------------------------------------
  // Effect 2: Listen for system theme preference changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    /**
     * Handle system theme preference change
     * @param e - MediaQueryListEvent
     */
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystem = e.matches ? 'dark' : 'light';
      setResolvedTheme(newSystem);

      // Update DOM class if theme is 'system'
      if (theme === 'system') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newSystem);
      }
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup: Remove event listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // -------------------------------------------------------------------------
  // Theme Setter
  // -------------------------------------------------------------------------

  /**
   * Set a new theme mode
   * @param newTheme - Theme mode to set (light, dark, or system)
   */
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveTheme(newTheme);
  };

  // -------------------------------------------------------------------------
  // Theme Toggle
  // -------------------------------------------------------------------------

  /**
   * Toggle between light and dark themes
   * Note: Ignores 'system' mode, toggles between light/dark directly
   */
  const toggleTheme = () => {
    const newTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // -------------------------------------------------------------------------
  // Return value
  // -------------------------------------------------------------------------

  return {
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme,
  };
}