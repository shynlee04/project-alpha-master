# HANDOFF: Diagnostic Remediation Sprint

**To**: Dev Team (BMAD Investigator)
**From**: BMAD Core Master (Correct-Course Workflow)
**Date**: 2026-01-09T18:30:00+07:00
**Priority**: P0-CRITICAL
**Blocking**: Phase 2 Agentic Verification

---

## TL;DR

The codebase diagnostic scan (2026-01-09) is **70% complete**. Six critical gaps were identified that **BLOCK Phase 2** agentic verification. This handoff contains 6 remediation stories that must be completed before Phase 2 can proceed.

---

## Why This Matters

**Phase 2 Goal**: Verify agentic capabilities work with REAL API calls.

**Problem**: We cannot verify the API key → AI response chain without first understanding WHERE it breaks.

**Current State**:
- `journey-hub-to-study.md` = 35 lines saying "NEEDS VERIFICATION"
- Vault → AI chain = NOT traced
- AI slash command flow = NOT documented
- Cross-workspace events = NOT analyzed (just "detach it")

---

## Your Mission: 6 Stories

### Track A (Vault/AI Chain Focus)

| Story | Title | Priority | Effort | Output File |
|-------|-------|----------|--------|-------------|
| **DIAG-01** | Complete Vault → AI Chain Trace | P0 | 2h | `vault-ai-chain-trace.md` |
| **DIAG-03** | AI Slash Command Chain Trace | P0 | 1.5h | `ai-slash-command-chain.md` |
| **DIAG-05** | Complete Phase 4 Feature Scans | P1 | 2h | `phase-4/*.md` (5 files) |

### Track B (Workspace Focus)

| Story | Title | Priority | Effort | Output File |
|-------|-------|----------|--------|-------------|
| **DIAG-02** | Complete Study Workspace Investigation | P0 | 1h | UPDATE `journey-hub-to-study.md` |
| **DIAG-04** | Cross-Workspace Events Root Cause | P1 | 1h | `cross-workspace-events-analysis.md` |
| **DIAG-06** | Complete Phase 5 RAG Pipeline Trace | P1 | 1h | `phase-5/rag-pipeline-trace.md` |

**Total Effort**: 8.5 hours

---

## DIAG-01: Vault → AI Chain Trace (MOST CRITICAL)

### The Questions to Answer

From the Sprint Change Proposal (Lines 221-236):

```
WHERE DOES IT BREAK?

1. Settings Page
   └── User enters API key
   └── Clicks "Save"
   └── WHERE does key go? → credential-vault.ts? provider-store?

2. Note Workspace
   └── User types /summarize
   └── AISlashCommand.tsx triggered
   └── WHERE does it get API key from?
   └── WHERE does it get model from?
   └── HOW does it call the API?

3. API Call
   └── WHAT provider is used?
   └── WHAT model is used?
   └── WHERE is the error "API Key missing" thrown?
```

### Files to Trace

```
src/routes/settings.tsx
    ↓ (Save API Key)
src/lib/agent/providers/credential-vault.ts
    ↓ (Store encrypted)
src/infrastructure/persistence/stores/providers/
    ↓ (Notify store)
src/lib/agent/providers/migrate-api-keys-to-vault.ts
    ↓ (Migration from old)
src/lib/notes/note-ai-service.ts
    ↓ (Read key for AI call)
src/presentation/components/notes/ai/AISlashCommand.tsx
    ↓ (User invokes)
API RESPONSE
```

### Expected Output Format

```markdown
# Vault → AI Chain Trace

## Chain Diagram
[ASCII diagram showing all handoffs]

## Step-by-Step Trace

### Step 1: Settings Page Save
- File: `src/routes/settings.tsx:123`
- Action: User clicks "Save API Key"
- Calls: `credentialVault.setCredential(providerId, key)`

### Step 2: Credential Vault Storage
- File: `src/lib/agent/providers/credential-vault.ts:45`
- Action: Encrypt key with AES-256-GCM
- Storage: IndexedDB via Dexie

[... continue for all steps ...]

## Failure Points
1. If vault not initialized → Error at step 2
2. If migration not run → Key in wrong location
3. If agent config not loaded → AI service has no key

## Conclusion
Chain is: [WORKING / BROKEN at step X]
```

---

## DIAG-02: Study Workspace Investigation

### Current State

`journey-hub-to-study.md` contains:

```markdown
## Status: NEEDS VERIFICATION

Based on the patterns observed in other workspaces, the Study workspace 
likely follows a similar pattern...
```

**This is not acceptable.** We need actual analysis.

### Questions to Answer

1. Does `src/routes/study.lazy.tsx` exist?
2. What's in it? (Functional? Placeholder like Knowledge?)
3. Does it use `useWorkspaceAccess` (broken) or bypass it?
4. What Dexie tables does Study need?
5. Is it "Coming in Phase 2" like Knowledge?

### Expected Output

Update `journey-hub-to-study.md` with:
- Actual route file analysis
- Component tree
- Store dependencies
- Functional status: WORKING / BROKEN / PLACEHOLDER
- Phase 2 compatibility assessment

---

## DIAG-03: AI Slash Command Chain

### The Flow to Trace

