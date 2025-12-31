---
date: 2025-12-31
time: "08:20:00"
phase: Sprint Planning - Knowledge Synthesis Station
team: Team-A | Team-B
agent_mode: bmad-core-bmad-master
---

# Knowledge Synthesis Platform - Sprint Planning & Story Development

## Executive Summary

This document orchestrates sprint planning for the Knowledge Synthesis Platform based on the completed technical specification ([`knowledge-synthesis-platform-tech-spec-2025-12-31.md`](_bmad-output/knowledge-synthesis-platform/knowledge-synthesis-platform-tech-spec-2025-12-31.md)). Story 32-1 (Orama WASM Vector Store Enhancement) is already COMPLETE, establishing the foundation for RAG Infrastructure.

### Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| Story 32-1 (Orama WASM) | ✅ DONE | All 5 ACs validated, code reviewed |
| EPIC-32 (RAG Infrastructure) | 🚧 IN_PROGRESS | Stories 32-2 through 32-5 pending |
| EPIC-33 (Agent Integration) | 📋 BACKLOG | Ready for sprint planning |
| EPIC-34 (Image Understanding) | 📋 BACKLOG | Ready for sprint planning |
| EPIC-35 (Document Processing) | 📋 BACKLOG | Ready for sprint planning |
| EPIC-36 (Adaptive Learning) | 📋 BACKLOG | Ready for sprint planning |
| EPIC-37 (Study Artifacts) | 📋 BACKLOG | Ready for sprint planning |

### Team Assignment

| Team | Focus Area | Rationale |
|------|------------|-----------|
| **Team A (UI/Foundation)** | EPIC-32 (32-2, 32-3), EPIC-34 UI | Frontend integration, canvas components |
| **Team B (Backend/Agent)** | EPIC-32 (32-4, 32-5), EPIC-33 | RAG optimization, agent integration |

---

## Part 1: EPIC-32 Stories (Continuing from Story 32-1)

### Story 32-2: Hybrid Search Engine Implementation

**As a** user searching my knowledge base,  
**I want** hybrid search combining full-text and vector similarity,  
**So that** I can find relevant content using both exact keywords and semantic meaning.

#### Acceptance Criteria

**Given** a user enters search query "machine learning neural networks"  
**When** hybrid search executes  
**Then** results include documents matching both:  
- Exact keywords: "machine learning", "neural networks"  
- Semantic meaning: deep learning, AI, backpropagation  
**And** results are ranked by combined relevance score  
**And** response time <500ms for 10,000 documents

**Given** a user searches with quoted phrase "exact phrase match"  
**When** hybrid search executes  
**Then** phrase-matched documents receive boost in ranking  
**And** non-matching documents excluded from top results

**Given** a user applies filters (date range, source type)  
**When** hybrid search executes  
**Then** results are filtered before ranking  
**And** filter metadata is displayed in results

#### Technical Implementation

```typescript
// src/lib/rag/hybrid-retriever.ts (EXTENSION)
// Building on existing orama-index.ts (551 lines)

// New HybridSearchConfig interface
interface HybridSearchConfig {
  weightVector: number;        // 0-1, default 0.7 for vector
  weightFulltext: number;      // 0-1, default 0.3 for fulltext
  minScore: number;            // minimum threshold
  filters?: SearchFilters;
  limit: number;               // max results
}

// New hybridSearch function
export async function hybridSearch(
  query: string,
  config: HybridSearchConfig
): Promise<HybridSearchResult[]> {
  // Execute both searches in parallel
  const [vectorResults, fulltextResults] = await Promise.all([
    oramaIndex.vectorSearch(query, config),
    oramaIndex.fulltextSearch(query, config)
  ]);
  
  // Merge and rerank
  return mergeAndRerank(vectorResults, fulltextResults, config);
}
```

#### Dependencies & Integration Points

| Dependency | Integration Point | Status |
|------------|-------------------|--------|
| Story 32-1 (Orama Index) | Uses oramaIndex.vectorSearch() | ✅ DONE |
| rag-store.ts | State management for search results | ✅ EXISTS |
| KnowledgePage | Search UI integration | ⚠️ WIRE NEEDED |

#### Tasks

