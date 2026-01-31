# Via-Gent Epics and Stories

**Version:** 2.1.0 (Phase 1 Updated)
**Date:** 2026-01-16
**Status:** AUTHORITARY - Governs all feature development
**Related Documents:**
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Research: `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`
- Audit: `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`
- ADR Audit: `_bmad-output/planning-artifacts/architecture/adr-audit-report-2026-01-11.md`
- Phase 1 Audit: `_bmad-output/planning-artifacts/phase1-document-audit-2026-01-16.md`
- ADR-033: Platform Contract and FSA Architecture
- ADR-034: Workspace Access Infection Remediation
- Project ID Format: `{workspaceType}:proj_{timestamp}_{random}` per `src/domain/types/project-ids.ts`

---

## ⚡ Quick Reference

| Epic | Name | Progress | Priority | Status |
|------|------|----------|----------|--------|
| **EPIC-01** | File System Foundation | 28.6% | P0 | IN_PROGRESS |
| **EPIC-02** | Architecture Remediation | BLOCKED | P0 | WAITING |
| **EPIC-03** | 8-bit Design Compliance | 67% | P1 | IN_PROGRESS |
| **EPIC-04** | Multimodal Chat Unification | 100% ⚠️ | P1 | VERIFY |
| **EPIC-BYOK** | Complete BYOK Implementation | 0% | P0 | PROPOSED |
| **EPIC-PS** | Project Space Foundation | 0% | P0 | PROPOSED |
| **EPIC-05** | Agent Auto-Switching | 0% | P1 | PROPOSED |
| **EPIC-06** | RAG Enhancement | 0% | P1 | PROPOSED |

**Numbering Scheme:** Monotonic Sequential  
- EPIC-N requires EPIC-(N-1) to be 80%+ complete before starting  
- Number indicates order of identification, NOT priority  
- Priority (P0/P1/P2) is independent of number

---

## EPIC-01: File System Foundation

**Priority:** P0 (Foundation)  
**Status:** IN_PROGRESS  
**Progress:** 28.6% (4/14 stories)  
**New ID:** 01 (was EPIC-FS)

### Context
Core foundation for file operations, sync, and workspace management. Required before architecture remediation can proceed.

**Reference:** Architecture.md Section 2.1 (Layer violations)

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 01-01 | File system foundation | 2h | P0 | DONE |
| 01-02 | File operations | 4h | P0 | DONE |
| 01-03 | Sync logic | 4h | P0 | DONE |
| 01-04 | Permission handling | 2h | P0 | DONE |
| 01-05 | Research task | 4h | P0 | DONE |
| 01-06 | N+1 Query Fix (RAG) | 2h | P0 | **TODO** |
| 01-07 | Error Boundary (/knowledge) | 1h | P0 | **TODO** |
| 01-08 | God Store Decomposition | 1 day | P1 | **TODO** |
| 01-09 | Store Consolidation | 4h | P1 | **TODO** |
| 01-10 | Type Consolidation | 4h | P2 | **TODO** |
| 01-11 | Cross-layer Import Fixes | 2h | P0 | **TODO** |
| 01-12 | Circular Dependency Fix | 1 day | P0 | **TODO** |
| 01-13 | Metadata Filtering (RAG) | 4h | P1 | **TODO** |
| 01-14 | RAG Type Consolidation | 4h | P2 | **TODO** |

### Current Issues (from Audit)

| Issue | Location | Severity | Story |
|-------|----------|----------|-------|
| N+1 Query | knowledge-source-crud-slice.ts:56-62 | HIGH | 01-06 |
| God Store | useRAGStore.ts (327 lines) | HIGH | 01-08 |
| Layer Violation | infrastructure/persistence/stores/index.ts:190-195 | HIGH | 01-11 |
| Circular Dep | agent-orchestration-service.ts | HIGH | 01-12 |

**Total Effort:** ~2 weeks  
**Blocker:** None (foundation work)

---

## EPIC-02: Architecture Remediation

**Priority:** P0 (Critical)  
**Status:** BLOCKED  
**Progress:** 0%  
**New ID:** 02 (was EPIC-38)  
**Unblock Condition:** EPIC-01 must reach 80%+ complete

### Context
Fixes 130+ layer violations and achieves Clean Architecture compliance. Cannot proceed while file system foundation is changing.

