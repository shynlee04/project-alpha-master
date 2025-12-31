# MASTER EPIC: Sprint Change Proposal Compliance - Full Architectural Remediation

**Epic ID**: EPIC-2025-12-31-001
**Title**: Sprint Change Proposal Complete Compliance
**Priority**: P0 (CRITICAL)
**Estimated Time**: 110-170 hours
**Status**: 🚨 **READY TO BEGIN**

---

## Executive Summary

**Objective**: Achieve 100% compliance with Sprint Change Proposal architectural requirements.

**Current State**: 🚨 **CRITICAL NON-COMPLIANCE**
- Layer Architecture created but NOT followed
- Component size violations (10+ components exceed 120-line limit)
- State management fragmented across two locations
- Application Layer mostly empty
- Documentation missing (ADRs, API contracts, schemas)

**Target State**: ✅ **FULL COMPLIANCE**
- Clean Layer Architecture implementation
- All components <120 lines
- Consolidated state management
- Complete Application Layer
- Comprehensive documentation

**Business Value**:
- Maintainable codebase
- Scalable architecture
- Clear separation of concerns
- Testable code
- Developer productivity

---

## Background

### Problem Statement

The Sprint Change Proposal defined a comprehensive Layer Architecture for the Via-Gent project. While the directory structure was created (`src/application/`, `src/infrastructure/`, `src/presentation/`), the codebase has NOT been migrated to follow this architecture.

**Critical Issues**:
1. Components remain in old flat structure (`src/components/`)
2. Components violate size limits (316 lines vs 120 limit)
3. Business logic scattered in components (no Application Layer)
4. State management in two locations (confusing)
5. No documentation (ADRs, API contracts, schemas)

### Impact

**Technical Debt**: HIGH
- Code is hard to maintain
- Components are hard to test
- Business logic is hard to reuse
- Architecture is confusing

**Business Risk**: HIGH
- Developer velocity slowed
- Onboarding difficult
- Bugs harder to fix
- Scaling blocked

---

## Epic Scope

### In Scope ✅

1. **Layer Architecture Compliance**: Migrate all code to follow Layer Architecture
2. **Component Size Compliance**: Split all components >120 lines
3. **Application Layer**: Create use cases for all major workflows
4. **State Management**: Consolidate to infrastructure/persistence/
5. **Documentation**: Create ADRs, API contracts, schemas

### Out of Scope ❌

1. New features (this is remediation only)
2. Performance optimization (unless critical)
3. UI/UX redesign (unless needed for compliance)
4. Database schema changes (unless needed for architecture)
5. Third-party integrations (unless needed)

---

## Remediation Phases

### Phase 1: Layer Architecture Compliance

**Priority**: P0 (CRITICAL)
**Estimated Time**: 40-60 hours
**Dependencies**: None

**Objective**: Migrate all code to follow Sprint Change Proposal Layer Architecture.

#### Story 1.1: Migrate All Components to Presentation Layer

**Acceptance Criteria**:
- [ ] All components moved from `src/components/` to `src/presentation/components/`
- [ ] Organized by workspace (ide/, knowledge/, project/)
- [ ] All imports updated
- [ ] All tests passing
- [ ] Old `src/components/` directory removed

**Files to Migrate**:
- `src/components/agent/` → `src/presentation/components/agent/`
- `src/components/chat/` → `src/presentation/components/chat/`
- `src/components/ide/` → `src/presentation/components/ide/`
- `src/components/ui/` → `src/presentation/components/ui/`
- `src/components/layout/` → `src/presentation/components/layout/`

**Estimated Time**: 8-12 hours

#### Story 1.2: Split Oversized Components

