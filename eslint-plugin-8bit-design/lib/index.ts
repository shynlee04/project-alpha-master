/**
 * ESLint Plugin for 8-bit Design Enforcement
 *
 * Enforces the 8-bit design system rules:
 * - no-transparency: Disallow opacity modifiers on interactive elements
 * - no-large-radius: Disallow large border radius values (8-bit = squared)
 * - no-blur: Disallow blur effects (no glassmorphism)
 */

import { noTransparency } from './rules/no-transparency'
import { noLargeRadius } from './rules/no-large-radius'
import { noBlur } from './rules/no-blur'

export const rules = {
  'no-transparency': noTransparency,
  'no-large-radius': noLargeRadius,
  'no-blur': noBlur,
}

export const configs = {
  recommended: {
    plugins: {
      '8bit-design': rules,
    },
    rules: {
      '8bit-design/no-transparency': 'error',
      '8bit-design/no-large-radius': 'error',
      '8bit-design/no-blur': 'error',
    },
  },
}

export default {
  rules,
  configs,
}
