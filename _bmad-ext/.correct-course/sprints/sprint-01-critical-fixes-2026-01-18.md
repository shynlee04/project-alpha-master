# Sprint 1: Critical Fixes (Correct-Course)

**Start Date**: 2026-01-18
**Duration**: 1-2 days
**Priority**: P0-P1 issues only (from validation evidence)
**Status**: PLANNING_IN_PROGRESS

---

## 1. Executive Summary

Based on comprehensive validation evidence collected from 5 reports (Paper 2 Validation, PRD/Architecture Validation, Past Fix Attempts, and 3 ADRs), this sprint addresses the most critical security and stability issues identified in the Correct-Course workflow.

### Validation Summary

| Metric | Value |
|--------|-------|
| Validation Reports | 5 |
| P0 Issues | 2 (Security Critical) |
| P1 Issues | 2 (Stability) |
| P2 Issues | 1 (Architecture) |
| Files Affected | 14 |

### Why These Issues Are Critical

1. **Hardcoded API Keys (P0)**: Security vulnerability with actively used credentials exposed in source code. Same key found in 2 files. Must rotate immediately.

2. **XSS Vulnerabilities (P0)**: 7 attack vectors including 2 critical (iframe srcdoc, doc.write). No sanitization currently implemented. User-generated content can execute malicious scripts.

3. **Chrome 129+ Version Check (P1)**: Bug breaks FileSystemObserver features for Chrome 130+. Exact match check `=== 129` should be `>= 129`.

4. **Event Listener Isolation (P1)**: 9 event listeners without try-catch can crash the entire event bus, breaking cross-workspace communication.

5. **PlatformContract Consolidation (P2)**: Duplicate interfaces with inconsistent typing (`DeviceType` vs `PlatformType`). 19 import locations affected. Violates DRY principle.

---

## 2. Stories (5 Stories)

### Story CC-01: Remove Hardcoded API Keys

**Story ID**: CC-01
**Priority**: P0 | **Effort**: 1 hour | **Validator**: analyst-ext

**Context Source**:
- Paper 2 Claim 3: "Hardcoded API Keys exist in 2 files"
- Past Fix Attempts: "Migration infrastructure exists but source files not cleaned up"

**FR (Functional Requirements)**:
1. Remove hardcoded API key from `src/lib/init/seed-workspace-permissions.ts`
2. Remove hardcoded API key from `src/lib/agent/providers/agent-validation-service.ts`
3. Verify all API calls use credential vault pattern

**NF (Non-Functional Requirements)**:
1. Security: No hardcoded credentials in source (grep for "AIzaSy" returns 0)
2. Compliance: Follows BYOK architecture (ADR-033 D7-D9)
3. Performance: No impact

**Edge Cases**:
1. Existing users with hardcoded keys need migration path
2. API key rotation procedure documented
3. Error handling when vault is empty
4. Development/testing environment key handling

**Acceptance Criteria**:
- [ ] grep for "AIzaSy" returns 0 results in src/lib/
- [ ] All API calls use credential vault pattern
- [ ] TypeScript clean (pnpm tsc --noEmit)
- [ ] Tests passing
- [ ] Security scan passes

**Files to Modify**:
| File | Action | Lines |
|------|--------|-------|
| `src/lib/init/seed-workspace-permissions.ts` | Remove hardcoded key | ~5 |
| `src/lib/agent/providers/agent-validation-service.ts` | Remove hardcoded key | ~5 |

**9-Step Cycle Tracking**:
| Step | Status | Gate |
|------|--------|------|
| 01: Init | ⏳ | Context Gate |
| 01a: User Journey | ⏳ | Journey Gate |
| 02: Validate | ⏳ | Validation Gate |
| 03: Implement | ⏳ | Implementation Gate |
| 03a: Agent Tool Spec | ⏳ | Tool Gate |
| 04: Test | ⏳ | Test Gate |
| 05: Review | ⏳ | Review Gate |
| 06: Done | ⏳ | Done Gate |
| 06a: Reality Check | ⏳ | Reality Gate |
| 07: Retrospective | ⏳ | Retro Gate |

