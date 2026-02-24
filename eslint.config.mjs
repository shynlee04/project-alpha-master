import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
    // Ignore patterns
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '.output/**',
            'coverage/**',
            '*.config.js',
            '*.config.mjs',
        ],
    },

    // Base JS rules
    js.configs.recommended,

    // TypeScript rules
    ...tseslint.configs.recommended,

    // React specific configuration
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // React Hooks rules
            ...reactHooks.configs.recommended.rules,

            // React Refresh
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],

            // TypeScript overrides
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',

            // General rules
            'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }],

            // NO-WORKSPACE MANDATE: Prevent regression of banned patterns
            // See SOURCE-OF-TRUTH.md Part 6: What is BANNED
            'no-restricted-syntax': ['error',
                {
                    selector: 'Identifier[name=/^[Ww]orkspace[Bb]indings$/]',
                    message: 'WorkspaceBindings is BANNED. Use ProjectPlugins or PluginType[]. See SOURCE-OF-TRUTH.md',
                },
                {
                    selector: 'Identifier[name=/^workspaceId$/]',
                    message: 'workspaceId is BANNED. Use projectId (files belong to projects). See SOURCE-OF-TRUTH.md',
                },
            ],
            'no-restricted-imports': ['error', {
                patterns: [
                    {
                        group: ['@/lib/workspace/*'],
                        message: '@/lib/workspace/ is BANNED. Use @/infrastructure/* or @/domain/*',
                    },
                ],
            }],
        },
    }
)
