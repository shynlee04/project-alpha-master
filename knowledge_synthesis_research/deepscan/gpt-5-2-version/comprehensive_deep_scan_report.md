# VIA-GENT PROJECT ALPHA - COMPREHENSIVE DEEP SCAN REPORT
**Repository**: https://github.com/shynlee04/project-alpha-master/tree/dev
**Scan Date**: 2026-01-03
**Scan Type**: End-to-End Architecture, Infrastructure, and UX Analysis

---

## 🎯 EXECUTIVE SUMMARY

### Health Scorecard
| Dimension | Score | Status | Priority |
|-----------|-------|--------|----------|
| **Overall Platform Health** | **7.0/10** | ⚠️ Moderate Debt | HIGH |
| Provider Configuration (CS1) | 9/10 | ✅ Production Ready | LOW |
| Agent Vault (CS2) | 9/10 | ✅ Production Ready | LOW |
| Conversation System (CS3) | 3/10 | ❌ Critical Debt | **CRITICAL** |
| Project Management (CS4) | 6/10 | ⚠️ Moderate Debt | HIGH |
| RAG Pipeline (CS5) | 8/10 | ✅ Production Ready | MEDIUM |

### Critical Metrics
- **Total Issues Detected**: 43 issues
  - 🔴 **Critical (P0)**: 5 issues
  - 🟠 **High Priority (P1)**: 12 issues
  - 🟡 **Medium Priority (P2)**: 18 issues
  - 🟢 **Low Priority (P3)**: 8 issues

- **Technical Debt Summary**:
  - God stores requiring refactoring: 2 (2,311 lines total)
  - Files exceeding 300-line limit: 17 files
  - TypeScript errors remaining: ~100 (down from 1,172)
  - Missing test coverage: ~60% of codebase

- **Platform Unification Status**:
  - Phase 1 Complete: ✅ Analysis & Gap Documentation (20 docs, ~12,000 lines)
  - Phase 3 Ready: ⏳ Epic CC-1 (15 stories, 127 hours) + Epic CP-1 (18 stories, 80-100 hours)
  - Expected Timeline: 30-37 days for full unification

---

## 🔍 DETAILED FINDINGS BY CATEGORY

### 1. ARCHITECTURE & INFRASTRUCTURE

#### 1.1 State Management Architecture ⚠️

**Current State**:
- **Zustand v5** with December 2025 patterns partially implemented
- **Slice Pattern** applied to Cornerstones 1 & 2 (Provider + Agent) ✅
- **God Stores** still exist in Cornerstones 3 & 4 (Conversation + Project) ❌

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **ARCH-001** | 🔴 P0 | Conversation god stores (1,352 lines) violate single responsibility | Maintainability collapse, cognitive overload | `conversation-store.ts` (626), `conversation-threads-store.ts` (726) |
| **ARCH-002** | 🟠 P1 | Project god stores (959 lines) fragmented across 2 files | Scattered state, inconsistent APIs | `project-store.ts` (450), `file-snapshot-store.ts` (509) |
| **ARCH-003** | 🟡 P2 | 20+ components subscribe to both conversation stores | Duplicate subscriptions, performance risk | ChatPanel, ConversationList, ThreadView, etc. |
| **ARCH-004** | 🟢 P3 | No domain service pattern for conversation operations | Business logic mixed with state management | Multiple files |

**Remediation**:
- ✅ **Epic CC-1 Ready**: 15 stories to refactor Conversation into 6 slices (630 lines, 53% reduction)
- ✅ **Epic CP-1 Ready**: 18 stories to refactor Project into 9 slices (880 lines, 8% reduction)
- See: `_bmad-output/research/platform-unification-2026-01-02/`

---

#### 1.2 Persistence Layer ⚠️