**Acceptance Criteria**:
- [ ] `AgentChatPanel.tsx` (316 lines) → 3 components (<120 lines each)
- [ ] `BentoGrid.tsx` (275 lines) → 3 components (<120 lines each)
- [ ] `XTerminal.tsx` (275 lines) → 3 components (<120 lines each)
- [ ] `IconSidebar.tsx` (270 lines) → 3 components (<120 lines each)
- [ ] `FeatureSearch.tsx` (262 lines) → 3 components (<120 lines each)
- [ ] `CommandPalette.tsx` (221 lines) → 2 components (<120 lines each)
- [ ] All other components >120 lines split
- [ ] All tests passing after splits

**Splitting Strategy**:
- Extract sub-components
- Move logic to custom hooks
- Use composition
- Follow Single Responsibility Principle

**Estimated Time**: 20-30 hours

#### Story 1.3: Remove Old Component Structure

**Acceptance Criteria**:
- [ ] `src/components/` directory completely removed
- [ ] All imports pointing to old locations updated
- [ ] No broken imports
- [ ] All tests passing

**Estimated Time**: 2-4 hours

#### Story 1.4: Create Application Layer Use Cases

**Acceptance Criteria**:
- [ ] `CreateAgentUseCase` - Agent creation workflow
- [ ] `UpdateAgentUseCase` - Agent update workflow
- [ ] `DeleteAgentUseCase` - Agent deletion workflow
- [ ] `SelectAgentUseCase` - Agent selection workflow
- [ ] `ConfigureProviderUseCase` - Provider configuration workflow
- [ ] All use cases have tests
- [ ] Components use use cases (not direct logic)

**Estimated Time**: 10-14 hours

---

### Phase 2: State Management Consolidation

**Priority**: P0 (HIGH)
**Estimated Time**: 20-30 hours
**Dependencies**: Phase 1 complete

**Objective**: Consolidate all state management to infrastructure/persistence/.

#### Story 2.1: Consolidate Stores to Infrastructure Layer

**Acceptance Criteria**:
- [ ] All stores moved from `src/stores/` to `src/infrastructure/persistence/stores/`
- [ ] All imports updated
- [ ] All tests passing
- [ ] Old `src/stores/` directory removed

**Stores to Migrate**:
- `agents-store.ts`
- `agent-selection-store.ts`
- `conversation-threads-store.ts`
- `provider-models-store.ts`
- `auto-approve-store.ts`
- `openai-compatible-store.ts`
- `prompt-enhancement-store.ts`

**Estimated Time**: 4-6 hours

#### Story 2.2: Create Global Stores (Cross-Workspace)

**Acceptance Criteria**:
- [ ] `useProviderStore` - LLM provider configuration
- [ ] `useAgentStore` - Agent configuration
- [ ] `useConfigStore` - Application configuration
- [ ] All stores have tests
- [ ] All stores documented

**Estimated Time**: 6-8 hours

#### Story 2.3: Create Workspace-Specific Stores

**Acceptance Criteria**:
- [ ] `useIDEStore` - IDE workspace state
- [ ] `useKnowledgeStore` - Knowledge synthesis state
- [ ] `useProjectStore` - Project management state
- [ ] All stores have tests
- [ ] All stores documented

**Estimated Time**: 6-8 hours

#### Story 2.4: Implement Event Bus for Cross-Workspace Communication

**Acceptance Criteria**:
- [ ] Event bus infrastructure created
- [ ] Inter-workspace messaging working
- [ ] Event types defined
- [ ] Event handlers documented
- [ ] Event bus has tests

**Estimated Time**: 4-8 hours

---

### Phase 3: Agent Configuration System

**Priority**: P1 (HIGH)
**Estimated Time**: 15-25 hours
**Dependencies**: Phase 1, Phase 2 complete

**Objective**: Centralize and standardize agent configuration management.

#### Story 3.1: Centralize Agent Configuration Vault

**Acceptance Criteria**:
- [ ] Single source of truth for agent configuration
- [ ] All configuration goes through vault
- [ ] Reactive updates working
- [ ] Hotload consistency verified
- [ ] All tests passing

