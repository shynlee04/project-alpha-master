# RAG & Agent Auto-Switching Research Report

**Date:** 2026-01-11  
**Research Type:** Best Practices & Feasibility Analysis  
**Scope:** Executable recommendations for Project Alpha (Via-Gent)

---

## Executive Summary

This research analyzes two critical capability areas for Via-Gent:

1. **RAG (Retrieval Augmented Generation)**: Best practices for local-first, browser-based implementation
2. **Agent Mode Auto-Switching**: What's possible for multi-agent orchestration with context handoffs

### Key Findings

| Area | Current State | Feasibility | Recommendation |
|------|---------------|-------------|----------------|
| **RAG** | Uses Orama vector DB in browser | ✅ HIGH | Optimize chunking, add caching, fix N+1 |
| **Agent Auto-Switching** | Single agent system | ⚠️ MEDIUM | Implement handoff pattern first |

---

## Part 1: RAG Best Practices

### 1.1 Current Implementation Assessment

**What's Already in Place:**

```
src/lib/rag/                          ← 30+ files
├── orama-index.ts                    ← Vector search (browser-based)
├── embedding-service.ts              ← Embeddings
├── hybrid-retriever.ts               ← Hybrid search
├── incremental-indexing-service.ts   ← Incremental updates
└── ...30 more files

src/infrastructure/persistence/stores/rag/
├── useRAGStore.ts (327 lines)        ← God store - needs decomposition
├── rag-index-slice.ts                ← Index management
├── rag-search-slice.ts               ← Search operations
└── ...
```

**Key Issues (from audit):**
- N+1 query pattern in `knowledge-source-crud-slice.ts:56-62`
- `useRAGStore.ts` is a god store (327 lines)
- Missing error boundary on `/knowledge` route
- Type scattering (types in 5+ locations)

### 1.2 2025 RAG Best Practices

Based on research from industry leaders (Medium/Marc Haraoui, 2025):

#### A. Chunking Strategies

| Strategy | Best For | Via-Gent Status |
|----------|----------|-----------------|
| **Fixed-size** | Simple documents | ✅ In use |
| **Semantic** | Complex, structured content | ⚠️ Limited |
| **Recursive** | Hierarchical structures | ✅ In use |
| **HyDE (Hypothetical Doc Embedding)** | Zero-shot queries | ❌ Not implemented |

**Recommendation:**
```
Priority 1: Optimize fixed-size chunker (already exists)
Priority 2: Add semantic chunking for complex docs
Priority 3: Consider HyDE for better retrieval
```

#### B. Retrieval Optimization

| Technique | Impact | Via-Gent Status |
|-----------|--------|-----------------|
| **Metadata Filtering** | High - narrows search space | ⚠️ Basic |
| **Reranking (Cross-encoder)** | High - improves relevance | ❌ Not implemented |
| **Two-phase retrieval** | Medium - balances speed/accuracy | ⚠️ Partial |
| **Hybrid search (vector + keyword)** | High - better recall | ✅ In use |

**Recommendation:**
```
Priority 1: Add metadata filtering pre/post processing
Priority 2: Implement lightweight reranker
Priority 3: Optimize hybrid search parameters
```

#### C. Caching Strategies

| Cache Type | Benefit | Implementation |
|------------|---------|----------------|
| **Embedding Cache** | Avoid recomputing frequent queries | Add LRU cache |
| **Retrieval Results** | Serve repeated queries fast | Add query cache |
| **Generated Answers** | Static Q&A | Add response cache |

**Recommendation:**
```
Add: embedding-cache.ts (already exists - optimize)
Add: query-cache.ts (missing - priority)
Add: response cache for static content
```

#### D. Browser-Based Vector Search (Orama)

**Orama Capabilities:**
- ✅ Runs entirely in browser via WebAssembly
- ✅ IndexedDB persistence for offline storage
- ✅ Full-text + vector + hybrid search
- ✅ Patented automatic embedding conversion
- ⚠️ Limited by browser memory constraints

**Performance Considerations:**