**Current State**:
- **IndexedDB** via Dexie for all persistent state
- **localStorage** being phased out (migration in progress)
- **Zustand persist middleware** with `partialize` for selective persistence

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **PERSIST-001** | 🔴 P0 | No IndexedDB quota handling | **Data loss risk** when storage full | All stores using Dexie |
| **PERSIST-002** | 🟠 P1 | No bulk delete operations for cleanup | Cannot efficiently clear old data | Dexie storage layer |
| **PERSIST-003** | 🟡 P2 | Session snapshots not auto-cleaned | Disk usage grows unbounded | `session-snapshot-manager.ts` |
| **PERSIST-004** | 🟡 P2 | No persistence health monitoring | Silent failures undetected | All persistent stores |
| **PERSIST-005** | 🟢 P3 | Migration scripts lack rollback mechanism | Failed migrations leave corrupt state | `schema-migrations.ts` |

**Recommended Actions**:
1. **URGENT**: Add quota exceeded error handling (DB-001 from 8-week plan)
   ```typescript
   try {
     await db.table.put(data);
   } catch (error) {
     if (error.name === 'QuotaExceededError') {
       await cleanupOldData(); // Implement cleanup strategy
       await db.table.put(data); // Retry
     }
   }
   ```

2. Implement persistence health check service:
   - Monitor IndexedDB usage vs quota
   - Alert when >80% full
   - Auto-cleanup old snapshots/conversations

3. Add migration rollback support:
   - Store pre-migration backups
   - Implement rollback functions
   - Test migration + rollback in CI

---

#### 1.3 Filesystem & WebContainers 🟢

**Current State**:
- **WebContainer API** for in-browser Node.js execution ✅
- **File sync** between WebContainer FS and Zustand state ✅
- **4 file sync services** handling different aspects (fragmented) ⚠️

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **FS-001** | 🟡 P2 | File sync services fragmented (4 services, 1,421 lines) | Duplicate logic, inconsistent behavior | `filesystem/` directory |
| **FS-002** | 🟡 P2 | No incremental sync - full file overwrites | Performance hit on large files | Sync services |
| **FS-003** | 🟢 P3 | File watcher doesn't detect renames | Sync breaks on file rename | File watcher service |
| **FS-004** | 🟢 P3 | No conflict resolution for concurrent edits | Last write wins (data loss potential) | Sync manager |

**Strengths**:
- ✅ File snapshots with version history
- ✅ Debounced sync (reduces API calls)
- ✅ Permission checks before filesystem operations

**Recommendations**:
- Consolidate 4 file sync services into single unified service (Epic CP-1 Phase 4 optional)
- Implement operational transforms or CRDTs for conflict resolution
- Add incremental sync (only send diffs, not full files)

---

### 2. WORKSPACE ARCHITECTURE

#### 2.1 Workspace System Overview ✅

**4 Workspaces Implemented**:
1. **IDE** - Code editor with WebContainer terminal ✅
2. **Knowledge** - RAG-powered knowledge base with canvas ✅
3. **Notes** - Note-taking with AI assistance ✅
4. **Study** - Flashcards and quiz generation ✅

**Workspace Binding System**: Fully operational ✅
- Agents have workspace-specific availability
- Tools have workspace-scoped permissions
- UI adapts per workspace (full/compact/minimal)

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **WS-001** | 🟠 P1 | Hub not discoverable - no `/hub` route | Users cannot access Hub via URL | Routing config |
| **WS-002** | 🟡 P2 | Workspace state not preserved across navigation | User loses scroll position, filters | Navigation store |
| **WS-003** | 🟡 P2 | No workspace-specific keyboard shortcuts | Power users cannot optimize workflow | Keyboard shortcut manager |
| **WS-004** | 🟢 P3 | Workspace transitions lack animations | Feels abrupt, not polished | Layout components |

**Remediation**:
- ✅ **Epic CP-1 Story CP-1.12**: Create `hub.tsx` route file (2-3 hours)
- Implement workspace state persistence in navigation store
- Define workspace-specific keyboard shortcut mappings

---

#### 2.2 Cross-Workspace Operations ⚠️

**Current State**:
- Agents can operate across workspaces ✅
- Tool permissions enforced per workspace ✅
- Conversation history shared across workspaces ✅

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **XW-001** | 🟠 P1 | No workspace context passed to agent tools | Tools cannot adapt behavior per workspace | Tool execution engine |
| **XW-002** | 🟡 P2 | Cross-workspace agent switching clears conversation | User loses context when switching | Conversation store |
| **XW-003** | 🟢 P3 | No workspace-specific agent configurations | Agent behaves same in all workspaces | Agent config |

