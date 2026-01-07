/**
 * Symbol Outline Generator
 * @module lib/navigation/symbol-outline
 *
 * Generates outline/tree structure of symbols in a file
 * Provides hierarchical view for code exploration
 *
 * S-043: Code Navigation
 */

import type { editor } from 'monaco-editor';
import { parseSymbols, getSymbolIcon, type Symbol, SymbolKind } from './symbol-parser';

/**
 * Outline tree node
 */
export interface OutlineNode {
  /** Symbol name */
  name: string;
  /** Symbol kind */
  kind: SymbolKind;
  /** Line number */
  line: number;
  /** Column number */
  column: number;
  /** Icon name (Lucide) */
  icon: string;
  /** Visibility (public, private, protected) */
  visibility?: 'public' | 'private' | 'protected';
  /** Child nodes (for nested symbols) */
  children?: OutlineNode[];
  /** Whether node is expanded */
  expanded?: boolean;
}

/**
 * Outline options
 */
export interface OutlineOptions {
  /** Group symbols by kind */
  groupByKind?: boolean;
  /** Sort symbols (by name, by line) */
  sort?: 'name' | 'line' | 'none';
  /** Filter symbols by kind */
  filterKinds?: SymbolKind[];
  /** Show visibility badges */
  showVisibility?: boolean;
  /** Collapse nested structures */
  collapseNested?: boolean;
}

/**
 * Default outline options
 */
const defaultOptions: OutlineOptions = {
  groupByKind: false,
  sort: 'line',
  filterKinds: undefined,
  showVisibility: true,
  collapseNested: false,
};

/**
 * Generate outline tree from code
 * @param code - Source code content
 * @param filePath - File path for language detection
 * @param options - Outline options
 * @returns Outline tree nodes
 */
export function generateOutline(
  code: string,
  filePath: string,
  options: OutlineOptions = {}
): OutlineNode[] {
  const opts = { ...defaultOptions, ...options };
  const symbols = parseSymbols(code, filePath);

  // Filter symbols by kind
  let filteredSymbols = symbols;
  if (opts.filterKinds && opts.filterKinds.length > 0) {
    filteredSymbols = symbols.filter((s) => opts.filterKinds!.includes(s.kind));
  }

  // Sort symbols
  if (opts.sort === 'name') {
    filteredSymbols.sort((a, b) => a.name.localeCompare(b.name));
  } else if (opts.sort === 'line') {
    filteredSymbols.sort((a, b) => a.line - b.line);
  }

  // Group by kind or create hierarchy
  if (opts.groupByKind) {
    return groupByKind(filteredSymbols, opts);
  }

  return createHierarchy(filteredSymbols, opts);
}

/**
 * Group symbols by kind into flat categories
 * @param symbols - Array of symbols
 * @param options - Outline options
 * @returns Outline tree grouped by kind
 */
function groupByKind(symbols: Symbol[], _options: OutlineOptions): OutlineNode[] {
  const groups: Record<SymbolKind, OutlineNode> = {};

  // Create category nodes
  const categories: Array<{ kind: SymbolKind; label: string; icon: string }> = [
    { kind: SymbolKind.Class, label: 'Classes', icon: 'Box' },
    { kind: SymbolKind.Interface, label: 'Interfaces', icon: 'Box' },
    { kind: SymbolKind.Function, label: 'Functions', icon: 'Code' },
    { kind: SymbolKind.Method, label: 'Methods', icon: 'Code' },
    { kind: SymbolKind.Type, label: 'Types', icon: 'Type' },
    { kind: SymbolKind.Enum, label: 'Enums', icon: 'List' },
    { kind: SymbolKind.Variable, label: 'Variables', icon: 'Variable' },
    { kind: SymbolKind.Constant, label: 'Constants', icon: 'Hash' },
    { kind: SymbolKind.Namespace, label: 'Namespaces', icon: 'Folder' },
  ];

  // Initialize groups
  for (const category of categories) {
    groups[category.kind] = {
      name: category.label,
      kind: category.kind,
      line: 0,
      column: 0,
      icon: category.icon,
      children: [],
    };
  }

  // Add symbols to their groups
  for (const symbol of symbols) {
    const group = groups[symbol.kind];
    if (group) {
      group.children!.push({
        name: symbol.name,
        kind: symbol.kind,
        line: symbol.line,
        column: symbol.column,
        icon: getSymbolIcon(symbol.kind),
        visibility: symbol.visibility,
      });
    }
  }

  // Return non-empty groups
  return Object.values(groups).filter((g) => g.children && g.children.length > 0);
}

/**
 * Create hierarchical outline based on scope
 * @param symbols - Array of symbols
 * @param options - Outline options
 * @returns Hierarchical outline tree
 */
