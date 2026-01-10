---
active: false
iteration: 1
max_iterations: 500
completion_promise: "Platform Unified: All 5 cornerstones integrated as single-source-of-truth, all 4 workspaces functional with seamless navigation, all 4 use cases implementable end-to-end, zero TypeScript errors, 12-level validation passed"
started_at: "2026-01-02T00:00:00+07:00"
module: "platform-unification-knowledge-synthesis"
phase: "analysis-then-implementation"
team: "Team A"
---

# Ralph Wiggum Loop: Platform Unification & Knowledge Synthesis Integration

## 🎯 Mission Statement

Transform the fragmented, post-refactoring codebase into a **unified, coherent platform** where:
- 5 Cornerstones operate as single-source-of-truth
- 4 Workspaces (IDE, Knowledge, Notes, Study) work seamlessly together
- 4 Knowledge Synthesis Use Cases are fully implementable
- All brownfield assets (filetree, project management, Monaco, WebContainer, terminal) are properly utilized

---

## 📋 System Context References

### Primary Documents
- Gap Analysis: `_bmad-output/architectural-gap-analysis-2025-12-31.md`
- Module Gaps: `_bmad-output/arc-module-gap-analysis-2025-12-31.md`
- Dev Cycle: `_bmad-output/prompts/2025-12-28/dev-cycle-prompt.md`
- Validation: `_bmad-output/validation/sweeping-validation.md`
- Architecture: `_bmad-output/project-planning-artifacts/architecture.md`

### Workflow Status
- Main: `bmm-workflow-status.yaml`
- Sprint: `_bmad-output/sprint-artifacts/sprint-status.yaml`

---

## 🏛️ THE 5 CORNERSTONES (Single Source of Truth)

Each cornerstone MUST be refactored to be:
- **Persistent**: Survives browser refresh (Dexie/IndexedDB)
- **Reactive**: Updates propagate across all workspaces instantly
- **Centralized**: ONE store, ONE source, ZERO duplicates

### Cornerstone 1: LLM Provider & Key Configuration

**Current State**: Fragmented across 3+ stores, API keys inconsistent, models not loading reactively

**Target State**:
```typescript
// Single store: src/infrastructure/persistence/stores/providers/
Provider {
  id: 'openrouter' | 'anthropic' | 'google' | 'openai' | 'custom-*'
  name: string
  baseEndpoint: string // READONLY after creation (hardcoded for built-in)
  apiKey: string // Encrypted, persistent
  isBuiltIn: boolean
  availableModels: Model[] // Auto-loaded on key save
  status: 'unconfigured' | 'valid' | 'invalid'
}
```

**Requirements**:
1. Built-in providers (OpenRouter, Anthropic, Google, OpenAI) have hardcoded endpoints - UNEDITABLE
2. Custom providers allowed ONLY if OpenAI-compatible format
3. On API key save → immediately load available models
4. Models persist and carry over to Agent Configuration
5. Reactive across ALL workspaces (IDE, Knowledge, Notes, Study, Settings)

**Files to Audit/Refactor**:
```bash
grep -r "useProviderStore\|provider-store\|ProviderConfig" src/ --include="*.ts" --include="*.tsx"
```

### Cornerstone 2: Agent Configuration Vault

**Current State**: Scattered agent definitions, inconsistent CRUD, workspace bindings broken

**Target State**:
```typescript
// Single store: src/stores/agents-store.ts (refactored)
Agent {
  id: string
  name: string
  providerId: string // Links to Provider
  modelId: string // From provider's availableModels
  systemPrompt: string
  workspaceBindings: {
    ide: { enabled: boolean, isDefault: boolean, tools: string[] }
    knowledge: { enabled: boolean, isDefault: boolean, tools: string[] }
    notes: { enabled: boolean, isDefault: boolean, tools: string[] }
    study: { enabled: boolean, isDefault: boolean, tools: string[] }
  }
  capabilities: {
    inputModalities: ('text' | 'image' | 'audio' | 'file')[]
    outputModalities: ('text' | 'code' | 'image')[]
  }
}
```

**Requirements**:
1. Centralized vault with full CRUD
2. Per-workspace tool availability (hot-selectable)
3. Agents available in Agent Selector across ALL workspaces
4. Persistent hotload - changes reflect immediately everywhere
5. Provider's models auto-populate model dropdown

