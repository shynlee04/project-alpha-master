# Research Status: PENDING-FOR-FURTHER-INVESTIGATION

> **Document Type:** Research Status Notice
> **Date:** 2026-01-25T20:25:00+07:00
> **Author:** BMAD Master (Orchestrator)
> **Status:** PENDING
> **Reason:** ARCH-04 Architectural Crisis Takes Priority

---

## Executive Summary

All 5 research tasks from the strategic synthesis are **COMPLETE but DEFERRED** due to the more alarming ARCH-04 architectural-level flaw that renders the application non-functional for all FSA desktop projects.

---

## Research Findings Summary

### Validated Approaches (Proceed When Appropriate)

| Research Area | Score | Verdict | Phase | Status |
|---------------|-------|---------|-------|--------|
| Project-Centric Architecture | 9/10 | ✅ VALID - Best Practice | 1A | Being addressed by ARCH-04 |
| Platform-Aware Plugin Selection | 9/10 | ✅ VALID - Industry Standard | 1A | No action needed now |
| FSA for Desktop + Dexie for Mobile | 10/10 | ✅ VALID - Optimal | 1A | Being addressed by ARCH-04 |
| Orchestrator + Domain Agents | 9/10 | ✅ VALID - Best Practice | 3 | Deferred |
| Thread per Project + Compaction | 8/10 | ✅ VALID | 2 | Deferred |
| BYOK with Web Crypto | 8/10 | ✅ VALID - Secure | 1B | Deferred |

### Approaches Requiring Reconsideration

| Research Area | Score | Verdict | Issue | Recommendation |
|---------------|-------|---------|-------|----------------|
| TanStack AI SDK for All LLM Calls | 6/10 | ⚠️ RECONSIDER | Vercel AI SDK has better client tooling | Hybrid approach recommended |

---

## Gap Analysis (DEFERRED)

| Gap | Severity | Target Phase | Notes |
|-----|----------|--------------|-------|
| Nested project validation | Medium | Phase 1A | Block same-path, warn on nested |
| Mobile virtual file system | High | After ARCH-04 | Create DexieStorageAdapter |
| Rate limit handling | Medium | Phase 2 | Add provider fallback chain |
| XSS protection for BYOK | High | Phase 1B | Add DOMPurify, CSP headers |
| Streaming performance | Medium | Phase 2 | Use streaming-markdown library |
| Virtual scrolling | Medium | Phase 2 | Add React Virtuoso for long chats |

---

## Detailed Research Findings

### 1. Project-Centric Architecture ✅ VALIDATED

**Your Approach:**
- Single `/$projectId` route
- Platform determines available plugins
- Project ID is anchor for threads, RAG, settings

**Research Validation:**
- Clean Architecture - Single route reduces complexity
- Extensibility - Plugin system allows feature growth without route changes
- Maintainability - Single source of truth per project

**Status:** PROCEED AS PLANNED (being addressed by ARCH-04)

---

### 2. TanStack AI vs Vercel AI SDK ⚠️ RECONSIDER

**Your Approach:** All LLM calls must use TanStack AI SDK

**Research Finding:**

| Criteria | TanStack AI SDK | Vercel AI SDK |
|----------|----------------|---------------|
| Client Tools | ⚠️ Basic | ✅ First-class (useChat, useCompletion) |
| Agent Patterns | ⚠️ Manual | ✅ Built-in Agent interface |
| Providers | 4 major | 10+ major |
| Streaming | Basic | Advanced + Object streaming |
| Tree-shaking | ✅ Excellent | Good |
| Documentation | Growing | Extensive |

**Recommendation:** 
- **Option C (Hybrid)**: Use Vercel for client UI + TanStack for server tools

**Status:** DEFERRED to Phase 2 per user directive

---

### 3. State Management (Zustand + Dexie) ✅ VALIDATED

**Key Implementation Pattern:**
```typescript
// Dexie → Zustand via LiveQuery subscription
const useProjectStore = create((set) => ({
  projects: [],
  init: async () => {
    db.projects.toCollection().liveQuery().subscribe({
      next: (projects) => set({ projects }),
    });
  }
}));
```

**Status:** PROCEED AS PLANNED with LiveQuery pattern

---

### 4. BYOK Vault Architecture ✅ VALIDATED

**Security Implementation:**
- Web Crypto API for encryption (AES-GCM + PBKDF2)
- IndexedDB for encrypted storage
- OpenAI-compatible pattern for most providers

**Warning:** Browser storage is never truly secure against local access - OWASP

**Status:** DEFERRED to Phase 1B

---

### 5. Agent Orchestrator Pattern ✅ VALIDATED

**Recommended Enhancement:**
```typescript
interface AgentDelegation {
  id: string;
  parentThreadId: string;
  agentType: 'dev-ext' | 'architect-ext' | 'analyst-ext';
  toolConstraints: {
    write: boolean;
    edit: boolean;
    bash: boolean;
  };
  context: string;
  acceptanceCriteria: string[];
}
```

**Status:** DEFERRED to Phase 3

---

### 6. Chat Thread Architecture ✅ VALIDATED

**Your Approach:**
- Threads per project
- 150K token limit
- Auto-compaction at 90%

**Research Enhancement:**
- Use pattern-based compaction (80-90% reduction, +26% quality)
- Implement memory formation vs simple summarization
- Use discriminated unions for multi-format blocks

**Recommended Block Types:**
```typescript
type BlockType = 
  | 'text' | 'code' | 'table' | 'mermaid' 
  | 'tool-call' | 'tool-result' | 'reasoning' 
  | 'file-reference' | 'image';
```

**Status:** DEFERRED to Phase 2

---

## Next Review Gate

This research will be reviewed after:
1. **EPIC-ARCH-04 completion** - FSA handle lifecycle fixed
2. **Phase 1A validation** - Core project features stable
3. **User decision on Phase 2** - AI SDK selection finalized

---

## Handoff Signature

```yaml
artifact_id: "research_pending_notice_20260125"
artifact_type: "notice"
created_by: "bmad-master"
created_at: "2026-01-25T20:25:00+07:00"
status: "PENDING_FOR_FURTHER_INVESTIGATION"
priority: "DEFERRED"
trigger_event: "ARCH-04 architectural crisis"
next_review: "After EPIC-ARCH-04 completion"

related_documents:
  - "ARCH-04-STRATEGIC-SYNTHESIS-2026-01-25.md"
  - "the-3-phase-approach.md"
  - "new-fundamental-truths.md"
```
