# Architecture Remediation Module

**Module ID**: `architecture-remediation`
**Version**: 1.0.0
**Created**: 2026-01-03
**Status**: `ACTIVE`

## Module Overview

Dedicated BMAD module for systematic execution of Project Alpha's course correction plan to address critical technical debt and improve platform health from **3.8/10** to **8.8/10**.

### Course Correction Trigger

**Finding**: Ralph Loop Cycle 18 governance misalignment discovered
- **Previous Claim**: Health Score 100/100 ✅ (Iteration 177)
- **ACTUAL REALITY**: Health Score ~3.8% (5.9% with partial fixes)
- **TypeScript Errors**: 1,172 remaining (306 production + 866 test)
- **File Size Violations**: 45 files exceed 300-line limit
- **God Stores**: 69 god stores (>300 lines) identified
- **Test Coverage**: 16.6% (target: 80%)

**Decision**: ✅ IMMEDIATE COURSE CORRECTION APPROVED

## Module Purpose

Execute systematic 8-week stabilization plan across 5 phases:

### Phase 0: Foundation Stabilization (Week 1-2)
**Duration**: 42-48 hours
**Priority**: P0 - CRITICAL

- **TS-001**: Fix TypeScript Errors (6-8 hours) - Reduce from 1,172 to <100
- **DB-001**: Safe IndexedDB Operations (18-22 hours) - Add quota handling
- **UI-001**: Extract AgentConfigDialog Hooks (16-20 hours) - 1,089 → <300 lines

### Phase 1: Store Refactoring (Week 3-4)
**Duration**: 100-130 hours
**Priority**: P0 - CRITICAL

- Epic CC-1: Conversation Consolidation (15 stories, 127 hours)
- Epic CP-1: Project Consolidation (18 stories, 80-100 hours)
- Epic AC-1: Agent Configuration Consolidation (8 stories, 42 hours)

### Phase 2: Infrastructure Hardening (Week 5-6)
**Duration**: 80-100 hours
**Priority**: P1 - HIGH

- IndexedDB quota management
- Error boundary coverage
- Silent failure elimination
- Infrastructure resilience

### Phase 3: Architecture Transformation (Week 7-8)
**Duration**: 60-80 hours
**Priority**: P1 - HIGH

- Four-layer clean architecture implementation
- Domain service extraction
- Event-driven orchestration
- API boundary consolidation

## Module Scope

### In Scope

1. **State Management Refactoring**
   - 69 god stores → modular slices (target: ≤120 lines per store)
   - 25 duplicated stores → consolidated single source of truth
   - Circular dependency elimination
   - Zustand v5 best practices enforcement

2. **Component Size Normalization**
   - 45 components >300 lines → ≤300 lines
   - God component elimination (worst: 1,595 lines)
   - Hook extraction for complex logic
   - Component composition patterns

3. **TypeScript Error Remediation**
   - 1,172 errors → <10 errors
   - Strict type enforcement
   - `any` type elimination
   - Import path cleanup

4. **Infrastructure Hardening**
   - IndexedDB quota handling (prevent data loss)
   - Error boundary coverage (100% for critical paths)
   - Silent failure elimination (23 instances)
   - Graceful degradation patterns

5. **Test Coverage Improvement**
   - 16.6% → 80% coverage
   - Unit tests for all business logic
   - Integration tests for cross-boundary operations
   - E2E tests for critical user journeys

### Out of Scope

- New feature development (deferred to Phase 4)
- UX/UI redesign (deferred to Epic 23)
- Performance optimization (deferred to Epic 22)
- Documentation updates (batched after every 3-4 stories)

## Module Structure

