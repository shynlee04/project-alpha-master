# Feature Group 3: Agent/LLM Orchestration - Deep Analysis

**Shard ID**: ARCH-SHARD-03-03
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Focus**: Core Centralized Group #3 - Agent/LLM Orchestration (System Prompts, Tools, RAG, Multimodality)
**Status**: COMPLETE - DEEP ANALYSIS

---

## 1. Architecture → Agent/LLM Mapping

### 1.1 Architecture Groups Involved

| Architecture Group | Files | Issue Severity | Impact on Agent/LLM |
|--------------------|-------|----------------|---------------------|
| **A: State & Stores** | `unified-chat-store.ts:447` | ✅ GOOD | Slice pattern working |
| **A: State & Stores** | `agent-selection-store.ts` | P1 | Selection state management |
| **D: API & Data Flow** | `tool-catalog.ts`, `centralized-tool-registry.ts` | P1 | Missing startup init |
| **D: API & Data Flow** | `note-tools-impl.ts:58-96` | P0 | blocksToMarkdown incomplete |
| **D: API & Data Flow** | `knowledge-tools-impl.ts:52-65` | P0 | Lazy init dependency |
| **F: Layers & Boundaries** | `lib/knowledge/*` (46 files) | P0 | GOD MODULE - single point of failure |
| **F: Layers & Boundaries** | `lib/rag/*` (30 files) | P0 | GOD MODULE - single point of failure |

### 1.2 Current Agent Architecture Diagram (BROKEN)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AGENT/LLM ORCHESTRATION (CURRENT - BROKEN)           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   PROMPT ORCHESTRATOR                            │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ System Prompts │  │ Mode Classifier │  │ Context Engine  │  │   │
│  │  │ (prompt-       │  │ (workspace →    │  │ (RAG + context) │  │   │
│  │  │  orchestrator) │  │  mode)          │  │                 │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     TOOL SYSTEM                                  │   │
│  │                                                                  │   │
│  │   ┌────────────────────────────────────────────────────────┐    │   │
│  │   │            CentralizedToolRegistry (P1: missing init)  │    │   │
│  │   └────────────────────────────────────────────────────────┘    │   │
│  │            │                    │                    │           │   │
│  │            ▼                    ▼                    ▼           │   │
│  │   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │   │
│  │   │ File Tools  │      │ Note Tools  │      │Knowledge T. │    │   │
│  │   │ Facade ✓    │      │ ⚠️ incomplete│      │ ⚠️ lazy init│    │   │
│  │   └─────────────┘      └─────────────┘      └─────────────┘    │   │
│  │            │                    │                    │           │   │
│  │            └────────────────────┼────────────────────┘           │   │
│  │                                 ▼                                │   │
│  │                    ┌─────────────────────┐                       │   │
│  │                    │  TOOL EXECUTOR      │                       │   │
│  │                    │  (retry, logging)   │                       │   │
│  │                    └─────────────────────┘                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                   │                                    │
│                                   ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     RAG PIPELINE                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │              lib/knowledge (46 files!)                    │   │   │
│  │  │              lib/rag (30 files!)                          │   │   │
│  │  │              ⚠️ GOD MODULE - UNMAINTAINABLE               │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  Components:                                                     │   │
│  │  - Chunking (semantic, recursive, fixed-size)                   │   │
│  │  - Embedding (cloud, local)                                      │   │
│  │  - Indexing (Orama, vector)                                      │   │
│  │  - Retrieval (hybrid, RRF fusion)                                │   │
│  │  - Query optimization                                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Issues Found (Agent/LLM Specific)

| Issue | Location | Severity | Root Cause |
|-------|----------|----------|------------|
| **Knowledge god module** | `lib/knowledge/*` (46 files) | P0 | 6 concerns in one directory |
| **RAG god module** | `lib/rag/*` (30 files) | P0 | 5 concerns in one directory |
| **Tool catalog missing init** | `tool-catalog.ts:346-354` | P1 | No guarantee initialization |
| **blocksToMarkdown incomplete** | `note-tools-impl.ts:58-96` | P0 | Complex blocks not handled |
| **Knowledge tools lazy init** | `knowledge-tools-impl.ts:52-65` | P0 | Vault must be ready |
| **Mode classifier** | `mode-classifier.ts` | ✅ WORKING | Well-designed |
| **Prompt composer** | `prompt-composer.ts` | ✅ WORKING | Well-designed |

---

## 2. Feature Behavior Analysis

