# Story: Light Theme Token File

**Story ID**: LT-1.1
**Story Slug**: light-theme-token-file
**Sprint**: light-theme-sprint-2026-01-03
**Epic**: light-theme-implementation
**Status**: drafted
**Created**: 2026-01-03
**Estimated Hours**: 4h
**Assignee**: sm

---

## Story Header

**As a** developer,
**I want** a single CSS file containing all light theme color tokens,
**So that** components can reference theme-aware colors.

---

## Acceptance Criteria

### AC-1: File Created at Correct Location
**Requirement**: File created at `src/styles/light-theme-tokens.css`

**Validation**:
- [ ] File exists at `src/styles/light-theme-tokens.css`
- [ ] File is valid CSS (no syntax errors)
- [ ] File is UTF-8 encoded

### AC-2: All 78 Color Values Defined
**Requirement**: All 78 color values defined (11 primary + 11×4 semantic + 11 neutral + 12 surface)

**Validation**:
- [ ] Primary colors: 11 values (primary-50 through primary-950 + primary + primary-foreground)
- [ ] Semantic colors: 44 values (success, warning, destructive, info × 11 each)
- [ ] Neutral colors: 11 values (neutral-50 through neutral-950 + background + foreground)
- [ ] Surface colors: 12 values (background, card, popover, secondary, muted, accent, border, input, ring + their foregrounds)

### AC-3: Colors in HSL Format for CSS Custom Properties
**Requirement**: Colors in HSL format for CSS custom properties

**Validation**:
- [ ] All colors defined as `H S% L%` format
- [ ] No hex codes or RGB formats used
- [ ] Format matches: `--variable: 24.6 95% 53.1%` (H S L%)

### AC-4: `.light` Class Inherits from `:root` Values
**Requirement**: `.light` class inherits from `:root` values

**Validation**:
- [ ] `.light` selector defined
- [ ] All values defined in `:root` (not just `.light`)
- [ ] `.light` comments indicate inheritance from `:root`

### AC-5: All Values Match Foundation Document Specs
**Requirement**: All values match foundation document specs

**Validation**:
- [ ] Primary colors match `light-theme-design-system-foundation-2026-01-03.md` Section 1.1
- [ ] Semantic colors match Section 1.2
- [ ] Neutral colors match Section 1.3
- [ ] Surface colors match Section 1.4
- [ ] HSL values are identical to foundation document

---

## Tasks

### Task 1 (T1): Create File
**Description**: Create `src/styles/light-theme-tokens.css` file
**Estimated**: 15 minutes
**Dependencies**: None

Checklist:
- [ ] Navigate to `src/styles/` directory
- [ ] Create file `light-theme-tokens.css`
- [ ] Add file header comment with purpose
- [ ] Save file

### Task 2 (T2): Add Primary Color Tokens
**Description**: Add primary color tokens (primary-50 to primary-950)
**Estimated**: 30 minutes
**Dependencies**: T1

Checklist:
- [ ] Add `:root` selector
- [ ] Add `--primary: 24.6 95% 53.1%` (brand primary)
- [ ] Add `--primary-foreground: 0 0% 100%` (on primary)
- [ ] Add `--primary-50: 24.6 100% 96.5%`
- [ ] Add `--primary-100: 24.6 100% 91.8%`
- [ ] Add `--primary-200: 24.6 96.6% 83.1%`
- [ ] Add `--primary-300: 24.6 97.2% 72.4%`
- [ ] Add `--primary-400: 24.6 96.3% 61.2%`
- [ ] Add `--primary-500: 24.6 95% 53.1%`
- [ ] Add `--primary-600: 24.6 90.4% 48%`
- [ ] Add `--primary-700: 24.6 88.5% 40.4%`
- [ ] Add `--primary-800: 24.6 79% 32.7%`
- [ ] Add `--primary-900: 24.6 74.5% 27.8%`
- [ ] Add `--primary-950: 24.6 81.2% 14.5%`

### Task 3 (T3): Add Semantic Color Tokens
**Description**: Add semantic color tokens (success, warning, destructive, info)
**Estimated**: 60 minutes
**Dependencies**: T2

