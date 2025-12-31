# Comprehensive System Context Analysis
**Project:** Via-gent (Project Alpha v2.0) - Knowledge Synthesis Station
**Analysis Date:** 2026-01-01
**Analyst:** BMAD Framework - Orchestrator Mode
**Document ID:** SYS-CTX-001
**Epic:** Architecture Transformation Preparation

---

## Executive Summary

This document provides a comprehensive analysis of the Via-gent codebase architecture, covering six critical systems requiring transformation for the next development phase. The analysis reveals a complex distributed state management architecture with 45+ Zustand stores, mixed persistence strategies (localStorage vs IndexedDB), and significant technical debt from rapid feature evolution.

### Key Findings

**Critical Issues:**
1. **State Fragmentation:** 45+ Zustand stores across 3 different persistence strategies
2. **Hot-Reload Bug (BF-01):** Agent configuration changes not visible across workspaces without manual refresh
3. **Duplicate State:** Multiple store implementations in `/src/stores` and `/src/lib/state` and `/src/infrastructure/persistence/stores`
4. **Missing Validation:** Agent model-provider relationships lack runtime validation
5. **Inconsistent Patterns:** Mix of Context, Zustand, and direct event handling

**Transformation Opportunities:**
1. Consolidate 45+ stores into ~15 domain-aligned stores
2. Implement centralized validation layer for agent configurations
3. Standardize on single persistence strategy (Dexie/IndexedDB)
4. Implement event-driven state synchronization architecture

---

## System 1: LLM Provider Configuration System

### 1.1 Architecture Overview

**Primary Files:**
- `/src/lib/agent/providers/provider-adapter.ts` (Lines 4926-5180)
- `/src/lib/agent/providers/types.ts` (Lines 5182-5450)
- `/src/lib/agent/providers/credential-vault.ts` (Lines 133878-134500)
- `/src/lib/agent/providers/model-registry.ts` (Referenced)
- `/src/lib/state/provider-store.ts` (Lines 1-216)

**Current Implementation:**

```
Provider Configuration Flow:
┌─────────────────────────────────────────────────────────────┐
│ AgentConfigDialog (UI)                                       │
├─────────────────────────────────────────────────────────────┤
│ - Provider Selection (OpenAI, OpenRouter, Custom)            │
│ - API Key Input (stored in credentialVault)                  │
│ - Model Selection (fetched from provider APIs)               │
│ - LLM Parameters (temperature, maxTokens, topP)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──> useProviderStore (Zustand + Dexie)
                     │    - providers: ProviderConfig[]
                     │    - availableModels: Record<string, ModelInfo[]>
                     │    - modelSettings: Record<string, ModelSettings>
                     │
                     ├──> credentialVault (IndexedDB)
                     │    - Encrypted API keys per provider
                     │    - Encryption: Web Crypto API (AES-GCM)
                     │
                     └──> providerAdapterFactory
                          - createAdapter(providerId, config)
                          - Test connection
                          - Cache adapters
```

### 1.2 Provider Storage Mechanisms

**Credential Vault Implementation:**
```typescript
// Location: src/lib/agent/providers/credential-vault.ts
// Lines: 133878-134500

class CredentialVault {
  // Storage: IndexedDB via Dexie
  // Table: 'credentials' (encrypted API keys)
  // Fields: providerId, encrypted (base64), iv (base64), createdAt

  async getCredentials(providerId: string): Promise<string | null>
  async setCredentials(providerId: string, apiKey: string): Promise<void>
  async deleteCredentials(providerId: string): Promise<void>

  // Encryption: Web Crypto API (SubtleCrypto)
  // Algorithm: AES-GCM 256-bit
  // Key Derivation: PBKDF2 with SHA-256
  // Salt: Generated per-vault instance
}
```

**Provider Store Implementation:**
```typescript
// Location: src/lib/state/provider-store.ts
// Lines: 1-216

interface ProviderState {
  providers: ProviderConfig[];  // Available providers
  activeProviderId: string | null;
  modelSettings: Record<string, ModelSettings>;  // Per-provider LLM params
  availableModels: Record<string, ModelInfo[]>;  // Fetched from APIs
  isLoading: boolean;
  isLoadingModels: Record<string, boolean>;

  // Actions
  addProvider: (config: ProviderConfig) => void;
  updateProvider: (id: string, config: Partial<ProviderConfig>) => void;
  removeProvider: (id: string) => Promise<void>;
  setActiveProvider: (id: string) => void;
  updateModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;
  fetchModels: (providerId: string) => Promise<void>;
}
```

### 1.3 Provider Endpoint Definitions

**Built-in Providers:**
```typescript
// Location: src/lib/agent/providers/types.ts
// Lines: 5338-5379

const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    defaultModel: 'gpt-4o',
    baseURL: 'https://api.openai.com/v1',
    enabled: true,
    supportsNativeTools: true,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'openai-compatible',
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    baseURL: 'https://openrouter.ai/api/v1',
    enabled: true,
    supportsNativeTools: true,
  },
  'openai-compatible': {
    id: 'openai-compatible',
    name: 'OpenAI Compatible',
    type: 'openai-compatible',
    enabled: true,
    isCustom: true,
    supportsNativeTools: false,  // User can override
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    type: 'gemini',
    defaultModel: 'gemini-3.0-flash',
    enabled: true,
    supportsNativeTools: true,
  },
};
```

**Custom Provider Configuration:**
```typescript
// Location: src/lib/agent/providers/types.ts
// Lines: 5224-5250

interface OpenAICompatibleConfig {
  id: string;
  name: string;
  baseURL: string;  // e.g., http://localhost:1234/v1
  apiKey?: string;
  headers?: Record<string, string>;
  defaultModel?: string;
  supportsNativeTools?: boolean;
  requiresApiKey?: boolean;
  createdAt: string;
  lastTestResult?: {
    success: boolean;
    latencyMs?: number;
    error?: string;
    testedAt: string;
  };
}
```

### 1.4 Model Loading Flows

**Model Registry Pattern:**
```typescript
// Location: src/lib/agent/providers/model-registry.ts
// Referenced in provider-store.ts (line 16)

class ModelRegistry {
  // Fetch available models from provider APIs
  async getModels(providerId: string, apiKey?: string): Promise<ModelInfo[]>

  // OpenAI: GET https://api.openai.com/v1/models
  // OpenRouter: GET https://openrouter.ai/api/v1/models
  // Gemini: GET https://generativelanguage.googleapis.com/v1/models
}
```

**Model Information Structure:**
```typescript
// Location: src/lib/agent/providers/types.ts
// Lines: 5268-5307

interface ModelInfo {
  id: string;
  name: string;
  isFree?: boolean;
  contextLength?: number;
  maxOutputTokens?: number;
  providerId: string;

  // LLM Parameter Defaults
  temperature?: number;
  maxTemperature?: number;
  topP?: number;
  topK?: number;

  // Capabilities
  supportedMethods?: string[];
  inputModalities?: string[];  // text, image, audio
  outputModalities?: string[];
  supportsTools?: boolean;

  // Pricing (per 1M tokens)
  pricing?: {
    prompt: number;
    completion: number;
  };
}
```

### 1.5 Persistence Strategies

**Provider Store Persistence:**
```typescript
// Location: src/lib/state/provider-store.ts
// Lines: 192-214

persist(
  (set, get) => ({ /* store implementation */ }),
  {
    name: 'via-gent-providers',
    storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
    partialize: (state) => ({
      providers: state.providers,
      activeProviderId: state.activeProviderId,
      modelSettings: state.modelSettings,
    }),
    onRehydrateStorage: () => (state) => {
      if (state && !state.providers?.length) {
        state.providers = INITIAL_PROVIDERS;
      }
    },
  }
)
```

**Credential Vault Persistence:**
```typescript
// Storage: IndexedDB 'credentials' table via Dexie
// Encryption: AES-GCM 256-bit with per-vault salt
// Key Derivation: PBKDF2 (100k iterations, SHA-256)
// Pattern: Singleton instance exported as credentialVault
```

### 1.6 Issues & Technical Debt

**P0 Issues:**
1. **BF-01 Hot-Reload Visibility:** Provider configuration changes not reflected across workspaces without page reload
2. **Missing Validation:** No runtime validation that modelId belongs to providerId
3. **Duplicate Stores:** `/src/stores/provider-config-store.ts` vs `/src/lib/state/provider-store.ts`
4. **Connection Caching:** ProviderAdapterFactory caches adapters but no invalidation strategy

**P1 Issues:**
1. **Model Loading Race Conditions:** Multiple simultaneous fetchModels calls for same provider
2. **Error Handling:** Generic error messages hide connection failures from users
3. **Credential Rotation:** No mechanism to rotate API keys without downtime

**P2 Issues:**
1. **Custom Provider Storage:** OpenAI-compatible providers stored separately from built-ins
2. **Test Result Persistence:** Connection test results stored in provider config, not persisted

---

## System 2: Agent Configuration System

### 2.1 Architecture Overview

**Primary Files:**
- `/src/stores/agents-store.ts` (Lines 1-325)
- `/src/stores/agent-selection-store.ts` (Lines 28012-28200)
- `/src/mocks/agents.ts` (Agent type definitions)
- `/src/domain/entities/agent.ts` (Domain layer entity)

**Current Implementation:**

