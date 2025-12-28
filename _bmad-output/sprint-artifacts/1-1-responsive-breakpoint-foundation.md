---
date: 2025-12-28
time: 22:15:00
phase: Story Development Cycle
team: Team-A
agent_mode: bmad-bmm-sm
---

# Story 1.1: Responsive Breakpoint Foundation

## Epic Context
- **Epic ID:** Epic 1 - Mobile-First Visual Foundation
- **Sprint:** Sprint 0/1 (Dec 29-31)
- **Story ID:** 1-1
- **Status:** ready-for-dev

## User Story

**As a** user on any device,
**I want** the IDE layout to adapt to my screen size,
**So that** I can use the application on desktop, tablet, or mobile.

## Acceptance Criteria

### AC-1: Desktop Layout (≥1024px)
**Given** a user opens Project Alpha on a desktop (≥1024px)
**When** the page loads
**Then** the full IDE layout is displayed (sidebar, editor, chat panel)
**And** all panels are resizable via react-resizable-panels
**And** panel widths are persisted to localStorage via Zustand middleware

### AC-2: Tablet Layout (768px-1023px)
**Given** a user opens Project Alpha on a tablet (768px-1023px)
**When** the page loads
**Then** the sidebar collapses by default, chat panel remains resizable
**And** touch-friendly spacing is applied (min 44px tap targets)

### AC-3: Mobile Layout (<768px)
**Given** a user opens Project Alpha on mobile (<768px)
**When** the page loads
**Then** a bottom tab navigation appears
**And** only one panel is visible at a time
**And** smooth swipe transitions between panels
**And** Editor panel shows 'Demo Mode' banner when swiped to

## Implementation Files
- `src/hooks/useResponsive.ts` - New hook implementation
- `src/components/layout/IDELayout.tsx` - Main layout adaptation
- `src/components/layout/MobileIDELayout.tsx` - Mobile specific layout
- `src/lib/state/ide-store.ts` - Panel width persistence

## Task Breakdown

### Research Tasks
- [x] Review `useMediaQuery.ts` for reuse potential
- [ ] Research `react-resizable-panels` serialization API
- [ ] Research Tailwind container queries for panel responsiveness

### Development Tasks
- [ ] Create `src/hooks/useResponsive.ts` (wrapping or replacing `useMediaQuery`)
- [ ] Implement `useIDEStore` with panel persistence (Zustand middleware)
- [ ] Refactor `IDELayout` to use `useResponsive`
- [ ] Implement Bottom Tab Navigation for mobile
- [ ] Add "Demo Mode" banner to Mobile Editor view
- [ ] Verify touch targets on tablet view

### Testing Tasks
- [ ] Unit test `useResponsive` hook with mock media queries
- [ ] Test panel persistence (reload page preserves widths)
- [ ] Verify 3 layouts (Mobile, Tablet, Desktop)
- [ ] Verify accessibility (ARIA tabs for mobile nav)

## Development Guidelines
- Use `useMediaQuery.ts` logic but expose semantic breakpoints
- Ensure no hydration mismatch (use `useEffect` for media queries)
- Follow 8-bit design system for Mobile Tabs

## Research Requirements
- Research `react-resizable-panels` persistence patterns
- Research `framer-motion` for swipe transitions (if used)

## References
- `_bmad-output/project-planning-artifacts/ux-design-specification.md` (UX 2.1, 3.1)
- `src/hooks/useMediaQuery.ts`

## Dev Agent Record

### Agent: @bmad-bmm-dev
**Status:** Pending Start
**Handoff Date:** 2025-12-28
