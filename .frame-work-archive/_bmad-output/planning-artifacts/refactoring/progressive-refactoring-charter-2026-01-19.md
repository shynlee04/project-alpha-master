# Progressive Refactoring Charter

**Document ID:** `progressive-refactoring-charter-2026-01-19`
**Created:** 2026-01-19
**Author:** tech-writer-ext
**Status:** Active
**Version:** 1.0.0

---

## 1. Executive Summary

Previous refactoring efforts, specifically the CC-FSA-xx series and CC-IDE initiatives, encountered significant difficulties that ultimately compromised working functionality. The fundamental issues that derailed these efforts stem from two primary sources: fragmentation and premature deprecation. Teams attacked multiple systems simultaneously without establishing clear dependency maps, resulting in cascading import failures and broken consumer relationships. When legacy code was archived before all consumers successfully migrated to new abstractions, the codebase entered an inconsistent state where some features worked while others failed unpredictably.

The progressive approach outlined in this charter establishes a fundamentally different methodology built on four distinct phases: audit, consolidate, clean, and validate. Each phase must complete fully before the next begins, and each refactoring must be self-contained and testable. This charter mandates that working features must never break as a consequence of refactoring activities. When in doubt about whether a change might affect existing functionality, the conservative approach always prevails. The goal is not speed but sustainability—completing one problem at a time with complete confidence in the result.

Expected outcomes from following this charter include a clean four-layer architecture with proper separation of concerns, zero TypeScript errors as measured by the compiler, consolidated patterns across all sync implementations, and a sustainable codebase that supports future development without accumulating technical debt. The TypeScript error count from Cycle-18 stood at 1,172 errors, representing accumulated damage from fragmented refactoring attempts. This charter targets complete resolution of all compiler errors while establishing governance that prevents future accumulation.

---

## 2. Core Principles

### 2.1 Progressive Refactoring Rule

The foundational principle governing all refactoring activities is captured in a single directive: "One problem at a time but it will be complete." This means that teams must never refactor multiple unrelated systems simultaneously, even when those changes might appear unrelated on the surface. Hidden dependencies frequently exist between seemingly isolated components, and addressing them in parallel creates race conditions where one team's changes invalidate another's assumptions.

Each refactoring must be self-contained and testable within a single work session. If a refactoring cannot be completed and validated within the allocated timebox, it must be rolled back entirely rather than left in a partially completed state. The discipline of complete, testable units ensures that the codebase never enters an undefined state where some refactorings are half-implemented.

Working features must not break under any circumstances. This is an absolute constraint that cannot be relaxed for expedience. When a proposed refactoring threatens existing functionality, the refactoring must be redesigned to preserve compatibility, or abandoned entirely. The cost of maintaining backward compatibility is always lower than the cost of fixing broken features and restoring user trust.

### 2.2 Consolidation First

Sync logic has accumulated duplicate implementations across multiple modules, creating maintenance burden and inconsistency. The consolidation principle mandates that no module should contain logic that duplicates functionality available elsewhere in the codebase. Before creating any new sync functionality, teams must audit existing implementations and extend them rather than creating parallel solutions.

The target architecture establishes a unified `infrastructure/sync/` module that serves as the single source of truth for all synchronization operations. All file sync, state sync, and data synchronization must flow through this module rather than implementing sync logic inline within feature modules. This consolidation enables consistent behavior, easier debugging, and simpler testing.

When consolidation reveals that multiple implementations serve similar purposes with different interfaces, the solution is to create a unified abstraction that all consumers migrate toward, not to maintain parallel implementations indefinitely. The archive protocol in Section 6 ensures that consolidation happens safely without leaving the codebase in an inconsistent state.

### 2.3 Zustand Best Practices

The December 2025 standard for Zustand usage establishes clear patterns that must be followed in all refactoring activities. Individual selectors must be used exclusively rather than destructuring state from stores. The correct pattern uses `useStore(s => s.property)` rather than `const { property } = useStore()`. This distinction is not stylistic preference but a performance requirement that prevents infinite re-render loops and stale closure issues.

The individual selector pattern ensures that components only re-render when the specific property they depend on changes. Destructuring multiple properties from a store creates subscriptions to all those properties simultaneously, causing unnecessary re-renders when any property updates. In complex applications with frequent state changes, this anti-pattern creates cascading performance degradation that manifests as UI lag and battery drain on mobile devices.

High-severity performance issues have been traced directly to improper Zustand usage patterns. Refactoring activities must correct existing violations while establishing the individual selector pattern as the unquestioned standard for all new code. Code reviews must reject any change that violates this principle regardless of other merits.

