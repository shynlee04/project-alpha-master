---
id: EPIC-CC-UXSPEC-COMPLIANCE
title: UX Specification Compliance - Correct Course
version: 1.0.0
created: 2026-01-28
status: READY_FOR_EXECUTION
priority: P0
category: architectural
owner: Team A + Team B
estimated_effort: 5-6h
story_count: 5
---

# EPIC-CC-UXSPEC-COMPLIANCE: UX Specification Compliance

## Problem Statement

Previous UXUI EPICs created components that render but don't fully connect:

1. **StatusBar exists but not wired to route** - `WorkspaceLayout` has a `statusBar` prop but `$projectId.tsx` never passes it
2. **ActivityBar/PluginDocker show placeholder content** - `PluginActivityDockerWiring` uses a default fallback that shows "Plugin: {id}" instead of actual plugin components
3. **3 hardcoded zinc-* colors remain** - In `PluginLayout.tsx` lines 146 and 251
4. **Duplicate files exist** - `ide/StatusBar.tsx` duplicates `layout/StatusBar.tsx`, unused `PluginToggleBar.tsx`

This EPIC **TRANSFORMS** existing components (no new files) and **ARCHIVES** duplicates (reduces file count).

## Success Criteria

| # | Criterion | Verification |
|---|-----------|--------------|
| 1 | StatusBar visible at bottom of workspace | Screenshot shows 24px bar |
| 2 | ActivityBar icons load actual plugins | Click FileTree icon -> FileTree renders |
| 3 | PluginDocker shows plugin content | Not "Plugin: {id}" placeholder |
| 4 | All 3 hardcoded colors replaced with tokens | `grep zinc PluginLayout.tsx` returns 0 |
| 5 | Light theme toggle works on all components | Toggle works, colors change |
| 6 | Duplicate files archived | Net file reduction in component dirs |
| 7 | Build passes | `pnpm typecheck:fast && pnpm test:fast` |

## Investigation Findings

### Component Render Status

| Component | Location | Renders | Issue |
|-----------|----------|---------|-------|
| WorkspaceLayout | `layouts/WorkspaceLayout.tsx` | YES | statusBar slot unused |
| ActivityBar | `layout/ActivityBar.tsx` | YES | Wired but plugins don't load |
| PluginDocker | `layout/PluginDocker.tsx` | YES | Shows placeholder, not plugins |
| StatusBar | `layout/StatusBar.tsx` | NOT USED | Not imported/passed in route |
| PluginLayout | `layouts/PluginLayout.tsx` | YES | 3 hardcoded zinc-* colors |

### Root Cause Analysis

1. **StatusBar Missing**:
   - `$projectId.tsx` line 236-243 renders WorkspaceLayout but does NOT pass `statusBar` prop
   - Fix: Import StatusBar, pass to WorkspaceLayout

2. **Plugins Not Loading**:
   - `PluginActivityDockerWiring.tsx` line 260-269 has a DEFAULT fallback renderer:
   ```tsx
   // Default placeholder content
   return (
     <div className="p-4 font-mono text-sm text-muted-foreground">
       <div className="mb-2 font-semibold text-foreground">
         Plugin: {activePluginId}
       </div>
   ```
   - The route never passes a `renderPlugin` prop to the wiring
   - Fix: Create a PluginRenderer wrapper that uses the same `getPlugin()` from registry

3. **Hardcoded Colors** (3 instances in PluginLayout.tsx):
   - Line 146: `border-zinc-700` -> `border-border`
   - Line 251: `text-zinc-500 bg-zinc-900/50` -> `text-muted-foreground bg-muted`

4. **Duplicate Files**:
   - `ide/StatusBar.tsx` - older version, archive it
   - `ide/statusbar/StatusBarSegment.tsx` - part of old StatusBar, archive
   - `PluginToggleBar.tsx` - unused (PluginToggles.tsx is used), archive

### Files to Modify

| File | Action | Details |
|------|--------|---------|
| `src/routes/$projectId.tsx` | MODIFY | Add StatusBar import, pass to WorkspaceLayout; add renderPlugin to wiring |
| `src/presentation/layouts/PluginLayout.tsx` | MODIFY | Replace 3 zinc-* with tokens |
| `src/presentation/components/layout/PluginActivityDockerWiring.tsx` | NONE | Already supports renderPlugin prop |

### Files to Archive

| File | Reason |
|------|--------|
| `src/presentation/components/ide/StatusBar.tsx` | Duplicate of layout/StatusBar.tsx |
| `src/presentation/components/ide/statusbar/StatusBarSegment.tsx` | Part of old ide/StatusBar |
| `src/presentation/components/layout/PluginToggleBar.tsx` | Unused - PluginToggles.tsx used instead |

