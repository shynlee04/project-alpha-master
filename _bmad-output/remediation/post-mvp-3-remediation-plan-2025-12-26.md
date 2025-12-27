# Post-MVP-3 Remediation Plan

**Document ID**: REM-2025-12-26-004
**Created**: 2025-12-26T22:20:00+00:00
**Author**: BMAD PM (bmad-bmm-pm)
**Status**: ✅ COMPLETE

---

## Executive Summary

**Purpose**: Plan remediation of deferred issues after MVP-3 E2E verification
**Total Deferred Issues**: 23 (state refactoring, component cleanup, naming violations)
**Timeline**: Week 4-8 (after MVP-3 E2E completion)
**Total Effort**: 56 hours

---

## Deferred Issues Overview

### State Refactoring (P1 - Deferred)

**Issue**: P0-AI-001 - Duplicate state in IDELayout
**Status**: Deferred to avoid MVP-3 interference
**Impact**: State duplication causes sync issues and bugs
**Reference**: [State Management Audit P1.10](../state-management-audit-p1.10-2025-12-26.md)

**Refactoring Plan**:
1. Replace duplicated state in [`IDELayout.tsx`](src/components/layout/IDELayout.tsx) with Zustand hooks
2. Add local `fileContentCache` Map for ephemeral file content
3. Update [`useIDEFileHandlers`](src/components/layout/hooks/useIDEFileHandlers.ts) to work with Zustand actions
4. Remove duplicate state synchronization code

**Estimated Effort**: 8 hours

---

## Component Cleanup (P2)

### P2-CMP-001: Component Storybook

**Issue**: No component storybook for visual testing
**Impact**: Difficult to test components in isolation
**Owner**: BMAD Dev
**Estimated Effort**: 8 hours

**Implementation Steps**:
1. Install Storybook: `pnpm dlx storybook`
2. Configure Storybook for Vite + TanStack Router
3. Create stories for all complex components
4. Add storybook build to CI/CD pipeline

### P2-CMP-002: Component Design System

**Issue**: No component design system documentation
**Impact**: Inconsistent component patterns and styling
**Owner**: BMAD UX Designer
**Estimated Effort**: 12 hours

**Implementation Steps**:
1. Audit existing component patterns
2. Define design system principles
3. Create design system documentation
4. Document component variants and patterns

### P2-CMP-003: Component Testing Strategy

**Issue**: No component testing strategy
**Impact**: Unclear testing approach and coverage goals
**Owner**: BMAD TEA
**Estimated Effort**: 6 hours

**Implementation Steps**:
1. Define testing strategy (unit, integration, E2E)
2. Set coverage targets
3. Document testing approach
4. Create testing guidelines

### P2-CMP-004: Component Performance Monitoring

**Issue**: No component performance monitoring
**Impact**: Cannot detect performance regressions
**Owner**: BMAD Dev
**Estimated Effort**: 6 hours

**Implementation Steps**:
1. Set up performance monitoring (Lighthouse, Web Vitals)
2. Create performance benchmarks
3. Add performance regression detection
4. Document performance targets

### P2-CMP-005: Component Accessibility Testing

**Issue**: No component accessibility testing
**Impact**: Risk of accessibility violations
**Owner**: BMAD Dev
**Estimated Effort**: 4 hours

**Implementation Steps**:
1. Audit components for accessibility issues
2. Add ARIA labels and keyboard navigation
3. Test with screen readers
4. Document accessibility guidelines

### P2-CMP-006: Component Error Recovery Testing

**Issue**: No component error recovery testing
**Impact**: Errors may crash the application
**Owner**: BMAD Dev
**Estimated Effort**: 4 hours

**Implementation Steps**:
1. Add error boundaries to components
2. Test error recovery scenarios
3. Document error recovery patterns
4. Create error recovery guidelines

### P2-CMP-007: Component Error Logging

**Issue**: No component error logging
**Impact**: Difficult to debug errors
**Owner**: BMAD Dev
**Estimated Effort**: 3 hours

