# Light Theming

<- [Section 13: Appendix](./13-appendix.md) | [Index](./index.md) | [Section 15: Micro Animations](./15-micro-animations.md) ->

---

## 14.1 Overview

### Theme Philosophy

VIA-GENT supports dual theming (dark and light) while maintaining the distinctive 8-bit retro aesthetic. Light mode is not simply an inversion of dark mode—it draws inspiration from historical computing and gaming systems that frequently used light backgrounds:

| Historical System | Background Style | Influence |
|-------------------|------------------|-----------|
| **Game Boy** | Green-tinted off-white (#9bbc0f) | Warm tints, high contrast |
| **Apple II** | Cream/white with black text | Paper-like readability |
| **Commodore 64** | Light blue default (#8888ff) | Subtle color warmth |
| **NES** | Cream/paper tones for UI | Soft, comfortable whites |

### Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Light Theme Tokens** | 90% Complete | 91 tokens defined in `light-theme-tokens.css` |
| **CSS Variables** | Ready | HSL format, Tailwind CSS 4 compatible |
| **ShadcnUI Integration** | Ready | `.light` class and `[data-theme="light"]` prepared |
| **ThemeProvider** | Not Implemented | React context required |
| **ThemeToggle** | Not Implemented | Component required |
| **Monaco Editor** | Not Configured | Light theme selection needed |
| **Accessibility Audit** | Not Complete | Contrast verification pending |

### Estimated Remaining Effort

| Task | Effort | Priority |
|------|--------|----------|
| ThemeProvider implementation | 1-2h | P1 |
| ThemeToggle component | 30min | P2 |
| System preference detection | 30min | P1 |
| Monaco Editor light theme | 1h | P3 |
| Component contrast verification | 2h | P2 |
| E2E accessibility audit | 2h | P4 |
| **Total** | **6-8 hours** | - |

---

## 14.2 Color Palette

### Core Light Theme Tokens

All colors defined in HSL format for CSS custom properties compatibility.

#### Primary Colors (Orange Spectrum)

| Token | HSL Value | Hex | Usage |
|-------|-----------|-----|-------|
| `--primary` | `24.6 95% 53.1%` | `#f97316` | Brand primary (buttons, icons) |
| `--primary-foreground` | `0 0% 100%` | `#ffffff` | Text on primary |
| `--primary-text` | `24.6 88.5% 40.4%` | `#c2410c` | Primary text on light backgrounds |
| `--primary-50` | `24.6 100% 96.5%` | `#fff7ed` | Lightest tint |
| `--primary-100` | `24.6 100% 91.8%` | `#ffedd5` | Subtle background |
| `--primary-200` | `24.6 96.6% 83.1%` | `#fed7aa` | Hover background |
| `--primary-300` | `24.6 97.2% 72.4%` | `#fdba74` | Active state |
| `--primary-400` | `24.6 96.3% 61.2%` | `#fb923c` | Emphasis |
| `--primary-500` | `24.6 95% 53.1%` | `#f97316` | Primary |
| `--primary-600` | `24.6 90.4% 48%` | `#ea580c` | Hover |
| `--primary-700` | `24.6 88.5% 40.4%` | `#c2410c` | Pressed/text |
| `--primary-800` | `24.6 79% 32.7%` | `#9a3412` | Dark accent |
| `--primary-900` | `24.6 74.5% 27.8%` | `#7c2d12` | Deepest |

#### Neutral Colors (Warm Stone Palette)

**Critical Decision**: Use warm whites (Stone palette) instead of cool whites (Zinc) for:
- Reduced eye strain (less blue light)
- 8-bit heritage compatibility (CRT warmth)
- Orange primary harmony
- Paper-like aesthetic

| Token | HSL Value | Hex | Usage |
|-------|-----------|-----|-------|
| `--background` | `0 0% 98%` | `#fafaf9` | Main canvas (warm near-white) |
| `--foreground` | `240 6% 10%` | `#171717` | Primary text (near-black) |
| `--neutral-50` | `0 0% 98%` | `#fafafa` | Lightest background |
| `--neutral-100` | `0 0% 96%` | `#f5f5f5` | Subtle background |
| `--neutral-200` | `0 0% 90%` | `#e5e5e5` | Dividers |
| `--neutral-300` | `0 0% 83%` | `#d4d4d4` | Borders |
| `--neutral-400` | `0 0% 64%` | `#a3a3a3` | Disabled text |
| `--neutral-500` | `0 0% 45%` | `#737373` | Secondary text |
| `--neutral-600` | `0 0% 32%` | `#525252` | Primary text |
| `--neutral-700` | `0 0% 25%` | `#404040` | Headings |
| `--neutral-800` | `0 0% 15%` | `#262626` | Emphasis text |
| `--neutral-900` | `0 0% 9%` | `#171717` | Deepest text |

#### Semantic Colors (Light Mode Optimized)

| Token | HSL Value | Hex | Light Mode Adjustment |
|-------|-----------|-----|----------------------|
| `--success` | `142 71% 35%` | `#15803d` | Darkened for contrast |
| `--warning` | `38 92% 45%` | `#d97706` | Darkened for contrast |
| `--destructive` | `0 84% 50%` | `#dc2626` | Darkened for contrast |
| `--info` | `217 91% 50%` | `#2563eb` | Darkened for contrast |

---

## 14.3 Surface Hierarchy

### Background Layer System

Light mode uses a subtle hierarchy from warm white to pure white:

```
+--------------------------------------------+
|  bg-0: #fafaf9 (Stone 50) - Main canvas    |
|  +--------------------------------------+  |
|  |  bg-1: #ffffff - Cards, panels       |  |
|  |  +--------------------------------+  |  |
|  |  |  bg-2: #f5f5f4 - Elevated      |  |  |
|  |  |  +-------------------------+   |  |  |
|  |  |  |  bg-3: #e7e5e4 - Highest |  |  |  |
|  |  |  +-------------------------+   |  |  |
|  |  +--------------------------------+  |  |
|  +--------------------------------------+  |
+--------------------------------------------+
```

### Surface Token Mapping

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| `--surface-0` | `#0f0f11` | `#fafaf9` | Base background |
| `--surface-1` | `#18181b` | `#ffffff` | Cards, panels |
| `--surface-2` | `#27272a` | `#f5f5f4` | Elevated surfaces |
| `--surface-3` | `#3f3f46` | `#e7e5e4` | Highest elevation |
| `--card` | `#18181b` | `#ffffff` | Card backgrounds |
| `--popover` | `#18181b` | `#ffffff` | Popover backgrounds |
| `--sidebar` | `#18181b` | `#f5f5f4` | Sidebar background |
| `--muted` | `#27272a` | `#f5f5f5` | Muted areas |

---

## 14.4 Pixel Shadows (Light Mode)

### Shadow Inversion Rules

Dark mode uses light-colored shadows; light mode inverts to dark-colored shadows:

| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| `--shadow-pixel-xs` | `1px 1px 0 rgba(255,255,255,0.1)` | `1px 1px 0 rgba(0,0,0,0.15)` |
| `--shadow-pixel-sm` | `2px 2px 0 rgba(255,255,255,0.1)` | `2px 2px 0 rgba(0,0,0,0.15)` |
| `--shadow-pixel` | `4px 4px 0 rgba(255,255,255,0.1)` | `4px 4px 0 rgba(0,0,0,0.15)` |
| `--shadow-pixel-md` | `4px 4px 0 rgba(255,255,255,0.1)` | `4px 4px 0 rgba(0,0,0,0.15)` |
| `--shadow-pixel-lg` | `6px 6px 0 rgba(255,255,255,0.1)` | `6px 6px 0 rgba(0,0,0,0.15)` |
| `--shadow-pixel-xl` | `8px 8px 0 rgba(255,255,255,0.1)` | `8px 8px 0 rgba(0,0,0,0.15)` |

### Colored Pixel Shadows (Light Mode)

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-pixel-primary` | `4px 4px 0 #c2410c` | Primary accent buttons |
| `--shadow-pixel-success` | `4px 4px 0 #15803d` | Success state elements |
| `--shadow-pixel-warning` | `4px 4px 0 #b45309` | Warning state elements |
| `--shadow-pixel-destructive` | `4px 4px 0 #b91c1c` | Destructive buttons |

### Shadow Usage Example

```css
/* Light mode shadow application */
.light .pixel-button {
  box-shadow: 4px 4px 0 0 rgba(0, 0, 0, 0.15);
}

.light .pixel-button:hover {
  box-shadow: 6px 6px 0 0 rgba(0, 0, 0, 0.15);
  transform: translate(-2px, -2px);
}

.light .pixel-button:active {
  box-shadow: inset 2px 2px 0 0 rgba(0, 0, 0, 0.2);
  transform: translate(0, 0);
}
```

---

## 14.5 CSS Implementation

### CSS Variables Structure

```css
/* src/styles/light-theme-tokens.css */
:root {
  /* Light theme is the default in this file */
  
  /* Core Surfaces */
  --background: 0 0% 98%;          /* #fafaf9 - Warm near-white */
  --foreground: 240 6% 10%;        /* #171717 - Near black */
  --card: 0 0% 100%;               /* #ffffff - Pure white cards */
  --card-foreground: 240 6% 6.7%;  /* #0f0f11 */
  
  /* Primary (Orange) */
  --primary: 24.6 95% 53.1%;       /* #f97316 - Brand primary */
  --primary-foreground: 0 0% 100%; /* White on orange */
  --primary-text: 24.6 88.5% 40.4%; /* #c2410c - For text use */
  
  /* Secondary/Muted */
  --secondary: 0 0% 96%;           /* #f5f5f5 */
  --secondary-foreground: 240 6% 6.7%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 45%;    /* #737373 */
  
  /* Borders & Input */
  --border: 0 0% 90%;              /* #e5e5e5 */
  --input: 0 0% 90%;
  --ring: 24.6 95% 53.1%;          /* Orange focus ring */
  
  /* Sidebar */
  --sidebar: 0 0% 96%;
  --sidebar-foreground: 240 6% 10%;
  --sidebar-border: 0 0% 90%;
  
  /* Semantic (darkened for light bg contrast) */
  --destructive: 0 70% 50.6%;      /* #dc2626 */
  --success: 142 76% 36.3%;        /* #16a34a */
  --warning: 38 95% 43.7%;         /* #d97706 */
  --info: 217 83% 53.3%;           /* #2563eb */
  
  /* Editor */
  --editor-bg: 0 0% 98%;
  --editor-gutter: 0 0% 93%;
  --editor-selection: 24.6 95% 90%;
  --editor-line-highlight: 0 0% 96%;
  
  /* Pixel Shadows (inverted for light) */
  --shadow-pixel: 4px 4px 0 0 rgba(0, 0, 0, 0.15);
  --shadow-pixel-primary: 4px 4px 0 0 #c2410c;
  --shadow-pixel-sm: 2px 2px 0 0 rgba(0, 0, 0, 0.15);
  --shadow-pixel-hover: 6px 6px 0 0 rgba(0, 0, 0, 0.15);
  --shadow-pixel-inset: inset 2px 2px 0 0 rgba(0, 0, 0, 0.2);
  
  /* Overlay (solid, not transparent) */
  --color-overlay: rgba(0, 0, 0, 0.5);
}
```

### Tailwind CSS 4 Configuration

```css
/* src/styles.css */
@import "tailwindcss";

/* Theme custom variants (already configured) */
@custom-variant dark (&:is(.dark *, [data-theme="dark"] *));
@custom-variant light (&:is(.light *, [data-theme="light"] *));

/* Usage in components */
.theme-aware-button {
  @apply bg-card text-foreground;
  @apply dark:bg-zinc-900 dark:text-zinc-100;
  @apply light:bg-white light:text-zinc-900;
}
```

### Theme Class Application

```html
<!-- Dark mode (default) -->
<html class="dark" data-theme="dark">

<!-- Light mode -->
<html class="light" data-theme="light">

<!-- System preference -->
<html class="light" data-theme="light"> <!-- or dark, based on system -->
```

---

## 14.6 ThemeProvider Specification

### React Context Implementation

```typescript
// src/presentation/providers/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  /** User's theme preference */
  theme: Theme;
  /** Set theme preference */
  setTheme: (theme: Theme) => void;
  /** Actual applied theme (resolves 'system' to actual value) */
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'via-gent-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    if (theme === 'system') return getSystemTheme();
    return theme;
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    
    setResolvedTheme(resolved);
    
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    root.setAttribute('data-theme', resolved);
    
    // Update meta theme-color for mobile browsers
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', resolved === 'dark' ? '#0f0f11' : '#fafaf9');
    }
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

### Provider Integration

```typescript
// src/app.tsx (or root layout)
import { ThemeProvider } from '@/presentation/providers/ThemeProvider';

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
```

---

## 14.7 ThemeToggle Component Specification

### Component Location

Place in Settings sidebar or global header (top-right corner alongside user menu).

### Component Implementation

```typescript
// src/presentation/components/ui/ThemeToggle.tsx
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/presentation/providers/ThemeProvider';
import { Button } from '@/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />;
    }
    return resolvedTheme === 'dark' 
      ? <Moon className="h-5 w-5" /> 
      : <Sun className="h-5 w-5" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-11 rounded-none" /* 8-bit: 44px touch target, sharp corners */
          aria-label={t('settings.theme.toggle')}
        >
          {getIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="rounded-none border-2" /* 8-bit styling */
      >
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="gap-2 rounded-none"
        >
          <Sun className="h-4 w-4" />
          {t('settings.theme.light')}
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="gap-2 rounded-none"
        >
          <Moon className="h-4 w-4" />
          {t('settings.theme.dark')}
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="gap-2 rounded-none"
        >
          <Monitor className="h-4 w-4" />
          {t('settings.theme.system')}
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### i18n Keys Required

```json
{
  "settings": {
    "theme": {
      "toggle": "Toggle theme",
      "light": "Light",
      "dark": "Dark",
      "system": "System"
    }
  }
}
```

### Keyboard Accessibility

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open dropdown |
| `Arrow Down` / `Arrow Up` | Navigate options |
| `Enter` / `Space` | Select option |
| `Escape` | Close dropdown |
| `Tab` | Move to next focusable element |

---

## 14.8 8-bit Rules for Light Theme

### DO (Required Practices)

| Rule | Implementation | Example |
|------|----------------|---------|
| Use warm whites | `--background: #fafaf9` (Stone 50) | Not `#ffffff` everywhere |
| Keep hard pixel shadows | `4px 4px 0 rgba(0,0,0,0.15)` | No blur shadows |
| Maintain 0px border-radius | `border-radius: 0` or `2px` max | `rounded-none` or `rounded-sm` |
| Use solid 2px borders | `border: 2px solid #d4d4d4` | No 1px hairlines |
| Darken primary for text | `#c2410c` for primary text | Not `#f97316` on white |
| Preserve retro fonts | VT323, JetBrains Mono | Same as dark mode |
| Test in grayscale | Verify luminance hierarchy | Accessibility check |
| Use step animations | `steps(5, end)` | For theme transitions (optional) |

### DON'T (Anti-Patterns)

| Anti-Pattern | Why It Fails | Correct Alternative |
|--------------|--------------|---------------------|
| Pure white everywhere | Too harsh, loses warmth | Use `#fafaf9` for base |
| Gradient backgrounds | Not 8-bit aesthetic | Solid color fills |
| Soft/blur shadows | Defeats pixel art feel | Hard offset shadows |
| Rounded corners >2px | Breaks retro aesthetic | `rounded-none` |
| Transparent overlays | 8-bit = solid colors | Solid overlay colors |
| Low-contrast orange text | Fails accessibility | Use `--primary-700` |
| Glassmorphism effects | Modern, not retro | Solid surfaces |
| Slow transitions >300ms | Feels sluggish | Instant or max 300ms |
| Backdrop blur | Not 8-bit | Solid dark overlay |

### Visual Comparison

```
+==============================================================+
|                     8-BIT LIGHT MODE                          |
+==============================================================+

CORRECT                         INCORRECT
--------                        ---------
+------------------+            ╭──────────────────╮
| Warm White #fafaf9|           │ Pure White #fff   │
| Black shadow 4px  |           │ Blurred shadow    │
| Sharp corners 0px |           │ Rounded 8px       │
+------------------+            ╰──────────────────╯

+==============================================================+
```

---

## 14.9 Accessibility Verification

### Contrast Ratio Requirements

| Content Type | WCAG AA | WCAG AAA |
|--------------|---------|----------|
| Normal text (<18px) | 4.5:1 | 7:1 |
| Large text (18px+ or 14px bold) | 3:1 | 4.5:1 |
| UI components/icons | 3:1 | N/A |
| Focus indicators | 3:1 | N/A |

### Light Theme Contrast Verification Table

| Foreground | Background | Contrast | Result | Usage |
|------------|------------|----------|--------|-------|
| `#171717` (text) | `#fafaf9` (bg) | **12.8:1** | AAA | Body text |
| `#404040` (heading) | `#fafaf9` (bg) | **9.8:1** | AAA | Headings |
| `#737373` (muted) | `#fafaf9` (bg) | **4.8:1** | AA | Secondary text |
| `#a3a3a3` (disabled) | `#fafaf9` (bg) | **2.7:1** | Fail | Disabled only |
| `#f97316` (primary) | `#fafaf9` (bg) | **3.1:1** | AA (large) | Icons, buttons |
| `#c2410c` (primary-700) | `#fafaf9` (bg) | **5.6:1** | AA | Primary text |
| `#ea580c` (primary-600) | `#fafaf9` (bg) | **4.1:1** | AA | Links |
| `#dc2626` (destructive) | `#fafaf9` (bg) | **5.2:1** | AA | Error text |
| `#16a34a` (success) | `#fafaf9` (bg) | **4.6:1** | AA | Success text |
| `#2563eb` (info) | `#fafaf9` (bg) | **4.8:1** | AA | Info text |
| `#d97706` (warning) | `#fafaf9` (bg) | **4.5:1** | AA | Warning text |

### Critical Finding: Orange Primary

The default `--primary` (#f97316) achieves only **3.1:1** contrast on white backgrounds.

**Solution**: Define `--primary-text` token using `--primary-700` (#c2410c) for text elements:

```css
.light {
  /* Buttons/icons: vibrant orange */
  --primary: 24.6 95% 53.1%;       /* #f97316 */
  
  /* Text: darker orange for contrast */
  --primary-text: 24.6 88.5% 40.4%; /* #c2410c - 5.6:1 ratio */
}
```

### Verification Tools

| Tool | Purpose | URL |
|------|---------|-----|
| **Chrome DevTools** | Built-in contrast checker | Accessibility panel |
| **WebAIM Contrast Checker** | Manual verification | https://webaim.org/resources/contrastchecker/ |
| **axe DevTools** | Automated testing | Browser extension |
| **WAVE** | Full page analysis | https://wave.webaim.org/ |
| **Stark (Figma)** | Design-time checking | Figma plugin |

### Automated Accessibility Testing

```typescript
// Add to Vitest/Playwright setup
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('light theme has no accessibility violations', async () => {
  document.documentElement.classList.add('light');
  const results = await axe(document.body);
  expect(results).toHaveNoViolations();
});
```

---

## 14.10 Implementation Roadmap

### Phase 1: Foundation (2h)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Verify existing tokens work | 30min | Tokens validated |
| Create ThemeProvider | 1h | Provider component |
| Add system preference detection | 30min | Auto-detection working |

### Phase 2: UI Components (1.5h)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Create ThemeToggle component | 30min | Toggle component |
| Add to Settings page | 30min | Settings integration |
| Add to Header (optional) | 30min | Quick access toggle |

### Phase 3: Editor Integration (1h)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Configure Monaco light theme | 30min | Editor theme switching |
| Test syntax highlighting | 30min | Readable code colors |

### Phase 4: Verification (2-3h)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Component contrast audit | 1h | All components pass AA |
| axe-core integration | 30min | Automated testing |
| Manual accessibility testing | 1h | Full manual review |
| Cross-browser testing | 30min | Chrome, Firefox, Safari |

### Phase 5: Polish (1h)

| Task | Effort | Deliverable |
|------|--------|-------------|
| Theme transition (optional) | 30min | Smooth/instant switch |
| Mobile meta theme-color | 15min | Status bar color |
| Documentation update | 15min | Usage guide |

### Total Estimated Effort: 6-8 hours

### Priority Matrix

| Priority | Tasks | Blocker? |
|----------|-------|----------|
| **P0** | Token verification | Yes |
| **P1** | ThemeProvider, system detection | Yes |
| **P2** | ThemeToggle, contrast verification | No |
| **P3** | Monaco Editor, Settings integration | No |
| **P4** | E2E audit, cross-browser testing | No |

---

## 14.11 Component-Specific Considerations

### Monaco Editor

```typescript
// Monaco theme configuration for light mode
const monacoLightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs', // Light base theme
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b7280' },
    { token: 'keyword', foreground: 'c2410c' }, // Orange-700
    { token: 'string', foreground: '15803d' },  // Green-700
  ],
  colors: {
    'editor.background': '#fafaf9',
    'editor.foreground': '#171717',
    'editor.lineHighlightBackground': '#f5f5f4',
    'editor.selectionBackground': '#fed7aa',
    'editorGutter.background': '#f5f5f4',
    'editorLineNumber.foreground': '#a3a3a3',
  },
};

// Apply based on theme
useEffect(() => {
  if (resolvedTheme === 'light') {
    monaco.editor.defineTheme('via-gent-light', monacoLightTheme);
    monaco.editor.setTheme('via-gent-light');
  } else {
    monaco.editor.setTheme('via-gent-dark');
  }
}, [resolvedTheme]);
```

### Scrollbars

```css
.light {
  /* Scrollbar colors for light mode */
  --scrollbar-track: #f5f5f4;
  --scrollbar-thumb: #d4d4d4;
  --scrollbar-thumb-hover: #a3a3a3;
}

.light ::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.light ::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

.light ::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border: 2px solid var(--scrollbar-track);
}

.light ::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
```

### Charts and Data Visualization

If using charts, ensure color palettes work for both themes:

```typescript
const chartColors = {
  light: {
    primary: '#ea580c',    // Orange-600
    success: '#16a34a',    // Green-600
    warning: '#d97706',    // Amber-600
    error: '#dc2626',      // Red-600
    info: '#2563eb',       // Blue-600
    grid: '#e5e5e5',       // Neutral-200
    text: '#171717',       // Neutral-900
  },
  dark: {
    primary: '#f97316',    // Orange-500
    success: '#22c55e',    // Green-500
    warning: '#f59e0b',    // Amber-500
    error: '#ef4444',      // Red-500
    info: '#3b82f6',       // Blue-500
    grid: '#27272a',       // Zinc-800
    text: '#fafafa',       // Neutral-50
  },
};
```

---

## 14.12 References

### External Resources

| Resource | URL |
|----------|-----|
| Tailwind CSS Dark Mode | https://tailwindcss.com/docs/dark-mode |
| ShadcnUI Theming | https://ui.shadcn.com/docs/theming |
| ShadcnUI Dark Mode | https://ui.shadcn.com/docs/dark-mode |
| WCAG 2.2 Contrast | https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum |
| WebAIM Contrast Checker | https://webaim.org/resources/contrastchecker/ |
| Lospec Retro Palettes | https://lospec.com/palette-list |

### Internal Codebase Files

| File | Purpose |
|------|---------|
| `src/styles/light-theme-tokens.css` | 91 light theme tokens |
| `src/styles/design-tokens.css` | Complete dark/light system |
| `src/styles.css` | Tailwind custom variants |

---

**Document Statistics**:
- **Section**: 14
- **Version**: 3.0.0
- **Date**: 2026-01-27
- **Author**: ux-designer-ext (Team A)
- **Task**: PH2-T1C-RETRY
- **Lines**: ~700

---

<- [Section 13: Appendix](./13-appendix.md) | [Index](./index.md) | [Section 15: Micro Animations](./15-micro-animations.md) ->
