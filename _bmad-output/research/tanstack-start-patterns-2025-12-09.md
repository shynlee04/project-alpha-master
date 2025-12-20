# TanStack Start Patterns — 2025-12-09

**Updated:** 2025-12-10T03:00:00+07:00

Sources:
- Context7 `/websites/tanstack_start_framework_react` — SPA mode, selective SSR.
- Context7 `/websites/tanstack_start` — Server routes with handlers (1.140.0+)
- DeepWiki `tanstack/router` — file-based routing, search params as canonical state with validation/middleware.
- Tavily — WebContainers + FS Access API sync best practices (host-agnostic SPA deployment concerns).

## Routing & Execution Model
- **File-based routing:** `src/routes` with `__root.tsx` root; child files map to nested routes; prefer directory mirroring URL for clarity.
- **Search params as canonical state:** Validate via `validateSearch` (Zod) per route; inherited to children; access via `Route.useSearch()`. Use middlewares (`retainSearchParams`, `stripSearchParams`) for consistency.
- **State persistence:** Store view/layout/search state in search params to keep shareable/bookmarkable workspace URLs.
- **Selective SSR:** Set `ssr: false` on routes needing browser APIs; otherwise leave default. SPA mode disables SSR entirely.

## Server Routes (API Handlers) — UPDATED 2025-12-10

⚠️ **CRITICAL: `createAPIFileRoute` does NOT exist in TanStack Start 1.140.0**

The correct pattern for API routes uses `createFileRoute` with `server.handlers`:

```typescript
// src/routes/api/chat.ts (or api.chat.ts)
import { createFileRoute } from '@tanstack/react-router'
import { chat, toStreamResponse } from '@tanstack/ai'
import { createGemini } from '@tanstack/ai-gemini'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = await request.json()
        const apiKey = process.env.GEMINI_API_KEY
        
        const adapter = createGemini(apiKey!)
        const stream = chat({
          adapter,
          model: 'gemini-2.0-flash',
          messages,
          tools: [/* tool implementations */],
        })
        
        return toStreamResponse(stream)
      },
    },
  },
})
```

**Key Points:**
- Import `createFileRoute` from `@tanstack/react-router` (NOT from `@tanstack/start/api`)
- Use `server.handlers.POST` (or GET, PUT, DELETE) for HTTP method handlers
- Handler receives `{ request, params }` object
- Return a `Response` object directly

## SPA Mode (Client-Only Deploy)
- Build emits `_shell.html` (prerenders root + pending fallback). Recommended redirects (Netlify-style):
  - Allow static assets as-is.
  - Optional server handlers: `/_serverFn/*` and `/api/*` rewrite to themselves.
  - Catch-all: `/* /_shell.html 200`.
- Caveats: longer TTFB vs SSR; less SEO; ensure shell customization via `router.isShell()` if needed; prerender as many routes as feasible for perceived perf.
- Shell mask path configurable in vite config `tanstackStart({ spa: { maskPath: '/' } })`; default `/` is fine.

## Data & State Patterns
- **TanStack Store/Query integration:** Inject query client via router context (as in `src/router.tsx`); keep server-state in Query, UI state in Store/Zustand; avoid ad-hoc React state for global concerns.
- **Route boundaries:** Validate params and loaders at route edges; no direct infra imports inside route components—consume domain APIs/hooks.
- **Suspense/pending:** Use router pending fallbacks for loading; keep consistent per layout.

## Deployment Notes
- SPA mode suits via-gent (client-only). Keep `_redirects` aligned with SPA shell; ensure static asset priority.
- For mixed needs, selective SSR per-route is available but default to SPA for IDE flows.

## Action Items for via-gent
- Enforce search-param validation on workspace routes (project/view/rightPanel).
- Ensure `_shell.html` rewrite exists for Netlify/Vercel equivalents.
- Audit routes for direct infra imports; refactor to domain APIs.
- Document state encoding scheme for panels/tabs in search params.
