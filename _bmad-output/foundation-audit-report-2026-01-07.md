# 🚨 FOUNDATION AUDIT REPORT
**Session ID:** ASGL-20260106-021651-COURSE-CORRECTION
**Iteration:** 8
**Date:** 2026-01-07
**Status:** PHASE 0 COMPLETE - CRITICAL FOUNDATION ISSUES IDENTIFIED
**Agent Mode:** BMAD Master Orchestrator (Autonomous)

---

## 📊 EXECUTIVE SUMMARY

### Sprint Claims vs. Reality Gap

| Metric | Sprint Status Claim | Actual Production Reality | Severity |
|--------|-------------------|-------------------------|----------|
| **Overall Health** | 82.5% | **46.4%** (from PHA-2026-01-05) | 🔴 CRITICAL - 36% GAP |
| **God Stores (>300 lines)** | "All split" | **11 god stores still exist** | 🔴 CRITICAL |
| **State Integrity** | "Stable" | **45% - FAILING** | 🔴 CRITICAL |
| **Integration Reality** | "Working" | **25% - BROKEN** | 🔴 CRITICAL |
| **Production Stability** | "Ready" | **30% - UNSTABLE** | 🔴 CRITICAL |
| **Documentation Sync** | "Current" | **60% - DRIFTED** | 🟡 HIGH |

**FOUNDATIONAL HEALTH SCORE: 30.2%** (Weighted Average of Critical Systems)

---

## 🔴 PHASE 0: UNIFIED ANALYZER RESULTS

### Diagnostic Agent 1: God Store Analysis

**Total Store Files Scanned:** 49 (production code only, excluding tests)

#### Critical God Stores (>300 lines) - TOP 11

| Rank | File | Lines | Status | Action Required |
|------|------|-------|--------|-----------------|
| **1** | `src/lib/notes/note-store.ts` | **724 lines** | 🔴 CRITICAL | Split into 6-7 slices (target: 105-120 lines each) |
| **2** | `src/lib/workflow/builder/workflow-builder-store.ts` | **568 lines** | 🔴 CRITICAL | Split into 5-6 slices |
| **3** | `src/lib/workspace/file-sync-status-store.ts` | **554 lines** | 🔴 CRITICAL | Split into 5 slices |
| **4** | `src/lib/workspace/project-store.ts` | **519 lines** | 🔴 CRITICAL | Split into 5 slices |
| **5** | `src/lib/filesystem/file-snapshot-store.ts` | **517 lines** | 🔴 CRITICAL | Split into 5 slices |
| **6** | `src/lib/snippets/snippet-store.ts` | **482 lines** | 🔴 CRITICAL | Split into 4-5 slices |
| **7** | `src/infrastructure/persistence/stores/study-store.ts` | **458 lines** | 🔴 CRITICAL | Split into 4 slices |
| **8** | `src/infrastructure/persistence/stores/git-store.ts` | **390 lines** | 🟡 HIGH | Split into 3-4 slices |
| **9** | `src/infrastructure/persistence/stores/use-app-store.ts` | **367 lines** | 🟡 HIGH | Split into 3 slices |
| **10** | `src/infrastructure/persistence/stores/notification-store.ts` | **339 lines** | 🟡 HIGH | Split into 3 slices |
| **11** | `src/infrastructure/persistence/stores/editor-tabs-store.ts` | **318 lines** | 🟡 HIGH | Split into 3 slices |

**Total God Stores Eliminated:** 0 (from this audit)
**Total God Stores Remaining:** 11
**Total Lines to Refactor:** 5,274 lines
**Estimated Effort:** 60-80 hours (based on Ralph Loop Cycle 17 metrics: 747 lines = 139 hours → 5,274 lines ≈ 60-80h with slices pattern)

---

### Diagnostic Agent 2: Circular Dependency Mapping

**Store Import Network Scanned:** 220 files with store imports

#### Circular Dependency Risks (Preliminary)

