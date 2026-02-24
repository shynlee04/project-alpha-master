# ARCH-03-06: Root Layout Integration

**Story ID:** ARCH-03-06
**Epic:** EPIC-ARCH-03 (Layout System & UX)
**Phase:** Phase 3 of ADR-034 (with Amendment 001)
**Team:** Team B
**Priority:** P0 - Final Story
**Status:** IN PROGRESS
**Created:** 2026-01-23
**Estimated Effort:** 2 hours

---

## Executive Summary

Integrate ProjectSidebar component into the application's root layout to provide persistent project navigation and sidebar functionality across all routes. This is the FINAL story of EPIC-ARCH-03.

### Dependencies

**Required Dependencies (All COMPLETE):**
- [x] ARCH-03-00: Platform-First Plugin Defaults (2026-01-22)
- [x] ARCH-03-01: ProjectSidebar Component (2026-01-22)
- [x] ARCH-03-01-UPDATE: ProjectSidebar Navigation Update (2026-01-22)
- [x] ARCH-03-02: Mobile-Responsive Plugin Layouts (2026-01-22)
- [x] ARCH-03-03: Layout Presets System (2026-01-23)
- [x] ARCH-03-04: Drag-Drop Plugin Reordering (2026-01-23)
- [x] ARCH-03-05: Progressive Disclosure UI (2026-01-23)

**Ready to Start:** YES

---

## Problem Statement

Currently, ProjectSidebar component exists (ARCH-03-01) but is not integrated into the application's root layout. Users cannot access the sidebar's project navigation, chat threads, and agent tools features.

### Current State
- ✅ ProjectSidebar component created and working
- ✅ Sidebar store exists with persistence
- ❌ Sidebar not integrated into __root.tsx
- ❌ Sidebar not integrated into AppLayout.tsx (if exists)
- ❌ No toggle button in Header component
- ❌ No conditional rendering based on route (show on /$projectId, hide on /hub)

### Target State
- Sidebar renders on all routes when project is loaded
- Sidebar hidden on /hub route (no project context)
- Toggle button in header to show/hide sidebar
- Sidebar state persisted across sessions
- Application builds successfully

---

## Acceptance Criteria (7 items)

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Sidebar renders on all routes when project loaded | Sidebar shows on `/$projectId` route |
| 2 | Sidebar is hidden on hub route | Sidebar does NOT show on `/hub` route |
| 3 | Toggle button in header calls sidebar store toggle | Header component has toggle button calling `sidebarStore.toggle()` |
| 4 | ProjectSidebar receives ProjectContext correctly | `useProjectContext()` called in ProjectSidebar, no projectContext prop passed |
| 5 | No TypeScript errors in integration files | `pnpm tsc --noEmit` returns 0 errors in __root.tsx, AppLayout.tsx, Header.tsx |
| 6 | Application builds successfully | `pnpm build` success, `pnpm dev` starts without errors |
| 7 | 8-bit design compliance maintained | Sidebar uses 8-bit design (sharp corners, pixel shadows), Header integration uses same pattern |

---

## Files to Modify (5 files)

### 1. src/routes/__root.tsx
**Purpose:** Add ProjectSidebar component to root layout structure
**Changes:**
- Import ProjectSidebar
- Import useProjectContext from infrastructure
- Import sidebarStore
- Conditional rendering: Render ProjectSidebar only when projectId exists
- Pass correct props (isOpen, onToggle, currentProjectId)

### 2. src/presentation/components/layout/AppLayout.tsx
**Purpose:** Verify or update AppLayout component (if exists)
**Changes:**
- Check if file exists (should exist from ARCH-03-01)
- Verify ProjectSidebar is correctly integrated
- If not integrated, add conditional rendering logic
- Ensure 8-bit design compliance

### 3. src/presentation/components/header/Header.tsx
**Purpose:** Add sidebar toggle button to header
**Changes:**
- Import sidebarStore
- Add hamburger/Menu icon button
- Button calls `sidebarStore.toggle()`
- Ensure 8-bit design (sharp corners, pixel shadows)
- Position toggle button correctly (left or right of header)

### 4. src/infrastructure/persistence/stores/sidebar-store.ts
**Purpose:** Verify toggle method exists
**Changes:**
- Read-only verification only
- Confirm `toggle()` method exists
- Confirm `isOpen` state exists
- Confirm `setWidth()` action exists
- Confirm persistence middleware is active

### 5. src/routes/index.tsx (or /hub route file)
**Purpose:** Verify sidebar hidden on hub route
**Changes:**
- Ensure ProjectSidebar NOT rendered when no projectId
- Verify conditional rendering works correctly

---

## Implementation Pattern

### 1. Root Layout Integration (__root.tsx)

