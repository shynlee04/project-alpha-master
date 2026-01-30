---
id: AGENT-GOVERNANCE-RULES-2026-01-30
title: "Agent Governance Rules - Brownfield Guard Protocol"
version: 1.0.0
created: 2026-01-30T15:00:00+07:00
status: CONSTITUTIONAL
authority: Tier 1 - Binding on All Agents
purpose: Prevent agent-inflicted refuktor cycles
evidence_source: Phase 1A Deep Scan, PHASE-1A-REGISTRY-2026-01-29
---

# Agent Governance Rules

> **NON-NEGOTIABLE**: These rules prevent "refuktor" cycles - where AI agents create architectural chaos through quick patches, type synonyms, and file tree anarchy.

---

## Executive Summary

| Metric | Problem Found | Rule to Prevent |
|--------|---------------|-----------------|
| Type Synonyms | 12 synonym groups (WorkspaceType x10+) | MANDATORY: Check before creating |
| lib/ Imports | 654 FORBIDDEN path imports | MANDATORY: Use canonical paths |
| God Files | 47+ files > 300 lines | MANDATORY: Split at threshold |
| State Violations | 35 stores with persist issues | MANDATORY: Follow Zustand v5 |
| Layer Violations | 8 domain imports from infrastructure | MANDATORY: Respect Clean Architecture |

---

## 1. TYPE CREATION RULES

### 1.1 NEVER Create Types Without Checking

**BEFORE creating ANY type, interface, or enum:**

```bash
# Step 1: Search for existing type
grep -r "type YourTypeName" src/domain/types/ src/domain/interfaces/ src/domain/entities/

# Step 2: Check barrel exports
grep -r "export.*YourTypeName" src/domain/types/index.ts

# Step 3: If not found, check broader scope
grep -r "type YourTypeName\|interface YourTypeName" src/ --include="*.ts"
```

**ESCALATE if type exists ANYWHERE** - do NOT create a synonym.

### 1.2 Canonical Type Locations

| Type Category | Canonical Location | Example |
|---------------|-------------------|---------|
| Domain Entities | `src/domain/entities/` | `project.ts`, `workspace.ts` |
| Domain Types | `src/domain/types/` | `platform-types.ts`, `sync-types.ts` |
| Domain Interfaces | `src/domain/interfaces/` | `storage-adapter.interface.ts` |
| Infrastructure Types | `src/infrastructure/**/types/` | `dexie-types.ts` |
| Presentation Types | Co-located with component | `MyComponent.types.ts` |

### 1.3 Known Type Synonyms (DO NOT DUPLICATE)

| Canonical Type | FORBIDDEN Synonyms | Canonical Location |
|----------------|-------------------|-------------------|
| `WorkspaceType` | WorkspaceId, WorkspaceKind | `src/domain/types/workspace.types.ts` |
| `Project` | ProjectEntity, ProjectRecord | `src/domain/entities/project.ts` |
| `StorageAdapter` | FileStorageAdapter, UnifiedAdapter | `src/domain/interfaces/storage-adapter.interface.ts` |
| `PlatformContract` | DeviceType, DeviceInfo | `src/infrastructure/filesystem/platform-contract.ts` |
| `SyncStatus` | FileSyncState, SyncState | `src/infrastructure/sync/types/sync-status.ts` |
| `PluginState` | PluginPosition, PanelState | `src/presentation/layouts/PluginLayoutStore.ts` |

### 1.4 Type Creation Checklist

```markdown
- [ ] Searched `src/domain/types/` for existing type
- [ ] Searched `src/domain/interfaces/` for existing interface
- [ ] Searched `src/domain/entities/` for existing entity
- [ ] Confirmed no synonym exists in codebase (grep)
- [ ] Type placed in CANONICAL location
- [ ] Type exported via barrel file (`index.ts`)
- [ ] Type name does NOT conflict with existing names
```

---

## 2. FILE PLACEMENT RULES

### 2.1 Canonical Directory Structure

