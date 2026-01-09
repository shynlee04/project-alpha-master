# AI Slash Command Chain Trace

**Story**: DIAG-03 - AI Slash Command Chain Trace
**Date**: 2026-01-09
**Status**: COMPLETE ✅
**Effort**: 1.5 hours
**Track**: A (Vault/AI Chain)

---

## Executive Summary

The AI Slash Command chain is **WORKING** with a clear, traceable flow from user typing `/summarize` to API response. The chain follows a clean architecture:

1. **User types `/summarize`** in BlockNote editor
2. **AISlashCommand.tsx** detects command → calls `executeAICommand()`
3. **generateNoteContent()** resolves agent and retrieves API key
4. **Credential Vault** returns decrypted API key
5. **callProviderAPI()** makes the HTTP request
6. **Response inserted** into editor as markdown blocks

**Chain Status**: ✅ **FUNCTIONAL**

---

## Chain Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION LAYER                          │
├──────────────────────────────────────────────────────────────────────────────┤
│  BlockNote Editor (/notes)                                                        │
│    ↓                                                                                  │
│  User types "/summarize" in slash menu                                               │
│    ↓                                                                                  │
│  BlockNote slash menu appears with AI commands                                        │
│    ↓                                                                                  │
│  User selects "Summarize Note"                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            SLASH COMMAND LAYER                            │
├──────────────────────────────────────────────────────────────────────────────┤
│  AISlashCommand.tsx:summarizeNoteItem()                                         │
│    ↓                                                                                  │
│  executeAICommand(editor, prompt, 'Summary')                                       │
│    ├─→ Show loading toast                                                          │
│    ├─→ Get context blocks (editor.document)                                         │
│    └─→ Call generateNoteContent(prompt, { contextBlocks })                          │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           AI SERVICE LAYER                               │
├──────────────────────────────────────────────────────────────────────────────┤
│  note-ai-service.ts:generateNoteContent()                                        │
│    ├─→ Initialize credential vault                                                  │
│    ├─→ Get agent for 'notes' workspace                                            │
│    ├─→ Fallback to global agent if needed                                          │
│    └─→ Call generateWithAgent(agent, prompt, options)                              │
│                                                                                          │
│  generateWithAgent()                                                                 │
│    ├─→ credentialVault.getCredentials(providerId) ← KEY RETRIEVAL                │
│    ├─→ Legacy migration fallback (if needed)                                       │
│    ├─→ Build full prompt with context                                                │
│    └─→ Call callProviderAPI()                                                      │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                          CREDENTIAL VAULT LAYER                           │
├──────────────────────────────────────────────────────────────────────────────┤
│  credential-vault.ts:getCredentials(providerId)                                │
│    ├─→ AES-256-GCM decryption                                                      │
│    ├─→ Master key unwrap                                                           │
│    └─→ Returns decrypted API key                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            API CALL LAYER                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│  callProviderAPI()                                                                  │
│    ├─→ Build request based on providerId (openrouter, openai, anthropic, google)│
│    ├─→ fetch(endpoint, { headers, body })                                         │
│    └─→ Parse response based on provider format                                       │
│                                                                                          │
│  Response → Return to AISlashCommand                                                 │
│    ↓                                                                                  │
│  Parse markdown to blocks → Insert into editor                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Trace

### Step 1: User Types `/summarize`

**File**: `AISlashCommand.tsx:158-176`

**Action**: User types `/summarize` in BlockNote editor and selects the command

**Code Reference**:
```typescript
// Lines 158-176
export const summarizeNoteItem = (editor: BlockNoteEditor) => ({
    title: t('notes.ai.summary', 'Summarize Note'),
    onItemClick: async () => {
        const content = getAllNoteText(editor);
        if (!content.trim()) {
            toast.error(t('notes.ai.error.noContent', 'No content to summarize'));
            return;
        }
        await executeAICommand(
            editor,
            `Create a clear, concise summary of the following note. Format the summary with bullet points for key takeaways:\n\n${content}`,
            t('notes.ai.summary', 'Summary')
        );
    },
    aliases: ["summary", "summarize", "tldr"],
    group: "AI",
    icon: <ScrollText size={18} />,
    subtext: t('notes.ai.summary.description', 'Generate a summary of the entire note'),
});
```

