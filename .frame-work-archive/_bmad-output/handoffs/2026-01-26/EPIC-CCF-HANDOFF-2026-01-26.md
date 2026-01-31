# EPIC-CCF Handoff Artifact

**Handoff ID**: EPIC-CCF-HANDOFF-2026-01-26
**Created**: 2026-01-26
**From**: bmad-sprint-manager
**To**: Team A + Team B (Dev Teams)
**Epic**: EPIC-CCF (Final Correct-Course for Phase 1A Alignment)

---

## Executive Summary

This handoff provides complete context for executing EPIC-CCF, the FINAL correct-course that addresses ALL fundamental UX/UI violations blocking Phase 1A.

**Key Message**: This EPIC supersedes EPIC-CC-AR02AR03 and EPIC-UX-GLOBAL-UI. All work from those EPICs that remains incomplete is consolidated here.

---

## Context Files to Load

Before starting any story, load these files:

| File | Purpose |
|------|---------|
| `new-fundamental-truths.md` | Core architecture, route rules (Section 1.2) |
| `docs/the-3-phase-approach.md` | Phase 1A requirements |
| `_bmad-output/planning-artifacts/epics/EPIC-CORRECT-COURSE-FINAL-2026-01-26.md` | Full EPIC details |
| `AGENTS.md` | Active sprint status, team assignments |

---

## Critical Issue Summary

### Route Architecture Violations

| Issue | File | Line | Fix Required |
|-------|------|------|--------------|
| Workspace-specific route exists | `src/routes/ide.$projectId.tsx` | ALL | DELETE (archive) |
| Workspace-specific route exists | `src/routes/notes.$projectId.tsx` | ALL | DELETE (archive) |
| window.location.href navigation | `src/routes/notes.lazy.tsx` | 25 | Replace with useNavigate() |

### Double UI Violations

| Issue | Files Affected | Fix Required |
|-------|----------------|--------------|
| Double sidebar rendering | `__root.tsx`, `MainLayout.tsx` | Remove MainLayout wrapper from routes |
| Duplicate sidebar components | `MainSidebar.tsx`, `ProjectSidebar.tsx` | Consolidate to single GlobalSidebar |

### God Component Violations

| File | Lines | Threshold | Fix Required |
|------|-------|-----------|--------------|
| `PluginLayout.tsx` | 1034 | 400 | Split into 5-6 components |

### POC Stub Violations

| Component | Current State | Fix Required |
|-----------|---------------|--------------|
| `MonacoPlugin.tsx` | Textarea | Replace with @monaco-editor/react |

---

## Story Execution Order

### Day 1 (Parallel Execution)

**Team A**:
1. **CCF-01** (2h): Remove deprecated route files
   - Archive `ide.$projectId.tsx` and `notes.$projectId.tsx`
   - Fix `notes.lazy.tsx` navigation
   
2. **CCF-11** (2h): Add missing i18n keys
   - Add 40+ keys to en.json and vi.json

**Team B**:
1. **CCF-04** (3h): Fix double sidebar
   - Remove MainLayout wrapper from all routes
   - Ensure sidebar only in __root.tsx

2. **CCF-05** (2h): Consolidate sidebar components
   - Merge into single GlobalSidebar.tsx

### Day 2 (Parallel Execution)

**Team A**:
1. **CCF-02** (3h): Implement layout presets in $projectId route
2. **CCF-03** (2h): Update all navigation to TanStack Router

**Team B**:
1. **CCF-10** (4h): Split PluginLayout.tsx
2. **CCF-07** (3h): Add chat widget to sidebar

### Day 3 (Parallel Execution)

**Team A**:
1. **CCF-06** (4h): Add project management to sidebar
2. **CCF-08** (4h): Rename "Workspace" to "Project" (Phase 1 - UI)

**Team B**:
1. **CCF-12** (6h): Replace Monaco POC with real editor

### Day 4 (Parallel Execution)

**Team A**:
- Buffer / Code review

**Team B**:
1. **CCF-13** (6h): Implement Preview Plugin
2. **CCF-09** (6h): Rename "Workspace" to "Project" (Phase 2 - Code)

---

## File Paths and Line Numbers

### CCF-01: Remove Deprecated Route Files

```
DELETE (archive to _bmad-ext/.archive/route-cleanup-2026-01-26/):
- src/routes/ide.$projectId.tsx
- src/routes/notes.$projectId.tsx
- src/routes/ide.tsx (if exists)

MODIFY:
- src/routes/notes.lazy.tsx
  Line 25: Replace window.location.href with useNavigate()
  
  BEFORE:
  window.location.href = '/hub?action=select-project&workspace=notes';
  
  AFTER:
  import { useNavigate } from '@tanstack/react-router';
  const navigate = useNavigate();
  navigate({ to: '/hub', search: { action: 'select-project', layout: 'notes' } });
```

### CCF-04: Fix Double Sidebar

