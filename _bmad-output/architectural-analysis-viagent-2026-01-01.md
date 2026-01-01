# Via-gent (Project Alpha v2.0) - Comprehensive Architectural Analysis
**Date:** 2026-01-01
**Analysis Scope:** Complete codebase architecture assessment
**Focus Areas:** Single-source-of-truth violations, integration gaps, technical debt, state management

---

## Executive Summary

This comprehensive analysis examines the Via-gent codebase architecture across 7 critical dimensions:

1. **LLM Provider Configuration** - API key storage and persistence
2. **Agent Configuration System** - Centralized agent vault
3. **Tools Permissions** - Workspace-specific permission management
4. **State Management** - Zustand stores and persistence layers
5. **Chat Flow Architecture** - Conversation and thread management
6. **File System Integration** - Local FS sync across workspaces
7. **Database Schema** - IndexedDB structure and entity organization

**Key Findings:**
- **50+ Zustand stores** across 3 different directory structures
- **Mixed persistence strategies** (IndexedDB, localStorage, in-memory)
- **Emerging single-source-of-truth patterns** with implementation gaps
- **Hot-reload visibility bugs** partially addressed (BF-01, WB-8.3)
- **Workspace-boundary enforcement** well-architected but incomplete

---

## 1. LLM Provider Configuration Analysis

### 1.1 Current Architecture

**Single Source of Truth:** ✅ **ACHIEVED**
- Location: `/src/lib/state/provider-store.ts` (useProviderStore)
- Persistence: IndexedDB via Dexie adapter
- API Keys: Secure storage in `/src/lib/agent/providers/credential-vault.ts`

**Implementation Details:**

```typescript
// /src/lib/state/provider-store.ts (lines 90-244)
export const useProviderStore = create<ProviderState>()(
    persist(
        (set, get) => ({
            providers: INITIAL_PROVIDERS,
            activeProviderId: INITIAL_ACTIVE_ID,
            modelSettings: {},
            availableModels: {},
            // ... state and actions
        }),
        {
            name: 'via-gent-providers',
            storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
        }
    )
);
```

**API Key Storage (Credential Vault):**

```typescript
// /src/lib/agent/providers/credential-vault.ts (lines 67-467)
export class CredentialVault {
    private masterKey: CryptoKey | null = null;
    private encryptionKey: CryptoKey | null = null;

    // AES-256-GCM encryption via Web Crypto API
    async storeCredentials(providerId: string, apiKey: string): Promise<void>
    async getCredentials(providerId: string): Promise<string | null>
    async deleteCredentials(providerId: string): Promise<void>
}

export const credentialVault = new CredentialVault();
```

### 1.2 Strengths

1. **Clean separation of concerns:**
   - `provider-store.ts` = Provider configuration (which providers exist)
   - `credential-vault.ts` = API key storage (secure encryption)
   - `model-registry.ts` = Model metadata (available models per provider)

2. **Recent refactor (WB-PR-2):**
   - Split credential-vault.ts into 3 modules:
     - `credential-storage.ts` (IndexedDB operations)
     - `credential-encryption.ts` (AES-256-GCM cryptography)
     - `credential-vault.ts` (Public API facade)

3. **Cross-workspace event emission:**
   - Provider changes emit events via `crossWorkspaceEventBus.emitModelsUpdated()`
   - Other workspaces auto-refresh provider models

### 1.3 Issues & Gaps

**P0 - Hot-Reload Visibility Bug (PARTIALLY FIXED):**

**Location:** `/src/presentation/components/agent/AgentConfigDialog.tsx`

**Issue:** When user configures API key in AgentConfigDialog:
1. Old code passed entire `agent` object as prop
2. Hot-reload from agents-store not reflected in dialog
3. User sees stale provider/model configuration

**Fix Applied (BF-01):**
```typescript
// OLD (before fix):
interface AgentConfigDialogProps {
  agent: Agent | null;  // Stale on hot-reload
}

// NEW (after fix):
interface AgentConfigDialogProps {
  agentId: string | null;  // Read from store by ID (single source of truth)
}
```

**Remaining Gap:** Some components may still use stale prop patterns. Need audit.

**P1 - Provider Deletion Validation (FIXED):**

**Location:** `/src/lib/state/provider-store.ts` (lines 114-149)

**Issue:** Deleting provider could orphan agents referencing it

**Fix Applied:**
```typescript
removeProvider: async (id) => {
    // Check for dependent agents before deleting
    const { useAgentsStore } = await import('@/stores/agents-store');
    const agents = useAgentsStore.getState().agents;
    const dependentAgents = agents.filter(agent => agent.providerId === id);

    if (dependentAgents.length > 0) {
        throw new Error(`Cannot delete provider "${id}". It is being used by ${dependentAgents.length} agent(s)`);
    }
}
```

**P2 - Model Fetching Error Handling:**

**Location:** `/src/lib/state/provider-store.ts` (lines 172-202)

**Issue:** `fetchModels()` doesn't provide fallback models on API failure

**Current Behavior:**
```typescript
fetchModels: async (providerId) => {
    // ... sets isLoadingModels: true
    try {
        const apiKey = await credentialVault.getCredentials(providerId);
        const models = await modelRegistry.getModels(providerId, apiKey || undefined);
        // ... sets availableModels
    } catch (error) {
        // Only resets loading state - doesn't provide fallback models
        set({ isLoadingModels: { ...state.isLoadingModels, [providerId]: false } });
        throw error;
    }
}
```

**Recommendation:** Implement fallback models from PROVIDERS registry in `/src/lib/agent/providers/types.ts`

### 1.4 Cross-Workspace Integration

**Event Bus Pattern (WB-8.3):**

```typescript
// /src/lib/events/cross-workspace-event-bus.ts
export class CrossWorkspaceEventBus {
    emitModelsUpdated(payload: ModelsUpdatedEvent): void
    emitProviderConfigChange(payload: ProviderConfigChangeEvent): void
}

// Provider store emits on fetchModels():
crossWorkspaceEventBus.emitModelsUpdated({
    workspaceId: detectWorkspace(),
    providerId,
    models,
});
```

**Impact:** All workspaces automatically refresh provider models when configuration changes.

---

## 2. Agent Configuration System Analysis

### 2.1 Current Architecture

**Single Source of Truth:** ✅ **ACHIEVED**
- Location: `/src/stores/agents-store.ts` (useAgentsStore)
- Persistence: IndexedDB via Dexie adapter
- Cross-workspace sync: Event-driven via `crossWorkspaceEventBus`

**Agent Schema (Sprint Change Proposal v2.0):**

```typescript
// /src/core/entities/Agent.ts
interface Agent {
    // Identity
    id: string;
    name: string;
    description: string;  // NOT 'role' (old schema)

    // Provider + Model (foreign keys to provider-store)
    providerId: string;   // NOT 'provider' (old schema)
    modelId: string;      // NOT 'model' (old schema)

    // LLM Parameters
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    topP: number;

    // Configuration
    tools: AgentToolBinding[];
    workspaceBindings: WorkspaceBinding[];

    // Metadata
    status: 'online' | 'offline';
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;
    createdAt: string;
}
```

### 2.2 Workspace Bindings (NEW)

**Location:** `/src/core/entities/Agent.ts` (lines 98-123)

```typescript
interface WorkspaceBinding {
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
    isAvailable: boolean;      // Agent can be used in this workspace
    uiVariant: 'full' | 'compact' | 'minimal';
    isDefault: boolean;        // Auto-select when entering workspace
}
```

**Default Bindings:**
```typescript
// /src/lib/agent/workspace-tool-filter.ts (lines 231-258)
export function getDefaultWorkspaceBindings(): WorkspaceBinding[] {
    return [
        { workspaceType: 'ide', isAvailable: true, uiVariant: 'full', isDefault: true },
        { workspaceType: 'knowledge', isAvailable: false, uiVariant: 'compact', isDefault: false },
        { workspaceType: 'study', isAvailable: false, uiVariant: 'compact', isDefault: false },
        { workspaceType: 'notes', isAvailable: false, uiVariant: 'compact', isDefault: false },
    ];
}
```

### 2.3 Tool Permissions (NEW)

**Location:** `/src/core/entities/Agent.ts` (lines 58-96)

```typescript
interface AgentToolBinding {
    toolId: string;           // 'read_file', 'write_file', etc.
    toolName: string;
    isEnabled: boolean;       // Master on/off switch
    needsApproval: boolean;   // Require user approval before execution
    workspacePermissions: {
        ide: boolean;
        knowledge: boolean;
        study: boolean;
        notes: boolean;
    };
}
```

