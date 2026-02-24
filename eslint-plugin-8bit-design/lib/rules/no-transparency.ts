/**
 * ESLint Rule: no-transparency
 *
 * Disallows transparency/opacity modifiers on interactive elements.
 * 8-bit design requires solid colors only.
 */

import { Rule } from 'eslint'

export const noTransparency: Rule.RuleModule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow transparency on interactive elements',
      category: 'Design' as const,
      recommended: 'error' as const,
    },
    fixable: 'code' as const,
    schema: [],
    messages: {
      noTransparency:
        'Use solid colors instead of transparency on interactive elements. 8-bit design requires 100% opacity.',
    },
  },
  create(context) {
    // Pattern to match Tailwind opacity modifiers: bg-color/XX, text-color/XX
    const transparencyPattern = /\/\d{1,3}(?:\s|$)/g

    // Pattern to match opacity utility classes: opacity-XX
    const opacityClassPattern = /\bopacity-\d{1,3}\b/g

    return {
      'JSXAttribute[ name.name = "className"]'(node: Rule.Node) {
        const attr = node as unknown as {
          value?: { value?: string; type?: string }
        }
        const classNameValue = attr.value?.value

        if (!classNameValue || typeof classNameValue !== 'string') {
          return
        }

        // Check for opacity modifiers (e.g., bg-slate-800/60)
        const transparencyMatches = classNameValue.match(transparencyPattern)

        if (transparencyMatches) {
          context.report({
            node,
            messageId: 'noTransparency',
            fix(fixer) {
              // Simple fix: remove the opacity modifier
              let fixed = classNameValue
              for (const _match of transparencyMatches) {
                // Try to find the color before the opacity and replace with solid
                const colorMatch = fixed.match(
                  /\b(bg|text|border|hover:bg|hover:text|hover:border)-\S+\/\d{1,3}/
                )
                if (colorMatch) {
                  const colorPart = colorMatch[0].split('/')[0]
                  // Map common patterns to solid colors
                  const solidMap: Record<string, string> = {
                    'bg-slate-800': 'bg-card',
                    'bg-slate-700': 'bg-secondary',
                    'bg-slate-900': 'bg-background',
                    'bg-green-900': 'bg-success/20',
                    'bg-red-900': 'bg-destructive/20',
                    'bg-blue-900': 'bg-primary/20',
                    'text-slate-800': 'text-foreground',
                    'text-slate-600': 'text-muted-foreground',
                  }
                  const replacement = solidMap[colorPart] || colorPart
                  fixed = fixed.replace(colorMatch[0], replacement)
                } else {
                  // Just remove the opacity modifier
                  fixed = fixed.replace(/\/\d{1,3}/g, '')
                }
              }
              return fixer.replaceText(node, `className="${fixed}"`)
            },
          })
          return
        }

        // Check for opacity-XX utility classes
        const opacityMatches = classNameValue.match(opacityClassPattern)
        if (opacityMatches) {
          context.report({
            node,
            messageId: 'noTransparency',
            fix(fixer) {
              let fixed = classNameValue
              for (const _match of opacityMatches) {
                // Replace opacity-XX with opacity-100 (fully opaque)
                fixed = fixed.replace(opacityClassPattern, 'opacity-100')
              }
              return fixer.replaceText(node, `className="${fixed}"`)
            },
          })
        }
      },
    }
  },
}