**Estimated Time**: 6-10 hours

#### Story 3.2: Implement Workspace-Specific Agent Binding

**Acceptance Criteria**:
- [ ] Agents can be bound to specific workspaces
- [ ] Workspace binding UI working
- [ ] Binding validation in place
- [ ] Only available agents shown per workspace
- [ ] All tests passing

**Estimated Time**: 5-8 hours

#### Story 3.3: Add Configuration Validation Layer

**Acceptance Criteria**:
- [ ] Validation before save (UI layer)
- [ ] Validation before persist (store layer)
- [ ] Clear error messages
- [ ] Validation documented
- [ ] All tests passing

**Estimated Time**: 4-7 hours

---

### Phase 4: Conversation Management System

**Priority**: P1 (MEDIUM)
**Estimated Time**: 20-30 hours
**Dependencies**: Phase 1, Phase 2, Phase 3 complete

**Objective**: Implement comprehensive conversation and thread management.

#### Story 4.1: Implement Thread Hierarchy

**Acceptance Criteria**:
- [ ] Threads can be created
- [ ] Threads can be renamed
- [ ] Threads can be archived
- [ ] Threads can be deleted
- [ ] Thread hierarchy UI working
- [ ] All tests passing

**Estimated Time**: 8-12 hours

#### Story 4.2: Add Context Window Management

**Acceptance Criteria**:
- [ ] Context window tracking working
- [ ] Automatic summarization implemented
- [ ] Context pruning working
- [ ] Token counting accurate
- [ ] All tests passing

**Estimated Time**: 6-10 hours

#### Story 4.3: Create Archival System

**Acceptance Criteria**:
- [ ] Conversations can be archived
- [ ] Archived conversations retrievable
- [ ] Archive search working
- [ ] Archive UI working
- [ ] All tests passing

**Estimated Time**: 6-8 hours

---

### Phase 5: Documentation

**Priority**: P1 (MEDIUM)
**Estimated Time**: 15-25 hours
**Dependencies**: All previous phases complete

**Objective**: Create comprehensive documentation for the architecture.

#### Story 5.1: Create Architecture Decision Records (ADRs)

**Acceptance Criteria**:
- [ ] ADR for Layer Architecture decision
- [ ] ADR for State Management approach
- [ ] ADR for Component Organization
- [ ] ADR for Cross-Workspace Communication
- [ ] ADRs follow ADR template
- [ ] All ADRs reviewed and approved

**Estimated Time**: 5-8 hours

#### Story 5.2: Document API Contracts

**Acceptance Criteria**:
- [ ] All use case interfaces documented
- [ ] All store interfaces documented
- [ ] All service interfaces documented
- [ ] API contracts follow template
- [ ] All contracts reviewed and approved

**Estimated Time**: 4-6 hours

#### Story 5.3: Create Schema Definitions

**Acceptance Criteria**:
- [ ] Database schema documented
- [ ] Entity relationships documented
- [ ] Store state shapes documented
- [ ] Schema diagrams created
- [ ] All schemas reviewed and approved

**Estimated Time**: 3-5 hours

#### Story 5.4: Write State Management Guide

**Acceptance Criteria**:
- [ ] Store organization documented
- [ ] Data flow documented
- [ ] Best practices documented
- [ ] Usage examples provided
- [ ] Guide reviewed and approved

**Estimated Time**: 3-6 hours

---

## Success Criteria

### Epic Complete When:

- [ ] All components in `src/presentation/components/`
- [ ] All components <120 lines
- [ ] All stores in `src/infrastructure/persistence/stores/`
- [ ] Application Layer use cases created
- [ ] Event bus implemented
- [ ] Agent configuration centralized
- [ ] Thread management implemented
- [ ] ADRs created (5+)
- [ ] API contracts documented
- [ ] Schema definitions documented
- [ ] All tests passing (100%)
- [ ] Zero regressions

---

## Risk Management

