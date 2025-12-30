---
id: "22-7"
epic_id: "22"
title: "Fix Cloudflare Deployment Build Issues"
type: "technical-debt"
priority: "high"
status: "review"
assigned_to: "bmad-bmm-dev"
created_at: "2025-12-29T12:00:00+07:00"
completed_at: "2025-12-30T17:55:00+07:00"
description: "Resolve unresolved import errors (#tanstack-router-entry, #tanstack-start-entry) during Cloudflare build."
requirements:
  - "Investigate root cause of unresolved imports in @tanstack/start-server-core"
  - "Modify vite.config.ts or wrangler.jsonc to handle these imports correctly"
  - "Ensure successful `npx wrangler versions upload`"
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
