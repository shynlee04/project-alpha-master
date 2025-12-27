# Story 23-5: Implement Theme Toggle

## Context
- **Epic:** 23 - UX/UI Modernization (ShadcnUI + TailwindCSS 4.x)
- **Platform:** Platform B
- **Status:** drafted

## User Story
As a developer using the IDE, I want a reliable light/dark/system theme toggle that persists my choice and avoids hydration/flash issues so that the UI remains consistent across sessions and devices.

## Acceptance Criteria
- **AC-1:** Given the IDE loads, when I toggle between light and dark, then the UI updates immediately without hydration warnings or flash of unstyled content.
- **AC-2:** Given I reopen the IDE, when a theme was previously selected, then that theme is restored from persisted preference.
- **AC-3:** Given system theme changes, when the toggle is set to “system,” then the IDE follows the system preference.
- **AC-4:** Given keyboard users navigate, when focusing the toggle, then it is focusable and announced with an accessible label.

## Tasks
- [x] T1: Research next-themes + ShadcnUI patterns for React 19/Tailwind 4.x (Context7 + local code review).
- [x] T2: Replace custom ThemeToggle with next-themes-powered toggle using Shadcn primitives; ensure hydration-safe mounting.
- [x] T3: Wrap app with ThemeProvider defaults (enableSystem, disableTransitionOnChange) and ensure Tailwind dark class strategy aligns.
- [x] T4: Persist preference via next-themes storage; verify system mode fallback and SSR-safe handling.
- [x] T5: Add minimal tests (unit or component smoke) for theme toggle behavior and persistence hook.

## Research Requirements
- Review `_bmad-output/architecture/code-quality-standards-course-correction-v3.md` and `_bmad-output/architecture/project-structure-boundaries.md` for UI conventions.
- Verify next-themes usage via Context7 docs (ThemeProvider, useTheme, disableTransitionOnChange).
- Check existing UI code in `src/components/ui/ThemeProvider.tsx` and `ThemeToggle.tsx` for deltas.

## Dev Notes
- Follow accessibility standards (`agent-os/standards/frontend/accessibility.md`): focusable control, `sr-only` label.
- Respect import order convention and Tailwind dark class strategy.
- Use Shadcn button/icon patterns; avoid direct documentElement mutations—prefer `useTheme`.
- Ensure no FOUC: use mounted guard before rendering toggle UI.

## References
- Epic: `_bmad-output/epics/epic-23-uxui-modernization-new-course-correction-v6.md`
- Standards: `agent-os/standards/frontend/accessibility.md`, `agent-os/standards/frontend/components.md`, `agent-os/standards/global/coding-style.md`
- Current UI: `src/components/ui/ThemeProvider.tsx`, `src/components/ui/ThemeToggle.tsx`, `src/components/ui/sonner.tsx`

## Dev Agent Record
- **Agent:** Platform B
- **Session:** 2025-12-21T13:56+07:00
- **Task Progress:**
  - [x] T1 research (Context7 + DeepWiki patterns)
  - [x] T2 implement next-themes toggle with mounted guard
  - [x] T3 ThemeProvider defaults (class attr, system, disableTransitionOnChange)
  - [x] T4 persistence via next-themes storage
  - [x] T5 add ThemeToggle test (jsdom)
- **Research Executed:**
  - Context7 `/pacocoursey/next-themes` — disableTransitionOnChange, enableSystem, mounted guard with useTheme
  - DeepWiki `pacocoursey/next-themes` — delay theme UI until mounted to avoid hydration mismatch
- **Files Changed:**
  | File | Action |
  | --- | --- |
  | src/components/ui/ThemeProvider.tsx | Updated defaults (class attribute, system, disableTransitionOnChange) |
  | src/components/ui/ThemeToggle.tsx | Rebuilt with next-themes, mounted guard, accessibility attrs |
  | src/components/__tests__/ThemeToggle.test.tsx | Added jsdom test for toggle and aria-pressed |
- **Tests Added:** `src/components/__tests__/ThemeToggle.test.tsx`
- **Decisions Made:**
  - Use next-themes defaults with class strategy and disableTransitionOnChange to minimize FOUC.
  - Guard toggle rendering until mounted to avoid hydration mismatch; rely on next-themes storage for persistence.
  - Set aria-pressed and data-testid for accessibility and testing.

## Status History
| Date | Status | Notes |
| --- | --- | --- |
| 2025-12-21 | drafted | Story created (Platform B) |