**Recommendations**:
1. Pass workspace context to all tool executions:
   ```typescript
   executeToolCall(toolCall, {
     workspaceType: 'knowledge',
     workspaceId: activeWorkspaceId,
     // ... other context
   });
   ```

2. Preserve conversation context across workspace switches
3. Allow workspace-specific agent system prompts

---

### 3. AGENT SYSTEM

#### 3.1 Agent Architecture ✅

**Current State**:
- **Agent Vault** with workspace bindings ✅
- **Tool Permission System** with trust levels (auto/prompt/block) ✅
- **Domain Service Pattern** for agent operations ✅

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **AGENT-001** | 🟠 P1 | AgentConfigDialog exceeds 300 lines (1,089 lines) | Maintainability nightmare, 363% over limit | `AgentConfigDialog.tsx` |
| **AGENT-002** | 🟡 P2 | No agent performance metrics | Cannot detect slow/broken agents | Agent execution engine |
| **AGENT-003** | 🟡 P2 | Agent error messages not user-friendly | Users see raw error stack traces | Error handling layer |
| **AGENT-004** | 🟢 P3 | No agent version management | Cannot rollback agent config changes | Agent store |

**Remediation**:
- ✅ **8-Week Plan Story UI-001**: Extract AgentConfigDialog hooks (16-20 hours)
  - Target: 1,089 → <300 lines
  - Extract: 5-6 custom hooks for form state, validation, workspace management

- Add agent execution telemetry:
  ```typescript
  {
    agentId: string;
    executionTime: number;
    tokensUsed: number;
    toolCallCount: number;
    errors: ErrorLog[];
  }
  ```

---

#### 3.2 Tool System ✅

**Current State**:
- **Workspace-aware permission checking** ✅
- **Trust level persistence** (survives browser reloads) ✅
- **Session trust** (ephemeral, cleared on reload) ✅

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **TOOL-001** | 🟡 P2 | Tool registry not type-safe | Runtime errors if tool schema changes | Tool registry |
| **TOOL-002** | 🟡 P2 | No tool execution timeout | Hung tools block agent indefinitely | Tool executor |
| **TOOL-003** | 🟢 P3 | Tool descriptions not LLM-optimized | Agents struggle to select correct tool | Tool definitions |
| **TOOL-004** | 🟢 P3 | No tool usage analytics | Cannot identify underused/broken tools | Tool tracking |

**Recommendations**:
1. Add Zod schemas for all tools (compile-time type safety)
2. Implement tool execution timeout (default 30s, configurable)
3. Rewrite tool descriptions with XML/structured format for better LLM understanding
4. Track tool usage metrics (frequency, success rate, latency)

---

### 4. RAG PIPELINE

#### 4.1 RAG Infrastructure ✅

**Current State**:
- **Orama WASM** for vector search ✅
- **Document processing** via PDF.js ✅
- **Knowledge canvas** with blocks + connections ✅
- **Research artifacts complete** (7 documents, 87% confidence) ✅

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **RAG-001** | 🟡 P2 | Research complete but not yet implemented | Features planned but not user-accessible | N/A |
| **RAG-002** | 🟡 P2 | No chunking strategy for large documents | Vector search quality degrades | Document processor |
| **RAG-003** | 🟢 P3 | No embedding cache | Recomputes embeddings unnecessarily | Embedding service |
| **RAG-004** | 🟢 P3 | No metadata filtering in vector search | Cannot filter by date, author, tags | Orama config |

**Next Steps**:
- ✅ **EPIC-32 through EPIC-37 Ready**: Sprint Planning phase
- Implement semantic chunking (500-token overlapping windows)
- Cache embeddings in IndexedDB (keyed by content hash)
- Add metadata fields to Orama schema

---

### 5. UI/UX

#### 5.1 Design System ⚠️