**BEFORE (current state):**
```typescript
// src/routes/__root.tsx (hypothetical current state)
export const Route = createRootRouteWithContext()(function Root() {
  return (
    <div className="app-layout">
      <Header />
      <Outlet />
    </div>
  );
});
```

**AFTER (target state):**
```typescript
// src/routes/__root.tsx
import { Outlet } from '@tanstack/react-router';
import { Header } from '@/presentation/components/header/Header';
import { ProjectSidebar } from '@/presentation/components/sidebar/ProjectSidebar';
import { useProjectContext } from '@/infrastructure/context/use-project-context';
import { useSidebarStore } from '@/infrastructure/persistence/stores/sidebar-store';

export const Route = createRootRouteWithContext()(function Root() {
  // Get route params to determine if project is loaded
  const { projectId } = Route.useParams();

  // Sidebar state
  const { isOpen, toggle } = useSidebarStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      toggle: state.toggle,
    }))
  );

  // Only render sidebar if project exists
  return (
    <div className="app-layout flex min-h-screen">
      {/* Sidebar - only when project loaded */}
      {projectId && (
        <ProjectSidebar
          isOpen={isOpen}
          onToggle={toggle}
          currentProjectId={projectId}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggle} />
        <Outlet />
      </div>
    </div>
  );
});
```

**Key Decisions:**
- Sidebar only renders when `projectId` exists in route params
- Header gets `onToggleSidebar` prop
- 8-bit design: `flex`, `min-h-screen`, no rounded corners

### 2. Header Toggle Button (Header.tsx)

**BEFORE (current state):**
```typescript
// src/presentation/components/header/Header.tsx (hypothetical current state)
export function Header() {
  return (
    <header className="header">
      <Logo />
      <ProjectName />
    </header>
  );
}
```

**AFTER (target state):**
```typescript
// src/presentation/components/header/Header.tsx
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="header flex items-center justify-between border-b-2 border-black bg-gray-50 px-4 py-3">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center p-2 hover:bg-gray-200 active:bg-gray-300"
          aria-label={t('header.toggleSidebar')}
          aria-expanded={false}  // Will track sidebar state if needed
        >
          <Menu size={24} />
        </button>
        <Logo />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <ProjectName />
        <LayoutPresetPicker />
        <SettingsButton />
      </div>
    </header>
  );
}
```

**Key Decisions:**
- Toggle button on left side (before Logo)
- Uses Lucide Menu icon
- 8-bit design: `border-b-2`, `border-black`, `bg-gray-50`, `hover:bg-gray-200`
- i18n support for aria-label
- Optional `onToggleSidebar` prop (undefined = no toggle button on hub route)

### 3. AppLayout Verification (AppLayout.tsx)

**IF EXISTS:**
- Verify ProjectSidebar integration is correct
- Ensure no duplicate rendering
- Verify conditional rendering logic

**IF DOES NOT EXIST:**
- Create AppLayout component with sidebar integration
- Follow same pattern as __root.tsx above

### 4. Sidebar Store Verification (sidebar-store.ts)

**READ-ONLY VERIFICATION (no changes):**

```typescript
// src/infrastructure/persistence/stores/sidebar-store.ts

export interface SidebarState {
  isOpen: boolean;
  activeSection: SidebarSection;
  width: number;
  searchQuery: string;

  // Actions
  toggle: () => void;
  setIsOpen: (open: boolean) => void;
  setActiveSection: (section: SidebarSection) => void;
  setWidth: (width: number) => void;
  setSearchQuery: (query: string) => void;
}
```

**Verification:**
- [x] `toggle()` method exists
- [x] `isOpen` state exists
- [x] `setWidth()` action exists
- [x] Persist middleware active

---

## Architecture Compliance

### ADR-034 Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Project-centric architecture | ✅ PASS | Sidebar shows when project loaded, hidden on hub |
| Single `/$projectId` route | ✅ PASS | No new routes created |
| Platform-first plugin selection | ✅ PASS | ProjectSidebar already uses platform-first (ARCH-03-01) |
| TanStack Router navigate() | ✅ PASS | No navigation changes in this story |
| No workspace modes | ✅ PASS | ProjectSidebar already avoids workspace tabs (ARCH-03-01) |

### ADR-034-AMENDMENT-001 Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| No "IDE mode" vs "Notes mode" | ✅ PASS | ProjectSidebar uses platform-first navigation |
| Single unified route | ✅ PASS | Conditional rendering based on projectId, not route |
| Platform determines available plugins | ✅ PASS | ProjectSidebar already implements this (ARCH-03-01) |