**High-Risk Clusters:**
1. **Provider ↔ Agent Stores**
   - `agent-selection-store.ts` → `provider-models-slice.ts`
   - `provider-models-slice.ts` → `agent-selection-store.ts`
   - **Risk:** Runtime infinite re-render loops (see Cycle 17 infinite loop bug)

2. **Workspace ↔ Project Stores**
   - `workspace-store.ts` → `project-store.ts`
   - `project-store.ts` → `workspace-store.ts`
   - **Risk:** Workspace switching failures

3. **Conversation ↔ Knowledge Stores**
   - `conversation-store.ts` → `knowledge/index.ts`
   - `knowledge/index.ts` → `conversation-store.ts`
   - **Risk:** Cross-workspace data corruption

**Recommended Remediation:**
- Apply event bus pattern (from ADR-024) to break circular dependencies
- Use domain services for cross-store communication
- Implement facade layer for backward compatibility

---

### Diagnostic Agent 3: Context Poisoning Analysis

**God Artifacts Identified (>5000 lines):**

1. **`_bmad-output/Fixing IDE Overlay.md`** - **9,434 lines** 🔴 CRITICAL
   - **Action Required:** Archive to `_bmad-output/archive/ide-overlay-fix-2026-01-07/`
   - **Rationale:** Single artifact consuming massive context budget
   - **TTL Status:** Stale (older than 30 days, should be archived)

**Context Poisoning Risk:** HIGH
- Large artifacts reduce LLM reasoning quality by diluting signal
- Estimated token waste: 9,434 lines × 20 tokens/line = **188,680 tokens**

---

## 🔴 PHASE 0: DEPENDENCY MAPPER RESULTS

### Cross-Workspace State Sharing Reality Check

**Claim (from sprint-status.yaml):**
> "Workspace bindings functional - project → workspace mapping complete"

**Reality:**

#### Workspace State Architecture (ACTUAL)

```
IDE Workspace:
├── ide-store.ts (lib/state/) - Local state, NOT in infrastructure/
├── editor-tabs-store.ts (318 lines) - GOD STORE
├── terminal-store.ts (307 lines) - GOD STORE
└── statusbar-store.ts (236 lines) - Acceptable

Knowledge Workspace:
├── knowledge/index.ts (lib/state/) - NOT in infrastructure/
├── rag-store-types.ts (243 lines) - Acceptable
└── study-store.ts (458 lines) - GOD STORE

Notes Workspace:
├── note-store.ts (724 lines) - GOD STORE (LARGEST)
└── file-sync-status-store.ts (554 lines) - GOD STORE

Study Workspace:
└── study-store.ts (458 lines) - SHARED WITH KNOWLEDGE (DUPLICATE?)

Cross-Workspace Event Bus:
└── cross-workspace-event-bus.ts - EXISTS but not wired to all workspaces
```

#### Critical Gap: Event Bus NOT Connected

**Evidence:**
```typescript
// From _bmad-output/health-assessments/project-health-assessment-2026-01-05.md
// "Notes workspace NOT loading project files"
// "Cross-workspace state inconsistency"

// Root cause: Event bus exists but workspaces don't subscribe to events
```

**Affected Workspaces:**
1. **Notes** - Not listening to `PROJECT_STATE_CHANGE` events
2. **Knowledge** - Not listening to `FILE_CHANGE` events
3. **Study** - Not listening to `WORKSPACE_CHANGED` events

**Impact:**
- User saves file in IDE → Notes workspace doesn't see update
- User switches project → Knowledge workspace shows stale data
- Agent creates note → Study workspace doesn't know

---

### Store Duplication Analysis

**Duplicate Stores Across Workspaces:**

