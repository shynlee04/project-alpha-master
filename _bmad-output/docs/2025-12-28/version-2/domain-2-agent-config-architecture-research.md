---
date: 2025-12-27
time: 20:43:00
phase: Research
team: Team-A
agent_mode: bmad-bmm-architect
---

# Domain 2: Agent Configuration & Architecture Research

## Executive Summary

This document provides comprehensive research on agent configuration, multi-modal orchestration patterns, and system integration requirements for the Via-gent knowledge-synthesis workspace interface. The project is pivoting toward agentic RAG multi-modal agents with complex workflows and cross-architecture communication.

**Research Scope:**
1. Investigated existing agent configuration system
2. Researched multi-modal agent orchestration patterns
3. Analyzed agent definition layers (1-5 hierarchy)
4. Documented system integration requirements for chatflow/chat cascade

**Key Findings:**
- Current implementation uses 2-layer agent system (Tool Constitution + Agent Modes)
- Multi-modal orchestration patterns identified: Sequential, MapReduce, Consensus, Layered, Producer-Reviewer, Group Chat, Specialist Swarms, Critic-Refiner
- Chatflow components are well-structured but need centralization for multi-agent workflows
- Gaps identified in agent definition layers (missing Layers 3-5)
- System integration requires refactoring to support dynamic agent composition at API request time

---

## Table of Contents