**Dependencies**: None (P0, can start immediately)

---

### Story CC-02: Fix XSS Vulnerabilities

**Story ID**: CC-02
**Priority**: P0 | **Effort**: 3 hours | **Validator**: security-ext

**Context Source**:
- Paper 2 Claim 4: "5 instances of dangerouslySetInnerHTML without sanitization"
- ADR-037: "7 total attack vectors identified"
- Past Fix Attempts: "No sanitization implemented"

**FR (Functional Requirements)**:
1. Install DOMPurify and create sanitization utilities
2. Sanitize DeepThinkUI.tsx (High Risk - naive markdown renderer)
3. Sanitize CommandPalette.tsx (High Risk - command descriptions)
4. Sanitize ChartDiagramBlock.tsx (Medium Risk - Mermaid SVG)
5. Sanitize RAGSearchPanel.tsx (Medium Risk - search results)
6. Sanitize StreamdownRenderer.tsx (Medium Risk - content rendering)
7. Sanitize ArtifactBlock.tsx (Critical Risk - iframe srcdoc)
8. Sanitize ArtifactPreviewModal.tsx (Critical Risk - doc.write)

**NF (Non-Functional Requirements)**:
1. Security: All 7 XSS vectors eliminated
2. Performance: Sanitization overhead < 5ms per render
3. Maintainability: Centralized sanitization utilities

**Edge Cases**:
1. Mermaid SVG requires specific allowed tags
2. Trusted vs untrusted content differentiation
3. SSR compatibility with DOMPurify
4. Existing tests must pass with sanitization

**Acceptance Criteria**:
- [ ] DOMPurify installed with TypeScript types
- [ ] 7 vulnerable files sanitized
- [ ] grep for unsanitized dangerouslySetInnerHTML returns 0
- [ ] TypeScript clean (pnpm tsc --noEmit)
- [ ] Tests passing
- [ ] Visual regression testing passes

**Files to Modify**:
| File | Action | Risk Level |
|------|--------|------------|
| `src/infrastructure/security/sanitization.ts` | Create utility | N/A |
| `src/presentation/components/common/DeepThinkUI.tsx` | Sanitize | High |
| `src/presentation/components/common/CommandPalette.tsx` | Sanitize | High |
| `src/presentation/components/common/ChartDiagramBlock.tsx` | Sanitize | Medium |
| `src/presentation/components/common/RAGSearchPanel.tsx` | Sanitize | Medium |
| `src/presentation/components/notes/StreamdownRenderer.tsx` | Sanitize | Medium |
| `src/presentation/components/common/ArtifactBlock.tsx` | Sanitize | Critical |
| `src/presentation/components/common/ArtifactPreviewModal.tsx` | Sanitize | Critical |

**9-Step Cycle Tracking**:
| Step | Status | Gate |
|------|--------|------|
| 01: Init | ⏳ | Context Gate |
| 01a: User Journey | ⏳ | Journey Gate |
| 02: Validate | ⏳ | Validation Gate |
| 03: Implement | ⏳ | Implementation Gate |
| 03a: Agent Tool Spec | ⏳ | Tool Gate |
| 04: Test | ⏳ | Test Gate |
| 05: Review | ⏳ | Review Gate |
| 06: Done | ⏳ | Done Gate |
| 06a: Reality Check | ⏳ | Reality Gate |
| 07: Retrospective | ⏳ | Retro Gate |

**Dependencies**: None (P0, can start immediately but should run after CC-01)

---

### Story CC-03: Fix Chrome 129+ Version Check

**Story ID**: CC-03
**Priority**: P1 | **Effort**: 1 hour | **Validator**: dev-ext

**Context Source**:
- PRD/Architecture Validation M4: "Chrome version check must use >= 129"
- ADR-035 Bug 001: "handle-persistence.ts with exact match === 129"
- Past Fix Attempts: "Version check bug fixed, but handle restoration disconnected"

