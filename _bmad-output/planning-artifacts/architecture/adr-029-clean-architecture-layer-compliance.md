# ADR-029: Clean Architecture Layer Compliance

**Date:** 2026-01-07  
**Status:** PROPOSED  
**Author:** @bmad-bmm-architect

## Context

The codebase currently operates at approximately **75% Clean Architecture compliance**, with the presentation layer dominating file count and cross-layer dependencies existing throughout the codebase. The infrastructure layer has grown to 250+ files, while the core layer remains minimal with only 4 entities.

### Current State Analysis

Based on Phase 1 findings from Architecture Patterns Analysis:

#### Layer Distribution

| Layer | Path | Files | Status | Compliance |
|-------|------|-------|--------|------------|
| **Core** | `src/core/` | 4 entities | Minimal | 25% |
| **Domain** | `src/domain/` | 7 services | Partial | 50% |
| **Infrastructure** | `src/infrastructure/` | 250+ files | Overgrown | 75% |
| **Presentation** | `src/presentation/` | 474 components | Dominant | 80% |

#### Clean Architecture Compliance

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| **Layer Compliance** | 75% | 100% | 25% |
| **Import Direction** | ⚠️ Mixed | ✅ Inward only | 25% |
| **Single Responsibility** | 19 god components | 0 | 19 |
| **Dependency Inversion** | Partial | Full | 50% |

### Evidence from Phase 1

1. **Architecture Patterns YAML** (`architecture-patterns.yaml`):
   - Core layer minimal (only 4 entities)
   - Domain layer has 7 services but could be more comprehensive
   - Infrastructure layer is the largest (250+ files)
   - Presentation layer dominates file count
   - Some cross-layer dependencies exist

2. **Component Inventory**: 19 god components exceed 300-line limit

3. **State Architecture**: 9 god stores exceed 300-line limit

### Problem Statement

- **Layer Violation**: Infrastructure layer contains presentation logic
- **Import Direction**: Some files import from higher layers
- **God Components**: 19 components violate single responsibility
- **God Stores**: 9 stores violate single responsibility
- **Testability Issues**: Cross-layer coupling prevents unit testing

## Decision

Implement strict Clean Architecture compliance with the following rules:

### Layer Responsibilities

#### Layer 1: Core (src/core/)

**Purpose**: Enterprise-wide business rules, entities, and value objects

**Contents**:
- Domain entities (`Agent.ts`, `Conversation.ts`, `Provider.ts`, `Tool.ts`)
- Value objects
- Domain events
- Enums and type definitions

**Rules**:
- ✅ Zero dependencies on other layers
- ✅ Pure TypeScript (no framework imports)
- ✅ 100% testable without mocking
- ❌ No React imports
- ❌ No Zustand imports
- ❌ No API calls

#### Layer 2: Domain (src/domain/)

**Purpose**: Application business rules, use cases, and services

**Contents**:
- Use cases (business workflows)
- Domain services
- Repository interfaces (contracts)
- Service interfaces

**Rules**:
- ✅ Depends only on Core layer
- ✅ Defines interfaces for infrastructure
- ✅ Contains business logic
- ❌ No concrete implementations (those go to Infrastructure)
- ❌ No framework imports

#### Layer 3: Infrastructure (src/infrastructure/)

**Purpose**: External concerns, framework integration, and concrete implementations

**Contents**:
- Database implementations (Dexie)
- File system adapters
- API clients
- Event bus implementations
- Persistence stores

**Rules**:
- ✅ Implements Domain interfaces
- ✅ Handles external concerns
- ✅ Contains framework-specific code
- ❌ No presentation logic
- ❌ No business rules (those go to Domain)

#### Layer 4: Presentation (src/presentation/)

**Purpose**: UI components, hooks, and user-facing logic

**Contents**:
- React components
- Custom hooks
- Route definitions
- UI utilities

**Rules**:
- ✅ Depends on all other layers (via interfaces)
- ✅ Contains UI logic only
- ✅ Uses hooks for state management
- ❌ No business rules (those go to Domain)
- ❌ No database logic (those go to Infrastructure)

### Import Direction Rules