```
User types /summarize in Notes
    ↓
AISlashCommand.tsx detects command
    ↓
Opens AIPromptDialog.tsx
    ↓
Calls note-ai-service.ts
    ↓
Resolves current agent (how?)
    ↓
Gets API key from vault (how?)
    ↓
Determines model (how?)
    ↓
Makes API call
    ↓
Streams response to editor
```

### Key Questions

- WHERE does AISlashCommand get the agent config?
- WHERE does it read the API key from?
- WHICH model is selected and HOW?
- WHAT happens if key is missing?

---

## DIAG-04: Cross-Workspace Events Root Cause

### Why This Matters

Sprint Proposal Line 274 says to **detach** `useAllCrossWorkspaceEvents` because it "causes infinite loops". But we need to understand **WHY** to fix it properly in Phase 2.

### The Investigation

```
useAllCrossWorkspaceEvents()
    ↓
Subscribes to cross-workspace-event-bus.ts
    ↓
Calls useAgentsStore.getState() in render path?
    ↓
Store update triggers re-render
    ↓
Re-render triggers subscription
    ↓
INFINITE LOOP
```

### Expected Output

- Root cause with code evidence
- Re-render loop diagram
- Fix proposal (not just "detach it")
- Phase 2 re-attachment plan

---

## DIAG-05: Complete Phase 4 Feature Scans

### Current State

`PROGRESS.md` shows:
```yaml
Phase 4: Features - **IN_PROGRESS** (6 sub-agents)
| 4.x | ... | 0 | 0 | 6 |
```

**Zero sub-agents completed.**

### Files to Create

| File | Scope |
|------|-------|
| `phase-4/feature-agents.md` | Agent config, workspace bindings, tool permissions |
| `phase-4/feature-hub.md` | Dashboard metrics, project creation, navigation |
| `phase-4/feature-ide.md` | Monaco, file tree, terminal, preview (18 panels) |
| `phase-4/feature-notes.md` | BlockNote, AI integration, sync |
| `phase-4/feature-study.md` | Flashcards, quizzes, spaced repetition |

Note: `state-management-audit.md` already exists and is comprehensive.

---

## DIAG-06: Phase 5 RAG Pipeline Trace

### Current State

Only `phase-5/feature-knowledge.md` exists. Need full RAG pipeline trace.

### Pipeline Stages

```
SOURCE IMPORT → CHUNKING → EMBEDDING → INDEXING → SEARCH → SYNTHESIS

SourceImportDialog    DocumentChunker    EmbeddingService    OramaIndex    HybridSearch    Synthesis
      ↓                     ↓                   ↓                ↓              ↓               ↓
   PDF/URL/Text     Fixed/Recursive     Local/Cloud CLIP    Orama WASM    Fulltext+Vector   Gemini AI
```

### Files to Trace

| Stage | Key Files |
|-------|-----------|
| Import | `SourceImportDialog.tsx`, `source-service.ts` |
| Chunking | `document-chunker.ts`, `chunk-strategies/` |
| Embedding | `embedding-service.ts`, `transformers.ts` |
| Indexing | `orama-index.ts`, `incremental-indexing.ts` |
| Search | `hybrid-search.ts`, `search-service.ts` |
| Synthesis | `synthesis-service.ts`, `synthesis-agent.ts` |

### Important

Document **rag-store.ts** god store structure (1,595 lines) - this is critical for Phase 4 architecture cleanup.

---

## Output Location

All output files go in:
```
_bmad-output/diagnostics/codebase-diagnostic-2026-01-09/
├── vault-ai-chain-trace.md          # DIAG-01
├── ai-slash-command-chain.md        # DIAG-03
├── cross-workspace-events-analysis.md  # DIAG-04
├── phase-1/
│   └── journey-hub-to-study.md      # DIAG-02 (UPDATE)
├── phase-4/
│   ├── feature-agents.md            # DIAG-05
│   ├── feature-hub.md               # DIAG-05
│   ├── feature-ide.md               # DIAG-05
│   ├── feature-notes.md             # DIAG-05
│   └── feature-study.md             # DIAG-05
└── phase-5/
    └── rag-pipeline-trace.md        # DIAG-06
```

---

## Gate Criteria

**DIAG-GATE passes when:**

- [ ] `vault-ai-chain-trace.md` created with complete trace
- [ ] `journey-hub-to-study.md` updated with actual analysis (not placeholder)
- [ ] `ai-slash-command-chain.md` created documenting API key flow
- [ ] `cross-workspace-events-analysis.md` created with root cause
- [ ] All 5 Phase 4 feature files completed
- [ ] Phase 5 RAG pipeline documented
- [ ] `PROGRESS.md` updated to reflect true completion

---

## After Completion

Once DIAG-GATE passes:

1. Update `PROGRESS.md` to show all phases complete
2. Update `learning-consolidated-2026-01-09.md` with new findings
3. **Phase 2 Sprint can proceed** with agentic verification

---

## Contact

For questions or blockers:
- Sprint Status: `_bmad-output/sprint-artifacts/diagnostic-remediation-sprint-2026-01-09.yaml`
- Original Gap Analysis: This handoff document
- Sprint Change Proposal: `_bmad-output/project-planning-artifacts/sprint-change-proposal-2026-01-08.md`

---

*Handoff generated by BMAD Correct-Course Workflow*
*2026-01-09T18:30:00+07:00*