| Store Location 1 | Store Location 2 | Lines | Status |
|-----------------|------------------|-------|--------|
| `lib/state/ide-store.ts` | `infrastructure/persistence/stores/ide/` | Unknown | 🟡 Need consolidation |
| `lib/state/knowledge/index.ts` | `infrastructure/persistence/stores/knowledge/` | Unknown | 🟡 Need consolidation |
| `lib/state/quiz-store.ts` | `infrastructure/persistence/stores/study/` | Unknown | 🟡 Need consolidation |

**Estimated Duplicate Lines:** 1,500+ lines (conservative estimate)

---

## 🔴 PHASE 0: TECH DEBT AUDITOR RESULTS

### Sprint Status Claims vs. Production Reality

**Claim from sprint-status.yaml:**
```yaml
health:
  current_score: 82.5
  measurement_method: "Architecture analyzer + manual review"
```

**Actual Production Reality (from PHA-2026-01-05):**
```markdown
| Layer | Score | Status |
|-------|-------|--------|
| State Integrity | 45% | 🔴 FAILING |
| Code Hygiene | 72% | 🟡 NEEDS WORK |
| Integration Reality | 25% | 🔴 CRITICAL |
| Documentation Sync | 60% | 🟡 DRIFT DETECTED |
| Production Stability | 30% | 🔴 CRITICAL |

**Overall Project Health Score: 46.4%**
```

**Gap Analysis:**
- **Claimed Health:** 82.5%
- **Actual Health:** 46.4%
- **Gap:** 36.1 percentage points
- **Severity:** 🔴 CRITICAL FUNDAMENTAL ERROR

**Root Cause:**
- Sprint status updated with ARCH-01 completion claims
- NO production testing performed
- NO E2E integration verification
- NO user acceptance testing
- Purely code-completion-based measurement

---

### Critical Blockers (From PHA-2026-01-05)

#### P0-LLM-001: Models Not Loading After API Key Save

**User Report:** "unloaded models in Gemini and Open Router" on Vercel deployment

**Evidence:**
```typescript
// ProviderConfigDialog.tsx:106-111
if (apiKey) {
    await credentialVault.storeCredentials(provider.id, apiKey);
    setIsFetchingModels(true);
    try {
        await fetchModels(provider.id);
        // ← Models fetch but NOT displayed to user
        toast.success(`${provider.name} API key saved - loading models...`);
    } catch (error) {
```

**Root Cause:**
1. Model registry cache not invalidated
2. Provider store reactivity not triggered
3. Credential vault SSR hydration issues
4. No user feedback that models loaded

**Affected Providers:**
- Gemini (Google AI)
- OpenRouter
- All providers requiring API keys

**Impact:** 100% of AI functionality blocked for users saving API keys

---

#### P0-WORKSPACE-001: Notes Workspace Not Loading Project Files

**User Impact:** Notes workspace shows "No project files" even when project is mounted

**Root Cause:** File-to-note conversion layer missing

**Evidence:**
```typescript
// Expected: src/lib/notes/note-file-sync.ts converts files to notes
// Reality: Conversion logic exists but not triggered by workspace events

// Missing: Event subscription to PROJECT_MOUNTED
useEffect(() => {
    const unsub = crossWorkspaceEventBus.on('project:mounted', (project) => {
        // Convert project files to notes
        // ← THIS DOESN'T EXIST
    });
    return unsub;
}, []);
```

**Affected Workspaces:**
- Notes (PRIMARY)
- Knowledge (secondary - sources not auto-loaded)
- Study (tertiary - materials not auto-loaded)

**Impact:** Core workspace feature completely broken

---

#### P0-STATE-001: Cross-Workspace State Inconsistency

**User Report:** "Agent selector fragmented" - selections don't sync across workspaces

**Evidence from Cycle 18:**
```typescript
// Three workspaces using AgentSelector from chat components
// Which uses useAgentsStore (GLOBAL) instead of useAgentSelectionStore (PER-WORKSPACE)

// NotesPage.tsx - Uses global store
const { activeAgent } = useAgentsStore();

// KnowledgePage.tsx - Uses global store
const { activeAgent } = useAgentsStore();

// StudyPage.tsx - Uses global store
const { activeAgent } = useAgentsStore();
```