- [ ] Research Orama hybrid search configuration options (Context7 MCP)
- [ ] Implement hybridSearch() function in hybrid-retriever.ts
- [ ] Add weighted scoring algorithm (vector 0.7, fulltext 0.3)
- [ ] Implement result merging with deduplication
- [ ] Add filter support (date, source type)
- [ ] Write unit tests (target: 15 tests, 80% coverage)
- [ ] Wire to KnowledgePage search component
- [ ] Validate against sweeping-validation.md Level 5 (Integration Reality)

---

### Story 32-3: Semantic Citation System

**As a** researcher synthesizing knowledge,  
**I want** automatic citations linking AI responses to source documents,  
**So that** I can verify information and trace findings back to original sources.

#### Acceptance Criteria

**Given** an AI generates response citing document D123  
**When** user hovers over citation [1]  
**Then** tooltip shows document title, relevant excerpt, and relevance score  
**And** clicking citation opens source document in preview panel

**Given** response contains multiple citations  
**When** citations are numbered sequentially  
**Then** citation order reflects descending relevance  
**And** duplicate sources are consolidated (single citation)

**Given** user clicks "Show all citations"  
**When** citation sidebar expands  
**Then** all cited documents are listed with relevance scores  
**And** document cards show matching text snippets

#### Technical Implementation

```typescript
// src/lib/rag/citation-manager.ts (NEW)

interface Citation {
  id: string;
  documentId: string;
  documentTitle: string;
  excerpt: string;           // Matching text snippet
  relevanceScore: number;
  position: { start: number; end: number }; // In response text
}

interface CitationContext {
  responseId: string;
  citations: Citation[];
  generatedAt: Date;
}

export class CitationManager {
  // Extract citations from AI response with source references
  async extractCitations(
    response: string,
    sources: SearchResult[]
  ): Promise<CitationContext> {
    // Parse source IDs from response markers [1], [2], etc.
    // Match to search results
    // Generate excerpts from matching content
    // Return structured citation context
  }
  
  // Render inline citations with hover tooltips
  renderInlineCitations(citations: Citation[]): JSX.Element {
    return (
      <div className="citation-inline">
        {citations.map((c, i) => (
          <CitationTooltip key={c.id} citation={c} index={i + 1} />
        ))}
      </div>
    );
  }
}
```

#### UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `CitationTooltip.tsx` | `src/components/rag/` | Hover card with document preview |
| `CitationSidebar.tsx` | `src/components/rag/` | Sidebar showing all citations |
| `CitationInline.tsx` | `src/components/rag/` | Inline citation component |

#### Dependencies & Integration Points

| Dependency | Integration Point | Status |
|------------|-------------------|--------|
| Story 32-2 (Hybrid Search) | Search results for source matching | 📋 BACKLOG |
| RAGChatPanel | Citation display in chat responses | ⚠️ EXISTS, NEEDS EXTENSION |
| CitationSidebar | Already exists in rag-components | ✅ EXISTS |

#### Tasks

- [ ] Implement CitationManager class
- [ ] Create CitationTooltip component (8-bit styling)
- [ ] Extend RAGChatPanel with citation rendering
- [ ] Implement citation extraction from AI responses
- [ ] Add citation sidebar toggle to KnowledgePage
- [ ] Write unit tests (target: 12 tests, 80% coverage)
- [ ] Validate against sweeping-validation.md Level 8 (I18N Wiring)

---

### Story 32-4: RAG Query Optimization

**As a** user with large knowledge base,  
**I want** optimized query performance,  
**So that** search remains fast even with 100,000+ indexed documents.

#### Acceptance Criteria

**Given** knowledge base contains 100,000+ documents  
**When** user executes search query  
**Then** response time remains <500ms (target: <300ms P95)  
**And** memory usage stays within browser limits

**Given** concurrent search requests (3+ simultaneous)  
**When** queries execute  
**Then** requests are queued and processed without race conditions  
**And** UX shows loading states for all pending queries

**Given** frequent search patterns detected  
**When** cache TTL expires  
**Then** results are cached for 5 minutes  
**And** cache hit reduces response time by 50%+

#### Technical Implementation

