/**
 * Symbol Parser for Code Navigation
 * @module lib/navigation/symbol-parser
 *
 * Parses code files to extract symbols (functions, classes, variables, etc.)
 * Supports multiple languages: TypeScript, JavaScript, Python, Go, Rust, Java, C#, PHP
 *
 * S-043: Code Navigation
 */

/**
 * Symbol types supported by the parser
 */
export enum SymbolKind {
  Function = 'function',
  Method = 'method',
  Class = 'class',
  Interface = 'interface',
  Type = 'type',
  Variable = 'variable',
  Constant = 'constant',
  Enum = 'enum',
  Namespace = 'namespace',
  Module = 'module',
  Constructor = 'constructor',
  Property = 'property',
  EnumMember = 'enumMember',
  Struct = 'struct',
}

/**
 * Symbol information
 */
export interface Symbol {
  /** Symbol name */
  name: string;
  /** Symbol kind */
  kind: SymbolKind;
  /** Start line number (1-based) */
  line: number;
  /** Start column number (1-based) */
  column: number;
  /** End line number */
  endLine?: number;
  /** End column number */
  endColumn?: number;
  /** Symbol scope (namespace, class, etc.) */
  containerName?: string;
  /** Symbol visibility (public, private, protected) */
  visibility?: 'public' | 'private' | 'protected';
  /** JSDoc or documentation comment */
  documentation?: string;
}

/**
 * Language detection from file extension
 */
export function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    py: 'python',
    go: 'go',
    rs: 'rust',
    java: 'java',
    cs: 'csharp',
    php: 'php',
  };
  return languageMap[ext] ?? 'plaintext';
}

/**
 * Parse symbols from code content
 * @param code - Source code content
 * @param filePath - File path for language detection
 * @returns Array of symbols
 */
export function parseSymbols(code: string, filePath: string): Symbol[] {
  const language = getLanguageFromPath(filePath);

  switch (language) {
    case 'typescript':
    case 'javascript':
      return parseTypeScriptSymbols(code);
    case 'python':
      return parsePythonSymbols(code);
    case 'go':
      return parseGoSymbols(code);
    case 'rust':
      return parseRustSymbols(code);
    case 'java':
      return parseJavaSymbols(code);
    case 'csharp':
      return parseCSharpSymbols(code);
    case 'php':
      return parsePHPSymbols(code);
    default:
      return [];
  }
}

/**
 * Parse TypeScript/JavaScript symbols
 */
function parseTypeScriptSymbols(code: string): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');

  // Regex patterns for TypeScript
  const patterns = [
    // Functions: function name, export function name, const name = () =>
    {
      regex:
        /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/,
      kind: SymbolKind.Function,
    },
    // Arrow functions: const name = () =>, const name = async () =>
    {
      regex: /^const\s+(\w+)\s*(?::\s*\w+)?\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/,
      kind: SymbolKind.Function,
    },
    // Classes: export class name, class name
    { regex: /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/, kind: SymbolKind.Class },
    // Interfaces: export interface name, interface name
    { regex: /^(?:export\s+)?interface\s+(\w+)/, kind: SymbolKind.Interface },
    // Type aliases: export type name, type name
    { regex: /^(?:export\s+)?type\s+(\w+)\s*=/, kind: SymbolKind.Type },
    // Enums: export enum name, enum name
    { regex: /^(?:export\s+)?(?:const\s+)?enum\s+(\w+)/, kind: SymbolKind.Enum },
    // Variables: const name, let name, var name
    {
      regex: /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*[=:]/,
      kind: SymbolKind.Variable,
    },
    // Methods (inside classes): name(...), private name(...), protected name(...)
    {
      regex: /^\s*(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\(?[^)]*\)?\s*\{/,
      kind: SymbolKind.Method,
    },
    // Properties: name: Type, private name, readonly name
    {
      regex: /^\s*(?:public|private|protected|readonly)?\s*(\w+)\s*:\s*\w+/,
      kind: SymbolKind.Property,
    },
    // Namespaces: namespace name
    {
      regex: /^(?:export\s+)?namespace\s+(\w+)/,
      kind: SymbolKind.Namespace,
    },
  ];

  let currentContainer: string | undefined;
  let currentVisibility: 'public' | 'private' | 'protected' | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track container (class/interface)
    if (/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/.test(line)) {
      const match = line.match(/^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/);
      if (match) {
        currentContainer = match[1];
      }
    } else if (
      /^(?:export\s+)?interface\s+(\w+)/.test(line) ||
      /^(?:export\s+)?namespace\s+(\w+)/.test(line)
    ) {
      const match =
        line.match(/^(?:export\s+)?interface\s+(\w+)/) ||
        line.match(/^(?:export\s+)?namespace\s+(\w+)/);
      if (match) {
        currentContainer = match[1];
      }
    } else if (/^\s*\}/.test(line) && currentContainer) {
      // Closing brace - exit container
      currentContainer = undefined;
    }

    // Track visibility
    if (/\bprivate\s+\w+/.test(line)) {
      currentVisibility = 'private';
    } else if (/\bprotected\s+\w+/.test(line)) {
      currentVisibility = 'protected';
    } else {
      currentVisibility = 'public';
    }

    // Try to match patterns
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const name = match[1];
        const column = line.indexOf(name) + 1;

        // Skip if this is a method outside of a class (false positive)
        if (
          pattern.kind === SymbolKind.Method &&
          !currentContainer &&
          !line.startsWith(' ')
        ) {
          continue;
        }

        symbols.push({
          name,
          kind: pattern.kind,
          line: lineNumber,
          column,
          containerName: currentContainer,
          visibility: currentVisibility,
        });
        break; // Only match one pattern per line
      }
    }
  }

  return symbols;
}