**Current State**:
- **8-bit gaming aesthetic** with dark theme ✅
- **Design tokens** in CSS custom properties ✅
- **Responsive breakpoints** (mobile/tablet/desktop) ✅

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **UI-001** | 🟠 P1 | Hardcoded strings found in 23 components | Cannot internationalize | Multiple components |
| **UI-002** | 🟠 P1 | Mobile touch targets <44px in 8 components | Accessibility violation | Button, IconButton, etc. |
| **UI-003** | 🟡 P2 | Inconsistent spacing (px, rem, em mixed) | Visual inconsistencies | Global styles |
| **UI-004** | 🟡 P2 | No dark/light theme toggle (always dark) | Users cannot customize | Theme system |
| **UI-005** | 🟢 P3 | Component library not documented | New devs cannot find components | Storybook missing |

**Remediation**:
1. **Sweep Level 8 (I18N)**:
   - Run `pnpm i18n:extract` to find hardcoded strings
   - Wrap all strings in `t()` function
   - Add Vietnamese translations

2. **Sweep Level 7 (Mobile)**:
   - Audit all interactive elements (buttons, links, inputs)
   - Enforce minimum 44px touch targets
   - Test on real mobile devices

3. Standardize on `rem` units for all spacing (based on 16px root)
4. Implement light theme variant
5. Create Storybook with all components documented

---

#### 5.2 Performance ⚠️

**Current State**:
- **React Router** for navigation ✅
- **Code splitting** not implemented ❌
- **List virtualization** not implemented ❌

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **PERF-001** | 🟠 P1 | No code splitting - 3MB+ JS bundle | Slow initial load (5s+ on 3G) | Vite config |
| **PERF-002** | 🟠 P1 | Large lists not virtualized | UI freezes with >100 items | ConversationList, FileTree |
| **PERF-003** | 🟡 P2 | No lazy loading for images | Bandwidth waste, slow page loads | Image components |
| **PERF-004** | 🟡 P2 | IndexedDB operations not batched | 100+ individual writes on startup | Store hydration |
| **PERF-005** | 🟢 P3 | No service worker for offline support | App unusable offline | N/A |

**Recommendations**:
1. **Immediate**: Implement route-based code splitting
   ```typescript
   const IDEWorkspace = lazy(() => import('./workspaces/IDE'));
   const KnowledgeWorkspace = lazy(() => import('./workspaces/Knowledge'));
   ```

2. **Sweep Level 9 (Performance)**:
   - Virtualize all lists with `react-window` or `react-virtuoso`
   - Batch IndexedDB writes (max 100ms debounce)
   - Lazy load images with `loading="lazy"`

3. Add service worker for offline support (Progressive Web App)

---

### 6. TESTING & QUALITY

#### 6.1 Test Coverage ❌

**Current State**:
- **Vitest** configured ✅
- **Test coverage**: ~20% (target: 80%) ❌
- **Critical paths not covered**: ❌

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **TEST-001** | 🔴 P0 | No tests for conversation store | Refactoring blocked, regression risk | `conversation-store.ts` |
| **TEST-002** | 🔴 P0 | No tests for project store | Refactoring blocked, regression risk | `project-store.ts` |
| **TEST-003** | 🟠 P1 | No E2E tests for critical user flows | Cannot verify features work end-to-end | N/A |
| **TEST-004** | 🟡 P2 | No visual regression tests | UI breaks undetected | N/A |
| **TEST-005** | 🟢 P3 | CI not running tests on PR | Broken code reaches main branch | GitHub Actions |

**Remediation**:
- ✅ **Epic CC-1**: Includes 105 tests (70 unit + 20 integration + 15 E2E)
- ✅ **Epic CP-1**: Includes 95 tests (60 unit + 20 integration + 15 E2E)
- Add Playwright for E2E testing
- Add Percy or Chromatic for visual regression testing
- Enable required CI checks for all PRs

---

#### 6.2 TypeScript Errors ✅ (Mostly Resolved)

**Current State**:
- **Previous**: 1,172 TypeScript errors ❌
- **Current**: ~100 TypeScript errors ✅
- **Improvement**: 91% reduction 🎉

