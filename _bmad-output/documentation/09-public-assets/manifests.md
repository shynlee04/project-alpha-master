# Web Manifest Documentation

## Overview

This document covers the web manifest and configuration files that control how the application is presented to browsers, web crawlers, and installed Progressive Web App (PWA) experiences.

## Configuration Files

### manifest.json

**File:** `public/manifest.json`  
**Size:** 498 bytes  
**Format:** JSON

**Purpose:** PWA manifest file that defines how the application should be installed and behave on user devices.

**Current Content:**
```json
{
  "short_name": "TanStack App",
  "name": "Create TanStack App Sample",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
```

**Field Documentation:**

| Field | Current Value | Purpose |
|-------|--------------|---------|
| `short_name` | "TanStack App" | Short name for home screen (12 chars max recommended) |
| `name` | "Create TanStack App Sample" | Full name for app store listings |
| `icons` | Array of icon objects | Available icons with sizes and types |
| `start_url` | "." | Entry point URL after installation |
| `display` | "standalone" | Display mode (standalone removes browser UI) |
| `theme_color` | "#000000" | Status bar and toolbar color |
| `background_color` | "#ffffff" | Background color during loading |

**Issues Identified:**

1. **Generic Names:** "TanStack App" and "Create TanStack App Sample" are placeholder values
2. **Missing Icons:** No 180x180 icon for iOS
3. **Missing Categories:** No categories or description
4. **Missing Orientation:** No preferred orientation specified
5. **Missing Scope:** No navigation scope defined

**Recommended Updates:**
```json
{
  "short_name": "Via-gent",
  "name": "Via-gent - Browser-Based IDE with AI Agents",
  "description": "A local-first browser-based IDE featuring AI agent integration, real-time collaboration, and intelligent code assistance.",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "180x180",
      "purpose": "any"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "orientation": "landscape-primary",
  "theme_color": "#020617",
  "background_color": "#020617",
  "categories": ["development", "productivity", "education"],
  "scope": "/",
  "lang": "en-US"
}
```

**HTML Integration:**
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#020617" />
```

---

### robots.txt

**File:** `public/robots.txt`  
**Size:** 67 bytes  
**Format:** Plain text

**Purpose:** Controls web crawler access to the site.

**Current Content:**
```
# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:
```

**Field Documentation:**

| Directive | Value | Purpose |
|-----------|-------|---------|
| `User-agent` | * | Applies to all web crawlers |
| `Disallow` | (empty) | No restrictions - all content is crawlable |

**Analysis:**

The current configuration allows full access to all web crawlers. This is appropriate for:
- Public documentation
- Marketing pages
- Open source projects

**Recommendations:**

For a local-first IDE with sensitive user data:

1. **Add Disallow for Sensitive Paths:**
```
User-agent: *
Disallow: /api/
Disallow: /auth/
Disallow: /user/
```

2. **Add Sitemap Reference:**
```
Sitemap: https://yourdomain.com/sitemap.xml
```

3. **Add Crawl-Delay for Rate Limiting:**
```
Crawl-delay: 10
```

**Full Recommended Configuration:**
```
# robots.txt for Via-gent
# Local-first IDE with AI agent capabilities

User-agent: *
Disallow: /api/
Disallow: /auth/
Disallow: /user/
Disallow: /settings/
Allow: /

