# Sprint Change Proposal

## Project Alpha v2.0 - Knowledge Synthesis Station

**Proposal ID:** SCP-2025-12-29-001  
**Created:** 2025-12-29T19:19:16+07:00  
**Author:** BMAD Master Orchestrator  
**Status:** APPROVED  
**Workflow:** correct-course  

---

## Section 1: Issue Summary

### 1.1 Problem Statement

Two performance and user experience issues have been identified that impact project re-entry and chat session resumption:

| Issue ID | Domain | Problem |
|----------|--------|---------|
| **CC-001** | File System Sync | IDE workspace re-synchronization performs a **full sync on every project entry**, causing resource-heavy operations (~3-5s for 100 files). No incremental sync or metadata caching exists. |
| **CC-002** | Conversation Persistence | Agent chat conversation history is **not effectively restored** when re-entering threads. Tool execution context from previous sessions is lost, and scroll positions are not restored. |

### 1.2 Discovery Context

- **Identified During:** User feedback on project re-entry workflow
- **Trigger:** Performance concerns during daily usage patterns
- **Evidence:** 
  - `SyncManager.syncToWebContainer()` performs full `buildFileSystemTree()` on every call
  - `conversation-store.ts` `loadConversation()` not auto-triggered on thread selection
  - No `toolLogs` table exists in Dexie schema v8

### 1.3 Impact Assessment

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Project re-entry time | 3-5s | <500ms | 85%+ faster |
| Chat restoration success | ~60% | 99%+ | Reliable UX |
| Session state persistence | Partial | Complete | Full context |

---

## Section 2: Impact Analysis

### 2.1 Epic Impact

| Epic | Status | Impact |
|------|--------|--------|
| **Epic 3** (Local-First File Magic) | ✅ DONE | Enhancement opportunity, no rewrite |
| **Epic 2** (AI Chat That Just Works) | ✅ DONE | Enhancement opportunity, no rewrite |
| **Epic 5** (Production-Ready Polish) | ⚠️ IN-PROGRESS | Could absorb but recommend new Epic |
| **Sprint 28** (Remediation) | 🔴 IN-PROGRESS | Independent, no blocking |

### 2.2 Story Impact

**No existing stories require modification.** New stories will be created under **Epic 24**.

### 2.3 Artifact Conflicts

| Artifact | Conflict Level | Required Update |
|----------|----------------|-----------------|
| PRD | Minor | Add incremental sync requirement |
| Architecture | Enhancement | Add metadata cache pattern |
| UX Specification | Enhancement | Add progressive loading states |
| Dexie Schema | **v9 Required** | Add `fileMetadata`, `toolExecutionLogs` tables |
| Sprint Status | Update Required | Add Epic 24 |
| Epics.md | Update Required | Add Epic 24 definition |

### 2.4 Technical Impact

**Dexie Schema v9 Additions:**

```typescript
// New tables for Epic 24
fileMetadata: 'path, lastModified, [path+lastModified]'
toolExecutionLogs: 'id, conversationId, messageId, toolName, timestamp'
```

**New Interfaces:**

```typescript
interface CachedFileMetadata {
    path: string;
    lastModified: number;
    size: number;
    hash?: string;
}

interface ToolExecutionLog {
    id: string;
    conversationId: string;
    messageId: string;
    toolName: string;
    args: Record<string, unknown>;
    result: { success: boolean; output?: string; error?: string };
    approved: boolean;
    timestamp: number;
}
```

---

## Section 3: Recommended Approach

### 3.1 Selected Path

**Direct Adjustment via New Epic 24: Performance & UX Optimization**

### 3.2 Rationale

1. ✅ Clean architectural separation (new epic, not modifying completed work)
2. ✅ 100% coverage of both CC-001 and CC-002
3. ✅ Low risk (additive changes, testable)
4. ✅ Enables two-team parallel execution
5. ✅ Phase 2 prerequisite (improves UX before Epic 6-10)

### 3.3 Effort Estimate

| Story | Effort | Assignable To |
|-------|--------|---------------|
| 24-1 | 3-4 hours | Team A |
| 24-2 | 2-3 hours | Team A |
| 24-3 | 2-3 hours | Team B |
| 24-4 | 3-4 hours | Team B |
| 24-5 | 4-5 hours | Either |
| **Total** | **15-19 hours** | **Both Teams** |

### 3.4 Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dexie migration issues | Low | Incremental schema upgrade pattern |
| Test coverage gaps | Low | Require 90%+ coverage per story |
| Performance regression | Very Low | A/B testing with metrics |

### 3.5 Timeline Impact

**None** - Epic 24 can execute in parallel with Sprint 28 remediation.

---

## Section 4: Detailed Change Proposals

### 4.1 Epic 24 Definition

```markdown
## Epic 24: Performance & UX Optimization

**Goal:** Improve project re-entry performance and chat session continuity

**User Outcome:** "My workspace loads instantly and my chat history is always there"

**Success Metrics:**
- Project re-entry time <500ms (85% improvement)
- Conversation restoration success ≥99%
- Session state recovery ≥95%

**Dependencies:** None (enhancement to completed Epics 2, 3)

**Team Assignment:** Parallel - Team A (24-1, 24-2), Team B (24-3, 24-4, 24-5)
```

### 4.2 Story Definitions

