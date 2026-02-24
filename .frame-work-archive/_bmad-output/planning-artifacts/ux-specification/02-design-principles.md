# Design Principles

<- [Executive Summary](./01-executive-summary.md) | [Index](./index.md) | [Design Tokens](./03-design-tokens.md) ->

---

## 2.1 8-Bit Retro Aesthetic (10 Non-Negotiable Rules)

The 8-bit aesthetic is the foundational visual language for Project Alpha. These rules are **mandatory** and apply to all UI components.

| Rule # | Rule | Implementation | Violation Example |
|--------|------|----------------|-------------------|
| **R1** | `border-radius` MUST be 0 or max 2px | `rounded-none` or `rounded-sm` | `rounded-lg`, `rounded-full` on cards |
| **R2** | NO blur shadows | `shadow-[4px_4px_0_0]` | `shadow-lg`, `shadow-2xl` |
| **R3** | NO glassmorphism | Solid backgrounds only | `backdrop-filter: blur()` |
| **R4** | NO gradients on surfaces | Single solid colors | `bg-gradient-to-r` on cards/buttons |
| **R5** | Background opacity MUST be >= 0.9 | `bg-card` (solid) | `bg-card/50` |
| **R6** | Spacing MUST use 4px grid | `p-4`, `gap-2`, `m-8` | `p-[13px]`, `m-[7px]` |
| **R7** | Prefer step-based animations | `steps(5, end)` | Spring/bounce physics |
| **R8** | Text contrast MUST meet WCAG AA | 4.5:1 minimum ratio | Low contrast muted text |
| **R9** | Touch targets MUST be >= 44px | `min-h-11 min-w-11` | 32px buttons |
| **R10** | Z-index MUST use tokens | `z-[var(--z-modal)]` | `z-[9999]` magic numbers |

---

## 2.2 ShadcnUI Integration

Project Alpha uses ShadcnUI with specific customizations for 8-bit compliance.

### Style Configuration

```json
{
  "style": "lyra",
  "base": "radix",
  "tailwind": {
    "baseColor": "stone",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### Why Lyra Style?

| Aspect | Lyra Benefits |
|--------|---------------|
| **Corners** | "Boxy and sharp" by default |
| **Density** | Compact layouts |
| **Font Pairing** | Optimized for monospace (JetBrains Mono) |
| **Border Weight** | Heavier borders (2px default) |

### Component Override Pattern

```tsx
// Every ShadcnUI component gets 8-bit treatment
<Button 
  className="rounded-none shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] 
             hover:shadow-[6px_6px_0_0_rgba(0,0,0,0.5)]
             transition-all duration-100"
>
  Action
</Button>

<Card className="rounded-none border-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]">
  <CardContent>Content</CardContent>
</Card>
```

---

## 2.3 Accessibility First (WCAG AA Minimum)

| Requirement | Implementation |
|-------------|----------------|
| **Color Contrast** | 4.5:1 for normal text, 3:1 for large text |
| **Focus Indicators** | 2px orange ring, visible on all interactive elements |
| **Keyboard Navigation** | Full keyboard accessibility, logical tab order |
| **Screen Readers** | ARIA labels, live regions, semantic HTML |
| **Reduced Motion** | Respect `prefers-reduced-motion` |
| **Touch Targets** | Minimum 44x44px on all interactive elements |

### Focus Visible Pattern

```css
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

---

## 2.4 Mobile-First Responsive

Design starts at the smallest breakpoint (320px) and progressively enhances.

```
Mobile First Progression:

[Phone Portrait] -> [Phone Landscape] -> [Tablet Portrait] -> 
     <480px           480-599px           600-767px

[Tablet Landscape] -> [Laptop] -> [Desktop]
    768-1023px       1024-1279px    >=1280px
```

| Breakpoint | Plugins | Layout |
|------------|---------|--------|
| Phone (<600px) | 1 | Full immersion, bottom sheet |
| Tablet (600-1023px) | 2 | Single panel + tabs |
| Laptop (1024-1279px) | 3 | Panel + overlay |
| Desktop (>=1280px) | 4 | Multi-panel grid |

---

## 2.5 Progressive Disclosure

Information and controls are revealed based on context and user intent.

| Level | Visibility | Examples |
|-------|------------|----------|
| **Level 1** | Always visible | FileTree toggle, primary actions |
| **Level 2** | Click/tap to reveal | Plugin management, settings |
| **Level 3** | Hidden by default | Advanced options, debug tools |

---

## 2.6 Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| **First Contentful Paint** | <1.5s | Lighthouse |
| **Time to Interactive** | <3.0s | Lighthouse |
| **Layout Shift** | <0.1 CLS | Lighthouse |
| **Bundle Size (initial)** | <200KB gzipped | Build output |
| **Plugin Load** | <500ms | Custom metric |

---

<- [Executive Summary](./01-executive-summary.md) | [Index](./index.md) | [Design Tokens](./03-design-tokens.md) ->