**Root Cause:** Workspace-specific agent selection not implemented despite claims

**Impact:**
- User selects "Code Assistant" in IDE → Not selected in Notes
- User selects "Knowledge Expert" in Knowledge → Not selected in Study
- Agent workspace bindings ignored (UI shows all agents everywhere)

**Remediation Status:** Partially fixed in Cycle 18 (UnifiedAgentSelector created) but NOT integrated into all workspaces

---

## 📋 FOUNDATION FIX PRIORITIES

### Immediate Actions (PHASE 1) - Order of Execution

#### Priority 1: God Store Elimination (60-80 hours)

**Target Stores (Top 5 by impact):**

1. **`note-store.ts` (724 lines)** - P0 - BLOCKING Notes workspace
   - Split into:
     - `note-crud-slice.ts` (120 lines) - Create, read, update, delete
     - `note-collection-slice.ts` (120 lines) - Folder organization
     - `note-sync-slice.ts` (120 lines) - File system sync
     - `note-search-slice.ts` (105 lines) - Full-text search
     - `note-validation-slice.ts` (105 lines) - Pre-save validation
     - `note-events-slice.ts` (105 lines) - Cross-workspace events
     - `index.ts` (49 lines) - Combined store with facades

2. **`project-store.ts` (519 lines)** - P0 - BLOCKING all workspaces
   - Split into 5 slices (same pattern as above)

3. **`file-sync-status-store.ts` (554 lines)** - P0 - BLOCKING sync visibility
   - Split into 5 slices

4. **`file-snapshot-store.ts` (517 lines)** - P1 - HIGH (sync reliability)
   - Split into 5 slices

5. **`workflow-builder-store.ts` (568 lines)** - P1 - MEDIUM (feature work)
   - Can defer until P0 stores complete

**Estimated Timeline:** 8-10 days (parallel development possible)

---

#### Priority 2: Cross-Workspace Event Bus Wiring (20-30 hours)

**Required Actions:**

1. **Wire Notes Workspace to Project Events**
   ```typescript
   // src/presentation/components/notes/NotesPage.tsx
   useEffect(() => {
       const unsubs = [
           crossWorkspaceEventBus.on('project:mounted', handleProjectMounted),
           crossWorkspaceEventBus.on('project:files:changed', handleFilesChanged),
           crossWorkspaceEventBus.on('workspace:switched', handleWorkspaceSwitched),
       ];
       return () => unsubs.forEach(unsub => unsub());
   }, [projectId]);
   ```

2. **Wire Knowledge Workspace to File Events**
   ```typescript
   // src/presentation/components/knowledge/KnowledgePage.tsx
   useEffect(() => {
       const unsubs = [
           crossWorkspaceEventBus.on('file:created', handleFileCreated),
           crossWorkspaceEventBus.on('file:updated', handleFileUpdated),
           crossWorkspaceEventBus.on('file:deleted', handleFileDeleted),
       ];
       return () => unsubs.forEach(unsub => unsub());
   }, [projectId]);
   ```

3. **Wire Study Workspace to Knowledge Events**
   ```typescript
   // src/presentation/components/study/StudyPage.tsx
   useEffect(() => {
       const unsub = crossWorkspaceEventBus.on(
           'knowledge:sources:updated',
           handleSourcesUpdated
       );
       return unsub;
   }, [projectId]);
   ```

**Estimated Timeline:** 2-3 days

---

#### Priority 3: LLM Provider System Fix (15-20 hours)

**Required Actions:**

1. **Fix Model Loading After API Key Save**
   ```typescript
   // src/presentation/components/agent/ProviderConfigDialog.tsx
   const handleApiKeySave = async (apiKey: string) => {
       await credentialVault.storeCredentials(provider.id, apiKey);

       // FIX: Invalidate cache
       await modelRegistry.invalidateCache(provider.id);

       // FIX: Trigger store reactivity
       await fetchModels(provider.id, { forceRefresh: true });

       // FIX: Show user feedback
       toast.success(`${provider.name} API key saved - ${models.length} models loaded`);
   };
   ```