**FR (Functional Requirements)**:
1. Fix version check in `handle-persistence.ts` to use `>= 129`
2. Fix version check in `permission-lifecycle.ts` if needed
3. Verify handle restoration workflow integration

**NF (Non-Functional Requirements)**:
1. Reliability: Chrome 129+ features properly detected
2. Compatibility: Chrome 128 and below get fallback behavior
3. Performance: No impact

**Edge Cases**:
1. Chromium-based browsers other than Chrome
2. Mobile Chrome version detection
3. Firefox/Safari not affected

**Acceptance Criteria**:
- [ ] Version check uses `>= 129` (not `=== 129`)
- [ ] FileSystemObserver properly feature-detected
- [ ] TypeScript clean (pnpm tsc --noEmit)
- [ ] Tests passing
- [ ] Manual verification on Chrome 130+

**Files to Modify**:
| File | Action | Issue |
|------|--------|-------|
| `src/lib/filesystem/handle-persistence.ts` | Fix version check | `=== 129` → `>= 129` |
| `src/lib/filesystem/permission-lifecycle.ts` | Verify | Regex extract check |

**9-Step Cycle Tracking**:
| Step | Status | Gate |
|------|--------|------|
| 01: Init | ⏳ | Context Gate |
| 01a: User Journey | ⏳ | Journey Gate |
| 02: Validate | ⏳ | Validation Gate |
| 03: Implement | ⏳ | Implementation Gate |
| 03a: Agent Tool Spec | ⏳ | Tool Gate |
| 04: Test | ⏳ | Test Gate |
| 05: Review | ⏳ | Review Gate |
| 06: Done | ⏳ | Done Gate |
| 06a: Reality Check | ⏳ | Reality Gate |
| 07: Retrospective | ⏳ | Retro Gate |

**Dependencies**: None (P1, can run in parallel with CC-02)

---

### Story CC-04: Add Event Listener Error Isolation

**Story ID**: CC-04
**Priority**: P1 | **Effort**: 2 hours | **Validator**: dev-ext

**Context Source**:
- Paper 2 Claim 7: "9 on* methods register listeners without try-catch"
- ADR-038: "IsolatedEventBus implementation required"
- Past Fix Attempts: "Hooks disabled to prevent issues, fix pending"

**FR (Functional Requirements)**:
1. Create IsolatedEventBus wrapper for EventEmitter3
2. Update cross-workspace-event-bus.ts to extend IsolatedEventBus
3. Fix use-cross-workspace-events.ts (remove dead getState() calls)
4. Add error monitoring hook

**NF (Non-Functional Requirements)**:
1. Reliability: Event bus survives throwing listeners
2. Observability: Errors logged to monitoring
3. Backward Compatibility: Same API surface

**Edge Cases**:
1. Throwing listener shouldn't break other listeners
2. Error monitoring hook should be non-intrusive
3. Memory leak prevention for listener cleanup

**Acceptance Criteria**:
- [ ] IsolatedEventBus created with tests
- [ ] cross-workspace-event-bus.ts updated
- [ ] use-cross-workspace-events.ts fixed (no dead getState calls)
- [ ] Event bus continues after throwing listener
- [ ] TypeScript clean (pnpm tsc --noEmit)
- [ ] Tests passing (workspace-switch-isolation.test.ts)
- [ ] Hooks can be re-enabled safely

**Files to Modify**:
| File | Action |
|------|--------|
| `src/infrastructure/events/event-bus-isolation.ts` | Create |
| `src/infrastructure/events/cross-workspace-event-bus.ts` | Update |
| `src/presentation/hooks/use-cross-workspace-events.ts` | Fix |

