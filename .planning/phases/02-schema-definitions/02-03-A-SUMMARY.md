---
phase: 02-schema-definitions
plan: 03-A
subsystem: domain-schemas
tags: [plugin-schema, workspace-elimination, migration]

dependency-graph:
  requires: [02-01, 02-02]
  provides: [plugin.schema.ts, ProjectPluginsSchema, PluginType]
  affects: [02-03-B, 02-03-C, 02-03-D, 02-03-E]

tech-stack:
  added: []
  patterns:
    - "Plugin-based architecture replacing workspace model"
    - "Thin re-export layer for backward compatibility"
    - "Deprecated type aliases for migration period"

key-files:
  created:
    - src/domain/schemas/plugin.schema.ts
  modified:
    - src/domain/schemas/project.schema.ts
    - src/domain/schemas/index.ts
    - src/domain/entities/project.ts

decisions:
  - id: plugin-replaces-workspace
    title: "Plugin types replace workspace concepts"
    rationale: "Project-centric + plugin-based model is cleaner"
  - id: deprecated-alias
    title: "Keep deprecated WorkspaceBindings alias temporarily"
    rationale: "361 references exist - need compilation during migration"

metrics:
  duration: "~18 minutes"
  completed: 2026-01-31
---

# Phase 02 Plan 03-A: Core Schema Migration Summary

**One-liner:** Created plugin.schema.ts with PluginType/ProjectPlugins as replacement for workspace model, updated ProjectSchema with optional plugins field.

---

## Objective Achievement

| Objective | Status |
|-----------|--------|
| Create plugin.schema.ts | ✅ Complete |
| Update ProjectSchema with plugins field | ✅ Complete |
| Convert entities/project.ts to re-export | ✅ Complete |
| Update barrel exports | ✅ Complete |

---

## Implementation Details

### Task A1: Created plugin.schema.ts

**Location:** `src/domain/schemas/plugin.schema.ts`

Created new plugin schema with:
- `PluginTypeSchema` - enum of ['editor', 'notes', 'chat', 'terminal', 'preview', 'knowledge', 'study']
- `PluginCapabilitySchema` - replaces WorkspaceBinding
- `ProjectPluginsSchema` - replaces workspaceBindings object
- Migration helpers: `isValidPluginType()`, `mapWorkspaceToPlugin()`

### Task A2: Updated project.schema.ts

Added:
- Import of `ProjectPluginsSchema`
- Optional `plugins` field to `ProjectSchema`
- Updated docblock to reference NO-WORKSPACE-MANDATE.md

### Task A3: Converted entities/project.ts

Transformed from:
- Full type definitions (135 lines)

To:
- Thin re-export layer (80 lines)
- Re-exports from `@/domain/schemas/project.schema`
- Re-exports from `@/domain/schemas/plugin.schema`
- DEPRECATED `WorkspaceBindings` interface for migration

### Task A4: Updated barrel exports

Added to `src/domain/schemas/index.ts`:
- All plugin schemas and types
- Migration helper functions

---

## Commits

| Hash | Message |
|------|---------|
| f45a45b7 | feat(02-03): create plugin.schema.ts for plugin-based architecture |
| 3b8daa8e | feat(02-03): add optional plugins field to ProjectSchema |
| 8dc9353e | refactor(02-03): convert entities/project.ts to thin re-export layer |
| a20f9f07 | feat(02-03): export plugin schemas from barrel |

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Verification Results

```
Schema verification:
- workspaceBindings in src/domain/schemas/: 0 (except migration comment)
- plugin.schema.ts exists: ✅
- entities/project.ts re-exports from schemas: 3 imports

TypeScript check:
- 27+ errors in consuming files (EXPECTED)
- All errors relate to workspaceBindings usage in:
  - src/infrastructure/persistence/stores/project/*
  - src/lib/workspace/*
  - src/lib/settings/*
```

**Note:** TypeScript errors are expected and will be resolved in Sub-Plans B-E.

---

## Next Phase Readiness

### Blockers for Codebase Health
- 27+ TypeScript errors must be fixed in Sub-Plans B-E
- Cannot ship until all workspaceBindings usages migrated

### Dependencies Established
- `@/domain/schemas` now canonical source for Project/Plugin types
- `@/domain/entities/project` re-exports (deprecated path)

### Recommended Next Step
Execute Sub-Plan 02-03-B: Domain Layer Workspace Elimination

---

## Lessons Learned

1. **Thin re-export pattern works well** - Maintains backward compatibility while migrating
2. **TypeScript errors as migration guide** - The 27+ errors show exactly what needs fixing
3. **Migration helpers useful** - `mapWorkspaceToPlugin()` will help automated refactoring

---

*Summary created: 2026-01-31T11:03:16Z*
*Executed by: gsd-executor*
