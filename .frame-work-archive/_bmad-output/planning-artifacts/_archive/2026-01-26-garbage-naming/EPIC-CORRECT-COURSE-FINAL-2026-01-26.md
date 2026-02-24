# EPIC-CCF: Final Correct-Course for Phase 1A Alignment

**Epic ID**: EPIC-CCF (EPIC-CORRECT-COURSE-FINAL)
**Created**: 2026-01-26
**Priority**: P0 CRITICAL BLOCKER
**Status**: READY_FOR_EXECUTION
**Estimated Duration**: 36-48 hours (4-5 days)
**Target Completion**: 2026-01-31
**Team**: Both (Team A + Team B parallel)
**Author**: bmad-sprint-manager

---

## YAML Frontmatter

```yaml
epic_id: EPIC-CCF
name: "Final Correct-Course for Phase 1A Alignment"
type: correct-course
priority: P0
blocks: Phase 1A, Phase 1B, Phase 2
created: 2026-01-26
target_completion: 2026-01-31
estimated_effort: 36-48 hours

remediates:
  - EPIC-ARCH-01 (TRUE: 60%)
  - EPIC-ARCH-02 (TRUE: 70%)
  - EPIC-ARCH-03 (TRUE: 45%)

supersedes:
  - EPIC-CC-AR02AR03 (absorbed into this EPIC)
  - EPIC-UX-GLOBAL-UI (absorbed into this EPIC)

categories:
  route_architecture:
    priority: P0
    stories: [CCF-01, CCF-02, CCF-03]
  double_ui:
    priority: P0
    stories: [CCF-04, CCF-05]
  empty_ui:
    priority: P1
    stories: [CCF-06, CCF-07]
  terminology:
    priority: P1
    stories: [CCF-08, CCF-09]
  god_components:
    priority: P1
    stories: [CCF-10, CCF-11]
  poc_stubs:
    priority: P1
    stories: [CCF-12, CCF-13]

related_documents:
  - new-fundamental-truths.md
  - docs/the-3-phase-approach.md
  - ADR-034: Project-Centric Architecture with Feature Plugins
  - ADR-034-AMENDMENT-001: Platform-First Plugin Selection
```

---

## Executive Summary

This EPIC is the **FINAL** correct-course that comprehensively addresses ALL fundamental UX/UI violations blocking Phase 1A. Previous EPICs (EPIC-CC-AR02AR03, EPIC-UX-GLOBAL-UI) addressed issues partially. This EPIC consolidates all remaining issues into a single, prioritized execution plan.

### Why Previous EPICs Failed

| Previous EPIC | What It Missed | Impact |
|---------------|----------------|--------|
| EPIC-ARCH-02 | Monaco is POC textarea stub | No syntax highlighting |
| EPIC-ARCH-03 | PluginLayout.tsx = 1034 lines (god component) | Maintenance nightmare |
| EPIC-CC-AR02AR03 | Route architecture violations not addressed | `/ide/$projectId` routes still exist |
| EPIC-UX-GLOBAL-UI | Double sidebar issue not addressed | Double rendering of sidebar |

### What This EPIC Guarantees

1. **Route Architecture**: Only `/hub` and `/$projectId` routes exist (per new-fundamental-truths.md 1.2)
2. **No Double UI**: Single sidebar, single header, no redundant components
3. **Valuable Sidebar**: Contains project management, quick actions, navigation widgets
4. **Correct Terminology**: "Project" not "Workspace" throughout codebase
5. **No God Components**: All components under 400 lines
6. **Real Implementations**: Monaco Editor (real), Preview Plugin (WebContainer)

---

## Issue Categories

### Category 1: Route Architecture (P0)

**Source**: `new-fundamental-truths.md` Section 1.2

**Current State** (VIOLATING):
```
src/routes/
  index.tsx
  hub.tsx
  ide.tsx                    # SHOULD NOT EXIST
  ide.$projectId.tsx         # SHOULD NOT EXIST - violates single route
  notes.lazy.tsx
  notes.$projectId.tsx       # SHOULD NOT EXIST - violates single route
  $projectId.tsx             # CORRECT - the ONLY project route
  settings.tsx
  agents.tsx
  projects.tsx
  ...
```

