# EPIC-UX: System-Wide UX Remediation

**Version:** 1.0.0  
**Date:** 2026-01-09  
**Status:** Ready for Implementation  
**Priority:** P0 (Critical)  
**Estimated Effort:** 14 hours

---

## Epic Overview

This epic addresses critical UX inconsistencies identified in the comprehensive system-wide scan. The issues violate the 8-bit aesthetic standards defined in the UX specification and design tokens, compromising the visual consistency and mobile accessibility of the application.

## Background

The deep-scan-ux-scanner identified **153 total UX violations** across the codebase:

| Category | Count | Priority | Impact |
|----------|-------|----------|--------|
| Glassmorphism violations | 47 | P0 - CRITICAL | Visual consistency, performance |
| Rounded corners violations | 52 | P1 - HIGH | 8-bit aesthetic breach |
| Touch target violations | 34 | P0 - CRITICAL | Mobile accessibility (WCAG 2.5.5) |
| Hardcoded strings | 24+ | P1 - HIGH | Internationalization |
| Missing Vietnamese translations | TBD | P2 - MEDIUM | Localization completeness |
| Soft shadow violations | TBD | P2 - MEDIUM | 8-bit aesthetic breach |

## Scope

### In-Scope
- All UI components in `src/presentation/components/ui/`
- IDE workspace components in `src/presentation/components/ide/`
- Chat components in `src/presentation/components/chat/`
- Knowledge workspace components in `src/presentation/components/knowledge/`
- Hub and dashboard components in `src/presentation/components/hub/`, `src/presentation/components/dashboard/`
- Design token CSS files in `src/styles/`
- Translation files in `src/i18n/locales/`

### Out-of-Scope
- Third-party library components (unless customized)
- Test files (separate testing story if needed)
- Documentation updates (separate docs story)

## Design Standards Reference

### 8-Bit Aesthetic Requirements (MANDATORY)
From `src/styles/design-tokens.css`:
```css
/* PROHIBITED */
❌ backdrop-filter: blur()
❌ background: rgba(...) with opacity < 1
❌ bg-opacity-*
❌ backdrop-blur-*
❌ rounded-lg, rounded-md, rounded-xl, rounded-2xl (on containers)
❌ shadow-md, shadow-lg (non-pixel shadows)

/* REQUIRED */
✅ Solid backgrounds only: hsl(var(--card)), hsl(var(--background))
✅ border-radius: 0rem (squared corners)
✅ box-shadow: var(--shadow-pixel) or var(--shadow-pixel-sm)
```

### Responsive Requirements
```css
/* Breakpoints */
Mobile: < 640px
Tablet: 640px - 767px
Desktop: 768px - 1023px
Large Desktop: >= 1024px

/* Touch Targets - WCAG 2.5.5 */
✅ Minimum 44px x 44px for all touch targets
✅ Inputs: text-base (16px) to prevent iOS auto-zoom
```

## Stories

| Story | Title | Priority | Effort | Status | File |
|-------|-------|----------|--------|--------|------|
| UX-1 | Remove Glassmorphism | P0 - CRITICAL | 4 hours | Ready | `stories/UX-1-remove-glassmorphism.md` |
| UX-2 | Fix Rounded Corners | P1 - HIGH | 3 hours | Ready | `stories/UX-2-fix-rounded-corners.md` |
| UX-3 | Touch Target Compliance | P0 - CRITICAL | 4 hours | Ready | `stories/UX-3-touch-target-compliance.md` |
| UX-4 | Internationalization Audit | P1 - HIGH | 2 hours | Ready | `stories/UX-4-internationalization-audit.md` |
| UX-5 | Shadow Consolidation | P2 - MEDIUM | 1 hour | Ready | `stories/UX-5-shadow-consolidation.md` |

## Dependencies

- No external dependencies
- Stories can be implemented in parallel by different developers

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes in UI | Medium | Test each component after changes; use visual regression |
| Translation gaps | Low | Add missing keys incrementally; fallback to English |
| Performance regression | Low | Solid backgrounds actually improve performance |

## Validation Criteria

### Visual Regression Testing
- Capture before/after screenshots for all modified components
- Verify no visual regressions in:
  - Dark theme
  - Light theme (if applicable)
  - Mobile viewport (<640px)
  - Tablet viewport (640-767px)

### Accessibility Testing
- Verify touch targets >=44px with Chrome DevTools
- Test keyboard navigation works correctly
- Verify screen reader announcements (if applicable)

### Internationalization Testing
- Verify en.json translations work
- Verify vi.json translations display correctly
- Test language switcher (if exists)

## References

- **UX Scan Results:** `_bmad-output/ux-scan-results.md`
- **Design Tokens:** `src/styles/design-tokens.css`
- **UX Specification:** `_bmad-output/planning-artifacts/ux-specification.md`
- **8-bit Aesthetic Guide:** `src/styles/design-tokens.css` (lines 1-16)

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.1 | 2026-01-09 | BMAD-UX-Architect | Added story files to epic |
| 1.0.0 | 2026-01-09 | BMAD-UX-Architect | Initial creation from UX scan |

---

**Created:** 2026-01-09  
**Last Updated:** 2026-01-09