```
MODIFY:
- src/routes/index.tsx
  Remove: import { MainLayout } from '@/presentation/components/layout/MainLayout'
  Remove: <MainLayout> wrapper around content
  
- src/routes/hub.tsx
  Same as above
  
- src/routes/settings.tsx
  Same as above
  
- src/routes/agents.tsx
  Same as above
  
- src/routes/projects.tsx
  Same as above

ARCHIVE (if unused after changes):
- src/presentation/components/layout/MainLayout.tsx
```

### CCF-05: Consolidate Sidebar

```
KEEP (as canonical):
- src/presentation/components/layout/MainSidebar.tsx
  OR
- src/presentation/components/layout/GlobalSidebar.tsx

ARCHIVE:
- src/presentation/components/sidebar/ProjectSidebar.tsx
  (if functionality merged into canonical sidebar)

UPDATE IMPORTS:
- All files importing from sidebar/ should import from layout/GlobalSidebar
```

### CCF-10: Split PluginLayout.tsx

```
FROM: src/presentation/layouts/PluginLayout.tsx (1034 lines)

TO:
- src/presentation/layouts/PluginLayout.tsx (~250 lines)
- src/presentation/layouts/PluginToolbar.tsx (~150 lines)
- src/presentation/layouts/EmptyPluginState.tsx (~50 lines)
- src/presentation/layouts/MobilePluginNav.tsx (~100 lines)
- src/presentation/layouts/layout-renderers/index.ts
- src/presentation/layouts/layout-renderers/TwoColumnLayout.tsx (~100 lines)
- src/presentation/layouts/layout-renderers/ThreeColumnLayout.tsx (~120 lines)
- src/presentation/layouts/layout-renderers/TwoPlus1Layout.tsx (~150 lines)
```

### CCF-11: i18n Keys

```
MODIFY:
- src/i18n/en.json
- src/i18n/vi.json

ADD KEYS (full list in EPIC file):
plugin.*, plugins.*, sidebar.*, layout.*
```

### CCF-12: Real Monaco Editor

```
MODIFY:
- src/plugins/monaco/MonacoPlugin.tsx

REPLACE Lines 175-192:
  FROM: <textarea value={content} ... />
  TO: <Editor from @monaco-editor/react ... />

VERIFY IMPORT:
  import Editor from '@monaco-editor/react';
```

---

## Validation Commands

Run these after completing each story:

```bash
# After all stories
pnpm tsc --noEmit
# Expected: 0 errors

# CCF-01 validation
ls src/routes/*projectId*.tsx
# Expected: Only $projectId.tsx

# CCF-03 validation
grep -r "window.location.href" src/routes/ --include="*.tsx"
# Expected: 0 results (or only debug files)

# CCF-04 validation
grep -r "MainLayout" src/routes/ --include="*.tsx"
# Expected: 0 results

# CCF-10 validation
wc -l src/presentation/layouts/PluginLayout.tsx
# Expected: <400 lines

# CCF-11 validation
# Visual: Open app, toggle plugins - no raw translation keys visible

# CCF-12 validation
# Visual: Open .tsx file - syntax highlighting works
```

---

## Common Pitfalls to Avoid

### 1. Don't Forget Facade Re-exports

When archiving files, create facade re-exports to prevent breaking imports:

```typescript
// src/routes/ide.$projectId.tsx (BEFORE archiving)
// Create redirect file instead of deleting:
export { ProjectRoute as default } from './$projectId';
```

### 2. Don't Break Circular Imports

When splitting PluginLayout.tsx, avoid creating circular dependencies:
- Layout renderers should NOT import PluginLayout
- Use prop drilling or context for shared state

### 3. Test Navigation After Route Changes

After CCF-01, CCF-02, CCF-03:
1. Navigate to `/hub`
2. Select a project → should go to `/$projectId`
3. Add `?layout=ide` → should load IDE-focused plugins
4. Back button should work

### 4. Verify i18n Works in Both Languages

After CCF-11:
1. Switch to English → all text displays
2. Switch to Vietnamese → all text translated
3. No raw keys like `plugin.noPluginsTitle`

---

## Success Criteria (Epic Complete)

The EPIC is COMPLETE when:

- [ ] Only TWO routes exist: `/hub` and `/$projectId`
- [ ] No `window.location.href` in src/ (except HTTP-Referer reads)
- [ ] Single sidebar component (no duplicates)
- [ ] Sidebar contains: Project list, Quick actions, Chat access, Navigation
- [ ] No "workspace" in user-facing UI
- [ ] PluginLayout.tsx < 400 lines
- [ ] No raw translation keys visible
- [ ] Monaco editor has syntax highlighting
- [ ] TypeScript: 0 errors
- [ ] All manual tests pass

---

## Escalation Path

If blocked:
1. Check `AGENTS.md` for file ownership
2. Check `_bmad-output/handoffs/2026-01-25/` for related handoffs
3. If architectural question: Consult `new-fundamental-truths.md`
4. If still blocked: Create blocker note in story file and move to next story

---

## Sign-Off

- [ ] Team A Lead acknowledges handoff
- [ ] Team B Lead acknowledges handoff
- [ ] All context files loaded
- [ ] Ready to begin execution

---

*Handoff Created: 2026-01-26*
*Sprint Manager: bmad-sprint-manager*
*Target Completion: 2026-01-31*