| Metric | Recommendation |
|--------|----------------|
| **Index Size** | Keep < 100MB for browser |
| **Embedding Dimensions** | Use 384 (smaller, faster) |
| **Batch Indexing** | Chunk large documents |
| **Memory Management** | Use IndexedDB persistence |

### 1.3 RAG Improvement Roadmap

#### Phase 1: Quick Wins (Week 1)

| Task | Effort | Impact | Files |
|------|--------|--------|-------|
| Fix N+1 query pattern | 2h | HIGH | knowledge-source-crud-slice.ts |
| Add error boundary | 1h | MEDIUM | /knowledge route |
| Add query cache | 4h | MEDIUM | embedding-service.ts |
| Optimize chunker params | 2h | MEDIUM | document-chunker.ts |

#### Phase 2: Core Improvements (Week 2-3)

| Task | Effort | Impact | Files |
|------|--------|--------|-------|
| Decompose useRAGStore | 1 day | HIGH | rag-store decomposition |
| Add metadata filtering | 4h | HIGH | hybrid-retriever.ts |
| Implement reranker | 1 day | HIGH | new: rag-reranker.ts |
| Consolidate RAG types | 4h | MEDIUM | domain/entities/rag.ts |

#### Phase 3: Advanced Features (Week 4+)

| Task | Effort | Impact |
|------|--------|--------|
| HyDE query augmentation | 2 days | HIGH |
| Multi-modal RAG (images) | 1 week | MEDIUM |
| Real-time sync | 1 week | HIGH |

---

## Part 2: Agent Mode Auto-Switching

### 2.1 What Is Agent Auto-Switching?

**Definition:**
The ability of an AI system to automatically transition between different agent modes/tasks based on context, user intent, or task requirements.

**Industry Terminology:**
- **Handoff Pattern** - One agent transfers control to another
- **Agents-as-Tools** - Agents invoke other agents as tools
- **Multi-Agent Orchestration** - Central coordinator manages agent teams

### 2.2 Patterns for Auto-Switching

Based on OpenAI Agents SDK and 2025 research:

#### Pattern 1: Handoff Pattern ⭐ (Recommended for Via-Gent)

```
User: "Analyze this code and explain it"

Orchestrator:
  └─> Code Agent (specialist in code analysis)
      └─> When user asks about documentation:
          └─> Handoff to Writer Agent
              └─> Handoff back when done
```

**Implementation:**
```typescript
interface AgentHandoff {
  from: AgentType;
  to: AgentType;
  trigger: string | RegExp | ContextCondition;
  transferContext: boolean;
}

const handoffs: AgentHandoff[] = [
  {
    from: 'CODE_AGENT',
    to: 'WRITER_AGENT',
    trigger: /explain|document|describe/i,
    transferContext: true
  }
];
```

**Via-Gent Opportunity:**
- Code agent → Notes agent (when documenting)
- Chat agent → IDE agent (when coding needed)
- Knowledge agent → Study agent (when creating flashcards)

#### Pattern 2: Agents-as-Tools

```
User: "Search for React patterns and save to notes"

Research Agent (uses as tools):
  └─> Search Tool (built-in)
  └─> Notes Tool (another agent)
      └─> Save findings
```

**Implementation:**
```typescript
const agentAsTool = {
  name: 'research_notes_agent',
  description: 'Researches topics and saves to notes',
  tools: [
    searchTool,      // Built-in
    notesAgentAsTool // Another agent!
  ]
};
```

#### Pattern 3: Dynamic Routing

```
User Input → Classifier → Route to Best Agent
                              ├─> IDE Agent (if code detected)
                              ├─> Notes Agent (if writing detected)
                              ├─> Chat Agent (if conversation)
                              └─> Knowledge Agent (if research)
```

### 2.3 What's Possible for Via-Gent

#### High Feasibility (Can Build Now)

| Feature | Complexity | Effort |
|---------|------------|--------|
| Simple handoff (agent → agent) | LOW | 2-3 days |
| Context transfer | LOW | 1 day |
| Trigger-based routing | LOW | 1 week |
| Agent-as-tools pattern | MEDIUM | 2 weeks |