```
_bmad/modules/architecture-remediation/
├── README.md (this file)
├── agents/
│   ├── store-refactorer.md (god store elimination specialist)
│   ├── component-splitter.md (component size normalization specialist)
│   ├── typescript-fixer.md (TS error remediation specialist)
│   └── test-writer.md (test coverage improvement specialist)
├── workflows/
│   ├── eliminate-god-stores.md (systematic store refactoring)
│   ├── normalize-components.md (component size reduction)
│   ├── fix-typescript-errors.md (batch TS error fixing)
│   └── improve-test-coverage.md (test writing workflow)
├── config/
│   ├── thresholds.yaml (line limits, complexity limits)
│   └── priorities.yaml (P0/P1/P2/P3 categorization)
└── artifacts/
    ├── epic-tracking.md (epic progress dashboard)
    └── validation-gates.md (acceptance criteria checklists)
```

## Critical Success Factors

### 1. Zero Shortcuts
- Every epic fully executed (no partial completion)
- All acceptance criteria met (no "good enough")
- All tests passing (no skipping tests)
- Documentation updated (no "I'll do it later")

### 2. Strict Validation
- Story completion requires 100% acceptance criteria met
- Epic completion requires all stories done
- Phase completion requires all epics done
- Zero regression (no new bugs introduced)

### 3. Quality Gates
- TypeScript check: `pnpm tsc --noEmit` (zero new errors)
- Lint check: `pnpm lint` (zero warnings)
- Test check: `pnpm test` (100% pass rate)
- Coverage check: `pnpm test -- --coverage` (≥80%)

### 4. Documentation Hygiene
- Update CLAUDE.md after every 3-4 stories
- Update epic tracking after every story
- Create completion reports for every epic
- Archive handoff artifacts for reference

## Success Criteria

### Quantitative Targets

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Health Score** | 3.8/10 | 8.8/10 | 🔴 P0 |
| **TypeScript Errors** | 1,172 | <10 | 🔴 P0 |
| **God Stores** | 69 (25 duplicated) | 0 | 🔴 P0 |
| **Components >300 lines** | 45 | 0 | 🔴 P0 |
| **Test Coverage** | 16.6% | ≥80% | 🔴 P0 |
| **Circular Dependencies** | 4 high-risk cycles | 0 | 🟡 P1 |
| **Silent Failures** | 23 instances | 0 | 🟡 P1 |

### Qualitative Targets

- ✅ Zero data loss scenarios (IndexedDB safe operations)
- ✅ Zero silent failures (explicit error handling)
- ✅ Zero breaking changes (backwards compatibility maintained)
- ✅ Zero technical debt shortcuts (proper architecture patterns)
- ✅ Zero regression bugs (all existing functionality preserved)

## Module Usage

### For Orchestrators (@bmad-core-bmad-master)

```bash
# Initialize module execution
@bmad/modules/architecture-remediation:initialize
# → Creates epic tracking, sets up validation gates

# Execute phase
@bmad/modules/architecture-remediation:execute-phase
# → Runs all epics in phase, validates completion

# Validate epic
@bmad/modules/architecture-remediation:validate-epic
# → Checks acceptance criteria, updates tracking

# Report status
@bmad/modules/architecture-remediation:status-report
# → Generates comprehensive progress report
```

### For Implementers (@bmad-bmm-dev)

```bash
# Start story
@bmad/modules/architecture-remediation/workflows/eliminate-god-stores
# → Executes workflow with validation gates

# Get acceptance criteria
@bmad/modules/architecture-remediation/artifacts/validation-gates
# → Returns checklist for current story

# Update tracking
@bmad/modules/architecture-remediation/artifacts/epic-tracking
# → Logs story completion, updates metrics
```

### For Quality Assurance (@bmad-bmm-tea)

```bash
# Validate story completion
@bmad/modules/architecture-remediation/agents/test-writer
# → Runs test suite, checks coverage

# Run regression tests
@bmad/modules/architecture-remediation:validate-no-regression
# → Ensures no breaking changes

# Generate quality report
@bmad/modules/architecture-remediation:quality-report
# → Coverage, error count, regression status
```

## Module Configuration

### Thresholds (config/thresholds.yaml)

```yaml
store:
  max_lines: 120
  max_functions: 10
  max_dependencies: 5

component:
  max_lines: 300
  max_functions: 15
  max_nesting_depth: 3
  max_parameters: 5

test_coverage:
  minimum: 80
  target: 85

typescript_errors:
  maximum: 10
  target: 0
```

