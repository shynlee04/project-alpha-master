---
phase: 02-schema-definitions
plan: 03
type: execute
gap_closure: true
wave: 1
depends_on: []
files_modified:
  - src/domain/entities/project.ts
  - src/infrastructure/persistence/stores/project/project-types.ts
  - src/infrastructure/context/project-context.tsx
  - src/infrastructure/plugins/plugin-registry.ts
  - src/infrastructure/plugins/platform-defaults.ts
  - src/presentation/components/sidebar/ProjectList.tsx
  - src/lib/workspace/temp-project.ts
autonomous: true

must_haves:
  truths:
    - "All infrastructure imports resolve to canonical schemas"
    - "Zero files import from @/domain/entities/project (except re-export)"
    - "TypeScript compiles without errors after migration"
  artifacts:
    - path: "src/domain/entities/project.ts"
      provides: "Backward-compatible re-exports from schemas"
      exports: ["Project", "ProjectCreateParams", "ProjectUpdateParams", "LayoutConfig"]
    - path: "src/domain/schemas/project.schema.ts"
      provides: "Single source of truth for Project type"
  key_links:
    - from: "@/domain/entities/project"
      to: "@/domain/schemas/project.schema"
      via: "re-export"
      pattern: "export.*from.*schemas"
---

<objective>
Close Gap 1 from VERIFICATION.md: Eliminate dual source of truth by wiring infrastructure to use canonical schemas.

Purpose: The new Zod schemas exist but infrastructure still uses old entity interfaces. This creates two parallel type systems that will diverge.

Output: Infrastructure layer imports from schemas, entities file is thin re-export layer for backward compatibility.
</objective>

