---
date: 2026-01-01
time: 00:00:00
phase: Phase 2 - Implementation
team: Orchestrator
agent_mode: bmad-bmm-architect
version: 1.0
last_updated: 2026-01-01
---

# Centralized Systems Architecture Analysis
## Single-Source-of-Truth Audit for Via-gent (Project Alpha v2.0)

**Analysis Date:** 2026-01-01
**Focus:** LLM Provider Configuration, Agent Configuration, Tool Permissions, Store Architecture
**Exploration Level:** Very Thorough
**Status:** ✅ COMPLETE

---

## Executive Summary

The Via-gent codebase exhibits **mixed compliance** with single-source-of-truth architecture principles across its centralized systems. While the credential vault and provider systems demonstrate strong architectural patterns, significant architectural violations exist in store organization and tool permission management.

### Critical Findings

| System | Architecture | SSOT Compliance | Priority | Issues |
|--------|-------------|-----------------|----------|---------|
| **LLM Provider Config** | ✅ Layered + Vault | ✅ **EXCELLENT** | - | Well-architected |
| **Agent Config** | ⚠️ Split Stores | ⚠️ **MODERATE** | P1 | Duplication risks |
| **Tool Permissions** | ❌ Singleton + In-Memory | ❌ **POOR** | P0 | No persistence, no workspace scoping |
| **Store Architecture** | ❌ Scattered + Duplicated | ❌ **CRITICAL** | P0 | 50+ stores, architectural violations |

---

## Table of Contents