**Reference:** 
- Architecture.md Section 2.1 (Layer Violations)
- Audit: `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 02-01 | Break Circular Dependencies | 1 day | P0 | BLOCKED |
| 02-02 | Fix Infrastructure→Domain Imports | 4h | P0 | BLOCKED |
| 02-03 | Fix Domain→Infrastructure Imports | 4h | P0 | BLOCKED |
| 02-04 | Consolidate ValidationResult Types | 2h | P1 | BLOCKED |
| 02-05 | Consolidate ProviderResponse Types | 2h | P1 | BLOCKED |
| 02-06 | Core Layer Expansion | 4h | P2 | BLOCKED |
| 02-07 | Domain Layer Completion | 4h | P2 | BLOCKED |
| 02-08 | Add Layer Compliance Lint Rules | 2h | P2 | BLOCKED |

### ADR Compliance

| ADR | Related Work | Status |
|-----|--------------|--------|
| ADR-029 | Layer compliance fixes | ❌ Overly optimistic |
| ADR-027 | Store decomposition | ✅ Valid |

**Total Effort:** ~1 week (after unblock)  
**Blocker:** EPIC-01 completion

---

## EPIC-03: 8-bit Design Compliance

**Priority:** P1 (High)  
**Status:** IN_PROGRESS  
**Progress:** 67% (4/6 stories)  
**New ID:** 03 (was EPIC-39)

### Context
Implement 8-bit design system across all UI components.

**Reference:** Design tokens and component audit

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 03-01 | Design Tokens | 4h | P0 | DONE |
| 03-02 | Component Updates | 8h | P0 | DONE |
| 03-03 | Styling Patterns | 4h | P0 | DONE |
| 03-04 | Validation | 4h | P0 | DONE |
| 03-05 | Remaining Components | 8h | P1 | **TODO** |
| 03-06 | Testing/Polish | 4h | P1 | **TODO** |

**Total Effort:** ~1 week  
**Blocker:** None (can run parallel to EPIC-01)

---

## EPIC-04: Multimodal Chat Unification

**Priority:** P1 (High)  
**Status:** VERIFY REQUIRED  
**Progress:** 100% (claimed)  
**New ID:** 04 (was EPIC-40)  
**Verdict:** SUSPICIOUS - Requires verification

### Context
Unified AI service with consistent tool access and permission enforcement.

**Reference:** 
- Architecture.md Section 1 (AI Patterns)
- ADR-026: `_bmad-output/planning-artifacts/architecture/adr-026-ai-service-unification.md`

### ⚠️ Verification Required

**Claim:** 100% complete (12/12 stories)  
**Reality:** Three AI patterns still exist:

| Pattern | Location | Status |
|---------|----------|--------|
| Full Agent System | ChatPanel → /api/chat | ✅ Exists |
| Notes AI Service | note-ai-service.ts | ⚠️ Static selection |
| Hardcoded Provider | VoiceRecordButton.tsx | ❌ 'gemini' hardcoded |

### Required Verification Steps

| Check | Action | Status |
|-------|--------|--------|
| AgentExecutionService exists? | Verify file | ❌ NOT DONE |
| Unified tool access? | Verify implementation | ❌ NOT DONE |
| Hardcoded provider removed? | Check VoiceRecordButton | ❌ NOT DONE |
| Permission enforcement? | Verify integration | ❌ NOT DONE |

### Stories (Require Verification)

| ID | Title | Status | Notes |
|----|-------|--------|-------|
| 04-01 | AgentExecutionService core | **VERIFY** | File may not exist |
| 04-02 | IDE workspace AI migration | **VERIFY** | Check implementation |
| 04-03 | Notes AI migration | **VERIFY** | Check static selection |
| 04-04 | Knowledge workspace AI | **VERIFY** | Check implementation |
| 04-05 | BYOK vault integration | **VERIFY** | Check if complete |
| 04-06 | Agent flags (deepThink, memory) | **VERIFY** | Check implementation |
| 04-07 | Remove duplicate AI code | **VERIFY** | Check cleanup |
| 04-08 | AI monitoring | **VERIFY** | Check implementation |

**Total Effort:** ~1-2 weeks (if incomplete)  
**Verdict:** Mark SUSPICIOUS until verification passes

---

## EPIC-05: Agent Auto-Switching

**Priority:** P1 (High)  
**Status:** PROPOSED  
**Progress:** 0%  
**New ID:** 05

### Context
Enable automatic agent mode switching based on context and user intent.

**Reference:** `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

### Key Finding: Infrastructure EXISTS

| Component | Location | Status |
|-----------|----------|--------|
| ModeClassifier | mode-classifier.ts | ✅ Implemented |
| Scoring System | lines 393-448 | ✅ Working |
| Confidence Thresholds | Configurable | ✅ Ready |

### Required Changes

| Change | Effort | Priority |
|--------|--------|----------|
| Enable auto-switching (remove manual override) | 2h | P0 |
| Add mode field to ChatMessage | 4h | P0 |
| Persist mode in conversation store | 4h | P0 |
| Add UI confidence indicator | 2h | P1 |
| Implement context transfer | 1 day | P1 |
| Build agent registry | 2h | P1 |

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 05-01 | Enable Auto-Switching | 2h | P0 | **TODO** |
| 05-02 | Mode Persistence | 4h | P0 | **TODO** |
| 05-03 | UI Confidence Indicator | 2h | P1 | **TODO** |
| 05-04 | Context Transfer | 1 day | P1 | **TODO** |
| 05-05 | Agent Registry | 2h | P1 | **TODO** |
| 05-06 | Handoff Pattern | 1 week | P2 | **TODO** |

**Total Effort:** ~2 weeks  
**Dependencies:** EPIC-01 completion recommended

---

## EPIC-06: RAG Enhancement

**Priority:** P1 (High)  
**Status:** PROPOSED  
**Progress:** 0%  
**New ID:** 06

### Context
Enhance RAG implementation with best practices from 2025 research.