```typescript
// src/lib/rag/query-optimizer.ts (NEW)

interface QueryOptimizerConfig {
  maxConcurrentQueries: number;
  cacheTTL: number;        // milliseconds
  batchWindow: number;     // milliseconds
  memoryLimitMB: number;
}

export class QueryOptimizer {
  private queue: QueryRequest[] = [];
  private cache: LRUCache<string, SearchResult[]>;
  private semaphore: Semaphore;
  
  constructor(private config: QueryOptimizerConfig) {
    this.semaphore = new Semaphore(config.maxConcurrentQueries);
    this.cache = new LRUCache({
      maxSize: 1000,
      ttl: config.cacheTTL
    });
  }
  
  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    // Check cache first
    const cacheKey = this.getCacheKey(query, filters);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    // Acquire semaphore slot
    await this.semaphore.acquire();
    try {
      // Execute search
      const results = await this.performSearch(query, filters);
      
      // Cache results
      this.cache.set(cacheKey, results);
      
      return results;
    } finally {
      this.semaphore.release();
    }
  }
}
```

#### Performance Targets

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Query Latency P95 | <300ms | Performance API timing |
| Query Latency P99 | <500ms | Performance API timing |
| Memory Usage | <512MB | performance.memory |
| Cache Hit Rate | >30% | Cache statistics |

#### Dependencies & Integration Points

| Dependency | Integration Point | Status |
|------------|-------------------|--------|
| Story 32-2 (Hybrid Search) | Core search implementation | 📋 BACKLOG |
| DexieDB | Caching layer | ✅ EXISTS |
| Performance monitoring | Already implemented in Epic 5 | ✅ EXISTS |

#### Tasks

- [ ] Implement QueryOptimizer with concurrency control
- [ ] Add LRU cache with TTL
- [ ] Implement cache key generation
- [ ] Add performance metrics tracking
- [ ] Configure batch window for query coalescing
- [ ] Write unit tests (target: 18 tests, 85% coverage)
- [ ] Performance benchmarking (100K+ documents)

---

### Story 32-5: Knowledge Graph Integration

**As a** user exploring knowledge connections,  
**I want** RAG search results to show knowledge graph relationships,  
**So that** I can navigate between related concepts visually.

#### Acceptance Criteria

**Given** search returns documents about "reinforcement learning"  
**When** knowledge graph integration is enabled  
**Then** results panel shows connected concepts as graph nodes  
**And** clicking node navigates to related document  
**And** edge relationships show connection type (cites, builds_on, related_to)

**Given** user selects two documents in search results  
**When** "Compare" action is invoked  
**Then** knowledge graph highlights shared concepts  
**And** comparison view shows semantic overlap

**Given** user adds new document to vault  
**When** document is indexed and synthesized  
**Then** knowledge graph is automatically updated  
**And** connections to existing documents are suggested

#### Technical Implementation

```typescript
// src/lib/rag/graph-integration.ts (NEW)

interface GraphSearchResult {
  documents: SearchResult[];
  graphNodes: KnowledgeGraphNode[];
  graphEdges: KnowledgeGraphEdge[];
  suggestions: ConnectionSuggestion[];
}

export class GraphIntegration {
  async searchWithGraph(
    query: string,
    options: GraphSearchOptions
  ): Promise<GraphSearchResult> {
    // Execute hybrid search
    const documents = await hybridSearch(query, options);
    
    // Extract concepts from results
    const concepts = this.extractConcepts(documents);
    
    // Find graph connections
    const nodes = await this.findRelatedConcepts(concepts);
    const edges = await this.findConnections(documents, nodes);
    
    // Generate suggestions for new connections
    const suggestions = await this.suggestConnections(documents);
    
    return { documents, graphNodes: nodes, graphEdges: edges, suggestions };
  }
  
  private async findRelatedConcepts(concepts: string[]): Promise<KnowledgeGraphNode[]> {
    // Query knowledge graph for related concepts
    const nodes: KnowledgeGraphNode[] = [];
    for (const concept of concepts) {
      const related = await knowledgeGraph.query(concept);
      nodes.push(...related);
    }
    return dedupe(nodes);
  }
}
```

#### Integration Points

| Component | Integration | Status |
|-----------|-------------|--------|
| Knowledge Graph | Uses existing graph infrastructure | ✅ EXISTS |
| Canvas Integration | Node visualization | ⚠️ NEEDS WIRE |
| Story 32-2 (Search) | Uses hybrid search | 📋 BACKLOG |

#### Tasks

