# STORY-001 Context Document
# Created by: light-theme-sm-agent
# Story: Create Light Theme Token File
# Date: 2026-01-03

---

## Context Summary

This context document provides all necessary information for the Dev agent to implement STORY-001: Create Light Theme Token File.

---

## Story Information

| Field | Value |
|-------|-------|
| **Story ID** | LT-1.1 |
| **Story Number** | 1 |
| **Title** | Create Light Theme Token File |
| **Priority** | P0 |
| **Estimation** | 4 hours |
| **Sprint** | LT-2026-01-03 |
| **Phase** | Week 1: Foundation |
| **Worker** | light-theme-dev-agent |

---

## Acceptance Criteria Summary

1. **AC-1**: File created at `src/styles/light-theme-tokens.css`
2. **AC-2**: All 78 color values defined (11 primary + 44 semantic + 11 neutral + 12 surface)
3. **AC-3**: Colors in HSL format (H S% L%)
4. **AC-4**: `.light` class inherits from `:root` values
5. **AC-5**: All values match foundation specification
6. **AC-6**: Zero TypeScript errors

---

## Design References

### Design Artifacts Source:
```
_bmad-output/light-theme-design-system/light-theme-design-system-foundation-2026-01-03.md
```

### References:
- Section 1.1: Primary Colors (lines 28-56)
- Section 1.2: Semantic Colors (lines 60-135)
- Section 1.3: Neutral Colors (lines 138-163)
- Section 1.4: Surface Colors (lines 166-194)

---

## Technical Approach

### File Structure
```css
/**
 * Light Theme Design Tokens
 */

:root,
[data-theme="light"],
.light {
  /* Primary Colors (12 tokens) */
  --primary: 24.6 95% 53.1%;
  --primary-50: 24.6 100% 96.5%;
  --primary-100: 24.6 100% 91.8%;
  --primary-200: 24.6 96.6% 83.1%;
  --primary-300: 24.6 97.2% 72.4%;
  --primary-400: 24.6 96.3% 61.2%;
  --primary-500: 24.6 95% 53.1%;  /* Same as --primary */
  --primary-600: 24.6 90.4% 48%;
  --primary-700: 24.6 88.5% 40.4%;
  --primary-800: 24.6 79% 32.7%;
  --primary-900: 24.6 74.5% 27.8%;
  --primary-950: 24.6 81.2% 14.5%;

  /* Success Colors (11 tokens) */
  --success: 142 71% 45.3%;
  --success-50: 142 76% 96.7%;
  --success-100: 142 71% 92.5%;
  --success-200: 142 70% 85.1%;
  --success-300: 142 78% 73.1%;
  --success-400: 142 70% 58%;
  --success-600: 142 76% 36.3%;
  --success-700: 142 72% 29.2%;
  --success-800: 142 64% 24.1%;
  --success-900: 142 61% 20.2%;
  --success-950: 142 80% 10%;

  /* Warning Colors (11 tokens) */
  --warning: 38 92% 50.2%;
  --warning-50: 38 100% 96.3%;
  --warning-100: 38 96% 88.8%;
  --warning-200: 38 97% 76.7%;
  --warning-300: 38 96% 64.7%;
  --warning-400: 38 96% 56.3%;
  --warning-600: 38 95% 43.7%;
  --warning-700: 38 91% 36.9%;
  --warning-800: 38 83% 31.4%;
  --warning-900: 38 78% 26.5%;
  --warning-950: 38 92% 14.1%;

  /* Destructive Colors (11 tokens) */
  --destructive: 0 84% 60.2%;
  --destructive-50: 0 100% 97.3%;
  --destructive-100: 0 100% 94.1%;
  --destructive-200: 0 100% 89.4%;
  --destructive-300: 0 94% 81.8%;
  --destructive-400: 0 91% 70.8%;
  --destructive-600: 0 70% 50.6%;
  --destructive-700: 0 74% 41.8%;
  --destructive-800: 0 70% 35.3%;
  --destructive-900: 0 63% 30.6%;
  --destructive-950: 0 75% 15.5%;

  /* Info Colors (11 tokens) */
  --info: 217 91% 59.8%;
  --info-50: 217 100% 96.9%;
  --info-100: 217 94% 92.7%;
  --info-200: 217 97% 87.3%;
  --info-300: 217 96% 78.4%;
  --info-400: 217 94% 68%;
  --info-600: 217 83% 53.3%;
  --info-700: 217 76% 48%;
  --info-800: 217 71% 40.2%;
  --info-900: 217 64% 32.9%;
  --info-950: 217 57% 21%;

  /* Neutral Colors (11 tokens) */
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

  /* Surface Colors (15 tokens) */
  --background: 0 0% 100%;              /* #ffffff */
  --foreground: 240 6% 6.7%;            /* #0f0f11 */
  --card: 0 0% 100%;                    /* #ffffff */
  --card-foreground: 240 6% 6.7%;       /* #0f0f11 */
  --popover: 0 0% 100%;                 /* #ffffff */
  --popover-foreground: 240 6% 6.7%;   /* #0f0f11 */
  --secondary: 0 0% 96%;                /* #f5f5f5 */
  --secondary-foreground: 240 6% 6.7%;  /* #0f0f11 */
  --muted: 0 0% 96%;                    /* #f5f5f5 */
  --muted-foreground: 0 0% 45%;         /* #737373 */
  --accent: 0 0% 96%;                   /* #f5f5f5 */
  --accent-foreground: 240 6% 6.7%;     /* #0f0f11 */
  --border: 0 0% 90%;                   /* #e5e5e5 */
  --input: 0 0% 90%;                    /* #e5e5e5 */
  --ring: 24.6 95% 53.1%;               /* #f97316 */
}
```

