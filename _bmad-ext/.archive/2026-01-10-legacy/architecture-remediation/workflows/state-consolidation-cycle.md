# State Consolidation Cycle Workflow

**Version**: 1.0.0
**Created**: 2026-01-04
**Status**: ACTIVE
**Reference ADR**: ADR-024 (State Management Consolidation)

## description

Systematic workflow for consolidating fragmented state management into Clean Architecture pattern. Executes as an autonomous cycle: analysis → facade creation → migration → validation → next story.

## Trigger Patterns

```yaml
triggers:
  - "state.*consolidat"
  - "dexie.*duplicate"
  - "store.*fragment"
  - "lib/state.*move"
  - "clean.*architecture.*state"
  - "facade.*pattern"
```

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

---

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

### Step 1.4: Research (MCP Required)

```yaml
research_requirements:
  context7:
    - query: "Dexie re-export patterns"
    - query: "Zustand store facade migration"
  deepwiki:
    - repo: "dexie/Dexie.js"
      question: "Best practices for database barrel exports"
  tavily:
    - query: "TypeScript re-export deprecation warning pattern"
```

---

## Phase 2: Create Facade

### Step 2.1: Deprecation Warning Pattern

```typescript
// At TOP of legacy file (before any imports)
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

---

## Phase 3: Migrate Consumers (Optional in first pass)

If doing full migration (not facade-only):

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

---

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

---

## Cycle Continuation

After successful validation, automatically proceed to next story:

```yaml
auto_iteration:
  condition: "validation_passed AND stories_remaining > 0"
  action: "load_next_story"
  
  story_sequence:
    - "53-1-consolidate-dexie-database"  # ✅ DONE
    - "53-2-move-dexie-helpers"
    - "53-3-merge-knowledge-store"
    - "53-4-migrate-ide-store"
    - "53-5-migrate-quiz-permission-stores"
    - "53-6-move-dexie-storage"
    - "53-7-update-all-imports"
    - "53-8-documentation-cleanup"
```

---

## Story Templates

### Story 53-X Template

```markdown
---
date: {current_date}
time: {current_time}
phase: Phase 4 - Implementation
story_id: 53-{N}
epic_id: EPIC-53
status: backlog
priority: P{priority}
estimated_hours: {hours}
---

# Story 53-{N}: {title}

## User Story
**As a** developer maintaining the Via-Gent codebase
**I want** {specific_outcome}
**So that** {benefit}

## Acceptance Criteria

### AC-1: {criterion_name}
**Given** {precondition}
**When** {action}
**Then** {expected_result}

## Tasks
- [ ] T1: {task_description}
- [ ] T2: {task_description}

## Technical Notes
- Reference: ADR-024
- Canonical path: `src/infrastructure/persistence/{target}`
- Legacy path: `src/lib/state/{source}`
```

---

## Agent Selection

This workflow auto-selects:

| Phase | Agent | Specialty |
|-------|-------|-----------|
| Analysis | `store-refactorer` | Dependency analysis, export mapping |
| Facade Creation | `store-refactorer` | Facade pattern, re-exports |
| Migration | `typescript-fixer` | Import path updates |
| Validation | `test-writer` | Smoke tests, validation checks |
| Orchestration | `bmad-master` | Cycle continuation, handoffs |

---

## Governance Updates

After each story completion, update:

1. **sprint-status.yaml**
   ```yaml
   53-{N}-{slug}: done  # COMPLETED {timestamp}
   ```

2. **bmm-workflow-status.yaml**
   ```yaml
   session_notes:
     - timestamp: {timestamp}
       action: "STORY 53-{N} COMPLETE"
       agent: "@bmad-core-bmad-master"
   ```

3. **epic-53-progress**
   ```yaml
   stories_done: {N}
   completion_percentage: "{N/8 * 100}%"
   ```

---

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

---

**Module Owner**: @bmad-core-bmad-master
**Workflow Owner**: @bmad-bmm-architect
**Reference**: ADR-024, SCP-2026-01-04-STATE-CONSOLIDATION
