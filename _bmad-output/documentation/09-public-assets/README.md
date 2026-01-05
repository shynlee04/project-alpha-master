# Public Assets Documentation

## Overview

This documentation covers the `public/` directory, which contains all static assets served directly by the web server. These assets are critical for the application's identity, PWA functionality, and SEO optimization.

## Directory Structure

```
public/
├── _headers                          (1,192 bytes) - Netlify security headers configuration
├── robots.txt                        (67 bytes) - Web crawler access control
├── manifest.json                     (498 bytes) - PWA manifest for installation
├── favicon.ico                       (3,870 bytes) - Legacy browser favicon (multi-resolution)
├── logo192.png                       (5,347 bytes) - PWA icon 192x192 PNG
├── logo512.png                       (9,664 bytes) - PWA icon 512x512 PNG
├── via-gent-logo.svg                 (13,247 bytes) - Primary brand logo (500x120 SVG)
├── tanstack-word-logo-white.svg      (15,002 bytes) - TanStack wordmark (3178x660 SVG)
├── tanstack-circle-logo.png          (265,387 bytes) - TanStack circular logo (600x600 PNG)
└── assets/
    ├── agent-team.svg                (2,450 bytes) - Multi-agent illustration (200x200)
    ├── knowledge-hub.svg             (1,712 bytes) - Knowledge hub illustration (200x200)
    └── empty-project.svg             (1,125 bytes) - Empty state illustration (200x200)

Total: 12 files, 320,387 bytes (~313 KB)
```

## Asset Categories

### Configuration Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `_headers` | Netlify HTTP headers | Security headers, CORS, CSP |
| `robots.txt` | Crawler access control | Allows all crawlers |
| `manifest.json` | PWA configuration | Icons, display mode, theme |

### Icons

| File | Size | Dimensions | Usage |
|------|------|------------|-------|
| `favicon.ico` | 3.9KB | 16-64px | Browser tabs, bookmarks |
| `logo192.png` | 5.3KB | 192x192 | PWA icons, Android |
| `logo512.png` | 9.7KB | 512x512 | PWA splash screens |

### Logos

| File | Size | Dimensions | Description |
|------|------|------------|-------------|
| `via-gent-logo.svg` | 13KB | 500x120 | Primary brand logo with animations |
| `tanstack-word-logo-white.svg` | 15KB | 3178x660 | TanStack framework wordmark |
| `tanstack-circle-logo.png` | 265KB | 600x600 | TanStack circular logo |

### Illustrations (8-bit Style)

| File | Size | Dimensions | Usage |
|------|------|------------|-------|
| `agent-team.svg` | 2.5KB | 200x200 | Multi-agent system visualization |
| `knowledge-hub.svg` | 1.7KB | 200x200 | Knowledge management UI |
| `empty-project.svg` | 1.1KB | 200x200 | Empty state placeholder |

## Key Files

### manifest.json

The PWA manifest defines how the application installs on user devices. Current configuration includes:

- **Display mode:** `standalone` (removes browser UI)
- **Theme color:** `#000000`
- **Background color:** `#ffffff`
- **Icons:** Three sizes (64, 192, 512 pixels)

**Known Issues:**
- Generic placeholder names ("TanStack App")
- Missing 180x180 iOS icon
- No categories or description

See [manifests.md](./manifests.md) for detailed documentation.

### _headers

Configures HTTP headers for:

- **Cross-Origin Isolation:** Required for WebContainers
- **Security Headers:** X-Frame-Options, X-Content-Type-Options
- **CSP:** Content Security Policy (with inline scripts for Monaco Editor)
- **HSTS:** Enforces HTTPS for 1 year

See [manifests.md](./manifests.md) for full header documentation.

### via-gent-logo.svg

The primary brand logo featuring:

- Animated hexagon IDE symbol
- Neural network core with rotating rings
- "Via-gent" typography with gradient
- Status indicators (AI, Code, Terminal, Sync)
- 8-bit inspired tech accents

## Usage Examples

