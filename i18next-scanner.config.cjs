module.exports = {
    input: [
        'src/**/*.{js,jsx,ts,tsx}',
        // Use ! to filter out files or directories
        '!src/**/*.test.{js,jsx,ts,tsx}',
        '!src/i18n/**',
        '!**/node_modules/**',
        '!src/routeTree.gen.ts',
    ],
    output: './',
    options: {
        debug: true,
        func: {
            list: ['i18next.t', 'i18n.t', 't'],
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        trans: {
            component: 'Trans',
            i18nKey: 'i18nKey',
            defaultsKey: 'defaults',
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            fallbackKey: function (ns, value) {
                return value;
            },
            acorn: {
                ecmaVersion: 2020,
                sourceType: 'module', // defaults to 'module'
                // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
            }
        },
        lngs: ['en', 'vi'],
        ns: ['translation'],
        defaultLng: 'en',
        defaultNs: 'translation',
        defaultValue: '__STRING_NOT_TRANSLATED__',
        resource: {
            loadPath: 'src/i18n/{{lng}}.json',
            savePath: 'src/i18n/{{lng}}.json',
            jsonIndent: 2,
            lineEnding: '\n'
        },
        nsSeparator: false, // namespace separator
        keySeparator: false, // key separator
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        }
    }
};
