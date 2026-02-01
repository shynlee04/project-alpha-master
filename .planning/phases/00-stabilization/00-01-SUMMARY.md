---
phase: 00-stabilization
plan: 01
subsystem: domain-types
tags: [cleanup, no-workspace, type-definitions, migration]

dependency_graph:
  requires: []
  provides:
    - "Clean type definitions (no WorkspaceBindings)"
    - "Backup branch for rollback safety"
    - "Archive directory with eliminated code"
  affects: ["00-02", "00-03", "00-04"]

tech_stack:
  added: []
  patterns:
    - "Plugin-based architecture replaces workspace bindings"
    - "PluginType union replaces WorkspaceType enum"
    - "ProjectPlugins replaces WorkspaceBindings"

key_files:
  created:
    - ".archive/MANIFEST.md"
  modified:
    - "src/domain/entities/project.ts"
  deleted:
    - "src/domain/entities/workspace.ts"
    - "src/domain/value-objects/workspace-binding.ts"
    - "src/domain/value-objects/workspace-type.ts"
    - "src/domain/use-cases/switch-workspace-use-case.ts"
    - "src/domain/services/workspace-transition-service.ts"

decisions:
  - id: "00-01-01"
    title: "Archive instead of delete"
    choice: "Move banned files to .archive/ before deletion"
    rationale: "Preserves rollback capability while removing from active codebase"
  - id: "00-01-02"
    title: "Plugin-centric replacement"
    choice: "Use PluginType[] and ProjectPlugins instead of WorkspaceBindings"
    rationale: "Aligns with NO-WORKSPACE mandate from SOURCE-OF-TRUTH.md"

metrics:
  completed: "2026-02-01"
  duration: "5 min"
---

# Phase 00 Plan 01: Eliminate Banned Type Definitions Summary

**One-liner:** Deleted 5 workspace-contaminated files, cleaned project.ts to use PluginType instead of WorkspaceBindings.

## What Was Done

### Task 1: Backup Infrastructure
- Created backup branch `phase-0-backup-20260201` (pushed to remote)
- Created `.archive/` directory with `MANIFEST.md`
- Added `.archive/` to `.gitignore`

### Task 2: Archive and Delete Banned Files
Archived and deleted these files:
| File | Status |
|------|--------|
| `src/domain/entities/workspace.ts` | Archived → Deleted |
| `src/domain/value-objects/workspace-binding.ts` | Archived → Deleted |
| `src/domain/value-objects/workspace-type.ts` | Archived → Deleted |
| `src/domain/use-cases/switch-workspace-use-case.ts` | Archived → Deleted |
| `src/domain/services/workspace-transition-service.ts` | Archived → Deleted |

### Task 3: Clean Project Entity
Updated `src/domain/entities/project.ts`:
- Removed deprecated `WorkspaceBindings` interface export
- Now cleanly re-exports from `@/domain/schemas/project.schema` and `@/domain/schemas/plugin.schema`
- Uses `PluginType`, `ProjectPlugins`, `PluginCapability` as replacements

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

```bash
# All criteria met:
✅ Backup branch exists: phase-0-backup-20260201
✅ Archive manifest exists: .archive/MANIFEST.md  
✅ workspace.ts deleted: CONFIRMED
✅ project.ts clean: No workspaceBindings references
✅ project.ts has PluginType exports: 5 references
```

## Next Phase Readiness

**Intentional breakage:** ~36 references in downstream files now have TypeScript errors:
- `src/domain/entities/agent.ts` - uses WorkspaceBinding[]
- `src/domain/entities/__tests__/project.test.ts` - uses workspaceBindings

These will be fixed in Plan 00-02 (infrastructure) and Plan 00-04 (final cleanup).

**Ready for:** Plan 00-02 (depends_on: 00-01)