**Key Points**:
- Slash menu items registered in `getCustomSlashMenuItems()`
- Aliases: `summary`, `summarize`, `tldr`
- Group: `AI`
- Icon: ScrollText

---

### Step 2: executeAICommand()

**File**: `AISlashCommand.tsx:64-123`

**Action**: Executes the AI command with loading state and error handling

**Code Reference**:
```typescript
// Lines 64-123
async function executeAICommand(
    editor: BlockNoteEditor,
    prompt: string,
    commandName: string = 'AI',
    options?: { includeContext?: boolean; replaceSelection?: boolean }
): Promise<void> {
    // Show loading toast
    const toastId = toast.loading(t('notes.ai.generating', `${commandName} generating...`));

    try {
        // Get page context if requested (default: true for awareness)
        const contextBlocks = options?.includeContext !== false ? editor.document : undefined;

        const result = await generateNoteContent(prompt, { contextBlocks });

        if (!result || result.trim().length === 0) {
            toast.error(t('notes.ai.error.empty', 'AI returned empty content'), { id: toastId });
            return;
        }

        // Parse markdown to blocks
        const blocks = await editor.tryParseMarkdownToBlocks(result);

        // Insert blocks after current position
        editor.insertBlocks(blocks, cursorPosition.block, 'after');

        toast.success(t('notes.ai.success', `${commandName} complete!`), { id: toastId });
    } catch (error) {
        // Error handling...
    }
}
```

**Key Points**:
- Loading toast shows "Summary generating..."
- Context blocks from `editor.document` included by default
- Markdown response parsed to BlockNote blocks
- Blocks inserted after cursor position

---

### Step 3: generateNoteContent()

**File**: `note-ai-service.ts:57-100`

**Action**: Resolves agent and initiates API call

**Code Reference**:
```typescript
// Lines 57-100
export async function generateNoteContent(
    prompt: string,
    options?: NoteAIOptions
): Promise<string> {
    // 0. Ensure credential vault is initialized
    await credentialVault.initialize();

    // 1. Get active agent specifically for NOTES workspace
    const { getAgentForWorkspace } = useAgentSelectionStore.getState();
    let activeAgent = getAgentForWorkspace('notes');

    // 1.1 Fallback: If no notes-specific agent, try global active agent
    if (!activeAgent) {
        const { activeAgentId } = useAgentSelectionStore.getState();
        if (activeAgentId) {
            activeAgent = useAppStore.getState().getAgent(activeAgentId) || null;
        }
    }

    const agent = options?.agentId
        ? useAppStore.getState().getAgent(options.agentId)
        : activeAgent;

    if (!agent) {
        // Try to get any available agent as last resort
        const allAgents = useAppStore.getState().agents;
        if (allAgents.length > 0) {
            console.warn('[NoteAIService] No notes agent, using first available agent');
            return generateWithAgent(allAgents[0], prompt, options);
        }
        throw new NoteAIError('NO_AGENT', 'No AI agent configured...');
    }

    return generateWithAgent(agent, prompt, options);
}
```

**Agent Resolution Priority**:
1. Workspace-specific agent (`getAgentForWorkspace('notes')`)
2. Global active agent (`activeAgentId` from agent-selection-store)
3. First available agent (fallback)

---

### Step 4: API Key Retrieval

**File**: `note-ai-service.ts:105-141`

**Action**: Retrieves API key from credential vault