- [ ] Implement GraphIntegration class
- [ ] Create graph query interface for concept lookup
- [ ] Implement connection suggestion algorithm
- [ ] Add "View in Graph" action to search results
- [ ] Wire to KnowledgeCanvas for visualization
- [ ] Write unit tests (target: 15 tests, 80% coverage)

---

## Part 2: EPIC-33 Stories (Agent Integration)

### Story 33-1: Knowledge-Aware Agent System Prompt

**As an** AI agent working with user's knowledge base,  
**I want** system prompts that include my vault context,  
**So that** I can answer questions using synthesized knowledge.

#### Acceptance Criteria

**Given** agent configured with knowledge vault access  
**When** conversation starts  
**Then** system prompt includes:  
- List of indexed documents with titles  
- Recent synthesis topics  
- Knowledge graph context (key concepts)  
**And** token usage stays within model limits

**Given** user asks about specific topic  
**When** RAG retrieval provides context  
**Then** system prompt includes retrieved content inline  
**And** citations are formatted for reference

**Given** vault has 1000+ documents  
**When** constructing system prompt  
**Then** only relevant subset is included (top 10 by relevance)  
**And** truncation indicator shows if content omitted

#### Technical Implementation

```typescript
// src/lib/agent/vault-context-composer.ts (NEW)

interface VaultContextConfig {
  maxDocuments: number;      // Default: 10
  maxTokens: number;         // Model context limit
  includeGraph: boolean;     // Include knowledge graph
  includeSyntheses: boolean; // Include synthesized content
}

export async function composeVaultContext(
  conversationId: string,
  config: VaultContextConfig
): Promise<VaultContextSection> {
  // Get conversation context
  const recentTopics = await getRecentTopics(conversationId);
  
  // Get relevant documents
  const relevantDocs = await ragStore.search(recentTopics, {
    limit: config.maxDocuments,
    sortBy: 'relevance'
  });
  
  // Get knowledge graph context
  const graphContext = config.includeGraph
    ? await knowledgeGraph.getContext(relevantDocs.map(d => d.id))
    : null;
  
  // Construct context section
  return {
    documents: relevantDocs,
    graph: graphContext,
    syntheses: config.includeSyntheses
      ? await getSyntheses(relevantDocs)
      : [],
    tokenCount: await countTokens(relevantDocs, graphContext)
  };
}

// Hook for agent configuration
export function useVaultContextAgent() {
  const vaultContext = useVaultContext();
  
  return {
    systemPrompt: composeVaultContextAgentPrompt(vaultContext),
    tools: [
      searchKnowledgeBase,    // New RAG search tool
      getDocumentContext,     // Get full document
      getGraphContext         // Get knowledge graph context
    ]
  };
}
```

#### Dependencies & Integration Points

| Dependency | Integration Point | Status |
|------------|-------------------|--------|
| RAG Infrastructure | Search and retrieval | 📋 EPIC-32 |
| Knowledge Graph | Context from graph | 📋 EPIC-32 |
| Agent System Prompt | Compose with vault context | ⚠️ EXISTS, NEEDS EXTENSION |

#### Tasks

- [ ] Implement VaultContextComposer
- [ ] Add RAG tools to agent tool registry
- [ ] Create vault-aware system prompt templates
- [ ] Implement token counting and truncation
- [ ] Write unit tests (target: 12 tests, 80% coverage)
- [ ] Integration test with TanStack AI

---

### Story 33-2: RAG Tool Integration

**As an** AI agent,  
**I want** dedicated tools for searching and retrieving from knowledge base,  
**So that** I can answer questions using user's synthesized materials.

#### Acceptance Criteria

**Given** agent has `search_knowledge` tool available  
**When** user asks "What did I learn about neural networks?"  
**Then** agent can invoke tool to search vault  
**And** results are returned with citations  
**And** agent can cite results in response

**Given** agent has `get_document` tool available  
**When** agent needs full document content  
**Then** tool retrieves and returns document text  
**And** tool respects access permissions

**Given** agent has `get_graph_context` tool available  
**When** agent explores concept relationships  
**Then** tool returns connected concepts and documents  
**And** agent can navigate knowledge graph via tools

#### Tool Definitions (TanStack AI)

