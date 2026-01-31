# UX/UI Validation Checklist

**Version**: 1.1.0
**Date**: 2026-01-27
**Status**: MANDATORY for all UI changes

> **DEV AGENTS**: Run this checklist BEFORE claiming UI work complete

## Quick Validation (5 checks)

### 8-bit Compliance
- [ ] No `border-radius` > 2px
- [ ] No blur shadows (only `4px 4px 0 0` pixel shadows)
- [ ] No gradients on backgrounds
- [ ] No opacity < 0.9 on backgrounds
- [ ] All colors from design tokens (no hardcoded hex)

### Responsive Check
- [ ] Works at 320px width (phone portrait)
- [ ] Works at 768px width (tablet)
- [ ] Works at 1280px width (desktop)
- [ ] No horizontal scroll at any breakpoint
- [ ] Touch targets >= 44px on mobile

### i18n Check
- [ ] No hardcoded user-facing text (use t() function)
- [ ] Tested with Vietnamese strings (longer text)
- [ ] Text truncation has tooltip

### Accessibility Check
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] Focus states visible
- [ ] Color contrast >= 4.5:1 for text

### Light Theme Compatibility
- [ ] Component works in both dark AND light themes
- [ ] Uses CSS variables (not hardcoded colors)
- [ ] Shadows invert correctly (dark→white-based, light→black-based)
- [ ] Text contrast meets WCAG AA in light mode
- [ ] No pure white (#ffffff) backgrounds - use Stone 50 (#fafaf9)

### Animation Compliance
- [ ] Uses step-based timing `steps(N, end)` for 8-bit feel
- [ ] Duration ≤ 200ms for micro-interactions
- [ ] Only animates `transform` and `opacity` (GPU-accelerated)
- [ ] Respects `prefers-reduced-motion` media query
- [ ] No smooth easing (`ease-in-out`) - use `steps()` or `linear`
- [ ] Whole pixel values only (no 1.5px)

### Code Quality
- [ ] Component < 300 lines
- [ ] Uses ShadcnUI primitives where applicable
- [ ] No inline styles
- [ ] Uses design token CSS variables

## Z-Index Reference (Memorize)

| Token | Value | Use |
|-------|-------|-----|
| --z-base | 0 | Content |
| --z-dropdown | 10 | Dropdowns |
| --z-sticky | 20 | Sticky headers |
| --z-fixed | 30 | Fixed elements |
| --z-modal-backdrop | 40 | Modal overlay |
| --z-modal | 50 | Modal content |
| --z-tooltip | 70 | Tooltips |
| --z-toast | 80 | Toasts |

## Animation Tokens (Memorize)

| Token | Value | Use |
|-------|-------|-----|
| --timing-8bit | steps(5, end) | Default 8-bit |
| --timing-8bit-fast | steps(3, end) | Quick snap |
| --timing-8bit-snap | steps(2, end) | Hover states |
| --duration-fast | 100ms | Hover, focus |
| --duration-normal | 200ms | Transitions |
| --duration-slow | 300ms | Modals, panels |

## Plugin Limits by Device

| Device | Max Plugins |
|--------|-------------|
| Desktop (>=1280px) | 4 |
| Laptop (1024-1279px) | 3 |
| Tablet (768-1023px) | 2 |
| Phone (<768px) | 1 |

## Common Violations (NEVER DO)

```
border-radius: 0.5rem        -> Use border-radius: 0 or 2px
box-shadow: 0 4px 6px rgba() -> Use 4px 4px 0 0 var(--shadow-color)
color: #f97316              -> Use var(--color-primary)
<span>Settings</span>        -> Use <span>{t('settings')}</span>
style={{ margin: 10 }}       -> Use className="m-2"
ease-in-out                  -> Use steps(5, end)
animation: 2s                -> Use 100-200ms
translateY(-3.5px)           -> Use whole pixels translateY(-4px)
background: #ffffff          -> Use var(--color-background) or #fafaf9
```

## Full Specification

For complete details, see:
- [Design Tokens](./03-design-tokens.md)
- [Accessibility](./11-accessibility.md)
- [Agent Governance](./12-agent-governance.md)
- [Light Theming](./14-light-theming.md) ← NEW
- [Micro Animations](./15-micro-animations.md) ← NEW

---
*This checklist is extracted from ux-specification v3.0.0 (15 sections)*
*Last updated: 2026-01-27*
