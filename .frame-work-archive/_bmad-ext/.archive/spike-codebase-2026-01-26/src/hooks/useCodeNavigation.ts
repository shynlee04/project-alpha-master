/**
 * Code Navigation Hook
 * @module hooks/useCodeNavigation
 *
 * React hook for code navigation features
 * Provides go-to-definition, find references, and symbol outline functionality
 *
 * S-043: Code Navigation
 */

import { useCallback, useState, useRef, useMemo } from 'react';
import type { editor } from 'monaco-editor';
import type { Position } from 'monaco-editor';
import {
  findDefinitionFromMonaco,
  navigateToDefinition,
  getDefinitionPreview,
  type DefinitionLocation,
  type DefinitionResult,
  updateWorkspaceFiles,
} from '@/lib/navigation/definition-provider';
import {
  findReferencesFromMonaco,
  groupReferencesByFile,
  type ReferencesResult,
} from '@/lib/navigation/references-provider';
import {
  generateOutline,
  filterOutline,
  type OutlineNode,
  type OutlineOptions,
  getOutlineStatistics,
} from '@/lib/navigation/symbol-outline';

export interface UseCodeNavigationOptions {
  /** Current file content */
  code?: string;
  /** Current file path */
  filePath?: string;
  /** Monaco editor instance */
  editor?: editor.IStandaloneCodeEditor | null;
  /** Workspace files map (filePath -> content) */
  workspaceFiles?: Map<string, string>;
  /** Outline options */
  outlineOptions?: OutlineOptions;
}

export interface CodeNavigationState {
  /** Current definition result */
  definition: DefinitionResult | null;
  /** Current references result */
  references: ReferencesResult | null;
  /** Symbol outline for current file */
  outline: OutlineNode[];
  /** Outline search query */
  outlineQuery: string;
  /** Filtered outline (based on search) */
  filteredOutline: OutlineNode[];
  /** Outline statistics */
  outlineStatistics: ReturnType<typeof getOutlineStatistics> | null;
  /** Navigation history (back stack) */
  historyBack: Array<{ filePath: string; line: number; column: number }>;
  /** Navigation history (forward stack) */
  historyForward: Array<{ filePath: string; line: number; column: number }>;
}

export interface CodeNavigationActions {
  /** Go to definition at position */
  goToDefinition: (position: Position) => Promise<DefinitionResult | undefined>;
  /** Find references at position */
  findReferences: (position: Position) => Promise<ReferencesResult | undefined>;
  /** Navigate to specific definition */
  navigateToDefinition: (definition: DefinitionLocation) => boolean;
  /** Get definition preview */
  getDefinitionPreview: (definition: DefinitionLocation, contextLines?: number) => string | undefined;
  /** Set outline search query */
  setOutlineQuery: (query: string) => void;
  /** Refresh outline */
  refreshOutline: () => void;
  /** Go back in navigation history */
  goBack: () => void;
  /** Go forward in navigation history */
  goForward: () => void;
  /** Clear navigation history */
  clearHistory: () => void;
  /** Clear current results */
  clearResults: () => void;
}

/**
 * Code navigation hook
 * @param options - Hook options
 * @returns State and actions
 */
