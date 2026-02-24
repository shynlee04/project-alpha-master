# API Contracts

Server-side API routes and client-side interfaces for the Via-gent project.

## Server Routes (TanStack Start)

### `/api/chat`

**description**: AI chat endpoint with streaming responses

**Method**: `POST`

**Request Body**:
```typescript
interface ChatRequest {
    messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>;
    providerId?: string;       // Default: 'openrouter'
    modelId?: string;          // Default: 'mistralai/devstral-2512:free'
    apiKey: string;            // Required - from credentialVault
    disableTools?: boolean;    // Debug flag
    customBaseURL?: string;    // OpenAI-compatible custom endpoint
    customHeaders?: Record<string, string>;
}
```

**Response**: Server-Sent Events (SSE) stream

**Tool Definitions** (provided to LLM):
| Tool | Parameters | Description |
|------|------------|-------------|
| `readFile` | `path: string` | Read file contents |
| `writeFile` | `path: string, content: string` | Write/overwrite file |
| `listFiles` | `path?: string` | List directory contents |
| `executeCommand` | `command: string, timeout?: number` | Execute shell command |

**Supported Providers**:
| Provider | Base URL | Tool Support |
|----------|----------|--------------|
| OpenRouter | `https://openrouter.ai/api/v1` | ✅ |
| OpenAI | `https://api.openai.com/v1` | ✅ |
| Anthropic | `https://api.anthropic.com/v1` | ✅ |
| Custom OpenAI-compatible | Configurable | Depends |

**Known Models Without Tool Support**:
- `nex-agi/deepseek-v3.1-nex-n1:free`
- `deepseek/deepseek-chat:free`
- `deepseek-chat`

## Client-Side Hooks

### `useAgentChatWithTools`

**Location**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`

**description**: React hook for AI chat with tool execution

**Usage**:
```typescript
const { messages, sendMessage, approvalRequests } = useAgentChatWithTools({
    agentId: string,
    providerId: string,
    modelId: string,
    onApproval?: (toolCall) => void,
});
```

### `usePromptEnhancer`

**Location**: `src/lib/agent/hooks/use-prompt-enhancer.ts`

**description**: AI-powered prompt enhancement for agent interactions

### `useWorkspaceState`

**Location**: `src/lib/workspace/hooks/useWorkspaceState.ts`

**description**: Workspace state management with persistence

## File System Operations

### `LocalFSAdapter`

**Location**: `src/lib/filesystem/local-fs-adapter.ts`

**Operations**:
| Method | Description |
|--------|-------------|
| `readFile(path)` | Read file as text |
| `writeFile(path, content)` | Write file |
| `mkdir(path)` | Create directory |
| `rm(path)` | Remove file/directory |
| `readdir(path)` | List directory |
| `stat(path)` | Get file metadata |

### `SyncManager`

**Location**: `src/lib/filesystem/sync-manager.ts`

**description**: Bi-directional sync between Local FS and WebContainer

**Sync Flow**:
```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
      ↑                                    ↑
   IndexedDB (ProjectStore)         File Change Events
```

## WebContainer Operations

### `webcontainer-manager.ts`

**Location**: `src/lib/webcontainer/manager.ts`

**Lifecycle**:
1. `boot()` - Initialize WebContainer instance
2. `mount(files)` - Mount initial file structure
3. `spawn('shell')` - Start interactive shell
4. `on('file-change')` - Listen for file changes

### `process-manager.ts`

**Location**: `src/lib/webcontainer/process-manager.ts`

**Operations**:
| Method | Description |
|--------|-------------|
| `spawn(command, args)` | Spawn a process |
| `kill(pid)` | Kill a process |
| `resize(pid, cols, rows)` | Resize terminal |

## Provider Configuration

### `ProviderAdapter`

**Location**: `src/lib/agent/providers/provider-adapter.ts`

**Interface**:
```typescript
interface ProviderAdapter {
    chat(messages: Message[], options?: ChatOptions): Promise<Stream>;
    getModels(): Promise<Model[]>;
    validateConfig(config: ProviderConfig): boolean;
}
```

### `ModelRegistry`

**Location**: `src/lib/agent/providers/model-registry.ts`

**description**: Registry of available AI models with capabilities

## State Stores

### IDE State (`useIDEStore`)

**Location**: `src/lib/state/ide-state-store.ts`

**State**:
```typescript
interface IDEState {
    openFiles: string[];
    activeFile: string | null;
    expandedPaths: string[];
    panelLayouts: Record<string, number[]>;
    terminalTab: 'terminal' | 'output' | 'problems';
    chatVisible: boolean;
}
```

### Agent State (`useAgentsStore`)

**Location**: `src/stores/agents-store.ts`

**State**:
```typescript
interface AgentsState {
    agents: AgentConfig[];
    activeAgentId: string | null;
    providerConfigs: Record<string, ProviderConfig>;
}
```

---

*Generated: 2025-12-31*
