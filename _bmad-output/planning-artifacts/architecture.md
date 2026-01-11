# Via-Gent Architecture Document

**Version:** 2.0.0 (Corrected)  
**Date:** 2026-01-11  
**Status:** AUTHORITATIVE - Governs all architecture decisions  
**Related Documents:**
- Epics: `_bmad-output/planning-artifacts/epics.md`
- Research: `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`
- Audit: `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`

---

## ⚡ Quick Reference

| Component | Status | Notes |
|-----------|--------|-------|
| **Architecture Health** | 6/10 | 48 issues identified |
| **Clean Architecture Compliance** | ~50% | Not 75% (corrected) |
| **God Components** | 8 | Not 19 (corrected) |
| **God Stores** | 8 | Requires decomposition |
| **Layer Violations** | 130+ | Must be fixed |
| **RAG Implementation** | OramaDB | Local-first, privacy-focused |
| **Agent Auto-Switching** | EXISTS | Infrastructure built, not enabled |

---

## Section 1: Executive Summary

Via-Gent is a browser-based, mobile-first AI development workspace. The platform operates at approximately **65% feature completeness** with local-first architecture using WebContainers and IndexedDB.

### Architecture Reality (Corrected from Previous Claims)

| Metric | Previous Claim | Actual | Source |
|--------|---------------|--------|--------|
| Feature Completeness | 70% | 65% | PRD assessment |
| Clean Architecture Compliance | 75% | ~50% | Audit 2026-01-11 |
| God Components | 19 | 8 | Audit correction |
| God Stores | 9 | 8 | Audit confirmed |
| Layer Violations | 32 | 130+ | Audit found more |

### AI Invocation Patterns

The codebase exhibits **three AI invocation patterns** (NOT unified):

| Pattern | Location | Status |
|---------|----------|--------|
| Full Agent System | ChatPanel → /api/chat | ✅ Proper implementation |
| Notes AI Service | note-ai-service.ts | ⚠️ Static selection, no reactivity |
| Hardcoded Provider | VoiceRecordButton.tsx | ❌ Hardcoded 'gemini' |

**Remediation:** See ADR-026 for unified AgentExecutionService proposal.

---

## Section 2: System Overview

### 2.1 Architecture Layers

Via-Gent implements a **five-layer Clean Architecture** with unidirectional dependency flow.

#### Layer Distribution (Actual State)

| Layer | Location | Files | Compliance | Status |
|-------|----------|-------|------------|--------|
| **Core** | `src/core/entities/` | 4 | ~25% | UNDERPOPULATED |
| **Domain** | `src/domain/services/` | 7 | ~50% | PARTIAL |
| **Infrastructure** | `src/infrastructure/` | 250+ | ~60% | OVERGROWN + VIOLATING |
| **Lib** | `src/lib/` | 220+ | N/A | CONFUSION ZONE |
| **Presentation** | `src/presentation/` | 474 | ~70% | DOMINANT |

#### Known Layer Violations (Must Fix)

```
❌ INFRASTRUCTURE → DOMAIN (wrong direction):
   src/infrastructure/persistence/stores/index.ts:190-195
   exports domain services from infrastructure

❌ DOMAIN → INFRASTRUCTURE (leaky abstraction):
   src/domain/services/universal-adapter-factory.ts:313
   imports credential-vault directly

❌ CIRCULAR DEPENDENCIES:
   src/domain/services/agent-orchestration-service.ts:11
   src/domain/services/workspace-transition-service.ts:11
```

### 2.2 Cross-Layer Communication

**Allowed Flow:**
```
Presentation → Infrastructure → Domain → Core
                      ↑
              (interfaces only)
```

**Communication Mechanisms:**
- **Event Bus:** `src/infrastructure/events/event-bus.ts` for reactive updates
- **Zustand Stores:** State synchronization via `src/infrastructure/persistence/stores/`
- **Facades:** Abstraction over agent tools in `src/lib/agent/facades/`

---

## Section 3: RAG Implementation

### 3.1 Current State

**Technology Stack:**
- **Vector Database:** OramaDB (browser-based, local-first)
- **Embeddings:** Xenova/all-MiniLM-L6-v2 (384-dimension)
- **Search Type:** Hybrid (vector 0.7 + BM25 0.3)
- **Fallback:** Gemini API for embedding generation

**Implementation Location:**
- `src/lib/rag/` - 30+ files (RAG logic)
- `src/infrastructure/persistence/stores/rag/` - Store layer
- `src/presentation/components/rag/` - UI components

### 3.2 RAG Architecture (OramaDB-based)

```
User Query
    ↓
Hybrid Retriever (vector + BM25)
    ↓
├─→ OramaDB Vector Search (local in-memory)
└─→ BM25 Full-text Search
    ↓
Reranking (if implemented)
    ↓
Context + Query → LLM
    ↓
Response with Citations
```

