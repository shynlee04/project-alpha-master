# Data Models

**Generated:** 2026-01-07
**Scan Mode:** Exhaustive

---

## Overview

Via-gent uses a **domain-driven design** approach with entities, value objects, and database records organized by layer. The data model follows **clean architecture principles** with clear separation between domain logic and persistence.

---

## Domain Layer

### Agent Entity

**Location:** `src/domain/entities/agent.ts`

The `Agent` entity represents AI agent configurations with workspace bindings and tool permissions.

```typescript
class Agent {
  id: string;
  name: string;
  providerId: string;
  model: string;
  systemPrompt: string;
  temperature: number;        // Default: 0.7
  maxTokens: number;          // Default: 4096
  workspaceBindings: WorkspaceBinding[];
  tools: AgentToolBinding[];
  createdAt: number;
  updatedAt: number;
}
```

**Business Rules:**
- Agent must have at least one workspace binding
- Agent must have at least one enabled tool
- Agent cannot be deleted if active in any conversation

**Methods:**
- `isAvailableIn(workspaceType)` - Check availability in workspace
- `getUIVariant(workspaceType)` - Get UI variant for workspace
- `isDefaultFor(workspaceType)` - Check if default for workspace
- `canExecuteTool(toolId, workspaceType)` - Check tool permission
- `getEnabledToolsFor(workspaceType)` - Get permitted tools
- `withUpdates(updates)` - Create updated instance
- `canBeDeleted(count)` - Check if safe to delete

---

### Value Objects

#### WorkspaceBinding

**Location:** `src/domain/value-objects/workspace-binding.ts`

Immutable value object for agent availability in workspaces.

```typescript
class WorkspaceBinding {
  workspaceType: 'ide' | 'knowledge' | 'study' | 'notes';
  isAvailable: boolean;
  uiVariant: 'full' | 'compact' | 'minimal';
  isDefault: boolean;
}
```

**Methods:**
- `withAvailability(isAvailable)` - New binding with updated availability
- `withUIVariant(uiVariant)` - New binding with updated UI variant
- `withDefault(isDefault)` - New binding with updated default status
- `equals(other)` - Check equality
- `toJSON()` / `fromJSON()` - Serialization

---

#### AgentToolBinding

**Location:** `src/domain/value-objects/tool-permission.ts`

Immutable value object for tool permissions.

```typescript
interface WorkspacePermissions {
  ide: boolean;
  knowledge: boolean;
  study: boolean;
  notes: boolean;
}

class AgentToolBinding {
  toolId: string;
  toolName: string;
  isEnabled: boolean;
  workspacePermissions: WorkspacePermissions;
}
```

**Methods:**
- `isPermittedIn(workspaceType)` - Check permission in workspace
- `withEnabled(isEnabled)` - New binding with updated enabled status
- `withWorkspacePermission(workspaceType, permitted)` - Update single workspace
- `withWorkspacePermissions(permissions)` - Update all permissions
- `equals(other)` - Check equality
- `toJSON()` / `fromJSON()` - Serialization
- `defaultPermissions()` - Create all-enabled permissions
- `disabledPermissions()` - Create all-disabled permissions

---

## Persistence Layer

### Dexie Database Tables

**Location:** `src/infrastructure/persistence/dexie-db*.ts`

The IndexedDB database is organized into separate type files by domain:

| File | Tables | description |
|------|--------|---------|
| `dexie-db-core-types.ts` | Projects, IDEState, Conversations, FileSnapshots | Core project data |
| `dexie-db-ai-types.ts` | TaskContext, ToolExecution, Credentials, ConversationThreads | AI orchestration |
| `dexie-db-knowledge-types.ts` | Knowledge artifacts | Knowledge workspace |
| `dexie-db-workflow-types.ts` | Workflow state | Workflow engine |
| `dexie-db-snippet-types.ts` | Code snippets | Code management |
| `dexie-db-session-types.ts` | Session data | User sessions |
| `dexie-db-plugin-types.ts` | Plugin configurations | Plugin system |

---

### Core Records

#### ProjectRecord

```typescript
interface ProjectRecord {
  id: string;
  name: string;
  path: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  storageType?: 'indexeddb' | 'fsa';
  lastOpened: Date;
  createdAt: Date;
  bindings?: WorkspaceBindings | Record<string, string>;
  folderPath?: string;
  fileSnapshotEnabled?: boolean;
}
```