**Required State** (COMPLIANT):
```
src/routes/
  __root.tsx                 # Root layout with GlobalSidebar/Header
  index.tsx                  # Redirects to /hub
  hub.tsx                    # Project management, no project loaded
  $projectId.tsx             # THE ONLY project route - plugins render here
  about.lazy.tsx             # Static page
  $__debug__.*.tsx           # Debug routes (dev only)
```

**Issues**:
1. `/ide/$projectId` route exists - MUST BE REMOVED
2. `/notes/$projectId` route exists - MUST BE REMOVED
3. `/notes.lazy.tsx` uses `window.location.href` for navigation (line 25)
4. Multiple deprecated routes exist that should redirect to `/$projectId`

### Category 2: Double/Redundant UI (P0)

**Issue**: Both `__root.tsx` AND `MainLayout` render sidebar/header

**Evidence**:
- `__root.tsx` renders `GlobalSidebar` and `GlobalHeader` 
- Individual routes also import/use `MainLayout` with sidebar
- Result: Double sidebar, double header, visual chaos

**Files Affected**:
```
src/routes/__root.tsx
src/presentation/components/layout/MainLayout.tsx
src/presentation/components/layout/MainSidebar.tsx
src/presentation/components/sidebar/ProjectSidebar.tsx  # DUPLICATE
```

### Category 3: Empty/Valueless UI (P1)

**Issue**: Sidebar is empty, provides no value

**Current Sidebar Content**:
- Logo
- Empty project list
- Settings link

**Required Sidebar Content** (per new-fundamental-truths.md 3.3):
- **Project Management Plugin** (always-loaded)
  - FileTree navigation
  - Project switcher
  - File/folder CRUD
  - Database and RAG management
- **Chat Cascade Plugin** (always-loaded)
  - Quick access to current thread
  - Thread list
  - Agent status indicator
- Quick actions (New Project, Search, Settings)
- Navigation widgets (Home, IDE, Notes)

### Category 4: Terminology (P1)

**Issue**: 40+ files still use "workspace" instead of "project"

**Components to Rename**:
| Current Name | New Name |
|--------------|----------|
| `UnifiedWorkspaceProvider` | `ProjectProvider` |
| `WorkspaceBadge` | `LayoutPresetIndicator` |
| `useWorkspaceStore` | `useProjectStore` |
| `workspace-*` files | `project-*` files |

**Terminology Mapping**:
| OLD | NEW |
|-----|-----|
| workspace | project |
| IDE mode | Layout Preset (IDE-focused) |
| Notes mode | Layout Preset (Notes-focused) |
| Knowledge mode | Layout Preset (Knowledge-focused) |
| Study mode | Layout Preset (Study-focused) |

### Category 5: God Components (P1)

**Issue**: Components exceeding 400-line limit

| File | Lines | Threshold Violation |
|------|-------|---------------------|
| `PluginLayout.tsx` | 1034 | 2.6x over limit |

### Category 6: POC Stubs (P1)

**Issue**: Critical features are placeholder implementations

| Component | Current State | Required State |
|-----------|---------------|----------------|
| `MonacoPlugin.tsx` | Textarea placeholder | Real @monaco-editor/react |
| `PreviewPlugin.tsx` | Basic implementation | WebContainer integration |

---

## Stories

### CCF-01: Remove Deprecated Route Files

**Priority**: P0 BLOCKER
**Effort**: 2 hours
**Team**: Team A
**Depends On**: None

#### Description

Remove all workspace-specific routes that violate the two-route architecture.

#### Files to Delete/Archive

```
# ARCHIVE TO: _bmad-ext/.archive/route-cleanup-2026-01-26/
src/routes/ide.tsx                  # Route without projectId
src/routes/ide.$projectId.tsx       # VIOLATES: Should use /$projectId
src/routes/notes.$projectId.tsx     # VIOLATES: Should use /$projectId
```

#### Files to Modify

```
src/routes/notes.lazy.tsx           # Remove window.location.href, use router
```

#### Implementation

1. Archive deprecated routes to `_bmad-ext/.archive/`
2. Update `notes.lazy.tsx` to use TanStack Router:
```typescript
// BEFORE (line 25)
window.location.href = '/hub?action=select-project&workspace=notes';

// AFTER
import { useNavigate } from '@tanstack/react-router';
const navigate = useNavigate();
navigate({ to: '/hub', search: { action: 'select-project', layout: 'notes' } });
```

3. Ensure `$projectId.tsx` handles all layout presets via platform-defaults.ts

