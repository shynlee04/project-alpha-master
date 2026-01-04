# LT-FIX-1: Fix Tabs Component Hardcoded Theme Bug

## Story Metadata
| Field | Value |
|-------|-------|
| **Story ID** | LT-FIX-1 |
| **Title** | Fix Tabs Component Hardcoded Theme Bug |
| **Priority** | P0 (Critical) |
| **Sprint** | Light Theme Sprint |
| **Status** | drafted |
| **Created** | 2026-01-04T08:00:00Z |
| **Story Type** | Bug Fix |

## User Story

**As a** user of the Via-gent application  
**I want** the theme toggle to properly switch between light and dark modes  
**So that** I can use the application with my preferred visual theme

## Problem Statement

The sidebar theme toggle appears to work (no console errors), but the UI does not visually change when toggling themes. Investigation reveals the Tabs component has a hardcoded `theme: 'dark'` value that bypasses the CSS cascade entirely.

## Root Cause Analysis

**File**: `src/presentation/components/ui/tabs.tsx`
**Line**: 125

```typescript
// CURRENT (BUG):
className={cn(tabsListVariants({ orientation, theme: 'dark' }), className)}

// SHOULD BE (dynamic):
className={cn(tabsListVariants({ orientation, theme: isDark ? 'dark' : 'light' }), className)}
```

**Impact**: Even when the `.light` class is added to `<html>` by the theme toggle, the Tabs component always renders with dark theme styles because the theme is hardcoded.

## Acceptance Criteria

| AC ID | Description | Validation |
|-------|-------------|------------|
| AC-1 | Tabs component reads theme state dynamically | Theme changes visible in Tabs |
| AC-2 | Light theme renders correctly in Tabs | `.light` class produces light styles |
| AC-3 | Dark theme continues to work | `.dark` class produces dark styles |
| AC-4 | No TypeScript errors after fix | `pnpm typecheck` passes |
| AC-5 | Accessibility maintained | Focus indicators visible in both themes |
| AC-6 | Transitions work smoothly | Theme switch animates correctly |

## Tasks

### Research Tasks
- [ ] R1: Read next-themes documentation for `useTheme` hook usage
- [ ] R2: Check existing theme toggle pattern in `ThemeToggle.tsx`
- [ ] R3: Review CSS variables for tabs in `design-tokens.css`

### Implementation Tasks
- [ ] T1: Import `useTheme` from `next-themes` in tabs.tsx
- [ ] T2: Get `resolvedTheme` state in TabsList component
- [ ] T3: Change hardcoded `theme: 'dark'` to dynamic `theme: isDark ? 'dark' : 'light'`
- [ ] T4: Verify tabsListVariants CSS for light theme
- [ ] T5: Add light theme CSS overrides if missing (success, warning, info colors)

### Validation Tasks
- [ ] V1: Test theme toggle with browser DevTools
- [ ] V2: Verify light theme renders correctly
- [ ] V3: Verify dark theme still works
- [ ] V4: Run `pnpm typecheck` - no errors
- [ ] V5: Run `pnpm lint` - no errors

## Dev Notes

### Architecture Pattern
Follow the pattern established in `ThemeToggle.tsx`:
```typescript
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // ...
}
```

### Technical Context
- **Theme Provider**: `src/presentation/components/ui/ThemeProvider.tsx`
- **Theme Toggle**: `src/presentation/components/ui/ThemeToggle.tsx`
- **CSS Tokens**: `src/styles/design-tokens.css` (`.light` class at line 290)

### Related Files
- `src/styles/light-theme-tokens.css` - Light theme CSS custom properties
- `src/styles/design-tokens.css` - Dark theme + `.light` overrides

### Research Requirements
This story requires research on:
1. How `next-themes` `useTheme` hook provides `resolvedTheme`
2. Best practices for dynamic theme classes in Radix UI components
3. CSS variable patterns for tabs (already defined in tabs.tsx)

---

## Dev Agent Record

**Agent:** BMAD Master Orchestrator (executing story-dev-cycle)
**Session:** 2026-01-04T08:00:00Z

#### Task Progress:
- [ ] R1: Research next-themes documentation
- [ ] R2: Review ThemeToggle pattern
- [ ] R3: Check CSS variables
- [ ] T1: Import useTheme
- [ ] T2: Get resolvedTheme
- [ ] T3: Fix hardcoded theme
- [ ] T4: Verify CSS
- [ ] T5: Add missing overrides
- [ ] V1-V5: Validation tasks

#### Research Executed:
- [ ] Context7: next-themes API
- [ ] DeepWiki: Radix UI theme patterns

#### Files Changed:
| File | Action | Lines |
|------|--------|-------|
| src/presentation/components/ui/tabs.tsx | Modified | TBD |

#### Tests Created:
- [ ] Visual testing checklist

#### Decisions Made:
- Decision 1: Use `resolvedTheme` from next-themes (more accurate than `theme`)

---

## Code Review

**Reviewer:** 
**Date:** 

#### Checklist:
- [ ] All ACs verified
- [ ] All validation tasks complete
- [ ] Architecture patterns followed
- [ ] No TypeScript errors
- [ ] Code quality acceptable
- [ ] Accessibility maintained

#### Issues Found:
- Issue 1: 

#### Sign-off:
✅ APPROVED / ⬜ CHANGES REQUESTED

---

## Status History

| Timestamp | Status | Changed By | Notes |
|-----------|--------|------------|-------|
| 2026-01-04T08:00:00Z | drafted | BMAD Master | Created for bug fix |
| 2026-01-04T08:__:__ | ready-for-dev | | Context created |
| 2026-01-04T08:__:__ | in-progress | | Development started |
| 2026-01-04T08:__:__ | review | | Code review requested |
| 2026-01-04T08:__:__ | done | | Bug fixed, merged |

---

## Related Stories

- **LT-3.18**: Original Tabs light theme migration (has bug)
- **LT-1.7**: ThemeToggle component
- **LT-1.6**: ThemeProvider component
