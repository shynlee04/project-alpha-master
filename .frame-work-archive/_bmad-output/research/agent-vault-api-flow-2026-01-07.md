# Investigation 1: Agent → Vault → API Flow Mapping

**Date:** 2026-01-07  
**Investigator:** @bmad-bmm-analyst  
**Scope:** Map ALL entry points that call credentialVault.getCredentials(), identify agent config vs hardcoded providers, document data flow from UI → API

## Executive Summary

Found **3 distinct AI invocation patterns** with significant architectural disjoint:

1. **Full Agent System** (ChatPanel) - Uses `/api/chat` with proper agent selection
2. **Notes AI Service** (note-ai-service) - Direct API calls bypassing unified endpoint
3. **Hardcoded Provider Features** (VoiceRecordButton, MultiModalImport) - Bypass agent selection entirely

## Detailed Flow Analysis

### Pattern 1: Full Agent System (IDE Workspace)

**Entry Point:** `ChatPanel.tsx` (Lines 76-78, 198)

```typescript
// B-1: Retrieve API key from vault for selected agent's provider
const providerId = selectedAgent?.providerId || 'openrouter';
const { apiKey } = useProviderApiKey(providerId);
...
apiKey, // B-1: Include API key from vault
```

**Flow Sequence:**
```
ChatPanel → useAgentSelection → selectedAgent.providerId → 
useProviderApiKey hook → credentialVault.getCredentials → 
/api/chat endpoint → TanStack AI createServerFnGenerator
```

**Characteristics:**
- ✅ Agent configuration drives model selection
- ✅ Provider + Model from Agent config
- ✅ Tools via factory.ts (client-side tool execution)
- ✅ Workspace-aware agent selection (lastSelectedAgentIds[workspace])
- ⚠️ API key passed via request body (B-1 fix applied)

### Pattern 2: Notes AI Service (Notes Workspace)

**Entry Point:** `note-ai-service.ts` (Lines 63-88)

```typescript
const { getAgentForWorkspace } = useAgentSelectionStore.getState();
const activeAgent = getAgentForWorkspace('notes');
...
const apiKey = await credentialVault.getCredentials(agent.providerId);
```

**Flow Sequence:**
```
generateNoteContent → getAgentForWorkspace('notes') → 
credentialVault.getCredentials → callProviderAPI - DIRECT fetch
```

**Characteristics:**
- ✅ Uses workspace-specific agent (getAgentForWorkspace('notes'))
- ✅ Gets key from vault
- ⛔ **Does NOT use /api/chat endpoint - Direct API calls!**
- ⛔ **No streaming SSE - Blocking await**
- ⛔ **No tool support - Just text completion**

### Pattern 3: AI Features (Completion-style) - HARDCODED

#### VoiceRecordButton.tsx (Lines 51-54)
```typescript
// HARDCODED PROVIDER!
const apiKey = await credentialVault.getCredentials('gemini');
```

#### MultiModalImport.tsx (Similar pattern)
```typescript
// HARDCODED PROVIDER!
const apiKey = await credentialVault.getCredentials('gemini');
```