/**
 * Parse Python symbols
 */
function parsePythonSymbols(code: string): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');

  // Python patterns
  const patterns = [
    // Functions: def name(self, ...), async def name(self, ...)
    {
      regex: /^(?:async\s+)?def\s+(\w+)\s*\(/,
      kind: SymbolKind.Function,
    },
    // Classes: class Name(BaseClass, ...)
    { regex: /^class\s+(\w+)/, kind: SymbolKind.Class },
    // Variables (module level): name = value
    { regex: /^(\w+)\s*=\s*(?!\{)/, kind: SymbolKind.Variable },
    // Constants: UPPER_CASE_NAME = value
    {
      regex: /^([A-Z_][A-Z0-9_]*)\s*=/,
      kind: SymbolKind.Constant,
    },
  ];

  let currentClass: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track class
    if (/^class\s+(\w+)/.test(line)) {
      const match = line.match(/^class\s+(\w+)/);
      if (match) {
        currentClass = match[1];
      }
    } else if (/^(?!\s)/.test(line) && currentClass) {
      // Non-indented line - exit class
      currentClass = undefined;
    }

    // Try to match patterns
    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const name = match[1];
        const column = line.indexOf(name) + 1;

        const kind =
          pattern.kind === SymbolKind.Function && currentClass
            ? SymbolKind.Method
            : pattern.kind;

        symbols.push({
          name,
          kind,
          line: lineNumber,
          column,
          containerName: currentClass,
        });
        break;
      }
    }
  }

  return symbols;
}

/**
 * Parse Go symbols
 */
function parseGoSymbols(code: string): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');

  // Go patterns
  const patterns = [
    // Functions: func name(...), func (r *Type) name(...)
    {
      regex: /^func\s+(?:\([^)]+\)\s+)?(\w+)\s*\(/,
      kind: SymbolKind.Function,
    },
    // Types: type Name struct, type Name interface
    {
      regex: /^type\s+(\w+)\s+(?:struct|interface)/,
      kind: SymbolKind.Type,
    },
    // Variables: var name Type
    { regex: /^var\s+(\w+)\s+\w+/, kind: SymbolKind.Variable },
    // Constants: const name = value
    { regex: /^const\s+(\w+)\s*=/, kind: SymbolKind.Constant },
    // Interfaces
    { regex: /^type\s+(\w+)\s+interface/, kind: SymbolKind.Interface },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const name = match[1];
        const column = line.indexOf(name) + 1;

        // Check if method (has receiver)
        const isMethod = /^func\s+\([^)]+\)/.test(line);

        symbols.push({
          name,
          kind: isMethod ? SymbolKind.Method : pattern.kind,
          line: lineNumber,
          column,
        });
        break;
      }
    }
  }

  return symbols;
}

/**
 * Parse Rust symbols
 */