```
src/
├── routes/                    # TanStack Router ONLY
├── presentation/              # React UI ONLY
│   ├── components/
│   │   ├── ui/               # Design system primitives
│   │   ├── common/           # Shared components
│   │   ├── layout/           # Layout components
│   │   ├── notes/            # Notes-specific
│   │   └── ide/              # IDE-specific
│   ├── layouts/              # Page layouts (WorkspaceLayout, PluginLayoutStore)
│   └── hooks/                # React hooks
├── domain/                    # Business Logic ONLY
│   ├── entities/             # Domain entities
│   ├── services/             # Domain services
│   ├── types/                # Domain types
│   └── interfaces/           # Service contracts
└── infrastructure/            # External Interfaces ONLY
    ├── persistence/
    │   ├── dexie-db.ts
    │   └── stores/          # Zustand stores
    ├── filesystem/          # Storage adapters
    ├── sync/                # File sync logic
    └── events/              # Event bus
```

### 2.2 FORBIDDEN Paths (ABSOLUTE)

| FORBIDDEN Path | Why | Canonical Alternative |
|----------------|-----|----------------------|
| `@/lib/*` | 654 violations exist, being migrated | `@/domain/*` or `@/infrastructure/*` |
| `@/stores/*` | Never existed | `@/infrastructure/persistence/stores/*` |
| `@/helpers/*` | Scattered utilities | Domain-specific modules |
| `@/utils/*.ts` | Generic utilities | `@/domain/services/*` or co-located |
| `src/core/*` | Legacy architecture | `src/domain/*` |
| `src/app/*` | Wrong React convention | `src/routes/*` |

### 2.3 File Placement Decision Tree

```
Is it UI/React? 
├── YES → src/presentation/components/[feature]/
│         OR src/presentation/hooks/
│
Is it business logic?
├── YES → Is it data shape?
│         ├── YES → src/domain/entities/
│         └── NO → src/domain/services/
│
Is it external integration?
├── YES → src/infrastructure/[category]/
│
Is it a page route?
├── YES → src/routes/
│
Is it a Zustand store?
├── YES → src/infrastructure/persistence/stores/[feature]/
│
DEFAULT → ESCALATE - ask before creating
```

### 2.4 Directory Creation Protocol

**NEVER create new directories without explicit approval.**

When a new directory is needed:
1. Document the rationale
2. Check if existing directory can be reused
3. Propose to user/orchestrator
4. If approved, add to this governance document

---

## 3. IMPORT PATH RULES

### 3.1 Canonical Import Aliases

| Alias | Target | When to Use |
|-------|--------|-------------|
| `@/domain/*` | `src/domain/*` | Business logic, entities, interfaces |
| `@/infrastructure/*` | `src/infrastructure/*` | Stores, persistence, external APIs |
| `@/presentation/*` | `src/presentation/*` | React components, hooks, layouts |
| `@/routes/*` | `src/routes/*` | Page routes (rarely imported) |
| `@/plugins/*` | `src/plugins/*` | Plugin implementations |

### 3.2 FORBIDDEN Import Patterns

```typescript
// ❌ FORBIDDEN - @/lib/ path (654 violations)
import { something } from '@/lib/workspace';
import { util } from '@/lib/utils';

// ❌ FORBIDDEN - @/stores/ path (never existed)
import { useStore } from '@/stores/my-store';

// ❌ FORBIDDEN - Relative cross-layer imports
import { Entity } from '../../domain/entities/entity';

// ❌ FORBIDDEN - Direct store file imports (bypass barrel)
import { useMyStore } from '@/infrastructure/persistence/stores/feature/my-store';

// ✅ CORRECT - Canonical paths
import { Entity } from '@/domain/entities/entity';
import { useMyStore } from '@/infrastructure/persistence/stores';
import { MyComponent } from '@/presentation/components/common';
```

### 3.3 Layer Import Direction (Clean Architecture)

```
┌─────────────────────────────────────────┐
│           PRESENTATION                   │
│  (Can import from Domain)                │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│             DOMAIN                       │
│  (NEVER imports from other layers)       │
└─────────────────────────────────────────┘
                      ▲
                      │
┌─────────────────────┴───────────────────┐
│         INFRASTRUCTURE                   │
│  (Can import from Domain)                │
└─────────────────────────────────────────┘

ALLOWED:
  Presentation → Domain ✅
  Infrastructure → Domain ✅
  
FORBIDDEN:
  Domain → Presentation ❌
  Domain → Infrastructure ❌
  Infrastructure → Presentation ❌ (except event bus)
```

---

## 4. STATE MANAGEMENT RULES

### 4.1 Zustand Store Rules