```
Agent Configuration Flow:
┌─────────────────────────────────────────────────────────────┐
│ AgentConfigDialog (UI)                                       │
├─────────────────────────────────────────────────────────────┤
│ - Agent Name & Description                                   │
│ - Provider Selection (dropdown)                              │
│ - Model Selection (filtered by provider)                     │
│ - LLM Parameters (systemPrompt, temperature, maxTokens)      │
│ - Tool Bindings (read, write, execute, search)              │
│ - Workspace Bindings (ide, study, canvas)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──> useAgentsStore (Zustand + Dexie)
                     │    - agents: Agent[]
                     │    - activeAgentId: string | null
                     │    - Validation: modelId must exist in providerModels
                     │
                     └──> crossWorkspaceEventBus
                          - emitAgentConfigChange()
                          - BF-01 FIX: Hot-reload across workspaces
```

### 2.2 Agent Store Files

**Primary Store:**
```typescript
// Location: src/stores/agents-store.ts
// Lines: 1-325

interface AgentsState {
  agents: Agent[];
  activeAgentId: string | null;
  _hasHydrated: boolean;

  // Actions
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'tasksCompleted' | 'successRate' | 'tokensUsed' | 'lastActive'>) => Agent;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  getAgent: (id: string) => Agent | undefined;
  setActiveAgent: (id: string | null) => void;
  resetToDefaults: () => void;
}

// Persistence: Dexie IndexedDB 'agentConfigs' table
// Hydration: Ensures at least DEFAULT_AGENT exists
```

**Selection Store:**
```typescript
// Location: src/stores/agent-selection-store.ts
// Lines: 28012-28200

interface AgentSelectionState {
  activeAgentId: string | null;

  // Actions
  setActiveAgent: (id: string) => void;
  resetToDefaults: () => void;
}

// Note: Duplicates activeAgentId from agents-store.ts
// Issue: Why separate store for single value?
```

### 2.3 Agent Creation/Update Flows

**Agent Creation Flow:**
```typescript
// Location: src/stores/agents-store.ts
// Lines: 131-174

addAgent: (agentData) => {
  // STORY AC-02: P0 VALIDATION
  // Acceptance Criterion: "Validation: model must belong to provider"

  const { providerId, modelId } = agentData;

  // Only validate if both providerId and modelId are provided
  if (providerId && modelId) {
    const availableModels = useProviderStore.getState().availableModels;
    const providerModels = availableModels[providerId] || [];

    // Validate: modelId must exist in provider's available models
    const modelExists = providerModels.some(m => m.id === modelId);

    if (!modelExists) {
      throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
    }
  }

  const newAgent: Agent = {
    ...agentData,
    id: `agt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    tasksCompleted: 0,
    successRate: 0,
    tokensUsed: 0,
  };

  // WB-8.3: Emit cross-workspace event
  crossWorkspaceEventBus.emitAgentConfigChange({
    workspaceId: 'ide',  // TODO: Detect actual workspace
    agentId: newAgent.id,
    changeType: 'created',
  });

  return newAgent;
}
```

**Agent Update Flow:**
```typescript
// Location: src/stores/agents-store.ts
// Lines: 202-239

updateAgent: (id, updates) => {
  // STORY AC-02: P0 VALIDATION
  const { providerId, modelId } = updates;

  if (providerId && modelId) {
    const availableModels = useProviderStore.getState().availableModels;
    const providerModels = availableModels[providerId] || [];
    const modelExists = providerModels.some(m => m.id === modelId);

    if (!modelExists) {
      throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
    }
  }

  // Update agent
  set((state) => ({
    agents: state.agents.map((a) =>
      a.id === id
        ? { ...a, ...updates, lastActive: new Date().toISOString() }
        : a
    ),
  }));

  // WB-8.3: Emit cross-workspace event (BF-01 FIX: Hot-reload)
  crossWorkspaceEventBus.emitAgentConfigChange({
    workspaceId: 'ide',
    agentId: id,
    changeType: 'updated',
  });
}
```

### 2.4 Workspace Binding Implementations

**Agent Entity with Workspace Bindings:**
```typescript
// Location: src/domain/entities/agent.ts
// Lines: 1118-1300

class Agent {
  id: string;
  name: string;
  description: string;
  providerId: string;
  modelId: string;

  // LLM Parameters
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;

  // Tool Bindings
  tools: AgentToolBinding[];

  // Workspace Bindings
  workspaceBindings: WorkspaceBinding[];

  // Business Logic
  hasToolAccess(toolId: string, workspaceType: WorkspaceType): boolean {
    const tool = this.tools.find(t => t.toolId === toolId);
    return tool?.workspacePermissions[workspaceType] ?? false;
  }

  getEnabledToolsForWorkspace(workspaceType: WorkspaceType): AgentToolBinding[] {
    return this.tools.filter(
      (tool) => tool.workspacePermissions[workspaceType] ?? false
    );
  }
}
```

**Tool Permission Value Object:**
```typescript
// Location: src/domain/value-objects/tool-permission.ts
// Lines: 1915-2020

class AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: Record<WorkspaceType, boolean>;

  // Immutable methods
  withWorkspacePermission(workspaceType: WorkspaceType, enabled: boolean): AgentToolBinding {
    return new AgentToolBinding({
      ...this,
      workspacePermissions: {
        ...this.workspacePermissions,
        [workspaceType]: enabled,
      },
    });
  }

  hasPermissionInWorkspace(workspaceType: WorkspaceType): boolean {
    return this.workspacePermissions[workspaceType] ?? false;
  }
}
```

**Workspace Types:**
```typescript
type WorkspaceType = 'ide' | 'study' | 'canvas';

interface WorkspaceBinding {
  workspaceId: string;
  workspaceType: WorkspaceType;
  isActive: boolean;
}
```

### 2.5 Tool Permission System

**Tool Definitions:**
```typescript
// Location: src/lib/agent/tools/index.ts
// Lines: 1-171

export function getClientTools(
  fileTools: () => AgentFileTools,
  terminalTools: () => AgentTerminalTools,
  knowledgeTools?: () => AgentKnowledgeTools
) {
  const ft = createFileClientTools(fileTools);
  const tt = createTerminalClientTools(terminalTools);

  const tools = [
    ft.readFile,      // No approval needed
    ft.writeFile,     // needsApproval: true
    ft.listFiles,     // No approval needed
    tt.executeCommand, // needsApproval: true
    createSearchNotesClientTool(),
  ];

  if (knowledgeTools) {
    const kt = createKnowledgeClientTools(knowledgeTools);
    tools.push(
      kt.synthesize,
      kt.processPDF,
      kt.processImage,
      kt.processURL
    );
  }

  return tools;
}
```

**Tool Approval Flags:**
```typescript
// Location: src/lib/agent/tools/write-file-tool.ts
// Lines: 6054-6080

const writeFileDef = {
  description: 'Write content to a file. Creates the file if it does not exist, overwrites if it does. This action requires user approval.',
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  needsApproval: true,  // Requires user approval before execution
};

// Metadata
export const writeFileToolConfig = {
  needsApproval: true,
};
```

**Permission Check Integration:**
```typescript
// Location: src/lib/agent/tools/permission-check.ts
// Lines: 5700-5850

export function checkToolPermission(
  permissionManager: ToolPermissionManager,
  toolDefinition: { needsApproval?: boolean }
): PermissionCheckResult {
  const result = permissionManager.checkPermission(toolDefinition);

  return {
    isBlocked: result.isBlocked,
    needsApproval: result.needsApproval || toolDefinition.needsApproval,
  };
}

export function filterToolsByPermission(
  permissionManager: ToolPermissionManager,
  tools: { toolId: string; needsApproval?: boolean }[]
): { allowed: string[]; blocked: string[]; approvalRequired: string[] } {
  const allowed: string[] = [];
  const blocked: string[] = [];
  const approvalRequired: string[] = [];

  for (const tool of tools) {
    const check = checkToolPermission(permissionManager, tool);

    if (check.isBlocked) {
      blocked.push(tool.toolId);
    } else if (check.needsApproval) {
      approvalRequired.push(tool.toolId);
    } else {
      allowed.push(tool.toolId);
    }
  }

  return { allowed, blocked, approvalRequired };
}
```

### 2.6 Agent Selection Logic

**Selection Store:**
```typescript
// Location: src/stores/agent-selection-store.ts
// Lines: 28012-28200