### Priorities (config/priorities.yaml)

```yaml
P0: # Critical - Data loss or platform failure risk
  - TS-001: TypeScript Errors (1,172 → <100)
  - DB-001: IndexedDB Quota Handling
  - UI-001: AgentConfigDialog Hook Extraction

P1: # High - Maintainability collapse risk
  - Epic CC-1: Conversation Consolidation
  - Epic CP-1: Project Consolidation
  - Epic AC-1: Agent Configuration Consolidation

P2: # Medium - Technical debt accumulation
  - Component size normalization
  - Test coverage improvement

P3: # Low - Nice to have
  - Documentation updates
  - Code style consistency
```

## Module Agents

### 1. Store Refactorer (agents/store-refactorer.md)
**Specialization**: God store elimination and modularization
**Capabilities**:
- Analyze store dependencies and circular references
- Extract store slices following Zustand v5 patterns
- Implement migration paths with zero breaking changes
- Create facades for backwards compatibility

### 2. Component Splitter (agents/component-splitter.md)
**Specialization**: Component size normalization and hook extraction
**Capabilities**:
- Identify composition opportunities in large components
- Extract custom hooks for complex logic
- Create modular sub-components
- Maintain API compatibility during refactoring

### 3. TypeScript Fixer (agents/typescript-fixer.md)
**Specialization**: Batch TypeScript error remediation
**Capabilities**:
- Categorize errors by type and severity
- Fix common patterns (missing imports, wrong types, circular deps)
- Enforce strict typing (eliminate `any`)
- Validate fixes with compilation check

### 4. Test Writer (agents/test-writer.md)
**Specialization**: Test coverage improvement and quality assurance
**Capabilities**:
- Write unit tests for business logic
- Write integration tests for cross-boundary operations
- Achieve ≥80% coverage target
- Validate no regression with test suites

## Module Workflows

### 1. Eliminate God Stores (workflows/eliminate-god-stores.md)
**Purpose**: Systematic refactoring of 69 god stores into modular slices
**Steps**:
1. Analyze store dependencies and identify circular references
2. Extract focused slices (≤120 lines each)
3. Create migration path with backwards compatibility
4. Update all consumers to use new store
5. Delete old store (after verification)
6. Update documentation

### 2. Normalize Components (workflows/normalize-components.md)
**Purpose**: Reduce 45 components >300 lines to ≤300 lines
**Steps**:
1. Identify composition opportunities
2. Extract custom hooks for complex logic
3. Create modular sub-components
4. Maintain API compatibility
5. Validate functionality preserved
6. Update documentation

### 3. Fix TypeScript Errors (workflows/fix-typescript-errors.md)
**Purpose**: Reduce 1,172 TypeScript errors to <10
**Steps**:
1. Categorize errors by type and severity
2. Batch-fix common patterns (50-100 errors per session)
3. Validate fixes with `pnpm tsc --noEmit`
4. Regression test with `pnpm test`
5. Update error tracking

### 4. Improve Test Coverage (workflows/improve-test-coverage.md)
**Purpose**: Increase test coverage from 16.6% to ≥80%
**Steps**:
1. Identify untested critical paths
2. Write unit tests for business logic
3. Write integration tests for cross-boundary operations
4. Validate coverage with `pnpm test -- --coverage`
5. Maintain ≥80% coverage threshold

## Module Artifacts

### 1. Epic Tracking (artifacts/epic-tracking.md)
**Purpose**: Real-time dashboard of epic progress across all phases
**Contents**:
- Epic status (TODO, IN_PROGRESS, DONE)
- Story completion counts
- Hour burn rates
- Health score improvements

### 2. Validation Gates (artifacts/validation-gates.md)
**Purpose**: Acceptance criteria checklists for all epics and stories
**Contents**:
- Pre-validation checklist (before starting work)
- Completion checklist (before marking done)
- Post-validation checklist (after marking done)
- Regression prevention checklist

## Module Execution Timeline

