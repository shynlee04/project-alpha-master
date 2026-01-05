# Environment Variables Documentation

## Overview

The Via-gent platform uses environment variables for configuration, with client-side variables prefixed with `VITE_` and server-side variables used during build time.

## File Structure

| File | Purpose |
|------|---------|
| `.env.example` | Template for environment variables |
| `.env` | Local development variables (not committed) |
| `.env.production` | Production build variables |
| `.env.development` | Development build variables |

## Environment Variables

### Build-Time Variables

These variables are used during the build process and affect the build output.

#### DEPLOY_TARGET

| Property | Value |
|----------|-------|
| Required | No |
| Default | `cloudflare` |
| Options | `cloudflare` \| `netlify` \| `vercel` \| `node` |

**Purpose:** Specifies the deployment target platform.

```bash
# Cloudflare Pages (default)
DEPLOY_TARGET=cloudflare pnpm build:cloudflare

# Netlify
DEPLOY_TARGET=netlify pnpm build:netlify

# Vercel
DEPLOY_TARGET=vercel pnpm build:vercel

# Node.js
DEPLOY_TARGET=node pnpm build
```

#### NODE_OPTIONS

| Property | Value |
|----------|-------|
| Required | No |
| Default | `--max-old-space-size=8192` |

**Purpose:** Node.js heap size for build process.

```bash
NODE_OPTIONS='--max-old-space-size=8192' pnpm build
```

**Note:** 8GB heap size is required due to large bundles (Monaco Editor ~5MB, etc.).

### Client-Side Variables (VITE_*)

These variables are exposed to the client-side code and can be accessed via `import.meta.env`.

#### VITE_SENTRY_DSN

| Property | Value |
|----------|-------|
| Required | No |
| Format | URL |
| Example | `https://xxx@sentry.io/xxx` |

**Purpose:** Sentry project DSN for error tracking.

```bash
VITE_SENTRY_DSN=https://abc123@sentry.io/456789
```

**Usage in code:**

```typescript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});
```

#### VITE_SENTRY_ENVIRONMENT

| Property | Value |
|----------|-------|
| Required | No |
| Default | `development` |
| Options | `development` \| `staging` \| `production` |

**Purpose:** Environment tag for Sentry error reports.

```bash
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_ENVIRONMENT=production
```

#### VITE_SENTRY_SAMPLE_RATE

| Property | Value |
|----------|-------|
| Required | No |
| Default | `1.0` |
| Range | `0.0` to `1.0` |

**Purpose:** Error sampling rate for Sentry.

```bash
# Capture all errors
VITE_SENTRY_SAMPLE_RATE=1.0

# Capture 50% of errors
VITE_SENTRY_SAMPLE_RATE=0.5

# Capture none (disable)
VITE_SENTRY_SAMPLE_RATE=0.0
```

#### VITE_SENTRY_FORCE_ENABLED

| Property | Value |
|----------|-------|
| Required | No |
| Default | Not set |
| Options | `true` |

**Purpose:** Force enable Sentry in non-production environments.

```bash
# Enable Sentry in development
VITE_SENTRY_FORCE_ENABLED=true
```

### DevTools Configuration

#### TANSTACK_DEVTOOLS_EVENT_BUS_PORT

| Property | Value |
|----------|-------|
| Required | No |
| Default | `42071` |

**Purpose:** Port for TanStack DevTools event bus.

```bash
TANSTACK_DEVTOOLS_EVENT_BUS_PORT=42071
```

## .env.example Template

```bash
# Environment Variables

# =============================================================================
# Sentry Error Monitoring (Optional)
# =============================================================================
# VITE_SENTRY_DSN - Your Sentry project DSN (required for error tracking)
# Get this from: https://sentry.io/settings/projects/[project]/keys/
# VITE_SENTRY_DSN=https://xxx@sentry.io/xxx

# VITE_SENTRY_ENVIRONMENT - Environment tag for error reports
# Options: development, staging, production
VITE_SENTRY_ENVIRONMENT=development

# VITE_SENTRY_SAMPLE_RATE - Error sampling rate (0.0 to 1.0)
# 1.0 = capture all errors, 0.5 = capture 50%
VITE_SENTRY_SAMPLE_RATE=1.0

# VITE_SENTRY_FORCE_ENABLED - Force enable Sentry in non-production environments
# Set to "true" to enable Sentry in development/staging
# VITE_SENTRY_FORCE_ENABLED=true

# =============================================================================
# Application Configuration
# =============================================================================
# Add other environment variables as needed
```