**Default Permissions:**
```typescript
// /src/lib/agent/workspace-tool-filter.ts (lines 266-273)
export function getDefaultWorkspacePermissions() {
    return {
        ide: true,       // Tools enabled in IDE by default
        knowledge: false,
        study: false,
        notes: false,
    };
}
```

### 2.4 Cross-Workspace Agent Sync (WB-8.3)

**Event Emission Pattern:**

```typescript
// /src/stores/agents-store.ts (lines 187-193, 256-262)
addAgent: (agentData) => {
    // ... create agent
    crossWorkspaceEventBus.emitAgentConfigChange({
        workspaceId: useWorkspaceStore.getState().currentWorkspace,
        agentId: newAgent.id,
        changeType: 'created',
    });
}

updateAgent: (id, updates) => {
    // ... update agent
    crossWorkspaceEventBus.emitAgentConfigChange({
        workspaceId: useWorkspaceStore.getState().currentWorkspace,
        agentId: id,
        changeType: 'updated',
    });
}
```

**Event Listener Pattern:**

```typescript
// /src/lib/events/use-cross-workspace-events.ts
export function useCrossWorkspaceEvents() {
    useEffect(() => {
        const unsubscribers = [
            crossWorkspaceEventBus.onAgentConfigChange((event) => {
                // Refresh agent lists, provider models, etc.
                console.log('[CrossWorkspace] Agent config changed:', event);
            }),
            // ... other event listeners
        ];

        return () => unsubscribers.forEach(unsub => unsub());
    }, []);
}
```

### 2.5 Issues & Gaps

**P1 - Agent-Provider Validation (FIXED):**

**Location:** `/src/stores/agents-store.ts` (lines 152-172, 225-245)

**Issue:** Could create agent with invalid `modelId` that doesn't belong to `providerId`

**Fix Applied:**
```typescript
addAgent: (agentData) => {
    const { providerId, modelId } = agentData;

    // Validate model belongs to provider
    if (providerId && modelId) {
        const availableModels = useProviderStore.getState().availableModels;
        const providerModels = availableModels[providerId] || [];
        const modelExists = providerModels.some(m => m.id === modelId);

        if (!modelExists) {
            throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
        }
    }
    // ... create agent
}
```

**P2 - Workspace Filtering Incomplete:**

**Location:** `/src/stores/agents-store.ts` (lines 295-301)

**Issue:** `getAgentsForWorkspace()` exists but not widely used in UI

**Current Implementation:**
```typescript
getAgentsForWorkspace: (workspaceType: WorkspaceType) => {
    const { agents } = get();
    return agents.filter(agent => {
        const binding = agent.workspaceBindings.find(b => b.workspaceType === workspaceType);
        return binding?.isAvailable === true;
    });
}
```

**Gap Analysis:**
- ✅ Store has filtering logic
- ❌ AgentSelector component doesn't use it (uses full agent list)
- ❌ No UI indicator showing which workspace agent is configured for
- ❌ No validation preventing agent creation without all 4 workspace bindings

**Recommendation:**
1. Add workspace indicator badge to AgentSelector
2. Use `getAgentsForWorkspace()` in workspace-specific components
3. Add validation in `addAgent()` requiring complete workspaceBindings

**P3 - Agent Configuration Dialog Orphaned:**

**Location:** `/src/presentation/components/agent/AgentConfigDialog.tsx`

**Issue:** Complex 517-line file handling all agent configuration (basic, advanced, permissions tabs)

**Recommendation:** Split into:
- `AgentConfigBasic.tsx` (name, description, provider/model)
- `AgentConfigAdvanced.tsx` (LLM parameters, system prompt)
- `AgentConfigPermissions.tsx` (workspace bindings, tool permissions)

---

## 3. Tools Permissions Analysis

### 3.1 Current Architecture

**Single Source of Truth:** ⚠️ **SPLIT** (by design)
- `AgentToolBinding.workspacePermissions` (per-agent, per-tool, per-workspace)
- `ToolPermissionManager` (trust levels: auto-approve, session-trusted, blocked)
- `WorkspacePermissionManager` (composes both checks)

### 3.2 Permission Check Chain

**Location:** `/src/lib/agent/workspace-permission-manager.ts` (lines 79-146)

**Execution Order:**
```typescript
public checkWorkspacePermission(
    toolId: string,
    agentTools: AgentToolBinding[],
    agentBindings: WorkspaceBinding[],
    currentWorkspace: WorkspaceType
): WorkspacePermissionCheckResult {

    // Step 1: Check agent availability in workspace
    const agentBinding = agentBindings.find(b => b.workspaceType === currentWorkspace);
    if (!agentBinding?.isAvailable) {
        return { canExecute: false, reason: 'block', agentAvailableInWorkspace: false };
    }

    // Step 2: Check tool workspace permissions
    const toolBinding = agentTools.find(tool => tool.toolId === toolId);
    const enabledInWorkspace = toolBinding?.workspacePermissions[currentWorkspace] ?? false;
    if (!enabledInWorkspace) {
        return { canExecute: false, reason: 'block', enabledInWorkspace: false };
    }

    // Step 3: Check base permission manager (trust levels)
    const baseResult = this.basePermissionManager.checkPermission(toolId);
    return { ...baseResult, enabledInWorkspace: true, agentAvailableInWorkspace: true };
}
```

### 3.3 Tool Facade Integration

**Location:** `/src/lib/agent/facades/file-tools-impl.ts` (lines 55-100)

**Permission Check Before Execution:**
```typescript
export class FileToolsFacade implements AgentFileTools {
    private readonly permissionManager: ToolPermissionManager;

    private checkPermission(toolId: string): void {
        const result = this.permissionManager.checkPermission(toolId);

        if (!result.canExecute) {
            throw new ToolPermissionDeniedError(
                `The "${result.toolName}" tool is blocked by your security settings.`,
                result.toolName,
                result.reason
            );
        }
    }

    async readFile(path: string): Promise<string | null> {
        this.checkPermission('read_file');  // ⚠️ Check before execution
        // ... read file
    }

    async writeFile(path: string, content: string): Promise<void> {
        this.checkPermission('write_file');  // ⚠️ Check before execution
        // ... write file
    }
}
```

### 3.4 Issues & Gaps

**P1 - Workspace Permission Enforcement (PARTIAL):**

**Current State:**
- ✅ `WorkspacePermissionManager` has workspace-aware checks
- ✅ `FileToolsFacade` checks base permissions
- ❌ **Missing:** FileToolsFacade doesn't check workspace permissions

**Gap:**
```typescript
// /src/lib/agent/facades/file-tools-impl.ts (lines 106-109)
async readFile(path: string): Promise<string | null> {
    this.checkPermission('read_file');  // ✅ Checks base permission
    // ❌ Missing: checkWorkspacePermission() call
    // ... read file
}
```

**Fix Required:**
```typescript
async readFile(path: string, workspaceContext?: WorkspaceContext): Promise<string | null> {
    // Check base permission
    this.checkPermission('read_file');

    // Check workspace permission (if context provided)
    if (workspaceContext) {
        const workspaceCheck = this.workspacePermissionManager.checkWorkspacePermission(
            'read_file',
            this.agent.tools,
            this.agent.workspaceBindings,
            workspaceContext.workspaceType
        );
        if (!workspaceCheck.canExecute) {
            throw new ToolPermissionDeniedError(
                `Tool "${workspaceCheck.toolName}" is blocked in ${workspaceContext.workspaceType} workspace`,
                workspaceCheck.toolName,
                workspaceCheck.reason
            );
        }
    }
    // ... read file
}
```

**P2 - Tool Factory Integration Gap:**

**Location:** `/src/lib/agent/factory.ts` (612 lines)

**Issue:** Tool factory creates TanStack AI tools but doesn't filter by workspace

**Recommendation:** Add workspace context to tool factory:

```typescript
export function createAgentClientTools(options: ToolFactoryOptions) {
    const { agent, workspaceContext, permissionManager } = options;

    // Filter tools by workspace BEFORE creating TanStack AI tools
    const filteredTools = filterToolsForWorkspace(agent, workspaceContext, permissionManager);

    // Create only available tools
    return filteredTools.available.map(toolBinding => {
        return {
            [toolBinding.toolId]: {
            description: getToolDescription(toolBinding.toolId),
            parameters: getToolParameters(toolBinding.toolId),
            execute: async (input) => {
                // Check workspace permission again at execution time
                const executor = createWorkspaceAwareToolExecutor(
                    toolBinding.toolId,
                    agent,
                    workspaceContext,
                    permissionManager,
                    getToolExecutor(toolBinding.toolId)
                );
                return executor(input);
            }
        }
    };
    });
}
```