#### IDEStateRecord

```typescript
interface IDEStateRecord {
  projectId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  openFiles: string[];
  activeFile: string | null;
  expandedPaths: string[];
  panelLayouts: Record<string, number[]>;
  terminalTab: 'terminal' | 'output' | 'problems';
  chatVisible: boolean;
  activeFileScrollTop?: number;
  updatedAt: Date;
}
```

#### ConversationRecord

```typescript
interface ConversationRecord {
  id: string;
  projectId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  messages: unknown[];
  toolResults?: unknown[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### WorkspaceBindings

```typescript
interface WorkspaceBindings {
  ide?: boolean;
  notes?: boolean;
  knowledge?: boolean;
  study?: boolean;
}
```

---

### AI Records

#### TaskContextRecord

```typescript
type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

interface TaskContextRecord {
  id: string;
  projectId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  agentId: string;
  status: TaskStatus;
  description: string;
  targetFiles: string[];
  checkpoint?: unknown;
  createdAt: Date;
  updatedAt: Date;
}
```

#### ToolExecutionRecord

```typescript
interface ToolExecutionRecord {
  id: string;
  taskId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  toolName: string;
  input: unknown;
  output?: unknown;
  status: 'pending' | 'success' | 'error';
  duration?: number;
  createdAt: Date;
}
```

#### CredentialRecord

```typescript
interface CredentialRecord {
  providerId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  encrypted: string;
  iv: string;
  createdAt: Date;
}
```

---

### Conversation Threads

#### ThreadMessageRecord

```typescript
interface ThreadToolCallRecord {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input?: unknown;
  output?: unknown;
  duration?: number;
}

interface ThreadMessageRecord {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId?: string;
  agentName?: string;
  agentModel?: string;
  timestamp: number;
  toolCalls?: ThreadToolCallRecord[];
}
```

#### ConversationThreadRecord

```typescript
interface ConversationThreadRecord {
  id: string;
  projectId: string;
  workspaceId: 'ide' | 'knowledge' | 'study' | 'notes';
  title: string;
  preview: string;
  messages: ThreadMessageRecord[];
  agentsUsed: string[];
  messageCount: number;
  scrollPosition: number;
  createdAt: number;
  updatedAt: number;
}
```

---

## Provider Types

**Location:** `src/lib/agent/providers/types.ts`

### ProviderConfig

```typescript
type ProviderType = 'openai' | 'openai-compatible' | 'anthropic' | 'gemini';

interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseURL?: string;
  defaultModel?: string;
  enabled: boolean;
  isCustom?: boolean;
  supportsNativeTools?: boolean;
  hasApiKey: boolean;
  models: ModelInfo[];
  lastModelFetchAt?: number;
}
```

### ModelInfo

```typescript
interface ModelInfo {
  id: string;
  name: string;
  isFree?: boolean;
  contextLength?: number;
  maxOutputTokens?: number;
  providerId: string;
  temperature?: number;
  maxTemperature?: number;
  topP?: number;
  topK?: number;
  supportedMethods?: string[];
  inputModalities?: string[];
  outputModalities?: string[];
  supportsTools?: boolean;
  pricing?: {
    prompt: number;
    completion: number;
  };
}
```

---

## Data Relationships

```
Project (1) ----< (N) ConversationThread
    |                   |
    |                   +----< (N) ThreadMessage
    |                               |
    |                               +----< (N) ThreadToolCall
    |
    +----< (1) IDEState
    |
    +----< (N) FileSnapshot

Agent (1) ----< (N) WorkspaceBinding
Agent (1) ----< (N) AgentToolBinding
    |
    +----> (1) Provider
    |
    +----> (N) ModelInfo

TaskContext (1) ----< (N) ToolExecution
```

---

## Migration Support

All database records include `workspaceId` field (added PERSIST-S002) for cross-workspace isolation.

**Legacy format handling:**
- `WorkspaceBindings` accepts both boolean and string values for backwards compatibility
- Runtime code handles both formats seamlessly

---

## Related Documentation

- [State Management](./state-management.md) - Store architecture and patterns
- [API Contracts](./api-contracts.md) - REST endpoints
- [Architecture](./architecture.md) - System design