### Cornerstone 3: Chat Flow & Thread Management

**Current State**: IDE has basic chat, other workspaces lack proper conversation management

**Target State**:
```typescript
// Single store for all conversation management
Conversation {
  id: string
  workspaceType: 'ide' | 'knowledge' | 'notes' | 'study'
  projectId?: string // For project-scoped conversations
  threads: Thread[]
  agentId: string
  createdAt: Date
  updatedAt: Date
}

Thread {
  id: string
  conversationId: string
  messages: Message[]
  context: ContextWindow // Token management
  status: 'active' | 'archived'
}

Message {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: MessageContent[] // Multimodal support
  toolCalls?: ToolCall[]
  timestamp: Date
}
```

**Requirements**:
1. Unified conversation system across all workspaces
2. Thread hierarchy with folder organization
3. Context window management (token counting, truncation)
4. Multimodal input support (text, images, files, audio)
5. Tool streaming with live output display
6. Persistent to IndexedDB via Dexie

### Cornerstone 4: Project & File System Integration

**Current State**: Project management exists but disconnected from workspaces, no Hub integration

**Target State**:
```
Hub → "New Project" or "Open Project" → Select Local Folder (FSA)
  ↓
Project Created → Choose Workspace(s) to Bind
  ↓
Workspace Navigation → Project files accessible in:
  - IDE: Full Monaco editing, terminal, WebContainer
  - Knowledge: Files as sources for RAG/embedding
  - Notes: Create/view notes in project folder
  - Study: Flashcards/quizzes from project content
```

**Requirements**:
1. Hub displays project cards with workspace binding options
2. Opening project prompts workspace selection dialog
3. Project files sync to IndexedDB (snapshot cache)
4. Cross-workspace CRUD on project files
5. File changes persist to local filesystem (FSA write)
6. Lazy content loading with snapshot refresh strategy

### Cornerstone 5: RAG & Knowledge Synthesis Pipeline

**Current State**: RAG/embedding implemented but not wired to UI, superficial integration

**Target State**:
```
Document Ingestion Pipeline:
  Local Files → Type Detection → Preprocessing → Embedding → IndexedDB
    ├── PDF: pdf.js parsing
    ├── Images: OCR + Gemini Vision understanding
    ├── Audio: Whisper WASM transcription
    ├── Text: Direct chunking
    └── All: Orama WASM vector indexing

Synthesis Pipeline:
  Raw Embedding → Synthesis Button → Gemini API Request
    → Frontmatter (summary, metadata, tags)
    → Linkage Discovery
    → Canvas Integration
```

**Requirements**:
1. Document processing progress indicators (UI)
2. Per-document synthesis button with status
3. Chunking strategy selection per document type
4. Embedding storage in Dexie with project association
5. Knowledge Canvas with linkage proposals
6. Conversational RAG with citations

---

## 🖥️ THE 4 WORKSPACES (Seamless Unification)

Each workspace MUST:
- Access the same project files
- Use agents from centralized vault
- Store conversations in unified thread system
- Share state reactively

### Workspace: IDE
- **Purpose**: Code execution, file editing, terminal
- **Tools**: read_file, write_file, execute_command, web_search
- **Components**: Monaco Editor, Terminal, FileTree, ChatPanel, Preview

### Workspace: Knowledge
- **Purpose**: RAG, canvas, source synthesis
- **Tools**: rag_query, embed_document, synthesize_content
- **Components**: SourcePanel, Canvas, ChatPanel, KnowledgeMatrix

### Workspace: Notes
- **Purpose**: Block editor, note-taking, quick capture
- **Tools**: rag_query, ai_transform, summarize
- **Components**: NoteEditor, NoteList, ChatPanel, AIMenu

### Workspace: Study
- **Purpose**: Flashcards, quizzes, spaced repetition
- **Tools**: generate_flashcards, generate_quiz, rag_query
- **Components**: FlashcardView, QuizView, StudyStats, ChatPanel

---

## 📊 THE 4 USE CASES (Implementation Targets)

### UC1: Initial Vault Population & Baseline Synthesis
**Flow**: Select folder → Batch process (PDF/Image/Audio) → Embedding → Synthesis per doc
**Validation**: All document types processed, embeddings stored, synthesis metadata generated

