# Vault → AI Chain Trace

**Story**: DIAG-01 - Complete Vault → AI Chain Trace
**Date**: 2026-01-09
**Status**: COMPLETE ✅
**Effort**: 2 hours
**Track**: A (Vault/AI Chain)

---

## Executive Summary

The Vault → AI chain is **WORKING** but has **3 documented failure points** that can cause API key retrieval to fail silently or throw errors. The chain follows a clean architecture with proper separation of concerns:

1. **Settings Page** → User saves API key
2. **Credential Vault** → AES-256-GCM encryption → IndexedDB
3. **Provider Store** → hasApiKey flag synced
4. **AI Service** → Retrieves key from vault
5. **API Call** → Provider endpoint

**Chain Status**: ✅ **FUNCTIONAL** with known edge cases

---

## Chain Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERACTION LAYER                          │
├──────────────────────────────────────────────────────────────────────────────┤
│  Settings Page (/settings)                                                              │
│    ↓                                                                                  │
│  User clicks "Add Provider" → ProviderConfigDialog                                          │
│    ↓                                                                                  │
│  User enters API key → Clicks "Save"                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            CREDENTIAL VAULT LAYER                            │
├──────────────────────────────────────────────────────────────────────────────┤
│  ProviderConfigDialog.tsx:ApiKeyInputSection                                                │
│    ↓                                                                                  │
│  ProviderSettings.tsx → ProviderConfigDialog                                              │
│    ↓                                                                                  │
│  credential-vault.ts:storeCredentials(providerId, apiKey)                         │
│    ├─→ AES-256-GCM encryption (credential-encryption.ts)                                    │
│    ├─→ Master key unwrap (credential-vault.ts:208)                                          │
│    └─→ IndexedDB storage (credential-storage.ts)                                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           STATE MANAGEMENT LAYER                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  provider-credentials-slice.ts:storeProviderKey()                                          │
│    ├─→ credentialVault.storeCredentials()                                                  │
│    ├─→ Update keyMetadata (storedAt, keyId)                                                │
│    └─→ Sync hasApiKey flag in provider config (line 149-151)                                    │
│                                                                                          │
│  use-app-store.ts (Single bounded store)                                                 │
│    └─→ Persist middleware → Dexie IndexedDB                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             AI SERVICE LAYER                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│  AISlashCommand.tsx → executeAICommand()                                                    │
│    ↓                                                                                  │
│  note-ai-service.ts:generateNoteContent()                                                  │
│    ├─→ useAgentSelectionStore → getAgentForWorkspace('notes')                             │
│    ├─→ Get agent config (providerId, modelId, systemPrompt)                                   │
│    ├─→ credentialVault.getCredentials(providerId) ← KEY RETRIEVAL                        │
│    └─→ callProviderAPI()                                                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                               API CALL LAYER                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  callProviderAPI()                                                                       │
│    ├─→ Build request based on providerId (openrouter, openai, anthropic, google)          │
│    ├─→ fetch(endpoint, { headers, body })                                                 │
│    └─→ Parse response based on provider format                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Trace

### Step 1: Settings Page → API Key Input

