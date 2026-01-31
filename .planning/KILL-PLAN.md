# KILL PLAN: Workspace Elimination

**Version:** 1.0.0
**Created:** 2026-01-31
**Status:** READY FOR EXECUTION
**Dependency:** SOURCE-OF-TRUTH.md (read that FIRST)

---

## Purpose

This document contains ONLY factual data about what must be eliminated. It does NOT contain architectural decisions (those are in SOURCE-OF-TRUTH.md).

---

## Current Violation Counts

| Pattern | Count | Status |
|---------|-------|--------|
| `workspaceBindings` / `WorkspaceBindings` | **368** | ELIMINATE |
| `workspaceId` / `WorkspaceId` | **642** | ELIMINATE |
| `workspace*` named files | **50** | RENAME or DELETE |
| **TOTAL** | **1,060** | |

---

## Elimination Replacements

| Banned Term | Replacement |
|-------------|-------------|
| `workspaceBindings` | `enabledModules` in ProjectSettings |
| `WorkspaceBindings` | `ModuleType[]` |
| `workspaceId` on files | DELETE - files have `projectId` only |
| `workspaceId` on threads | DELETE - threads have `projectId` only |
| `WorkspaceId` type | DELETE - does not exist in new model |
| `workspace-*` files | Rename to `module-*`, `platform-*`, or domain name |

---

## Execution Order

### Phase 1: Type Definitions (Break the poison at source)

Delete or rewrite these files FIRST:

1. `src/domain/entities/workspace.ts` → DELETE
2. `src/domain/value-objects/workspace-binding.ts` → DELETE
3. `src/domain/value-objects/workspace-type.ts` → DELETE
4. `src/domain/use-cases/switch-workspace-use-case.ts` → DELETE
5. `src/domain/services/workspace-transition-service.ts` → DELETE
6. `src/domain/entities/project.ts` → REWRITE (remove workspaceBindings)

### Phase 2: Infrastructure (Highest violation counts)

1. `src/infrastructure/persistence/dexie-db-migrations.ts` - ~347 violations
2. `src/infrastructure/persistence/dexie-db-core-types.ts` - ~17 violations
3. `src/infrastructure/persistence/stores/project/project-bindings-slice.ts` → REWRITE to `module-settings-slice.ts`

### Phase 3: Event System

1. `src/lib/events/cross-workspace-event-bus.ts` → DELETE
2. `src/lib/events/workspace-events.ts` → DELETE
3. `src/infrastructure/events/cross-workspace-event-bus.ts` → DELETE

### Phase 4: Workspace Directory

DELETE entire directory: `src/lib/workspace/`

Move salvageable code:
- `fsa-persistence.ts` → `src/infrastructure/filesystem/`
- `browser-mode.ts` → `src/infrastructure/platform/`

### Phase 5: Tests

DELETE workspace tests:
- `src/lib/workspace/__tests__/project-metadata.test.ts` (~55 violations)
- `src/domain/entities/__tests__/workspace.test.ts`
- All `**/cross-workspace-*.test.ts`

### Phase 6: UI Components

1. `src/presentation/components/project/steps/WorkspaceSetupStep.tsx` → REWRITE to `ModuleSetupStep.tsx`
2. `src/presentation/components/hub/useWorkspaceBindingState.ts` → DELETE
3. `src/hooks/useWorkspaceContext.ts` → DELETE

### Phase 7: Remaining References

Run grep, fix remaining violations one by one.

---

## Verification Commands

After each phase, run:

```bash
# Count remaining violations
grep -rn "workspaceBindings\|WorkspaceBindings" src/ --include="*.ts" --include="*.tsx" | wc -l
grep -rn "workspaceId\|WorkspaceId" src/ --include="*.ts" --include="*.tsx" | wc -l

# TypeScript check
pnpm typecheck:fast

# Tests (may fail until complete)
pnpm test:fast
```

---

## Success Criteria

- [ ] `workspaceBindings` count: 0
- [ ] `workspaceId` count: 0
- [ ] `workspace*` files: 0
- [ ] `pnpm typecheck:fast` passes
- [ ] `pnpm test:fast` passes

---

## ESLint Rule (Add After Elimination)

```javascript
// eslint.config.js
{
  'no-restricted-syntax': ['error', 
    { 
      selector: 'Identifier[name=/[Ww]orkspace[Bb]indings/]', 
      message: 'WorkspaceBindings is BANNED. See SOURCE-OF-TRUTH.md' 
    },
    { 
      selector: 'Identifier[name=/workspaceId/]', 
      message: 'workspaceId is BANNED. Use projectId. See SOURCE-OF-TRUTH.md' 
    },
  ]
}
```

---

*This document contains factual data only. Architecture decisions are in SOURCE-OF-TRUTH.md.*
