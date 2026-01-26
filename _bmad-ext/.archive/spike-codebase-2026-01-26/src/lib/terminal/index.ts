/**
 * @fileoverview Terminal Module Index
 * @module lib/terminal
 *
 * Public API for terminal emulator functionality.
 *
 * @story S-036 Terminal/Console Integration
 */

// Terminal emulator core
export {
  getTerminalEmulator,
  TerminalEmulator,
} from './terminal-emulator';

// Types
export type {
  TerminalSession,
  CommandHistory,
  ShellInfo,
  TerminalEmulatorOptions,
} from './terminal-emulator';
