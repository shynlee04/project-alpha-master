# Project Alpha v2.0 - Complete System Architecture Reference

**Document ID:** SYS-ARCH-001
**Version:** 1.0.0
**Last Updated:** 2026-01-01
**Status:** Active - Single Source of Truth
**Repository:** Via-Gent (Project Alpha v2.0)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Four-Layer Architecture](#3-four-layer-architecture)
4. [LLM Provider Key Vault Persistence](#4-llm-provider-key-vault-persistence)
5. [AI Agents Configuration](#5-ai-agents-configuration)
6. [Tools Use Permissions](#6-tools-use-permissions)
7. [Chat Flow and Thread Management](#7-chat-flow-and-thread-management)
8. [File System Synchronization](#8-file-system-synchronization)
9. [State Management Architecture](#9-state-management-architecture)
10. [Cross-Workspace Event System](#10-cross-workspace-event-system)
11. [Component Inventory](#11-component-inventory)
12. [Integration Matrix](#12-integration-matrix)
13. [API Reference](#13-api-reference)
14. [Deployment Configuration](#14-deployment-configuration)
15. [Performance Targets](#15-performance-targets)
16. [Security Architecture](#16-security-architecture)

---

## 1. Executive Summary

### 1.1 Product Vision

**Project Alpha v2.0 - Knowledge Synthesis Station** is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. The project is evolving toward a local-first platform that merges Google NotebookLM-style AI synthesis with Notion-like knowledge organization.

### 1.2 Dual Mandate

This architecture addresses a **dual development mandate**:

**Phase 1: Core Stabilization** (Current Focus)
- Fix hot-reload visibility bugs in agent configuration
- Unify state management (Zustand + Dexie)
- Implement mobile-first responsive layouts
- Resolve WebContainer sync race conditions
- Stabilize chat cascade system

**Phase 2: Knowledge Synthesis MVP** (Future)
- RAG infrastructure with Orama WASM vector store
- Source ingestion (PDF, URL, YouTube, audio)
- Knowledge canvas with React Flow
- Study artifact generation (flashcards, quizzes, audio overview)

### 1.3 Technical Stack

**Core Framework:**
- TanStack Start 1.x (Hybrid SSR)
- TanStack Router 1.143.3 (File-based routing)
- TanStack AI 0.2.0 (Agent streaming)
- React 19.x with TypeScript 5.x

**State & Persistence:**
- Zustand 5.0.9 (State management)
- Dexie.js 4.2.1 (IndexedDB abstraction)

**UI & Styling:**
- Tailwind CSS 4.x
- Radix UI 1.x
- Lucide React (Icons)

**IDE Components:**
- Monaco Editor 0.55.1
- xterm.js (Terminal)
- @webcontainer/api 1.6.1

### 1.4 Codebase Statistics

- **Total Files:** 4,094
- **Total Lines:** 172,582
- **TypeScript Files:** 908
- **God Classes (>300 lines):** 135 files
- **Critical God Classes (>600 lines):** 23 files

---

## 2. System Overview

### 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                            │
│  (React Components - UI/UX)                                     │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │   IDE UI    │ │  Notes UI   │ │ Knowledge UI│ │  Study UI   │ │
│ │ (Monaco,    │ │ (Markdown,  │ │ (RAG,       │ │ (Flashcards,│ │
│ │  Terminal)  │ │  Blocks)    │ │  Canvas)    │ │  Quizzes)   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  (Services, Use Cases, Hooks)                                   │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Agent Chat  │ │ File Sync   │ │ RAG Query   │ │ Study       │ │
│ │ Hook        │ │ Manager     │ │ Engine      │ │ Generator   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                                 │
│  (Business Entities, Rules, Value Objects)                      │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Agent       │ │ Provider    │ │ Tool        │ │ Workspace   │ │
│ │ Entity      │ │ Entity      │ │ Permission  │ │ Entity      │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                           │
│  (Persistence, Events, External Services)                       │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ IndexedDB   │ │ Cross-WS    │ │ WebContainer│ │ File System │ │
│ │ (Dexie)     │ │ Event Bus   │ │ API         │ │ Access API  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Workspace Architecture

**Four Workspace Types:**

```typescript
type WorkspaceType = 'ide' | 'notes' | 'knowledge' | 'study';
```

| Workspace | Purpose | Features |
|-----------|---------|----------|
| **IDE** | Code development | Monaco editor, terminal, WebContainer, file tree |
| **Notes** | Document editing | Markdown editor, block-based editing, tags |
| **Knowledge** | RAG synthesis | Vector store, source ingestion, citations |
| **Study** | Learning aids | Flashcards, quizzes, audio overview |

### 2.3 Key Architectural Principles

1. **Local-First Privacy** - 100% browser-based, offline-capable
2. **Workspace Isolation** - Each workspace has independent state
3. **Cross-Workspace Events** - Event bus broadcasts state changes
4. **Reactive State** - Zustand stores with Dexie persistence
5. **Security by Default** - AES-256-GCM encryption for API keys

---

## 3. Four-Layer Architecture

### 3.1 Layer Definitions

#### Layer 1: Infrastructure Layer

**Location:** `/src/infrastructure/`

**Responsibilities:**
- Database persistence (IndexedDB via Dexie)
- Event emission (cross-workspace event bus)
- External service integration (WebContainer API, File System Access API)
- Framework adapters (Zustand persistence middleware)

**Key Components:**
```typescript
// Database
- infrastructure/persistence/dexie-db.ts (1061 lines)
- infrastructure/persistence/dexie-db-migrations.ts (541 lines)

// Stores (NEW - consolidating legacy stores)
- infrastructure/persistence/stores/agents/
- infrastructure/persistence/stores/conversation/
- infrastructure/persistence/stores/providers/
- infrastructure/persistence/stores/rag/
- infrastructure/persistence/stores/canvas/
- infrastructure/persistence/stores/knowledge/

// Events
- infrastructure/events/cross-workspace-event-bus.ts (445 lines)
- lib/events/workspace-events.ts

// External Services
- lib/webcontainer/manager.ts (WebContainer lifecycle)
- lib/filesystem/local-fs-adapter.ts (File System Access API)
```

#### Layer 2: Domain Layer

**Location:** `/src/core/`, `/src/domain/`

**Responsibilities:**
- Business entities (Agent, Provider, Tool, Workspace)
- Value objects (WorkspaceType, PermissionLevel)
- Business rules (validation, invariants)
- Domain services (orchestration)

**Key Components:**
```typescript
// Core Entities
- core/entities/Agent.ts (Agent interface with workspace bindings)
- core/entities/Provider.ts (Provider configuration)
- core/entities/Tool.ts (Tool definitions)
- core/entities/Workspace.ts (Workspace context)

// Domain Services
- domain/services/AgentProviderValidator.ts (Provider-model validation)
- domain/services/ToolPermissionManager.ts (Permission checks)

// Value Objects
- domain/value-objects/workspace-type.ts
- domain/value-objects/permission-level.ts
```

#### Layer 3: Application Layer

**Location:** `/src/application/`, `/src/lib/agent/`, `/src/lib/state/`

**Responsibilities:**
- Use case orchestration
- Service coordination
- State management (Zustand stores)
- Business logic execution

**Key Components:**
```typescript
// Agent Services
- lib/agent/hooks/use-agent-chat-with-tools.ts (517 lines)
- lib/agent/factory.ts (612 lines)
- lib/agent/providers/ (Provider adapters)
- lib/agent/tools/ (Tool implementations)

// State Management (Active - 19 stores)
- lib/state/ide-store.ts (IDE layout, panels, open files)
- lib/state/rag-store.ts (877 lines - RAG queries, caching)
- lib/state/knowledge-store.ts (718 lines - Knowledge sources)
- lib/state/conversation-store.ts (626 lines - Chat history)
- lib/state/provider-store.ts (152 lines - LLM providers)
- lib/state/tool-permission-store.ts (NEW - tool trust levels)

// Application Services
- application/services/sync-service.ts
- application/use-cases/agent-chat-use-case.ts
```

#### Layer 4: Presentation Layer

**Location:** `/src/presentation/components/` (NEW), `/src/components/` (LEGACY)

**Responsibilities:**
- UI rendering
- User interactions
- Visual feedback
- Accessibility

**Key Components:**
```typescript
// Agent UI
- presentation/components/agent/AgentConfigDialog.tsx (370 lines)
- presentation/components/agent/WorkspacePermissionEditor.tsx (370 lines)
- presentation/components/agent/ApprovalOverlay.tsx (443 lines)

// IDE UI
- presentation/components/ide/AgentChatPanel.tsx (316 lines)
- presentation/components/ide/FileTree.tsx
- presentation/components/ide/TerminalPanel.tsx

// Workspace UI
- presentation/components/workspace/WorkspaceEnhancedSwitcher.tsx (395 lines)
- presentation/components/workspace/WorkspaceBindingDialog.tsx (312 lines)

// Reusable UI Components
- presentation/components/ui/Button.tsx
- presentation/components/ui/Dialog.tsx
- presentation/components/ui/Input.tsx
```

### 3.2 Layer Communication Rules

**Upward (Bottom → Top):**
1. **Infrastructure → Domain:** Data access, event emission
2. **Domain → Application:** Business rules, validation results
3. **Application → Presentation:** State updates, use case results

**Downward (Top → Bottom):**
1. **Presentation → Application:** User actions, events
2. **Application → Domain:** Use case requests
3. **Domain → Infrastructure:** Data persistence, event publishing

**Cross-Cutting:**
- **Event Bus:** Broadcasts events across all layers
- **State Stores:** Reactive state accessible from any layer

---

## 4. LLM Provider Key Vault Persistence

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Credential Vault                            │
│                   (Public API Facade)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ Credential       │    │ Credential       │                  │
│  │ Storage          │    │ Encryption       │                  │
│  │ (IndexedDB ops)  │    │ (AES-256-GCM)    │                  │
│  └──────────────────┘    └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      localStorage                                │
│  - vg_ek_v3 (encrypted key)                                     │
│  - vg_salt_v3 (salt for PBKDF2)                                 │
│  - vg_kv_v3 (key version)                                       │
│  - vg_vp_v3 (vault password hash)                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      IndexedDB                                  │
│  Table: credentials                                             │
│  - providerId (primary key)                                     │
│  - encryptedApiKey (AES-256-GCM ciphertext)                     │
│  - iv (initialization vector)                                   │
│  - timestamp (last updated)                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Provider Schema

**Hardcoded Base Endpoints:**

```typescript
// src/lib/agent/providers/model-registry.ts
export const BASE_ENDPOINTS: Record<ProviderId, string> = {
  'openrouter': 'https://openrouter.ai/api/v1',
  'anthropic': 'https://api.anthropic.com/v1',
  'google': 'https://generativelanguage.googleapis.com/v1beta',
  'openai': 'https://api.openai.com/v1',
  'deepseek': 'https://api.deepseek.com/v1',
};

// Provider interface
interface Provider {
  id: ProviderId;
  name: string;
  baseUrl: string;
  requiresApiKey: boolean;
  models: ModelInfo[];
}

// Model registry (50+ models)
interface ModelInfo {
  id: string;              // e.g., 'mistralai/devstral-2512:free'
  name: string;            // e.g., 'Devstral 2512 (Free)'
  providerId: ProviderId;
  contextWindow: number;   // e.g., 32768
  pricing?: {
    prompt: number;        // per 1M tokens
    completion: number;    // per 1M tokens
  };
  tier: 'free' | 'paid' | 'enterprise';
}
```

### 4.3 Credential Vault Security

**Encryption Flow:**

```typescript
// 1. Vault Initialization
const vault = new CredentialVault();
await vault.initialize(); // Derive or load master key

// 2. Password Derivation (PBKDF2-SHA256, 100,000 iterations)
const encryptionKey = await crypto.subtle.deriveKey(
  {
    name: 'PBKDF2',
    salt: saltBuffer,
    iterations: 100000,
    hash: 'SHA-256',
  },
  passwordKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);

// 3. Master Key Encryption (AES-256-GCM)
const encryptedMasterKey = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv: ivBuffer },
  encryptionKey,
  masterKeyBuffer
);

// 4. Store in localStorage (base64 encoded)
localStorage.setItem('vg_ek_v3', btoa(String.fromCharCode(...new Uint8Array(encryptedMasterKey))));
```

**Storage Key Obfuscation:**
- `vg_ek_v3` → Encrypted master key
- `vg_salt_v3` → Salt for PBKDF2
- `vg_kv_v3` → Key version (must be '3')
- `vg_vp_v3` → Vault password hash

### 4.4 Persistence Layer

**Dexie Storage Adapter:**

```typescript
// src/lib/state/dexie-storage.ts
export function createDexieStorage<T>(dbName: string, tableName: string) {
  return {
    getItem: (name: string) => {
      return db.table(tableName).get(name);
    },
    setItem: (name: string, value: T) => {
      return db.table(tableName).put(value, name);
    },
    removeItem: (name: string) => {
      return db.table(tableName).delete(name);
    },
  };
}
```

**Zustand Persist Middleware:**

```typescript
// src/lib/state/provider-store.ts
export const useProviderStore = create<ProviderState>()(
  persist(
    (set, get) => ({
      providers: [],
      activeProviderId: null,
      _hasHydrated: false,
      // ... CRUD operations
    }),
    {
      name: 'provider-storage',
      storage: createDexieStorage('via-gent-db', 'providers'),
      partialize: (state) => ({
        providers: state.providers,
        activeProviderId: state.activeProviderId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

### 4.5 Reactive State Management

**Cross-Workspace Propagation:**

```typescript
// 1. User updates provider config
useProviderStore.getState().updateProvider('openrouter', {
  apiKey: 'sk-...'
});

// 2. Store persists to IndexedDB
// 3. Store emits ProviderConfigChangeEvent
crossWorkspaceEventBus.emitProviderConfigChange({
  workspaceId: 'ide',
  providerId: 'openrouter',
  changeType: 'credentials_updated',
  timestamp: new Date(),
});

// 4. All workspaces reactively update
crossWorkspaceEventBus.onProviderConfigChange((event) => {
  console.log('Provider config changed in workspace:', event.workspaceId);
  // Refresh provider models, revalidate credentials, etc.
});
```

### 4.6 Hot-Reload Visibility Bug (FIXED)

**Problem:** `AgentConfigDialog` used `useState` instead of Zustand, causing config changes to be invisible until navigation.

**Solution:** Migrate to Zustand store with Dexie persistence.

**Before (Broken):**
```typescript
function AgentConfigDialog() {
  const [agent, setAgent] = useState(agentConfig); // ❌ Local state
  const updateAgent = () => {
    setAgent({ ...agent, temperature: 0.8 });
    // UI updates, but other components don't see change
  };
}
```

**After (Fixed):**
```typescript
function AgentConfigDialog() {
  const { agents, updateAgent } = useAgentsStore(); // ✅ Zustand store
  const handleUpdate = () => {
    updateAgent(agentId, { temperature: 0.8 });
    // Store persists to IndexedDB, emits event, all components update reactively
  };
}
```

### 4.7 Custom Provider Addition Protocol

**Adding a New Provider:**

```typescript
// 1. Add to model-registry.ts
export const PROVIDER_REGISTRY: ProviderRegistry = {
  'my-custom-provider': {
    id: 'my-custom-provider',
    name: 'My Custom Provider',
    baseUrl: 'https://api.my-provider.com/v1',
    requiresApiKey: true,
    models: [
      {
        id: 'my-model',
        name: 'My Model',
        providerId: 'my-custom-provider',
        contextWindow: 8192,
      },
    ],
  },
};

// 2. Create provider adapter (if needed)
class MyCustomProviderAdapter extends BaseProviderAdapter {
  async chat(messages: Message[], options: ChatOptions): Promise<AsyncIterable<ChatChunk>> {
    // Custom implementation
  }
}

// 3. Register in factory
providerAdapterFactory.registerAdapter('my-custom-provider', MyCustomProviderAdapter);

// 4. User adds API key via AgentConfigDialog
credentialVault.setCredential('my-custom-provider', 'sk-...');

// 5. Provider available in all workspaces
```

### 4.8 Integration Points

**Components Consuming Provider State:**

1. **AgentConfigDialog** (`presentation/components/agent/AgentConfigDialog.tsx`)
   - CRUD operations on providers
   - API key management
   - Model selection

2. **useAgentsStore** (`stores/agents-store.ts`)
   - Validates provider-model combinations
   - References available models from `useProviderStore`

3. **ProviderAdapter** (`lib/agent/providers/provider-adapter.ts`)
   - Runtime credential access via `credentialVault.getCredential()`
   - API key injection into requests

4. **AgentFactory** (`lib/agent/factory.ts`)
   - Creates agents with provider-specific adapters
   - Passes API keys from credential vault

5. **Chat API** (`routes/api/chat.ts`)
   - Validates provider credentials
   - Routes requests to provider endpoints

---

## 5. AI Agents Configuration

### 5.1 Centralized Vault Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   useAgentsStore (Zustand)                      │
│                (Single Source of Truth)                         │
├─────────────────────────────────────────────────────────────────┤
│  State:                                                        │
│  - agents: Agent[]                                             │
│  - activeAgentId: string | null                                │
│  - _hasHydrated: boolean                                       │
├─────────────────────────────────────────────────────────────────┤
│  CRUD Operations:                                              │
│  - addAgent(agent) → Agent                                     │
│  - removeAgent(id) → void                                      │
│  - updateAgent(id, updates) → void                             │
│  - getAgent(id) → Agent | undefined                            │
├─────────────────────────────────────────────────────────────────┤
│  Workspace Filtering (Ralph Loop Gap Resolution):              │
│  - getAgentsForWorkspace(workspaceType) → Agent[]              │
│  - updateWorkspaceBinding(agentId, workspaceType, isAvailable) │
│  - isAgentAvailableInWorkspace(agentId, workspaceType) → bool  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   IndexedDB (Dexie)                             │
│  Table: agents                                                  │
│  - id (primary key)                                            │
│  - name, description                                           │
│  - providerId, modelId (foreign keys)                          │
│  - systemPrompt, temperature, maxTokens, topP                  │
│  - tools: Tool[]                                               │
│  - workspaceBindings: WorkspaceBinding[]                       │
│  - status, tasksCompleted, successRate, tokensUsed             │
│  - lastActive, createdAt (ISO timestamps)                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│            Cross-Workspace Event Bus                            │
│  - emitAgentConfigChange(event) → Broadcasts to all workspaces  │
│  - onAgentConfigChange(callback) → Subscribes to changes       │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Configuration Schema

**Agent Entity:**

```typescript
// src/core/entities/Agent.ts
interface Agent {
  // Identity
  id: string;                    // Unique ID (agt_*)
  name: string;                  // Display name
  description: string;           // What this agent does

  // Provider + Model references (foreign keys)
  providerId: ProviderId;        // 'openrouter', 'anthropic', etc.
  modelId: string;               // 'mistralai/devstral-2512:free', etc.

  // LLM Parameters
  systemPrompt: string;          // Base system instruction
  temperature: number;           // 0.0 - 2.0 (default: 0.7)
  maxTokens: number;             // Max response tokens (default: 4096)
  topP: number;                  // Nucleus sampling (default: 1.0)

  // Configuration
  tools: Tool[];                 // Available tools
  workspaceBindings: WorkspaceBinding[];  // Where agent is available

  // Metadata
  status: 'online' | 'offline' | 'busy';
  tasksCompleted: number;
  successRate: number;           // 0.0 - 1.0
  tokensUsed: number;
  lastActive: string;            // ISO timestamp
  createdAt: string;             // ISO timestamp
}
```

**Workspace Binding System:**

```typescript
interface WorkspaceBinding {
  workspaceType: WorkspaceType;   // 'ide' | 'notes' | 'knowledge' | 'study'
  isAvailable: boolean;           // Whether agent can be used in workspace
  enabledTools: Tool[];           // Tools available in this workspace
}

// Example: Agent available in IDE and Knowledge, but NOT in Notes
{
  workspaceType: 'ide',
  isAvailable: true,
  enabledTools: ['read_file', 'write_file', 'execute_command', 'search_knowledge'],
}

{
  workspaceType: 'knowledge',
  isAvailable: true,
  enabledTools: ['search_knowledge', 'create_flashcard', 'generate_quiz'],
}

{
  workspaceType: 'notes',
  isAvailable: false,  // Agent not available in Notes workspace
  enabledTools: [],
}
```

### 5.3 Workspace-Specific Tool Bindings

**Tool Availability Matrix:**

| Tool | IDE | Notes | Knowledge | Study |
|------|-----|-------|-----------|-------|
| read_file | ✅ | ✅ | ✅ | ❌ |
| write_file | ✅ | ❌ | ❌ | ❌ |
| list_files | ✅ | ✅ | ✅ | ❌ |
| execute_command | ✅ | ❌ | ❌ | ❌ |
| search_knowledge | ✅ | ❌ | ✅ | ✅ |
| create_flashcard | ❌ | ❌ | ✅ | ✅ |
| generate_quiz | ❌ | ❌ | ✅ | ✅ |

**Tool Filtering Logic:**

```typescript
// src/lib/agent/workspace-tool-filter.ts
export function filterToolsForWorkspace(
  tools: Tool[],
  workspaceType: WorkspaceType
): Tool[] {
  const workspaceTools = {
    'ide': ['read_file', 'write_file', 'list_files', 'execute_command', 'search_knowledge'],
    'notes': ['read_file', 'list_files'],
    'knowledge': ['read_file', 'list_files', 'search_knowledge', 'create_flashcard', 'generate_quiz'],
    'study': ['search_knowledge', 'create_flashcard', 'generate_quiz'],
  };

  const allowedTools = workspaceTools[workspaceType] || [];
  return tools.filter(tool => allowedTools.includes(tool.id));
}
```

### 5.4 Active Agent Management

**Active Agent Selection:**

```typescript
// 1. Get available agents for current workspace
const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
const availableAgents = useAgentsStore.getState()
  .getAgentsForWorkspace(currentWorkspace);

// 2. Select active agent
const activeAgentId = useAgentsStore.getState().activeAgentId;
const activeAgent = availableAgents.find(a => a.id === activeAgentId);

// 3. Use agent in chat
const { sendMessage, toolCalls } = useAgentChatWithTools({
  providerId: activeAgent.providerId,
  modelId: activeAgent.modelId,
  systemMessage: activeAgent.systemPrompt,
  temperature: activeAgent.temperature,
  maxTokens: activeAgent.maxTokens,
  tools: activeAgent.tools,
});
```

### 5.5 Cross-Workspace Availability Rules

**Agent Visibility Logic:**

```typescript
// src/stores/agents-store.ts
getAgentsForWorkspace(workspaceType: WorkspaceType): Agent[] {
  return this.agents.filter(agent => {
    const binding = agent.workspaceBindings.find(
      b => b.workspaceType === workspaceType
    );
    return binding?.isAvailable ?? false;
  });
}

isAgentAvailableInWorkspace(agentId: string, workspaceType: WorkspaceType): boolean {
  const agent = this.getAgent(agentId);
  if (!agent) return false;

  const binding = agent.workspaceBindings.find(
    b => b.workspaceType === workspaceType
  );
  return binding?.isAvailable ?? false;
}
```

**UI Integration:**

```typescript
// Agent selector filters by workspace
function AgentSelector({ workspaceType }: { workspaceType: WorkspaceType }) {
  const { agents, activeAgentId, setActiveAgent } = useAgentsStore();

  const availableAgents = agents.filter(agent =>
    agent.workspaceBindings.some(
      binding => binding.workspaceType === workspaceType && binding.isAvailable
    )
  );

  return (
    <Select value={activeAgentId} onValueChange={setActiveAgent}>
      {availableAgents.map(agent => (
        <SelectItem key={agent.id} value={agent.id}>
          {agent.name}
        </SelectItem>
      ))}
    </Select>
  );
}
```

### 5.6 Integration Points

**Agent Configuration UI:**

1. **AgentConfigDialog** (`presentation/components/agent/AgentConfigDialog.tsx`)
   - Create/edit/delete agents
   - Provider-model selection (with validation)
   - Tool assignment
   - Workspace binding configuration

2. **WorkspacePermissionEditor** (`presentation/components/agent/WorkspacePermissionEditor.tsx`)
   - Configure workspace-specific availability
   - Enable/disable tools per workspace
   - Visual permission matrix

3. **ToolAvailabilityIndicator** (`presentation/components/agent/ToolAvailabilityIndicator.tsx`)
   - Shows which tools are available in current workspace
   - Risk level indicators (low/medium/high)

**Chat Integration:**

4. **AgentChatPanel** (`presentation/components/ide/AgentChatPanel.tsx`)
   - Agent selector dropdown
   - Workspace-filtered agent list
   - Active agent status display

5. **useAgentChatWithTools** (`lib/agent/hooks/use-agent-chat-with-tools.ts`)
   - Uses active agent configuration
   - Filters tools by workspace
   - Passes agent parameters to LLM

**Workspace Detection:**

6. **useWorkspaceStore** (`lib/state/workspace-store.ts`)
   - Tracks current workspace context
   - Auto-filters agents on workspace switch

7. **crossWorkspaceEventBus** (`lib/events/cross-workspace-event-bus.ts`)
   - Emits `AgentConfigChangeEvent` on agent updates
   - All workspaces refresh agent lists

---

## 6. Tools Use Permissions

### 6.1 Permission System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│            ToolPermissionManager (Facade)                       │
│       (Singleton - Backwards Compatibility)                     │
├─────────────────────────────────────────────────────────────────┤
│  Public API:                                                   │
│  - getTrustLevel(toolId) → ToolTrustLevel                      │
│  - setTrustLevel(toolId, level) → void                         │
│  - checkPermission(toolId) → PermissionCheckResult             │
│  - hasSessionTrust(toolId) → boolean                           │
│  - grantSessionTrust(toolId) → void                            │
│  - revokeSessionTrust(toolId) → void                           │
│  - clearSessionTrust() → void                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           useToolPermissionStore (Zustand)                      │
│              (State + Persistence)                              │
├─────────────────────────────────────────────────────────────────┤
│  State:                                                        │
│  - trustLevels: Record<string, ToolTrustLevel>  (Persisted)    │
│  - sessionTrust: string[]  (Ephemeral - cleared on reload)     │
│  - _hasHydrated: boolean                                       │
├─────────────────────────────────────────────────────────────────┤
│  Persistence:                                                  │
│  - Dexie IndexedDB (trustLevels survive browser restart)       │
│  - In-memory only (sessionTrust cleared on reload)             │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Permission Schema

**Trust Levels:**

```typescript
type ToolTrustLevel = 'auto' | 'prompt' | 'block';

interface PermissionCheckResult {
  needsApproval: boolean;    // User must approve before execution
  canExecute: boolean;       // Tool can run (false if blocked)
  reason: 'auto' | 'prompt' | 'block' | 'session';
  toolName: string;
  toolId: string;
}
```

**Permission Levels:**

| Level | Description | Example Tools |
|-------|-------------|---------------|
| `auto` | Execute immediately without approval | `list_files`, `search_knowledge` |
| `prompt` | Require user approval (medium risk) | `read_file`, `create_flashcard` |
| `block` | Never execute (high risk/dangerous) | `write_file`, `execute_command` |

**Default Trust Levels:**

```typescript
const DEFAULT_TRUST_LEVELS: Record<string, ToolTrustLevel> = {
  // File operations
  'read_file': 'prompt',
  'write_file': 'block',
  'list_files': 'auto',
  'delete_file': 'block',

  // Terminal operations
  'execute_command': 'block',

  // RAG operations
  'search_knowledge': 'auto',

  // Study operations
  'create_flashcard': 'prompt',
  'generate_quiz': 'prompt',
};
```

### 6.3 Permission Check Flow

**Permission Decision Tree:**

```typescript
function checkPermission(toolId: string): PermissionCheckResult {
  // 1. Check if tool is blocked
  if (trustLevel === 'block') {
    return {
      needsApproval: false,
      canExecute: false,
      reason: 'block',
      toolId,
      toolName: getToolName(toolId),
    };
  }

  // 2. Check if tool has session trust (ephemeral)
  if (sessionTrust.includes(toolId)) {
    return {
      needsApproval: false,
      canExecute: true,
      reason: 'session',
      toolId,
      toolName: getToolName(toolId),
    };
  }

  // 3. Check if tool is auto-approved
  if (trustLevel === 'auto') {
    return {
      needsApproval: false,
      canExecute: true,
      reason: 'auto',
      toolId,
      toolName: getToolName(toolId),
    };
  }

  // 4. Default: require approval
  return {
    needsApproval: true,
    canExecute: true,
    reason: 'prompt',
    toolId,
    toolName: getToolName(toolId),
  };
}
```

### 6.4 Session Trust Isolation

**Ephemeral vs Persisted Trust:**

```typescript
// Persisted Trust (survives browser restart)
setTrustLevel('read_file', 'auto'); // Saved to IndexedDB

// Session Trust (cleared on reload)
grantSessionTrust('read_file'); // In-memory only
// After page reload, session trust is cleared, but persisted level remains
```

**Partialize Pattern (Zustand):**

```typescript
// src/lib/state/tool-permission-store.ts
export const useToolPermissionStore = create<ToolPermissionState>()(
  persist(
    (set, get) => ({
      trustLevels: DEFAULT_TRUST_LEVELS,
      sessionTrust: [], // ← NOT persisted (excluded via partialize)

      setTrustLevel: (toolId, level) => {
        set((state) => ({
          trustLevels: { ...state.trustLevels, [toolId]: level },
        }));
      },

      grantSessionTrust: (toolId) => {
        set((state) => ({
          sessionTrust: [...state.sessionTrust, toolId],
        }));
      },
    }),
    {
      name: 'tool-permission-storage',
      storage: createDexieStorage('via-gent-db', 'toolPermissions'),
      partialize: (state) => ({
        trustLevels: state.trustLevels, // ← Persisted
        // sessionTrust excluded ← Ephemeral
      }),
    }
  )
);
```

### 6.5 Integration Points

**Agent Tool Execution:**

1. **useAgentChatWithTools** (`lib/agent/hooks/use-agent-chat-with-tools.ts`)
   - Checks permission before tool execution
   - Shows approval UI if needed
   - Grants session trust on approval

2. **ApprovalOverlay** (`presentation/components/ui/ApprovalOverlay.tsx`)
   - Displays pending tool approvals
   - Shows tool description, args, risk level
   - Approve/Reject buttons

**Permission Management UI:**

3. **WorkspacePermissionEditor** (`presentation/components/agent/WorkspacePermissionEditor.tsx`)
   - Configure trust levels per tool
   - Workspace-specific permission overrides
   - Visual permission matrix

4. **ToolAvailabilityIndicator** (`presentation/components/agent/ToolAvailabilityIndicator.tsx`)
   - Shows current trust level for each tool
   - Session trust indicators
   - Risk level badges

**Event Emission:**

```typescript
// Permission changes emit events (backwards compatibility)
toolPermissionManager.setEventBus(eventBus);
toolPermissionManager.setTrustLevel('read_file', 'auto');

// Event emitted: 'permission:changed'
eventBus.emit('permission:changed', 'read_file', 'auto');

// UI components can listen for updates
eventBus.on('permission:changed', (toolId, newLevel) => {
  console.log(`Tool ${toolId} trust level changed to ${newLevel}`);
});
```

---

## 7. Chat Flow and Thread Management

### 7.1 Conversation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Chat Hook Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│  useAgentChatWithTools (517 lines)                             │
│  ├─ useChat (TanStack AI)                                      │
│  ├─ createAgentClientTools (Tool Factory)                      │
│  ├─ SystemPromptComposer (5-Layer System)                      │
│  ├─ Approval Flow (Pending Approvals)                          │
│  └─ Event Emission (Agent Activity)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Thread Management                             │
├─────────────────────────────────────────────────────────────────┤
│  conversation-threads-store.ts (726 lines)                     │
│  ├─ Threads: ConversationThread[]                              │
│  ├─ Active Thread ID                                           │
│  ├─ createThread(agentId, workspaceId)                         │
│  ├─ addMessage(threadId, message)                              │
│  ├─ deleteThread(threadId)                                     │
│  └─ getThreadsForWorkspace(workspaceId)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Conversation Store                            │
├─────────────────────────────────────────────────────────────────┤
│  conversation-store.ts (626 lines)                             │
│  ├─ Conversations: Conversation[]                              │
│  ├─ Messages: ConversationMessage[]                            │
│  ├─ Metadata: Token counts, tool calls                         │
│  └─ Persistence: IndexedDB (Dexie)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Thread Hierarchy

**Conversation Thread Schema:**

```typescript
interface ConversationThread {
  id: string;                     // Unique thread ID
  agentId: string;                // Which agent created this thread
  workspaceId: WorkspaceId;       // 'ide' | 'notes' | 'knowledge' | 'study'
  projectPath?: string;           // Optional: project-specific thread
  title: string;                  // Auto-generated from first message
  messages: ConversationMessage[];
  createdAt: string;              // ISO timestamp
  updatedAt: string;              // ISO timestamp
  metadata: {
    tokenCount: number;
    toolCalls: number;
    approvalRate: number;
  };
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  toolCalls?: ToolCallInfo[];
}
```

**Thread Management Methods:**

```typescript
interface ConversationThreadsState {
  threads: ConversationThread[];
  activeThreadId: string | null;

  // CRUD operations
  createThread(agentId: string, workspaceId: WorkspaceId): ConversationThread;
  deleteThread(threadId: string): void;
  addMessage(threadId: string, message: ConversationMessage): void;
  setActiveThread(threadId: string | null): void;

  // Query operations
  getThread(id: string): ConversationThread | undefined;
  getThreadsForWorkspace(workspaceId: WorkspaceId): ConversationThread[];
  getThreadsForAgent(agentId: string): ConversationThread[];
}
```

### 7.3 Context Window Tracking

**Token Counting:**

```typescript
interface ThreadMetadata {
  tokenCount: number;      // Total tokens in thread
  toolCalls: number;       // Number of tool calls
  approvalRate: number;    // Approval success rate (0.0 - 1.0)
  lastMessageCount: number; // Number of messages in last sync
}

// Token counting per message
interface ConversationMessage {
  id: string;
  content: string;
  tokenCount?: number;     // Estimated token count
  timestamp: string;
}

// Context window management
function truncateThreadToContextWindow(
  thread: ConversationThread,
  maxTokens: number = 32768
): ConversationMessage[] {
  let totalTokens = 0;
  const messages: ConversationMessage[] = [];

  // Keep messages from newest to oldest until context window exceeded
  for (let i = thread.messages.length - 1; i >= 0; i--) {
    const message = thread.messages[i];
    const messageTokens = message.tokenCount || estimateTokens(message.content);

    if (totalTokens + messageTokens > maxTokens) {
      break;
    }

    messages.unshift(message);
    totalTokens += messageTokens;
  }

  return messages;
}
```

### 7.4 Cascade Flow Architecture

**5-Layer System Prompt:**

```typescript
// src/lib/agent/prompt-composer.ts
class SystemPromptComposer {
  composeSystemPrompt(config: AgentConfig, context: LayerContext): string {
    const layers = [
      // Layer 1: Tool Constitution (Always Sent, Hidden)
      TOOL_CONSTITUTION,

      // Layer 2: Agent Modes (User-Selectable)
      this.getAgentMode(config.mode),

      // Layer 3: Context/Prompt Injection (Dynamic)
      this.composeContextLayer(context),

      // Layer 4: Task-Specific Instructions (Dynamic)
      this.composeTaskLayer(context),

      // Layer 5: Hidden System Directives (Always Sent, Hidden)
      SYSTEM_DIRECTIVES,
    ];

    return layers
      .filter(layer => layer !== null)
      .map(layer => layer.content)
      .join('\n\n---\n\n');
  }

  private composeContextLayer(context: LayerContext): Layer {
    return {
      priority: 3,
      content: `
Project Context:
- Open files: ${context.openFiles?.join(', ') || 'None'}
- Active file: ${context.activeFile || 'None'}
- File tree: ${context.fileTree || 'Not available'}

Workspace: ${context.workspaceId}

${context.ragDocuments ? `RAG Context:\n${context.ragDocuments.map(d => `- ${d.title}`).join('\n')}` : ''}
      `.trim(),
    };
  }
}
```

**Layer Definitions:**

| Layer | Priority | Content Source | Visibility |
|-------|----------|----------------|------------|
| 1 | Highest | Tool constitution (system rules) | Hidden |
| 2 | High | Agent mode (solo-dev, architect, etc.) | Visible |
| 3 | Medium | Dynamic context (file tree, open files) | Visible |
| 4 | Medium | Task-specific instructions | Visible |
| 5 | Lowest | Hidden system directives | Hidden |

### 7.5 Tool Execution Flow

**Approval Flow (Story 25-5):**

```typescript
interface PendingApprovalInfo {
  approvalId: string;       // Unique ID for this approval
  toolCallId: string;       // Tool call ID from LLM
  toolName: string;         // 'write_file', 'execute_command', etc.
  toolArgs: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;      // What the tool will do
  proposedContent?: string; // For write_file: new content
}

// Approval UI flow
function ApprovalOverlay({ pendingApprovals }: { pendingApprovals: PendingApprovalInfo[] }) {
  return (
    <Dialog>
      {pendingApprovals.map(approval => (
        <ApprovalCard key={approval.approvalId}>
          <h3>{approval.toolName}</h3>
          <p>{approval.description}</p>
          <RiskBadge level={approval.riskLevel} />
          {approval.proposedContent && (
            <DiffView old={oldContent} new={approval.proposedContent} />
          )}
          <Button onClick={() => approveToolCall(approval.approvalId)}>
            Approve
          </Button>
          <Button onClick={() => rejectToolCall(approval.approvalId)}>
            Reject
          </Button>
        </ApprovalCard>
      ))}
    </Dialog>
  );
}
```

**Tool Execution with Approval:**

```typescript
// 1. LLM requests tool use
const toolCalls = extractToolCalls(llmResponse);

// 2. Check permissions for each tool
const pendingApprovals = toolCalls
  .filter(toolCall => {
    const permission = toolPermissionManager.checkPermission(toolCall.name);
    return permission.needsApproval && permission.canExecute;
  })
  .map(toolCall => ({
    approvalId: generateId(),
    toolCallId: toolCall.id,
    toolName: toolCall.name,
    toolArgs: toolCall.arguments,
    riskLevel: assessRisk(toolCall),
    description: generateToolDescription(toolCall),
  }));

// 3. Show approval UI (if any pending)
setPendingApprovals(pendingApprovals);

// 4. Wait for user approval/rejection
const approvedCalls = await waitForApprovals(pendingApprovals);

// 5. Execute approved tools
const results = await Promise.all(
  approvedCalls.map(call => executeTool(call))
);

// 6. Return results to LLM
await continueChat(results);
```

### 7.6 Multi-Modal Support

**Supported Input Types:**

```typescript
// Image input (via Gemini)
interface ImageInput {
  type: 'image';
  mimeType: 'image/png' | 'image/jpeg';
  data: base64 string;
}

// Audio input (via Live API)
interface AudioInput {
  type: 'audio';
  mimeType: 'audio/wav' | 'audio/mp3';
  data: ArrayBuffer;
}

// PDF input (via pdf.js)
interface PDFInput {
  type: 'pdf';
  text: string;
  metadata: {
    title: string;
    author: string;
    pageCount: number;
  };
}

// URL input (via web scraper)
interface URLInput {
  type: 'url';
  url: string;
  text: string;
  metadata: {
    title: string;
    description: string;
    fetchedAt: string;
  };
}
```

**Input Processing Pipeline:**

```typescript
// src/lib/agent/input-processor.ts
async function processInput(input: MultiModalInput): Promise<Message> {
  switch (input.type) {
    case 'image':
      return processImage(input); // gemini-image-processor.ts (305 lines)
    case 'audio':
      return processAudio(input); // live-api-websocket.ts (386 lines)
    case 'pdf':
      return processPDF(input);   // gemini-pdf-processor.ts (482 lines)
    case 'url':
      return processURL(input);   // gemini-url-processor.ts (408 lines)
    default:
      return { role: 'user', content: input.text };
  }
}
```

---

## 8. File System Synchronization

### 8.1 Sync Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Local FS (Source of Truth)                    │
│              (File System Access API)                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   LocalFSAdapter                                │
│              (Abstraction Layer)                                │
│  - readFile(path) → Promise<string>                             │
│  - writeFile(path, content) → Promise<void>                     │
│  - listDirectory(path) → Promise<string[]>                      │
│  - watchFile(path) → Observable<FileChangeEvent>                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SyncManager                                   │
│           (Dual-Write Orchestrator)                             │
│  - syncFileToWebContainer(path, content)                        │
│  - syncDirectoryToWebContainer(path)                            │
│  - batchSync(operations) → debounced                            │
│  - syncFromWebContainerToLocal(path)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   WebContainer FS                                │
│              (In-Memory File System)                            │
│  - Mirrors Local FS                                             │
│  - Runs Node.js processes                                       │
│  - Excludes: .git, node_modules, dist, build                   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 File System Abstractions

**LocalFSAdapter Interface:**

```typescript
// src/lib/filesystem/local-fs-adapter.ts
class LocalFSAdapter {
  private directoryHandle: FileSystemDirectoryHandle;

  async readFile(filePath: string): Promise<string> {
    // 1. Resolve path to file handle
    const fileHandle = await this.getFileHandle(filePath);

    // 2. Read file contents
    const file = await fileHandle.getFile();
    const text = await file.text();

    return text;
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    // 1. Resolve path to file handle
    const fileHandle = await this.getFileHandle(filePath, { create: true });

    // 2. Create writable stream
    const writable = await fileHandle.createWritable();

    // 3. Write content
    await writable.write(content);

    // 4. Close stream (commits changes)
    await writable.close();

    // 5. Trigger sync to WebContainer
    this.syncManager?.syncFileToWebContainer(filePath, content);
  }

  async listDirectory(dirPath: string): Promise<string[]> {
    const dirHandle = await this.getDirectoryHandle(dirPath);
    const entries: string[] = [];

    for await (const entry of dirHandle.values()) {
      entries.push(entry.name);
    }

    return entries;
  }

  watchFile(filePath: string): Observable<FileChangeEvent> {
    // FSA doesn't support native watching
    // Poll for changes or use manual triggers
    return new Observable((subscriber) => {
      const interval = setInterval(async () => {
        const currentContent = await this.readFile(filePath);
        if (currentContent !== this.lastKnownContent) {
          subscriber.next({
            type: 'modified',
            path: filePath,
            timestamp: new Date(),
          });
          this.lastKnownContent = currentContent;
        }
      }, 1000);

      return () => clearInterval(interval);
    });
  }
}
```

### 8.3 Sync Exclusions

**Excluded Patterns:**

```typescript
const SYNC_EXCLUSIONS = [
  '.git',
  'node_modules',
  '.DS_Store',
  'Thumbs.db',
  'dist',
  'build',
  '.next',
  '.cache',
  '.vscode',
  '.idea',
];

// Exclusion filter
function shouldSyncFile(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');

  for (const exclusion of SYNC_EXCLUSIONS) {
    if (normalizedPath.includes(exclusion)) {
      return false;
    }
  }

  return true;
}
```

### 8.4 Cross-Workspace File Operations

**File Change Events:**

```typescript
// src/lib/events/cross-workspace-event-bus.ts
interface FileChangeEvent {
  workspaceId: WorkspaceId;
  projectPath: string;
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: Date;
}

// Emit file change event
crossWorkspaceEventBus.emitFileChange({
  workspaceId: 'ide',
  projectPath: '/Users/.../project-alpha',
  filePath: 'src/App.tsx',
  changeType: 'modified',
});

// Listen to file changes
crossWorkspaceEventBus.onFileChange((event) => {
  console.log('File changed in workspace:', event.workspaceId);
  // Refresh file tree, invalidate cache, etc.
});
```

**Cross-Workspace File Access:**

```typescript
// IDE workspace → Local FS + WebContainer
// Notes workspace → Read-only Local FS
// Knowledge workspace → RAG index (via src/lib/rag/)
// Study workspace → Knowledge artifacts (via src/lib/study/)

function getFileSystemForWorkspace(workspaceType: WorkspaceType) {
  switch (workspaceType) {
    case 'ide':
      return {
        adapter: localFSAdapter,
        syncManager: syncManager,
        webContainer: webContainerAPI,
      };
    case 'notes':
      return {
        adapter: localFSAdapter,
        syncManager: null, // No sync
        webContainer: null, // No WC
      };
    case 'knowledge':
      return {
        adapter: ragIndexAdapter, // Virtual FS
        syncManager: null,
        webContainer: null,
      };
    case 'study':
      return {
        adapter: artifactAdapter, // Virtual FS
        syncManager: null,
        webContainer: null,
      };
  }
}
```

### 8.5 Desktop Sync Patterns

**Reverse Sync Service:**

```typescript
// src/lib/sync/reverse-sync-service.ts (561 lines)
class ReverseSyncService {
  // Sync WebContainer → Local FS
  async syncToLocalFS(sourcePath: string, destPath: string): Promise<void> {
    // 1. Read file from WebContainer
    const wcFile = await webContainer.fs.readFile(sourcePath);

    // 2. Confirm with user before syncing
    const confirmed = await this.confirmSync(destPath);
    if (!confirmed) return;

    // 3. Write to local FS
    await localFSAdapter.writeFile(destPath, wcFile);

    // 4. Update file metadata cache
    await this.updateFileMetadata(destPath);
  }

  // Reverse sync exclusions (don't sync back)
  private REVERSE_SYNC_EXCLUSIONS = [
    '.next',
    'dist',
    'build',
    'node_modules',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
  ];
}
```

**Use Cases for Reverse Sync:**

1. **npm install** → Sync `node_modules` to local FS
2. **git clone** → Sync cloned repo to local FS
3. **File creation in WebContainer** → Prompt user to sync back

---

## 9. State Management Architecture

### 9.1 Zustand Store Inventory

**Three-Store Architecture (DEPRECATED - Migrating):**

```
src/stores/                    (Legacy - 6 stores)
├── agents-store.ts           (429 lines) - Agent configs
├── agent-selection.ts        - Selected agent state
└── conversation-threads-store.ts (726 lines) - Chat threads

src/lib/state/                 (Active - 19 stores)
├── ide-store.ts              (339 lines) - IDE layout, panels, open files
├── canvas-store.ts           (613 lines) - Canvas blocks, connections
├── knowledge-store.ts        (718 lines) - Knowledge sources, embeddings
├── rag-store.ts              (877 lines) - RAG queries, results
├── conversation-store.ts     (626 lines) - Conversations, messages
├── quiz-store.ts             (629 lines) - Quiz data, sessions
├── flashcard-store.ts        (516 lines) - Flashcard decks
├── provider-store.ts         (152 lines) - LLM providers
├── tool-permission-store.ts  (NEW - Cycle 12) - Tool trust levels
├── layout-store.ts           (4,186 lines) - Layout state (GOD CLASS)
├── navigation-store.ts       (3,815 lines) - Navigation state (GOD CLASS)
├── statusbar-store.ts        (6,952 lines) - Status bar state (GOD CLASS)
├── dexie-db.ts               (1267 lines) - IndexedDB schema (GOD CLASS)
├── dexie-db-migrations.ts    (691 lines) - DB migrations
├── dexie-storage.ts          (3,087 lines) - Zustand-Dexie adapter (GOD CLASS)
├── hydration-manager.ts      (5,483 lines) - Store hydration (GOD CLASS)
├── conversation-auto-restore.ts (4,806 lines) - Auto-restore (GOD CLASS)
└── session-snapshot-manager.ts (315 lines) - Session snapshots

src/infrastructure/persistence/stores/  (NEW - 25+ stores, DUPLICATE)
├── agents/                    - Agent-specific stores
├── conversation/             - Conversation stores
├── providers/                - Provider stores
├── rag/                      - RAG stores
├── canvas/                   - Canvas store
└── knowledge/                - Knowledge store
```

### 9.2 God Classes Analysis

**Critical God Classes (>600 lines):**

1. **statusbar-store.ts (6,952 lines)** - CRITICAL
   - Issue: Massive state blob for status bar
   - Impact: Slow load times, hard to optimize
   - Refactor Target: Split into segment stores

2. **hydration-manager.ts (5,483 lines)** - CRITICAL
   - Issue: Monolithic hydration logic
   - Impact: Hydration race conditions
   - Refactor Target: Split into per-store hydrators

3. **conversation-auto-restore.ts (4,806 lines)** - HIGH PRIORITY
   - Issue: Auto-restore logic tangled with persistence
   - Impact: Slow restoration, hard to debug
   - Refactor Target: Separate restoration logic from store

4. **dexie-storage.ts (3,087 lines)** - HIGH PRIORITY
   - Issue: Generic storage adapter with too many features
   - Impact: Complex, hard to maintain
   - Refactor Target: Split into focused adapters

5. **navigation-store.ts (3,815 lines)** - HIGH PRIORITY
   - Issue: Navigation state mixed with UI state
   - Impact: Slow navigation, hard to optimize
   - Refactor Target: Separate navigation from UI state

6. **layout-store.ts (4,186 lines)** - HIGH PRIORITY
   - Issue: Layout state mixed with panel state
   - Impact: Slow layout updates, hard to debug
   - Refactor Target: Split into layout, panel, and resize stores

**Moderate God Classes (400-600 lines) - 35 files:**
- Most UI components (AgentConfigDialog, ChatConversation, etc.)
- Complex utilities (markdown-converter, error-classification)
- Service implementations (reverse-sync-service, orama-index)

### 9.3 Store Patterns

**December 2025 Zustand Patterns:**

**Slice Pattern (Recommended):**

```typescript
// src/lib/state/tool-permission-store.ts (NEW - Good Example)
interface ToolPermissionState {
  trustLevels: Record<string, ToolTrustLevel>;
  sessionTrust: string[];
  _hasHydrated: boolean;

  // Actions
  setTrustLevel: (toolId: string, level: ToolTrustLevel) => void;
  grantSessionTrust: (toolId: string) => void;
  revokeSessionTrust: (toolId: string) => void;
  clearSessionTrust: () => void;
  getTrustLevel: (toolId: string) => ToolTrustLevel;
}

export const useToolPermissionStore = create<ToolPermissionState>()(
  persist(
    (set, get) => ({
      trustLevels: DEFAULT_TRUST_LEVELS,
      sessionTrust: [],
      _hasHydrated: false,

      setTrustLevel: (toolId, level) => {
        set((state) => ({
          trustLevels: { ...state.trustLevels, [toolId]: level },
        }));
      },

      grantSessionTrust: (toolId) => {
        set((state) => ({
          sessionTrust: [...state.sessionTrust, toolId],
        }));
      },

      revokeSessionTrust: (toolId) => {
        set((state) => ({
          sessionTrust: state.sessionTrust.filter(id => id !== toolId),
        }));
      },

      clearSessionTrust: () => {
        set({ sessionTrust: [] });
      },

      getTrustLevel: (toolId) => {
        return get().trustLevels[toolId] ?? 'prompt';
      },

      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated });
      },
    }),
    {
      name: 'tool-permission-storage',
      storage: createDexieStorage('via-gent-db', 'toolPermissions'),
      partialize: (state) => ({
        trustLevels: state.trustLevels, // ← Persisted
        // sessionTrust excluded ← Ephemeral
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```

**Persist on Combined Store (Recommended):**

```typescript
// src/stores/agents-store.ts (Good Example)
export const useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
      agents: [DEFAULT_AGENT],
      activeAgentId: DEFAULT_AGENT.id,
      _hasHydrated: false,

      // CRUD operations
      addAgent: (agentData) => { /* ... */ },
      removeAgent: (id) => { /* ... */ },
      updateAgent: (id, updates) => { /* ... */ },

      // Workspace filtering
      getAgentsForWorkspace: (workspaceType) => { /* ... */ },
      updateWorkspaceBinding: (agentId, workspaceType, isAvailable) => { /* ... */ },
    }),
    {
      name: 'agents-storage',
      storage: createDexieStorage('via-gent-db', 'agents'),
      partialize: (state) => ({
        agents: state.agents,
        activeAgentId: state.activeAgentId,
        // _hasHydrated excluded
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        console.log('[AgentsStore] Hydrated from IndexedDB');
      },
    }
  )
);
```

**Partialize for Selective Persistence:**

```typescript
// Persist only specific fields
partialize: (state) => ({
  // Persisted fields
  agents: state.agents,
  activeAgentId: state.activeAgentId,
  trustLevels: state.trustLevels,

  // Excluded fields (ephemeral)
  // _hasHydrated: state._hasHydrated,
  // sessionTrust: state.sessionTrust,
  // pendingApprovals: state.pendingApprovals,
})
```

### 9.4 Schema and Persistence

**IndexedDB Schema (Dexie):**

```typescript
// src/lib/state/dexie-db.ts (1267 lines) - GOD CLASS
class ViaGentDB extends Dexie {
  agents!: Table<Agent, string>;
  providers!: Table<Provider, string>;
  conversations!: Table<Conversation, string>;
  threads!: Table<ConversationThread, string>;
  toolPermissions!: Table<ToolPermission, string>;
  knowledge!: Table<KnowledgeSource, string>;
  ragResults!: Table<RAGResult, string>;
  flashcards!: Table<FlashcardDeck, string>;
  quizzes!: Table<Quiz, string>;
  sessions!: Table<SessionState, string>;

  constructor() {
    super('via-gent-db');
    this.version(3).stores({
      agents: 'id, name, providerId, createdAt',
      providers: 'id, name',
      conversations: 'id, agentId, workspaceId, createdAt',
      threads: 'id, agentId, workspaceId, projectPath, createdAt',
      toolPermissions: 'toolId',
      knowledge: 'id, workspaceId, createdAt',
      ragResults: 'id, query, createdAt',
      flashcards: 'id, workspaceId, createdAt',
      quizzes: 'id, workspaceId, createdAt',
      sessions: 'projectId, timestamp',
    });
  }
}
```

**Migration Pattern:**

```typescript
// src/lib/state/dexie-db-migrations.ts (691 lines)
db.version(1).stores({
  agents: 'id, name, providerId',
  // ... other tables
});

db.version(2).stores({
  agents: 'id, name, providerId, createdAt', // Added index
  // ... other tables
}).upgrade(tx => {
  // Migration logic for v1 → v2
  return tx.table('agents').toCollection().modify(agent => {
    if (!agent.createdAt) {
      agent.createdAt = new Date().toISOString();
    }
  });
});

db.version(3).stores({
  // ... new schema
}).upgrade(async tx => {
  // Migration logic for v2 → v3
  // ...
});
```

---

## 10. Cross-Workspace Event System

### 10.1 Event Bus Architecture

```typescript
// src/lib/events/cross-workspace-event-bus.ts (445 lines)
class CrossWorkspaceEventBus extends EventEmitter3 {
  // Event names
  private static readonly EVENTS = {
    FILE_CHANGE: 'file:change',
    AGENT_CONFIG_CHANGE: 'agent:config:change',
    SYNC_STATUS: 'sync:status',
    PROJECT_STATE_CHANGE: 'project:state:change',
    WORKSPACE_CHANGED: 'workspace:changed',
    PROVIDER_CONFIG_CHANGE: 'provider:config:change',
    MODELS_UPDATED: 'models:updated',
  } as const;

  // Emitter methods
  emitFileChange(event: FileChangeEvent): void;
  emitAgentConfigChange(event: AgentConfigChangeEvent): void;
  emitSyncStatus(event: SyncStatusEvent): void;
  emitProjectStateChange(event: ProjectStateChangeEvent): void;
  emitWorkspaceChanged(event: WorkspaceChangeEvent): void;
  emitProviderConfigChange(event: ProviderConfigChangeEvent): void;
  emitModelsUpdated(event: ModelsUpdatedEvent): void;

  // Listener methods
  onFileChange(callback: (event: FileChangeEvent) => void): void;
  onAgentConfigChange(callback: (event: AgentConfigChangeEvent) => void): void;
  onSyncStatus(callback: (event: SyncStatusEvent) => void): void;
  onProjectStateChange(callback: (event: ProjectStateChangeEvent) => void): void;
  onWorkspaceChanged(callback: (event: WorkspaceChangeEvent) => void): void;
  onProviderConfigChange(callback: (event: ProviderConfigChangeEvent) => void): void;
  onModelsUpdated(callback: (event: ModelsUpdatedEvent) => void): void;
}

export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();
```

### 10.2 Event Types

**File Change Event:**

```typescript
interface FileChangeEvent {
  workspaceId: WorkspaceId;
  projectPath: string;
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: Date;
}
```

**Agent Config Change Event:**

```typescript
interface AgentConfigChangeEvent {
  workspaceId: WorkspaceId;
  agentId: string;
  changeType: 'created' | 'updated' | 'deleted';
  timestamp: Date;
}
```

**Sync Status Event:**

```typescript
interface SyncStatusEvent {
  workspaceId: WorkspaceId;
  projectPath: string;
  status: 'syncing' | 'synced' | 'error';
  error?: string;
  timestamp: Date;
}
```

**Workspace Change Event:**

```typescript
interface WorkspaceChangeEvent {
  from: WorkspaceId;
  to: WorkspaceId;
  timestamp: string;
}
```

**Provider Config Change Event:**

```typescript
interface ProviderConfigChangeEvent {
  workspaceId: WorkspaceId;
  providerId: string;
  changeType: 'credentials_updated' | 'provider_added' | 'provider_removed' | 'config_updated';
  timestamp: Date;
}
```

### 10.3 Event Flow Example

**Agent Configuration Update:**

```typescript
// 1. User updates agent in AgentConfigDialog
const { updateAgent } = useAgentsStore();
updateAgent(agentId, { temperature: 0.8 });

// 2. Store persists to IndexedDB
// 3. Store emits AgentConfigChangeEvent
crossWorkspaceEventBus.emitAgentConfigChange({
  workspaceId: 'ide',
  agentId: 'agt_001',
  changeType: 'updated',
  timestamp: new Date(),
});

// 4. All workspaces reactively update
crossWorkspaceEventBus.onAgentConfigChange((event) => {
  console.log('Agent config changed:', event);

  // Refresh agent selectors
  useAgentsStore.getState().getAgentsForWorkspace(currentWorkspace);

  // Revalidate tool permissions
  toolPermissionManager.getTrustLevel('read_file');

  // Update UI
  forceUpdate();
});
```

### 10.4 Integration with Zustand Stores

**Store Emits Events on Updates:**

```typescript
// src/stores/agents-store.ts
updateAgent: (id, updates) => {
  set((state) => ({
    agents: state.agents.map((agent) =>
      agent.id === id ? { ...agent, ...updates } : agent
    ),
  }));

  // Emit event after state update
  const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
  crossWorkspaceEventBus.emitAgentConfigChange({
    workspaceId: currentWorkspace,
    agentId: id,
    changeType: 'updated',
    timestamp: new Date(),
  });
}
```

**React Hook for Event Subscription:**

```typescript
// src/lib/events/use-cross-workspace-events.ts
export function useCrossWorkspaceEvents(handlers: {
  onFileChange?: (event: FileChangeEvent) => void;
  onAgentConfigChange?: (event: AgentConfigChangeEvent) => void;
  onWorkspaceChange?: (event: WorkspaceChangeEvent) => void;
}) {
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    if (handlers.onFileChange) {
      crossWorkspaceEventBus.onFileChange(handlers.onFileChange);
      unsubscribers.push(() => crossWorkspaceEventBus.off('file:change', handlers.onFileChange!));
    }

    if (handlers.onAgentConfigChange) {
      crossWorkspaceEventBus.onAgentConfigChange(handlers.onAgentConfigChange);
      unsubscribers.push(() => crossWorkspaceEventBus.off('agent:config:change', handlers.onAgentConfigChange!));
    }

    if (handlers.onWorkspaceChange) {
      crossWorkspaceEventBus.onWorkspaceChanged(handlers.onWorkspaceChange);
      unsubscribers.push(() => crossWorkspaceEventBus.off('workspace:changed', handlers.onWorkspaceChange!));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [handlers]);
}
```

---

## 11. Component Inventory

### 11.1 Presentation Layer Components

**Agent Components:**

| Component | Location | Lines | Purpose |
|-----------|----------|-------|---------|
| AgentConfigDialog | presentation/components/agent/ | 370 | Create/edit agents |
| WorkspacePermissionEditor | presentation/components/agent/ | 370 | Workspace bindings |
| ToolAvailabilityIndicator | presentation/components/agent/ | 340 | Permission display |
| ApprovalOverlay | presentation/components/ui/ | 443 | Tool approval UI |
| AgentChatPanel | presentation/components/ide/ | 316 | Chat interface |

**IDE Components:**

| Component | Location | Lines | Purpose |
|-----------|----------|-------|---------|
| FileTree | presentation/components/ide/ | - | File browser |
| TerminalPanel | presentation/components/ide/ | - | xterm.js terminal |
| MonacoEditor | presentation/components/ide/ | - | Code editor |
| StatusBar | presentation/components/ide/statusbar/ | - | Status bar segments |

**Workspace Components:**

| Component | Location | Lines | Purpose |
|-----------|----------|-------|---------|
| WorkspaceEnhancedSwitcher | presentation/components/workspace/ | 395 | Workspace tabs |
| WorkspaceBindingDialog | presentation/components/workspace/ | 312 | Project binding |

**UI Components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| Button | presentation/components/ui/ | Clickable button |
| Dialog | presentation/components/ui/ | Modal dialog |
| Input | presentation/components/ui/ | Text input |
| Select | presentation/components/ui/ | Dropdown selection |
| Toast | presentation/components/ui/ | Notifications |

### 11.2 Component Responsibilities

**AgentConfigDialog:**

```typescript
function AgentConfigDialog() {
  const { agents, addAgent, updateAgent, removeAgent } = useAgentsStore();
  const { providers } = useProviderStore();

  // Create agent
  const handleCreate = () => {
    addAgent({
      name: 'My Agent',
      providerId: 'openrouter',
      modelId: 'mistralai/devstral-2512:free',
      systemPrompt: 'You are a helpful assistant.',
      tools: ['read_file', 'write_file'],
      workspaceBindings: [
        { workspaceType: 'ide', isAvailable: true, enabledTools: ['read_file', 'write_file'] },
      ],
    });
  };

  return <Dialog>...</Dialog>;
}
```

**ApprovalOverlay:**

```typescript
function ApprovalOverlay({ pendingApprovals }: { pendingApprovals: PendingApprovalInfo[] }) {
  return (
    <Dialog>
      {pendingApprovals.map(approval => (
        <ApprovalCard key={approval.approvalId}>
          <h3>{approval.toolName}</h3>
          <p>{approval.description}</p>
          <RiskBadge level={approval.riskLevel} />
          <Button onClick={() => approveToolCall(approval.approvalId)}>
            Approve
          </Button>
          <Button onClick={() => rejectToolCall(approval.approvalId)}>
            Reject
          </Button>
        </ApprovalCard>
      ))}
    </Dialog>
  );
}
```

---

## 12. Integration Matrix

### 12.1 Component → Store Dependencies

| Component | Store(s) Used | Purpose |
|-----------|---------------|---------|
| AgentConfigDialog | useAgentsStore, useProviderStore | Agent CRUD |
| WorkspacePermissionEditor | useAgentsStore, useToolPermissionStore | Permissions |
| ApprovalOverlay | useAgentChatWithTools (hook) | Tool approvals |
| AgentChatPanel | useAgentsStore, useConversationStore | Chat interface |
| FileTree | useIDEStore | File browsing |
| TerminalPanel | useIDEStore | Terminal state |
| WorkspaceEnhancedSwitcher | useWorkspaceStore | Workspace switching |

### 12.2 Store → Store Dependencies

| Store | Depends On | Reason |
|-------|------------|--------|
| useAgentsStore | useProviderStore | Validate provider-model combos |
| useAgentsStore | useWorkspaceStore | Detect current workspace for events |
| useAgentChatWithTools | useAgentsStore | Get active agent config |
| useAgentChatWithTools | useToolPermissionStore | Check tool permissions |
| useConversationStore | useAgentsStore | Link messages to agents |
| useIDEStore | useWorkspaceStore | Detect workspace context |

### 12.3 External Service Dependencies

| Store/Service | External Dependency | Purpose |
|---------------|-------------------|---------|
| credential-vault | Web Crypto API | AES-256-GCM encryption |
| local-fs-adapter | File System Access API | Local file operations |
| webcontainer-manager | @webcontainer/api | Browser Node.js runtime |
| dexie-db | IndexedDB | Persistent storage |
| provider-adapter | OpenRouter, Anthropic, OpenAI, Google | LLM APIs |
| rag-index | @orama/orama | Vector search (Phase 2) |

---

## 13. API Reference

### 13.1 Public Interfaces

**Credential Vault API:**

```typescript
class CredentialVault {
  async getStatus(): Promise<VaultStatus>
  async initialize(): Promise<void>
  async setCredential(providerId: string, apiKey: string): Promise<void>
  async getCredential(providerId: string): Promise<string | null>
  async removeCredential(providerId: string): Promise<void>
  async clear(): Promise<void>
  verifyEncryptionCompliance(): boolean
}
```

**Agent Store API:**

```typescript
interface AgentsState {
  // Query
  agents: Agent[]
  activeAgentId: string | null
  getAgent(id: string): Agent | undefined
  getAgentsForWorkspace(workspaceType: WorkspaceType): Agent[]

  // Mutations
  addAgent(agent: Omit<Agent, 'id' | 'createdAt' | 'metadata'>): Agent
  removeAgent(id: string): void
  updateAgent(id: string, updates: Partial<Agent>): void
  setActiveAgent(id: string | null): void

  // Workspace bindings
  updateWorkspaceBinding(agentId: string, workspaceType: WorkspaceType, isAvailable: boolean): void
  updateAgentWorkspaceBinding(agentId: string, workspaceType: WorkspaceType, binding: Partial<WorkspaceBinding>): void
  isAgentAvailableInWorkspace(agentId: string, workspaceType: WorkspaceType): boolean
}
```

**Tool Permission Manager API:**

```typescript
class ToolPermissionManager {
  static getInstance(): ToolPermissionManager
  static createInstance(initialPermissions?: Record<string, ToolTrustLevel>): ToolPermissionManager

  getTrustLevel(toolId: string): ToolTrustLevel
  setTrustLevel(toolId: string, level: ToolTrustLevel): void
  checkPermission(toolId: string): PermissionCheckResult

  hasSessionTrust(toolId: string): boolean
  grantSessionTrust(toolId: string): void
  revokeSessionTrust(toolId: string): void
  clearSessionTrust(): void

  setEventBus(eventBus: any): void
}
```

**Chat Hook API:**

```typescript
interface UseAgentChatWithToolsReturn {
  messages: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>
  sendMessage: (content: string) => void
  isLoading: boolean
  error: Error | null
  providerId: string
  modelId: string
  toolCalls: ToolCallInfo[]
  toolsAvailable: boolean
  pendingApprovals: PendingApprovalInfo[]
  approveToolCall: (approvalId: string, toolCallId?: string) => void
  rejectToolCall: (approvalId: string, reason?: string, toolCallId?: string) => void
}

function useAgentChatWithTools(options?: UseAgentChatWithToolsOptions): UseAgentChatWithToolsReturn
```

**Sync Manager API:**

```typescript
class SyncManager {
  syncFileToWebContainer(filePath: string, content: string): Promise<void>
  syncDirectoryToWebContainer(dirPath: string): Promise<void>
  batchSync(files: FileOperation[]): Promise<SyncResult>
  syncFromWebContainerToLocal(sourcePath: string, destPath: string): Promise<void>
  getSyncStatus(): SyncStatus
  onSyncStatusChange(callback: (status: SyncStatus) => void): void
}
```

**Event Bus API:**

```typescript
class CrossWorkspaceEventBus {
  emitFileChange(event: FileChangeEvent): void
  emitAgentConfigChange(event: AgentConfigChangeEvent): void
  emitSyncStatus(event: SyncStatusEvent): void
  emitWorkspaceChanged(event: WorkspaceChangeEvent): void
  emitProviderConfigChange(event: ProviderConfigChangeEvent): void

  onFileChange(callback: (event: FileChangeEvent) => void): void
  onAgentConfigChange(callback: (event: AgentConfigChangeEvent) => void): void
  onSyncStatus(callback: (event: SyncStatusEvent) => void): void
  onWorkspaceChanged(callback: (event: WorkspaceChangeEvent) => void): void
  onProviderConfigChange(callback: (event: ProviderConfigChangeEvent) => void): void
}
```

---

## 14. Deployment Configuration

### 14.1 Environment Variables

**Required Variables:**

```bash
# TanStack Start
DEPLOY_TARGET=cloudflare  # or netlify, node

# WebContainer (no API keys required - runs locally)
# WebContainer API is free for development

# LLM Providers (optional - users provide their own)
OPENROUTER_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
DEEPSEEK_API_KEY=sk-...
```

**Optional Variables:**

```bash
# Analytics (not implemented yet)
ANALYTICS_ID=

# Sentry (error tracking)
SENTRY_DSN=

# Feature Flags
ENABLE_RAG=false
ENABLE_KNOWLEDGE_CANVAS=false
ENABLE_STUDY_MODE=false
```

### 14.2 Vite Configuration

**Security Headers (COOP/COEP for WebContainers):**

```typescript
// vite.config.ts
const securityHeadersPlugin: Plugin = {
  name: 'configure-security-headers',
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      // Cross-Origin Isolation (required for WebContainers)
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      // Additional Security Headers
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

      next();
    });
  },
};

// MUST BE FIRST in plugins array
export default defineConfig({
  plugins: [
    securityHeadersPlugin, // ← FIRST
    tanStackStart(),
    react(),
    tsconfigPaths(),
  ],
});
```

**SSR Externals:**

```typescript
ssr: DEPLOY_TARGET === 'cloudflare'
  ? { noExternal: true } // Bundle everything for Cloudflare
  : {
    external: [
      '@xterm/xterm',          // DOM-dependent
      '@monaco-editor/react',  // DOM-dependent
      'monaco-editor',         // DOM-dependent
      '@webcontainer/api',     // SharedArrayBuffer
    ],
    noExternal: [],
  },
```

### 14.3 Feature Flags

**Phase 1 Features (Enabled):**

```typescript
const FEATURES = {
  AGENT_CHAT: true,
  TOOL_PERMISSIONS: true,
  WORKSPACE_SWITCHING: true,
  FILE_SYNC: true,
  WEBCONTAINER: true,
  TERMINAL: true,
  CODE_EDITOR: true,
  HOT_RELOAD: true,
};
```

**Phase 2 Features (Disabled):**

```typescript
const FEATURES_PHASE_2 = {
  RAG: false,
  KNOWLEDGE_CANVAS: false,
  STUDY_MODE: false,
  FLASHCARDS: false,
  QUIZZES: false,
  AUDIO_OVERVIEW: false,
};
```

---

## 15. Performance Targets

### 15.1 Core Performance Benchmarks

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| **WebContainer Boot** | <5s | ~7s | `boot()` promise timing |
| **File Mount (100 files)** | <3s | ~3s | File mounting timing |
| **Dev Server Start** | <30s | ~25s | `pnpm dev` timing |
| **Agent First Token** | <2s | ~2.5s | TanStack AI streaming |
| **Preview Hot Reload** | <2s | ~2s | HMR update timing |
| **File Save to Disk** | <500ms | ~800ms | FSA write timing |
| **File Sync Latency** | <500ms | ~800ms | Local ↔ WebContainer sync |
| **IndexedDB Query** | <50ms | ~40ms | DB query timing |
| **State Restoration** | <2s | ~2s | Full session restore |
| **UI State Update** | <100ms | ~50ms | Zustand store → UI |

### 15.2 Reliability Targets

| Metric | Target | Current | Validation |
|--------|--------|---------|------------|
| **WebContainer Boot Success** | 99%+ | ~95% | Boot attempt tracking |
| **File Sync Integrity** | 100% | ~92% | SHA-256 verification |
| **Agent Tool Success** | 95%+ | ~85% | Tool execution tracking |
| **Session Restoration** | 99%+ | ~80% | IndexedDB + FSA handles |
| **FSA Re-grant Success** | >90% | ~75% | Permission API metrics |

### 15.3 Performance Optimization Strategies

**Lazy Loading:**

```typescript
// Lazy load Monaco Editor
const MonacoEditor = lazy(() => import('./MonacoEditor'));

// Lazy load WebContainer
const WebContainerPanel = lazy(() => import('./WebContainerPanel'));

// Lazy load xterm.js
const TerminalPanel = lazy(() => import('./TerminalPanel'));
```

**Code Splitting:**

```typescript
// TanStack Router auto-splits by route
// routes/ide.tsx → ide.chunk.js
// routes/knowledge.tsx → knowledge.chunk.js
// routes/study.tsx → study.chunk.js
```

**Sync Exclusions:**

```typescript
// Exclude large directories from sync
const SYNC_EXCLUSIONS = [
  'node_modules', // 100K+ files
  '.git',         // Git metadata
  'dist',         // Build output
  'build',        // Build output
];
```

---

## 16. Security Architecture

### 16.1 API Key Storage

**Encryption Flow:**

```
User enters API key
       ↓
PBKDF2-SHA256 (100,000 iterations)
       ↓
Derived Key
       ↓
AES-256-GCM Encryption
       ↓
Encrypted Key (base64)
       ↓
localStorage (vg_ek_v3)
```

**Security Features:**

- **AES-256-GCM** authenticated encryption
- **PBKDF2-SHA256** key derivation (100,000 iterations)
- **Salt** for rainbow table resistance
- **IV** (Initialization Vector) for semantic security
- **Authentication Tag** for tamper detection
- **Obfuscated Keys** (vg_ek_v3, vg_salt_v3) to reduce XSS targetability

### 16.2 Content Security Policy

**Development (CSP Disabled):**

```typescript
// CSP is NOT set in dev server because it blocks:
// - IndexedDB operations
// - File System Access API
// - WebContainer internals

// Production headers handled by server/middleware/security-headers.ts
```

**Production (CSP Enabled):**

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  connect-src 'self' https://*.anthropic.com https://*.openai.com;
  img-src 'self' data: blob:;
  style-src 'self' 'unsafe-inline';
```

### 16.3 Permission Management

**Tool Trust Levels:**

| Level | Risk | Examples | Approval Required |
|-------|------|----------|-------------------|
| `auto` | Low | `list_files`, `search_knowledge` | No |
| `prompt` | Medium | `read_file`, `create_flashcard` | Yes |
| `block` | High | `write_file`, `execute_command` | No (blocked) |

**Session Trust:**

- User grants trust for current session
- Cleared on browser reload
- Useful for frequently-used tools in long sessions

**Persisted Trust:**

- Trust levels saved to IndexedDB
- Survives browser restart
- Managed via `ToolPermissionManager`

---

## Appendix A: Glossary

**Agent Configuration Vault**: Centralized store for AI agent configurations (provider, model, system prompt, tools, workspace bindings).

**Cross-Workspace Event Bus**: EventEmitter3-based event system that broadcasts state changes across workspace boundaries.

**Credential Vault**: Secure storage for API keys using AES-256-GCM encryption and PBKDF2 key derivation.

**Dexie.js**: IndexedDB abstraction library providing a simpler API for browser database operations.

**File System Access API**: Browser API for reading/writing local files with user permission.

**Hot-Reload Visibility Bug**: (FIXED) Issue where configuration changes were invisible until navigation due to `useState` instead of Zustand.

**Session Trust**: Ephemeral permission grants cleared on browser reload.

**Sync Manager**: Orchestrates file synchronization between Local FS and WebContainer.

**Tool Permission Manager**: Facade over Zustand store for managing tool execution trust levels.

**WebContainer**: Stackblitz technology for running Node.js in the browser via WebAssembly.

**Workspace Binding**: Configuration that determines which agents/tools are available in which workspaces.

**Zustand**: Lightweight state management library with middleware support for persistence.

---

## Appendix B: References

**Documentation:**
- `_bmad-output/architecture-analysis/complete-system-architecture-analysis-2026-01-01.md`
- `_bmad-output/project-planning-artifacts/architecture.md`
- `_bmad-output/project-planning-artifacts/prd.md`

**Code Analysis:**
- Ralph Loop Cycle 12, Iteration 17 (2026-01-01)
- Three Centralized Systems Analysis (2026-01-01)

**Technical Stack:**
- TanStack Router: https://tanstack.com/router
- Zustand: https://zustand-demo.pmnd.rs
- Dexie.js: https://dexie.org
- WebContainer: https://webcontainers.io

---

**Document End**

**Next Review Date:** 2026-02-01
**Maintainer:** Development Team
**Version History:**
- v1.0.0 (2026-01-01): Initial release - Complete system architecture reference
