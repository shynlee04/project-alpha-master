# Agent/LLM Configuration Feature Diagnostic Report

**Generated**: 2026-01-09
**Module**: Agent/LLM Configuration System
**Scope**: Entry points, components, state management, database, credentials, tool permissions

---

## 1. Entry Points

| Route | File | Purpose | Entry Method |
|-------|------|---------|--------------|
| `/agents` | `src/routes/agents.tsx` | Agent management center - lists agents, allows creation/editing | TanStack Router `createFileRoute` |
| `/settings` | `src/routes/settings.tsx` | Settings page with Agent Configuration section, Provider Settings, Vault Status | TanStack Router `createFileRoute` |
| `AgentConfigDialog` | `src/presentation/components/agent/AgentConfigDialog.tsx` | Modal dialog for agent create/edit - main entry for agent configuration | Component imported in settings.tsx |
| `ProviderConfigDialog` | `src/presentation/components/agent/ProviderConfigDialog.tsx` | Modal dialog for LLM provider configuration (API keys, base URLs) | Component imported in ProviderSettings.tsx |

**Access Paths**:
1. **Direct Agent Access**: Navigate to `/agents` → Click "Add Agent" or edit existing agent
2. **Settings Access**: Navigate to `/settings` → Click "Configure Agent" button → Opens AgentConfigDialog
3. **Provider Access**: Navigate to `/settings` → Provider Settings section → Click provider to configure

---

## 2. Component Tree

```
MainLayout
├── routes/agents.tsx (AgentsPage)
│   └── AgentsPanel
│       └── AgentConfigDialog (conditional)
│
├── routes/settings.tsx (SettingsPage)
│   ├── ProviderSettings
│   │   └── ProviderConfigDialog (conditional)
│   ├── VaultStatusCard
│   └── AgentConfigDialog (conditional)
│
└── AgentConfigDialog (main orchestrator - 293 lines)
    ├── AgentConfigDialogHeader (delete, import/export, header)
    ├── Tabs (3 tabs: basic, workspace, advanced)
    │   ├── BasicTabContent
    │   │   ├── AgentBasicInfoTab
    │   │   ├── AgentProviderSelector
    │   │   ├── AgentModelSelector
    │   │   └── ConnectionTestButton
    │   │
    │   ├── WorkspaceTabContent
    │   │   ├── WorkspacePermissionEditor
    │   │   ├── WorkspaceToolPermissionsConfig
    │   │   └── ToolAvailabilityIndicator
    │   │
    │   └── AdvancedTabContent
    │       ├── OpenAICompatibleSettings
    │       ├── CustomHeadersEditor
    │       ├── BaseUrlInput
    │       └── NativeToolsToggle
    │
    ├── AgentConfigDialogFooter (submit, cancel buttons)
    └── UnsavedChangesDialog (warning on exit)

ProviderConfigDialog (main provider configuration - 433 lines)
    ├── Provider name input (custom providers only)
    ├── Base URL input (readonly for built-in, editable for custom)
    ├── Default Model input (custom providers only)
    ├── API Key input (password masked)
    ├── Test Connection button
    ├── ProviderStatusBadge
    └── ModelLoadingSpinner (validation feedback)
```

---

## 3. State Management

### 3.1 Primary Store: `useAppStore` (Single Bounded Store)

**File**: `src/infrastructure/persistence/stores/use-app-store.ts`

| Slice | Purpose | State | Actions |
|-------|---------|-------|---------|
| **Agent CRUD Slice** | Agent lifecycle operations | `agents: AgentData[]` | `addAgent()`, `updateAgent()`, `removeAgent()`, `setActiveAgent()` |
| **Agent Workspace Bindings Slice** | Workspace availability | `workspaceBindings: WorkspaceBinding[]` | `updateWorkspaceBinding()`, `getAgentsForWorkspace()` |
| **Agent Validation Slice** | Provider/model validation | `validationErrors: Record<string, string>` | `addAgentValidated()`, `updateAgentValidated()` |
| **Agent Events Slice** | Cross-workspace event emission | (references other slices) | `addAgentWithEvent()`, `updateAgentWithEvent()` |
| **Agent Utils Slice** | Selectors and hydration | (utilities) | `getAgent()`, `getAgentsCount()`, `isAgentAvailableInWorkspace()` |
| **Provider CRUD Slice** | Provider lifecycle | `providers: ProviderConfig[]`, `activeProviderId: string | null` | `addProvider()`, `updateProvider()`, `removeProvider()` |
| **Provider Models Slice** | Model fetching/caching | `availableModels: Record<string, ModelInfo[]>`, `isLoadingModels: Record<string, boolean>` | `fetchModels()`, `loadModelsForProvider()` |
| **Provider Utils Slice** | Model settings | `modelSettings: Record<string, ModelSettings>` | `updateModelSettings()`, `getAvailableModels()` |