### Files to Create

**NONE** - This is a transformation-only EPIC.

---

## Stories

### CC-UX-01: Wire StatusBar to Route (30 min)

**Priority**: P0
**Team**: Team A
**Effort**: 30 min

**Description**:
Import and wire StatusBar component to the project route.

**Tasks**:
1. Import `StatusBar` from `@/presentation/components/layout/StatusBar`
2. Pass `statusBar={<StatusBar />}` to WorkspaceLayout
3. Optionally connect real agent/sync status from stores

**Acceptance Criteria**:
- [ ] StatusBar visible at bottom (24px height)
- [ ] Shows "Idle" agent status by default
- [ ] Shows "Ln 1, Col 1" cursor position
- [ ] Respects responsive rules (hidden on mobile)
- [ ] TypeScript compiles without errors

**Files Modified**:
- `src/routes/$projectId.tsx`

---

### CC-UX-02: Fix Plugin Loading in ActivityBar/Docker (2h)

**Priority**: P0
**Team**: Team A
**Effort**: 2h

**Description**:
Wire PluginActivityDockerWiring to use actual plugin components from the registry instead of placeholder text.

**Root Cause**:
The wiring hook has a `renderPlugin` prop that's never passed. When undefined, it shows a default placeholder.

**Tasks**:
1. Create a `DockerPluginRenderer` component that uses `getPlugin()` from registry
2. Pass this renderer to both left and right wiring in $projectId.tsx
3. Handle plugin not found gracefully (same as PluginLayout.tsx line 249-256)

**Implementation**:
```tsx
// In $projectId.tsx - add this component
function DockerPluginRenderer({ pluginId, position }: PluginRendererProps) {
  const plugin = getPlugin(pluginId as PluginId);
  if (!plugin) {
    return <div className="p-4 text-muted-foreground">Plugin not found</div>;
  }
  return <plugin.MainComponent width={0} height={0} />;
}

// Then pass to wiring:
const leftWiring = usePluginActivityDockerWiring({
  ...existingProps,
  renderPlugin: DockerPluginRenderer,
});
```

**Acceptance Criteria**:
- [ ] Click FileTree icon in ActivityBar -> FileTree component renders in Docker
- [ ] Click Search icon -> Search component renders
- [ ] Click Chat icon -> Chat component renders
- [ ] No "Plugin: {id}" placeholder text visible
- [ ] Plugin close button works
- [ ] TypeScript compiles without errors

**Files Modified**:
- `src/routes/$projectId.tsx`

---

### CC-UX-03: Replace 3 Hardcoded Colors (30 min)

**Priority**: P1
**Team**: Team B
**Effort**: 30 min

**Description**:
Replace the 3 remaining `zinc-*` colors in PluginLayout.tsx with semantic tokens.

**Hardcoded Colors Found**:
| Line | Current | Replacement |
|------|---------|-------------|
| 146 | `border-zinc-700` | `border-border` |
| 251 | `text-zinc-500` | `text-muted-foreground` |
| 251 | `bg-zinc-900/50` | `bg-muted` |

**Tasks**:
1. Open `src/presentation/layouts/PluginLayout.tsx`
2. Line 146: Replace `border-zinc-700` with `border-border`
3. Line 251: Replace `text-zinc-500 bg-zinc-900/50` with `text-muted-foreground bg-muted`
4. Verify no other zinc-* remain: `grep zinc PluginLayout.tsx`

**Acceptance Criteria**:
- [ ] `grep zinc-` on PluginLayout.tsx returns 0 matches (excluding comments)
- [ ] Light theme toggle changes these colors correctly
- [ ] Visual appearance unchanged in dark mode
- [ ] Build passes

**Files Modified**:
- `src/presentation/layouts/PluginLayout.tsx`

---

### CC-UX-04: Archive Duplicate Files (1h)

**Priority**: P1
**Team**: Team B
**Effort**: 1h

**Description**:
Archive duplicate/unused component files to reduce codebase noise and prevent confusion.

**Files to Archive**:

| File | Archive To | Reason |
|------|------------|--------|
| `src/presentation/components/ide/StatusBar.tsx` | `_bmad-ext/.archive/duplicate-components-2026-01-28/` | Duplicate of layout/StatusBar.tsx |
| `src/presentation/components/ide/statusbar/` (entire folder) | Same | Part of old StatusBar |
| `src/presentation/components/layout/PluginToggleBar.tsx` | Same | Unused - PluginToggles.tsx is used |

