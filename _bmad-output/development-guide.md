# Project Alpha - Development Guide

> **Generated:** 2025-12-20 | **Scan Level:** Exhaustive

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20+ | Required for pnpm |
| pnpm | 8+ | Package manager |
| Chrome/Edge | Latest | Required for FSA and WebContainers |
| VS Code | Recommended | With ESLint/Prettier extensions |

> ⚠️ **Firefox/Safari Limitation:** File System Access API is not supported. Use Chromium-based browsers.

---

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd project-alpha-master

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The dev server runs on **http://localhost:3000** with required COOP/COEP headers for WebContainers.

---

## Project Structure

```
project-alpha/
├── src/
│   ├── components/       # React components
│   ├── lib/              # Core libraries
│   │   ├── filesystem/   # FSA operations
│   │   ├── webcontainer/ # Container management
│   │   ├── workspace/    # State stores
│   │   ├── events/       # Event bus
│   │   └── persistence/  # IndexedDB
│   ├── routes/           # TanStack Router pages
│   └── hooks/            # Custom hooks
├── docs/                 # Documentation
├── _bmad/                # BMAD framework
└── public/               # Static assets
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run Vitest tests |
| `pnpm tsc --noEmit` | Type check without emit |

---

## Key Development Workflows

### Adding a New Component

1. Create component in `src/components/<category>/<ComponentName>.tsx`
2. Export from `src/components/<category>/index.ts`
3. Add tests in `src/components/<category>/__tests__/`

### Adding a New Route

1. Create file in `src/routes/<path>.tsx`
2. Route tree auto-generates to `src/routeTree.gen.ts`
3. Never edit `routeTree.gen.ts` directly

### Adding a New Store

1. Create store in `src/lib/workspace/<store-name>.ts`
2. Use TanStack Store pattern:
   ```typescript
   import { Store } from '@tanstack/store';
   
   interface State { /* ... */ }
   
   export const store = new Store<State>(initialState);
   ```
3. Export from `src/lib/workspace/index.ts`

### Adding Event Types

1. Define in `src/lib/events/workspace-events.ts`
2. Add to typed event map
3. Components subscribe via `useEventBusEffects()`

---

## Code Style

### TypeScript

- **Strict mode enabled** - No implicit any
- **Path aliases:** `@/*` → `./src/*`
- **Explicit return types** for public functions

### React

- **Functional components only**
- **Hooks at component top**
- **Props interface named `<Component>Props`**

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Tests: `<filename>.test.ts(x)`

---

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run with watch mode
pnpm vitest

# Run specific file
pnpm vitest sync-manager
```

### Test Patterns

```typescript
// Unit test example
import { describe, it, expect, vi } from 'vitest';
import { SyncManager } from '../sync-manager';

describe('SyncManager', () => {
  it('should sync files to WebContainer', async () => {
    // Arrange
    const mockAdapter = { /* ... */ };
    
    // Act
    const result = await syncManager.syncToContainer();
    
    // Assert
    expect(result.success).toBe(true);
  });
});
```

### Mocking Patterns

- **IndexedDB:** Use `fake-indexeddb` package
- **FSA API:** Mock `window.showDirectoryPicker`
- **WebContainer:** Mock `@webcontainer/api` module

---

## Debugging

### DevTools

- **React DevTools:** Component tree inspection
- **TanStack Router DevTools:** Route debugging
- **Browser DevTools:** Network, IndexedDB, Console

### Common Issues

| Issue | Solution |
|-------|----------|
| WebContainer not booting | Check COOP/COEP headers in Network tab |
| FSA permission denied | Clear site data, re-grant permission |
| Route not found | Check `routeTree.gen.ts` regenerated |
| IndexedDB errors | Check schema migrations in `project-store.ts` |

### Logging

```typescript
// Use console groups for structured logging
console.group('[SyncManager] Sync started');
console.log('Files:', files.length);
console.groupEnd();
```

---

## Environment Configuration

### Local Development

No `.env` file required for basic development. The application runs entirely client-side.

### Required Headers (handled by Vite)

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

These are configured in `vite.config.ts` via the custom COOP/COEP plugin.

---

## Build & Deployment

### Production Build

```bash
pnpm build
```

Output goes to `dist/` directory.

### Deployment Requirements

- Static file hosting (Netlify, Vercel, Cloudflare Pages)
- **Must configure COOP/COEP headers** on hosting platform
- No server-side compute required

---

## BMAD Workflow Integration

This project uses the BMAD framework for development workflow:

1. **Planning:** `document-project`, `generate-project-context`
2. **Research:** `research` workflow with MCP tools
3. **Course Correction:** `correct-course` for sprint changes
4. **Implementation:** `story-dev-cycle` for story development

See `.agent/workflows/` for custom workflow definitions.

---

*Generated by BMAD Document Project Workflow v1.2.0*