### High Risk Areas:

1. **Component Splitting** (Risk: Breaking functionality)
   - **Mitigation**: Comprehensive test coverage before splitting
   - **Mitigation**: Split incrementally, test each split

2. **Store Migration** (Risk: Breaking state)
   - **Mitigation**: Migrate one store at a time
   - **Mitigation**: Run tests after each migration

3. **Application Layer Creation** (Risk: Incomplete abstraction)
   - **Mitigation**: Start with simple use cases
   - **Mitigation**: Iterate based on usage

### Risk Mitigation Strategy:

1. **Incremental Approach**: One story at a time
2. **Test First**: Write tests before changes
3. **Continuous Validation**: Run tests after each change
4. **Rollback Plan**: Git after each story completion

---

## Implementation Order

### Sequential (Recommended):

1. **Phase 1** (Layer Architecture) - MUST BE FIRST
2. **Phase 2** (State Management) - Depends on Phase 1
3. **Phase 3** (Agent Configuration) - Depends on Phase 1, 2
4. **Phase 4** (Conversation Management) - Depends on Phase 1, 2, 3
5. **Phase 5** (Documentation) - Depends on all previous phases

### Parallel Opportunities:

- **Phase 1.2** (Component Splitting) - Can be done in parallel per component
- **Phase 2.2 & 2.3** (Store Creation) - Can be done in parallel
- **Phase 5.1-5.4** (Documentation) - Can be done in parallel after phases complete

---

## Validation Gates

### After Each Phase:

1. **Code Review**: All changes reviewed
2. **Test Coverage**: 100% coverage maintained
3. **Architecture Review**: Compliance with Layer Architecture
4. **Performance**: No performance regression
5. **Documentation**: Documentation updated

### After Epic:

1. **End-to-End Testing**: Full system testing
2. **Sprint Change Proposal Compliance**: 100% compliance verified
3. **Technical Debt Assessment**: Debt reduced by >80%
4. **Developer Feedback**: Team satisfied with new architecture

---

## Glossary

**Layer Architecture**: Separation of concerns into Presentation, Application, Domain, and Infrastructure layers.

**Use Case**: Application Layer orchestration of a workflow (e.g., CreateAgentUseCase).

**Store**: Zustand state management container.

**Event Bus**: Message passing system for cross-workspace communication.

**Hotload**: Configuration changes reflecting immediately without application restart.

---

## Appendix

### A. Component Splitting Examples

**Before** (AgentChatPanel.tsx - 316 lines):
```tsx
// Single large component with all logic
export function AgentChatPanel() {
    // 316 lines of mixed concerns
}
```

**After** (3 components):
```tsx
// Main component (orchestration only)
export function AgentChatPanel() { /* 80 lines */ }

// Sub-component (message handling)
export function MessageList() { /* 100 lines */ }

// Sub-component (approval UI)
export function ApprovalButtons() { /* 80 lines */ }
```

### B. Use Case Example

**Before** (logic in component):
```tsx
// Component has business logic
function AgentConfigDialog() {
    const handleSave = () => {
        // Direct store manipulation
        addAgent(agentData);
    };
}
```

**After** (logic in use case):
```tsx
// Use case orchestrates
class CreateAgentUseCase {
    execute(agentData: AgentCreateParams): Agent {
        // Validation
        // Transformation
        // Persistence
        // Notification
    }
}

// Component uses use case
function AgentConfigDialog() {
    const createAgent = useCreateAgentUseCase();

    const handleSave = () => {
        createAgent.execute(agentData);
    };
}
```

---

**Epic Created**: 2025-12-31 14:55:00+07:00
**Epic Owner**: BMAD Master (bmad-core-bmad-master mode)
**Status**: 🚨 **READY TO BEGIN**
**Next Action**: Begin Phase 1, Story 1.1

---

**Signature**: _Master Epic - Sprint Change Proposal Compliance_