#### Acceptance Criteria

- [ ] `ide.$projectId.tsx` DELETED (archived)
- [ ] `notes.$projectId.tsx` DELETED (archived)
- [ ] `notes.lazy.tsx` uses TanStack Router (no window.location.href)
- [ ] Only TWO routes exist: `/hub` and `/$projectId`
- [ ] TypeScript: 0 new errors
- [ ] All navigation uses TanStack Router

#### Validation

```bash
# Verify no workspace-specific project routes exist
ls src/routes/*.tsx | grep -E "(ide|notes)\.\$projectId"
# Should return nothing

# Verify no window.location.href in routes (except debug)
grep -r "window.location.href" src/routes/ --include="*.tsx" | grep -v debug
# Should return nothing
```

---

### CCF-02: Implement Layout Presets in $projectId Route

**Priority**: P0 BLOCKER
**Effort**: 3 hours
**Team**: Team A
**Depends On**: CCF-01

#### Description

The `$projectId.tsx` route must support all layout presets (IDE, Notes, Knowledge, Study) via query parameter or platform detection.

#### Files to Modify

```
src/routes/$projectId.tsx
src/infrastructure/plugins/platform-defaults.ts
```

#### Implementation

```typescript
// $projectId.tsx
import { Route, useParams, useSearch } from '@tanstack/react-router';
import { getDefaultPlugins, getDefaultLayoutMode } from '@/infrastructure/plugins/platform-defaults';
import { PluginLayout } from '@/presentation/layouts/PluginLayout';

interface ProjectRouteSearch {
  layout?: 'ide' | 'notes' | 'knowledge' | 'study';
}

function ProjectRoute() {
  const { projectId } = useParams({ from: '/$projectId' });
  const { layout } = useSearch({ from: '/$projectId' }) as ProjectRouteSearch;
  const { platform, project } = useProjectContext();
  
  // Determine layout preset: URL param > project setting > platform default
  const layoutPreset = layout || project?.defaultLayout || getDefaultLayoutFromPlatform(platform);
  
  // Get plugins based on layout preset
  const defaultPlugins = getDefaultPlugins(platform, project, layoutPreset);
  
  return (
    <PluginLayout 
      projectId={projectId}
      layoutPreset={layoutPreset}
      defaultPlugins={defaultPlugins}
    />
  );
}
```

#### Acceptance Criteria

- [ ] `/$projectId` route supports `?layout=ide|notes|knowledge|study` param
- [ ] Layout preset determines which plugins load by default
- [ ] Platform detection still works (desktop FSA = IDE-focused, mobile = Notes-focused)
- [ ] No separate routes for workspace types
- [ ] TypeScript: 0 new errors

---

### CCF-03: Update All Navigation to Use TanStack Router

**Priority**: P0 BLOCKER
**Effort**: 2 hours
**Team**: Team A
**Depends On**: CCF-01

#### Description

Remove ALL remaining `window.location.href` usages and replace with TanStack Router navigation.

#### Files to Modify

```
src/routes/notes.lazy.tsx (line 25)
src/presentation/components/hub/ProjectPickerDialog.tsx
src/presentation/components/common/DatabaseRecoveryDialog.tsx
```

#### Pattern to Apply

```typescript
// BEFORE
window.location.href = '/some/path';

// AFTER
import { useNavigate } from '@tanstack/react-router';
const navigate = useNavigate();
navigate({ to: '/some/path' });
```

#### Acceptance Criteria

- [ ] Zero `window.location.href` in src/ (except HTTP-Referer header reads)
- [ ] All navigation uses `useNavigate()` from TanStack Router
- [ ] TypeScript: 0 new errors

---

### CCF-04: Fix Double Sidebar in __root.tsx

**Priority**: P0 BLOCKER
**Effort**: 3 hours
**Team**: Team B
**Depends On**: None

#### Description

Remove duplicate sidebar rendering. The sidebar should ONLY render in `__root.tsx`, not in individual routes or `MainLayout`.

#### Current Problem

```
__root.tsx
  -> GlobalSidebar (renders sidebar)
  -> GlobalHeader (renders header)
  -> Outlet
      -> Route Component
          -> MainLayout (ALSO renders sidebar) <- DOUBLE RENDERING
```

#### Target Architecture