function createHierarchy(symbols: Symbol[], _options: OutlineOptions): OutlineNode[] {
  const nodes: OutlineNode[] = [];
  const containerStack: OutlineNode[] = [];

  for (const symbol of symbols) {
    const node: OutlineNode = {
      name: symbol.name,
      kind: symbol.kind,
      line: symbol.line,
      column: symbol.column,
      icon: getSymbolIcon(symbol.kind),
      visibility: symbol.visibility,
      children: [],
    };

    // Check if symbol is a container (class, interface, namespace)
    const isContainer =
      symbol.kind === SymbolKind.Class ||
      symbol.kind === SymbolKind.Interface ||
      symbol.kind === SymbolKind.Namespace;

    if (isContainer) {
      // Find parent container
      while (containerStack.length > 0) {
        const parent = containerStack[containerStack.length - 1];
        // Assume parent ends if we encounter another container at same or higher level
        // This is a simplification - real implementation would need to track ranges
        if (symbol.line > parent.line) {
          containerStack.pop();
        } else {
          break;
        }
      }

      if (containerStack.length > 0) {
        // Add to parent's children
        const parent = containerStack[containerStack.length - 1];
        parent.children!.push(node);
        // Push new container to stack
        containerStack.push(node);
      } else {
        // Top-level container
        nodes.push(node);
        containerStack.push(node);
      }
    } else {
      // Non-container symbol
      if (containerStack.length > 0) {
        // Add to innermost container
        const parent = containerStack[containerStack.length - 1];
        parent.children!.push(node);
      } else {
        // Top-level symbol
        nodes.push(node);
      }
    }
  }

  return nodes;
}

/**
 * Flatten outline tree to single level
 * @param nodes - Outline tree nodes
 * @returns Flat array of outline nodes
 */
export function flattenOutline(nodes: OutlineNode[]): OutlineNode[] {
  const flat: OutlineNode[] = [];

  function traverse(node: OutlineNode, depth: number = 0) {
    flat.push({ ...node });
    if (node.children) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return flat;
}

/**
 * Filter outline nodes by search query
 * @param nodes - Outline tree nodes
 * @param query - Search query
 * @returns Filtered outline nodes
 */
export function filterOutline(nodes: OutlineNode[], query: string): OutlineNode[] {
  if (!query.trim()) {
    return nodes;
  }

  const lowerQuery = query.toLowerCase();

  function filterNode(node: OutlineNode): OutlineNode | null {
    const matches = node.name.toLowerCase().includes(lowerQuery);

    let filteredChildren: OutlineNode[] | undefined;
    if (node.children && node.children.length > 0) {
      filteredChildren = node.children
        .map((child) => filterNode(child))
        .filter((child): child is OutlineNode => child !== null);
    }

    if (matches || (filteredChildren && filteredChildren.length > 0)) {
      return {
        ...node,
        children: filteredChildren,
      };
    }

    return null;
  }

  return nodes
    .map((node) => filterNode(node))
    .filter((node): node is OutlineNode => node !== null);
}

/**
 * Get outline for Monaco editor model
 * @param model - Monaco editor model
 * @param options - Outline options
 * @returns Outline tree nodes
 */
export function getMonacoOutline(
  model: editor.ITextModel,
  options: OutlineOptions = {}
): OutlineNode[] {
  const code = model.getValue();
  const filePath = model.uri.path;

  return generateOutline(code, filePath, options);
}

/**
 * Count symbols by kind
 * @param nodes - Outline tree nodes
 * @returns Object with counts by symbol kind
 */
export function countSymbolsByKind(
  nodes: OutlineNode[]
): Record<SymbolKind, number> {
  const counts: Partial<Record<SymbolKind, number>> = {};

  function count(node: OutlineNode) {
    counts[node.kind] = (counts[node.kind] || 0) + 1;
    if (node.children) {
      for (const child of node.children) {
        count(child);
      }
    }
  }

  for (const node of nodes) {
    count(node);
  }

  return counts as Record<SymbolKind, number>;
}

/**
 * Get all symbol names from outline
 * @param nodes - Outline tree nodes
 * @returns Array of symbol names
 */
export function getSymbolNames(nodes: OutlineNode[]): string[] {
  const names: string[] = [];

  function collect(node: OutlineNode) {
    names.push(node.name);
    if (node.children) {
      for (const child of node.children) {
        collect(child);
      }
    }
  }

  for (const node of nodes) {
    collect(node);
  }

  return names;
}

/**
 * Find symbol in outline by line number
 * @param nodes - Outline tree nodes
 * @param line - Line number
 * @returns Outline node or undefined
 */
export function findSymbolByLine(
  nodes: OutlineNode[],
  line: number
): OutlineNode | undefined {
  function search(node: OutlineNode): OutlineNode | undefined {
    if (node.line === line) {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = search(child);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  for (const node of nodes) {
    const found = search(node);
    if (found) {
      return found;
    }
  }

  return undefined;
}

/**
 * Get outline statistics
 * @param nodes - Outline tree nodes
 * @returns Statistics object
 */
export function getOutlineStatistics(nodes: OutlineNode[]): {
  totalSymbols: number;
  byKind: Record<SymbolKind, number>;
  maxDepth: number;
} {
  let totalSymbols = 0;
  const byKind: Partial<Record<SymbolKind, number>> = {};
  let maxDepth = 0;

  function traverse(node: OutlineNode, depth: number = 0) {
    totalSymbols++;
    byKind[node.kind] = (byKind[node.kind] || 0) + 1;
    maxDepth = Math.max(maxDepth, depth);

    if (node.children) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  for (const node of nodes) {
    traverse(node);
  }

  return {
    totalSymbols,
    byKind: byKind as Record<SymbolKind, number>,
    maxDepth,
  };
}
