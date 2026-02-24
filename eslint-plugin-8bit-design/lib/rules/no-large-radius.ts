/**
 * ESLint Rule: no-large-radius
 *
 * Disallows large border radius values.
 * 8-bit design requires squared corners (rounded-none or max 4px).
 */

import { Rule } from 'eslint'
import { TSESTree } from '@typescript-eslint/types'

// Pattern to match large border radius values
const LARGE_RADIUS_PATTERN = /\brounded-(lg|xl|2xl|3xl|full)\b/g

// Pattern to match custom pixel values that are too large (>= 8px)
const CUSTOM_RADIUS_PATTERN = /rounded-\[(\d+)px\]/g

// Allowed border radius values for 8-bit design
const ALLOWED_VALUES = ['rounded-none', 'rounded-[2px]', 'rounded-[4px]']

export const noLargeRadius: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow large border radius values (8-bit design requires squared corners)',
      category: 'Design',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noLargeRadius:
        '8-bit design requires squared corners. Use rounded-none or rounded-[4px] maximum.',
    },
  },
  create(context) {
    /**
     * Check a className attribute for large radius violations
     */
    function checkClassName(node: TSESTree.JSXAttribute, classNameValue: string) {
      // Check for standard large radius classes
      const standardMatches = classNameValue.match(LARGE_RADIUS_PATTERN)
      if (standardMatches) {
        context.report({
          node,
          messageId: 'noLargeRadius',
          fix(fixer) {
            let fixed = classNameValue
            for (const match of standardMatches) {
              // Replace rounded-lg, rounded-xl, etc. with rounded-none
              fixed = fixed.replace(match, 'rounded-none')
            }
            return fixer.replaceText(node, `className="${fixed}"`)
          },
        })
        return
      }

      // Check for custom pixel values >= 8px
      let match
      while ((match = CUSTOM_RADIUS_PATTERN.exec(classNameValue)) !== null) {
        const pxValue = parseInt(match[1], 10)
        if (pxValue >= 8) {
          context.report({
            node,
            messageId: 'noLargeRadius',
            fix(fixer) {
              let fixed = classNameValue
              // Replace with rounded-none for values >= 8px
              fixed = fixed.replace(match[0], 'rounded-none')
              return fixer.replaceText(node, `className="${fixed}"`)
            },
          })
          return
        }
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
