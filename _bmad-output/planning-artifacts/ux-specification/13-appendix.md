# Appendix

<- [Agent Governance](./12-agent-governance.md) | [Index](./index.md)

---

## 13.1 Glossary

| Term | Definition |
|------|------------|
| **Activity Bar** | 48px vertical bar containing plugin icons (left side on desktop, bottom on mobile) |
| **Plugin Docker** | System for arranging plugins in layout slots |
| **Global Component** | UI element that persists across all routes (Header, Sidebar, StatusBar) |
| **Design Token** | Named CSS custom property for consistent styling (color, spacing, shadow, etc.) |
| **Progressive Disclosure** | UX pattern of revealing information gradually based on user need |
| **Focus Trap** | Accessibility pattern containing tab focus within a modal/dialog |
| **Live Region** | ARIA region that announces dynamic content changes to screen readers |
| **Pixel Shadow** | Hard-edge box-shadow without blur (4px 4px 0 0 rgba(0,0,0,0.5)) |
| **Touch Target** | Minimum 44x44px interactive area for touch accessibility |
| **Stacking Context** | Isolated z-index layer created by certain CSS properties |
| **Skeleton** | Loading placeholder that reserves space for content |
| **8-bit Aesthetic** | Retro gaming visual style with sharp corners, pixel shadows, step animations |

---

## 13.2 References

### External Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| **ShadcnUI** | https://ui.shadcn.com/ | Component library |
| **Tailwind CSS 4** | https://tailwindcss.com/ | Utility CSS framework |
| **WCAG 2.1** | https://www.w3.org/WAI/WCAG21/quickref/ | Accessibility guidelines |
| **axe-core** | https://github.com/dequelabs/axe-core | Accessibility testing |
| **Radix Primitives** | https://www.radix-ui.com/primitives | Accessible UI primitives |
| **TanStack Router** | https://tanstack.com/router | Type-safe routing |

### Internal Documents

| Document | Path | Purpose |
|----------|------|---------|
| **ADR-039** | `_bmad-output/planning-artifacts/adr/ADR-039-*.md` | Architecture decisions |
| **Design Tokens** | `_bmad-output/planning-artifacts/design-system/design-tokens-8bit-*.md` | Token definitions |
| **Global Components** | `_bmad-output/planning-artifacts/design-system/global-components-*.md` | Component specs |
| **AGENTS.md** | `AGENTS.md` | Governance patterns |

---

## 13.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.0.0 | 2026-01-27 | Complete rewrite for plugin-centric architecture. Added comprehensive accessibility (Section 11), 10 Commandments (Section 12.2), z-index governance (Section 12.3), viewport blocking prevention (Section 12.4), component coherence checklists (Section 12.5), validation checklists (Section 12.6) | ux-designer-ext |
| 2.0.0 | 2026-01-26 | Previous version (deprecated - contained false completion claims) | - |
| 1.0.0 | 2026-01-15 | Initial version | - |

---

## 13.4 Quick Reference Cards

### 8-bit Rules Summary Card

```
+==============================================================+
|                    8-BIT UI QUICK REFERENCE                   |
+==============================================================+
|                                                               |
|  CORNERS:   rounded-none (0px) or rounded-sm (2px) MAX        |
|  SHADOWS:   shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] only         |
|  COLORS:    tokens only (text-primary, bg-card, etc.)         |
|  SPACING:   4px grid (p-2=8px, p-4=16px, gap-3=12px)          |
|  FONTS:     font-mono (UI), font-pixel (headings)             |
|  ANIMATION: steps(5, end) or linear, max 300ms                |
|  OPACITY:   1.0 always (except modal backdrop, disabled)      |
|                                                               |
+--------------------------------------------------------------+
|  NEVER: blur shadows, gradients, rounded-lg, backdrop-blur    |
+==============================================================+
```

### Z-Index Quick Reference Card

```
+==============================================================+
|                      Z-INDEX HIERARCHY                        |
+==============================================================+
|  100 | --z-debug       | DevTools (DEV ONLY)                 |
|   90 | --z-alert       | Critical alerts                     |
|   80 | --z-overlay     | Full-screen loading                 |
|   70 | --z-popover     | Command palette                     |
|   60 | --z-toast       | Sonner notifications                |
|   50 | --z-modal       | Dialog/Sheet content                |
|   45 | --z-modal-bg    | Modal backdrop                      |
|   40 | --z-panel       | Floating panels                     |
|   30 | --z-sidebar     | GlobalSidebar                       |
|   20 | --z-sticky      | Sticky headers                      |
|   10 | --z-dropdown    | Menus, tooltips                     |
|    5 | --z-docked      | Docked elements                     |
|    0 | --z-base        | Content                             |
+--------------------------------------------------------------+
|  RULE: Always use tokens, never raw numbers                   |
+==============================================================+
```

### Component Size Limits Card

```
+==============================================================+
|                    COMPONENT SIZE LIMITS                      |
+==============================================================+
|  <= 200 lines   |  IDEAL        |  No action needed          |
|  201-300 lines  |  WARNING      |  Consider splitting        |
|  301-400 lines  |  MUST SPLIT   |  Split before merge        |
|  > 400 lines    |  BLOCKED      |  Mandatory refactor        |
+--------------------------------------------------------------+
|  Splitting Strategy:                                          |
|  1. Extract hooks -> use{Component}State.ts                   |
|  2. Extract sub-components -> {Component}Header.tsx           |
|  3. Extract utilities -> {component}.utils.ts                 |
+==============================================================+
```

---

## 13.5 CSS Variables Summary

```css
/* Plugin Panel Dimensions */
:root {
  --plugin-header-height: 36px;
  --plugin-tabs-height: 32px;
  --plugin-footer-height: 28px;
  
  /* Activity Bar */
  --activity-bar-width: 48px;
  --activity-btn-size: 40px;
  --activity-icon-size: 24px;
  
  /* Touch Targets */
  --touch-target-min: 44px;
  
  /* Z-index Scale */
  --z-plugin-content: 1;
  --z-plugin-header: 10;
  --z-plugin-overlay: 20;
  --z-activity-bar: 30;
  --z-tooltip: 70;
  --z-drag-ghost: 100;
}
```

---

## 13.6 Implementation Verification

### Automated Checks

1. **ESLint Rules** (configure in eslint.config.js):
   - no-hardcoded-colors (custom rule)
   - no-arbitrary-spacing (custom rule)
   - react/jsx-no-inline-style (built-in)

2. **TypeScript Strict Mode**:
   - No `any` types
   - All props typed
   - Strict null checks

3. **axe-core in Tests**:
   - Add to Vitest/Playwright setup
   - Fail on accessibility violations
   - Run on every component test

### Manual Review Checklist

Use the checklists in Section 12.5 and 12.6 during:
- PR code review
- Design review
- Accessibility audit
- Pre-release QA

### Periodic Audits

Schedule regular audits:
- Weekly: Spot-check 5 random components
- Monthly: Full accessibility scan
- Quarterly: Design token usage audit
- Per-epic: Comprehensive UX review

---

**End of UX Specification**

---

**Document Statistics**:
- **Total Sections**: 13
- **Version**: 3.0.0
- **Date**: 2026-01-27
- **Author**: ux-designer-ext (BMAD Framework)

---

<- [Agent Governance](./12-agent-governance.md) | [Index](./index.md)
