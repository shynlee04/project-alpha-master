# Netlify Setup Guide

> First-time configuration for deploying Via-Gent to Netlify

## Prerequisites

- Netlify account (https://app.netlify.com)
- GitHub repository with Via-Gent source code
- Admin access to the repository

## Step 1: Create Netlify Site

### Option A: Via Netlify UI

1. Log in to [Netlify](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select the Via-Gent repository
6. Configure build settings:
   - **Branch to deploy:** `main`
   - **Build command:** `pnpm run build`
   - **Publish directory:** `dist/client`
7. Click **"Deploy site"**

### Option B: Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to existing site or create new
netlify init

# Deploy
netlify deploy --prod
```

## Step 2: Configure Environment Variables

In Netlify Dashboard:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add the following variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_VERSION` | `20` | ✅ Yes |
| `VITE_SENTRY_DSN` | `https://xxx@sentry.io/xxx` | ⬜ Optional |
| `VITE_SENTRY_ENVIRONMENT` | `production` | ⬜ Optional |

## Step 3: Set Up GitHub Actions Secrets

For automated deployments via GitHub Actions:

1. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:

### NETLIFY_AUTH_TOKEN

1. In Netlify: **User settings** → **Applications** → **New access token**
2. Copy the generated token
3. Add as `NETLIFY_AUTH_TOKEN` secret in GitHub

### NETLIFY_SITE_ID

1. In Netlify: **Site settings** → **General** → **Site details**
2. Copy the **Site ID** (also called API ID)
3. Add as `NETLIFY_SITE_ID` secret in GitHub

## Step 4: Verify Deployment

After setup, verify:

1. **Build logs:** Check Netlify deploy logs for errors
2. **Headers:** Verify security headers are applied:
   ```bash
   curl -I https://your-site.netlify.app | grep -i cross-origin
   ```
3. **SSR:** Verify server-side rendering works on dynamic routes

## Netlify Configuration Reference

The `netlify.toml` file in the repository root controls:

```toml
# Build settings
[build]
  command = "pnpm run build"
  publish = "dist/client"

# Node.js version
[build.environment]
  NODE_VERSION = "20"

# Security headers for WebContainer
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Resource-Policy = "cross-origin"
```

## SSR Functions

TanStack Start SSR functions are automatically configured by `@netlify/vite-plugin-tanstack-start`. No manual Netlify Functions configuration is required.

## Custom Domain

To add a custom domain:

1. **Site settings** → **Domain management** → **Add custom domain**
2. Add DNS records as instructed
3. Enable HTTPS (automatic via Let's Encrypt)
