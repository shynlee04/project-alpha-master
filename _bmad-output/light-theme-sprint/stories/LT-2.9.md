# LT-2.9 Story File

## Story Metadata
| Field | Value |
|-------|-------|
| **Story ID** | LT-2.9 |
| **Title** | Migrate Input Component |
| **Priority** | P0 |
| **Estimated Hours** | 3 |
| **Dependencies** | LT-1.7 (complete) |
| **Status** | drafted |
| **Assignee** | light-theme-dev-agent |
| **Sprint** | LT-2026-01-03 (Week 2: P0 Components) |

---

## User Story

**As a** user of the Via-gent application  
**I want** the Input component to support light theme with proper color theming  
**So that** I can have a consistent and accessible visual experience in both light and dark modes

---

## Story Description

Update the Input component (`src/components/ui/input.tsx`) to use CSS custom properties for all color values, ensuring proper light/dark theme support while maintaining the 8-bit aesthetic and WCAG 2.1 AA accessibility compliance.

---

## Acceptance Criteria

| ID | Criterion | Given | When | Then |
|----|-----------|-------|------|------|
| **AC-1** | Default state colors | User opens form in light theme | Input renders | Input has white background, neutral-300 border, neutral-600 text |
| **AC-2** | Hover state colors | User hovers over input | Input receives hover | Border changes to neutral-400, background remains white |
| **AC-3** | Focus state colors | User clicks/focuses input | Input receives focus | Border changes to primary, focus ring appears (3px rgba) |
| **AC-4** | Disabled state colors | Input is disabled | Input renders | Background is neutral-50, text is neutral-400, no pointer events |
| **AC-5** | Error state colors | Input has validation error | Input renders | Border is destructive red, focus ring is rgba(destructive) |
| **AC-6** | CSS variables used | Developer inspects component | Component renders | All color values use CSS custom properties (e.g., `var(--primary)`) |
| **AC-7** | Dark theme works | User toggles to dark theme | Input renders | Input maintains proper dark theme appearance (no regression) |
| **AC-8** | Accessibility | User uses screen reader | Input renders | Label properly associated via `htmlFor` or `aria-label` |

---

## Task Breakdown

### Research & Planning
- [ ] T1: Read current Input component implementation
- [ ] T2: Review light theme specifications (Section 2.2)
- [ ] T3: Verify design tokens exist in light-theme-tokens.css

### Implementation
- [ ] T4: Update CVA variants to use CSS variables for all states
- [ ] T5: Update border colors in default/hover/focus/disabled/error states
- [ ] T6: Add/update focus ring with primary color
- [ ] T7: Update placeholder color to use CSS variable

### Testing
- [ ] T8: Test in light theme (all states)
- [ ] T9: Test in dark theme (verify no regression)
- [ ] T10: Verify accessibility (focus indicators, labels)

### Documentation
- [ ] T11: Document any issues or deviations
- [ ] T12: Update story status to done

---

## Research Requirements

### Required MCP Tool Queries

| Tool | Query | Purpose |
|------|-------|---------|
| **Context7** | "React Input component patterns with CSS variables" | Verify best practices for theme-aware inputs |
| **Context7** | "clsx/cva input component styling" | Confirm CVA usage patterns |
| **DeepWiki** | "shadcn/ui input component GitHub" | Review existing implementations |
| **Tavily** | "CSS custom properties theming React components 2025" | Find latest patterns |

---

## Dev Notes

### Architecture Patterns

The Input component follows these patterns from `docs/architecture.md`:
- Uses **CVA (Class Variance Authority)** for variant management
- Uses **clsx** and **tailwind-merge** for class composition
- Follows **single-responsibility** principle (one component, multiple variants)
- Uses **CSS custom properties** for theme-aware styling

### Component Location

- **Primary File**: `src/components/ui/input.tsx`
- **Related Files**:
  - `src/lib/utils.ts` - Contains `cn` utility
  - `src/styles/light-theme-tokens.css` - Light theme design tokens
  - `src/styles/design-tokens.css` - Dark theme design tokens

### Implementation Approach

The Input component currently uses Tailwind utility classes for styling. The migration to CSS custom properties involves:

1. Replace hardcoded color values with CSS variables
2. Ensure focus ring uses `var(--ring)` with opacity
3. Maintain 4px border radius for consistency with 8-bit aesthetic
4. Use `h-[var(--height)]` for size variants

### Current CVA Pattern (Lines 18-45)

```typescript
const inputVariants = cva(
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

### Light Theme Spec Reference

| State | Background | Foreground | Border | Focus Ring |
|-------|-----------|------------|--------|------------|
| Default | White | `--foreground` | 1.5px `--input` | None |
| Hover | White | `--foreground` | 1.5px `--border` | None |
| Focus | White | `--foreground` | 1.5px `--primary` | 0 0 0 3px `--primary` (12%) |
| Disabled | `--neutral-50` | `--neutral-400` | 1.5px `--neutral-200` | None |
| Error | White | `--foreground` | 1.5px `--destructive` | 0 0 0 3px `--destructive` (12%) |

---

## Design Reference Documents

- **Component Specifications**: `_bmad-output/light-theme-design-system/light-theme-component-specifications-part1-2026-01-03.md` (Section 2.2)
- **Design System Foundation**: `_bmad-output/light-theme-design-system/light-theme-design-system-foundation-2026-01-03.md`
- **Developer Handoff**: `_bmad-output/light-theme-design-system/light-theme-developer-handoff-part1-2026-01-03.md`

---

## Dev Agent Record

**Agent:** [To be assigned]
**Session:** [Date/Time]

### Task Progress
- [ ] T1: Read current Input component implementation
- [ ] T2: Review light theme specifications
- [ ] T3: Verify design tokens exist
- [ ] T4: Update CVA variants with CSS variables
- [ ] T5: Update border colors
- [ ] T6: Add/update focus ring
- [ ] T7: Update placeholder color
- [ ] T8: Test in light theme
- [ ] T9: Test in dark theme
- [ ] T10: Verify accessibility
- [ ] T11: Document issues
- [ ] T12: Update story status

### Research Executed
- [ ] Context7: [Query] → [Finding]
- [ ] DeepWiki: [Repo] → [Pattern]
- [ ] Tavily: [Query] → [Finding]

### Files Changed
| File | Action | Lines |
|------|--------|-------|
| `src/components/ui/input.tsx` | Modified | +XX/-XX |

### Decisions Made
- Decision 1: [Rationale]

---

## Code Review

**Reviewer:** [Name]
**Date:** [Date]

### Checklist:
- [ ] All ACs verified
- [ ] All tests passing
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable

### Issues Found:
- Issue 1: [Description] → [Resolution]

### Sign-off:
✅ APPROVED / ❌ REJECTED

---

## Status History

| Date | Agent | Status | Notes |
|------|-------|--------|-------|
| 2026-01-04 | SM Agent | drafted | Story file created |
| | | | |
| | | | |

---

**Document Version:** 1.0  
**Created:** 2026-01-04  
**Last Updated:** 2026-01-04  
**Author:** SM Agent
