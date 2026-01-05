# Configuration Domain Documentation

## Overview

This documentation covers the configuration domain of the Via-gent platform, including styling systems, custom hooks, internationalization (i18n), build configuration, and environment variables.

## Documentation Structure

| Document | Description |
|----------|-------------|
| [scan-inventory.json](scan-inventory.json) | Structured scan data of all configuration files |
| [file-structure.txt](file-structure.txt) | Tree view of configuration directory structure |
| [styling.md](styling.md) | Complete styling system documentation |
| [i18n.md](i18n.md) | Internationalization (i18n) documentation |
| [hooks.md](hooks.md) | Custom React hooks documentation |
| [build-config.md](build-config.md) | Build configuration documentation |
| [environment.md](environment.md) | Environment variables documentation |
| [README-VI.md](README-VI.md) | Vietnamese version of this document |

## Quick Reference

### Styling System

- **Design Tokens:** CSS custom properties for colors, typography, spacing, layout
- **Framework:** Tailwind CSS 4 with `@tailwindcss/vite`
- **Aesthetic:** MistralAI-inspired 8-bit theme (dark default, squared corners, pixel shadows)
- **Animation:** Custom 8-bit themed animations (≤200ms for micro-interactions)

### Internationalization

- **Library:** i18next with react-i18next
- **Languages:** English (en) and Vietnamese (vi)
- **Extraction:** `pnpm i18n:extract` command
- **Translation Keys:** 1,161 keys across all domains

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useResponsive` | Semantic responsive breakpoints |
| `useCapabilityDetection` | Browser capability detection |
| `useWorkspaceContext` | Workspace management |
| `use-cross-workspace-events` | RAG event subscriptions |

### Build Configuration

- **Tool:** Vite 7 with TypeScript
- **Targets:** Cloudflare, Netlify, Vercel, Node.js
- **Type Checking:** `pnpm typecheck` (production) vs `pnpm typecheck:all` (includes tests)
- **Linting:** ESLint with 0 warnings

### Environment Variables

- **Prefix:** `VITE_*` for client-side variables
- **Sentry:** Optional error tracking
- **Deployment:** `DEPLOY_TARGET` for platform selection

## File Locations

```
src/
├── styles/
│   ├── design-tokens.css      # CSS design tokens
│   ├── design-tokens.ts       # TypeScript types
│   ├── animations.css         # Custom animations
│   └── light-theme-tokens.css # Light theme overrides
│
├── hooks/
│   ├── index.ts               # Barrel exports
│   ├── useResponsive.ts       # Responsive breakpoints
│   ├── useCapabilityDetection.ts  # Browser capabilities
│   ├── useWorkspaceContext.ts     # Workspace management
│   └── use-cross-workspace-events.ts  # RAG events
│
└── i18n/
    ├── config.ts              # i18next initialization
    ├── en.json                # English translations
    ├── vi.json                # Vietnamese translations
    ├── LocaleProvider.tsx     # React context provider
    ├── en/rag.json            # RAG-specific English
    └── vi/rag.json            # RAG-specific Vietnamese
```

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Build scripts, dependencies |
| `vite.config.ts` | Vite configuration, plugins |
| `tsconfig.json` | TypeScript options |
| `.env.example` | Environment variable template |

## Common Tasks

### Adding a New Translation

1. Add key to `en.json` and `vi.json`:
```json
{
  "myFeature.newAction": "New Action"
}
```

2. Run extraction:
```bash
pnpm i18n:extract
```

3. Use in component:
```typescript
const { t } = useTranslation();
return <button>{t('myFeature.newAction')}</button>;
```

### Creating a New Hook

1. Create hook file in `src/hooks/`:
```typescript
// src/hooks/useMyHook.ts
import { useState } from 'react';

export function useMyHook() {
  const [value, setValue] = useState('');
  return { value, setValue };
}
```

2. Export from `index.ts`:
```typescript
export { useMyHook } from './useMyHook';
```

### Updating Design Tokens

1. Update `design-tokens.css`:
```css
:root {
  --my-new-token: #ff0000;
}
```

2. Update `design-tokens.ts` with TypeScript types:
```typescript
export type MyNewToken = 'my-new-token';
export type ColorToken = ... | MyNewToken;
```

### Configuring Build Target

```bash
# Build for Cloudflare (default)
DEPLOY_TARGET=cloudflare pnpm build:cloudflare

