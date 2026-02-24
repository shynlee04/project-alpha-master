/**
 * @fileoverview TUI Screen Definitions
 * @module harness/tui/screens
 *
 * Screen type definitions for the test harness TUI.
 *
 * ANNOTATION: 2026-01-11 - Created for test spike harness - _test-spike/_notes/directory-structure-2026-01-11.md
 */

/**
 * TUI Screen types
 */
export type Screen =
  | 'scenario-picker'
  | 'live-run'
  | 'permissions-view'
  | 'state-snapshot';

/**
 * Screen metadata
 */
export interface ScreenInfo {
  id: Screen;
  label: string;
  description: string;
  shortcut: string;
}

/**
 * All available screens
 */
export const SCREENS: ScreenInfo[] = [
  {
    id: 'scenario-picker',
    label: 'Scenario Picker',
    description: 'Select and configure test scenarios',
    shortcut: '1',
  },
  {
    id: 'live-run',
    label: 'Live Run',
    description: 'Execute tests and view real-time output',
    shortcut: '2',
  },
  {
    id: 'permissions-view',
    label: 'Permissions',
    description: 'Manage permission profiles and overrides',
    shortcut: '3',
  },
  {
    id: 'state-snapshot',
    label: 'State Snapshot',
    description: 'View and export system state',
    shortcut: '4',
  },
];

/**
 * Get screen info by ID
 */
export function getScreenInfo(screen: Screen): ScreenInfo | undefined {
  return SCREENS.find((s) => s.id === screen);
}

/**
 * Navigate between screens
 */
export function navigateScreen(
  current: Screen,
  direction: 'next' | 'prev'
): Screen {
  const currentIndex = SCREENS.findIndex((s) => s.id === current);
  if (currentIndex === -1) return SCREENS[0].id;

  const offset = direction === 'next' ? 1 : -1;
  const newIndex = (currentIndex + offset + SCREENS.length) % SCREENS.length;
  return SCREENS[newIndex].id;
}
