# STORY-001: Create Light Theme Token File

## Story Metadata

| Field | Value |
|-------|-------|
| **Story ID** | LT-1.1 |
| **Story Number** | 1 |
| **Sprint** | LT-2026-01-03 |
| **Phase** | Week 1: Foundation Setup |
| **Status** | In Context Creation |
| **Priority** | P0 |
| **Estimated Hours** | 4 hours |
| **Assignee** | light-theme-sm-agent |
| **Dependencies** | None |
| **Created At** | 2026-01-03T00:00:00Z |

---

## User Story

**As a developer**, I want a single CSS file containing all light theme color tokens, so that components can reference theme-aware colors without hardcoded values.

---

## Acceptance Criteria

### AC-1: File Location
- [ ] File created at `src/styles/light-theme-tokens.css`
- [ ] File follows the project's CSS architecture pattern

### AC-2: All Color Values Defined
- [ ] All 78 color values defined in CSS custom properties
- [ ] Primary colors (11 stops): `--primary-50` through `--primary-950` plus `--primary`
- [ ] Semantic colors (11×4 = 44 colors): success, warning, destructive, info
- [ ] Neutral colors (11 stops): `--neutral-50` through `--neutral-950`
- [ ] Surface colors (12 values): background, card, popover, secondary, muted, accent, border, input, ring

### AC-3: Color Format
- [ ] Colors defined in HSL format for CSS custom properties
- [ ] Format: `--color-name: H S% L%` (e.g., `--primary: 24.6 95% 53.1%`)
- [ ] All values validated against design system specification

### AC-4: Light Class Definition
- [ ] `.light` class selector defined
- [ ] `.light` inherits from `:root` or defines all light-specific values
- [ ] Direct `:root` and `[data-theme="light"]` selectors also supported

### AC-5: Design System Compliance
- [ ] All values match `light-theme-design-system-foundation-2026-01-03.md` specification
- [ ] WCAG 2.1 AA contrast ratios verified (>4.5:1 for critical combinations)
- [ ] No typos or missing values

### AC-6: Integration
- [ ] File imported in `src/index.css` or `src/app/globals.css`
- [ ] No syntax errors in CSS
- [ ] CSS variables accessible to all components
- [ ] Zero TypeScript errors

---

## Tasks

### T1: Create File Structure
- [ ] Create `src/styles/light-theme-tokens.css` file
- [ ] Add file header with description
- [ ] Ensure proper CSS syntax

### T2: Define Primary Colors
- [ ] Add primary color tokens (50-950 plus primary)
- [ ] Values: #fff7ed through #431407 based on foundation doc
- [ ] Verify HSL conversion accuracy

### T3: Define Semantic Colors
- [ ] Add success colors (11 stops)
- [ ] Add warning colors (11 stops)
- [ ] Add destructive colors (11 stops)
- [ ] Add info colors (11 stops)

### T4: Define Neutral Colors
- [ ] Add neutral color tokens (11 stops)
- [ ] Values: #fafafa through #0a0a0a

### T5: Define Surface Colors
- [ ] Add surface color variables (background, card, popover, etc.)
- [ ] Add foreground color variables for each surface
- [ ] Verify contrast ratios

### T6: Add Theme Selectors
- [ ] Add `.light` class selector
- [ ] Add `:root` selector (defaults)
- [ ] Add `[data-theme="light"]` selector
- [ ] Ensure all selectors contain complete token sets

### T7: Import and Test
- [ ] Import file in `src/index.css` or `src/app/globals.css`
- [ ] Verify CSS variables load in DevTools
- [ ] Test basic component referencing tokens
- [ ] Run `pnpm tsc --noEmit` to verify no errors

---

## Design References

### Design Artifacts
- **Foundation Document**: `_bmad-output/light-theme-design-system/light-theme-design-system-foundation-2026-01-03.md`
  - Section 1.1: Primary Colors (lines 28-56)
  - Section 1.2: Semantic Colors (lines 60-135)
  - Section 1.3: Neutral Colors (lines 138-163)
  - Section 1.4: Surface Colors (lines 166-194)
  - Section 1.5: WCAG Compliance Summary (lines 196-200)

