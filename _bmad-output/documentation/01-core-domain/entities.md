# Entities Documentation

This document describes the core domain entities in the `src/core/entities/` directory.

## Table of Contents

1. [Agent Entity](#agent-entity)
2. [LLMProvider Entity](#llmprovider-entity)
3. [Conversation Entity](#conversation-entity)
4. [Tool Entity](#tool-entity)

---

## Agent Entity

**File:** `src/core/entities/Agent.ts`

### Purpose

The `Agent` entity represents AI agents in the system. It is a core business entity that defines agent configuration, capabilities, and metrics.

### Key Exports

```typescript
export interface Agent
export interface AgentToolBinding
export interface WorkspaceBinding
export type AgentCreateParams
export type AgentUpdateParams
```

### Interface Definition

```typescript
export interface Agent {
    // Core identity
    id: string;
    name: string;
    description: string;

    // Provider + Model reference (CRITICAL LINKAGE)
    providerId: string;                // Foreign key to LLMProvider
    modelId: string;                   // Foreign key to ProviderModel

    // LLM Parameters
    systemPrompt: string;
    temperature: number;               // 0.0-2.0
    maxTokens: number;
    topP: number;                      // 0.0-1.0
    topK?: number;                     // Optional (for Gemini/local)
    frequencyPenalty?: number;
    presencePenalty?: number;

    // Tool Configuration (CONDITIONAL PER WORKSPACE)
    tools: AgentToolBinding[];

    // Workspace Bindings (WHERE THIS AGENT IS AVAILABLE)
    workspaceBindings: WorkspaceBinding[];

    // Status
    status: 'online' | 'offline' | 'busy' | 'error';

    // Metrics
    tasksCompleted: number;
    successRate: number;
    tokensUsed: number;
    lastActive: string;                // ISO 8601 date string
    createdAt: string;                 // ISO 8601 date string
}
```

### Business Rules

- Agent must have `providerId` and `modelId` (foreign keys to LLMProvider and ProviderModel)
- Status transitions: `offline` → `online` → `busy` → `error`
- Tools are optional but must have permissions if present
- Workspace bindings define where agent is available

### Dependencies

- **Internal:** None
- **External:** None (pure TypeScript interfaces)

### Usage Example

```typescript
import { Agent, AgentCreateParams, WorkspaceBinding } from '@/core/entities/Agent';

const agent: Agent = {
    id: 'agent-001',
    name: 'Code Assistant',
    description: 'Helps with coding tasks',
    providerId: 'anthropic',
    modelId: 'claude-sonnet-4-20250514',
    systemPrompt: 'You are a helpful coding assistant.',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    tools: [{
        toolId: 'read_file',
        toolName: 'Read File',
        isEnabled: true,
        workspacePermissions: { ide: true, knowledge: false, study: false, notes: false }
    }],
    workspaceBindings: [{
        workspaceType: 'ide',
        isAvailable: true,
        uiVariant: 'full',
        isDefault: true
    }],
    status: 'online',
    tasksCompleted: 42,
    successRate: 0.95,
    tokensUsed: 125000,
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString()
};
```

---

## LLMProvider Entity

**File:** `src/core/entities/Provider.ts`

### Purpose

The `LLMProvider` entity represents AI service providers (e.g., OpenAI, Anthropic, Google). It is the single source of truth for provider configuration.

### Key Exports

```typescript
export interface LLMProvider
export interface ProviderModel
export interface ProviderCapabilities
export type Modality
```

### Interface Definition

```typescript
export interface LLMProvider {
    // Identity
    id: string;
    name: string;
    providerType: 'openai' | 'anthropic' | 'google' | 'openrouter' | 'custom';

    // Configuration
    baseUrl: string;
    isHardcoded: boolean;  // TRUE for built-in providers (readonly URL)
    hasApiKey: boolean;    // TRUE if key stored in credential vault
    isEnabled: boolean;

    // Models
    models: ProviderModel[];
    lastModelFetchAt?: Date;

    // Capabilities
    capabilities: ProviderCapabilities;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

export interface ProviderModel {
    id: string;
    name: string;
    providerId: string;          // Foreign key to LLMProvider

    // Token limits
    contextWindow: number;
    maxOutputTokens: number;

    // Modalities
    inputModalities: Modality[];
    outputModalities: Modality[];

    // Capabilities
    isEnabled: boolean;

    // Optional pricing info
    pricing?: {
        promptPer1M: number;
        completionPer1M: number;
    };
}

export interface ProviderCapabilities {
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
    embeddings: boolean;
}

export type Modality = 'text' | 'image' | 'audio' | 'video' | 'code';
```

### Business Rules

- API key stored in encrypted `credential-vault.ts` (NOT in this entity)
- `isHardcoded=TRUE` for built-in providers (readonly URL)
- `hasApiKey` indicates if key exists in credential vault

### Dependencies

- **Internal:** None
- **External:** None (pure TypeScript interfaces)

### Usage Example

```typescript
import { LLMProvider, ProviderModel, Modality } from '@/core/entities/Provider';

const provider: LLMProvider = {
    id: 'anthropic',
    name: 'Anthropic',
    providerType: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    isHardcoded: true,
    hasApiKey: true,
    isEnabled: true,
    models: [{
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        providerId: 'anthropic',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputModalities: ['text', 'image'],
        outputModalities: ['text'],
        isEnabled: true,
        pricing: { promptPer1M: 3, completionPer1M: 15 }
    }],
    lastModelFetchAt: new Date(),
    capabilities: {
        streaming: true,
        functionCalling: true,
        vision: true,
        embeddings: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
};
```

---

## Conversation Entity

**File:** `src/core/entities/Conversation.ts`

### Purpose

The `Conversation` entity represents chat sessions with agent participation. It supports multimodal content, tool calls, and context management.

### Key Exports

```typescript
export interface Conversation
export interface Message
export interface Thread
export interface ConversationContext
export interface ContextSummary
export interface ConversationMetadata
export interface Attachment
export interface ToolCall
export interface ToolResult
export type MessageContent
export type MessageStatus
export type WorkspaceType
```

### Interface Definition

```typescript
export interface Conversation {
    id: string;
    workspaceType: WorkspaceType;
    threadId: string;             // Root thread (for branching)

    // Agent
    agentId: string;              // Which agent is participating

    // Messages
    messages: Message[];

    // Context Management
    context: ConversationContext;

    // Metadata
    metadata: ConversationMetadata;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';

    // Content (multimodal)
    content: MessageContent[];

    // Attachments (files, images, documents)
    attachments: Attachment[];

    // Tool Interactions
    toolCalls: ToolCall[];
    toolResults: ToolResult[];

    // Timestamp
    timestamp: Date;

    // Status
    status: MessageStatus;
}

export type MessageContent =
    | { type: 'text'; value: string }
    | { type: 'code'; value: string; language: string }
    | { type: 'image'; value: string; mimeType: string }
    | { type: 'file'; value: string; fileName: string };

export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface Thread {
    id: string;
    parentConversationId: string;
    branchFromMessageId: string;
    name: string;
    isArchived: boolean;
    contextTokens: number;
    createdAt: Date;
}

export interface ConversationContext {
    tokenBudget: number;           // Max tokens for context
    usedTokens: number;

    // Summarization
    summaries: ContextSummary[];

    // Attached resources
    attachedFiles: string[];
    attachedDocuments: string[];    // For knowledge workspace
    ragSources: string[];           // Active RAG sources
}

export interface ContextSummary {
    summaryId: string;
    content: string;
    tokenCount: number;
    messageRange: {
        startIndex: number;
        endIndex: number;
    };
}

export interface ConversationMetadata {
    title?: string;
    tags?: string[];
    pinned?: boolean;
    scrollPosition?: number;
}

export interface Attachment {
    id: string;
    type: 'file' | 'image' | 'document';
    name: string;
    url: string;
    mimeType?: string;
    size?: number;
}

export interface ToolCall {
    id: string;
    toolName: string;
    arguments: Record<string, unknown>;
    timestamp: Date;
}

export interface ToolResult {
    toolCallId: string;
    output: unknown;
    error?: string;
    timestamp: Date;
}

export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

### Business Rules

- Supports multimodal content (text, code, image, file)
- Tracks tool calls and results for transparency
- Manages context window with summarization for long conversations
- Supports thread branching for conversation forks

### Dependencies

- **Internal:** None
- **External:** None (pure TypeScript interfaces)

### Usage Example

```typescript
import { Conversation, Message, MessageContent, WorkspaceType } from '@/core/entities/Conversation';

const conversation: Conversation = {
    id: 'conv-001',
    workspaceType: 'ide',
    threadId: 'thread-001',
    agentId: 'agent-001',
    messages: [{
        id: 'msg-001',
        role: 'user',
        content: [{ type: 'text', value: 'Read the package.json file' }],
        attachments: [],
        toolCalls: [],
        toolResults: [],
        timestamp: new Date(),
        status: 'complete'
    }],
    context: {
        tokenBudget: 8000,
        usedTokens: 1200,
        summaries: [],
        attachedFiles: ['package.json'],
        attachedDocuments: [],
        ragSources: []
    },
    metadata: {
        title: 'Code Review Session',
        tags: ['coding', 'review'],
        pinned: false,
        scrollPosition: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
};
```

---

## Tool Entity

**File:** `src/core/entities/Tool.ts`

### Purpose

The `Tool` entity represents capabilities that agents can use (file operations, terminal, web search, etc.).

### Key Exports

```typescript
export interface Tool
export interface ToolConfigSchema
export interface ToolConfigProperty
export interface ToolExecutionRequest
export interface ToolExecutionResult
export type ToolCategory
export type WorkspaceType
```

### Interface Definition

```typescript
export interface Tool {
    id: string;
    name: string;
    description: string;
    category: ToolCategory;

    // Capabilities
    requiresAuth: boolean;
    supportedWorkspaces: WorkspaceType[];

    // Configuration schema
    configSchema?: ToolConfigSchema;

    // Availability
    isEnabled: boolean;
}

export type ToolCategory =
    | 'file-operations'
    | 'terminal'
    | 'web-search'
    | 'knowledge'
    | 'rag'
    | 'code-generation'
    | 'testing';

export interface ToolConfigSchema {
    properties: Record<string, ToolConfigProperty>;
    required?: string[];
}

export interface ToolConfigProperty {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    default?: unknown;
    enum?: unknown[];
    minimum?: number;
    maximum?: number;
}

export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

export interface ToolExecutionRequest {
    toolId: string;
    agentId: string;
    workspaceType: WorkspaceType;
    arguments: Record<string, unknown>;
}

export interface ToolExecutionResult {
    toolId: string;
    success: boolean;
    output: unknown;
    error?: string;
    metadata?: {
        executionTime: number;
        tokensUsed?: number;
    };
}
```

### Business Rules

- Tools have workspace-specific availability
- Tools can be enabled/disabled per agent
- Tools may have configuration options via `configSchema`

### Dependencies

- **Internal:** None
- **External:** None (pure TypeScript interfaces)

### Usage Example

```typescript
import { Tool, ToolCategory, ToolExecutionRequest, ToolExecutionResult } from '@/core/entities/Tool';

const tool: Tool = {
    id: 'read_file',
    name: 'Read File',
    description: 'Read contents of a file in the workspace',
    category: 'file-operations',
    requiresAuth: false,
    supportedWorkspaces: ['ide', 'knowledge', 'notes'],
    configSchema: {
        properties: {
            path: {
                type: 'string',
                description: 'Path to the file to read'
            },
            encoding: {
                type: 'string',
                description: 'File encoding (default: utf-8)',
                enum: ['utf-8', 'base64'],
                default: 'utf-8'
            }
        },
        required: ['path']
    },
    isEnabled: true
};

const executionRequest: ToolExecutionRequest = {
    toolId: 'read_file',
    agentId: 'agent-001',
    workspaceType: 'ide',
    arguments: { path: 'package.json', encoding: 'utf-8' }
};

const executionResult: ToolExecutionResult = {
    toolId: 'read_file',
    success: true,
    output: '{"name": "my-project", "version": "1.0.0"}',
    metadata: {
        executionTime: 45,
        tokensUsed: 120
    }
};
```

---

## Known Issues and Limitations

1. **Duplicate WorkspaceType**: `WorkspaceType` is defined in both `Agent.ts` and `Tool.ts` - should be consolidated to a shared types file.

2. **No Domain Services**: The `src/core/rules/` directory is empty. Business logic should be encapsulated in domain services.

3. **No Value Objects**: The `src/core/value-objects/` directory is empty. Value objects for validation should be added.

4. **Missing Factory Functions**: No factory functions for creating entities with proper validation.

5. **No Domain Events**: No domain events defined for entity state changes.

---

## Developer Notes

- All entities are pure TypeScript interfaces with no framework dependencies
- Entities follow Clean Architecture principles (domain layer, no infrastructure concerns)
- All interfaces use ISO 8601 date strings for timestamp fields
- The domain layer is designed to be framework-agnostic