### 3.2 Secondary Store: `useToolPermissionStore`

**File**: `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`

| Property | Type | Purpose |
|----------|------|---------|
| `trustLevels` | `Record<string, Record<WorkspaceType, ToolTrustLevel>>` | Per-tool, per-workspace trust levels |
| `defaultTrustLevel` | `ToolTrustLevel` | Default trust level for new tools ('prompt') |
| `sessionTrust` | `string[]` | Tools approved for current session (cleared on reload) |
| `yoloMode` | `YOLOMode` | YOLO mode state with expiry time |
| `categoryApprovals` | `Record<WorkspaceType, CategoryApprovalState>` | Category-level approvals per workspace |
| `version` | `number` | Schema version (3) |

### 3.3 Store Integration

```typescript
// Main store exported as useAppStore
export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAgentCrudSlice(...a),
      ...createAgentWorkspaceBindingsSlice(...a),
      ...createAgentValidationSlice(...a),
      ...createAgentEventsSlice(...a),
      ...createAgentUtilsSlice(...a),
      ...createProviderCrudSlice(...a),
      ...createProviderModelsSlice(...a),
      ...createProviderUtilsSlice(...a),
    }),
    {
      name: 'app-state',
      storage: createJSONStorage(() => createDexieStorage('providerConfigs')),
      partialize: (state) => ({
        version: state.version,
        agents: state.agents,
        providers: state.providers,
        activeProviderId: state.activeProviderId,
        modelSettings: state.modelSettings,
      }),
    }
  )
);
```

---

## 4. Credential Operations

### 4.1 Credential Vault Architecture

**File**: `src/lib/agent/providers/credential-vault.ts`

**Component Layers**:
```
CredentialVault (Facade - 535 lines)
├── CredentialStorage (IndexedDB operations - 239 lines)
│   └── Uses: getDb() → db.credentials.put/get/delete
│
└── CredentialEncryption (AES-256-GCM - 367 lines)
    ├── deriveKeyFromPassword() - PBKDF2-SHA256
    ├── encryptApiKey() - AES-256-GCM
    └── decryptApiKey() - AES-256-GCM
```

### 4.2 Encryption Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| Algorithm | AES-GCM | Authenticated encryption |
| Key Length | 256 bits | AES-256 |
| IV Length | 12 bytes | Standard for GCM |
| Salt Length | 16 bytes | For PBKDF2 |
| PBKDF2 Iterations | 100,000 | OWASP recommended |
| Key Wrapping | AES-KW | For master key persistence |

### 4.3 Credential Storage Flow

```
API Key Input (ProviderConfigDialog)
    ↓
credentialVault.storeCredentials(providerId, apiKey)
    ↓
credentialEncryption.encryptApiKey(apiKey, masterKey)
    ↓
credentialStorage.storeCredentials(providerId, encrypted, iv)
    ↓
IndexedDB (credentials table)
```

### 4.4 Credential Retrieval Flow

```
Agent Execution (useAgentChatWithTools)
    ↓
credentialVault.getCredentials(providerId)
    ↓
credentialEncryption.decryptApiKey(encryptedData, masterKey)
    ↓
Plaintext API key for LLM provider
```

### 4.5 LocalStorage Keys (Vault Security)

| Key | Purpose | Security |
|-----|---------|----------|
| `vg_ek_v3` | Encrypted master key | Wrapped with AES-KW |
| `vg_salt_v3` | PBKDF2 salt | Used for key derivation |
| `vg_kv_v3` | Vault version (3) | Migration tracking |
| `vg_vp_v3` | Vault password | Derived from random generation |

**SSR Safety**: All credential operations check `typeof window !== 'undefined'` before accessing browser APIs.

---

## 5. Database Operations

### 5.1 Dexie Database Tables

**File**: `src/infrastructure/persistence/dexie-db.ts`