### Color Values
**Primary Colors (12 values)**:
```css
--primary-50: 24.6 100% 96.5%;
--primary-100: 24.6 100% 91.8%;
--primary-200: 24.6 96.6% 83.1%;
--primary-300: 24.6 97.2% 72.4%;
--primary-400: 24.6 96.3% 61.2%;
--primary: 24.6 95% 53.1%;
--primary-600: 24.6 90.4% 48%;
--primary-700: 24.6 88.5% 40.4%;
--primary-800: 24.6 79% 32.7%;
--primary-900: 24.6 74.5% 27.8%;
--primary-950: 24.6 81.2% 14.5%;
```

**Success Colors (11 values)**:
```css
--success-50: 142 76% 96.7%;
--success-100: 142 71% 92.5%;
--success-200: 142 70% 85.1%;
--success-300: 142 78% 73.1%;
--success-400: 142 70% 58%;
--success: 142 71% 45.3%;
--success-600: 142 76% 36.3%;
--success-700: 142 72% 29.2%;
--success-800: 142 64% 24.1%;
--success-900: 142 61% 20.2%;
--success-950: 142 80% 10%;
```

**Warning Colors (11 values)**:
```css
--warning-50: 38 100% 96.3%;
--warning-100: 38 96% 88.8%;
--warning-200: 38 97% 76.7%;
--warning-300: 38 96% 64.7%;
--warning-400: 38 96% 56.3%;
--warning: 38 92% 50.2%;
--warning-600: 38 95% 43.7%;
--warning-700: 38 91% 36.9%;
--warning-800: 38 83% 31.4%;
--warning-900: 38 78% 26.5%;
--warning-950: 38 92% 14.1%;
```

**Destructive Colors (11 values)**:
```css
--destructive-50: 0 100% 97.3%;
--destructive-100: 0 100% 94.1%;
--destructive-200: 0 100% 89.4%;
--destructive-300: 0 94% 81.8%;
--destructive-400: 0 91% 70.8%;
--destructive: 0 84% 60.2%;
--destructive-600: 0 70% 50.6%;
--destructive-700: 0 74% 41.8%;
--destructive-800: 0 70% 35.3%;
--destructive-900: 0 63% 30.6%;
--destructive-950: 0 75% 15.5%;
```

**Info Colors (11 values)**:
```css
--info-50: 217 100% 96.9%;
--info-100: 217 94% 92.7%;
--info-200: 217 97% 87.3%;
--info-300: 217 96% 78.4%;
--info-400: 217 94% 68%;
--info: 217 91% 59.8%;
--info-600: 217 83% 53.3%;
--info-700: 217 76% 48%;
--info-800: 217 71% 40.2%;
--info-900: 217 64% 32.9%;
--info-950: 217 57% 21%;
```

**Neutral Colors (11 values)**:
```css
--neutral-50: 0 0% 98%;
--neutral-100: 0 0% 96%;
--neutral-200: 0 0% 90%;
--neutral-300: 0 0% 83%;
--neutral-400: 0 0% 64%;
--neutral-500: 0 0% 45%;
--neutral-600: 0 0% 32%;
--neutral-700: 0 0% 25%;
--neutral-800: 0 0% 15%;
--neutral-900: 0 0% 9%;
--neutral-950: 0 0% 4%;
```

**Surface Colors (12 values)**:
```css
--background: 0 0% 100%;
--foreground: 240 6% 6.7%;
--card: 0 0% 100%;
--card-foreground: 240 6% 6.7%;
--popover: 0 0% 100%;
--popover-foreground: 240 6% 6.7%;
--secondary: 0 0% 96%;
--secondary-foreground: 240 6% 6.7%;
--muted: 0 0% 96%;
--muted-foreground: 0 0% 45%;
--accent: 0 0% 96%;
--accent-foreground: 240 6% 6.7%;
--border: 0 0% 90%;
--input: 0 0% 90%;
--ring: 24.6 95% 53.1%;
```

