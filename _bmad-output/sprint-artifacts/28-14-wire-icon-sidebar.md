# Story 28-14: Wire IconSidebar into IDELayout

## Epic Context
- **Epic:** 28 - UX Brand Identity & Design System
- **Phase:** 5 - Integration Enforcement
- **Priority:** P0 (Blocking)

## User Story

**As a** developer using VIA-GENT IDE  
**I want** a VS Code-style collapsible sidebar with icon activity bar  
**So that** I can quickly switch between panels and maximize coding space

## Problem Statement

`IconSidebar.tsx` was created in Story 28-5 but:
- Never imported into `IDELayout.tsx`
- `grep -r "import.*IconSidebar" src/` returns 0 results
- Current layout uses fixed-width Card panels

## Acceptance Criteria

### AC-1: IconSidebar Integrated
**Given** `IDELayout.tsx`  
**When** the component renders  
**Then** uses `SidebarProvider`, `ActivityBar`, and `SidebarContent`

### AC-2: Collapsible Behavior
**Given** the sidebar  
**When** Ctrl+B is pressed  
**Then** sidebar collapses to 48px (icons only)

### AC-3: Panel Switching
**Given** the activity bar icons  
**When** Files/Agents/Search icons clicked  
**Then** corresponding panel content displays

### AC-4: State Persistence
**Given** sidebar state  
**When** page refreshes  
**Then** active panel and collapsed state persist via localStorage

## Tasks

- [ ] T1: Create Story 28-14 context XML with current IDELayout code
- [ ] T2: Import SidebarProvider, ActivityBar, SidebarContent into IDELayout
- [ ] T3: Replace current File Explorer Card with IconSidebar + ExplorerPanel
- [ ] T4: Wire keyboard shortcut Ctrl+B to sidebar toggle
- [ ] T5: Verify sidebar collapses with animation
- [ ] T6: Browser screenshot proving sidebar works
- [ ] T7: Update sprint-status.yaml

## Research Requirements

- Review: IconSidebar.tsx implementation (Story 28-5)
- Review: react-resizable-panels integration patterns

## Dev Notes

### Files to Modify
```
src/components/layout/IDELayout.tsx - Primary modification
src/components/ide/IconSidebar.tsx - May need adjustments
```

### Integration Pattern
```tsx
import { SidebarProvider, ActivityBar, SidebarContent } from '../ide/IconSidebar';
import { ExplorerPanel } from '../ide/ExplorerPanel';

// Wrap layout in SidebarProvider
<SidebarProvider defaultPanel="explorer">
  <ActivityBar />
  <SidebarContent>
    {activePanel === 'explorer' && <ExplorerPanel><FileTree ... /></ExplorerPanel>}
    {activePanel === 'agents' && <AgentsPanel ... />}
  </SidebarContent>
  {/* Rest of panels */}
</SidebarProvider>
```

## References

- IconSidebar: `src/components/ide/IconSidebar.tsx`
- ExplorerPanel: `src/components/ide/ExplorerPanel.tsx`
- Current layout: `src/components/layout/IDELayout.tsx`

## Dev Agent Record

*To be populated during implementation*

## Status

| Date | Status | Notes |
|------|--------|-------|
| 2025-12-22 | drafted | Initial story creation |
