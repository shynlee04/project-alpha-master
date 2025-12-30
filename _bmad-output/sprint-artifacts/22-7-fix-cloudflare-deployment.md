---
id: "22-7"
epic_id: "22"
title: "Fix Cloudflare Deployment Build Issues"
type: "technical-debt"
priority: "high"
status: "ready-for-dev"
assigned_to: "bmad-bmm-dev"
created_at: "2025-12-29T12:00:00+07:00"
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

# Technical Notes
- Errors stem from `dist/esm/createStartHandler.js` and `router-manifest.js`.
- These look like Node.js subpath imports (`#...`) that might need explicit configuration or `nodejs_compat` tweaks.
- Check `vite.config.ts` SSR configuration.
