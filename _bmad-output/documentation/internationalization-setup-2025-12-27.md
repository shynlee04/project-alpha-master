---
date: 2025-12-27
time: 19:30:00 UTC+7:00
phase: Implementation
team: Team A
agent_mode: documentation-writer
document_id: DOC-I18N-2025-12-27
version: 1.0.0
---

# Internationalization Setup

**Document Status**: Final
**Last Updated**: 2025-12-27
**Related Documents**:
- [`project-architecture-analysis-2025-12-27.md`](project-architecture-analysis-2025-12-27.md)
- [`development-workflow-2025-12-27.md`](development-workflow-2025-12-27.md)

## Overview

Via-gent uses **i18next** for internationalization (i18n), providing multi-language support for the browser-based IDE. The current implementation supports English (`en`) and Vietnamese (`vi`) languages with automatic language detection and persistence.

## i18next Configuration

### Core Configuration File

The i18next configuration is located at [`src/i18n/config.ts`](src/i18n/config.ts):

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import vi from './vi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
```

**Key Configuration Details**:

| Setting | Value | Purpose |
|----------|---------|----------|
| `fallbackLng` | `'en'` | Default language when no match found |
| `interpolation.escapeValue` | `false` | React handles XSS escaping |
| `detection.order` | `['localStorage', 'navigator']` | Priority order for language detection |
| `detection.caches` | `['localStorage']` | Persist language preference |
| `detection.lookupLocalStorage` | `'i18nextLng'` | Storage key for language preference |

### Locale Provider

The [`LocaleProvider`](src/i18n/LocaleProvider.tsx) component wraps the application to provide i18n context and updates the document language attribute:

```typescript
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './config';

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language || 'en';
  }, [i18n.language]);

  return <>{children}</>;
};

export const useLocalePreference = () => {
  const { i18n } = useTranslation();
  return {
    locale: i18n.language || 'en',
    setLocale: (lang: string) => i18n.changeLanguage(lang),
  };
};
```

## Translation File Structure

### File Locations

Translation files are stored in [`src/i18n/`](src/i18n/):
- [`en.json`](src/i18n/en.json) - English translations
- [`vi.json`](src/i18n/vi.json) - Vietnamese translations

### Translation Key Organization

Translation keys are organized hierarchically by feature area:

```json
{
  "welcome": "Welcome to Via-Gent",
  "navigation": {
    "title": "Menu",
    "home": "Home",
    "ide": "IDE Workspace"
  },
  "agent": {
    "title": "Agent Chat",
    "welcome_message": "Hi! I'm your AI coding assistant for {{projectName}}."
  },
  "chat": {
    "placeholder": "Type a message...",
    "toolsUsed": "tools used"
  }
}
```

### Key Naming Conventions

- Use **dot notation** for nested keys (e.g., `navigation.home`)
- Use **kebab-case** for key names (e.g., `agent-chat-panel`)
- Group related keys under a common prefix (e.g., `agent.*`, `chat.*`)
- Use **pluralization** with `_plural` suffix for count-based keys

## Translation Key Extraction

### i18next-scanner Configuration

The extraction configuration is in [`i18next-scanner.config.cjs`](i18next-scanner.config.cjs):

```javascript
module.exports = {
    input: [
        'src/**/*.{js,jsx,ts,tsx}',
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
                sourceType: 'module',
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
        nsSeparator: false,
        keySeparator: false,
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        }
    }
};
```

**Configuration Details**:

| Setting | Value | Purpose |
|----------|---------|----------|
| `input` | Source file patterns | Files to scan for translation keys |
| `output` | `'./'` | Output directory (project root) |
| `func.list` | `['i18next.t', 'i18n.t', 't']` | Function names to detect |
| `trans.component` | `'Trans'` | JSX component name |
| `lngs` | `['en', 'vi']` | Supported languages |
| `defaultLng` | `'en'` | Default language |
| `interpolation.prefix/suffix` | `'{{'/'}}'` | Interpolation delimiters |

### Running Extraction

```bash
pnpm i18n:extract
```

This command:
1. Scans all source files matching the input patterns
2. Extracts `t()`, `i18next.t()`, and `<Trans>` usage
3. Updates [`en.json`](src/i18n/en.json) and [`vi.json`](src/i18n/vi.json) with new keys
4. Adds `__STRING_NOT_TRANSLATED__` as placeholder for untranslated strings

## Usage Patterns

### Using the `t()` Hook

In React components, use the `useTranslation` hook:

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('navigation.ide')}</p>
    </div>
  );
}
```

### Using `i18next.t()` Function

For non-React contexts, use the i18next instance directly:

