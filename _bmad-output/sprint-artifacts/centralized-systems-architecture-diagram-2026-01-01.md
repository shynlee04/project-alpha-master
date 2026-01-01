# Centralized Systems Architecture Diagrams
**Ralph Loop Cycle 12, Iteration 10 - 2026-01-01**

## 1. Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VIA-GENT ARCHITECTURE                             │
│                     (Three Centralized Systems)                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  1. LLM PROVIDER KEY VAULT PERSISTENCE ✅ EXCELLENT                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         Provider Store (Zustand + Dexie)                  │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ providers: ProviderConfig[]                 │          │          │
│  │  │ activeProviderId: string                    │          │          │
│  │  │ modelSettings: Record<string, ModelSettings>│          │          │
│  │  │ availableModels: Record<string, ModelInfo[]> │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └───────────────┬──────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │           Credential Vault (3-Layer Facade)              │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ credentialVault (Public API)                │          │          │
│  │  │   - initialize()                             │          │          │
│  │  │   - storeCredentials(providerId, apiKey)     │          │          │
│  │  │   - getCredentials(providerId)               │          │          │
│  │  └───────────┬─────────────────────────────────┘          │          │
│  │              │                                              │          │
│  │      ┌───────┴────────┐                                    │          │
│  │      ▼                 ▼                                    │          │
│  │  ┌──────────────┐  ┌──────────────┐                        │          │
│  │  │   Storage    │  │  Encryption  │                        │          │
│  │  │ (IndexedDB)  │  │ (AES-256-GCM)│                        │          │
│  │  └──────────────┘  └──────────────┘                        │          │
│  └──────────────────────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │           Provider Adapter Factory                        │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ providerAdapterFactory.createAdapter()       │          │          │
│  │  │   - AnthropicAdapter                         │          │          │
│  │  │   - OpenRouterAdapter                        │          │          │
│  │  │   - GeminiAdapter                            │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │              Model Registry                               │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ modelRegistry.getModels(providerId, apiKey)  │          │          │
│  │  │   - Cache-first approach                     │          │          │
│  │  │   - Fallback to defaults                     │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  2. AI AGENTS CONFIGURATION ⚠️ MODERATE (Split Stores)                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         Agents Store (Zustand + Dexie)                    │          │
│  │  LOCATION: src/stores/agents-store.ts ⚠️ DUPLICATES       │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ agents: Agent[]                              │          │          │
│  │  │ activeAgentId: string                        │          │          │
│  │  │ _hasHydrated: boolean                        │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  │                                                          │          │
│  │  Agent Entity Schema:                                   │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ id, name, description                         │          │          │
│  │  │ providerId → ProviderConfig (FK)             │          │          │
│  │  │ modelId → ModelInfo (FK)                     │          │          │
│  │  │ systemPrompt, temperature, maxTokens         │          │          │
│  │  │ tools: AgentToolBinding[]                    │          │          │
│  │  │ workspaceBindings: WorkspaceBinding[]        │          │          │
│  │  │ status, metrics, timestamps                  │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └───────────────┬──────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         Provider Validation (Foreign Keys)                │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ addAgent() → validates modelId exists in     │          │          │
│  │  │            providerStore.availableModels     │          │          │
│  │  │                                              │          │          │
│  │  │ removeProvider() → checks dependent agents   │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         Workspace Bindings System                         │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ getAgentsForWorkspace(workspaceType)         │          │          │
│  │  │   → Filters agents by workspaceBindings      │          │          │
│  │  │                                              │          │          │
│  │  │ isAgentAvailableInWorkspace(agentId, ws)     │          │          │
│  │  │   → Checks binding.isAvailable              │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  ⚠️ ARCHITECTURAL ISSUES:                                               │
│  ❌ 70+ store files scattered across codebase                            │
│  ❌ Duplicate agent stores in multiple locations                        │
│  ❌ Unclear canonical store location                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  3. TOOLS USE PERMISSIONS ❌ CRITICAL VIOLATIONS                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Tool Permission Manager (Singleton + In-Memory)      │          │
│  │  LOCATION: src/lib/agent/tool-permission-manager.ts       │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ trustLevels: Map<string, ToolTrustLevel>     │ ❌ NO    │          │
│  │  │   = Map (in-memory, lost on reload)          │ PERSIST  │          │
│  │  │                                              │          │          │
│  │  │ sessionTrust: Set<string>                   │ ❌ NO    │          │
│  │  │   = Set (cleared on reload)                  │ WORKSPACE│          │
│  │  │                                              │  SCOPING │          │
│  │  │ defaultTrustLevels: Record<string, Level>    │          │          │
│  │  │   = {                                        │          │          │
│  │  │       read_file: 'auto',                     │          │          │
│  │  │       write_file: 'prompt',                  │          │          │
│  │  │       execute_command: 'prompt',             │          │          │
│  │  │     }                                        │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └───────────────┬──────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         Agent Tool Bindings (Persisted)                   │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ tools: AgentToolBinding[]                    │ ✅ PART  │          │
│  │  │   - toolId, toolName                          │   OF AGENT│          │
│  │  │   - isEnabled: boolean                        │  ENTITY  │          │
│  │  │   - workspacePermissions: {                  │          │          │
│  │  │       ide: boolean,                           │          │          │
│  │  │       knowledge: boolean,                     │          │          │
│  │  │       study: boolean,                         │          │          │
│  │  │       notes: boolean                          │          │          │
│  │  │     }                                         │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └───────────────┬──────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         Workspace Tool Filter                             │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ filterToolsForWorkspace(agent, workspace)    │ ✅ LOGIC │          │
│  │  │   → Checks agent.workspaceBindings           │  EXISTS  │          │
│  │  │   → Checks tool.workspacePermissions         │          │          │
│  │  │   → Returns { available, blocked, ... }      │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └───────────────┬──────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         Tool Definitions (SCATTERED) ❌ NO REGISTRY       │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ src/lib/agent/tools/                         │          │          │
│  │  │   ├─ read-file-tool.ts                       │          │          │
│  │  │   ├─ write-file-tool.ts                      │          │          │
│  │  │   ├─ list-files-tool.ts                      │          │          │
│  │  │   ├─ execute-command-tool.ts                 │          │          │
│  │  │   ├─ search-notes-tool.ts                    │          │          │
│  │  │   ├─ synthesize-tool.ts                      │          │          │
│  │  │   ├─ process-pdf-tool.ts                     │          │          │
│  │  │   └─ process-url-tool.ts                     │          │          │
│  │  │                                              │          │          │
│  │  │ ❌ No centralized registry                   │          │          │
│  │  │ ❌ No single source of truth                 │          │          │
│  │  │ ❌ UI hardcodes tool list                    │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  ❌ CRITICAL ARCHITECTURAL GAPS:                                        │
│  ❌ Trust levels not persisted (lost on reload)                        │
│  ❌ No workspace-scoped trust levels                                    │
│  ❌ No centralized tool registry                                        │
│  ❌ No permission enforcement at execution layer                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Cross-Workspace Event Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│              CROSS-WORKSPACE EVENT BUS (EventEmitter3)                  │
│  LOCATION: src/lib/events/cross-workspace-event-bus.ts                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │             crossWorkspaceEventBus (Singleton)            │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ emitAgentConfigChange(event)                │          │          │
│  │  │ emitProviderConfigChange(event)             │          │          │
│  │  │ emitModelsUpdated(event)                    │          │          │
│  │  │ emitFileChange(event)                       │          │          │
│  │  │ emitWorkspaceChanged(event)                 │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
         │                           │                           │
         │                           │                           │
         ▼                           ▼                           ▼

┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│   IDE WORKSPACE     │   │ KNOWLEDGE WORKSPACE│   │  STUDY WORKSPACE   │
│                     │   │                    │   │                    │
│ ┌─────────────────┐ │   │ ┌─────────────────┐│   │ ┌─────────────────┐│
│ │Provider Config  │ │   │ │Provider Config  ││   │ │Provider Config  ││
│ │↓                │ │   │ │↓                ││   │ │↓                ││
│ │Agent Config     │ │   │ │Agent Config     ││   │ │Agent Config     ││
│ │↓                │ │   │ │↓                ││   │ │↓                ││
│ │Tool Permissions │ │   │ │Tool Permissions ││   │ │Tool Permissions ││
│ └─────────────────┘ │   │ └─────────────────┘│   │ └─────────────────┘│
│        ↑            │   │        ↑           │   │        ↑           │
│        │            │   │        │           │   │        │           │
│    Listens to      │   │    Listens to      │   │    Listens to      │
│   events           │   │   events           │   │   events           │
└────────────────────┘   └────────────────────┘   └────────────────────┘

EVENT FLOW EXAMPLES:

1. PROVIDER CONFIG UPDATE (IDE → ALL WORKSPACES)
   ┌─────────────────────────────────────────────────────────────┐
   │ IDE: User saves API key for Anthropic                        │
   │   ↓                                                          │
   │ providerStore.fetchModels('anthropic')                      │
   │   ↓                                                          │
   │ crossWorkspaceEventBus.emitModelsUpdated({                  │
   │   workspaceId: 'ide',                                       │
   │   providerId: 'anthropic',                                  │
   │   models: [...]                                             │
   │ })                                                          │
   │   ↓                                                          │
   │ Knowledge Workspace: Refreshes model selector              │
   │ Study Workspace: Refreshes model selector                   │
   │ Notes Workspace: Refreshes model selector                   │
   └─────────────────────────────────────────────────────────────┘

