# Via-gent Technical Debt Register

**Document ID:** `docs/2025-12-23/tech-debt.md`  
**Version:** 1.0  
**Date:** 2025-12-23  
**Classification:** Internal  
**Target Audience:** Technical Leadership, Architects, Development Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Debt Classification Framework](#debt-classification-framework)
3. [Architecture Debt](#architecture-debt)
4. [Code Quality Debt](#code-quality-debt)
5. [Testing Debt](#testing-debt)
6. [Infrastructure Debt](#infrastructure-debt)
7. [Domain Semantics Debt](#domain-semantics-debt)
8. [Risk Summary](#risk-summary)
9. [Remediation Roadmap](#remediation-roadmap)

---

## Introduction

This document provides a comprehensive register of technical debt in the Via-gent codebase. Each debt item is categorized, assessed for risk, and includes a remediation strategy. This register serves as a living document to track technical debt and guide prioritization for future development efforts.

### Document Purpose

| Purpose | Description |
|---------|-------------|
| **Inventory** | Complete list of technical debt items |
| **Assessment** | Risk and impact evaluation |
| **Prioritization** | Guidance for remediation efforts |
| **Tracking** | Monitor debt reduction over time |

---

## Debt Classification Framework

### Risk Levels

| Level | Color | Description | Action Timeline |
|-------|-------|-------------|-----------------|
| **Critical** | 🔴 | Immediate business impact or security risk | Within 1 sprint |
| **High** | 🟠 | Significant impact on productivity or quality | Within 2-3 sprints |
| **Medium** | 🟡 | Moderate impact, manageable | Within 3-6 months |
| **Low** | 🟢 | Minor impact, low priority | Backlog |

### Debt Categories

| Category | Description |
|----------|-------------|
| **Architecture** | Structural issues, layer violations, design flaws |
| **Code Quality** | Duplication, complexity, maintainability issues |
| **Testing** | Missing tests, low coverage, test quality |
| **Infrastructure** | Build, deployment, monitoring gaps |
| **Domain Semantics** | Business logic issues, unclear requirements |

---

## Architecture Debt

### AD-001: God Context Pattern

| Property | Value |
|----------|-------|
| **ID** | AD-001 |
| **Title** | God Context Pattern in WorkspaceContext |
| **Location** | [`src/lib/workspace/WorkspaceContext.tsx`](../src/lib/workspace/WorkspaceContext.tsx:1) |
| **Category** | Architecture |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
[`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:1) exposes 13 state variables, 7 action functions, 3 refs, and an event bus in a single context value. This creates a "god context" that violates the Single Responsibility Principle and causes unnecessary re-renders.

**Impact:**
- Performance degradation due to unnecessary re-renders
- Difficult to test and maintain
- Tight coupling between components
- Violates layer separation (UI components directly access domain state)

**Remediation Strategy:**
1. **Phase 1:** Create sliced Zustand stores (Epic 27)
2. **Phase 2:** Migrate components to use specific stores
3. **Phase 3:** Remove WorkspaceContext for state management
4. **Phase 4:** Keep WorkspaceContext only for event bus

**Effort Estimate:** 8-12 story points  
**Related Epic:** Epic 27 (State Architecture Stabilization)

---

### AD-002: God Class - SyncManager

| Property | Value |
|----------|-------|
| **ID** | AD-002 |
| **Title** | God Class - SyncManager |
| **Location** | [`src/lib/filesystem/sync-manager.ts`](../src/lib/filesystem/sync-manager.ts:71) |
| **Category** | Architecture |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
[`SyncManager`](../src/lib/filesystem/sync-manager.ts:71) is a 463-line class with multiple responsibilities: file scanning, sync coordination, progress tracking, error handling, and event emission. This violates the Single Responsibility Principle.

**Impact:**
- Difficult to test individual concerns
- High cognitive load for developers
- Increased risk of bugs when making changes
- Tight coupling between sync concerns

**Remediation Strategy:**
1. Extract file scanning logic to `FileScanner` class
2. Extract progress tracking to `SyncProgressTracker` class
3. Extract error handling to `SyncErrorHandler` class
4. Keep SyncManager as coordinator only

**Effort Estimate:** 5-8 story points  
**Related Epic:** Future refactoring epic

---

### AD-003: Layer Violation in Components

| Property | Value |
|----------|-------|
| **ID** | AD-003 |
| **Title** | Layer Violation in Components |
| **Location** | Multiple IDE components |
| **Category** | Architecture |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
UI components directly access domain state and perform business logic, violating layer separation. Components should only handle presentation and delegate operations to application layer.

**Impact:**
- Tight coupling between UI and domain
- Difficult to reuse components
- Business logic scattered across components
- Hard to test business logic in isolation

**Remediation Strategy:**
1. Create service layer for business operations
2. Move business logic from components to services
3. Components only handle presentation and user interaction
4. Use hooks to bridge UI and service layer

**Effort Estimate:** 8-12 story points  
**Related Epic:** Future architecture cleanup

---

### AD-004: Singleton Pattern - WebContainer Manager

| Property | Value |
|----------|-------|
| **ID** | AD-004 |
| **Title** | Singleton Pattern - WebContainer Manager |
| **Location** | [`src/lib/webcontainer/manager.ts`](../src/lib/webcontainer/manager.ts:1) |
| **Category** | Architecture |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
[`WebContainerManager`](../src/lib/webcontainer/manager.ts:1) uses module-level singleton pattern with global variables (`instance`, `bootPromise`). This makes testing difficult and creates implicit dependencies.

**Impact:**
- Difficult to test in isolation
- Implicit dependencies across modules
- Cannot have multiple WebContainer instances
- Global state management issues

**Remediation Strategy:**
1. Convert singleton to dependency injection
2. Pass WebContainer instance through context
3. Allow multiple instances for testing
4. Remove global module variables

**Effort Estimate:** 5-8 story points  
**Related Epic:** Future refactoring epic

---

### AD-005: Missing Error Handling Abstraction

| Property | Value |
|----------|-------|
| **ID** | AD-005 |
| **Title** | Missing Error Handling Abstraction |
| **Location** | Multiple files |
| **Category** | Architecture |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
Error handling is inconsistent across the codebase. Some components use try-catch, others rely on event emission, and there's no centralized error handling strategy.

**Impact:**
- Inconsistent error reporting to users
- Difficult to track and debug errors
- No centralized error logging
- Poor user experience on errors

**Remediation Strategy:**
1. Create centralized error handler service
2. Define error handling patterns
3. Implement error boundary components
4. Integrate with Sentry for error tracking (Epic 22-4)

**Effort Estimate:** 5-8 story points  
**Related Epic:** Epic 22-4 (Configure Error Monitoring)

---

## Code Quality Debt

### CQ-001: Duplicate Persistence Implementations

| Property | Value |
|----------|-------|
| **ID** | CQ-001 |
| **Title** | Duplicate Persistence Implementations |
| **Location** | [`src/lib/workspace/project-store.ts`](../src/lib/workspace/project-store.ts:1) (idb), [`src/lib/state/dexie-db.ts`](../src/lib/state/dexie-db.ts:133) (Dexie) |
| **Category** | Code Quality |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
Two IndexedDB implementations coexist: legacy `idb`-based [`ProjectStore`](../src/lib/workspace/project-store.ts:1) and new Dexie.js-based [`ViaGentDatabase`](../src/lib/state/dexie-db.ts:133). This creates confusion and maintenance burden.

**Impact:**
- Confusion about which implementation to use
- Maintenance burden for two implementations
- Potential data inconsistency
- Increased bundle size

**Remediation Strategy:**
1. Complete migration to Dexie.js (Epic 27-1c)
2. Remove legacy idb implementation
3. Migrate data from legacy DB
4. Update all references to use Dexie

**Effort Estimate:** 5-8 story points  
**Related Epic:** Epic 27-1c (Persistence Migration to Dexie)

---

### CQ-002: Large Hook - useWorkspaceState

| Property | Value |
|----------|-------|
| **ID** | CQ-002 |
| **Title** | Large Hook - useWorkspaceState |
| **Location** | [`src/lib/workspace/hooks/useWorkspaceState.ts`](../src/lib/workspace/hooks/useWorkspaceState.ts:1) |
| **Category** | Code Quality |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
[`useWorkspaceState`](../src/lib/workspace/hooks/useWorkspaceState.ts:1) manages 13 state variables and 4 refs in a single hook, creating high coupling and cognitive load.

**Impact:**
- Difficult to understand and maintain
- High coupling between state variables
- Difficult to test individual state concerns
- Violates Single Responsibility Principle

**Remediation Strategy:**
1. Split into smaller, focused hooks
2. Group related state variables
3. Create hooks for specific concerns (e.g., `useProjectState`, `useSyncState`)
4. Migrate to Zustand stores (Epic 27)

**Effort Estimate:** 3-5 story points  
**Related Epic:** Epic 27 (State Architecture Stabilization)

---

### CQ-003: Untyped Event Payloads

| Property | Value |
|----------|-------|
| **ID** | CQ-003 |
| **Title** | Untyped Event Payloads |
| **Location** | [`src/lib/events/workspace-events.ts`](../src/lib/events/workspace-events.ts:1) |
| **Category** | Code Quality |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
Event payloads are defined as interfaces but the event emitter uses `any` type, losing type safety at runtime.

**Impact:**
- No compile-time type checking for event payloads
- Runtime type errors possible
- Poor IDE support for event handling
- Difficult to refactor event contracts

**Remediation Strategy:**
1. Create strongly-typed event emitter
2. Use TypeScript generics for event types
3. Add runtime type validation (Zod)
4. Update all event emitters and listeners

**Effort Estimate:** 5-8 story points  
**Related Epic:** Future type safety improvement

---

### CQ-004: Manual Permission Management

| Property | Value |
|----------|-------|
| **ID** | CQ-004 |
| **Title** | Manual Permission Management |
| **Location** | [`src/lib/filesystem/permission-lifecycle.ts`](../src/lib/filesystem/permission-lifecycle.ts:1) |
| **Category** | Code Quality |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
Permission lifecycle management is implemented with manual glue code that should be abstracted into a reusable service.

**Impact:**
- Code duplication across permission handling
- Difficult to test permission logic
- Inconsistent permission handling
- High cognitive load for developers

**Remediation Strategy:**
1. Create PermissionManager service
2. Centralize permission request logic
3. Implement permission caching
4. Add permission restoration on page reload

**Effort Estimate:** 3-5 story points  
**Related Epic:** Future refactoring epic

---

### CQ-005: Missing Validation Layer

| Property | Value |
|----------|-------|
| **ID** | CQ-005 |
| **Title** | Missing Validation Layer |
| **Location** | Multiple files |
| **Category** | Code Quality |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
There's no centralized validation layer. Input validation is scattered across components and services, leading to inconsistent validation logic.

**Impact:**
- Inconsistent validation across the application
- Potential security vulnerabilities
- Poor user experience on validation errors
- Difficult to maintain validation rules

**Remediation Strategy:**
1. Create centralized validation service using Zod
2. Define validation schemas for all inputs
3. Implement validation middleware
4. Add validation error handling

**Effort Estimate:** 5-8 story points  
**Related Epic:** Future quality improvement

---

## Testing Debt

### T-001: Low Test Coverage

| Property | Value |
|----------|-------|
| **ID** | T-001 |
| **Title** | Low Test Coverage |
| **Location** | Multiple files |
| **Category** | Testing |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
Test coverage is low across the codebase. Many critical components and services lack unit tests, increasing the risk of regressions.

**Impact:**
- High risk of regressions
- Difficult to refactor with confidence
- Bugs discovered late in development
- Poor code quality assurance

**Remediation Strategy:**
1. Establish coverage targets (80% minimum)
2. Add tests for critical paths (Epic 22-3)
3. Implement test-driven development for new features
4. Add coverage reporting to CI

**Effort Estimate:** 15-20 story points  
**Related Epic:** Epic 22-3 (Add Integration Tests)

---

### T-002: Missing Integration Tests

| Property | Value |
|----------|-------|
| **ID** | T-002 |
| **Title** | Missing Integration Tests |
| **Location** | N/A |
| **Category** | Testing |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
No integration tests exist for critical workflows like project open, file sync, and WebContainer boot. Unit tests don't catch integration issues.

**Impact:**
- Integration bugs discovered late
- No confidence in system behavior
- Difficult to test cross-component interactions
- Poor end-to-end quality assurance

**Remediation Strategy:**
1. Add integration tests for project open workflow
2. Add integration tests for file sync workflow
3. Add integration tests for WebContainer boot
4. Implement E2E tests with Playwright (future)

**Effort Estimate:** 10-15 story points  
**Related Epic:** Epic 22-3 (Add Integration Tests)

---

### T-003: No Performance Tests

| Property | Value |
|----------|-------|
| **ID** | T-003 |
| **Title** | No Performance Tests |
| **Location** | N/A |
| **Category** | Testing |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
No performance tests exist to ensure performance targets are met. Performance regressions can go undetected.

**Impact:**
- Performance regressions undetected
- No automated performance monitoring
- Difficult to measure performance improvements
- Poor user experience on performance issues

**Remediation Strategy:**
1. Define performance targets (Epic 22-6)
2. Add performance tests for critical operations
3. Implement Lighthouse CI in CI pipeline
4. Monitor performance metrics over time

**Effort Estimate:** 8-12 story points  
**Related Epic:** Epic 22-6 (Establish Performance Benchmarks)

---

## Infrastructure Debt

### I-001: No CI/CD Pipeline

| Property | Value |
|----------|-------|
| **ID** | I-001 |
| **Title** | No CI/CD Pipeline |
| **Location** | N/A |
| **Category** | Infrastructure |
| **Risk Level** | 🔴 Critical |
| **Status** | Active |

**Description:**
No automated CI/CD pipeline exists. All builds and deployments are manual, increasing the risk of human error and slowing down development.

**Impact:**
- Manual builds and deployments
- High risk of human error
- Slow feedback loop
- No automated testing on PRs

**Remediation Strategy:**
1. Set up GitHub Actions workflow (Epic 22-2)
2. Implement automated builds
3. Implement automated tests
4. Implement automated deployments to Netlify

**Effort Estimate:** 5-8 story points  
**Related Epic:** Epic 22-2 (Create CI/CD Pipeline)

---

### I-002: Missing Security Headers

| Property | Value |
|----------|-------|
| **ID** | I-002 |
| **Title** | Missing Security Headers |
| **Location** | Netlify configuration |
| **Category** | Infrastructure |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
Security headers are not configured in production. This exposes the application to security vulnerabilities.

**Impact:**
- Exposed to XSS attacks
- Exposed to clickjacking attacks
- Poor security posture
- Compliance issues

**Remediation Strategy:**
1. Implement security headers (Epic 22-1)
2. Add Content Security Policy
3. Add X-Frame-Options header
4. Add X-Content-Type-Options header

**Effort Estimate:** 2-3 story points  
**Related Epic:** Epic 22-1 (Implement Security Headers)

---

### I-003: No Error Monitoring

| Property | Value |
|----------|-------|
| **ID** | I-003 |
| **Title** | No Error Monitoring |
| **Location** | N/A |
| **Category** | Infrastructure |
| **Risk Level** | 🟠 High |
| **Status** | Active |

**Description:**
No error monitoring is configured. Errors in production are not tracked, making it difficult to debug and fix issues.

**Impact:**
- No visibility into production errors
- Difficult to debug production issues
- Poor user experience on errors
- No error trend analysis

**Remediation Strategy:**
1. Configure Sentry (Epic 22-4)
2. Add error tracking for all components
3. Add performance monitoring
4. Set up error alerts

**Effort Estimate:** 3-5 story points  
**Related Epic:** Epic 22-4 (Configure Error Monitoring)

---

### I-004: No Performance Monitoring

| Property | Value |
|----------|-------|
| **ID** | I-004 |
| **Title** | No Performance Monitoring |
| **Location** | N/A |
| **Category** | Infrastructure |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
No performance monitoring is configured. Performance regressions can go undetected in production.

**Impact:**
- No visibility into production performance
- Difficult to identify performance bottlenecks
- Poor user experience on performance issues
- No performance trend analysis

**Remediation Strategy:**
1. Add Web Vitals monitoring
2. Add performance metrics to Sentry
3. Implement Lighthouse CI
4. Set up performance alerts

**Effort Estimate:** 5-8 story points  
**Related Epic:** Epic 22-6 (Establish Performance Benchmarks)

---

## Domain Semantics Debt

### DS-001: Unused Dependencies

| Property | Value |
|----------|-------|
| **ID** | DS-001 |
| **Title** | Unused Dependencies |
| **Location** | [`package.json`](../package.json:1) |
| **Category** | Domain Semantics |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
Several dependencies are installed but not used, increasing bundle size and maintenance burden:
- `@tanstack/react-router-ssr-query` - SSR disabled
- `idb` - Replaced by Dexie.js
- `isomorphic-git` - Not implemented

**Impact:**
- Increased bundle size
- Maintenance burden
- Security vulnerabilities in unused packages
- Confusion about actual dependencies

**Remediation Strategy:**
1. Remove unused dependencies
2. Audit dependencies with `npm audit`
3. Update package.json
4. Test after removal

**Effort Estimate:** 1-2 story points  
**Related Epic:** Future cleanup

---

### DS-002: Inconsistent Naming Conventions

| Property | Value |
|----------|-------|
| **ID** | DS-002 |
| **Title** | Inconsistent Naming Conventions |
| **Location** | Multiple files |
| **Category** | Domain Semantics |
| **Risk Level** | 🟢 Low |
| **Status** | Active |

**Description:**
Naming conventions are inconsistent across the codebase. Some files use kebab-case, others use camelCase, and variable naming is inconsistent.

**Impact:**
- Confusing codebase
- Difficult to navigate
- Poor code readability
- Inconsistent mental model

**Remediation Strategy:**
1. Define naming conventions in AGENTS.md
2. Rename files to follow conventions
3. Rename variables to follow conventions
4. Update all references

**Effort Estimate:** 3-5 story points  
**Related Epic:** Future cleanup

---

### DS-003: Missing Documentation

| Property | Value |
|----------|-------|
| **ID** | DS-003 |
| **Title** | Missing Documentation |
| **Location** | Multiple files |
| **Category** | Domain Semantics |
| **Risk Level** | 🟡 Medium |
| **Status** | Active |

**Description:**
Many components and services lack documentation, making it difficult for new developers to understand the codebase.

**Impact:**
- Slow onboarding for new developers
- Difficult to understand complex code
- Knowledge silos
- Poor code maintainability

**Remediation Strategy:**
1. Add JSDoc comments to all public APIs
2. Add README files to major directories
3. Document complex algorithms
4. Create architecture diagrams

**Effort Estimate:** 8-12 story points  
**Related Epic:** Epic 17 (Open Source Documentation)

---

## Risk Summary

### Risk Distribution

| Risk Level | Count | Percentage |
|------------|-------|------------|
| 🔴 Critical | 1 | 6% |
| 🟠 High | 8 | 47% |
| 🟡 Medium | 8 | 47% |
| 🟢 Low | 0 | 0% |
| **Total** | 17 | 100% |

### Risk by Category

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Architecture | 0 | 2 | 3 | 0 | 5 |
| Code Quality | 0 | 2 | 3 | 0 | 5 |
| Testing | 0 | 2 | 1 | 0 | 3 |
| Infrastructure | 1 | 2 | 1 | 0 | 4 |
| Domain Semantics | 0 | 0 | 2 | 0 | 2 |

### Top 5 High-Priority Debt Items

| Rank | ID | Title | Risk | Effort |
|------|----|----|------|--------|
| 1 | I-001 | No CI/CD Pipeline | 🔴 Critical | 5-8 SP |
| 2 | AD-001 | God Context Pattern | 🟠 High | 8-12 SP |
| 3 | AD-005 | Missing Error Handling Abstraction | 🟠 High | 5-8 SP |
| 4 | CQ-001 | Duplicate Persistence Implementations | 🟠 High | 5-8 SP |
| 5 | CQ-003 | Untyped Event Payloads | 🟠 High | 5-8 SP |

---

## Remediation Roadmap

### Sprint 1-2: Critical Infrastructure (Epic 22)

| ID | Title | Priority | Effort | Epic |
|----|----|----------|--------|------|
| I-001 | No CI/CD Pipeline | P0 | 5-8 SP | Epic 22-2 |
| I-002 | Missing Security Headers | P0 | 2-3 SP | Epic 22-1 |
| I-003 | No Error Monitoring | P0 | 3-5 SP | Epic 22-4 |

**Goal:** Establish production-ready infrastructure with CI/CD, security, and monitoring.

---

### Sprint 3-4: State Architecture Migration (Epic 27)

| ID | Title | Priority | Effort | Epic |
|----|----|----------|--------|------|
| AD-001 | God Context Pattern | P0 | 8-12 SP | Epic 27 |
| CQ-001 | Duplicate Persistence Implementations | P0 | 5-8 SP | Epic 27-1c |
| CQ-002 | Large Hook - useWorkspaceState | P1 | 3-5 SP | Epic 27 |

**Goal:** Migrate to Zustand-based state management and Dexie.js persistence.

---

### Sprint 5-6: Testing & Quality (Epic 22)

| ID | Title | Priority | Effort | Epic |
|----|----|----------|--------|------|
| T-001 | Low Test Coverage | P0 | 15-20 SP | Epic 22-3 |
| T-002 | Missing Integration Tests | P0 | 10-15 SP | Epic 22-3 |
| T-003 | No Performance Tests | P1 | 8-12 SP | Epic 22-6 |
| I-004 | No Performance Monitoring | P1 | 5-8 SP | Epic 22-6 |

**Goal:** Establish comprehensive testing and performance monitoring.

---

### Sprint 7-8: Code Quality Improvements

| ID | Title | Priority | Effort | Epic |
|----|----|----------|--------|------|
| AD-005 | Missing Error Handling Abstraction | P1 | 5-8 SP | Future |
| CQ-003 | Untyped Event Payloads | P1 | 5-8 SP | Future |
| CQ-004 | Manual Permission Management | P2 | 3-5 SP | Future |
| CQ-005 | Missing Validation Layer | P2 | 5-8 SP | Future |

**Goal:** Improve code quality and type safety.

---

### Sprint 9-10: Architecture Cleanup

| ID | Title | Priority | Effort | Epic |
|----|----|----------|--------|------|
| AD-002 | God Class - SyncManager | P2 | 5-8 SP | Future |
| AD-003 | Layer Violation in Components | P2 | 8-12 SP | Future |
| AD-004 | Singleton Pattern - WebContainer Manager | P2 | 5-8 SP | Future |

**Goal:** Refactor architecture to improve maintainability.

---

### Sprint 11-12: Documentation & Cleanup

| ID | Title | Priority | Effort | Epic |
|----|----|----------|--------|------|
| DS-001 | Unused Dependencies | P2 | 1-2 SP | Future |
| DS-002 | Inconsistent Naming Conventions | P3 | 3-5 SP | Future |
| DS-003 | Missing Documentation | P2 | 8-12 SP | Epic 17 |

**Goal:** Improve codebase documentation and remove technical debt.

---

## Conclusion

This technical debt register identifies 17 debt items across 5 categories, with 1 critical, 8 high, and 8 medium priority items. The highest priority items are related to infrastructure (CI/CD, security, monitoring) and architecture (god context, state management).

The remediation roadmap provides a structured approach to addressing technical debt over 12 sprints, with clear priorities and effort estimates. Regular updates to this register will track progress and ensure technical debt remains manageable.

For detailed improvement opportunities and innovation suggestions, refer to the [`improvement-opportunities.md`](./improvement-opportunities.md) document.

---

## Document References

| Document | Location |
|----------|----------|
| **Project Overview** | [`project-overview.md`](./project-overview.md) |
| **Architecture** | [`architecture.md`](./architecture.md) |
| **Data & Contracts** | [`data-and-contracts.md`](./data-and-contracts.md) |
| **Tech Context** | [`tech-context.md`](./tech-context.md) |
| **Improvement Opportunities** | [`improvement-opportunities.md`](./improvement-opportunities.md) |
| **Roadmap** | [`roadmap-and-planning.md`](./roadmap-and-planning.md) |

---

**Document Owners:** Architecture Team  
**Review Cycle:** Monthly  
**Next Review:** 2025-01-23