| Rule | Requirement | Evidence |
|------|-------------|----------|
| `useShallow` | MANDATORY for multi-selector | Prevents unnecessary re-renders |
| Individual selectors | PREFERRED | Better performance |
| Persist middleware | FORBIDDEN on domain data | Use Dexie.js instead |
| Store location | `infrastructure/persistence/stores/` | Canonical path |
| Store size | MAX 300 lines | Split into slices if larger |

### 4.2 Zustand v5 Patterns

```typescript
// ✅ CORRECT - useShallow for multiple selectors
const { items, addItem } = useStore(
  useShallow((state) => ({ 
    items: state.items, 
    addItem: state.addItem 
  }))
);

// ✅ CORRECT - Individual selector (preferred)
const items = useStore((state) => state.items);
const addItem = useStore((state) => state.addItem);

// ❌ FORBIDDEN - Multiple selectors without useShallow
const { items, addItem } = useStore((state) => ({ 
  items: state.items, 
  addItem: state.addItem 
})); // CAUSES INFINITE RE-RENDERS!

// ❌ FORBIDDEN - persist middleware on domain data
const useDomainStore = create(
  persist(
    (set) => ({ ... }),
    { name: 'domain-store' }  // ❌ Use Dexie instead
  )
);
```

### 4.3 Store File Size Limits

| Store Type | Max Lines | Action if Exceeded |
|------------|-----------|-------------------|
| Single store | 300 | Split into slices |
| Combined store | 400 | Extract slices to files |
| Slice file | 200 | Extract helpers |

### 4.4 Persist Middleware Rules

```typescript
// ✅ ALLOWED - UI preferences only
persist(storeConfig, { 
  name: 'ui-preferences',
  partialize: (state) => ({ 
    theme: state.theme,
    sidebarCollapsed: state.sidebarCollapsed 
  })
});

// ❌ FORBIDDEN - Domain data (use Dexie.js)
persist(storeConfig, { name: 'projects' });  // ❌
persist(storeConfig, { name: 'notes' });     // ❌
persist(storeConfig, { name: 'files' });     // ❌
```

---

## 5. PRE-COMMIT CHECKLIST FOR AGENTS

**MANDATORY: Complete this checklist before claiming any work is done.**

### 5.1 Path Compliance

```markdown
- [ ] No new `@/lib/` imports created
- [ ] No new `@/stores/` imports created
- [ ] All imports use canonical paths (`@/domain/`, `@/infrastructure/`, `@/presentation/`)
- [ ] No relative imports crossing layer boundaries
- [ ] Files placed in canonical directories
```

### 5.2 Type Compliance

```markdown
- [ ] No new type synonyms created
- [ ] Checked `src/domain/types/` before creating types
- [ ] Checked `src/domain/interfaces/` before creating interfaces
- [ ] New types exported via barrel files
```

### 5.3 State Management Compliance

```markdown
- [ ] `useShallow` used for multi-selector stores
- [ ] No `persist` middleware on domain data
- [ ] Stores under 300 lines
- [ ] No god stores created
```

### 5.4 Verification Commands

```bash
# MUST PASS before claiming done:
pnpm typecheck:fast    # TypeScript compilation
pnpm test:fast         # Unit tests (optional but recommended)
pnpm governance        # File size + import path checks

# Evidence command:
grep -r "@/lib/" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: Should not INCREASE from current 654
```

### 5.5 Checklist Template

```yaml
pre_commit_verification:
  path_compliance:
    new_lib_imports: 0
    new_stores_imports: 0
    canonical_paths_used: true
    layer_violations: 0
    
  type_compliance:
    new_synonyms_created: 0
    types_in_canonical_location: true
    barrel_exports_updated: true
    
  state_compliance:
    use_shallow_verified: true
    no_domain_persist: true
    store_size_under_limit: true
    
  verification_commands:
    typecheck_fast: PASS
    governance: PASS
```

---

## 6. ESCALATION PROTOCOL

### 6.1 MUST STOP and ASK When:

| Action | Why Escalate | Evidence Required |
|--------|--------------|-------------------|
| Creating new directory | Prevents file tree anarchy | Justification + alternatives considered |
| Creating new store file | Prevents store proliferation | Existing store analysis |
| Creating new type/interface | Prevents synonyms | Search results showing no existing type |
| Modifying architecture decisions | Prevents drift | ADR reference or proposal |
| Adding @/lib/ imports | FORBIDDEN path | Migration plan required |
| Creating file > 300 lines | God file prevention | Decomposition plan |

### 6.2 Escalation Message Template