**Tasks**:
1. Create archive directory: `_bmad-ext/.archive/duplicate-components-2026-01-28/`
2. Move duplicate files to archive
3. Check for any imports of archived files: `grep -r "ide/StatusBar" src/`
4. Update any imports if found (unlikely based on investigation)
5. Verify build passes

**Acceptance Criteria**:
- [ ] Duplicate files moved to archive (not deleted)
- [ ] No broken imports in codebase
- [ ] `pnpm typecheck:fast` passes
- [ ] Net reduction of 3+ files in src/presentation/components/

**Files Archived**:
- `src/presentation/components/ide/StatusBar.tsx`
- `src/presentation/components/ide/statusbar/StatusBarSegment.tsx`
- `src/presentation/components/layout/PluginToggleBar.tsx`

---

### CC-UX-05: Visual Validation Against UX Spec (1h)

**Priority**: P1
**Team**: Team A + Team B
**Effort**: 1h

**Description**:
Validate all 15 UX specification sections are visible in the running application.

**UX Spec Sections to Validate**:

| # | Section | Verification Method |
|---|---------|---------------------|
| 1 | Executive Summary | N/A (doc only) |
| 2 | Design Principles | Visual: 8-bit corners, pixel shadows |
| 3 | Design Tokens | Visual: Colors change with theme |
| 4 | Responsive Grid | Resize: Layout adapts at breakpoints |
| 5 | Global Components | Visual: Sidebar, StatusBar visible |
| 6 | Route & Navigation | Click: Routes work, breadcrumbs show |
| 7 | Plugin Architecture | Click: Plugins load in Docker |
| 8 | Activity Bar & Docker | Visual: ActivityBars on both sides |
| 9 | Plugin Interfaces | Visual: Plugin headers, tabs work |
| 10 | i18n & Typography | Toggle: Vietnamese works |
| 11 | Accessibility | Tab: Keyboard navigation works |
| 12 | Agent Governance | N/A (internal) |
| 13 | Appendix | N/A (doc only) |
| 14 | Light Theming | Toggle: Light theme works |
| 15 | Micro Animations | Visual: Step animations play |

**Tasks**:
1. Run app: `pnpm dev`
2. Navigate to a project route
3. Screenshot each element listed above
4. Compare to UX spec diagrams
5. Document any remaining gaps in a findings report

**Acceptance Criteria**:
- [ ] All major layout elements visible (Sidebar, ActivityBars, StatusBar)
- [ ] Light theme toggle works on all components
- [ ] Plugins load correctly in Docker panels
- [ ] No visual regressions from previous state
- [ ] Findings report created if gaps remain

**Output Artifact**:
- `_bmad-output/validation/ux-spec-compliance-2026-01-28.md`

---

## Dependency Graph

```
CC-UX-01 (StatusBar)     CC-UX-03 (Colors)     CC-UX-04 (Archive)
    │                         │                      │
    └─────────────┬───────────┘                      │
                  │                                  │
                  v                                  │
           CC-UX-02 (Plugins)                        │
                  │                                  │
                  └──────────────────────────────────┘
                                  │
                                  v
                        CC-UX-05 (Validation)
```

- CC-UX-01, CC-UX-03, CC-UX-04 can run in parallel
- CC-UX-02 should run after CC-UX-01 (same file modified)
- CC-UX-05 runs last (needs all changes complete)

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Plugin registry doesn't have all plugins | Check registry, fallback UI in place |
| Breaking imports when archiving | Grep check before archive |
| StatusBar affects layout height | CSS already reserves 24px slot |
| Light theme colors don't match | Use semantic tokens only |

---

## Definition of Done

1. All 5 stories complete with acceptance criteria met
2. `pnpm typecheck:fast` passes
3. `pnpm test:fast` passes (no new failures)
4. Light theme toggle works on ALL modified components
5. StatusBar visible at bottom
6. Plugins load in ActivityBar/Docker (not placeholder)
7. Net file reduction in component directories
8. Validation report created

---

## Execution Notes

**Recommended Order**:
1. Team A starts CC-UX-01 (30 min)
2. Team B starts CC-UX-03 + CC-UX-04 in parallel (1.5h total)
3. Team A continues to CC-UX-02 (2h)
4. Both teams collaborate on CC-UX-05 (1h)

**Total Time**: 5-6 hours with parallelization

**Files Touched Summary**:
- Modified: 2 files (`$projectId.tsx`, `PluginLayout.tsx`)
- Archived: 3+ files
- Created: 0 files (transformation only)

---

*EPIC created by BMAD Sprint Manager | 2026-01-28*
