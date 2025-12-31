---
date: 2025-12-31
time: 10:50:00
phase: Implementation
team: Team A
agent_mode: bmad-core-bmad-master
handoff_to: bmad-bmm-architect, bmad-bmm-dev
approval_status: CORRECTED
change_scope: MAJOR
workflow: correct-course
revision: 2.0 - ARCHITECTURAL FOUNDATION REWRITE
---

# Sprint Change Proposal
## VIA-GENT Platform Architecture Consolidation

**Version:** 2.0 (CORRECTED)  
**Date:** 2025-12-31  
**Author:** BMad Master (Orchestrator) + Morgan (Module Builder)  
**Status:** READY FOR EXECUTION  
**Change Scope:** MAJOR (Fundamental Architecture Restructuring)

---

## CRITICAL CORRECTION NOTICE

**Previous Version (1.0) was FUNDAMENTALLY FLAWED** - It did not define the actual business data flows, entity relationships, and user journeys. This corrected version establishes the TRUE single-source-of-truth architecture.

---

# PART 1: ARCHITECTURAL FOUNDATION (IMMUTABLE CORNERSTONES)

## 1.1 Layer Architecture - The 5-Layer Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYER 5: UI/UX PRESENTATION                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ IDE          │  │ Knowledge    │  │ Study        │  │ Notes        │     │
│  │ Workspace    │  │ Workspace    │  │ Workspace    │  │ Workspace    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                 │                 │             │
│         └────────────────┴────────────────┴────────────────┘             │
│                               AgentSelector (variants: full|compact|minimal) │
│                               ChatPanel (unified across workspaces)          │
├─────────────────────────────────────────────────────────────────────────────┤
│                           LAYER 4: CROSS-WORKSPACE SERVICES                  │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │ Conversation Manager     │ Thread Manager    │ Context Manager    │      │
│  │ (cascade flow, message   │ (branching,       │ (summarization,    │      │
│  │  streaming, multimodal)  │  archiving)       │  context window)   │      │
│  └───────────────────────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│                           LAYER 3: AGENT CONFIGURATION VAULT                 │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │ Agent = Provider + Model + Tools + Settings                       │      │
│  │ ─────────────────────────────────────────────────────────────────│      │
│  │ • CRUD operations (persistent, reactive)                          │      │
│  │ • Tool binding (conditional per workspace type)                   │      │
│  │ • Workspace bindings (which agents available where)               │      │
│  │ • LLM parameters (temperature, maxTokens, systemPrompt)           │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                                    │                                         │
│                                    │ Uses providerId + modelId               │
│                                    ▼                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                           LAYER 2: LLM PROVIDER CONFIGURATION                │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │ HARDCODED PROVIDERS (Immutable Base URLs)                         │      │
│  │ ─────────────────────────────────────────────────────────────────│      │
│  │ OpenRouter   │ https://openrouter.ai/api/v1      │ 1 API key      │      │
│  │ Anthropic    │ https://api.anthropic.com/v1      │ 1 API key      │      │
│  │ Google Gemini│ Gemini SDK Native                 │ 1 API key      │      │
│  │ OpenAI       │ https://api.openai.com/v1         │ 1 API key      │      │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │ CUSTOM PROVIDERS (OpenAI-Compatible Only)                         │      │
│  │ • User enters: Name (required), BaseURL (required), Headers (opt) │      │
│  │ • API Key optional (for local providers like Ollama)              │      │
│  └───────────────────────────────────────────────────────────────────┘      │
│                                    │                                         │
│                                    │ API Key Saved → Models Auto-Load        │
│                                    ▼                                         │
│  ┌───────────────────────────────────────────────────────────────────┐      │
│  │ MODELS (Loaded dynamically from provider API after key validation)│      │
│  │ • Model ID, Name, Context Window, Max Output Tokens               │      │
│  │ • Input/Output Modalities (text, image, audio)                     │      │
│  │ • Pricing info (if available)                                      │      │
│  └───────────────────────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────────────────┤
│                           LAYER 1: PERSISTENCE & INFRASTRUCTURE              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                 │
│  │ Dexie/IndexedDB│  │ Credential     │  │ Event Bus      │                 │
│  │ (entities,     │  │ Vault          │  │ (cross-store   │                 │
│  │  configs,      │  │ (encrypted     │  │  reactivity)   │                 │
│  │  conversations)│  │  API keys)     │  │                │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.2 Entity Relationship Definitions (IMMUTABLE CONTRACTS)

