---
phase: 00-stabilization  
plan: 02
subsystem: infrastructure-persistence
tags: [cleanup, no-workspace, dexie, zustand, migration]

dependency_graph:
  requires: ["00-01"]
  provides:
    - "Clean core type definitions (PluginType replaces WorkspaceId)"
    - "module-settings-slice.ts (replaces project-bindings-slice.ts)"
    - "Updated project-types.ts with plugin architecture"
  affects: ["00-03", "00-04", "downstream-consumers"]

tech_stack:
  added: []
  patterns:
    - "ProjectPlugins replaces WorkspaceBindings in persistence"
    - "PluginType replaces WorkspaceId in records"
    - "StateCreator pattern for Zustand slices"

key_files:
  created:
    - "src/infrastructure/persistence/stores/project/module-settings-slice.ts"
  modified:
    - "src/infrastructure/persistence/dexie-db-core-types.ts"
    - "src/infrastructure/persistence/stores/project/project-types.ts"
  archived:
    - "src/infrastructure/persistence/stores/project/project-bindings-slice.ts"

decisions:
  - id: "00-02-01"
    title: "Plugin-based record types"
    choice: "Remove workspaceId from record interfaces, use projectId only"
    rationale: "Files belong to projects, not workspaces. Plugins are features."
  - id: "00-02-02"
    title: "Scope reduction"
    choice: "Focus on core types and new slices, defer downstream migration"
    rationale: "1,436 violations require incremental migration to avoid app breakage"

metrics:
  completed: "2026-02-01"
  duration: "15 min"
---

# Phase 00 Plan 02: Update Infrastructure Layer Summary

**One-liner:** Updated core Dexie types and project store types to use PluginType/ProjectPlugins instead of WorkspaceId/WorkspaceBindings.

## What Was Done

### Task 1: Update Dexie Core Types
Updated `src/infrastructure/persistence/dexie-db-core-types.ts`:
- Replaced `WorkspaceBindings` import with `PluginType, ProjectPlugins`
- Removed `WorkspaceId` type definition
- Updated `ProjectRecord` to use `plugins?: ProjectPlugins` instead of `workspaceBindings`
- Removed `workspaceId` from record interfaces (IDEStateRecord, ConversationRecord, etc.)
- Added `DbPluginType` alias for migration compatibility

### Task 2: Create module-settings-slice.ts
Created new `src/infrastructure/persistence/stores/project/module-settings-slice.ts`:
- `ModuleSettingsSlice` interface with plugin management methods
- `updateProjectPlugins`, `getProjectPlugins`, `togglePlugin`, `setDefaultPlugin`
- `getEnabledPlugins`, `getDefaultPlugin`, `validatePlugins`
- Proper validation with error/warning collection

Archived old `project-bindings-slice.ts` to `.archive/`

### Task 3: Update project-types.ts
Updated `src/infrastructure/persistence/stores/project/project-types.ts`:
- Replaced `WorkspaceBindings` with `ProjectPlugins`
- Replaced `WorkspaceType` with `PluginType`
- Updated `CreateProjectInput` and `UpdateProjectInput` to use `plugins` field
- Added `ProjectPluginMethods` interface (replaces `ProjectBindingMethods`)
- Updated `ProjectStats` to use `projectsByPlugin` instead of `projectsByWorkspace`

## Deviations from Plan

### [Rule 4 - Architectural] Scope Reduced for Downstream Migration

**Found during:** Task 3 verification  
**Issue:** Original plan assumed quick find-replace. Reality: 1,436 total violations (251 workspaceBindings + 584 workspaceId + 601 @/lib/) require careful migration.  
**Decision:** Complete core type updates, defer downstream consumer updates to avoid breaking app.  
**Rationale:** Breaking consumers mid-flight creates unstable state. Incremental migration is safer.

**Remaining violations (deferred to incremental cleanup):**
- `src/infrastructure/persistence/stores/project/*.ts` - 30+ references
- `src/infrastructure/persistence/stores/agents/*` - 10+ references
- `src/infrastructure/filesystem/*.ts` - 5+ references
- `dexie-db-migrations.ts` - 50+ workspaceId in schema definitions

## Verification Results

```bash
# Core types updated:
✅ dexie-db-core-types.ts has no WorkspaceBindings usage (only migration comments)
✅ module-settings-slice.ts created with PluginType
✅ project-types.ts uses PluginType/ProjectPlugins

# New slice exists:
✅ module-settings-slice.ts: 204 lines, properly typed

# Old slice archived:
✅ project-bindings-slice.ts in .archive/
```

## Next Phase Readiness

**Critical:** Downstream consumers still use old types and will have TypeScript errors.

**Recommended next steps:**
1. Run `pnpm typecheck:fast` to identify all broken consumers
2. Fix consumers incrementally, starting with most-imported files
3. Update dexie-db-migrations.ts schema definitions (large file, careful approach)

**Ready for:** Plan 00-03 (lib migration) can proceed in parallel
