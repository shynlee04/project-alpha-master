# Executive Summary

<- [Index](./index.md) | [Design Principles](./02-design-principles.md) ->

---

**Version**: 3.0.0 | **Date**: 2026-01-27 | **Status**: ACTIVE

---

## Overview

Project Alpha (VIA-GENT) is a browser-based AI-augmented development environment built with an **8-bit retro aesthetic** that prioritizes clarity, accessibility, and professional functionality over decorative nostalgia. The design language draws inspiration from classic gaming interfaces while maintaining modern usability standards.

The application follows a **plugin-centric architecture** where the UI adapts dynamically based on device capabilities and user preferences. Core workspaces (IDE, Notes, Settings) render through a unified plugin panel system with platform-aware limits that ensure optimal performance across desktop, tablet, and mobile devices.

This specification serves as the authoritative UX reference for all implementation work, superseding previous documentation that contained deprecated patterns and inaccurate completion claims. All sections have been validated against the current codebase state and align with the FSA Handle Lifecycle decisions in ADR-039.

---

## Document Authority

| Property | Value |
|----------|-------|
| **Tier Level** | Tier 2 (Controlled & Iterative) |
| **Change Authority** | Requires `architect-ext` or `ux-designer-ext` approval |
| **Implementation Deviations** | Require ADR with justification |
| **Supersedes** | ux-specification.md v2.1.0 (2026-01-26) |

---

## Quick Reference

| Aspect | Specification |
|--------|---------------|
| **Design System** | ShadcnUI + Tailwind CSS 4 |
| **Visual Style** | Lyra (8-bit retro - boxy and sharp) |
| **Base Color** | Stone |
| **Primary Accent** | Orange (#f97316) |
| **Theme** | Dark only (light mode deferred to Phase 2) |
| **Languages** | English (en), Vietnamese (vi) |
| **Breakpoints** | 6 tiers (phone to desktop) |
| **Plugin Limit** | 1-4 (device-dependent) |
| **Icon Library** | Lucide React (with pixel styling) |
| **Fonts** | JetBrains Mono (UI), VT323 (decorative), Inter (prose) |
| **Min Touch Target** | 44x44px |
| **WCAG Compliance** | AA minimum |

---

## Alignment

This specification is aligned with:

- **ADR-039**: Primary architecture authority
- **architecture.md v3.0.0**: Technical implementation specification
- **prd.md v2.0.0**: Product requirements

---

<- [Index](./index.md) | [Design Principles](./02-design-principles.md) ->