### Token Count Verification

| Category | Tokens | Count |
|----------|--------|-------|
| **Primary** | primary-50 to primary-950 + primary | 12 |
| **Success** | success-50 to success-950 + success | 11 |
| **Warning** | warning-50 to warning-950 + warning | 11 |
| **Destructive** | destructive-50 to destructive-950 + destructive | 11 |
| **Info** | info-50 to info-950 + info | 11 |
| **Neutral** | neutral-50 to neutral-950 | 11 |
| **Surface** | background, foreground, card, card-foreground, popover, popover-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, border, input, ring | 15 |
| **Total** | | 78 |

---

## Implementation Steps

### Step 1: Create CSS File (10 min)
- Create `src/styles/light-theme-tokens.css`
- Add file header with description
- Open with proper CSS structure

### Step 2: Add Color Tokens (60 min)
- Add `:root, [data-theme="light"], .light` selector
- Define all 78 CSS custom properties
- Use exact HSL values from context above
- Format with consistent indentation

### Step 3: Verify Token Count (10 min)
- Count tokens in file
- Verify exactly 78 tokens present
- Cross-reference with spec

### Step 4: Import File (10 min)
- Add `@import './styles/light-theme-tokens.css';` to `src/index.css` or `src/app/globals.css`
- Or add as `<link rel="stylesheet" href="/styles/light-theme-tokens.css">`
- Verify file loads correctly

### Step 5: Test (15 min)
- Open DevTools → Elements → Computed
- Check CSS variables are accessible
- Verify values match specification
- Test in light mode: `document.documentElement.setAttribute('data-theme', 'light')`

### Step 6: Validate (10 min)
- Run `pnpm tsc --noEmit`
- Verify no TypeScript errors
- Verify no CSS syntax errors
- Check for no duplicate tokens

---

## Validation Checklist

### Code Quality
- [ ] CSS syntax is valid
- [ ] No duplicate CSS properties
- [ ] Proper indentation and formatting
- [ ] File header documentation complete

### Completeness
- [ ] All 78 tokens present
- [ ] All HSL values match specification
- [ ] All three selectors defined (`:root`, `[data-theme="light"]`, `.light`)
- [ ] File imported in project

### Integration
- [ ] CSS variables accessible in DevTools
- [ ] No conflicts with existing styles
- [ ] Zero TypeScript errors
- [ ] CSS file loads without errors

---

## Dependencies

- ✅ None (first story)
- ✅ All design tokens provided
- ✅ Project structure ready

---

## Requirements

### Must Have (P0)
- File created at `src/styles/light-theme-tokens.css`
- All 78 CSS custom properties defined
- All values in HSL format
- All values match specification
- File imported in project
- Zero TypeScript errors

### Should Have
- File properly documented with header
- Consistent formatting and indentation
- Token count verified with 78 tokens

### Nice to Have
- Comments grouping related tokens
- Color group headers for readability

---

## Risks and Mitigation

### Risk 1: Missing Tokens
- **Mitigation**: Count tokens (must be exactly 78)
- **Check**: Use `grep -c "^  --" src/styles/light-theme-tokens.css`

### Risk 2: Wrong HSL Values
- **Mitigation**: Cross-reference with foundation doc
- **Check**: Spot check critical colors (primary, success, warning, error, info)

### Risk 3: Import Issues
- **Mitigation**: Verify file path and syntax
- **Check**: Check DevTools Network tab for 404 errors

---

## Testing Strategy

### Manual Testing
1. Open Chrome DevTools → Elements
2. Find `<html>` element
3. View Computed CSS
4. Check `--primary` value is `24.6 95% 53.1%`
5. Check `--background` value is `0 0% 100%`
6. Verify `--success`, `--warning`, `--destructive`, `--info` match spec
7. Count all tokens in list (should be 78)

### Verification
1. Run `pnpm tsc --noEmit` - expect 0 errors
2. Run `pnpm build` - should succeed
3. Check console for no errors

---

## Deliverables

- [ ] `src/styles/light-theme-tokens.css` file (78 tokens)
- [ ] File imported in `src/index.css` or `src/app/globals.css`
- [ ] All acceptance criteria met
- [ ] All tasks completed
- [ ] Zero TypeScript errors

---

## Handoff Info

**Handoff From**: light-theme-sm-agent
**Handoff To**: light-theme-dev-agent
**Story**: STORY-001 (LT-1.1)
**Status**: Ready for Implementation
**Context Created**: 2026-01-03T00:00:00Z

---

**END OF CONTEXT DOCUMENT**