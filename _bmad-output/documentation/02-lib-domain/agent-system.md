# Agent System Documentation

## Overview

The Agent System (`src/lib/agent/`) is the core AI infrastructure of the Via-gent IDE, providing LLM integration, tool execution, and agent lifecycle management. It integrates with TanStack AI for tool definitions and execution, supports multiple LLM providers, and enforces workspace-aware permissions.

## Architecture

```
src/lib/agent/
├── agent-io.ts              # Agent I/O interfaces
├── factory.ts               # TanStack AI tool factory
├── system-prompt.ts         # System prompt templates
├── prompt-composer.ts       # Prompt composition logic
├── tool-permission-manager.ts
├── workspace-execution-context.ts
├── workspace-permission-manager.ts
├── workspace-tool-filter.ts
│
├── deep-think/              # Reasoning capabilities
├── facades/                 # Tool abstraction layer
├── hooks/                   # React hooks
├── memory/                  # Conversation memory
├── multimodal/              # Multimodal support
├── preferences/             # User preferences
├── providers/               # LLM provider adapters
├── routes/                  # API routes
├── suggestions/             # AI suggestions
├── tool-permission/         # Permission system
└── tools/                   # TanStack AI tools
```

## Core Components

### 1. Agent Tool Factory (`factory.ts`)

The agent factory creates TanStack AI-compatible client tools for file operations, terminal commands, and knowledge synthesis.

```typescript
import { createAgentClientTools } from '@/lib/agent/factory';

const agentTools = createAgentClientTools({
    getFileTools: () => fileToolsFacade,
    getTerminalTools: () => terminalToolsFacade,
    getKnowledgeTools: () => knowledgeToolsFacade,
    getEventBus: () => eventBus,
});

// Returns: { fileTools, terminalTools, knowledgeTools, all, getClientTools() }
```

**Key Exports:**
- `createAgentClientTools()` - Creates all client tools
- `createClientFileTools()` - File tools only
- `createClientTerminalTools()` - Terminal tools only
- `createClientKnowledgeTools()` - Knowledge tools only

### 2. Tool Definitions (`tools/index.ts`)

TanStack AI tool definitions using the `toolDefinition` pattern:

```typescript
import { readFileDef, writeFileDef, executeCommandDef } from '@/lib/agent/tools';

// Each tool has:
// - .describe: Metadata (name, description, parameters)
// - .parameters: Zod schema for input validation
// - .client: Client-side handler implementation
```

**Available Tools:**
| Tool | Purpose | Input Schema |
|------|---------|--------------|
| `read_file` | Read file contents | `{ path: string }` |
| `write_file` | Create/overwrite files | `{ path: string, content: string }` |
| `list_files` | List directory contents | `{ path: string, recursive?: boolean }` |
| `execute_command` | Run shell commands | `{ command: string, args?: string[], timeout?: number }` |
| `synthesize_knowledge` | Synthesize knowledge | Complex schema |
| `process_pdf` | Process PDF documents | `{ file: File, options?: PDFOptions }` |
| `process_image` | Process images | `{ file: File, options?: ImageOptions }` |
| `process_url` | Fetch and process URLs | `{ url: string, options?: URLOptions }` |

### 3. LLM Provider System (`providers/`)

#### Credential Vault (`providers/credential-vault.ts`)

Secure API key storage using AES-256-GCM encryption:

```typescript
import { credentialVault } from '@/lib/agent/providers/credential-vault';

await credentialVault.initialize();
await credentialVault.storeCredentials('anthropic', 'sk-ant-api03-...');
const apiKey = await credentialVault.getCredentials('anthropic');
```

**Security Features:**
- AES-256-GCM encryption
- PBKDF2-SHA256 key derivation (100,000 iterations)
- Salt + IV + authentication tag
- Obfuscated localStorage keys
- Graceful vault recovery

#### Provider Adapter (`providers/provider-adapter.ts`)

Base interface for LLM providers:

```typescript
interface ProviderAdapter {
    providerId: string;
    providerName: string;
    listModels(): Promise<ModelInfo[]>;
    createChatCompletion(request: ChatRequest): Promise<ChatResponse>;
    streamChatCompletion(request: ChatRequest): AsyncIterable<ChatChunk>;
    dispose(): void;
}
```

**Implementations:**
- `AnthropicAdapter` - Anthropic Claude models
- `OpenRouterAdapter` - OpenRouter gateway (planned)

#### Model Registry (`providers/model-registry.ts`)

Central catalog of available models:

```typescript
import { modelRegistry } from '@/lib/agent/providers';

const models = modelRegistry.getModels('anthropic');
const defaultModel = modelRegistry.getDefaultModel('anthropic');
```

### 4. Tool Facades (`facades/`)

Abstraction layer providing consistent interfaces over WebContainer and local FS:

#### File Tools (`facades/file-tools.ts`)