### 2.1 Agent Orchestration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AGENT ORCHESTRATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  User Input                                                              │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 1. Intent Detection                                             │     │
│  │    - Parse user message                                        │     │
│  │    - Classify as: question / task / chat / code               │     │
│  │    - Detect workspace context                                  │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 2. Mode Selection                                              │     │
│  │    - Check workspace type (IDE/Notes/Knowledge/Study)          │     │
│  │    - Apply mode-specific rules                                 │     │
│  │    - Select relevant tools for mode                            │     │
│  │                                                                  │     │
│  │    Mode Examples:                                               │     │
│  │    - IDE Mode → File tools, terminal, code analysis            │     │
│  │    - Notes Mode → AI commands, blocks, search                  │     │
│  │    - Knowledge Mode → RAG, synthesis, import                   │     │
│  │    - Study Mode → Quiz, flashcards, spaced repetition          │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 3. Context Gathering                                           │     │
│  │    - Load conversation history                                 │     │
│  │    - Load workspace context                                    │     │
│  │    - RAG query for relevant documents                          │     │
│  │    - Assemble context window                                   │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 4. Prompt Composition                                          │     │
│  │    - System prompt (mode-specific)                             │     │
│  │    - User message                                              │     │
│  │    - Context (RAG results)                                     │     │
│  │    - Tool definitions                                          │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 5. LLM Execution                                               │     │
│  │    - Select provider (BYOK vault)                              │     │
│  │    - Send request with timeout                                 │     │
│  │    - Stream response                                           │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 6. Tool Invocation (if LLM requests tools)                     │     │
│  │    - Parse tool calls from response                            │     │
│  │    - Execute tools (file, note, knowledge)                     │     │
│  │    - Collect results                                           │     │
│  │    - Continue with tool results                                │     │
│  └────────────────────────────────────────────────────────────────┘     │
│      │                                                                   │
│      ▼                                                                   │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │ 7. Response Generation                                         │     │
│  │    - Format response (markdown, blocks, artifacts)             │     │
│  │    - Stream to UI                                              │     │
│  │    - Store in conversation                                     │     │
│  └────────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Tool Execution Flow

```
Tool Call from LLM
      │
      ▼
┌─────────────────────────┐
│ Parse Tool Definition   │ ← ToolDefinition interface
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Check Permission        │ ← WorkspacePermissionManager
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌─────────┐
│ Granted │   │ Denied  │
└────┬────┘   └────┬────┘
     │             │
     ▼             ▼
┌─────────┐   ┌─────────┐
│ Execute │   │ Return  │
│ Tool    │   │ Error   │
└────┬────┘   └─────────┘
     │
     ▼
┌─────────────────────────┐
│ Handle Result/Error     │ ← RetryQueue, ExecutionLogger
└───────────┬─────────────┘
            │
            ▼
      Return to LLM
```

---

## 3. User Stories - Agent/LLM (DETAILED)

### Story AGENT-01: Mode-Based Agent Behavior

```
As a user
I want the AI agent to behave differently based on my current workspace
So that I get relevant suggestions and tools for what I'm doing

Priority: P0
Estimation: 1 day (verify + tune)

Acceptance Criteria:
- [ ] AC1: In IDE workspace, agent prioritizes code-related tools
- [ ] AC2: In Notes workspace, agent prioritizes AI commands and blocks
- [ ] AC3: In Knowledge workspace, agent prioritizes RAG and synthesis
- [ ] AC4: In Study workspace, agent prioritizes quiz and flashcards
- [ ] AC5: Mode switch is seamless (no reload required)
- [ ] AC6: Mode-appropriate suggestions appear in chat

Technical Requirements:
- [ ] TR1: `ModeClassifier.classify(workspaceType, message)` returns mode
- [ ] TR2: `ModePromptConfig` defines system prompts per mode
- [ ] TR3: `ToolFilter.filter(tools, mode)` selects relevant tools
- [ ] TR4: Mode stored in conversation context

Edge Cases:
- [ ] EC1: Cross-workspace request (e.g., "create note about this code") → Switch mode
- [ ] EC2: Ambiguous message → Clarification or default mode
- [ ] EC3: Mode switch mid-conversation → Clear indication to user
- [ ] EC4: User explicitly requests out-of-mode tool → Allow, inform

Combined Uses:
- [ ] CU1: IDE mode, ask about documentation → Uses Knowledge RAG
- [ ] CU2: Notes mode, ask to write code → Switches to IDE mode
- [ ] CU3: Knowledge mode, ask to edit note → Switches to Notes mode

Non-Functional Requirements:
- [ ] NFR1: Mode classification < 50ms
- [ ] NFR2: Mode switch has no visible latency
- [ ] NFR3: Mode visible in UI (badge or indicator)

Tests Required:
- [ ] Unit: Mode classification accuracy
- [ ] Integration: Mode-specific prompts applied
- [ ] E2E: Behavior changes per workspace
```