| Table | Type | Purpose | Agent-Related Fields |
|-------|------|---------|---------------------|
| `credentials` | `CredentialsTable` | Encrypted API keys | `providerId`, `encrypted`, `iv`, `workspaceId` |
| `providerConfigs` | `PersistedStateTable` | Provider configuration | `key: providerId`, `value: ProviderConfig` |
| `agentConfigs` | `PersistedStateTable` | Agent configuration | `key: agentId`, `value: AgentData` |
| `toolExecutionLogs` | `ToolExecutionLogTable` | Tool execution history | `conversationId`, `toolName`, `approved` |

### 5.2 Credential Record Schema

```typescript
interface CredentialRecord {
  providerId: string;      // Provider identifier (primary key)
  workspaceId: string;     // 'ide' | 'knowledge' | 'study' | 'notes'
  encrypted: string;       // Base64-encoded encrypted API key
  iv: string;              // Base64-encoded initialization vector
  createdAt: Date;         // Storage timestamp
}
```

### 5.3 Provider Config Schema

```typescript
interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseURL: string;
  defaultModel?: string;
  hasApiKey: boolean;      // FLAG only - actual key in credential vault
  keyId?: string;
  keyStoredAt?: number;
  lastKeyValidatedAt?: number;
  keyExpiresAt?: number;
  models: ModelInfo[];
  lastModelFetchAt?: number;
  enabled: boolean;
  isActive?: boolean;
  isCustom?: boolean;
  headers?: Record<string, string>;
  supportsNativeTools?: boolean;
}
```

### 5.4 Agent Config Schema

```typescript
interface AgentData {
  id: string;
  name: string;
  description?: string;
  providerId: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  systemPrompt?: string;
  customBaseURL?: string;
  customModelId?: string;
  customHeaders?: Record<string, string>;
  enableNativeTools: boolean;
  workspaceBindings: WorkspaceBinding[];
  tools: AgentToolBinding[];
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}

interface AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: Record<string, boolean>;
  configuration?: Record<string, unknown>;
}
```

### 5.5 Tool Permission Persistence

**Storage**: `tool-permission-store` → Dexie table `agentConfigs`

```typescript
interface ToolPermissionState {
  trustLevels: Record<string, Record<WorkspaceType, ToolTrustLevel>>;
  defaultTrustLevel: ToolTrustLevel;
  sessionTrust: string[];
  yoloMode: YOLOMode;
  categoryApprovals: Record<WorkspaceType, CategoryApprovalState>;
  version: number;
}
```

---

## 6. Internal Issues Found

### 6.1 Critical Issues

| Issue | Location | Severity | Description |
|-------|----------|----------|-------------|
| **API Key Missing Message** | `AgentConfigDialog.tsx:116-131` | CRITICAL | Validation hook checks `apiKey: ''` (empty string) even though API keys are managed separately by ProviderConfigDialog. The form validation expects an apiKey field but this is handled by the credential vault, not the agent form. |
| **Duplicate Store Subscription** | `AgentConfigDialog.tsx:80-106` | HIGH | Previous version had duplicate subscriptions to `useProviderStore` causing infinite re-render loops. Fixed in Ralph Loop Cycle 17 by using extracted `useAgentFormState` hook. |
| **Credential Vault SSR** | `credential-vault.ts:167-170` | MEDIUM | During SSR, vault initialization is skipped. If client-side hydration doesn't properly reinitialize, credentials may not be available immediately. |

### 6.2 Architecture Issues

| Issue | Location | Severity | Description |
|-------|----------|----------|-------------|
| **God Store Legacy** | Previously `agents-store.ts` (430 lines) | HIGH | Original god store had circular dependency with `provider-store.ts`. Fixed by consolidating into single bounded `useAppStore`. |
| **Circular Dependency Risk** | Provider CRUD slice references | MEDIUM | Cross-slice communication uses `get()` to avoid imports. Removing slice exports could reintroduce circular dependencies. |
| **Provider Deletion Orphaning** | Provider CRUD slice | LOW | Deleting a provider doesn't automatically reassign agents using that provider. Agents remain with orphaned `providerId`. |

### 6.3 Validation Issues

| Issue | Location | Description |
|-------|----------|-------------|
| **"API Key Missing" False Positive** | `useAgentFormValidation` | The validation hook checks `apiKey` field but agent configs don't store API keys - providers do. This causes validation errors when apiKey is empty string. |
| **Model Not Required** | `AgentConfigDialog` | Model selection is optional in form validation but agent execution fails without a valid model. |
| **Missing Provider Check** | Agent creation | No validation that selected provider has a configured API key before creating agent. |

### 6.4 Cross-Workspace Sync Issues