**P3 - Workspace-Aware Tool Executor Exists but Unused:**

**Location:** `/src/lib/agent/workspace-tool-filter.ts` (lines 137-171)

**Implementation:**
```typescript
export function createWorkspaceAwareToolExecutor<TInput, TResult>(
    toolId: string,
    agent: Agent,
    workspaceContext: WorkspaceContext,
    permissionManager: WorkspacePermissionManager,
    executeTool: (input: TInput) => Promise<TResult>
): (input: TInput) => Promise<TResult | ReturnType<typeof createBlockedToolResult>> {
    return async (input: TInput) => {
        const check = permissionManager.checkWorkspacePermission(
            toolId, agent.tools, agent.workspaceBindings, workspaceContext.workspaceType
        );

        if (!check.canExecute) {
            return createBlockedToolResult(toolId) as TResult;
        }

        if (!workspaceContext.workspaceReady) {
            return {
                success: false,
                error: 'Workspace not ready. Please open a folder or grant required permissions.',
                code: 'WORKSPACE_NOT_READY',
            } as TResult;
        }

        return executeTool(input);
    };
}
```

**Gap:** Factory doesn't use this wrapper when creating tools

---

## 4. State Management Analysis

### 4.1 Store Inventory

**Total:** 50+ Zustand stores across **3 different directory structures**

#### Directory Structure:

```
src/
├── stores/                          # Legacy location (12 stores)
│   ├── agents-store.ts             # ✅ Active (migrated to IndexedDB)
│   ├── conversation-threads-store.ts
│   ├── openai-compatible-store.ts
│   ├── prompt-enhancement-store.ts
│   ├── auto-approve-store.ts
│   ├── models-loader-store.ts
│   └── ... (6 more)
│
├── lib/state/                       # Core state (15 stores)
│   ├── provider-store.ts           # ✅ Active (IndexedDB)
│   ├── workspace-store.ts          # ✅ Active (localStorage)
│   ├── ide-store.ts                # ✅ Active (IndexedDB)
│   ├── conversation-store.ts       # ✅ Active (IndexedDB)
│   ├── rag-store.ts                # ✅ Active (877 lines - LARGE FILE)
│   ├── knowledge-store.ts          # ✅ Active (IndexedDB)
│   ├── canvas-store.ts             # ✅ Active
│   ├── quiz-store.ts               # ✅ Active (629 lines)
│   ├── study-store.ts              # ✅ Active
│   ├── flashcard-store.ts          # ✅ Active
│   ├── statusbar-store.ts          # ✅ Active (ephemeral)
│   ├── navigation-store.ts         # ✅ Active (ephemeral)
│   ├── layout-store.ts             # ✅ Active
│   └── ... (2 more)
│
└── infrastructure/persistence/stores/  # Migration target (20+ stores)
    ├── agents/agent-selection-store.ts
    ├── conversation/conversation-store.ts
    ├── conversation-threads-store.ts
    ├── rag-store.ts
    ├── knowledge-store.ts
    ├── canvas-store.ts
    ├── quiz/quiz-store.ts
    ├── study-store.ts
    ├── flashcard-store.ts
    └── ... (10+ more)
```

### 4.2 Persistence Strategy Analysis

**IndexedDB (Dexie) Stores:**
```typescript
// Uses createDexieStorage() adapter
- provider-store.ts        ✅ (via providerConfigs table)
- agents-store.ts          ✅ (via agentConfigs table)
- ide-store.ts             ✅ (via providerConfigs table - BUG?)
- conversation-store.ts    ✅ (via conversationState table)
- knowledge-store.ts       ✅ (via conversationState table - BUG?)
- rag-store.ts             ✅ (via conversationState table - BUG?)
```

**BUG:** Multiple stores using `conversationState` table name (collision risk)

**localStorage Stores:**
```typescript
// Uses default zustand/middleware localStorage
- workspace-store.ts       ✅ (only currentWorkspace + currentProjectId)
- statusbar-store.ts       ✅ (ephemeral, not persisted)
- navigation-store.ts      ✅ (ephemeral, not persisted)
```

**In-Memory Stores (No Persistence):**
```typescript
- layout-store.ts          (not persisted by design)
- statusbar-store.ts       (ephemeral status)
```

### 4.3 Dexie Database Schema

**Location:** `/src/lib/state/dexie-db.ts` (1267 lines - **GOD CLASS**)

**Tables (14 total):**
```typescript
class ViaGentDatabase extends Dexie {
    // Core (3 tables)
    projects!: Table<ProjectRecord, string>
    ideState!: Table<IDEStateRecord, string>
    persistedState!: Table<PersistedStateRecord, string>  // ⚠️ Generic catch-all

    // AI Foundation (4 tables)
    credentials!: Table<CredentialRecord, string>
    taskContext!: Table<TaskContextRecord, string>
    toolExecutions!: Table<ToolExecutionRecord, string>
    conversationThreads!: Table<ConversationThreadRecord, string>

    // Session (6 tables)
    syncStatus!: Table<SyncStatusRecord, string>
    fileMetadata!: Table<FileMetadataRecord, string>
    toolExecutionLogs!: Table<ToolExecutionLogRecord, string>
    fsaHandles!: Table<FSAHandleRecord, string>
    sessionSnapshots!: Table<SessionSnapshotRecord, string>

    // Knowledge (5 tables)
    sources!: Table<SourceRecord, string>
    collections!: Table<CollectionRecord, string>
    oramaIndexes!: Table<OramaIndexRecord, string>
    embeddingModels!: Table<EmbeddingModelRecord, string>
    notes!: Table<NoteRecord, string>
    synthesisResults!: Table<SynthesisResultRecord, string>
}
```

**Issues:**

**P0 - Duplicate Store Definitions:**
```typescript
// ❌ VIOLATION: Same store in 3 locations

// Location 1: /src/stores/conversation-threads-store.ts
export const useThreadsStore = create<ThreadsState>()(...)

// Location 2: /src/lib/workspace/threads-store.ts (DEPRECATED)
export const useThreadsStore = create<ThreadsState>()(...)

// Location 3: /src/infrastructure/persistence/stores/conversation-threads-store.ts
export const useThreadsStore = create<ThreadsState>()(...)
```

**Impact:** Components importing from different locations get different store instances!

**P1 - Table Name Collision:**
```typescript
// Multiple stores using same table name
createDexieStorage('conversationState')  // Used by:
- conversation-store.ts
- knowledge-store.ts
- rag-store.ts
```

**Impact:** Data overwrites each other

**P2 - God Class (dexie-db.ts):**
- 1267 lines
- 14 table definitions
- 10+ helper functions
- Migration logic mixed in

**Recommendation:** Split into:
```
lib/state/
├── dexie-db-core.ts         (3 tables: projects, ideState, persistedState)
├── dexie-db-ai.ts            (4 tables: credentials, taskContext, toolExecutions, conversationThreads)
├── dexie-db-session.ts       (6 tables: syncStatus, fileMetadata, etc.)
├── dexie-db-knowledge.ts     (5 tables: sources, collections, etc.)
└── dexie-db.ts              (barrel export + migration orchestration)
```

### 4.4 Cross-Store Dependencies

**Dependency Graph:**
```
agents-store.ts
    ↓ (imports)
    provider-store.ts  ← (validates model availability)
    workspace-store.ts  ← (emits cross-workspace events)

provider-store.ts
    ↓ (imports)
    credential-vault.ts  ← (fetches API keys)

conversation-store.ts
    ↓ (imports)
    conversation-threads-store.ts  ← (thread management)

workspace-store.ts
    ↓ (imports)
    cross-workspace-event-bus.ts  ← (emits workspace changes)

rag-store.ts
    ↓ (imports)
    knowledge-store.ts  ← (reads collections)
    provider-store.ts  ← (fetches API keys for embeddings)
```

**Issue:** Circular dependency risk if store initialization order matters

**Recommendation:** Use Zustand's pattern of lazy imports:
```typescript
// Instead of: import { useProviderStore } from '@/lib/state/provider-store'
// Use:
addAgent: (agentData) => {
    const { useProviderStore } = await import('@/lib/state/provider-store');
    const availableModels = useProviderStore.getState().availableModels;
    // ... validation
}
```