```typescript
import i18n from 'src/i18n/config';

const message = i18next.t('agent.welcome_message', { projectName: 'MyProject' });
```

### Using Interpolation

Pass variables to translations using interpolation:

```typescript
// Translation key: "Hello, {{name}}!"
const greeting = t('greeting', { name: 'World' });
```

### Using Pluralization

Handle plural forms with count-based keys:

```typescript
// Translation keys:
// "time.agoMinutes": "{{count}}m ago",
// "time.agoMinutes_plural": "{{count}}m ago"

const timeAgo = t('time.agoMinutes', { count: 5 });
```

### Language Switching

Use the `useLocalePreference` hook for language switching:

```typescript
import { useLocalePreference } from 'src/i18n/LocaleProvider';

function LanguageSwitcher() {
  const { locale, setLocale } = useLocalePreference();

  return (
    <button onClick={() => setLocale('vi')}>
      Switch to Vietnamese
    </button>
  );
}
```

## Best Practices

### 1. Translation Key Management

- **Keep keys descriptive**: Use meaningful names like `agent.chat.placeholder` instead of `msg1`
- **Organize by feature**: Group related keys under common prefixes
- **Use consistent naming**: Follow kebab-case convention throughout
- **Avoid hardcoded text**: All user-facing strings should use translation keys

### 2. Adding New Translations

When adding new translations:

1. Add the translation key to your component using `t('key')`
2. Run `pnpm i18n:extract` to update translation files
3. Translate the new key in both [`en.json`](src/i18n/en.json) and [`vi.json`](src/i18n/vi.json)
4. Replace `__STRING_NOT_TRANSLATED__` with actual translations

### 3. Testing Translations

- Test UI in both English and Vietnamese
- Verify interpolation variables work correctly
- Check for missing translation keys in console
- Ensure long text wraps properly in different languages

### 4. Translation File Maintenance

- Keep translation files sorted alphabetically for easier navigation
- Use consistent indentation (2 spaces)
- Remove unused keys periodically
- Update placeholder translations promptly

### 5. Common Pitfalls

| Pitfall | Description | Solution |
|-----------|-------------|----------|
| Missing `t()` import | Translation function not available | Import `useTranslation` hook |
| Hardcoded strings | Text not extracted to translation files | Always use `t()` for user-facing text |
| Incorrect key path | Using wrong dot notation | Verify key exists in translation files |
| Missing interpolation | Variables not substituted | Use `{{variable}}` syntax in translations |
| Forgetting to extract | New keys not added to translation files | Run `pnpm i18n:extract` after changes |

## Language Support

### Currently Supported Languages

| Language | Code | Status |
|----------|-------|--------|
| English | `en` | Default, Complete |
| Vietnamese | `vi` | Complete |

### Adding New Languages

To add a new language:

1. Create new translation file: `src/i18n/{lang}.json`
2. Add language code to `lngs` array in [`i18next-scanner.config.cjs`](i18next-scanner.config.cjs)
3. Translate all keys from [`en.json`](src/i18n/en.json) to the new language
4. Run `pnpm i18n:extract` to verify extraction works

## Integration with TanStack Router

i18next is initialized at application startup and works seamlessly with TanStack Router. The `LocaleProvider` should wrap the root route in [`src/routes/__root.tsx`](src/routes/__root.tsx):

```typescript
import { LocaleProvider } from '../i18n/LocaleProvider';

export default function Component() {
  return (
    <LocaleProvider>
      {/* TanStack Router Outlet */}
    </LocaleProvider>
  );
}
```

## References

### External Documentation

- **i18next Documentation**: [https://www.i18next.com](https://www.i18next.com)
- **react-i18next Documentation**: [https://react.i18next.com](https://react.i18next.com)
- **i18next-browser-languagedetector**: [https://github.com/i18next/i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector)

### Internal Files

- [`src/i18n/config.ts`](src/i18n/config.ts) - i18next configuration
- [`src/i18n/LocaleProvider.tsx`](src/i18n/LocaleProvider.tsx) - React provider component
- [`src/i18n/en.json`](src/i18n/en.json) - English translations
- [`src/i18n/vi.json`](src/i18n/vi.json) - Vietnamese translations
- [`i18next-scanner.config.cjs`](i18next-scanner.config.cjs) - Extraction configuration

### Related Documentation

- [`project-architecture-analysis-2025-12-27.md`](project-architecture-analysis-2025-12-27.md) - Overall architecture
- [`development-workflow-2025-12-27.md`](development-workflow-2025-12-27.md) - Development workflow

---

**Document Handoff**: Created by `documentation-writer` mode for integration into main documentation index.