2. AGENT CONFIG UPDATE (IDE → ALL WORKSPACES)
   ┌─────────────────────────────────────────────────────────────┐
   │ IDE: User updates agent "Via-Gent Coder"                     │
   │   ↓                                                          │
   │ agentsStore.updateAgent(id, { temperature: 0.8 })           │
   │   ↓                                                          │
   │ crossWorkspaceEventBus.emitAgentConfigChange({              │
   │   workspaceId: 'ide',                                       │
   │   agentId: 'agt_xxx',                                       │
   │   changeType: 'updated'                                     │
   │ })                                                          │
   │   ↓                                                          │
   │ Knowledge Workspace: Reloads agent list                     │
   │ Study Workspace: Reloads agent list                         │
   │ Notes Workspace: Reloads agent list                         │
   └─────────────────────────────────────────────────────────────┘

3. WORKSPACE SWITCH (IDE → KNOWLEDGE)
   ┌─────────────────────────────────────────────────────────────┐
   │ User switches from IDE to Knowledge workspace                │
   │   ↓                                                          │
   │ crossWorkspaceEventBus.emitWorkspaceChanged({               │
   │   from: 'ide',                                               │
   │   to: 'knowledge',                                           │
   │   timestamp: '...'                                          │
   │ })                                                          │
   │   ↓                                                          │
   │ agentsStore: Filters agents for knowledge workspace         │
   │ providerStore: Refreshes models for knowledge workspace     │
   │ toolPermissionManager: Applies knowledge workspace settings │
   └─────────────────────────────────────────────────────────────┘