### AGENTS.md Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Import order (React → Third-party → @/ → Domain) | ✅ PASS | Will follow in all modified files |
| Zustand v5 with useShallow | ✅ PASS | Will use for multiple selectors |
| 8-bit design (sharp corners, pixel shadows) | ✅ PASS | Will use in all UI components |
| No window.location.href | ✅ PASS | No navigation changes in this story |
| i18n support | ✅ PASS | Header toggle button will use t() function |
| File size < 400 lines | ✅ PASS | All modifications < 50 lines per file |

---

## Governance Rules

### READ-ONLY Files (DO NOT MODIFY)

**Authority Documents:**
- `_bmad-output/planning-artifacts/adr/ADR-034-project-centric-architecture-2026-01-20.md`
- `_bmad-output/planning-artifacts/adr/ADR-034-AMENDMENT-001-platform-first-2026-01-21.md`
- `_bmad-output/planning-artifacts/epics/EPIC-ARCH-03-layout-ux-2026-01-21.md`
- `AGENTS.md`

**Previous Completion Evidence:**
- `ARCH-03-00-completion.md`
- `ARCH-03-01-completion.md`
- `ARCH-03-01-UPDATE-completion.md`
- `ARCH-03-02-completion.md`
- `ARCH-03-03-completion.md`
- `ARCH-03-04-completion.md`
- `ARCH-03-05-completion.md`

**Component Implementation (READ-ONLY):**
- `src/presentation/components/sidebar/ProjectSidebar.tsx` - Use as-is, do not modify
- `src/infrastructure/persistence/stores/sidebar-store.ts` - Verify only, do not modify

**Project Configuration (READ-ONLY - BLOCKING ISSUE):**
- `tsconfig.json` - DO NOT MODIFY (project-wide TypeScript configuration issue)
  - ~10 TypeScript errors exist (module resolution, JSX configuration)
  - This is PROJECT-WIDE, NOT story-specific
  - Do NOT attempt to fix in this story

---

## Tasks Breakdown

### Task 1: Verify Current Layout Structure
- [ ] Read `src/routes/__root.tsx` to understand current layout
- [ ] Read `src/presentation/components/layout/AppLayout.tsx` (if exists)
- [ ] Read `src/presentation/components/header/Header.tsx` (if exists)
- [ ] Identify all files that need modification

### Task 2: Implement Sidebar Integration
- [ ] Update `src/routes/__root.tsx` to render ProjectSidebar
- [ ] Add conditional rendering based on `projectId` route param
- [ ] Import ProjectSidebar, sidebarStore, useProjectContext
- [ ] Use useShallow for multiple selectors from sidebarStore

### Task 3: Add Toggle Button to Header
- [ ] Read existing Header component structure
- [ ] Add Menu icon from lucide-react
- [ ] Add toggle button with onClick handler
- [ ] Add i18n support for aria-label
- [ ] Ensure 8-bit design compliance

### Task 4: Verify Sidebar Store
- [ ] Read `src/infrastructure/persistence/stores/sidebar-store.ts`
- [ ] Verify `toggle()` method exists
- [ ] Verify `isOpen` state exists
- [ ] Verify persistence middleware is active

### Task 5: Validate TypeScript Compilation
- [ ] Run `pnpm tsc --noEmit` on modified files only
- [ ] Target: 0 errors in integration files (__root.tsx, AppLayout.tsx, Header.tsx)
- [ ] Note: Project-wide tsconfig.json errors are NOT blocking (do not fix)

### Task 6: Test Application Build
- [ ] Run `pnpm build` - should succeed
- [ ] Run `pnpm dev` - should start without errors
- [ ] Manual test: Navigate to /$projectId - sidebar should show
- [ ] Manual test: Navigate to /hub - sidebar should NOT show
- [ ] Manual test: Click toggle button - sidebar should toggle

### Task 7: Create Completion Report
- [ ] Document all changes made
- [ ] Verify all 7 acceptance criteria met
- [ ] Evidence: Grep command outputs, TypeScript validation results
- [ ] Sign-off story completion

---

## Validation Commands

### Check Integration Files
```bash
# 1. Verify __root.tsx imports ProjectSidebar
grep -n "ProjectSidebar" src/routes/__root.tsx
# Expected: Import statement and component usage

# 2. Verify Header.tsx has toggle button
grep -n "toggle\|Menu" src/presentation/components/header/Header.tsx
# Expected: Menu icon import, toggle button

# 3. Verify conditional rendering based on projectId
grep -n "projectId" src/routes/__root.tsx | grep -v "Route.useParams"
# Expected: Conditional rendering of ProjectSidebar
```

