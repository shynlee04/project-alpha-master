# Development Guide

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Overview

Via-gent is a **browser-based IDE** that runs code locally using WebContainers with integrated AI agent capabilities. This guide covers setup, development workflows, and best practices.

---

## Prerequisites

- **Node.js** 18+ (for native `fetch` API support)
- **pnpm** 8+ (package manager)
- **Chrome/Edge** (for File System Access API support)
- **TypeScript** 5.6+

---

## Quick Start

### Installation

```bash
# Clone repository
git clone <repository-url>
cd project-alpha-master

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application starts on `http://localhost:3000`

---

## Available Scripts

| Command | Description | Duration |
|---------|-------------|----------|
| `pnpm dev` | Start dev server (port 3000) | ~5s |
| `pnpm build` | Build for production | ~30s |
| `pnpm preview` | Preview production build | ~5s |
| `pnpm test` | Run tests (Vitest) | ~10s |
| `pnpm typecheck` | Type check (production code only) | ~15s |
| `pnpm typecheck:all` | Type check (includes tests) | ~45s |
| `pnpm i18n:extract` | Extract translation keys | ~5s |

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Start dev server
pnpm dev

# Make changes
# ...

# Type check (production only - faster)
pnpm typecheck

# Build to verify
pnpm build
```

### 2. Testing

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test --watch

# Run specific test file
pnpm test path/to/test.test.ts

# Run tests with coverage
pnpm test --coverage
```

### 3. Internationalization

```bash
# Extract new translation keys
pnpm i18n:extract

# Keys are extracted to:
# - src/i18n/en.json (English)
# - src/i18n/vi.json (Vietnamese)

# Edit translations manually
vim src/i18n/en.json
vim src/i18n/vi.json
```

### 4. Type Checking

**IMPORTANT:** Use `pnpm typecheck` for faster development (excludes test files).

```bash
# Recommended for development (excludes tests, ~3x faster)
pnpm typecheck

# Full type check (includes tests)
pnpm typecheck:all
```

---

## Project Structure

```
src/
├── presentation/      # UI components (426 components)
│   └── components/
├── infrastructure/    # Persistence, events
│   ├── persistence/   # Zustand stores, Dexie DB
│   └── events/        # Event bus
├── domain/            # Entities, value objects
│   ├── entities/
│   └── value-objects/
├── lib/               # Utilities, services
│   ├── agent/         # AI agent infrastructure
│   ├── filesystem/    # File system sync
│   ├── webcontainer/  # WebContainer wrapper
│   └── workspace/     # Workspace state
├── routes/            # TanStack Router routes
│   └── api/           # API endpoints
├── hooks/             # React hooks
├── i18n/              # Translations
└── styles/            # Global styles
```

---

## Component Development

### Component Size Limits

| Type | Max Lines |
|------|-----------|
| Components | 300 lines |
| Hooks | 150 lines |
| Store slices | 120 lines |
| Utilities | 200 lines |

### Component Template

```typescript
/**
 * Component description
 * @module presentation/components/feature/ComponentName
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/presentation/components/ui/button';

interface ComponentNameProps {
  /** Prop description */
  value: string;
  onChange: (value: string) => void;
}

export function ComponentName({ value, onChange }: ComponentNameProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <Button onClick={() => onChange('new-value')}>
        {t('component.action')}
      </Button>
    </div>
  );
}
```

### 8-Bit Design Guidelines

**DO:**
- Solid opaque backgrounds (`bg-card`, `bg-background`)
- Pixel-perfect borders
- High contrast colors
- 8-bit styled icons

**DON'T:**
- No glassmorphism/blur effects
- No gradients
- No translucent backgrounds

---

## State Management

### Zustand v5 Patterns

#### Slice Pattern (≤120 lines)

```typescript
// ✅ CORRECT - Slice pattern
export const createMySlice: StateCreator<MySlice> = (set, get) => ({
  data: {},
  selectedId: null,

  setData: (data) => set({ data }),
  setSelected: (id) => set({ selectedId: id }),
  getData: () => get().data,
});

// ✅ CORRECT - Combined store with persist
export const useMyStore = create<MySlice>()(
  persist(
    (...a) => ({
      ...createMySlice(...a),
    }),
    {
      name: 'my-storage',
      partialize: (state) => ({
        data: state.data,  // Persisted
        // selectedId: NOT persisted (ephemeral)
      }),
    }
  )
);
```

#### Individual Selectors (Prevent Infinite Loops)