### 4.5 Hydration Patterns

**IndexedDB Hydration:**
```typescript
// /src/stores/agents-store.ts (lines 386-403)
onRehydrateStorage: () => (state) => {
    console.log('[AgentsStore] Rehydrated from IndexedDB:', state?.agents?.length, 'agents');

    if (state) {
        // Ensure at least one agent exists
        if (!state.agents || state.agents.length === 0) {
            state.agents = [DEFAULT_AGENT];
            state.activeAgentId = DEFAULT_AGENT.id;
        }

        // Ensure activeAgentId points to valid agent
        if (state.activeAgentId && !state.agents.find(a => a.id === state.activeAgentId)) {
            state.activeAgentId = state.agents[0]?.id || null;
        }

        state.setHasHydrated(true);
    }
}
```

**Hydration Tracking:**
```typescript
// Hook to wait for hydration
export function useAgentsStoreHydration() {
    return useAgentsStore((state) => state._hasHydrated);
}

// Usage in components:
const hasHydrated = useAgentsStoreHydration();
if (!hasHydrated) return <LoadingSkeleton />;
```

**Gap:** Not all stores have hydration tracking

---

## 5. Chat Flow Architecture Analysis

### 5.1 Thread Management

**Single Source of Truth:** ⚠️ **SPLIT** (3 competing implementations)

**Location 1:** `/src/stores/conversation-threads-store.ts` (726 lines - **LARGE FILE**)
```typescript
export const useThreadsStore = create<ThreadsState>()(
    persist(
        (set, get) => ({
            threads: [],
            activeThreadId: null,
            folderTree: {},

            createThread: (title) => { ... },
            updateThread: (id, updates) => { ... },
            deleteThread: (id) => { ... },
            moveToFolder: (threadId, folderId) => { ... },
        }),
        {
            name: 'conversation-threads',
            storage: createJSONStorage(() => createDexieStorage('conversationThreads')),
        }
    )
);
```

**Location 2:** `/src/lib/workspace/threads-store.ts` (DEPRECATED?)
```typescript
// Same implementation, different file
```

**Location 3:** `/src/infrastructure/persistence/stores/conversation-threads-store.ts`
```typescript
// Another duplicate implementation
```

**Impact:** Components importing from different locations get different thread lists!

### 5.2 Message Storage

**Location:** `/src/lib/state/conversation-store.ts` (626 lines)

**Schema:**
```typescript
interface ConversationState {
    // Current conversation
    messages: Message[];
    activeConversationId: string | null;

    // Metadata
    isStreaming: boolean;
    error: Error | null;

    // Actions
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    deleteMessage: (id: string) => void;
    clearMessages: () => void;
}
```

**Persistence:**
```typescript
// Uses conversationState table in IndexedDB
persist(
    (set) => ({ ... }),
    {
        name: 'conversation-state',
        storage: createJSONStorage(() => createDexieStorage('conversationState')),
    }
)
```

**Issue:** Same table name as knowledge-store.ts and rag-store.ts (collision risk)

### 5.3 Chat Hook Architecture

**Location:** `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (517 lines - **GOD FILE**)

**Responsibilities:**
1. TanStack AI chat client creation
2. Tool factory integration
3. System prompt composition
4. Tool approval workflow
5. Message transformation
6. Debug logging

**Complex Function:**
```typescript
export function useAgentChatWithTools(
    options: UseAgentChatWithToolsOptions
): UseAgentChatWithToolsReturn {

    // TanStack AI useChat hook
    const chatResult = useChat({
        fetch: fetchServerSentEvents,
        initialMessages: [],
        streamProtocol: 'text',  // ✅ Fixed (was 'raw' before)
        onError: (error) => { ... },
    });

    // Tool factory
    const tools = useMemo(() => {
        if (!options.fileTools || !options.terminalTools) return {};

        return createAgentClientTools({
            agent: currentAgent,
            fileTools: options.fileTools,
            terminalTools: options.terminalTools,
            eventBus: options.eventBus,
        });
    }, [currentAgent, options.fileTools, options.terminalTools]);

    // System prompt composer
    const systemMessage = useMemo(() => {
        const composer = new SystemPromptComposer();
        return composer
            .addLayer('base', DEFAULT_SYSTEM_PROMPT)
            .addLayer('agent', currentAgent.systemPrompt)
            .addLayer('workspace', getWorkspacePrompt(currentWorkspace))
            .build();
    }, [currentAgent, currentWorkspace]);

    // Message transformation (TanStack AI → UI format)
    const messages = useMemo(() => {
        return rawMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            // ... complex parsing
        }));
    }, [rawMessages]);

    // Tool approval workflow
    const approveToolCall = (approvalId: string, toolCallId?: string) => {
        const approval = pendingApprovals.find(a => a.approvalId === approvalId);
        if (!approval) return;

        addToolApprovalResponse(approvalId, 'approved');
        // ... continue execution
    };

    return {
        messages,
        sendMessage: chatResult.sendMessage,
        isLoading: chatResult.isLoading,
        error: chatResult.error,
        toolCalls,
        pendingApprovals,
        approveToolCall,
        rejectToolCall,
    };
}
```

**Issues:**

**P1 - God File (517 lines):**
- Mixing concerns (chat client, tools, system prompts, approval UI)
- Hard to test individual functions
- Reusability limited

**Recommendation:** Split into:
```
lib/agent/hooks/
├── use-agent-chat-core.ts        (TanStack AI useChat wrapper)
├── use-agent-tools.ts            (Tool factory + approval workflow)
├── use-agent-system-prompt.ts    (System prompt composition)
└── use-agent-chat-with-tools.ts  (Composes above 3 hooks)
```

**P2 - Debug Logging in Production:**
```typescript
// Lines 295-311
useEffect(() => {
    console.log('[useAgentChat] Chat state:', {
        messageCount: rawMessages.length,
        isLoading: chatResult.isLoading,
        error: chatResult.error,
        toolCallsCount: toolCalls.length,
        pendingApprovalsCount: pendingApprovals.length,
    });
}, [rawMessages, chatResult.isLoading, toolCalls, pendingApprovals]);

// Lines 348-384
useEffect(() => {
    if (rawMessages.length > 0) {
        const lastRaw = rawMessages[rawMessages.length - 1];
        console.log('[useAgentChat] Last raw message:', {
            role: lastRaw.role,
            contentLength: lastRaw.content?.length || 0,
            parts: lastRaw.parts?.map(p => ({ type: p.type })),
        });
    }
}, [rawMessages]);
```

**Recommendation:** Remove or use conditional logging:
```typescript
if (import.meta.env.DEV) {
    console.log('[useAgentChat] Chat state:', ...);
}
```

### 5.4 Cross-Workspace Chat

**Issue:** Chat state is **not** workspace-aware

**Current Behavior:**
- Single global conversation state
- Switching workspace doesn't filter threads/messages
- IDE workspace chat shows in Knowledge workspace (confusing UX)

**Recommendation:** Add workspace filtering to threads store:

```typescript
interface ThreadsState {
    threads: ConversationThread[];
    activeThreadId: string | null;

    // ✅ NEW: Workspace filtering
    getThreadsForWorkspace: (workspaceType: WorkspaceType) => ConversationThread[];

    // ✅ NEW: Workspace-aware active thread
    getActiveThreadForWorkspace: (workspaceType: WorkspaceType) => ConversationThread | null;
}
```

---

## 6. File System Integration Analysis

### 6.1 Architecture Overview

**Single Source of Truth:** ✅ **ACHIEVED**

**Flow:**
```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
      ↑                                    ↑
   IndexedDB                         File Change Events
 (ProjectStore)                      (WorkspaceEventBus)
```

**Key Components:**

**1. LocalFSAdapter** (`/src/lib/filesystem/local-fs-adapter.ts`)
```typescript
class LocalFSAdapter {
    // Read operations (direct from Local FS)
    readFile(path: string): Promise<FileContent>
    listDirectory(path: string): Promise<FileEntry[]>
    getDirectoryTree(path: string): Promise<TreeNode>