**9-Step Cycle Tracking**:
| Step | Status | Gate |
|------|--------|------|
| 01: Init | ⏳ | Context Gate |
| 01a: User Journey | ⏳ | Journey Gate |
| 02: Validate | ⏳ | Validation Gate |
| 03: Implement | ⏳ | Implementation Gate |
| 03a: Agent Tool Spec | ⏳ | Tool Gate |
| 04: Test | ⏳ | Test Gate |
| 05: Review | ⏳ | Review Gate |
| 06: Done | ⏳ | Done Gate |
| 06a: Reality Check | ⏳ | Reality Gate |
| 07: Retrospective | ⏳ | Retro Gate |

**Dependencies**: None (P1, can run in parallel with CC-02/CC-03)

---

### Story CC-05: Consolidate PlatformContract Interface

**Story ID**: CC-05
**Priority**: P2 | **Effort**: 3 hours | **Validator**: architect-ext

**Context Source**:
- PRD/Architecture Validation M1/M2: "Duplicate PlatformContract interface"
- ADR-036: "PlatformContract Interface Consolidation"
- Past Fix Attempts: "Documented but not executed"

**FR (Functional Requirements)**:
1. Create platform-types.ts with canonical type definitions
2. Update platform-contract.ts to import from platform-types.ts
3. Update storage-types.ts to import from platform-types.ts
4. Update all 19 import locations

**NF (Non-Functional Requirements)**:
1. Architecture: Single source of truth for platform types
2. Consistency: DeviceType naming used everywhere
3. Maintainability: Easier future changes

**Edge Cases**:
1. Some files may have outdated import paths
2. TypeScript compilation must succeed
3. Circular import prevention

**Acceptance Criteria**:
- [ ] platform-types.ts created with DeviceType, StorageType, PlatformContract
- [ ] platform-contract.ts imports from platform-types.ts
- [ ] storage-types.ts imports from platform-types.ts
- [ ] No duplicate interface definitions
- [ ] grep for "PlatformType" returns 0 in infrastructure/filesystem
- [ ] All 19 import locations updated
- [ ] TypeScript clean (pnpm tsc --noEmit)
- [ ] Tests passing

**Files to Modify**:
| File | Action |
|------|--------|
| `src/infrastructure/filesystem/platform-types.ts` | Create |
| `src/infrastructure/filesystem/platform-contract.ts` | Update imports |
| `src/infrastructure/filesystem/storage-types.ts` | Update imports |
| `src/routes/notes.lazy.tsx` | Update import |
| `src/routes/notes.$projectId.lazy.tsx` | Update import |
| `src/routes/ide.$projectId.tsx` | Update import |
| `src/routes/knowledge.$projectId.tsx` | Update import |
| `src/routes/study.$projectId.tsx` | Update import |
| `src/presentation/components/common/MainSidebar.tsx` | Update import |
| (13 more files from infection scan) | Update import |

**9-Step Cycle Tracking**:
| Step | Status | Gate |
|------|--------|------|
| 01: Init | ⏳ | Context Gate |
| 01a: User Journey | ⏳ | Journey Gate |
| 02: Validate | ⏳ | Validation Gate |
| 03: Implement | ⏳ | Implementation Gate |
| 03a: Agent Tool Spec | ⏳ | Tool Gate |
| 04: Test | ⏳ | Test Gate |
| 05: Review | ⏳ | Review Gate |
| 06: Done | ⏳ | Done Gate |
| 06a: Reality Check | ⏳ | Reality Gate |
| 07: Retrospective | ⏳ | Retro Gate |

**Dependencies**: None (P2, can run last or in parallel)

---

## 3. Tree Register

