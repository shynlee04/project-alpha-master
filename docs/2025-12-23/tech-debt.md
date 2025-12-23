# Tech Debt and Risk Diagnosis

**Analysis Date:** 2025-12-23  
**Project:** Via-gent Browser-Based IDE  
**Purpose:** Systematic assessment of code-level, architectural, and operational debt

---

## Table of Contents

1. [Architecture Debt](#architecture-debt)
2. [Code Quality Debt](#code-quality-debt)
3. [Testing Debt](#testing-debt)
4. [Infrastructure Debt](#infrastructure-debt)
5. [Domain Semantics Debt](#domain-semantics-debt)
6. [Risk Summary](#risk-summary)

---

## Architecture Debt

### ADR-001: State Management Transition Incomplete

**Location:** [`src/lib/workspace/WorkspaceContext.tsx`](../src/lib/workspace/WorkspaceContext.tsx), [`src/lib/state/dexie-db.ts`](../src/lib/state/dexie-db.ts)

**Description:**
The project is in the middle of migrating from TanStack Store to Zustand (Epic 27). Currently, both state management systems coexist:
- [`WorkspaceContext.tsx`](../src/lib/workspace/WorkspaceContext.tsx:82) uses React Context with 13 state variables
- [`dexie-db.ts`](../src/lib/state/dexie-db.ts:195) provides Dexie-based persistence
- [`ide-store.ts`](../src/lib/state/ide-store.ts) (inferred) provides Zustand stores

**Impact:**
- Increased complexity due to dual state systems
- Potential for state synchronization bugs
- Developer confusion about which system to use
- Increased bundle size (both systems included)

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Complete Epic 27 migration to Zustand
2. Remove TanStack Store dependencies
3. Consolidate state management to single source of truth
4. Update all components to use Zustand hooks

---

### ADR-002: Dual Persistence Layers

**Location:** [`src/lib/persistence/db.ts`](../src/lib/persistence/db.ts), [`src/lib/state/dexie-db.ts`](../src/lib/state/dexie-db.ts)

**Description:**
Two IndexedDB wrapper libraries are present:
- `idb` in [`db.ts`](../src/lib/persistence/db.ts) - Legacy compatibility layer
- `dexie` in [`dexie-db.ts`](../src/lib/state/dexie-db.ts) - New implementation (Epic 27-1c)

Both use the same database name `via-gent-persistence` but have different schemas.

**Impact:**
- Schema versioning confusion (idb uses version 3, Dexie uses version 3)
- Potential data corruption if both write to same DB
- Increased bundle size
- Maintenance burden

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Complete migration to Dexie (Epic 27-1c)
2. Remove `idb` dependency
3. Consolidate all persistence operations through Dexie
4. Add data migration script if needed

---

### ADR-003: Global Singleton Pattern Overuse

**Location:** [`src/lib/webcontainer/manager.ts`](../src/lib/webcontainer/manager.ts:36), [`src/lib/events/workspace-events.ts`](../src/lib/events/workspace-events.ts)

**Description:**
Multiple global singletons exist:
- WebContainer instance (module-level variable)
- Event bus (module-level variable)
- LocalFSAdapter singleton (exported as `localFS`)

**Impact:**
- Difficult to test (requires module mocking)
- No dependency injection
- Tight coupling between modules
- Cannot run multiple instances (e.g., for testing)

**Risk Level:** **Low-Medium**

**Remediation Strategy:**
1. Introduce dependency injection pattern
2. Pass instances through props or context
3. Consider using React Context for WebContainer
4. Add factory functions for testing

---

### ADR-004: Layer Violation in WorkspaceContext

**Location:** [`src/lib/workspace/WorkspaceContext.tsx`](../src/lib/workspace/WorkspaceContext.tsx:82)

**Description:**
[`WorkspaceContext`](../src/lib/workspace/WorkspaceContext.tsx:82) exposes both state and actions, mixing concerns:
- State: `projectMetadata`, `directoryHandle`, `syncStatus`, etc.
- Actions: `openFolder`, `switchFolder`, `syncNow`, etc.
- Refs: `localAdapterRef`, `syncManagerRef`, `eventBus`

**Impact:**
- Large context value (20+ properties)
- Difficult to optimize re-renders
- Violates separation of concerns
- Testing complexity

**Risk Level:** **Low**

**Remediation Strategy:**
1. Split into multiple contexts: `WorkspaceStateContext`, `WorkspaceActionsContext`
2. Use `useMemo` for actions
3. Consider Zustand for state management (Epic 27)

---

### ADR-005: Event Bus Coupling

**Location:** [`src/lib/events/workspace-events.ts`](../src/lib/events/workspace-events.ts)

**Description:**
Event bus is tightly coupled to implementation:
- 20+ event types defined in single file
- No event schema validation
- No event versioning
- Direct emission from multiple modules

**Impact:**
- Difficult to track event flow
- No type safety for event payloads
- Breaking changes can cascade
- No event replay capability

**Risk Level:** **Low-Medium**

**Remediation Strategy:**
1. Add Zod schemas for event payloads
2. Implement event versioning
3. Add event logging/middleware
4. Consider using event sourcing pattern

---

## Code Quality Debt

### CQD-001: Large Context Hook

**Location:** [`src/lib/workspace/hooks/useWorkspaceState.ts`](../src/lib/workspace/hooks/useWorkspaceState.ts:13)

**Description:**
[`useWorkspaceState`](../src/lib/workspace/hooks/useWorkspaceState.ts:13) hook manages 13 state variables and 4 refs in a single hook.

**Impact:**
- Difficult to understand
- High coupling
- Difficult to test individual concerns
- Re-render optimization challenges

**Risk Level:** **Low**

**Remediation Strategy:**
1. Split into smaller hooks: `useProjectState`, `useSyncState`, `usePermissionState`
2. Use Zustand for global state (Epic 27)
3. Consider React Query for server state

---

### CQD-002: Complex Sync Manager

**Location:** [`src/lib/filesystem/sync-manager.ts`](../src/lib/filesystem/sync-manager.ts:71)

**Description:**
[`SyncManager`](../src/lib/filesystem/sync-manager.ts:71) class is 463 lines with multiple responsibilities:
- File synchronization
- Error handling
- Event emission
- Progress tracking
- Performance monitoring

**Impact:**
- Difficult to maintain
- High cognitive load
- Difficult to test
- Violates Single Responsibility Principle

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Extract `SyncOrchestrator` for coordination
2. Extract `SyncExecutor` for file operations
3. Extract `SyncMonitor` for progress tracking
4. Use strategy pattern for different sync strategies

---

### CQD-003: Inconsistent Error Handling

**Location:** Multiple files

**Description:**
Error handling patterns vary across the codebase:
- Some functions throw custom errors ([`SyncError`](../src/lib/filesystem/sync-types.ts:43))
- Some functions throw generic `Error`
- Some functions return error objects
- Some functions use try/catch with console.error only

**Impact:**
- Inconsistent error messages
- Difficult to debug
- No centralized error tracking
- User experience varies

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Establish error handling guidelines
2. Use custom error classes consistently
3. Implement error boundary components
4. Add Sentry for error tracking (Epic 22-4)

---

### CQD-004: Missing TypeScript Strict Mode

**Location:** [`tsconfig.json`](../tsconfig.json:13)

**Description:**
`verbatimModuleSyntax` is set to `false`, allowing implicit module syntax.

**Impact:**
- Potential for module resolution bugs
- Less type safety
- Harder to catch import errors at compile time

**Risk Level:** **Low**

**Remediation Strategy:**
1. Enable `verbatimModuleSyntax: true` (Epic 22-7)
2. Fix any resulting import errors
3. Use explicit `.js` extensions for imports

---

### CQD-005: Unused Dependencies

**Location:** [`package.json`](../package.json:32)

**Description:**
Several dependencies may be unused or underutilized:
- `@tanstack/react-router-ssr-query` - SSR is disabled
- `idb` - Being replaced by Dexie
- `isomorphic-git` - No evidence of usage in codebase

**Impact:**
- Increased bundle size
- Security surface area
- Maintenance burden

**Risk Level:** **Low**

**Remediation Strategy:**
1. Audit all dependencies
2. Remove unused dependencies
3. Document purpose of each dependency

---

## Testing Debt

### TD-001: Low Test Coverage

**Location:** [`src/lib/filesystem/__tests__/`](../src/lib/filesystem/__tests__/)

**Description:**
Test coverage is limited:
- File system module has tests
- WebContainer module has tests
- Event system has tests
- Workspace hooks have NO tests
- Components have limited tests

**Impact:**
- Refactoring risk
- Regression bugs
- Low confidence in changes

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Add tests for workspace hooks (Epic 22-3)
2. Add integration tests for sync flow
3. Add component tests for IDE components
4. Set up coverage reporting

---

### TD-002: No E2E Tests

**Location:** N/A

**Description:**
No end-to-end tests exist for critical user flows:
- Project open flow
- File sync flow
- Agent tool execution
- Terminal interaction

**Impact:**
- Critical bugs may reach production
- Difficult to verify complex workflows
- Manual testing burden

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Add Playwright for E2E testing
2. Test critical user flows
3. Add visual regression testing
4. Integrate with CI/CD (Epic 22-2)

---

### TD-003: Mocking Complexity

**Location:** Test files

**Description:**
Tests require complex mocking:
- File System Access API
- WebContainer API
- IndexedDB
- Event bus

**Impact:**
- Brittle tests
- High maintenance cost
- Tests may not reflect real behavior

**Risk Level:** **Low-Medium**

**Remediation Strategy:**
1. Create test utilities for common mocks
2. Use dependency injection for testability
3. Add integration tests with real APIs
4. Consider using MSW for API mocking

---

## Infrastructure Debt

### ID-001: Missing CSP in Development

**Location:** [`vite.config.ts`](../vite.config.ts:32)

**Description:**
Content Security Policy is NOT set in dev server because it blocks:
- IndexedDB operations
- File System Access API
- WebContainer internal operations

**Impact:**
- Security risk in development
- Different behavior between dev and production
- CSP-related bugs may not be caught

**Risk Level:** **Low-Medium**

**Remediation Strategy:**
1. Add permissive CSP for development
2. Document CSP requirements
3. Add CSP testing in CI/CD
4. Consider using CSP nonce strategy

---

### ID-002: No Performance Monitoring

**Location:** N/A

**Description:**
No performance monitoring exists:
- No Web Vitals tracking (Epic 22-6)
- No sync performance metrics
- No WebContainer boot time monitoring
- No bundle size tracking

**Impact:**
- Performance regressions undetected
- Difficult to identify bottlenecks
- Poor user experience

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Add Web Vitals tracking (Epic 22-6)
2. Add performance marks for critical paths
3. Set up bundle size monitoring
4. Add performance budgets

---

### ID-003: No Health Checks

**Location:** N/A

**Description:**
No health check endpoints exist:
- WebContainer health
- IndexedDB health
- File system access health
- Service availability

**Impact:**
- Difficult to diagnose issues
- No monitoring for production
- Poor observability

**Risk Level:** **Low**

**Remediation Strategy:**
1. Add health check endpoint
2. Monitor critical services
3. Add uptime monitoring
4. Add alerting for failures

---

### ID-004: Ad-hoc Configuration

**Location:** Multiple files

**Description:**
Configuration is scattered:
- Environment variables in multiple files
- Hardcoded values in code
- No centralized configuration management
- No configuration validation

**Impact:**
- Difficult to change configuration
- Configuration errors
- No type safety for config

**Risk Level:** **Low**

**Remediation Strategy:**
1. Use Zod for configuration validation
2. Centralize configuration
3. Add environment variable documentation
4. Add configuration tests

---

## Domain Semantics Debt

### DSD-001: Inconsistent Naming

**Location:** Multiple files

**Description:**
Naming conventions are inconsistent:
- Some use `camelCase` for functions
- Some use `PascalCase` for functions
- Some use `kebab-case` for files
- Some use `camelCase` for files

**Impact:**
- Confusing for developers
- Difficult to find code
- Inconsistent codebase

**Risk Level:** **Low**

**Remediation Strategy:**
1. Establish naming conventions
2. Add ESLint rules for naming
3. Document conventions in AGENTS.md
4. Rename inconsistent files/functions

---

### DSD-002: Missing Domain Models

**Location:** N/A

**Description:**
No explicit domain models exist:
- Project, File, Directory are just interfaces
- No domain logic encapsulation
- No invariants enforcement
- No domain events

**Impact:**
- Business logic scattered
- Difficult to enforce rules
- High coupling

**Risk Level:** **Low**

**Remediation Strategy:**
1. Introduce domain models
2. Encapsulate business logic
3. Add invariants enforcement
4. Consider DDD patterns

---

### DSD-003: No Validation Layer

**Location:** [`src/lib/agent/facades/file-tools.ts`](../src/lib/agent/facades/file-tools.ts:105)

**Description:**
Validation is minimal:
- Path validation exists ([`validatePath`](../src/lib/agent/facades/file-tools.ts:105))
- No input validation for file operations
- No schema validation for data
- No sanitization for user input

**Impact:**
- Security risk
- Data corruption risk
- Poor error messages

**Risk Level:** **Medium**

**Remediation Strategy:**
1. Add Zod schemas for all inputs
2. Add sanitization layer
3. Add validation middleware
4. Add input validation tests

---

## Risk Summary

### High Risk Items

| ID | Item | Risk | Priority |
|----|------|------|----------|
| CQD-003 | Inconsistent Error Handling | Medium | P1 |
| DSD-003 | No Validation Layer | Medium | P1 |

### Medium Risk Items

| ID | Item | Risk | Priority |
|----|------|------|----------|
| ADR-001 | State Management Transition | Medium | P1 |
| ADR-002 | Dual Persistence Layers | Medium | P1 |
| TD-001 | Low Test Coverage | Medium | P2 |
| TD-002 | No E2E Tests | Medium | P2 |
| ID-002 | No Performance Monitoring | Medium | P2 |
| CQD-002 | Complex Sync Manager | Medium | P2 |
| ADR-005 | Event Bus Coupling | Medium | P2 |
| TD-003 | Mocking Complexity | Medium | P2 |

### Low Risk Items

| ID | Item | Risk | Priority |
|----|------|------|----------|
| ADR-003 | Global Singleton Pattern | Low-Medium | P3 |
| ADR-004 | Layer Violation in WorkspaceContext | Low | P3 |
| CQD-001 | Large Context Hook | Low | P3 |
| CQD-004 | Missing TypeScript Strict Mode | Low | P3 |
| CQD-005 | Unused Dependencies | Low | P3 |
| ID-001 | Missing CSP in Development | Low-Medium | P3 |
| ID-003 | No Health Checks | Low | P3 |
| ID-004 | Ad-hoc Configuration | Low | P3 |
| DSD-001 | Inconsistent Naming | Low | P3 |
| DSD-002 | Missing Domain Models | Low | P3 |

---

## Remediation Roadmap

### Phase 1: Critical Fixes (P1)
- Complete Epic 27 state management migration
- Complete Epic 27-1c persistence migration
- Add Zod validation layer
- Standardize error handling

### Phase 2: Quality Improvements (P2)
- Increase test coverage to 80%
- Add E2E tests for critical flows
- Add performance monitoring
- Refactor SyncManager

### Phase 3: Technical Debt (P3)
- Enable TypeScript strict mode
- Remove unused dependencies
- Add health checks
- Standardize naming conventions

---

## References

- **Workspace Context:** [`src/lib/workspace/WorkspaceContext.tsx`](../src/lib/workspace/WorkspaceContext.tsx)
- **State Hook:** [`src/lib/workspace/hooks/useWorkspaceState.ts`](../src/lib/workspace/hooks/useWorkspaceState.ts)
- **Sync Manager:** [`src/lib/filesystem/sync-manager.ts`](../src/lib/filesystem/sync-manager.ts)
- **Dexie DB:** [`src/lib/state/dexie-db.ts`](../src/lib/state/dexie-db.ts)
- **WebContainer Manager:** [`src/lib/webcontainer/manager.ts`](../src/lib/webcontainer/manager.ts)
- **Event System:** [`src/lib/events/workspace-events.ts`](../src/lib/events/workspace-events.ts)
- **Vite Config:** [`vite.config.ts`](../vite.config.ts)
- **TypeScript Config:** [`tsconfig.json`](../tsconfig.json)
- **Package.json:** [`package.json`](../package.json)