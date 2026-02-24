---
title: "ADR-042: Agent Brownfield Guard"
status: "ACCEPTED"
date: "2026-01-30"
decision-makers: "architect-ext-team-b"
technical-story: "ARCH-01d"
related:
  - "new-fundamental-truths.md"
  - "AGENTS.md"
  - "ADR-039"
  - "ADR-040"
  - "ADR-041"
---

# ADR-042: Agent Brownfield Guard

## Status
ACCEPTED

## Context

AI agents caused significant architectural chaos in the brownfield codebase:

### Agent-Inflicted Problems

| Problem Type | Count | Severity | Impact |
|--------------|-------|----------|--------|
| **Type synonyms created** | 12 groups | 🔴 CRITICAL | Import graph fragmentation |
| **Forbidden paths used** | 654 @/lib/ imports | 🔴 CRITICAL | Architecture violations |
| **Canonical directories ignored** | 8 duplicate WorkspaceType | 🔴 CRITICAL | Maintenance burden |
| **God files created** | 30 files >300 lines | 🔴 CRITICAL | Technical debt |
| **Persist violations** | 35 stores | 🔴 CRITICAL | State layer chaos |
| **"Refuktor" cycles** | Multiple | 🔴 CRITICAL | Wasted effort |

### Root Cause

**AI agents lack brownfield awareness** and make decisions based on:
- **Pattern matching** without understanding existing architecture
- **Local optimization** without considering global impact
- **Assumptions** about greenfield development
- **Missing context** about canonical paths and ownership

### Example: Agent Creating Type Synonyms

```
User: "Create a function to validate workspace type"

Agent (WITHOUT brownfield guard):
1. Sees WorkspaceType in chat.ts
2. Creates new WorkspaceType in new file
3. Imports from wrong location
4. Now we have 8 definitions!

Agent (WITH brownfield guard):
1. Checks canonical type registry (ADR-040)
2. Finds WorkspaceType in @/domain/types
3. Imports from canonical location
4. Uses existing WorkspaceTypeUtils
```

### Example: Agent Using Forbidden Paths

```
User: "Add file system operations"

Agent (WITHOUT brownfield guard):
1. Creates file in @/lib/filesystem/
2. Imports from @/lib/utils/
3. Violates architecture (654 imports!)

Agent (WITH brownfield guard):
1. Checks forbidden paths list
2. Uses @/infrastructure/filesystem/
3. Imports from @/domain/interfaces/
4. Follows Clean Architecture
```

## Decision

### 1. Brownfield Guard Rules

Agents MUST follow these rules when working in brownfield codebase:

#### Rule 1: Check Canonical Locations First

**Before creating any type, store, or entity:**

1. **Check type registry** (ADR-040) for existing types
2. **Check entity contracts** (domain-entity-contracts-2026-01-30.md) for existing entities
3. **Check state boundaries** (ADR-041) for state layer ownership
4. **Only create new** if canonical location doesn't exist

**Checklist:**
```yaml
pre_creation_checklist:
  - type: "Check type registry for existing type"
  - entity: "Check entity contracts for existing entity"
  - store: "Check state boundaries for layer ownership"
  - path: "Check forbidden paths list"
  - import: "Check canonical import paths"
```

#### Rule 2: Use Canonical Import Paths

**MUST use**:
```typescript
// Domain types
import type { WorkspaceType } from '@/domain/types';
import type { ProjectId } from '@/domain/types';
import type { PluginId } from '@/domain/types';

// Domain entities
import type { Project } from '@/domain/entities';
import type { Agent } from '@/domain/entities';
import type { ChatThread } from '@/domain/entities';

// Infrastructure
import { db } from '@/infrastructure/persistence/dexie-db';
import { StorageAdapter } from '@/infrastructure/filesystem/fsa-storage-adapter';
```

**MUST NOT use**:
```typescript
// ❌ Forbidden paths
import { WorkspaceType } from '@/lib/workspace/workspace-types';
import { utils } from '@/lib/utils';
import { helpers } from '@/lib/helpers';

// ❌ Wrong layer imports
import { Project } from '@/infrastructure/persistence/stores/project-store';
import { Agent } from '@/presentation/components/agent-list';
```

#### Rule 3: Respect Layer Boundaries

**Layer ownership rules** (from ADR-041):

| Layer | Owns | Cannot Access |
|-------|------|---------------|
| **Domain** | Business logic, entities, types | Infrastructure, Presentation |
| **Infrastructure** | Storage, sync, external APIs | Domain internals |
| **Presentation** | UI components, hooks | Domain internals, Infrastructure internals |

**Cross-layer access patterns**:
```typescript
// ✅ CORRECT: Presentation → Domain
import type { Project } from '@/domain/entities';

// ✅ CORRECT: Presentation → Infrastructure (via interface)
import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';

// ❌ WRONG: Domain → Infrastructure
import { db } from '@/infrastructure/persistence/dexie-db';

// ❌ WRONG: Infrastructure → Presentation
import { ProjectList } from '@/presentation/components/project-list';
```

#### Rule 4: Pre-Commit Checklist is MANDATORY

**Before committing any changes, agents MUST verify:**

```yaml
pre_commit_checklist:
  typecheck:
    - "Run pnpm typecheck:fast - must pass"
    - "Fix all TypeScript errors"
  tests:
    - "Run pnpm test:fast - must pass"
    - "Add tests for new code"
  governance:
    - "Run pnpm governance - must pass"
    - "Check file size limits (<300 lines for stores/components)"
    - "Check import path violations"
  architecture:
    - "Verify canonical import paths used"
    - "Verify layer boundaries respected"
    - "Verify no forbidden paths used"
  documentation:
    - "Update relevant ADRs if architecture changed"
    - "Update type registry if new types added"
    - "Update entity contracts if new entities added"
```