#### Medium Feasibility (Requires Planning)

| Feature | Complexity | Effort |
|---------|------------|--------|
| Hierarchical supervision | MEDIUM | 2-3 weeks |
| Dynamic agent creation | HIGH | 1 month |
| Multi-agent consensus | HIGH | 1 month+ |

#### Not Recommended (Out of Scope)

| Feature | Reason |
|---------|--------|
| Full CrewAI-like orchestration | Overkill for Via-Gent |
| Real-time agent negotiation | Too complex |
| Cross-instance agent communication | No infrastructure |

### 2.4 Recommended Implementation

#### Step 1: Handoff Infrastructure (Week 1)

```
src/domain/services/
├── agent-orchestrator.ts     ← NEW: Main orchestrator
├── agent-handoff.ts          ← NEW: Handoff logic
└── agent-router.ts           ← NEW: Simple router
```

**Key Components:**
```typescript
// Handoff Manager
class AgentHandoffManager {
  async handoff(
    fromAgent: Agent,
    toAgentType: AgentType,
    context: AgentContext,
    reason: string
  ): Promise<HandoffResult> {
    // 1. Capture current state
    // 2. Transfer relevant context
    // 3. Initialize new agent
    // 4. Resume from interruption point
  }
}
```

#### Step 2: Context Transfer (Week 2)

```
Context to transfer:
├─ Conversation history (last N messages)
├─ Current task state
├─ User preferences
├─ Workspace context
└─ Relevant documents
```

#### Step 3: Agent Registry (Week 2)

```typescript
const AGENT_REGISTRY = {
  chat: {
    agent: ChatAgent,
    capabilities: ['conversation', 'qa', 'general'],
    triggers: ['general chat', 'questions']
  },
  ide: {
    agent: IDEAgent,
    capabilities: ['code', 'terminal', 'fileops'],
    triggers: ['code', 'debug', 'terminal']
  },
  notes: {
    agent: NotesAgent,
    capabilities: ['write', 'edit', 'format'],
    triggers: ['document', 'write', 'edit']
  },
  knowledge: {
    agent: KnowledgeAgent,
    capabilities: ['search', 'rag', 'synthesize'],
    triggers: ['research', 'find', 'learn']
  }
};
```

#### Step 4: Routing Logic (Week 3)

```typescript
async function routeToAgent(
  input: UserInput,
  context: AgentContext
): Promise<AgentType> {
  // Simple keyword-based routing
  if (containsCode(input)) return 'ide';
  if (isWritingTask(input)) return 'notes';
  if (isResearchTask(input)) return 'knowledge';
  
  // LLM-based routing for complex cases
  const classification = await classifyIntent(input);
  return classification.bestAgent;
}
```

---

## Part 3: Implementation Priority Matrix

### Quick Wins (This Sprint)

| Task | Area | Effort | Impact | Dependencies |
|------|------|--------|--------|--------------|
| Fix N+1 queries | RAG | 2h | HIGH | None |
| Add /knowledge error boundary | RAG | 1h | MEDIUM | None |
| Create agent handoff interface | Agent | 2h | HIGH | None |
| Add query cache | RAG | 4h | MEDIUM | None |

### Short-term (Next 2 Weeks)

| Task | Area | Effort | Impact | Dependencies |
|------|------|--------|--------|--------------|
| Decompose useRAGStore | RAG | 1 day | HIGH | Quick wins |
| Implement handoff pattern | Agent | 1 week | HIGH | Handoff interface |
| Add metadata filtering | RAG | 4h | MEDIUM | None |
| Consolidate RAG types | RAG | 4h | MEDIUM | None |

### Medium-term (This Month)

| Task | Area | Effort | Impact | Dependencies |
|------|------|--------|--------|--------------|
| Implement agent router | Agent | 1 week | HIGH | Handoff pattern |
| Add reranker | RAG | 1 day | HIGH | Metadata filtering |
| Context transfer system | Agent | 1 week | HIGH | Handoff pattern |
| HyDE (optional) | RAG | 2 days | MEDIUM | Caching |