### 2.4 Canonical Sources

Every domain concept in the codebase must have exactly one canonical source of truth. When multiple files define similar types or provide similar functionality, consolidation must determine which implementation serves as the authoritative source. The canonical source must be documented explicitly, and all consumers must migrate toward it before any legacy variant is archived.

Before archiving any legacy implementation, teams must complete a comprehensive audit of all imports and consumer relationships. This audit must identify every file that depends on the legacy implementation, verify that each consumer can successfully migrate to the canonical source, and validate that the migration does not introduce regressions. Only after all consumers are confirmed migrated should the archive protocol proceed.

The canonical source documentation must live alongside the implementation, not in a separate document that will drift out of sync. TypeScript's export system and JSDoc comments provide natural locations for this documentation. When developers ask "where should I import X from?", the answer must be obvious and consistently correct.

### 2.5 Cross-Context Contracts

Contexts must interact only through defined contracts, never through direct internal access to implementation details. A contract specifies what one context provides to consumers and what it requires from its own dependencies. These contracts enable independent evolution of contexts while maintaining compatibility at integration points.

For the workspace architecture, contracts must define explicitly what the Notes workspace depends on from the Workspace context, what the IDE workspace depends on from the Workspace context, and what dependencies the Workspace context itself establishes. These dependencies create a directed acyclic graph that can be validated at runtime to prevent initialization order bugs and race conditions.

Runtime invariant validation must check that contracts are satisfied before critical operations execute. When a contract is violated—either because a required dependency is missing or because a provided value has an unexpected type—the system must throw clear, actionable error messages rather than failing silently with cryptic downstream errors. Logging invariant violations enables early detection of architectural problems before they manifest as user-visible bugs.

### 2.6 Four-Layer Architecture Enforcement

The codebase follows a four-layer architecture that separates concerns and enables independent testing and evolution. The infrastructure layer provides external integrations including storage, networking, and platform capabilities. The domain layer contains business logic and entities that encode the application's core concepts. The application layer coordinates domain objects to fulfill use cases. The presentation layer handles user interface concerns and user interaction.

No file may mix concerns from multiple layers. Infrastructure code must not contain business logic. Presentation components must not implement domain rules. When this separation is violated, testing becomes difficult, reuse becomes problematic, and evolution becomes dangerous because changes ripple through unrelated concerns in unpredictable ways.

Enforcement requires both automated tooling and manual code review. Automated tools can detect obvious violations such as imports that cross layer boundaries inappropriately. Manual review catches subtler violations that require understanding of the problem domain. This charter establishes that layer violations are blocking issues that must be resolved before any refactoring can be considered complete.

---

## 3. Audit Checklist (Phase 1 Tasks)

### 3.1 Store Patterns Audit

The store patterns audit examines all Zustand stores in the codebase to identify violations of the canonical source principle, overlapping responsibilities, and god-stores that have accumulated too many concerns. The audit must catalog every store file, identify its canonical location within `src/infrastructure/persistence/stores/`, and verify that no duplicate implementations exist elsewhere.

All React hooks must be located within `src/presentation/hooks/` with clear separation between hooks that handle presentation concerns and hooks that interact with infrastructure. Hooks that bridge presentation to domain logic must be clearly documented with their dependencies on stores and services.

Context providers including WorkspaceContext, ProjectContext, and any other React contexts must be examined for responsibility overlap. Multiple contexts that provide similar or related state create coordination burden for consumers and inconsistency risk for behavior. The audit must identify opportunities to consolidate contexts while maintaining clear separation of concerns.

The deliverable for this audit is a comprehensive report documenting all stores, their canonical status, and recommendations for consolidation or refactoring. This report becomes the authoritative source for Phase 2 implementation planning.

### 3.2 Sync Implementations Audit

Sync implementations have proliferated across the codebase with multiple implementations of similar functionality. The sync audit must identify every file that implements synchronization logic including FileSync services, sync-manager modules, sync-operations modules, and any ad-hoc sync code embedded within feature modules.

The audit must document the purpose and scope of each sync implementation, identify duplicate logic that should be consolidated, and note any missing implementations. Analysis of the current gap analysis reveals that the Notes workspace and Study workspace lack proper sync implementations while the IDE workspace has accumulated multiple overlapping implementations.

Duplicate logic patterns to identify include multiple implementations of file tree traversal, multiple implementations of conflict detection, multiple implementations of sync status tracking, and multiple implementations of error handling for sync failures. Each duplicate represents an opportunity for consolidation that reduces maintenance burden and inconsistency risk.