```
┌─────────────────────────────────────┐
│         Presentation (UI)           │  ← Top layer
│    src/presentation/components/     │
└──────────────┬──────────────────────┘
               │ imports
               ▼
┌─────────────────────────────────────┐
│         Infrastructure              │  ← External concerns
│    src/infrastructure/persistence/  │
└──────────────┬──────────────────────┘
               │ imports (interfaces only)
               ▼
┌─────────────────────────────────────┐
│            Domain                   │  ← Business rules
│         src/domain/services/        │
└──────────────┬──────────────────────┘
               │ imports
               ▼
┌─────────────────────────────────────┐
│             Core                    │  ← Enterprise rules
│           src/core/entities/        │
└─────────────────────────────────────┘
```

### Allowed Import Patterns

```typescript
// ✅ CORRECT: Presentation can import from Infrastructure
import { AgentExecutionService } from '@/infrastructure/agent/execution/service';

// ✅ CORRECT: Infrastructure can import from Domain (interfaces only)
import { IAgentRepository } from '@/domain/repositories/agent-repository';

// ✅ CORRECT: Domain can import from Core
import { Agent } from '@/core/entities/Agent';

// ❌ WRONG: Infrastructure importing from Presentation
import { AgentChatPanel } from '@/presentation/components/agent/AgentChatPanel';

// ❌ WRONG: Presentation importing Core entities with presentation logic
import { Agent } from '@/core/entities/Agent'; // If Agent has React refs

// ❌ WRONG: Domain importing Infrastructure implementations
import { DexieAgentRepository } from '@/infrastructure/persistence/dexie-agent-repository';
```

### Dependency Inversion Principle

```typescript
// ✅ CORRECT: Domain defines interface, Infrastructure implements
// src/domain/repositories/agent-repository.ts
export interface IAgentRepository {
  getAgent(id: string): Promise<Agent>;
  saveAgent(agent: Agent): Promise<void>;
  deleteAgent(id: string): Promise<void>;
}

// src/infrastructure/persistence/agent-repository.ts
export class DexieAgentRepository implements IAgentRepository {
  async getAgent(id: string): Promise<Agent> {
    // Implementation...
  }
  // ...
}

// src/infrastructure/persistence/agent-store.ts
export const useAgentStore = create<AgentStoreState>()(
  persist(
    (set, get) => ({
      agents: [],
      getAgent(id: string): Agent | undefined {
        return get().agents.find(a => a.id === id);
      },
      // ...
    }),
    { name: 'agent-store' }
  )
);

// ✅ CORRECT: Presentation uses store, not concrete repository
const agents = useAgentStore(s => s.agents);

// ❌ WRONG: Presentation imports concrete repository
import { DexieAgentRepository } from '@/infrastructure/persistence/dexie-agent-repository';
```

## Consequences

### Positive

1. **Testability**: Clear layers enable unit testing at each level
2. **Maintainability**: Isolated changes reduce regression risk
3. **Flexibility**: Swap implementations without affecting other layers
4. **Scalability**: New features fit into appropriate layers
5. **Code Quality**: Enforced single responsibility

### Negative

1. **Migration Effort**: Significant refactoring required
2. **Boilerplate**: Interface separation increases file count
3. **Learning Curve**: Team must understand layer boundaries
4. **Development Speed**: Initial development slower

## Implementation

### Refactoring Priority Matrix

| Priority | File | Layer | Issue | Effort | Weeks |
|----------|------|-------|-------|--------|-------|
| P0 | `src/lib/agent/` | Infrastructure | Contains presentation logic | High | 2 |
| P0 | `src/lib/notes/` | Infrastructure | Contains presentation logic | High | 1.5 |
| P1 | God components (19) | Presentation | >300 lines | Medium | 3 |
| P1 | God stores (9) | Infrastructure | >300 lines | Medium | 2 |
| P2 | `src/core/` | Core | Only 4 entities | Low | 1 |
| P2 | `src/domain/` | Domain | Missing services | Medium | 1.5 |
| P3 | Cross-layer imports | All | Violates direction | Low | 1 |

### Layer Migration Steps

