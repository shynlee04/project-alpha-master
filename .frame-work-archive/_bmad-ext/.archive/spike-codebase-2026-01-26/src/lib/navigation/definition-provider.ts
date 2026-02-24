/**
 * Definition Provider for Go-to-Definition
 * @module lib/navigation/definition-provider
 *
 * Provides go-to-definition functionality for code navigation
 * Supports local definitions, imported definitions, and built-in definitions
 *
 * S-043: Code Navigation
 */

import type { editor } from 'monaco-editor';
import type { Position } from 'monaco-editor';
import { parseSymbols, type Symbol, SymbolKind } from './symbol-parser';

/**
 * Definition location
 */
export interface DefinitionLocation {
  /** File path (absolute) */
  filePath: string;
  /** Line number (1-based) */
  line: number;
  /** Column number (1-based) */
  column: number;
  /** Symbol name */
  name: string;
  /** Symbol kind */
  kind: SymbolKind;
}

/**
 * Definition result
 */
export interface DefinitionResult {
  /** Definition locations (can be multiple for overloaded functions) */
  definitions: DefinitionLocation[];
  /** Whether definition is in current file */
  isLocal: boolean;
  /** Whether definition is built-in (TypeScript/Node built-ins) */
  isBuiltIn: boolean;
  /** Whether definition is in node_modules */
  isThirdParty: boolean;
}

/**
 * File cache for storing parsed symbols
 */
const fileSymbolCache = new Map<string, Symbol[]>();

/**
 * Current workspace files map (filePath -> content)
 * @example
 * const files = {
 *   '/project/src/index.ts': 'export function foo() {}',
 *   '/project/src/utils.ts': 'export function bar() {}',
 * }
 */
export let workspaceFiles: Map<string, string> = new Map();

/**
 * Update workspace files cache
 * @param files - Map of file paths to content
 */
export function updateWorkspaceFiles(files: Map<string, string>): void {
  workspaceFiles = new Map(files);
  // Clear cache when workspace changes
  fileSymbolCache.clear();
}

/**
 * Get symbols for a file (with caching)
 * @param filePath - File path
 * @returns Array of symbols or undefined if file not found
 */
function getFileSymbols(filePath: string): Symbol[] | undefined {
  // Check cache first
  if (fileSymbolCache.has(filePath)) {
    return fileSymbolCache.get(filePath);
  }

  // Get file content
  const content = workspaceFiles.get(filePath);
  if (!content) {
    return undefined;
  }

  // Parse symbols
  const symbols = parseSymbols(content, filePath);
  fileSymbolCache.set(filePath, symbols);
  return symbols;
}

/**
 * Find definition of symbol at position
 * @param filePath - Current file path
 * @param line - Line number (1-based)
 * @param column - Column number (1-based)
 * @param word - Word at position (for faster lookup)
 * @returns Definition result or undefined if not found
 */
export function findDefinition(
  filePath: string,
  line: number,
  column: number,
  word?: string
): DefinitionResult | undefined {
  // Get current file symbols
  const symbols = getFileSymbols(filePath);
  if (!symbols) {
    return undefined;
  }

  // Find symbol at position (local definition)
  const symbolAtPosition = symbols.find((s) => s.line === line && column >= s.column);

  if (!symbolAtPosition && !word) {
    return undefined;
  }

  const symbolName = word || symbolAtPosition?.name;
  if (!symbolName) {
    return undefined;
  }

  // Check if it's a built-in or reserved word
  if (isBuiltInSymbol(symbolName)) {
    return {
      definitions: [],
      isLocal: false,
      isBuiltIn: true,
      isThirdParty: false,
    };
  }

  // Search for definition in current file first
  const localDefinitions = symbols.filter(
    (s) => s.name === symbolName && s.kind !== SymbolKind.Variable
  );

  if (localDefinitions.length > 0) {
    return {
      definitions: localDefinitions.map((s) => ({
        filePath,
        line: s.line,
        column: s.column,
        name: s.name,
        kind: s.kind,
      })),
      isLocal: true,
      isBuiltIn: false,
      isThirdParty: false,
    };
  }

  // Search in other workspace files
  const externalDefinitions: DefinitionLocation[] = [];
  for (const [otherFilePath, _otherContent] of workspaceFiles.entries()) {
    if (otherFilePath === filePath) continue;

    const otherSymbols = getFileSymbols(otherFilePath);
    if (!otherSymbols) continue;

    const matchingSymbols = otherSymbols.filter(
      (s) =>
        s.name === symbolName &&
        (s.kind === SymbolKind.Function ||
          s.kind === SymbolKind.Class ||
          s.kind === SymbolKind.Interface ||
          s.kind === SymbolKind.Type ||
          s.kind === SymbolKind.Enum ||
          s.kind === SymbolKind.Constant)
    );

    for (const symbol of matchingSymbols) {
      externalDefinitions.push({
        filePath: otherFilePath,
        line: symbol.line,
        column: symbol.column,
        name: symbol.name,
        kind: symbol.kind,
      });
    }
  }

  if (externalDefinitions.length > 0) {
    return {
      definitions: externalDefinitions,
      isLocal: false,
      isBuiltIn: false,
      isThirdParty: false,
    };
  }

  // Check if it might be from node_modules
  if (isProbablyNodeModuleImport(symbolName)) {
    return {
      definitions: [],
      isLocal: false,
      isBuiltIn: false,
      isThirdParty: true,
    };
  }

  return undefined;
}

