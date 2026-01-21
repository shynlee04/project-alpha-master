/**
 * @fileoverview Terminal Plugin Types
 * @module plugins/terminal/types
 *
 * **ARCH-02-07**: Terminal Plugin Types
 *
 * Local types for terminal plugin.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-07
 * @team Team B
 * @created 2026-01-21
 */

/**
 * Terminal State
 */
export interface TerminalState {
  /** Whether terminal is ready to accept input */
  isReady: boolean;
  /** Current working directory */
  cwd: string;
  /** Whether shell has started */
  isShellStarted: boolean;
}