#### Step 1: Core Layer Expansion (Week 1)

1. Identify domain entities needed beyond current 4
2. Create value objects for complex types
3. Define domain events
4. Create enums for business rules

**New Core Files**:
- `src/core/entities/Workspace.ts`
- `src/core/entities/Project.ts`
- `src/core/entities/Note.ts`
- `src/core/value-objects/WorkspaceType.ts`
- `src/core/events/AgentChangedEvent.ts`

#### Step 2: Domain Layer Completion (Week 2)

1. Define repository interfaces
2. Create use case classes
3. Implement domain services
4. Add business rule validation

**New Domain Files**:
- `src/domain/use-cases/agent/CreateAgentUseCase.ts`
- `src/domain/use-cases/agent/DeleteAgentUseCase.ts`
- `src/domain/services/WorkspaceService.ts`
- `src/domain/validators/AgentValidator.ts`

#### Step 3: Infrastructure Cleanup (Week 3-4)

1. Move presentation logic to presentation layer
2. Implement Domain interfaces
3. Decompose god files
4. Ensure infrastructure depends on Domain only

**Refactoring Targets**:
- `src/lib/agent/services/` → `src/infrastructure/agent/services/`
- `src/lib/notes/` → `src/infrastructure/notes/` (core logic only)

#### Step 4: Presentation Layer Refactoring (Week 5-6)

1. Decompose god components
2. Move business logic to Domain layer
3. Ensure hooks use Infrastructure via interfaces
4. Add proper error boundaries

**Refactoring Targets**:
- 19 god components → Decompose to focused components
- Business logic → Move to Domain use cases

#### Step 5: Import Direction Fixes (Week 7)

1. Audit all cross-layer imports
2. Fix violations with interface extraction
3. Add layer checking to build process
4. Add lint rules for layer compliance

### File References from Phase 1

| File | Layer | Current Issue | Target Layer |
|------|-------|---------------|--------------|
| `src/lib/agent/facades/` | Infrastructure | Facade pattern OK | Keep |
| `src/lib/agent/tools/` | Infrastructure | Contains tool definitions | Keep |
| `src/lib/agent/hooks/` | Infrastructure | Contains hooks | Presentation |
| `src/lib/notes/note-ai-service.ts` | Infrastructure | Business logic | Domain |
| `src/lib/events/cross-workspace-event-bus.ts` | Infrastructure | Event implementation | Keep |
| `src/presentation/components/agent/` | Presentation | God components | Decompose |
| `src/presentation/components/ide/` | Presentation | God components | Decompose |

### Validation Rules

```typescript
// Add to eslint.config.mjs
{
  "rules": {
    // Enforce layer imports
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": "@/presentation/**",
            "message": "Infrastructure layer cannot import from Presentation"
          },
          {
            "group": "@/domain/**",
            "message": "Infrastructure can only import Domain interfaces"
          }
        ]
      }
    ]
  }
}
```

## Dependencies

- **ADR-026**: AI Service Unification (follows layer rules)
- **ADR-027**: State Management Consolidation (follows layer rules)
- **ADR-028**: Error Boundary Coverage (presentation layer)

## Related ADRs

- **ADR-024**: State Management Consolidation (related state architecture)
- **ADR-027**: State Management Consolidation (store layer compliance)
- **ADR-028**: Error Boundary Coverage (presentation layer requirements)

## References

- Architecture Patterns: `_bmad-output/planning-artifacts/architecture/codebase-analysis/architecture-patterns.yaml`
- Component Inventory: `_bmad-output/planning-artifacts/architecture/codebase-analysis/component-inventory.yaml`
- State Architecture: `_bmad-output/planning-artifacts/architecture/codebase-analysis/state-architecture.yaml`

## Success Metrics

| Metric | Target | Current | Timeline |
|--------|--------|---------|----------|
| Layer Compliance | 100% | 75% | Week 7 |
| God Components | 0 | 19 | Week 6 |
| God Stores | 0 | 9 | Week 4 |
| Cross-Layer Violations | 0 | TBD | Week 7 |
| Test Coverage (Core/Domain) | 90% | TBD | Week 7 |
