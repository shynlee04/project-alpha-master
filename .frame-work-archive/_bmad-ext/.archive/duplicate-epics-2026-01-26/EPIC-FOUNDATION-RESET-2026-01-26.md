# EPIC-FOUNDATION-RESET: Complete Architecture Reset

**Epic ID:** EPIC-FOUNDATION-RESET
**Created:** 2026-01-26
**Author:** architect-ext
**Status:** READY_FOR_EXECUTION
**Priority:** P0 (BLOCKER)
**Estimated Effort:** 24 hours (3 days)

---

## Executive Summary

This epic performs a complete foundation reset to align the codebase with ADR-034 and `new-fundamental-truths.md`. Previous epics (ARCH-01, ARCH-02, ARCH-03) were marked complete with FALSE evidence.

**Goal:** Achieve TRUE project-centric architecture with ONLY 2 routes (`/hub` and `/$projectId`).

---

## Pre-Conditions

- [x] ADR-034-AMENDMENT-002 approved
- [x] Governance correction GOV-2026-01-26-001 acknowledged
- [ ] Team A and Team B assigned

---

## Success Criteria

| Criteria | Evidence Required |
|----------|-------------------|
| Only 2 routes exist | `ls src/routes/*.tsx` shows only `hub.tsx`, `$projectId.tsx`, `__root.tsx`, `index.tsx` |
| No "workspace" in UI | Screenshot of Hub page without workspace terminology |
| PluginLayout < 400 lines | `wc -l PluginLayout.tsx` shows < 400 |
| Monaco is real editor | Screenshot with syntax highlighting |
| All i18n keys present | No raw translation keys visible in UI |
| E2E tests pass | Playwright test results |

---

## Stories

### FR-01: Archive All Legacy Routes

**Priority:** P0 (BLOCKER - Must be first)
**Effort:** 1 hour
**Assigned To:** Team A
**Dependencies:** None

**Description:**
Archive all legacy routes that violate the 2-route architecture.

**Files to Archive:**
```
src/routes/ide.$projectId.tsx      → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/notes.$projectId.tsx    → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/workspace/$projectId.tsx → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/workspace/index.tsx     → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/notes.lazy.tsx          → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/ide.tsx                 → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/agents.tsx              → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/settings.tsx            → _bmad-ext/.archive/legacy-routes-2026-01-26/
src/routes/projects.tsx            → _bmad-ext/.archive/legacy-routes-2026-01-26/
```