**File**: [`settings.tsx:138`](../../src/routes/settings.tsx#L138) (ProviderSettings component)

**Flow**:
1. User navigates to `/settings`
2. Settings page renders [`ProviderSettings`](../../src/presentation/components/agent/ProviderSettings.tsx) component
3. User clicks "Add Provider" button
4. [`ProviderConfigDialog`](../../src/presentation/components/agent/ProviderConfigDialog.tsx) opens
5. User enters API key in [`ApiKeyInputSection`](../../src/presentation/components/agent/ApiKeyInputSection.tsx)
6. User clicks "Save"

**Code Reference**:
```typescript
// settings.tsx:138
<div className="mb-8">
    <ProviderSettings />
</div>

// ProviderSettings.tsx:38-41
const handleAdd = () => {
    setEditingProvider(undefined);
    setIsConfigOpen(true);
};

// ProviderConfigDialog → ApiKeyInputSection → onSaveKey
```

---

### Step 2: Credential Vault Storage

**File**: [`credential-vault.ts:390-412`](../../src/lib/agent/providers/credential-vault.ts#L390)

**Action**: `credentialVault.storeCredentials(providerId, apiKey)`

**Process**:
1. **SSR Guard** (line 392-394): Checks `typeof window === 'undefined'` to prevent SSR execution
2. **Initialize vault** (line 396): Calls `await this.initialize()`
3. **Validate master key** (line 397-398): Throws if `!this.masterKey`
4. **Encrypt API key** (line 402): `this.encryption.encryptApiKey(apiKey, this.masterKey)`
   - Uses AES-256-GCM encryption
   - Returns `{ encrypted, iv }` object
5. **Store in IndexedDB** (line 405): `this.storage.storeCredentials(providerId, encryptedData.encrypted, encryptedData.iv)`
6. **Check result** (line 407-409): Throws if storage fails

**Encryption Details**:
```typescript
// credential-encryption.ts (referenced in credential-vault.ts)
// - AES-256-GCM algorithm
// - 12-byte IV (initialization vector)
// - Authentication tag for integrity verification
// - Master key wrapped with AES-KW (key wrapping)
```

**Key Storage**:
- Encrypted key → IndexedDB `credential-vault` store
- Master key → localStorage (wrapped with vault password)
- Vault password → localStorage (`vg_vp_v3`)
- Salt → localStorage (`vg_salt_v3`)

---

### Step 3: Provider Store State Sync

**File**: [`provider-credentials-slice.ts:121-160`](../../src/infrastructure/persistence/stores/providers/provider-credentials-slice.ts#L121)

**Action**: `storeProviderKey(providerId, apiKey)` called from provider config

**Process**:
1. **SSR Guard** (line 125-127): Throws if called during SSR
2. **Store in vault** (line 131): `await credentialVault.storeCredentials(providerId, apiKey)`
3. **Update metadata** (line 134-145): Stores `keyId`, `storedAt`, `isValid`
4. **Sync hasApiKey flag** (line 148-151):
   ```typescript
   const provider = get().providers.find(p => p.id === providerId);
   if (provider && !provider.hasApiKey) {
       get().updateProvider(providerId, { hasApiKey: true });
   }
   ```

**Critical**: The `hasApiKey` flag is kept in sync with vault state. This is the primary flag used by UI to show if a provider has credentials.

---

### Step 4: AI Slash Command Invocation

**File**: [`AISlashCommand.tsx:64-123`](../../src/presentation/components/notes/AISlashCommand.tsx#L64)

**Trigger**: User types `/summarize` or other AI command in Notes editor

**Process**:
1. **Slash menu opens**: BlockNote slash menu with AI commands
2. **User selects command**: e.g., "Summarize Note"
3. **executeAICommand()** called (line 64):
   - Shows loading toast (line 71)
   - Gets context blocks (line 75): `editor.document`
   - Calls `generateNoteContent(prompt, { contextBlocks })` (line 77)
   - Inserts response into editor (line 96)
   - Shows success/error toast

**Code Reference**:
```typescript
// AISlashCommand.tsx:64-78
async function executeAICommand(
    editor: BlockNoteEditor,
    prompt: string,
    commandName: string = 'AI',
    options?: { includeContext?: boolean; replaceSelection?: boolean }
): Promise<void> {
    const toastId = toast.loading(`${commandName} generating...`);
    try {
        const contextBlocks = options?.includeContext !== false ? editor.document : undefined;
        const result = await generateNoteContent(prompt, { contextBlocks });
        // ... insert blocks
    } catch (error) { /* error handling */ }
}
```

---

### Step 5: AI Service - Agent Resolution

**File**: [`note-ai-service.ts:57-100`](../../src/lib/notes/note-ai-service.ts#L57)

**Action**: `generateNoteContent(prompt, options)` called from slash command

**Process**:
1. **Vault initialization** (line 62-66): `await credentialVault.initialize()`
2. **Get agent for Notes workspace** (line 69-70):
   ```typescript
   const { getAgentForWorkspace } = useAgentSelectionStore.getState();
   let activeAgent = getAgentForWorkspace('notes');
   ```
3. **Fallback to global agent** (line 73-78): If no notes-specific agent
4. **Apply override if provided** (line 81-83)
5. **Throw if no agent** (line 85-96): `NoteAIError('NO_AGENT', 'No AI agent configured...')`

**Agent Selection Priority**:
1. Workspace-specific agent (Notes)
2. Global active agent
3. First available agent (fallback)

---

### Step 6: API Key Retrieval from Vault

**File**: [`note-ai-service.ts:105-141`](../../src/lib/notes/note-ai-service.ts#L105)

**Action**: `generateWithAgent(agent, prompt, options)`

**Process**:
1. **Retrieve API key** (line 111): `await credentialVault.getCredentials(agent.providerId)`
2. **Legacy migration fallback** (line 114-134):
   - If vault returns null but `agent.hasApiKey === true`
   - Check old provider store location
   - Auto-migrate to vault if found
3. **Throw if no API key** (line 136-140): `NoteAIError('NO_API_KEY', ...)`

**Code Reference**:
```typescript
// note-ai-service.ts:111-141
let apiKey = await credentialVault.getCredentials(agent.providerId);

// Legacy fallback (auto-migration)
if (!apiKey && agent.hasApiKey) {
    const providers = useAppStore.getState().providers;
    const provider = providers?.find((p: any) => p.id === agent.providerId);
    if (provider && 'apiKey' in provider && provider.apiKey) {
        apiKey = String(provider.apiKey);
        // Auto-migrate to vault
        await credentialVault.storeCredentials(agent.providerId, apiKey);
    }
}

if (!apiKey) {
    throw new NoteAIError('NO_API_KEY',
        `No API key configured for provider "${agent.providerId}". ` +
        `Please add your API key in Settings > Providers.`
    );
}
```

**Critical**: This is where **"API Key missing"** error is thrown (line 138).

---

### Step 7: API Call Execution

**File**: [`note-ai-service.ts:199-332`](../../src/lib/notes/note-ai-service.ts#L199)

**Action**: `callProviderAPI(params)`

**Process**:
1. **Build request based on provider** (line 215-292):
   - **openrouter**: `https://openrouter.ai/api/v1/chat/completions`
   - **openai**: `https://api.openai.com/v1/chat/completions`
   - **anthropic**: `https://api.anthropic.com/v1/messages`
   - **google**: `https://generativelanguage.googleapis.com/v1beta/models/...`
2. **Fetch with headers** (line 295-299):
   - Authorization: `Bearer ${apiKey}`
   - Content-Type: `application/json`
3. **Parse response** (line 312-320):
   - anthropic: `data.content[0].text`
   - google: `data.candidates[0].content.parts[0].text`
   - others: `data.choices[0].message.content`

---

## Failure Points

### Failure Point 1: Vault Not Initialized

**Location**: [`credential-vault.ts:397-398`](../../src/lib/agent/providers/credential-vault.ts#L397)

**Condition**: Master key is null after initialization

**Error Message**:
```
"Vault not initialized - please refresh the page and try again"
```

**Root Cause**:
- SSR execution (line 392-394)
- Corrupted localStorage keys (line 181-193)
- Master key decryption failure (line 225-233)

**Recovery**:
- Create new vault automatically (fallback in line 230)
- User must re-enter all API keys

---

### Failure Point 2: No Agent Configured

**Location**: [`note-ai-service.ts:85-96`](../../src/lib/notes/note-ai-service.ts#L85)

**Condition**: No agent exists in agent store

**Error Message**:
```typescript
NoteAIError('NO_AGENT', 'No AI agent configured. Please create an agent in Settings > Agents.')
```

**User Action Required**:
1. Go to Settings > AI Agent Configuration
2. Click "Configure Agent"
3. Create an agent with provider and model selection

---

### Failure Point 3: No API Key in Vault

**Location**: [`note-ai-service.ts:136-140`](../../src/lib/notes/note-ai-service.ts#L136)

**Condition**: `credentialVault.getCredentials(providerId)` returns null

**Error Message**:
```typescript
NoteAIError('NO_API_KEY',
    `No API key configured for provider "${agent.providerId}". ` +
    `Please add your API key in Settings > Providers.`
)
```

**Root Cause Analysis**:
1. User never saved API key
2. API key was saved to wrong provider ID
3. Vault was cleared (localStorage wipe)
4. Migration from old store failed silently

**User Action Required**:
1. Go to Settings > Providers
2. Find the provider (e.g., "OpenRouter", "Anthropic")
3. Click "Edit" (pencil icon)
4. Enter API key
5. Click "Save"

---

## Failure Point 4: API Call Failure

**Location**: [`note-ai-service.ts:301-308`](../../src/lib/notes/note-ai-service.ts#L301)

**Condition**: API returns non-OK status

**Error Message**:
```typescript
NoteAIError('API_ERROR',
    `AI API error (${response.status}): ${errorText.slice(0, 200)}`
)
```

**Common Causes**:
- Invalid API key
- Rate limit exceeded
- Provider API down
- Network error

**Recovery**:
- Check API key validity
- Wait and retry
- Check provider status page

---

## Cross-Slice Communication

### Provider → Agent Dependency

**Circular Dependency Prevention** (Story AC-1.1 fix):

```typescript
// BEFORE: Direct import caused circular dependency
import { useAgentsStore } from '@/stores/agents-store';

// AFTER: Agent passed as parameter to break cycle
const removeProvider = async (providerId: string, agents: AgentData[]) => {
    const dependentAgents = agents.filter(a => a.providerId === providerId);
    if (dependentAgents.length > 0) {
        throw new Error(`Cannot delete provider "${providerId}" - ` +
            `${dependentAgents.length} agent(s) depend on it: ` +
            `${dependentAgents.map(a => a.name).join(', ')}`);
    }
};
```

**File**: [`ProviderSettings.tsx:61`](../../src/presentation/components/agent/ProviderSettings.tsx#L61)

---

## Data Flow Summary

| Step | Input | Output | Storage Location |
|------|-------|--------|------------------|
| 1 | User enters API key | Encrypted data | IndexedDB `credential-vault` |
| 2 | Store success | hasApiKey = true | Dexie `providerConfigs` |
| 3 | AI command | Agent config | Zustand `useAppStore` |
| 4 | Agent lookup | providerId | Zustand `useAgentSelectionStore` |
| 5 | Key retrieval | Decrypted API key | Runtime (memory) |
| 6 | API call | AI response | Fetch response |

---

## Security Architecture

### Encryption Layers

1. **API Key Level**: AES-256-GCM
   - IV: 12 bytes (random per encryption)
   - Authentication tag: 16 bytes (integrity verification)

2. **Master Key Level**: AES-KW (Key Wrapping)
   - Wraps master key with vault password
   - Prevents master key extraction

3. **Vault Password**: PBKDF2-SHA256
   - Derived from random password (64 characters)
   - Salt: 16 bytes (stored in localStorage)
   - Iterations: 100,000

### Storage Security

| Data | Storage | Encryption | Notes |
|------|---------|-------------|-------|
| API keys | IndexedDB | AES-256-GCM | Per-provider encryption |
| Master key | localStorage | AES-KW wrapped | Password-protected |
| Vault password | localStorage | Plain | Auto-generated |
| Salt | localStorage | Base64 | Public (not secret) |

### SSR Safety

All vault operations are guarded with `typeof window === 'undefined'` check:

```typescript
// credential-vault.ts:167-170
if (typeof window === 'undefined') {
    console.log('[CredentialVault] SSR detected - skipping initialization');
    return;
}
```

This prevents:
- Vault key regeneration on Vercel SSR
- Credential loss during SSR rendering
- "Models not loading" bug from Story A-4

---

## Model Selection Flow

### How Model is Determined

1. **Agent stores modelId**: `agent.modelId` or `agent.model` property
2. **AI Service passes to API call**:
   ```typescript
   modelId: agent.modelId || agent.model
   ```
3. **Provider-specific validation**: Each provider validates modelId format

### Model Fetch Flow

```
ProviderSettings → ProviderConfigDialog
    ↓
fetchModels(providerId) → provider-models-slice.ts
    ↓
Store in: modelSettings[providerId] = { models, isLoading, lastFetched }
    ↓
AgentConfigDialog reads: availableModels[providerId] || []
```

---

## Event Flow Sequence

### Complete User Journey: Saving API Key → Using AI Command

```
TIMELINE OF EVENTS

T+0: User clicks "Add Provider" button
  → ProviderConfigDialog opens

T+5: User enters API key (e.g., "sk-or-v1-...")
  → apiKey stored in component state

T+10: User clicks "Save" button
  → ProviderConfigDialog.onSaveKey() called
  → credentialVault.storeCredentials('openrouter', 'sk-or-v1-...')
  → Key encrypted with AES-256-GCM
  → Encrypted key stored in IndexedDB
  → hasApiKey flag set to true in provider store
  → Toast success shown

T+30: User goes to Notes workspace
  → BlockNote editor loads

T+45: User types "/summarize"
  → Slash menu opens with AI commands

T+50: User clicks "Summarize Note"
  → executeAICommand(editor, 'Summarize...', 'Summary')
  → generateNoteContent() called
  → credentialVault.initialize() called (no-op if already initialized)
  → getAgentForWorkspace('notes') returns agent
  → generateWithAgent(agent, prompt) called
  → credentialVault.getCredentials('openrouter') called
  → Key retrieved from IndexedDB
  → Key decrypted using master key
  → callProviderAPI() builds request
  → fetch('https://openrouter.ai/api/v1/chat/completions', ...)
  → Response parsed
  → Content inserted into editor
  → Toast success shown
```

---

## Conclusion

**Chain Status**: ✅ **WORKING**

The Vault → AI chain is functional with proper error handling and user feedback. The main failure points are:

1. **No agent configured** - User error, clear error message
2. **No API key saved** - User error, clear error message with settings link
3. **API key invalid** - External issue, generic error message
4. **Vault not initialized** - System issue, auto-recovers

**Recommended Improvements**:

1. **Add vault status indicator in UI** - Show green dot when vault is ready
2. **Pre-flight key validation** - Check key validity before showing "ready" status
3. **Better error recovery** - Offer to open settings when API key missing
4. **Migration status** - Show if legacy keys need migration

**Files Referenced**:
- [`settings.tsx`](../../src/routes/settings.tsx) - Settings page
- [`credential-vault.ts`](../../src/lib/agent/providers/credential-vault.ts) - Vault encryption/storage
- [`provider-credentials-slice.ts`](../../src/infrastructure/persistence/stores/providers/provider-credentials-slice.ts) - State sync
- [`note-ai-service.ts`](../../src/lib/notes/note-ai-service.ts) - AI service orchestration
- [`AISlashCommand.tsx`](../../src/presentation/components/notes/AISlashCommand.tsx) - Slash command handler
- [`ProviderSettings.tsx`](../../src/presentation/components/agent/ProviderSettings.tsx) - Provider UI

---

**Generated**: 2026-01-09
**Story**: DIAG-01
**Status**: ✅ COMPLETE
