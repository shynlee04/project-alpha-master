# Advanced IDE Spike Fix Report

**Date:** 2025-12-10
**Status:** Fixes Applied (TanStack Start + Vite configuration)
**Spike:** `spikes/advanced-ide-spike`

## Root Cause Analysis

The spike was failing with 404 routing errors due to several architectural misconfigurations:

### Issue 1: Misaligned Configuration Model (Vinxi vs Vite Plugin)
- **Original Assumption:** TanStack Start 1.140.x required `app.config.ts` (Vinxi-first model)
- **Reality:** `@tanstack/react-start@1.140.1` exposes a **Vite plugin** via `@tanstack/react-start/plugin/vite` and does **not** export `@tanstack/react-start/config`.
- **Effect:** Attempts to import `@tanstack/react-start/config` caused `ERR_PACKAGE_PATH_NOT_EXPORTED` and prevented the dev server from starting.
- **Fix:**
  - Removed the dependency on `app.config.ts` entirely.
  - Standardized on a **Vite-only** configuration using `vite.config.ts` with the `tanstackStart()` plugin.
  - Deleted any stale `app.config.*` timestamp files generated during earlier experiments.

### Issue 2: Incorrect SSR Entry Pattern
- **Cause:** `ssr.tsx` originally used an ad-hoc handler import pattern that did not match the documented Start server entry.
- **Effect:** SSR wiring was brittle and contributed to 404s / unexpected behavior when Start tried to hydrate routes.
- **Fix:** Updated `src/ssr.tsx` to the **documented pattern**, matching the working `tanstack-ai-spike`:
  ```tsx
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

### Issue 3: Router Export Mismatch
- **Cause:** `routeTree.gen.ts` (auto-generated) expected `getRouter` but `router.tsx` only exported `createRouter`
- **Effect:** Type errors and potential runtime issues
- **Fix:** Added `export const getRouter = createRouter` alias in `router.tsx`

### Issue 4: `useChat` Without Server Endpoint
- **Cause:** `useChat` from `@tanstack/ai-react` requires a server API endpoint
- **Effect:** Chat functionality non-functional
- **Fix:** Replaced with mock state for spike demonstration; real implementation requires `/api/chat` route

### Issue 4: WebContainers SSR Incompatibility
- **Cause:** WebContainers API requires browser environment, but route was SSR-enabled by default
- **Effect:** Server-side rendering would fail on WebContainer operations
- **Fix:** Added `ssr: false` to `/workspace/ide` route

## Files Modified

| File | Change |
|------|--------|
| `vite.config.ts` | Normalized - TanStack Start Vite plugin (`tanstackStart()`) with `viteTsConfigPaths` and `viteReact` |
| `src/router.tsx` | Added `getRouter` alias |
| `src/ssr.tsx` | Fixed SSR entry pattern using `createStartHandler(defaultStreamHandler)` + `createServerEntry` |
| `src/routes/workspace/ide.tsx` | Disabled SSR, replaced useChat with mock |

## Verification

```bash
pnpm typecheck               # ✅ Should pass with current tsconfig and dependencies
pnpm dev                     # Uses: vite dev --port 3002 --host

# Expected dev URLs
http://localhost:3002/        # Home route (spike overview)
http://localhost:3002/workspace/ide  # Advanced IDE spike (WebContainers + FS + mock agent)
```

## Remaining Work

1. **Add `/api/chat` route** for real TanStack AI integration
2. **Wire tools to FileManager** for agent-driven file operations
3. **Add persistence layer** to IDEStore for session recovery
4. **Implement real FileTree** component from FileManager

## Lessons Learned

1. For **via-gent**, the sustainable path is **TanStack Start as a Vite plugin**, not a Vinxi-only `app.config.ts` model.
2. Routes using browser-only APIs (WebContainers, FileSystemAccess) must set `ssr: false` to avoid SSR crashes.
3. `useChat` from `@tanstack/ai-react` requires a real server endpoint (`/api/chat`) – a purely client-side mock is fine for a spike but must be replaced for production.
4. Router exports must match what `routeTree.gen.ts` expects (`getRouter`), otherwise the Start runtime cannot type-safely bootstrap.
5. Keeping spikes **aligned with actual package exports** (checking `node_modules/@tanstack/react-start/package.json`) is critical to avoid chasing non-existent subpaths like `@tanstack/react-start/config`.

## References

- TanStack Start Docs: https://tanstack.com/start/latest
- WebContainers API: https://webcontainers.io/api
- isomorphic-git: https://isomorphic-git.org/