**Implementation Steps**:
1. Add error logging to components
2. Log error context and stack traces
3. Integrate with error monitoring
4. Document error logging patterns

### P2-CMP-008: Component Error Monitoring

**Issue**: No component error monitoring
**Impact**: Cannot track error rates and patterns
**Owner**: BMAD Dev
**Estimated Effort**: 3 hours

**Implementation Steps**:
1. Set up error monitoring dashboard
2. Create error alerts and notifications
3. Track error rates and trends
4. Document error monitoring approach

### P2-CMP-009: Component Error Reporting

**Issue**: No component error reporting system
**Impact**: Users cannot easily report errors
**Owner**: BMAD Dev
**Estimated Effort**: 3 hours

**Implementation Steps**:
1. Create error reporting UI
2. Add error submission form
3. Integrate with error monitoring
4. Document error reporting process

### P2-CMP-010: Component Error Recovery Automation

**Issue**: No automated error recovery
**Impact**: Manual intervention required for errors
**Owner**: BMAD Dev
**Estimated Effort**: 4 hours

**Implementation Steps**:
1. Define automated recovery strategies
2. Implement recovery logic
3. Test recovery scenarios
4. Document recovery automation

---

## Naming Violations (P2)

### P2-NAM-001: Component Naming Conventions

**Issue**: Inconsistent component naming
**Impact**: Difficult to understand component purpose
**Owner**: BMAD Dev
**Estimated Effort**: 4 hours

**Implementation Steps**:
1. Audit component names for violations
2. Define naming conventions
3. Rename components to follow conventions
4. Update imports and references

### P2-NAM-002: File Naming Conventions

**Issue**: Inconsistent file naming
**Impact**: Difficult to find files
**Owner**: BMAD Dev
**Estimated Effort**: 2 hours

**Implementation Steps**:
1. Audit file names for violations
2. Define file naming conventions
3. Rename files to follow conventions
4. Update imports and references

---

## Execution Timeline

### Week 4: State Refactoring (8 hours)

| Day | Task | Owner | Dependencies | Output |
|------|-------|--------------|--------|
| Day 1 | P0-AI-001: Refactor IDELayout state | BMAD Dev | None | IDELayout uses Zustand hooks |
| Day 2 | P0-AI-001: Update useIDEFileHandlers | BMAD Dev | Day 1 | Handlers work with Zustand |
| Day 3 | P0-AI-001: Add file content cache | BMAD Dev | Day 2 | Local cache for file content |
| Day 4 | P0-AI-001: Remove duplicate sync code | BMAD Dev | Day 3 | Clean state synchronization |

### Week 5-6: Component Cleanup (40 hours)

| Week | Tasks | Owner | Dependencies | Output |
|------|---------|--------------|--------|
| Week 5 | P2-CMP-001: Storybook setup | BMAD Dev | None | Storybook configured |
| Week 5 | P2-CMP-002: Design system documentation | BMAD UX Designer | None | Design system documented |
| Week 5 | P2-CMP-003: Testing strategy | BMAD TEA | None | Testing strategy defined |
| Week 6 | P2-CMP-004: Performance monitoring | BMAD Dev | None | Performance monitoring set up |
| Week 6 | P2-CMP-005: Accessibility testing | BMAD Dev | P2-CMP-003 | Accessibility audit complete |
| Week 6 | P2-CMP-006: Error recovery testing | BMAD Dev | P2-CMP-005 | Error recovery tests written |
| Week 6 | P2-CMP-007: Error logging | BMAD Dev | P2-CMP-006 | Error logging implemented |
| Week 6 | P2-CMP-008: Error monitoring | BMAD Dev | P2-CMP-007 | Error monitoring dashboard |
| Week 6 | P2-CMP-009: Error reporting | BMAD Dev | P2-CMP-008 | Error reporting UI |
| Week 6 | P2-CMP-010: Error recovery automation | BMAD Dev | P2-CMP-009 | Automated recovery |

### Week 7: Naming Violations (6 hours)