### 3.3 Cross-Workspace Audit

Each workspace in the application—IDE, Notes, Knowledge, and Study—implements patterns that may be shared or may represent inconsistencies. The cross-workspace audit examines implementations across all workspaces to identify shared logic that should be extracted and inconsistencies that should be normalized.

The IDE workspace has the most mature implementation with documented patterns for file operations, sync management, and state persistence. The Notes workspace has partial implementations that follow some IDE patterns but diverge in others. The Knowledge and Study workspaces are disabled but contain implementations that may be reactivated in the future.

The audit must document which patterns are shared across workspaces, which patterns are workspace-specific, and which patterns represent inconsistencies that should be normalized. Shared patterns become candidates for extraction to the infrastructure layer. Inconsistencies require evaluation to determine whether normalization is appropriate or whether workspace-specific variations are justified by different requirements.

### 3.4 Monolithic Utilities Audit

Several utilities have grown beyond their intended scope, accumulating responsibilities that should be distributed across multiple focused modules. The credential vault at 563 lines exemplifies this problem—any file of this size almost certainly contains multiple concerns that should be separated.

The audit must examine monolithic utilities including the credential vault, agent tools modules, and permission managers to identify distinct responsibilities within each. Each responsibility becomes a candidate for extraction to a separate module with a focused purpose. The goal is not arbitrary division but logical separation that enables independent testing, independent evolution, and clearer ownership.

For the credential vault specifically, expected extractions include encryption services, storage services, and orchestration logic that coordinates between them. Each extraction must be evaluated for reusability beyond the current credential context. The audit must also identify any dependencies that these utilities have on infrastructure layer services and verify that the dependency direction is correct.

---

## 4. Consolidation Strategy (Phase 2 Tasks)

### 4.1 Unified Sync Engine

The unified sync engine consolidates all synchronization logic into a single module at `infrastructure/sync/`. This module becomes the single entry point for all sync operations accessible via the `useFileSync()` hook. No other module may implement sync logic directly; instead, all sync requirements must be expressed through the unified engine's interface.

The consolidation must merge all existing FileSync implementations into the unified engine without losing functionality. Each existing implementation serves a specific purpose that must be preserved even as the implementation is restructured. The merge process begins by cataloging all sync operations provided by existing implementations, then designing a unified interface that encompasses all operations, and finally implementing the unified interface by composing existing implementations.

The unified engine must prevent "split provider logic" where different code paths handle different storage providers differently. A single code path should route operations to the appropriate provider based on configuration, not based on scattered conditionals throughout the codebase. This routing must be transparent to consumers—the sync engine's interface should not expose provider-specific details.

### 4.2 Unified WorkspaceStore

The WorkspaceStore pattern must be consolidated across all contexts and stores that currently manage workspace-related state. This includes WorkspaceContext, ProjectContext, and any Zustand stores that hold workspace-scoped data. The consolidation creates a single workspace slice pattern that all workspace-related code uses.

The slice pattern divides workspace concerns into logical groups: project metadata, permission state, sync status, and editor state. Each slice is implemented as a focused module with a clear interface. The combined workspace store composes these slices into a unified whole that presents a consistent API to consumers.

Individual selectors must be used throughout to prevent performance issues. Each slice exports selectors for its specific properties, and components consume only the selectors they need. This granular subscription model ensures that components only re-render when their specific data changes, regardless of how frequently other slice properties update.

### 4.3 Modular Utilities Split

Monolithic utilities are split into focused modules that each handle a single responsibility. The credential vault splits into encryption services that handle cryptographic operations, storage services that handle persistence, and orchestration that coordinates between them. Each module has a clear interface and can be tested independently.

Agent tools modules split by agent type, with each tool set isolated from others. This isolation enables independent evolution of tool sets as agent capabilities expand. Permission management splits into its own isolated module that can be reused across all components that require permission checks.

Each split module must be evaluated for placement in the appropriate architectural layer. Encryption and storage services belong in the infrastructure layer. Orchestration logic may belong in the application layer if it coordinates use cases, or in the domain layer if it implements business rules. The split process must verify that dependency direction remains correct after extraction.

---

## 5. Cross-Context Contracts (Phase 3 Tasks)

### 5.1 Define Contracts

Cross-context contracts formalize the dependencies between workspaces and shared infrastructure. The Workspace to Notes contract defines what the Notes workspace requires from the Workspace context: project metadata, permission state, and sync operations. The Workspace to IDE contract defines similar requirements for the IDE workspace with additional requirements for file tree operations and editor state.

