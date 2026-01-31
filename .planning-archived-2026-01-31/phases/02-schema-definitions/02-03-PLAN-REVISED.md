---
phase: 02-schema-definitions
plan: 03-revised
type: execute
gap_closure: true
wave: 1
depends_on: []
files_modified: "See task breakdown - 124+ files affected"
autonomous: false
critical: true
scope: "CODEBASE-WIDE WORKSPACE ELIMINATION"

must_haves:
  truths:
    - "Zero WorkspaceBindings type exists in codebase"
    - "Zero workspaceBindings field exists on any entity"
    - "Zero WorkspaceId type exists in codebase"
    - "Zero workspaceId field exists on any entity"
    - "All imports resolve to canonical schemas"
    - "TypeScript compiles without errors"
    - "Plugin-based architecture replaces workspace concept"
  artifacts:
    - path: "src/domain/schemas/project.schema.ts"
      provides: "Canonical Project schema (NO workspace fields)"
    - path: "src/domain/schemas/plugin.schema.ts"
      provides: "NEW - Plugin capability schema"
    - path: ".planning/architecture/NO-WORKSPACE-MANDATE.md"
      provides: "Governance document preventing workspace reintroduction"
  key_links:
    - from: "All infrastructure files"
      to: "@/domain/schemas"
      via: "import"
      pattern: "import.*from.*@/domain/schemas"
---

# Plan 02-03 REVISED: Absolute Workspace Elimination

## ⚠️ CRITICAL CHANGE FROM ORIGINAL PLAN

**Original Plan 03** preserved WorkspaceBindings "for backward compatibility."

**This Revised Plan** ELIMINATES ALL workspace concepts per user mandate:
> "there should not be any workspace-specific related... project-centric and use plugins not workspace"

---

## Scope Assessment

| Category | Count | Action |
|----------|-------|--------|
| WorkspaceBindings/workspaceBindings references | 361 | ELIMINATE |
| WorkspaceId/workspaceId references | 640 | ELIMINATE |
| workspace-* named files | 44 | RENAME or DELETE |
| Unique polluted files | 124 | REFACTOR |

**This is a MAJOR refactoring effort requiring phased execution.**

---

## Architecture Shift: Workspace → Plugin Model

### OLD (Workspace-centric)
```
Project has workspaceBindings: { ide: true, notes: true, ... }
Files have workspaceId: 'ide' | 'notes' | ...
Agents have workspaceBindings: [{ workspaceType: 'ide', ... }]
```

### NEW (Project-centric + Plugin-based)
```
Project has enabledPlugins: ['editor', 'notes', 'chat', ...]
Files belong to Project (projectId only)
Agents have capabilities: ['code-edit', 'file-read', ...]
Platform determines available plugins based on device
```

---

## Execution Strategy

Due to scope (124+ files, 1000+ references), this plan is **SPLIT INTO SUB-PLANS**:

### Sub-Plan 03-A: Core Schema Migration (Wave 1)
- Update entities/project.ts to re-export from schemas (NO WorkspaceBindings)
- Create plugin.schema.ts for new plugin model
- Update barrel exports

### Sub-Plan 03-B: Domain Layer Cleanup (Wave 2)
- Remove WorkspaceBindings from all domain entities
- Remove workspaceId from all domain types
- Update agent.ts to use plugin capabilities

### Sub-Plan 03-C: Infrastructure Cleanup (Wave 3)
- Migrate all persistence stores
- Update Dexie types
- Remove workspace-related slices

### Sub-Plan 03-D: Presentation/Lib Cleanup (Wave 4)
- Update all hooks and components
- Rename/remove workspace-* files
- Update tests

### Sub-Plan 03-E: Governance & Verification (Wave 5)
- Create NO-WORKSPACE-MANDATE.md
- Add ESLint rule blocking workspace terms
- Final verification sweep

---

## Sub-Plan 03-A: Core Schema Migration

<objective>
Replace WorkspaceBindings with plugin-based model in core schemas.
</objective>

<tasks>