| Issue | Location | Description |
|-------|----------|-------------|
| **Event Emission Timing** | `agent-events-slice.ts:52-72` | Events emitted after CRUD operation completes. Listeners may receive stale state if they react immediately. |
| **Workspace Detection** | `agent-events-slice.ts:57` | Uses `useWorkspaceStore.getState().currentWorkspace` - may not reflect actual workspace context in all scenarios. |

---

## 7. Dependencies on Other Features

### 7.1 Direct Dependencies

| Feature | Dependency Type | Usage |
|---------|-----------------|-------|
| **Workspace Store** | Import | `useWorkspaceStore.getState().currentWorkspace` for event emission |
| **Cross-Workspace Event Bus** | Import | `crossWorkspaceEventBus.emitAgentConfigChange()` for sync |
| **Domain Event Bus** | Import | `eventBus.emit(DomainEventType.AGENT_*)` for component listeners |
| **Dexie Database** | Import | `getDb()` for credential and config persistence |
| **Credential Vault** | Import | `credentialVault.storeCredentials()`, `credentialVault.getCredentials()` |
| **Tool Permission Manager** | Import | `ToolPermissionManager.getInstance()` for permission checking |

### 7.2 Indirect Dependencies

| Feature | Dependency Chain |
|---------|------------------|
| **WebContainer** | Agent tools (file operations, terminal) require WebContainer for IDE workspace |
| **File System Access API** | Agent file tools use FSA for local file operations |
| **RAG Pipeline** | Knowledge tools (search-notes, synthesize) integrate with RAG store |
| **Model Registry** | Provider adapters fetch available models from model registry |
| **TanStack AI** | Chat streaming and LLM communication |

### 7.3 Provider Adapter Dependencies

| Provider | Adapter File | External Dependency |
|----------|--------------|---------------------|
| Anthropic | `anthropic-adapter.ts` | `https://api.anthropic.com/v1` |
| OpenAI | `provider-adapter.ts` (generic) | `https://api.openai.com/v1` |
| OpenRouter | `provider-adapter.ts` (generic) | `https://openrouter.ai/api/v1` |
| Gemini | `provider-adapter.ts` (generic) | Native SDK |

---

## 8. User Flows

### 8.1 Create Agent Flow

```
1. User navigates to /settings or /agents
2. User clicks "Configure Agent" or "Add Agent"
3. AgentConfigDialog opens
4. User fills form:
   - Basic: Name, description, provider, model
   - Workspace: Enable agent in workspaces, configure tools per workspace
   - Advanced: Custom base URL, headers, native tools toggle
5. User clicks "Save"
6. Form validation runs (useAgentFormValidation)
7. Agent saved via useAppStore.addAgent()
8. Cross-workspace event emitted (agent-events-slice)
9. Success callback triggers
```

### 8.2 Configure Provider API Key Flow

```
1. User navigates to /settings → Provider Settings
2. User clicks on a provider (e.g., OpenRouter)
3. ProviderConfigDialog opens
4. User enters API key (password field)
5. User clicks "Test Connection" (optional)
6. User clicks "Save Key"
7. credentialVault.storeCredentials(providerId, apiKey) encrypts and stores
8. Provider hasApiKey flag updated
9. fetchModels(providerId) loads available models
10. Dialog closes on success
```

### 8.3 Tool Permission Configuration Flow

```
1. User opens AgentConfigDialog → Workspace tab
2. User configures tool permissions per workspace
3. User saves agent
4. useToolPermissionStore updates trust levels
5. Trust levels persisted to IndexedDB via Dexie
6. Tool execution checks permissions via ToolPermissionManager
```

### 8.4 Agent Execution Flow

```
1. User selects agent in workspace
2. User sends message
3. useAgentChatWithTools hook invoked
4. Agent factory creates adapter for provider
5. credentialVault.getCredentials(providerId) retrieves API key
6. Provider adapter calls LLM API with model selection
7. Tool calls are intercepted by tool-permission-manager
8. If tool needs approval, UI shows approval overlay
9. Tool executes if approved
10. Results returned to agent
```

---

## 9. Credential Operations Summary

| Operation | Method | Storage Location | Encryption |
|-----------|--------|------------------|------------|
| Store API Key | `credentialVault.storeCredentials(providerId, apiKey)` | `credentials` table (IndexedDB) | AES-256-GCM |
| Retrieve API Key | `credentialVault.getCredentials(providerId)` | `credentials` table (IndexedDB) | AES-256-GCM (decrypted) |
| Check Key Exists | `credentialVault.hasCredentials(providerId)` | `credentials` table (IndexedDB) | None |
| Delete Key | `credentialVault.deleteCredentials(providerId)` | `credentials` table (IndexedDB) | N/A |
| Clear All | `credentialVault.clear()` | `credentials` table + localStorage | N/A |
| Get Stored Providers | `credentialVault.getStoredProviders()` | `credentials` table (IndexedDB) | None |

