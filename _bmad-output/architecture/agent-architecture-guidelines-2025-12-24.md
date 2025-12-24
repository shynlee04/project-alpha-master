# Agent Architecture Guidelines

**Via-gent Browser-Based IDE**  
**Version**: 3.0 (Consolidated)  
**Date**: 2025-12-24  
**Epic Reference**: Epic 25 - AI Foundation Sprint

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Architecture](#2-core-architecture)
3. [Agent System Components](#3-agent-system-components)
4. [TanStack AI SDK Integration](#4-tanstack-ai-sdk-integration)
5. [State Management Architecture](#5-state-management-architecture)
6. [Chat UI Components](#6-chat-ui-components)
7. [Event Bus System](#7-event-bus-system)
8. [Agent Tool Development](#8-agent-tool-development)
9. [Provider Adapter Development](#9-provider-adapter-development)
10. [Security Considerations](#10-security-considerations)
11. [Performance Considerations](#11-performance-considerations)
12. [Testing Guidelines](#12-testing-guidelines)
13. [Best Practices](#13-best-practices)
14. [Common Patterns](#14-common-patterns)
15. [Troubleshooting Guide](#15-troubleshooting-guide)
16. [Future Enhancements](#16-future-enhancements)

---

## 1. Executive Summary

### Purpose

The Via-gent AI agent system provides an intelligent coding assistant integrated directly into the browser-based IDE. It enables developers to interact with AI models through natural language conversation while executing file and terminal operations within a secure WebContainer environment.

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Multi-provider Support** | OpenRouter, Anthropic, OpenAI-compatible APIs |
| **Streaming Responses** | Real-time SSE streaming for responsive interactions |
| **Tool Execution** | File operations (read, write, list) and terminal commands |
| **Approval Workflow** | User confirmation for sensitive operations |
| **Secure Credentials** | Encrypted API key storage using Web Crypto API |
| **Real-time Events** | Event bus for cross-component synchronization |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         UI Layer                                 │
│  ┌───────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │AgentChatPanel │  │ApprovalOverlay│  │ToolCallBadge      │   │
│  └───────┬───────┘  └──────────────┘  └────────────────────┘   │
├──────────┼──────────────────────────────────────────────────────┤
│          ▼             Hook Layer                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              useAgentChatWithTools                         │  │
│  └───────────────────────────┬───────────────────────────────┘  │
├──────────────────────────────┼──────────────────────────────────┤
│                              ▼  Service Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │AgentFactory  │  │CredentialVault│  │ModelRegistry       │   │
│  └──────┬───────┘  └──────────────┘  └─────────────────────┘   │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           ProviderAdapterFactory                          │   │
│  └───────────────────────────┬──────────────────────────────┘   │
├──────────────────────────────┼──────────────────────────────────┤
│                              ▼  Facade Layer                     │
│  ┌───────────────────┐  ┌───────────────────────────────────┐   │
│  │  AgentFileTools   │  │      AgentTerminalTools           │   │
│  └─────────┬─────────┘  └─────────────────┬─────────────────┘   │
├────────────┼──────────────────────────────┼─────────────────────┤
│            ▼                              ▼  Infrastructure      │
│  ┌──────────────────┐            ┌───────────────────────┐      │
│  │LocalFSAdapter    │            │WebContainerManager    │      │
│  │SyncManager       │            │                       │      │
│  └──────────────────┘            └───────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architecture

### Component Diagram

```
                    ┌─────────────────────────┐
                    │     Chat API Route      │
                    │    /api/chat.ts         │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │   TanStack AI SDK       │
                    │  @tanstack/ai-openai    │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
    ┌─────────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  OpenRouter    │  │   OpenAI    │  │  Anthropic  │
    │   Adapter      │  │   Adapter   │  │   Adapter   │
    └────────────────┘  └─────────────┘  └─────────────┘
```

### Data Flow Diagram

```
┌──────────┐   Message   ┌──────────────┐   SSE Stream   ┌──────────────┐
│  User    ├────────────►│AgentChatPanel├───────────────►│  /api/chat   │
│  Input   │             │              │                │              │
└──────────┘             └──────┬───────┘                └──────┬───────┘
                                │                               │
                         ◄──────┼───────────────────────────────┘
                         SSE Response                           │
                                │                               ▼
                    ┌───────────▼────────────┐         ┌──────────────────┐
                    │   Tool Call Request    │         │  AI Provider     │
                    │                        │         │ (OpenRouter etc) │
                    └───────────┬────────────┘         └──────────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  ApprovalOverlay       │
                    │  (User approves/rejects)│
                    └───────────┬────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
    ┌─────────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
    │  AgentFile     │  │ AgentTerminal│  │ Event Bus  │
    │  Tools         │  │   Tools      │  │            │
    └────────┬───────┘  └──────┬──────┘  └─────┬──────┘
             │                 │               │
             ▼                 ▼               ▼
    ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ LocalFS/WC     │ │ WebContainer │ │ UI Updates   │
    │ Sync           │ │ Process      │ │ (FileTree,   │
    │                │ │              │ │  StatusBar)  │
    └────────────────┘ └──────────────┘ └──────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **TanStack AI SDK** | Provider-agnostic, tree-shakeable adapters, built-in streaming |
| **Zustand for State** | Simple API, great React integration, middleware support |
| **Dexie for Persistence** | Type-safe IndexedDB wrapper, better than raw idb |
| **Facade Pattern** | Decouples tools from infrastructure, enables testing |
| **Event Bus (eventemitter3)** | Loose coupling between components, real-time updates |
| **SSE for Streaming** | Native browser support, simpler than WebSockets |

### Design Principles

1. **Separation of Concerns**: UI, business logic, and infrastructure are separated
2. **Facade Pattern**: Tools don't know about LocalFS/WebContainer directly
3. **Event-Driven**: Components communicate via events, not direct calls
4. **Provider Agnostic**: Easy to add new AI providers
5. **Type Safety**: Full TypeScript with Zod validation
6. **Security First**: Encrypted credentials, path validation, sandboxed execution

---

## 3. Agent System Components

### Provider Adapter System

The `ProviderAdapterFactory` creates TanStack AI adapters for different providers.

**Location**: [provider-adapter.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/provider-adapter.ts)

```typescript
import { createOpenaiChat } from '@tanstack/ai-openai';
import type { ProviderConfig, AdapterConfig } from './types';
import { PROVIDERS } from './types';

export class ProviderAdapterFactory {
    private adapters = new Map<string, OpenAIAdapter>();

    createAdapter(providerId: string, config: AdapterConfig): OpenAIAdapter {
        const providerConfig = PROVIDERS[providerId];
        if (!providerConfig) {
            throw new Error(`Unknown provider: ${providerId}`);
        }
        return this.createOpenAICompatibleAdapter(providerConfig, config);
    }

    private createOpenAICompatibleAdapter(
        provider: ProviderConfig,
        config: AdapterConfig
    ): OpenAIAdapter {
        const options: Partial<OpenAIChatConfig> = {};
        
        if (config.baseURL || provider.baseURL) {
            options.baseURL = config.baseURL || provider.baseURL;
        }

        // OpenRouter-specific headers
        if (provider.id === 'openrouter') {
            options.headers = {
                'HTTP-Referer': 'https://via-gent.dev',
                'X-Title': 'Via-Gent IDE',
            };
        }

        return createOpenaiChat(config.apiKey, options);
    }
}

export const providerAdapterFactory = new ProviderAdapterFactory();
```

---

### Model Registry

The `ModelRegistry` fetches and caches available models from provider APIs.

**Location**: [model-registry.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/model-registry.ts)

```typescript
export class ModelRegistry {
    private cache = new Map<string, CacheEntry>();
    
    async getModels(providerId: string, apiKey?: string): Promise<ModelInfo[]> {
        // Check cache first (5 minute TTL)
        const cached = this.cache.get(providerId);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
            return cached.models;
        }

        // Fetch from API or return defaults
        if (!apiKey) {
            return this.getDefaultModels(providerId);
        }

        try {
            const models = await this.fetchModelsFromAPI(providerId, apiKey);
            this.cache.set(providerId, { models, fetchedAt: Date.now() });
            return models;
        } catch (error) {
            return this.getDefaultModels(providerId);
        }
    }

    getFreeModels(): ModelInfo[] {
        return FREE_MODELS; // Pre-configured free models
    }
}

export const modelRegistry = new ModelRegistry();
```

---

### Credential Vault

The `CredentialVault` provides encrypted API key storage using Web Crypto API.

**Location**: [credential-vault.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/credential-vault.ts)

```typescript
export class CredentialVault {
    private masterKey: CryptoKey | null = null;

    async initialize(): Promise<void> {
        if (this.masterKey) return;

        const storedKey = localStorage.getItem(MASTER_KEY_STORAGE);
        if (storedKey) {
            this.masterKey = await crypto.subtle.importKey(
                'jwk', JSON.parse(storedKey),
                { name: 'AES-GCM', length: 256 },
                true, ['encrypt', 'decrypt']
            );
        } else {
            this.masterKey = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true, ['encrypt', 'decrypt']
            );
            const exported = await crypto.subtle.exportKey('jwk', this.masterKey);
            localStorage.setItem(MASTER_KEY_STORAGE, JSON.stringify(exported));
        }
    }

    async storeCredentials(providerId: string, apiKey: string): Promise<void> {
        await this.initialize();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            this.masterKey!,
            new TextEncoder().encode(apiKey)
        );
        await db.credentials.put({
            providerId,
            encrypted: this.arrayBufferToBase64(encrypted),
            iv: this.arrayBufferToBase64(iv.buffer),
            createdAt: new Date(),
        });
    }

    async getCredentials(providerId: string): Promise<string | null> {
        await this.initialize();
        const credential = await db.credentials.get(providerId);
        if (!credential) return null;
        
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(this.base64ToArrayBuffer(credential.iv)) },
            this.masterKey!,
            this.base64ToArrayBuffer(credential.encrypted)
        );
        return new TextDecoder().decode(decrypted);
    }
}

export const credentialVault = new CredentialVault();
```

---

### Agent Tools

Tool definitions for file and terminal operations.

**Location**: [src/lib/agent/tools/](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/tools/)

| Tool | File | Description |
|------|------|-------------|
| `readFile` | [read-file-tool.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/tools/read-file-tool.ts) | Read file contents |
| `writeFile` | [write-file-tool.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/tools/write-file-tool.ts) | Write content to file |
| `listFiles` | [list-files-tool.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/tools/list-files-tool.ts) | List directory contents |
| `executeCommand` | [execute-command-tool.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/tools/execute-command-tool.ts) | Run terminal commands |

```typescript
// Example: read-file-tool.ts
import { z } from 'zod';
import { tool } from '@tanstack/ai';
import type { AgentFileTools } from '../facades';

export const readFileDef = {
    description: 'Read the contents of a file',
    parameters: z.object({
        path: z.string().describe('Relative path to the file'),
    }),
};

export function createReadFileClientTool(getTools: () => AgentFileTools) {
    return tool(readFileDef).client(async ({ path }) => {
        const tools = getTools();
        const content = await tools.readFile(path);
        return content ?? `File not found: ${path}`;
    });
}
```

---

### Agent Facades

Stable contracts for AI agent operations, decoupling tools from infrastructure.

**Location**: [src/lib/agent/facades/](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/)

| File | Purpose |
|------|---------|
| [file-tools.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/file-tools.ts) | Interface definition |
| [file-tools-impl.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/file-tools-impl.ts) | Implementation |
| [terminal-tools.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/terminal-tools.ts) | Terminal interface |
| [terminal-tools-impl.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/terminal-tools-impl.ts) | Terminal implementation |
| [file-lock.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/file-lock.ts) | Concurrency control |

```typescript
// file-tools.ts
export interface AgentFileTools {
    readFile(path: string): Promise<string | null>;
    writeFile(path: string, content: string): Promise<void>;
    listDirectory(path: string, recursive?: boolean): Promise<FileEntry[]>;
    createFile(path: string, content?: string): Promise<void>;
    deleteFile(path: string): Promise<void>;
    searchFiles(query: string, basePath?: string): Promise<FileEntry[]>;
}

// terminal-tools.ts
export interface AgentTerminalTools {
    executeCommand(
        command: string,
        args?: string[],
        options?: CommandOptions
    ): Promise<CommandResult>;
    startShell(projectPath?: string): Promise<ShellSession>;
    killProcess(pid: string): Promise<void>;
    isRunning(pid: string): boolean;
}
```

---

### Event Bus System

Cross-component communication using typed events.

**Location**: [workspace-events.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/events/workspace-events.ts)

```typescript
import EventEmitter from 'eventemitter3';

export interface WorkspaceEvents {
    // File events
    'file:created': [{ path: string; source: 'local' | 'editor' | 'agent' }];
    'file:modified': [{ path: string; source: 'local' | 'editor' | 'agent'; content?: string }];
    'file:deleted': [{ path: string; source: 'local' | 'editor' | 'agent' }];
    'file:read': [{ path: string; source: 'agent' }];
    
    // Agent events
    'agent:tool:started': [{ toolName: string; toolCallId: string; args: Record<string, unknown> }];
    'agent:tool:completed': [{ toolName: string; toolCallId: string; success: boolean; result?: unknown }];
    'agent:tool:failed': [{ toolName: string; toolCallId: string; error: string }];
    'agent:activity:changed': [{ status: 'idle' | 'thinking' | 'executing' | 'error' }];
}

export type WorkspaceEventEmitter = EventEmitter<WorkspaceEvents>;
export function createWorkspaceEventBus(): WorkspaceEventEmitter {
    return new EventEmitter<WorkspaceEvents>();
}
```

---

## 4. TanStack AI SDK Integration

### Proper Usage Patterns

The TanStack AI SDK is provider-agnostic with tree-shakeable adapters:

```typescript
import { createOpenaiChat } from '@tanstack/ai-openai';
import { useChat, tool } from '@tanstack/ai-react';
import { z } from 'zod';

// Create adapter for OpenRouter (OpenAI-compatible)
const adapter = createOpenaiChat(apiKey, {
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
        'HTTP-Referer': 'https://via-gent.dev',
    },
});

// Define tools with Zod schemas
const readFileTool = tool({
    description: 'Read a file',
    parameters: z.object({ path: z.string() }),
}).client(async ({ path }) => {
    return await fileTools.readFile(path);
});
```

---

### SSE Streaming Implementation

**Backend endpoint** ([chat.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/routes/api/chat.ts)):

```typescript
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { stream } from '@tanstack/react-start/server';
import { createOpenaiChat } from '@tanstack/ai-openai';

export const Route = createAPIFileRoute('/api/chat')({
    POST: async ({ request }) => {
        const { messages, modelId, apiKey, providerId } = await request.json();
        
        const adapter = createOpenaiChat(apiKey, {
            baseURL: providerId === 'openrouter' 
                ? 'https://openrouter.ai/api/v1' 
                : undefined,
        });

        return stream(async function* () {
            const result = await adapter.chat({
                model: modelId,
                messages,
                stream: true,
            });

            for await (const chunk of result) {
                yield JSON.stringify(chunk) + '\n';
            }
        });
    },
});
```

---

### Tool Execution Flow

```
1. User sends message
      │
2. useAgentChatWithTools sends to /api/chat
      │
3. AI responds with tool_call in stream
      │
4. Hook pauses, shows ApprovalOverlay
      │
5. User approves → Tool executes via facade
      │
6. Tool result sent back to AI
      │
7. AI continues with next response
```

---

### Error Handling Patterns

```typescript
// In useAgentChatWithTools hook
try {
    const result = await toolFn(toolArgs);
    setToolCalls(prev => prev.map(tc => 
        tc.id === toolCallId 
            ? { ...tc, status: 'success', result }
            : tc
    ));
    eventBus?.emit('agent:tool:completed', { 
        toolName, toolCallId, success: true, result 
    });
} catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setToolCalls(prev => prev.map(tc => 
        tc.id === toolCallId 
            ? { ...tc, status: 'error', error: errorMessage }
            : tc
    ));
    eventBus?.emit('agent:tool:failed', { 
        toolName, toolCallId, error: errorMessage 
    });
}
```

---

### Multi-provider Support

Supported providers are configured in `PROVIDERS`:

```typescript
export const PROVIDERS: Record<string, ProviderConfig> = {
    openrouter: {
        id: 'openrouter',
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultModel: 'mistralai/devstral-2512:free',
        enabled: true,
    },
    openai: {
        id: 'openai',
        name: 'OpenAI',
        defaultModel: 'gpt-5.2',
        enabled: true,
    },
    anthropic: {
        id: 'anthropic',
        name: 'Anthropic',
        baseURL: 'https://api.anthropic.com/v1',
        defaultModel: 'claude-4-5-sonnet',
        enabled: true,
    },
};
```

---

## 5. State Management Architecture

### Zustand Stores (5 Total)

| Store | Location | Purpose | Persistence |
|-------|----------|---------|-------------|
| `useIDEStore` | [ide-store.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/state/ide-store.ts) | Open files, active file, panels | Dexie (IndexedDB) |
| `useStatusBarStore` | [statusbar-store.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/state/statusbar-store.ts) | WC status, sync status, cursor | Ephemeral |
| `useAgentsStore` | [agents-store.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/stores/agents-store.ts) | Agent configurations | localStorage |
| `useAgentSelectionStore` | [agent-selection-store.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/stores/agent-selection-store.ts) | Selected agent | localStorage |

---

### Dexie Database Schema

**Location**: [dexie-db.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/state/dexie-db.ts)

```typescript
class ViaGentDatabase extends Dexie {
    projects!: Table<ProjectRecord, string>;
    ideState!: Table<IDEStateRecord, string>;
    conversations!: Table<ConversationRecord, string>;
    taskContexts!: Table<TaskContextRecord, string>;
    toolExecutions!: Table<ToolExecutionRecord, string>;
    credentials!: Table<CredentialRecord, string>;

    constructor() {
        super('via-gent-db');
        this.version(4).stores({
            projects: 'id, name, createdAt',
            ideState: 'projectId',
            conversations: 'id, projectId, createdAt',
            taskContexts: 'id, projectId, status',
            toolExecutions: 'id, taskId, toolName',
            credentials: 'providerId',
        });
    }
}

export const db = new ViaGentDatabase();
```

---

### State Ownership Boundaries

```
┌───────────────────────────────────────────────────────────────┐
│                      UI Components                             │
│  Read state via selectors, dispatch actions to mutate         │
└───────────────────────────────┬───────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────┐
│                      Zustand Stores                            │
│  - IDE state (open files, panels)                              │
│  - StatusBar state (ephemeral runtime status)                  │
│  - Agent state (configurations, selection)                     │
└───────────────────────────────┬───────────────────────────────┘
                                │
┌───────────────────────────────▼───────────────────────────────┐
│                    Persistence Layer                           │
│  - Dexie: projects, IDE state, conversations, credentials     │
│  - localStorage: agent configurations, selected agent          │
└───────────────────────────────────────────────────────────────┘
```

---

### Persistence Patterns

```typescript
// Zustand store with Dexie persistence
export const useIDEStore = create<IDEStore>()(
    persist(
        (set, get) => ({
            openFiles: [],
            activeFile: null,
            addOpenFile: (path) => set((state) => ({
                openFiles: [...state.openFiles, path],
                activeFile: path,
            })),
            // ... other actions
        }),
        {
            name: 'ide-state',
            storage: createDexieStorage(), // Custom Dexie adapter
        }
    )
);
```

---

## 6. Chat UI Components

### Component Hierarchy

```
AgentChatPanel
├── Header (model selector, clear button)
├── Message List
│   ├── StreamingMessage (AI responses with animation)
│   ├── ToolCallBadge (tool execution status)
│   └── User messages
├── ApprovalOverlay (tool approval modal)
├── Input Area
│   ├── Textarea
│   └── Send button
└── Status indicators
```

---

### Component Responsibilities

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `AgentChatPanel` | [AgentChatPanel.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/components/ide/AgentChatPanel.tsx) | Main container, integrates all components |
| `StreamingMessage` | [StreamingMessage.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/components/ide/StreamingMessage.tsx) | Animated text with Markdown rendering |
| `ToolCallBadge` | [ToolCallBadge.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/components/chat/ToolCallBadge.tsx) | Tool status with expandable details |
| `ApprovalOverlay` | [ApprovalOverlay.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/components/chat/ApprovalOverlay.tsx) | Tool execution approval modal |
| `CodeBlock` | [CodeBlock.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/components/chat/CodeBlock.tsx) | Syntax-highlighted code with actions |
| `DiffPreview` | [DiffPreview.tsx](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/components/chat/DiffPreview.tsx) | Side-by-side diff view |

---

### Integration Patterns

```typescript
function AgentChatPanel({ projectId }: Props) {
    const { fileTools, terminalTools } = useWorkspace();
    const eventBus = useWorkspaceEventBus();
    
    const {
        messages,
        sendMessage,
        isStreaming,
        toolCalls,
        pendingApprovals,
        approveToolCall,
        rejectToolCall,
    } = useAgentChatWithTools({
        fileTools,
        terminalTools,
        eventBus,
    });

    return (
        <div className="flex flex-col h-full">
            <MessageList messages={messages} toolCalls={toolCalls} />
            {pendingApprovals.map(approval => (
                <ApprovalOverlay
                    key={approval.approvalId}
                    {...approval}
                    onApprove={() => approveToolCall(approval.toolCallId)}
                    onReject={() => rejectToolCall(approval.toolCallId)}
                />
            ))}
            <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
    );
}
```

---

### State Propagation

```
useAgentChatWithTools (hook)
    │
    ├─► messages ─────────► MessageList
    │
    ├─► toolCalls ────────► ToolCallBadge
    │
    ├─► pendingApprovals ─► ApprovalOverlay
    │
    ├─► approveToolCall ──► Button onClick
    │
    └─► eventBus.emit() ──► StatusBar, FileTree (subscribers)
```

---

## 7. Event Bus System

### Event Types and Payloads

**File Events**:
```typescript
'file:created': [{ path: string; source: 'local' | 'editor' | 'agent' }]
'file:modified': [{ path: string; source: 'local' | 'editor' | 'agent'; content?: string }]
'file:deleted': [{ path: string; source: 'local' | 'editor' | 'agent' }]
'file:read': [{ path: string; source: 'agent' }]
```

**Agent Events**:
```typescript
'agent:tool:started': [{ toolName: string; toolCallId: string; args: Record<string, unknown> }]
'agent:tool:completed': [{ toolName: string; toolCallId: string; success: boolean; result?: unknown }]
'agent:tool:failed': [{ toolName: string; toolCallId: string; error: string }]
'agent:activity:changed': [{ status: 'idle' | 'thinking' | 'executing' | 'error' }]
```

**Process Events**:
```typescript
'process:started': [{ pid: string; command: string; args: string[] }]
'process:output': [{ pid: string; data: string; type: 'stdout' | 'stderr' }]
'process:exited': [{ pid: string; exitCode: number }]
'agent:command:executed': [{ command: string; workingDir?: string; output?: string; exitCode?: number }]
```

---

### Event Subscription Patterns

```typescript
// In a React component
useEffect(() => {
    const eventBus = workspaceContext.eventBus;
    
    const handleToolStarted = (data: { toolName: string; toolCallId: string }) => {
        console.log(`Tool ${data.toolName} started`);
    };
    
    eventBus.on('agent:tool:started', handleToolStarted);
    
    return () => {
        eventBus.off('agent:tool:started', handleToolStarted);
    };
}, [workspaceContext.eventBus]);
```

---

### Event Emission Patterns

```typescript
// In AgentFileToolsImpl
async writeFile(path: string, content: string): Promise<void> {
    await this.fileLock.acquire(path);
    
    try {
        await this.fsAdapter.writeFile(path, content);
        
        this.eventBus.emit('file:modified', {
            path,
            source: 'agent',
            content,
        });
    } finally {
        await this.fileLock.release(path);
    }
}
```

---

### Real-time Update Flow

```
1. Agent writes file
      │
2. AgentFileToolsImpl.writeFile()
      │
3. eventBus.emit('file:modified', { path, source: 'agent' })
      │
      ├─► FileTree component updates icon
      │
      ├─► StatusBar shows "File saved"
      │
      └─► Monaco editor reloads content (if open)
```

---

## 8. Agent Tool Development

### Tool Creation Checklist

- [ ] Define Zod schema for parameters
- [ ] Create tool definition with description
- [ ] Implement server-side tool (optional)
- [ ] Implement client-side tool with `.client()`
- [ ] Add error handling
- [ ] Emit appropriate events
- [ ] Add unit tests
- [ ] Register in tool exports

---

### Tool Schema Definition (with Zod)

```typescript
import { z } from 'zod';

export const writeFileDef = {
    description: 'Write content to a file (creates if not exists)',
    parameters: z.object({
        path: z.string().describe('Relative path from project root'),
        content: z.string().describe('Content to write'),
    }),
};

export const writeFileToolConfig = {
    requiresApproval: true,
    riskLevel: 'medium' as const,
};
```

---

### Tool Handler Implementation

```typescript
import { tool } from '@tanstack/ai';
import type { AgentFileTools } from '../facades';

export function createWriteFileClientTool(
    getTools: () => AgentFileTools
) {
    return tool(writeFileDef)
        .config(writeFileToolConfig)
        .client(async ({ path, content }) => {
            const tools = getTools();
            
            // Validate path
            validatePath(path);
            
            // Execute operation
            await tools.writeFile(path, content);
            
            return `Successfully wrote ${content.length} characters to ${path}`;
        });
}
```

---

### Tool Registration

```typescript
// In src/lib/agent/tools/index.ts
export function getClientTools(
    fileTools: () => AgentFileTools,
    terminalTools: () => AgentTerminalTools
) {
    const ft = createFileClientTools(fileTools);
    const tt = createTerminalClientTools(terminalTools);

    return [
        ft.readFile,
        ft.writeFile,
        ft.listFiles,
        tt.executeCommand,
    ];
}
```

---

### Tool Testing Patterns

```typescript
describe('writeFile tool', () => {
    it('should write content to file', async () => {
        const mockFileTools: AgentFileTools = {
            writeFile: vi.fn().mockResolvedValue(undefined),
            // ... other mocks
        };
        
        const tool = createWriteFileClientTool(() => mockFileTools);
        const result = await tool.execute({ 
            path: 'test.txt', 
            content: 'hello' 
        });
        
        expect(mockFileTools.writeFile).toHaveBeenCalledWith('test.txt', 'hello');
        expect(result).toContain('Successfully wrote');
    });

    it('should reject path traversal', async () => {
        const tool = createWriteFileClientTool(() => mockFileTools);
        
        await expect(tool.execute({ 
            path: '../outside.txt', 
            content: 'evil' 
        })).rejects.toThrow('Path traversal');
    });
});
```

---

## 9. Provider Adapter Development

### Adapter Interface Definition

```typescript
// All adapters must be OpenAI-compatible
type OpenAIAdapter = ReturnType<typeof createOpenaiChat>;

interface AdapterConfig {
    apiKey: string;
    baseURL?: string;
}

interface ProviderConfig {
    id: string;
    name: string;
    baseURL?: string;
    defaultModel: string;
    enabled: boolean;
}
```

---

### Adapter Implementation Patterns

```typescript
// Adding a new provider (e.g., Groq)
export const PROVIDERS: Record<string, ProviderConfig> = {
    // ... existing providers
    groq: {
        id: 'groq',
        name: 'Groq',
        baseURL: 'https://api.groq.com/openai/v1',
        defaultModel: 'llama-3.1-70b-versatile',
        enabled: true,
    },
};

// In ProviderAdapterFactory
private createOpenAICompatibleAdapter(
    provider: ProviderConfig,
    config: AdapterConfig
): OpenAIAdapter {
    const options: Partial<OpenAIChatConfig> = {};
    
    if (provider.baseURL) {
        options.baseURL = provider.baseURL;
    }

    // Provider-specific headers
    if (provider.id === 'groq') {
        options.headers = {
            'X-Custom-Header': 'value',
        };
    }

    return createOpenaiChat(config.apiKey, options);
}
```

---

### Adapter Registration

Providers are automatically available once added to `PROVIDERS` object:

```typescript
// Get enabled providers
const providers = providerAdapterFactory.getEnabledProviders();

// Create adapter for a provider
const adapter = providerAdapterFactory.createAdapter('groq', { apiKey });

// Test connection
const result = await providerAdapterFactory.testConnection('groq', apiKey);
```

---

### Adapter Testing Patterns

```typescript
describe('ProviderAdapterFactory', () => {
    it('should create OpenRouter adapter with correct headers', () => {
        const adapter = providerAdapterFactory.createAdapter('openrouter', {
            apiKey: 'test-key',
        });
        
        expect(adapter).toBeDefined();
    });

    it('should test connection successfully', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
        });
        global.fetch = mockFetch;

        const result = await providerAdapterFactory.testConnection('openrouter', 'valid-key');
        
        expect(result.success).toBe(true);
        expect(result.latencyMs).toBeGreaterThan(0);
    });
});
```

---

## 10. Security Considerations

### Credential Storage (IndexedDB)

- API keys are **encrypted** using AES-GCM (256-bit)
- Master key stored in localStorage (JWK format)
- Each credential has unique IV
- Credentials stored in Dexie `credentials` table

```
User enters API key
    │
    ▼
Generate random IV (12 bytes)
    │
    ▼
Encrypt with AES-GCM using master key
    │
    ▼
Store encrypted blob + IV in IndexedDB
```

---

### API Key Management

- Keys are **never** sent to backend servers
- Keys retrieved and decrypted only when needed
- Keys passed directly to AI provider APIs
- Clear keys from memory after use

---

### Permission Handling

- File system access via File System Access API
- User must grant permission per session
- Permission state tracked in project metadata
- Graceful degradation for denied permissions

---

### File System Access Control

```typescript
// Path validation prevents traversal attacks
export function validatePath(path: string): void {
    if (path.includes('..')) {
        throw new PathValidationError('Path traversal (..) not allowed');
    }
    if (path.startsWith('/') || /^[a-zA-Z]:/.test(path)) {
        throw new PathValidationError('Absolute paths not allowed');
    }
}
```

---

## 11. Performance Considerations

### Streaming Optimization

- SSE streams parsed incrementally
- `requestAnimationFrame` for smooth character animation
- Backpressure handling for fast streams
- Cancel ongoing streams on new requests

---

### File Operation Batching

- Multiple file reads combined into single batch
- Directory listing cached for duration of sync
- File watch debouncing (100ms) prevents excessive events

---

### State Update Debouncing

```typescript
// Debounced state updates prevent re-render storms
const debouncedSetMessages = useMemo(
    () => debounce((messages) => setMessages(messages), 50),
    []
);
```

---

### Memory Management

- Tool results truncated for large outputs
- Conversation history limited to recent messages
- Cached adapters cleared on provider change
- Event listeners properly cleaned up

---

## 12. Testing Guidelines

### Unit Testing Patterns

```typescript
describe('readFile tool', () => {
    const mockFileTools = {
        readFile: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return file content', async () => {
        mockFileTools.readFile.mockResolvedValue('file content');
        
        const tool = createReadFileClientTool(() => mockFileTools);
        const result = await tool.execute({ path: 'test.txt' });
        
        expect(result).toBe('file content');
    });
});
```

---

### Integration Testing Patterns

```typescript
describe('useAgentChatWithTools', () => {
    it('should handle tool approval flow', async () => {
        const { result } = renderHook(() => 
            useAgentChatWithTools({
                fileTools: mockFileTools,
                terminalTools: mockTerminalTools,
                eventBus: mockEventBus,
            })
        );

        // Simulate tool call from AI
        act(() => {
            result.current.handleToolCall({
                id: 'tc-1',
                name: 'writeFile',
                args: { path: 'test.txt', content: 'hello' },
            });
        });

        // Verify pending approval
        expect(result.current.pendingApprovals).toHaveLength(1);
        
        // Approve
        act(() => {
            result.current.approveToolCall('tc-1');
        });

        await waitFor(() => {
            expect(mockFileTools.writeFile).toHaveBeenCalled();
        });
    });
});
```

---

### E2E Testing Patterns

```typescript
describe('Agent Workflow E2E', () => {
    it('should complete file creation task', async ({ page }) => {
        await page.goto('/');
        await setupProject(page);
        await configureAgent(page);
        
        await page.fill('[data-testid="chat-input"]', 
            'Create a file called hello.txt with "Hello World"');
        await page.click('[data-testid="send-button"]');
        
        await expect(page.locator('[data-testid="approval-overlay"]')).toBeVisible();
        
        await page.click('[data-testid="approve-button"]');
        
        await expect(page.locator('[data-testid="file-tree"]'))
            .toContainText('hello.txt');
    });
});
```

---

### Mocking Strategies

```typescript
// Mock file tools
const createMockFileTools = (): AgentFileTools => ({
    readFile: vi.fn().mockResolvedValue('mock content'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    listDirectory: vi.fn().mockResolvedValue([]),
    createFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    searchFiles: vi.fn().mockResolvedValue([]),
});

// Mock event bus
const createMockEventBus = (): WorkspaceEventEmitter => {
    const emitter = new EventEmitter<WorkspaceEvents>();
    vi.spyOn(emitter, 'emit');
    vi.spyOn(emitter, 'on');
    return emitter;
};
```

---

## 13. Best Practices

### Code Organization

```
src/lib/agent/
├── facades/           # Stable interfaces
│   ├── file-tools.ts
│   ├── file-tools-impl.ts
│   └── terminal-tools.ts
├── hooks/             # React hooks
│   └── use-agent-chat-with-tools.ts
├── providers/         # AI provider adapters
│   ├── provider-adapter.ts
│   ├── credential-vault.ts
│   └── model-registry.ts
├── tools/             # Tool definitions
│   ├── read-file-tool.ts
│   ├── write-file-tool.ts
│   └── execute-command-tool.ts
└── __tests__/         # Tests
```

---

### Error Handling

```typescript
// Always wrap tool execution in try-catch
async function executeToolSafely(tool: Tool, args: unknown) {
    try {
        const result = await tool.execute(args);
        return { success: true, result };
    } catch (error) {
        const message = error instanceof Error 
            ? error.message 
            : 'Unknown error';
        console.error(`Tool execution failed: ${message}`);
        return { success: false, error: message };
    }
}
```

---

### Logging and Debugging

```typescript
// Use structured logging
const log = {
    tool: (action: string, data: object) => 
        console.log(`[AGENT:TOOL] ${action}`, data),
    event: (event: string, data: object) => 
        console.log(`[AGENT:EVENT] ${event}`, data),
    error: (context: string, error: unknown) => 
        console.error(`[AGENT:ERROR] ${context}`, error),
};
```

---

### Documentation Standards

- JSDoc comments on all public APIs
- Epic/Story tags for traceability
- Example usage in comments
- Type exports for consumers

```typescript
/**
 * Read a file's content
 * @param path - Relative path from project root
 * @returns File content or null if not found
 * @example
 * const content = await fileTools.readFile('src/index.ts');
 * @epic 12 - Agent Tool Interface Layer
 * @story 12-1 - Create AgentFileTools Facade
 */
readFile(path: string): Promise<string | null>;
```

---

## 14. Common Patterns

### Tool Execution Pattern

```typescript
async function executeWithApproval(
    toolCall: ToolCall,
    options: ExecutionOptions
): Promise<ExecutionResult> {
    // 1. Check if approval needed
    if (toolCall.requiresApproval && !options.autoApprove) {
        const approved = await requestApproval(toolCall);
        if (!approved) {
            return { status: 'rejected' };
        }
    }

    // 2. Emit started event
    eventBus.emit('agent:tool:started', {
        toolName: toolCall.name,
        toolCallId: toolCall.id,
        args: toolCall.args,
    });

    // 3. Execute tool
    try {
        const result = await tool.execute(toolCall.args);
        eventBus.emit('agent:tool:completed', {
            toolName: toolCall.name,
            toolCallId: toolCall.id,
            success: true,
            result,
        });
        return { status: 'success', result };
    } catch (error) {
        eventBus.emit('agent:tool:failed', {
            toolName: toolCall.name,
            toolCallId: toolCall.id,
            error: error.message,
        });
        return { status: 'error', error };
    }
}
```

---

### Approval Workflow Pattern

```typescript
const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);

function handleToolCall(toolCall: ToolCall) {
    if (toolNeedsApproval(toolCall)) {
        setPendingApprovals(prev => [...prev, {
            approvalId: generateId(),
            toolCallId: toolCall.id,
            toolName: toolCall.name,
            toolArgs: toolCall.args,
            riskLevel: getToolRiskLevel(toolCall.name),
        }]);
    } else {
        executeTool(toolCall);
    }
}

function approveToolCall(toolCallId: string) {
    const approval = pendingApprovals.find(a => a.toolCallId === toolCallId);
    if (approval) {
        setPendingApprovals(prev => 
            prev.filter(a => a.toolCallId !== toolCallId)
        );
        executeTool(approval);
    }
}
```

---

### State Synchronization Pattern

```typescript
// Event-driven sync between components
useEffect(() => {
    const handleFileModified = (data: { path: string; source: string }) => {
        if (data.source === 'agent') {
            refreshPath(data.path);
            setModifiedByAgent(data.path);
        }
    };
    
    eventBus.on('file:modified', handleFileModified);
    return () => eventBus.off('file:modified', handleFileModified);
}, [eventBus]);
```

---

### Error Recovery Pattern

```typescript
async function executeWithRetry(
    operation: () => Promise<unknown>,
    maxRetries = 3,
    backoff = 1000
): Promise<unknown> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            if (!isRetryable(lastError)) {
                throw lastError;
            }
            
            await sleep(backoff * Math.pow(2, attempt));
        }
    }
    
    throw lastError;
}

function isRetryable(error: Error): boolean {
    return error.message.includes('timeout') ||
           error.message.includes('rate limit') ||
           error.message.includes('temporary');
}
```

---

## 15. Troubleshooting Guide

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Provider not found" | Invalid provider ID | Check `PROVIDERS` config |
| "Vault not initialized" | Crypto API error | Check browser compatibility |
| "Path traversal not allowed" | `..` in path | Use relative paths only |
| "Tool execution timeout" | Long-running command | Increase timeout or split |
| "SSE stream error" | Network interruption | Implement retry logic |

---

### Debugging Techniques

```typescript
// Enable verbose logging
localStorage.setItem('DEBUG_AGENT', 'true');

// In agent code
const debug = localStorage.getItem('DEBUG_AGENT') === 'true';
if (debug) {
    console.log('[AGENT:DEBUG]', { 
        phase: 'tool_execution', 
        tool: toolName, 
        args 
    });
}
```

---

### Performance Profiling

```typescript
// Measure tool execution time
async function profiledExecute(tool: Tool, args: unknown) {
    const start = performance.now();
    const result = await tool.execute(args);
    const duration = performance.now() - start;
    
    if (duration > 1000) {
        console.warn(`Slow tool: ${tool.name} took ${duration}ms`);
    }
    
    return result;
}
```

---

### Error Analysis

```typescript
// Centralized error handler
function handleAgentError(error: unknown, context: string) {
    const isKnownError = error instanceof PathValidationError ||
                         error instanceof TerminalToolsError;
    
    if (isKnownError) {
        toast.error(error.message);
    } else {
        console.error('Unexpected agent error:', { context, error });
        Sentry.captureException(error, { extra: { context } });
        toast.error('An unexpected error occurred');
    }
}
```

---

## 16. Future Enhancements

### Planned Features

| Feature | Epic | Description |
|---------|------|-------------|
| Multi-Agent Support | Epic 30 | Specialized agents for different tasks |
| Custom Modes | Epic 31 | User-defined agent modes (like Roo Code) |
| MCP Integration | Epic 32 | Model Context Protocol servers |
| Context Management | Epic 33 | Intelligent context window management |

---

### Extension Points

1. **New Providers**: Add to `PROVIDERS` config in `types.ts`
2. **New Tools**: Create in `tools/` directory, export from `index.ts`
3. **Custom Events**: Add to `WorkspaceEvents` interface
4. **State Stores**: Create new Zustand store in `stores/`

---

### Integration Opportunities

- **GitHub Integration**: File commits, PR creation
- **CI/CD Integration**: Run tests, deploy previews
- **RAG Integration**: Codebase indexing for context
- **Team Collaboration**: Shared agent configurations

---

## References

### Research Documents

- [Research Synthesis: AI Agent Patterns](/_bmad-output/research-synthesis-ai-agent-patterns-2025-12-24.md)
- [State Management Audit Report](/_bmad-output/state-management-audit-2025-12-24.md)
- [Chat UI Components Usage Guide](/docs/2025-12-24/chat-ui-components-usage.md)
- [User Journey Definition](/_bmad-output/consolidation/user-journey-definition.md)
- [Roo Code Custom Instructions](/_bmad-output/proposal/roo-code-custom-instruction.md)
- [Roo Code Modes Reference](/_bmad-output/proposal/roo-code-modes-agents.md)

### Key Source Files

| Component | Location |
|-----------|----------|
| ProviderAdapterFactory | [provider-adapter.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/provider-adapter.ts) |
| CredentialVault | [credential-vault.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/credential-vault.ts) |
| ModelRegistry | [model-registry.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/providers/model-registry.ts) |
| AgentFileTools Interface | [file-tools.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/file-tools.ts) |
| AgentTerminalTools Interface | [terminal-tools.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/facades/terminal-tools.ts) |
| WorkspaceEvents | [workspace-events.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/events/workspace-events.ts) |
| Agent Tools Index | [tools/index.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/agent/tools/index.ts) |
| Dexie Database | [dexie-db.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/state/dexie-db.ts) |
| IDE Store | [ide-store.ts](file:///Users/apple/Documents/coding-projects/project-alpha-master/src/lib/state/ide-store.ts) |

---

**Document Created**: 2025-12-24  
**Version**: 3.0 (Consolidated from v1 + v2)  
**Status**: Complete