Each contract specifies required providers—what the depending context needs—and provided contracts—what the providing context guarantees. Contracts also specify preconditions that must be satisfied before the dependency can be used, and postconditions that the providing context guarantees after operations complete.

Contract documentation must be machine-readable where possible to enable automated validation. TypeScript interfaces capture structural requirements. Runtime checks verify that instances satisfy contract requirements before operations proceed. The combination of static and runtime checking catches violations early and provides clear error messages when contracts are violated.

### 5.2 Runtime Validation

Runtime validation ensures that contracts are satisfied before critical operations execute. When a context depends on another context, validation checks that the dependency exists, that it has the expected type, and that its state satisfies any preconditions required for the operation.

Validation throws clear errors when contracts are violated. The error message identifies which contract was violated, which operation triggered the violation, and what state was expected. This diagnostic information enables developers to quickly identify and resolve contract violations rather than debugging cryptic downstream failures.

Invariant violations are logged for monitoring and analysis. Patterns in violations may indicate architectural problems that require systemic correction, not just individual bug fixes. Logging enables detection of these patterns before they accumulate into major problems.

---

## 6. Legacy Cleanup (Phase 4 Tasks)

### 6.1 Archive Protocol

The archive protocol ensures that legacy variants are removed safely without breaking consumers. The protocol has five distinct steps that must be completed in order before any deletion occurs.

The first step creates the unified abstraction that will replace the legacy variant. This abstraction must be complete and tested before any migration begins. The second step migrates all consumers to the new abstraction, with each migration verified to work correctly. The third step runs all tests to confirm that the migration succeeded. The fourth step archives the legacy variant with a date stamp that indicates when it was superseded. The fifth step updates the imports map to redirect any remaining references to the archived location.

The imports map is a single source of truth that tracks where each symbol should be imported from. When legacy variants are archived, the imports map ensures that attempts to import from the legacy location are redirected to the canonical location with a deprecation warning. This redirection enables gradual migration and catches any missed consumers during testing.

### 6.2 TypeScript Health Target

The TypeScript health target is zero errors as measured by running `pnpm tsc --noEmit`. The current error count of 1,172 from Cycle-18 represents accumulated damage from fragmented refactoring attempts. Each error must be categorized by type, and fixes must be applied incrementally to avoid creating new errors while fixing existing ones.

The per-file limit of 300 lines ensures that files remain focused and maintainable. Files that exceed this limit must be split during the refactoring process, with extracted concerns placed in appropriate locations within the architecture. The line limit is not arbitrary—files beyond this size almost always contain multiple concerns that should be separated.

Daily TypeScript checks during refactoring catch new errors immediately rather than allowing them to accumulate. When errors appear, they must be fixed before proceeding with further refactoring. This discipline ensures that the codebase never enters a state where errors have accumulated beyond practical remediation.

---

## 7. Implementation Roadmap

### 7.1 Phase 1: Audit (Week 1)

The audit phase establishes the factual foundation for all subsequent refactoring work. This phase cannot be rushed because incomplete or inaccurate audits lead to refactoring efforts that address the wrong problems or miss critical dependencies.

| Task | Duration | Owner |
|------|----------|-------|
| Store patterns audit | 2 days | architect-ext |
| Sync implementations audit | 2 days | architect-ext |
| Cross-workspace audit | 1 day | architect-ext |
| Monolithic utilities audit | 1 day | architect-ext |

The deliverable is a comprehensive audit report that documents the current state of the codebase, identifies all issues requiring attention, and provides recommendations for each issue's resolution. This report must be reviewed and approved before Phase 2 begins.

### 7.2 Phase 2: Consolidate (Weeks 2-3)

The consolidation phase implements the changes identified in the audit report. This phase focuses on creating unified abstractions and extracting focused modules from monolithic utilities. All changes must maintain working functionality.

| Task | Duration | Owner |
|------|----------|-------|
| Unified sync engine | 1 week | dev-ext |
| Unified WorkspaceStore | 1 week | dev-ext |
| Modular utilities split | 3 days | dev-ext |

The deliverable is a consolidated codebase where all sync operations flow through the unified engine, all workspace state follows the WorkspaceStore pattern, and monolithic utilities have been split into focused modules. All functionality must work identically to the pre-consolidation state.

### 7.3 Phase 3: Contracts (Week 4)

The contracts phase formalizes cross-context dependencies and implements runtime validation. This phase ensures that the consolidated codebase maintains clear boundaries between contexts and that violations are detected early.