---

## Part 4: Research References

### RAG Best Practices

| Source | Key Insights |
|--------|--------------|
| Marc Haraoui, "Chapter 5: Best Practices for RAG" (2025) | Chunking, metadata filtering, reranking, caching |
| Morphik, "2025 Guide to Open-Source RAG Frameworks" | Framework comparison, production tips |
| Eden AI, "The 2025 Guide to RAG" | RAG techniques: Traditional, Long, Self-RAG |

### Agent Orchestration

| Source | Key Insights |
|--------|--------------|
| OpenAI Agents SDK | Handoff pattern, agents-as-tools |
| Kubiya, "Top AI Agent Orchestration Frameworks" (2025) | Framework comparison, enterprise patterns |
| Towards Data Science, "Multi-Agent Collaboration" (2025) | Handoff vs tools patterns |

### Browser-Based Vector Search

| Source | Key Insights |
|--------|--------------|
| Orama (oramasearch/orama) | Browser-based vector search, IndexedDB persistence |
| TrueFoundry, "Best Vector Databases 2025" | Local-first options, performance benchmarks |

---

## Part 5: Recommendations Summary

### For RAG

**Do:**
- ✅ Fix the N+1 query pattern (immediate)
- ✅ Decompose the god store (useRAGStore.ts)
- ✅ Add metadata filtering to hybrid search
- ✅ Implement caching (embedding + query)
- ✅ Add error boundary to /knowledge route
- ✅ Consolidate RAG types to domain/entities/rag.ts

**Don't:**
- ❌ Don't add complex features until N+1 is fixed
- ❌ Don't use external vector DB (browser-first is correct)
- ❌ Don't over-engineer chunking yet

### For Agent Auto-Switching

**Do:**
- ✅ Start with simple handoff pattern
- ✅ Implement context transfer first
- ✅ Use keyword-based routing initially
- ✅ Build agent registry for discoverability

**Don't:**
- ❌ Don't build full multi-agent orchestration yet
- ❌ Don't implement dynamic agent creation
- ❌ Don't add complex consensus mechanisms

---

## Files to Create/Modify

### New Files

```
src/domain/services/
├── agent-handoff.ts              ← Handoff logic
├── agent-router.ts               ← Routing logic
└── agent-orchestrator.ts         ← Main orchestrator

src/domain/entities/rag/
├── index.ts                      ← Barrel export
├── types.ts                      ← Consolidated types
└── schemas.ts                    ← Zod schemas

src/lib/rag/
├── rag-reranker.ts               ← Cross-encoder reranker
└── rag-cache.ts                  ← Unified cache layer
```

### Modified Files

```
src/infrastructure/persistence/stores/rag/
├── rag-store.ts                  ← Decompose useRAGStore
├── rag-index-slice.ts            ← Extract from god store
├── rag-search-slice.ts           ← Extract from god store
└── rag-chat-slice.ts             ← Extract from god store

src/routes/knowledge.$projectId.lazy.tsx  ← Add error boundary
src/lib/rag/knowledge-source-crud-slice.ts ← Fix N+1
```

---

## Conclusion

### RAG Status: **Optimize, Don't Rebuild**
- Current Orama-based implementation is sound
- Focus on performance (N+1, caching) and maintainability (store decomposition)
- Add metadata filtering and reranking for better retrieval

### Agent Auto-Switching Status: **Start Simple**
- Handoff pattern is achievable and valuable
- Build context transfer and routing first
- Avoid over-engineering with complex orchestration

### Next Steps

1. **This message:** Review this report
2. **Decision:** Approve or adjust priorities
3. **Sprint planning:** Add tasks to bmm-workflow-status.yaml
4. **Implementation:** Start with quick wins

---

**Report Version:** 1.0  
**Research Date:** 2026-01-11  
**Status:** Ready for Planning

---

*Research conducted using industry best practices from 2025 sources*  
*References: Medium, OpenAI, Orama, Kubiya, Towards Data Science*
