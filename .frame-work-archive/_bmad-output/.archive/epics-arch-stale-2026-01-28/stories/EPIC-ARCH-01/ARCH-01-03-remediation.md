---
story_id: ARCH-01-03-remediation
title: Archive Knowledge/Study UI References
points: 3
priority: P1
status: pending
team: A
dependencies: []
time_box: 1 hour
created_at: 2026-01-21T17:30:00+07:00
epic_id: EPIC-ARCH-01
epic_name: Foundation Cleanup
architecture_ref: ADR-034
parent_story: ARCH-01-03
---

# Story: ARCH-01-03-Remediation - Archive Knowledge/Study UI References

## Description

As a developer, I want to remove all Knowledge and Study workspace UI references from codebase, So that the codebase reflects the DEFER status of these features as stated in ADR-034.

## Context

**Original Story Claim (ARCH-01-03):**
- "Knowledge/Study UI already effectively archived"
- "Navigation items already commented out in Header.tsx and MainSidebar.tsx"
- "No route files ever existed (DEFER features never implemented)"

**Architect Validation Findings (FAIL):**
- `src/presentation/components/hub/WorkspaceFilter.tsx` has 'knowledge' and 'study' workspace options
- `src/presentation/components/hub/WorkspacePieChart.tsx` displays knowledgeCount and studyCount
- Hub UI still renders Knowledge and Study workspaces
- Claim about "navigation items already commented out" is FALSE

## Acceptance Criteria

- [x] Knowledge workspace option removed from WorkspaceFilter.tsx
- [x] Study workspace option removed from WorkspaceFilter.tsx
- [x] Knowledge/Study removed from WorkspacePieChart.tsx (or marked as hidden/deferred)
- [x] No remaining UI references to Knowledge/Study workspaces
- [x] TypeScript compiles with 0 errors for modified files
- [x] All navigation items for Knowledge/Study are removed or conditionally hidden

## Tasks

### Phase 1: Identify All References (15 min)
- [x] Search for all 'knowledge' workspace references in UI components
- [x] Search for all 'study' workspace references in UI components
- [x] Document each location and context (navigation, charts, filters, etc.)
- [x] Identify which references can be safely removed vs need conditional hiding

### Phase 2: Remove UI References (30 min)
- [x] Remove 'knowledge' option from WorkspaceFilter.tsx
- [x] Remove 'study' option from WorkspaceFilter.tsx
- [x] Remove Knowledge/Study from WorkspacePieChart.tsx (or add isDeferred flag)
- [x] Update Hub component to handle missing workspaces gracefully
- [x] Add TODO comments where removal would break logic (if any)

### Phase 3: Validate No Broken Imports (15 min)
- [x] Run TypeScript compiler (0 errors)
- [x] Check for broken imports to Knowledge/Study components
- [x] Verify no references to non-existent route files
- [x] Test Hub UI renders without errors

### Phase 4: Documentation (0 min)
- [x] Update story completion with list of all changes made
- [x] Note any conditional logic that was preserved

## Dependencies

- None (can start immediately)

## Blocked By

- None

## Handoff Artifacts

- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-01/ARCH-01-03-remediation-completion.md`

## Notes

- Knowledge/Study are DEFER features (ADR-034) but UI still displays them
- Route files never existed, but UI components have workspace options
- Must distinguish between:
  - References that should be REMOVED (navigation, visible options)
  - References that might need CONDITIONAL HIDING (stats, charts)
- Consider adding a `isDeferred` flag to workspace types instead of hard removal

## Implementation Guidelines

1. **WorkspaceFilter.tsx**:
   - Remove 'knowledge' option from workspace list
   - Remove 'study' option from workspace list
   - Keep 'ide' and 'notes' options

2. **WorkspacePieChart.tsx**:
   - Either remove knowledge/study from chart
   - Or add `showOnlyActiveWorkspaces` prop to hide deferred workspaces

3. **Hub Component**:
   - Ensure no errors when knowledge/study workspaces missing
   - Update any workspace counts logic

## Required MCP Research

None - this is remediation work based on existing grep findings.

## Validation Report

**Validated At:** 2026-01-21T17:30:00+07:00
**Result:** PENDING (Awaiting Remediation)

### Evidence of Failure

```bash
# From architect grep:
src/presentation/components/hub/WorkspaceFilter.tsx:  { id: 'knowledge', icon: '📚', labelKey: 'hub.workspaceBinding.workspaces.knowledge' },
src/presentation/components/hub/WorkspaceFilter.tsx:  { id: 'study', icon: '🎓', labelKey: 'hub.workspaceBinding.workspaces.study' },
src/presentation/components/hub/WorkspacePieChart.tsx:  knowledge: '#22c55e', // green-500
src/presentation/components/hub/WorkspacePieChart.tsx:  study: '#a855f7',     // purple-500
src/presentation/components/hub/WorkspacePieChart.tsx:  knowledge: '📚',
src/presentation/components/hub/WorkspacePieChart.tsx:  study: '🎓',
```

### Verdict: FAIL - UI still displays Knowledge/Study workspaces

## Success Metrics

When complete:
- WorkspaceFilter shows only 'ide' and 'notes' options
- WorkspacePieChart doesn't display knowledge/study counts
- Hub UI renders without errors
- TypeScript: 0 new errors
- Build succeeds (if tested)

## Completion Summary

**Completed At:** 2026-01-21T20:00:00+07:00
**Status:** COMPLETED ✅
**TypeScript Errors:** 0 (in modified files)

### Files Modified

1. **src/presentation/components/hub/WorkspaceFilter.tsx**
   - Removed 'knowledge' and 'study' from WORKSPACES array
   - Added TODO comment referencing ADR-034
   - Updated conditional checks from `< 4` to `< 2` (for 2 active workspaces)
   - Updated "All" badge condition from `=== 4` to `=== 2`

2. **src/presentation/components/hub/WorkspacePieChart.tsx**
   - Removed `knowledgeCount` and `studyCount` from WorkspacePieChartProps interface
   - Removed 'knowledge' and 'study' from WORKSPACE_COLORS (commented out with TODO)
   - Removed 'knowledge' and 'study' from WORKSPACE_ICONS (commented out with TODO)
   - Updated component to only render IDE and Notes in chart data
   - Updated useMemo dependency array to only include ideCount and notesCount

3. **src/presentation/components/hub/ProjectPickerDialog.tsx**
   - Removed 'knowledge' and 'study' from PickerWorkspace type
   - Removed entries from WORKSPACE_CONFIG (commented out with TODO)
   - Commented out translation keys for knowledge/study empty states with ADR-034 reference

4. **src/presentation/components/hub/WorkspaceBadge.tsx**
   - Added `isDeferred` flag to knowledge/study WORKSPACE_CONFIG entries
   - Updated component to return null for deferred workspaces
   - This prevents knowledge/study badges from rendering on project cards

5. **src/presentation/components/common/WorkspaceSwitcher.tsx**
   - Added `isDeferred` flag to knowledge/study WORKSPACE_CONFIG entries
   - Added runtime filter to skip deferred workspaces in dropdown menu
   - Uses `.filter(Boolean)` to remove null entries

6. **src/presentation/components/hub/ChartsGrid.tsx**
   - Removed `knowledgeCount` and `studyCount` props from WorkspacePieChart component call

7. **src/presentation/components/hub/HubHomePage.tsx**
   - Updated openProjectPicker function signature to only accept 'ide' | 'notes'
   - Updated navigateToWorkspace function signature to only accept 'ide' | 'notes'
   - Updated projectPickerWorkspace state to only accept 'ide' | 'notes'
   - Added redirect logic for knowledge/study workspace params → redirect to 'notes'
   - Updated isWorkspaceEnabled helper to only accept 'ide' | 'notes'

### Implementation Approach

**Database Type Preservation:**
- WorkspaceId type in `dexie-db-core-types.ts` was NOT changed
- This preserves backward compatibility with existing IndexedDB records
- UI components filter out knowledge/study at runtime using `isDeferred` flag

**Runtime Filtering Strategy:**
- Instead of removing from type definitions, used runtime filtering
- Added `isDeferred` property to workspace config objects
- Components check this flag and return null or skip rendering
- This approach:
  - Preserves database compatibility
  - Prevents UI showing deferred workspaces
  - Allows easy re-enabling when workspaces are implemented

### Translation Keys

- Translation keys for knowledge/study workspaces commented out with ADR-034 reference
- Keys remain in i18n files for future use when workspaces are implemented

### Route Handling

- HubHomePage redirects knowledge/study workspace requests to 'notes' workspace
- Prevents broken navigation links in URL params
- User sees appropriate workspace instead of error

### TypeScript Validation

- All modified files compile with 0 errors
- No broken imports introduced
- No references to non-existent route files

### Future Re-Enable

When Knowledge/Study workspaces are ready to implement:
1. Remove `isDeferred: true` flags from workspace configs
2. Uncomment translation key documentation in files
3. Update function signatures to accept full workspace types
4. Update conditional checks from 2 to 4 workspaces
5. Add back knowledge/study entries to UI components
6. Create route files: /knowledge/$projectId and /study/$projectId

## Dependencies

- None (can start immediately)

## Blocked By

- None

## Handoff Artifacts

- `_bmad-output/sprint-artifacts/stories/EPIC-ARCH-01/ARCH-01-03-remediation-completion.md`

## Notes

- Knowledge/Study are DEFER features (ADR-034) but UI still displays them
- Route files never existed, but UI components have workspace options
- Must distinguish between:
  - References that should be REMOVED (navigation, visible options)
  - References that might need CONDITIONAL HIDING (stats, charts)
- Consider adding a `isDeferred` flag to workspace types instead of hard removal

## Implementation Guidelines

1. **WorkspaceFilter.tsx**:
   - Remove 'knowledge' option from workspace list
   - Remove 'study' option from workspace list
   - Keep 'ide' and 'notes' options

2. **WorkspacePieChart.tsx**:
   - Either remove knowledge/study from chart
   - Or add `showOnlyActiveWorkspaces` prop to hide deferred workspaces

3. **Hub Component**:
   - Ensure no errors when knowledge/study workspaces missing
   - Update any workspace counts logic

## Required MCP Research

None - this is remediation work based on existing grep findings.

## Validation Report

**Validated At:** 2026-01-21T17:30:00+07:00
**Result:** PENDING (Awaiting Remediation)

### Evidence of Failure

```bash
# From architect grep:
src/presentation/components/hub/WorkspaceFilter.tsx:  { id: 'knowledge', icon: '📚', labelKey: 'hub.workspaceBinding.workspaces.knowledge' },
src/presentation/components/hub/WorkspaceFilter.tsx:  { id: 'study', icon: '🎓', labelKey: 'hub.workspaceBinding.workspaces.study' },
src/presentation/components/hub/WorkspacePieChart.tsx:  knowledge: '#22c55e', // green-500
src/presentation/components/hub/WorkspacePieChart.tsx:  study: '#a855f7',     // purple-500
src/presentation/components/hub/WorkspacePieChart.tsx:  knowledge: '📚',
src/presentation/components/hub/WorkspacePieChart.tsx:  study: '🎓',
```

### Verdict: FAIL - UI still displays Knowledge/Study workspaces

## Success Metrics

When complete:
- WorkspaceFilter shows only 'ide' and 'notes' options
- WorkspacePieChart doesn't display knowledge/study counts
- Hub UI renders without errors
- TypeScript: 0 new errors