### 1.2.1 LLM Provider Entity

```typescript
/**
 * IMMUTABLE CONTRACT: LLMProvider
 * This interface CANNOT be modified during this sprint without re-approval.
 */
interface LLMProvider {
  // Core identity
  id: string;                        // 'openrouter' | 'anthropic' | 'gemini' | 'openai' | 'custom-{timestamp}'
  name: string;                      // Display name
  type: 'openai' | 'anthropic' | 'gemini' | 'openai-compatible';
  
  // Endpoint (READONLY for built-in, EDITABLE for custom)
  baseUrl: string;
  isHardcoded: boolean;              // true = not editable, false = editable
  
  // Authentication
  hasApiKey: boolean;                // true if key is saved in credential vault
  
  // Capabilities (loaded from API or known defaults)
  capabilities: {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    embeddings: boolean;
  };
  
  // Metadata
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * IMMUTABLE CONTRACT: ProviderModel
 * Models loaded after API key validation
 */
interface ProviderModel {
  id: string;                        // e.g., 'gpt-4o', 'claude-3-5-sonnet-20241022'
  name: string;                      // Display name
  providerId: string;                // Foreign key to LLMProvider
  
  // Token limits
  contextLength: number;             // Input context window
  maxOutputTokens: number;           // Max output tokens
  
  // Modalities
  inputModalities: ('text' | 'image' | 'audio')[];
  outputModalities: ('text' | 'image' | 'audio')[];
  
  // Capabilities
  supportsTools: boolean;
  supportsStreaming: boolean;
  
  // Pricing (optional)
  pricing?: {
    promptPer1M: number;
    completionPer1M: number;
  };
  
  // State
  isEnabled: boolean;
  isFree: boolean;
}
```

### 1.2.2 Agent Entity

```typescript
/**
 * IMMUTABLE CONTRACT: Agent
 * Agents are the primary entity for AI interactions across workspaces.
 */
interface Agent {
  // Core identity
  id: string;                        // 'agt_{timestamp}_{random}'
  name: string;                      // User-defined display name
  description: string;
  
  // Provider + Model reference (CRITICAL LINKAGE)
  providerId: string;                // Foreign key to LLMProvider
  modelId: string;                   // Foreign key to ProviderModel
  
  // LLM Parameters
  systemPrompt: string;
  temperature: number;               // 0.0-2.0
  maxTokens: number;
  topP: number;                      // 0.0-1.0
  topK?: number;                     // Optional (for Gemini/local)
  frequencyPenalty?: number;
  presencePenalty?: number;
  
  // Tool Configuration (CONDITIONAL PER WORKSPACE)
  tools: AgentToolBinding[];
  
  // Workspace Bindings (WHERE THIS AGENT IS AVAILABLE)
  workspaceBindings: WorkspaceBinding[];
  
  // Status
  status: 'online' | 'offline' | 'busy' | 'error';
  
  // Metrics
  tasksCompleted: number;
  successRate: number;
  tokensUsed: number;
  lastActive: Date;
  createdAt: Date;
}

/**
 * Tool binding with workspace-conditional permissions
 */
interface AgentToolBinding {
  toolId: string;                    // e.g., 'file-read', 'web-search', 'rag-query'
  isEnabled: boolean;
  
  // Conditional permissions per workspace
  workspacePermissions: {
    ide: boolean;
    knowledge: boolean;
    study: boolean;
    notes: boolean;
  };
  
  configuration?: Record<string, unknown>;
}

/**
 * Workspace binding configuration
 */
interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;                // Default agent for this workspace
}
```

### 1.2.3 Conversation & Thread Entities

