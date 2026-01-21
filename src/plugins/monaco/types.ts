/**
 * @fileoverview Monaco Plugin Types
 * @module plugins/monaco/types
 *
 * **ARCH-02-05**: Monaco Plugin Type Definitions
 *
 * Types for Monaco plugin integration.
 *
 * @epic EPIC-ARCH-02
 * @story ARCH-02-05
 * @team Team B
 * @created 2026-01-21
 */

import type React from 'react';

// ============================================================================
// Editor State
// ============================================================================

/**
 * Editor State
 *
 * @remarks
 * Tracks state of Monaco editor instance.
 * - Open files (tabs)
 * - Active file path
 * - Editor content
 * - Modified state
 */
export interface EditorState {
  /** Currently open files (tabs) */
  openFiles: TabData[];

  /** Currently active file path */
  activePath: string | null;

  /** Editor content cache by path */
  content: Map<string, string>;
}

// ============================================================================
// Tab Data
// ============================================================================

/**
 * Tab Data
 *
 * @remarks
 * Represents an open file tab in Monaco editor.
 */
export interface TabData {
  /** File path from project root */
  path: string;

  /** File name for tab display */
  name: string;

  /** File extension for language detection */
  extension: string;

  /** Whether file has unsaved changes */
  modified: boolean;

  /** Whether file is read-only */
  readOnly: boolean;
}

// ============================================================================
// Monaco Plugin Props
// ============================================================================

/**
 * Monaco Plugin Props
 *
 * @remarks
 * Props for Monaco plugin component.
 * Extends PluginMainProps from feature-plugin.interface.
 */
export interface MonacoPluginProps {
  /** Project context with storage and platform info (optional) */
  projectContext?: import('@/domain/interfaces/feature-plugin.interface').ProjectContext;

  /** Unique identifier for this panel instance (optional) */
  panelId?: string;

  /** Panel width in pixels (responsive) */
  width: number;

  /** Panel height in pixels (responsive) */
  height: number;
}