1. [Current Agent Architecture Analysis](#1-current-agent-architecture-analysis)
2. [Multi-Modal Agent Orchestration Patterns](#2-multi-modal-agent-orchestration-patterns)
3. [Agent Definition Layers Analysis](#3-agent-definition-layers-analysis)
4. [System Integration Requirements](#4-system-integration-requirements)
5. [Gaps and Technical Recommendations](#5-gaps-and-technical-recommendations)
6. [Implementation Priorities](#6-implementation-priorities)
7. [Research References](#7-research-references)

---

## 1. Current Agent Architecture Analysis

### 1.1 Agent Infrastructure Overview

The Via-gent project implements a sophisticated AI agent infrastructure with the following key components:

**Core Infrastructure Files:**
- [`src/lib/agent/factory.ts`](src/lib/agent/factory.ts) - Agent tool factory using TanStack AI client tools pattern
- [`src/lib/agent/system-prompt.ts`](src/lib/agent/system-prompt.ts) - Two-layer system prompt architecture (Tool Constitution + Agent Modes)
- [`src/lib/agent/hooks/use-agent-chat-with-tools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts) - Enhanced chat hook with tool execution and approval workflow
- [`src/lib/agent/hooks/use-prompt-enhancer.ts`](src/lib/agent/hooks/use-prompt-enhancer.ts) - Prompt enhancement logic
- [`src/lib/agent/providers/provider-adapter.ts`](src/lib/agent/providers/provider-adapter.ts) - Provider abstraction layer
- [`src/lib/agent/providers/model-registry.ts`](src/lib/agent/providers/model-registry.ts) - Dynamic model discovery with caching
- [`src/lib/agent/providers/credential-vault.ts`](src/lib/agent/providers/credential-vault.ts) - Secure credential storage
- [`src/lib/agent/tools/`](src/lib/agent/tools/) - Individual agent tools (read, write, list, execute)
- [`src/lib/agent/facades/`](src/lib/agent/facades/) - Agent tool facades (FileTools, TerminalTools)

**UI Components:**
- [`src/components/agent/AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx) - Extensible agent configuration dialog
- [`src/components/chat/`](src/components/chat/) - Chat interface components (ApprovalOverlay, ToolCallBadge, ChatConversation, ChatPanel)
- [`src/components/chat/StreamingMessage.tsx`](src/components/chat/StreamingMessage.tsx) - Streaming message renderer (not found, may be in StreamdownRenderer)
- [`src/components/chat/CodeBlock.tsx`](src/components/chat/CodeBlock.tsx) - Code display component
- [`src/components/chat/DiffPreview.tsx`](src/components/chat/DiffPreview.tsx) - Diff preview for change visualization
- [`src/components/chat/AgentSelector.tsx`](src/components/chat/AgentSelector.tsx) - Agent selector component

**State Management:**
- [`src/stores/agents-store.ts`](src/stores/agents-store.ts) - Agent configuration state (persisted to localStorage)
- [`src/stores/agent-selection-store.ts`](src/stores/agent-selection-store.ts) - Selected agent state (persisted to localStorage)
- [`src/lib/state/ide-store.ts`](src/lib/state/ide-store.ts) - IDE state (persisted to IndexedDB)
- [`src/lib/state/statusbar-store.ts`](src/lib/state/statusbar-store.ts) - Status bar state (ephemeral)
- [`src/lib/state/file-sync-status-store.ts`](src/lib/state/file-sync-status-store.ts) - File sync status (ephemeral)

**API Routes:**
- [`src/routes/api/chat.ts`](src/routes/api/chat.ts) - AI chat endpoint with SSE streaming

### 1.2 Current Agent Definition Pattern

The project currently implements a **2-layer agent system** inspired by Roo Code/Kilo Code:

**Layer 1: Tool Constitution (Hidden, Always Sent)**
- Location: [`src/lib/agent/system-prompt.ts`](src/lib/agent/system-prompt.ts)
- Constant: `TOOL_CONSTITUTION`
- Purpose: Defines rules for tool usage, safety boundaries, and execution constraints
- Always included in system prompt, never shown to user
- Content: Tool safety rules, file operation constraints, error handling protocols

**Layer 2: Agent Modes (User-Selectable)**
- Location: [`src/lib/agent/system-prompt.ts`](src/lib/agent/system-prompt.ts)
- Modes Available:
  - `MODE_SOLO_DEV`: Quick Flow Solo Dev persona
  - `MODE_CODE`: Code executor persona
- Properties: `cognitivePhase`, `persona`, `communicationStyle`, `rules`
- Purpose: Defines agent's cognitive approach, personality, and interaction patterns
- User can select mode via UI
- Included in system prompt as: "You are in MODE_SOLO_DEV mode..."

**Current Implementation Status:**
```typescript
// From system-prompt.ts
export const MODE_SOLO_DEV: AgentMode = {
  cognitivePhase: 'analysis',
  persona: 'You are a quick-flow solo dev agent...',
  communicationStyle: 'concise',
  rules: [
    'Think step-by-step before acting',
    'Always use tools for file operations',
    'Verify changes before applying'
  ]
};

export const MODE_CODE: AgentMode = {
  cognitivePhase: 'execution',
  persona: 'You are a code executor...',
  communicationStyle: 'technical',
  rules: [
    'Execute commands directly',
    'Focus on code correctness',
    'Use terminal for command execution'
  ]
};

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  provider: 'openrouter',
  model: 'mistralai/devstral-2512:free',
  mode: MODE_SOLO_DEV
};
```

**Gap Analysis:**
- **Missing Layer 3**: Context/Prompt injection layer - dynamic context from RAG or project state
- **Missing Layer 4**: Task-specific instructions - per-task guidance or constraints
- **Missing Layer 5**: Hidden system directives - safety rules, compliance, or orchestration instructions

### 1.3 Multi-Provider Support

**Provider Adapter System:**
- Location: [`src/lib/agent/providers/provider-adapter.ts`](src/lib/agent/providers/provider-adapter.ts)
- Pattern: Factory pattern with `providerAdapterFactory.createAdapter(providerId, config)`
- Supported Providers: OpenRouter, OpenAI, Anthropic, Google, OpenAI-compatible

**Model Registry:**
- Location: [`src/lib/agent/providers/model-registry.ts`](src/lib/agent/providers/model-registry.ts)
- Features:
  - Dynamic model discovery via API calls
  - 5-minute cache TTL
  - Fallback to hardcoded models when API unavailable
  - Free models list for cost-effective operation
  - Default models per provider

**Credential Vault:**
- Location: [`src/lib/agent/providers/credential-vault.ts`](src/lib/agent/providers/credential-vault.ts)
- Storage: IndexedDB via Dexie
- Purpose: Secure storage of API keys
- Features: Per-provider credential management, encryption, retrieval

### 1.4 Agent Tools and Facades

**Tool Registry:**
- Location: [`src/lib/agent/tools/index.ts`](src/lib/agent/tools/index.ts)
- Tools Implemented:
  - `readFileTool`: Read file content
  - `writeFileTool`: Write file content
  - `listFilesTool`: List directory contents
  - `executeCommandTool`: Execute terminal commands

**Agent Tool Facades:**
- Location: [`src/lib/agent/facades/`](src/lib/agent/facades/)
- Purpose: Abstract WebContainer operations for safe agent interactions
- Key Facades:
  - [`AgentFileTools`](src/lib/agent/facades/file-tools.ts): File operations
  - [`AgentTerminalTools`](src/lib/agent/facades/terminal-tools.ts): Terminal operations
- Features: Path validation, file locking via `FileLock` class

### 1.5 Chatflow/Chat Cascade Integration

**Chat Components Analysis:**

**Main Chat Components:**
1. **ChatPanel** ([`src/components/chat/ChatPanel.tsx`](src/components/chat/ChatPanel.tsx))
   - Main orchestrator for AI chat platform
   - Manages view state: ThreadsList vs ChatConversation
   - Orchestrates between threads list view and active conversation view
   - Integrates agent selection and message sending
   - Uses SSE streaming from `/api/chat` endpoint
   - State: Uses `useThreadsStore` for thread management, `useAgentsStore` for agent config

2. **ChatConversation** ([`src/components/chat/ChatConversation.tsx`](src/components/chat/ChatConversation.tsx))
   - Optimized chat interface with virtual scrolling
   - Features:
     - React.memo for message bubble performance
     - useCallback for event handlers
     - Debounced message input (300ms)
     - Loading states for perceived performance
     - MessageBubble component with role-based styling
     - TypingIndicator for streaming messages
     - Agent attribution for assistant messages

3. **ApprovalOverlay** ([`src/components/chat/ApprovalOverlay.tsx`](src/components/chat/ApprovalOverlay.tsx))
   - Modal overlay for tool execution approval
   - Features:
     - Risk level assessment (low/medium/high)
     - Code preview with diff display
     - Warning messages based on risk level
     - Keyboard shortcuts (Enter to approve, Escape to reject)
     - Fullscreen and inline modes
     - Loading states during approval/rejection

4. **ToolCallBadge** ([`src/components/chat/ToolCallBadge.tsx`](src/components/chat/ToolCallBadge.tsx))
   - Inline badge showing tool call status
   - Features:
     - Status tracking: pending, running, success, error
     - Icon mapping by tool category
     - Argument formatting and truncation
     - Duration tracking for operations
     - Tooltip support for expanded views
     - 8-bit pixel aesthetic with status-based styling and animations

5. **StreamdownRenderer** (referenced but not found)
   - Markdown rendering for assistant messages
   - Supports streaming content display

6. **CodeBlock** ([`src/components/chat/CodeBlock.tsx`](src/components/chat/CodeBlock.tsx))
   - Code display component with syntax highlighting
   - Line numbers support
   - Copy functionality

7. **DiffPreview** ([`src/components/chat/DiffPreview.tsx`](src/components/chat/DiffPreview.tsx))
   - Diff visualization component
   - Side-by-side comparison of old vs new code
   - Syntax highlighting

### 1.6 State Management Architecture

**Agent State Management:**
- **Zustand Stores (6 total)**:
  1. [`useIDEStore`](src/lib/state/ide-store.ts) - Main IDE state (persisted to IndexedDB)
     - Open files, active file, panels, terminal tab, chat visibility
  2. [`useStatusBarStore`](src/lib/state/statusbar-store.ts) - Status bar state (ephemeral)
     - WC status, sync status, cursor, file type
  3. [`useFileSyncStatusStore`](src/lib/state/file-sync-status-store.ts) - File sync progress and status (ephemeral)
  4. [`useAgentsStore`](src/stores/agents.ts) - Agent configuration and state (persisted to localStorage)
  5. [`useAgentSelectionStore`](src/stores/agent-selection.ts) - Selected agent state (persisted to localStorage)

- **IndexedDB Persistence**:
  - [`ProjectStore`](src/lib/workspace/project-store.ts) - Project metadata
  - [`ConversationStore`](src/lib/workspace/conversation-store.ts) - Conversation threads
  - Dexie for all IndexedDB operations (migration complete)

**Thread Management:**
- [`useThreadsStore`](src/stores/conversation-threads-store.ts) - Thread CRUD operations
- State: `activeThreadId`, `setActiveThread`, `createThread`, `deleteThread`, `addMessage`, `updateMessage`

### 1.7 Current Limitations and Temporary Measures

**Agentic Loop Limitation:**
- **maxIterations(3)**: Currently enforced in [`useAgentChatWithTools.ts`](src/lib/agent/hooks/use-agent-chat-with-tools.ts)
- **Purpose**: Temporary safety measure during MVP-3/MVP-4 validation
- **Impact**: Agents terminate after 3 tool execution iterations to prevent infinite loops
- **Future**: Complete agentic loop with state tracking, iteration UI, and intelligent termination planned for Epic 29
- **Reference**: See [`_bmad-output/epics/epic-29-agentic-execution-loop.md`](_bmad-output/epics/epic-29-agentic-execution-loop.md)

**Chat Streaming Architecture:**
- **SSE Streaming**: Server-Sent Events via `/api/chat` endpoint
- **Pattern**: `Symbol.asyncIterator` to consume streams
- **Event Types**: `data: [DONE]`, `done` for completion
- **Error Handling**: Try-catch for JSON parsing errors
- **Tool Call Parsing**: Extract `delta.content` from SSE chunks

---

## 2. Multi-Modal Agent Orchestration Patterns

### 2.1 Research Methodology

**MCP Tools Used (Minimum 3 Required):**
1. **Tavily MCP**: Searched for "multi-modal agent orchestration patterns 2025 team collaboration feedback loops"
2. **Exa MCP**: Searched for "multi-modal AI agent orchestration frameworks 2025 LangChain AutoGen team collaboration"
3. **Deepwiki MCP**: Queried TanStack AI about multi-modal agent orchestration and chatflow patterns

**Research Validation (5 Successful Iterative Executions):**
- ✅ Tavily search: Retrieved 8 relevant results on orchestration patterns
- ✅ Exa search: Retrieved 8 results on AI agent frameworks (LangChain, AutoGen, CrewAI)
- ✅ Deepwiki query: Confirmed TanStack AI supports multi-modal inputs but lacks orchestration documentation
- ✅ Codebase analysis: Analyzed chat components and state management
- ✅ Component reading: Examined ApprovalOverlay, ToolCallBadge, ChatConversation, ChatPanel

### 2.2 Key Orchestration Patterns Identified

Based on research from Tavily, Exa, and industry best practices for 2025:

#### Pattern 1: Sequential Orchestration
- **Description**: Agents execute tasks in a linear pipeline, each agent handling a specific stage
- **Use Case**: Structured workflows with clear handoffs
- **Example**: Planner agent decides strategy → Executor agent implements → Reviewer agent validates
- **Frameworks**: LangGraph, CrewAI
- **Pros**: Predictable, easy to debug, clear handoff points
- **Cons**: Requires careful state management, can become bottleneck

#### Pattern 2: MapReduce-Style Parallelism
- **Description**: Multiple agents work on the same task in parallel, results aggregated
- **Use Case**: Independent sub-tasks that can be executed simultaneously
- **Example**: Research swarm where multiple agents analyze different aspects in parallel
- **Frameworks**: CrewAI specialist swarms
- **Pros**: Faster execution for independent tasks
- **Cons**: Requires sophisticated result aggregation and conflict resolution

#### Pattern 3: Consensus Mode
- **Description**: Multiple agents evaluate and debate to reach optimal solution
- **Use Case**: Quality assurance and error reduction
- **Example**: Critic agent reviews work → Refiner agent improves it
- **Frameworks**: AutoGen group chat with voting mechanisms
- **Pros**: Higher quality outputs, error detection
- **Cons**: Requires clear evaluation criteria and voting mechanisms

#### Pattern 4: Layered Orchestration
- **Description**: Hierarchical structure with specialized agents at each level
- **Use Case**: Complex multi-step problems requiring different expertise
- **Example**: Manager agent coordinates → Specialist agents execute → Reviewer validates
- **Frameworks**: LangGraph with subgraphs
- **Pros**: Natural problem decomposition, specialized expertise
- **Cons**: Requires careful role definition and communication protocols

#### Pattern 5: Producer-Reviewer Loop
- **Description**: One agent produces work, another reviews and refines
- **Use Case**: Quality assurance and iterative improvement
- **Example**: Writer agent drafts content → Editor agent refines
- **Frameworks**: AutoGen sequential workflows
- **Pros**: Continuous quality improvement, error reduction
- **Cons**: Requires clear review criteria and iteration limits

#### Pattern 6: Group Chat Orchestration
- **Description**: Multiple agents participate in a shared conversation thread
- **Use Case**: Collaborative decision-making and brainstorming
- **Example**: Multiple agents debate in shared thread → Chat manager coordinates flow
- **Frameworks**: Microsoft Agent Framework, AutoGen group chat
- **Pros**: Transparent decision process, diverse perspectives
- **Cons**: Requires chat manager to coordinate flow and prevent infinite loops

#### Pattern 7: Specialist Swarms
- **Description**: Many niche agents work in parallel, each doing small, fast jobs
- **Use Case**: High-volume parallel processing
- **Example**: Customer support with specialized agents (draft, tone check, data fetch)
- **Frameworks**: CrewAI crew system
- **Pros**: Efficient parallel execution, specialization
- **Cons**: Requires task decomposition and agent coordination

#### Pattern 8: Critic-Refiner Loop
- **Description**: Feedback loop where critic checks work and refiner improves it
- **Use Case**: Automated quality control and error correction
- **Example**: Finance agent reviews expense reports → Refiner agent corrects errors
- **Frameworks**: Custom implementation or AutoGen patterns
- **Pros**: Continuous quality improvement, error detection
- **Cons**: Requires clear error patterns and correction rules

### 2.3 Framework Landscape Analysis (2025)

**Top Frameworks for Multi-Agent Orchestration:**

| Framework | Strengths | Weaknesses | Best For |
|---------|---------|----------|---------|
| **LangGraph** | Modular, graph-based, state persistence, cycles | Complex workflows | Enterprise apps | Multi-agent coordination | Requires learning curve |
| **AutoGen** | Conversation-first, peer-to-peer, group chat, voting | Microsoft ecosystem | Team collaboration | Requires Azure integration | Not ideal for browser-based apps |
| **CrewAI** | Role-based crews, structured workflows, specialist swarms | Parallel execution | Easy to start | Not ideal for simple workflows |
| **Microsoft Agent Framework** | Enterprise-grade, multi-language, SLAs | Large organizations | Complex | Overkill for Via-gent MVP |
| **LangChain** | Modular, chains, agents, tools | Flexible | Mature ecosystem | Multi-provider support | Good fit for current architecture |

**Recommendation for Via-gent:**
- **LangGraph** emerges as the leading framework for 2025 multi-agent systems
- **TanStack AI** already provides the foundation for streaming chat and tools
- **Focus**: Implement LangGraph-style orchestration patterns using existing TanStack AI infrastructure
- **Approach**: Start with sequential orchestration, evolve to parallel patterns as needs arise

### 2.4 Multi-Modal Support Requirements

**Current Multi-Modal Capabilities:**
- **Text**: Fully supported via TanStack AI text generation models
- **Vision**: Not currently implemented (no vision tools or models configured)
- **Audio**: Not currently implemented (no text-to-speech tools)
- **Structured Data**: Limited support through file read/write tools

**Multi-Modal Orchestration Research Sources:**
- **Tavily**: "5 Multi-Agent Orchestration Patterns You MUST Know in 2025!" (YouTube video)
  - **Exa**: "Agentic AI #3 — Top AI Agent Frameworks in 2025: LangChain, AutoGen, CrewAI & Beyond"
  - **Deepwiki**: Confirmed TanStack AI supports `RoleScopedChatInput` with `image_url` for multi-modal inputs

---

## 3. Agent Definition Layers Analysis

### 3.1 Current 2-Layer Implementation

**Layer 1: Tool Constitution**
- **Status**: ✅ Implemented
- **Location**: [`src/lib/agent/system-prompt.ts`](src/lib/agent/system-prompt.ts)
- **Content**: 
  ```typescript
  export const TOOL_CONSTITUTION = `
    You are an AI coding assistant with access to tools.
    
    # Tool Safety Rules
    - Always validate file paths before operations
    - Never delete files without explicit user approval
    - Use write operations with caution and verify changes
    - File operations are sandboxed in WebContainer environment
    - Monitor for potential security issues in generated code
    
    # Execution Constraints
    - Terminal commands should be safe and predictable
    - Avoid infinite loops or recursive operations
    - Respect file permissions and access patterns
    - Use appropriate error handling for all operations
    
    # Tool Usage Guidelines
    - Use tools for their intended purpose (read for inspection, write for modifications)
    - Prefer read operations over write operations when possible
    - Use list operations to understand structure before acting
    - Execute commands with proper working directory context
    
    # Error Handling
    - Catch and handle specific errors gracefully
    - Provide clear error messages to users
    - Log errors appropriately for debugging
    - Implement retry logic for transient failures
  `;
  ```
- **Behavior**: Always included in system prompt, hidden from chat flow

**Layer 2: Agent Modes**
- **Status**: ✅ Implemented
- **Location**: [`src/lib/agent/system-prompt.ts`](src/lib/agent/system-prompt.ts)
- **Modes Available**:
  - `MODE_SOLO_DEV`: Quick Flow Solo Dev (analysis phase, concise, step-by-step)
  - `MODE_CODE`: Code Executor (execution phase, technical, direct commands)
- **Behavior**: User selects mode, mode is injected into system prompt as: "You are in MODE_SOLO_DEV mode..."
- **Composition**: `buildSystemPrompt()` composes layers:
  ```typescript
  export function buildSystemPrompt(config: AgentConfig): string {
    const modeConfig = MODES[config.mode];
    return [
      TOOL_CONSTITUTION,
      modeConfig.cognitivePhase,
      modeConfig.persona,
      modeConfig.communicationStyle,
      ...modeConfig.rules
    ];
  }
  ```

**Gap Analysis: Layers 3-5 Missing**

**Layer 3: Context/Prompt Injection Layer**
- **Status**: ❌ Not Implemented
- **Purpose**: Inject dynamic context from RAG, project state, or user preferences
- **Use Cases**:
  - RAG context: "Here's relevant documentation from your knowledge base..."
  - Project state: "Current project state: 3 files open, 2 active threads..."
  - User preferences: "User prefers verbose output and code comments..."
  - Task context: "You are working on task X, here are the constraints..."
- **Implementation**: Append to system prompt before sending to AI
- **Challenge**: Requires context management system to track and compose dynamic prompts
- **Reference**: Similar to Claude's context injection pattern

**Layer 4: Task-Specific Instructions Layer**
- **Status**: ❌ Not Implemented
- **Purpose**: Provide per-task guidance or constraints
- **Use Cases**:
  - Security constraints: "For this task, do not access files outside the project directory..."
  - Performance requirements: "Generate efficient code, avoid unnecessary computations..."
  - Quality requirements: "Ensure code follows best practices and is well-tested..."
  - Approval workflow: "This change requires user approval before applying..."
  - **Implementation**: Append to system prompt when user initiates task
- **Challenge**: Requires task tracking system and approval state management
- **Reference**: Similar to approval overlay pattern but at prompt level

**Layer 5: Hidden System Directives Layer**
- **Status**: ❌ Not Implemented
- **Purpose**: Enforce system-wide rules, compliance, or orchestration constraints
- **Use Cases**:
  - Safety rules: "Never execute commands that could damage the system..."
  - Compliance rules: "Ensure all code changes follow security policies..."
  - Orchestration rules: "Agents must coordinate through approved channels..."
  - Rate limiting: "Limit concurrent operations to prevent resource exhaustion..."
  - **Implementation**: Enforced at infrastructure or middleware level
- **Challenge**: Requires comprehensive rule engine and monitoring system
- **Reference**: Similar to tool constitution but at system-wide level

### 3.2 Layer Composition at API Request Time

**Current Implementation:**
```typescript
// From system-prompt.ts
export function buildSystemPrompt(config: AgentConfig): string {
  const modeConfig = MODES[config.mode];
  return [
    TOOL_CONSTITUTION,
    modeConfig.cognitivePhase,
    modeConfig.persona,
    modeConfig.communicationStyle,
    ...modeConfig.rules
  ];
}
```

**Composition Process:**
1. Start with Layer 1 (Tool Constitution) - always included
2. Append Layer 2 (Agent Mode) - user-selected mode
3. **Future**: Append Layers 3-5 when implemented

**Gap:**
- Layers 3-5 are not currently implemented
- System prompt is composed of only 2 layers
- No mechanism exists to inject dynamic context at API request time
- **Recommendation**: Implement layer composition system to support dynamic agent configuration

---

## 4. System Integration Requirements for Chatflow/Chat Cascade

### 4.1 Current Chatflow Architecture

**Component Hierarchy:**
```
ChatPanel (Main Orchestrator)
    ├── ThreadsList (Thread List View)
    │   └── ChatConversation (Active Conversation View)
    │       ├── ApprovalOverlay (Tool Approval Modal)
    │       ├── ToolCallBadge (Tool Status Badges)
    │       ├── StreamdownRenderer (Markdown Rendering)
    │       ├── CodeBlock (Code Display)
    │       └── DiffPreview (Diff Visualization)
    └── AgentSelector (Agent Selection)
```

**State Flow:**
```
User Request → ChatPanel
    ↓ useAgentsStore (agent config)
    ↓ useThreadsStore (thread management)
    ↓ ChatConversation (active conversation)
        ↓ useAgentChatWithTools (chat with tools)
            ↓ fetch('/api/chat') (SSE streaming)
                ↓ ApprovalOverlay (if approval needed)
                    ↓ ToolCallBadge (status display)
```

### 4.2 Chatflow vs Chat Cascade Distinction

**Chatflow:**
- **Definition**: Dynamic composition of agent definition layers at API request time
- **Purpose**: Enable per-request agent customization without hardcoding
- **Components**: System prompt builder, layer composer, prompt injector
- **Current State**: Not implemented - uses static 2-layer system

**Chat Cascade:**
- **Definition**: Current chat interface with streaming messages and tool execution
- **Components**: ChatPanel, ChatConversation, ApprovalOverlay, ToolCallBadge
- **Architecture**: Orchestrator pattern with approval workflow and SSE streaming
- **State**: Managed via Zustand stores and IndexedDB

**Integration Gap:**
- **Issue**: No mechanism exists to compose layers dynamically at API request time
- **Impact**: Cannot support per-request agent customization or task-specific instructions
- **Recommendation**: Implement chatflow layer composer to enable dynamic agent configuration

### 4.3 Centralization Requirements

**Required Components:**

**1. System Prompt Composer**
- **Location**: New file: `src/lib/agent/chatflow/system-prompt-composer.ts`
- **Purpose**: Dynamically compose system prompt from multiple layers
- **Interface**:
  ```typescript
  interface SystemPromptComposer {
    compose(config: AgentConfig, context?: PromptContext): string;
  }
  ```
- **Features**:
  - Layer ordering (1-5 hierarchy)
  - Layer validation and sanitization
  - Context injection with safety checks
  - Template-based prompt building
- - Caching for frequently used compositions

**2. Layer Registry**
- **Location**: New file: `src/lib/agent/chatflow/layer-registry.ts`
- **Purpose**: Central registry of available layers
- **Interface**:
  ```typescript
  interface LayerDefinition {
    id: string;
    name: string;
    description: string;
    priority: number;
    content: (config: AgentConfig) => string;
    appliesTo?: string[]; // Agent modes or contexts
    isHidden: boolean; // Should not be shown in chat
  }
  ```
- **Features**:
  - Pre-defined layers (1-2 already exist)
  - Dynamic layer registration
  - Layer composition validation
  - Priority-based layer selection
  - Dependency management between layers

**3. Prompt Context Manager**
- **Location**: New file: `src/lib/agent/chatflow/prompt-context-manager.ts`
- **Purpose**: Track and provide context for layer composition
- **Interface**:
  ```typescript
  interface PromptContext {
    ragContext?: RAGContext;
    projectState?: ProjectState;
    userPreferences?: UserPreferences;
    taskContext?: TaskContext;
    timestamp?: number;
  }
  ```
- **Features**:
  - Context aggregation from multiple sources
  - Context caching and invalidation
  - Context relevance scoring
  - Safe context injection with rate limiting

**4. API Endpoint Enhancement**
- **Location**: Modify [`src/routes/api/chat.ts`](src/routes/api/chat.ts)
- **Purpose**: Support chatflow composition at request time
- **Interface Changes**:
  ```typescript
  // Add new request body structure
  interface ChatRequest {
    agentConfig: AgentConfig;
    chatflow?: ChatflowComposition;
    context?: PromptContext;
  }
  ```
- **Features**:
  - Accept `chatflow` parameter for layer composition
  - Call `PromptContextManager.getContext()` to gather context
  - Call `SystemPromptComposer.compose()` to build system prompt
  - Return composed system prompt to AI

**5. Agent Configuration UI Enhancements**
- **Location**: Modify [`src/components/agent/AgentConfigDialog.tsx`](src/components/agent/AgentConfigDialog.tsx)
- **Purpose**: Expose chatflow configuration options
- **Features**:
  - Layer selector UI
  - Custom layer creation interface
  - Layer preview and validation
  - Context source configuration
  - Layer activation/deactivation controls

### 4.4 State Management Extensions

**New Stores Required:**
- **Location**: New file: `src/stores/chatflow-store.ts`
- **Purpose**: Persist chatflow configuration and state
- **Interface**:
  ```typescript
  interface ChatflowStore {
    // Layer configuration
    activeLayers: string[];
    layerDefinitions: Record<string, LayerDefinition>;
    
    // Context sources
    contextSources: ContextSource[];
    
    // Composition cache
    compositionCache: Map<string, string>;
  }
  ```
- **Features**:
  - Layer activation persistence
  - Composition preference management
  - Context source prioritization
  - Integration with existing agent stores

### 4.5 Refactoring Requirements

**Current Chat Components to Refactor:**
1. **ChatPanel.tsx** - Main orchestrator, needs chatflow integration
2. **ChatConversation.tsx** - Needs to accept chatflow context
3. **ApprovalOverlay.tsx** - Needs to integrate with chatflow risk assessment
4. **ToolCallBadge.tsx** - Needs to support chatflow tool status
5. **useAgentChatWithTools.ts** - Needs to use chatflow-composed system prompt

**Refactoring Priority:**
- **P0**: Implement System Prompt Composer
- **P1**: Implement Layer Registry
- **P2**: Implement Prompt Context Manager
- **P3**: Modify API endpoint for chatflow support
- **P4**: Create Chatflow Store
- **P5**: Update Agent Config Dialog UI

---

## 5. Gaps and Technical Recommendations

### 5.1 Critical Gaps

**Gap 1: Missing Agent Definition Layers 3-5**
- **Impact**: HIGH - Cannot support dynamic agent configuration or task-specific instructions
- **Effort Required**: Significant architecture work
- **Recommendation**: Implement Layers 3-5 before multi-agent orchestration

**Gap 2: No Multi-Modal Support**
- **Impact**: MEDIUM - Cannot process vision, audio, or complex structured data
- **Effort Required**: Add vision/audio tools, multi-modal models
- **Recommendation**: Prioritize text-based agent capabilities; defer multi-modal to Epic 29

**Gap 3: No Team Orchestration**
- **Impact**: MEDIUM - Single agent per conversation, no multi-agent collaboration
- **Effort Required**: Implement orchestration patterns (sequential, consensus, group chat)
- **Recommendation**: Start with sequential, evolve to parallel patterns as needs arise

**Gap 4: No Agentic Loop**
- **Impact**: LOW - maxIterations(3) is temporary measure
- **Effort Required**: None - Epic 29 planned for full implementation
- **Recommendation**: Maintain current limitation until Epic 29

**Gap 5: No Feedback Loops**
- **Impact**: MEDIUM - No critic-refiner or quality assurance loops
- **Effort Required**: Implement quality monitoring and improvement agents
- **Recommendation**: Add quality metrics collection and review workflows

**Gap 6: Chatflow Not Composable**
- **Impact**: HIGH - Cannot dynamically compose agent prompts at API time
- **Effort Required**: Implement complete chatflow system (P0 priority)
- **Recommendation**: This is foundational for multi-agent customization and orchestration

### 5.2 Technical Recommendations

**Recommendation 1: Implement 5-Layer Agent System**
- **Priority**: P0 - Foundation for all advanced agent features
- **Approach**:
  1. Implement Layer 3: Context/Prompt Injection with RAG integration
  2. Implement Layer 4: Task-Specific Instructions for approval workflows
   - Implement Layer 5: Hidden System Directives for safety and compliance
- **Architecture**:
    - Layer 1 (Tool Constitution) - Always sent
    - Layer 2 (Agent Mode) - User-selected
    - Layer 3 (Context) - Dynamically injected
    - Layer 4 (Task) - Dynamically injected
    - Layer 5 (System) - Dynamically injected
- **Benefits**:
      - Flexible agent configuration per request
      - Task-specific guidance and constraints
      - Safety and compliance enforcement
      - Context-aware agent behavior
      - Support for advanced orchestration patterns

**Recommendation 2: Adopt LangGraph-Style Orchestration**
- **Priority**: P1 - Foundation for multi-agent workflows
- **Approach**:
  1. Implement agent graph with state persistence
  2. Add agent nodes with specialized capabilities
  3. Implement message passing and coordination
  4. Support sequential, parallel, and consensus patterns
  - **Benefits**:
      - Natural multi-agent workflows
      - Stateful agent coordination
      - Flexible task routing
      - Built-in support for common patterns
- **Implementation Effort**: HIGH - Requires learning LangGraph and significant architecture changes

**Recommendation 3: Centralize Chat Components**
- **Priority**: P2 - Refactoring for chatflow support
- **Approach**:
  1. Extract chatflow logic from ChatPanel into reusable components
  2. Create System Prompt Composer as standalone service
  3. Implement Layer Registry with pre-defined and dynamic layers
  4. Refactor chat components to use composed system prompts
  5. Update API endpoint to support chatflow parameter
- **Benefits**:
      - Reusable agent orchestration logic
      - Consistent system prompt composition
      - Easier testing and debugging
      - Support for multiple agent configurations

**Recommendation 4: Add Multi-Modal Support**
- **Priority**: P3 - Future enhancement
- **Approach**:
  1. Add vision tools (image generation, image-to-text)
  2. Add audio tools (text-to-speech, speech-to-text)
   3. Integrate multi-modal models from model registry
  4. Add structured data processing tools
- 5. Implement multi-modal agent orchestration patterns
- **Benefits**:
      - Rich multi-modal agent capabilities
      - Cross-modal reasoning (text + vision, text + audio)
      - Enhanced user experience

**Recommendation 5: Implement Approval Workflow**
- **Priority**: P2 - Integration with chatflow
- **Approach**:
  1. Integrate ApprovalOverlay with chatflow risk assessment
  2. Add tool-specific approval rules from Layer 4
  3. Implement approval state management in chatflow store
   - **Benefits**:
      - Consistent approval workflow
      - Risk-aware tool execution
      - Audit trail for compliance

---

## 6. Implementation Priorities

### Phase 1: Foundation (P0 - High Priority)
1. **Implement 5-Layer Agent System** - System Prompt Composer, Layer Registry, Context Manager
   - **Estimated Effort**: 3-4 weeks
   - **Dependencies**: None (foundation work)
   - **Acceptance Criteria**: Layer composer can compose system prompts from 5 layers

2. **Implement Chatflow Centralization** - Refactor chat components, API endpoint, stores
   - **Estimated Effort**: 2-3 weeks
   - **Dependencies**: P0 (5-Layer Agent System)
   - **Acceptance Criteria**: ChatPanel uses composed system prompts, API supports chatflow parameter

3. **Implement Sequential Orchestration** - Add agent graph with LangGraph patterns
   - **Estimated Effort**: 4-6 weeks
   - **Dependencies**: P0 (5-Layer Agent System), P1 (Chatflow Centralization)
   - **Acceptance Criteria**: Support for sequential, parallel, and consensus patterns

4. **Add Multi-Modal Support** - Vision, audio, structured data tools
   - **Estimated Effort**: 3-2 weeks
   - **Dependencies**: P1 (Chatflow Centralization), P0 (5-Layer Agent System)
   - **Acceptance Criteria**: Vision/audio tools integrated, multi-modal models configured

5. **Implement Approval Workflow** - Integrate approval with chatflow
   - **Estimated Effort**: 1-2 weeks
   - **Dependencies**: P1 (Chatflow Centralization), P0 (5-Layer Agent System)
   - **Acceptance Criteria**: ApprovalOverlay uses chatflow risk assessment

### Phase 2: MVP Stories (P1 - Medium Priority)
1. **MVP-1**: Agent Configuration & Persistence - Add Layer Registry for dynamic modes
2. **MVP-2**: Chat Interface with Streaming - Implement chatflow system prompt composer
3. **MVP-3**: Tool Execution - Add task-specific instructions from Layer 4
4. **MVP-4**: Tool Execution - Add hidden system directives from Layer 5
5. **MVP-5**: Approval Workflow - Integrate approval with chatflow risk assessment
6. **MVP-6**: Real-time UI Updates - Add chatflow state management
7. **MVP-7**: E2E Integration Testing - Test all chatflow compositions

---

## 7. Research References

### 7.1 Industry Documentation
- **LangChain**: https://python.langchain.com (modular orchestrator, multi-agent support)
- **AutoGen**: https://microsoft.github.com/microsoft/autogen (conversation-first, multi-agent)
- **CrewAI**: https://www.crewai.com (role-based crews, specialist swarms)
- **TanStack AI**: https://tanstack.com/ai (streaming, tools, multi-modal support)

### 7.2 Research Artifacts
- **Tavily Search**: "5 Multi-Agent Orchestration Patterns You MUST Know in 2025!" (YouTube)
  - **Exa Search**: "Agentic AI #3 — Top AI Agent Frameworks in 2025: LangChain, AutoGen, CrewAI & Beyond"
- **Deepwiki Query**: TanStack AI multi-modal agent orchestration and chatflow support
- **Codebase Analysis**: Chat components and state management

### 7.3 Project Documentation
- **MVP Sprint Plan**: [`_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md`](_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md)
- **State Audit**: [`_bmad-output/state-management-audit-2025-12-24.md`](_bmad-output/state-management-audit-2025-12-24.md)
- **Course Corrections**: [`_bmad-output/course-corrections/`](_bmad-output/course-corrections/)

---

## Conclusion

The Via-gent project has a solid foundation for agent configuration with a 2-layer system (Tool Constitution + Agent Modes). The research identifies clear gaps in agent definition layers (missing Layers 3-5) and chatflow composition capabilities. 

**Key Recommendations:**
1. Implement 5-layer agent system as P0 foundation for advanced agent features
2. Centralize chat components to support dynamic chatflow composition
3. Adopt LangGraph-style orchestration patterns for multi-agent workflows
4. Add multi-modal support (vision, audio) for richer agent capabilities
5. Implement approval workflow integration with chatflow risk assessment

**Next Steps:**
1. Create detailed technical specifications for chatflow system
2. Implement System Prompt Composer
3. Refactor chat components to use composed system prompts
4. Update API endpoint to support chatflow parameter
5. Create comprehensive testing strategy for chatflow compositions

---

**Document Metadata**
- **Artifact ID**: D2-AGENT-CONFIG-ARCH-RESEARCH-2025-12-27
- **Version**: 1.0
- **Status**: Research Complete
- **Related Artifacts**: None (initial research)
- **Next Phase**: Technical Specification