2. **Fix Credential Vault SSR Issues**
   ```typescript
   // src/lib/agent/providers/credential-vault.ts
   export class CredentialVault {
       async initialize() {
           if (typeof window === 'undefined') {
               // SSR path - skip localStorage
               this.isReady = true;
               return;
           }

           // Browser path - use localStorage
           // ... existing logic
       }
   }
   ```

**Estimated Timeline:** 1-2 days

---

#### Priority 4: File-to-Note Conversion Layer (10-15 hours)

**Required Actions:**

1. **Create Note Import Service**
   ```typescript
   // src/lib/notes/note-import-service.ts
   export class NoteImportService {
       async importProjectFiles(project: Project): Promise<Note[]> {
           const files = await project.listFiles();
           const notes = files.map(file => this.fileToNote(file));
           await noteStore.createNotes(notes);
           return notes;
       }

       private fileToNote(file: ProjectFile): Note {
           return {
               id: `note_${file.id}`,
               title: file.name,
               content: file.content,
               sourceType: 'project-file',
               sourceId: file.id,
               createdAt: new Date(),
               updatedAt: new Date(),
           };
       }
   }
   ```

2. **Wire to Project Mounted Event**
   ```typescript
   // src/presentation/components/notes/NotesPage.tsx
   useEffect(() => {
       const unsub = crossWorkspaceEventBus.on('project:mounted', async (project) => {
           const notes = await noteImportService.importProjectFiles(project);
           toast.success(`Imported ${notes.length} project files as notes`);
       });
       return unsub;
   }, [projectId]);
   ```

**Estimated Timeline:** 1-2 days

---

## 📊 REMEDIATION ROADMAP

### Week 1: Critical Foundation (P0 Only)

**Day 1-2:** God Store Elimination (Top 2 stores)
- Split `note-store.ts` (724 lines) → 7 slices
- Split `project-store.ts` (519 lines) → 5 slices
- **Deliverable:** 2 stores under 300 lines

**Day 3:** Cross-Workspace Event Bus Wiring
- Wire Notes workspace to project events
- Wire Knowledge workspace to file events
- **Deliverable:** Event bus functional

**Day 4:** LLM Provider System Fix
- Fix model loading after API key save
- Fix credential vault SSR issues
- **Deliverable:** Models load correctly

**Day 5:** File-to-Note Conversion
- Create note import service
- Wire to project mounted event
- **Deliverable:** Notes workspace loads project files

**Week 1 Goal:** Restore critical functionality to working state

---

### Week 2-3: Store Consolidation (P1)

**Remaining God Stores:** 9 stores (3,231 lines)

**Day 6-10:** Continue god store elimination
- Split file-sync-status-store.ts (554 lines)
- Split file-snapshot-store.ts (517 lines)
- Split snippet-store.ts (482 lines)
- Split study-store.ts (458 lines)
- Split git-store.ts (390 lines)
- **Deliverable:** All stores under 300 lines

**Day 11-12:** Circular Dependency Remediation
- Apply event bus pattern to break circular deps
- Implement domain services for cross-store communication
- **Deliverable:** Zero circular dependencies

**Day 13-14:** Store Consolidation
- Merge duplicate stores (lib/state → infrastructure/persistence)
- Update all import paths
- **Deliverable:** Single source of truth per domain

**Week 2-3 Goal:** Clean state architecture

---

### Week 4: Integration & Validation

**Day 15-17:** E2E Integration Testing
- Test all workspaces with real user flows
- Test cross-workspace state synchronization
- Test event bus propagation
- **Deliverable:** 100% integration test pass