```typescript
/**
 * IMMUTABLE CONTRACT: Conversation
 * Unified conversation model for ALL workspaces
 */
interface Conversation {
  id: string;
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  projectId?: string;                // For IDE workspace
  
  // Agent reference
  agentId: string;
  
  // Thread structure
  title: string;
  messages: Message[];
  threads: Thread[];                 // Branched conversations
  
  // Context management
  context: ConversationContext;
  
  // Metadata
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  
  // Content (multimodal)
  content: {
    type: 'text' | 'code' | 'image' | 'file';
    value: string;
    language?: string;               // For code blocks
    mimeType?: string;               // For files/images
  }[];
  
  // Tool interactions
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  
  // Streaming state
  status: 'pending' | 'streaming' | 'complete' | 'error';
  
  // Metadata
  tokensUsed?: number;
  latencyMs?: number;
  timestamp: Date;
}

interface Thread {
  id: string;
  parentConversationId: string;
  branchFromMessageId: string;
  name: string;
  messages: Message[];
  isArchived: boolean;
  createdAt: Date;
}

interface ConversationContext {
  // Context window management
  tokenBudget: number;               // Max tokens for context
  usedTokens: number;
  
  // Summarization
  summaries: ContextSummary[];       // Compressed older messages
  
  // Attached resources
  attachedFiles: string[];
  attachedDocuments: string[];       // For knowledge workspace
  ragSources: string[];              // Active RAG sources
}
```

---

## 1.3 Data Flow Specifications (MUST BE FOLLOWED)