### 3.3 RAG Options Analysis

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Keep OramaDB (current)** | Local, privacy-first, offline | Browser memory limited | ✅ Recommended |
| **Gemini File Search API** | Fully managed, simple | Google dependency | Consider for simplification |
| **Qdrant** | Advanced features | Additional infrastructure | Future consideration |

**Verdict:** Keep OramaDB for now. It's solid for browser-based local-first architecture.

### 3.4 RAG Issues (from Audit)

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| N+1 Query Pattern | knowledge-source-crud-slice.ts:56-62 | HIGH | Replace loop with bulk ops |
| God Store | useRAGStore.ts (327 lines) | HIGH | Decompose into slices |
| Missing Error Boundary | /knowledge route | HIGH | Add ErrorBoundary |
| Type Scattering | 5+ locations | MEDIUM | Consolidate to domain |

### 3.5 RAG Remediation

**Quick Wins:**
1. Fix N+1 query pattern (2 hours)
2. Add /knowledge error boundary (1 hour)
3. Add query cache (4 hours)

**Core Improvements:**
1. Decompose useRAGStore (1 day)
2. Add metadata filtering (4 hours)
3. Implement reranker (1 day)

**Reference:** See `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

---

## Section 4: Agent Mode Auto-Switching

### 4.1 Current State

**Infrastructure EXISTS but NOT ENABLED:**

| Component | Location | Status |
|-----------|----------|--------|
| ModeClassifier | mode-classifier.ts | ✅ Implemented |
| Scoring System | lines 393-448 | ✅ Working |
| Confidence Thresholds | Configurable | ✅ Ready |
| Context Sources | prompt, workspace, files, history | ✅ Available |

**What's Missing:**
- ❌ Mode persistence in conversation history
- ❌ Auto-switching enabled (manual override takes precedence)
- ❌ UI confidence indicator

### 4.2 Auto-Switching Architecture

```
User Input → ModeClassifier → Agent Router → Best Agent
                 ↓
          Confidence Score
                 ↓
          ├─ > 0.8 → Auto-switch
          ├─ 0.5-0.8 → Suggest with UI
          └─ < 0.5 → Manual selection
```

### 4.3 Required Changes to Enable

1. **Remove manual override** of auto-classification
2. **Add mode field** to ChatMessage interface
3. **Persist mode** in conversation store
4. **Add UI indicator** showing current mode + confidence

### 4.4 Agent Registry

```typescript
const AGENT_REGISTRY = {
  chat: {
    capabilities: ['conversation', 'qa', 'general'],
    triggers: ['general chat', 'questions']
  },
  ide: {
    capabilities: ['code', 'terminal', 'fileops'],
    triggers: ['code', 'debug', 'terminal']
  },
  notes: {
    capabilities: ['write', 'edit', 'format'],
    triggers: ['document', 'write', 'edit']
  },
  knowledge: {
    capabilities: ['search', 'rag', 'synthesize'],
    triggers: ['research', 'find', 'learn']
  }
};
```

### 4.5 Handoff Pattern (Future Enhancement)

After auto-switching is enabled, consider implementing handoff pattern:

```
Agent A (current) → Handoff → Agent B (new)
    ↓
