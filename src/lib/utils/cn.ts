/**
 * @fileoverview CN Utility Export
 * @module lib/utils/cn
 *
 * Canonical export path for the cn() utility function.
 * This provides a clean import path that complies with project architecture standards.
 *
 * @example
 * ```typescript
 * import { cn } from '@/lib/utils/cn';
 * const className = cn('base-class', conditional && 'conditional-class');
 * ```
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge for clean class name handling
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