```typescript
// ✅ CORRECT - Stable reference
const data = useMyStore(s => s.data);
const setData = useMyStore(s => s.setData);

// ❌ WRONG - Causes infinite loops in Zustand v5
const { data, setData } = useMyStore();
```

#### Cross-Slice Communication

```typescript
// ✅ CORRECT - Use get() for cross-slice calls
export const createMySlice = (set, get) => ({
  updateData: (data) => {
    // Call other slice via get()
    get().otherSliceMethod(data);
  }
});
```

---

## API Development

### Route Definition

**Location:** `src/routes/api/`

```typescript
// src/routes/api/endpoint.ts
import { createFileRoute } from '@tanstack/react-router';
import { json } from '@tanstack/react-router';

export const Route = createFileRoute('/api/endpoint')({
  POST: async ({ request }) => {
    const body = await request.json();

    // Process request
    const result = await processRequest(body);

    return json(result);
  },
});
```

### SSE Streaming

```typescript
// Server-sent events for AI streaming
export const Route = createFileRoute('/api/chat')({
  POST: async ({ request }) => {
    const body = await request.json();
    const stream = new ReadableStream({
      async start(controller) {
        // Stream chunks
        controller.enqueue(new TextEncoder().encode('data: {"chunk":"Hello"}\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  },
});
```

---

## File System Sync

### Local FS as Source of Truth

```typescript
import { LocalFSAdapter } from '@/lib/filesystem/local-fs-adapter';
import { SyncManager } from '@/lib/filesystem/sync-manager';

// Read file
const content = await LocalFSAdapter.readFile('/path/to/file.txt');

// Write file
await LocalFSAdapter.writeFile('/path/to/file.txt', 'content');

// Sync to WebContainer (automatic)
await SyncManager.syncToWebContainer();
```

### File Operations

| Operation | Adapter | Description |
|-----------|---------|-------------|
| `readFile` | LocalFSAdapter | Read from local FS |
| `writeFile` | LocalFSAdapter | Write to local FS |
| `listFiles` | LocalFSAdapter | List directory |
| `deleteFile` | LocalFSAdapter | Delete file |
| `syncToWebContainer` | SyncManager | Mirror to WC |

---

## Agent Development

### Adding Agent Tools

```typescript
// src/lib/agent/tools/my-tool.ts
import { z } from 'zod';

const inputSchema = z.object({
  path: z.string(),
});

export const myTool = {
  name: 'my_tool',
  description: 'Tool description',
  inputSchema,
  execute: async (input) => {
    // Tool logic
    return { success: true, data: '...' };
  },
};
```

### Provider Integration

```typescript
// src/lib/agent/providers/provider-adapter.ts
import { createProviderAdapter } from './factory';

const adapter = createProviderAdapter('anthropic', {
  apiKey: 'sk-ant-...',
  model: 'claude-sonnet-4-5',
});

const response = await adapter.chat({
  messages: [{ role: 'user', content: 'Hello' }],
});
```

---

## Testing

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Store Tests

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyStore } from './my-store';

describe('my-store', () => {
  it('updates data', () => {
    const { result } = renderHook(() => useMyStore());

    act(() => {
      result.current.setData({ key: 'value' });
    });

    expect(result.current.data).toEqual({ key: 'value' });
  });
});
```

---

## Deployment

### Build Configuration

**Vite Config:** `vite.config.ts`

Critical cross-origin isolation headers for WebContainers:

```typescript
res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
```

### Production Build

```bash
# Build
pnpm build

# Preview
pnpm preview

# Deploy dist/ folder to:
# - Vercel (Edge Functions)
# - Cloudflare Workers (with adapter)
# - Netlify (Edge Functions)
```

---

## Troubleshooting

### WebContainer Not Loading

**Symptom:** WebContainer fails to initialize

**Check:**
1. COOP/COEP headers are present
2. Browser supports File System Access API
3. No CORS errors in console

### TypeScript Errors

```bash
# Check only production code (faster)
pnpm typecheck

# Check everything
pnpm typecheck:all
```

### File Sync Issues

**Symptom:** Changes not syncing to WebContainer

**Check:**
1. File permissions granted
2. File not in sync exclusions (`.git`, `node_modules`)
3. SyncManager running

---

## Related Documentation

- [Architecture](./architecture.md) - System design
- [Data Models](./data-models.md) - Entity definitions
- [API Contracts](./api-contracts.md) - API endpoints