```
__root.tsx
  -> GlobalSidebar (ONLY sidebar)
  -> GlobalHeader (ONLY header)
  -> Outlet
      -> Route Component (NO layout wrapper)
```

#### Files to Modify

```
src/routes/__root.tsx
src/routes/index.tsx              # Remove MainLayout wrapper
src/routes/hub.tsx                # Remove MainLayout wrapper
src/routes/settings.tsx           # Remove MainLayout wrapper
src/routes/agents.tsx             # Remove MainLayout wrapper
src/routes/projects.tsx           # Remove MainLayout wrapper
src/presentation/components/layout/MainLayout.tsx  # ARCHIVE or reduce scope
```

#### Implementation

1. In `__root.tsx`, ensure GlobalSidebar and GlobalHeader render once
2. Remove `<MainLayout>` wrapper from all route components
3. Archive `MainLayout.tsx` or reduce it to a content-only wrapper (no sidebar)

#### Acceptance Criteria

- [ ] Sidebar renders ONLY in `__root.tsx`
- [ ] Header renders ONLY in `__root.tsx`
- [ ] No `MainLayout` wrapper in route components (or MainLayout has no sidebar)
- [ ] No visual double-rendering
- [ ] TypeScript: 0 new errors

---

### CCF-05: Consolidate Duplicate Sidebar Components

**Priority**: P0
**Effort**: 2 hours
**Team**: Team B
**Depends On**: CCF-04

#### Description

Consolidate `MainSidebar.tsx`, `ProjectSidebar.tsx`, and `GlobalSidebar.tsx` into a single sidebar component.

#### Current Files

```
src/presentation/components/layout/MainSidebar.tsx
src/presentation/components/sidebar/ProjectSidebar.tsx  # DUPLICATE
src/presentation/components/layout/GlobalSidebar.tsx    # May exist
```

#### Target

Single source of truth: `src/presentation/components/layout/GlobalSidebar.tsx`

#### Implementation

1. Audit all sidebar components
2. Merge functionality into `GlobalSidebar.tsx`
3. Archive redundant files
4. Update all imports

#### Acceptance Criteria

- [ ] Single sidebar component file
- [ ] All features consolidated
- [ ] Redundant files archived
- [ ] TypeScript: 0 new errors

---

### CCF-06: Add Project Management to Sidebar

**Priority**: P1
**Effort**: 4 hours
**Team**: Team A
**Depends On**: CCF-04, CCF-05

#### Description

The sidebar must contain the "Project Management Plugin" as always-loaded content (per new-fundamental-truths.md 3.3).

#### Sidebar Requirements

```
+------------------------+
| [Logo] VIA-GENT   [☰]  |
+------------------------+
| ▼ PROJECTS             |
|   📁 My Project (active)|
|   📁 Demo Project      |
|   + New Project        |
+------------------------+
| ▼ QUICK ACTIONS        |
|   🔍 Search (⌘K)       |
|   📁 Open Project      |
|   📝 New Note          |
+------------------------+
| ▼ CHAT THREADS         |
|   💬 Current Thread    |
|   📜 Thread History    |
|   🤖 Agent: Ready      |
+------------------------+
| NAVIGATION             |
|   🏠 Hub               |
|   💻 IDE               |
|   📝 Notes             |
|   ⚙️ Settings          |
+------------------------+
| [User] [Theme] [Help]  |
+------------------------+
```

#### Implementation

Update `GlobalSidebar.tsx` to include:
- Project list with active indicator
- Quick actions section
- Chat thread access
- Navigation links
- User menu

#### Acceptance Criteria

- [ ] Sidebar shows project list
- [ ] Quick actions are accessible
- [ ] Chat thread access is visible
- [ ] Navigation works correctly
- [ ] 8-bit design compliant

---

### CCF-07: Add Chat Cascade Widget to Sidebar

**Priority**: P1
**Effort**: 3 hours
**Team**: Team B
**Depends On**: CCF-06

#### Description

The "Chat Cascade + Thread Management Plugin" (per new-fundamental-truths.md 3.3) must be accessible from the sidebar.

#### Requirements

- Current thread preview
- Thread count indicator
- Agent status indicator
- Quick access to chat panel

#### Implementation

```typescript
// In GlobalSidebar.tsx
<SidebarSection title={t('sidebar.chatThreads')}>
  <CurrentThreadPreview />
  <ThreadListButton count={threadCount} />
  <AgentStatusIndicator status={agentStatus} />
</SidebarSection>
```

