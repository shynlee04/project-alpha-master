/**
 * @fileoverview Unified File Operations
 * @module lib/agent/tools/unified
 *
 * Universal file operations that work across ALL workspaces.
 * Consolidates read_file/read_note, write_file/create_note, etc.
 *
 * This layer provides workspace-agnostic file operations with
 * automatic content type detection and handling.
 *
 * @epic EPIC-TOOLS - Agentic Tool Architecture
 * @story TOOLS-01 - Unified File Operations
 */

export * from './read-tool';
export * from './write-tool';
export * from './delete-tool';
export * from './list-tool';
export * from './types';
