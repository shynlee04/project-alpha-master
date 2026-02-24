# CC-AR-11: Remove Workspace Terminology Across Codebase

## Story Metadata

| Field | Value |
|--------|--------|
| **Story ID** | CC-AR-11 |
| **Epic ID** | EPIC-CC-AR02AR03 |
| **Title** | Remove Workspace Terminology Across Codebase |
| **Team** | Team B |
| **Priority** | P1 |
| **Status** | READY |
| **Effort** | 4 hours |
| **Depends On** | CC-AR-10 |

---

## User Story

**As a** developer maintaining the codebase,
**I want to** remove all "workspace" terminology from presentation components,
**So that** the entire UI is consistent with ADR-034's project-centric architecture.

---

## Problem Statement

After CC-AR-10 (Hub cleanup), the codebase still has 75+ "workspace" references across presentation components:

### High-Priority Files

```
src/presentation/components/hub/WorkspaceFilter.tsx → Rename to ProjectFilter.tsx
src/presentation/components/hub/WorkspaceBadge.tsx → Rename to ProjectBadge.tsx
src/presentation/components/hub/WorkspaceBindingDialog.tsx → Archive
src/presentation/components/hub/WorkspaceBindingToggle.tsx → Archive
src/presentation/components/common/WorkspaceSwitcher.tsx → Archive
src/presentation/components/workspace/*.tsx → Archive entire folder
```

### Scope

- Component renames (Workspace → Project)
- File archival (deprecated workspace components)
- Import path updates
- i18n key updates

---

## Acceptance Criteria

- [ ] All "workspace" components archived or renamed to "project"
- [ ] `grep -r "workspace" src/presentation --include="*.tsx"` returns 0 UI-visible matches
- [ ] Renamed components use "Project" prefix
- [ ] Deprecated components archived with date stamp
- [ ] TypeScript compiles with 0 errors

---

## Component Renames

| Old Name | New Name | Action |
|-----------|-----------|--------|
| WorkspaceFilter | ProjectFilter | Rename file |
| WorkspaceBadge | ProjectBadge | Rename file |
| WorkspaceSwitcher | ProjectSwitcher | Rename file (if useful) |
| WorkspaceBindingDialog | - | Archive (replaced by Hub project picker) |
| WorkspaceBindingToggle | - | Archive (replaced by Hub project binding) |
| WorkspaceSettings | ProjectSettings | Rename file |

---

## Implementation Plan

### Phase 1: Rename Components

```bash
# Rename components
mv src/presentation/components/hub/WorkspaceFilter.tsx \
   src/presentation/components/hub/ProjectFilter.tsx

mv src/presentation/components/hub/WorkspaceBadge.tsx \
   src/presentation/components/hub/ProjectBadge.tsx
```

### Phase 2: Update Import Paths

```typescript
// Find and replace imports
// BEFORE:
import { WorkspaceFilter } from '@/presentation/components/hub/WorkspaceFilter';

// AFTER:
import { ProjectFilter } from '@/presentation/components/hub/ProjectFilter';
```

### Phase 3: Archive Deprecated Components

```bash
# Create archive directory
mkdir -p _bmad-ext/.archive/workspace-terminology-2026-01-26/

# Archive deprecated components
mv src/presentation/components/hub/WorkspaceBindingDialog.tsx \
   _bmad-ext/.archive/workspace-terminology-2026-01-26/

mv src/presentation/components/hub/WorkspaceBindingToggle.tsx \
   _bmad-ext/.archive/workspace-terminology-2026-01-26/

mv src/presentation/components/common/WorkspaceSwitcher.tsx \
   _bmad-ext/.archive/workspace-terminology-2026-01-26/

# Archive entire workspace folder if exists
mv src/presentation/components/workspace/ \
   _bmad-ext/.archive/workspace-terminology-2026-01-26/
```

### Phase 4: Update Component Usage

```typescript
// Replace component names
// BEFORE:
<WorkspaceFilter projects={projects} />
<WorkspaceBadge status={status} />

// AFTER:
<ProjectFilter projects={projects} />
<ProjectBadge status={status} />
```

### Phase 5: Update i18n Keys

**en.json** and **vi.json**:
- Replace "workspace" keys with "project"
- Update component labels

---

## Validation Gate

```bash
# Search for workspace references (excluding archive)
grep -ri "workspace" src/presentation --include="*.tsx" | \
  grep -v "_bmad-ext/.archive" | wc -l
# Target: 0 for UI-visible text (some internal references OK)

# TypeScript check
pnpm tsc --noEmit
```

---

## Dependencies

**Depends On**: CC-AR-10 (Hub cleanup)

**Blocks**: None (terminal story for this epic)

---

## Breaking Changes

**Component Names**:
- `WorkspaceFilter` → `ProjectFilter`
- `WorkspaceBadge` → `ProjectBadge`
- Deprecated components removed from imports

---

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| "workspace" references in src/presentation | 75+ | 0 (UI-visible) |
| Components renamed | 0 | 2+ |
| Archived components | 0 | 4+ |
| TypeScript errors | 0 | 0 |

---

## Notes

- Some internal "workspace" references may remain (e.g., type names, comments) - focus on UI-visible text only
- Archive location: `_bmad-ext/.archive/workspace-terminology-2026-01-26/`
- Create facade re-exports if any imports remain from archived files

---

**Created**: 2026-01-26
**Story Type**: Correct-Course (Foundation Reset)
**ADR Reference**: ADR-034 (Project-Centric Architecture)