/**
 * Check if symbol is a built-in TypeScript/JavaScript symbol
 * @param name - Symbol name
 * @returns True if built-in
 */
function isBuiltInSymbol(name: string): boolean {
  const builtIns = new Set([
    // JavaScript built-ins
    'Array',
    'Object',
    'String',
    'Number',
    'Boolean',
    'Date',
    'Math',
    'JSON',
    'Promise',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Error',
    'TypeError',
    'SyntaxError',
    'RegExp',
    'console',
    'window',
    'document',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    // TypeScript built-ins
    'Record',
    'Partial',
    'Required',
    'Pick',
    'Omit',
    'Exclude',
    'Extract',
    'ReturnType',
    'Parameters',
    // Reserved words
    'if',
    'else',
    'for',
    'while',
    'do',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'function',
    'class',
    'interface',
    'type',
    'enum',
    'const',
    'let',
    'var',
    'import',
    'export',
    'from',
    'default',
    'async',
    'await',
    'try',
    'catch',
    'finally',
    'throw',
    'new',
    'this',
    'super',
    'extends',
    'implements',
    'static',
    'public',
    'private',
    'protected',
    'readonly',
  ]);

  return builtIns.has(name);
}

/**
 * Check if symbol might be from node_modules
 * @param name - Symbol name
 * @returns True if probably from node_modules
 */
function isProbablyNodeModuleImport(name: string): boolean {
  // Check if name looks like an import from a package
  // This is a heuristic - actual detection would require parsing import statements
  const commonPackages = [
    'react',
    'React',
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useRef',
    'zod',
    'Zod',
    'clsx',
    'cn',
  ];
  return commonPackages.includes(name);
}

/**
 * Find definition from Monaco editor position
 * @param model - Monaco editor model
 * @param position - Monaco editor position
 * @returns Definition result or undefined
 */
export function findDefinitionFromMonaco(
  model: editor.ITextModel,
  position: Position
): DefinitionResult | undefined {
  const filePath = model.uri.path;
  const word = model.getWordAtPosition(position);
  const wordText = word?.word;

  return findDefinition(
    filePath,
    position.lineNumber,
    position.column,
    wordText
  );
}

/**
 * Get definition preview (lines of code around definition)
 * @param definition - Definition location
 * @param contextLines - Number of lines before and after to include
 * @returns Preview text or undefined if file not found
 */
export function getDefinitionPreview(
  definition: DefinitionLocation,
  contextLines: number = 3
): string | undefined {
  const content = workspaceFiles.get(definition.filePath);
  if (!content) {
    return undefined;
  }

  const lines = content.split('\n');
  const startLine = Math.max(0, definition.line - contextLines - 1);
  const endLine = Math.min(lines.length, definition.line + contextLines);

  return lines.slice(startLine, endLine).join('\n');
}

/**
 * Navigate to definition in Monaco editor
 * @param editor - Monaco editor instance
 * @param definition - Definition location
 * @returns True if navigation successful
 */
export function navigateToDefinition(
  editor: editor.IStandaloneCodeEditor | null,
  definition: DefinitionLocation
): boolean {
  if (!editor) {
    return false;
  }

  const model = editor.getModel();
  if (!model) {
    return false;
  }

  // Check if definition is in current file
  if (model.uri.path === definition.filePath) {
    // Navigate within current file
    editor.setPosition({
      lineNumber: definition.line,
      column: definition.column,
    });
    editor.revealLineInCenter(definition.line);
    return true;
  }

  // Definition is in different file - would need to open that file
  // This would require integration with file system/tab management
  console.log('[DefinitionProvider] Navigate to different file:', definition.filePath);
  return false;
}

/**
 * Clear symbol cache (call when workspace changes significantly)
 */
export function clearSymbolCache(): void {
  fileSymbolCache.clear();
}

/**
 * Get all export definitions from a file
 * @param filePath - File path
 * @returns Array of exported symbols
 */
export function getExportedSymbols(filePath: string): DefinitionLocation[] {
  const symbols = getFileSymbols(filePath);
  if (!symbols) {
    return [];
  }

  // Filter for exported symbols (public/exported)
  const exported = symbols.filter(
    (s) =>
      s.visibility === 'public' ||
      s.visibility === undefined ||
      s.kind === SymbolKind.Enum ||
      s.kind === SymbolKind.Type ||
      s.kind === SymbolKind.Interface
  );

  return exported.map((s) => ({
    filePath,
    line: s.line,
    column: s.column,
    name: s.name,
    kind: s.kind,
  }));
}