### Flow 1: Provider Configuration → Model Loading

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Enter API Key for Provider                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. ProviderConfigDialog                                        │
│    - Validate key format                                        │
│    - Store key in CredentialVault (encrypted)                  │
│    - Call setApiKey(providerId, apiKey) on provider-models-store│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. provider-models-store.setApiKey()                           │
│    - Persist key encrypted via credentialVault                 │
│    - Update provider state { hasApiKey: true }                 │
│    - EMIT EVENT: 'provider:key-set' { providerId }             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Event Bus Listener                                          │
│    - On 'provider:key-set': call fetchModels(providerId)       │
│    - Fetch models from provider API                            │
│    - Parse response, normalize to ProviderModel[]              │
│    - Store models in provider-models-store                     │
│    - EMIT EVENT: 'provider:models-loaded' { providerId, count }│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. ALL UI COMPONENTS (reactive)                                │
│    - AgentSelector updates available models for provider        │
│    - AgentConfigDialog shows models in dropdown                 │
│    - Anywhere else that needs models                            │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Agent Selection → Chat Initialization

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Select Agent in AgentSelector                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. AgentSelector.handleAgentSelect(agent)                      │
│    - Update agents-store.activeAgentId                         │
│    - EMIT EVENT: 'agent:selected' { agentId, workspaceType }   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ChatPanel (subscribed to agents-store)                      │
│    - Receive activeAgentId update                              │
│    - Fetch agent config from agents-store                      │
│    - Fetch provider/model from provider-models-store           │
│    - Initialize chat client with correct provider adapter       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. ALL WORKSPACES (reactive via event bus)                     │
│    - IDE, Knowledge, Study, Notes all update agent indicator   │
│    - Cross-workspace synchronization complete                   │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 3: Conversation Message → Agent Response

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Send Message                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. ChatInput.handleSubmit()                                    │
│    - Create Message entity                                      │
│    - Persist to conversation-store                             │
│    - Trigger send to LLM                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. ChatService.sendMessage()                                   │
│    - Get active agent from agents-store                        │
│    - Get provider adapter (OpenAI, Anthropic, etc.)            │
│    - Build request with context from ConversationContext       │
│    - Include tools if agent has enabled tools for workspace    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. ProviderAdapter.streamChat()                                 │
│    - Stream tokens to UI                                        │
│    - Handle tool calls if present                              │
│    - Execute tool calls → return results                       │
│    - Continue streaming until complete                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Message Complete                                            │
│    - Update message status: 'complete'                         │
│    - Persist to Dexie                                          │
│    - Update conversation metadata                               │
└─────────────────────────────────────────────────────────────────┘
```

---

# PART 2: IMPLEMENTATION STORIES

## Story AC-01: Provider Configuration Foundation

**Priority:** P0 (TODAY)  
**Scope:** LLM Provider configuration with correct data flow

### Acceptance Criteria

1. **Built-in providers have READONLY base URLs**
   - OpenRouter, Anthropic, Gemini, OpenAI endpoints are not editable
   - UI shows lock icon and greyed out field

2. **Custom provider creation works**
   - Only for OpenAI-compatible endpoints
   - User enters: Name (required), BaseURL (required), Headers (optional)
   - API Key optional

3. **API Key saves → Models auto-load**
   - Key saved to CredentialVault (encrypted)
   - Models fetched from provider API
   - Models appear in UI immediately

4. **Reactivity across workspaces**
   - Change in settings → ALL workspaces see update
   - Event bus used for cross-component sync

### Implementation Files

- `src/components/agent/ProviderConfigDialog.tsx` ✅ DONE
- `src/stores/provider-models-store.ts` (needs setApiKey action)
- `src/lib/events/store-events.ts` (event definitions)

---

## Story AC-02: Agent Configuration Vault

**Priority:** P0 (TODAY)  
**Scope:** Central agent store with proper provider/model linkage

### Acceptance Criteria

1. **Agents reference provider + model correctly**
   - Agent has `providerId` and `modelId` fields
   - Validation: model must belong to provider

2. **Tool binding with workspace conditions**
   - Each tool can be enabled/disabled per agent
   - Permissions check workspace type

3. **AgentSelector uses real agents store**
   - No mock data ✅ DONE
   - Selects from `useAgentsStore`

4. **CRUD operations work**
   - Create, Read, Update, Delete agents
   - All changes persist to IndexedDB
   - All changes reactive

### Implementation Files

- `src/stores/agents-store.ts` ✅ EXISTS (needs tool binding)
- `src/components/chat/AgentSelector.tsx` ✅ DONE
- `src/components/agent/AgentConfigDialog.tsx` (needs update)

---

## Story AC-03: Chat Panel Cross-Workspace

**Priority:** P1 (Today, after AC-01/02)  
**Scope:** Unified chat panel for all workspaces

### Acceptance Criteria

1. **Same ChatPanel component in all workspaces**
   - IDE, Knowledge, Study, Notes use same base component
   - Variant props for UI differences

2. **Conversation persistence**
   - Messages saved to IndexedDB
   - Conversation tied to workspace + agent

3. **Context management**
   - Token counting
   - Auto-summarization when needed

---

## Story AC-04: Brownfield Integration

**Priority:** P2 (After showcase)  
**Scope:** Connect Project/FileTree to Knowledge Synthesis

### Acceptance Criteria

1. **Projects can sync to Knowledge workspace**
   - FileTree files accessible for RAG
   - Documents indexable

2. **Monaco Editor option in Notes**
   - Toggle between new editor and Monaco
   - Same file, different render

---

# PART 3: STORE REORGANIZATION

## Target Store Structure

```
src/stores/
├── core/                           # Foundation stores
│   ├── provider-store.ts          # LLM Provider CRUD
│   ├── provider-models-store.ts   # Model loading + selection
│   └── credential-store.ts        # API key management (encrypted)
├── agent/                          # Agent management
│   ├── agents-store.ts            # Agent CRUD + active selection
│   └── tools-store.ts             # Tool definitions + permissions
├── conversation/                   # Chat management
│   ├── conversation-store.ts      # Conversation CRUD
│   ├── message-store.ts           # Message handling
│   └── thread-store.ts            # Thread/branching
├── workspace/                      # Workspace-specific
│   ├── ide-store.ts               # IDE state
│   ├── knowledge-store.ts         # Knowledge synthesis state
│   ├── study-store.ts             # Study state
│   └── notes-store.ts             # Notes state
└── sync/                          # Synchronization
    ├── file-sync-store.ts         # File system sync
    └── event-bus.ts               # Cross-store events
```

---

# PART 4: VALIDATION GATES

## Phase 0 Gate (Showcase - TODAY)

| Check | Method | Expected Result |
|-------|--------|-----------------|
| Provider key → models load | Enter key in UI | Models appear in selector |
| Agent selector in workspaces | Navigate to each | Agent dropdown visible |
| Agent selection persists | Select → navigate → return | Same agent selected |
| Chat works with agent | Send message | Response received |

## Phase 1 Gate (Foundation - Jan 1-3)

| Check | Method | Expected Result |
|-------|--------|-----------------|
| Store reorganization complete | File structure | Matches target |
| Event bus working | Provider key set | Event emitted |
| No circular imports | `madge --circular` | 0 issues |

## Phase 2 Gate (Full Scope - Jan 4-10)

| Check | Method | Expected Result |
|-------|--------|-----------------|
| All files < 300 lines | Automated scan | 100% pass |
| Test coverage > 80% | `pnpm test --coverage` | Pass |
| 3-device test | Manual | All pass |

---

**Document Corrected:** 2025-12-31T10:50:00+07:00  
**Revision:** 2.0 - ARCHITECTURAL FOUNDATION REWRITE  
**Status:** READY FOR EXECUTION