### Including Assets in Components

```tsx
// Importing logos
import viaGentLogo from '/via-gent-logo.svg';
import tanstackLogo from '/tanstack-circle-logo.png';

function Header() {
  return (
    <header>
      <img src={viaGentLogo} alt="Via-gent" height="48" />
      <img src={tanstackLogo} alt="TanStack" width="32" />
    </header>
  );
}
```

### Using Illustrations

```tsx
import agentTeamIllustration from '/assets/agent-team.svg';
import emptyProjectIllustration from '/assets/empty-project.svg';

function AgentView() {
  return <img src={agentTeamIllustration} alt="Agent team" />;
}

function EmptyState() {
  return (
    <div>
      <img src={emptyProjectIllustration} alt="Empty project" />
      <p>No projects yet</p>
    </div>
  );
}
```

### PWA Icons

```html
<head>
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/logo192.png" />
  <meta name="theme-color" content="#000000" />
</head>
```

## Optimization

The largest file is `tanstack-circle-logo.png` at 265KB (82.9% of total). Key optimization strategies include:

1. **SVG Optimization:** Use SVGO for path simplification
2. **PNG Compression:** Lossless (optipng) or lossy (pngquant)
3. **WebP Conversion:** ~50-70% size reduction
4. **Caching:** Configure immutable cache headers
5. **Lazy Loading:** Defer non-critical images

See [optimization.md](./optimization.md) for detailed strategies.

## Asset Dependencies

### Framework
- **TanStack:** Framework attribution required
- **PWA:** Uses manifest.json for installation

### Browser Support
| Asset | Chrome | Firefox | Safari | Edge |
|-------|--------|---------|--------|------|
| SVG | ✓ | ✓ | ✓ | ✓ |
| PNG | ✓ | ✓ | ✓ | ✓ |
| ICO | ✓ | ✓ | ✓ | ✓ |
| PWA | ✓ | ✓ | ✓ | ✓ |

## Developer Notes

### Adding New Assets

1. Place files in `public/` or `public/assets/`
2. Use kebab-case for file names
3. Optimize before committing (SVGO, optipng)
4. Update `manifest.json` if adding icons
5. Document in this file

### Naming Conventions
- **Logos:** `{brand-name}-{type}.{ext}`
- **Icons:** `{purpose}-{size}.{ext}` (e.g., `logo192.png`)
- **Illustrations:** `{context}-{state}.{ext}` (e.g., `empty-project.svg`)

### Version Control
- All assets tracked in git
- Large files impact repository size
- Consider Git LFS for files over 1MB

### Cache Strategy
```nginx
location ~* \.(ico|png|svg|jpg)$ {
  expires 1y;
  cache-control: public, immutable;
}
```

## Known Issues

1. **Favicon Sizes:** Missing modern sizes (180x180 for iOS)
2. **Large PNG:** tanstack-circle-logo.png needs optimization
3. **SVG Animations:** May impact performance on low-end devices
4. **Placeholder Names:** manifest.json needs proper branding
5. **CSP Security:** Inline scripts/styles reduce effectiveness

## Future Improvements

1. Add 180x180 and 310x310 icons for PWA
2. Convert PNG to WebP with fallbacks
3. Add accessibility labels to SVGs
4. Create dark/light theme variants
5. Implement asset versioning
6. Add service worker for offline support
7. Implement image CDN for dynamic optimization

## Documentation Files

| File | Description |
|------|-------------|
| `scan-inventory.json` | Structured scan data with file metadata |
| `file-structure.txt` | Tree view of public directory |
| `assets.md` | Detailed static asset documentation |
| `manifests.md` | Web manifest and configuration docs |
| `optimization.md` | Asset optimization strategies |
| `README.md` | This file (English) |
| `README-VI.md` | Vietnamese translation |

## References

- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Builder](https://www.pwabuilder.com/)
- [SVGO](https://github.com/svg/svgo)
- [WebP](https://developers.google.com/speed/webp)
- [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/)
