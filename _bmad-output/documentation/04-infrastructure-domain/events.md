# Infrastructure Event System

## Overview

The event system provides a **publish-subscribe** pattern for cross-store communication and state coordination. It enables loose coupling between components while maintaining type safety and debuggability.

### Key Characteristics

- **Type-Safe Events**: Strongly typed event payloads
- **Event Correlation**: Support for request/response tracking
- **Event Logging**: In-memory event log for debugging
- **Domain Categorization**: Events organized by domain (workspace, agent, sync, RAG)
- **Singleton Instance**: Global `eventBus` for application-wide communication

---

## Architecture

### Core Components

```
src/infrastructure/events/
├── event-bus.ts                    # Main EventBus implementation
├── cross-workspace-event-bus.ts    # Cross-workspace event propagation
└── index.ts                        # Barrel exports
```

### Event Flow

```
Component A          Component B          Component C
    |                    |                    |
    |--- emit() -------->|                    |
    |                    |--- subscribe() ----|
    |                    |                    |
    |                    |<-- handle() -------|
    |                    |                    |
```

---

## Domain Event Types

### Workspace Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `WORKSPACE_TRANSITION_STARTED` | `{ from: string; to: string }` | Workspace switch initiated |
| `WORKSPACE_TRANSITION_COMPLETED` | `{ workspaceType: string }` | Workspace switch finished |
| `WORKSPACE_CHANGED` | `{ workspaceType: string }` | Active workspace changed |

### Agent Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `AGENT_SELECTED` | `{ agentId: string }` | Agent selected for chat |
| `AGENT_DESELECTED` | `{ agentId: string }` | Agent deselected |
| `DEFAULT_AGENT_CHANGED` | `{ agentId: string }` | Default agent updated |
| `AGENT_CONFIG_UPDATED` | `{ agentId: string; changes: Partial<Agent> }` | Agent configuration changed |
| `AGENT_CREATED` | `{ agent: Agent }` | New agent created |
| `AGENT_DELETED` | `{ agentId: string }` | Agent deleted |

### Conversation Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `CONVERSATION_CREATED` | `{ conversationId: string }` | New conversation started |
| `CONVERSATION_DELETED` | `{ conversationId: string }` | Conversation deleted |
| `CONVERSATION_MESSAGE_ADDED` | `{ conversationId: string; message: Message }` | New message in conversation |
| `CONVERSATION_TITLE_UPDATED` | `{ conversationId: string; title: string }` | Conversation title changed |

### Provider Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `PROVIDER_KEY_SET` | `{ providerId: string }` | API key saved |
| `PROVIDER_KEY_REMOVED` | `{ providerId: string }` | API key removed |
| `PROVIDER_MODELS_FETCHED` | `{ providerId: string; models: Model[] }` | Models list updated |
| `PROVIDER_ERROR` | `{ providerId: string; error: string }` | Provider error occurred |

### Sync Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `SYNC_STARTED` | `{ direction: string }` | Sync operation began |
| `SYNC_COMPLETED` | `{ syncedFiles: number; failedFiles: number }` | Sync finished |
| `SYNC_FAILED` | `{ error: string }` | Sync operation failed |
| `SYNC_PROGRESS` | `{ progress: number; current: number; total: number }` | Sync progress update |

### File Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `FILE_OPENED` | `{ filePath: string }` | File opened in editor |
| `FILE_CLOSED` | `{ filePath: string }` | File closed |
| `FILE_SAVED` | `{ filePath: string }` | File saved |
| `FILE_SYNCED` | `{ filePath: string; direction: string }` | File synchronized |
| `FILE_CREATED` | `{ workspaceType: string; projectId: string; filePath: string }` | New file created |
| `FILE_UPDATED` | `{ workspaceType: string; projectId: string; filePath: string }` | File modified |
| `FILE_DELETED` | `{ workspaceType: string; projectId: string; filePath: string }` | File deleted |

### RAG Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `RAG_EMBEDDING_PROGRESS` | `{ status: RAGActivityStatus; progress: number }` | Embedding generation progress |
| `RAG_CHUNKING_STATUS` | `{ status: RAGActivityStatus; current: number; total: number }` | Document chunking status |
| `RAG_DATABASE_INDEXING` | `{ documentId: string; status: RAGActivityStatus }` | Database indexing status |
| `RAG_SOURCE_PROCESSING` | `{ sourceId: string; status: RAGActivityStatus }` | Source processing status |
| `RAG_INDEXING_CANCEL_REQUESTED` | `{ documentId: string }` | Cancel indexing operation |
| `RAG_INDEXING_RETRY_REQUESTED` | `{ documentId: string }` | Retry failed indexing |