**Code Reference**:
```typescript
// Lines 105-141
async function generateWithAgent(
    agent: any,
    prompt: string,
    options?: NoteAIOptions
): Promise<string> {
    // 2. Get API key from credential vault
    let apiKey = await credentialVault.getCredentials(agent.providerId);

    // 2.1 Fallback: Check if API key is still in old location
    if (!apiKey && agent.hasApiKey) {
        console.warn('[NoteAIService] API key flagged but not in vault. Migration may be needed.');
        // Try to get from legacy location
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
            `No API key configured for provider "${agent.providerId}". Please add your API key in Settings > Providers.`
        );
    }

    // ... continue to API call
}
```

**Key Points**:
- Primary: `credentialVault.getCredentials(providerId)`
- Legacy fallback: Check `providers` store
- Auto-migration: If found in legacy location, move to vault
- Error thrown if no API key

---

### Step 5: API Call Execution

**File**: `note-ai-service.ts:199-332`

**Action**: Makes HTTP request to provider API

**Provider Switch Statement**:
```typescript
// Lines 215-292
switch (providerId) {
    case 'openrouter':
        endpoint = 'https://openrouter.ai/api/v1/chat/completions';
        headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Via-gent Notes'
        };
        body = {
            model: modelId,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature,
            max_tokens: maxTokens
        };
        break;

    case 'openai':
        endpoint = 'https://api.openai.com/v1/chat/completions';
        // Similar structure...

    case 'anthropic':
        endpoint = 'https://api.anthropic.com/v1/messages';
        // Anthropic-specific format...

    case 'google':
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        // Google-specific format...
}
```

**Response Parsing**:
```typescript
// Lines 312-320
if (providerId === 'anthropic') {
    return data.content?.[0]?.text || '';
} else if (providerId === 'google') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
} else {
    // OpenAI / OpenRouter format
    return data.choices?.[0]?.message?.content || '';
}
```

---

### Step 6: Response Insertion

**File**: `AISlashCommand.tsx:84-102`

**Action**: Parses response and inserts into editor

**Code Reference**:
```typescript
// Lines 84-102
// Parse markdown to blocks
const blocks = await editor.tryParseMarkdownToBlocks(result);

if (blocks.length === 0) {
    toast.error(t('notes.ai.error.parse', 'Failed to parse AI response'), { id: toastId });
    return;
}

// Get current cursor position
const cursorPosition = editor.getTextCursorPosition();

// Insert blocks after current position
editor.insertBlocks(blocks, cursorPosition.block, 'after');

// Move cursor to end of inserted content
const lastInsertedBlock = blocks[blocks.length - 1];
if (lastInsertedBlock?.id) {
    editor.setTextCursorPosition(lastInsertedBlock.id, 'end');
}

toast.success(t('notes.ai.success', `${commandName} complete!`), { id: toastId });
```

---

## AIPromptDialog Alternative Flow

The `AIPromptDialog.tsx` component provides an alternative path for custom AI prompts.

**File**: `AIPromptDialog.tsx:22-151`

**Key Difference**: Instead of pre-built commands, user enters custom prompt in dialog.

**Code Reference**:
```typescript
// Lines 22-50
export function AIPromptDialog() {
    const { isOpen, closePrompt, editor } = useAIPromptStore();
    const [prompt, setPrompt] = useState('');
    const [includeContext, setIncludeContext] = useState(true);

    // Get active agent info for display - SPECIFICALLY for Notes workspace
    const getAgentForWorkspace = useAgentSelectionStore(s => s.getAgentForWorkspace);
    const activeAgent = getAgentForWorkspace('notes');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const options = includeContext ? { contextBlocks: getContextBlocks() } : undefined;
        const generatedContent = await generateNoteContent(prompt, options);

        const blocks = await editor.tryParseMarkdownToBlocks(generatedContent);
        editor.insertBlocks(blocks, editor.getTextCursorPosition().block, 'after');
    };
}
```

**Trigger**: User clicks "AI Magic" in slash menu → `insertAIItem()` opens dialog

---

## Error Handling

### Error Types

| Error Code | Message | User Action |
|------------|---------|-------------|
| **NO_AGENT** | "No AI agent configured" | Create agent in Settings > Agents |
| **NO_API_KEY** | "No API key configured for provider" | Add API key in Settings > Providers |
| **AGENT_NOT_FOUND** | "Selected agent not found" | Select different agent |
| **API_ERROR** | "AI API error (status)" | Check API key, rate limits, network |