Checklist:
- [ ] Add success color tokens (11 values)
- [ ] Add warning color tokens (11 values)
- [ ] Add destructive color tokens (11 values)
- [ ] Add info color tokens (11 values)
- [ ] Each set includes: base, foreground, and 50-950 scale

### Task 4 (T4): Add Neutral Color Tokens
**Description**: Add neutral color tokens (neutral-50 to neutral-950)
**Estimated**: 30 minutes
**Dependencies**: T3

Checklist:
- [ ] Add `--background: 0 0% 98%` (primary background)
- [ ] Add `--foreground: 240 6% 10%` (primary text)
- [ ] Add `--neutral-50: 0 0% 98%`
- [ ] Add `--neutral-100: 0 0% 96%`
- [ ] Add `--neutral-200: 0 0% 90%`
- [ ] Add `--neutral-300: 0 0% 83%`
- [ ] Add `--neutral-400: 0 0% 64%`
- [ ] Add `--neutral-500: 0 0% 45%`
- [ ] Add `--neutral-600: 0 0% 32%`
- [ ] Add `--neutral-700: 0 0% 25%`
- [ ] Add `--neutral-800: 0 0% 15%`
- [ ] Add `--neutral-900: 0 0% 9%`
- [ ] Add `--neutral-950: 0 0% 4%`

### Task 5 (T5): Add Surface Color Tokens
**Description**: Add surface color tokens (background, card, popover, secondary, etc.)
**Estimated**: 30 minutes
**Dependencies**: T4

Checklist:
- [ ] Add `--card: 0 0% 100%`
- [ ] Add `--card-foreground: 240 6% 10%`
- [ ] Add `--popover: 0 0% 100%`
- [ ] Add `--popover-foreground: 240 6% 10%`
- [ ] Add `--secondary: 0 0% 96%`
- [ ] Add `--secondary-foreground: 240 6% 10%`
- [ ] Add `--muted: 0 0% 96%`
- [ ] Add `--muted-foreground: 0 0% 45%`
- [ ] Add `--accent: 0 0% 96%`
- [ ] Add `--accent-foreground: 240 6% 10%`
- [ ] Add `--border: 0 0% 90%`
- [ ] Add `--input: 0 0% 90%`
- [ ] Add `--ring: 24.6 95% 53.1%` (primary color)

### Task 6 (T6): Add `.light` Class Definition
**Description**: Add `.light` class definition
**Estimated**: 15 minutes
**Dependencies**: T5

Checklist:
- [ ] Add `.light` selector after `:root`
- [ ] Add comment indicating inheritance from `:root`
- [ ] Ensure no duplicate values inside `.light`

### Task 7 (T7): Import in Global CSS
**Description**: Import in `src/index.css` or `src/app/globals.css`
**Estimated**: 15 minutes
**Dependencies**: T6

Checklist:
- [ ] Identify main CSS entry file (`src/index.css` or `src/app/globals.css`)
- [ ] Add `@import './styles/light-theme-tokens.css';` after existing imports
- [ ] Verify import syntax is correct
- [ ] Save file

---

## Dev Notes

### Architecture Pattern

**CSS Custom Properties Approach**:
- Use HSL format for all color values: `H S% L%`
- All tokens defined in `:root` selector
- `.light` class inherits from `:root` (theme switching via class toggle)
- Follows WCAG 2.1 AA contrast requirements (4.5:1 minimum for normal text)

**HSL Format Notes**:
- Format: `--primary: 24.6 95% 53.1%` (Hue Saturation% Lightness%)
- Example mapping:
  - Primary 50: `24.6 100% 96.5%` → HSL(24.6, 100%, 96.5%)
  - Primary 500: `24.6 95% 53.1%` → HSL(24.6, 95%, 53.1%)
- This format is Tailwind CSS-compatible with `hsl(var(--primary))`

**Research Sources**:
- Tailwind CSS v4 CSS variables support: `@theme` blocks for color palettes
- Context7 research confirms `hsl(var(--variable))` pattern for theme switching
- Dark mode can use class-based toggle: `dark:` utilities with `.dark` class

### File Structure

```
src/styles/light-theme-tokens.css
├── :root (all 78 color tokens)
│   ├── Primary colors (13 values)
│   ├── Semantic colors (44 values)
│   ├── Neutral colors (13 values)
│   └── Surface colors (12 values)
└── .light (inherits from :root)
```