#### Acceptance Criteria

- [ ] Chat section visible in sidebar
- [ ] Thread access works
- [ ] Agent status displays
- [ ] 8-bit design compliant

---

### CCF-08: Rename "Workspace" to "Project" (Phase 1)

**Priority**: P1
**Effort**: 4 hours
**Team**: Team A
**Depends On**: CCF-01, CCF-02

#### Description

Rename all user-facing and code-level references from "workspace" to "project".

#### Phase 1 Scope (This Story)

Focus on:
- i18n keys
- Component names visible in UI
- Store names used in components

#### Files to Modify

```
src/i18n/en.json
src/i18n/vi.json
src/presentation/components/layout/MainSidebar.tsx
src/routes/__root.tsx
```

#### i18n Changes

```json
// BEFORE
"global.sidebar.ide": "IDE Workspace"
"global.sidebar.notes": "Notes Workspace"

// AFTER
"global.sidebar.ide": "IDE Layout"
"global.sidebar.notes": "Notes Layout"
// Or better: "global.sidebar.layoutPreset.ide": "IDE View"
```

#### Acceptance Criteria

- [ ] No "workspace" in user-facing UI (check i18n)
- [ ] Labels use "project" and "layout preset"
- [ ] TypeScript: 0 new errors

---

### CCF-09: Rename "Workspace" to "Project" (Phase 2 - Code)

**Priority**: P1
**Effort**: 6 hours
**Team**: Team B
**Depends On**: CCF-08

#### Description

Rename internal code references from "workspace" to "project".

#### Phase 2 Scope

Focus on:
- Component file names
- Store file names
- Type names
- Function names

#### Key Renames

| Current | New |
|---------|-----|
| `UnifiedWorkspaceProvider` | `ProjectProvider` |
| `UnifiedWorkspaceContext` | `ProjectContext` |
| `useUnifiedWorkspaceContext` | `useProjectContext` |
| `workspace-store.ts` | (keep if about layout, rename if about project) |
| `WorkspaceBadge` | `LayoutPresetIndicator` |

#### Files to Create/Modify

```
# Create facade re-exports for backward compatibility
src/infrastructure/context/workspace-context.ts  # Re-export from project-context

# Rename
src/presentation/components/common/WorkspaceBadge.tsx -> LayoutPresetIndicator.tsx
```

#### Acceptance Criteria

- [ ] Major components renamed
- [ ] Facade re-exports prevent breaking changes
- [ ] Types updated
- [ ] TypeScript: 0 new errors

---

### CCF-10: Split PluginLayout.tsx (1034 Lines)

**Priority**: P1
**Effort**: 4 hours
**Team**: Team B
**Depends On**: None

#### Description

Split `PluginLayout.tsx` into focused components under 400 lines each.

#### Current File

```
src/presentation/layouts/PluginLayout.tsx (1034 lines)
```

#### Target Structure

```
src/presentation/layouts/
  PluginLayout.tsx             (~250 lines - main orchestrator)
  PluginToolbar.tsx            (~150 lines - toggle toolbar)
  EmptyPluginState.tsx         (~50 lines - empty state)
  MobilePluginNav.tsx          (~100 lines - mobile tabs)
  layout-renderers/
    index.ts                   (barrel export)
    TwoColumnLayout.tsx        (~100 lines)
    ThreeColumnLayout.tsx      (~120 lines)
    TwoPlus1Layout.tsx         (~150 lines)
```

#### Extraction Plan

1. Extract `renderEmptyState()` -> `EmptyPluginState.tsx`
2. Extract layout mode renderers -> `layout-renderers/`
3. Extract mobile navigation -> `MobilePluginNav.tsx`
4. Keep orchestration logic in main file

#### Acceptance Criteria

- [ ] `PluginLayout.tsx` reduced to <400 lines
- [ ] All extracted components under 400 lines
- [ ] No functionality changes (pure refactor)
- [ ] TypeScript: 0 new errors

---

### CCF-11: Add Missing i18n Translation Keys

**Priority**: P1
**Effort**: 2 hours
**Team**: Team A
**Depends On**: None

#### Description

Add all 40+ missing translation keys to `en.json` and `vi.json`.

#### Keys to Add