    // Write operations (delegated to SyncManager)
    writeFile(path: string, content: string): Promise<void>  // Calls SyncManager
    createDirectory(path: string): Promise<void>             // Calls SyncManager
    deleteFile(path: string): Promise<void>                  // Calls SyncManager
}
```

**2. SyncManager** (`/src/lib/filesystem/sync-manager/sync-manager.ts`)
```typescript
class SyncManager {
    // Dual-write to Local FS + WebContainer
    async writeFile(path: string, content: string): Promise<void> {
        // Step 1: Write to Local FS (source of truth)
        await this.localFS.writeFile(path, content);

        // Step 2: Sync to WebContainer (mirror)
        await this.webContainer.writeFile(path, content);

        // Step 3: Emit event for other components
        this.eventBus.emit('file:modified', { path, source: 'user' });
    }
}
```

**3. ProjectStore** (`/src/lib/workspace/project-store.ts`)
```typescript
class ProjectStore {
    // IndexedDB persistence
    async saveProject(project: ProjectRecord): Promise<void>
    async getProject(projectId: string): Promise<ProjectRecord | undefined>
    async getRecentProjects(limit: number): Promise<ProjectRecord[]>

    // Workspace bindings
    async saveWorkspaceBindings(projectId: string, bindings: WorkspaceBindings): Promise<void>
    async getWorkspaceBindings(projectId: string): Promise<WorkspaceBindings | undefined>
}
```

### 6.2 Cross-Workspace File Sync

**Issue:** File sync is **workspace-agnostic**

**Current Behavior:**
- All files sync to WebContainer regardless of workspace
- No workspace-specific file filtering
- Knowledge workspace can see IDE files (and vice versa)

**Recommendation:** Add workspace context to sync operations:

```typescript
interface SyncContext {
    workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
    projectPath: string;
    exclusions: string[];  // Workspace-specific exclusions
}

class SyncManager {
    async writeFile(path: string, content: string, context?: SyncContext): Promise<void> {
        // Apply workspace-specific exclusions
        if (context?.exclusions?.some(excl => path.startsWith(excl))) {
            console.log(`[SyncManager] Skipping ${path} (excluded in ${context.workspaceType})`);
            return;
        }

        // ... sync logic
    }
}
```

**Default Exclusions per Workspace:**
```typescript
const WORKSPACE_EXCLUSIONS = {
    ide: ['.git', 'node_modules', '.DS_Store'],
    knowledge: ['.git', 'node_modules', 'src', 'public'],  // Only knowledge/ files
    study: ['.git', 'node_modules', 'src', 'public'],      // Only study/ files
    notes: ['.git', 'node_modules', 'src', 'public'],      // Only notes/ files
};
```

### 6.3 File Locking

**Location:** `/src/lib/agent/facades/file-lock.ts`

**Implementation:**
```typescript
class FileLock {
    private locks = new Map<string, Promise<void>>();

    async acquire(path: string): Promise<number> {
        // Wait for existing lock
        while (this.locks.has(path)) {
            await this.locks.get(path);
        }

        // Acquire new lock
        const lockPromise = new Promise<void>(resolve => {
            // Store resolve function for release
        });

        this.locks.set(path, lockPromise);
        return Date.now();  // Lock acquisition timestamp
    }

    release(path: string): void {
        const lockPromise = this.locks.get(path);
        if (lockPromise) {
            // Resolve promise to release lock
            this.locks.delete(path);
        }
    }
}
```

**Usage in FileToolsFacade:**
```typescript
async writeFile(path: string, content: string): Promise<void> {
    const lockAcquired = await this.fileLock.acquire(path);
    try {
        await this.syncManager.writeFile(path, content);
        const lockReleased = Date.now();
        this.eventBus.emit('file:modified', {
            path,
            source: 'agent',
            lockAcquired,
            lockReleased,
        });
    } finally {
        this.fileLock.release(path);
    }
}
```

**Strength:** Prevents concurrent write conflicts (multiple tools writing same file)

**Gap:** No timeout mechanism (lock could hang forever if crash occurs)

### 6.4 FSA Handle Persistence

**Location:** `/src/lib/filesystem/fsa-handle-manager.ts`

**Issue:** File System Access API handles are **ephemeral** (single-session by default)

**Current Solution:**
```typescript
// Store handles in IndexedDB for persistence
await db.fsaHandles.put({
    id: projectPath,
    handle: directoryHandle,
    status: 'granted',
    lastAccessed: Date.now(),
});

// Restore handles on page reload
const saved = await db.fsaHandles.get(projectPath);
if (saved && saved.status === 'granted') {
    const handle = saved.handle;
    // Request permission again (browser requires gesture)
    const permission = await handle.requestPermission({ mode: 'readwrite' });
    if (permission === 'granted') {
        // Use handle
    }
}
```

**Gap:** Handle revival requires user gesture (can't auto-restore on page load)

---

## 7. Database Schema Analysis

### 7.1 IndexedDB Organization

**Database:** `ViaGentDatabase` (Dexie wrapper)
**Version:** 14 (as of 2026-01-01)
**Total Tables:** 14 tables

### 7.2 Schema by Domain

**Core (3 tables):**
```typescript
interface ProjectRecord {
    id: string;
    name: string;
    path: string;
    lastOpened: number;
    workspaceBindings?: WorkspaceBindings;
    createdAt: string;
    updatedAt: string;
}

interface IDEStateRecord {
    projectId: string;
    openFiles: string[];
    activeFile: string | null;
    activeFileScrollTop: number;
    panelLayouts: PanelLayout;
    panelSizes: number[];
    lastModified: number;
}

interface PersistedStateRecord {
    id: string;           // Store name (e.g., 'agent-configs')
    state: unknown;       // Zustand state object
    updatedAt: Date;
}
```

**AI Foundation (4 tables):**
```typescript
interface CredentialRecord {
    id: string;           // providerId
    encrypted: string;    // Encrypted API key (AES-256-GCM)
    iv: string;           // Initialization vector
    createdAt: string;
    updatedAt: string;
}

interface ConversationThreadRecord {
    id: string;
    agentId: string;
    title: string;
    messages: ThreadMessageRecord[];
    folderId: string | null;
    workspaceType?: WorkspaceType;  // ✅ NEW (not fully utilized)
    createdAt: string;
    updatedAt: string;
}

interface TaskContextRecord {
    id: string;
    threadId: string;
    agentId: string;
    context: Record<string, unknown>;
    createdAt: string;
}

interface ToolExecutionRecord {
    id: string;
    threadId: string;
    toolId: string;
    input: unknown;
    output: unknown;
    status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
    createdAt: string;
}
```

**Session (6 tables):**
```typescript
interface SyncStatusRecord {
    id: string;           // `sync-${filePath}`
    path: string;
    status: 'syncing' | 'synced' | 'error';
    error?: string;
    createdAt: number;
    updatedAt: number;
}

interface FileMetadataRecord {
    id: string;
    projectId: string;
    path: string;
    size: number;
    lastModified: number;
    contentType?: string;
    hash?: string;
}

interface ToolExecutionLogRecord {
    id: string;
    toolId: string;
    input: unknown;
    output: unknown;
    executionTime: number;
    timestamp: number;
}

interface FSAHandleRecord {
    id: string;           // projectPath
    handle: FileSystemDirectoryHandle;
    status: 'granted' | 'denied' | 'prompt';
    lastAccessed: number;
}

interface SessionSnapshotRecord {
    id: string;
    projectId: string;
    ideState: IDEStateRecord;
    chatState: ChatState;
    workspaceState: WorkspaceState;
    timestamp: number;
}
```

**Knowledge (5 tables):**
```typescript
interface SourceRecord {
    id: string;
    type: 'pdf' | 'url' | 'text' | 'markdown';
    title: string;
    content: string;
    metadata: SourceMetadata;
    embeddingModelId: string;
    embedding?: number[];  // Vector embedding
    projectId?: string;
    createdAt: string;
}

interface CollectionRecord {
    id: string;
    name: string;
    description: string;
    sourceIds: string[];   // Array of source IDs
    projectId?: string;
    createdAt: string;
    updatedAt: string;
}

interface OramaIndexRecord {
    id: string;           // collectionId
    index: unknown;       // Orama index object
    documentCount: number;
    size: number;
    createdAt: string;
    updatedAt: string;
}

interface NoteRecord {
    id: string;
    title: string;
    content: string;
    tags: string[];
    sourceIds: string[];
    projectId?: string;
    createdAt: string;
    updatedAt: string;
}

interface SynthesisResultRecord {
    id: string;
    collectionId: string;
    prompt: string;
    result: string;
    model: string;
    createdAt: string;
}
```

### 7.3 Migration Strategy

**Location:** `/src/lib/state/dexie-db-migrations.ts` (691 lines - **LARGE FILE**)

**Current Version:** 14

**Recent Migrations:**
```typescript
// v13: Add workspaceType to ConversationThreadRecord
db.version(13).stores({
    conversationThreads: '++id, agentId, title, folderId, workspaceType, createdAt',
});