### Integration Points

**Global CSS Import**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './styles/design-tokens.css';
@import './styles/light-theme-tokens.css'; /* ← NEW */
```

**Tailwind Config** (Next step in LT-1.3):
```typescript
darkMode: ['class', '[data-theme="dark"]']
```

### Validation Criteria

- All values must match foundation document exactly
- File must be valid CSS (no syntax errors)
- Total of 78 color tokens defined
- No JavaScript imports needed (pure CSS)

---

## Research Requirements

### Context7: CSS Custom Properties Best Practices

**Query**: CSS custom properties best practices for theme switching

**Key Findings**:
1. **HSL Format**: Use `hsl(var(--variable))` pattern for color values
2. **Theme Switching**: Class-based toggle (`.light`, `.dark`) on `<html>` element
3. **Tailwind v4**: Supports `@theme` blocks with CSS custom properties
4. **Escape Hatch**: `--theme()` CSS function for accessing theme values

**Source Library**: `/websites/tailwindcss` (Context7)
- Benchmark Score: 76.3
- Code Snippets: 2089
- Source Reputation: High

### DeepWiki: Tailwind CSS Color Configuration

**Query**: How do I configure color palette with CSS custom properties for theme switching?

**Key Findings**:
1. **@theme Blocks**: Define color palettes using `@theme` at-rules
2. **Naming Convention**: Use `--color-*` prefix for color tokens
3. **Output Format**: CSS custom properties in `:root, :host` selectors
4. **Theme Switching**: Different `@theme` blocks for different conditions
5. **Opacity Handling**: Supports `<alpha-value>` placeholders

**Source**: `tailwindlabs/tailwindcss` (DeepWiki)
- Wiki section: Core Architecture → Theme System and CSS Functions

---

## References

### Foundation Document
- **Title**: Light Theme Design System - Foundation
- **Location**: `_bmad-output/light-theme-design-system/light-theme-design-system-foundation-2026-01-03.md`
- **Relevant Sections**:
  - Section 1.1: Primary Colors (lines 28-58)
  - Section 1.2: Semantic Colors (lines 60-135)
  - Section 1.3: Neutral Colors (lines 137-162)
  - Section 1.4: Surface Colors (lines 166-193)

### Handoff Document
- **Title**: Light Theme Developer Handoff Specifications (Part 1)
- **Location**: `_bmad-output/light-theme-design-system/light-theme-developer-handoff-part1-2026-01-03.md`
- **Relevant Sections**:
  - Section 2.1: Light Theme Token File (lines 78-195)
  - Section 2.3: Global CSS Import (lines 235-252)

### Sprint Plan
- **Title**: Light Theme Implementation Sprint Plan
- **Location**: `_bmad-output/light-theme-design-system/light-theme-sprint-plan-2026-01-03.md`
- **Relevant Sections**:
  - Phase 1: Foundation Setup (lines 30-73)
  - Story LT-1.1 Details (lines 160-188)

### External Documentation
- **Tailwind CSS v4**: https://tailwindcss.com/blog/tailwindcss-v4-alpha
- **CSS Custom Properties**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Status

**Current Status**: drafted

**Workflow Progress**:
- [x](create-story): Complete
- [ ] validate-create-story: Pending
- [ ] create-context: Pending
- [ ] dev-story: Pending
- [ ] code-review: Pending
- [ ] loop: Pending
- [ ] notes: Pending
- [ ] done: Pending

**Story Dependencies**:
- None (Foundation story)

**Dependent Stories**:
- LT-1.2: Update design-tokens.css with transition styles
- LT-1.3: Update Tailwind config for class-based themes

---

## Handoff Notes

### For Validation Agent
- Ensure all 78 color tokens are present
- Verify HSL format matches foundation document exactly
- Check file is UTF-8 encoded
- Validate CSS syntax is correct

### For Developer Agent
- Follow task sequence T1 → T7
- Use foundation document Section 1 as source of truth for color values
- DO NOT import this file via JavaScript (let CSS handle it)
- All tokens go in `:root`, `.light` just inherits

**Story Complete When**:
- All acceptance criteria pass (100% validation)
- File created at correct location
- Import added to global CSS
- Zero TypeScript errors
- Zero CSS syntax errors

---

**END OF STORY FILE**