<execution_context>
@/Users/apple/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/apple/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-schema-definitions/02-VERIFICATION.md
@.planning/phases/02-schema-definitions/02-01-SUMMARY.md
@.planning/phases/02-schema-definitions/02-02-SUMMARY.md
@src/domain/entities/project.ts
@src/domain/schemas/project.schema.ts
@src/domain/schemas/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Convert entities/project.ts to re-export layer</name>
  <files>src/domain/entities/project.ts</files>
  <action>
    Replace the entire content of `src/domain/entities/project.ts` with re-exports from `@/domain/schemas/project.schema.ts`.
    
    The file should:
    1. Add deprecation notice in JSDoc explaining this is a backward-compat layer
    2. Re-export all types from the schema: Project, ProjectCreateParams, ProjectUpdateParams, LayoutConfig, StorageType, DeviceType
    3. Export WorkspaceBindings separately (it was removed from schemas but still needed by some files)
    4. Mark WorkspaceBindings as @deprecated - will be removed in Phase 06
    
    Do NOT:
    - Keep the old interface definitions
    - Keep workspaceBindings in the Project type (schemas don't have it)
    - Break existing imports (must remain backward compatible)
    
    Expected new structure:
    - JSDoc header explaining this is backward-compat re-exports
    - Re-export line: `export { ProjectSchema, type Project, type ProjectCreateParams, type ProjectUpdateParams, type LayoutConfig, type StorageType, type DeviceType } from '@/domain/schemas/project.schema.ts';`
    - Keep WorkspaceBindings interface definition (with @deprecated tag)
    - Re-export it separately
  </action>
  <verify>
    grep -n "workspaceBindings" src/domain/entities/project.ts | wc -l
    # Should return: 0 (not in Project interface anymore)
    
    grep -n "from '@/domain/schemas" src/domain/entities/project.ts | wc -l
    # Should return: >=1 (has re-export)
    
    pnpm typecheck:fast
    # Should pass (0 errors)
  </verify>
  <done>
    - entities/project.ts re-exports from schemas/project.schema.ts
    - Project type no longer has workspaceBindings field
    - WorkspaceBindings still exported separately for backward compat
    - TypeScript compiles cleanly
  </done>
</task>

<task type="auto">
  <name>Task 2: Update infrastructure imports (critical files)</name>
  <files>
    src/infrastructure/persistence/stores/project/project-types.ts
    src/infrastructure/context/project-context.tsx
    src/infrastructure/plugins/plugin-registry.ts
    src/infrastructure/plugins/platform-defaults.ts
  </files>
  <action>
    Update imports in the 4 critical infrastructure files to import directly from `@/domain/schemas` instead of `@/domain/entities/project`.
    
    Files to update:
    1. `src/infrastructure/persistence/stores/project/project-types.ts` (Line 10)
       - Import Project, LayoutConfig from schemas instead of entities
       - Keep importing WorkspaceBindings from entities (still needed temporarily)
    2. `src/infrastructure/context/project-context.tsx` (Line 32)
       - Import Project type from schemas
    3. `src/infrastructure/plugins/plugin-registry.ts` (Line 30)
       - Import Project type from schemas
    4. `src/infrastructure/plugins/platform-defaults.ts` (Line 20)
       - Import Project type from schemas
    
    For each file:
    - Change: `import type { Project } from '@/domain/entities/project';`
    - To: `import type { Project } from '@/domain/schemas';`
    
    If file also imports WorkspaceBindings, keep that import from entities for now.
  </action>
  <verify>
    grep -rn "from '@/domain/entities/project'" src/infrastructure/ | grep -v "WorkspaceBindings" | wc -l
    # Should return: 0 (only WorkspaceBindings imports remain from entities)
    
    pnpm typecheck:fast
    # Should pass (0 errors)
  </verify>
  <done>
    - 4 critical infrastructure files import Project from schemas
    - WorkspaceBindings imports still allowed from entities (temporarily)
    - No type errors
  </done>
</task>

<task type="auto">
  <name>Task 3: Update presentation layer imports</name>
  <files>
    src/presentation/components/sidebar/ProjectList.tsx
    src/lib/workspace/temp-project.ts
    src/infrastructure/persistence/dexie-db-core-types.ts
  </files>
  <action>
    Update imports in presentation and remaining infrastructure files.
    
    Files to update:
    1. `src/presentation/components/sidebar/ProjectList.tsx` (Line 20)
       - Import Project from schemas
    2. `src/lib/workspace/temp-project.ts` (Line 23)
       - Import Project from schemas
    3. `src/infrastructure/persistence/dexie-db-core-types.ts` (Lines 14, 159)
       - Keep WorkspaceBindings import (still needed)
       - This file doesn't import Project directly, only WorkspaceBindings
    
    Same pattern as Task 2: change Project imports to schemas, keep WorkspaceBindings in entities.
  </action>
  <verify>
    grep -rn "from '@/domain/entities/project'" src/ --include="*.ts" --include="*.tsx" | grep -v "WorkspaceBindings" | grep -v "\.planning" | grep -v "_bmad" | wc -l
    # Should return: 0 (no Project imports from entities)
    
    grep -rn "from '@/domain/schemas'" src/ --include="*.ts" --include="*.tsx" | wc -l
    # Should return: >=7 (multiple files now import from schemas)
    
    pnpm typecheck:fast
    # Should pass (0 errors)
  </verify>
  <done>
    - All Project imports use @/domain/schemas
    - Only WorkspaceBindings imports remain from @/domain/entities/project
    - TypeScript compiles cleanly
    - Verification gap "Legacy type aliases point to canonical schemas" is CLOSED
  </done>
</task>

</tasks>

<verification>
After all tasks complete, verify:

1. **Dual source eliminated:**
   ```bash
   grep -rn "from '@/domain/entities/project'" src/ --include="*.ts" --include="*.tsx" | grep -v "WorkspaceBindings" | grep -v "\.planning" | grep -v "_bmad" | wc -l
   # Expected: 0
   ```

2. **Schemas are used:**
   ```bash
   grep -rn "from '@/domain/schemas'" src/ --include="*.ts" --include="*.tsx" | wc -l
   # Expected: >=7
   ```

3. **TypeScript clean:**
   ```bash
   pnpm typecheck:fast
   # Expected: 0 errors (excluding pre-existing prototype errors)
   ```

4. **Backward compatibility maintained:**
   ```bash
   grep -n "from '@/domain/entities/project'" src/infrastructure/persistence/stores/project/project-types.ts
   # Should still work for WorkspaceBindings import
   ```
</verification>

<success_criteria>
- Gap "All entities have single source of truth types" - CLOSED
- Gap "Legacy type aliases point to canonical schemas" - CLOSED  
- entities/project.ts is a thin re-export layer
- All Project types resolve to schema-derived types
- TypeScript compiles without schema-related errors
</success_criteria>

<output>
After completion, create `.planning/phases/02-schema-definitions/02-03-SUMMARY.md`
</output>
</context>
</plan>