```typescript
interface AgentFileTools {
    readFile(path: string): Promise<string | null>;
    writeFile(path: string, content: string): Promise<void>;
    listDirectory(path: string, recursive?: boolean): Promise<DirectoryEntry[]>;
    deleteFile(path: string): Promise<void>;
    rename(oldPath: string, newPath: string): Promise<void>;
}

const fileTools = createFileToolsFacade(webContainerInstance);
```

#### Terminal Tools (`facades/terminal-tools.ts`)

```typescript
interface AgentTerminalTools {
    executeCommand(
        command: string,
        args?: string[],
        options?: SpawnOptions
    ): Promise<CommandResult>;
}
```

#### Knowledge Tools (`facades/knowledge-tools.ts`)

```typescript
interface AgentKnowledgeTools {
    synthesize(input: SynthesizeInput): Promise<SynthesisResult>;
    processPDF(file: File, base64Content: string, options?: PDFOptions): Promise<PDFResult>;
    processImage(file: File, base64Content: string, options?: ImageOptions): Promise<ImageResult>;
    processURL(url: string, htmlContent: string, options?: URLOptions): Promise<URLResult>;
}
```

### 5. Permission System (`tool-permission/`)

Workspace-aware tool permissions:

```typescript
import { ToolPermissionManager } from '@/lib/agent/tool-permission-manager';

const permissionManager = ToolPermissionManager.getInstance();
const canExecute = permissionManager.checkPermission('read_file');
```

**Trust Levels:**
- `auto` - Execute without approval
- `prompt` - Request user approval
- `block` - Never execute

**Workspace Permissions (`workspace-permission-manager.ts`):**

```typescript
const workspaceManager = new WorkspacePermissionManager(permissionManager);
const check = workspaceManager.checkWorkspacePermission(
    'read_file',
    agent.tools,
    agent.workspaceBindings,
    'ide'  // Current workspace
);
```

### 6. Conversation Memory (`memory/`)

```typescript
import { ConversationMemory } from '@/lib/agent/memory/conversation-memory';

const memory = new ConversationMemory({
    maxMessages: 100,
    maxTokens: 8000,
    compressionStrategy: 'summarize'
});

const context = memory.getContext(agentId);
memory.addMessage(agentId, message);
```

### 7. Deep Thinking (`deep-think/`)

Enhanced reasoning capabilities:

```typescript
import { useDeepThink } from '@/lib/agent/deep-think/deep-think-hook';

const { think, isThinking, result } = useDeepThink({
    modelId: 'claude-sonnet-4-20250501',
    maxIterations: 3
});

const analysis = await think(problem, context);
```

## Key Exports

### Main Module (`src/lib/agent/index.ts`)

```typescript
// Factory and tools
export { createAgentClientTools, createClientFileTools } from './factory';
export { readFileDef, writeFileDef, executeCommandDef } from './tools';

// Providers
export { credentialVault } from './providers/credential-vault';
export { modelRegistry } from './providers/model-registry';
export { ProviderAdapter } from './providers/provider-adapter';

// Facades
export { createFileToolsFacade } from './facades/file-tools';
export { createTerminalToolsFacade } from './facades/terminal-tools';
export { createKnowledgeToolsFacade } from './facades/knowledge-tools';

// Permissions
export { ToolPermissionManager } from './tool-permission-manager';
export { WorkspacePermissionManager } from './workspace-permission-manager';

// Hooks
export { useAgentChatWithTools } from './hooks/use-agent-chat-with-tools';
export { usePromptEnhancer } from './hooks/use-prompt-enhancer';
```

## Integration Points

### With Chat UI

```typescript
import { useAgentChatWithTools } from '@/lib/agent/hooks/use-agent-chat-with-tools';

function ChatPanel() {
    const { messages, sendMessage, isLoading } = useAgentChatWithTools({
        agentId: selectedAgent.id,
        tools: agentTools,
    });
}
```

### With File System

```typescript
import { createFileToolsFacade } from '@/lib/agent/facades/file-tools';
import { getInstance } from '@/lib/webcontainer';

const wc = getInstance();
const fileTools = createFileToolsFacade(wc);
```

### With Events

```typescript
import { createWorkspaceEventBus } from '@/lib/events';

const eventBus = createWorkspaceEventBus();
eventBus.emit('agent:tool_called', { agentId, toolName, input });
```

## Security Considerations

1. **Credential Storage**: AES-256-GCM encrypted, PBKDF2 key derivation
2. **Command Sanitization**: Dangerous commands blocked, argument escaping
3. **Path Traversal**: All file paths validated before access
4. **Workspace Permissions**: Tools filtered by workspace type
5. **Tool Trust Levels**: User-controlled execution policies

## Known Issues

1. **Test File TypeScript Errors**: Some test files have type issues (excluded from production checks)
2. **Provider Adapter Missing**: OpenRouter adapter not yet implemented

## Developer Notes

- Always use the facade layer for tool operations (not direct WebContainer access)
- Tools are workspace-aware - check `workspace-execution-context.ts` for current context
- Credentials are persisted across sessions using encrypted storage
- Use `ToolPermissionManager.getInstance()` for singleton access