### Week 1-2: Phase 0 - Foundation Stabilization
**Target**: 42-48 hours
**Deliverables**:
- TypeScript errors <100
- IndexedDB quota handling implemented
- AgentConfigDialog refactored to <300 lines

### Week 3-4: Phase 1 - Store Refactoring
**Target**: 100-130 hours
**Deliverables**:
- Epic CC-1 complete (Conversation Consolidation)
- Epic CP-1 complete (Project Consolidation)
- Epic AC-1 complete (Agent Configuration Consolidation)

### Week 5-6: Phase 2 - Infrastructure Hardening
**Target**: 80-100 hours
**Deliverables**:
- IndexedDB quota management
- Error boundary coverage (100% critical paths)
- Silent failure elimination

### Week 7-8: Phase 3 - Architecture Transformation
**Target**: 60-80 hours
**Deliverables**:
- Four-layer clean architecture
- Domain service extraction
- Event-driven orchestration
- API boundary consolidation

**Total Estimated Duration**: 282-358 hours (8 weeks)

## Module Governance

### Course Correction Trigger
If any of the following occur, trigger `-correct-course` workflow:
- Health score decreases (regression detected)
- TypeScript errors increase >10% (new debt introduced)
- Test coverage falls below 75% (quality degradation)
- God store count increases (re-introduction of technical debt)

### Validation Gates
Every story completion requires:
1. ✅ All acceptance criteria met (100%)
2. ✅ All tests passing (100% pass rate)
3. ✅ Zero new TypeScript errors
4. ✅ Zero regression bugs
5. ✅ Documentation updated (if story 3, 7, 11, etc.)

### Handoff Protocol
Story completion → Epic validation:
```yaml
story_id: "CC-1.1"
status: "DONE"
completion_time: "2026-01-03T14:30:00Z"
acceptance_criteria:
  - criterion_1: ✅ PASSED
  - criterion_2: ✅ PASSED
  - criterion_3: ✅ PASSED
validation_results:
  typescript_errors: 0
  test_pass_rate: 100
  test_coverage: 85
  regression_tests: PASSED
next_action: "Continue to Story CC-1.2"
```

## Module Success Validation

### Phase Completion Criteria
Each phase is complete when:
- ✅ All epics in phase marked DONE
- ✅ All acceptance criteria met (100%)
- ✅ Health score improved by ≥2.0 points
- ✅ Zero regression bugs introduced
- ✅ Documentation updated

### Module Completion Criteria
Module is complete when:
- ✅ All 4 phases executed
- ✅ Health score ≥8.8/10
- ✅ TypeScript errors <10
- ✅ Zero god stores (all files ≤120 lines for stores, ≤300 lines for components)
- ✅ Test coverage ≥80%
- ✅ Zero circular dependencies
- ✅ Zero silent failures

## Related Artifacts

### Course Correction Documents
- `_bmad-output/ralph-loop-cycle-18-gap-summary-2026-01-01.md`
- `_bmad-output/ralph-loop-cycle-18-correct-course-workflow-2026-01-01.md`
- `_bmad-output/ralph-loop-cycle-18-mcp-research-findings-2026-01-01.md`

### Epic Breakdowns
- `_bmad-output/research/platform-unification-2026-01-02/epic-cc-1-conversation-consolidation-breakdown.md`
- `_bmad-output/research/platform-unification-2026-01-02/epic-cp-1-project-consolidation-breakdown.md`
- `_bmad-output/sprint-artifacts/agent-config-consolidation-plan-2026-01-01.md`

### Architecture Documentation
- `_bmad-output/project-planning-artifacts/architecture.md`
- `_bmad-output/zustand-migration-plan-2026-01-01.md`
- `_bmad-output/zustand-patterns-guide-2026-01-01.md`

---

**Module Owner**: @bmad-core-bmad-master
**Module Maintainers**: @bmad-bmm-architect, @bmad-bmm-pm
**Last Updated**: 2026-01-03
**Module Status**: ACTIVE - READY FOR EXECUTION