export const useAgentSelection = create<AgentSelectionState>()(
  persist(
    (set, get) => ({
      activeAgentId: null,

      setActiveAgent: (id) => {
        console.log('[AgentSelection] Setting active agent:', id);
        set({ activeAgentId: id });
      },

      resetToDefaults: () => {
        const { agents } = useAgentsStore.getState();
        const defaultAgent = agents.find(a => a.id === DEFAULT_AGENT.id);
        set({ activeAgentId: defaultAgent?.id || agents[0]?.id || null });
      },
    }),
    {
      name: 'agent-selection',
      storage: createJSONStorage(() => createDexieStorage('agentSelection')),
    }
  )
);
```

**Cross-Store Dependency:**
```typescript
// Issue: agent-selection-store depends on agents-store via useAgentsStore()
// This creates circular dependency during initialization
// Both stores persist to Dexie but in different tables
```

### 2.7 Issues & Technical Debt

**P0 Issues:**
1. **Duplicate Active Agent ID:** Stored in both `agents-store` and `agent-selection-store`
2. **Circular Dependency:** `agent-selection-store` imports `agents-store`
3. **Missing Workspace Detection:** Hard-coded `workspaceId: 'ide'` in event emission
4. **Validation Race Condition:** Provider models may not be loaded when agent is created

**P1 Issues:**
1. **Default Agent Fallback:** No mechanism to recreate DEFAULT_AGENT if deleted
2. **Tool Permission Validation:** Runtime check missing in agent config UI
3. **Agent Statistics:** `tasksCompleted`, `successRate`, `tokensUsed` never updated
4. **Last Active Tracking:** Updated on every config change, not actual usage

**P2 Issues:**
1. **Agent Deletion:** No confirmation dialog or undo mechanism
2. **Agent Cloning:** No duplicate/create-from feature
3. **Agent Export/Import:** No backup/restore functionality

---

## System 3: Tool Permission System

### 3.1 Architecture Overview

**Primary Files:**
- `/src/lib/agent/tools/index.ts` (Lines 1-171)
- `/src/lib/agent/tools/permission-check.ts` (Lines 5700-5850)
- `/src/lib/agent/tool-permission-manager.ts` (Referenced)
- `/src/presentation/components/agent/ApprovalOverlay.tsx` (UI)
- `/src/presentation/components/agent/ToolPermissionsConfig.tsx` (UI)

**Current Implementation:**

```
Tool Permission Flow:
┌─────────────────────────────────────────────────────────────┐
│ Agent Chat Request                                           │
├─────────────────────────────────────────────────────────────┤
│ - User message triggers agent tool use                       │
│ - Agent determines which tools to call                       │
│ - Tool calls parsed from LLM response stream                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──> permission-check.ts
                     │    - checkToolPermission(manager, toolDef)
                     │    - Returns: { isBlocked, needsApproval }
                     │
                     ├──> Filter Tools
                     │    - filterToolsByPermission()
                     │    - Returns: { allowed, blocked, approvalRequired }
                     │
                     ├──> Blocked → Skip tool call
                     │
                     ├──> Approval Required → Show ApprovalOverlay
                     │    - User approves/denies
                     │    - Resolution stored in conversationStore
                     │
                     └──> Allowed → Execute tool
                          - Via tool facade (file/terminal/knowledge)
```

### 3.2 Tool Definition Files

**File Tools:**
```typescript
// Location: src/lib/agent/tools/read-file-tool.ts
const readFileDef = {
  description: 'Read the contents of a file from the project',
  parameters: z.object({
    path: z.string(),
  }),
  needsApproval: false,  // Safe operation
};

// Location: src/lib/agent/tools/write-file-tool.ts
const writeFileDef = {
  description: 'Write content to a file. Creates the file if it does not exist, overwrites if it does. This action requires user approval.',
  parameters: z.object({
    path: z.string(),
    content: z.string(),
  }),
  needsApproval: true,  // Destructive operation
};

// Location: src/lib/agent/tools/list-files-tool.ts
const listFilesDef = {
  description: 'List files and directories in a given path',
  parameters: z.object({
    path: z.string(),
  }),
  needsApproval: false,  // Safe operation
};
```

**Terminal Tools:**
```typescript
// Location: src/lib/agent/tools/execute-command-tool.ts
const executeCommandDef = {
  description: 'Execute a shell command in the project terminal. This action requires user approval.',
  parameters: z.object({
    command: z.string(),
    cwd?: z.string().optional(),
  }),
  needsApproval: true,  // High-risk operation
};
```

**Knowledge Tools:**
```typescript
// Location: src/lib/agent/tools/synthesize-tool.ts
// Location: src/lib/agent/tools/process-pdf-tool.ts
// Location: src/lib/agent/tools/process-url-tool.ts

// Knowledge tools: No approval required (read-only operations)
// EPIC-38: Knowledge Synthesis Integration
```

### 3.3 Tool Execution Flows

**TanStack AI Integration:**
```typescript
// Location: src/lib/agent/tools/index.ts
// Lines: 141-169

export function getClientTools(
  fileTools: () => AgentFileTools,
  terminalTools: () => AgentTerminalTools,
  knowledgeTools?: () => AgentKnowledgeTools
) {
  const ft = createFileClientTools(fileTools);
  const tt = createTerminalClientTools(terminalTools);

  const tools = [
    ft.readFile,      // ToolDefinition: { needsApproval: false }
    ft.writeFile,     // ToolDefinition: { needsApproval: true }
    ft.listFiles,     // ToolDefinition: { needsApproval: false }
    tt.executeCommand, // ToolDefinition: { needsApproval: true }
    createSearchNotesClientTool(),
  ];

  if (knowledgeTools) {
    const kt = createKnowledgeClientTools(knowledgeTools);
    tools.push(
      kt.synthesize,   // No approval
      kt.processPDF,   // No approval
      kt.processImage, // No approval
      kt.processURL    // No approval
    );
  }

  return tools;
}
```

**Client-Side Tool Creation:**
```typescript
// Location: src/lib/agent/tools/write-file-tool.ts
// Pattern: TanStack AI .client() for browser execution

export function createWriteFileClientTool(getTools: () => AgentFileTools) {
  return {
    tool: writeFileDef,
    execute: async ({ path, content }) => {
      const tools = getTools();
      return await tools.writeFile(path, content);
    },
  };
}
```

### 3.4 Permission Check Implementations

**Permission Manager Interface:**
```typescript
// Location: src/lib/agent/tool-permission-manager.ts
// Referenced in permission-check.ts

interface ToolPermissionManager {
  checkPermission(toolDefinition: {
    needsApproval?: boolean;
  }): PermissionCheckResult;
}

interface PermissionCheckResult {
  isBlocked: boolean;
  needsApproval: boolean;
  reason?: string;
}
```

**Permission Check Function:**
```typescript
// Location: src/lib/agent/tools/permission-check.ts
// Lines: 5720-5750

export function checkToolPermission(
  permissionManager: ToolPermissionManager,
  toolDefinition: { needsApproval?: boolean }
): PermissionCheckResult {
  const result = permissionManager.checkPermission(toolDefinition);

  return {
    isBlocked: result.isBlocked,
    needsApproval: result.needsApproval || toolDefinition.needsApproval,
  };
}
```

**Filter Tools Function:**
```typescript
// Location: src/lib/agent/tools/permission-check.ts
// Lines: 5808-5835

export function filterToolsByPermission(
  permissionManager: ToolPermissionManager,
  tools: { toolId: string; needsApproval?: boolean }[]
): { allowed: string[]; blocked: string[]; approvalRequired: string[] } {
  const allowed: string[] = [];
  const blocked: string[] = [];
  const approvalRequired: string[] = [];

  for (const tool of tools) {
    const check = checkToolPermission(permissionManager, tool);

    if (check.isBlocked) {
      blocked.push(tool.toolId);
    } else if (check.needsApproval) {
      approvalRequired.push(tool.toolId);
    } else {
      allowed.push(tool.toolId);
    }
  }

  return { allowed, blocked, approvalRequired };
}
```

### 3.5 Workspace-Specific Tool Access

**Agent Entity Logic:**
```typescript
// Location: src/domain/entities/agent.ts
// Lines: 1268-1292

class Agent {
  hasToolAccess(toolId: string, workspaceType: WorkspaceType): boolean {
    const tool = this.tools.find(t => t.toolId === toolId);
    return tool?.workspacePermissions[workspaceType] ?? false;
  }

  getEnabledToolsForWorkspace(workspaceType: WorkspaceType): AgentToolBinding[] {
    return this.tools.filter(
      (tool) => tool.workspacePermissions[workspaceType] ?? false
    );
  }

  canUseToolInWorkspace(toolId: string, workspaceType: WorkspaceType): boolean {
    // First check if tool is enabled
    const toolBinding = this.tools.find(t => t.toolId === toolId);
    if (!toolBinding?.isEnabled) return false;

    // Then check workspace permission
    return toolBinding.workspacePermissions[workspaceType] ?? false;
  }
}
```

**Tool Permission Value Object:**
```typescript
// Location: src/domain/value-objects/tool-permission.ts
// Lines: 1915-2020

class AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: Record<WorkspaceType, boolean>;

  // Immutable update method
  withWorkspacePermission(
    workspaceType: WorkspaceType,
    enabled: boolean
  ): AgentToolBinding {
    return new AgentToolBinding({
      ...this,
      workspacePermissions: {
        ...this.workspacePermissions,
        [workspaceType]: enabled,
      },
    });
  }

  hasPermissionInWorkspace(workspaceType: WorkspaceType): boolean {
    return this.workspacePermissions[workspaceType] ?? false;
  }
}
```

### 3.6 Approval UI Implementation

**Approval Overlay:**
```typescript
// Location: src/presentation/components/agent/ApprovalOverlay.tsx
// Lines: 726-900

