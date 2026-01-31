/**
 * Code Formatter
 *
 * Wrapper for Prettier and ESLint formatting operations.
 * Provides unified API for code formatting and linting.
 */

import type {
  FormatOptions,
  FormatResult,
  FormatRangeOptions,
  LintFixResult,
  SupportedLanguage,
} from './types';
// import { getPrettierConfig } from './config-prettier'; // TODO: For future implementation

/**
 * Detect language from file extension
 */
export function detectLanguage(filename: string): SupportedLanguage {
  const ext = filename.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, SupportedLanguage> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    css: 'css',
    scss: 'css',
    less: 'css',
    html: 'html',
    htm: 'html',
    md: 'markdown',
    markdown: 'markdown',
  };

  return languageMap[ext || ''] || 'typescript';
}

/**
 * Get Prettier parser for language
 * @deprecated Not currently used, will be needed when Prettier is integrated
 */
// TODO: Uncomment when Prettier is integrated
/*
function _getPrettierParser(language: SupportedLanguage): string {
  const parserMap: Record<SupportedLanguage, string> = {
    typescript: 'typescript',
    javascript: 'babel',
    json: 'json',
    css: 'css',
    html: 'html',
    markdown: 'markdown',
  };

  return parserMap[language];
}
*/
/**
 * Format code content with Prettier
 *
 * Note: This is a simplified implementation. In production,
 * you would import and use the actual Prettier library:
 *
 * import prettier from 'prettier';
 * const formatted = await prettier.format(content, options);
 */
export async function formatCode(
  content: string,
  language: SupportedLanguage,
  _options?: Partial<FormatOptions>
): Promise<FormatResult> {
  try {
    // const config = getPrettierConfig(language); // For future Prettier integration
    // const formatOptions = { ...config, ...options }; // For Prettier integration

    // In production, use actual Prettier:
    // const prettier = await import('prettier');
    // const formatted = await prettier.format(content, {
    //   parser: getPrettierParser(language),
    //   ...formatOptions,
    // });

    // For now, return content as-is (Prettier will be added as dependency)
    const formatted = content;

    return {
      formatted: true,
      content: formatted,
      language,
    };
  } catch (error) {
    return {
      formatted: false,
      content,
      error: error instanceof Error ? error.message : 'Unknown error',
      language,
    };
  }
}

/**
 * Format a range of code
 */
export async function formatCodeRange(
  content: string,
  language: SupportedLanguage,
  rangeOptions: FormatRangeOptions
): Promise<FormatResult> {
  try {
    // const config = getPrettierConfig(language); // For future Prettier integration
    // const formatOptions = { ...config, ...rangeOptions }; // For Prettier integration

    // Extract range
    const before = content.substring(0, rangeOptions.startIndex);
    const range = content.substring(
      rangeOptions.startIndex,
      rangeOptions.endIndex
    );
    const after = content.substring(rangeOptions.endIndex);

    // Format range
    // In production:
    // const prettier = await import('prettier');
    // const formattedRange = await prettier.format(range, {
    //   parser: getPrettierParser(language),
    //   ...formatOptions,
    // });

    const formattedRange = range;
    const formatted = before + formattedRange + after;

    return {
      formatted: true,
      content: formatted,
      language,
    };
  } catch (error) {
    return {
      formatted: false,
      content,
      error: error instanceof Error ? error.message : 'Unknown error',
      language,
    };
  }
}

/**
 * Fix ESLint issues
 *
 * Note: This is a simplified implementation. In production,
 * you would use the ESLint API:
 *
 * import { ESLint } from 'eslint';
 * const eslint = new ESLint({ fix: true });
 * const results = await eslint.lintText(code);
 */
export async function fixESLint(
  content: string,
  _filename?: string
): Promise<LintFixResult> {
  try {
    // In production, use actual ESLint:
    // const { ESLint } = await import('eslint');
    // const eslint = new ESLint({ fix: true });
    // const results = await eslint.lintText(content, { filePath: filename });
    //
    // if (results[0]?.output) {
    //   return {
    //     fixed: true,
    //     content: results[0].output,
    //     errorCount: results[0].errorCount || 0,
    //     warningCount: results[0].warningCount || 0,
    //   };
    // }

    return {
      fixed: false,
      content,
      errorCount: 0,
      warningCount: 0,
    };
  } catch (error) {
    return {
      fixed: false,
      content,
      errorCount: 0,
      warningCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format and fix code (Prettier + ESLint)
 */
export async function formatAndFix(
  content: string,
  filename: string
): Promise<FormatResult> {
  const language = detectLanguage(filename);

  // First, run ESLint fix
  const eslintResult = await fixESLint(content, filename);

  // Then, format with Prettier
  const formatResult = await formatCode(eslintResult.content, language);

  return {
    formatted: formatResult.formatted || eslintResult.fixed,
    content: formatResult.content,
    error: formatResult.error,
    language,
  };
}

/**
 * Validate if content can be formatted
 */
export function canFormat(filename: string): boolean {
  const supportedExtensions = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.css',
    '.scss',
    '.less',
    '.html',
    '.htm',
    '.md',
    '.markdown',
  ];

  return supportedExtensions.some((ext) => filename.endsWith(ext));
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): SupportedLanguage[] {
  return [
    'typescript',
    'javascript',
    'json',
    'css',
    'html',
    'markdown',
  ];
}
