/**
 * References Provider for Find References
 * @module lib/navigation/references-provider
 *
 * Provides find-references functionality to locate all usages of a symbol
 * across workspace files
 *
 * S-043: Code Navigation
 */

import type { editor } from 'monaco-editor';
import type { Position } from 'monaco-editor';
import { parseSymbols, SymbolKind } from './symbol-parser';
import { workspaceFiles } from './definition-provider';

/**
 * Reference type
 */
export enum ReferenceType {
  /** Variable read access */
  Read = 'read',
  /** Variable write/assignment */
  Write = 'write',
  /** Function/method call */
  Call = 'call',
  /** Import statement */
  Import = 'import',
  /** Export statement */
  Export = 'export',
  /** Type reference */
  Type = 'type',
}

/**
 * Reference location
 */
export interface ReferenceLocation {
  /** File path (absolute) */
  filePath: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** Reference type */
  type: ReferenceType;
  /** Line content for preview */
  lineContent: string;
}

/**
 * References result
 */
export interface ReferencesResult {
  /** Reference locations */
  references: ReferenceLocation[];
  /** Total number of references */
  count: number;
  /** Symbol name */
  symbolName: string;
  /** Symbol kind */
  symbolKind: SymbolKind;
  /** Definition location */
  definition: {
    filePath: string;
    line: number;
    column: number;
  } | null;
}

/**
 * Find all references to a symbol
 * @param filePath - File path where symbol is defined
 * @param line - Line number of symbol definition
 * @param column - Column number of symbol definition
 * @returns References result
 */
export function findReferences(
  filePath: string,
  line: number,
  _column: number
): ReferencesResult | undefined {
  // Get symbols for the definition file
  const content = workspaceFiles.get(filePath);
  if (!content) {
    return undefined;
  }

  const symbols = parseSymbols(content, filePath);
  const symbol = symbols.find((s) => s.line === line);

  if (!symbol) {
    return undefined;
  }

  const references: ReferenceLocation[] = [];

  // Search in all workspace files
  for (const [searchFilePath, searchContent] of workspaceFiles.entries()) {
    const fileReferences = findReferencesInFile(
      symbol.name,
      searchFilePath,
      searchContent,
      searchFilePath === filePath
    );
    references.push(...fileReferences);
  }

  // Sort by file path, then line number
  references.sort((a, b) => {
    if (a.filePath !== b.filePath) {
      return a.filePath.localeCompare(b.filePath);
    }
    return a.line - b.line;
  });

  return {
    references,
    count: references.length,
    symbolName: symbol.name,
    symbolKind: symbol.kind,
    definition: {
      filePath,
      line: symbol.line,
      column: symbol.column,
    },
  };
}

/**
 * Find references to a symbol in a specific file
 * @param symbolName - Symbol name to search for
 * @param filePath - File path to search in
 * @param content - File content
 * @param isDefinitionFile - Whether this is the definition file
 * @returns Array of reference locations
 */
function findReferencesInFile(
  symbolName: string,
  filePath: string,
  content: string,
  isDefinitionFile: boolean
): ReferenceLocation[] {
  const references: ReferenceLocation[] = [];
  const lines = content.split('\n');

  // Create regex pattern to match symbol name
  // Use word boundaries to avoid partial matches
  const pattern = new RegExp(`\\b${escapeRegex(symbolName)}\\b`, 'g');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip the definition line itself if in definition file
    if (isDefinitionFile) {
      const symbols = parseSymbols(content, filePath);
      const definitionSymbol = symbols.find((s) => s.name === symbolName);
      if (definitionSymbol && definitionSymbol.line === lineNumber) {
        continue;
      }
    }

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(line)) !== null) {
      const column = match.index + 1;

      // Determine reference type
      const type = determineReferenceType(line, symbolName);

      references.push({
        filePath,
        line: lineNumber,
        column,
        type,
        lineContent: line.trim(),
      });
    }
  }

  return references;
}

/**
 * Determine reference type from context
 * @param lineContent - Line content
 * @param symbolName - Symbol name
 * @returns Reference type
 */
