# State Consolidation Cycle

**Version**: 1.0.0
**Created**: 2026-01-04
**Status**: ACTIVE
**Reference**: ADR-024 (State Management Consolidation)

## Purpose

Systematic workflow for consolidating fragmented state management into Clean Architecture pattern. Executes as an autonomous cycle: analysis → facade creation → migration → validation → next story.

## When to Use

Use this skill when:
- State management code is fragmented across multiple locations
- Duplicate Dexie database files exist (e.g., `dexie-db.ts` in multiple places)
- Store files are duplicated (e.g., `*-store.ts` in different directories)
- Migrating state from `src/lib/state/` to `src/infrastructure/persistence/`
- Implementing facade pattern for backward compatibility during state migration
- Executing Epic 53 stories (State Consolidation Epic)

## Workflow Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  STATE CONSOLIDATION CYCLE                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │   ANALYZE   │───▶│   CREATE    │───▶│   MIGRATE   │───▶│  VALIDATE   │   │
│  │   Current   │    │   Facade    │    │  Consumers  │    │    Gate     │   │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘   │
│         │                 │                  │                   │           │
│         │                 │                  │                   │           │
│         ▼                 ▼                  ▼                   ▼           │
│   • Identify files  • Deprecation    • Grep imports     • TypeScript        │
│   • Map exports       warning        • Update paths     • Build check       │
│   • Find consumers  • Re-exports    • Test impact      • Runtime test       │
│   • Research deps   • Preserve                                              │
│                       unique                     ┌──────────────────────────│
│                                                  ▼                           │
│                                           ┌─────────────┐                    │
│                                           │ NEXT STORY  │◀──── AUTO-ITERATE │
│                                           │    LOOP     │                    │
│                                           └─────────────┘                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Phase 1: Analysis

### Step 1.1: File Mapping

Identify duplicate/fragmented files:

```bash
# Find duplicate dexie files
find src -name "dexie-*.ts" | sort

# Find duplicate store files
find src -name "*-store.ts" | sort

# Find knowledge store locations
find src -name "*knowledge*store*" -o -name "*store*knowledge*"
```

### Step 1.2: Export Analysis

For each duplicate pair, analyze exports:

```bash
# Extract exports from legacy file
grep -E "^export" {legacy_file}

# Extract exports from canonical file
grep -E "^export" {canonical_file}

# Find unique exports (only in legacy)
diff <(grep -E "^export" {legacy_file}) <(grep -E "^export" {canonical_file})
```

### Step 1.3: Consumer Mapping

Find all consumers of legacy path:

```bash
# Grep for legacy imports
grep -r "from '@/lib/state/{file}'" src/ --include="*.ts" --include="*.tsx"

# Count consumers
grep -c "from '@/lib/state/{file}'" src/ --include="*.ts" --include="*.tsx"
```

### Step 1.4: Research

Before implementing, research best practices:

- **Context7**: Query for "Dexie re-export patterns" and "Zustand store facade migration"
- **DeepWiki**: Check dexie/Dexie.js repo for database barrel export best practices
- **Tavily/Exa**: Search for "TypeScript re-export deprecation warning pattern"

## Phase 2: Create Facade

### Step 2.1: Deprecation Warning Pattern

Add this at the TOP of legacy file (before any imports):

```typescript
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] @/lib/state/{file} is deprecated.\n' +
    'Please migrate imports to: @/infrastructure/persistence/{target}\n' +
    'See ADR-024: State Management Consolidation for migration guide.'
  );
}
```

### Step 2.2: Re-Export Pattern (Simple)

For files that are pure duplicates:

```typescript
/**
 * @fileoverview FACADE - Re-exports from canonical location
 * @deprecated Import from '@/infrastructure/persistence/{target}' instead.
 * Reference: ADR-024
 */

// Deprecation warning (above)

// Re-export everything
export * from '@/infrastructure/persistence/{target}';
export { default } from '@/infrastructure/persistence/{target}';
```

### Step 2.3: Re-Export Pattern (With Unique Content)

For files that have unique exports:

```typescript
/**
 * @fileoverview FACADE with unique content
 * @deprecated Core exports are deprecated. Import from canonical location.
 * Unique exports: {list_unique_exports}
 * Reference: ADR-024
 */

// Deprecation warning (above)

// Re-export from canonical
export {
  canonicalExport1,
  canonicalExport2,
  // ... all exports
} from '@/infrastructure/persistence/{target}';

// ═══════════════════════════════════════════════════════════
// UNIQUE EXPORTS (Not in canonical - kept here intentionally)
// ═══════════════════════════════════════════════════════════

export interface UniqueType {
  // ... unique type definition
}

export function uniqueHelper() {
  // ... unique helper
}
```