// v14: Add embedding field to SourceRecord
db.version(14).stores({
    sources: '++id, type, title, projectId, embeddingModelId, createdAt',
});
```

**Issue:** Migration logic mixed with schema definition

**Recommendation:** Separate migration scripts:
```
lib/state/migrations/
├── migration-v13-add-workspace-type.ts
├── migration-v14-add-embedding.ts
└── migration-runner.ts  (Orchestrates migrations)
```

### 7.4 Performance Considerations

**IndexedDB Indexes:**
```typescript
// Good: Indexed fields for fast queries
conversationThreads: '++id, agentId, folderId, workspaceType, createdAt'
sources: '++id, type, title, projectId, embeddingModelId, createdAt'
syncStatus: 'id, path, status'

// Missing: No compound indexes
// Example query: "Get threads for agent X in workspace Y"
// Requires: compound index on 'agentId, workspaceType'
```

**Recommendation:** Add compound indexes for common queries:
```typescript
conversationThreads: '++id, [agentId+workspaceType], folderId, createdAt'
sources: '++id, [projectId+type], createdAt'
```

---

## 8. Technical Debt Summary

### 8.1 God Files (>300 lines)

| File | Lines | Issue | Recommendation |
|------|-------|-------|----------------|
| `/src/lib/state/dexie-db.ts` | 1267 | Mixed schema + helpers + migrations | Split into 4 files (core, ai, session, knowledge) |
| `/src/infrastructure/persistence/dexie-db.ts` | 1061 | DUPLICATE of above | Delete duplicate |
| `/src/lib/state/rag-store.ts` | 877 | RAG + Knowledge + Quiz logic | Split into domain-specific stores |
| `/src/infrastructure/persistence/stores/rag-store.ts` | 810 | DUPLICATE of above | Delete duplicate |
| `/src/stores/conversation-threads-store.ts` | 726 | Thread + Folder + Message logic | Split thread/folder/message concerns |
| `/src/lib/state/dexie-db-migrations.ts` | 691 | All migrations in one file | Extract to individual migration files |
| `/src/lib/state/quiz-store.ts` | 629 | Quiz + Flashcard + Study logic | Split into domain-specific stores |
| `/src/lib/state/conversation-store.ts` | 626 | Message + Thread + Sync logic | Split concerns |
| `/src/lib/agent/factory.ts` | 612 | Tool creation + validation + execution | Split factory/orchestrator/executor |
| `/src/lib/agent/facades/file-tools-impl.ts` | 578 | File + Directory + Permission logic | Split by operation type |
| `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` | 517 | Chat + Tools + Prompt + Approval | Split into 4 hooks (see section 5.3) |
| `/src/lib/state/knowledge-store.ts` | 718 | Source + Collection + Synthesis + Note | Split into domain-specific stores |
| `/src/lib/notes/note-store.ts` | 566 | Note + AI + Markdown logic | Split concerns |

### 8.2 Duplicate Store Definitions

**Critical Violations:**
```typescript
// ❌ VIOLATION: 3 implementations of same store
/src/stores/conversation-threads-store.ts
/src/lib/workspace/threads-store.ts
/src/infrastructure/persistence/stores/conversation-threads-store.ts

// ❌ VIOLATION: 3 implementations of same store
/src/lib/state/rag-store.ts
/src/infrastructure/persistence/stores/rag-store.ts
/src/infrastructure/persistence/stores/rag/rag-store.ts

// ❌ VIOLATION: 3 implementations of same store
/src/lib/state/knowledge-store.ts
/src/infrastructure/persistence/stores/knowledge-store.ts

// ❌ VIOLATION: 2 implementations of same store
/src/lib/state/canvas-store.ts
/src/infrastructure/persistence/stores/canvas-store.ts

// ❌ VIOLATION: 2 implementations of same store
/src/lib/state/study-store.ts
/src/infrastructure/persistence/stores/study-store.ts

// ❌ VIOLATION: 2 implementations of same store
/src/lib/state/flashcard-store.ts
/src/infrastructure/persistence/stores/flashcard-store.ts
```

**Impact:** Components importing from different locations get different store instances

**Recommendation:**
1. Choose canonical location (infrastructure/persistence/stores/)
2. Update all imports to canonical location
3. Delete duplicates

### 8.3 TODOs / FIXMEs

**Count:** 14 technical debt markers

**Critical TODOs:**
```typescript
// /src/mocks/agents.ts:61
// TODO: Replace with TanStack Query + API in Epic 25
// Status: BLOCKING (Epic 25 not started)

// /src/utils/export-utils.ts:97
// TODO: Implement PDF export when we store original file blobs
// Status: NICE-TO-HAVE

// /src/lib/chat/context-window-manager.ts:110
// TODO: Implement actual LLM-based summarization
// Status: NICE-TO-HAVE

// /src/lib/agent/memory/memory-index.ts:286
// TODO: Implement true semantic search with embeddings
// Status: BLOCKING (RAG infrastructure incomplete)

// /src/lib/state/rag-store.ts:665
const apiKey = 'YOUR_GEMINI_API_KEY'; // TODO: Get from credential vault
// Status: SECURITY RISK (hardcoded API key)
```

**Immediate Actions Required:**
1. **Remove hardcoded API key** (rag-store.ts:665)
2. **Replace mock agents with API** (Epic 25)
3. **Implement semantic search** (Epic 24 - RAG)

---

## 9. Single-Source-of-Truth Violations

### 9.1 Critical Violations

**P0 - Duplicate Store Implementations:**
- **Impact:** Data inconsistency, race conditions, lost updates
- **Fix:** Consolidate to single canonical location

**P1 - Workspace Type Duplication:**
```typescript
// ❌ VIOLATION: WorkspaceType defined in 3 locations
/domain/value-objects/workspace-type.ts  → 'ide' | 'knowledge' | 'study' | 'notes'
/lib/state/workspace-store.ts            → 'ide' | 'knowledge' | 'study' | 'notes'
/lib/events/cross-workspace-event-bus.ts → 'ide' | 'notes' | 'knowledge' | 'study' (different order!)
```

**Fix:** Import from single domain layer file:
```typescript
// All files import from:
import type { WorkspaceType } from '@/domain/value-objects/workspace-type';
```

**P2 - Agent Entity Duplication:**
```typescript
// ❌ VIOLATION: Agent defined in 2 locations
/core/entities/Agent.ts          ← Domain layer (canonical)
/mocks/agents.ts                 ← Mock implementation (should use domain layer)
```

**Fix:** Delete Agent definition from mocks, import from domain:
```typescript
import type { Agent } from '@/core/entities/Agent';
export const mockAgents: Agent[] = [...];
```

### 9.2 Provider Configuration Violations

**P0 - Provider Metadata Scattered:**
```typescript
// Location 1: /src/lib/agent/providers/types.ts
export const PROVIDERS: Record<string, ProviderConfig> = { ... }

// Location 2: /src/lib/state/provider-store.ts
const INITIAL_PROVIDERS = Object.values(PROVIDERS);

// Location 3: /src/lib/agent/providers/model-registry.ts
export class ModelRegistry { ... }
```

**Issue:** Provider metadata not single-source-of-truth

**Fix:** Consolidate in provider-store.ts, export PROVIDERS from there

### 9.3 Workspace State Violations

**P1 - Current Workspace in 3 Stores:**
```typescript
// Location 1: /src/lib/state/workspace-store.ts
currentWorkspace: WorkspaceType

// Location 2: /src/lib/workspace/WorkspaceContext.tsx (React Context)
currentWorkspace: WorkspaceType

// Location 3: /src/lib/events/cross-workspace-event-bus.ts
detectWorkspace() → WorkspaceType  // Dynamic detection
```

**Issue:** Components importing from different locations get different values

**Fix:** Use workspace-store.ts as single source, remove React Context

---

## 10. Integration Gaps

### 10.1 Workspace ↔ Agent System

**Gap:** Agent workspace bindings exist but not enforced in UI

**Evidence:**
```typescript
// /src/presentation/components/chat/AgentSelector.tsx
const agents = useAgentsStore(state => state.agents);  // ❌ Returns ALL agents

