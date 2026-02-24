/**
 * @fileoverview Diff Library Index
 * @module lib/diff
 *
 * Exports diff generation utilities and types.
 *
 * @story S-029 File Comparison and Diff Viewer
 */

export { generateDiff, getInlineDiff } from './diff-generator';
export { ChangeType } from './diff-generator';
export type { DiffLine, DiffResult } from './diff-generator';
