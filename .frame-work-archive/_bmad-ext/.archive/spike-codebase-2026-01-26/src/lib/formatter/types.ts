/**
 * Code Formatter Types
 *
 * Type definitions for Prettier and ESLint formatting operations.
 */

export interface FormatOptions {
  tabSize: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  trailingComma: 'none' | 'es5' | 'all';
  arrowParens: 'avoid' | 'always';
  printWidth: number;
  endOfLine: 'auto' | 'lf' | 'crlf' | 'cr';
  proseWrap?: 'always' | 'never' | 'preserve';
}

export interface FormatResult {
  formatted: boolean;
  content: string;
  error?: string;
  language: string;
}

export interface FormatRangeOptions extends FormatOptions {
  startIndex: number;
  endIndex: number;
}

export interface LintFixResult {
  fixed: boolean;
  content: string;
  errorCount: number;
  warningCount: number;
  error?: string;
}

export interface FormatterConfig {
  prettier: FormatOptions;
  eslint: {
    fixOnSave: boolean;
    rules: Record<string, any>;
  };
}

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'json'
  | 'css'
  | 'html'
  | 'markdown';

export interface LanguageFormatter {
  language: SupportedLanguage;
  extensions: string[];
  format: (content: string, options: FormatOptions) => Promise<FormatResult>;
  lintAndFix?: (content: string) => Promise<LintFixResult>;
}