### Story AGENT-02: Tool Execution with Permissions

```
As a security-conscious user
I want AI agents to ask permission before accessing files or executing commands
So that I maintain control over my system

Priority: P0
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Agent cannot access files without permission
- [ ] AC2: Permission requested once per session (not per tool call)
- [ ] AC3: Permission scoped to workspace
- [ ] AC4: Denied permissions result in clear error (not silent failure)
- [ ] AC5: Permission changes take effect immediately

Technical Requirements:
- [ ] TR1: `WorkspacePermissionManager` stores permissions by workspace
- [ ] TR2: `ToolPermissionManager` checks before each execution
- [ ] TR3: `PermissionDialog` UI for granting/denying
- [ ] TR4: `TrustLevel` enum: LOW, MEDIUM, HIGH

Permission Levels:
- [ ] PL1: LOW - Read-only, non-destructive (search notes, read files)
- [ ] PL2: MEDIUM - Modify but no delete (write files, create notes)
- [ ] PL3: HIGH - Destructive (delete files, execute commands)

Edge Cases:
- [ ] EC1: Permission granted, then workspace changes → Re-prompt?
- [ ] EC2: Agent attempts multiple tools in one turn → Batch permission?
- [ ] EC3: Permission dialog timing → Don't interrupt flow
- [ ] EC4: Dangerous command (rm -rf) → Extra confirmation

Combined Uses:
- [ ] CU1: Grant file access, agent reads multiple files → Single permission
- [ ] CU2: Deny terminal, agent needs it → Clear error, suggest alternative
- [ ] CU3: Partial permission (read yes, write no) → Respect boundaries

Non-Functional Requirements:
- [ ] NFR1: Permission check < 10ms
- [ ] NFR2: Permission state persists across sessions
- [ ] NFR3: Clear UI (not confusing modal)

Tests Required:
- [ ] Unit: Permission check logic
- [ ] Unit: Trust level enforcement
- [ ] Integration: Permission dialog flow
- [ ] E2E: Full permission workflow
```

### Story AGENT-03: RAG-Powered Context

```
As a user with knowledge base
I want the AI to use relevant documents from my knowledge base
So that answers are informed by my existing content

Priority: P0
Estimation: 3 days (refactoring - split god modules)

Acceptance Criteria:
- [ ] AC1: Knowledge sources indexed and searchable
- [ ] AC2: RAG query returns relevant chunks with citations
- [ ] AC3: Citations in response link to source
- [ ] AC4: Indexing progress visible during import
- [ ] AC5: Manual re-index available

Technical Requirements:
- [ ] TR1: `RagService.query(query, options)` returns results
- [ ] TR2: `ChunkingStrategy` interface with multiple implementations
- [ ] TR3: `EmbeddingService` interface (cloud + local)
- [ ] TR4: `IndexManager` handles multiple index types

RAG Pipeline:
```
Source Import → Chunking → Embedding → Indexing → Storage
                                               │
Query → Embedding → Retrieval → Fusion → Context
```

Edge Cases:
- [ ] EC1: No indexed content → Inform user, offer to index
- [ ] EC2: Query returns no results → Expand search or fallback
- [ ] EC3: Large document (>100KB) → Chunk appropriately
- [ ] EC4: Index corruption → Rebuild with warning
- [ ] EC5: Multiple sources with conflicting info → All returned, user decides

Combined Uses:
- [ ] CU1: Ask question, RAG retrieves relevant notes → Cites sources
- [ ] CU2: Import PDF, auto-index → Available for RAG
- [ ] CU3: Ask about code, RAG finds relevant documentation

Non-Functional Requirements:
- [ ] NFR1: Query latency < 500ms (with <100 chunks)
- [ ] NFR2: Index size < original size (compression)
- [ ] NFR3: Index survives browser restart
- [ ] NFR4: Works offline (local embedding)

Tests Required:
- [ ] Unit: Chunking strategies
- [ ] Unit: Embedding generation
- [ ] Integration: Full RAG pipeline
- [ ] E2E: User imports, queries, gets answers
```

### Story AGENT-04: Multimodal Input/Output