```markdown
## ESCALATION: [Action Type]

**Agent**: [Your agent name]
**Action Requested**: [What you want to do]
**Reason**: [Why this is needed]

### Evidence Gathered
- Searched: [paths searched]
- Found: [what you found or didn't find]
- Alternatives Considered: [other options]

### Proposed Action
[Specific action you propose]

### Risk Assessment
- Architectural Impact: [LOW/MEDIUM/HIGH]
- Synonym Risk: [description]
- Migration Complexity: [description]

### Request
Awaiting approval before proceeding.
```

### 6.3 Auto-Escalation Triggers

These conditions AUTOMATICALLY require escalation:

```yaml
auto_escalate:
  - condition: "grep '@/lib/' finds new imports"
    action: "STOP - lib/ imports are FORBIDDEN"
    
  - condition: "grep 'type.*=' finds existing type"
    action: "STOP - potential synonym creation"
    
  - condition: "file > 300 lines"
    action: "STOP - god file prevention"
    
  - condition: "new directory creation"
    action: "STOP - file tree governance"
    
  - condition: "persist middleware on store"
    action: "STOP - verify not domain data"
```

---

## 7. REMEDIATION PATTERNS

### 7.1 When Type Synonym Found

```markdown
**STOP**: Do not create duplicate type.

1. Identify canonical location of existing type
2. Import from canonical location instead
3. If canonical location unclear, document in escalation
4. Update barrel export if needed

Example:
- Found: `WorkspaceType` in `lib/workspace/types.ts`
- Canonical: `src/domain/types/workspace.types.ts`
- Action: Import from canonical, do not create synonym
```

### 7.2 When Wrong Directory Used

```markdown
**Pattern**: File placed in @/lib/ or other forbidden path

1. Identify correct canonical directory
2. Move file to canonical location
3. Update all imports to use canonical path
4. Do NOT create re-export/facade (unless migration strategy)

Canonical Directory Map:
- @/lib/workspace/* → @/infrastructure/persistence/stores/workspace/
- @/lib/filesystem/* → @/infrastructure/filesystem/
- @/lib/notes/* → @/infrastructure/persistence/stores/notes/
- @/lib/utils/* → @/domain/services/ or co-located
- @/lib/agent/* → Phase 2 ARCHIVED - do not touch
```

### 7.3 When @/lib/ Import Needed

```markdown
**Pattern**: Code requires import from @/lib/

1. Check if facade exists in @/lib/[module]/index.ts
2. If facade exists, use it (temporary)
3. If no facade, check canonical location
4. Import from canonical location instead
5. NEVER add new @/lib/ imports

Migration Priority:
- lib/utils/ → Already has facade (188 imports)
- lib/agent/ → Already has facade (45 imports)
- lib/workspace/ → 32 imports, needs migration
- lib/filesystem/ → 36+ imports, needs migration
```

### 7.4 When Store Exceeds Limit

```markdown
**Pattern**: Store file > 300 lines

1. Identify logical slices (CRUD, queries, subscriptions)
2. Extract slices to separate files
3. Create combined store importing slices
4. Maintain backward-compatible exports

Example Structure:
infrastructure/persistence/stores/feature/
├── index.ts              # Combined store + exports
├── feature-store.ts      # Combined store implementation
├── slices/
│   ├── feature-crud-slice.ts      # < 200 lines
│   ├── feature-query-slice.ts     # < 200 lines
│   └── feature-subscription-slice.ts  # < 200 lines
└── types.ts              # Store types
```

---

## 8. ENFORCEMENT MECHANISMS

### 8.1 Automated Checks (Scripts)

```bash
# 8.1.1 Governance Script (MUST PASS)
pnpm governance
# Runs: governance:size + governance:imports

# 8.1.2 File Size Check
pnpm governance:size
# Flags files > 300 lines in stores/, > 400 in components/

# 8.1.3 Import Path Check
pnpm governance:imports
# Flags @/lib/, @/stores/, relative cross-layer imports

# 8.1.4 TypeScript Check (MUST PASS)
pnpm typecheck:fast
# Uses tsgo for fast validation

# 8.1.5 Circular Dependency Check
pnpm deps:circular
# Uses madge to detect cycles
```

### 8.2 ESLint Rules (Recommended)

