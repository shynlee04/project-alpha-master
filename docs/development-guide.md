# Development Guide

Setup and development instructions for the Via-gent project.

## Prerequisites

| Tool | Version | Description |
|------|---------|-------------|
| Node.js | 18+ | Runtime environment |
| pnpm | 8+ | Package manager |
| Git | 2+ | Version control |
| Chrome/Edge | Latest | Browser with File System Access API |

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd project-alpha-master

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dev server runs on port 3000 with required cross-origin isolation headers.

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (port 3000) |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm i18n:extract` | Extract translation keys |

## Project Structure

```
src/
├── components/    # React components
├── lib/           # Core libraries
├── routes/        # TanStack Router routes
├── hooks/         # Custom hooks
├── stores/        # Zustand stores
├── styles/        # Global styles
└── i18n/          # Translations
```

## Coding Conventions

### File Naming
- **Components**: PascalCase (`MyComponent.tsx`)
- **Utilities**: kebab-case (`my-util.ts`)
- **Stores**: kebab-case (`my-store.ts`)

### Imports
- Use `@/` alias for absolute imports (configured in `tsconfig.json`)
- Third-party imports first, then `@/` imports, then relative imports

### State Management
- Use Zustand stores in `src/lib/state/` and `src/stores/`
- Avoid `useState` for global state
- Use `useShallow` selector for performance

### Component Structure
```typescript
// Good pattern
import { useState } from 'react';
import { useMyStore } from '@/lib/state';
import { Button } from '@/components/ui';

export function MyComponent({ prop }: MyComponentProps) {
    const { value, setValue } = useMyStore();
    return <Button onClick={() => setValue(prop)}>{value}</Button>;
}
```

## Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test src/lib/agent/__tests__/factory.test.ts
```

### Test Setup
- **Framework**: Vitest
- **Renderer**: React Testing Library
- **Mocking**: vi.mock()
- **Location**: Adjacent `__tests__/` directories

### Example Test
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders greeting', () => {
    render(<MyComponent name="World" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});
```

## Internationalization

### Adding Translations
1. Add translation key in component: `t('myKey')`
2. Run extraction: `pnpm i18n:extract`
3. Update translation files: `src/i18n/en.json`, `src/i18n/vi.json`

### Translation Files
- `src/i18n/en.json` - English translations
- `src/i18n/vi.json` - Vietnamese translations

## Building for Production

```bash
# Standard build
pnpm build

# Cloudflare Workers build
pnpm build:cloudflare

# Vercel build
pnpm build:vercel
```

Build output is in the `dist/` directory.

## Debugging

### WebContainer Issues
1. Check console for COOP/COEP header errors
2. Verify cross-origin isolation plugin is first in Vite config
3. Check browser supports SharedArrayBuffer

### File Sync Issues
1. Verify File System Access API permissions
2. Check SyncManager logs for errors
3. Verify sync exclusions don't affect files

### Terminal Not Working
1. Ensure `projectPath` is passed to XTerminal
2. Check WebContainer is booted
3. Verify terminal is connected to shell

## Common Tasks

### Adding New Agent Tools
1. Create tool in `src/lib/agent/tools/`
2. Add Zod schema validation
3. Register in `src/lib/agent/tools/index.ts`
4. Add to agent configuration
5. Write tests

### Adding New AI Providers
1. Add provider config to `model-registry.ts`
2. Implement adapter in `provider-adapter.ts`
3. Register in `providerAdapterFactory`
4. Add to provider selector UI

### Adding New Icons
1. Create component in `src/components/ui/icons/`
2. Follow icon pattern with SVG
3. Export from `src/components/ui/icons/index.ts`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NODE_OPTIONS` | Node options (e.g., `--max-old-space-size=8192`) |
| `DEPLOY_TARGET` | Deployment target (cloudflare, vercel) |

## Troubleshooting

### Chat API Returning 401
1. Check provider credentials in Agent Settings
2. Verify API key is valid
3. Check `/api/chat` logs

### Component Errors
1. Check browser console
2. Review error state UI
3. Verify props are valid
4. Check async operation failures

### Translation Keys Missing
1. Run `pnpm i18n:extract`
2. Check key is in correct namespace
3. Verify `t()` function usage

---

*Generated: 2025-12-31*