export function useCodeNavigation(options: UseCodeNavigationOptions = {}): [
  CodeNavigationState,
  CodeNavigationActions
] {
  const { code = '', filePath = '', editor, workspaceFiles, outlineOptions } = options;

  // State
  const [definition, setDefinition] = useState<DefinitionResult | null>(null);
  const [references, setReferences] = useState<ReferencesResult | null>(null);
  const [outline, setOutline] = useState<OutlineNode[]>([]);
  const [outlineQuery, setOutlineQueryState] = useState('');
  const [historyBack, setHistoryBack] = useState<
    Array<{ filePath: string; line: number; column: number }>
  >([]);
  const [historyForward, setHistoryForward] = useState<
    Array<{ filePath: string; line: number; column: number }>
  >([]);

  // Refs to avoid stale closures
  const historyBackRef = useRef(historyBack);
  const historyForwardRef = useRef(historyForward);

  // Update refs when state changes
  historyBackRef.current = historyBack;
  historyForwardRef.current = historyForward;

  // Update workspace files in navigation providers
  useMemo(() => {
    if (workspaceFiles) {
      updateWorkspaceFiles(workspaceFiles);
    }
  }, [workspaceFiles]);

  /**
   * Go to definition at position
   */
  const goToDefinition = useCallback(
    async (position: Position): Promise<DefinitionResult | undefined> => {
      if (!editor) {
        console.warn('[useCodeNavigation] No editor instance');
        return undefined;
      }

      const model = editor.getModel();
      if (!model) {
        console.warn('[useCodeNavigation] No editor model');
        return undefined;
      }

      const result = findDefinitionFromMonaco(model, position);
      if (result) {
        setDefinition(result);

        // Add to history
        if (result.definitions.length > 0) {
          const def = result.definitions[0];
          setHistoryBack((prev) => [...prev, { filePath: def.filePath, line: def.line, column: def.column }]);
          setHistoryForward([]);
        }
      }

      return result;
    },
    [editor]
  );

  /**
   * Find references at position
   */
  const findReferences = useCallback(
    async (position: Position): Promise<ReferencesResult | undefined> => {
      if (!editor) {
        console.warn('[useCodeNavigation] No editor instance');
        return undefined;
      }

      const model = editor.getModel();
      if (!model) {
        console.warn('[useCodeNavigation] No editor model');
        return undefined;
      }

      const result = findReferencesFromMonaco(model, position);
      if (result) {
        setReferences(result);
      }

      return result;
    },
    [editor]
  );

  /**
   * Navigate to specific definition
   */
  const navigateToDefinitionCallback = useCallback(
    (def: DefinitionLocation): boolean => {
      if (!editor) {
        return false;
      }

      const success = navigateToDefinition(editor, def);

      if (success) {
        // Add to history
        setHistoryBack((prev) => [...prev, { filePath: def.filePath, line: def.line, column: def.column }]);
        setHistoryForward([]);
      }

      return success;
    },
    [editor]
  );

  /**
   * Get definition preview
   */
  const getDefinitionPreviewCallback = useCallback(
    (def: DefinitionLocation, contextLines?: number): string | undefined => {
      return getDefinitionPreview(def, contextLines);
    },
    []
  );

  /**
   * Set outline search query
   */
  const setOutlineQuery = useCallback((query: string) => {
    setOutlineQueryState(query);
  }, []);

  /**
   * Refresh outline (regenerate from code)
   */
  const refreshOutline = useCallback(() => {
    if (!code || !filePath) {
      setOutline([]);
      return;
    }

    const newOutline = generateOutline(code, filePath, outlineOptions);
    setOutline(newOutline);
  }, [code, filePath, outlineOptions]);

  /**
   * Go back in navigation history
   */
  const goBack = useCallback(() => {
    const back = historyBackRef.current;
    if (back.length === 0) return;

    const current = back.pop();
    if (!current) return;

    // Add to forward history
    setHistoryForward((prev) => [...prev, current]);
    setHistoryBack([...back]);

    // Navigate to previous location
    if (editor && back.length > 0) {
      const previous = back[back.length - 1];
      const model = editor.getModel();
      if (model && model.uri.path === previous.filePath) {
        editor.setPosition({
          lineNumber: previous.line,
          column: previous.column,
        });
        editor.revealLineInCenter(previous.line);
      }
    }
  }, [editor]);

  /**
   * Go forward in navigation history
   */
  const goForward = useCallback(() => {
    const forward = historyForwardRef.current;
    if (forward.length === 0) return;

    const next = forward.pop();
    if (!next) return;

    // Add to back history
    setHistoryBack((prev) => [...prev, next]);
    setHistoryForward([...forward]);

    // Navigate to next location
    if (editor) {
      const model = editor.getModel();
      if (model && model.uri.path === next.filePath) {
        editor.setPosition({
          lineNumber: next.line,
          column: next.column,
        });
        editor.revealLineInCenter(next.line);
      }
    }
  }, [editor]);

  /**
   * Clear navigation history
   */
  const clearHistory = useCallback(() => {
    setHistoryBack([]);
    setHistoryForward([]);
  }, []);

  /**
   * Clear current results
   */
  const clearResults = useCallback(() => {
    setDefinition(null);
    setReferences(null);
  }, []);

  // Filtered outline based on search query
  const filteredOutline = useMemo(() => {
    if (!outlineQuery) {
      return outline;
    }
    return filterOutline(outline, outlineQuery);
  }, [outline, outlineQuery]);

  // Outline statistics
  const outlineStatistics = useMemo(() => {
    if (!outline || outline.length === 0) {
      return null;
    }
    return getOutlineStatistics(outline);
  }, [outline]);

  // Auto-refresh outline when code or options change
  useMemo(() => {
    refreshOutline();
  }, [refreshOutline]);

  const state: CodeNavigationState = {
    definition,
    references,
    outline,
    outlineQuery,
    filteredOutline,
    outlineStatistics,
    historyBack,
    historyForward,
  };

  const actions: CodeNavigationActions = {
    goToDefinition,
    findReferences,
    navigateToDefinition: navigateToDefinitionCallback,
    getDefinitionPreview: getDefinitionPreviewCallback,
    setOutlineQuery,
    refreshOutline,
    goBack,
    goForward,
    clearHistory,
    clearResults,
  };

  return [state, actions];
}

/**
 * Type guard for Monaco editor position
 */
export function isMonacoPosition(obj: unknown): obj is Position {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'lineNumber' in obj &&
    'column' in obj
  );
}

/**
 * Group references by file (helper for components)
 */
export function useGroupedReferences(references: ReferencesResult | null) {
  return useMemo(() => {
    if (!references) {
      return {};
    }
    return groupReferencesByFile(references.references);
  }, [references]);
}