```javascript
// .eslintrc.js - Recommended additions
module.exports = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/lib/*'],
            message: 'FORBIDDEN: Use @/domain/*, @/infrastructure/*, or @/presentation/* instead.'
          },
          {
            group: ['@/stores/*'],
            message: 'FORBIDDEN: Use @/infrastructure/persistence/stores/* instead.'
          },
          {
            group: ['../../domain/*', '../../infrastructure/*'],
            message: 'Use canonical alias @/domain/* or @/infrastructure/* instead of relative imports.'
          }
        ]
      }
    ]
  }
};
```

### 8.3 Pre-Commit Hook (Recommended)

```bash
#!/bin/bash
# .husky/pre-commit

# 1. TypeScript check
pnpm typecheck:fast || exit 1

# 2. Governance check
pnpm governance || exit 1

# 3. Check for new @/lib/ imports
NEW_LIB_IMPORTS=$(git diff --cached --name-only | xargs grep -l "@/lib/" 2>/dev/null | wc -l)
if [ "$NEW_LIB_IMPORTS" -gt "0" ]; then
  echo "ERROR: New @/lib/ imports detected. Use canonical paths instead."
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

### 8.4 CI/CD Integration (Recommended)

```yaml
# .github/workflows/governance.yml
name: Governance Checks

on: [push, pull_request]

jobs:
  governance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: TypeScript Check
        run: pnpm typecheck:fast
        
      - name: Governance Check
        run: pnpm governance
        
      - name: Circular Dependency Check
        run: pnpm deps:circular
        
      - name: Check lib/ Import Count
        run: |
          COUNT=$(grep -r "@/lib/" src/ --include="*.ts" --include="*.tsx" | wc -l)
          echo "Current @/lib/ imports: $COUNT"
          if [ "$COUNT" -gt "654" ]; then
            echo "ERROR: @/lib/ imports increased from 654 to $COUNT"
            exit 1
          fi
```

---

## 9. QUICK REFERENCE CARD

### FORBIDDEN (ABSOLUTE)

```
❌ @/lib/* imports        → Use @/domain/*, @/infrastructure/*, @/presentation/*
❌ @/stores/* imports     → Use @/infrastructure/persistence/stores/*
❌ Creating type synonyms → Check existing types first
❌ Files > 300 lines      → Split into slices
❌ New directories        → Escalate first
❌ persist on domain data → Use Dexie.js
❌ Selectors without useShallow → Causes re-renders
❌ Cross-layer relative imports → Use canonical aliases
```

### MANDATORY (ALWAYS DO)

```
✅ grep before creating types
✅ Use canonical paths (@/domain/*, etc.)
✅ useShallow for multi-selectors
✅ Place files in canonical directories
✅ Run pnpm typecheck:fast before done
✅ Run pnpm governance before done
✅ Escalate when creating new structures
✅ Check existing before creating new
```

### CANONICAL PATHS

```
Business Logic     → @/domain/
External APIs      → @/infrastructure/
React Components   → @/presentation/
Zustand Stores     → @/infrastructure/persistence/stores/
Page Routes        → @/routes/
Plugins            → @/plugins/
```

---

## 10. REVISION HISTORY

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-30 | 1.0.0 | Initial creation from Phase 1A findings | analyst-ext |

---

## 11. APPENDICES

### Appendix A: Evidence Sources

- `_bmad-output/governance/phase-1a-deep-scan-2026-01-29.md`
- `_bmad-output/governance/PHASE-1A-REGISTRY-2026-01-29.md`
- `_bmad-output/governance/file-analysis-2026-01-30.md`
- `.opencode/skills/brownfield-guard/SKILL.md`
- `AGENTS.md` (Constitution v3.0.0)

### Appendix B: Current Violation Counts

| Violation Type | Current Count | Target |
|----------------|---------------|--------|
| @/lib/ imports | 654 | 0 |
| Type synonyms | 12 groups | 0 |
| God files (>300) | 47 | <10 |
| Circular deps | 5 | 2 |
| PascalCase files | 40 | 0 |

### Appendix C: Related Documents

- `AGENTS.md` - Project constitution
- `_bmad-output/planning-artifacts/architecture.md` - Technical spec
- `.opencode/skills/brownfield-guard/SKILL.md` - Base brownfield rules
- `_bmad-output/governance/PHASE2-STAGING-PLAN-2026-01-29.md` - Migration roadmap

---

**END OF AGENT GOVERNANCE RULES**

*This document is CONSTITUTIONAL - binding on all AI agents operating in this codebase.*