```
As a user
I want to interact with AI using images, voice, and get rich outputs
So that communication is natural and comprehensive

Priority: P1
Estimation: 5 days (deferred to Phase 3)

Acceptance Criteria:
- [ ] AC1: Upload images for AI analysis (vision)
- [ ] AC2: Voice input for hands-free interaction
- [ ] AC3: Voice output for audio responses
- [ ] AC4: Rich outputs (charts, diagrams, HTML artifacts)
- [ ] AC5: Appropriate icons/indicators for mode

Technical Requirements:
- [ ] TR1: `VisionProcessor` handles image input
- [ ] TR2: `VoiceInput` captures and transcribes audio
- [ ] TR3: `VoiceOutput` synthesizes speech
- [ ] TR4: `ArtifactRenderer` for rich outputs

Input Modes:
- Text (default)
- Voice (button toggle)
- Image (attachment)

Output Modes:
- Text (default)
- Voice (user preference)
- Artifact (charts, code blocks, HTML)

Edge Cases:
- [ ] EC1: Large image (>10MB) → Resize or reject
- [ ] EC2: Voice transcription error → Fallback to text
- [ ] EC3: Unsupported format → Clear error
- [ ] EC4: Audio playback interrupted → Queue or stop

Combined Uses:
- [ ] CU1: Upload screenshot, ask "what does this UI do?" → Vision analysis
- [ ] CU2: Dictate note, ask to summarize → Voice in, text out
- [ ] CU3: Ask for data visualization → Chart artifact output

Non-Functional Requirements:
- [ ] NFR1: Image processing < 2s
- [ ] NFR2: Voice transcription < 1s
- [ ] NFR3: Voice output natural (not robotic)
- [ ] NFR4: Accessibility: alternatives for all modes

Tests Required:
- [ ] Unit: Image processing
- [ ] Unit: Voice transcription
- [ ] Integration: Multimodal pipeline
- [ ] E2E: Full multimodal conversation

DEFER NOTE: Multimodal is Phase 3 work. Focus Phase 1-2 on core agent + RAG.
```

### Story AGENT-05: Tool Error Handling & Retry

```
As a user
I want the AI to handle tool errors gracefully and retry when appropriate
So that transient failures don't ruin the experience

Priority: P1
Estimation: 2 days (refactoring)

Acceptance Criteria:
- [ ] AC1: Transient errors (network) retry automatically
- [ ] AC2: Permanent errors (permission denied) return clear message
- [ ] AC3: Unknown errors provide best-effort response + suggestion
- [ ] AC4: Retry attempts visible to user
- [ ] AC5: Max retries configurable (default 3)

Technical Requirements:
- [ ] TR1: `ToolError` with categories: TRANSIENT, PERMANENT, UNKNOWN
- [ ] TR2: `RetryQueue` with exponential backoff
- [ ] TR3: `ErrorClassifier` determines category
- [ ] TR4: `ExecutionLogger` records errors for debugging

Error Categories:
- TRANSIENT: Network timeout, rate limit, server error → Retry
- PERMANENT: Permission denied, file not found, invalid input → No retry
- UNKNOWN: Unexpected error → Limited retries + fallback

Edge Cases:
- [ ] EC1: Retry storm → Exponential backoff prevents
- [ ] EC2: Tool partially succeeded → Partial result returned
- [ ] EC3: User cancels during retry → Abort
- [ ] EC4: Infinite loop possibility → Max attempts hard limit

Combined Uses:
- [ ] CU1: Network blip, tool retries silently → User unaware
- [ ] CU2: File deleted, tool returns clear error → User can fix
- [ ] CU3: Unknown error, tool retries twice, then gives up → Logged

Non-Functional Requirements:
- [ ] NFR1: Retry decision < 10ms
- [ ] NFR2: Max total time < 30s for any tool call
- [ ] NFR3: No memory leaks from retry queue
- [ ] NFR4: Clear user feedback on errors

Tests Required:
- [ ] Unit: Error classification
- [ ] Unit: Retry logic with backoff
- [ ] Integration: Tool execution with errors
- [ ] E2E: User sees appropriate error/retry UI
```

---

## 4. Agent/LLM → Architecture Conflict Matrix