```
src/
├── lib/
│   ├── init/
│   │   └── seed-workspace-permissions.ts [MODIFY - CC-01]
│   │       - Remove hardcoded API key at line 33
│   │       - Use credential vault pattern
│   │   
│   ├── agent/
│   │   └── providers/
│   │       └── agent-validation-service.ts [MODIFY - CC-01]
│   │           - Remove hardcoded API key at line 27
│   │           - Use credential vault pattern
│   │
│   └── filesystem/
│       └── handle-persistence.ts [MODIFY - CC-03]
│           - Fix version check: === 129 → >= 129
│
├── infrastructure/
│   ├── security/
│   │   └── sanitization.ts [CREATE - CC-02]
│   │       - DOMPurify wrapper utilities
│   │       - sanitizeHtml, sanitizeSvg, sanitizeIframeContent
│   │
│   ├── events/
│   │   ├── event-bus-isolation.ts [CREATE - CC-04]
│   │       - IsolatedEventBus class
│   │       - Error handling wrapper
│   │       - Event bus error monitoring
│   │   │
│   │   └── cross-workspace-event-bus.ts [MODIFY - CC-04]
│   │       - Extend IsolatedEventBus
│   │       - Initialize listeners in constructor
│   │
│   └── filesystem/
│       ├── platform-types.ts [CREATE - CC-05]
│       │   - DeviceType, StorageType, PlatformContract definitions
│       │   - Single source of truth
│       │
│       ├── platform-contract.ts [MODIFY - CC-05]
│       │   - Import from platform-types.ts
│       │   - Remove duplicate type definitions
│       │
│       └── storage-types.ts [MODIFY - CC-05]
│           - Import from platform-types.ts
│           - Remove PlatformType duplicate
│
├── presentation/
│   └── hooks/
│       └── use-cross-workspace-events.ts [MODIFY - CC-04]
│           - Fix dead getState() calls
│           - Use proper Zustand v5 pattern
│
└── components/
    ├── common/
    │   ├── DeepThinkUI.tsx [MODIFY - CC-02]
    │   │   - Sanitize dangerouslySetInnerHTML
    │   │   - High Risk: naive markdown renderer
    │   │
    │   ├── CommandPalette.tsx [MODIFY - CC-02]
    │   │   - Sanitize dangerouslySetInnerHTML
    │   │   - High Risk: command descriptions
    │   │
    │   ├── ChartDiagramBlock.tsx [MODIFY - CC-02]
    │   │   - Sanitize dangerouslySetInnerHTML
    │   │   - Medium Risk: Mermaid SVG
    │   │
    │   ├── RAGSearchPanel.tsx [MODIFY - CC-02]
    │   │   - Sanitize dangerouslySetInnerHTML
    │   │   - Medium Risk: search results
    │   │
    │   ├── ArtifactBlock.tsx [MODIFY - CC-02]
    │   │   - Sanitize iframe srcdoc
    │   │   - Critical Risk: unsanitized HTML/CSS/JS
    │   │
    │   └── ArtifactPreviewModal.tsx [MODIFY - CC-02]
    │       - Sanitize doc.write()
    │       - Critical Risk: HTML/SVG preview
    │
    └── notes/
        └── StreamdownRenderer.tsx [MODIFY - CC-02]
            - Sanitize dangerouslySetInnerHTML
            - Medium Risk: content rendering
```

---

## 4. Cohesion Check Results

### Cohesion Analysis

| Story | Responsibility | Cohesion Score |
|-------|---------------|----------------|
| CC-01 | Security - Remove hardcoded keys | High |
| CC-02 | Security - XSS sanitization | High |
| CC-03 | Platform - Chrome version check | High |
| CC-04 | Events - Error isolation | High |
| CC-05 | Architecture - Type consolidation | High |

**Overall Cohesion**: HIGH - All stories have single, clear responsibility with no overlapping concerns.

### No Overlapping Responsibilities

- CC-01: Only modifies 2 seed/validation files
- CC-02: Only modifies 8 component files + 1 utility
- CC-03: Only modifies 2 filesystem files
- CC-04: Only modifies 2 event/hook files
- CC-05: Only modifies 5 type definition files + 14 imports

---

## 5. Dependency Map

### Story Execution Order

```
Parallel Group 1 (P0 - Security Critical):
├── CC-01: Remove Hardcoded API Keys
└── CC-02: Fix XSS Vulnerabilities
    (Both can start immediately, no dependencies)

Parallel Group 2 (P1 - Stability):
├── CC-03: Fix Chrome 129+ Version Check
└── CC-04: Add Event Listener Isolation
    (Both can start in parallel with Group 1)

Sequential (P2 - Architecture):
└── CC-05: Consolidate PlatformContract Interface
    (Can run in parallel, depends on understanding of types)
```