| Task | Duration | Owner |
|------|----------|-------|
| Define cross-context contracts | 2 days | architect-ext |
| Implement runtime validation | 2 days | dev-ext |

The deliverable is a contract validation system that checks cross-context dependencies at runtime and throws clear errors when contracts are violated. All contexts must have documented contracts that specify their dependencies and guarantees.

### 7.4 Phase 4: Cleanup (Week 5)

The cleanup phase archives legacy variants and resolves remaining TypeScript errors. This phase completes the refactoring by removing deprecated code and ensuring the codebase compiles cleanly.

| Task | Duration | Owner |
|------|----------|-------|
| Archive legacy variants | 2 days | dev-ext |
| TypeScript cleanup | 2 days | dev-ext |
| Final validation | 1 day | bmad-governance |

The deliverable is a clean codebase with zero TypeScript errors, no deprecated code remaining in active directories, and governance validation that confirms all requirements are satisfied.

---

## 8. Success Metrics

The following metrics measure progress and success of the refactoring effort. Current values are measured at the start of the refactoring, and target values represent the desired end state.

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|--------------------|
| TypeScript errors | 1,172 | 0 | `pnpm tsc --noEmit` |
| Files exceeding 300 lines | 17 | 0 | File size analysis |
| Sync implementations | 4+ | 1 | Implementation audit |
| Store patterns | Multiple | 1 canonical | Store patterns audit |
| Monolithic utility lines | 563 | < 200 each | File size analysis |
| Duplicate logic instances | Many | 0 | Sync implementations audit |

Progress toward targets must be tracked throughout the refactoring effort. Weekly reports document progress against each metric and identify any regressions. When metrics regress, work must pause until the regression is understood and corrected.

---

## 9. Risk Assessment

Refactoring efforts carry inherent risks that must be identified, assessed, and mitigated. The following risk assessment identifies probable risks and establishes mitigation strategies.

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking working features | High | Critical | Test each refactoring before merge, maintain feature flags for fallback |
| Circular dependencies | Medium | High | Phase 1 audit identifies circular dependencies before refactoring |
| Performance regression | Medium | High | Individual selector pattern prevents re-render issues |
| Consumer migration incomplete | Medium | Critical | Import map with deprecation warnings catches missed migrations |
| TypeScript cascade errors | High | High | Incremental fixes with daily checks prevent accumulation |

The mitigation for breaking working features is the most critical and requires the most discipline. Each refactoring must be tested thoroughly before being merged, and feature flags must enable fallback to previous behavior if the refactoring introduces regressions. The cost of maintaining backward compatibility during refactoring is always lower than the cost of restoring broken functionality and rebuilding user trust.

---

## 10. Rollback Plan

When refactoring breaks working features despite all precautions, the rollback plan enables rapid recovery. The plan has four distinct steps that must be executed in order.

The first step stashes all changes to preserve the refactoring work for later analysis. The second step reverts to the last known good state using git checkout or reset depending on the scope of changes. The third step documents what broke, including the specific feature that failed, the error that occurred, and any relevant context from testing. The fourth step adjusts the refactoring plan to address the discovered issue, either by narrowing the scope, adding tests, or redesigning the approach.

Rollback decisions must be made quickly when triggered. The presence of a clear rollback plan enables confident experimentation during refactoring because the cost of failure is bounded. However, the plan must be executed when triggered—a rollback that is initiated must be completed rather than leaving the codebase in an inconsistent state.

---

## 11. Related Artifacts

The following existing documents provide context and background for this charter. Readers should consult these documents for additional detail on specific topics.

The past feature audit at `_bmad-output/debug-infrastructure/past-feature-audit-2026-01-19.md` documents the working IDE implementation from 15-25 days ago and identifies patterns that should be preserved during refactoring. This audit provides the historical baseline against which current implementations are measured.

The current gap analysis at `_bmad-output/debug-infrastructure/current-gap-analysis-2026-01-19.md` identifies discrepancies between past working implementations and current state. This analysis reveals where functionality has been lost or broken during previous refactoring attempts.

The feature adaptation plan at `_bmad-output/debug-infrastructure/feature-adaptation-plan-2026-01-19.md` provides detailed recommendations for adapting past patterns to the current Zustand + Dexie stack. This plan influenced the consolidation strategy in Section 4.

The BMAD governance document at `_bmad-ext/orchestrator/bmad-ext-governance.md` establishes the governance framework within which this charter operates. Refactoring activities must comply with all governance requirements.

---

*Generated by tech-writer-ext | Progressive Refactoring Charter*
*Document ID: progressive-refactoring-charter-2026-01-19*