**Acceptance Criteria:**
```gherkin
Given I run `ls src/routes/*.tsx`
Then I see ONLY:
  - __root.tsx
  - index.tsx
  - hub.tsx
  - $projectId.tsx
  - about.tsx (acceptable standalone)
  - about.lazy.tsx
And all archived files exist in _bmad-ext/.archive/legacy-routes-2026-01-26/
And TypeScript compiles with 0 errors
```

---

### FR-02: Implement Correct Hub Route

**Priority:** P0
**Effort:** 2 hours
**Assigned To:** Team A
**Dependencies:** FR-01

**Description:**
Clean up `/hub` route to remove all workspace terminology and align with project-centric model.

**Changes Required:**
1. Remove `WorkspacePieChart` component or rename to `ProjectDistribution`
2. Remove `workspaceBindings` references from UI text
3. Replace "workspace" with "project" in all visible text
4. Remove tabs: WORKSPACE, AGENTS, KNOWLEDGE (move to /$projectId)
5. Ensure "Create Project" navigates to `/$projectId` after creation

**Acceptance Criteria:**
```gherkin
Given I navigate to /hub
Then I see:
  - "Projects" heading (not "Workspaces")
  - Project list with project cards
  - "Create Project" button
  - NO "Workspace Distribution" pie chart
  - NO "WORKSPACE" tabs
And clicking "Create Project" → completes → navigates to /$projectId
```

---

### FR-03: Implement Correct Project Route

**Priority:** P0
**Effort:** 3 hours
**Assigned To:** Team A
**Dependencies:** FR-01

**Description:**
Complete the `/$projectId` route implementation with proper plugin layout.

**Requirements:**
1. ProjectContextProvider loads project by ID
2. PluginLayout renders with platform-appropriate plugins
3. Single sidebar (not double)
4. FileTree and Chat always loaded
5. Monaco/Terminal/Notes as optional plugins
6. Settings accessible via modal/drawer (not separate route)

**Acceptance Criteria:**
```gherkin
Given I navigate to /$projectId with valid project
Then I see:
  - Single sidebar with project info
  - Plugin layout with FileTree (always visible)
  - Chat panel accessible
  - Plugin toggles in toolbar
  - NO double sidebars
And platform detection shows correct plugins:
  - Desktop FSA: FileTree, Chat, Monaco, Terminal, Preview
  - Mobile: FileTree, Chat, Notes
```

---

### FR-04: Remove Workspace Terminology

**Priority:** P0
**Effort:** 4 hours
**Assigned To:** Team B
**Dependencies:** FR-03

**Description:**
Replace "workspace" with "project" terminology across 40+ files.

**Scope:**
1. Component names: `WorkspaceSwitcher` → `ProjectSwitcher`
2. Variable names: `workspaceBindings` → `projectBindings` or remove
3. i18n keys: `hub.menu.workspace` → `hub.menu.project`
4. Comments and documentation
5. Constants: `WORKSPACE_CONFIG` → `PROJECT_CONFIG`

**Files to Modify (Priority Order):**
1. `src/presentation/components/hub/HubHomePage.tsx` (75+ references)
2. `src/presentation/components/hub/WorkspacePieChart.tsx` (archive or rename)
3. `src/presentation/components/hub/WorkspaceFilter.tsx` (rename)
4. `src/presentation/components/hub/WorkspaceBadge.tsx` (rename)
5. `src/presentation/components/layout/MainSidebar.tsx`
6. `src/presentation/components/project/*.tsx`
7. All other files with "workspace" references

**Acceptance Criteria:**
```gherkin
Given I run `grep -r "workspace" src/presentation --include="*.tsx"`
Then I see 0 matches in UI-visible text
And component names use "Project" prefix
And TypeScript compiles with 0 errors
```

---

### FR-05: Split PluginLayout God Component

**Priority:** P0
**Effort:** 3 hours
**Assigned To:** Team B
**Dependencies:** FR-03

**Description:**
Split `PluginLayout.tsx` (1034 lines) into focused components under 400 lines each.

**Target Structure:**
```
src/presentation/layouts/
├── PluginLayout.tsx           # Main container (<200 lines)
├── PluginToolbar.tsx          # Plugin toggle buttons (<150 lines)
├── PluginPanel.tsx            # Single plugin panel (<100 lines)
├── PluginGrid.tsx             # Grid layout logic (<150 lines)
├── usePluginLayout.ts         # Layout state hook (<100 lines)
└── plugin-layout.types.ts     # Shared types (<50 lines)
```

**Acceptance Criteria:**
```gherkin
Given I run `wc -l src/presentation/layouts/PluginLayout.tsx`
Then I see < 400 lines
And all extracted files exist
And each file is < 400 lines
And TypeScript compiles with 0 errors
And layout renders correctly (screenshot evidence)
```

---

### FR-06: Replace Monaco POC with Real Editor

**Priority:** P0
**Effort:** 4 hours
**Assigned To:** Team B
**Dependencies:** FR-03

**Description:**
Replace the POC textarea stub with real Monaco editor using `@monaco-editor/react`.

**Requirements:**
1. Real Monaco editor with syntax highlighting
2. Language auto-detection based on file extension
3. Theme support (dark/light)
4. Basic features: line numbers, minimap, word wrap
5. File content sync with storage gateway

**Acceptance Criteria:**
```gherkin
Given I open a .tsx file in Monaco plugin
Then I see:
  - Syntax highlighting for TypeScript/JSX
  - Line numbers
  - Minimap (if enabled)
  - NO plain textarea
And changes save to file system
And screenshot shows proper code editor
```

---

### FR-07: Add Missing i18n Keys

**Priority:** P1
**Effort:** 2 hours
**Assigned To:** Team A
**Dependencies:** FR-04

**Description:**
Add all missing i18n translation keys to prevent raw key display.

**Known Missing Keys (Partial List):**
```
hub.newProjectDesc
hub.dashboard.workspaceDistribution
hub.workspaceBinding.title
hub.workspaceBinding.description
hub.workspaceBinding.selectWorkspaces
hub.workspaceBinding.openIn
agent.workspaceSwitching.switchingWorkspace
... (40+ more)
```

**Acceptance Criteria:**
```gherkin
Given I navigate through all major UI paths
Then I see NO raw translation keys (e.g., "hub.newProjectDesc")
And all text is properly translated to English
And Vietnamese translations exist for all keys
```

---

### FR-08: Fix Single Sidebar Architecture

**Priority:** P1
**Effort:** 2 hours
**Assigned To:** Team A
**Dependencies:** FR-05

**Description:**
Fix the double sidebar issue by implementing single ProjectSidebar.

**Requirements:**
1. Single sidebar in `__root.tsx`
2. Sidebar contains:
   - Project switcher (dropdown)
   - Quick actions (New Project, Open Folder)
   - Recent projects list
   - Settings access (icon button)
3. NO empty sidebar panels
4. Mobile: Bottom navigation instead of sidebar

**Acceptance Criteria:**
```gherkin
Given I navigate to /$projectId on desktop
Then I see ONE sidebar (not two)
And sidebar has useful content:
  - Project name at top
  - Quick actions visible
  - Settings icon accessible
And mobile shows bottom navigation instead
```

---

### FR-09: E2E Validation

**Priority:** P0 (GATE)
**Effort:** 3 hours
**Assigned To:** real-world-validator
**Dependencies:** FR-01, FR-02, FR-03, FR-04, FR-05, FR-06, FR-07, FR-08

**Description:**
Complete E2E validation of all user journeys before epic can be marked complete.

**User Journeys to Test:**
1. **J1: Project Creation** - Desktop FSA project creation
2. **J2: Project Load** - Load existing project, verify plugins
3. **J3: File Editing** - Open file in Monaco, edit, save
4. **J4: Notes Creation** - Create/edit note in Notes plugin
5. **J5: Plugin Switching** - Toggle plugins, verify layout
6. **J6: Mobile Experience** - Verify mobile layout, bottom nav

**Acceptance Criteria:**
```gherkin
Given Playwright tests exist for all 6 journeys
When tests run against dev server
Then all tests PASS
And screenshots captured for evidence
And no console errors in browser
```

---

## Team Assignments

| Story | Team | Agent | Status |
|-------|------|-------|--------|
| FR-01 | Team A | dev-ext | PENDING |
| FR-02 | Team A | dev-ext | BLOCKED by FR-01 |
| FR-03 | Team A | dev-ext | BLOCKED by FR-01 |
| FR-04 | Team B | dev-ext | BLOCKED by FR-03 |
| FR-05 | Team B | dev-ext | BLOCKED by FR-03 |
| FR-06 | Team B | dev-ext | BLOCKED by FR-03 |
| FR-07 | Team A | dev-ext | BLOCKED by FR-04 |
| FR-08 | Team A | dev-ext | BLOCKED by FR-05 |
| FR-09 | Both | real-world-validator | BLOCKED by FR-01..FR-08 |

---

## Parallel Execution Plan

```
Timeline (Hours):

Hour 0-1:   FR-01 (Archive routes) - Team A
            
Hour 1-4:   FR-02 (Hub route) - Team A     |  FR-03 (Project route) - Team A
            
Hour 4-8:   FR-07 (i18n) - Team A          |  FR-04 (Terminology) - Team B
                                           |  FR-05 (Split PluginLayout) - Team B
                                           |  FR-06 (Monaco) - Team B

Hour 8-10:  FR-08 (Sidebar) - Team A       |  (Team B continues FR-04, FR-05, FR-06)

Hour 10-13: FR-09 (E2E Validation) - Both teams
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Archive files, don't delete; create redirects first |
| Merge conflicts between teams | Clear file ownership per story |
| TypeScript errors cascade | Run `pnpm tsc --noEmit` after each story |
| Missing edge cases | E2E testing catches regressions |

---

## Post-Epic Actions

1. Update AGENTS.md with TRUE epic status
2. Update LOOP_STATE.yaml
3. Create retrospective document
4. Archive this epic to completed epics

---

## References

- ADR-034: Project-Centric Architecture
- ADR-034-AMENDMENT-001: Platform-First Plugin Selection
- ADR-034-AMENDMENT-002: Foundation Reset
- new-fundamental-truths.md: Core Architecture Principles
- docs/the-3-phase-approach.md: Comprehensive Phase Guide