```typescript
// src/lib/agent/tools/knowledge-tools.ts (NEW)

import { tool } from '@tanstack/ai';
import { z } from 'zod';

// Search knowledge base
export const searchKnowledgeBase = tool({
  description: 'Search the user\'s knowledge base for relevant documents and syntheses',
  parameters: z.object({
    query: z.string().describe('Search query describing the information needed'),
    filters: z.object({
      dateRange: z.object({
        start: z.string().optional(),
        end: z.string().optional()
      }).optional(),
      sourceTypes: z.array(z.string()).optional(),
      subjects: z.array(z.string()).optional()
    }).optional(),
    limit: z.number().min(1).max(20).default(10)
  }),
  execute: async ({ query, filters, limit }) => {
    const results = await hybridSearch(query, {
      weightVector: 0.7,
      weightFulltext: 0.3,
      filters,
      limit
    });
    
    return {
      results: results.map(r => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        relevanceScore: r.score,
        citations: r.sources
      })),
      totalHits: results.length,
      searchTimestamp: new Date().toISOString()
    };
  }
});

// Get full document
export const getDocumentContext = tool({
  description: 'Retrieve the full content of a specific document from the knowledge base',
  parameters: z.object({
    documentId: z.string().describe('The ID of the document to retrieve'),
    includeMetadata: z.boolean().default(true)
  }),
  execute: async ({ documentId, includeMetadata }) => {
    const doc = await documentStore.get(documentId);
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    return {
      document: includeMetadata ? {
        ...doc.content,
        _metadata: doc.metadata
      } : doc.content
    };
  }
});

// Get knowledge graph context
export const getGraphContext = tool({
  description: 'Get knowledge graph context for exploring concept relationships',
  parameters: z.object({
    concept: z.string().describe('Concept to explore'),
    depth: z.number().min(1).max(3).default(2),
    includeDocuments: z.boolean().default(true)
  }),
  execute: async ({ concept, depth, includeDocuments }) => {
    const nodes = await knowledgeGraph.query(concept, { depth });
    
    return {
      concepts: nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        connections: n.connections
      })),
      documents: includeDocuments
        ? await getDocumentsForNodes(nodes)
        : []
    };
  }
});
```

#### Dependencies & Integration Points

| Dependency | Integration Point | Status |
|------------|-------------------|--------|
| Story 32-2 (Hybrid Search) | searchKnowledgeBase tool implementation | 📋 EPIC-32 |
| Knowledge Graph | getGraphContext tool | 📋 EPIC-32 |
| Agent Tool Registry | Register new tools | ⚠️ EXISTS, NEEDS EXTENSION |

#### Tasks

- [ ] Implement knowledge-tools.ts with 3 tools
- [ ] Register tools in agent configuration
- [ ] Add tool schemas with Zod validation
- [ ] Implement tool execution handlers
- [ ] Write unit tests (target: 20 tests, 85% coverage)
- [ ] Integration test with TanStack AI agent

---

### Story 33-3: Context-Aware Response Generation

**As a** user asking questions about my knowledge,  
**I want** AI responses that properly cite sources and use synthesis context,  
**So that** answers are grounded in my synthesized materials.

#### Acceptance Criteria

**Given** user asks about topics covered in vault  
**When** agent generates response  
**Then** response includes inline citations [1], [2], etc.  
**And** citations map to specific source documents  
**And** confidence level reflects source quality

**Given** multiple sources have conflicting information  
**When** agent generates response  
**Then** response acknowledges conflicts  
**And** presents both perspectives  
**And** doesn't take definitive stance without evidence

**Given** user asks about unknown topic  
**When** RAG returns no relevant results  
**Then** agent responds acknowledging knowledge gap  
**And** suggests related topics in vault  
**And** doesn't hallucinate information

#### Technical Implementation

```typescript
// src/lib/agent/vault-aware-generator.ts (NEW)

import { generateText } from '@tanstack/ai';
import { vaultAwarePrompt } from './prompt-templates';

export async function generateVaultAwareResponse(
  userMessage: string,
  vaultContext: VaultContext,
  options: GenerationOptions
): Promise<VaultAwareResponse> {
  // Construct prompt with vault context
  const prompt = vaultAwarePrompt({
    userMessage,
    vaultContext,
    options
  });
  
  // Generate response
  const { text, usage, sources } = await generateText({
    model: options.model,
    prompt,
    tools: [searchKnowledgeBase, getDocumentContext, getGraphContext]
  });
  
  // Extract and format citations
  const citations = await extractCitations(text, sources);
  
  // Generate response with citations
  return {
    content: text,
    citations,
    confidence: calculateConfidence(sources),
    conflicts: identifyConflicts(sources),
    knowledgeGap: sources.length === 0
  };
}

// Prompt template for vault-aware responses
function vaultAwarePrompt(params: PromptParams): string {
  return `
