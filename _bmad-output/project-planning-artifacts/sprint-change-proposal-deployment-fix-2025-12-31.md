# Sprint Change Proposal: Fix Cloudflare Asset Deployment

**Date**: 2025-12-31
**Author**: @bmad-bmm-dev (via Correct Course Workflow)
**Status**: PROPOSED

## 1. Issue Summary
- **Trigger**: User reported "completely not working" deployment with broken UI (missing styles/scripts).
- **Discovery**: Visual inspection of deployed site (screenshots) and `wrangler.jsonc` configuration.
- **Root Cause**: The manually crafted `wrangler.jsonc` file in the root directory was missing the `assets` configuration block, causing `wrangler versions upload` to upload only the worker script (`dist/server/index.js`) while ignoring the client-side static assets (`dist/client`).

## 2. Impact Analysis
- **Epic 22 (Production Hardening)**: Story 22-7 was marked "Review" but failed in production.
- **Criticality**: HIGH (Assessment: Production deployment is non-functional).
- **Artifacts**: 
  - `wrangler.jsonc`: Needs strict `assets` definition.
  - `package.json`: Needs a reliable `deploy` script to prevent manual error.

## 3. Recommended Approach
**Direct Adjustment**:
1.  **Configuration**: Explicitly add `"assets": { "directory": "./dist/client" }` to `wrangler.jsonc`.
2.  **Automation**: Add a `deploy` script to `package.json` that encapsulates the correct build-and-upload sequence.
3.  **Documentation**: Update Story 22-7 with the corrected procedure.

## 4. Implementation Plan
### 4.1 Update `wrangler.jsonc`
```jsonc
{
    // ...
    "main": "./src/server.ts", // Keep for plugin validation
    "assets": {
        "directory": "./dist/client"
    },
    // ...
}
```

### 4.2 Update `package.json`
Add script:
```json
"deploy": "npm run build:cloudflare && npx wrangler versions upload dist/server/index.js --config wrangler.jsonc"
```

## 5. Handoff
- **Executor**: @bmad-bmm-dev (Self)
- **Validation**: User to confirm UI renders correctly after next deploy.