#### Rule 5: Escalation Required For

**Agents MUST escalate to human architect for:**

```yaml
escalation_triggers:
  new_directories:
    - "Creating new top-level directories"
    - "Creating new domain subdirectories"
  new_stores:
    - "Creating new Zustand stores"
    - "Adding persist middleware to stores"
  new_types:
    - "Creating new domain types not in registry"
    - "Creating type synonyms"
  architecture_changes:
    - "Modifying layer boundaries"
    - "Changing ownership rules"
    - "Breaking Clean Architecture"
  forbidden_paths:
    - "Using @/lib/ paths"
    - "Crossing layer boundaries incorrectly"
```

### 2. Enforcement Mechanisms

#### 2.1 Governance Scripts

**Automated checks** (run on every commit):

```bash
# Type checking
pnpm typecheck:fast

# Testing
pnpm test:fast

# Governance (size + imports)
pnpm governance

# Circular dependencies
pnpm deps:circular
```

#### 2.2 ESLint Rules

**Custom rules** to enforce:

```javascript
// forbid-lib-imports
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/lib/*'],
        message: 'Use @/domain/* or @/infrastructure/* instead'
      }]
    }]
  }
}

// enforce-canonical-types
{
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/domain/entities/workspace'],
        message: 'Import WorkspaceType from @/domain/types instead'
      }]
    }]
  }
}
```

#### 2.3 Pre-Commit Hooks

**Git hooks** to run checks:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

pnpm typecheck:fast || exit 1
pnpm test:fast || exit 1
pnpm governance || exit 1

echo "All checks passed!"
```

### 3. Agent Training

#### 3.1 Context Loading

**Agents MUST load context before any work:**

```yaml
required_context:
  - "AGENTS.md - Project governance"
  - "architecture.md - Current architecture"
  - "type-registry-2026-01-30.md - Canonical types"
  - "state-layer-boundaries-2026-01-30.md - State layers"
  - "domain-entity-contracts-2026-01-30.md - Entity ownership"
  - "ADR-039, ADR-040, ADR-041 - Binding decisions"
```

#### 3.2 Decision Framework

**Agents MUST follow this decision tree:**

```
Need to create type?
  ↓
Check type registry (ADR-040)
  ↓
Exists? → Import from canonical
  ↓
No? → Escalate to human architect

Need to create store?
  ↓
Check state boundaries (ADR-041)
  ↓
UI state? → Create in Zustand (no persist)
  ↓
Domain data? → Use Dexie (escalate if new table)

Need to import?
  ↓
Check forbidden paths
  ↓
Forbidden? → Use canonical path
  ↓
Allowed? → Verify layer ownership
```

### 4. Violation Handling

#### 4.1 Detection

**Violations detected by:**

- **Governance scripts** (automated)
- **Code review** (human)
- **Agent self-check** (pre-commit checklist)

#### 4.2 Consequences

| Violation Type | First Offense | Repeat Offense |
|----------------|---------------|----------------|
| **Type synonym** | Warning + fix | Block + retraining |
| **Forbidden path** | Warning + fix | Block + retraining |
| **God file** | Warning + split plan | Block + forced split |
| **Persist violation** | Warning + migration plan | Block + forced migration |
| **Layer violation** | Warning + refactor plan | Block + forced refactor |

#### 4.3 Recovery

**If agent causes violation:**

1. **Stop work** immediately
2. **Document violation** in issue tracker
3. **Create remediation plan** (with human approval)
4. **Execute remediation** (with human oversight)
5. **Update training** to prevent recurrence

## Consequences

### Positive

- **Predictable behavior**: Agents follow consistent patterns
- **Architecture stability**: No more "refuktor" cycles
- **Reduced technical debt**: Fewer god files and violations
- **Faster development**: Agents make correct decisions first time
- **Better code quality**: Automated enforcement catches violations early

### Negative

- **Slower initial work**: Agents must check context before acting
- **Escalation overhead**: Some decisions require human approval
- **Learning curve**: Agents must understand brownfield constraints
- **Tooling complexity**: Need governance scripts and ESLint rules

### Neutral

- **Backward compatibility**: Existing code grandfathered in
- **Gradual adoption**: Agents learn rules over time
- **Continuous improvement**: Rules refined based on experience

## Success Metrics

| Metric | Before | Target | After |
|--------|--------|--------|-------|
| Type synonyms created | 12 groups | 0 | ✅ All canonical |
| @/lib/ imports | 654 | 0 | ✅ All migrated |
| God files created | 30 | <10 | ✅ All split |
| Persist violations | 35 | 0 | ✅ All fixed |
| "Refuktor" cycles | Multiple | 0 | ✅ Eliminated |

## Related ADRs

- **ADR-039**: Consolidated Project-Centric Architecture - Establishes project-centric model
- **ADR-040**: Canonical Type Registry - Defines type ownership
- **ADR-041**: 4-Layer State Architecture - Defines state layer boundaries

## References

- `AGENTS.md` - Project governance and agent rules
- `new-fundamental-truths.md` - Architectural decisions source
- `domain-entity-contracts-2026-01-30.md` - Entity ownership and relationships
- `state-layer-boundaries-2026-01-30.md` - State layer definitions

---

**Decision Date**: 2026-01-30
**Effective**: Immediately
**Review Date**: 2026-02-28 (after agent training complete)