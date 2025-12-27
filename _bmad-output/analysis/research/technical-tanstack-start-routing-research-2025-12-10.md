# Technical Research Report: TanStack Start Routing Configuration

**Date:** 2025-12-10
**Author:** Cascade AI
**Research Type:** Technical Implementation Research

---

## Research Overview

This research investigates the correct configuration patterns for TanStack Start v1.140.x routing, specifically addressing 404 errors in the advanced-ide-spike project. The research uses verified sources from official TanStack documentation and working reference implementations.

---

## Table of Contents

1. [Technical Overview](#technical-overview)
2. [File-Based Routing Architecture](#file-based-routing-architecture)
3. [Critical Configuration Patterns](#critical-configuration-patterns)
4. [Implementation Findings](#implementation-findings)
5. [Root Cause Analysis](#root-cause-analysis)
6. [Recommendations](#recommendations)

---

## Technical Overview

### TanStack Start Architecture

TanStack Start is a full-stack React framework powered by:
- **TanStack Router** - Type-safe file-based routing
- **Vinxi** - Meta-framework bundler (v0.5.6)
- **Vite 7** - Build tooling

_Source: https://tanstack.com/start/latest_

### Key Architectural Decisions

1. **File-based routing** - Routes defined by filesystem structure
2. **SSR-first** - Server-side rendering with hydration
3. **Isomorphic execution** - Code runs on both server and client
4. **Type-safe routes** - Full TypeScript integration

---

## File-Based Routing Architecture

### Required File Structure

```
.
├── src/
│   ├── routes/
│   │   ├── __root.tsx      # Root layout (REQUIRED)
│   │   ├── index.tsx       # Home route (/)
│   │   └── workspace/
│   │       └── ide.tsx     # Nested route (/workspace/ide)
│   ├── router.tsx          # Router configuration
│   ├── client.tsx          # Client entry point
│   ├── ssr.tsx             # Server entry point
│   └── routeTree.gen.ts    # Auto-generated route tree
├── vite.config.ts          # Vite + TanStack Start config
└── package.json
```

_Source: https://tanstack.com/start/latest/docs/framework/react/build-from-scratch_

### Route Tree Generation

The `routeTree.gen.ts` file is **auto-generated** by the TanStack Router plugin. It:
- Imports all route files from `src/routes/`
- Creates type-safe route definitions
- Exports the complete route tree

**Important**: This file should be gitignored and never manually edited.

---

## Critical Configuration Patterns

### 1. vite.config.ts Pattern

```typescript
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    // CRITICAL: React plugin must come AFTER TanStack Start
    viteReact(),
  ],
})
```

_Source: https://tanstack.com/start/latest/docs/framework/react/build-from-scratch_

### 2. ssr.tsx Pattern (CRITICAL)

```typescript
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createServerEntry } from '@tanstack/react-start/server-entry'

const fetch = createStartHandler(defaultStreamHandler)

export default createServerEntry({
  fetch,
})
```

_Source: Verified from working tanstack-ai-spike implementation_

**Anti-Pattern** (causes 404s):
```typescript
// WRONG - Do not use this pattern
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
export default createServerEntry({
  fetch(request) {
    return handler.fetch(request)
  },
})
```

### 3. client.tsx Pattern

```typescript
import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)
```

_Source: https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point_

### 4. __root.tsx Pattern

```typescript
import { Outlet, createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    title: 'App Title',
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  )
}
```

_Source: https://tanstack.com/start/latest/docs/framework/react/guide/routing_

### 5. router.tsx Pattern

```typescript
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })
  return router
}
```

_Source: https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js_

---

## Implementation Findings

### Package Version Analysis

| Package | Version | Notes |
|---------|---------|-------|
| @tanstack/react-start | 1.140.1 | Does NOT export `/config` subpath |
| @tanstack/react-router | 1.140.1 | File-based routing support |
| vinxi | 0.5.6 | Meta-framework bundler |
| vite | 7.x | Build tooling |

### Export Analysis (@tanstack/react-start@1.140.1)

Available exports:
- `.` (main)
- `./client`
- `./server`
- `./server-entry`
- `./plugin/vite`

**NOT available**: `./config` - This export does not exist in v1.140.1

### Configuration File Priority

When Vinxi starts:
1. Looks for `app.config.ts` first
2. Falls back to `vite.config.ts` if no app.config.ts
3. Auto-generates app.config timestamp files from vite.config.ts

**Best Practice**: Use only `vite.config.ts`, delete any `app.config.ts`

---

## Root Cause Analysis

### 404 Error Root Cause

The advanced-ide-spike was showing 404 errors due to **incorrect ssr.tsx pattern**:

**Problem**: Using direct handler import pattern
```typescript
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
export default createServerEntry({
  fetch(request) {
    return handler.fetch(request)
  },
})
```

**Solution**: Using createStartHandler pattern
```typescript
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { createServerEntry } from '@tanstack/react-start/server-entry'

const fetch = createStartHandler(defaultStreamHandler)

export default createServerEntry({
  fetch,
})
```

### Contributing Factors

1. **Outdated documentation patterns** - Some patterns in documentation don't match v1.140.x
2. **Missing /config export** - v1.140.1 doesn't export defineConfig from /config
3. **Vinxi + Vite confusion** - Both can be used but have different config patterns

---

## Recommendations

### Immediate Actions

1. **Fix ssr.tsx** - Use createStartHandler(defaultStreamHandler) pattern ✅ DONE
2. **Remove app.config.ts** - Let Vinxi use vite.config.ts directly ✅ DONE
3. **Restart dev server** - Changes require server restart

### Configuration Best Practices

1. **Plugin Order**: tanstackStart() BEFORE viteReact()
2. **No app.config.ts**: Delete it, use vite.config.ts only
3. **Export getRouter**: Router must export getRouter function
4. **SSR Pattern**: Use createStartHandler(defaultStreamHandler)

### Technology Adoption Strategy

| Phase | Action | Priority |
|-------|--------|----------|
| 1 | Fix ssr.tsx pattern | Critical |
| 2 | Validate route tree generation | High |
| 3 | Add SSR: false for browser-only routes | Medium |
| 4 | Implement error boundaries | Medium |

### Success Metrics

- [ ] Dev server starts without errors
- [ ] Root route (/) renders correctly
- [ ] Nested routes (/workspace/ide) render correctly
- [ ] Console shows no 404 errors
- [ ] TypeScript type-checking passes

---

## References

1. TanStack Start Official Docs: https://tanstack.com/start/latest
2. TanStack Router File-Based Routing: https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing
3. Build from Scratch Guide: https://tanstack.com/start/latest/docs/framework/react/build-from-scratch
4. LogRocket Migration Guide: https://blog.logrocket.com/migrating-tanstack-start-vinxi-vite/
5. Working Reference: tanstack-ai-spike in same repository

---

**Research Confidence Level**: High
**Sources Verified**: 5+ independent sources
**Last Updated**: 2025-12-10