#### Story 24-1: Incremental Sync with Metadata Cache

**As a** developer  
**I want** my project to sync only changed files  
**So that** re-opening my project is fast (<500ms)

**Acceptance Criteria:**
- [ ] Create Dexie `fileMetadata` table (schema v9)
- [ ] Implement `IncrementalSyncManager` class extending `SyncManager`
- [ ] Compare file `lastModified` timestamps before sync
- [ ] Only sync files where local > cached timestamp
- [ ] Update metadata cache after successful sync
- [ ] Emit `sync:incremental` event with delta count

**Technical Notes:**
- Use `performance.now()` to measure sync duration
- Target: <500ms for 100-file project with <10 changes

---

#### Story 24-2: FSA Handle Persistence & Instant Re-grant

**As a** developer  
**I want** my project folder access to persist across browser sessions  
**So that** I don't need to re-grant permission every time

**Acceptance Criteria:**
- [ ] Store FSA `FileSystemDirectoryHandle` reference in IndexedDB
- [ ] Implement `restoreDirectoryAccess(projectId)` function
- [ ] Check `queryPermission()` on stored handle
- [ ] If `granted`, skip re-grant modal entirely
- [ ] Target: 90%+ permission restoration success rate

**Technical Notes:**
- FSA handles are serializable in modern browsers
- Fallback to re-grant flow if handle is stale

---

#### Story 24-3: Conversation History Auto-Restore

**As a** user  
**I want** my chat history to automatically load when I select a thread  
**So that** I can continue conversations seamlessly

**Acceptance Criteria:**
- [ ] Auto-trigger `loadConversation(id)` on thread selection
- [ ] Show loading skeleton while messages load
- [ ] Restore scroll position from `scrollPositions` store
- [ ] Handle edge case: deleted thread gracefully
- [ ] Limit restored messages to last 50 for performance

**Technical Notes:**
- Update `AgentChatPanel.tsx` to integrate with `useConversationStore`
- Use `useEffect` to trigger load on `activeConversationId` change

---

#### Story 24-4: Tool Execution Context Persistence

**As a** user  
**I want** my tool approvals and results from previous sessions to be available  
**So that** I can understand what happened in past conversations

**Acceptance Criteria:**
- [ ] Create Dexie `toolExecutionLogs` table (schema v9)
- [ ] Persist tool approvals on user action
- [ ] Persist tool results on execution completion
- [ ] Restore approved tools set on conversation load
- [ ] Display execution history in tool details

**Technical Notes:**
- Link to `threadId` and `messageId`
- Compress old logs (>30 days) for storage efficiency

---

#### Story 24-5: Session State Snapshot System

**As a** developer  
**I want** my complete IDE session to be restorable  
**So that** I can resume exactly where I left off

**Acceptance Criteria:**
- [ ] Create `SessionStateSnapshot` interface
- [ ] Snapshot: open files, active file, cursor positions, panel widths
- [ ] Snapshot: chat state, terminal history (last 100 commands)
- [ ] Auto-save snapshot on meaningful state changes (debounced)
- [ ] Restore snapshot on project load if <7 days old

**Technical Notes:**
- Use existing `ideState` table for most data
- Add `sessionSnapshots` table for time-series if needed

---

## Section 5: Implementation Handoff

### 5.1 Change Scope Classification

**Scope:** **Minor** - Development team can implement directly

### 5.2 Handoff Recipients

| Role | Responsibility | Agent Mode |
|------|----------------|------------|
| **Development Team A** | Stories 24-1, 24-2 | `@bmad-bmm-dev` |
| **Development Team B** | Stories 24-3, 24-4 | `@bmad-bmm-dev` |
| **Either Team** | Story 24-5 | `@bmad-bmm-dev` |
| **Scrum Master** | Sprint tracking updates | `@bmad-bmm-sm` |
| **Architect** | Schema v9 validation | `@bmad-bmm-architect` |

### 5.3 Success Criteria

| Metric | Threshold | Measurement |
|--------|-----------|-------------|
| Test coverage | ≥90% | Vitest coverage report |
| Performance improvement | ≥85% | Benchmark: sync time |
| Restoration success | ≥99% | Session restore tests |
| No regressions | 0 new bugs | Existing test suite passes |

### 5.4 Next Steps

1. ✅ **Approved:** Sprint Change Proposal
2. 🔄 **In Progress:** Update `sprint-status.yaml` with Epic 24
3. 🔄 **In Progress:** Update `epics.md` with Epic 24 definition
4. 🔄 **In Progress:** Update `bmm-workflow-status.yaml` with course correction
5. ⏳ **Pending:** Create Story 24-1 file and begin development

---

## Approval

**Proposal Status:** ✅ APPROVED  
**Approved By:** User  
**Approved At:** 2025-12-29T19:19:16+07:00  
**Handoff To:** Development Teams A & B  

---

## Appendix: Checklist Completion Summary

| Section | Status |
|---------|--------|
| 1. Trigger & Context | ✅ Complete |
| 2. Epic Impact Assessment | ✅ Complete |
| 3. Artifact Conflict Analysis | ✅ Complete |
| 4. Path Forward Evaluation | ✅ Complete |
| 5. Sprint Change Proposal | ✅ Complete |
| 6. Final Review & Handoff | ✅ Complete |

**All checklist items addressed. No HALT conditions triggered.**