Transfer context:
├─ Conversation history
├─ Current task state
├─ User preferences
└─ Workspace context
```

**Reference:** See `_bmad-output/planning-artifacts/RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md`

---

## Section 5: State Management

### 5.1 God Stores (Requiring Decomposition)

| Store | Lines | Issue | Action |
|-------|-------|-------|--------|
| useWorkspaceFileSystem.ts | 571 | File system + sync + metadata | Decompose |
| migration-backup.ts | 549 | Migration logic in store | Move to infra |
| conversation-migration.ts | 549 | Migration logic in store | Move to infra |
| useConversationStore.ts | 497 | Multiple responsibilities | Decompose |
| unified-chat-store.ts | 448 | Chat state | Decompose |
| provider-store.ts | 387 | Provider management | Decompose |
| workspace-store.ts | 347 | Workspace state | Decompose |
| useRAGStore.ts | 327 | RAG functionality | Decompose |

### 5.2 Store Architecture Pattern

**Target Structure:**
```
src/infrastructure/persistence/stores/{domain}/
├── slices/
│   ├── {slice-name}-slice.ts (≤120 lines)
│   └── {slice-name}-slice.test.ts
├── {domain}-store.ts (≤300 lines, combines slices)
├── {domain}-store.test.ts
└── index.ts (barrel export)
```

---

## Section 6: Data Flow

### 6.1 Persistence Layer

**Dexie Tables:**
| Table | Purpose | Access |
|-------|---------|--------|
| conversations | Conversation threads | Frequent |
| messages | Chat messages | Frequent |
| projects | Project metadata | Moderate |
| fileMetadata | File metadata | Frequent |
| toolExecutionLogs | Execution history | Append |
| fsaHandles | Directory handles | Moderate |
| plugins | Plugin configs | Infrequent |
| sessionSnapshots | State restoration | Session |
| workspaceState | Workspace preferences | Moderate |

### 6.2 State Flow Sequence

```
1. User interaction (presentation)
2. Store action call (Zustand)
3. State validation + update
4. Persist to Dexie (IndexedDB)
5. Event bus emit
6. Reactive component update
7. UI reflects state
```

---

## Section 7: Security

### 7.1 Credential Vault

**Location:** `src/lib/agent/providers/credential-vault.ts` (18,167 lines)

**Security Features:**
- AES-256-GCM encryption for API keys
- Encrypted storage in IndexedDB
- Decryption on-demand for provider requests
- No plaintext in state

### 7.2 Known Issues

| Issue | Location | Severity | Status |
|-------|----------|----------|--------|
| Hardcoded provider | VoiceRecordButton.tsx | HIGH | Needs fix |
| Vault unused | Provider implementations | HIGH | Integration needed |
| Permission bypass | note-ai-service.ts | MEDIUM | Migration needed |

---

## Section 8: API Contracts

### 8.1 Routes

| Pattern | File | Purpose |
|---------|------|---------|
| `/ide/:projectId` | IDE workspace | Code execution |
| `/knowledge/:projectId` | Knowledge workspace | RAG/search |
| `/notes/:projectId` | Notes workspace | Document editing |
| `/study/:projectId` | Study workspace | Flashcards/quizzes |
| `/api/chat` | AI conversations | Full agent system |

### 8.2 Provider Adapters

| Provider | Location | Lines |
|----------|----------|-------|
| Anthropic | anthropic-adapter.ts | 7,807 |
| OpenRouter | provider-adapter.ts | 12,956 |
| Model Registry | model-registry.ts | 13,540 |
| Credential Vault | credential-vault.ts | 18,167 |

---

## Section 9: Architecture Decision Records

### ADR Status

| ADR | Title | Status | Confidence |
|-----|-------|--------|------------|
| ADR-026 | AI Service Unification | PROPOSED | ⚠️ Overly optimistic |
| ADR-027 | State Management Consolidation | PROPOSED | ✅ Valid |
| ADR-028 | Error Boundary Coverage | PROPOSED | ✅ Valid |
| ADR-029 | Clean Architecture Layer Compliance | PROPOSED | ❌ False (overstated) |
| ADR-032 | Agent Chat Self-Switching Orchestrator | PROPOSED | ✅ Infrastructure exists |

**Note:** See ADR audit at `_bmad-output/planning-artifacts/architecture/adr-audit-report-2026-01-11.md`

---

## Section 10: Implementation Roadmap

### Priority Matrix

| Priority | Item | Effort | Dependencies |
|----------|------|--------|--------------|
| **P0** | Fix N+1 queries | 2h | None |
| **P0** | Add /knowledge error boundary | 1h | None |
| **P0** | Break circular dependencies | 1 day | None |
| **P1** | Decompose god stores | 1 week | P0 items |
| **P1** | Enable agent auto-switching | 1 week | ModeClassifier exists |
| **P2** | Implement RAG reranker | 1 day | Metadata filtering |
| **P2** | Consolidate RAG types | 4h | None |

### Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | Week 1 | Critical fixes (P0) |
| Phase 2 | Week 2-3 | Store decomposition (P1) |
| Phase 3 | Week 4+ | Advanced features (P2) |

---

## Appendix A: Evidence References

| Claim | Section | Evidence Source |
|-------|---------|-----------------|
| 65% feature completeness | Executive Summary | PRD assessment |
| ~50% architecture compliance | 2.1 | Audit 2026-01-11 |
| 8 god stores | 5.1 | Audit findings |
| OramaDB implementation | 3.1 | src/lib/rag/ |
| ModeClassifier exists | 4.1 | mode-classifier.ts |

**Full Audit:** `_bmad-output/audit/comprehensive-codebase-audit-2026-01-11.md`

---

## Appendix B: Related Documents

| Document | Purpose |
|----------|---------|
| `epics.md` | Epic and story definitions |
| `RESEARCH-RAG-AGENT-AUTO-SWITCHING-2026-01-11.md` | Detailed research findings |
| `adr-audit-report-2026-01-11.md` | ADR validity assessment |
| `numbering-scheme-standard-2026-01-11.md` | Epic/story numbering |
| `epics-reconciliation-report-2026-01-11.md` | Story status verification |

---

## Appendix C: Verification Checklist

Before marking architecture tasks complete:

```
□ TypeScript clean (pnpm tsc --noEmit)
□ Tests passing (pnpm vitest run)
□ No layer violations
□ No god files >300 lines
□ Error boundaries on all routes
□ RAG N+1 queries fixed
□ Agent auto-switching enabled
□ Documentation updated
```

---

**Document Version:** 2.0.0  
**Last Updated:** 2026-01-11  
**Author:** Architecture Recovery Process  
**Status:** AUTHORITATIVE

**Next Review:** 2026-02-11 (quarterly)

---

*This document governs all architecture decisions for Via-Gent*  
*Supersedes: architecture.md v1.0.0 (2026-01-07)*
