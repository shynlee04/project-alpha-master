# Asset Optimization Documentation

## Overview

This document outlines strategies for optimizing static assets in the `public/` directory. Proper optimization improves page load times, reduces bandwidth usage, and enhances the overall user experience.

## Current Asset Analysis

### File Size Summary

| Category | Count | Total Size | Percentage |
|----------|-------|------------|------------|
| Configuration | 3 | 1,757 bytes | 0.5% |
| Icons | 3 | 18,881 bytes | 5.9% |
| Logos | 3 | 293,636 bytes | 91.7% |
| Illustrations | 3 | 5,287 bytes | 1.7% |
| **Total** | **12** | **320,387 bytes** | **100%** |

### Performance Bottlenecks

The largest file by far is `tanstack-circle-logo.png` at 265KB (82.9% of total size). This file presents the biggest optimization opportunity.

---

## Optimization Strategies

### 1. SVG Optimization

#### Current State
Via-gent already uses optimized SVGs with:
- ViewBox for responsive scaling
- Reusable gradient definitions
- Minimal whitespace

#### Optimization Techniques

**A. SVGO (SVG Optimizer)**
```bash
# Install SVGO
npm install -g svgo

# Optimize a single file
svgo via-gent-logo.svg --multipass

# Optimize all SVGs
for file in public/*.svg public/assets/*.svg; do
  svgo "$file" --multipass --output "optimized/$file"
done
```

**B. Inline SVG Optimization**
```xml
<!-- Before -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120">
  <defs>
    <linearGradient id="cyanBlueGrad">...</linearGradient>
  </defs>
  <!-- Full content -->
</svg>

<!-- After - remove unnecessary attributes -->
<svg viewBox="0 0 500 120">
  <defs>
    <linearGradient id="cyanBlueGrad">...</linearGradient>
  </defs>
  <!-- Content -->
</svg>
```

**C. Path Simplification**
- Combine adjacent paths
- Use relative coordinates where possible
- Remove precision beyond 2 decimal places

---

### 2. PNG Optimization

#### Current State
- `logo192.png`: 5,347 bytes
- `logo512.png`: 9,664 bytes
- `tanstack-circle-logo.png`: 265,387 bytes

#### Optimization Techniques

**A. Lossless Compression (optipng)**
```bash
# Install optipng
brew install optipng

# Optimize with maximum compression
optipng -o7 public/logo192.png
optipng -o7 public/logo512.png
optipng -o7 public/tanstack-circle-logo.png
```

**B. Lossy Compression (pngquant)**
```bash
# Install pngquant
brew install pngquant

# Compress with quality 80-90
pngquant --quality=80-90 --speed=1 --force public/logo192.png
pngquant --quality=80-90 --speed=1 --force public/logo512.png
pngquant --quality=80-90 --speed=1 --force public/tanstack-circle-logo.png
```

**Expected Savings:**
- Lossless: 10-30% reduction
- Lossy: 50-70% reduction (with minimal visual quality loss)

**C. WebP Conversion**
```bash
# Install cwebp
brew install webp

# Convert PNG to WebP
cwebp -q 85 public/logo192.png -o public/logo192.webp
cwebp -q 85 public/logo512.png -o public/logo512.webp
cwebp -q 85 public/tanstack-circle-logo.png -o public/tanstack-circle-logo.webp
```

**HTML with WebP Fallback:**
```html
<picture>
  <source srcset="/logo192.webp" type="image/webp" />
  <img src="/logo192.png" alt="Logo" width="192" height="192" />
</picture>
```

---

### 3. Responsive Images

Use `srcset` and `sizes` attributes to serve appropriate sizes:

```html
<img
  src="logo512.png"
  srcset="
    logo192.png 192w,
    logo512.png 512w
  "
  sizes="(max-width: 512px) 192px, 512px"
  alt="Via-gent Logo"
/>
```

---

### 4. Icon Optimization

#### Favicon Strategy

Create a modern favicon set:
```
favicon.ico           # Legacy browser support (32x32)
apple-touch-icon.png  # iOS home screen (180x180)
favicon-16.png        # Browser tab (16x16)
favicon-32.png        # Browser tab (32x32)
mstile-150.png        # Windows tiles (150x150)
android-chrome-192.png # Android (192x192)
android-chrome-512.png # Android (512x512)
```