You are a knowledgeable AI assistant helping the user explore their synthesized knowledge base.

## USER QUESTION
${params.userMessage}

## AVAILABLE KNOWLEDGE
${params.vaultContext.documents.map((d, i) => `
[${i + 1}] "${d.title}"
    Relevance: ${d.relevanceScore.toFixed(2)}
    Content excerpt: ${d.excerpt}
`).join('\n')}

## KNOWLEDGE GRAPH CONTEXT
${params.vaultContext.graphConcepts.map(c => `- ${c.label} (${c.type})`).join('\n')}

## INSTRUCTIONS
1. Answer based primarily on the provided knowledge sources
2. Cite sources using [1], [2], etc. inline
3. If sources conflict, acknowledge both perspectives
4. If no relevant sources exist, say so and suggest related topics
5. Synthesize information rather than just listing sources

## RESPONSE
`;
}
```

#### Dependencies & Integration Points

| Dependency | Integration Point | Status |
|------------|-------------------|--------|
| Story 33-1 (Vault Context) | composeVaultContext | 📋 BACKLOG |
| Story 33-2 (RAG Tools) | Tool integration | 📋 BACKLOG |
| TanStack AI | generateText | ✅ EXISTS |

#### Tasks

- [ ] Implement vault-aware prompt templates
- [ ] Create generateVaultAwareResponse function
- [ ] Implement citation extraction from generated text
- [ ] Add conflict detection logic
- [ ] Implement knowledge gap detection
- [ ] Write unit tests (target: 15 tests, 80% coverage)

---

### Story 33-4: Agent-Vault Conversation Memory

**As a** user having ongoing conversations about my knowledge,  
**I want** the agent to remember what we've discussed,  
**So that** I don't need to repeat context in subsequent messages.

#### Acceptance Criteria

**Given** user asks about "the document on reinforcement learning"  
**When** conversation has prior references to this document  
**Then** agent recognizes the reference without re-explanation  
**And** can provide additional context from the document

**Given** conversation spans multiple sessions  
**When** user returns to previous topic  
**Then** conversation memory persists via IndexedDB  
**And** agent restores context from previous session

**Given** user explicitly says "forget that" about a topic  
**When** agent processes command  
**Then** topic is removed from conversation memory  
**And** subsequent queries don't reference forgotten content

#### Technical Implementation

```typescript
// src/lib/agent/conversation-memory.ts (NEW)

interface ConversationMemory {
  id: string;
  threadId: string;
  topics: MemoryTopic[];
  referencedDocuments: Map<string, ReferencedDocument>;
  createdAt: Date;
  lastAccessed: Date;
}

interface MemoryTopic {
  id: string;
  label: string;
  firstMentioned: Date;
  lastMentioned: Date;
  messageCount: number;
  documentRefs: string[]; // Document IDs referenced
  summary: string; // Auto-generated summary
}

export class ConversationMemoryManager {
  private memoryStore: DexieTable<ConversationMemory>;
  
  async rememberTopic(
    threadId: string,
    topic: { label: string; documentRefs: string[] }
  ): Promise<void> {
    const memory = await this.getOrCreate(threadId);
    
    // Update or create topic
    const existing = memory.topics.find(t => t.label === topic.label);
    if (existing) {
      existing.lastMentioned = new Date();
      existing.messageCount++;
    } else {
      memory.topics.push({
        id: crypto.randomUUID(),
        label: topic.label,
        firstMentioned: new Date(),
        lastMentioned: new Date(),
        messageCount: 1,
        documentRefs: topic.documentRefs,
        summary: await this.generateTopicSummary(topic)
      });
    }
    
    // Update referenced documents
    for (const docId of topic.documentRefs) {
      const ref = memory.referencedDocuments.get(docId) || {
        documentId: docId,
        firstReferenced: new Date(),
        lastReferenced: new Date(),
        mentionCount: 0
      };
      ref.lastReferenced = new Date();
      ref.mentionCount++;
      memory.referencedDocuments.set(docId, ref);
    }
    
    await this.persist(memory);
  }
  
  async getContextForQuery(threadId: string, query: string): Promise<MemoryContext> {
    const memory = await this.get(threadId);
    if (!memory) return { topics: [], documents: [] };
    
    // Find relevant topics based on query
    const relevantTopics = memory.topics.filter(t => 
      t.label.includes(query) || t.documentRefs.some(ref => 
        memory.referencedDocuments.get(ref)?.documentId.includes(query)
      )
    );
    
    // Get most referenced documents
    const relevantDocs = Array.from(memory.referencedDocuments.entries())
      .filter(([_, ref]) => ref.mentionCount > 1)
      .sort((a, b) => b[1].mentionCount - a[1].mentionCount)
      .slice(0, 5)
      .map(([id, ref]) => ({
        documentId: id,
        mentionCount: ref.mentionCount,
        lastReferenced: ref.lastReferenced
      }));
    
    return {
      topics: relevantTopics,
      documents: relevantDocs
    };
  }
}
```