### Verify No Deprecated Patterns
```bash
# 4. Verify no workspace tabs in sidebar
grep -rn "TabButton\|IDE.*tab\|Notes.*tab" src/presentation/components/sidebar/
# Expected: 0 matches (already verified in ARCH-03-01)

# 5. Verify no deprecated navigation patterns
grep -rn "to: '/ide/\|to: '/notes/" src/routes/
# Expected: 0 matches (already verified in ARCH-03-01)
```

### TypeScript Validation
```bash
# 6. Check modified files for TypeScript errors
pnpm tsc --noEmit --pretty 2>&1 | grep -E "__root\.tsx|AppLayout\.tsx|Header\.tsx"
# Expected: 0 errors
```

---

## Success Metrics

| Metric | Target | Before | After | Status |
|--------|---------|---------|--------|--------|
| Sidebar renders when project loaded | Yes | TBD | Yes | |
| Sidebar hidden on hub route | Yes | TBD | Yes | |
| Toggle button works | Yes | TBD | Yes | |
| ProjectContext integration | Yes | TBD | Yes | |
| TypeScript errors (integration files) | 0 | TBD | 0 | |
| Application builds | Yes | TBD | Yes | |
| 8-bit design compliance | Yes | TBD | Yes | |

---

## Risk Assessment

| Risk (English) | Probability | Impact | Mitigation (English) |
|-----------------|------------|---------|----------------------|
| Breaking existing layout structure | Low | High | Backup current __root.tsx, test carefully |
| TypeScript errors in integration files | Medium | Medium | Use targeted validation, fix only story-specific errors |
| Sidebar not responsive on mobile | Low | Medium | ProjectSidebar already has responsive logic (ARCH-03-01) |
| Toggle button accessibility issues | Low | Low | Use ARIA attributes, i18n support |

---

## Timebox

**Total Timebox:** 2 hours

**Breakdown:**
- Task 1 (Verify): 15 minutes
- Task 2 (Sidebar Integration): 45 minutes
- Task 3 (Toggle Button): 30 minutes
- Task 4 (Store Verification): 10 minutes
- Task 5 (TypeScript Validation): 15 minutes
- Task 6 (Build & Test): 20 minutes
- Task 7 (Completion Report): 25 minutes

**Escalation Path:**
- If > 2x estimated time (4 hours) without progress → Escalate to Orchestrator
- If dev-ext blocked > 30 minutes → Report to Sprint-Manager

---

## Notes

### TypeScript Configuration Issue (BLOCKING - DO NOT FIX)

**Known Issue:** ~10 TypeScript errors in project-wide tsconfig.json
- Module resolution errors
- JSX configuration errors
- NOT related to this story

**Action:** Do NOT modify tsconfig.json in this story
**Reason:** This is project-wide configuration, requires separate fix
**Impact:** Does NOT block this story (only integration files need 0 errors)

### Previous Context

From ARCH-03-01 completion (ProjectSidebar Component):
- ProjectSidebar created with all required functionality
- Sidebar store created with persistence
- Navigation uses platform-first pattern (no workspace modes)
- 8-bit design compliant

From ARCH-03-01-UPDATE completion:
- ProjectSidebar navigation verified - no deprecated patterns
- All navigation uses `/$projectId` only

From ARCH-03-02 completion (Mobile-Responsive Plugin Layouts):
- Responsive layout system implemented
- MobilePluginNav component created
- Swipe gestures working

From ARCH-03-03 completion (Layout Presets System):
- Layout presets store created
- LayoutPresetPicker component created
- SavePresetDialog component created

From ARCH-03-04 completion (Drag-Drop Plugin Reordering):
- Drag-drop visual polish implemented
- plugin-dnd.css created
- Keyboard accessibility added

From ARCH-03-05 completion (Progressive Disclosure UI):
- User preferences store created
- LayoutOnboarding component created
- Progressive disclosure UI implemented

---

## Next Steps

1. ✅ **Story file created** (STEP 1 COMPLETE)
2. ⏳ **Validate story file** (STEP 2)
3. ⏳ **Create context file** (STEP 3)
4. ⏳ **Validate context file** (STEP 4)
5. ⏳ **Delegate to dev-ext** (STEP 5)
6. ⏳ **Monitor dev-ext progress** (STEP 6)
7. ⏳ **Code review** (STEP 7)
8. ⏳ **Validation checklist** (STEP 8)
9. ⏳ **Report completion** (STEP 9)

---

## Approval

- [x] Story file created
- [ ] Story validation complete
- [ ] Context file created
- [ ] Context validation complete
- [ ] Dev-ext delegated
- [ ] Implementation complete
- [ ] Code review passed
- [ ] TypeScript validation passed
- [ ] Completion report created
- [ ] Orchestrator FINAL APPROVAL (REQUIRED)

---

**END OF STORY FILE**