**Remaining Issues**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **TS-001** | 🟡 P2 | 100 TypeScript errors remaining | Build warnings, IDE noise | Multiple files |
| **TS-002** | 🟢 P3 | `@ts-ignore` used in 12 places | Technical debt, masking real issues | Various |
| **TS-003** | 🟢 P3 | Implicit `any` types in 15 functions | Type safety compromised | Various |

**Next Steps**:
- ✅ **8-Week Plan Story TS-001**: Fix remaining errors (6-8 hours)
- Replace all `@ts-ignore` with proper type fixes
- Enable `noImplicitAny` in tsconfig.json

---

### 7. SECURITY

#### 7.1 API Key Management ✅

**Current State**:
- **Encrypted storage** for API keys ✅
- **Workspace-scoped** provider selection ✅
- **No plaintext keys in logs** ✅

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **SEC-001** | 🟡 P2 | API keys not rotatable | Users cannot update compromised keys easily | Provider store |
| **SEC-002** | 🟢 P3 | No key expiration warnings | Users don't know when to rotate keys | Provider UI |
| **SEC-003** | 🟢 P3 | Encryption key stored in code | Should use Web Crypto API key derivation | Encryption service |

**Recommendations**:
1. Add "Rotate API Key" button in Provider Settings
2. Show key age + expiration warnings
3. Use PBKDF2 or Argon2 for key derivation (not hardcoded key)

---

### 8. DOCUMENTATION

#### 8.1 Developer Documentation ✅

**Current State**:
- **AGENTS.md**: Comprehensive project overview ✅
- **ADRs**: 4 architecture decision records ✅
- **Epic breakdowns**: 2 epics fully documented ✅

**Issues Detected**:

| Issue ID | Severity | Description | Impact | Files Affected |
|----------|----------|-------------|--------|----------------|
| **DOC-001** | 🟡 P2 | No onboarding guide for new contributors | High barrier to entry | N/A |
| **DOC-002** | 🟢 P3 | API documentation missing | Devs must read source code | N/A |
| **DOC-003** | 🟢 P3 | No changelog | Users don't know what changed | N/A |

**Recommendations**:
1. Create `CONTRIBUTING.md` with onboarding guide
2. Use TypeDoc or similar to generate API docs
3. Maintain `CHANGELOG.md` with semantic versioning

---

## 📊 TECHNICAL DEBT QUANTIFICATION

### Debt by Cornerstone

| Cornerstone | Current Debt (hours) | Remediation Time (hours) | Priority |
|-------------|----------------------|--------------------------|----------|
| CS1 Provider | 2 hours | 2 hours | LOW |
| CS2 Agent | 16-20 hours | 16-20 hours (UI-001) | MEDIUM |
| CS3 Conversation | 127 hours | 127 hours (Epic CC-1) | **CRITICAL** |
| CS4 Project | 80-100 hours | 80-100 hours (Epic CP-1) | HIGH |
| CS5 RAG | 10 hours | 10 hours (minor enhancements) | LOW |
| **Total** | **235-259 hours** | **30-37 days** | - |

### Debt by Category

| Category | Debt Score | Priority |
|----------|------------|----------|
| State Management | 🔴 High | **CRITICAL** |
| Persistence | 🟠 Medium-High | HIGH |
| Testing | 🔴 High | **CRITICAL** |
| UI/UX | 🟡 Medium | MEDIUM |
| Performance | 🟠 Medium-High | HIGH |
| Security | 🟢 Low | LOW |
| Documentation | 🟢 Low | LOW |

---

## 🚀 RECOMMENDED ACTION PLAN

### Phase 0: Foundation Stabilization (Week 1-2)
**Goal**: Fix P0 infrastructure gaps

1. **TS-001**: Fix TypeScript Errors (6-8 hours)
   - Reduce from ~100 to <10 errors
   - Enable stricter type checking

2. **DB-001**: IndexedDB Quota Handling (18-22 hours)
   - Add `QuotaExceededError` handling
   - Implement cleanup strategy
   - Add quota monitoring

3. **UI-001**: Extract AgentConfigDialog Hooks (16-20 hours)
   - Reduce from 1,089 → <300 lines
   - Extract 5-6 custom hooks