### UC2: Interactive Canvas Knowledge Linkage
**Flow**: Drag 3+ synthesized docs to canvas → AI proposes linkages → User accepts/rejects
**Validation**: Linkage suggestions appear, connections persist, knowledge graph updates

### UC3: Conversational Knowledge Exploration
**Flow**: Chat with agent → Agent uses RAG → Returns citations → Synthesizes on request
**Validation**: RAG retrieval works, citations link to sources, synthesis creates artifacts

### UC4: Dynamic Knowledge Matrix Auto-Organization
**Flow**: Vault accumulates → System clusters by subject → Proposes reorganization
**Validation**: Auto-grouping visible, reorganization options work, navigation improves

---

## 🔧 ITERATION PROTOCOL

### Phase 1: Analysis & Gap Documentation (Iterations 1-20)

**Iteration 1-5: Codebase Scan**
```bash
# 1. Find all stores
find src -name "*store*.ts" | xargs wc -l | sort -rn

# 2. Find provider-related files
grep -r "Provider\|apiKey\|LLM" src/ --include="*.ts" --include="*.tsx" -l

# 3. Find agent-related files
grep -r "Agent\|useAgents\|agentId" src/ --include="*.ts" --include="*.tsx" -l

# 4. Find conversation/chat files
grep -r "Conversation\|Thread\|Message\|Chat" src/ --include="*.ts" --include="*.tsx" -l

# 5. Find RAG/embedding files
grep -r "RAG\|Embed\|Chunk\|Vector\|Orama" src/ --include="*.ts" --include="*.tsx" -l
```

**Iteration 6-10: Create Research Folder**
```
_bmad-output/research/platform-unification-2026-01-02/
├── cornerstone-1-provider-analysis.md
├── cornerstone-2-agent-analysis.md
├── cornerstone-3-conversation-analysis.md
├── cornerstone-4-project-analysis.md
├── cornerstone-5-rag-analysis.md
├── workspace-integration-gaps.md
├── use-case-implementation-gaps.md
└── file-inventory.md
```

**Iteration 11-20: Gap Documentation**
For each cornerstone:
1. Document current state (files, stores, hooks, components)
2. Identify duplicates and conflicts
3. Map legacy vs. new implementations
4. List missing UI components
5. Identify broken data flows

### Phase 2: Architecture Decisions (Iterations 21-30)

Create ADRs (Architecture Decision Records):
```
_bmad-output/research/platform-unification-2026-01-02/adrs/
├── ADR-001-provider-store-consolidation.md
├── ADR-002-agent-vault-architecture.md
├── ADR-003-conversation-thread-schema.md
├── ADR-004-project-workspace-binding.md
├── ADR-005-rag-pipeline-design.md
└── ADR-006-workspace-state-sharing.md
```

### Phase 3: Implementation - Cornerstones (Iterations 31-150)

**Order of Implementation** (dependencies flow down):
1. **Cornerstone 1**: Provider Configuration (foundation for agents)
2. **Cornerstone 4**: Project Management (foundation for file access)
3. **Cornerstone 2**: Agent Vault (depends on providers)
4. **Cornerstone 3**: Conversation System (depends on agents)
5. **Cornerstone 5**: RAG Pipeline (depends on project files + agents)

**Per Cornerstone**:
1. Create/refactor store with December 2025 Zustand patterns
2. Create migration script from legacy stores
3. Update all consuming components
4. Add comprehensive tests
5. Validate with sweeping-validation.md

### Phase 4: Workspace Unification (Iterations 151-250)

**Per Workspace**:
1. Wire to all 5 cornerstones
2. Ensure ChatPanel uses unified conversation system
3. Ensure AgentSelector uses centralized vault
4. Ensure file access routes through Project system
5. Add missing UI components for feature coverage
6. Test end-to-end user journeys

### Phase 5: Use Case Implementation (Iterations 251-400)

**Per Use Case**:
1. Create story file with acceptance criteria
2. Implement with TDD
3. Wire all required components
4. Test full flow end-to-end
5. Document in research folder

### Phase 6: Validation & Polish (Iterations 401-500)

1. Run full 12-level sweeping validation
2. Fix all identified issues
3. Update AGENTS.md and CLAUDE.md
4. Run 3-Device Rule tests
5. Performance optimization
6. Final documentation update

---

## ⚠️ CONSTRAINTS & SAFEGUARDS