// Should be:
const agents = useAgentsStore(state =>
    state.getAgentsForWorkspace(currentWorkspace)  // ✅ Filtered by workspace
);
```

**Fix Required:**
1. Update AgentSelector to use `getAgentsForWorkspace()`
2. Add workspace indicator badge to agent cards
3. Validate agent has all 4 workspace bindings before creation

### 10.2 Workspace ↔ Tool Permissions

**Gap:** Workspace permission checks exist but not wired to tool execution

**Evidence:**
```typescript
// /src/lib/agent/facades/file-tools-impl.ts
async readFile(path: string): Promise<string | null> {
    this.checkPermission('read_file');  // ✅ Checks base permission
    // ❌ Missing: checkWorkspacePermission() call
}
```

**Fix Required:**
1. Add workspace context parameter to tool methods
2. Check workspace permissions before execution
3. Return blocked result if not available in workspace

### 10.3 Agent ↔ Provider System

**Gap:** Model validation exists but no reactive refresh on provider changes

**Evidence:**
```typescript
// /src/stores/agents-store.ts (lines 152-172)
addAgent: (agentData) => {
    const { providerId, modelId } = agentData;

    // ✅ Validates model belongs to provider at creation time
    const availableModels = useProviderStore.getState().availableModels;
    const modelExists = providerModels.some(m => m.id === modelId);

    if (!modelExists) {
        throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
    }
}
```

**Gap:** If provider fetches new models later, agent's modelId may become invalid

**Fix Required:**
1. Listen to `crossWorkspaceEventBus.onModelsUpdated()`
2. Re-validate agents with that provider
3. Disable agents with invalid modelIds (or auto-update)

### 10.4 File System ↔ Workspace System

**Gap:** File sync is workspace-agnostic

**Evidence:**
```typescript
// /src/lib/filesystem/sync-manager/sync-manager.ts
async writeFile(path: string, content: string): Promise<void> {
    // ❌ No workspace filtering
    await this.localFS.writeFile(path, content);
    await this.webContainer.writeFile(path, content);
}
```

**Fix Required:**
1. Add workspace context parameter to sync methods
2. Apply workspace-specific exclusions
3. Emit workspace-specific events

### 10.5 Chat ↔ Workspace System

**Gap:** Chat threads not workspace-aware

**Evidence:**
```typescript
// /src/stores/conversation-threads-store.ts
interface ThreadsState {
    threads: ConversationThread[];  // ❌ No workspace filtering
    activeThreadId: string | null;
}
```

**Fix Required:**
1. Add `workspaceType` to ConversationThreadRecord (already done in schema)
2. Filter threads by workspace in UI
3. Maintain separate activeThreadId per workspace

---

## 11. Missing UI Components

### 11.1 Workspace-Aware Agent Selector

**Current:** AgentSelector shows all agents regardless of workspace

**Missing:**
```typescript
<AgentSelector
    workspace="ide"  // Show only agents available in IDE
/>
<AgentSelector
    workspace="knowledge"  // Show only agents available in Knowledge
/>
```

**Required Components:**
- `WorkspaceAgentBadge.tsx` - Shows workspace indicator on agent card
- `WorkspaceAgentFilter.tsx` - Filter agents by workspace type
- `AgentWorkspaceBindingEditor.tsx` - UI for editing workspace bindings

### 11.2 Workspace-Aware Tool Permissions UI

**Current:** Tool permissions configured in AgentConfigDialog (3 tabs)

**Missing:**
```typescript
<ToolPermissionsEditor
    agentId="agt_001"
    workspace="ide"  // Show/edit permissions for IDE workspace only
/>
```

**Required Components:**
- `WorkspaceToolPermissionEditor.tsx` - Per-workspace tool permissions
- `ToolPermissionMatrix.tsx` - Matrix view (tools × workspaces)
- `WorkspaceToolAvailabilityBadge.tsx` - Shows which tools available in current workspace

### 11.3 Cross-Workspace Event Dashboard

**Current:** Events logged to console only

**Missing:**
```typescript
<CrossWorkspaceEventDashboard
    showEvents={['file:modified', 'agent:config:change', 'workspace:changed']}
/>
```

**Required Components:**
- `EventLogPanel.tsx` - Shows real-time event stream
- `EventTimeline.tsx` - Visual timeline of cross-workspace events
- `EventReplayControls.tsx` - Debugging controls for event replay

---

## 12. Security & Privacy Gaps

### 12.1 Hardcoded API Key

**Location:** `/src/lib/state/rag-store.ts` (line 665)

```typescript
const apiKey = 'YOUR_GEMINI_API_KEY'; // TODO: Get from credential vault
```

**Risk:** If committed to git, exposes API key

**Fix:**
```typescript
const apiKey = await credentialVault.getCredentials('google-gemini');
if (!apiKey) {
    throw new Error('Google Gemini API key not configured. Please add in Settings.');
}
```

### 12.2 Workspace Permission Enforcement

**Gap:** Workspace permissions defined but not enforced at tool execution layer

**Risk:** Agent could execute tool in workspace where it's not authorized

**Fix:** See section 10.2 above

### 12.3 Credential Vault Validation

**Status:** ✅ **GOOD**

**Strengths:**
- AES-256-GCM encryption via Web Crypto API
- Salt + IV + Authentication tag for proper cryptographic security
- Password-based key derivation (PBKDF2-SHA256)
- Refactored into 3 modules (storage, encryption, vault facade)

**Recent Fix (WB-PR-2):**
```typescript
// /src/lib/agent/providers/credential-vault.ts (lines 108-129)
private validateStorageKeys(): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    if (!localStorage.getItem(VAULT_PASSWORD_STORAGE)) {
        missing.push(VAULT_PASSWORD_STORAGE);
    }
    if (!localStorage.getItem(ENCRYPTED_KEY_STORAGE)) {
        missing.push(ENCRYPTED_KEY_STORAGE);
    }
    if (!localStorage.getItem(SALT_STORAGE)) {
        missing.push(SALT_STORAGE);
    }
    const version = localStorage.getItem(KEY_VERSION_STORAGE);
    if (version !== '3') {
        missing.push(`${KEY_VERSION_STORAGE} (found: ${version || 'null'})`);
    }

    return { valid: missing.length === 0, missing };
}
```

**Fallback:** Graceful vault creation if keys missing/corrupted

---

## 13. Performance Bottlenecks

### 13.1 Large File Performance

**Issue:** Reading large files (>1MB) blocks UI

**Location:** `/src/lib/filesystem/local-fs-adapter.ts`

**Recommendation:** Implement streaming file reads:
```typescript
async *readFileStream(path: string): AsyncGenerator<string> {
    const chunkSize = 1024 * 1024; // 1MB chunks
    // ... yield chunks as they're read
}
```

### 13.2 IndexedDB Query Performance

**Issue:** No compound indexes for common queries

**Example Query:** "Get threads for agent X in workspace Y"

**Current Scan:** Full table scan (O(n))

**With Compound Index:** O(log n)

**Fix:** See section 7.4 above

### 13.3 Tool Factory Recreation on Every Render

**Issue:** `createAgentClientTools()` called on every render

**Location:** `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (lines 169-180)

```typescript
const tools = useMemo(() => {
    if (!options.fileTools || !options.terminalTools) return {};

    return createAgentClientTools({
        agent: currentAgent,
        fileTools: options.fileTools,
        terminalTools: options.terminalTools,
        eventBus: options.eventBus,
    });
}, [currentAgent, options.fileTools, options.terminalTools]);
```

**Good:** Already using `useMemo`

**Issue:** `currentAgent` object changes on every render (not memoized)

**Fix:** Memoize agent object in agents-store:
```typescript
getAgent: (id: string) => {
    return get().agents.find(a => a.id === id);
}

// Add:
getAgentMemo: (id: string) => {
    const agent = get().agents.find(a => a.id === id);
    return useMemo(() => agent, [agent?.id, agent?.lastActive]);
}
```

---

## 14. Recommendations Summary

### 14.1 Immediate Actions (P0)

1. **Remove hardcoded API key** (rag-store.ts:665)
   - Use credentialVault.getCredentials() instead
   - Estimated effort: 15 minutes

2. **Consolidate duplicate stores**
   - Choose canonical location (infrastructure/persistence/stores/)
   - Update all imports
   - Delete duplicates
   - Estimated effort: 2-3 days

3. **Fix workspace type duplication**
   - Import from domain/value-objects/workspace-type.ts everywhere
   - Estimated effort: 2 hours

4. **Add workspace permission checks to tool execution**
   - Update FileToolsFacade to call checkWorkspacePermission()
   - Estimated effort: 4 hours

