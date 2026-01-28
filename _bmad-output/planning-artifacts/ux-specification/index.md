---
title: Project Alpha UX Specification
version: 3.0.0
date: 2026-01-27
status: ACTIVE
tier: 2 (Controlled & Iterative)
structure: sharded
---

# Project Alpha UX Specification

> **Version**: 3.0.0 | **Date**: 2026-01-27 | **Status**: ACTIVE

---

## Quick Reference

| Aspect | Value |
|--------|-------|
| **Design System** | ShadcnUI + Tailwind CSS 4 |
| **Visual Style** | Lyra (8-bit retro - boxy and sharp) |
| **Base Color** | Stone |
| **Primary Accent** | Orange (#f97316) |
| **Theme** | Dark default + Light mode (✅ Section 14: Light Theming - Complete) |
| **Languages** | English (en), Vietnamese (vi) |
| **Breakpoints** | 6 tiers (phone to desktop) |
| **Plugin Limit** | 1-4 (device-dependent) |
| **Icon Library** | Lucide React (with pixel styling) |
| **Fonts** | JetBrains Mono (UI), VT323 (decorative), Inter (prose) |
| **Min Touch Target** | 44x44px |
| **WCAG Compliance** | AA minimum |

---

## Table of Contents

### Foundation (Part A)

1. [Executive Summary](./01-executive-summary.md) - Document purpose, authority, and overview
2. [Design Principles](./02-design-principles.md) - 8-bit aesthetic rules, ShadcnUI integration
3. [Design Tokens](./03-design-tokens.md) - Colors, typography, spacing, shadows, animations
4. [Responsive Grid System](./04-responsive-grid.md) - Breakpoints, layouts, plugin limits
5. [Global Components](./05-global-components.md) - Sidebar, Header, Breadcrumbs, StatusBar
6. [Route & Navigation](./06-route-navigation.md) - Route hierarchy, URL state, deep linking

### Plugin UX (Part B)

7. [Plugin Architecture](./07-plugin-architecture.md) - Plugin system overview, types, lifecycle
8. [Activity Bar & Docker](./08-activity-bar-docker.md) - Activity bar specification, plugin docker
9. [Plugin Interfaces](./09-plugin-interfaces.md) - Panel structure, headers, tabs, states
10. [i18n & Typography](./10-i18n-typography.md) - Multi-language support, Vietnamese handling

### Governance (Part C)

11. [Accessibility](./11-accessibility.md) - WCAG compliance, keyboard, screen readers
12. [Agent Governance Rules](./12-agent-governance.md) - 10 Commandments, validation checklists
13. [Appendix](./13-appendix.md) - Glossary, references, quick reference cards

### Extended Specifications (Part D)

14. [Light Theming](./14-light-theming.md) - Light mode tokens, ThemeProvider, accessibility
15. [Micro Animations & Effects](./15-micro-animations.md) - 8-bit step animations, transitions, feedback, loading states

---

## Document Authority

| Property | Value |
|----------|-------|
| **Tier** | 2 (Controlled & Iterative) |
| **Changes Require** | `architect-ext` or `ux-designer-ext` approval |
| **Implementation Deviations** | Require ADR with justification |
| **Supersedes** | `ux-specification.md` v2.1.0 (2026-01-26) |

---

## Alignment

- **ADR-039**: Architecture decision authority
- **architecture.md**: v3.0.0
- **prd.md**: v2.0.0
- **epics.md**: v3.0.0

---

## 8-bit Rules Summary

```
+===============================================================+
|                    8-BIT UI QUICK REFERENCE                    |
+===============================================================+

CORNERS:   rounded-none (0px) or rounded-sm (2px) MAX
SHADOWS:   shadow-[4px_4px_0_0_rgba(0,0,0,0.5)] only
COLORS:    tokens only (text-primary, bg-card, etc.)
SPACING:   4px grid (p-2=8px, p-4=16px, gap-3=12px)
FONTS:     font-mono (UI), font-pixel (headings)
ANIMATION: steps(5, end) or linear, max 300ms
OPACITY:   1.0 always (except modal backdrop, disabled)

NEVER: blur shadows, gradients, rounded-lg, backdrop-blur
+===============================================================+
```

---

**Total Lines Across All Sections**: ~5,750
**Created**: 2026-01-27
**Author**: ux-designer-ext (BMAD Framework)