---

## Technical Approach

### File Structure
The CSS file should follow this pattern:
```css
/**
 * Light Theme Design Tokens
 *
 * This file defines all CSS custom properties for the light theme.
 * All colors are in HSL format for hue manipulation.
 */

:root,
[data-theme="light"],
.light {
  /* Primary Colors */
  --primary: 24.6 95% 53.1%;
  --primary-50: 24.6 100% 96.5%;
  /* ... all 78 colors ... */
}
```

### Naming Convention
- Color tokens: `--color-name` or `--color-scale-value`
- Primary: `--primary` (main), `--primary-50` through `--primary-950`
- Semantic: `--success`, `--warning`, `--destructive`, `--info`
- Neutral: `--neutral-50` through `--neutral-950`
- Surface: Use semantic names (background, card, etc.)

### CSS Variables vs. Custom Properties
- Use CSS custom properties (variables) for all token values
- Format: `--token-name: H S% L%`
- Example usage: `var(--primary)` for current primary color

---

## Dependencies

- ✅ None (first story in sprint)
- ✅ All design artifacts available and verified
- ✅ Project structure ready for new file

---

## Prerequisites

- ✅ Design tokens extracted from `light-theme-design-system-foundation-2026-01-03.md`
- ✅ HSL conversion values validated
- ✅ WCAG contrast ratios verified
- ✅ No blocking issues

---

## Risks and Mitigation

### Risk 1: Design Token Changes
- **Impact**: Medium
- **Likelihood**: Low
- **Mitigation**: Design tokens are finalized in foundation document
- **Action**: Use flexible structure to allow easy updates

### Risk 2: HSL Conversion Errors
- **Impact**: Medium
- **Likelihood**: Low
- **Mitigation**: All HSL values provided in foundation doc
- **Action**: Validate against hex values during testing

### Risk 3: Missing Tokens
- **Impact**: High
- **Likelihood**: Very Low
- **Mitigation**: Checklist of 78 tokens to verify
- **Action**: Count tokens in final file (should be exactly 78)

---

## Definition of Done

- [ ] All 7 acceptance criteria met
- [ ] All 7 tasks completed
- [ ] File created at correct location
- [ ] File imported in project
- [ ] No TypeScript errors
- [ ] No CSS syntax errors
- [ ] All tokens accessible in DevTools
- [ ] Values match specification 100%
- [ ] Story context validated
- [ ] Context document created

---

## Notes

### Developer Notes
- **DO NOT import this file directly via JavaScript** - let CSS handle it naturally
- Use `@import` or add `<link>` tag in main CSS file
- All values are in HSL format: `H S% L%` (Hue, Saturation%, Lightness%)
- Dark theme already exists at `src/styles/dark-theme.css` (reference only)

### Design Notes
- Primary color: Orange (#f97316) - matches brand identity
- All semantic colors use WCAG AA compliant contrast ratios
- Neutral colors optimized for readability on light backgrounds
- Surface colors work with component layering (background → card → popover)

### Testing Notes
- Use Chrome DevTools → Elements → Computed to verify CSS variables
- Use axe DevTools to validate color contrast
- Test in multiple browsers (Chrome, Firefox, Safari)
- Verify no FOUC (Flash of Unstyled Content) on page load

---

## Handoff Information

**Created By**: light-theme-sm-agent (bmad-master)
**Created At**: 2026-01-03T00:00:00Z
**Next Owner**: light-theme-dev-agent (after context validation)
**Handoff Status**: Pending Context Creation

---

## Status

**Current Status**: In Context Creation
**Validation Status**: Not Yet Validated
**Implementation Status**: Not Started
**Code Review Status**: Not Submitted

---

**END OF STORY-001**