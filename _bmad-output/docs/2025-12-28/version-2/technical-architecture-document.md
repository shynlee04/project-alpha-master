---
date: 2025-12-27
time: 21:22:00
phase: Research & Architecture Design
team: Team-A
agent_mode: bmad-bmm-architect
---

# Technical Architecture Document
## BMAD v6 Knowledge Synthesis System

**Document ID:** TECH-ARCH-2025-12-27
**Version:** 1.0
**Status:** Research Complete
**Research Period:** 2025-12-26 to 2025-12-27

---

## Executive Summary

This technical architecture document synthesizes findings from three comprehensive research domains to define the current state of Via-gent's AI agent infrastructure and establish the target BMAD v6 knowledge-synthesis architecture. The analysis identifies critical gaps in LLM provider configuration, agent definition layers, and RAG infrastructure, providing a roadmap for implementing enterprise-grade multi-agent orchestration capabilities.

### Research Scope

Three research domains were investigated:

| Domain | Research Artifact | Focus Areas |
|---------|-------------------|---------------|
| **Domain 1** | `domain-1-llm-provider-config-research.md` | LLM Provider CRUD, State Management, Hot-Reloading |
| **Domain 2** | `domain-2-agent-config-architecture-research.md` | Agent Definition Layers, Multi-Modal Orchestration, Chatflow Composition |
| **Domain 3** | `domain-3-rag-infrastructure-research.md` | RAG Infrastructure, Local Embeddings, Cross-Architecture Context Management |

### Key Findings Summary

**Current Architecture Strengths:**
- Solid 2-layer agent system (Tool Constitution + Agent Modes)
- Multi-provider support via TanStack AI adapter factory
- Secure credential vault with AES-GCM encryption
- Zustand-based state management (6 stores, migration complete)
- File locking mechanism for concurrent agent operations
- WebContainer integration for sandboxed code execution

**Critical Architecture Gaps:**
- **P0**: Hot-reloading bug prevents immediate UI updates after configuration changes
- **P0**: Non-atomic state updates causing data loss and race conditions
- **HIGH**: Missing agent definition layers 3-5 (Context, Task-Specific, System Directives)
- **HIGH**: Chatflow not composable - no dynamic agent configuration at API request time
- **HIGH**: No vector/graph database infrastructure for RAG
- **MEDIUM**: No multi-modal support (vision, audio, structured data)
- **MEDIUM**: No team orchestration patterns (sequential, parallel, consensus)
- **MEDIUM**: No cross-architecture context management across Local FS, WebContainer, Agent Context

