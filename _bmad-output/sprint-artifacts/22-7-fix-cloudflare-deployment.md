---
id: "22-7"
epic_id: "22"
title: "Fix Cloudflare Deployment Build Issues"
type: "technical-debt"
priority: "high"
status: "review"
assigned_to: "bmad-bmm-dev"
created_at: "2025-12-29T12:00:00+07:00"
completed_at: "2025-12-30T18:15:00+07:00"
description: "Resolve unresolved import errors (#tanstack-router-entry, #tanstack-start-entry) during Cloudflare build."
requirements:
  - "Investigate root cause of unresolved imports in @tanstack/start-server-core"
  - "Modify vite.config.ts or wrangler.jsonc to handle these imports correctly"
  - "Ensure successful `npx wrangler versions upload` (using built artifact)"
acceptance_criteria:
  - "Build passes without 'Could not resolve' errors"
  - "Application deploys to Cloudflare"
tags:
  - "cloudflare"
  - "build"
  - "tanstack-start"
  - "vite"
---

# Context
The deployment to Cloudflare was failing due to unresolved internal imports in `@tanstack/start-server-core` (like `#tanstack-router-entry`) which are virtual modules handled by the Vite plugin but not by Wrangler's native bundler.

# Implementation Notes
- **Root Cause**: 
    1. Plugin ordering in `vite.config.ts`: The `@tanstack/start` plugin was initialized after the `@cloudflare/vite-plugin`.
    2. Deployment Command: `wrangler versions upload` uses `wrangler.jsonc`'s `main` field, which pointed to `src/server.ts`, triggering a re-bundle that lacked Vite's virtual module context.
- **Fix**: 
    1. Reordered `vite.config.ts` to place `tanstackStart()` before deployment plugins.
    2. Reverted `wrangler.jsonc` to point to `src/server.ts` (required for `@cloudflare/vite-plugin` validation during build).
    3. Confirmed that deployment must explicitly point to the **built artifact**: `npx wrangler versions upload --main dist/server/server.js`.
- **Verification**: 
  - `npm run build:cloudflare` PASSED (22.99s, Exit code 0).
  - `dist/server/server.js` exists and is a valid bundled worker entry.

# Technical Notes
- **Verified Deployment Command (Cloudflare)**: 
  ```bash
  npm run deploy
  ```
- **Verified Deployment Command (Vercel)**:
  ```bash
  npm run deploy:vercel
  ```
- This runs: `pnpm build:vercel && npx vercel deploy --prebuilt --prod`
- `wrangler.jsonc` must include `"assets": { "directory": "./dist/client" }` to ensure static assets are uploaded.
- Use `npx wrangler versions deploy` to promote the version to production on Cloudflare.
acceptance_criteria:
  - "Build passes without 'Could not resolve' errors"
  - "Application deploys to Cloudflare"
tags:
  - "cloudflare"
  - "build"
  - "tanstack-start"
  - "vite"
---

# Context
The deployment to Cloudflare is failing due to unresolved internal imports in `@tanstack/start-server-core`. These imports (`#tanstack-router-entry`, etc.) are likely not being correctly resolved by the Cloudflare/Vite build process.

# Implementation Notes
- **Root Cause**: The `@tanstack/start` plugin (which handles virtual module resolution for `#tanstack-router-entry`) was placed *after* the Cloudflare deployment plugin in `vite.config.ts`. The Cloudflare plugin initializes the SSR environment, and due to plugin ordering, the virtual modules were not being registered/resolved correclty during the SSR build.
- **Fix**: Reordered `vite.config.ts` plugins to place `tanstackStart()` before the deployment plugin logic.
- **Verification**: Ran `npm run build:cloudflare`.
  - Client build: PASSED (27.79s)
  - SSR build: PASSED (21.90s)
  - Exit code: 0
  - No "Could not resolve" errors observed.

# Technical Notes
- Errors stem from `dist/esm/createStartHandler.js` and `router-manifest.js`.
- These look like Node.js subpath imports (`#...`) that might need explicit configuration or `nodejs_compat` tweaks.
- Check `vite.config.ts` SSR configuration.
