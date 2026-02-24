# Story UX-5: Shadow Consolidation

**Epic:** EPIC-UX: System-Wide UX Remediation  
**Priority:** P2 - MEDIUM  
**Story Points:** 2  
**Estimated Effort:** 1 hour  
**Status:** Ready for Implementation  
**Component Area:** Design Tokens, UI Components

---

## User Story

**As a** user of the Via-Gent application  
**I want** all shadow effects to follow the 8-bit pixel shadow style  
**So that** the application maintains a consistent retro gaming visual style

## Problem Statement

The codebase contains **soft shadows** (non-pixel) that violate the 8-bit aesthetic. These shadows use standard Tailwind `shadow-md`, `shadow-lg` instead of the required `--shadow-pixel` design tokens.

## Background

From the UX scan at `_bmad-output/ux-scan-results.md`:
- **Soft shadow violations found in design-tokens.css**
- Need to ensure all components use `--shadow-pixel` variables

Reference: `src/styles/design-tokens.css` (lines 149-154):
```css
--shadow-pixel: 2px 2px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-primary: 2px 2px 0px 0px #c2410c;
--shadow-pixel-sm: 1px 1px 0px 0px rgba(0, 0, 0, 0.5);
--shadow-pixel-inset: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.05),
                     inset -1px -1px 0px 0px rgba(0, 0, 0, 0.5);
```

## Technical Details

### Shadow Violations

| File | Line | Issue | Current |
|------|------|-------|---------|
| `src/styles/design-tokens.css` | 1 | Tailwind default | `shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)` |

### Shadow Pattern

```css
/* BEFORE (soft shadow - NOT 8-bit compliant) */
.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* AFTER (pixel shadow - 8-bit compliant) */
.shadow-md {
  box-shadow: var(--shadow-pixel);
}
```

### Available Shadow Tokens

| Token | Value | Use Case |
|-------|-------|----------|
| `--shadow-pixel` | `2px 2px 0px 0px rgba(0, 0, 0, 0.5)` | Default pixel shadow |
| `--shadow-pixel-primary` | `2px 2px 0px 0px #c2410c` | Primary color shadow |
| `--shadow-pixel-sm` | `1px 1px 0px 0px rgba(0, 0, 0, 0.5)` | Small pixel shadow |
| `--shadow-pixel-inset` | `inset 1px 1px...` | Inset pixel shadow |

## Acceptance Criteria

### AC-1: Tailwind Config Update
- [ ] Update `tailwind.config.js` to use `--shadow-pixel` for `shadow-md`, `shadow-lg`
- [ ] Remove or override default soft shadows

### AC-2: Component Audit
- [ ] Search for usage of `shadow-md`, `shadow-lg` in components
- [ ] Verify they now use pixel shadows
- [ ] Replace any hardcoded soft shadows with design tokens

### AC-3: Visual Verification
- [ ] Verify all shadows are pixel-style (hard edges, no blur)
- [ ] Verify no soft shadows remain
- [ ] Capture before/after screenshots

## Tasks

### Task 1: Update Tailwind Config (15 minutes)
- [ ] Update `tailwind.config.js` to override shadow utilities
- [ ] Map `shadow-md` to `--shadow-pixel`
- [ ] Map `shadow-lg` to `--shadow-pixel` or `--shadow-pixel-primary`

### Task 2: Component Audit (15 minutes)
- [ ] Search for `shadow-md`, `shadow-lg` usage
- [ ] Document findings
- [ ] Replace any non-compliant shadows

### Task 3: Visual Verification (30 minutes)
- [ ] Capture screenshots of components with shadows
- [ ] Verify pixel shadow style
- [ ] Document any remaining issues

## Implementation Notes

### Tailwind Config Override

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      boxShadow: {
        // Override default shadows with pixel shadows
        'md': '2px 2px 0px 0px rgba(0, 0, 0, 0.5)',
        'lg': '2px 2px 0px 0px rgba(0, 0, 0, 0.5)',
        'primary': '2px 2px 0px 0px #c2410c',
        'pixel': '2px 2px 0px 0px rgba(0, 0, 0, 0.5)',
        'pixel-sm': '1px 1px 0px 0px rgba(0, 0, 0, 0.5)',
      },
    },
  },
}
```

### Component Usage

```tsx
// Use pixel shadow classes
<div className="shadow-pixel">
  Content
</div>

// Or use mapped Tailwind utility
<div className="shadow-md">
  Content
</div>
```

## Dependencies

- None - can be implemented independently

## Testing Approach

### Visual Testing
- Open components with shadows
- Verify shadows have hard edges (no blur)
- Verify shadows are 2px offset

### Code Review
- Verify Tailwind config is updated
- Verify no hardcoded soft shadows remain

## Definition of Done

- [ ] Tailwind config updated with pixel shadows
- [ ] All shadows are pixel-style
- [ ] Visual verification passed
- [ ] Code reviewed and approved
- [ ] Handoff artifact created

## References

- **UX Scan Results:** `_bmad-output/ux-scan-results.md`
- **Design Tokens:** `src/styles/design-tokens.css`
- **Tailwind Config:** `tailwind.config.js`
- **8-bit Aesthetic:** `src/styles/design-tokens.css` (lines 149-154)

---

**Created:** 2026-01-09  
**Story Key:** UX-5
