/**
 * @fileoverview cn - Class name utility function
 * @module infrastructure/utils/cn
 *
 * Combines clsx and tailwind-merge for efficient class name handling.
 * Use this instead of importing from @/lib/utils
 *
 * @created 2026-01-31
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * cn('base-class', condition && 'conditional-class', 'px-4 py-2')
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