<task type="auto">
  <name>Task A1: Create Plugin Schema</name>
  <files>src/domain/schemas/plugin.schema.ts</files>
  <action>
Create new plugin schema that replaces workspace concept:

```typescript
/**
 * @fileoverview Plugin Capability Schema - Domain Layer
 * @module domain/schemas/plugin.schema
 *
 * Replaces workspace-centric model with plugin-based architecture.
 * Platform determines available plugins, not workspace bindings.
 *
 * @mandate NO-WORKSPACE - See .planning/architecture/NO-WORKSPACE-MANDATE.md
 */

import { z } from 'zod';

/**
 * Available plugin types in the system.
 * These replace the old workspace types (ide, notes, knowledge, study).
 */
export const PluginTypeSchema = z.enum([
  'editor',      // Replaces 'ide' - Monaco editor, file tree
  'notes',       // BlockNote-based notes
  'chat',        // AI chat/threads
  'terminal',    // Terminal emulator
  'preview',     // Web preview
  'knowledge',   // RAG/knowledge base
  'study',       // Study/flashcards
]);

/**
 * Plugin capability for agents.
 * Replaces WorkspaceBinding.
 */
export const PluginCapabilitySchema = z.object({
  pluginType: PluginTypeSchema,
  isAvailable: z.boolean(),
  isDefault: z.boolean().optional(),
});

/**
 * Project plugin configuration.
 * Replaces workspaceBindings.
 */
export const ProjectPluginsSchema = z.object({
  enabled: z.array(PluginTypeSchema),
  default: PluginTypeSchema.optional(),
});

// Derived types
export type PluginType = z.infer<typeof PluginTypeSchema>;
export type PluginCapability = z.infer<typeof PluginCapabilitySchema>;
export type ProjectPlugins = z.infer<typeof ProjectPluginsSchema>;
```
  </action>
  <verify>
    ls -la src/domain/schemas/plugin.schema.ts
    grep -n "PluginTypeSchema" src/domain/schemas/plugin.schema.ts
  </verify>
  <done>
    - plugin.schema.ts created with PluginType, PluginCapability, ProjectPlugins
    - No workspace terms in new schema
  </done>
</task>

<task type="auto">
  <name>Task A2: Update Project Schema with plugins field</name>
  <files>src/domain/schemas/project.schema.ts</files>
  <action>
The project.schema.ts is already clean (no workspaceBindings). 
Add optional `plugins` field for future use:

1. Import ProjectPluginsSchema from plugin.schema.ts
2. Add to ProjectSchema:
   ```typescript
   /** Enabled plugins for this project (replaces workspaceBindings) */
   plugins: ProjectPluginsSchema.optional(),
   ```
3. Keep backward compatible - field is optional during migration
  </action>
  <verify>
    grep -n "plugins:" src/domain/schemas/project.schema.ts
    grep -n "workspaceBindings" src/domain/schemas/project.schema.ts | wc -l
    # Should return: 0
  </verify>
  <done>
    - ProjectSchema has optional plugins field
    - Zero workspaceBindings references in schema
  </done>
</task>

<task type="auto">
  <name>Task A3: Convert entities/project.ts to thin re-export</name>
  <files>src/domain/entities/project.ts</files>
  <action>
CRITICAL: Do NOT keep WorkspaceBindings.

Replace entire file with:

```typescript
/**
 * @fileoverview Project Entity - Backward Compatibility Re-exports
 * @module domain/entities/project
 *
 * @deprecated Import from '@/domain/schemas' instead.
 * This file exists only for migration - will be removed.
 *
 * @mandate NO-WORKSPACE - WorkspaceBindings is ELIMINATED.
 * See .planning/architecture/NO-WORKSPACE-MANDATE.md
 */

// Re-export all types from canonical schemas
export {
  ProjectSchema,
  type Project,
  type ProjectCreateParams,
  type ProjectUpdateParams,
  type LayoutConfig,
  type StorageType,
  type DeviceType,
} from '@/domain/schemas/project.schema';

// Re-export plugin types (replaces WorkspaceBindings)
export {
  type PluginType,
  type PluginCapability,
  type ProjectPlugins,
} from '@/domain/schemas/plugin.schema';

/**
 * @deprecated WorkspaceBindings is ELIMINATED.
 * Use PluginType[] or ProjectPlugins instead.
 * 
 * This type alias exists ONLY for TypeScript compilation during migration.
 * All usages must be removed - grep for WorkspaceBindings and fix.
 */
export type WorkspaceBindings = {
  ide?: boolean;
  notes?: boolean;
  knowledge?: boolean;
  study?: boolean;
};
```