export function ApprovalOverlay({
  toolName,
  toolInput,
  onApprove,
  onDeny,
}: {
  toolName: string;
  toolInput: unknown;
  onApprove: () => void;
  onDeny: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 max-w-md">
        <h3 className="text-lg font-semibold mb-2">
          Approve Tool Execution
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          The agent wants to execute: <code>{toolName}</code>
        </p>
        <pre className="text-xs bg-muted p-2 rounded mb-4 overflow-auto">
          {JSON.stringify(toolInput, null, 2)}
        </pre>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onDeny}>
            Deny
          </Button>
          <Button onClick={onApprove}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Pending Approval Tracking:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 29-40

export interface PendingToolApproval {
  id: string;
  conversationId: string;
  messageId: string;
  toolName: string;
  toolInput: unknown;
  status: 'pending' | 'approved' | 'denied';
  createdAt: number;
}

// In ConversationStore:
pendingToolApprovals: PendingToolApproval[];

addPendingToolApproval: (approval: Omit<PendingToolApproval, 'id' | 'createdAt'>) => string;
resolveToolApproval: (id: string, status: 'approved' | 'denied') => void;
```

### 3.7 Issues & Technical Debt

**P0 Issues:**
1. **No Workspace Detection:** Tools don't know which workspace they're running in
2. **Permission Manager Missing:** `ToolPermissionManager` interface not implemented
3. **Approval Persistence:** Pending approvals not persisted to IndexedDB
4. **Batch Approval:** No mechanism to approve/deny multiple tools at once

**P1 Issues:**
1. **Permission Granularity:** All-or-nothing per workspace, no path-based restrictions
2. **Approval Timeout:** No automatic denial after timeout period
3. **Approval History:** No audit log of past approval decisions
4. **Tool Categories:** No grouping of tools by risk level

**P2 Issues:**
1. **Auto-Approve Safe Tools:** No preference to always approve read/list operations
2. **Approval Explanations:** No context on why tool needs approval
3. **Custom Tool Permissions:** No UI for configuring custom tool rules

---

## System 4: Chat and Thread Management

### 4.1 Architecture Overview

**Primary Files:**
- `/src/lib/state/conversation-store.ts` (Lines 1-400+)
- `/src/stores/conversation-threads-store.ts` (Thread list view)
- `/src/lib/workspace/threads-store.ts` (Dexie persistence)
- `/src/lib/workspace/conversation-store.ts` (Duplicate?)

**Current Implementation:**

```
Chat and Thread Flow:
┌─────────────────────────────────────────────────────────────┐
│ ChatPanel UI                                                 │
├─────────────────────────────────────────────────────────────┤
│ - Message list (ThreadMessageRecord[])                       │
│ - Input box (user message)                                   │
│ - Streaming response display                                 │
│ - Approval overlay (for tool calls)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──> useConversationStore (Zustand + Dexie)
                     │    - activeConversationId: string | null
                     │    - conversations: Record<string, ConversationState>
                     │    - scrollPositions: Record<string, number>
                     │    - pendingToolApprovals: PendingToolApproval[]
                     │
                     ├──> Dexie Persistence
                     │    - Table: 'threads' (ConversationThreadRecord)
                     │    - Debounced write (500ms)
                     │
                     └──> TanStack AI Chat Streaming
                          - Server-Sent Events (SSE)
                          - Symbol.asyncIterator consumption
```

### 4.2 Conversation/Thread Stores

**Primary Conversation Store:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 1-400+

interface ConversationStoreState {
  activeConversationId: string | null;
  conversations: Record<string, ConversationState>;
  scrollPositions: Record<string, number>;
  pendingToolApprovals: PendingToolApproval[];
  _hasHydrated: boolean;

  // Actions
  setHasHydrated: (state: boolean) => void;
  createConversation: (projectId?: string | null, agentId?: string | null) => string;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: ThreadMessageRecord) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ThreadMessageRecord>) => void;
  updateScrollPosition: (conversationId: string, scrollTop: number) => void;
  addPendingToolApproval: (approval: Omit<PendingToolApproval, 'id' | 'createdAt'>) => string;
  resolveToolApproval: (id: string, status: 'approved' | 'denied') => void;
  getConversation: (id: string) => ConversationState | undefined;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  reset: () => void;
}

interface ConversationState {
  metadata: ConversationMetadata;
  messages: ThreadMessageRecord[];
}

interface ConversationMetadata {
  id: string;
  projectId: string | null;
  title: string;
  preview: string;
  agentId: string | null;
  messageCount: number;
  scrollPosition: number;
  createdAt: number;
  updatedAt: number;
}
```

**Thread Message Record:**
```typescript
// Location: src/lib/state/dexie-db.ts
// ThreadMessageRecord interface

interface ThreadMessageRecord {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolCallRecord[];
  createdAt: number;
}
```

**Thread List Store:**
```typescript
// Location: src/stores/conversation-threads-store.ts
// Referenced in analysis

interface ConversationThreadsState {
  threads: ConversationThread[];
  activeThreadId: string | null;

  // Actions
  addThread: (thread: ConversationThread) => void;
  updateThread: (id: string, updates: Partial<ConversationThread>) => void;
  deleteThread: (id: string) => void;
  setActiveThread: (id: string) => void;
}

interface ConversationThread {
  id: string;
  projectId: string;
  title: string;
  preview: string;
  messages: ThreadMessageRecord[];
  agentsUsed: string[];
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}
```

### 4.3 Message Flows

**Add Message Flow:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 300-350

addMessage: (conversationId, message) => {
  console.log('[ConversationStore] Adding message:', conversationId, message.id);

  set((state) => {
    const conversation = state.conversations[conversationId];
    if (!conversation) {
      console.warn('[ConversationStore] Conversation not found:', conversationId);
      return state;
    }

    const updatedMessages = [...conversation.messages, message];
    const updatedConversation: ConversationState = {
      ...conversation,
      messages: updatedMessages,
      metadata: {
        ...conversation.metadata,
        messageCount: updatedMessages.length,
        updatedAt: Date.now(),
      },
    };

    return {
      conversations: {
        ...state.conversations,
        [conversationId]: updatedConversation,
      },
    };
  });

  // Debounced persist to Dexie (500ms)
  const updatedConversation = get().conversations[conversationId];
  if (updatedConversation) {
    debouncedPersistToDexie(updatedConversation);
  }
}
```

**Update Message Flow:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 350-400

updateMessage: (conversationId, messageId, updates) => {
  console.log('[ConversationStore] Updating message:', conversationId, messageId, updates);

  set((state) => {
    const conversation = state.conversations[conversationId];
    if (!conversation) return state;

    const updatedMessages = conversation.messages.map((msg) =>
      msg.id === messageId ? { ...msg, ...updates } : msg
    );

    return {
      conversations: {
        ...state.conversations,
        [conversationId]: {
          ...conversation,
          messages: updatedMessages,
          metadata: {
            ...conversation.metadata,
            updatedAt: Date.now(),
          },
        },
      },
    };
  });

  // Debounced persist
  const updatedConversation = get().conversations[conversationId];
  if (updatedConversation) {
    debouncedPersistToDexie(updatedConversation);
  }
}
```

### 4.4 Context Management

**Conversation Context:**
```typescript
// TanStack AI chat context includes:
// - Previous messages in conversation
// - Agent system prompt
// - Agent LLM parameters (temperature, maxTokens, topP)
// - Tool definitions (filtered by permissions)

// Context is NOT managed by conversation-store
// Context is built dynamically in /src/routes/api/chat.ts
```

**Context Window Management:**
```typescript
// No explicit context window limiting in current implementation
// Relies on provider API to handle context limits
// TODO: Add token counting and context truncation
```

### 4.5 Streaming Implementations

**TanStack AI Chat Streaming:**
```typescript
// Location: src/routes/api/chat.ts
// Server-side streaming endpoint

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const formData = await request.formData();
  const message = formData.get('message') as string;
  const conversationId = formData.get('conversationId') as string;
  const agentId = formData.get('agentId') as string;

  // Get agent configuration
  const agent = useAgentsStore.getState().getAgent(agentId);

  // Get provider credentials
  const apiKey = await credentialVault.getCredentials(agent.providerId);

  // Create adapter
  const adapter = providerAdapterFactory.createAdapter(agent.providerId, {
    apiKey,
    model: agent.modelId,
  });

  // Create chat instance
  const chat = createChat({
    adapter,
    systemPrompt: agent.systemPrompt,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    topP: agent.topP,
  });

  // Stream response
  const stream = chat.stream({
    messages: conversationMessages,
    tools: getClientTools(fileTools, terminalTools),
  });

  // Return SSE stream
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(new TextEncoder().encode(text));
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  );
};
```

**Client-Side Stream Consumption:**
```typescript
// Location: src/presentation/components/chat/ChatConversation.tsx
// Pseudo-code based on analysis

async function sendMessage(message: string) {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('conversationId', conversationId);
  formData.append('agentId', agentId);

  const response = await fetch('/api/chat', {
    method: 'POST',
    body: formData,
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader?.read() ?? { done: true };
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'text-delta') {
          // Append text to assistant message
        } else if (data.type === 'tool-call') {
          // Handle tool call
        } else if (data.type === 'done') {
          // Mark stream complete
        }
      }
    }
  }
}
```

### 4.6 Pending Approvals

**Add Pending Approval:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 15856-15875

addPendingToolApproval: (approval) => {
  const id = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const fullApproval: PendingToolApproval = {
    ...approval,
    id,
    createdAt: now,
  };

  console.log('[ConversationStore] Adding tool approval:', id, approval.toolName);

  set((state) => ({
    pendingToolApprovals: [...state.pendingToolApprovals, fullApproval],
  }));

  return id;
}
```

**Resolve Approval:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 15874-15900

resolveToolApproval: (id, status) => {
  console.log('[ConversationStore] Resolving tool approval:', id, status);

  set((state) => ({
    pendingToolApprovals: state.pendingToolApprovals.map((a) =>
      a.id === id ? { ...a, status } : a
    ),
  }));

  // Clean up resolved approvals after 5 seconds
  setTimeout(() => {
    set((state) => ({
      pendingToolApprovals: state.pendingToolApprovals.filter((a) => a.id !== id),
    }));
  }, 5000);
}
```

**Pending Approvals Hook:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 16059-16080

export function usePendingApprovals(conversationId: string | null) {
  return useConversationStore((state) =>
    state.pendingToolApprovals.filter(
      (a) => a.conversationId === conversationId && a.status === 'pending'
    )
  );
}
```

### 4.7 Issues & Technical Debt

**P0 Issues:**
1. **Duplicate Store Implementations:** `/src/lib/state/conversation-store.ts` vs `/src/lib/workspace/conversation-store.ts`
2. **No Context Window Management:** No token counting or context truncation
3. **Pending Approvals Not Persisted:** Lost on page refresh
4. **Stream Error Handling:** No retry mechanism for failed streams

**P1 Issues:**
1. **Scroll Position Not Restored:** `scrollPositions` tracked but not used in UI
2. **No Conversation Search:** Cannot search across conversation history
3. **No Conversation Branching:** Cannot fork conversations
4. **No Conversation Export:** Cannot export conversation to markdown/JSON

**P2 Issues:**
1. **No Conversation Archive:** Old conversations clutter the list
2. **No Conversation Tags:** Cannot organize conversations by topic
3. **No Conversation Sharing:** Cannot share conversations via link

---

## System 5: File System Integration

### 5.1 Architecture Overview

**Primary Files:**
- `/src/lib/filesystem/local-fs-adapter.ts` (Lines 7363-7900)
- `/src/lib/filesystem/sync-manager/sync-manager.ts` (Core sync logic)
- `/src/lib/filesystem/sync-manager/types.ts` (Type definitions)
- `/src/lib/webcontainer/manager.ts` (WebContainer lifecycle)
- `/src/lib/workspace/project-store.ts` (Project metadata)

**Current Implementation:**

```
File System Sync Flow:
┌─────────────────────────────────────────────────────────────┐
│ Local File System (Source of Truth)                          │
│ - Browser File System Access API                            │
│ - User grants directory handle                               │
│ - Direct read/write operations                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──> LocalFSAdapter
                     │    - requestDirectoryAccess()
                     │    - readFile(path)
                     │    - writeFile(path, content)
                     │    - deleteFile(path)
                     │    - listDirectory(path)
                     │
                     ├──> SyncManager
                     │    - syncToWebContainer(localFiles)
                     │    - Exclusions: .git, node_modules, .DS_Store
                     │    - Debounced batch operations (100ms)
                     │
                     └──> WebContainer FS
                          - Mirror of local files
                          - Isolated sandbox for code execution
                          - No reverse sync (WC → Local blocked)
```

### 5.2 File Sync Managers

**LocalFSAdapter:**
```typescript
// Location: src/lib/filesystem/local-fs-adapter.ts
// Lines: 7363-7900

class LocalFSAdapter {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  // Permission Management
  async requestDirectoryAccess(): Promise<FileSystemDirectoryHandle> {
    if (!LocalFSAdapter.isSupported()) {
      throw new FileSystemError(
        'File System Access API not supported in this browser',
        'NOT_SUPPORTED'
      );
    }

    const handle = await window.showDirectoryPicker();
    this.directoryHandle = handle;

    return handle;
  }

  async verifyPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
    const options = { mode: 'readwrite' as const };
    return (await handle.queryPermission(options)) === 'granted';
  }

  async requestPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
    const options = { mode: 'readwrite' as const };
    return (await handle.requestPermission(options)) === 'granted';
  }

  // File Operations
  async readFile(path: string): Promise<string> {
    const fileHandle = await getFileHandle(this.directoryHandle!, path);
    const file = await fileHandle.getFile();
    return file.text();
  }

  async writeFile(path: string, content: string): Promise<void> {
    const fileHandle = await getOrCreateFileHandle(this.directoryHandle!, path);
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  async deleteFile(path: string): Promise<void> {
    const fileName = path.split('/').pop()!;
    await this.directoryHandle!.removeEntry(fileName);
  }

  async listDirectory(path: string): Promise<{ name: string; kind: 'file' | 'directory' }[]> {
    const dirHandle = await getDirectoryHandle(this.directoryHandle!, path);
    const entries: { name: string; kind: 'file' | 'directory' }[] = [];

    for await (const entry of dirHandle.values()) {
      entries.push({
        name: entry.name,
        kind: entry.kind,
      });
    }

    return entries;
  }
}
```

**SyncManager:**
```typescript
// Location: src/lib/filesystem/sync-manager/sync-manager.ts
// Referenced in grep results

