# Static Assets Documentation

## Overview

The `public/` directory serves as the root for all static assets that are served directly by the web server. These assets include brand logos, icons, illustrations, and configuration files that are essential for the application's identity, PWA functionality, and SEO optimization.

## Asset Categories

### Brand Logos

#### via-gent-logo.svg
**File:** `public/via-gent-logo.svg`  
**Size:** 13,247 bytes  
**Dimensions:** 500x120 pixels  
**Format:** Scalable Vector Graphics (SVG)

**Purpose:** Primary brand logo for the Via-gent application. Features an animated hexagon IDE symbol with AI brain visualization.

**Design Elements:**
- Hexagonal frame representing IDE environment
- Animated neural network core with rotating rings
- Gradient color scheme (cyan to blue: #06b6d4 → #3b82f6)
- "Via-gent" typography with animated underline
- Status indicators (AI, Code, Terminal, Sync)
- 8-bit inspired tech accents

**Usage Examples:**
```tsx
// React component usage
import viaGentLogo from '/via-gent-logo.svg';

function Header() {
  return (
    <header>
      <img src={viaGentLogo} alt="Via-gent Logo" />
    </header>
  );
}
```

**CSS Styling:**
```css
.logo {
  height: 48px;
  width: auto;
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.5));
}
```

---

#### tanstack-word-logo-white.svg
**File:** `public/tanstack-word-logo-white.svg`  
**Size:** 15,002 bytes  
**Dimensions:** 3178x660 pixels  
**Format:** Scalable Vector Graphics (SVG)

**Purpose:** TanStack framework wordmark displayed in white. Used for framework attribution in the application footer or about sections.

**Design Elements:**
- White fill color for dark backgrounds
- Professional typography
- Vector-based for crisp rendering at any size

**Usage Examples:**
```tsx
import tanstackLogo from '/tanstack-word-logo-white.svg';

function Footer() {
  return (
    <footer>
      <span>Powered by</span>
      <img src={tanstackLogo} alt="TanStack" height="24" />
    </footer>
  );
}
```

---

#### tanstack-circle-logo.png
**File:** `public/tanstack-circle-logo.png`  
**Size:** 265,387 bytes  
**Dimensions:** 600x600 pixels  
**Format:** PNG (RGBA)

**Purpose:** TanStack circular logo for standalone use. Used when a square logo format is required.

**Design Elements:**
- Circular composition
- Transparent background
- High-resolution for retina displays

**Usage Examples:**
```tsx
import tanstackCircleLogo from '/tanstack-circle-logo.png';

function Badge() {
  return (
    <div className="badge">
      <img src={tanstackCircleLogo} alt="TanStack" width="32" height="32" />
    </div>
  );
}
```

---

### Icons

#### favicon.ico
**File:** `public/favicon.ico`  
**Size:** 3,870 bytes  
**Format:** ICO (multi-resolution)

**Purpose:** Legacy browser favicon for browser tabs, bookmarks, and history. Contains multiple size variants.

**Supported Sizes:** 16x16, 24x24, 32x32, 64x64

**Usage:** Automatically loaded by browsers from the root directory. No explicit HTML required.

**HTML Integration:**
```html
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" href="/favicon.ico" sizes="16x16" />
<link rel="icon" href="/favicon.ico" sizes="32x32" />
<link rel="icon" href="/favicon.ico" sizes="64x64" />
```

---

#### logo192.png
**File:** `public/logo192.png`  
**Size:** 5,347 bytes  
**Dimensions:** 192x192 pixels  
**Format:** PNG (8-bit colormap)

**Purpose:** PWA icon for Android devices, iOS home screen icons, and general application icon.

**Usage:** Referenced in `manifest.json` for PWA installation.

**HTML Integration:**
```html
<link rel="apple-touch-icon" href="/logo192.png" />
```

---

#### logo512.png
**File:** `public/logo512.png`  
**Size:** 9,664 bytes  
**Dimensions:** 512x512 pixels  
**Format:** PNG (8-bit colormap)

**Purpose:** High-resolution PWA icon for splash screens, app stores, and installations where larger icons are required.

**Usage:** Referenced in `manifest.json` for PWA installation and splash screen generation.

---

### Illustrations (8-bit Style)

#### agent-team.svg
**File:** `public/assets/agent-team.svg`  
**Size:** 2,450 bytes  
**Dimensions:** 200x200 pixels  
**Format:** Scalable Vector Graphics (SVG)

**Purpose:** Visual representation of a multi-agent team system. Used in agent configuration or team management interfaces.

**Design Elements:**
- Central orchestrator agent (orange gradient)
- Left planner agent (cyan gradient)
- Right coder agent (purple gradient)
- Connection lines showing agent communication
- Data flow indicators
- 8-bit pixel art style

**Usage Examples:**
```tsx
import agentTeamIllustration from '/assets/agent-team.svg';

function AgentTeamView() {
  return (
    <div className="agent-team">
      <img 
        src={agentTeamIllustration} 
        alt="Multi-agent team illustration" 
        width={200} 
        height={200} 
      />
    </div>
  );
}
```

**Color Scheme:**
| Agent | Primary Color | Hex Code |
|-------|--------------|----------|
| Orchestrator | Orange | #f97316 |
| Planner | Cyan | #2dd4bf |
| Coder | Purple | #a78bfa |

---

#### knowledge-hub.svg
**File:** `public/assets/knowledge-hub.svg`  
**Size:** 1,712 bytes  
**Dimensions:** 200x200 pixels  
**Format:** Scalable Vector Graphics (SVG)

**Purpose:** Visual representation of knowledge base/brain functionality. Used in knowledge management interfaces.

**Design Elements:**
- Brain-shaped knowledge container (purple gradient)
- Neural connection lines
- Connection nodes
- Glow effect background
- 8-bit pixel art style

**Usage Examples:**
```tsx
import knowledgeHubIllustration from '/assets/knowledge-hub.svg';

function KnowledgeView() {
  return (
    <div className="knowledge-hub">
      <img 
        src={knowledgeHubIllustration} 
        alt="Knowledge hub illustration" 
        width={200} 
        height={200} 
      />
    </div>
  );
}
```

---

#### empty-project.svg
**File:** `public/assets/empty-project.svg`  
**Size:** 1,125 bytes  
**Dimensions:** 200x200 pixels  
**Format:** Scalable Vector Graphics (SVG)

**Purpose:** Empty state illustration for project creation. Used when no projects exist or when prompting user to create a new project.

**Design Elements:**
- Folder icon (orange gradient)
- Plus symbol for adding new projects
- Pixel shadow effects
- 8-bit pixel art style

**Usage Examples:**
```tsx
import emptyProjectIllustration from '/assets/empty-project.svg';

function EmptyState() {
  return (
    <div className="empty-state">
      <img 
        src={emptyProjectIllustration} 
        alt="Empty project illustration" 
        width={200} 
        height={200} 
      />
      <h2>No projects yet</h2>
      <button>Create your first project</button>
    </div>
  );
}
```

---

## Asset Optimization Strategies

### SVG Optimization
All SVG assets are already optimized with:
- Minimal whitespace
- Efficient path definitions
- Reusable gradient definitions
- ViewBox for responsive scaling

**Recommendations for Future SVGs:**
- Use SVGO for additional optimization
- Remove unnecessary metadata
- Simplify complex paths
- Use symbol elements for repeated content

### PNG Optimization
PNG assets are stored in uncompressed format for quality. For production:

1. **Lossless Compression:** Use optipng or pngquant
2. **WebP Conversion:** Consider WebP for modern browsers
3. **Responsive Images:** Use srcset for different screen sizes

**Example compression command:**
```bash
optipng -o7 logo512.png
pngquant --quality=80-90 logo192.png
```

### Icon Sprite Sheet
For frequently used icons, consider creating a sprite sheet:
```html
<svg class="icon">
  <use href="/sprite.svg#icon-name" />
</svg>
```

---

## Asset Dependencies

### Framework Dependencies
- **TanStack:** Via-gent is built using TanStack (React Query, Router, etc.)
- **PWA:** Uses manifest.json for progressive web app capabilities

### Browser Support
| Asset Type | Chrome | Firefox | Safari | Edge |
|------------|--------|---------|--------|------|
| SVG | ✓ | ✓ | ✓ | ✓ |
| PNG | ✓ | ✓ | ✓ | ✓ |
| ICO | ✓ | ✓ | ✓ | ✓ |
| PWA Manifest | ✓ | ✓ | ✓ | ✓ |

---

## Developer Notes

### Adding New Assets

1. Place files in `public/` or `public/assets/`
2. Use kebab-case for file names
3. Optimize before committing (SVGO, optipng)
4. Update `manifest.json` if adding icons
5. Document in this file

### Asset Naming Conventions
- **Logos:** `{brand-name}-{type}.{ext}`
- **Icons:** `{purpose}-{size}.{ext}` (e.g., `logo192.png`)
- **Illustrations:** `{context}-{state}.{ext}` (e.g., `empty-project.svg`)

### Version Control
- All assets are tracked in git
- Large binary files may impact repository size
- Consider Git LFS for files over 1MB

### Cache Strategy
Assets should be cached with immutable headers:
```nginx
location ~* \.(ico|png|svg|jpg)$ {
  expires 1y;
  cache-control: public, immutable;
}
```

---

## Known Issues and Limitations

1. **Favicon Sizes:** The current favicon.ico may not include all modern sizes (180x180 for iOS, 192x192/512x512 for Android). Consider adding these sizes.

2. **PNG File Size:** tanstack-circle-logo.png (265KB) is relatively large. Consider optimization or WebP conversion.

3. **SVG Animations:** via-gent-logo.svg contains CSS animations that may impact performance on low-end devices.

4. **Monochrome Support:** No monochrome variants of logos for print or low-color displays.

5. **Accessibility:** Some SVG files lack title/desc elements for screen readers.

---

## Future Improvements

1. Add 180x180 and 310x310 icons for PWA
2. Convert PNG assets to WebP with fallbacks
3. Add accessibility labels to all SVG files
4. Create dark/light theme variants of illustrations
5. Generate responsive image srcset attributes
6. Add SVG sprite sheet for icons
7. Implement asset versioning (hash-based URLs)