| Agent/LLM Story | Architecture Issue | Conflict Severity | Fix Required |
|-----------------|-------------------|-------------------|--------------|
| AGENT-01 | Mode classifier works (✅) | - | - |
| AGENT-02 | Tool catalog missing init (P1) | MEDIUM | Add startup hook |
| AGENT-03 | Knowledge god module (P0) | BLOCKING | Split into 6 sub-modules |
| AGENT-03 | RAG god module (P0) | BLOCKING | Split into 5 sub-modules |
| AGENT-03 | blocksToMarkdown incomplete (P0) | BLOCKING | Enhance function |
| AGENT-03 | Knowledge tools lazy init (P0) | BLOCKING | Add vault-ready check |
| AGENT-04 | Multimodality scattered (P1) | MEDIUM | Consolidate in Phase 3 |
| AGENT-05 | Retry config too conservative (P2) | LOW | Increase default retries |

---

## 5. File Change Manifest - Agent/LLM

### 5.1 Files to CREATE

| File | Purpose | Lines | Story |
|------|---------|-------|-------|
| `lib/knowledge/synthesis/synthesis-service.ts` | Synthesis orchestration | 100 | AGENT-03 |
| `lib/knowledge/import/import-service.ts` | Source import orchestration | 80 | AGENT-03 |
| `lib/knowledge/graph/graph-service.ts` | Knowledge graph operations | 80 | AGENT-03 |
| `lib/rag/chunking/chunking-service.ts` | Chunking orchestration | 80 | AGENT-03 |
| `lib/rag/retrieval/retrieval-service.ts` | Retrieval orchestration | 100 | AGENT-03 |
| `lib/rag/indexing/indexing-service.ts` | Indexing orchestration | 80 | AGENT-03 |
| `lib/agent/tools/tool-registry-init.ts` | Startup initialization | 30 | AGENT-02 |
| `lib/agent/errors/error-classifier.ts` | Error categorization | 60 | AGENT-05 |

### 5.2 Files to MODIFY

| File | Change | Lines | Story |
|------|--------|-------|-------|
| `note-tools-impl.ts` | Enhance blocksToMarkdown | +100 | AGENT-03 |
| `knowledge-tools-impl.ts` | Add vault-ready check | +30 | AGENT-03 |
| `tool-catalog.ts` | Add initialization hook | +20 | AGENT-02 |
| `tool-error.ts` | Add error categories | +30 | AGENT-05 |
| `tool-execution-logger.ts` | Enhanced error logging | +20 | AGENT-05 |

### 5.3 Files to DELETE (After Verification)

| File | Reason | Story |
|------|--------|-------|
| `lib/knowledge/*` (old, after split) | Replaced by subdirectories | AGENT-03 |
| `lib/rag/*` (old, after split) | Replaced by subdirectories | AGENT-03 |

---

## 6. Agent/LLM Must-Pass Checklist

### Pre-Refactor Verification

- [ ] Current tool system catalogued
- [ ] Mode classifier tested in all workspaces
- [ ] RAG pipeline documented
- [ ] Error handling current state known

### During Refactor

- [ ] Knowledge sub-modules created
- [ ] RAG sub-modules created
- [ ] blocksToMarkdown handles all block types
- [ ] Vault-ready check in KnowledgeToolsFacade
- [ ] Tool registry initialized at startup
- [ ] Error classification working

### Post-Refactor Verification

- [ ] lib/knowledge/ has 6 subdirectories (<15 files each)
- [ ] lib/rag/ has 5 subdirectories (<15 files each)
- [ ] All tools execute with proper permissions
- [ ] RAG queries return results with citations
- [ ] Mode-specific behavior verified in each workspace
- [ ] No console errors in normal operation
- [ ] TypeScript compilation succeeds

---

## 7. Dependencies & Risks

### Dependencies

| Dependency | Status | Impact |
|------------|--------|--------|
| BYOK Vault | ⚠️ Must be ready | Core for all agent calls |
| Project Space Storage | ⚠️ Must be ready | File/note access |
| TanStack AI | ✅ Ready | LLM orchestration |
| Orama/Vector DB | ✅ Ready | RAG indexing |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **RAG module split breaks functionality** | Medium | High | Test each sub-module in isolation |
| **Tool init race condition** | Low | High | Use async init with readiness check |
| **Mode classification wrong** | Medium | Medium | Fallback to general mode, learn from feedback |
| **Knowledge import too slow** | Medium | Medium | Background indexing with progress UI |

### Deferred (Not MVP)

| Item | Reason | When |
|------|--------|------|
| Multimodal I/O (AGENT-04) | Complex, depends on core | Phase 3 |
| Advanced RAG strategies | Nice to have | Phase 4 |
| Agent learning from feedback | Future research | Future |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [shard-03-04 - Cascade Chat Flow](./shard-03-04-chat-flow.md)*