## Phase 3: Migrate Consumers (Optional)

**Note**: This phase is optional for the first pass. You can stop at Phase 2 (facade creation) and migrate consumers in a follow-up story.

If doing full migration:

### Step 3.1: Update Import Paths

For each consumer file:

```typescript
// OLD
import { db, SomeType } from '@/lib/state/dexie-db';

// NEW
import { db, SomeType } from '@/infrastructure/persistence/dexie-db';
```

### Step 3.2: Batch Update with sed

```bash
# Safe replacement (backup first)
find src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i.bak "s|from '@/lib/state/dexie-db'|from '@/infrastructure/persistence/dexie-db'|g" {} +
```

## Phase 4: Validation Gate

### Step 4.1: TypeScript Check

```bash
# Incremental check (production files only)
pnpm exec tsc --noEmit 2>&1 | grep -v "\.test\." | grep -v "__tests__" | grep "error TS" | head -30
```

**Pass Criteria**: Zero new errors introduced

### Step 4.2: Smoke Test

```bash
# Build check
pnpm build

# Dev server start
pnpm dev &
sleep 5
curl -s http://localhost:3000 | grep -q "<!DOCTYPE html>" && echo "✅ Dev server OK"
```

### Step 4.3: Deprecation Warning Check (Dev Mode)

```bash
# Start dev server and check console
pnpm dev 2>&1 | grep -q "\[DEPRECATED\]" && echo "✅ Deprecation warning working"
```

## Cycle Continuation

After successful validation, automatically proceed to next story in Epic 53:

### Story Sequence (Epic 53)
1. ✅ 53-1-consolidate-dexie-database (DONE)
2. 53-2-move-dexie-helpers
3. 53-3-merge-knowledge-store
4. 53-4-migrate-ide-store
5. 53-5-migrate-quiz-permission-stores
6. 53-6-move-dexie-storage
7. 53-7-update-all-imports
8. 53-8-documentation-cleanup

**Auto-iteration Condition**: `validation_passed AND stories_remaining > 0`

## Governance Updates

After each story completion:

1. **Update sprint-status.yaml**:
   ```yaml
   53-{N}-{slug}: done  # COMPLETED {timestamp}
   ```

2. **Update bmm-workflow-status.yaml**:
   ```yaml
   session_notes:
     - timestamp: {timestamp}
       action: "STORY 53-{N} COMPLETE"
       agent: "@bmad-core-bmad-master"
   ```

3. **Track epic progress**:
   ```yaml
   stories_done: {N}
   completion_percentage: "{N/8 * 100}%"
   ```

4. **Run governance enforcement** (if structural changes):
   - Update AGENTS.md with new paths
   - Run `/bmad-bmm-document-project`
   - Run `/bmad-bmm-generate-project-context`

## Exit Conditions

### Successful Completion
- All 8 stories in Epic 53 marked DONE
- Zero TypeScript errors on production files
- All deprecation warnings in place
- Documentation updated (AGENTS.md, project-context.md)

### Failure Halt
- TypeScript errors exceed 10 new errors
- Breaking change detected (runtime failure)
- Circular dependency introduced
- Data loss risk identified

## Quality Standards

- **Zero Breaking Changes**: Facade pattern ensures backward compatibility
- **Deprecation Warnings**: All legacy paths warn developers about new location
- **Test Coverage**: All facade changes validated with smoke tests
- **Documentation**: AGENTS.md updated with new canonical paths
- **Type Safety**: Zero new TypeScript errors introduced

## Agent Coordination

This workflow may involve multiple agents:

| Phase | Agent | Specialty |
|-------|-------|-----------|
| Analysis | `store-refactorer` | Dependency analysis, export mapping |
| Facade Creation | `store-refactorer` | Facade pattern, re-exports |
| Migration | `typescript-fixer` | Import path updates |
| Validation | `test-writer` | Smoke tests, validation checks |
| Orchestration | `bmad-master` | Cycle continuation, handoffs |

## References

- **ADR-024**: State Management Consolidation
- **CLAUDE.md**: Section on "State Architecture (P1.10 Audit Complete)"
- **AGENTS.md**: Store locations and consolidation notes
- **Epic 53**: State Consolidation Epic breakdown

---

**Module Owner**: @bmad-core-bmad-master
**Workflow Owner**: @bmad-bmm-architect
**Epic**: EPIC-53 (State Consolidation)