Sitemap: https://via-gent.app/sitemap.xml
Crawl-delay: 10
```

---

### _headers (Netlify Configuration)

**File:** `public/_headers`  
**Size:** 1,192 bytes  
**Format:** Netlify headers configuration

**Purpose:** Configures HTTP headers for security, CORS, and performance.

**Current Content:**
```
# Netlify Headers Configuration
# Comprehensive Security Headers for Via-Gent
# @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
# @see https://owasp.org/www-project-secure-headers/

  /*
  # Cross-Origin Isolation (required for WebContainers/SharedArrayBuffer)
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Resource-Policy: cross-origin
  
  # Security Headers
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  
  # HSTS - Enable strict transport security (1 year)
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  
  # Content Security Policy
  # Note: Uses unsafe-inline for styles (Monaco Editor requirement)
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com wss://*.webcontainer.io https://*.stackblitz.io; frame-src https://*.webcontainer.io https://*.stackblitz.io; worker-src 'self' blob:; child-src 'self' blob:
  ```

**Header Documentation:**

| Header | Value | Purpose |
|--------|-------|---------|
| `Cross-Origin-Opener-Policy` | same-origin | Required for WebContainers |
| `Cross-Origin-Embedder-Policy` | require-corp | Required for SharedArrayBuffer |
| `Cross-Origin-Resource-Policy` | cross-origin | Allows cross-origin resources |
| `X-Frame-Options` | DENY | Prevents clickjacking attacks |
| `X-Content-Type-Options` | nosniff | Prevents MIME type sniffing |
| `Referrer-Policy` | strict-origin-when-cross-origin | Controls referrer information |
| `Permissions-Policy` | camera=(), microphone=(), geolocation=() | Disables sensitive APIs |
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains | Enforces HTTPS |
| `Content-Security-Policy` | Complex policy | Controls resource loading |

**CSP Breakdown:**

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | 'self' | Default fallback to same origin |
| `script-src` | 'self' 'unsafe-inline' | Scripts from self and inline |
| `style-src` | 'self' 'unsafe-inline' | Styles from self and inline |
| `img-src` | 'self' data: https: | Images from self, data URIs, HTTPS |
| `font-src` | 'self' data: | Fonts from self and data URIs |
| `connect-src` | self, googleapis, webcontainer.io | API connections |
| `frame-src` | webcontainer.io, stackblitz.io | Iframe sources |
| `worker-src` | 'self' blob: | Web workers |
| `child-src` | 'self' blob: | Child frames |

**Known Issues:**

1. **Unsafe-inline:** Both script-src and style-src use 'unsafe-inline' which reduces CSP effectiveness. This is required for:
   - Monaco Editor inline styles
   - React SSR hydration
   - Third-party scripts

**Recommendations for CSP Hardening:**

1. Use nonces for inline scripts:
```
Content-Security-Policy: script-src 'self' 'nonce-{random}';
```

2. Move Monaco Editor styles to external stylesheets:
```html
<link href="/monaco-editor.css" rel="stylesheet" />
```

3. Add reporting endpoint:
```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

---

## Manifest Usage Across Application

### Registration

Manifest is registered in the HTML head:
```tsx
// src/app.tsx or similar
function App() {
  return (
    <html>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Root />
      </body>
    </html>
  );
}
```

### Service Worker Registration

For full PWA functionality, register a service worker:
```javascript
// public/sw.js or in application code
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration);
    })
    .catch(error => {
      console.log('SW registration failed:', error);
    });
}
```

---

## Testing Manifests

### Online Validators
- [Web Manifest Validator](https://manifest-validator.netlify.app/)
- [PWA Builder Manifest Checker](https://www.pwabuilder.com/)

### Browser DevTools
1. Open Chrome DevTools
2. Navigate to Application tab
3. Expand "Manifest" section
4. View all parsed manifest properties

### Lighthouse Audit
```bash
npm run lighthouse
# Or use Chrome DevTools > Lighthouse
```

---

## Known Issues and Limitations

1. **Placeholder Names:** manifest.json contains generic TanStack names
2. **Missing Maskable Icons:** Icons don't have `purpose: "any maskable"` for adaptive icons
3. **Unsafe CSP:** Inline scripts/styles reduce security
4. **No Service Worker:** PWA offline capabilities not fully implemented
5. **Missing Categories:** No categories in manifest.json

---

## Future Improvements

### Short-term
1. Update manifest.json with proper branding
2. Add maskable icon purpose
3. Add iOS 180x180 icon
4. Update CSP with nonces

### Long-term
1. Implement full PWA with service worker
2. Add push notifications
3. Implement background sync
4. Add share target API
5. Implement file handling API
