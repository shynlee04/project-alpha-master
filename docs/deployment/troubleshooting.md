# Deployment Troubleshooting

> Common deployment issues and solutions

## Build Failures

### Error: "pnpm: command not found"

**Cause:** pnpm not installed in build environment.

**Solution:** Ensure `pnpm/action-setup@v4` is used in GitHub Actions or set up pnpm in Netlify:
```toml
# netlify.toml
[build.environment]
  NPM_FLAGS = "--prefix=/dev/null"
```

### Error: "Cannot find module '@tanstack/react-router'"

**Cause:** Dependencies not installed before build.

**Solution:** Run `pnpm install` before `pnpm build` in CI.

### Error: TypeScript compilation errors

**Cause:** Type errors in source code.

**Solution:** 
1. Run locally: `pnpm typecheck`
2. Fix type errors
3. If blocking builds, temporarily add `continue-on-error: true` to CI

---

## Netlify Issues

### WebContainer Not Working

**Symptom:** WebContainer fails to initialize, preview doesn't work.

**Cause:** Missing Cross-Origin headers.

**Solution:** Verify headers in `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Resource-Policy = "cross-origin"
```

**Verification:**
```bash
curl -I https://your-site.netlify.app | grep -i cross-origin
```

### SSR Not Working (404 on Dynamic Routes)

**Symptom:** Routes work locally but return 404 in production.

**Cause:** SSR functions not configured or SPA fallback issues.

**Solution:**
1. Ensure `@netlify/vite-plugin-tanstack-start` is in `devDependencies`
2. Check Netlify Functions tab for deployed functions
3. Review function logs for errors

### Deploy Preview Not Updating

**Symptom:** Pull request preview shows old content.

**Cause:** Build cache or missed webhook.

**Solution:**
1. Clear cache: Netlify → Deploys → Trigger deploy → Clear cache and deploy
2. Check GitHub webhook status

---

## GitHub Actions Issues

### Error: "NETLIFY_AUTH_TOKEN is not set"

**Cause:** Secret not configured in GitHub.

**Solution:**
1. GitHub repo → Settings → Secrets → Actions
2. Add `NETLIFY_AUTH_TOKEN` secret
3. Add `NETLIFY_SITE_ID` secret

### Deployment Stuck or Timeout

**Cause:** Build taking too long or hanging.

**Solution:**
1. Check for infinite loops in build
2. Increase timeout in workflow:
   ```yaml
   timeout-minutes: 10
   ```
3. Review Netlify deploy logs

### Tests Failing in CI

**Cause:** Tests depend on browser APIs not available in Node.

**Solution:**
1. Mock browser APIs in tests
2. Use `jsdom` environment for Vitest
3. Check test configuration in `vitest.config.ts`

---

## Sentry Issues

### Errors Not Appearing in Sentry

**Cause:** Sentry not initialized or DSN missing.

**Solution:**
1. Verify `VITE_SENTRY_DSN` is set in Netlify
2. Check browser console for Sentry initialization logs
3. Verify `VITE_SENTRY_ENVIRONMENT=production` for production

### Console: "[Sentry] DSN not configured"

**Expected Behavior:** This warning appears when `VITE_SENTRY_DSN` is not set. App continues normally.

**To Enable:**
1. Create Sentry project at https://sentry.io
2. Get DSN from Project Settings → Client Keys
3. Add `VITE_SENTRY_DSN` to environment

---

## Common Commands

```bash
# Local build test
pnpm build

# Check types
pnpm typecheck

# Run tests
pnpm test

# Start dev server
pnpm dev

# Preview production build locally
pnpm preview
```

## Getting Help

1. Check [Deployment README](./README.md) for overview
2. Review [Netlify Setup Guide](./netlify-setup.md)
3. Check Netlify deploy logs for detailed errors
4. Review GitHub Actions logs for CI/CD issues