# Build for Netlify
DEPLOY_TARGET=netlify pnpm build:netlify

# Build for Vercel
DEPLOY_TARGET=vercel pnpm build:vercel
```

## Design System

### Color Palette

- **Primary:** Orange (#f97316) - MistralAI inspired
- **Background:** Deep black (#0f0f11)
- **Surface:** Dark zinc (#18181b)
- **Semantic:** Success (green), Warning (amber), Destructive (red), Info (blue)

### Typography

- **Fonts:** System sans-serif, Monospace (code), Pixel (8-bit)
- **Sizes:** xs to 5xl scale
- **Weights:** Normal, Medium, Semibold, Bold

### Layout

- **Panels:** Editor (70%), Preview (40%), Terminal (30%), Chat (25%)
- **Sidebar:** Activity bar (48px), Content panel (280px)
- **Status Bar:** 24px height

### Responsive Breakpoints

| Breakpoint | Width |
|------------|-------|
| Mobile | < 768px |
| Tablet | 768px - 1023px |
| Desktop | ≥ 1024px |

## Internationalization Domains

| Domain | Description |
|--------|-------------|
| `common` | Common UI elements |
| `actions` | Action labels |
| `agents` | AI agent configuration |
| `chat` | Chat interface |
| `knowledge` | Knowledge workspace |
| `study` | Study tools (flashcards, quizzes) |
| `notes` | Notes workspace |
| `canvas` | Knowledge canvas |
| `rag` | RAG pipeline |
| `hub` | Dashboard hub |
| `settings` | Application settings |

## Development Commands

```bash
# Development
pnpm dev                          # Start dev server
pnpm dev:cloudflare              # Dev with Cloudflare target

# Building
pnpm build                       # Production build
pnpm build:cloudflare            # Build for Cloudflare
pnpm build:analyze               # Build with bundle analysis

# Testing & Quality
pnpm test                        # Run tests
pnpm typecheck                   # TypeScript check (fast)
pnpm typecheck:all               # TypeScript check (all files)
pnpm lint                        # ESLint
pnpm lint:fix                    # Auto-fix ESLint

# i18n
pnpm i18n:extract                # Extract translation keys

# Governance
pnpm governance                  # Run all checks
pnpm governance:size             # Check file sizes
pnpm governance:imports          # Check import paths
```

## Dependencies

### Styling
- `tailwindcss@^4.1.18`
- `@tailwindcss/vite@^4.1.18`
- `clsx@^2.1.1`
- `class-variance-authority@^0.7.1`

### Internationalization
- `i18next@^25.7.3`
- `react-i18next@^16.5.0`
- `i18next-browser-languagedetector@^8.2.0`

### Build
- `vite@^7.3.0`
- `typescript@^5.9.3`
- `@vitejs/plugin-react@^5.1.2`

### Testing
- `vitest@^4.0.16`
- `@testing-library/react@^16.3.1`
- `jsdom@^27.4.0`

## Known Issues

1. **Styling:** Light theme incomplete for some components
2. **i18n:** Dynamic keys not extractable automatically
3. **Hooks:** useResponsive requires client-side rendering
4. **Build:** Heavy libraries require SSR alias workaround

## Best Practices

### Styling
- Use design tokens instead of hardcoded values
- Follow 8-bit aesthetic (squared corners, pixel shadows)
- Keep animations under 200ms for micro-interactions
- Support `prefers-reduced-motion`

### i18n
- Use namespaced keys (e.g., `domain.key.subkey`)
- Implement pluralization for count-based strings
- Provide interpolation for dynamic values
- Extract translations after adding new keys

### Hooks
- Follow React hooks rules
- Provide proper TypeScript types
- Implement cleanup functions
- Test in `__tests__/` directories

### Build
- Use typecheck (faster) for development
- Exclude test files from production type checking
- Set appropriate heap size (8GB)
- Configure deployment target before building

## Additional Resources

- [Tailwind CSS 4 Documentation](https://tailwindcss.com/)
- [i18next Documentation](https://www.i18next.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Documentation](https://www.typescriptlang.org/)