```json
{
  "plugin.dragToReorder": "Drag to reorder",
  "plugin.noPluginsTitle": "No plugins loaded",
  "plugin.noPluginsDescription": "Add plugins to start working",
  "plugin.addPlugin": "Add Plugin",
  "plugin.allPluginsActive": "All plugins are active",
  "plugin.activePlugins": "active plugins",
  "plugin.layoutMode": "Layout",
  "plugin.layout1Column": "1 Column",
  "plugin.layout2Column": "2 Columns",
  "plugin.layout3Column": "3 Columns",
  "plugin.layout2Plus1": "2 + 1",
  "plugin.add": "Add",
  "plugin.notFound": "Plugin not found",
  "plugin.closePanel": "Close {{pluginName}}",
  
  "plugins.fileTree.name": "File Tree",
  "plugins.monaco.name": "Code Editor",
  "plugins.terminal.name": "Terminal",
  "plugins.chat.name": "AI Chat",
  "plugins.notes.name": "Notes",
  "plugins.agents.name": "Agents",
  "plugins.preview.name": "Preview",
  
  "sidebar.projectsHeader": "Projects",
  "sidebar.chatThreads": "Chat Threads",
  "sidebar.quickActions": "Quick Actions",
  "sidebar.navigation": "Navigation"
}
```

#### Acceptance Criteria

- [ ] All 40+ keys added to en.json
- [ ] All keys translated to vi.json
- [ ] No raw translation keys visible in UI
- [ ] TypeScript: 0 new errors

---

### CCF-12: Replace Monaco POC with Real Editor

**Priority**: P1
**Effort**: 6 hours
**Team**: Team B
**Depends On**: CCF-10

#### Description

Replace the textarea placeholder in `MonacoPlugin.tsx` with actual `@monaco-editor/react` integration.

#### Current POC (Lines 175-192)

```tsx
<textarea value={content} onChange={...} />
```

#### Target Implementation

```tsx
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  language={language}
  value={content}
  onChange={handleEditorChange}
  theme="vs-dark"
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, Consolas, monospace',
    lineNumbers: 'on',
    automaticLayout: true,
  }}
/>
```

#### Acceptance Criteria

- [ ] Real Monaco Editor renders
- [ ] Syntax highlighting works
- [ ] Language auto-detected from file extension
- [ ] File save (Cmd+S) works
- [ ] TypeScript: 0 new errors

---

### CCF-13: Implement Preview Plugin (WebContainer)

**Priority**: P1
**Effort**: 6 hours
**Team**: Team B
**Depends On**: CCF-12

#### Description

Create/enhance PreviewPlugin for embedded dev server preview using WebContainer.

#### Files to Create/Modify

```
src/plugins/preview/PreviewPlugin.tsx
```

#### Implementation

- Listen for dev server URL from Terminal plugin
- Embed preview in iframe
- Refresh button
- Open external button
- Empty state when no server running

#### Acceptance Criteria

- [ ] PreviewPlugin renders iframe when URL available
- [ ] Empty state shows instructions
- [ ] Refresh and Open External work
- [ ] TypeScript: 0 new errors

---

## Story Dependencies Graph

```
CCF-01 (Remove Routes)
   ↓
CCF-02 (Layout Presets) ----→ CCF-08 (Rename Phase 1)
   ↓                              ↓
CCF-03 (TanStack Navigation)  CCF-09 (Rename Phase 2)

CCF-04 (Fix Double Sidebar)
   ↓
CCF-05 (Consolidate Sidebar)
   ↓
CCF-06 (Project Management)
   ↓
CCF-07 (Chat Widget)

CCF-10 (Split PluginLayout) [Independent]
   ↓
CCF-12 (Real Monaco)
   ↓
CCF-13 (Preview Plugin)

CCF-11 (i18n Keys) [Independent]
```

---

## Team Assignments

### Team A (CCF-01, CCF-02, CCF-03, CCF-06, CCF-08, CCF-11)

| Day | Story | Effort | Description |
|-----|-------|--------|-------------|
| Day 1 AM | CCF-01 | 2h | Remove deprecated route files |
| Day 1 PM | CCF-02 | 3h | Implement layout presets |
| Day 2 AM | CCF-03 | 2h | Update navigation to TanStack |
| Day 2 PM | CCF-11 | 2h | Add i18n keys |
| Day 3 AM | CCF-06 | 4h | Add project management to sidebar |
| Day 3 PM | CCF-08 | 4h | Rename Phase 1 |