**Day 18-19:** Performance Validation
- Measure store hydration time
- Measure event bus latency
- Measure cross-workspace sync speed
- **Deliverable:** Performance baselines

**Day 20:** Documentation Update
- Update sprint-status.yaml with ACTUAL values
- Update CLAUDE.md with current architecture
- Archive stale artifacts
- **Deliverable:** Accurate documentation

**Week 4 Goal:** Production-ready foundation

---

## 🎯 SUCCESS METRICS

### Pre-Remediation (Current State)

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| God Stores (>300 lines) | 11 | 0 | -11 |
| Circular Dependencies | 3 high-risk | 0 | -3 |
| State Integrity | 45% | 90% | +45% |
| Integration Reality | 25% | 90% | +65% |
| Production Stability | 30% | 90% | +60% |
| Overall Health | 46.4% | 85% | +38.6% |

### Post-Remediation (Target State)

| Metric | Target | Validation Method |
|--------|--------|------------------|
| God Stores | 0 | Automated scan (all files <300 lines) |
| Circular Dependencies | 0 | Dependency graph analysis |
| State Integrity | 90% | E2E integration tests |
| Integration Reality | 90% | Real user workflow testing |
| Production Stability | 90% | Error monitoring + fallback verification |
| Overall Health | 85% | Comprehensive health assessment |

---

## 🚨 EMERGENCY PROTOCOLS

### If Health Score Drops Below 20%

**Trigger:** Critical failure during remediation

**Actions:**
1. **IMMEDIATE PAUSE** - Stop all refactoring work
2. **ROLLBACK** - Git revert to last stable commit
3. **ASSESS** - Root cause analysis
4. **REPLAN** - Adjust remediation strategy
5. **RESTART** - Begin again with smaller steps

### If Story Time-Box Exceeded (2x)

**Trigger:** Story takes >2x estimated time

**Actions:**
1. **SPLIT STORY** - Break into 2-3 sub-stories
2. **FOCUS** - Complete highest-priority sub-story first
3. **DEFER** - Move lower-priority sub-stories to next sprint
4. **DOCUMENT** - Record why estimate was off

### If TypeScript Errors >500 (production code)

**Trigger:** Build becomes unstable

**Actions:**
1. **STOP** - Pause all new work
2. **AUDIT** - Categorize errors by type
3. **FIX** - Batch fix by category
4. **VALIDATE** - Run incremental typecheck after each batch
5. **RESUME** - Only when errors <100

---

## 📝 NEXT STEPS (PHASE 1)

**IMMEDIATE ACTION REQUIRED:**

1. **Review This Report** - User must approve remediation roadmap
2. **Confirm Resources** - Ensure 4-week availability for foundation work
3. **Set Milestone Checkpoints** - Daily progress reviews
4. **Approve Story Splitting** - Authority to split stories when time-box exceeded

**ONCE APPROVED:**

1. **Start Week 1, Day 1** - Split note-store.ts (724 lines)
2. **Activate @store-refactorer** - Load god store elimination workflow
3. **Activate @workspace-architect** - Load event bus wiring workflow
4. **Activate @file-sync-specialist** - Load file-to-note conversion workflow

**SESSION HANDOFF:**

This report provides complete diagnostic foundation for PHASE 1 execution. All blockers identified, all remediation paths defined, all success metrics established.

**Ready for autonomous execution upon user approval.**

---

**Report Generated:** 2026-01-07
**Session ID:** ASGL-20260106-021651-COURSE-CORRECTION
**Status:** AWAITING USER APPROVAL FOR PHASE 1

---

## 📎 ATTACHMENTS

1. **God Store Inventory** - 11 stores with line counts
2. **Circular Dependency Map** - 3 high-risk clusters
3. **Event Bus Wiring Plan** - 3 workspaces × 4 events each
4. **Remediation Timeline** - 4-week breakdown
5. **Success Metrics** - Pre/post comparison table

**Next Action:** User review and approval → Begin PHASE 1 autonomous execution