```

## 3. Data Flow Diagrams

### 3.1 Credential Storage Flow

```
USER INPUT: "sk-ant-api03-..." (Anthropic API Key)
    │
    ├─► AgentConfigDialog (ApiKeyInputSection)
    │   │
    │   └─► Connection Test (Optional)
    │       │
    │       └─► providerAdapterFactory.createAdapter('anthropic')
    │           │
    │           └─► modelRegistry.getModels('anthropic', apiKey)
    │               │
    │               └─► Validate API key works
    │                   │
    │                   └─► Show success/error toast
    │
    └─► credentialVault.storeCredentials('anthropic', apiKey)
        │
        ├─► Initialize Vault (if not already)
        │   │
        │   ├─► Validate localStorage keys (vg_ek_v3, vg_salt_v3, etc.)
        │   │   │
        │   │   └─► If missing: createNewVault()
        │   │       │
        │   │       ├─► Generate vault password
        │   │       ├─► Generate salt
        │   │       ├─► Derive encryption key (PBKDF2-SHA256, 100k iterations)
        │   │       ├─► Generate master key
        │   │       ├─► Encrypt master key (AES-256-GCM)
        │   │       └─► Store in localStorage
        │   │
        │   └─► If exists: loadExistingVault()
        │       │
        │       ├─► Get encrypted key from localStorage
        │       ├─► Derive encryption key from password
        │       └─► Decrypt master key
        │
        ├─► Encrypt API Key
        │   │
        │   └─► credentialEncryption.encryptApiKey(apiKey, masterKey)
        │       │
        │       ├─► Generate IV (12 bytes)
        │       ├─► AES-256-GCM encrypt
        │       └─► Return { encrypted, iv }
        │
        └─► Store in IndexedDB
            │
            └─► credentialStorage.storeCredentials('anthropic', encrypted, iv)
                │
                └─► Dexie IndexedDB: credentials table
                    │
                    └─► { providerId: 'anthropic', encrypted: '...', iv: '...', createdAt: '...' }

ENCRYPTED AT REST: API key stored encrypted in IndexedDB
ENCRYPTION: AES-256-GCM (authenticated encryption)
KEY DERIVATION: PBKDF2-SHA256 (100,000 iterations)
```

### 3.2 Agent Configuration Flow

```
USER ACTION: Create new agent "Code Reviewer"
    │
    ├─► AgentConfigDialog (Basic Config Tab)
    │   │
    │   ├─► Name: "Code Reviewer"
    │   ├─► Description: "Reviews code for best practices"
    │   ├─► Provider: "anthropic"
    │   ├─► Model: "claude-3-5-sonnet-20241022"
    │   ├─► Temperature: 0.3
    │   ├─► Max Tokens: 8192
    │   └─► System Prompt: "You are a code reviewer..."
    │
    ├─► ApiKeyInputSection
    │   │
    │   └─► Check if provider has credentials
    │       │
    │       ├─► credentialVault.hasCredentials('anthropic')
    │       │   │
    │       │   ├─► If YES: Show "Connected" badge
    │       │   └─► If NO: Show API key input field
    │       │
    │       └─► If user enters key: credentialVault.storeCredentials('anthropic', apiKey)
    │
    ├─► WorkspaceToolPermissionsConfig (Workspace Tab)
    │   │
    │   ├─► IDE Workspace:
    │   │   ├─► Agent available: YES
    │   │   ├─► read_file: YES
    │   │   ├─► write_file: YES
    │   │   ├─► execute_command: NO
    │   │   └─► synthesize: NO
    │   │
    │   ├─► Knowledge Workspace:
    │   │   ├─► Agent available: YES
    │   │   ├─► read_file: YES
    │   │   ├─► synthesize: YES
    │   │   └─► execute_command: NO
    │   │
    │   └─► Study/Notes: Similar configuration
    │
    └─► ToolTrustLevelManager (Advanced Tab)
        │
        ├─► read_file: Auto (no approval needed)
        ├─► write_file: Prompt (require approval)
        ├─► execute_command: Prompt (require approval)
        └─► synthesize: Auto (no approval needed)

