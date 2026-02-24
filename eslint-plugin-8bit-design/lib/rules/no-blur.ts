/**
 * ESLint Rule: no-blur
 *
 * Disallows blur and backdrop-blur effects.
 * 8-bit design requires no glassmorphism or blur effects.
 */

import { Rule } from 'eslint'
import { TSESTree } from '@typescript-eslint/types'

// Pattern to match blur effects
const BLUR_PATTERN = /\b(blur-[a-z0-9-]+|backdrop-blur-[a-z0-9-]+)\b/g

// Allowed blur values (none or explicitly 0)
const ALLOWED_VALUES = ['blur-none', 'blur-0']

export const noBlur: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow blur effects (no glassmorphism in 8-bit design)',
      category: 'Design',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noBlur: 'Blur effects are not allowed in 8-bit design. Use solid colors instead.',
    },
  },
  create(context) {
    /**
     * Check a className attribute for blur violations
     */
    function checkClassName(node: TSESTree.JSXAttribute, classNameValue: string) {
      const blurMatches = classNameValue.match(BLUR_PATTERN)
      if (blurMatches) {
        context.report({
          node,
          messageId: 'noBlur',
          fix(fixer) {
            let fixed = classNameValue
            for (const match of blurMatches) {
              // Only allow blur-none or blur-0
              if (match !== 'blur-none' && match !== 'blur-0') {
                // Remove the blur class entirely
                fixed = fixed.replace(new RegExp(`\\b${match}\\b`), '').replace(/\s+/g, ' ').trim()
              }
            }
            return fixer.replaceText(node, `className="${fixed}"`)
          },
        })
      }
    }

    return {
      // Check JSX className attributes
      JSXAttribute(node: TSESTree.JSXAttribute) {
        if (node.name.type === 'JSXIdentifier' && node.name.name === 'className') {
          if (node.value?.type === 'StringLiteral') {
            checkClassName(node, node.value.value)
          } else if (
            node.value?.type === 'JSXExpressionContainer' &&
            node.value.expression?.type === 'StringLiteral'
          ) {
            checkClassName(node, node.value.expression.value)
          }
        }
      },
    }
  },
}
