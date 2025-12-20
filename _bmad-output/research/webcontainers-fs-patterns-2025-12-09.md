# WebContainers + File System Access API — 2025-12-09

Sources:
- Tavily — WebContainers guides (`webcontainers.io/guides/working-with-the-file-system`), API reference, StackBlitz blog.

## Dual FS Sync Patterns
- Mount initial `FileSystemTree` into WebContainers; keep local disk (File System Access API) as source of truth for persistence.
- Use debounced sync (e.g., 500ms) for file writes from WebContainers → Local FS to avoid thrash.
- On reload, hydrate WebContainers from local disk snapshot; avoid reinstalling node_modules when unchanged.
- Prefer selective sync filters (`includes/excludes`) to skip bulky artifacts when unnecessary.

## Lifecycle Management
- Boot WebContainers once; reuse instance across tabs if feasible (SharedWorker later).
- Handle permission prompts gracefully; fall back to IndexedDB (Tier 1) if FS API unavailable.
- On `logged-out`/`auth-failed` events, surface UI guidance to re-authenticate WebContainers session.

## Performance Considerations
- Keep cold boot under 6s by caching pnpm store and node_modules in local FS snapshot.
- Avoid large binary sync into WebContainers; keep assets on disk and stream when needed.
- Use background warm-up after permission grant to prepare toolchain before user edits.

## Action Items for via-gent
- Enforce single sync pipeline (no ad-hoc localStorage writes); route persistence through `PersistMiddleware` + FS sync.
- Add debounce and include/exclude config to sync layer.
- Store WebContainers bootstrap status and last sync time for UX (avoid repeated installs).
- Document fallback path (IndexedDB) and migration back to FS API when available.