USER CLICKS "CREATE" BUTTON
    │
    └─► agentsStore.addAgent(agentData)
        │
        ├─► VALIDATION: Model exists for provider
        │   │
        │   ├─► providerStore.availableModels['anthropic']
        │   │   │
        │   │   └─► Check if 'claude-3-5-sonnet-20241022' exists
        │   │       │
        │   │       ├─► If NO: throw error
        │   │       └─► If YES: continue
        │   │
        ├─► CREATE AGENT ENTITY
        │   │
        │   ├─► id: 'agt_1234567890_abc123' (auto-generated)
        │   ├─► createdAt: new Date().toISOString()
        │   ├─► status: 'offline'
        │   ├─► metrics: all zeros
        │   └─► Include all user-provided data
        │   │
        ├─► PERSIST TO INDEXEDDB
        │   │
        │   └─► Zustand persist middleware → Dexie storage
        │       │
        │       └─► agentConfigs table in via-gent-persistence DB
        │           │
        │           └─► Agent configuration persisted
        │
        └─► EMIT CROSS-WORKSPACE EVENT
            │
            └─► crossWorkspaceEventBus.emitAgentConfigChange({
                workspaceId: 'ide',
                agentId: 'agt_1234567890_abc123',
                changeType: 'created'
                })
                │
                ├─► Knowledge workspace: Updates agent list
                ├─► Study workspace: Updates agent list
                └─► Notes workspace: Updates agent list

RESULT: Agent created and available across all workspaces (based on workspaceBindings)
```

### 3.3 Tool Permission Check Flow

```
AGENT REQUEST: Execute "write_file" tool in Knowledge workspace
    │
    └─► filterToolsForWorkspace(agent, knowledgeContext, permissionManager)
        │
        ├─► CHECK 1: Agent available in workspace?
        │   │
        │   ├─► agent.workspaceBindings.find(b => b.workspaceType === 'knowledge')
        │   │   │
        │   │   ├─► If NOT found or !isAvailable: BLOCK ALL TOOLS
        │   │   └─► If found and isAvailable: Continue
        │   │
        ├─► CHECK 2: Tool enabled for workspace?
        │   │
        │   ├─► agent.tools.find(t => t.toolId === 'write_file')
        │   │   │
        │   │   ├─► tool.workspacePermissions.knowledge
        │   │   │
        │   │   ├─► If FALSE: BLOCK tool
        │   │   └─► If TRUE: Continue
        │   │
        ├─► CHECK 3: Trust level check
        │   │
        │   ├─► toolPermissionManager.checkPermission('write_file')
        │   │   │
        │   │   ├─► Get trust level: 'prompt' (require approval)
        │   │   │
        │   │   ├─► If 'block': BLOCK tool
        │   │   ├─► If 'auto': Execute immediately
        │   │   └─► If 'prompt': Show approval dialog
        │   │
        └─► CHECK 4: Workspace ready?
            │
            ├─► workspaceContext.workspaceReady
            │   │
            ├─► If FALSE: Return "WORKSPACE_NOT_READY" error
            └─► If TRUE: Execute tool

APPROVAL DIALOG (if trust level = 'prompt')
    │
    ├─► Show: "Agent wants to write file src/example.ts. Approve?"
    │   │
    ├─► User clicks "Approve"
    │   │
    │   └─► toolPermissionManager.addSessionTrust('write_file')
    │       │
    │       └─► Add to sessionTrust set (temporary)
    │
    └─► Execute tool

TOOL EXECUTION
    │
    └─► Execute write_file tool
        │
        ├─► Write file to file system
        ├─► Return result to agent
        └─► Agent continues conversation

⚠️ CRITICAL GAP: Trust level check not enforced at execution layer in current implementation
   (This is the recommended flow, but enforcement is incomplete)
