/**
 * @fileoverview Diff Generation Library with Myers Diff Algorithm
 * @module lib/diff/diff-generator
 *
 * Efficient line-based diff generation using Myers O(ND) algorithm.
 * Handles large files (10,000+ lines) with optimized performance.
 *
 * @story S-029 File Comparison and Diff Viewer
 */

/**
 * Line change type in diff
 */
export enum ChangeType {
  /** Line is identical in both versions */
  UNCHANGED = 'unchanged',
  /** Line was added (exists in new but not old) */
  ADDED = 'added',
  /** Line was removed (exists in old but not new) */
  REMOVED = 'removed',
  /** Line was modified (removed + added at same position) */
  MODIFIED = 'modified',
}

/**
 * Single line in a diff
 */
export interface DiffLine {
  /** Line number in old file (1-indexed) */
  oldLineNumber: number | null;
  /** Line number in new file (1-indexed) */
  newLineNumber: number | null;
  /** Type of change */
  type: ChangeType;
  /** Content of the line */
  content: string;
}

/**
 * Diff result with metadata
 */
export interface DiffResult {
  /** Array of diff lines */
  lines: DiffLine[];
  /** Statistics */
  stats: {
    /** Number of lines added */
    added: number;
    /** Number of lines removed */
    removed: number;
    /** Number of lines modified */
    modified: number;
  };
}

/**
 * Edit operation in Myers diff
 */
interface EditOp {
  /** Type of edit */
  type: 'insert' | 'delete' | 'equal';
  /** Position in old content */
  oldPos: number;
  /** Position in new content */
  newPos: number;
}

/**
 * Generate diff between two text strings
 *
 * Uses Myers diff algorithm for optimal O(ND) performance.
 * Splits content into lines and computes line-by-line diff.
 *
 * @param oldContent - Original content
 * @param newContent - Modified content
 * @returns Diff result with lines and statistics
 *
 * @example
 * ```ts
 * const oldText = "line1\nline2\nline3";
 * const newText = "line1\nline2-modified\nline3";
 * const diff = generateDiff(oldText, newText);
 * // diff.lines contains DiffLine array
 * // diff.stats shows changes
 * ```
 */
export function generateDiff(oldContent: string, newContent: string): DiffResult {
  // Split into lines, preserving empty lines
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  // Compute edit script using Myers diff
  const editOps = computeMyersDiff(oldLines, newLines);

  // Convert edit operations to diff lines
  const { lines, added, removed } = editOpsToDiffLines(editOps, oldLines, newLines);

  // Compute modifications (adjacent removal + addition)
  const { lines: finalLines, modified } = computeModifications(lines);

  return {
    lines: finalLines,
    stats: {
      added,
      removed,
      modified,
    },
  };
}

/**
 * Compute Myers diff edit script
 *
 * Implements Myers O(ND) algorithm for shortest edit script.
 * Optimized for memory usage with large files.
 *
 * @param oldLines - Original lines
 * @param newLines - Modified lines
 * @returns Array of edit operations
 */
function computeMyersDiff(oldLines: string[], newLines: string[]): EditOp[] {
  const M = oldLines.length;
  const N = newLines.length;

  // Edge cases: empty content
  if (M === 0) {
    return newLines.map((line, i) => ({ type: 'insert' as const, oldPos: 0, newPos: i + 1 }));
  }
  if (N === 0) {
    return oldLines.map((line, i) => ({ type: 'delete' as const, oldPos: i + 1, newPos: 0 }));
  }

  // Myers algorithm: find shortest edit script
  const MAX = M + N;
  const V: Map<number, number> = new Map();

  // Trace path from (0,0) to (M,N)
  V.set(1, 0);

  const trace: (number | null)[][] = [];

  for (let d = 0; d <= MAX; d++) {
    trace.push(Array(MAX * 2 + 1).fill(null));

    for (let k = -d; k <= d; k += 2) {
      const x = traceDown(V, k, d);
      const y = x - k;

      trace[d][k + MAX] = x;

      // Check if we reached the end
      if (x === M && y === N) {
        return backtrack(trace, oldLines, newLines, M, N);
      }
    }
  }

  // Fallback (should never reach)
  return [];
}

/**
 * Trace down in Myers algorithm
 */
function traceDown(V: Map<number, number>, k: number, d: number): number {
  const MAX = 1000000; // Arbitrary large number

  let x: number;
  if (k === -d || (k !== d && (V.get(k - 1) ?? MAX) < (V.get(k + 1) ?? MAX))) {
    x = V.get(k - 1) ?? 0;
  } else {
    x = (V.get(k + 1) ?? 0) - 1;
  }

  const y = x - k;
  while (x < 1000000 && y < 1000000 && x >= 0 && y >= 0) {
    x++;
    y++;
  }
  return x - 1;
}

/**
 * Backtrack through trace to generate edit operations
 */