### IDE → Knowledge Bridge Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `IDE_DEBUG_SESSION_CAPTURED` | `DebugSessionData` | Debug session captured for Knowledge |
| `IDE_REFACTOR_JOURNAL_CREATED` | `RefactorJournalData` | Refactor journal created |
| `IDE_DEPENDENCY_AUDIT_COMPLETE` | `DependencyAuditData` | Dependency audit completed |
| `IDE_CODE_ANALYSIS_REQUESTED` | `CodeAnalysisData` | Code analysis for Knowledge |

### Knowledge ↔ Notes Bridge Events

| Event Type | Payload | Description |
|------------|---------|-------------|
| `KNOWLEDGE_SYNTHESIS_EXPORT_REQUESTED` | `SynthesisExportData` | Export to Notes |
| `NOTES_RAG_INDEX_REQUESTED` | `NotesRAGIndexData` | Index notes for RAG |

---

## Usage Examples

### Basic Event Emission

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// Emit event
eventBus.emit(
  DomainEventType.WORKSPACE_CHANGED,
  { workspaceType: 'knowledge' },
  'correlation-123'  // Optional correlation ID
);
```

### Event Subscription

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// Subscribe to event
const unsubscribe = eventBus.on(
  DomainEventType.WORKSPACE_CHANGED,
  (event) => {
    console.log('Workspace changed to:', event.payload.workspaceType);
    console.log('Correlation ID:', event.correlationId);
  }
);

// Unsubscribe when done
unsubscribe();
```

### One-Time Subscription

```typescript
// Subscribe only once (auto-unsubscribes after first event)
eventBus.once(
  DomainEventType.CONVERSATION_CREATED,
  (event) => {
    console.log('New conversation:', event.payload.conversationId);
  }
);
```

### Waiting for Event

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// Wait for event with timeout
try {
  const event = await eventBus.waitFor<{ agentId: string }>(
    DomainEventType.AGENT_SELECTED,
    5000  // 5 second timeout
  );
  console.log('Agent selected:', event.payload.agentId);
} catch (error) {
  console.error('Timeout waiting for agent selection');
}
```

### RAG Progress Tracking

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// Track RAG embedding progress
const unsubscribe = eventBus.on(
  DomainEventType.RAG_EMBEDDING_PROGRESS,
  (event) => {
    const { status, progress, current, total } = event.payload;
    console.log(`Embedding: ${status} - ${current}/${total} (${progress}%)`);
  }
);
```

### File Change Tracking

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// Track file changes for RAG indexing
eventBus.on(DomainEventType.FILE_CREATED, async (event) => {
  const { workspaceType, filePath, shouldIndex } = event.payload;
  
  if (shouldIndex) {
    // Trigger RAG indexing
    await indexFileForRAG(workspaceType, filePath);
  }
});
```

---

## Event Bus API

### emit()

```typescript
emit<T>(
  eventType: DomainEventType,
  payload: T,
  correlationId?: string,
  metadata?: Record<string, unknown>
): void
```

Emits an event to all subscribers.

### on()

```typescript
on<T>(
  eventType: DomainEventType,
  handler: EventHandler<T>
): () => void
```

Subscribes to an event. Returns unsubscribe function.

### once()

```typescript
once<T>(
  eventType: DomainEventType,
  handler: EventHandler<T>
): void
```

Subscribes to event once (auto-unsubscribes after first event).

### removeAllListeners()

```typescript
removeAllListeners(eventType?: DomainEventType): void
```

Removes all subscribers for event type, or all listeners if no type specified.

### getEventLog()

```typescript
getEventLog(filterEventType?: DomainEventType): DomainEvent[]
```

Returns in-memory event log, optionally filtered by event type.

### getSubscriberCount()

```typescript
getSubscriberCount(eventType: DomainEventType): number
```

Returns number of subscribers for event type.

### hasSubscribers()

```typescript
hasSubscribers(eventType: DomainEventType): boolean
```

Checks if event has any subscribers.

---

## Event Payloads

### RAG Progress Payload

```typescript
interface RAGProgressPayload {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress?: number;      // 0-100 percentage
  current?: number;       // Current item count
  total?: number;         // Total item count
  message?: string;       // Status message
  error?: string;         // Error message
  documentId?: string;    // Document identifier
  sourceId?: string;      // Source identifier
}
```

### File Change Payload

```typescript
interface FileChangeData {
  workspaceType: 'ide' | 'knowledge' | 'notes' | 'study';
  projectId: string;
  filePath: string;
  content?: string;       // File content (created/updated)
  fileSize?: number;      // File size in bytes
  mimeType?: string;      // MIME type
  timestamp: Date;
  shouldIndex: boolean;   // Should be indexed for RAG
}
```

### Debug Session Payload

```typescript
interface DebugSessionData {
  workspaceType: 'ide';
  projectId: string;
  timestamp: Date;
  errorType: string;           // e.g., "TypeError"
  errorMessage: string;        // Human-readable error
  stackTrace: string;          // Full stack trace
  environment: {
    nodeVersion?: string;
    browser?: string;
    os?: string;
    framework?: string;
  };
  codeContext: {
    filePath: string;
    lineNumber: number;
    snippet: string;
  };
  attemptedFixes: string[];
  finalFix: string;
  symptoms: string;
  tags: string[];
}
```

---

## Cross-Workspace Events

### Cross-Workspace Event Bus

```typescript
import { crossWorkspaceEventBus } from '@/infrastructure/events/cross-workspace-event-bus';