```

## 4. Architectural Improvements Needed

### 4.1 Tool Permission Store (PROPOSED)

```
┌─────────────────────────────────────────────────────────────────────────┐
│     PROPOSED: Tool Permission Store (Zustand + Dexie)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │    useToolPermissionStore (NEW)                           │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ trustLevels: Record<string, WorkspaceToolTrustLevel>  │          │
│  │  │   {                                                          │          │
│  │  │     'write_file': {                                         │          │
│  │  │       ide: 'auto',                                          │          │
│  │  │       knowledge: 'block',                                   │          │
│  │  │       study: 'block',                                       │          │
│  │  │       notes: 'prompt'                                       │          │
│  │  │     },                                                      │          │
│  │  │     'execute_command': {                                    │          │
│  │  │       ide: 'prompt',                                        │          │
│  │  │       knowledge: 'block',                                   │          │
│  │  │       study: 'block',                                       │          │
│  │  │       notes: 'block'                                        │          │
│  │  │     }                                                       │          │
│  │  │   }                                                         │          │
│  │  │                                                             │          │
│  │  │ sessionTrust: Set<string> (in-memory, cleared on reload)    │          │
│  │  │                                                             │          │
│  │  │ getTrustLevel(toolId, workspaceType): ToolTrustLevel        │          │
│  │  │ setTrustLevel(toolId, workspaceType, level): void           │          │
│  │  │ addSessionTrust(toolId): void                               │          │
│  │  │ removeSessionTrust(toolId): void                            │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  │                                                          │          │
│  │  STORAGE: createDexieStorage('toolPermissions')            │          │
│  └──────────────────────────────────────────────────────────┘          │
│                  │                                                      │
│                  ↓                                                      │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │         PERSISTENCE LAYER (IndexedDB)                      │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ toolPermissions table                         │          │          │
│  │  │   - trustLevels (JSON)                        │          │
│  │  │   - lastUpdated (timestamp)                   │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  ✅ BENEFITS:                                                           │
│  - Trust levels survive page reloads                                    │
│  - Workspace-scoped permissions                                         │
│  - Single source of truth                                               │
│  - Reactive updates across all workspaces                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Centralized Tool Registry (PROPOSED)

```
┌─────────────────────────────────────────────────────────────────────────┐
│       PROPOSED: Centralized Tool Registry                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │       toolRegistry (Singleton)                            │          │
│  │  LOCATION: src/lib/agent/registry/tool-registry.ts        │          │
│  │  ┌─────────────────────────────────────────────┐          │          │
│  │  │ getAllTools(): ToolDefinition[]             │          │          │
│  │  │ getToolById(toolId): ToolDefinition          │          │          │
│  │  │ getToolsByCategory(category): ToolDefinition[]│         │          │
│  │  │ registerTool(tool: ToolDefinition): void     │          │          │
│  │  └─────────────────────────────────────────────┘          │          │
│  │                                                          │          │
│  │  TOOL_DEFINITIONS: Record<string, ToolDefinition>         │          │
│  │  {                                                        │          │
│  │    'read_file': {                                        │          │
│  │      id: 'read_file',                                    │          │
│  │      name: 'Read File',                                  │          │
│  │      category: 'filesystem',                              │          │
│  │      defaultPermissions: {                               │          │
│  │        ide: true, knowledge: true, study: true, notes: true│        │
│  │      },                                                   │          │
│  │      defaultTrustLevel: 'auto',                           │          │
│  │      dangerous: false                                     │          │
│  │    },                                                     │          │
│  │    'write_file': {                                       │          │
│  │      id: 'write_file',                                   │          │
│  │      name: 'Write File',                                  │          │
│  │      category: 'filesystem',                              │          │
│  │      defaultPermissions: {                               │          │
│  │        ide: true, knowledge: false, study: false, notes: true│       │
│  │      },                                                   │          │
│  │      defaultTrustLevel: 'prompt',                         │          │
│  │      dangerous: true                                      │          │
│  │    },                                                     │          │
│  │    'execute_command': {                                  │          │
│  │      id: 'execute_command',                              │          │
│  │      name: 'Execute Command',                             │          │
│  │      category: 'terminal',                               │          │
│  │      defaultPermissions: {                               │          │
│  │        ide: true, knowledge: false, study: false, notes: false│      │
│  │      },                                                   │          │
│  │      defaultTrustLevel: 'prompt',                         │          │
│  │      dangerous: true                                      │          │
│  │    }                                                      │          │
│  │  }                                                        │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  ✅ BENEFITS:                                                           │
│  - Single source of truth for all tools                                 │
│  - Consistent default permissions                                        │
│  - UI can dynamically generate tool list                                 │
│  - Easy to add new tools                                                 │
│  - Type-safe tool definitions                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Diagrams Completed:** 2026-01-01
**Iteration:** Ralph Loop Cycle 12, Iteration 10
**Status:** Ready for architectural review