function backtrack(
  trace: (number | null)[][],
  oldLines: string[],
  newLines: string[],
  M: number,
  N: number
): EditOp[] {
  const ops: EditOp[] = [];
  let x = M;
  let y = N;

  const MAX = M + N;

  for (let d = trace.length - 1; d > 0; d--) {
    const k = x - y;
    const prevK =
      k === -d || (k !== d && (trace[d - 1][k - 1 + MAX] ?? 0) < (trace[d - 1][k + 1 + MAX] ?? 0))
        ? k + 1
        : k - 1;

    const prevX = trace[d - 1][prevK + MAX] ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      ops.unshift({ type: 'equal', oldPos: x, newPos: y });
      x--;
      y--;
    }

    if (x > prevX) {
      ops.unshift({ type: 'delete', oldPos: x, newPos: y });
      x--;
    } else if (y > prevY) {
      ops.unshift({ type: 'insert', oldPos: x, newPos: y });
      y--;
    }
  }

  while (x > 0 && y > 0) {
    ops.unshift({ type: 'equal', oldPos: x, newPos: y });
    x--;
    y--;
  }

  return ops;
}

/**
 * Convert edit operations to diff lines
 */
function editOpsToDiffLines(
  ops: EditOp[],
  oldLines: string[],
  newLines: string[]
): { lines: DiffLine[]; added: number; removed: number } {
  const lines: DiffLine[] = [];
  let added = 0;
  let removed = 0;

  for (const op of ops) {
    if (op.type === 'equal') {
      lines.push({
        oldLineNumber: op.oldPos,
        newLineNumber: op.newPos,
        type: ChangeType.UNCHANGED,
        content: oldLines[op.oldPos - 1],
      });
    } else if (op.type === 'delete') {
      lines.push({
        oldLineNumber: op.oldPos,
        newLineNumber: null,
        type: ChangeType.REMOVED,
        content: oldLines[op.oldPos - 1],
      });
      removed++;
    } else if (op.type === 'insert') {
      lines.push({
        oldLineNumber: null,
        newLineNumber: op.newPos,
        type: ChangeType.ADDED,
        content: newLines[op.newPos - 1],
      });
      added++;
    }
  }

  return { lines, added, removed };
}

/**
 * Compute modifications from adjacent removals and additions
 *
 * A modification is detected when a removed line is immediately
 * followed by an added line at the same position.
 */
function computeModifications(lines: DiffLine[]): { lines: DiffLine[]; modified: number } {
  const result: DiffLine[] = [];
  let modified = 0;
  let i = 0;

  while (i < lines.length) {
    const current = lines[i];

    // Check for modification pattern: REMOVED followed by ADDED
    if (
      current.type === ChangeType.REMOVED &&
      i + 1 < lines.length &&
      lines[i + 1].type === ChangeType.ADDED
    ) {
      const next = lines[i + 1];

      result.push({
        oldLineNumber: current.oldLineNumber,
        newLineNumber: next.newLineNumber,
        type: ChangeType.MODIFIED,
        content: current.content,
      });

      result.push({
        oldLineNumber: null,
        newLineNumber: next.newLineNumber,
        type: ChangeType.MODIFIED,
        content: next.content,
      });

      modified++;
      i += 2;
    } else {
      result.push(current);
      i++;
    }
  }

  return { lines: result, modified };
}

/**
 * Get word-level character differences for inline highlighting
 *
 * @param oldText - Original text
 * @param newText - Modified text
 * @returns Object with added and removed character ranges
 */
export function getInlineDiff(oldText: string, newText: string): {
  added: Array<{ start: number; end: number }>;
  removed: Array<{ start: number; end: number }>;
} {
  // Simple character-level diff
  const added: Array<{ start: number; end: number }> = [];
  const removed: Array<{ start: number; end: number }> = [];

  const matrix: number[][] = [];
  const oldLen = oldText.length;
  const newLen = newText.length;

  // Initialize LCS matrix (optimized for memory)
  const prevRow = Array(newLen + 1).fill(0);
  const currRow = Array(newLen + 1).fill(0);

  for (let i = 1; i <= oldLen; i++) {
    currRow[0] = 0;
    for (let j = 1; j <= newLen; j++) {
      if (oldText[i - 1] === newText[j - 1]) {
        currRow[j] = prevRow[j - 1] + 1;
      } else {
        currRow[j] = Math.max(prevRow[j], currRow[j - 1]);
      }
    }
    prevRow.splice(0, newLen + 1, ...currRow);
  }

  // Backtrack to find differences
  let i = oldLen;
  let j = newLen;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldText[i - 1] === newText[j - 1]) {
      i--;
      j--;
    } else if (j > 0 && (i === 0 || currRow[j] >= prevRow[j - 1])) {
      added.unshift({ start: j - 1, end: j });
      j--;
    } else if (i > 0 && (j === 0 || currRow[j] < prevRow[j - 1])) {
      removed.unshift({ start: i - 1, end: i });
      i--;
    }
  }

  return { added, removed };
}
