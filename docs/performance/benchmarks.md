# Performance Benchmarks

> Target metrics and performance standards for Via-Gent

## Core Web Vitals Targets

| Metric | Target | Good | Needs Work |
|--------|--------|------|------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.5s | 2.5s - 4.0s |
| **FID** (First Input Delay) | < 100ms | < 100ms | 100ms - 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | 0.1 - 0.25 |
| **INP** (Interaction to Next Paint) | < 200ms | < 200ms | 200ms - 500ms |

## Performance Budget

### Initial Load
| Resource | Budget |
|----------|--------|
| HTML | < 50 KB |
| CSS (total) | < 100 KB |
| JS (initial) | < 300 KB |
| Images | < 500 KB |
| **Total** | **< 1 MB** |

### Runtime Performance
| Metric | Target |
|--------|--------|
| Time to Interactive | < 3.5s |
| First Contentful Paint | < 1.8s |
| Speed Index | < 3.4s |

## Lighthouse Targets

| Category | Target Score |
|----------|--------------|
| Performance | 90+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 90+ |

## Measuring Performance

### Manual Lighthouse Audit
```bash
# Using Chrome DevTools
1. Open Chrome DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Select all categories
4. Click "Analyze page load"
```

### Lighthouse CI (Future Enhancement)
```yaml
# .github/workflows/ci.yml (to be added)
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v11
  with:
    urls: |
      http://localhost:3000/
    uploadArtifacts: true
```

## WebContainer-Specific Considerations

- **Cold Boot:** 3-5s for initial WebContainer boot (expected)
- **Hot Reload:** < 500ms for file changes
- **Terminal Response:** < 100ms input latency

## Monitoring

### Sentry Performance (When Configured)
- Transaction tracing enabled
- Performance monitoring via `@sentry/react`
- Sample rate configurable via `VITE_SENTRY_SAMPLE_RATE`

---

*Last Updated: 2025-12-21*