#### Dependencies & Integration Points

| Dependency | Integration Point | Status |
|------------|-------------------|--------|
| DexieDB | Persistent storage | ✅ EXISTS |
| useConversationStore | Thread context | ⚠️ EXISTS, NEEDS EXTENSION |
| Story 2-4 (Conversation Persistence) | Base implementation | ✅ DONE |

#### Tasks

- [ ] Implement ConversationMemoryManager
- [ ] Add Dexie schema for memory storage
- [ ] Create memory context integration with agent
- [ ] Implement topic summarization
- [ ] Add "forget" command handler
- [ ] Write unit tests (target: 15 tests, 80% coverage)

---

## Part 3: Sprint Coordination & Validation

### Story Development Cycle Coordination

Per `.agent/workflows/story-dev-cycle.md`, each story follows:

```
create-story → create-context → validate → dev-story → code-review → done
```

#### Handoff Document Structure

For each story, create handoff at:
```
_bmad-output/handoffs/{agent}-{epic}-{story}-{YYYY-MM-DD}.md
```

**Example handoff template:**
```markdown
## Handoff: Story 32-2 (Hybrid Search)

**From:** @bmad-core-bmad-master  
**To:** @bmad-bmm-dev

**Task:** Implement hybrid search combining full-text and vector similarity

**Context Files:**
- `src/lib/rag/orama-index.ts` (existing Orama implementation)
- `src/lib/rag/rag-store.ts` (RAG state management)
- `_bmad-output/knowledge-synthesis-platform/.../tech-spec-2025-12-31.md`

**Acceptance Criteria:**
1. Hybrid search with weighted scoring (vector 0.7, fulltext 0.3)
2. Response time <500ms for 10,000 documents
3. Filter support (date range, source type)
4. Unit tests (15 tests, 80% coverage)

**Output Location:** `_bmad-output/sprint-artifacts/story-32-2-hybrid-search.md`

**Return via:** Report to @bmad-core-bmad-master with completion summary
```

### Sweeping Validation Checklist

Per `_bmad-output/validation/sweeping-validation.md`, validate each story against:

| Level | Validation | EPIC-32 Stories | EPIC-33 Stories |
|-------|------------|-----------------|-----------------|
| 1 | State Integrity | ✅ Zustand + Dexie pattern | ✅ Same |
| 2 | Code Hygiene | ⚠️ File size <300 lines | ⚠️ Same |
| 3 | Naming Consistency | ✅ camelCase props | ✅ Same |
| 4 | Dependency Sanity | ⚠️ No circular imports | ⚠️ Same |
| 5 | Integration Reality | ⚠️ Wire to existing | ⚠️ Same |
| 6 | Architecture Compliance | ✅ No direct DB access | ✅ Same |
| 7 | Mobile Reality | ✅ 8-bit styling | ✅ Same |
| 8 | I18N Wiring | ⚠️ Translation keys | ⚠️ Same |
| 9 | Performance | ⚠️ <500ms target | ⚠️ Same |
| 10 | Security + Privacy | ✅ No raw keys | ✅ Same |