**Reference:** `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

### Current Implementation

| Component | Status | Notes |
|-----------|--------|-------|
| OramaDB Vector Search | ✅ Implemented | Browser-based |
| Embeddings (384-dim) | ✅ Implemented | all-MiniLM-L6-v2 |
| Hybrid Search | ✅ Implemented | Vector 0.7 + BM25 0.3 |
| N+1 Queries | ❌ Issue | knowledge-source-crud-slice.ts |

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| 06-01 | Fix N+1 Queries | 2h | P0 | In EPIC-01 |
| 06-02 | Add Query Cache | 4h | P0 | **TODO** |
| 06-03 | Metadata Filtering | 4h | P0 | **TODO** |
| 06-04 | Implement Reranker | 1 day | P1 | **TODO** |
| 06-05 | Decompose useRAGStore | 1 day | P0 | In EPIC-01 |
| 06-06 | HyDE Query Augmentation | 2 days | P2 | **TODO** |
| 06-07 | RAG Type Consolidation | 4h | P1 | In EPIC-01 |

**Total Effort:** ~2 weeks
**Dependencies:** None

---

## EPIC-BYOK: Complete BYOK Implementation

**Priority:** P0 (Critical)
**Status:** PROPOSED
**Progress:** 0% (0/4 stories)
**Created:** 2026-01-16
**Source:** Phase 1 Document Audit

### Context
Complete the BYOK (Bring Your Own Key) integration. The vault exists but is not integrated with providers. This epic addresses P0-6 from the Phase 1 audit: BYOK conditional usage and provider integration.

**Reference:** ADR-033, Phase 1 audit report (P0-6, P1-1)

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Credential Vault | EXISTS | AES-256-GCM encryption implemented |
| Provider Integration | INCOMPLETE | Keys not retrieved from vault |
| Conditional Usage | NOT IMPLEMENTED | No per-use-case key selection |
| Audit Logging | MISSING | No key access tracking |

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| BYOK-01 | Complete vault integration | 4h | P0 | TODO |
| BYOK-02 | Provider adapter updates | 2h | P0 | TODO |
| BYOK-03 | Permission enforcement | 2h | P0 | TODO |
| BYOK-04 | UI for key management | 4h | P1 | TODO |

### Story Details

**BYOK-01: Complete vault integration**
- **Files:** Create `src/infrastructure/security/byok-vault-service.ts`
- **Changes:**
  - Integrate vault with all AI providers (OpenAI, Anthropic, Gemini)
  - Implement key retrieval at runtime
  - Add proper error handling for missing keys
- **Acceptance:**
  - ✅ All providers query vault for keys
  - ✅ No hardcoded keys in codebase
  - ✅ Graceful fallback when key missing

**BYOK-02: Provider adapter updates**
- **Files:** `src/domain/services/ai/*provider*.ts`
- **Changes:**
  - Update each provider adapter to use vault
  - Remove any hardcoded keys
  - Add vault dependency injection
- **Acceptance:**
  - ✅ OpenAI adapter uses vault
  - ✅ Anthropic adapter uses vault
  - ✅ Gemini adapter uses vault
  - ✅ No direct API key usage

**BYOK-03: Permission enforcement**
- **Files:** `src/domain/services/ai/permission-service.ts`
- **Changes:**
  - Implement permission levels (auto/prompt/block)
  - Add key access validation
  - Enforce per-use-case key selection
- **Acceptance:**
  - ✅ Tools check permissions before key access
  - ✅ User prompted for sensitive operations
  - ✅ Blocked operations clearly explained

**BYOK-04: UI for key management**
- **Files:** Create `src/presentation/components/settings/ApiKeyManager.tsx`
- **Changes:**
  - Settings UI for adding/removing keys
  - Key validation on add
  - Status display for each provider
- **Acceptance:**
  - ✅ User can add API keys per provider
  - ✅ Keys validated before storage
  - ✅ Clear status indicators

### Dependencies
- None (foundation work, can start immediately)

### Total Effort
**Estimated:** 12 hours
**Blocker:** None

---

## EPIC-PS: Project Space Foundation

**Priority:** P0 (Critical)
**Status:** PROPOSED
**Progress:** 0% (0/5 stories)
**Created:** 2026-01-16
**Source:** Fundamental Truth Checklist, Phase 1 audit

### Context
Implement project space routing rules, platform detection, and entry matrix. Addresses critical gaps P0-1 through P0-5 from Phase 1 audit.

**Reference:** ADR-033 D1-D8, ADR-034, Project ID: `{workspaceType}:proj_{timestamp}_{random}`

### Project ID Format (Canonical)

All project IDs follow the format:
```
{workspaceType}:proj_{timestamp}_{random}
```

Examples:
- `ide:proj_1704787200000_abc123xyz`
- `knowledge:proj_1704787300000_def456uvw`
- `study:proj_1704787400000_ghi789rst`
- `notes:proj_1704787500000_jkl012pqr`

**Type Definition:** `src/domain/types/project-ids.ts`

### Stories

| ID | Title | Effort | Priority | Status |
|----|-------|--------|----------|--------|
| PS-01 | Platform detection implementation | 2h | P0 | TODO |
| PS-02 | Entry matrix implementation | 4h | P0 | TODO |
| PS-03 | Desktop-only IDE guard | 2h | P0 | TODO |
| PS-04 | Project selection hotload | 3h | P1 | TODO |
| PS-05 | Direct landing routes | 2h | P1 | TODO |

### Story Details

**PS-01: Platform detection implementation**
- **Files:** Create `src/infrastructure/platform/platform-detector.ts`
- **Changes:**
  - Implement `getPlatformContract()` function
  - Detect device type (desktop/mobile/tablet) once at app start
  - Cache result for app lifetime
- **Acceptance:**
  - ✅ Platform detected on app initialization
  - ✅ `canAccessFSA`, `canWatchFiles`, `canDoAgenticCoding` correct
  - ✅ No repeated detection calls

**PS-02: Entry matrix implementation**
- **Files:** Create `src/infrastructure/platform/entry-matrix.ts`
- **Changes:**
  - Implement new vs returned user detection
  - Route based on device type
  - Handle project-less state
- **Acceptance:**
  - ✅ New users see onboarding
  - ✅ Returned users see project picker
  - ✅ Desktop defaults to IDE, mobile to Notes
  - ✅ No workspace access without project

**PS-03: Desktop-only IDE guard**
- **Files:** `src/routes/ide.tsx`, `src/routes/ide.$projectId.tsx`
- **Changes:**
  - Add `beforeLoad` guard checking `canAccessIDE`
  - Redirect mobile to Notes with toast
  - Hide IDE entry points on mobile
- **Acceptance:**
  - ✅ Mobile users cannot access IDE
  - ✅ Clear toast explains why
  - ✅ Redirect preserves context

**PS-04: Project selection hotload**
- **Files:** `src/presentation/components/hub/ProjectPickerDialog.tsx`
- **Changes:**
  - Reactive project selection
  - Auto-navigate on selection
  - Support project list with names
- **Acceptance:**
  - ✅ Projects listed with names
  - ✅ Selection triggers immediate navigation
  - ✅ No redundant picker prompts

**PS-05: Direct landing routes**
- **Files:** All workspace route files
- **Changes:**
  - Support direct URLs to workspaces
  - Validate project exists before load
  - Handle invalid project IDs gracefully
- **Acceptance:**
  - ✅ Direct links work (e.g., `/notes/notes:proj_123_abc`)
  - ✅ Invalid project IDs redirect to hub
  - ✅ No route guards blocking valid direct links

### Entry Matrix

| User State | Device | Entry Point | Destination |
|------------|--------|-------------|-------------|
| New | Desktop | Hub | IDE (after folder selection) |
| New | Mobile | Hub | Notes (browser-mode project) |
| Returned | Desktop | Hub | Last workspace or IDE |
| Returned | Mobile | Hub | Notes (browser-mode project) |
| Has Project | Desktop | Direct link | Requested workspace |
| Has Project | Mobile | Direct link | Notes only (IDE blocked) |

### Dependencies
- None (can run parallel to EPIC-BYOK)
- Must complete before EPIC-CC-01 through EPIC-CC-08

### Total Effort
**Estimated:** 13 hours
**Blocker:** None

---

## Dependency Graph

```
EPIC-PS (Project Space Foundation) [P0 - START FIRST]
├── EPIC-BYOK (BYOK) [PARALLEL - Independent]
└── EPIC-CC-01 through EPIC-CC-08 (Correct-Course Phases) [BLOCKED until PS complete]

EPIC-01 (FS Foundation) [P0 - Can run parallel to PS]
├── EPIC-02 (Architecture) [BLOCKED until 01-80%]
└── EPIC-05 (Agent Auto-Switching) [Recommended after 01]

EPIC-03 (8-bit Design) [PARALLEL - Independent]

EPIC-04 (Multimodal) [SUSPICIOUS - Verify first]

EPIC-06 (RAG Enhancement) [PARALLEL - Independent]
```

---

## Sprint Planning Recommendation

### Week 1: Foundation (EPIC-PS + EPIC-BYOK Focus)

**Goal:** Establish project space foundation and BYOK infrastructure

| Day | Focus | Stories |
|-----|-------|---------|
| 1-2 | Platform detection + Vault integration | PS-01, BYOK-01 |
| 3 | Entry matrix + Provider adapters | PS-02, BYOK-02 |
| 4 | Desktop-only IDE guard + Permissions | PS-03, BYOK-03 |
| 5 | Project selection hotload + UI | PS-04, BYOK-04 |
| 6-7 | Direct landing routes + Testing | PS-05, Verification |

**Expected Output:**
- Platform detection working correctly
- BYOK vault integrated with all providers
- IDE blocked on mobile with proper messaging
- Project selection UX improved

### Week 2: File System (EPIC-01 Focus)

**Goal:** Fix critical issues, enable agent auto-switching

| Day | Focus | Stories |
|-----|-------|---------|
| 1-2 | N+1 Queries + Error Boundary | 01-06, 01-07 |
| 3-4 | God Store Decomposition | 01-08 |
| 5 | Mode Persistence | 05-02 |
| 6-7 | Enable Auto-Switching | 05-01 |

**Expected Output:** 
- RAG performance fixed
- Error boundaries on all routes
- Agent auto-switching enabled

### Week 3-4: Architecture (EPIC-02 Focus)

**Goal:** Fix layer violations, unblock architecture work

| Week | Focus | Stories |
|-----|-------|---------|
| 3 | Circular Dependencies + Layer Fixes | 02-01, 02-02, 02-03 |
| 4 | Type Consolidation + Lint Rules | 02-04, 02-05, 02-08 |

**Expected Output:**
- Zero circular dependencies
- Layer compliance verified
- 130+ violations fixed

### Week 5-6: Feature Completion

**Goal:** Complete EPIC-03, 04 verification, EPIC-05

| Week | Focus | Stories |
|-----|-------|---------|
| 5 | 8-bit Design completion | 03-05, 03-06 |
| 5 | EPIC-04 Verification | 04-01 through 04-08 |
| 6 | Agent Auto-Switching Polish | 05-03, 05-04, 05-05 |

**Expected Output:**
- 8-bit design complete
- EPIC-04 verified (complete or rework)
- Agent auto-switching with UI

---

## Quality Gates

### Before Starting Any Epic

- [ ] Dependencies from previous epics are met
- [ ] Architecture.md reviewed for context
- [ ] Related research document reviewed
- [ ] Audit findings addressed (if applicable)

### Before Completing Any Epic

- [ ] All acceptance criteria met
- [ ] TypeScript errors: zero (production code)
- [ ] Build passes: no warnings
- [ ] Tests pass: new + existing
- [ ] God files verified: none >300 lines
- [ ] Architecture compliance verified
- [ ] Documentation updated

---

## Risk Assessment

| Epic | Risk Level | Risk Description | Mitigation |
|------|-----------|-----------------|------------|
| EPIC-01 | LOW | Well-scoped foundation work | Follow audit findings |
| EPIC-02 | HIGH | 130+ layer violations | Incremental fixes |
| EPIC-03 | LOW | Design work, no logic changes | Component audit |
| EPIC-04 | HIGH | May not be 100% complete | Verification required |
| EPIC-05 | MEDIUM | Infrastructure exists, not enabled | Enable carefully |
| EPIC-06 | LOW | Performance optimization | Research-backed |

---

## Handoff to Implementation

### Output Files

| File | description |
|------|---------|
| `architecture.md` | Authority for architecture decisions |
| `epics.md` | This file - epic and story definitions |
| `RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md` | Research backing |
| `adr-audit-report-2026-01-11.md` | ADR validity |

### Next Actions

1. Review this document
2. Approve or adjust priorities
3. Add stories to sprint plan
4. Begin Week 1 implementation

### Success Metrics

- All epics complete within timeline
- Zero P0 bugs in completed work
- Clean Architecture compliance improves
- Agent auto-switching working
- RAG performance optimized

---

**Document Version:** 2.1.0 (Phase 1 Updated)
**Last Updated:** 2026-01-16
**Author:** Architecture Recovery Process
**Status:** AUTHORITARY

**Next Review:** 2026-02-11 (quarterly)

---

---

## EPIC-CC-01: Fix Hooks Error (Phase 1)

**Priority:** P0 (Critical)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/3 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 1  

### Context
Fix Notes workspace crash to unblock user journey. The hooks error is blocking all users from accessing Notes workspace on both desktop and mobile.

**Reference:** Deep Architectural Analysis Part 1.2, 5.2.1, ADR-034 D11

### Stories

| ID | Title | Effort | Priority | Status | Assignee |
|----|-------|--------|----------|--------|----------|
| CC-01-01 | Remove useLiveQuery hook | 30m | P0 | TODO | Team A |
| CC-01-02 | Create custom useFSAProjects() hook | 20m | P0 | TODO | Team A |
| CC-01-03 | Test Notes workspace (desktop + mobile) | 10m | P0 | TODO | Team A |

### Story Details

**CC-01-01: Remove useLiveQuery hook**
- **Files:** `src/routes/notes.lazy.tsx`
- **Changes:** Remove `useLiveQuery` hook from NotesWorkspaceDefault component
- **Acceptance:**
  - ✅ No conditional hook usage
  - ✅ No hooks error in console
  - ✅ Component renders without crash

**CC-01-02: Create custom useFSAProjects() hook**
- **Files:** Create `src/infrastructure/filesystem/use-fsa-projects.ts`
- **Changes:** Create custom hook with proper hook usage pattern
- **Acceptance:**
  - ✅ Hook called at top level (no conditionals)
  - ✅ Filters projects in render, not in hook
  - ✅ Works with both FSA and IndexedDB

**CC-01-03: Test Notes workspace**
- **Files:** Manual testing
- **Changes:** Verify Notes workspace loads on desktop + mobile
- **Acceptance:**
  - ✅ Desktop: Shows project picker
  - ✅ Mobile: Auto-loads browser-mode project
  - ✅ No console errors
  - ✅ No "Rendered fewer hooks than expected" error

### Dependencies
- None (foundation work, can start immediately)

### Total Effort
**Estimated:** 1 hour  
**Actual:** TBD  
**Blocker:** None  

---

## EPIC-CC-02: Fix Route Loading Race Condition (Phase 2)

**Priority:** P0 (Critical)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/4 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 2  
**Blocker:** EPIC-CC-01 completion

### Context
Fix loader race condition with hydration. Routes are failing to load because they query Zustand before hydration completes.

**Reference:** Deep Architectural Analysis Part 1.3, 5.2.2, ADR-034 D12

### Stories

| ID | Title | Effort | Priority | Status | Assignee | Depends On |
|----|-------|--------|----------|--------|----------|------------|
| CC-02-01 | Create waitForHydration() function | 30m | P0 | TODO | Team A | CC-01 |
| CC-02-02 | Update notes.$projectId loader | 20m | P0 | TODO | Team A | CC-02-01 |
| CC-02-03 | Update ide.$projectId loader | 20m | P0 | TODO | Team A | CC-02-01 |
| CC-02-04 | Query Dexie directly | 20m | P0 | TODO | Team A | CC-02-01 |

### Story Details

**CC-02-01: Create waitForHydration() function**
- **Files:** Create `src/infrastructure/persistence/hydration-utils.ts`
- **Changes:** Create event-driven hydration wait function
- **Acceptance:**
  - ✅ Event-driven (not time-based)
  - ✅ Subscribes to Zustand store
  - ✅ Returns immediately if already hydrated

**CC-02-02: Update notes.$projectId loader**
- **Files:** `src/routes/notes.$projectId.lazy.tsx`
- **Changes:** Add `await waitForHydration()` at loader start
- **Acceptance:**
  - ✅ Waits for hydration before querying Dexie
  - ✅ No more redirects to hub
  - ✅ Project loads correctly

**CC-02-03: Update ide.$projectId loader**
- **Files:** `src/routes/ide.$projectId.tsx`
- **Changes:** Add `await waitForHydration()` at loader start
- **Acceptance:**
  - ✅ Waits for hydration before querying Dexie
  - ✅ No more redirects to hub
  - ✅ Project loads correctly

**CC-02-04: Query Dexie directly**
- **Files:** `src/routes/notes.$projectId.lazy.tsx`, `src/routes/ide.$projectId.tsx`
- **Changes:** Remove `getProjectWithRetry()` facade, query `db.projects.get()` directly
- **Acceptance:**
  - ✅ Dexie queried directly (not Zustand)
  - ✅ No retry logic needed
  - ✅ Clean loader implementation

### Dependencies
- CC-02-01: All other stories depend on waitForHydration()

### Total Effort
**Estimated:** 2 hours  
**Actual:** TBD  
**Blocker:** EPIC-CC-01 (hooks error must be fixed first)

---

## EPIC-CC-03: Fix FSA Handle Persistence (Phase 3)

**Priority:** P0 (Critical)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/5 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 3  
**Blocker:** EPIC-CC-02 completion

### Context
Fix FSA handle storage and restoration. Currently handles are stored as `null` and users are prompted every time they navigate to IDE.

**Reference:** Deep Architectural Analysis Part 3.2, 5.2.3, ADR-034 D10

### Stories

| ID | Title | Effort | Priority | Status | Assignee | Depends On |
|----|-------|--------|----------|--------|----------|------------|
| CC-03-01 | Implement Chrome 129 detection | 20m | P0 | TODO | Team B | - |
| CC-03-02 | Store actual FSA handle | 40m | P0 | TODO | Team B | CC-03-01 |
| CC-03-03 | Implement silent restore | 30m | P0 | TODO | Team B | CC-03-02 |
| CC-03-04 | Add handle to ProjectContext | 20m | P0 | TODO | Team B | CC-03-03 |
| CC-03-05 | Update StorageGatewayFactory | 30m | P0 | TODO | Team B | CC-03-04 |

### Story Details

**CC-03-01: Implement Chrome 129 detection**
- **Files:** `src/infrastructure/filesystem/handle-persistence.ts`
- **Changes:** Add `supportsStructuredClone()` detection
- **Acceptance:**
  - ✅ Detects Chrome 129+ support
  - ✅ Falls back gracefully for older versions
  - ✅ Feature flag for conditional logic

**CC-03-02: Store actual FSA handle**
- **Files:** `src/infrastructure/filesystem/handle-persistence.ts`
- **Changes:** Store actual handle when `structuredClone` is available
- **Acceptance:**
  - ✅ Handle stored in IndexedDB (not null)
  - ✅ Uses `structuredClone` when available
  - ✅ Properly typed

**CC-03-03: Implement silent restore**
- **Files:** `src/infrastructure/filesystem/handle-persistence.ts`
- **Changes:** Restore from stored handle without prompting user
- **Acceptance:**
  - ✅ No `showDirectoryPicker()` call
  - ✅ Returns stored handle directly
  - ✅ Fallback to prompt only if handle unavailable

**CC-03-04: Add handle to ProjectContext**
- **Files:** `src/presentation/components/common/ProjectContext.tsx`
- **Changes:** Add FSA handle to context provider
- **Acceptance:**
  - ✅ Handle available via `useFSAHandle()` hook
  - ✅ Provided to all children
  - ✅ Type-safe

**CC-03-05: Update StorageGatewayFactory**
- **Files:** `src/infrastructure/filesystem/storage-gateway-factory.ts`
- **Changes:** Get FSA handle from context, not Dexie
- **Acceptance:**
  - ✅ Factory reads from ProjectContext
  - ✅ StorageGateway receives handle
  - ✅ No redundant Dexie queries

### Dependencies
- Sequential: CC-03-01 → CC-03-02 → CC-03-03 → CC-03-04 → CC-03-05

### Total Effort
**Estimated:** 3 hours  
**Actual:** TBD  
**Blocker:** EPIC-CC-02 (race condition must be fixed first)

---

## EPIC-CC-04: Fix State Scoping (Phase 4)

**Priority:** P1 (High)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/4 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 4  
**Blocker:** EPIC-CC-03 completion

### Context
Fix state to be scoped by [projectId+workspaceId]. Currently state is global and cross-contaminates between projects.

**Reference:** Deep Architectural Analysis Part 5.2.4, ADR-034 D11

### Stories

| ID | Title | Effort | Priority | Status | Assignee | Depends On |
|----|-------|--------|----------|--------|----------|------------|
| CC-04-01 | Add project scope to IDE store | 30m | P1 | TODO | Team B | - |
| CC-04-02 | Add project scope to workspace store | 30m | P1 | TODO | Team A | - |
| CC-04-03 | Use Dexie for workspace state | 30m | P1 | TODO | Team A | CC-04-02 |
| CC-04-04 | Add cleanup on workspace switch | 30m | P1 | TODO | Team A | CC-04-03 |

### Story Details

**CC-04-01: Add project scope to IDE store**
- **Files:** `src/infrastructure/persistence/stores/ide/useIDEStore.ts`
- **Changes:** Hydrate current project with Dexie data
- **Acceptance:**
  - ✅ State scoped by [projectId+workspaceId]
  - ✅ No cross-contamination
  - ✅ Typed correctly

**CC-04-02: Add project scope to workspace store**
- **Files:** `src/infrastructure/persistence/stores/workspace/workspace-store.ts`
- **Changes:** Use Dexie, not localStorage for persistence
- **Acceptance:**
  - ✅ Uses Dexie for project-specific data
  - ✅ Scoped by [projectId+workspaceId]
  - ✅ Composite key implementation

**CC-04-03: Use Dexie for workspace state**
- **Files:** Same as CC-04-02
- **Changes:** Replace localStorage with Dexie queries
- **Acceptance:**
  - ✅ Direct Dexie queries
  - ✅ Hot reactivity with Dexie hooks
  - ✅ No manual serialization needed

**CC-04-04: Add cleanup on workspace switch**
- **Files:** All stores in `src/infrastructure/persistence/stores/`
- **Changes:** Reset/scope-change handlers
- **Acceptance:**
  - ✅ State resets on workspace switch
  - ✅ No stale data leaks
  - ✅ Clean transitions

### Dependencies
- Sequential stories for consistency

### Total Effort
**Estimated:** 2 hours  
**Actual:** TBD  
**Blocker:** EPIC-CC-03 (FSA handle must be fixed first)

---

## EPIC-CC-05: Fix Platform Guards (Phase 5)

**Priority:** P1 (High)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/4 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 5  
**Blocker:** EPIC-CC-04 completion

### Context
Add platform guards to all routes. Currently mobile users can access IDE and there are no clear error messages.

**Reference:** Deep Architectural Analysis Part 2.3, 5.2.5, ADR-034 D13

### Stories

| ID | Title | Effort | Priority | Status | Assignee | Depends On |
|----|-------|--------|----------|--------|----------|------------|
| CC-05-01 | Add guard to /ide route | 15m | P1 | TODO | Team A | - |
| CC-05-02 | Add guard to /ide/$projectId | 15m | P1 | TODO | Team A | CC-05-01 |
| CC-05-03 | Hide IDE icon on mobile | 15m | P1 | TODO | Team B | - |
| CC-05-04 | Add toast messages | 15m | P1 | TODO | Team B | CC-05-02 |

### Story Details

**CC-05-01: Add guard to /ide route**
- **Files:** `src/routes/ide.tsx`
- **Changes:** Add `beforeLoad` guard checking `canAccessIDE`
- **Acceptance:**
  - ✅ Checks platform contract
  - ✅ Mobile users blocked
  - ✅ Redirects to Notes with reason

**CC-05-02: Add guard to /ide/$projectId**
- **Files:** `src/routes/ide.$projectId.tsx` (already has guard)
- **Changes:** Verify and improve existing guard
- **Acceptance:**
  - ✅ Platform check works
  - ✅ Redirect with reason
  - ✅ Toast message shown

**CC-05-03: Hide IDE icon on mobile**
- **Files:** `src/presentation/components/common/MainSidebar.tsx`
- **Changes:** Conditional rendering based on `deviceType`
- **Acceptance:**
  - ✅ IDE icon hidden on mobile/tablet
  - ✅ Visible on desktop only
  - ✅ No layout shifts

**CC-05-04: Add toast messages**
- **Files:** All route files with guards
- **Changes:** Show explanation toast on redirect
- **Acceptance:**
  - ✅ Clear error message
  - ✅ User understands why blocked
  - ✅ Actionable suggestion

### Dependencies
- Can run in parallel

### Total Effort
**Estimated:** 1 hour  
**Actual:** TBD  
**Blocker:** EPIC-CC-04 (state scoping must be fixed first)

---

## EPIC-CC-06: Remove Temp Project (Phase 6)

**Priority:** P1 (High)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/3 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 6  
**Blocker:** EPIC-CC-05 completion

### Context
Remove temp project option (ADR-033 D5 violation). Currently users see "temp project" option and can create IndexedDB projects on desktop.

**Reference:** Deep Architectural Analysis Part 2.2, 5.2.6, ADR-033 D5

### Stories

| ID | Title | Effort | Priority | Status | Assignee | Depends On |
|----|-------|--------|----------|--------|----------|------------|
| CC-06-01 | Remove temp project option | 20m | P1 | TODO | Team B | - |
| CC-06-02 | Remove browser DB option on desktop | 20m | P1 | TODO | Team A | CC-06-01 |
| CC-06-03 | Add project list | 20m | P1 | TODO | Team A | CC-06-02 |

### Story Details

**CC-06-01: Remove temp project option**
- **Files:** `src/routes/ide.tsx`
- **Changes:** Delete temp project logic entirely
- **Acceptance:**
  - ✅ No "temp project" option
  - ✅ ADR-033 D5 compliance
  - ✅ Clean route

**CC-06-02: Remove browser DB option on desktop**
- **Files:** `src/presentation/components/hub/ProjectPickerDialog.tsx`
- **Changes:** Hide IndexedDB option when `canAccessFSA` is true
- **Acceptance:**
  - ✅ Desktop: FSA only
  - ✅ Mobile: IndexedDB only
  - ✅ Platform-respectful

**CC-06-03: Add project list**
- **Files:** Same as CC-06-02
- **Changes:** Show list of existing projects with names
- **Acceptance:**
  - ✅ Users see project names
  - ✅ No need to select folder blindly
  - ✅ Search/filter capability

### Dependencies
- Sequential: CC-06-01 → CC-06-02 → CC-06-03

### Total Effort
**Estimated:** 1 hour  
**Actual:** TBD  
**Blocker:** EPIC-CC-05 (platform guards must be fixed first)

---

## EPIC-CC-07: Fix Terminal Loading (Phase 7)

**Priority:** P2 (Medium)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/3 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 7  
**Blocker:** EPIC-CC-06 completion

### Context
Fix WebContainer terminal boot. Currently terminal loads forever and shows no prompt.

**Reference:** Deep Architectural Analysis Part 5.2.7

### Stories

| ID | Title | Effort | Priority | Status | Assignee | Depends On |
|----|-------|--------|----------|--------|----------|------------|
| CC-07-01 | Investigate WebContainer boot | 30m | P2 | TODO | Team B | - |
| CC-07-02 | Fix WebContainer config | 30m | P2 | TODO | Team B | CC-07-01 |
| CC-07-03 | Add error feedback | 20m | P2 | TODO | Team B | CC-07-02 |

### Story Details

**CC-07-01: Investigate WebContainer boot**
- **Files:** `src/presentation/components/ide/IDELayout.tsx`
- **Changes:** Debug and understand boot failure
- **Acceptance:**
  - ✅ Root cause identified
  - ✅ Boot sequence documented
  - ✅ Fix plan created

**CC-07-02: Fix WebContainer config**
- **Files:** Same as CC-07-01
- **Changes:** Correct configuration based on investigation
- **Acceptance:**
  - ✅ Terminal boots successfully
  - ✅ Shows prompt
  - ✅ User can run commands

**CC-07-03: Add error feedback**
- **Files:** Same as CC-07-01
- **Changes:** Show error message if boot fails
- **Acceptance:**
  - ✅ Clear error message
  - ✅ User sees feedback
  - ✅ No silent failures

### Dependencies
- Sequential: CC-07-01 → CC-07-02 → CC-07-03

### Total Effort
**Estimated:** 2 hours  
**Actual:** TBD  
**Blocker:** EPIC-CC-06 (temp project must be removed first)

---

## EPIC-CC-08: End-to-End Testing (Phase 8)

**Priority:** P2 (Medium)  
**Status:** READY_FOR_DEV  
**Progress:** 0% (0/3 stories)  
**Created:** 2026-01-15  
**Source:** Deep Architectural Analysis Phase 8  
**Blocker:** All previous epics completion

### Context
Verify all user journeys work correctly. This is the final validation that all fixes work together.

**Reference:** Deep Architectural Analysis Part 5.3, 5.2.8

### Stories

| ID | Title | Effort | Priority | Status | Assignee | Depends On |
|----|-------|--------|----------|--------|----------|------------|
| CC-08-01 | Test desktop user journeys | 40m | P2 | TODO | Team A | CC-01 through CC-07 |
| CC-08-02 | Test mobile user journeys | 30m | P2 | TODO | Team A | CC-01 through CC-07 |
| CC-08-03 | Verify ADR compliance | 20m | P2 | TODO | Team B | CC-08-01, CC-08-02 |

### Story Details

**CC-08-01: Test desktop user journeys**
- **Test Cases:**
  1. Returned Desktop - Notes
  2. Returned Desktop - IDE
  3. Returned Desktop - Project Creation
  4. New Desktop - First Visit
- **Acceptance:**
  - ✅ All test cases pass
  - ✅ No console errors
  - ✅ Clear UX flow

**CC-08-02: Test mobile user journeys**
- **Test Cases:**
  1. New Mobile - First Visit
  2. Returned Mobile - Notes
  3. Returned Mobile - IDE Access Attempt
- **Acceptance:**
  - ✅ All test cases pass
  - ✅ No console errors
  - ✅ IDE properly blocked

**CC-08-03: Verify ADR compliance**
- **Check:**
  1. ADR-033 D1: Platform Detection
  2. ADR-033 D2: FSA Handle Persistence
  3. ADR-034 D11: State Scoping
  4. ADR-034 D12: Route Loading
  5. ADR-034 D13: Platform Guards
- **Acceptance:**
  - ✅ All ADR decisions implemented
  - ✅ No violations found
  - ✅ Governance verified

### Dependencies
- Sequential: CC-08-01 → CC-08-02 → CC-08-03

### Total Effort
**Estimated:** 2 hours  
**Actual:** TBD  
**Blocker:** All previous epics (CC-01 through CC-07)

---

## Correct-Course Architectural Remediation Epics Summary

### Overview

This section defines 8 epics (EPIC-CC-01 through EPIC-CC-08) that implement the phases from the Deep Architectural Analysis (2026-01-15). These epics are designed to progressively fix all identified issues blocking user journeys.

### Epic Status Matrix

| Epic | Name | Priority | Status | Blocker |
|------|------|----------|--------|----------|
| EPIC-CC-01 | Fix Hooks Error | P0 | READY_FOR_DEV | None |
| EPIC-CC-02 | Fix Route Loading Race Condition | P0 | READY_FOR_DEV | CC-01 |
| EPIC-CC-03 | Fix FSA Handle Persistence | P0 | READY_FOR_DEV | CC-02 |
| EPIC-CC-04 | Fix State Scoping | P1 | READY_FOR_DEV | CC-03 |
| EPIC-CC-05 | Fix Platform Guards | P1 | READY_FOR_DEV | CC-04 |
| EPIC-CC-06 | Remove Temp Project | P1 | READY_FOR_DEV | CC-05 |
| EPIC-CC-07 | Fix Terminal Loading | P2 | READY_FOR_DEV | CC-06 |
| EPIC-CC-08 | End-to-End Testing | P2 | READY_FOR_DEV | CC-01 through CC-07 |

### Sequential Execution Plan

```
Week 1: EPIC-CC-01, EPIC-CC-02 (Team A focus)
Week 1-2: EPIC-CC-03, EPIC-CC-04 (Team B focus)
Week 2: EPIC-CC-05, EPIC-CC-06 (Team A + B parallel)
Week 2-3: EPIC-CC-07 (Team B)
Week 3: EPIC-CC-08 (Team A + B validation)
```

### Total Effort

- **Epics:** 8
- **Stories:** 29
- **Estimated Total:** 12-14 hours
- **Team Distribution:**
  - Team A: 13 stories (~7 hours)
  - Team B: 16 stories (~7 hours)
  - Joint: 0 stories (2 hours)

---

*This document governs all feature development for Via-Gent*
*Supersedes: epics.md v2.0.0 (2026-01-11)*
*Updated: Phase 1 - Added EPIC-BYOK, EPIC-PS, Project ID format*