**Generation Command:**
```bash
# Using ImageMagick
convert logo512.png -resize 16x16 favicon-16.png
convert logo512.png -resize 32x32 favicon-32.png
convert logo512.png -resize 180x180 apple-touch-icon.png
convert logo512.png -resize 150x150 mstile-150.png
convert logo512.png -resize 192x192 android-chrome-192.png
convert logo512.png -resize 512x512 android-chrome-512.png
```

**HTML Integration:**
```html
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="mask-icon" href="/favicon-32.png" color="#06b6d4" />
```

---

### 5. Cache Strategy

Configure appropriate cache headers:

#### Netlify (_headers)
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable

/*.svg
  Cache-Control: public, max-age=31536000, immutable

/manifest.json
  Cache-Control: public, max-age=86400
```

#### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    {
      name: 'cache-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          if (url.match(/\.(png|svg|ico|webp)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
          next();
        });
      }
    }
  ]
});
```

---

### 6. Lazy Loading

For below-the-fold images:

```tsx
import { useState, useEffect } from 'react';

function LazyImage({ src, alt, width, height }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} style={{ width, height, background: '#1a1a1a' }}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}

// Usage
<LazyImage
  src="/tanstack-circle-logo.png"
  alt="TanStack Logo"
  width={600}
  height={600}
/>
```

---

### 7. Preloading Critical Assets

Add preload hints for critical assets:

```html
<head>
  <!-- Preload critical fonts -->
  <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
  
  <!-- Preload critical SVGs -->
  <link rel="preload" href="/via-gent-logo.svg" as="image" type="image/svg+xml" />
  
  <!-- Preload critical JS -->
  <link rel="preload" href="/app.js" as="script" />
</head>
```

---

### 8. Asset Versioning

Use content hashing for cache busting:

```
# Before
/public/logo192.png

# After (with hash)
/public/logo-abc123def456.png

# Reference in HTML
<img src="/logo-abc123def456.png" />
```

**Vite Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|ico)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
  },
});
```

---

## Performance Budget

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Total Assets Size | < 100KB | 320KB | ❌ Exceeds |
| First Contentful Paint | < 1.5s | ~1.2s | ✅ Pass |
| Largest Contentful Paint | < 2.5s | ~1.8s | ✅ Pass |
| Time to Interactive | < 3.5s | ~2.5s | ✅ Pass |

---

## Optimization Checklist

- [ ] Run SVGO on all SVG files
- [ ] Compress PNG files with optipng
- [ ] Convert PNG to WebP with fallbacks
- [ ] Create modern favicon set
- [ ] Add maskable icon purpose
- [ ] Configure cache headers
- [ ] Implement asset versioning
- [ ] Add preload hints for critical assets
- [ ] Lazy load below-fold images
- [ ] Use srcset for responsive images
- [ ] Set up performance monitoring

---

## Expected Results

After implementing all optimizations:

| Asset | Current | Optimized | Savings |
|-------|---------|-----------|---------|
| tanstack-circle-logo.png | 265KB | ~80KB (WebP) | 70% |
| logo512.png | 9.7KB | ~4KB (WebP) | 59% |
| logo192.png | 5.3KB | ~2KB (WebP) | 62% |
| via-gent-logo.svg | 13KB | ~8KB (SVGO) | 38% |
| **Total** | **320KB** | **~100KB** | **69%** |

---

## Monitoring and Maintenance

### Performance Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# WebPageTest
# https://www.webpagetest.org/

# GTmetrix
# https://gtmetrix.com/
```

### Continuous Monitoring
1. Set up Lighthouse CI in CI/CD pipeline
2. Monitor Core Web Vitals in production
3. Set up alerts for performance regressions
4. Regular asset audits (quarterly)

---

## Known Issues and Limitations

1. **tanstack-circle-logo.png:** Large file size (265KB) is primary optimization target
2. **SVG Animations:** Animated SVGs may impact CPU on low-end devices
3. **Browser Compatibility:** WebP has ~96% global support but needs fallbacks
4. **Monaco Editor:** Requires inline styles, limiting CSP hardening

---

## Future Improvements

1. Implement AVIF format for even better compression
2. Add image CDN (Cloudinary, imgix, etc.)
3. Implement responsive image serving based on device pixel ratio
4. Add lazy hydration for React components
5. Implement critical CSS extraction and inline