function determineReferenceType(
  lineContent: string,
  symbolName: string
): ReferenceType {
  const trimmed = lineContent.trim();

  // Import statement
  if (
    trimmed.startsWith('import ') ||
    trimmed.includes(`import { ${symbolName}`) ||
    trimmed.includes(`import {${symbolName}`) ||
    trimmed.includes(`from '${symbolName}`) ||
    trimmed.includes(`from "${symbolName}`)
  ) {
    return ReferenceType.Import;
  }

  // Export statement
  if (
    trimmed.startsWith('export ') &&
    trimmed.includes(symbolName) &&
    (trimmed.includes('function') ||
      trimmed.includes('class') ||
      trimmed.includes('interface') ||
      trimmed.includes('type') ||
      trimmed.includes('enum') ||
      trimmed.includes('const'))
  ) {
    return ReferenceType.Export;
  }

  // Function/method call (has parentheses after)
  if (new RegExp(`\\b${escapeRegex(symbolName)}\\s*\\(`).test(lineContent)) {
    return ReferenceType.Call;
  }

  // Type reference (after colon, in type position)
  if (new RegExp(`:\\s*${escapeRegex(symbolName)}\\b`).test(lineContent)) {
    return ReferenceType.Type;
  }

  // Assignment (has = or := before)
  if (new RegExp(`\\b\\w+\\s*=\\s*${escapeRegex(symbolName)}\\b`).test(lineContent)) {
    return ReferenceType.Write;
  }

  // Default: read reference
  return ReferenceType.Read;
}

/**
 * Escape special regex characters
 * @param str - String to escape
 * @returns Escaped string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Group references by file
 * @param references - Array of reference locations
 * @returns Object with references grouped by file path
 */
export function groupReferencesByFile(
  references: ReferenceLocation[]
): Record<string, ReferenceLocation[]> {
  const grouped: Record<string, ReferenceLocation[]> = {};

  for (const ref of references) {
    if (!grouped[ref.filePath]) {
      grouped[ref.filePath] = [];
    }
    grouped[ref.filePath].push(ref);
  }

  return grouped;
}

/**
 * Find references from Monaco editor position
 * @param model - Monaco editor model
 * @param position - Monaco editor position
 * @returns References result or undefined
 */
export function findReferencesFromMonaco(
  model: editor.ITextModel,
  position: Position
): ReferencesResult | undefined {
  const filePath = model.uri.path;

  return findReferences(filePath, position.lineNumber, position.column);
}

/**
 * Get reference count for a symbol
 * @param filePath - File path where symbol is defined
 * @param line - Line number of symbol definition
 * @param column - Column number of symbol definition
 * @returns Number of references or undefined if symbol not found
 */
export function getReferenceCount(
  filePath: string,
  line: number,
  column: number
): number | undefined {
  const result = findReferences(filePath, line, column);
  return result?.count;
}

/**
 * Get reference summary (counts by type)
 * @param references - Array of reference locations
 * @returns Object with counts by reference type
 */
export function getReferenceSummary(
  references: ReferenceLocation[]
): Record<ReferenceType, number> {
  const summary: Record<string, number> = {
    [ReferenceType.Read]: 0,
    [ReferenceType.Write]: 0,
    [ReferenceType.Call]: 0,
    [ReferenceType.Import]: 0,
    [ReferenceType.Export]: 0,
    [ReferenceType.Type]: 0,
  };

  for (const ref of references) {
    summary[ref.type]++;
  }

  return summary as Record<ReferenceType, number>;
}

/**
 * Check if symbol has any references
 * @param filePath - File path where symbol is defined
 * @param line - Line number of symbol definition
 * @param column - Column number of symbol definition
 * @returns True if symbol has at least one reference
 */
export function hasReferences(
  filePath: string,
  line: number,
  column: number
): boolean {
  const count = getReferenceCount(filePath, line, column);
  return count !== undefined && count > 0;
}

/**
 * Find all symbols that reference a specific file
 * @param filePath - File path to find references to
 * @returns Array of symbols that import/reference the file
 */
export function findFileReferences(filePath: string): ReferenceLocation[] {
  const references: ReferenceLocation[] = [];

  // Get file name from path
  const fileName = filePath.split('/').pop()?.replace(/\.(ts|tsx|js|jsx)$/, '');

  if (!fileName) {
    return references;
  }

  // Search for imports/exports in all files
  for (const [searchFilePath, searchContent] of workspaceFiles.entries()) {
    if (searchFilePath === filePath) continue;

    const lines = searchContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for import/export statements
      const importPattern = new RegExp(
        `\\bfrom\\s+['"]\\.\\.?\\/.*\\b${escapeRegex(fileName)}['"]`
      );

      if (importPattern.test(line)) {
        const column = line.indexOf(fileName) + 1;
        references.push({
          filePath: searchFilePath,
          line: lineNumber,
          column,
          type: ReferenceType.Import,
          lineContent: line.trim(),
        });
      }
    }
  }

  return references;
}
