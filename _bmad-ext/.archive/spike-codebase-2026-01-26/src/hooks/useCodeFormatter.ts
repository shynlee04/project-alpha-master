/**
 * useCodeFormatter Hook
 *
 * React hook for code formatting operations.
 * Integrates Prettier and ESLint formatting into components.
 */

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatCode,
  formatCodeRange,
  fixESLint,
  formatAndFix,
  canFormat,
  detectLanguage,
  type FormatOptions,
  type FormatResult,
  type LintFixResult,
} from '@/lib/formatter';

export interface UseCodeFormatterOptions {
  onFormatComplete?: (result: FormatResult) => void;
  onLintComplete?: (result: LintFixResult) => void;
  onError?: (error: string) => void;
}

export interface FormatterState {
  isFormatting: boolean;
  isLinting: boolean;
  lastFormatResult: FormatResult | null;
  lastLintResult: LintFixResult | null;
  formatOnSave: boolean;
}

export function useCodeFormatter(
  filename: string,
  options: UseCodeFormatterOptions = {}
) {
  const { t } = useTranslation();
  const { onFormatComplete, onLintComplete, onError } = options;

  const [state, setState] = useState<FormatterState>({
    isFormatting: false,
    isLinting: false,
    lastFormatResult: null,
    lastLintResult: null,
    formatOnSave: false,
  });

  const formatOptionsRef = useRef<Partial<FormatOptions>>({});

  /**
   * Format entire document
   */
  const formatDocument = useCallback(
    async (content: string): Promise<string> => {
      if (!canFormat(filename)) {
        onError?.(t('formatter.errors.unsupported_file'));
        return content;
      }

      setState((prev) => ({ ...prev, isFormatting: true }));

      try {
        const language = detectLanguage(filename);
        const result = await formatCode(content, language, formatOptionsRef.current);

        setState((prev) => ({
          ...prev,
          isFormatting: false,
          lastFormatResult: result,
        }));

        if (result.error) {
          onError?.(result.error);
        } else {
          onFormatComplete?.(result);
        }

        return result.content;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('formatter.errors.unknown');
        onError?.(errorMessage);
        setState((prev) => ({ ...prev, isFormatting: false }));
        return content;
      }
    },
    [filename, onFormatComplete, onError, t]
  );

  /**
   * Format selected text range
   */
  const formatSelection = useCallback(
    async (content: string, startIndex: number, endIndex: number): Promise<string> => {
      if (!canFormat(filename)) {
        onError?.(t('formatter.errors.unsupported_file'));
        return content;
      }

      setState((prev) => ({ ...prev, isFormatting: true }));

      try {
        const language = detectLanguage(filename);
        const result = await formatCodeRange(content, language, {
          tabSize: formatOptionsRef.current.tabSize ?? 2,
          useTabs: formatOptionsRef.current.useTabs ?? false,
          semi: formatOptionsRef.current.semi ?? true,
          singleQuote: formatOptionsRef.current.singleQuote ?? false,
          trailingComma: formatOptionsRef.current.trailingComma ?? 'es5',
          arrowParens: formatOptionsRef.current.arrowParens ?? 'always',
          printWidth: formatOptionsRef.current.printWidth ?? 80,
          endOfLine: formatOptionsRef.current.endOfLine ?? 'lf',
          startIndex,
          endIndex,
        });

        setState((prev) => ({
          ...prev,
          isFormatting: false,
          lastFormatResult: result,
        }));

        if (result.error) {
          onError?.(result.error);
        } else {
          onFormatComplete?.(result);
        }

        return result.content;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('formatter.errors.unknown');
        onError?.(errorMessage);
        setState((prev) => ({ ...prev, isFormatting: false }));
        return content;
      }
    },
    [filename, onFormatComplete, onError, t]
  );

  /**
   * Fix ESLint issues
   */
  const fixLint = useCallback(
    async (content: string): Promise<string> => {
      setState((prev) => ({ ...prev, isLinting: true }));

      try {
        const result = await fixESLint(content, filename);

        setState((prev) => ({
          ...prev,
          isLinting: false,
          lastLintResult: result,
        }));

        if (result.error) {
          onError?.(result.error);
        } else {
          onLintComplete?.(result);
        }

        return result.content;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('formatter.errors.unknown');
        onError?.(errorMessage);
        setState((prev) => ({ ...prev, isLinting: false }));
        return content;
      }
    },
    [filename, onLintComplete, onError, t]
  );

  /**
   * Format and fix (combined operation)
   */
  const formatAndFixDocument = useCallback(
    async (content: string): Promise<string> => {
      if (!canFormat(filename)) {
        onError?.(t('formatter.errors.unsupported_file'));
        return content;
      }

      setState((prev) => ({
        ...prev,
        isFormatting: true,
        isLinting: true,
      }));

      try {
        const result = await formatAndFix(content, filename);

        setState((prev) => ({
          ...prev,
          isFormatting: false,
          isLinting: false,
          lastFormatResult: result,
        }));

        if (result.error) {
          onError?.(result.error);
        } else {
          onFormatComplete?.(result);
        }

        return result.content;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t('formatter.errors.unknown');
        onError?.(errorMessage);
        setState((prev) => ({
          ...prev,
          isFormatting: false,
          isLinting: false,
        }));
        return content;
      }
    },
    [filename, onFormatComplete, onError, t]
  );

  /**
   * Update format options
   */
  const updateFormatOptions = useCallback((options: Partial<FormatOptions>) => {
    formatOptionsRef.current = { ...formatOptionsRef.current, ...options };
  }, []);

  /**
   * Toggle format on save
   */
  const toggleFormatOnSave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      formatOnSave: !prev.formatOnSave,
    }));
  }, []);

  /**
   * Reset formatter state
   */
  const reset = useCallback(() => {
    setState({
      isFormatting: false,
      isLinting: false,
      lastFormatResult: null,
      lastLintResult: null,
      formatOnSave: false,
    });
  }, []);

  return {
    // State
    ...state,

    // Actions
    formatDocument,
    formatSelection,
    fixLint,
    formatAndFixDocument,
    updateFormatOptions,
    toggleFormatOnSave,
    reset,

    // Helpers
    canFormat: canFormat(filename),
    language: detectLanguage(filename),
  };
}