## Environment-Specific Files

### .env.development

Variables specific to development builds:

```bash
VITE_SENTRY_ENVIRONMENT=development
VITE_SENTRY_SAMPLE_RATE=1.0
```

### .env.production

Variables specific to production builds:

```bash
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_SAMPLE_RATE=0.1
```

## Usage in Code

### Accessing Environment Variables

```typescript
// Type-safe access
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT;

// Conditional logic
if (import.meta.env.PROD) {
  // Production-specific code
}

if (import.meta.env.DEV) {
  // Development-specific code
}
```

### TypeScript Types

```typescript
interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SENTRY_ENVIRONMENT: string;
  readonly VITE_SENTRY_SAMPLE_RATE: string;
  readonly VITE_SENTRY_FORCE_ENABLED: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Environment Setup

### Local Development

1. Copy `.env.example` to `.env`
2. Add your API keys and configuration
3. Restart development server

```bash
cp .env.example .env
# Edit .env with your values
pnpm dev
```

### CI/CD Pipeline

Set environment variables in your CI/CD platform:

```yaml
# GitHub Actions example
env:
  VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}
  VITE_SENTRY_ENVIRONMENT: production
  VITE_SENTRY_SAMPLE_RATE: "0.1"
```

### Docker/Container

```dockerfile
ENV VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
ENV VITE_SENTRY_ENVIRONMENT=production
```

## Security Best Practices

### 1. Never Commit Secrets

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### 2. Use Secrets Management

```bash
# GitHub Actions
echo "$SENTRY_DSN" >> $GITHUB_ENV
```

### 3. Validate Environment Variables

```typescript
// Validate at startup
if (!import.meta.env.VITE_SENTRY_DSN) {
  console.warn('Sentry DSN not configured - error tracking disabled');
}
```

### 4. Prefix Client Variables

Only variables prefixed with `VITE_` are exposed to client code:

```bash
# Exposed to client ✓
VITE_API_URL=https://api.example.com

# NOT exposed to client ✗
API_URL=https://api.example.com
```

## Deployment-Specific Configuration

### Cloudflare Pages

Environment variables set in Cloudflare dashboard:
- Settings → Environment variables
- Production, Preview, and Development scopes

### Vercel

Environment variables set in Vercel dashboard:
- Settings → Environment Variables
- Production, Preview, Development scopes

### Netlify

Environment variables set in Netlify dashboard:
- Site settings → Environment variables
- Build & deploy settings

## Troubleshooting

### Variable Not Defined

```typescript
// Check if variable is defined
console.log('SENTRY_DSN:', import.meta.env.VITE_SENTRY_DSN);

// Fallback to default
const dsn = import.meta.env.VITE_SENTRY_DSN || 'default-dsn';
```

### Build Fails with Environment Variable

```bash
# Check variable syntax
export VITE_SENTRY_DSN="https://xxx@sentry.io/xxx"

# Avoid special characters
# If needed, escape or use base64
```

### TypeScript Errors

```typescript
// Extend ImportMeta interface
declare module 'import.meta' {
  interface Env {
    VITE_MY_VAR: string;
  }
}
```

## Known Issues and Limitations

1. **No Runtime Changes**: Environment variables are baked at build time
2. **No Secret Server**: Client-side variables are not truly secret
3. **TypeScript Globals**: Requires module augmentation for type safety
4. **Vite 7 Changes**: ImportMetaEnv may need manual type definition

## Developer Notes

1. Always use `.env.example` as template for new variables
2. Document all environment variables with comments
3. Use type augmentation for TypeScript support
4. Consider fallback behavior for optional variables
5. Don't expose sensitive data in VITE_* variables
6. Use secrets management in CI/CD pipelines
7. Validate variables at application startup