1. [LLM Provider Configuration System](#1-llm-provider-configuration-system)
2. [Agent Configuration System](#2-agent-configuration-system)
3. [Tools Use Permissions](#3-tools-use-permissions)
4. [Store Architecture](#4-store-architecture)
5. [Architectural Gaps Assessment](#5-architectural-gaps-assessment)
6. [December 2025 Pattern Compliance](#6-december-2025-pattern-compliance)
7. [Recommendations](#7-recommendations)

---

## 1. LLM Provider Configuration System

### 1.1 Current Architecture

**Location:** `/src/lib/agent/providers/`

**Components:**
```
src/lib/agent/providers/
├── credential-vault.ts          # Public API facade (468 lines)
├── credential-storage.ts        # IndexedDB operations
├── credential-encryption.ts     # AES-256-GCM encryption
├── model-registry.ts            # Dynamic model discovery
├── provider-adapter.ts          # Provider abstraction
├── anthropic-adapter.ts         # Anthropic implementation
└── types.ts                     # Shared types
```

### 1.2 Architecture Analysis

#### ✅ **STRENGTHS: Single-Source-of-Truth Design**

**1. Credential Vault Architecture (EXEMPLARY)**

The credential vault implements a **3-layer architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│         CredentialVault (Public API Facade)             │
│  - Vault lifecycle (init, clear, status)                │
│  - Orchestrates storage + encryption                    │
│  - Singleton export: credentialVault                    │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│  Credential  │  │  Credential      │
│   Storage    │  │   Encryption     │
│  (IndexedDB) │  │  (AES-256-GCM)   │
└──────────────┘  └──────────────────┘
```

**Key Architectural Patterns:**

1. **Facade Pattern:** `credential-vault.ts` provides clean public API
2. **Separation of Concerns:** Storage vs Encryption vs Orchestration
3. **Singleton Pattern:** Default export `credentialVault` for global access
4. **Security-First Design:**
   - AES-256-GCM encryption
   - PBKDF2-SHA256 key derivation
   - Salt + IV + Authentication tag
   - Master key encrypted with vault password

**2. Storage Key Strategy**

```typescript
// Obfuscated storage keys to reduce XSS targetability
const ENCRYPTED_KEY_STORAGE = 'vg_ek_v3';
const SALT_STORAGE = 'vg_salt_v3';
const KEY_VERSION_STORAGE = 'vg_kv_v3';
const VAULT_PASSWORD_STORAGE = 'vg_vp_v3';
```

**Version:** `v3` indicates maturity and evolution.

**3. Provider Adapter Factory (GOOD)**

```typescript
// Centralized adapter creation
export class ProviderAdapterFactory {
    createAdapter(providerId, config) {
        switch(providerId) {
            case 'anthropic': return new AnthropicAdapter(config);
            case 'openrouter': return new OpenRouterAdapter(config);
            // Single point for adapter instantiation
        }
    }
}
```

**Singleton Export:**
```typescript
export const providerAdapterFactory = new ProviderAdapterFactory();
```

**4. Model Registry (GOOD)**

```typescript
export class ModelRegistry {
    private cache = new Map<string, CacheEntry>();

    async getModels(providerId: string, apiKey?: string): Promise<ModelInfo[]> {
        // Cache-first approach
        const cached = this.cache.get(providerId);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            return cached.models;
        }

        // Fallback to defaults if no API key
        if (!apiKey) {
            return this.getDefaultModels(providerId);
        }

        // Fetch from provider APIs
        const models = await this.fetchFromAPI(providerId, apiKey);
        this.cache.set(providerId, { models, fetchedAt: Date.now() });
        return models;
    }
}

export const modelRegistry = new ModelRegistry();
```

**Caching Strategy:**
- In-memory Map for 5-minute TTL
- Graceful fallback to hardcoded defaults
- API-first when credentials available

### 1.3 Hot-Reload Implementation

**Provider Store:** `/src/lib/state/provider-store.ts` (245 lines)

**State Architecture:**
```typescript
interface ProviderState {
    providers: ProviderConfig[];
    activeProviderId: string | null;
    modelSettings: Record<string, ModelSettings>;
    availableModels: Record<string, ModelInfo[]>;
    isLoading: boolean;
    isLoadingModels: Record<string, boolean>;

    // Actions
    addProvider: (config) => void;
    updateProvider: (id, config) => void;
    removeProvider: (id) => Promise<void>;
    setActiveProvider: (id) => void;
    updateModelSettings: (providerId, settings) => void;
    fetchModels: (providerId) => Promise<void>;
}
```

**Persistence:**
```typescript
export const useProviderStore = create<ProviderState>()(
    persist(
        (set, get) => ({ /* ... */ }),
        {
            name: 'via-gent-providers',
            storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
            partialize: (state) => ({
                providers: state.providers,
                activeProviderId: state.activeProviderId,
                modelSettings: state.modelSettings
            })
        }
    )
);
```

**Hot-Reload Mechanism:**
- ✅ Zustand persist middleware
- ✅ Dexie.js storage adapter (IndexedDB)
- ✅ ~100ms sync time (NFR-PERF-08)
- ✅ Cross-workspace event bus integration (RL4-2026-01-01)

**Cross-Workspace Events:**
```typescript
// RL4-2026-01-01: Emit events after model fetch
fetchModels: async (providerId) => {
    const models = await modelRegistry.getModels(providerId, apiKey);
    set({ availableModels: { ...state.availableModels, [providerId]: models }});

    crossWorkspaceEventBus.emitModelsUpdated({
        workspaceId: detectWorkspace(),
        providerId,
        models
    });
}
```

### 1.4 Single-Source-of-Truth Assessment

| Aspect | Location | SSOT? | Notes |
|--------|----------|-------|-------|
| **API Keys** | `CredentialVault` (IndexedDB) | ✅ YES | Single vault, encrypted |
| **Provider Config** | `useProviderStore` | ✅ YES | Zustand + Dexie persistence |
| **Available Models** | `ModelRegistry` cache | ✅ YES | Singleton, cached |
| **Adapter Factory** | `providerAdapterFactory` | ✅ YES | Singleton export |
| **Type Definitions** | `types.ts` | ✅ YES | Shared across all modules |

**VERDICT:** ✅ **EXCELLENT** - This system demonstrates exemplary SSOT architecture.

---

## 2. Agent Configuration System

### 2.1 Current Architecture

**Location:** `/src/stores/agents-store.ts` (430 lines)

**State Interface:**
```typescript
interface AgentsState {
    // State
    agents: Agent[];
    activeAgentId: string | null;
    _hasHydrated: boolean;

    // CRUD Actions
    addAgent: (agent) => Agent;
    removeAgent: (id) => void;
    updateAgent: (id, updates) => void;
    getAgent: (id) => Agent | undefined;
    setActiveAgent: (id) => void;

    // Workspace Filtering (Ralph Loop Gap Resolution)
    getAgentsForWorkspace: (workspaceType) => Agent[];
    updateWorkspaceBinding: (agentId, workspaceType, isAvailable) => void;
    updateAgentWorkspaceBinding: (agentId, workspaceType, binding) => void;
    getAgentWorkspaceBinding: (agentId, workspaceType) => WorkspaceBinding | undefined;
    isAgentAvailableInWorkspace: (agentId, workspaceType) => boolean;
}
```

**Persistence:**
```typescript
export const useAgentsStore = create<AgentsState>()(
    persist(
        (set, get) => ({ /* ... */ }),
        {
            name: 'agent-configs',
            storage: createJSONStorage(() => createDexieStorage('agentConfigs')),
            partialize: (state) => ({
                agents: state.agents,
                activeAgentId: state.activeAgentId
            })
        }
    )
);
```

### 2.2 Agent Entity Structure

**Schema (from `/src/core/entities/Agent`):**
```typescript
interface Agent {
    id: string;
    name: string;
    description: string;

    // Provider + Model references (foreign keys)
    providerId: string;
    modelId: string;

    // LLM Parameters
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
    topK?: number;

    // Tool bindings
    tools: AgentToolBinding[];

    // Workspace bindings
    workspaceBindings: WorkspaceBinding[];

    // Metadata
    status: 'online' | 'offline' | 'busy';
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;
    createdAt: string;
}
```

### 2.3 Architectural Issues

#### ⚠️ **MODERATE: Store Location Violation**

**Issue:** Agent store is located in `/src/stores/` instead of `/src/lib/state/`

**Inconsistency:**
- All other Zustand stores: `/src/lib/state/*.ts` (ide-store, provider-store, navigation-store, etc.)
- Agent store: `/src/stores/agents-store.ts`

**Impact:**
- Architectural confusion
- Difficult to discover for developers
- Inconsistent import patterns

**Evidence:**
```typescript
// Inconsistent import patterns across codebase
import { useAgentsStore } from '@/stores/agents-store';           // /src/stores/
import { useProviderStore } from '@/lib/state/provider-store';    // /src/lib/state/
import { useIDEStore } from '@/lib/state/ide-store';              // /src/lib/state/
```

#### ⚠️ **MODERATE: Duplication with Infrastructure Layer**

**Duplicate Store Found:** `/src/infrastructure/persistence/stores/agents/agent-selection-store.ts`

**File Listing:**
```bash
src/stores/agents-store.ts                        # Main agent config store
src/stores/agent-selection-store.ts               # Selected agent state
src/infrastructure/persistence/stores/agents/agent-selection-store.ts  # DUPLICATE
```

**Impact:**
- Potential for conflicting implementations
- Architectural boundary violation (infrastructure should not define stores)
- Confusion about which store to use

#### ✅ **GOOD: Workspace Binding Support**

**Ralph Loop Gap Resolution:**
```typescript
// Workspace-specific agent availability
getAgentsForWorkspace: (workspaceType: WorkspaceType) => Agent[];

// Update workspace binding
updateAgentWorkspaceBinding: (
    agentId: string,
    workspaceType: WorkspaceType,
    binding: Partial<WorkspaceBinding>
) => void;
```

**Cross-Workspace Events (WB-8.3):**
```typescript
addAgent: (agentData) => {
    const newAgent: Agent = { /* ... */ };
    set((state) => ({ agents: [...state.agents, newAgent] }));

    // Emit cross-workspace event
    const currentWorkspace = useWorkspaceStore.getState().currentWorkspace;
    crossWorkspaceEventBus.emitAgentConfigChange({
        workspaceId: currentWorkspace,
        agentId: newAgent.id,
        changeType: 'created'
    });
}
```

**Hot-Reload Fix (BF-01):**
- ✅ Removed local `useState` in `AgentConfigDialog`
- ✅ Now reads directly from store
- ✅ Emits events on mutations

### 2.4 Provider-Model Relationship Validation

**STORY AC-02 Validation:**
```typescript
addAgent: (agentData) => {
    const { providerId, modelId } = agentData;

    // Validate: model must belong to provider
    const availableModels = useProviderStore.getState().availableModels;
    const providerModels = availableModels[providerId] || [];
    const modelExists = providerModels.some(m => m.id === modelId);

    if (!modelExists) {
        throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
    }

    // ... proceed with agent creation
}
```

**VERDICT:** ✅ **GOOD** - Enforces foreign key constraints at store level.

### 2.5 Single-Source-of-Truth Assessment

| Aspect | Location | SSOT? | Notes |
|--------|----------|-------|-------|
| **Agent Configs** | `useAgentsStore` | ⚠️ YES | But wrong directory |
| **Agent Selection** | `useAgentSelectionStore` | ❌ DUPLICATE | Two locations |
| **Provider-Model Validation** | `useProviderStore` + `useAgentsStore` | ✅ YES | Cross-store validation |
| **Workspace Bindings** | `useAgentsStore` | ✅ YES | Centralized |
| **Tool Bindings** | `Agent.tools` array | ⚠️ PARTIAL | No centralized tool registry |

**VERDICT:** ⚠️ **MODERATE** - Functional but architecturally inconsistent.

---

## 3. Tools Use Permissions

### 3.1 Current Architecture

**Location:** `/src/lib/agent/tool-permission-manager.ts` (339 lines)

**Architecture:**
```typescript
export class ToolPermissionManager {
    private static instance: ToolPermissionManager | null = null;

    // Persisted trust levels
    private trustLevels: Map<string, ToolTrustLevel> = new Map();

    // Session-based trust (in-memory only)
    private sessionTrust: Set<string> = new Set();

    // Event emitter
    private eventBus: any | null = null;

    // Default trust levels
    private readonly defaultTrustLevels: Record<string, ToolTrustLevel> = {
        read_file: 'auto',
        list_files: 'auto',
        read_directory: 'auto',
        write_file: 'prompt',
        create_directory: 'prompt',
        delete_file: 'block',
        execute_command: 'prompt',
    };
}
```

### 3.2 Critical Architectural Violations

#### ❌ **CRITICAL: No Persistence**

**Issue:** Trust levels are stored in-memory and lost on page reload

**Evidence:**
```typescript
export class ToolPermissionManager {
    private trustLevels: Map<string, ToolTrustLevel> = new Map();
    private sessionTrust: Set<string> = new Set();

    // NO PERSISTENCE LAYER
    // NO IndexedDB
    // NO localStorage
    // NO Zustand store
}
```

**Serialization Methods Exist But Not Used:**
```typescript
public toJSON(): string {
    const permissions: Record<string, ToolTrustLevel> = {};
    this.trustLevels.forEach((level, toolId) => {
        permissions[toolId] = level;
    });
    return JSON.stringify({ permissions });
}

public static fromJSON(json: string): ToolPermissionManager {
    // Deserialization logic exists
    // BUT NO AUTOMATIC PERSISTENCE
}
```

**Impact:**
- P0: Users must re-configure permissions on every session
- P0: Security settings not durable
- P0: Poor UX for workspace-specific permissions

#### ❌ **CRITICAL: No Workspace Scoping**

**Issue:** Permissions are global, not workspace-specific

**Evidence:**
```typescript
// Current API
public checkPermission(toolId: string): PermissionCheckResult {
    const trustLevel = this.trustLevels.get(toolId) ?? 'prompt';
    const hasSession = this.sessionTrust.has(toolId);

    // NO workspace parameter
    // NO workspace-specific logic
}
```

**Expected API (for workspace support):**
```typescript
// SHOULD BE
public checkPermission(toolId: string, workspaceType: WorkspaceType): PermissionCheckResult {
    const trustLevel = this.getTrustLevelForWorkspace(toolId, workspaceType);
    // ...
}
```

**Impact:**
- P0: Cannot have different permissions for IDE vs Knowledge vs Study workspace
- P0: Violates multi-workspace architecture principles
- P1: Inconsistent with agent workspace bindings

#### ❌ **CRITICAL: Singleton Pattern Misuse**

**Issue:** Global singleton prevents workspace-specific instances

**Evidence:**
```typescript
export class ToolPermissionManager {
    private static instance: ToolPermissionManager | null = null;

    public static getInstance(): ToolPermissionManager {
        if (!ToolPermissionManager.instance) {
            ToolPermissionManager.instance = new ToolPermissionManager();
        }
        return ToolPermissionManager.instance;
    }
}
```

**Problem:**
- Only ONE permission manager instance for entire app
- Cannot have workspace-specific permissions
- Cannot test in isolation without singleton reset

### 3.3 Agent Tool Bindings

**Location:** `Agent.tools` array in agent config

**Structure:**
```typescript
interface AgentToolBinding {
    toolId: string;
    toolName: string;
    isEnabled: boolean;
    workspacePermissions: {
        ide: boolean;
        knowledge: boolean;
        study: boolean;
        notes: boolean;
    };
}
```

**Hardcoded in AgentConfigDialog:**
```typescript
const [tools, setTools] = useState<AgentToolBinding[]>([
    { toolId: 'read_file', toolName: 'Read File', isEnabled: true, workspacePermissions: { ide: true, knowledge: true, study: true, notes: true } },
    { toolId: 'write_file', toolName: 'Write File', isEnabled: true, workspacePermissions: { ide: true, knowledge: false, study: false, notes: true } },
    // ... 8 tools hardcoded
]);
```

**Issues:**
- ❌ Tool list hardcoded in dialog component
- ❌ No centralized tool registry
- ❌ No tool metadata (description, risk level, category)
- ❌ Inconsistent with `ToolPermissionManager` default trust levels

### 3.4 Missing Centralized Tool Registry

**Expected Architecture:**
```typescript
// SHOULD EXIST: /src/lib/agent/tools/tool-registry.ts
interface ToolDefinition {
    id: string;
    name: string;
    description: string;
    category: 'file' | 'terminal' | 'knowledge' | 'study';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    defaultTrustLevel: ToolTrustLevel;
    workspaceAvailability: {
        ide: boolean;
        knowledge: boolean;
        study: boolean;
        notes: boolean;
    };
}

export class ToolRegistry {
    private tools: Map<string, ToolDefinition>;

    registerTool(tool: ToolDefinition): void;
    getTool(toolId: string): ToolDefinition | undefined;
    getToolsForWorkspace(workspaceType: WorkspaceType): ToolDefinition[];
    getDefaultTrustLevel(toolId: string): ToolTrustLevel;
}
```

**Current State:**
- ❌ No centralized tool registry
- ❌ Tool definitions scattered across multiple files
- ❌ No tool metadata or categorization
- ❌ Inconsistent default trust levels

### 3.5 Single-Source-of-Truth Assessment

| Aspect | Location | SSOT? | Notes |
|--------|----------|-------|-------|
| **Tool Definitions** | Scattered across files | ❌ NO | Hardcoded in dialogs |
| **Trust Levels** | `ToolPermissionManager` (in-memory) | ❌ NO | Lost on reload |
| **Session Trust** | `ToolPermissionManager.sessionTrust` | ❌ NO | In-memory only |
| **Default Trust Levels** | `ToolPermissionManager` hardcoded | ⚠️ PARTIAL | Not shared with registry |
| **Workspace Permissions** | `Agent.tools[].workspacePermissions` | ⚠️ PARTIAL | Per-agent, not global |
| **Tool Registry** | DOES NOT EXIST | ❌ NO | Critical gap |

**VERDICT:** ❌ **POOR** - Major architectural violations requiring redesign.

---

## 4. Store Architecture

### 4.1 Complete Store Inventory

**Total Stores Found:** **50+ store files** across 3 directories

**Distribution:**
```
/src/lib/state/                    # 20 stores (canonical location)
/src/stores/                       # 5 stores (legacy location)
/src/infrastructure/persistence/stores/  # 25+ stores (architectural violation)
```

**Detailed Inventory:**

#### `/src/lib/state/` (Canonical Location - 20 stores)
```
ide-store.ts
provider-store.ts
navigation-store.ts
statusbar-store.ts
conversation-store.ts
conversation-auto-restore.ts
canvas-store.ts
rag-store.ts
rag-store-types.ts
rag-store-helpers.ts
hub-store.ts
knowledge-store.ts
quiz-store.ts
quiz-history-store.ts
study-store.ts
flashcard-store.ts
layout-store.ts
workspace-store.ts
dexie-db-*.ts (4 files)
```

#### `/src/stores/` (Legacy Location - 5 stores)
```
agents-store.ts                    # P1: Should be in /lib/state/
agent-selection-store.ts           # P1: Should be in /lib/state/
auto-approve-store.ts              # P1: Should be in /lib/state/
conversation-threads-store.ts      # P1: Should be in /lib/state/
models-loader-store.ts             # P1: Should be in /lib/state/
prompt-enhancement-store.ts        # P1: Should be in /lib/state/
openai-compatible-store.ts         # P1: Should be in /lib/state/
```

#### `/src/infrastructure/persistence/stores/` (Architectural Violation - 25+ stores)
```
agents/agent-selection-store.ts    # P0: DUPLICATE of /src/stores/
auto-approve-store.ts              # P0: DUPLICATE of /src/stores/
canvas-store.ts                    # P0: DUPLICATE of /src/lib/state/
conversation-threads-store.ts      # P0: DUPLICATE of /src/stores/
conversation-auto-restore.ts       # P0: DUPLICATE of /src/lib/state/
conversation/conversation-store.ts # P0: DUPLICATE of /src/lib/state/
flashcard-store.ts                 # P0: DUPLICATE of /src/lib/state/
hub-store.ts                       # P0: DUPLICATE of /src/lib/state/
knowledge-store.ts                 # P0: DUPLICATE of /src/lib/state/
layout-store.ts                    # P0: DUPLICATE of /src/lib/state/
navigation-store.ts                # P0: DUPLICATE of /src/lib/state/
openai-compatible-store.ts         # P0: DUPLICATE of /src/stores/
prompt-enhancement-store.ts        # P0: DUPLICATE of /src/stores/
quiz-history-store.ts              # P0: DUPLICATE of /src/lib/state/
quiz/quiz-store.ts                 # P0: DUPLICATE of /src/lib/state/
rag/rag-store.ts                   # P0: DUPLICATE of /src/lib/state/
rag-store.ts                       # P0: DUPLICATE of /src/lib/state/
statusbar-store.ts                 # P0: DUPLICATE of /src/lib/state/
study-store.ts                     # P0: DUPLICATE of /src/lib/state/
```

#### Additional Store-Like Files
```
/src/lib/workspace/
  ├── ide-state-store.ts           # P2: Legacy compatibility layer
  ├── conversation-store.ts        # P2: DUPLICATE
  ├── file-sync-status-store.ts    # P2: Ephemeral state (appropriate)
  ├── project-store.ts             # P2: IndexedDB wrapper (appropriate)
  └── threads-store.ts             # P2: DUPLICATE

/src/lib/filesystem/
  └── file-snapshot-store.ts       # P2: Specialized cache (appropriate)

/src/lib/notes/
  ├── note-store.ts                # P2: Feature-specific (appropriate)
  ├── note-navigation-store.ts     # P2: Feature-specific (appropriate)
  └── ai-prompt-store.ts           # P2: Feature-specific (appropriate)

/src/lib/events/
  └── store-events.ts              # P2: Event utilities (appropriate)
```

### 4.2 Architectural Layer Violations

**4-Layer Architecture (Expected):**

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Presentation (/src/presentation/)            │
│  - Components, UI, hooks                               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Domain (/src/core/, /src/domain/)           │
│  - Entities, value objects, business logic             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Application (/src/lib/)                      │
│  - Use cases, orchestration, STORES LIVE HERE          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Infrastructure (/src/infrastructure/)        │
│  - External integrations, persistence adapters          │
│  - SHOULD NOT DEFINE STORES                            │
└─────────────────────────────────────────────────────────┘
```

**Current Violations:**

| Violation | Severity | Issue |
|-----------|----------|-------|
| `/src/infrastructure/persistence/stores/` | **P0 CRITICAL** | Infrastructure layer defining stores (Layer 4 invading Layer 3) |
| `/src/stores/` | **P1 HIGH** | Stores outside canonical location |
| Duplicate stores | **P0 CRITICAL** | Same store in multiple locations |

### 4.3 Store Duplication Matrix

**Duplicated Stores (P0):**

| Store Name | Location 1 | Location 2 | Location 3 | Impact |
|------------|-----------|-----------|-----------|---------|
| `agent-selection-store` | `/src/stores/` | `/src/infrastructure/persistence/stores/agents/` | - | Conflicting imports |
| `conversation-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/conversation/` | `/src/lib/workspace/` | 3-way duplication |
| `canvas-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `hub-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `knowledge-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `layout-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `navigation-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `rag-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/rag/` | `/src/infrastructure/persistence/stores/` | 3-way duplication |
| `statusbar-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `quiz-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/quiz/` | - | Conflicting imports |
| `study-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `flashcard-store` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `auto-approve-store` | `/src/stores/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `conversation-threads-store` | `/src/stores/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `prompt-enhancement-store` | `/src/stores/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `openai-compatible-store` | `/src/stores/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |
| `conversation-auto-restore` | `/src/lib/state/` | `/src/infrastructure/persistence/stores/` | - | Conflicting imports |

**Total Duplicated Stores:** **17 stores with 2+ locations**

### 4.4 Store Persistence Patterns

**Zustand + Dexie (Preferred Pattern):**
```typescript
export const useExampleStore = create<ExampleState>()(
    persist(
        (set, get) => ({ /* state */ }),
        {
            name: 'via-gent-example',
            storage: createJSONStorage(() => createDexieStorage('exampleTable')),
            partialize: (state) => ({ /* persist only essential fields */ }),
            onRehydrateStorage: () => (state) => { /* hydration logic */ }
        }
    )
);
```

**Compliance:**
- ✅ `useIDEStore`: Zustand + Dexie
- ✅ `useProviderStore`: Zustand + Dexie
- ✅ `useAgentsStore`: Zustand + Dexie
- ✅ `useNavigationStore`: Zustand + Dexie
- ❌ `useStatusBarStore`: In-memory only (appropriate for ephemeral state)
- ❌ `useFileSyncStatusStore`: In-memory only (appropriate for ephemeral state)

**Ephemeral Stores (Appropriate):**
- `useStatusBarStore`: Transient UI state (no persistence needed)
- `useFileSyncStatusStore`: Real-time sync progress (no persistence needed)

### 4.5 Single-Source-of-Truth Assessment

| Aspect | SSOT? | Notes |
|--------|-------|-------|
| **Store Location** | ❌ NO | 3 different directories |
| **Store Duplication** | ❌ NO | 17 duplicated stores |
| **Layer Separation** | ❌ NO | Infrastructure layer defining stores |
| **Canonical Location** | ⚠️ PARTIAL | `/src/lib/state/` exists but not enforced |
| **Persistence Pattern** | ✅ YES | Zustand + Dexie consistent |
| **Ephemeral State** | ✅ YES | Appropriate non-persisted stores |

**VERDICT:** ❌ **CRITICAL** - Major architectural violations requiring cleanup.

---

## 5. Architectural Gaps Assessment

### 5.1 Critical Gaps (P0)

| Gap ID | Description | Impact | System Affected |
|--------|-------------|--------|-----------------|
| **GAP-001** | Tool permissions not persisted | Users must reconfigure on every reload | Tool Permissions |
| **GAP-002** | No workspace-scoped tool permissions | Cannot have different permissions per workspace | Tool Permissions |
| **GAP-003** | 17 duplicated stores across 3 directories | Conflicting imports, architectural confusion | Store Architecture |
| **GAP-004** | Infrastructure layer defining stores | Violates 4-layer architecture | Store Architecture |
| **GAP-005** | No centralized tool registry | Tool definitions scattered, no metadata | Tool Permissions |

### 5.2 High Priority Gaps (P1)

| Gap ID | Description | Impact | System Affected |
|--------|-------------|--------|-----------------|
| **GAP-006** | Agent store in wrong directory (`/src/stores/`) | Architectural inconsistency | Agent Config |
| **GAP-007** | Agent selection store duplicated | Potential for conflicting implementations | Agent Config |
| **GAP-008** | IDEStore partially duplicated in legacy layer | Migration incomplete | IDE State |
| **GAP-009** | Tool permission manager singleton pattern | Cannot support workspace-specific instances | Tool Permissions |
| **GAP-010** | No tool metadata or categorization | Cannot display rich tool info to users | Tool Permissions |

### 5.3 Medium Priority Gaps (P2)

| Gap ID | Description | Impact | System Affected |
|--------|-------------|--------|-----------------|
| **GAP-011** | Tool definitions hardcoded in `AgentConfigDialog` | Difficult to add new tools | Tool Permissions |
| **GAP-012** | Inconsistent trust levels between manager and agent config | User confusion | Tool Permissions |
| **GAP-013** | No tool discovery mechanism | Tools not self-documenting | Tool Permissions |
| **GAP-014** | Missing tool lifecycle hooks | Cannot hook into tool execution | Tool Permissions |
| **GAP-015** | No tool audit trail | Cannot track tool usage history | Tool Permissions |

---

## 6. December 2025 Pattern Compliance

### 6.1 4-Layer Architecture Compliance

**Expected Architecture:**
```
Layer 1: Presentation  (/src/presentation/)
Layer 2: Domain        (/src/core/, /src/domain/)
Layer 3: Application   (/src/lib/)              ← STORES LIVE HERE
Layer 4: Infrastructure (/src/infrastructure/)  ← SHOULD NOT DEFINE STORES
```

**Compliance Assessment:**

| Component | Location | Expected Layer | Compliance | Notes |
|-----------|----------|----------------|------------|-------|
| `CredentialVault` | `/src/lib/agent/providers/` | Layer 3 (Application) | ✅ YES | Correct |
| `ModelRegistry` | `/src/lib/agent/providers/` | Layer 3 (Application) | ✅ YES | Correct |
| `useProviderStore` | `/src/lib/state/` | Layer 3 (Application) | ✅ YES | Correct |
| `useIDEStore` | `/src/lib/state/` | Layer 3 (Application) | ✅ YES | Correct |
| `useAgentsStore` | `/src/stores/` | Layer 3 (Application) | ❌ NO | Should be in /lib/state/ |
| **Infrastructure Stores** | `/src/infrastructure/persistence/stores/` | Layer 4 (Infrastructure) | ❌ CRITICAL | Violates layer separation |

**VERDICT:** ⚠️ **PARTIAL COMPLIANCE** - Most systems compliant, but major violations in infrastructure layer.

### 6.2 Component Size Limits (December 2025 Standards)

**Standard:** Max 500 lines per component file (from documentation)

**Compliance Assessment:**

| Component | Lines | Status | Notes |
|-----------|-------|--------|-------|
| `credential-vault.ts` | 468 | ✅ PASS | Within limit |
| `provider-store.ts` | 245 | ✅ PASS | Well under limit |
| `model-registry.ts` | 366 | ✅ PASS | Within limit |
| `agents-store.ts` | 430 | ✅ PASS | Within limit |
| `tool-permission-manager.ts` | 339 | ✅ PASS | Within limit |
| `AgentConfigDialog.tsx` | 443 | ✅ PASS | Within limit (refactored from 1,256 lines) |
| `provider-adapter.ts` | 279 | ✅ PASS | Within limit |

**Historical Refactoring:**
- `AgentConfigDialog`: 1,256 lines → 443 lines (P1-1g refactor to orchestrator pattern)

**VERDICT:** ✅ **COMPLIANT** - All centralized system components within size limits.

### 6.3 Single-Source-of-Truth Principles

**Principle 1:** One canonical location for each type of data

| Data Type | Canonical Location | Compliance | Notes |
|-----------|-------------------|------------|-------|
| **API Keys** | `CredentialVault` (IndexedDB) | ✅ YES | Excellent |
| **Provider Configs** | `useProviderStore` | ✅ YES | Excellent |
| **Available Models** | `ModelRegistry` cache | ✅ YES | Good (cached) |
| **Agent Configs** | `useAgentsStore` | ⚠️ PARTIAL | Wrong directory |
| **Tool Permissions** | `ToolPermissionManager` | ❌ NO | Not persisted |
| **IDE State** | `useIDEStore` | ⚠️ PARTIAL | Duplicated in IDELayout.tsx (known P0) |

**Principle 2:** No duplicate definitions of same data

| Data Type | Duplicates? | Severity | Notes |
|-----------|------------|----------|-------|
| **API Keys** | ❌ No | - | Clean |
| **Provider Configs** | ❌ No | - | Clean |
| **Agent Configs** | ⚠️ Partial | P1 | Duplicate store locations |
| **Tool Permissions** | ⚠️ Partial | P1 | Hardcoded in dialog |
| **Store Definitions** | ✅ Yes | P0 | 17 duplicated stores |

**VERDICT:** ⚠️ **MIXED** - Credential vault excellent, tool permissions poor, stores critical.

---

## 7. Recommendations

### 7.1 Immediate Actions (P0 - Sprint 13)

**ACTION-001: Fix Store Architecture Violations**
- **Priority:** P0 (Critical)
- **Effort:** 2-3 days
- **Approach:**
  1. Delete all stores in `/src/infrastructure/persistence/stores/`
  2. Migrate `/src/stores/*` to `/src/lib/state/*`
  3. Update all imports across codebase
  4. Add lint rule to prevent future violations
- **Impact:** Eliminates 17 duplicate stores, enforces layer separation

**ACTION-002: Persist Tool Permissions**
- **Priority:** P0 (Critical)
- **Effort:** 2 days
- **Approach:**
  1. Create `useToolPermissionStore` in `/src/lib/state/`
  2. Add Zustand + Dexie persistence
  3. Migrate existing `ToolPermissionManager` logic
  4. Keep singleton for backwards compatibility (deprecate)
- **Impact:** Permissions durable across sessions

**ACTION-003: Add Workspace-Scoped Tool Permissions**
- **Priority:** P0 (Critical)
- **Effort:** 1-2 days
- **Approach:**
  1. Extend permission store schema: `Map<workspaceType, Map<toolId, ToolTrustLevel>>`
  2. Update `checkPermission(toolId, workspaceType)` API
  3. Add UI for workspace-specific permission configuration
- **Impact:** Enables per-workspace security policies

**ACTION-004: Create Centralized Tool Registry**
- **Priority:** P0 (Critical)
- **Effort:** 2-3 days
- **Approach:**
  1. Define `ToolDefinition` interface with metadata
  2. Create `ToolRegistry` class in `/src/lib/agent/tools/`
  3. Register all tools on app initialization
  4. Expose registry to `AgentConfigDialog` for dynamic tool list
- **Impact:** Single source of truth for tool definitions

### 7.2 High Priority Actions (P1 - Sprint 14)

**ACTION-005: Migrate Agent Store to Canonical Location**
- **Priority:** P1 (High)
- **Effort:** 1 day
- **Approach:** Move `/src/stores/agents-store.ts` → `/src/lib/state/agents-store.ts`
- **Impact:** Architectural consistency

**ACTION-006: Consolidate Agent Selection Store**
- **Priority:** P1 (High)
- **Effort:** 0.5 day
- **Approach:** Delete `/src/infrastructure/persistence/stores/agents/agent-selection-store.ts`
- **Impact:** Removes duplicate

**ACTION-007: Remove IDELayout.tsx State Duplication**
- **Priority:** P1 (High - Already documented in P1.10 audit)
- **Effort:** 1-2 days
- **Approach:** Replace local `useState` with `useIDEStore` selectors
- **Impact:** Fixes known P0 state duplication issue

### 7.3 Medium Priority Actions (P2 - Sprint 15)

**ACTION-008: Refactor ToolPermissionManager to Non-Singleton**
- **Priority:** P2 (Medium)
- **Effort:** 1 day
- **Approach:**
  1. Remove singleton pattern
  2. Export factory function: `createToolPermissionManager(workspaceType)`
  3. Create workspace-specific instances in stores
- **Impact:** Enables workspace-specific permissions

**ACTION-009: Add Tool Metadata and Categorization**
- **Priority:** P2 (Medium)
- **Effort:** 1 day
- **Approach:**
  1. Extend `ToolDefinition` with: category, riskLevel, description
  2. Add tool discovery API
  3. Display rich tool info in permission UI
- **Impact:** Better UX for tool configuration

**ACTION-010: Implement Tool Audit Trail**
- **Priority:** P2 (Medium)
- **Effort:** 2 days
- **Approach:**
  1. Create `tool-execution-store` in `/src/lib/state/`
  2. Log all tool executions with: timestamp, agentId, toolId, result
  3. Add audit viewer UI
- **Impact:** Security compliance, debugging aid

### 7.4 Long-Term Architectural Improvements (P3 - Future)

**ACTION-011: Implement Tool Lifecycle Hooks**
- Add `beforeExecute`, `afterExecute`, `onError` hooks
- Enable plugins to extend tool behavior

**ACTION-012: Add Tool Discovery Mechanism**
- Auto-discover tools from file system
- Dynamic tool registration

**ACTION-013: Implement Tool Permission Templates**
- Pre-defined permission sets for common use cases
- "Security Level: Low", "Security Level: High", etc.

---

## 8. Implementation Roadmap

### Phase 1: Critical Fixes (Sprint 13 - Week 1)

**Goal:** Eliminate P0 architectural violations

| Story | Action | Effort | Dependencies |
|-------|--------|--------|--------------|
| **13-1** | Fix store architecture violations | 3 days | - |
| **13-2** | Persist tool permissions | 2 days | - |
| **13-3** | Add workspace-scoped permissions | 2 days | 13-2 |
| **13-4** | Create centralized tool registry | 3 days | - |

**Total Effort:** 10 days (2 sprint weeks)

### Phase 2: High Priority Cleanup (Sprint 14 - Week 2)

**Goal:** Achieve architectural consistency

| Story | Action | Effort | Dependencies |
|-------|--------|--------|--------------|
| **14-1** | Migrate agent store to canonical location | 1 day | - |
| **14-2** | Consolidate agent selection store | 0.5 day | 14-1 |
| **14-3** | Fix IDELayout state duplication (P1.10) | 2 days | - |

**Total Effort:** 3.5 days

### Phase 3: Enhancement (Sprint 15 - Week 3)

**Goal:** Add missing features

| Story | Action | Effort | Dependencies |
|-------|--------|--------|--------------|
| **15-1** | Refactor ToolPermissionManager to non-singleton | 1 day | 13-3 |
| **15-2** | Add tool metadata and categorization | 1 day | 13-4 |
| **15-3** | Implement tool audit trail | 2 days | - |

**Total Effort:** 4 days

---

## 9. Success Metrics

### 9.1 Quantitative Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| **Store Duplicates** | 17 stores | 0 stores | File count |
| **Store Locations** | 3 directories | 1 directory | Directory listing |
| **Persisted Permission Stores** | 0 | 1 | Dexie table count |
| **Workspace-Scoped Permissions** | No | Yes | API signature |
| **Tool Registry** | No | Yes | File existence |
| **Architectural Violations** | 25+ (P0+P1) | 0 | Audit checklist |

### 9.2 Qualitative Metrics

| Metric | Current | Target | Validation |
|--------|---------|--------|------------|
| **Store Discoverability** | Poor (scattered) | Excellent (single location) | Developer survey |
| **Permission Durability** | Lost on reload | Persistent across sessions | User testing |
| **Workspace Security** | Global permissions | Per-workspace permissions | Security audit |
| **Tool Configuration** | Hardcoded | Dynamic registry | Code inspection |
| **Layer Separation** | Violated | Clean 4-layer architecture | Architecture review |

---

## 10. Conclusion

### 10.1 Summary of Findings

**Strengths:**
- ✅ **LLM Provider Configuration** system is exemplary (credential vault, model registry, adapter factory)
- ✅ **Store Persistence** pattern is consistent (Zustand + Dexie)
- ✅ **Component Size** compliance excellent (all under 500 lines)
- ✅ **Hot-Reload** fixes implemented (BF-01 resolved)

**Critical Issues:**
- ❌ **Store Architecture** has 17 duplicated stores across 3 directories (P0)
- ❌ **Tool Permissions** not persisted and not workspace-scoped (P0)
- ❌ **Infrastructure Layer** violating 4-layer architecture by defining stores (P0)
- ❌ **No Centralized Tool Registry** for tool metadata and discovery (P0)

**High Priority Issues:**
- ⚠️ **Agent Store** in wrong directory (P1)
- ⚠️ **Agent Selection Store** duplicated (P1)
- ⚠️ **Tool Permission Manager** singleton pattern prevents workspace scoping (P1)

### 10.2 Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Data loss from store conflicts** | High | Critical | ACTION-001 (Fix store architecture) |
| **Permission reset on reload** | Certain | High | ACTION-002 (Persist permissions) |
| **Security breach from global permissions** | Medium | High | ACTION-003 (Workspace-scoped permissions) |
| **Developer confusion from scattered stores** | High | Medium | ACTION-001 (Fix store architecture) |
| **Inability to add new tools easily** | High | Medium | ACTION-004 (Create tool registry) |

### 10.3 Final Recommendation

**Immediate Priority:** Complete Phase 1 (Critical Fixes) in Sprint 13

**Rationale:**
1. Store architecture violations (17 duplicates) pose data integrity risks
2. Unpersisted tool permissions create poor UX and security risks
3. Missing workspace-scoped permissions blocks multi-workspace architecture
4. Tool registry needed for future extensibility

**Expected Outcome After Phase 1:**
- ✅ Single store location (`/src/lib/state/`)
- ✅ Durable, workspace-scoped tool permissions
- ✅ Centralized tool registry with metadata
- ✅ Clean 4-layer architecture compliance

**Next Steps:**
1. Review and approve this analysis
2. Create Sprint 13 stories from Phase 1 actions
3. Begin implementation with ACTION-001 (Fix store architecture)

---

## Appendix A: File Inventory

### A.1 Store Files (Complete List)

**See Section 4.1 for complete inventory of 50+ store files.**

### A.2 Provider System Files

```
/src/lib/agent/providers/
├── credential-vault.ts              (468 lines)
├── credential-storage.ts
├── credential-encryption.ts
├── model-registry.ts                (366 lines)
├── provider-adapter.ts              (279 lines)
├── anthropic-adapter.ts
├── agent-validation-service.ts
├── types.ts
└── __tests__/
    ├── credential-vault.test.ts
    ├── credential-storage.test.ts
    ├── credential-encryption.test.ts
    ├── encryption-compliance-validation.test.ts
    ├── provider-adapter.test.ts
    └── model-registry.test.ts
```

### A.3 Tool Permission Files

```
/src/lib/agent/
├── tool-permission-manager.ts       (339 lines)
└── tools/
    ├── read-file-tool.ts
    ├── write-file-tool.ts
    ├── list-files-tool.ts
    ├── execute-command-tool.ts
    ├── search-notes-tool.ts
    ├── synthesize-tool.ts
    ├── process-pdf-tool.ts
    ├── process-url-tool.ts
    ├── permission-check.ts
    ├── types.ts
    └── __tests__/
```

---

**End of Analysis**
