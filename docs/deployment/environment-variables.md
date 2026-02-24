# Environment Variables Reference

> Complete list of environment variables for Via-Gent

## Overview

Via-Gent uses Vite for environment variable handling. Variables prefixed with `VITE_` are exposed to the client-side code.

## Variable Categories

### Build-Time Variables (Netlify)

Set these in Netlify Dashboard → Site settings → Environment:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_VERSION` | ✅ | - | Node.js version for builds (use `20`) |

### Application Variables (Client-Side)

Set these in Netlify or local `.env` file:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_SENTRY_DSN` | ⬜ | - | Sentry project DSN for error monitoring |
| `VITE_SENTRY_ENVIRONMENT` | ⬜ | `development` | Environment tag (`development`, `staging`, `production`) |
| `VITE_SENTRY_SAMPLE_RATE` | ⬜ | `1.0` | Error sampling rate (0.0-1.0) |
| `VITE_SENTRY_FORCE_ENABLED` | ⬜ | `false` | Force enable Sentry in non-production |

### GitHub Actions Secrets

Set these in GitHub Repository Settings → Secrets:

| Secret | Required | Description |
|--------|----------|-------------|
| `NETLIFY_AUTH_TOKEN` | ✅ | Netlify API access token |
| `NETLIFY_SITE_ID` | ✅ | Netlify site identifier |

## Local Development

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# .env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_SAMPLE_RATE=1.0
```

> ⚠️ **Security:** Never commit `.env` files. The `.gitignore` already excludes them.

## Accessing Variables in Code

```typescript
// In client-side code (React components, hooks)
const dsn = import.meta.env.VITE_SENTRY_DSN

// Check if variable exists
if (import.meta.env.VITE_SENTRY_DSN) {
  // Initialize Sentry
}

// Environment checks
if (import.meta.env.DEV) {
  // Development only
}

if (import.meta.env.PROD) {
  // Production only
}
```

## Environment-Specific Configuration

| Environment | `VITE_SENTRY_ENVIRONMENT` | Sentry Enabled |
|-------------|---------------------------|----------------|
| Local dev | `development` | Only with `FORCE_ENABLED` |
| Staging | `staging` | Only with `FORCE_ENABLED` |
| Production | `production` | Yes (if DSN set) |

## Variable Validation

The application gracefully handles missing variables:

- **Sentry DSN missing:** Console warning, app continues normally
- **Environment missing:** Defaults to `development`
- **Sample rate missing:** Defaults to `1.0` (capture all)

## Adding New Variables

1. Add to `.env.example` with documentation
2. Add type definition in `src/vite-env.d.ts` (if needed)
3. Update this documentation

```typescript
// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_NEW_VARIABLE: string
}
```