### No Circular Dependencies

All stories are independent and can be executed in parallel. The only consideration is resource contention (multiple agents modifying files in similar areas).

---

## 6. Validation Checklist

- [ ] All P0 issues addressed (CC-01, CC-02)
- [ ] TypeScript clean (pnpm tsc --noEmit)
- [ ] Tests passing
- [ ] Security scan clean (no hardcoded keys, no XSS)
- [ ] No regressions in existing functionality
- [ ] All 9-step cycles initiated
- [ ] Evidence links documented in each story
- [ ] Reality checks scheduled

---

## 7. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API key rotation breaks existing users | Medium | High | Migration path, backward compatibility, test with dev keys |
| XSS fix breaks note rendering | Low | High | Test each component, visual regression testing, rollback plan |
| Chrome version check incomplete | Low | Medium | Manual testing on Chrome 130+, fallback behavior |
| Event listener fix causes loops | Medium | Medium | Re-enable hooks incrementally, monitoring |
| PlatformContract consolidation breaks imports | Medium | Medium | Update all 19 import locations, TypeScript compilation check |
| DOMPurify SSR issues | Low | Medium | Lazy import, client-side only sanitization |

---

## 8. Sprint Artifacts

| Artifact | Location | Status |
|----------|----------|--------|
| Sprint Planning | `_bmad-ext/.correct-course/sprints/sprint-01-critical-fixes-2026-01-18.md` | In Progress |
| Story CC-01 | `_bmad-ext/.correct-course/stories/CC-01.xml` | Pending |
| Story CC-01 | `_bmad-ext/.correct-course/stories/CC-01.md` | Pending |
| Story CC-02 | `_bmad-ext/.correct-course/stories/CC-02.xml` | Pending |
| Story CC-02 | `_bmad-ext/.correct-course/stories/CC-02.md` | Pending |
| Story CC-03 | `_bmad-ext/.correct-course/stories/CC-03.xml` | Pending |
| Story CC-03 | `_bmad-ext/.correct-course/stories/CC-03.md` | Pending |
| Story CC-04 | `_bmad-ext/.correct-course/stories/CC-04.xml` | Pending |
| Story CC-04 | `_bmad-ext/.correct-course/stories/CC-04.md` | Pending |
| Story CC-05 | `_bmad-ext/.correct-course/stories/CC-05.xml` | Pending |
| Story CC-05 | `_bmad-ext/.correct-course/stories/CC-05.md` | Pending |
| Sprint Status | `_bmad-ext/.correct-course/sprints/sprint-status.yaml` | Pending |
| Tree Register | `_bmad-ext/.correct-course/sprints/sprint-01-tree-register.xml` | Pending |

---

## 9. Evidence References

| Report | Location | Key Findings Used |
|--------|----------|-------------------|
| Paper 2 Validation | `_bmad-ext/.correct-course/validation/paper-02-claims-validated.md` | Claims 3, 4, 7 (API keys, XSS, event listeners) |
| PRD/Architecture Validation | `_bmad-ext/.correct-course/validation/prd-architecture-validation.md` | M1, M2, M4 (PlatformContract, Chrome version) |
| Past Fix Attempts | `_bmad-ext/.correct-course/validation/past-fix-attempts.md` | Issue status, previous attempts |
| ADR-036 | `_bmad-output/planning-artifacts/adr/ADR-036-platform-contract-consolidation-2026-01-18.md` | Implementation plan |
| ADR-037 | `_bmad-output/planning-artifacts/adr/ADR-037-xss-sanitization-2026-01-18.md` | 7 attack vectors, sanitization strategy |
| ADR-038 | `_bmad-output/planning-artifacts/adr/ADR-038-event-listener-isolation-2026-01-18.md` | 9 listeners, IsolatedEventBus implementation |

---

*Document generated by bmad-sprint-manager*
*Planning date: 2026-01-18*