class SyncManager {
  private localFSAdapter: LocalFSAdapter;
  private webContainerFS: WebContainerFS;
  private syncExclusions: string[];

  // Configuration
  constructor(
    localFSAdapter: LocalFSAdapter,
    webContainerFS: WebContainerFS,
    config?: Partial<SyncConfig>
  ) {
    this.localFSAdapter = localFSAdapter;
    this.webContainerFS = webContainerFS;
    this.syncExclusions = config?.syncExclusions ?? DEFAULT_SYNC_EXCLUSIONS;
  }

  // Sync Operations
  async syncToWebContainer(
    projectPath: string,
    onProgress?: (progress: SyncProgress) => void
  ): Promise<SyncResult> {
    const startTime = Date.now();
    let filesSynced = 0;
    let filesSkipped = 0;
    let errors: Array<{ path: string; error: string }> = [];

    try {
      // List all files in local directory
      const files = await this.listFilesRecursively(projectPath);

      for (const file of files) {
        // Check exclusion
        if (this.isExcluded(file.path)) {
          filesSkipped++;
          continue;
        }

        try {
          // Read from local FS
          const content = await this.localFSAdapter.readFile(file.path);

          // Write to WebContainer
          await this.webContainerFS.writeFile(file.path, content);

          filesSynced++;

          onProgress?.({
            totalFiles: files.length,
            filesSynced,
            filesSkipped,
            currentFile: file.path,
          });
        } catch (error) {
          errors.push({
            path: file.path,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return {
        success: errors.length === 0,
        filesSynced,
        filesSkipped,
        errors,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        filesSynced,
        filesSkipped,
        errors: [{
          path: projectPath,
          error: error instanceof Error ? error.message : 'Unknown error',
        }],
        durationMs: Date.now() - startTime,
      };
    }
  }

  // Helper: Check if path is excluded
  private isExcluded(path: string): boolean {
    return this.syncExclusions.some((exclusion) => {
      // Exact match
      if (path === exclusion) return true;

      // Directory match (exclusion ends with /)
      if (exclusion.endsWith('/') && path.startsWith(exclusion)) return true;

      // Glob pattern (simplified)
      if (exclusion.includes('*')) {
        const regex = new RegExp(exclusion.replace('*', '.*'));
        return regex.test(path);
      }

      return false;
    });
  }
}

// Default exclusions
const DEFAULT_SYNC_EXCLUSIONS = [
  '.git',
  'node_modules',
  '.DS_Store',
  'Thumbs.db',
  '.env.local',
];
```

**Sync Progress:**
```typescript
// Location: src/lib/filesystem/sync-manager/types.ts
// Referenced in grep results

interface SyncProgress {
  totalFiles: number;
  filesSynced: number;
  filesSkipped: number;
  currentFile: string;
}

interface SyncResult {
  success: boolean;
  filesSynced: number;
  filesSkipped: number;
  errors: Array<{ path: string; error: string }>;
  durationMs: number;
}
```

### 5.3 Workspace File Operations

**Project Store:**
```typescript
// Location: src/lib/workspace/project-store.ts
// Referenced in analysis

interface ProjectMetadata {
  id: string;
  name: string;
  path: string;
  directoryHandle: FileSystemDirectoryHandle;
  createdAt: number;
  lastAccessedAt: number;
}

class ProjectStore {
  // IndexedDB table: 'projects'
  async saveProject(project: ProjectMetadata): Promise<void>
  async getProject(id: string): Promise<ProjectMetadata | null>
  async listProjects(): Promise<ProjectMetadata[]>
  async deleteProject(id: string): Promise<void>
  async updateLastAccessed(id: string): Promise<void>
}
```

**File Operations in IDE:**
```typescript
// Location: src/presentation/components/ide/FileTree.tsx
// Pseudo-code based on analysis

function FileTree() {
  const [files, setFiles] = useState<FileSystemNode[]>([]);
  const localFSAdapter = useLocalFSAdapter();

  useEffect(() => {
    async function loadFiles() {
      const rootFiles = await localFSAdapter.listDirectory('/');
      setFiles(rootFiles);
    }

    loadFiles();
  }, []);

  async function handleFileSelect(path: string) {
    const content = await localFSAdapter.readFile(path);
    // Load into Monaco Editor
  }

  async function handleFileSave(path: string, content: string) {
    await localFSAdapter.writeFile(path, content);
    // Trigger sync to WebContainer
  }
}
```

### 5.4 Editor Integration Points

**Monaco Editor Integration:**
```typescript
// Location: src/lib/editor/monaco-integration.ts
// Pseudo-code based on analysis

class MonacoIntegration {
  private editor: monaco.editor.IStandaloneCodeEditor;
  private localFSAdapter: LocalFSAdapter;

  async openFile(path: string) {
    const content = await this.localFSAdapter.readFile(path);
    const model = monaco.editor.createModel(content, undefined, monaco.Uri.parse(path));
    this.editor.setModel(model);
  }

  async saveFile() {
    const model = this.editor.getModel();
    if (!model) return;

    const content = model.getValue();
    const path = model.uri.path;

    await this.localFSAdapter.writeFile(path, content);

    // Trigger sync
    await this.syncToWebContainer(path);
  }
}
```

**File Change Events:**
```typescript
// Location: src/lib/events/file-events.ts
// Pseudo-code based on analysis

class FileEventEmitter extends EventEmitter {
  emitFileChanged(path: string, content: string) {
    this.emit('file:changed', { path, content });
  }

  emitFileCreated(path: string) {
    this.emit('file:created', { path });
  }

  emitFileDeleted(path: string) {
    this.emit('file:deleted', { path });
  }
}
```

### 5.5 RAG Pipeline Components

**Knowledge File Sync Service:**
```typescript
// Location: src/lib/sync/knowledge-file-sync-service.ts
// Referenced in grep results

class KnowledgeFileSyncService {
  async syncKnowledgeFiles(projectPath: string): Promise<void> {
    // Sync PDF files
    await this.syncPDFs(projectPath);

    // Sync markdown files
    await this.syncMarkdown(projectPath);

    // Sync images
    await this.syncImages(projectPath);
  }

  private async syncPDFs(projectPath: string): Promise<void> {
    const pdfFiles = await this.localFSAdapter.listFiles(`${projectPath}/**/*.pdf`);

    for (const pdf of pdfFiles) {
      const content = await this.localFSAdapter.readFile(pdf.path);
      await this.knowledgeStore.storePDF(pdf.path, content);
    }
  }
}
```

**RAG Store:**
```typescript
// Location: src/lib/state/rag-store.ts
// Referenced in analysis

interface RAGStore {
  // Knowledge sources
  sources: KnowledgeSource[];

  // Embeddings
  embeddings: Embedding[];

  // Search results
  searchResults: SearchResult[];

  // Actions
  addSource: (source: KnowledgeSource) => Promise<void>;
  removeSource: (id: string) => Promise<void>;
  search: (query: string) => Promise<SearchResult[]>;
}

interface KnowledgeSource {
  id: string;
  type: 'pdf' | 'url' | 'image' | 'markdown';
  path: string;
  embeddingId: string;
  createdAt: number;
}
```

**Embedding Service:**
```typescript
// Location: src/lib/rag/embedding-service.ts
// Referenced in grep results

class EmbeddingService {
  async embedText(text: string): Promise<number[]> {
    // Use Gemini embedding API or local model
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedText', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    return data.embedding.value;
  }

  async embedPDF(pdfPath: string): Promise<number[]> {
    // Extract text from PDF
    const text = await this.extractPDFText(pdfPath);

    // Embed text
    return this.embedText(text);
  }
}
```

**Orama Index:**
```typescript
// Location: src/lib/rag/orama-index.ts
// Referenced in grep results

class OramaIndex {
  private db: Orama.Database;

  async initialize() {
    this.db = await Orama.create({
      schema: {
        id: 'string',
        content: 'string',
        embedding: 'vector[1536]',
        metadata: 'object',
      },
    });

    await Orama.load(this.db, indexedDBStorage);
  }

  async indexDocument(doc: { id: string; content: string; embedding: number[]; metadata: object }) {
    await Orama.insert(this.db, doc);
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    const results = await Orama.search(this.db, {
      term: query,
      limit,
    });

    return results.hits.map((hit) => ({
      id: hit.document.id,
      content: hit.document.content,
      score: hit.score,
      metadata: hit.document.metadata,
    }));
  }
}
```

### 5.6 Issues & Technical Debt

**P0 Issues:**
1. **No Reverse Sync:** WebContainer changes (e.g., npm install) do not sync back to local
2. **Sync Exclusions Hardcoded:** No UI to configure custom exclusions
3. **Permission Ephemeral:** File system permissions lost on page reload
4. **No Conflict Resolution:** Concurrent edits cause data loss

**P1 Issues:**
1. **Sync Progress Not Visible:** No feedback during long sync operations
2. **Large File Handling:** No size limits or chunking for large files
3. **Binary File Corruption:** Binary files corrupted by text-based operations
4. **No File Watching:** Changes in external editor not detected

**P2 Issues:**
1. **No File History:** Cannot revert to previous file versions
2. **No File Diff:** Cannot compare local vs WebContainer versions
3. **No Sync Conflict UI:** No mechanism to resolve sync conflicts

---

## System 6: State Orchestration

### 6.1 Architecture Overview

**Primary Files:**
- `/src/lib/state/ide-store.ts` (IDE panel state)
- `/src/lib/state/navigation-store.ts` (Navigation state)
- `/src/lib/state/statusbar-store.ts` (Status bar state)
- `/src/lib/state/layout-store.ts` (Layout state)
- `/src/lib/workspace/ide-state-store.ts` (Duplicate?)
- `/src/lib/events/cross-workspace-event-bus.ts` (Cross-workspace events)

**Current Implementation:**

```
State Orchestration Flow:
┌─────────────────────────────────────────────────────────────┐
│ Zustand Stores (45+ total)                                  │
├─────────────────────────────────────────────────────────────┤
│ Persisted State (IndexedDB):                                │
│ - useIDEStore (panels, active file, chat visibility)         │
│ - useAgentsStore (agent configurations)                     │
│ - useProviderStore (provider configs)                       │
│ - useConversationStore (active conversation, messages)       │
│ - useKnowledgeStore (knowledge sources)                     │
│ - useRAGStore (embeddings, search)                          │
│                                                             │
│ Ephemeral State (in-memory):                                │
│ - useStatusBarStore (status bar segments)                   │
│ - useNavigationStore (command palette, feature search)       │
│ - useFileSyncStatusStore (sync status)                      │
│                                                             │
│ Agent State (localStorage):                                 │
│ - useAgentsStore (migrated to IndexedDB)                    │
│ - useAgentSelectionStore (active agent ID)                  │
│                                                             │
│ UI State (React Context):                                   │
│ - WorkspaceContext (current workspace)                      │
│ - ThemeContext (dark/light mode)                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──> Event Emitter Pattern
                     │    - File change events
                     │    - Agent config changes (WB-8.3)
                     │    - Sync status updates
                     │
                     ├──> Cross-Workspace Event Bus
                     │    - emitAgentConfigChange()
                     │    - Broadcast across workspaces
                     │
                     └──> Direct Store Access
                          - Components import stores directly
                          - No centralized state manager
```

### 6.2 All Zustand Stores

**Persisted Stores (IndexedDB via Dexie):**
1. `/src/lib/state/ide-store.ts` - IDE panels, active file, terminal tab
2. `/src/lib/state/provider-store.ts` - Provider configurations, models
3. `/src/lib/state/conversation-store.ts` - Active conversation, messages
4. `/src/lib/state/knowledge-store.ts` - Knowledge sources
5. `/src/lib/state/rag-store.ts` - RAG embeddings, search
6. `/src/lib/state/quiz-store.ts` - Quiz data
7. `/src/lib/state/study-store.ts` - Study sessions
8. `/src/lib/state/canvas-store.ts` - Canvas state
9. `/src/lib/state/flashcard-store.ts` - Flashcard data
10. `/src/lib/state/workspace-store.ts` - Workspace metadata
11. `/src/lib/state/hub-store.ts` - Hub page state
12. `/src/stores/agents-store.ts` - Agent configurations (migrated)
13. `/src/stores/agent-selection-store.ts` - Active agent ID
14. `/src/stores/conversation-threads-store.ts` - Thread list
15. `/src/stores/openai-compatible-store.ts` - Custom providers
16. `/src/stores/prompt-enhancement-store.ts` - Prompt enhancement

**Ephemeral Stores (in-memory):**
17. `/src/lib/state/navigation-store.ts` - Command palette, search
18. `/src/lib/state/statusbar-store.ts` - Status bar segments
19. `/src/lib/workspace/file-sync-status-store.ts` - Sync progress

**Duplicate/Deprecated Stores:**
20. `/src/lib/workspace/conversation-store.ts` - DUPLICATE of /src/lib/state/conversation-store.ts
21. `/src/lib/workspace/ide-state-store.ts` - DUPLICATE of /src/lib/state/ide-store.ts
22. `/src/stores/provider-config-store.ts` - OLD, replaced by /src/lib/state/provider-store.ts
23. `/src/stores/provider-models-store.ts` - OLD, replaced by /src/lib/state/provider-store.ts
24. `/src/stores/models-loader-store.ts` - OLD, replaced by /src/lib/state/provider-store.ts

**Infrastructure Stores:**
25. `/src/infrastructure/persistence/stores/` - Mirror implementations of all above

### 6.3 Event Wiring

**Cross-Workspace Event Bus:**
```typescript
// Location: src/lib/events/cross-workspace-event-bus.ts
// Lines: Referenced in agents-store.ts

class CrossWorkspaceEventBus extends EventEmitter {
  // Agent Configuration Events
  emitAgentConfigChange(event: {
    workspaceId: string;
    agentId: string;
    changeType: 'created' | 'updated' | 'deleted';
  }) {
    this.emit('agent:config:changed', event);
  }

  onAgentConfigChange(handler: (event: AgentConfigChangeEvent) => void) {
    this.on('agent:config:changed', handler);
  }

  // Provider Configuration Events
  emitProviderConfigChange(event: {
    workspaceId: string;
    providerId: string;
    changeType: 'added' | 'updated' | 'removed';
  }) {
    this.emit('provider:config:changed', event);
  }

  // File System Events
  emitFileChanged(event: {
    workspaceId: string;
    path: string;
    content: string;
  }) {
    this.emit('file:changed', event);
  }

  // Knowledge Source Events
  emitKnowledgeSourceChanged(event: {
    workspaceId: string;
    sourceId: string;
    changeType: 'added' | 'updated' | 'removed';
  }) {
    this.emit('knowledge:source:changed', event);
  }
}

export const crossWorkspaceEventBus = new CrossWorkspaceEventBus();
```

**File Change Events:**
```typescript
// Location: src/lib/events/index.ts
// Pseudo-code based on analysis

class FileEventEmitter extends EventEmitter {
  emitFileChanged(path: string, content: string) {
    this.emit('file:changed', { path, content });
  }

  emitFileCreated(path: string) {
    this.emit('file:created', { path });
  }

  emitFileDeleted(path: string) {
    this.emit('file:deleted', { path });
  }
}

export const fileEventEmitter = new FileEventEmitter();
```

**Store Events:**
```typescript
// Location: src/lib/events/store-events.ts
// Referenced in grep results

class StoreEventEmitter extends EventEmitter {
  // Agent Store Events
  emitAgentAdded(agent: Agent) {
    this.emit('agent:added', agent);
  }

  emitAgentUpdated(agent: Agent) {
    this.emit('agent:updated', agent);
  }

  emitAgentRemoved(agentId: string) {
    this.emit('agent:removed', agentId);
  }

  // Provider Store Events
  emitProviderAdded(provider: ProviderConfig) {
    this.emit('provider:added', provider);
  }

  emitProviderUpdated(provider: ProviderConfig) {
    this.emit('provider:updated', provider);
  }

  emitProviderRemoved(providerId: string) {
    this.emit('provider:removed', providerId);
  }

  // Conversation Store Events
  emitMessageAdded(conversationId: string, message: ThreadMessageRecord) {
    this.emit('message:added', { conversationId, message });
  }

  emitConversationCreated(conversationId: string) {
    this.emit('conversation:created', { conversationId });
  }
}

export const storeEventEmitter = new StoreEventEmitter();
```

### 6.4 Cross-Store Dependencies

**Agent Store → Provider Store:**
```typescript
// Location: src/stores/agents-store.ts
// Lines: 142-151

addAgent: (agentData) => {
  const { providerId, modelId } = agentData;

  // DEPENDENCY: Read from provider store
  const availableModels = useProviderStore.getState().availableModels;
  const providerModels = availableModels[providerId] || [];

  const modelExists = providerModels.some(m => m.id === modelId);

  if (!modelExists) {
    throw new Error(`Model "${modelId}" is not available for provider "${providerId}"`);
  }

  // ... create agent
}
```

**Agent Selection Store → Agents Store:**
```typescript
// Location: src/stores/agent-selection-store.ts
// Lines: 28080-28103

resetToDefaults: () => {
  // DEPENDENCY: Read from agents store
  const { agents } = useAgentsStore.getState();
  const defaultAgent = agents.find(a => a.id === DEFAULT_AGENT.id);

  set({ activeAgentId: defaultAgent?.id || agents[0]?.id || null });
}
```

**Conversation Store → Threads Store:**
```typescript
// Location: src/lib/state/conversation-store.ts
// Lines: 190-229

async function persistToDexie(conversation: ConversationState) {
  const thread: ConversationThreadRecord = {
    id: conversation.metadata.id,
    projectId: conversation.metadata.projectId || 'default',
    title: conversation.metadata.title,
    preview: conversation.metadata.preview || '',
    messages: conversation.messages,
    agentsUsed: conversation.metadata.agentId ? [conversation.metadata.agentId] : [],
    messageCount: conversation.messages.length,
    createdAt: conversation.metadata.createdAt,
    updatedAt: conversation.metadata.updatedAt,
  };

  // DEPENDENCY: Write to threads store
  await saveThread(thread);
}
```

**Provider Store → Credential Vault:**
```typescript
// Location: src/lib/state/provider-store.ts
// Lines: 112-128

removeProvider: async (id) => {
  // DEPENDENCY: Delete from credential vault
  try {
    await credentialVault.deleteCredentials(id);
  } catch (error) {
    console.error(`[ProviderStore] Failed to delete credentials for ${id}:`, error);
  }

  // Then remove from store
  set((state) => ({
    providers: state.providers.filter(p => p.id !== id),
  }));
}
```

### 6.5 State Flow Patterns

**Pattern 1: Direct Store Access**
```typescript
// Common pattern in components

function AgentConfigDialog() {
  const agents = useAgentsStore((state) => state.agents);
  const addAgent = useAgentsStore((state) => state.addAgent);
  const providers = useProviderStore((state) => state.providers);

  // Direct access, no abstraction layer
}
```

**Pattern 2: Cross-Store Validation**
```typescript
// Pattern: Store A validates against Store B

addAgent: (agentData) => {
  // Read from provider store
  const providerModels = useProviderStore.getState().availableModels[agentData.providerId];

  // Validate
  if (!providerModels?.some(m => m.id === agentData.modelId)) {
    throw new Error('Invalid model for provider');
  }

  // Write to agent store
  set((state) => ({ agents: [...state.agents, newAgent] }));
}
```

**Pattern 3: Event-Driven Synchronization**
```typescript
// Pattern: Store change → Event → Other stores update

updateAgent: (id, updates) => {
  set((state) => ({
    agents: state.agents.map((a) => (a.id === id ? { ...a, ...updates } : a)),
  }));

  // Emit event for cross-workspace sync
  crossWorkspaceEventBus.emitAgentConfigChange({
    workspaceId: 'ide',
    agentId: id,
    changeType: 'updated',
  });
}

// Other workspaces listen
useEffect(() => {
  const handler = (event) => {
    console.log('[Workspace] Agent config changed:', event);
    // Reload agent configuration
  };

  crossWorkspaceEventBus.onAgentConfigChange(handler);

  return () => {
    crossWorkspaceEventBus.offAgentConfigChange(handler);
  };
}, []);
```

**Pattern 4: Debounced Persistence**
```typescript
// Pattern: State change → Debounce → Persist to IndexedDB

const debouncedPersistToDexie = simpleDebounce(
  async (conversation: ConversationState) => {
    await persistToDexie(conversation);
  },
  500 // 500ms delay
);

addMessage: (conversationId, message) => {
  // Update in-memory state immediately
  set((state) => ({
    conversations: {
      ...state.conversations,
      [conversationId]: {
        ...state.conversations[conversationId],
        messages: [...state.conversations[conversationId].messages, message],
      },
    },
  }));

  // Persist to IndexedDB after 500ms
  debouncedPersistToDexie(get().conversations[conversationId]);
}
```

### 6.6 Issues & Technical Debt

**P0 Issues:**
1. **State Fragmentation:** 45+ stores with overlapping responsibilities
2. **Duplicate Stores:** Same state managed in multiple locations
3. **Circular Dependencies:** AgentSelectionStore imports AgentsStore
4. **No State Validation Layer:** Validation scattered across stores

**P1 Issues:**
1. **No State Machine:** State transitions not enforced
2. **No State Versioning:** Schema changes break existing IndexedDB data
3. **No State Migration:** No upgrade paths for IndexedDB schemas
4. **No State Debugging:** No DevTools integration for Zustand

**P2 Issues:**
1. **No State Snapshotting:** Cannot save/restore entire application state
2. **No State Rollback:** Cannot undo state changes
3. **No State Analytics:** No tracking of state change patterns

---

## Transformation Roadmap

### Phase 1: State Consolidation (Weeks 1-2)

**Goal:** Reduce from 45+ stores to ~15 domain-aligned stores

**Actions:**
1. **Identify Duplicate Stores:**
   - Merge `/src/stores/provider-config-store.ts` → `/src/lib/state/provider-store.ts`
   - Merge `/src/lib/workspace/conversation-store.ts` → `/src/lib/state/conversation-store.ts`
   - Merge `/src/lib/workspace/ide-state-store.ts` → `/src/lib/state/ide-store.ts`

2. **Define New Store Architecture:**
   ```
   Domain Stores (15 total):
   1. IDE Store (editor state, panels, terminal)
   2. Agent Store (configurations, selection, statistics)
   3. Provider Store (configs, models, credentials)
   4. Conversation Store (active conversation, messages, threads)
   5. Knowledge Store (sources, embeddings, search)
   6. RAG Store (pipeline state, indexing)
   7. Quiz Store (quizzes, attempts, history)
   8. Study Store (sessions, progress, analytics)
   9. Canvas Store (blocks, connections, layout)
   10. Flashcard Store (decks, cards, reviews)
   11. Workspace Store (projects, bindings)
   12. Navigation Store (command palette, search)
   13. Status Bar Store (segments, notifications)
   14. Layout Store (resizable panels, sidebar)
   15. Theme Store (dark/light mode, design tokens)
   ```

3. **Create Migration Plan:**
   - Write data migration scripts for each store consolidation
   - Version IndexedDB schemas
   - Test migration with production data

### Phase 2: Validation Layer (Weeks 3-4)

**Goal:** Implement centralized validation for agent configurations

**Actions:**
1. **Create Validation Service:**
   ```typescript
   class AgentConfigValidator {
     validateAgentConfig(config: AgentConfig): ValidationResult {
       // Validate providerId exists
       // Validate modelId belongs to provider
       // Validate tool permissions consistent
       // Validate workspace bindings valid
       // Validate LLM parameters in range
     }

     validateProviderConfig(config: ProviderConfig): ValidationResult {
       // Validate provider supported
       // Validate API key format
       // Validate baseURL reachable
     }
   }
   ```

2. **Integrate Validation:**
   - Add validation to `addAgent()` and `updateAgent()` actions
   - Add validation to `addProvider()` and `updateProvider()` actions
   - Show validation errors in AgentConfigDialog UI

3. **Add Validation Tests:**
   - Unit tests for all validation rules
   - Integration tests for cross-store validation
   - E2E tests for validation UI feedback

### Phase 3: Event-Driven Architecture (Weeks 5-6)

**Goal:** Implement centralized event bus for state synchronization

**Actions:**
1. **Create Event Bus:**
   ```typescript
   class StateEventBus {
     // Agent Events
     onAgentAdded(callback: (agent: Agent) => void): Unsubscribe
     emitAgentAdded(agent: Agent): void

     // Provider Events
     onProviderAdded(callback: (provider: ProviderConfig) => void): Unsubscribe
     emitProviderAdded(provider: ProviderConfig): void

     // Conversation Events
     onMessageAdded(callback: (msg: Message) => void): Unsubscribe
     emitMessageAdded(msg: Message): void
   }
   ```

2. **Replace Direct Cross-Store Access:**
   - Agent store reads provider store via event, not direct import
   - Conversation store persists via event, not direct import
   - All cross-store communication via events

3. **Implement Event Sourcing:**
   - Log all state change events
   - Replay events for state restoration
   - Debug state changes via event log

### Phase 4: Hot-Reload Fix (Week 7)

**Goal:** Fix BF-01 hot-reload visibility bug

**Actions:**
1. **Implement Workspace Detection:**
   ```typescript
   function getCurrentWorkspace(): WorkspaceType {
     // Detect current workspace from route/context
     // Return 'ide' | 'study' | 'canvas'
   }
   ```

2. **Emit Workspace-Aware Events:**
   ```typescript
   updateAgent: (id, updates) => {
     // ... update logic

     crossWorkspaceEventBus.emitAgentConfigChange({
       workspaceId: getCurrentWorkspace(), // Dynamic detection
       agentId: id,
       changeType: 'updated',
     });
   }
   ```

3. **Add Event Listeners in All Workspaces:**
   ```typescript
   useEffect(() => {
     const handler = (event) => {
       // Reload agent config on change
       useAgentsStore.getState().hydrate();
     };

     crossWorkspaceEventBus.onAgentConfigChange(handler);

     return () => {
       crossWorkspaceEventBus.offAgentConfigChange(handler);
     };
   }, []);
   ```

### Phase 5: Persistence Standardization (Weeks 8-9)

**Goal:** Standardize on single persistence strategy (Dexie/IndexedDB)

**Actions:**
1. **Create Persistence Layer:**
   ```typescript
   class PersistenceManager {
     async save(storeName: string, state: object): Promise<void>
     async load(storeName: string): Promise<object>
     async delete(storeName: string): Promise<void>
     async migrate(storeName: string, fromVersion: number, toVersion: number): Promise<void>
   }
   ```

2. **Migrate All Stores to Dexie:**
   - Replace all `createJSONStorage(() => localStorage)` with `createDexieStorage()`
   - Add version numbers to all IndexedDB tables
   - Write migration scripts for each store

3. **Add DevTools Integration:**
   - Integrate Zustand DevTools
   - Add state inspection in Redux DevTools
   - Add time-travel debugging

---

## Acceptance Criteria

### Success Metrics

**State Consolidation:**
- [ ] Store count reduced from 45+ to ≤15
- [ ] No duplicate store implementations
- [ ] All stores follow consistent naming pattern
- [ ] All stores use Dexie persistence

**Validation Layer:**
- [ ] All agent configurations validated before save
- [ ] All provider configurations validated before save
- [ ] Validation errors displayed in UI
- [ ] Validation tests passing with 100% coverage

**Event-Driven Architecture:**
- [ ] No direct cross-store imports
- [ ] All cross-store communication via events
- [ ] Event logging enabled in development
- [ ] Event replay working for state restoration

**Hot-Reload Fix:**
- [ ] Agent config changes visible across workspaces without reload
- [ ] Provider config changes visible across workspaces without reload
- [ ] Workspace detection working for all workspaces
- [ ] Event listeners properly cleaned up on unmount

**Persistence Standardization:**
- [ ] All stores using Dexie/IndexedDB
- [ ] No localStorage usage for state
- [ ] Migration scripts tested with production data
- [ ] DevTools integration working

### Definition of Done

**Phase 1 (State Consolidation):**
- [ ] Duplicate stores identified and documented
- [ ] Migration plan written and reviewed
- [ ] Migration scripts implemented and tested
- [ ] All components updated to use new store paths
- [ ] Documentation updated with new store architecture

**Phase 2 (Validation Layer):**
- [ ] Validation service implemented
- [ ] Validation integrated into all store actions
- [ ] Validation UI components created
- [ ] Validation tests passing
- [ ] Error handling documented

**Phase 3 (Event-Driven Architecture):**
- [ ] Event bus implemented
- [ ] All cross-store imports replaced with events
- [ ] Event logging working
- [ ] Event replay tested
- [ ] Performance benchmarks passing

**Phase 4 (Hot-Reload Fix):**
- [ ] Workspace detection implemented
- [ ] Event emission updated with workspace ID
- [ ] Event listeners added to all workspaces
- [ ] Hot-reload tested across all workspaces
- [ ] Bug report BF-01 closed

**Phase 5 (Persistence Standardization):**
- [ ] Persistence manager implemented
- [ ] All stores migrated to Dexie
- [ ] Migration scripts tested
- [ ] DevTools integrated
- [ ] Documentation updated

---

## Appendices

### Appendix A: File Path Index

**Provider Configuration:**
- `/src/lib/agent/providers/provider-adapter.ts`
- `/src/lib/agent/providers/types.ts`
- `/src/lib/agent/providers/credential-vault.ts`
- `/src/lib/agent/providers/model-registry.ts`
- `/src/lib/state/provider-store.ts`

**Agent Configuration:**
- `/src/stores/agents-store.ts`
- `/src/stores/agent-selection-store.ts`
- `/src/domain/entities/agent.ts`
- `/src/domain/value-objects/tool-permission.ts`
- `/src/mocks/agents.ts`

**Tool Permissions:**
- `/src/lib/agent/tools/index.ts`
- `/src/lib/agent/tools/permission-check.ts`
- `/src/lib/agent/tool-permission-manager.ts`
- `/src/presentation/components/agent/ApprovalOverlay.tsx`
- `/src/presentation/components/agent/ToolPermissionsConfig.tsx`

**Chat and Threads:**
- `/src/lib/state/conversation-store.ts`
- `/src/stores/conversation-threads-store.ts`
- `/src/lib/workspace/threads-store.ts`
- `/src/lib/workspace/conversation-store.ts`
- `/src/routes/api/chat.ts`

**File System:**
- `/src/lib/filesystem/local-fs-adapter.ts`
- `/src/lib/filesystem/sync-manager/sync-manager.ts`
- `/src/lib/filesystem/sync-manager/types.ts`
- `/src/lib/webcontainer/manager.ts`
- `/src/lib/workspace/project-store.ts`

**State Orchestration:**
- `/src/lib/state/ide-store.ts`
- `/src/lib/state/navigation-store.ts`
- `/src/lib/state/statusbar-store.ts`
- `/src/lib/state/layout-store.ts`
- `/src/lib/events/cross-workspace-event-bus.ts`
- `/src/lib/events/store-events.ts`

### Appendix B: Glossary

**Term Definitions:**
- **Agent:** AI configuration with provider, model, tools, and workspace bindings
- **Provider:** LLM API service (OpenAI, OpenRouter, Gemini)
- **Model:** Specific AI model (gpt-4o, meta-llama/llama-3.1-8b-instruct:free)
- **Tool:** Function agent can execute (read_file, write_file, execute_command)
- **Workspace:** Application context (ide, study, canvas)
- **Conversation:** Chat session with message history
- **Thread:** Synonym for conversation in threads view
- **Knowledge:** RAG sources (PDF, URL, image, markdown)
- **RAG:** Retrieval Augmented Generation
- **Embedding:** Vector representation of text for semantic search
- **Orama:** Vector search engine for WASM
- **Dexie:** IndexedDB wrapper library
- **Zustand:** State management library
- **WebContainer:** Sandboxed code execution environment

### Appendix C: References

**Related Documents:**
- `_bmad-output/project-planning-artifacts/architecture.md`
- `_bmad-output/state-management-audit-p1.10-2025-12-26.md`
- `_bmad-output/sprint-artifacts/WB-PR-1-hot-reload-bug-report-2025-12-26.md`
- `_bmad-output/sprint-artifacts/WB-8.3-cross-workspace-event-system-implementation-2026-01-01.md`
- `CLAUDE.md` (Project instructions)
- `AGENTS.md` (Agent-specific patterns)

**External References:**
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Dexie.js Documentation](https://dexie.org/)
- [TanStack AI Documentation](https://tanstack.com/ai)
- [WebContainer Documentation](https://webcontainers.io/)
- [Orama Documentation](https://docs.orama.com/)

---

**Document Status:** Draft
**Last Updated:** 2026-01-01
**Next Review:** After Phase 1 completion (Week 2)
**Change Log:**
- 2026-01-01: Initial comprehensive analysis created