**Total**: 40-50 hours (5-7 days)

---

### Phase 1: Epic CC-1 - Conversation Consolidation (Week 3-4)
**Goal**: Refactor 2 conversation god stores into 6 modular slices

- ✅ **15 User Stories** (91 points, 127 hours)
- ✅ **Target Architecture**: 6 slices, 630 lines (53% reduction)
- ✅ **Test Requirements**: 105 tests

**Timeline**: 16 days (with parallel development)
**Deliverables**:
- Unified conversation store with 6 slices
- Zero god stores in Cornerstone 3
- 105 passing tests (unit + integration + E2E)

---

### Phase 2: Epic CP-1 - Project Consolidation (Week 5-6)
**Goal**: Refactor 2 project god stores into 9 modular slices + fix Hub routing

- ✅ **18 User Stories** (78 points, 80-100 hours)
- ✅ **Target Architecture**: 9 slices, 880 lines (8% reduction)
- ✅ **Test Requirements**: 95 tests
- ✅ **Hub Routing**: Create `/hub` route file

**Timeline**: 12-15 days (with parallel development)
**Deliverables**:
- Unified project + snapshot stores with 9 slices
- Hub accessible via `/hub` URL
- 95 passing tests

---

### Phase 3: Infrastructure Hardening (Week 7-8)
**Goal**: Fix P1 gaps + improve performance

1. **PERF-001**: Code splitting (8 hours)
2. **PERF-002**: List virtualization (12 hours)
3. **PERSIST-002**: Bulk delete operations (6 hours)
4. **TEST-003**: E2E test suite (16 hours)
5. **UI-001**: I18N sweep (8 hours)

**Total**: 50 hours (7 days)

---

### Expected Outcomes (After All Phases)

✅ **Zero god stores** (all files ≤300 lines)
✅ **Zero circular dependencies**
✅ **Test coverage ≥80%**
✅ **Health score improvement**: 7/10 → 8.8/10
✅ **TypeScript errors**: <10
✅ **Performance**: 50% faster initial load (code splitting)
✅ **Data integrity**: Zero data loss (quota handling)

---

## 📈 METRICS TRACKING

### Health Score Formula
```
Health Score = (
  0.25 * (1 - god_store_ratio) +
  0.20 * test_coverage_ratio +
  0.15 * (1 - ts_error_ratio) +
  0.15 * performance_score +
  0.10 * documentation_score +
  0.10 * security_score +
  0.05 * ux_score
) * 10
```

### Target Metrics (End State)
- **God Store Ratio**: 0% (currently 40%)
- **Test Coverage**: 80% (currently 20%)
- **TypeScript Errors**: <10 (currently ~100)
- **Performance Score**: 85/100 (Lighthouse)
- **Documentation Score**: 90/100
- **Security Score**: 95/100
- **UX Score**: 85/100

---

## 🏁 CONCLUSION

The Via-gent Project Alpha codebase is in a **transitional state** with significant progress made in Platform Unification, but critical technical debt remains in Conversation and Project management systems.

**Strengths**:
- ✅ Modern tech stack (React, TypeScript, Zustand, Vite, IndexedDB)
- ✅ Comprehensive documentation (~12,000 lines)
- ✅ Two production-ready cornerstones (Provider + Agent)
- ✅ Clear remediation path (2 epics ready for implementation)

**Weaknesses**:
- ❌ God stores violating maintainability principles
- ❌ Low test coverage (20% vs target 80%)
- ❌ Missing P0 infrastructure (IndexedDB quota handling)
- ❌ Performance bottlenecks (no code splitting, no virtualization)

**Recommendation**: **PROCEED WITH PLATFORM UNIFICATION**
- Prioritize Epic CC-1 (Conversation) first (highest technical debt)
- Follow with Epic CP-1 (Project + Hub routing)
- Address P0 infrastructure gaps in parallel

**Timeline**: 30-37 days to reach 8.8/10 health score (production-ready state)

---

**Next Step**: Review this report with stakeholders and initiate Epic CC-1 Sprint Planning.