NOTE: The deprecated WorkspaceBindings alias is TEMPORARY for compilation.
Follow-up tasks will remove all usages.
  </action>
  <verify>
    grep -c "from '@/domain/schemas" src/domain/entities/project.ts
    # Should return: >= 2
    
    grep -n "@deprecated.*WorkspaceBindings.*ELIMINATED" src/domain/entities/project.ts
    # Should find deprecation notice
  </verify>
  <done>
    - entities/project.ts re-exports from schemas
    - WorkspaceBindings marked DEPRECATED with elimination notice
    - PluginType exported as replacement
  </done>
</task>

<task type="auto">
  <name>Task A4: Update barrel exports</name>
  <files>src/domain/schemas/index.ts</files>
  <action>
Add plugin schema exports:

```typescript
// ============================================================================
// Plugin Schemas (Replaces Workspace concept)
// ============================================================================

export {
  // Schemas
  PluginTypeSchema,
  PluginCapabilitySchema,
  ProjectPluginsSchema,
  // Types
  type PluginType,
  type PluginCapability,
  type ProjectPlugins,
} from './plugin.schema';
```
  </action>
  <verify>
    grep -n "PluginType" src/domain/schemas/index.ts
    # Should find export
  </verify>
  <done>
    - Barrel exports include plugin schemas
    - Ready for infrastructure migration
  </done>
</task>

</tasks>

---

## Sub-Plan 03-B through 03-E: Separate PLANs Required

Due to scope (124 files, 1000+ references), remaining work requires separate PLAN files:

- **02-03-B-PLAN.md**: Domain layer workspace elimination
- **02-03-C-PLAN.md**: Infrastructure workspace elimination  
- **02-03-D-PLAN.md**: Presentation/lib workspace elimination
- **02-03-E-PLAN.md**: Governance and verification

Each sub-plan should be executed sequentially with verification between.

---

## Verification After Sub-Plan 03-A

```bash
# Schema verification
grep -rn "workspaceBindings" src/domain/schemas/ | wc -l
# Expected: 0

# Plugin schema exists
ls src/domain/schemas/plugin.schema.ts
# Expected: file exists

# Entities re-export from schemas
grep -n "from '@/domain/schemas" src/domain/entities/project.ts | wc -l
# Expected: >= 2

# TypeScript compiles (may have errors in consuming files - expected)
pnpm typecheck:fast 2>&1 | head -20
```

---

## Success Criteria (Full Plan)

After ALL sub-plans complete:

- [ ] Zero `WorkspaceBindings` type definitions (except deprecated alias)
- [ ] Zero `workspaceBindings` field usages
- [ ] Zero `WorkspaceId` type definitions
- [ ] Zero `workspaceId` field usages
- [ ] All 44 workspace-* files renamed or deleted
- [ ] Plugin-based architecture in place
- [ ] NO-WORKSPACE-MANDATE.md governance document exists
- [ ] ESLint rule blocks workspace terms
- [ ] TypeScript compiles without errors
- [ ] All tests pass

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes | Create migration utilities, use deprecation warnings |
| Test failures | Update tests as part of each sub-plan |
| Scope creep | Strict task definitions, wave-based execution |
| Context exhaustion | Split into 5 sub-plans, checkpoint after each |

---

*Plan 02-03 REVISED: Created 2026-01-31*
*Scope: CODEBASE-WIDE WORKSPACE ELIMINATION*