**Characteristics:**
- ⛔ **Bypasses agent selection entirely**
- ⛔ **Hardcodes provider IDs (doesn't respect user config)**
- ✅ Uses vault for key retrieval
- ⛔ No workspace context consideration

## Critical Disjoint Points

| Issue | Impact | Severity |
|-------|--------|----------|
| note-ai-service makes direct API calls, not /api/chat | Inconsistent logging, no streaming, different error handling | **HIGH** |
| useProviderApiKey hook doesn't re-fetch on vault updates | Key saved while mounted won't trigger UI update | **MEDIUM** (from code review) |
| Hardcoded 'gemini' provider in multimodal features | User BYOK config ignored for voice/vision | **HIGH** |
| Two layers of system prompt config not unified | Agent systemPrompt vs workspace-specific instructions | **MEDIUM** |
| Vault doesn't configure models, but agent config does | Disjoint configuration sources | **HIGH** |
| Missing states/stores reactivity for agent switch | Hot-reload not propagating | **MEDIUM** |

## Complete Entry Point Inventory

### credentialVault.getCredentials() Call Sites

1. **ChatPanel.tsx** (via useProviderApiKey hook)
   - **Provider:** From selectedAgent.providerId
   - **Workspace:** IDE workspace
   - **API Path:** /api/chat
   - **Agent-aware:** ✅

2. **note-ai-service.ts** (direct call)
   - **Provider:** From agent config (getAgentForWorkspace('notes'))
   - **Workspace:** Notes workspace
   - **API Path:** Direct provider API
   - **Agent-aware:** ✅

3. **VoiceRecordButton.tsx** (direct call)
   - **Provider:** HARDCODED 'gemini'
   - **Workspace:** None (hardcoded)
   - **API Path:** Direct Gemini API
   - **Agent-aware:** ❌

4. **MultiModalImport.tsx** (direct call)
   - **Provider:** HARDCODED 'gemini'
   - **Workspace:** None (hardcoded)
   - **API Path:** Direct Gemini API
   - **Agent-aware:** ❌

5. **useProviderApiKey hook** (reactive wrapper)
   - **Provider:** Parameterized
   - **Workspace:** N/A (utility)
   - **API Path:** N/A (utility)
   - **Agent-aware:** ✅ (when used properly)

## Data Flow Mappings

### Flow 1: ChatPanel (Correct Pattern)
```
UI: ChatPanel
↓
Store: useAgentSelectionStore (get active agent for workspace)
↓
Config: selectedAgent.providerId, selectedAgent.modelId
↓
Hook: useProviderApiKey(providerId)
↓
Vault: credentialVault.getCredentials(providerId)
↓
API: /api/chat (POST with apiKey in body)
↓
Backend: TanStack AI + ProviderAdapterFactory
```

### Flow 2: Notes AI Service (Bypass Pattern)
```
UI: NoteEditor
↓
Service: generateNoteContent()
↓
Store: getAgentForWorkspace('notes')
↓
Config: agent.providerId, agent.modelId
↓
Vault: credentialVault.getCredentials(agent.providerId)
↓
API: Direct fetch to provider endpoint
↓
Backend: None (client-side only)
```

### Flow 3: Hardcoded Features (Anti-Pattern)
```
UI: VoiceRecordButton/MultiModalImport
↓
Hardcode: 'gemini' provider
↓
Vault: credentialVault.getCredentials('gemini')
↓
API: Direct fetch to Gemini API
↓
Backend: None (client-side only)
```

## Configuration Layer Analysis

### Agent Configuration Sources
1. **Agent Store** (`agent-selection-store.ts`)
   - Per-workspace agent selection
   - Agent definitions with provider/model

2. **Credential Vault** (`credential-vault.ts`)
   - Encrypted API key storage
   - Provider credential management

3. **Provider Models Store** (`provider-models-slice.ts`)
   - Available models per provider
   - Model capabilities metadata

### Disjoint Configuration Issues
- **Models**: Configured in agent store, but vault only stores keys
- **System Prompts**: Agent systemPrompt vs workspace-specific instructions
- **Provider Selection**: Some features hardcode 'gemini' ignoring agent config

## Recommendations

### Immediate Fixes (High Priority)
1. **Unify note-ai-service to use /api/chat endpoint**
2. **Remove hardcoded 'gemini' provider in multimodal features**
3. **Implement workspace-aware agent selection for all AI features**

### Medium Priority
1. **Enhance useProviderApiKey reactivity for vault updates**
2. **Consolidate system prompt configuration layers**
3. **Add proper error handling and streaming to notes AI**

### Architecture Decision
- **Create unified AgentExecutionService** (see Investigation 5)
- **All AI invocations must go through agent selection**
- **Standardize on /api/chat endpoint for consistency**

## Files Requiring Changes

### Critical Files
- `src/lib/notes/note-ai-service.ts` - Migrate to /api/chat
- `src/presentation/components/notes/VoiceRecordButton.tsx` - Remove hardcoded provider
- `src/presentation/components/notes/MultiModalImport.tsx` - Remove hardcoded provider

### Supporting Files
- `src/lib/agent/hooks/use-provider-api-key.ts` - Enhance reactivity
- `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` - Add workspace methods
- `src/routes/api/chat.ts` - Add notes-specific tool support

---

**Next Investigation:** Tool Factory & Workspace Permissions (Investigation 2)