function parseRustSymbols(code: string): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');

  // Rust patterns
  const patterns = [
    // Functions: pub fn name(...), fn name(...)
    { regex: /^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*\(/, kind: SymbolKind.Function },
    // Structs: pub struct Name, struct Name
    { regex: /^(?:pub\s+)?struct\s+(\w+)/, kind: SymbolKind.Struct },
    // Enums: pub enum Name, enum Name
    { regex: /^(?:pub\s+)?enum\s+(\w+)/, kind: SymbolKind.Enum },
    // Traits: pub trait Name, trait Name
    { regex: /^(?:pub\s+)?trait\s+(\w+)/, kind: SymbolKind.Interface },
    // Impl blocks: impl Type
    { regex: /^impl\s+(\w+)/, kind: SymbolKind.Namespace },
    // Constants: pub const NAME: Type, const NAME: Type
    { regex: /^(?:pub\s+)?const\s+(\w+)\s*:/, kind: SymbolKind.Constant },
    // Static: pub static NAME: Type
    { regex: /^(?:pub\s+)?static\s+(\w+)\s*:/, kind: SymbolKind.Constant },
  ];

  let currentImpl: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track impl block
    if (/^impl\s+(\w+)/.test(line)) {
      const match = line.match(/^impl\s+(\w+)/);
      if (match) {
        currentImpl = match[1];
      }
    } else if (/^}/.test(line) && currentImpl) {
      currentImpl = undefined;
    }

    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const name = match[1];
        const column = line.indexOf(name) + 1;

        symbols.push({
          name,
          kind: pattern.kind,
          line: lineNumber,
          column,
          containerName: currentImpl,
        });
        break;
      }
    }
  }

  return symbols;
}

/**
 * Parse Java symbols
 */
function parseJavaSymbols(code: string): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');

  // Java patterns
  const patterns = [
    // Classes: public class Name, class Name
    {
      regex: /^(?:public|private|protected)?\s*(?:abstract\s+)?class\s+(\w+)/,
      kind: SymbolKind.Class,
    },
    // Interfaces: public interface Name, interface Name
    {
      regex: /^(?:public\s+)?interface\s+(\w+)/,
      kind: SymbolKind.Interface,
    },
    // Methods: public returnType name(...), private void name(...)
    {
      regex: /^\s*(?:public|private|protected)?\s*(?:static\s+)?(?:\w+(?:<[^>]+>)?)\s+(\w+)\s*\(/,
      kind: SymbolKind.Method,
    },
    // Enums: public enum Name, enum Name
    { regex: /^(?:public\s+)?enum\s+(\w+)/, kind: SymbolKind.Enum },
    // Fields: private Type name;, public Type name = value;
    {
      regex: /^\s*(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?\w+\s+(\w+)\s*[=;]/,
      kind: SymbolKind.Property,
    },
  ];

  let currentClass: string | undefined;
  let currentVisibility: 'public' | 'private' | 'protected' = 'public';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track class
    if (/\sclass\s+(\w+)/.test(line)) {
      const match = line.match(/\sclass\s+(\w+)/);
      if (match) {
        currentClass = match[1];
      }
    } else if (/^\s*\}/.test(line) && currentClass) {
      currentClass = undefined;
    }

    // Track visibility
    if (/\bprivate\b/.test(line)) {
      currentVisibility = 'private';
    } else if (/\bprotected\b/.test(line)) {
      currentVisibility = 'protected';
    } else if (/\bpublic\b/.test(line)) {
      currentVisibility = 'public';
    }

    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const name = match[1];
        const column = line.indexOf(name) + 1;

        symbols.push({
          name,
          kind: pattern.kind,
          line: lineNumber,
          column,
          containerName: currentClass,
          visibility: currentVisibility,
        });
        break;
      }
    }
  }

  return symbols;
}

/**
 * Parse C# symbols
 */
function parseCSharpSymbols(code: string): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');

  // C# patterns
  const patterns = [
    // Classes: public class Name, class Name
    {
      regex: /^(?:public|private|protected|internal)?\s*(?:abstract\s+)?(?:sealed\s+)?class\s+(\w+)/,
      kind: SymbolKind.Class,
    },
    // Interfaces: public interface Name, interface Name
    {
      regex: /^(?:public|internal)?\s*interface\s+(\w+)/,
      kind: SymbolKind.Interface,
    },
    // Methods: public ReturnType Name(...), private void Name(...)
    {
      regex: /^\s*(?:public|private|protected|internal)?\s*(?:static\s+)?(?:async\s+)?(?:\w+(?:<[^>]+>)?)\s+(\w+)\s*\(/,
      kind: SymbolKind.Method,
    },
    // Properties: public Type Name { get; set; }
    {
      regex: /^\s*(?:public|private|protected|internal)?\s*(?:static\s+)?\w+\s+(\w+)\s*\{/,
      kind: SymbolKind.Property,
    },
    // Enums: public enum Name, enum Name
    { regex: /^(?:public\s+)?enum\s+(\w+)/, kind: SymbolKind.Enum },
    // Namespaces: namespace Name
    { regex: /^namespace\s+(\w+)/, kind: SymbolKind.Namespace },
  ];

  let currentClass: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track class
    if (/\sclass\s+(\w+)/.test(line)) {
      const match = line.match(/\sclass\s+(\w+)/);
      if (match) {
        currentClass = match[1];
      }
    } else if (/^\s*\}/.test(line) && currentClass) {
      currentClass = undefined;
    }

    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const name = match[1];
        const column = line.indexOf(name) + 1;

        symbols.push({
          name,
          kind: pattern.kind,
          line: lineNumber,
          column,
          containerName: currentClass,
        });
        break;
      }
    }
  }

  return symbols;
}

