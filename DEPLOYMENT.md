# Deployment Guide

This guide covers deployment strategies for both Cloudflare and Vercel, optimized for free tier usage and large bundle management.

## 🚀 Quick Start

### Manual Deployment (Recommended for Free Tier)

```bash
# For Cloudflare Workers
pnpm build:cloudflare
pnpm wrangler deploy

# For Vercel
pnpm build:vercel
vercel --prod

# Analyze bundle size before deployment
pnpm build:analyze
```

### Automated Deployment (GitHub Actions)

Deployments are now **manual-only** to preserve free tier quotas:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Cloudflare** workflow
3. Click **Run workflow**
4. Choose deployment target (cloudflare/vercel)
5. Click **Run workflow**

## 📦 Bundle Size Management

### Current Limits

| Platform | Limit | Current Status |
|----------|-------|----------------|
| **Cloudflare Workers** | 10MB compressed | ✅ Optimized |
| **Vercel Functions** | 50MB uncompressed | ✅ Optimized |

### Bundle Optimization Strategy

1. **Aggressive Externalization**: Large client-side libraries are externalized
2. **Dynamic Imports**: Heavy dependencies loaded on-demand
3. **Memory Optimization**: 8GB heap space for builds
4. **Code Splitting**: React.lazy for heavy components

### Monitoring Bundle Size

```bash
# Analyze current build
pnpm build:analyze

# Expected output:
# 📊 Build Size Analysis:
#    Server bundle: 8.2 MB
#    Public assets: 15.3 MB
#    Total size: 23.5 MB
#
# ☁️  Cloudflare Workers Compatibility:
#    ✅ Server bundle size OK (8.2 MB < 10.0 MB)
#
# 🔺 Vercel Compatibility:
#    ✅ Total bundle size OK (23.5 MB < 50.0 MB)
```

## 🔧 Platform-Specific Configuration

### Cloudflare Workers

**Configuration Files:**
- `wrangler.jsonc` - Cloudflare Workers config
- `src/server.ts` - Custom server with COOP/COEP headers
- `vite.config.ts` - Bundle optimization for Workers

**Key Features:**
- ✅ Cross-Origin Isolation (WebContainer support)
- ✅ Edge deployment (global CDN)
- ✅ Generous free tier (100K requests/day)
- ✅ Native TanStack Start support

**Deployment:**
```bash
# Build and deploy
pnpm build:cloudflare
wrangler deploy

# Or use GitHub Actions (manual trigger)
```

### Vercel

**Configuration Files:**
- `vercel.json` - Vercel deployment config
- `vite.config.ts` - Bundle optimization for Vercel

**Key Features:**
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Preview deployments
- ✅ Git integration

**Deployment:**
```bash
# Build and deploy
pnpm build:vercel
vercel --prod

# Or use GitHub Actions (manual trigger)
```

## 🐛 Troubleshooting

### Cloudflare Build Failures

**Symptom:** "Bundle size exceeds limit" or heap memory errors

**Solutions:**
1. Check bundle size: `pnpm build:analyze`
2. Increase externalization in `vite.config.ts`
3. Use dynamic imports for heavy dependencies
4. Increase heap memory: `NODE_OPTIONS='--max-old-space-size=8192'`

### Vercel 404 Issues

**Symptom:** Build succeeds but shows 404 on frontend

**Solutions:**
1. Verify `vercel.json` routing configuration
2. Check SSR function deployment
3. Ensure proper build target: `DEPLOY_TARGET=netlify`
4. Verify headers configuration

### Memory Issues During Build

**Symptom:** "JavaScript heap out of memory"

**Solutions:**
1. Use optimized build commands:
   ```bash
   pnpm build:cloudflare  # 8GB heap
   pnpm build:vercel      # 8GB heap
   ```
2. Close other applications during build
3. Use GitHub Actions for builds (more memory available)

### Free Tier Quota Exhaustion

**Symptom:** "Build minutes exceeded" or "Function invocations exceeded"

**Solutions:**
1. Use manual deployments only: GitHub Actions → Run workflow
2. Deploy only when necessary (not on every commit)
3. Use local builds: `pnpm build:analyze` before deploying
4. Consider upgrading to paid tier for automatic deployments

## 📊 Performance Monitoring

### Build Performance

```bash
# Monitor build time and memory usage
time pnpm build:cloudflare

# Expected build time: 2-5 minutes
# Expected memory usage: 4-8GB peak
```

### Runtime Performance

- **Cloudflare**: Monitor via Wrangler dashboard
- **Vercel**: Monitor via Vercel dashboard
- **Local**: Use browser DevTools Performance tab

## 🔄 Migration Strategy

### From Automatic to Manual Deployments

1. **Current State**: Automatic deployment on every push
2. **Target State**: Manual deployment via GitHub Actions
3. **Benefits**: 
   - Preserve free tier quotas
   - Better control over deployments
   - Reduced build failures

### Deployment Workflow

1. **Development**: Use `pnpm dev` for local development
2. **Testing**: Use `pnpm build:analyze` to check bundle size
3. **Staging**: Deploy to preview environment
4. **Production**: Manual deployment via GitHub Actions

## 🎯 Best Practices

### For Free Tier Users

1. **Manual Deployments Only**: Avoid automatic builds
2. **Bundle Size Monitoring**: Always run `pnpm build:analyze`
3. **Selective Deployments**: Deploy only significant changes
4. **Local Testing**: Test thoroughly before deployment

### For Production

1. **Automated Monitoring**: Set up bundle size alerts
2. **Performance Budgets**: Monitor Core Web Vitals
3. **Error Tracking**: Use Sentry for error monitoring
4. **Backup Strategy**: Maintain both Cloudflare and Vercel configs

## 🔗 Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vercel Documentation](https://vercel.com/docs)
- [TanStack Start Deployment](https://tanstack.com/start/latest/docs/deployment)
- [Vite Bundle Analysis](https://vitejs.dev/guide/build.html#build-optimizations)

---

**Last Updated**: 2025-12-30
**Version**: 2.0 (Manual Deployment Strategy)