// Cross-workspace event for agent configuration changes
crossWorkspaceEventBus.emitAgentConfigChange({
  workspaceId: 'ide',
  agentId: 'agent-123',
  changeType: 'updated',
});
```

### Cross-Workspace Event Types

```typescript
type WorkspaceId = 'ide' | 'knowledge' | 'study' | 'notes';

interface FileChangeEvent {
  workspaceId: WorkspaceId;
  filePath: string;
  changeType: 'created' | 'updated' | 'deleted';
}

interface AgentConfigChangeEvent {
  workspaceId: WorkspaceId;
  agentId: string;
  changeType: 'created' | 'updated' | 'deleted';
}

interface SyncStatusEvent {
  workspaceId: WorkspaceId;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  filePath?: string;
}

interface ProviderConfigChangeEvent {
  workspaceId: WorkspaceId;
  providerId: string;
  changeType: 'created' | 'updated' | 'deleted';
}
```

---

## Debugging

### Enable Debug Logging

```typescript
const eventBus = new EventBus({
  enableEventLog: true,
  maxEventLogSize: 1000,
  enableDebugLogging: true  // Logs all events to console
});
```

### Inspect Event Log

```typescript
import { eventBus, DomainEventType } from '@/infrastructure/events/event-bus';

// Get all events
const allEvents = eventBus.getEventLog();

// Get events filtered by type
const workspaceEvents = eventBus.getEventLog(DomainEventType.WORKSPACE_CHANGED);

// Get subscriber count
const count = eventBus.getSubscriberCount(DomainEventType.FILE_CREATED);

// Clear event log
eventBus.clearEventLog();
```

---

## Best Practices

### 1. Use Type-Safe Payloads

```typescript
// ❌ Avoid: Generic payload
eventBus.emit(DomainEventType.FILE_CREATED, { data: '...' });

// ✅ Prefer: Typed payload
interface FileCreatedPayload {
  filePath: string;
  workspaceType: string;
}
eventBus.emit<FileCreatedPayload>(DomainEventType.FILE_CREATED, {
  filePath: '/src/index.ts',
  workspaceType: 'ide'
});
```

### 2. Unsubscribe Properly

```typescript
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const unsubscribe = eventBus.on(
      DomainEventType.WORKSPACE_CHANGED,
      handleWorkspaceChange
    );
    
    return () => unsubscribe(); // Cleanup on unmount
  }, []);
}
```

### 3. Use Correlation IDs

```typescript
// Track related events
const correlationId = crypto.randomUUID();

eventBus.emit(DomainEventType.SYNC_STARTED, { direction: 'upload' }, correlationId);
eventBus.emit(DomainEventType.SYNC_COMPLETED, { syncedFiles: 10 }, correlationId);
```

### 4. Limit Event Log Size

```typescript
// Configure max event log size
const eventBus = new EventBus({
  maxEventLogSize: 500  // Keep last 500 events
});
```

---

## Known Issues & Limitations

### Memory Leak Prevention

- Always unsubscribe in cleanup functions
- Use `removeAllListeners()` when disposing components
- Monitor subscriber counts with `getSubscriberCount()`

### Event Order

- Events are emitted synchronously
- No guaranteed ordering between independent events
- Use correlation IDs for tracking related events

### Performance

- Large event payloads may impact performance
- Consider using metadata for optional data
- Use `once()` for one-time events instead of manual unsubscribe