| Week | Tasks | Owner | Dependencies | Output |
|------|---------|--------------|--------|
| Week 7 | P2-NAM-001: Component naming | BMAD Dev | None | Components renamed |
| Week 7 | P2-NAM-002: File naming | BMAD Dev | None | Files renamed |

---

## Success Criteria

### State Refactoring
- [ ] IDELayout uses Zustand hooks (no local useState)
- [ ] useIDEFileHandlers works with Zustand actions
- [ ] File content cache implemented (ephemeral, not persisted)
- [ ] Duplicate state synchronization code removed
- [ ] No TypeScript errors
- [ ] No runtime errors

### Component Cleanup
- [ ] Storybook configured for all components
- [ ] Design system documented
- [ ] Testing strategy defined
- [ ] Performance monitoring set up
- [ ] Accessibility audit complete
- [ ] Error recovery tests written
- [ ] Error logging implemented
- [ ] Error monitoring dashboard created
- [ ] Error reporting UI implemented
- [ ] Automated recovery working

### Naming Violations
- [ ] Component naming audit complete
- [ ] Components renamed to follow conventions
- [ ] File naming audit complete
- [ ] Files renamed to follow conventions
- [ ] All imports updated
- [ ] No broken references

---

## Risk Assessment

### High Risk Items
1. **State Refactoring Complexity**: Refactoring IDELayout may introduce bugs
2. **Component Cleanup Scope**: 10 component issues require significant effort
3. **Naming Violations Impact**: Renaming may break references
4. **Timeline Pressure**: 56 hours over 4 weeks is aggressive

### Mitigation Strategies
1. **Incremental Delivery**: Deliver fixes in small batches
2. **Test Thoroughly**: Test each refactoring change before proceeding
3. **Backup Code**: Create backup branches before major refactoring
4. **Daily Sync**: Daily sync between PM, Dev, UX Designer, TEA

---

## Traceability

All deferred issues traceable to:
- [Remediation Prioritization Matrix](remediation-prioritization-matrix-2025-12-26.md)
- [Remediation Execution Roadmap](remediation-execution-roadmap-2025-12-26.md)
- [State Management Audit P1.10](../state-management-audit-p1.10-2025-12-26.md)
- [Technical Debt Component Inventory](../technical-dead/component-inventory-2025-12-26.md)
- [Technical Debt Naming Violations](../technical-dead/naming-violations-2025-12-26.md)
- [Governance Framework](../governance/GOVERNANCE-INDEX-2025-12-26.md)

---

## Dependencies

### Pre-Requisites
- [ ] MVP-3 E2E verification complete
- [ ] All 8 blocking P0 issues resolved
- [ ] Sprint status consolidated with acceptance criteria
- [ ] E2E verification gate enforced

### Blocking Dependencies
- [ ] P0-CMP-001 to P0-CMP-005: Component documentation foundation
- [ ] P0-DOC-001 to P0-DOC-006: Documentation foundation
- [ ] P0-AI-001: State refactoring (deferred but planned)

---

## Notes

### Why Deferred
State refactoring deferred to avoid MVP-3 interference:
- Risk of introducing bugs during critical MVP-3 E2E verification
- Focus on unblocking MVP-3 first
- Refactor after MVP-3 completes successfully

### MCP Research Protocol Compliance
All deferred features must follow:
- [ ] Context7: Library documentation queried
- [ ] Deepwiki: Repo wikis checked
- [ ] Tavily/Exa: 2025 best practices researched
- [ ] Repomix: Codebase structure analyzed

### Post-MVP-3 Priority
After MVP-3 E2E completion, prioritize:
1. State refactoring (P0-AI-001) - 8 hours
2. Component cleanup (P2-CMP-001 to P2-CMP-010) - 40 hours
3. Naming violations (P2-NAM-001 to P2-NAM-002) - 6 hours

### Integration with Future Epics
Post-MVP-3 remediation supports:
- Epic 29: Agentic Execution Loop (state refactoring)
- Epic 30: Component Architecture (component cleanup)
- Epic 31: Documentation (naming conventions)