**Total Team A**: ~17 hours

### Team B (CCF-04, CCF-05, CCF-07, CCF-09, CCF-10, CCF-12, CCF-13)

| Day | Story | Effort | Description |
|-----|-------|--------|-------------|
| Day 1 AM | CCF-04 | 3h | Fix double sidebar |
| Day 1 PM | CCF-05 | 2h | Consolidate sidebar components |
| Day 2 AM | CCF-10 | 4h | Split PluginLayout.tsx |
| Day 2 PM | CCF-07 | 3h | Add chat widget to sidebar |
| Day 3 AM | CCF-12 | 6h | Real Monaco Editor |
| Day 4 AM | CCF-13 | 6h | Preview Plugin |
| Day 4 PM | CCF-09 | 6h | Rename Phase 2 |

**Total Team B**: ~30 hours

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Workspace-specific routes | 3+ | 0 |
| window.location.href usages | 5+ | 0 |
| Sidebar components | 3 | 1 |
| PluginLayout.tsx lines | 1034 | <400 |
| Missing i18n keys | 40+ | 0 |
| Monaco implementation | Textarea POC | Real @monaco-editor/react |
| "Workspace" in UI | 40+ occurrences | 0 |
| Phase 1A Blocking | YES | NO |

---

## Validation Gates

| Story | Validation Command | Success Criteria |
|-------|-------------------|------------------|
| CCF-01 | `ls src/routes/*projectId*.tsx` | Only `$projectId.tsx` exists |
| CCF-02 | Manual: `/$projectId?layout=ide` | Loads IDE-focused plugins |
| CCF-03 | `grep -r "window.location.href" src/` | 0 results (except debug) |
| CCF-04 | Visual: Check browser | No double sidebar |
| CCF-05 | `ls src/presentation/components/**/[Ss]idebar*` | Single file |
| CCF-06 | Visual: Check sidebar | Project list visible |
| CCF-07 | Visual: Check sidebar | Chat section visible |
| CCF-08 | `grep -ri "workspace" src/i18n/` | 0 results |
| CCF-09 | `grep -r "Workspace" src/**/*.tsx` | Minimal (facades only) |
| CCF-10 | `wc -l src/presentation/layouts/PluginLayout.tsx` | <400 |
| CCF-11 | Visual: Toggle plugins | No raw translation keys |
| CCF-12 | Visual: Open .tsx file | Syntax highlighting works |
| CCF-13 | Visual: Run pnpm dev | Preview shows site |

---

## Rollback Strategy

1. **CCF-01**: Restore routes from archive
2. **CCF-02**: Remove layout preset logic from route
3. **CCF-03**: Revert to window.location.href (not recommended)
4. **CCF-04**: Restore MainLayout wrappers
5. **CCF-05**: Keep merged sidebar (no rollback needed)
6. **CCF-06, CCF-07**: Remove new sidebar sections
7. **CCF-08, CCF-09**: Facade re-exports ensure backward compatibility
8. **CCF-10**: Keep split files (no functional change)
9. **CCF-11**: Remove added keys (no code impact)
10. **CCF-12, CCF-13**: Revert to POC implementations

---

## References

| Document | Path | Relevance |
|----------|------|-----------|
| new-fundamental-truths.md | `/new-fundamental-truths.md` | Core architecture, route rules |
| the-3-phase-approach.md | `/docs/the-3-phase-approach.md` | Phase 1A requirements |
| EPIC-CC-AR02AR03 | `_bmad-output/planning-artifacts/epics/EPIC-CC-AR02AR03-*.md` | Superseded by this EPIC |
| EPIC-UX-GLOBAL-UI | `_bmad-output/planning-artifacts/epics/EPIC-UX-GLOBAL-UI-*.md` | Superseded by this EPIC |
| ADR-034 | Architecture decisions | Route structure, plugin architecture |

---

## Approval Signatures

- [ ] User (Product Owner)
- [ ] Architect Agent (architect-ext)
- [ ] Sprint Manager (bmad-sprint-manager)

---

**Ready for sprint-manager handoff upon user approval.**

---

*Created: 2026-01-26*
*Epic Type: Correct-Course (Final)*
*Supersedes: EPIC-CC-AR02AR03, EPIC-UX-GLOBAL-UI*
