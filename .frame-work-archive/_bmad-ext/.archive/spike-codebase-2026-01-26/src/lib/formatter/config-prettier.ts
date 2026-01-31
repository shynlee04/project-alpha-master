/**
 * Prettier Configuration
 *
 * Default Prettier configuration for the project.
 */

import type { FormatOptions } from './types';

export const DEFAULT_PRETTIER_CONFIG: FormatOptions = {
  tabSize: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: 'es5',
  arrowParens: 'avoid',
  printWidth: 80,
  endOfLine: 'lf',
};

export const PRETTIER_CONFIG_BY_LANGUAGE: Record<string, Partial<FormatOptions>> =
  {
    typescript: {
      tabSize: 2,
      semi: true,
      singleQuote: false,
    },
    javascript: {
      tabSize: 2,
      semi: true,
      singleQuote: false,
    },
    json: {
      tabSize: 2,
      singleQuote: false,
      trailingComma: 'none',
    },
    css: {
      tabSize: 2,
      singleQuote: false,
    },
    html: {
      tabSize: 2,
      singleQuote: false,
    },
    markdown: {
      tabSize: 2,
      semi: false,
      proseWrap: 'preserve',
    },
  };

/**
 * Get Prettier config for a specific language
 */
export function getPrettierConfig(
  language: string
): FormatOptions {
  const languageConfig = PRETTIER_CONFIG_BY_LANGUAGE[language] || {};
  return {
    ...DEFAULT_PRETTIER_CONFIG,
    ...languageConfig,
  };
}

/**
 * Prettier options that can be overridden by user settings
 */
export const USER_OVERRIDABLE_OPTIONS = [
  'tabSize',
  'semi',
  'singleQuote',
  'trailingComma',
  'arrowParens',
  'printWidth',
] as const;