### Integration Points Mapping

| Story | Existing Component | Integration Needed |
|-------|-------------------|-------------------|
| 32-2 | orama-index.ts | Extend with fulltext search |
| 32-3 | RAGChatPanel | Add citation rendering |
| 32-4 | Performance monitoring | Wire metrics collection |
| 32-5 | Knowledge Graph | Connect graph queries |
| 33-1 | System Prompt Composer | Add vault context |
| 33-2 | Agent tools | Register new tools |
| 33-3 | TanStack AI | Wire vault-aware generation |
| 33-4 | Conversation store | Add memory persistence |

---

## Part 4: Implementation Timeline

### Sprint 1 (Week 1-2): RAG Infrastructure Completion

| Day | Team A | Team B |
|-----|--------|--------|
| 1 | Story 32-2: Research Orama hybrid config | Story 32-4: QueryOptimizer core |
| 2 | Story 32-2: Implement hybridSearch | Story 32-4: Add LRU cache |
| 3 | Story 32-2: Write tests | Story 32-4: Performance benchmarking |
| 4 | Story 32-3: CitationManager | Story 32-5: GraphIntegration |
| 5 | Story 32-3: CitationTooltip UI | Story 32-5: Graph queries |
| 6 | Integration: Wire to KnowledgePage | Integration: Wire to Canvas |
| 7 | **VALIDATION SWEEP** | **VALIDATION SWEEP** |

### Sprint 2 (Week 3-4): Agent Integration

| Day | Team A | Team B |
|-----|--------|--------|
| 8 | Story 33-1: Vault context composer | Story 33-2: Knowledge tools |
| 9 | Story 33-1: Prompt templates | Story 33-2: Tool registration |
| 10 | Story 33-3: Response generator | Story 33-2: Tool tests |
| 11 | Story 33-3: Citation extraction | Story 33-4: Memory manager |
| 12 | Story 33-3: Conflict detection | Story 33-4: Memory persistence |
| 13 | Integration: Agent configuration | Integration: Conversation store |
| 14 | **EPIC-32 RETROSPECTIVE** | **VALIDATION SWEEP** |

### EPIC-33 Completion Criteria

- [ ] All 4 stories complete (33-1 through 33-4)
- [ ] All unit tests passing (target: 62 tests, 80% coverage)
- [ ] Code review approved (APPROVED or APPROVED WITH NOTES)
- [ ] Sweeping validation: 12/12 levels pass
- [ ] Integration test: Agent searches vault successfully

---

## Part 5: Next Steps

### Immediate Actions (Next 24 hours)

1. **@bmad-bmm-pm**: Create story files for 32-2 through 32-5
2. **@bmad-bmm-architect**: Verify integration points with existing codebase
3. **@bmad-bmm-dev**: Begin Story 32-2 implementation

### Handoff Sequence

| Sequence | From | To | Story |
|----------|------|-----|-------|
| 1 | Orchestrator | @bmad-bmm-sm | Create story 32-2 file |
| 2 | @bmad-bmm-sm | @bmad-bmm-dev | Implement 32-2 |
| 3 | @bmad-bmm-dev | @code-reviewer | Code review 32-2 |
| 4 | Orchestrator | @bmad-bmm-sm | Create story 32-3 file |
| ... | ... | ... | ... |

### Critical Success Factors

1. **No Duplicate Work**: Check existing implementations before creating new files
2. **Integration First**: Wire to existing components before implementing new logic
3. **Test Coverage**: Maintain 80% coverage target for all new code
4. **Validation Gates**: Pass sweeping validation before marking stories done

---

## References

| Document | Path | Purpose |
|----------|------|---------|
| Technical Specification | `_bmad-output/knowledge-synthesis-platform/.../tech-spec-2025-12-31.md` | Implementation reference |
| Story Dev Cycle | `.agent/workflows/story-dev-cycle.md` | Workflow guidance |
| Sweeping Validation | `_bmad-output/validation/sweeping-validation.md` | Quality gates |
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status.yaml` | Status tracking |
| BMM Workflow | `bmm-workflow-status.yaml` | Overall state |

---

**Document Version:** 1.0  
**Created:** 2025-12-31 08:20:00 UTC+7  
**Next Review:** After Story 32-2 completion