/**
 * Parse PHP symbols
 */
function parsePHPSymbols(code: string): Symbol[] {
  const symbols: Symbol[] = [];
  const lines = code.split('\n');

  // PHP patterns
  const patterns = [
    // Functions: function name(...), public function name(...)
    {
      regex: /^(?:public|private|protected)?\s*(?:static\s+)?function\s+(\w+)\s*\(/,
      kind: SymbolKind.Function,
    },
    // Classes: class Name, final class Name
    { regex: /^(?:abstract\s+)?(?:final\s+)?class\s+(\w+)/, kind: SymbolKind.Class },
    // Interfaces: interface Name
    { regex: /^interface\s+(\w+)/, kind: SymbolKind.Interface },
    // Traits: trait Name
    { regex: /^trait\s+(\w+)/, kind: SymbolKind.Interface },
    // Constants: const NAME = value
    { regex: /^\s*const\s+(\w+)\s*=/, kind: SymbolKind.Constant },
    // Properties: public $name, private $name
    {
      regex: /^\s*(?:public|private|protected|var)\s+(\$\w+)/,
      kind: SymbolKind.Property,
    },
  ];

  let currentClass: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Track class
    if (/class\s+(\w+)/.test(line)) {
      const match = line.match(/class\s+(\w+)/);
      if (match) {
        currentClass = match[1];
      }
    } else if (/^}/.test(line) && currentClass) {
      currentClass = undefined;
    }

    for (const pattern of patterns) {
      const match = line.match(pattern.regex);
      if (match) {
        const name = match[1];
        const column = line.indexOf(name) + 1;

        const kind =
          pattern.kind === SymbolKind.Function && currentClass
            ? SymbolKind.Method
            : pattern.kind;

        symbols.push({
          name,
          kind,
          line: lineNumber,
          column,
          containerName: currentClass,
        });
        break;
      }
    }
  }

  return symbols;
}

/**
 * Find symbol at position in code
 * @param code - Source code content
 * @param filePath - File path for language detection
 * @param line - Line number (1-based)
 * @param column - Column number (1-based)
 * @returns Symbol at position or undefined
 */
export function findSymbolAtPosition(
  code: string,
  filePath: string,
  line: number,
  column: number
): Symbol | undefined {
  const symbols = parseSymbols(code, filePath);
  return symbols.find((symbol) => {
    if (symbol.line !== line) return false;
    if (!symbol.endColumn) return column >= symbol.column;
    return column >= symbol.column && column <= symbol.endColumn;
  });
}

/**
 * Get symbol icon for UI
 * @param kind - Symbol kind
 * @returns Lucide icon name
 */
export function getSymbolIcon(kind: SymbolKind): string {
  const iconMap: Record<SymbolKind, string> = {
    [SymbolKind.Function]: 'Code',
    [SymbolKind.Method]: 'Code',
    [SymbolKind.Class]: 'Box',
    [SymbolKind.Interface]: 'Box',
    [SymbolKind.Type]: 'Type',
    [SymbolKind.Variable]: 'Variable',
    [SymbolKind.Constant]: 'Hash',
    [SymbolKind.Enum]: 'List',
    [SymbolKind.Namespace]: 'Folder',
    [SymbolKind.Module]: 'File',
    [SymbolKind.Constructor]: 'Code',
    [SymbolKind.Property]: 'AlignLeft',
    [SymbolKind.EnumMember]: 'Dot',
    [SymbolKind.Struct]: 'Box',
  };
  return iconMap[kind] || 'Code';
}

/**
 * Group symbols by kind
 * @param symbols - Array of symbols
 * @returns Object with symbols grouped by kind
 */
export function groupSymbolsByKind(symbols: Symbol[]): Record<SymbolKind, Symbol[]> {
  const grouped: Record<string, Symbol[]> = {};
  for (const symbol of symbols) {
    if (!grouped[symbol.kind]) {
      grouped[symbol.kind] = [];
    }
    grouped[symbol.kind].push(symbol);
  }
  return grouped as Record<SymbolKind, Symbol[]>;
}