### 14.2 Short-Term (P1)

1. **Split god files** (target: <300 lines per file)
   - Split dexie-db.ts into 4 domain-specific files
   - Split use-agent-chat-with-tools.ts into 4 hooks
   - Estimated effort: 3-5 days

2. **Implement workspace-aware agent filtering**
   - Update AgentSelector to use getAgentsForWorkspace()
   - Add workspace indicator badges
   - Estimated effort: 1 day

3. **Add compound indexes to IndexedDB**
   - Identify common query patterns
   - Add compound indexes
   - Estimated effort: 1 day

4. **Remove debug logging from production**
   - Wrap console.log() in dev checks
   - Estimated effort: 2 hours

### 14.3 Medium-Term (P2)

1. **Implement workspace-aware file sync**
   - Add workspace context to sync methods
   - Apply workspace-specific exclusions
   - Estimated effort: 2-3 days

2. **Implement workspace-aware chat**
   - Filter threads by workspace
   - Maintain separate activeThreadId per workspace
   - Estimated effort: 2 days

3. **Create missing UI components**
   - WorkspaceAgentBadge
   - WorkspaceToolPermissionEditor
   - CrossWorkspaceEventDashboard
   - Estimated effort: 3-5 days

4. **Implement semantic search** (replaces keyword search)
   - Integrate embedding service
   - Update memory-index.ts
   - Estimated effort: 5-7 days

### 14.4 Long-Term (P3)

1. **Migrate mock agents to API** (Epic 25)
   - Replace mockAgents with TanStack Query
   - Implement agent CRUD API endpoints
   - Estimated effort: 1-2 weeks

2. **Implement streaming file reads**
   - Add readFileStream() to LocalFSAdapter
   - Update UI to handle streaming
   - Estimated effort: 3-5 days

3. **Implement LLM-based context window summarization**
   - Replace simple truncation with intelligent summarization
   - Estimated effort: 5-7 days

---

## 15. Conclusion

### 15.1 Architecture Strengths

1. **Single-source-of-truth patterns emerging:**
   - ✅ Provider configuration (provider-store.ts)
   - ✅ Agent configuration (agents-store.ts)
   - ✅ Credential storage (credential-vault.ts)

2. **Cross-workspace event system (WB-8.3):**
   - ✅ Well-architected event bus
   - ✅ Workspace change events
   - ✅ Agent config sync events
   - ✅ Provider model update events

3. **Workspace boundary enforcement:**
   - ✅ Workspace bindings defined (Agent.workspaceBindings)
   - ✅ Tool permissions defined (AgentToolBinding.workspacePermissions)
   - ✅ Permission manager implemented (WorkspacePermissionManager)

4. **File system integration:**
   - ✅ Local FS as source of truth
   - ✅ Dual-write to WebContainer
   - ✅ File locking for concurrency control

### 15.2 Critical Gaps

1. **Duplicate store implementations:**
   - 50+ stores across 3 directory structures
   - Same store in multiple locations (data inconsistency risk)

2. **God files:**
   - 13 files >300 lines (largest: 1267 lines)
   - Mixing concerns (hard to test, maintain)

3. **Incomplete workspace integration:**
   - Workspace bindings defined but not enforced in UI
   - Tool permissions checked but not wired to execution
   - Chat threads not workspace-aware

4. **Technical debt:**
   - 14 TODO/FIXME markers
   - Hardcoded API key (security risk)
   - Mock agents still in use (Epic 25 not started)

### 15.3 Overall Assessment

**Maturity Level:** **Phase 1: Core Stabilization** (per CLAUDE.md)

**Status:** **70% Complete** toward single-source-of-truth architecture

**Key Achievement:** Cross-workspace event system (WB-8.3) provides foundation for workspace-aware architecture

**Next Priority:** Eliminate duplicate stores and enforce workspace boundaries in UI/execution layers

**Estimated Effort to Complete:**
- P0 (Immediate): 1 week
- P1 (Short-term): 2-3 weeks
- P2 (Medium-term): 1 month
- P3 (Long-term): Ongoing (epic-based)

---

## 16. Appendix: File Inventory

### 16.1 Store Files (50 total)

**Legacy Location** (`/src/stores/`):
- agents-store.ts
- conversation-threads-store.ts
- openai-compatible-store.ts
- prompt-enhancement-store.ts
- auto-approve-store.ts
- models-loader-store.ts

**Core State** (`/src/lib/state/`):
- provider-store.ts
- workspace-store.ts
- ide-store.ts
- conversation-store.ts
- rag-store.ts (877 lines)
- knowledge-store.ts (718 lines)
- canvas-store.ts (613 lines)
- quiz-store.ts (629 lines)
- study-store.ts
- flashcard-store.ts
- statusbar-store.ts
- navigation-store.ts
- layout-store.ts
- dexie-db.ts (1267 lines)
- dexie-storage.ts
- dexie-db-helpers.ts
- dexie-db-migrations.ts (691 lines)

**Migration Target** (`/src/infrastructure/persistence/stores/`):
- agents/agent-selection-store.ts
- conversation/conversation-store.ts
- conversation-threads-store.ts
- rag-store.ts (810 lines)
- rag/rag-store.ts
- knowledge-store.ts (598 lines)
- canvas-store.ts (619 lines)
- quiz/quiz-store.ts
- study-store.ts
- flashcard-store.ts
- statusbar-store.ts
- navigation-store.ts
- auto-approve-store.ts
- prompt-enhancement-store.ts
- openai-compatible-store.ts

### 16.2 Agent System Files

**Core:**
- `/src/core/entities/Agent.ts` - Agent entity definition
- `/src/core/entities/Provider.ts` - Provider entity definition
- `/src/core/entities/Conversation.ts` - Conversation entity definition

**Configuration:**
- `/src/lib/state/provider-store.ts` - Provider state management
- `/src/stores/agents-store.ts` - Agent state management
- `/src/lib/agent/providers/credential-vault.ts` - API key storage
- `/src/lib/agent/providers/model-registry.ts` - Model metadata

**Execution:**
- `/src/lib/agent/factory.ts` (612 lines) - Tool factory
- `/src/lib/agent/hooks/use-agent-chat-with-tools.ts` (517 lines) - Chat hook
- `/src/lib/agent/facades/file-tools-impl.ts` (578 lines) - File tool facade
- `/src/lib/agent/facades/terminal-tools-impl.ts` - Terminal tool facade

**Permissions:**
- `/src/lib/agent/workspace-permission-manager.ts` - Workspace-aware permissions
- `/src/lib/agent/workspace-tool-filter.ts` - Tool filtering by workspace
- `/src/lib/agent/tool-permission-manager.ts` - Base permission manager

**UI:**
- `/src/presentation/components/agent/AgentConfigDialog.tsx` - Agent configuration
- `/src/presentation/components/chat/AgentSelector.tsx` - Agent selection
- `/src/presentation/components/ide/AgentChatPanel.tsx` (316 lines) - Chat UI

### 16.3 Database Files

**Schema:**
- `/src/lib/state/dexie-db.ts` (1267 lines) - Main database class
- `/src/lib/state/dexie-db-core-types.ts` - Core table types
- `/src/lib/state/dexie-db-ai-types.ts` - AI table types
- `/src/lib/state/dexie-db-session-types.ts` - Session table types
- `/src/lib/state/dexie-db-knowledge-types.ts` - Knowledge table types

**Migrations:**
- `/src/lib/state/dexie-db-migrations.ts` (691 lines) - Migration scripts

**Storage Adapter:**
- `/src/lib/state/dexie-storage.ts` - Zustand ↔ Dexie adapter

### 16.4 File System Files

**Core:**
- `/src/lib/filesystem/local-fs-adapter.ts` - Local FS operations
- `/src/lib/filesystem/sync-manager/sync-manager.ts` - Dual-write orchestrator
- `/src/lib/workspace/project-store.ts` - Project metadata persistence

**Support:**
- `/src/lib/filesystem/sync-planner.ts` - Sync plan generation
- `/src/lib/filesystem/sync-executor.ts` - Sync execution
- `/src/lib/filesystem/fsa-handle-manager.ts` - FSA handle persistence
- `/src/lib/filesystem/permission-lifecycle.ts` - Permission state management

---

**End of Analysis**

**Generated:** 2026-01-01
**Analyst:** Claude (Sonnet 4.5)
**Method:** BMAD v6 Framework - Comprehensive Codebase Architecture Assessment
