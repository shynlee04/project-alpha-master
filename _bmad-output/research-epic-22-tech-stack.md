# Epic 22 Research Report: Technology Stack Validation

> **Date:** 2025-12-20  
> **Workflow:** BMAD Research Synthesis  
> **Purpose:** Validate 2025 technology recommendations for Epic 22 stories

---

## Research Summary

All technologies for Epic 22 stories have been validated using MCP tools (Context7, Exa) to ensure 2025 compatibility.

---

## Story 22-1: Security Headers

### Recommended Stack
- **Package:** `vite-plugin-csp-guard`
- **Source:** npm (Context7 validated)

### CSP Configuration Pattern
```typescript
// vite.config.ts
import csp from "vite-plugin-csp-guard";

export default defineConfig({
  plugins: [
    csp({
      algorithm: "sha256",
      dev: { run: true },
      policy: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"], // Monaco needs this
        "frame-src": ["https://*.webcontainer.io"],
        "connect-src": ["'self'", "https://*.googleapis.com"],
      },
    }),
  ],
});
```

---

## Story 22-2: CI/CD Pipeline

### Recommended Stack
- **Actions:** `actions/checkout@v5`, `actions/setup-node@v4`
- **pnpm:** `pnpm/action-setup@v2` (requires pnpm >= 6.10.0)
- **Node:** 20.x LTS

### Workflow Pattern
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

---

## Story 22-3: Integration Tests

### Recommended Stack
- **Test Framework:** Vitest (already in use)
- **Note:** WebContainer tests may require browser context

---

## Story 22-4: Error Monitoring

### Recommended Stack  
- **Package:** `@sentry/react`
- **Source:** Context7 (`/getsentry/sentry-javascript`)

### Configuration Pattern
```typescript
// src/routes/__root.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE,
});
```

---

## Story 22-6: Performance Benchmarks

### Recommended Stack
- **Package:** `@lhci/cli@0.15.x`
- **Source:** Context7 (`/googlechrome/lighthouse-ci`)

### Configuration Pattern
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

---

## Story 22-8: ESLint/Prettier

### Recommended Stack
- **Package:** `typescript-eslint`
- **Config:** ESLint flat config (`eslint.config.mjs`)
- **Source:** Context7 (`/typescript-eslint/typescript-eslint`)

### Configuration Pattern
```javascript
// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
```

---

## Validation Status

| Story | Package | Version | Validated |
|-------|---------|---------|-----------|
| 22-1 | vite-plugin-csp-guard | latest | ✅ |
| 22-2 | pnpm/action-setup | v2 | ✅ |
| 22-2 | actions/setup-node | v4 | ✅ |
| 22-4 | @sentry/react | latest | ✅ |
| 22-6 | @lhci/cli | 0.15.x | ✅ |
| 22-8 | typescript-eslint | latest | ✅ |

---

*Research completed via Context7 and Exa MCP tools - 2025-12-20*