### Error Handling Flow

```typescript
// AISlashCommand.tsx:105-122
catch (error) {
    if (error instanceof NoteAIError) {
        switch (error.code) {
            case 'NO_AGENT':
                toast.error('Please select an AI agent first', { id: toastId });
                break;
            case 'NO_API_KEY':
                toast.error('No API key configured', { id: toastId });
                break;
            default:
                toast.error(`${commandName} failed: ${error.message}`, { id: toastId });
        }
    }
}
```

---

## Agent Resolution Details

### Store Used: `useAgentSelectionStore`

**Location**: `src/infrastructure/persistence/stores/agents/agent-selection-store.ts`

**Method**: `getAgentForWorkspace(workspaceType)`

**How it works**:
1. Checks if there's a workspace-specific agent configured
2. Falls back to global active agent if none
3. Returns agent object with `providerId`, `modelId`, `systemPrompt`

**Code**:
```typescript
// note-ai-service.ts:69-70
const { getAgentForWorkspace } = useAgentSelectionStore.getState();
let activeAgent = getAgentForWorkspace('notes');
```

---

## Model Selection

### How Model is Determined

1. **Agent stores modelId**: `agent.modelId` or `agent.model` property
2. **AI Service passes to API call**:
   ```typescript
   modelId: agent.modelId || agent.model
   ```
3. **Provider-specific validation**: Each provider validates modelId format

### Model Fetch Flow (from DIAG-01)

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

## Custom Slash Commands

**File**: `AISlashCommand.tsx:339-391`

Custom commands are user-defined slash commands stored in `useSlashCommandStore`.

**Creation Flow**:
```typescript
function createCustomCommandItem(
    editor: BlockNoteEditor,
    command: CustomSlashCommand
): DefaultReactSuggestionItem {
    return {
        title: localized.title,
        onItemClick: async () => {
            const content = getAllNoteText(editor);
            const promptWithContext = content.trim()
                ? `${command.prompt}\n\nNote content:\n${content}`
                : command.prompt;

            await executeAICommand(editor, promptWithContext, localized.title);
        },
        aliases: command.aliases,
        group: 'AI Custom',
        icon: <Icon size={18} />,
    };
}
```

**Integration**: Custom commands added to slash menu via `getCustomSlashMenuItems()`

---

## Data Flow Summary

| Step | Input | Output | Storage Location |
|------|-------|--------|------------------|
| 1 | User types `/summarize` | Command selected | Editor state |
| 2 | Context blocks | Full prompt | Runtime (memory) |
| 3 | Agent lookup | Agent config | useAgentSelectionStore |
| 4 | Provider ID | API key | CredentialVault (IndexedDB) |
| 5 | API call | AI response | Fetch response |
| 6 | Markdown | Blocks | Editor insertion |

---

## Conclusion

**Chain Status**: ✅ **WORKING**

The AI Slash Command chain is functional with proper error handling and user feedback. The main failure points are:

1. **No agent configured** - User error, clear error message
2. **No API key saved** - User error, clear error message with settings link
3. **API key invalid** - External issue, generic error message
4. **API failure** - External issue, error with status code

**Key Files**:
- `AISlashCommand.tsx` - Slash command menu items
- `AIPromptDialog.tsx` - Custom prompt dialog
- `note-ai-service.ts` - AI service orchestration
- `use-agent-chat-with-tools.ts` - TanStack AI integration for agent chat panels

**Files Referenced**:
- `vault-ai-chain-trace.md` - Related DIAG-01 output
- `src/infrastructure/persistence/stores/agents/agent-selection-store.ts` - Agent selection state
- `src/lib/agent/providers/credential-vault.ts` - API key storage

---

**Generated**: 2026-01-09
**Story**: DIAG-03
**Status**: ✅ COMPLETE