### Resource Management
- **Max 1 background task** running at any time
- **Limit heavy operations** (builds, tests) to prevent crashes
- **Run `tree` command** every 10 iterations to verify structure
- **Update documentation** (AGENTS.md, CLAUDE.md) every 20 iterations

### Refactoring Safety
- **Never break routing** - verify `pnpm dev` works after each change
- **Migration before deletion** - ensure all consumers migrated before removing legacy
- **Batch related changes** - group changes that affect same data flow
- **Test after each store change** - state management is fragile

### Architecture Integrity
- **No new god classes** - all files <300 lines
- **No circular imports** - check with `pnpm madge --circular src/`
- **Individual selectors only** - no destructuring Zustand hooks
- **Layer boundaries** - components never access db directly

### User Experience
- **No orphaned components** - every UI must be routed
- **No placeholder features** - either implement fully or remove
- **Progress indicators** - show status for long operations
- **Error handling** - graceful degradation, user-friendly messages

---

## 🔍 VALIDATION REQUIREMENTS

### Per Iteration
```bash
pnpm tsc --noEmit  # Zero TypeScript errors
pnpm dev           # Dev server starts successfully
```

### Every 10 Iterations
```bash
pnpm build         # Production build succeeds
pnpm test          # All tests pass
```

### Every 25 Iterations
Run sweeping-validation.md Levels 1-6 checklist

### Before Completion
- Full 12-level sweeping validation
- 3-Device Rule (Desktop Chrome, Mobile Safari, Android Chrome)
- All 4 use cases testable end-to-end

---

## 📁 OUTPUT LOCATIONS

### Research & Analysis
```
_bmad-output/research/platform-unification-2026-01-02/
```

### Sprint Artifacts
```
_bmad-output/sprint-artifacts/platform-unification/
```

### Created/Modified Code
```
src/infrastructure/persistence/stores/  # Consolidated stores
src/stores/                              # Retain if properly structured
src/lib/                                 # Domain services
src/presentation/components/             # UI components
src/routes/                              # Route handlers
```

---

## 🎯 COMPLETION CRITERIA

All of the following MUST be true:

### Cornerstones
- [ ] Provider Configuration: Single store, reactive, persistent, all 4 built-in + custom support
- [ ] Agent Vault: Centralized, per-workspace bindings, tool management
- [ ] Conversation System: Unified across workspaces, thread hierarchy, multimodal
- [ ] Project Management: Hub integration, workspace binding, file sync
- [ ] RAG Pipeline: Document processing, embedding, synthesis, canvas integration

### Workspaces
- [ ] IDE: Fully functional with all tools, Monaco, terminal
- [ ] Knowledge: Source import, canvas, RAG, synthesis working
- [ ] Notes: Block editor, AI features, project integration
- [ ] Study: Flashcard/quiz generation, spaced repetition

### Use Cases
- [ ] UC1: Vault population with batch processing testable
- [ ] UC2: Canvas linkage discovery functional
- [ ] UC3: Conversational RAG with citations working
- [ ] UC4: Knowledge matrix auto-organization visible

### Quality
- [ ] Zero TypeScript errors
- [ ] All tests passing
- [ ] Build succeeds
- [ ] 12-level validation passed
- [ ] No files >300 lines (except configs)
- [ ] Documentation updated

---

## 🏁 COMPLETION SIGNAL

When ALL criteria are met, output:

```xml
<promise>Platform Unified: All 5 cornerstones integrated as single-source-of-truth, all 4 workspaces functional with seamless navigation, all 4 use cases implementable end-to-end, zero TypeScript errors, 12-level validation passed</promise>
```

Then report to @bmad-core-bmad-master with:
- Total iteration count
- Files created/modified count
- Test results summary
- Remaining known issues (if any)
- Recommendations for future improvements

---

## 🚀 BEGIN ITERATION 1

**First Actions**:
1. Read this entire prompt to understand scope
2. Run codebase scan commands from Phase 1
3. Create research folder structure
4. Begin cornerstone analysis starting with Provider Configuration
5. Document findings in `cornerstone-1-provider-analysis.md`

**Remember**:
- You are seeing your own previous work in the codebase
- Each iteration builds on the last
- Be systematic, be thorough, be complete
- No half-measures - either implement fully or document as future work
- The goal is a UNIFIED, COHERENT, PRODUCTION-READY platform