**Strategic Recommendations:**
1. Implement 5-layer agent system with dynamic chatflow composition (P0)
2. Fix hot-reloading with reactive state binding (P0)
3. Deploy Qdrant vector store with hybrid search capabilities (P0)
4. Implement Ollama local embedding service (P1)
5. Adopt LangGraph-style orchestration for multi-agent workflows (P1)
6. Add Neo4j integration for knowledge graph relationships (P2)
7. Develop NotebookLM + Notion bidirectional synchronization (P2)

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Target BMAD v6 Architecture](#2-target-bmad-v6-architecture)
3. [Architecture Comparison Matrix](#3-architecture-comparison-matrix)
4. [Critical Gaps and Dependencies](#4-critical-gaps-and-dependencies)
5. [Technical Recommendations](#5-technical-recommendations)
6. [Implementation Roadmap](#6-implementation-roadmap)
7. [Research References](#7-research-references)

---

## 1. Current Architecture Analysis

### 1.1 LLM Provider Configuration Architecture

**Current Implementation:**

```
┌─────────────────────────────────────────────────────────────────────┐
│              LLM Provider Configuration System                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                │
│  UI Layer                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ AgentConfigDialog │ AgentSelector │ ProviderSettings │   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  State Management Layer                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ useAgentsStore (Zustand + localStorage)               │   │
│  │ - agents: Agent[]                                      │   │
│  │ - addAgent, removeAgent, updateAgent                   │   │
│  │ - NO reactive binding to UI components                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Provider Infrastructure Layer                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ProviderAdapterFactory (Factory Pattern)                │   │
│  │ ModelRegistry (5-min cache TTL)                      │   │
│  │ CredentialVault (AES-GCM encryption, Dexie)         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  API Layer                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ /api/chat (SSE streaming, TanStack AI)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Components:**

| Component | File | Status | Issues |
|-----------|-------|--------|---------|
| Provider Adapter Factory | [`src/lib/agent/providers/provider-adapter.ts`](src/lib/agent/providers/provider-adapter.ts) | ✅ Implemented | No reactive cache invalidation |
| Model Registry | [`src/lib/agent/providers/model-registry.ts`](src/lib/agent/providers/model-registry.ts) | ✅ Implemented | No reactive cache propagation |
| Credential Vault | [`src/lib/agent/providers/credential-vault.ts`](src/lib/agent/providers/credential-vault.ts) | ✅ Implemented | No reactive state updates |
| Agent Store | [`src/stores/agents-store.ts`](src/stores/agents-store.ts) | ✅ Implemented | No optimistic UI updates |
| Agent Config Dialog | [`src/components/agent/AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) | ⚠️ Partial | Local state, no reactive binding |
| Agent Selector | [`src/components/chat/AgentSelector.tsx`](src/components/chat/AgentSelector.tsx) | ⚠️ Partial | Props only, no store subscription |

**Critical Issues:**

1. **Hot-Reloading Bug (P0)**:
   - Configuration updates only visible after navigation
   - Root cause: [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) uses `useState` instead of Zustand store
   - Impact: Poor UX, user confusion, lost trust

2. **State Synchronization Failures (P0)**:
   - Non-atomic state updates causing race conditions
   - No optimistic UI updates with rollback capability
   - Impact: Data loss, inconsistent state, poor UX

3. **CRUD Operation Gaps (P1)**:
   - Incomplete CRUD surface across components
   - Missing edit/delete operations in [`AgentSelector`](src/components/chat/AgentSelector.tsx)
   - Impact: Limited functionality, inconsistent patterns

4. **Dynamic UI Feedback Missing (P2)**:
   - Labels and statistics don't update during user input
   - No real-time validation or progress indicators
   - Impact: Poor UX, delayed feedback

5. **Multi-Provider Race Conditions (P2)**:
   - Concurrent model loading without proper synchronization
   - No shared loading state or error handling
   - Impact: Performance issues, API rate limiting

### 1.2 Agent Configuration Architecture

**Current 2-Layer System:**

```
┌─────────────────────────────────────────────────────────────────────┐
│              Current Agent Definition System (2 Layers)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                │
│  Layer 1: Tool Constitution (Always Sent, Hidden)               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ TOOL_CONSTITUTION (from system-prompt.ts)          │   │
│  │ - Tool safety rules                                     │   │
│  │ - File operation constraints                            │   │
│  │ - Error handling protocols                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Layer 2: Agent Modes (User-Selectable)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ MODE_SOLO_DEV: Quick Flow Solo Dev                   │   │
│  │   - cognitivePhase: 'analysis'                        │   │
│  │   - persona: 'You are a quick-flow solo dev...'     │   │
│  │   - communicationStyle: 'concise'                   │   │
│  │ MODE_CODE: Code Executor                             │   │
│  │   - cognitivePhase: 'execution'                       │   │
│  │   - persona: 'You are a code executor...'           │   │
│  │   - communicationStyle: 'technical'                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  System Prompt Composition (Static)                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ buildSystemPrompt(config: AgentConfig): string        │   │
│  │   return [TOOL_CONSTITUTION, modeConfig...]        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  LLM API Call (TanStack AI)                                    │
│                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Components:**

| Component | File | Status | Gap |
|-----------|-------|--------|------|
| System Prompt Builder | [`src/lib/agent/system-prompt.ts`](src/lib/agent/system-prompt.ts) | ✅ Implemented | Only 2 layers, static composition |
| Agent Factory | [`src/lib/agent/factory.ts`](src/lib/agent/factory.ts) | ✅ Implemented | No dynamic agent configuration |
| Chat Hook | [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) | ✅ Implemented | No chatflow composition |
| Chat Panel | [`src/components/chat/ChatPanel.tsx`](src/components/chat/ChatPanel.tsx) | ✅ Implemented | No multi-agent orchestration |

**Critical Gaps:**

1. **Missing Agent Definition Layers 3-5 (HIGH)**:
   - **Layer 3: Context/Prompt Injection** - Dynamic context from RAG or project state
   - **Layer 4: Task-Specific Instructions** - Per-task guidance or constraints
   - **Layer 5: Hidden System Directives** - Safety rules, compliance, orchestration
   - Impact: Cannot support dynamic agent configuration or task-specific instructions

2. **No Multi-Modal Support (MEDIUM)**:
   - Text-only capabilities (no vision, audio, structured data)
   - No multi-modal models configured
   - Impact: Limited agent capabilities, no cross-modal reasoning

3. **No Team Orchestration (MEDIUM)**:
   - Single agent per conversation
   - No multi-agent collaboration patterns
   - Impact: Cannot leverage specialist swarms, consensus, or parallel execution

4. **Chatflow Not Composable (HIGH)**:
   - No mechanism to compose layers dynamically at API request time
   - Static 2-layer system only
   - Impact: Cannot support per-request agent customization

**Orchestration Patterns Identified (from research):**

| Pattern | Description | Current Support |
|---------|-------------|-----------------|
| Sequential | Linear pipeline with handoffs | ❌ Not implemented |
| MapReduce-Style | Parallel agents aggregate results | ❌ Not implemented |
| Consensus | Multiple agents debate to optimal solution | ❌ Not implemented |
| Layered | Hierarchical structure with specialized agents | ❌ Not implemented |
| Producer-Reviewer | One agent produces, another reviews | ❌ Not implemented |
| Group Chat | Multiple agents in shared conversation | ❌ Not implemented |
| Specialist Swarms | Many niche agents in parallel | ❌ Not implemented |
| Critic-Refiner Loop | Feedback loop for quality control | ❌ Not implemented |

### 1.3 Knowledge Synthesis & RAG Infrastructure

**Current State:**

```
┌─────────────────────────────────────────────────────────────────────┐
│              Current Knowledge Synthesis State                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                │
│  Input Layer (Partial)                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Text: ✅ Supported (via chat, code files)          │   │
│  │ Vision: ❌ Not implemented                              │   │
│  │ Audio: ❌ Not implemented                               │   │
│  │ Structured Data: ⚠️ Limited (file read/write)      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Processing Layer (Missing)                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ❌ No vector database (Qdrant, Weaviate, Pinecone)│   │
│  │ ❌ No graph database (Neo4j)                          │   │
│  │ ❌ No local embedding service (Ollama)                 │   │
│  │ ❌ No chunking pipeline (domain-aware strategies)       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Storage Layer (Partial)                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ IndexedDB (Dexie): Project metadata, conversations  │   │
│  │ localStorage: Agent configurations                        │   │
│  │ ❌ No vector store, graph DB, document store          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Retrieval Layer (Missing)                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ❌ No semantic search (vector similarity)             │   │
│  │ ❌ No keyword search (BM25)                          │   │
│  │ ❌ No hybrid search (RRF fusion)                      │   │
│  │ ❌ No graph traversal (relationship queries)             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Cross-Architecture Context Management (Partial)                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Local FS: ✅ Event-driven file watcher            │   │
│  │ WebContainer: ✅ State snapshots, process output  │   │
│  │ Agent Context: ⚠️ Limited (no RAG integration)    │   │
│  │ ❌ No conflict resolution for concurrent operations   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Critical Gaps:**

1. **No Vector/Graph Database (HIGH)**:
   - Missing Qdrant for semantic search
   - Missing Neo4j for relationship mapping
   - Missing PostgreSQL + pgvector for structured data
   - Impact: No RAG capabilities, no knowledge graph

2. **No Local Embedding Support (MEDIUM)**:
   - No Ollama integration for privacy-preserving embeddings
   - No domain-aware chunking strategies
   - Impact: Dependent on cloud APIs, higher cost, data privacy concerns

3. **No Cross-Architecture Context Management (MEDIUM)**:
   - No unified context synchronization across Local FS, WebContainer, Agent Context
   - No conflict resolution for concurrent operations
   - Impact: Context loss, inconsistent state, data conflicts

4. **No NotebookLM + Notion Integration (MEDIUM)**:
   - No bidirectional synchronization with external knowledge bases
   - No artifact generation pipeline
   - Impact: Limited knowledge synthesis capabilities

---

## 2. Target BMAD v6 Architecture

### 2.1 5-Layer Agent System with Dynamic Chatflow

```
┌─────────────────────────────────────────────────────────────────────┐
│           Target BMAD v6 Agent Architecture (5 Layers)           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                │
│  Layer 1: Tool Constitution (Always Sent, Hidden)               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ TOOL_CONSTITUTION (from system-prompt.ts)          │   │
│  │ - Tool safety rules                                     │   │
│  │ - File operation constraints                            │   │
│  │ - Error handling protocols                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Layer 2: Agent Modes (User-Selectable)                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ MODE_SOLO_DEV, MODE_CODE, + Custom Modes         │   │
│  │ - cognitivePhase, persona, communicationStyle          │   │
│  │ - User can create custom modes via UI                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Layer 3: Context/Prompt Injection (Dynamic)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ RAG Context: "Here's relevant documentation..."     │   │
│  │ Project State: "Current project: 3 files open..."  │   │
│  │ User Preferences: "User prefers verbose output..."     │   │
│  │ Task Context: "You are working on task X..."       │   │
│  │ Dynamically injected at API request time               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Layer 4: Task-Specific Instructions (Dynamic)                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Security Constraints: "Do not access files outside..." │   │
│  │ Performance Requirements: "Generate efficient code..."   │   │
│  │ Quality Requirements: "Follow best practices..."       │   │
│  │ Approval Workflow: "This change requires approval..."   │   │
│  │ Injected when user initiates task                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Layer 5: Hidden System Directives (Dynamic)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Safety Rules: "Never execute commands that damage..." │   │
│  │ Compliance Rules: "Ensure code follows policies..."    │   │
│  │ Orchestration Rules: "Agents coordinate via channels..."│   │
│  │ Rate Limiting: "Limit concurrent operations..."       │   │
│  │ Enforced at infrastructure/middleware level            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Chatflow Composer (Dynamic Layer Composition)                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ SystemPromptComposer.compose(config, context)         │   │
│  │   - Layer ordering (1-5 hierarchy)                │   │
│  │   - Layer validation and sanitization              │   │
│  │   - Context injection with safety checks            │   │
│  │   - Template-based prompt building                │   │
│  │   - Caching for frequently used compositions        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Multi-Agent Orchestration (LangGraph-Style)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Agent Graph with State Persistence                   │   │
│  │   - Sequential orchestration (linear pipeline)        │   │
│  │   - Parallel orchestration (MapReduce-style)        │   │
│  │   - Consensus mode (voting mechanisms)            │   │
│  │   - Layered orchestration (hierarchical)           │   │
│  │   - Producer-Reviewer loops (quality control)        │   │
│  │   - Group chat (shared conversation thread)          │   │
│  │   - Specialist swarms (parallel niche agents)        │   │
│  │   - Critic-Refiner loops (feedback)              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  LLM API Call (TanStack AI with Multi-Modal Support)              │
│                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Hybrid RAG Infrastructure

```
┌─────────────────────────────────────────────────────────────────────┐
│              Target BMAD v6 RAG Architecture                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                │
│  Input Layer (Multi-Modal)                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Text: ✅ Documents, Chat logs, Code files           │   │
│  │ Vision: ✅ Diagrams, Screenshots, Whiteboard photos   │   │
│  │ Audio: ✅ Meeting recordings, Voice notes              │   │
│  │ Structured Data: ✅ JSON, CSV, Database exports       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Processing Layer (Complete)                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Ollama Embedding Service (Local)                   │   │
│  │   - nomic-embed-text (768 dims, 95.2% MTEB)   │   │
│  │   - mxbai-embed-large (1024 dims, 97.1% MTEB)  │   │
│  │   - BGE-M3 (1024 dims, 94.8% MTEB)          │   │
│  │ Domain-Aware Chunking Pipeline                      │   │
│  │   - Software Engineering (AST-based semantic)       │   │
│  │   - Legal (section-aware with citations)             │   │
│  │   - Medical (clinical finding clusters)             │   │
│  │   - Scientific (methodology-result groupings)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Storage Layer (Hybrid)                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Qdrant (Vector DB): Semantic search, Hybrid RRF     │   │
│  │   - Dense vectors (embeddings)                     │   │
│  │   - Sparse vectors (BM25 keywords)                 │   │
│  │   - Reciprocal Rank Fusion (RRF)                  │   │
│  │   - Payload filtering, full-text search            │   │
│  │ Neo4j (Graph DB): Relationship mapping, Cypher      │   │
│  │   - Entity-centric retrieval (1-hop, 2-hop, N-hop) │   │
│  │   - Context chain traversal (document synthesis)      │   │
│  │   - Community detection (clustering)               │   │
│  │ PostgreSQL + pgvector (Document Store): ACID, Rich queries│   │
│  │   - Structured document storage                    │   │
│  │   - Vector support for hybrid queries             │   │
│  │ IndexedDB (Browser): Project metadata, conversations   │   │
│  │   - Offline persistence, React integration          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Retrieval Layer (Hybrid)                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Query Router: Intent classification, decomposition    │   │
│  │   - Semantic search (vector similarity)             │   │
│  │   - Keyword search (BM25)                         │   │
│  │   - Graph traversal (relationship queries)            │   │
│  │ Result Fusion: Cross-store result merging            │   │
│  │   - Score normalization and weighting              │   │
│  │   - Consistency validation                       │   │
│  │   - Cross-modal result validation                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Cross-Architecture Context Management (Complete)                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Event-Driven State Propagation                   │   │
│  │   - EventEmitter3 for change events               │   │
│  │   - Pending changes queue with conflict detection  │   │
│  │ File Locking for Concurrent Operations            │   │
│  │   - Lock acquisition/release with timeout           │   │
│  │   - Same agent lock extension                    │   │
│  │ Conflict Resolution Strategies                     │   │
│  │   - Operational Transformation (collaborative edit) │   │
│  │   - Merge-Based (structural changes)              │   │
│  │   - Last-Write-Wins (metadata)                 │   │
│  │ IndexedDB Persistence                             │   │
│  │   - Project metadata, Conversation logs            │   │
│  │   - Agent configurations, File state              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  NotebookLM + Notion Integration (Optional)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Artifact Generation Pipeline                        │   │
│  │   - Diagrams, charts, summaries, timelines       │   │
│  │ Citation & Provenance Tracking                  │   │
│  │   - Direct quote, paraphrased reference           │   │
│  │   - Synthesis, contrasting view                  │   │
│  │ Bidirectional Synchronization                     │   │
│  │   - Incremental sync with conflict resolution      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Reactive State Management with Hot-Reloading

```
┌─────────────────────────────────────────────────────────────────────┐
│           Target BMAD v6 State Management Architecture              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                │
│  Reactive State Binding (Immediate UI Updates)                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ AgentConfigDialog (Reactive State)                │   │
│  │   - formData: useStore((s) => s.formData)       │   │
│  │   - models: useStore((s) => s.models)           │   │
│  │   - isLoadingModels: useStore((s) => s.isLoading) │   │
│  │   - IMMEDIATE UPDATE (<100ms)                    │   │
│  │ AgentSelector (Reactive State)                   │   │
│  │   - selectedAgent: useStore((s) => s.selected)  │   │
│  │   - agents: useStore((s) => s.agents)           │   │
│  │   - IMMEDIATE RE-RENDER ON STORE UPDATE          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Optimistic UI Updates with Rollback                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ updateAgent: async (id, updates) => {             │   │
│  │   // Create optimistic copy                           │   │
│  │   const optimisticAgent = { ...agent, ...updates };    │   │
│  │   // Update store immediately                          │   │
│  │   setAgents([...agents.map(a => a.id === id ? optimisticAgent : a)]); │   │
│  │   // Execute operation in background                  │   │
│  │   try { await credentialVault.storeCredentials(...); }   │   │
│  │   catch (error) {                                   │   │
│  │     // Rollback to previous state                    │   │
│  │     setAgents(previousAgents);                     │   │
│  │     toast.error('Failed to save credentials');      │   │
│  │   }                                               │   │
│  │ }                                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Atomic State Updates                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ executeWithRollback: async (operation) => {       │   │
│  │   const previousState = useAgentsStore.getState();   │   │
│  │   try { await operation(); return { success: true }; } │   │
│  │   catch (error) {                                   │   │
│  │     setAgents(previousState);                     │   │
│  │     return { success: false, error, previousState }; │   │
│  │   }                                               │   │
│  │ }                                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Complete CRUD Surface                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ AgentsStore Operations:                           │   │
│  │   - addAgent(agentData): Agent                   │   │
│  │   - removeAgent(id): void                        │   │
│  │   - updateAgent(id, updates): void                │   │
│  │   - editAgent(id, updates): void (NEW)           │   │
│  │   - duplicateAgent(id): Agent (NEW)               │   │
│  │   - reorderAgents(ids: string[]): void (NEW)        │   │
│  │   - bulkDeleteAgents(ids: string[]): void (NEW)     │   │
│  │ AgentSelector UI:                                │   │
│  │   - Edit button per agent (NEW)                   │   │
│  │   - Delete button per agent (NEW)                 │   │
│  │   - Confirmation dialog for delete (NEW)            │   │
│  │   - Duplicate button per agent (NEW)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  Dynamic UI Feedback                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Real-time Validation:                             │   │
│  │   - validateField(field, value) on blur         │   │
│  │   - Error messages shown immediately             │   │
│  │   - isInvalid flag for UI styling               │   │
│  │ Progress Indicators:                              │   │
│  │   - Loading states for async operations            │   │
│  │   - Progress bars with percentage             │   │
│  │   - Step-by-step status updates                 │   │
│  │ Error Handling with Rollback:                      │   │
│  │   - Toast notifications for all operations          │   │
│  │   - Automatic rollback on failure               │   │
│  │   - User-friendly error messages               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture Comparison Matrix

### 3.1 LLM Provider Configuration

| Aspect | Current State | Target State | Gap Severity |
|--------|--------------|--------------|---------------|
| **State Management** | Zustand stores with localStorage | Reactive Zustand with optimistic updates | P0 |
| **Hot-Reloading** | ❌ Updates only after navigation | ✅ Immediate updates (<100ms) | P0 |
| **CRUD Surface** | ⚠️ Incomplete (add/view only) | ✅ Full CRUD (add/view/edit/delete/duplicate/reorder/bulk) | P1 |
| **Atomic Updates** | ❌ Non-atomic, race conditions | ✅ Atomic with rollback | P0 |
| **Dynamic UI Feedback** | ❌ No real-time validation | ✅ Real-time validation, progress indicators | P2 |
| **Multi-Provider Sync** | ❌ Race conditions, no coordination | ✅ Shared loading state, error handling | P2 |
| **Provider Adapter** | ✅ Factory pattern implemented | ✅ Enhanced with reactive cache invalidation | P1 |
| **Model Registry** | ✅ 5-min cache TTL | ✅ Reactive cache propagation | P1 |
| **Credential Vault** | ✅ AES-GCM encryption | ✅ Reactive state updates | P1 |

### 3.2 Agent Configuration & Orchestration

| Aspect | Current State | Target State | Gap Severity |
|--------|--------------|--------------|---------------|
| **Agent Definition Layers** | 2 layers (Tool Constitution + Agent Modes) | 5 layers (+Context, +Task-Specific, +System Directives) | HIGH |
| **Chatflow Composition** | ❌ Static 2-layer system | ✅ Dynamic composition at API request time | HIGH |
| **Multi-Agent Orchestration** | ❌ Single agent per conversation | ✅ LangGraph-style orchestration (8 patterns) | MEDIUM |
| **Multi-Modal Support** | ❌ Text-only | ✅ Text + Vision + Audio + Structured Data | MEDIUM |
| **System Prompt Builder** | ✅ Static buildSystemPrompt() | ✅ Dynamic SystemPromptComposer with caching | HIGH |
| **Layer Registry** | ❌ Not implemented | ✅ Central registry with dynamic registration | HIGH |
| **Prompt Context Manager** | ❌ Not implemented | ✅ Context aggregation, caching, relevance scoring | MEDIUM |
| **Agent Graph** | ❌ Not implemented | ✅ State persistence, message passing, coordination | MEDIUM |
| **Approval Workflow** | ⚠️ Partial (ApprovalOverlay exists) | ✅ Integrated with chatflow risk assessment | P2 |

### 3.3 Knowledge Synthesis & RAG Infrastructure

| Aspect | Current State | Target State | Gap Severity |
|--------|--------------|--------------|---------------|
| **Vector Database** | ❌ Not implemented | ✅ Qdrant with hybrid search (RRF) | HIGH |
| **Graph Database** | ❌ Not implemented | ✅ Neo4j with Cypher queries | HIGH |
| **Document Store** | ⚠️ IndexedDB only | ✅ PostgreSQL + pgvector (ACID, rich queries) | HIGH |
| **Local Embedding Service** | ❌ Not implemented | ✅ Ollama with domain-aware chunking | MEDIUM |
| **Embedding Models** | ❌ Cloud APIs only | ✅ Local models (nomic-embed-text, mxbai-embed-large, BGE-M3) | MEDIUM |
| **Chunking Strategies** | ❌ Not implemented | ✅ Domain-aware (code, legal, medical, scientific) | MEDIUM |
| **Semantic Search** | ❌ Not implemented | ✅ Vector similarity + BM25 keyword search | HIGH |
| **Graph Traversal** | ❌ Not implemented | ✅ Entity-centric retrieval, context chains | HIGH |
| **Cross-Architecture Context** | ⚠️ Partial (file watcher only) | ✅ Event-driven state propagation + conflict resolution | MEDIUM |
| **File Locking** | ✅ Implemented (FileLock class) | ✅ Enhanced with timeout, same-agent extension | P1 |
| **Conflict Resolution** | ❌ Not implemented | ✅ OT, Merge-Based, LWW strategies | MEDIUM |
| **NotebookLM Integration** | ❌ Not implemented | ✅ Bidirectional sync with Notion | MEDIUM |
| **Artifact Generation** | ❌ Not implemented | ✅ Diagrams, charts, summaries, timelines | P2 |

### 3.4 Cross-Architecture Context Management

| Aspect | Current State | Target State | Gap Severity |
|--------|--------------|--------------|---------------|
| **Local FS Boundary** | ✅ Event-driven file watcher | ✅ Enhanced with change records and checksums | P1 |
| **WebContainer Boundary** | ✅ State snapshots, process output | ✅ Enhanced with conflict detection | P1 |
| **Agent Context Boundary** | ⚠️ Limited (no RAG integration) | ✅ Full context orchestration with RAG | HIGH |
| **Context Synchronization** | ❌ No unified layer | ✅ Event-driven propagation with pending queue | HIGH |
| **Conflict Detection** | ❌ Not implemented | ✅ Automatic detection with resolution strategies | MEDIUM |
| **IndexedDB Persistence** | ✅ Project metadata, conversations | ✅ Enhanced with auto-save and versioning | P1 |
| **State Snapshots** | ❌ Not implemented | ✅ Rollback points for conflict resolution | MEDIUM |

---

## 4. Critical Gaps and Dependencies

### 4.1 Priority Classification

| Priority | Definition | Examples |
|----------|------------|----------|
| **P0** | Blocking critical functionality, data loss, or severe UX issues | Hot-reloading bug, state sync failures, missing RAG infrastructure |
| **P1** | Important gaps affecting usability or performance | CRUD gaps, atomic updates, local embedding service |
| **P2** | Enhancements that improve UX or add capabilities | Dynamic UI feedback, multi-modal support, artifact generation |
| **P3** | Future enhancements or optimizations | Advanced orchestration patterns, NotebookLM integration |

### 4.2 Critical Gaps by Domain

#### Domain 1: LLM Provider Configuration

| Gap ID | Description | Priority | Impact | Dependencies |
|---------|-------------|----------|---------|--------------|
| **D1-G001** | Hot-reloading bug - updates only visible after navigation | P0 | Severe UX degradation, user confusion | D1-G002, D1-G003 |
| **D1-G002** | Non-atomic state updates causing data loss | P0 | Data loss, inconsistent state | D1-G003 |
| **D1-G003** | Incomplete CRUD surface (missing edit/delete) | P1 | Limited functionality, inconsistent patterns | D1-G005 |
| **D1-G004** | No dynamic UI feedback (real-time validation) | P2 | Poor UX, delayed feedback | D1-G005 |
| **D1-G005** | Multi-provider race conditions (no coordination) | P2 | Performance issues, API rate limiting | D1-G003 |
| **D1-G006** | No reactive cache invalidation in Model Registry | P1 | Stale model lists, inconsistent state | D1-G002 |
| **D1-G007** | No reactive state updates in Credential Vault | P1 | Silent credential changes, UI not notified | D1-G002 |

#### Domain 2: Agent Configuration & Architecture

| Gap ID | Description | Priority | Impact | Dependencies |
|---------|-------------|----------|---------|--------------|
| **D2-G001** | Missing agent definition layers 3-5 | HIGH | Cannot support dynamic agent configuration or task-specific instructions | D2-G002, D2-G003 |
| **D2-G002** | Chatflow not composable - no dynamic layer composition | HIGH | Cannot support per-request agent customization | D2-G001 |
| **D2-G003** | No System Prompt Composer for dynamic composition | HIGH | No mechanism to build system prompts from 5 layers | D2-G001 |
| **D2-G004** | No Layer Registry for dynamic layer management | HIGH | Cannot register custom layers or modes | D2-G003 |
| **D2-G005** | No Prompt Context Manager for RAG integration | MEDIUM | Cannot inject dynamic context from knowledge base | D3-G001, D3-G002 |
| **D2-G006** | No multi-modal support (vision, audio, structured data) | MEDIUM | Limited agent capabilities, no cross-modal reasoning | D3-G003 |
| **D2-G007** | No team orchestration patterns (sequential, parallel, consensus) | MEDIUM | Single agent per conversation, no collaboration | D2-G008 |
| **D2-G008** | No LangGraph-style agent graph with state persistence | MEDIUM | Cannot implement multi-agent workflows | D2-G007 |
| **D2-G009** | Approval workflow not integrated with chatflow risk assessment | P2 | Inconsistent approval workflow | D2-G003 |

#### Domain 3: Knowledge Synthesis & RAG Infrastructure

| Gap ID | Description | Priority | Impact | Dependencies |
|---------|-------------|----------|---------|--------------|
| **D3-G001** | No vector database (Qdrant) for semantic search | HIGH | No RAG capabilities, no knowledge graph | D3-G002, D3-G003 |
| **D3-G002** | No graph database (Neo4j) for relationship mapping | HIGH | No entity-centric retrieval, no context chains | D3-G001 |
| **D3-G003** | No local embedding service (Ollama) for privacy-preserving embeddings | MEDIUM | Dependent on cloud APIs, higher cost, data privacy concerns | D3-G004 |
| **D3-G004** | No domain-aware chunking strategies (code, legal, medical, scientific) | MEDIUM | Poor retrieval relevance, generic chunking | D3-G003 |
| **D3-G005** | No cross-architecture context management (unified layer) | MEDIUM | Context loss, inconsistent state, data conflicts | D3-G006 |
| **D3-G006** | No conflict resolution strategies (OT, Merge-Based, LWW) | MEDIUM | Data conflicts, manual intervention required | D3-G005 |
| **D3-G007** | No NotebookLM + Notion bidirectional synchronization | MEDIUM | Limited knowledge synthesis capabilities | D3-G008 |
| **D3-G008** | No artifact generation pipeline (diagrams, charts, summaries) | P2 | Limited output formats, no visual synthesis | D3-G007 |

### 4.3 Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Critical Gap Dependencies                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                │
│  P0 Gaps (Blocking)                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ D1-G001 (Hot-Reloading)                           │   │
│  │   ├── D1-G002 (Atomic Updates)                    │   │
│  │   └── D1-G003 (Complete CRUD)                    │   │
│  │ D1-G002 (Atomic Updates)                            │   │
│  │   └── D1-G003 (Complete CRUD)                    │   │
│  │ D3-G001 (Vector Database)                            │   │
│  │   ├── D3-G002 (Graph Database)                     │   │
│  │   └── D3-G003 (Local Embeddings)                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  HIGH Gaps (Major Functionality)                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ D2-G001 (Missing Layers 3-5)                     │   │
│  │   ├── D2-G002 (Chatflow Composition)                │   │
│  │   ├── D2-G003 (System Prompt Composer)            │   │
│  │   └── D2-G004 (Layer Registry)                     │   │
│  │ D2-G002 (Chatflow Composition)                     │   │
│  │   ├── D2-G003 (System Prompt Composer)            │   │
│  │   └── D2-G005 (Prompt Context Manager)            │   │
│  │ D3-G002 (Graph Database)                            │   │
│  │   └── D3-G005 (Cross-Architecture Context)       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  MEDIUM Gaps (Enhancements)                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ D2-G006 (Multi-Modal Support)                     │   │
│  │   └── D3-G003 (Local Embeddings)                 │   │
│  │ D2-G007 (Team Orchestration)                       │   │
│  │   └── D2-G008 (Agent Graph)                        │   │
│  │ D3-G005 (Cross-Architecture Context)               │   │
│  │   └── D3-G006 (Conflict Resolution)                │   │
│  │ D3-G007 (NotebookLM Integration)                     │   │
│  │   └── D3-G008 (Artifact Generation)                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                        │                                        │
│                        ▼                                        │
│  P2 Gaps (UX Improvements)                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ D1-G004 (Dynamic UI Feedback)                     │   │
│  │ D1-G005 (Multi-Provider Sync)                   │   │
│  │ D2-G009 (Approval Workflow Integration)            │   │
│  │ D3-G008 (Artifact Generation)                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.4 Implementation Sequence

**Phase 1: Foundation (Weeks 1-4) - P0 Gaps**

1. **Fix Hot-Reloading Bug** (D1-G001)
   - Implement reactive state binding in [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx)
   - Add reactive store subscriptions in [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx)
   - Test immediate UI updates (<100ms)
   - **Dependencies**: None

2. **Implement Atomic State Updates** (D1-G002)
   - Add optimistic UI pattern with rollback
   - Implement `executeWithRollback` helper
   - Add error handling with toast notifications
   - **Dependencies**: D1-G001

3. **Deploy Qdrant Vector Store** (D3-G001)
   - Set up Qdrant instance (Docker)
   - Implement vector storage service
   - Create hybrid search with RRF fusion
   - **Dependencies**: None

4. **Implement 5-Layer Agent System** (D2-G001)
   - Create Layer 3: Context/Prompt Injection
   - Create Layer 4: Task-Specific Instructions
   - Create Layer 5: Hidden System Directives
   - Implement System Prompt Composer
   - **Dependencies**: D2-G002, D2-G003

**Phase 2: Core Functionality (Weeks 5-8) - P1 & HIGH Gaps**

5. **Complete CRUD Surface** (D1-G003)
   - Add edit/delete operations to [`AgentSelector`](src/components/chat/AgentSelector.tsx)
   - Add duplicate/reorder/bulk operations to store
   - Update [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx) with edit mode
   - **Dependencies**: D1-G001, D1-G002

6. **Implement Chatflow Composition** (D2-G002)
   - Create System Prompt Composer service
   - Implement Layer Registry with dynamic registration
   - Add chatflow parameter to `/api/chat` endpoint
   - **Dependencies**: D2-G001

7. **Deploy Ollama Embedding Service** (D3-G003)
   - Integrate Ollama API for local embeddings
   - Implement domain-aware chunking strategies
   - Add embedding cache with TTL
   - **Dependencies**: D3-G001

8. **Deploy Neo4j Graph Database** (D3-G002)
   - Set up Neo4j instance
   - Implement entity extraction
   - Build relationship mapping service
   - Create Cypher query builder
   - **Dependencies**: D3-G001

**Phase 3: Advanced Features (Weeks 9-12) - MEDIUM & P2 Gaps**

9. **Implement Cross-Architecture Context Management** (D3-G005)
   - Create event-driven state propagation layer
   - Build conflict resolution system (OT, Merge-Based, LWW)
   - Add context synchronization across boundaries
   - **Dependencies**: D1-G002, D3-G002

10. **Add Multi-Modal Support** (D2-G006)
    - Add vision tools (image generation, image-to-text)
    - Add audio tools (text-to-speech, speech-to-text)
    - Integrate multi-modal models from model registry
    - **Dependencies**: D3-G003

11. **Implement Team Orchestration** (D2-G007)
    - Create LangGraph-style agent graph
    - Add state persistence for agent coordination
    - Implement sequential, parallel, consensus patterns
    - **Dependencies**: D2-G006

12. **Implement NotebookLM + Notion Integration** (D3-G007)
    - Build Notion API client
    - Implement artifact generation service
    - Create citation tracking system
    - Develop bidirectional sync
    - **Dependencies**: D3-G008

---

## 5. Technical Recommendations

### 5.1 Priority 0 (P0) - Blocking Critical Issues

**Recommendation 1: Fix Hot-Reloading Bug with Reactive State Binding**

**Problem:** Configuration updates only visible after navigation due to lack of reactive state binding.

**Solution:**
1. Refactor [`AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) to use Zustand store instead of local `useState`
2. Add reactive store subscriptions in [`AgentSelector.tsx`](src/components/chat/AgentSelector.tsx)
3. Ensure all components subscribe to store changes for immediate re-renders
4. Test UI updates occur within 100ms of user action

**Implementation Pattern:**
```typescript
// AgentConfigDialog.tsx - Reactive State Binding
const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
    // Bind to Zustand store instead of local state
    const formData = useAgentsStore((s) => s.agents.find(a => a.id === agent?.id));
    const setFormData = useAgentsStore((s) => s.setFormData);
    
    const models = useAgentsStore((s) => s.models);
    const setModels = useAgentsStore((s) => s.setModels);
    
    const isLoadingModels = useAgentsStore((s) => s.isLoadingModels);
    const setIsLoadingModels = useAgentsStore((s) => s.setIsLoadingModels);
    
    // All state now reactive and immediately updates UI
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Form fields bound to store state */}
        </Dialog>
    );
};
```

**Acceptance Criteria:**
- Configuration updates visible within 100ms of user action
- All components subscribing to store changes re-render simultaneously
- No navigation required to see changes
- State persists across sessions via localStorage

**References:**
- Domain 1 Research: [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)
- Zustand Hot-Reloading Best Practices: https://github.com/pmndrs/zustand/discussions/3132

---

**Recommendation 2: Implement Atomic State Updates with Optimistic UI**

**Problem:** Non-atomic state updates causing race conditions and data loss.

**Solution:**
1. Implement optimistic UI pattern with immediate feedback
2. Add rollback capability for failed operations
3. Use atomic transactions for state updates
4. Add error handling with toast notifications

**Implementation Pattern:**
```typescript
// Optimistic Update Pattern with Rollback
const updateAgent = async (id: string, updates: Partial<Agent>) => {
    // Create optimistic copy
    const optimisticAgent = {
        ...useAgentsStore.getState().agents.find(a => a.id === id),
        ...updates,
        lastActive: new Date().toISOString(),
    };
    
    // Update store immediately
    useAgentsStore.getState().setAgents(
        useAgentsStore.getState().agents.map(a =>
            a.id === id ? optimisticAgent : a
        )
    );
    
    // Execute operation in background
    try {
        await credentialVault.storeCredentials(provider, apiKey);
        // Update with actual result
        useAgentsStore.getState().updateAgent(id, updates);
    } catch (error) {
        // Rollback to previous state
        useAgentsStore.getState().setAgents(previousAgents);
        // Show error notification
        toast.error('Failed to save credentials');
    }
};
```

**Acceptance Criteria:**
- All state updates use optimistic pattern with rollback
- UI updates immediately (<100ms)
- Error notifications shown to user
- State always consistent even on failure
- No data loss from failed operations

**References:**
- Domain 1 Research: [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)
- Zustand State Management: https://zustand.docs.pmnd.rs/guides/updating-state

---

**Recommendation 3: Deploy Qdrant Vector Store with Hybrid Search**

**Problem:** No vector database for semantic search, limiting RAG capabilities.

**Solution:**
1. Deploy Qdrant instance (Docker or self-hosted)
2. Implement vector storage service with hybrid search
3. Add Reciprocal Rank Fusion (RRF) for combining dense and sparse vectors
4. Integrate with Ollama embedding service

**Implementation Pattern:**
```typescript
// Qdrant Hybrid Search Pattern
const client = new QdrantClient({ host: "localhost", port: 6333 });

await client.query(collectionName, {
    prefetch: [
        {
            query: {
                values: [0.22, 0.8],
                indices: [1, 42],
            },
            using: 'sparse',  // BM25-style keyword matching
            limit: 20,
        },
        {
            query: [0.01, 0.45, 0.67],
            using: 'dense',     // Semantic embeddings
            limit: 20,
        },
    ],
    query: {
        fusion: 'rrf',  // Reciprocal Rank Fusion
    },
});
```

**Acceptance Criteria:**
- Qdrant instance deployed and accessible
- Vector storage service implemented with CRUD operations
- Hybrid search with RRF fusion working
- Integration with Ollama embedding service complete

**References:**
- Domain 3 Research: [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)
- Qdrant Documentation: https://qdrant.tech/documentation
- GraphRAG Hybrid Implementation: https://github.com/rileylemm/graphrag-hybrid

---

**Recommendation 4: Implement 5-Layer Agent System**

**Problem:** Missing agent definition layers 3-5, preventing dynamic agent configuration.

**Solution:**
1. Implement Layer 3: Context/Prompt Injection (RAG, project state, user preferences)
2. Implement Layer 4: Task-Specific Instructions (security, performance, quality, approval)
3. Implement Layer 5: Hidden System Directives (safety, compliance, orchestration, rate limiting)
4. Create System Prompt Composer for dynamic layer composition
5. Add Layer Registry for dynamic layer management

**Implementation Pattern:**
```typescript
// 5-Layer Agent System
interface LayerDefinition {
    id: string;
    name: string;
    description: string;
    priority: number;
    content: (config: AgentConfig) => string;
    appliesTo?: string[];
    isHidden: boolean;
}

class SystemPromptComposer {
    compose(config: AgentConfig, context?: PromptContext): string {
        const layers = [
            this.getLayer('tool-constitution'),
            this.getLayer(config.mode),
            this.getLayer('context-injection'),
            this.getLayer('task-specific'),
            this.getLayer('system-directives')
        ];
        
        return layers
            .filter(layer => this.shouldIncludeLayer(layer, config, context))
            .map(layer => layer.content(config, context))
            .join('\n\n');
    }
}
```

**Acceptance Criteria:**
- Layer 3 (Context) implemented with RAG integration
- Layer 4 (Task-Specific) implemented with approval workflow
- Layer 5 (System Directives) implemented with safety rules
- System Prompt Composer can compose system prompts from 5 layers
- Layer Registry supports dynamic layer registration

**References:**
- Domain 2 Research: [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)
- LangChain Agent Patterns: https://python.langchain.com

---

### 5.2 Priority 1 (P1) - Important Gaps

**Recommendation 5: Complete CRUD Surface**

**Problem:** Incomplete CRUD surface across agent configuration components.

**Solution:**
1. Add edit/delete operations to [`AgentSelector`](src/components/chat/AgentSelector.tsx)
2. Add duplicate/reorder/bulk operations to [`useAgentsStore`](src/stores/agents-store.ts)
3. Update [`AgentConfigDialog`](src/components/agent/AgentConfigDialog.tsx) with edit mode
4. Add confirmation dialogs for delete operations

**Implementation Pattern:**
```typescript
// Complete CRUD Surface
interface AgentsState {
    agents: Agent[];
    
    // Existing operations
    addAgent: (agentData) => Agent;
    removeAgent: (id) => void;
    updateAgent: (id, updates) => void;
    
    // New operations
    editAgent: (id, updates) => void;
    duplicateAgent: (id) => Agent;
    reorderAgents: (ids: string[]) => void;
    bulkDeleteAgents: (ids: string[]) => void;
}
```

**Acceptance Criteria:**
- All components support full CRUD operations
- Consistent UI patterns across components
- Delete operations require confirmation
- Edit operations open configuration dialog
- State updates are reactive and immediate

**References:**
- Domain 1 Research: [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)

---

**Recommendation 6: Implement Chatflow Composition**

**Problem:** Chatflow not composable - no dynamic agent configuration at API request time.

**Solution:**
1. Create System Prompt Composer service
2. Implement Layer Registry with pre-defined and dynamic layers
3. Refactor chat components to use composed system prompts
4. Update [`/api/chat`](src/routes/api/chat.ts) endpoint to support chatflow parameter

**Implementation Pattern:**
```typescript
// Chatflow Composition
interface ChatRequest {
    agentConfig: AgentConfig;
    chatflow?: ChatflowComposition;
    context?: PromptContext;
}

// API endpoint enhancement
export async function POST(request: Request) {
    const { agentConfig, chatflow, context } = await request.json();
    
    // Compose system prompt dynamically
    const systemPrompt = systemPromptComposer.compose(agentConfig, context);
    
    // Call LLM with composed system prompt
    const stream = chat({
        adapter: adapters[agentConfig.provider],
        model: agentConfig.model,
        system: systemPrompt,
        messages: chatflow?.messages || [],
    });
    
    return toStreamResponse(stream);
}
```

**Acceptance Criteria:**
- ChatPanel uses composed system prompts
- API endpoint supports chatflow parameter
- Layer Registry supports dynamic layer registration
- System Prompt Composer can compose from 5 layers
- Context injection works with RAG integration

**References:**
- Domain 2 Research: [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)
- TanStack AI Documentation: https://tanstack.com/ai

---

**Recommendation 7: Deploy Ollama Embedding Service**

**Problem:** No local embedding service, dependent on cloud APIs with higher cost.

**Solution:**
1. Integrate Ollama API for local embeddings
2. Implement domain-aware chunking strategies (code, legal, medical, scientific)
3. Add embedding cache with TTL
4. Support multiple embedding models (nomic-embed-text, mxbai-embed-large, BGE-M3)

**Implementation Pattern:**
```typescript
// Ollama Embedding Service
class OllamaEmbeddingService implements EmbeddingService {
    private client: OllamaClient;
    private model: string;
    private cache: EmbeddingCache;
    private batchProcessor: BatchProcessor;
    
    async embedDocument(
        document: Document,
        options?: EmbeddingOptions
    ): Promise<DocumentEmbedding> {
        // Step 1: Chunk document with domain-aware strategy
        const chunks = await this.chunkDocument(document, options);
        
        // Step 2: Generate embeddings in batches
        const embeddings = await this.batchProcessor.process(
            chunks,
            async (batch) => this.embedBatch(batch)
        );
        
        // Step 3: Compute document-level embedding
        const docEmbedding = await this.aggregateEmbeddings(embeddings);
        
        // Step 4: Store in Qdrant with metadata
        const storedEmbedding = await this.qdrantClient.upsert({
            collection_name: 'documents',
            points: embeddings.map((e, i) => ({
                id: `${document.id}_chunk_${i}`,
                vector: e.vector,
                payload: chunks[i].metadata
            }))
        });
        
        return storedEmbedding;
    }
}
```

**Acceptance Criteria:**
- Ollama integration complete with local embeddings
- Domain-aware chunking strategies implemented
- Embedding cache with TTL working
- Multiple models supported (nomic-embed-text, mxbai-embed-large, BGE-M3)
- 99%+ cost reduction compared to cloud APIs

**References:**
- Domain 3 Research: [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)
- Ollama Documentation: https://ollama.com/blog/embedding-models
- Local RAG with Ollama: https://weaviate.io/blog/local-rag-with-ollama-and-weaviate

---

**Recommendation 8: Deploy Neo4j Graph Database**

**Problem:** No graph database for relationship mapping and context chains.

**Solution:**
1. Deploy Neo4j instance
2. Implement entity extraction service
3. Build relationship mapping service
4. Create Cypher query builder for graph traversal

**Implementation Pattern:**
```typescript
// Neo4j Integration
class GraphDatabaseService {
    private driver: Neo4jDriver;
    
    async storeEntity(entity: Entity): Promise<void> {
        const session = this.driver.session();
        try {
            await session.run(
                'CREATE (e:Entity $props) RETURN e',
                { props: entity }
            );
        } finally {
            await session.close();
        }
    }
    
    async queryContextChain(
        startId: string,
        endId: string,
        maxDepth: number = 3
    ): Promise<ContextChain> {
        const session = this.driver.session();
        try {
            const result = await session.run(
                `MATCH path = (source:Concept)-[*1..${maxDepth}]->(target:Concept)
                 WHERE source.id = $startId AND target.id = $endId
                 WITH path, relationships(path) as rels
                 ORDER BY length(path) ASC
                 LIMIT 5
                 RETURN nodes(path) as concepts, rels as relationships`,
                { startId, endId }
            );
            return result.records[0].get('concepts');
        } finally {
            await session.close();
        }
    }
}
```

**Acceptance Criteria:**
- Neo4j instance deployed and accessible
- Entity extraction service implemented
- Relationship mapping service working
- Cypher query builder for graph traversal complete
- Context chain retrieval for document synthesis working

**References:**
- Domain 3 Research: [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)
- Neo4j Documentation: https://neo4j.com/docs

---

### 5.3 Priority 2 (P2) - UX Improvements

**Recommendation 9: Add Dynamic UI Feedback**

**Problem:** Labels and statistics don't update during user input.

**Solution:**
1. Implement real-time validation for all form fields
2. Add progress indicators for async operations
3. Add loading states to prevent duplicate operations
4. Provide immediate feedback within 100ms

**Implementation Pattern:**
```typescript
// Dynamic UI Feedback
const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
    // Real-time validation
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isValidating, setIsValidating] = useState(false);
    
    const validateField = async (field: string, value: string) => {
        setIsValidating(true);
        try {
            // Validate against provider API
            const isValid = await testConnection(provider, apiKey, model);
            setErrors(prev => ({ ...prev, [field]: isValid ? '' : 'Invalid' }));
        } catch (error) {
            setErrors(prev => ({ ...prev, [field]: error.message }));
        } finally {
            setIsValidating(false);
        }
    };
    
    // Progress indicators
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const handleSave = async () => {
        setIsLoading(true);
        setProgress(20); // "Testing connection..."
        
        try {
            await testConnection(provider, apiKey, model);
            setProgress(60); // "Saving..."
            await credentialVault.storeCredentials(provider, apiKey);
            setProgress(80); // "Complete!"
        } catch (error) {
            setProgress(0);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };
};
```

**Acceptance Criteria:**
- All form fields have real-time validation
- Progress indicators for async operations
- Error messages shown immediately
- Loading states prevent duplicate operations
- Feedback provided within 100ms

**References:**
- Domain 1 Research: [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)

---

**Recommendation 10: Implement Cross-Architecture Context Management**

**Problem:** No unified context synchronization across Local FS, WebContainer, Agent Context.

**Solution:**
1. Create event-driven state propagation layer
2. Build conflict resolution system (OT, Merge-Based, LWW)
3. Add context synchronization across boundaries
4. Implement state snapshots for rollback

**Implementation Pattern:**
```typescript
// Cross-Architecture Context Management
class ContextSynchronizer extends EventEmitter {
    private pendingChanges: Map<string, ChangeRecord> = new Map();
    private conflictResolver: ConflictResolver;
    
    async propagateChange(
        workspace: Workspace,
        change: ContextChange
    ): Promise<void> {
        const record = await this.createChangeRecord(workspace, change);
        
        // Check for conflicts with pending changes
        const conflicts = await this.detectConflicts(record);
        if (conflicts.length > 0) {
            const resolution = await this.conflictResolver.resolve(conflicts);
            await this.applyResolution(record, resolution);
        } else {
            this.pendingChanges.set(record.id, record);
            this.emit('change:pending', record);
        }
    }
    
    private async createChangeRecord(
        workspace: Workspace,
        change: ContextChange
    ): Promise<ChangeRecord> {
        return {
            id: generateUUID(),
            workspace: workspace.id,
            timestamp: Date.now(),
            content: change.content,
            checksum: await calculateChecksum(change.content),
            dependencies: await this.extractDependencies(change),
            priority: change.priority || 'normal'
        };
    }
}
```

**Acceptance Criteria:**
- Event-driven state propagation working
- Conflict detection automatic
- Conflict resolution strategies (OT, Merge-Based, LWW) implemented
- Context synchronization across boundaries complete
- State snapshots for rollback working

**References:**
- Domain 3 Research: [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)

---

### 5.4 Medium Priority (MEDIUM) - Enhancements

**Recommendation 11: Add Multi-Modal Support**

**Problem:** Text-only capabilities, no vision, audio, or structured data processing.

**Solution:**
1. Add vision tools (image generation, image-to-text)
2. Add audio tools (text-to-speech, speech-to-text)
3. Integrate multi-modal models from model registry
4. Implement cross-modal reasoning capabilities

**Acceptance Criteria:**
- Vision tools integrated (image generation, image-to-text)
- Audio tools integrated (text-to-speech, speech-to-text)
- Multi-modal models configured
- Cross-modal reasoning working

**References:**
- Domain 2 Research: [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)
- TanStack AI Multi-Modal: https://tanstack.com/ai

---

**Recommendation 12: Implement Team Orchestration**

**Problem:** Single agent per conversation, no multi-agent collaboration.

**Solution:**
1. Create LangGraph-style agent graph with state persistence
2. Add agent nodes with specialized capabilities
3. Implement message passing and coordination
4. Support sequential, parallel, and consensus patterns

**Acceptance Criteria:**
- Agent graph with state persistence working
- Agent nodes with specialized capabilities implemented
- Message passing and coordination working
- Sequential, parallel, and consensus patterns supported

**References:**
- Domain 2 Research: [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)
- LangGraph Documentation: https://langchain-ai.github.io/langgraph
- AutoGen Documentation: https://microsoft.github.io/microsoft/autogen

---

**Recommendation 13: Implement NotebookLM + Notion Integration**

**Problem:** No bidirectional synchronization with external knowledge bases.

**Solution:**
1. Build Notion API client
2. Implement artifact generation service (diagrams, charts, summaries)
3. Create citation tracking system with provenance
4. Develop bidirectional sync with conflict resolution

**Acceptance Criteria:**
- Notion API client working
- Artifact generation service implemented
- Citation and provenance tracking working
- Bidirectional sync with conflict resolution complete

**References:**
- Domain 3 Research: [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)
- NotebookLM Documentation: https://notebooklm.google.com

---

## 6. Implementation Roadmap

### 6.1 Phase 1: Foundation (Weeks 1-4) - P0 Gaps

**Week 1-2: Hot-Reloading Fix & Atomic Updates**
```
Tasks:
- ✅ Implement reactive state binding in AgentConfigDialog
- ✅ Add reactive store subscriptions in AgentSelector
- ✅ Implement optimistic UI pattern with rollback
- ✅ Add error handling with toast notifications
- ✅ Test immediate UI updates (<100ms)

Deliverables:
- Refactored AgentConfigDialog.tsx with reactive state
- Refactored AgentSelector.tsx with store subscriptions
- Optimistic update pattern with rollback
- Error handling with toast notifications
- Test suite for hot-reloading

Acceptance Criteria:
- Configuration updates visible within 100ms
- All components re-render simultaneously on store updates
- No navigation required to see changes
- State persists across sessions
```

**Week 3-4: Qdrant Vector Store & 5-Layer Agent System**
```
Tasks:
- ✅ Deploy Qdrant instance (Docker)
- ✅ Implement vector storage service
- ✅ Create hybrid search with RRF fusion
- ✅ Implement Layer 3: Context/Prompt Injection
- ✅ Implement Layer 4: Task-Specific Instructions
- ✅ Implement Layer 5: Hidden System Directives
- ✅ Create System Prompt Composer
- ✅ Add Layer Registry for dynamic layer management

Deliverables:
- Qdrant instance deployed and accessible
- Vector storage service with CRUD operations
- Hybrid search with RRF fusion working
- Layer 3, 4, 5 implemented
- System Prompt Composer service
- Layer Registry with dynamic registration
- Test suite for 5-layer system

Acceptance Criteria:
- Qdrant instance deployed and accessible
- Vector storage service working
- Hybrid search with RRF fusion complete
- All 5 layers implemented and composable
- System Prompt Composer can compose from 5 layers
- Layer Registry supports dynamic layer registration
```

### 6.2 Phase 2: Core Functionality (Weeks 5-8) - P1 & HIGH Gaps

**Week 5-6: Complete CRUD & Chatflow Composition**
```
Tasks:
- ✅ Add edit/delete operations to AgentSelector
- ✅ Add duplicate/reorder/bulk operations to store
- ✅ Update AgentConfigDialog with edit mode
- ✅ Add confirmation dialogs for delete operations
- ✅ Create System Prompt Composer service
- ✅ Implement Layer Registry with pre-defined and dynamic layers
- ✅ Refactor chat components to use composed system prompts
- ✅ Update /api/chat endpoint to support chatflow parameter

Deliverables:
- Complete CRUD surface across all components
- Edit mode in AgentConfigDialog
- Confirmation dialogs for delete operations
- System Prompt Composer service
- Layer Registry with dynamic registration
- Chat components using composed system prompts
- API endpoint with chatflow support
- Test suite for CRUD and chatflow

Acceptance Criteria:
- All components support full CRUD operations
- Consistent UI patterns across components
- Delete operations require confirmation
- Edit operations open configuration dialog
- ChatPanel uses composed system prompts
- API endpoint supports chatflow parameter
- Layer Registry supports dynamic layer registration
```

**Week 7-8: Ollama Embedding Service & Neo4j Graph Database**
```
Tasks:
- ✅ Integrate Ollama API for local embeddings
- ✅ Implement domain-aware chunking strategies (code, legal, medical, scientific)
- ✅ Add embedding cache with TTL
- ✅ Support multiple embedding models (nomic-embed-text, mxbai-embed-large, BGE-M3)
- ✅ Deploy Neo4j instance
- ✅ Implement entity extraction service
- ✅ Build relationship mapping service
- ✅ Create Cypher query builder for graph traversal

Deliverables:
- Ollama integration with local embeddings
- Domain-aware chunking strategies implemented
- Embedding cache with TTL working
- Multiple models supported (nomic-embed-text, mxbai-embed-large, BGE-M3)
- Neo4j instance deployed and accessible
- Entity extraction service working
- Relationship mapping service complete
- Cypher query builder for graph traversal
- Test suite for embeddings and graph DB

Acceptance Criteria:
- Ollama integration complete with local embeddings
- Domain-aware chunking strategies implemented
- Embedding cache with TTL working
- Multiple models supported (nomic-embed-text, mxbai-embed-large, BGE-M3)
- 99%+ cost reduction compared to cloud APIs
- Neo4j instance deployed and accessible
- Entity extraction service implemented
- Relationship mapping service working
- Cypher query builder for graph traversal complete
```

### 6.3 Phase 3: Advanced Features (Weeks 9-12) - MEDIUM & P2 Gaps

**Week 9-10: Cross-Architecture Context & Multi-Modal Support**
```
Tasks:
- ✅ Create event-driven state propagation layer
- ✅ Build conflict resolution system (OT, Merge-Based, LWW)
- ✅ Add context synchronization across boundaries
- ✅ Implement state snapshots for rollback
- ✅ Add vision tools (image generation, image-to-text)
- ✅ Add audio tools (text-to-speech, speech-to-text)
- ✅ Integrate multi-modal models from model registry
- ✅ Implement cross-modal reasoning capabilities

Deliverables:
- Event-driven state propagation layer
- Conflict resolution system (OT, Merge-Based, LWW)
- Context synchronization across boundaries complete
- State snapshots for rollback working
- Vision tools integrated (image generation, image-to-text)
- Audio tools integrated (text-to-speech, speech-to-text)
- Multi-modal models configured
- Cross-modal reasoning working
- Test suite for context management and multi-modal

Acceptance Criteria:
- Event-driven state propagation working
- Conflict detection automatic
- Conflict resolution strategies (OT, Merge-Based, LWW) implemented
- Context synchronization across boundaries complete
- State snapshots for rollback working
- Vision tools integrated (image generation, image-to-text)
- Audio tools integrated (text-to-speech, speech-to-text)
- Multi-modal models configured
- Cross-modal reasoning working
```

**Week 11-12: Team Orchestration & NotebookLM Integration**
```
Tasks:
- ✅ Create LangGraph-style agent graph with state persistence
- ✅ Add agent nodes with specialized capabilities
- ✅ Implement message passing and coordination
- ✅ Support sequential, parallel, and consensus patterns
- ✅ Build Notion API client
- ✅ Implement artifact generation service (diagrams, charts, summaries)
- ✅ Create citation tracking system with provenance
- ✅ Develop bidirectional sync with conflict resolution

Deliverables:
- LangGraph-style agent graph with state persistence
- Agent nodes with specialized capabilities implemented
- Message passing and coordination working
- Sequential, parallel, and consensus patterns supported
- Notion API client working
- Artifact generation service implemented
- Citation and provenance tracking working
- Bidirectional sync with conflict resolution complete
- Test suite for orchestration and NotebookLM integration
- Integration testing and documentation

Acceptance Criteria:
- Agent graph with state persistence working
- Agent nodes with specialized capabilities implemented
- Message passing and coordination working
- Sequential, parallel, and consensus patterns supported
- Notion API client working
- Artifact generation service implemented
- Citation and provenance tracking working
- Bidirectional sync with conflict resolution complete
```

### 6.4 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| **Model performance degradation** | Medium | High | A/B testing pipeline, quality monitoring |
| **Storage scalability** | Low | Medium | Horizontal scaling plan, archiving strategy |
| **Context loss in browser** | Medium | High | IndexedDB persistence, auto-save |
| **Integration complexity** | High | Medium | Phased rollout, comprehensive testing |
| **Vendor lock-in** | Low | Low | Abstraction layer design |
| **Hot-reloading regression** | Medium | High | Comprehensive testing, rollback plan |
| **State synchronization conflicts** | Medium | High | Conflict resolution strategies, testing |

---

## 7. Research References

### 7.1 Domain 1 Research References

**Research Artifact:**
- [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)

**MCP Research Sources:**
1. **TanStack AI Documentation** (Context7 MCP)
   - Library ID: `/websites/tanstack_ai`
   - Topics: Dynamic SSE adapter configuration, multi-provider initialization, provider-specific model options, tools configuration
   - URL: https://tanstack.com/ai

2. **TanStack Router Documentation** (Deepwiki MCP)
   - Query: How does TanStack Router handle reactive state management?
   - Topics: Search parameters as state manager, reactive router state, data loading and caching, type safety
   - URL: https://deepwiki.com/search/how-does-tanstack-router-handl_bf19f5e9-7ba1-4f3b-9674-bcf21ec98da4

3. **Zustand Hot-Reloading Best Practices** (Exa Web Search)
   - Topics: State not updating immediately issue, Zustand update pattern, hydration with persist middleware, best practices for hot-reloading
   - URL: https://github.com/pmndrs/zustand/discussions/3132
   - URL: https://medium.com/@minduladilthushan/resolving-the-state-not-updating-immediately-issue-in-react-js-febf5959c0cf
   - URL: https://ekwoster.dev/post/building-scalable-state-management-with-zustand-in-react/
   - URL: https://zustand.docs.pmnd.rs/guides/updating-state

### 7.2 Domain 2 Research References

**Research Artifact:**
- [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)

**MCP Research Sources:**
1. **Multi-Agent Orchestration Patterns** (Tavily MCP)
   - Search: "5 Multi-Agent Orchestration Patterns You MUST Know in 2025!"
   - Topics: Sequential orchestration, MapReduce-style parallelism, consensus mode, layered orchestration, producer-reviewer loop, group chat orchestration, specialist swarms, critic-refiner loop
   - URL: YouTube video (5 Multi-Agent Orchestration Patterns)

2. **Top AI Agent Frameworks in 2025** (Exa MCP)
   - Search: "Agentic AI #3 — Top AI Agent Frameworks in 2025: LangChain, AutoGen, CrewAI & Beyond"
   - Topics: LangGraph modular orchestration, AutoGen conversation-first, CrewAI role-based crews, Microsoft Agent Framework enterprise-grade, LangChain modular chains and agents
   - URL: https://github.com/langchain-ai/langgraph
   - URL: https://microsoft.github.io/microsoft/autogen
   - URL: https://www.crewai.com
   - URL: https://python.langchain.com

3. **TanStack AI Multi-Modal Support** (Deepwiki MCP)
   - Query: Does TanStack AI support multi-modal agent orchestration and chatflow patterns?
   - Topics: Multi-modal inputs (RoleScopedChatInput with image_url), multi-modal agent orchestration, chatflow support
   - URL: https://tanstack.com/ai

### 7.3 Domain 3 Research References

**Research Artifact:**
- [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)

**MCP Research Sources:**
1. **Qdrant Documentation** (Context7 MCP)
   - Library ID: `/websites/qdrant_tech`
   - Topics: Hybrid search, RRF fusion, collection management, payload filtering, full-text search
   - URL: https://qdrant.tech/documentation

2. **Ollama Embedding Models** (Tavily MCP)
   - Search: "Ollama local embedding models 2025 best practices"
   - Topics: nomic-embed-text, mxbai-embed-large, BGE-M3, MTEB benchmarks, cost analysis, performance comparison
   - URL: https://ollama.com/blog/embedding-models

3. **GraphRAG Hybrid Implementation** (Exa MCP)
   - Repository: rileylemm/graphrag-hybrid
   - Pattern: Neo4j + Qdrant integration
   - URL: https://github.com/rileylemm/graphrag-hybrid

4. **Local RAG with Ollama and Weaviate** (Weaviate Blog)
   - Architecture: Privacy-preserving RAG
   - URL: https://weaviate.io/blog/local-rag-with-ollama-and-weaviate

5. **Embedding Model Comparison** (Tavily MCP)
   - Analysis: MTEB benchmarks, cost analysis, performance metrics
   - URL: https://elephas.app/blog/best-embedding-models

### 7.4 Project Documentation References

**MVP Sprint Plan:**
- [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)

**State Management Audit:**
- [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md)

**Course Corrections:**
- [`_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md`](_bmad-output/course-corrections/openrouter-401-fix-2025-12-25.md)
- [`_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md`](_bmad-output/course-corrections/read-file-and-agentic-execution-analysis-2025-12-25.md)

**Comprehensive Tech Documentation:**
- `docs/2025-12-23/` with architecture, tech context, data contracts, flows

**Development Guidelines:**
- `.agent/rules/general-rules.md` with MCP research protocol

---

## Conclusion

This technical architecture document synthesizes findings from three comprehensive research domains to define the current state of Via-gent's AI agent infrastructure and establish the target BMAD v6 knowledge-synthesis architecture.

### Key Achievements

1. **Comprehensive Research Synthesis**: Consolidated findings from LLM provider configuration, agent architecture, and RAG infrastructure research domains
2. **Current State Documentation**: Thoroughly documented existing architecture with strengths and gaps
3. **Target Architecture Definition**: Established clear vision for BMAD v6 with 5-layer agent system, hybrid RAG, and reactive state management
4. **Gap Analysis**: Identified 20+ critical gaps with priority classification (P0, P1, P2, P3)
5. **Dependency Mapping**: Created dependency graph showing relationships between gaps
6. **Technical Recommendations**: Provided 13 prioritized recommendations with implementation patterns
7. **Implementation Roadmap**: Defined 12-week phased implementation plan with clear deliverables and acceptance criteria

### Next Steps

1. **Phase 1 Execution** (Weeks 1-4): Implement P0 gaps (hot-reloading, atomic updates, Qdrant, 5-layer system)
2. **Phase 2 Execution** (Weeks 5-8): Implement P1 and HIGH gaps (CRUD, chatflow, Ollama, Neo4j)
3. **Phase 3 Execution** (Weeks 9-12): Implement MEDIUM and P2 gaps (context management, multi-modal, orchestration, NotebookLM)
4. **Continuous Validation**: Test each implementation phase with browser E2E verification
5. **Documentation Updates**: Update AGENTS.md and agent-os steering documents as progress occurs

### Strategic Alignment

This architecture document aligns with BMAD v6 framework requirements:

- **Guardrails**: Non-negotiable safety boundaries defined in Layer 5 (Hidden System Directives)
- **Checklists**: Pre-execution validation with acceptance criteria for each recommendation
- **Handoff Artifacts**: Structured communication protocol with clear deliverables and dependencies
- **Gatekeeping Validation**: Quality gates at each phase transition with test suites and E2E verification

The target BMAD v6 architecture provides enterprise-grade multi-agent orchestration capabilities with hybrid RAG, reactive state management, and comprehensive cross-architecture context management, positioning Via-gent as a leading browser-based IDE with advanced AI agent capabilities.

---

**Document Metadata**
- **Artifact ID**: TECH-ARCH-2025-12-27
- **Version**: 1.0
- **Status**: Research Complete
- **Related Artifacts**: 
  - [`domain-1-llm-provider-config-research.md`](docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md)
  - [`domain-2-agent-config-architecture-research.md`](docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md)
  - [`domain-3-rag-infrastructure-research.md`](docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md)
- **Next Phase**: Implementation Planning & Sprint Breakdown