---

## 10. Database Operations Summary

| Operation | Table | Method | Notes |
|-----------|-------|--------|-------|
| Save Agent | `agentConfigs` | `db.agentConfigs.put()` | Via Zustand persist middleware |
| Load Agents | `agentConfigs` | Hydrated on store init | Via Zustand persist middleware |
| Save Provider | `providerConfigs` | `db.providerConfigs.put()` | Via Zustand persist middleware |
| Store Credential | `credentials` | `db.credentials.put()` | Encrypted data |
| Retrieve Credential | `credentials` | `db.credentials.get()` | Decrypted in vault |
| Save Tool Permissions | `agentConfigs` | `db.agentConfigs.put()` | Separate persist store |
| Log Tool Execution | `toolExecutionLogs` | `db.toolExecutionLogs.put()` | For session trust |

---

## 11. Cross-Workspace Event System

### 11.1 Event Types

| Event | Emitter | Payload | Purpose |
|-------|---------|---------|---------|
| `AGENT_CREATED` | `agent-events-slice` | `{ agentId, agentName, workspaceType }` | Notify other workspaces |
| `AGENT_DELETED` | `agent-events-slice` | `{ agentId, workspaceType }` | Notify other workspaces |
| `AGENT_CONFIG_UPDATED` | `agent-events-slice` | `{ agentId, workspaceType, updates }` | Sync config changes |
| `AGENT_AVAILABILITY_CHANGED` | `agent-events-slice` | `{ agentId, workspaceType, isAvailable }` | Update workspace bindings |

### 11.2 Event Buses

| Bus | File | Usage |
|-----|------|-------|
| `crossWorkspaceEventBus` | `src/lib/events/cross-workspace-event-bus.ts` | Sync across workspace boundaries |
| `eventBus` (Domain) | `src/infrastructure/events/event-bus.ts` | Component-level subscriptions |

---

## 12. Recommendations

### 12.1 API Key Validation Fix

**Problem**: "API Key missing" validation error triggers incorrectly for agents.

**Solution**: Remove `apiKey` field from agent validation schema since API keys are provider-scoped, not agent-scoped.

```typescript
// In useAgentFormValidation hook
const agentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  providerId: z.string().min(1, 'Provider is required'),
  modelId: z.string().optional(), // Make optional for now
  // REMOVE: apiKey - not stored in agent config
});
```

### 12.2 Provider Dependency Validation

**Problem**: Creating an agent for a provider without a configured API key causes runtime errors.

**Solution**: Add validation that checks `provider.hasApiKey === true` before allowing agent creation.

### 12.3 Agent Orphaning Prevention

**Problem**: Deleting a provider doesn't handle agents using that provider.

**Solution**: In `removeProvider`, automatically reassign affected agents to default provider or prompt user.

### 12.4 Event Emission Improvement

**Problem**: Events emitted after state change may race with listeners.

**Solution**: Consider emitting events before state mutation, or use optimistic updates with rollback on failure.

---

## 13. File References

### Core Entry Points
- `src/routes/agents.tsx`
- `src/routes/settings.tsx`
- `src/presentation/components/agent/AgentConfigDialog.tsx`
- `src/presentation/components/agent/ProviderConfigDialog.tsx`

### State Management
- `src/infrastructure/persistence/stores/use-app-store.ts`
- `src/infrastructure/persistence/stores/agents/index.ts`
- `src/infrastructure/persistence/stores/agents/slices/agent-events-slice.ts`
- `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`

### Credential Management
- `src/lib/agent/providers/credential-vault.ts`
- `src/lib/agent/providers/credential-encryption.ts`
- `src/lib/agent/providers/credential-storage.ts`

### Database
- `src/infrastructure/persistence/dexie-db.ts`
- `src/infrastructure/persistence/dexie-db-class.ts`
- `src/infrastructure/persistence/stores/dexie-storage.ts`

### Tool Permissions
- `src/lib/agent/tool-permission/tool-permission-manager.ts`
- `src/lib/agent/tool-permission/tool-permission-trust.ts`
- `src/lib/agent/tool-permission/tool-permission-queries.ts`

---

*End of Report*
