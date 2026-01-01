---
title: ADR-006: Workspace State Sharing
status: Proposed
date: 2026-01-02
iteration: 11
cornerstone: Cross-Cutting
priority: P1 (UX)
---

# ADR-006: Workspace State Sharing

**Status:** Proposed
**Date:** 2026-01-02
**Iteration:** 11
**Cornerstone:** Cross-Cutting (All 5 cornerstones)
**Priority:** P1 (User Experience)
**Estimated Effort:** 8-12 hours

---

## Context

### Current State (GOOD - Event-Driven Architecture Implemented)

**Existing Event Patterns:**
- ✅ WorkspaceEventEmitter for cross-workspace communication
- ✅ Domain events for agent selection (AGENT_SELECTED, AGENT_DESELECTED)
- ✅ Workspace events for file operations (file:read, file:modified, file:deleted)
- ✅ Event activity indicators (indexing progress, embedding progress, sync status)
- ✅ Hot-reload support for agent configurations

**Architecture Highlights:**

```typescript
// src/lib/events/workspace-event-bus.ts

export class WorkspaceEventEmitter {
  private emitter = new EventEmitter();

  emit(event: WorkspaceEvent, payload: any): void {
    this.emitter.emit(event, payload);
    console.log(`[EventBus] ${event}`, payload);
  }

  on(event: WorkspaceEvent, handler: Function): void {
    this.emitter.on(event, handler);
  }

  off(event: WorkspaceEvent, handler: Function): void {
    this.emitter.off(event, handler);
  }
}

// Singleton instance
export const workspaceEventBus = new WorkspaceEventEmitter();
```

**Event Types:**

```typescript
// src/lib/events/types.ts

export enum WorkspaceEventType {
  // Agent events
  AGENT_SELECTED = 'AGENT_SELECTED',
  AGENT_DESELECTED = 'AGENT_DESELECTED',
  DEFAULT_AGENT_CHANGED = 'DEFAULT_AGENT_CHANGED',

  // File events
  FILE_READ = 'file:read',
  FILE_MODIFIED = 'file:modified',
  FILE_DELETED = 'file:deleted',
  FILE_CREATED = 'file:created',

  // Sync events
  SYNC_COMPLETED = 'sync:completed',
  SYNC_FAILED = 'sync:failed',
  SYNC_PROGRESS = 'sync:progress',

  // Workspace events
  WORKSPACE_CHANGED = 'workspace:changed',
  PROJECT_CHANGED = 'project:changed',

  // RAG events
  INDEXING_STARTED = 'indexing:started',
  INDEXING_COMPLETED = 'indexing:completed',
  EMBEDDING_PROGRESS = 'embedding:progress',
}
```

**Event Activity Indicators (Ralph Loop Cycle 17):**

```typescript
// src/presentation/components/ui/activity-indicators/ (4 components)

- DatabaseIndexingIndicator.tsx (84 lines)
- EmbeddingProgressIndicator.tsx (84 lines)
- ChunkingStatusIndicator.tsx (84 lines)
- SyncStatusIndicator.tsx (84 lines)
```

### Current Event Patterns by Cornerstone

**Cornerstone 1 (Providers):**
- `MODELS_LOADED` - When provider models are fetched
- `PROVIDER_UPDATED` - When provider config changes
- `API_KEY_SAVED` - When API key is saved

**Cornerstone 2 (Agents):**
- `AGENT_SELECTED` - When agent is selected
- `AGENT_DESELECTED` - When agent is deselected
- `DEFAULT_AGENT_CHANGED` - When default agent changes
- `AGENT_UPDATED` - When agent config is updated

**Cornerstone 3 (Conversations):**
- `THREAD_CREATED` - When conversation thread is created
- `THREAD_DELETED` - When thread is deleted
- `MESSAGE_ADDED` - When message is added
- `ACTIVE_THREAD_CHANGED` - When active thread changes

**Cornerstone 4 (Projects):**
- `PROJECT_OPENED` - When project is opened
- `PROJECT_CLOSED` - When project is closed
- `FILE_MODIFIED` - When file is modified
- `SYNC_COMPLETED` - When sync completes

**Cornerstone 5 (RAG):**
- `INDEXING_STARTED` - When indexing starts
- `INDEXING_COMPLETED` - When indexing completes
- `EMBEDDING_PROGRESS` - During embedding generation
- `SEARCH_COMPLETED` - When search completes

---

## Decision

**Formalize and enhance cross-workspace event patterns for seamless state sharing.**

**Key Principles:**
1. **Event-Driven Architecture** - Use events for cross-workspace communication
2. **Hot-Reload Support** - Changes reflect immediately across all workspaces
3. **Observability** - Event activity indicators for user feedback
4. **Loose Coupling** - Workspaces communicate via events, not direct imports
5. **Type Safety** - Strongly typed event payloads

### Enhanced Event Patterns

**1. Unified Event Bus**

```typescript
// src/infrastructure/events/unified-event-bus.ts

export class UnifiedEventBus {
  private emitter = new EventEmitter();

  // Type-safe emit
  emit<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    payload: T
  ): void {
    this.emitter.emit(event, payload);
    console.log(`[EventBus] ${event}`, payload);
  }

  // Type-safe subscribe
  on<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    handler: (payload: T) => void
  ): void {
    this.emitter.on(event, handler);
  }

  // Unsubscribe
  off<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    handler: (payload: T) => void
  ): void {
    this.emitter.off(event, handler);
  }

  // Broadcast to all subscribers
  broadcast<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    payload: T
  ): void {
    this.emit(event, payload);
  }

  // Clear all subscriptions
  clear(): void {
    this.emitter.removeAllListeners();
  }
}

// Singleton instance
export const unifiedEventBus = new UnifiedEventBus();
```

**2. Cross-Workspace State Synchronization**

```typescript
// src/infrastructure/events/workspace-sync-manager.ts

export class WorkspaceSyncManager {
  private eventBus: UnifiedEventBus;
  private workspaceStates: Map<WorkspaceType, WorkspaceState>;

  constructor(eventBus: UnifiedEventBus) {
    this.eventBus = eventBus;
    this.workspaceStates = new Map();
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    // Subscribe to agent selection changes
    this.eventBus.on<AgentSelectedPayload>(
      WorkspaceEventType.AGENT_SELECTED,
      this.handleAgentSelected.bind(this)
    );

    // Subscribe to provider updates
    this.eventBus.on<ProviderUpdatedPayload>(
      WorkspaceEventType.PROVIDER_UPDATED,
      this.handleProviderUpdated.bind(this)
    );

    // Subscribe to project changes
    this.eventBus.on<ProjectChangedPayload>(
      WorkspaceEventType.PROJECT_CHANGED,
      this.handleProjectChanged.bind(this)
    );

    // ... more subscriptions
  }

  private handleAgentSelected(payload: AgentSelectedPayload): void {
    // Update all workspaces with new agent selection
    for (const [workspaceType, state] of this.workspaceStates) {
      if (workspaceType === payload.workspaceType) {
        state.activeAgentId = payload.agentId;
        this.eventBus.emit(
          WorkspaceEventType.WORKSPACE_STATE_UPDATED,
          { workspaceType, state }
        );
      }
    }
  }

  private handleProviderUpdated(payload: ProviderUpdatedPayload): void {
    // Refresh provider models in all workspaces
    for (const [workspaceType] of this.workspaceStates) {
      this.eventBus.emit(
        WorkspaceEventType.PROVIDER_MODELS_REFRESH,
        { workspaceType, providerId: payload.providerId }
      );
    }
  }

  private handleProjectChanged(payload: ProjectChangedPayload): void {
    // Update project metadata across all workspaces
    for (const [workspaceType] of this.workspaceStates) {
      if (workspaceType === payload.workspaceType) {
        this.eventBus.emit(
          WorkspaceEventType.PROJECT_METADATA_UPDATED,
          { workspaceType, project: payload.project }
        );
      }
    }
  }
}
```

**3. Hot-Reload Support**

```typescript
// src/infrastructure/events/hot-reload-manager.ts

export class HotReloadManager {
  private eventBus: UnifiedEventBus;
  private reloadCallbacks: Map<string, ReloadCallback>;

  constructor(eventBus: UnifiedEventBus) {
    this.eventBus = eventBus;
    this.reloadCallbacks = new Map();
    this.initializeSubscriptions();
  }

  registerReloadCallback(
    resourceType: string,
    callback: ReloadCallback
  ): void {
    this.reloadCallbacks.set(resourceType, callback);
  }

  triggerReload(resourceType: string, resourceId: string): void {
    const callback = this.reloadCallbacks.get(resourceType);
    if (callback) {
      callback(resourceId);
    }

    // Broadcast reload event
    this.eventBus.emit(WorkspaceEventType.RESOURCE_RELOADED, {
      resourceType,
      resourceId,
    });
  }

  private initializeSubscriptions(): void {
    // Watch for agent config changes
    this.eventBus.on(WorkspaceEventType.AGENT_UPDATED, (payload) => {
      this.triggerReload('agent', payload.agentId);
    });

    // Watch for provider model changes
    this.eventBus.on(WorkspaceEventType.PROVIDER_MODELS_UPDATED, (payload) => {
      this.triggerReload('provider-models', payload.providerId);
    });

    // Watch for RAG index changes
    this.eventBus.on(WorkspaceEventType.INDEXING_COMPLETED, (payload) => {
      this.triggerReload('rag-index', payload.indexId);
    });
  }
}
```

---

## Consequences

### Benefits

1. **Seamless State Synchronization** ✅
   - Changes in one workspace reflect immediately in others
   - No manual refresh needed
   - Consistent user experience

2. **Loose Coupling** ✅
   - Workspaces communicate via events, not direct imports
   - Easy to add new workspaces
   - Maintainable architecture

3. **Observability** ✅
   - Event activity indicators show system state
   - User sees what's happening (indexing, syncing, etc.)
   - Better UX

4. **Hot-Reload Support** ✅
   - Agent config changes reflect immediately
   - Provider model changes auto-refresh
   - RAG index updates visible across workspaces

5. **Type Safety** ✅
   - Strongly typed event payloads
   - Compile-time error checking
   - Better developer experience

### Drawbacks

1. **Event Overhead** ⚠️
   - Event emission has small performance cost
   - Many event listeners can slow down app
   - Mitigation: Debounce events, use selective subscriptions

2. **Debugging Complexity** ⚠️
   - Event flow can be hard to trace
   - Event order matters
   - Mitigation: Event logging, debug mode

3. **Memory Leaks** ⚠️
   - Event subscriptions not cleaned up
   - Components re-render without unsubscribing
   - Mitigation: useEffect cleanup, strict linter rules

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Event storms** (too many events fired) | Medium | High | - Debounce events<br>- Rate limiting<br>- Event batching |
| **Memory leaks from unsubsribed events** | Medium | High | - useEffect cleanup rules<br>- Linting rules<br>- Memory profiling |
| **Event ordering bugs** | Low | Medium | - Event sequencing<br>- Priority queues<br>- Event dependencies |
| **Performance degradation** | Low | Medium | - Event performance monitoring<br>- Selective subscriptions<br>- Event filtering |

---

## Implementation Plan

### Phase 1: Formalize Event Bus (2-3 hours)

**Step 1.1:** Create unified event bus
```typescript
// src/infrastructure/events/unified-event-bus.ts

import { EventEmitter } from 'eventemitter3';

export interface WorkspaceEventPayload {
  agentId?: string;
  agentName?: string;
  workspaceType?: WorkspaceType;
  projectId?: string;
  providerId?: string;
  timestamp: number;
}

export class UnifiedEventBus {
  private emitter = new EventEmitter();

  emit<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    payload: T
  ): void {
    this.emitter.emit(event, { ...payload, timestamp: Date.now() });
    console.log(`[EventBus] ${event}`, payload);
  }

  on<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    handler: (payload: T) => void
    ): void {
    this.emitter.on(event, handler);
  }

  off(event: WorkspaceEventType, handler: Function): void {
    this.emitter.off(event, handler);
  }

  once<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    handler: (payload: T) => void
  ): void {
    this.emitter.once(event, handler);
  }

  removeAllListeners(event?: WorkspaceEventType): void {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

export const unifiedEventBus = new UnifiedEventBus();
```

**Step 1.2:** Create event type definitions
```typescript
// src/infrastructure/events/event-types.ts

export enum WorkspaceEventType {
  // Agent events
  AGENT_SELECTED = 'AGENT_SELECTED',
  AGENT_DESELECTED = 'AGENT_DESELECTED',
  AGENT_UPDATED = 'AGENT_UPDATED',
  DEFAULT_AGENT_CHANGED = 'DEFAULT_AGENT_CHANGED',

  // Provider events
  PROVIDER_UPDATED = 'PROVIDER_UPDATED',
  MODELS_LOADED = 'MODELS_LOADED',
  MODELS_REFRESH = 'MODELS_REFRESH',
  API_KEY_SAVED = 'API_KEY_SAVED',

  // Conversation events
  THREAD_CREATED = 'THREAD_CREATED',
  THREAD_DELETED = 'THREAD_DELETED',
  MESSAGE_ADDED = 'MESSAGE_ADDED',
  ACTIVE_THREAD_CHANGED = 'ACTIVE_THREAD_CHANGED',

  // Project events
  PROJECT_OPENED = 'PROJECT_OPENED',
  PROJECT_CLOSED = 'PROJECT_CLOSED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  FILE_MODIFIED = 'FILE_MODIFIED',
  FILE_DELETED = 'FILE_DELETED',

  // RAG events
  INDEXING_STARTED = 'INDEXING_STARTED',
  INDEXING_COMPLETED = 'INDEXING_COMPLETED',
  INDEXING_PROGRESS = 'INDEXING_PROGRESS',
  EMBEDDING_PROGRESS = 'EMBEDDING_PROGRESS',
  SEARCH_COMPLETED = 'SEARCH_COMPLETED',

  // Workspace events
  WORKSPACE_CHANGED = 'WORKSPACE_CHANGED',
  WORKSPACE_STATE_UPDATED = 'WORKSPACE_STATE_UPDATED',
  RESOURCE_RELOADED = 'RESOURCE_RELOADED',
}

// Type-safe payload interfaces
export interface AgentSelectedPayload extends WorkspaceEventPayload {
  agentId: string;
  agentName: string;
  workspaceType: WorkspaceType;
}

export interface ProviderUpdatedPayload extends WorkspaceEventPayload {
  providerId: string;
  hasApiKey: boolean;
}

export interface ModelsLoadedPayload extends WorkspaceEventPayload {
  providerId: string;
  models: ProviderModel[];
}

// ... more payload interfaces
```

**Step 1.3:** Add event logging middleware
```typescript
// src/infrastructure/events/event-logger.ts

export class EventLogger {
  private logs: EventLog[] = [];
  private maxLogs = 1000;

  log<T extends WorkspaceEventPayload>(
    event: WorkspaceEventType,
    payload: T
  ): void {
    const log: EventLog = {
      event,
      payload,
      timestamp: Date.now(),
    };

    this.logs.push(log);

    // Keep only last 1000 logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(event?: WorkspaceEventType): EventLog[] {
    if (event) {
      return this.logs.filter(log => log.event === event);
    }
    return this.logs;
  }

  clear(): void {
    this.logs = [];
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}
```

### Phase 2: Implement Cross-Workspace Sync (3-4 hours)

**Step 2.1:** Create workspace sync manager
```typescript
// src/infrastructure/events/workspace-sync-manager.ts

export class WorkspaceSyncManager {
  private eventBus: UnifiedEventBus;
  private workspaceStates: Map<WorkspaceType, WorkspaceState>;
  private eventLogger: EventLogger;

  constructor(eventBus: UnifiedEventBus) {
    this.eventBus = eventBus;
    this.workspaceStates = new Map();
    this.eventLogger = new EventLogger();
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    // Agent selection sync
    this.eventBus.on<AgentSelectedPayload>(
      WorkspaceEventType.AGENT_SELECTED,
      this.handleAgentSelected.bind(this)
    );

    // Provider models sync
    this.eventBus.on<ModelsLoadedPayload>(
      WorkspaceEventType.MODELS_LOADED,
      this.handleModelsLoaded.bind(this)
    );

    // Project sync
    this.eventBus.on<ProjectUpdatedPayload>(
      WorkspaceEventType.PROJECT_UPDATED,
      this.handleProjectUpdated.bind(this)
    );

    // ... more subscriptions
  }

  private handleAgentSelected(payload: AgentSelectedPayload): void {
    // Log event
    this.eventLogger.log(WorkspaceEventType.AGENT_SELECTED, payload);

    // Update all workspaces
    for (const [workspaceType, state] of this.workspaceStates) {
      if (workspaceType === payload.workspaceType) {
        state.activeAgentId = payload.agentId;
        state.lastSelectedAgentIds[workspaceType] = payload.agentId;

        // Broadcast state update
        this.eventBus.emit(WorkspaceEventType.WORKSPACE_STATE_UPDATED, {
          workspaceType,
          state,
        });
      }
    }
  }

  private handleModelsLoaded(payload: ModelsLoadedPayload): void {
    // Log event
    this.eventLogger.log(WorkspaceEventType.MODELS_LOADED, payload);

    // Refresh all workspaces using this provider
    for (const [workspaceType, state] of this.workspaceStates) {
      // Check if any agent in this workspace uses this provider
      const agentsUsingProvider = state.agents.filter(
        a => a.providerId === payload.providerId
      );

      if (agentsUsingProvider.length > 0) {
        // Broadcast models refresh
        this.eventBus.emit(WorkspaceEventType.PROVIDER_MODELS_REFRESH, {
          workspaceType,
          providerId: payload.providerId,
        });
      }
    }
  }

  private handleProjectUpdated(payload: ProjectUpdatedPayload): void {
    // Log event
    this.eventLogger.log(WorkspaceEventType.PROJECT_UPDATED, payload);

    // Update project metadata in all workspaces
    for (const [workspaceType, state] of this.workspaceStates) {
      if (state.project?.id === payload.projectId) {
        state.project = payload.project;

        // Broadcast project update
        this.eventBus.emit(WorkspaceEventType.PROJECT_METADATA_UPDATED, {
          workspaceType,
          project: payload.project,
        });
      }
    }
  }
}
```

**Step 2.2:** Initialize sync manager on app startup
```typescript
// src/main.tsx

import { unifiedEventBus } from './infrastructure/events/unified-event-bus';
import { WorkspaceSyncManager } from './infrastructure/events/workspace-sync-manager';

export async function initializeApp() {
  // Initialize event bus
  const syncManager = new WorkspaceSyncManager(unifiedEventBus);

  // Make available globally
  (window as any).__eventBus = unifiedEventBus;
  (window as any).__syncManager = syncManager;

  console.log('[Init] Workspace sync manager initialized');
}
```

### Phase 3: Add Hot-Reload Support (3-5 hours)

**Step 3.1:** Create hot-reload manager
```typescript
// src/infrastructure/events/hot-reload-manager.ts

export class HotReloadManager {
  private eventBus: UnifiedEventBus;
  private reloadCallbacks: Map<string, ReloadCallback>;

  constructor(eventBus: UnifiedEventBus) {
    this.eventBus = eventBus;
    this.reloadCallbacks = new Map();
    this.initializeSubscriptions();
  }

  registerReloadCallback(
    resourceType: ResourceType,
    callback: ReloadCallback
  ): void {
    this.reloadCallbacks.set(resourceType, callback);
    console.log(`[HotReload] Registered callback for ${resourceType}`);
  }

  triggerReload(resourceType: ResourceType, resourceId: string): void {
    console.log(`[HotReload] Triggering reload for ${resourceType}:${resourceId}`);

    const callback = this.reloadCallbacks.get(resourceType);
    if (callback) {
      try {
        callback(resourceId);
        console.log(`[HotReload] ✅ Reloaded ${resourceType}:${resourceId}`);
      } catch (error) {
        console.error(`[HotReload] ❌ Failed to reload ${resourceType}:${resourceId}:`, error);
      }
    }

    // Broadcast reload event
    this.eventBus.emit(WorkspaceEventType.RESOURCE_RELOADED, {
      resourceType,
      resourceId,
      timestamp: Date.now(),
    });
  }

  private initializeSubscriptions(): void {
    // Agent config changes
    this.eventBus.on(WorkspaceEventType.AGENT_UPDATED, (payload) => {
      this.triggerReload('agent', payload.agentId);
    });

    // Provider model changes
    this.eventBus.on(WorkspaceEventType.MODELS_LOADED, (payload) => {
      this.triggerReload('provider-models', payload.providerId);
    });

    // RAG index changes
    this.eventBus.on(WorkspaceEventType.INDEXING_COMPLETED, (payload) => {
      this.triggerReload('rag-index', payload.indexId);
    });

    // Project changes
    this.eventBus.on(WorkspaceEventType.PROJECT_UPDATED, (payload) => {
      this.triggerReload('project', payload.projectId);
    });
  }
}

// Singleton instance
export const hotReloadManager = new HotReloadManager(unifiedEventBus);
```

**Step 3.2:** Create useWorkspaceEvents hook
```typescript
// src/hooks/useWorkspaceEvents.ts

export function useWorkspaceEvents(workspaceType: WorkspaceType) {
  const [state, setState] = useState<WorkspaceState>({
    activeAgentId: null,
    project: null,
    providers: [],
  });

  useEffect(() => {
    const handleStateUpdate = (payload: WorkspaceStateUpdatedPayload) => {
      if (payload.workspaceType === workspaceType) {
        setState(payload.state);
      }
    };

    const handleResourceReload = (payload: ResourceReloadPayload) => {
      console.log(`[useWorkspaceEvents] Resource reloaded:`, payload);

      // Refresh local state when resource is reloaded
      switch (payload.resourceType) {
        case 'agent':
          // Refresh agent list
          const agents = useAgentsStore(s => s.agents);
          setState(prev => ({ ...prev, agents }));
          break;

        case 'provider-models':
          // Refresh provider models
          const providers = useAppStore(s => s.providers);
          setState(prev => ({ ...prev, providers }));
          break;

        // ... more cases
      }
    };

    // Subscribe to state updates
    unifiedEventBus.on(
      WorkspaceEventType.WORKSPACE_STATE_UPDATED,
      handleStateUpdate
    );

    // Subscribe to resource reloads
    unifiedEventBus.on(
      WorkspaceEventType.RESOURCE_RELOADED,
      handleResourceReload
    );

    return () => {
      unifiedEventBus.off(WorkspaceEventType.WORKSPACE_STATE_UPDATED, handleStateUpdate);
      unifiedEventBus.off(WorkspaceEventType.RESOURCE_RELOADED, handleResourceReload);
    };
  }, [workspaceType]);

  return state;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/infrastructure/events/__tests__/unified-event-bus.test.ts

describe('UnifiedEventBus', () => {
  it('should emit and receive events', () => {
    const bus = new UnifiedEventBus();
    const handler = jest.fn();

    bus.on(WorkspaceEventType.AGENT_SELECTED, handler);
    bus.emit(WorkspaceEventType.AGENT_SELECTED, { agentId: 'test' });

    expect(handler).toHaveBeenCalledWith({ agentId: 'test', timestamp: expect.any(Number) });
  });

  it('should unsubscribe from events', () => {
    const bus = new UnifiedEventBus();
    const handler = jest.fn();

    bus.on(WorkspaceEventType.AGENT_SELECTED, handler);
    bus.off(WorkspaceEventType.AGENT_SELECTED, handler);
    bus.emit(WorkspaceEventType.AGENT_SELECTED, { agentId: 'test' });

    expect(handler).not.toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
// src/infrastructure/events/__tests__/workspace-sync-manager.test.ts

describe('WorkspaceSyncManager', () => {
  it('should sync agent selection across workspaces', async () => {
    const manager = new WorkspaceSyncManager(unifiedEventBus);

    // Select agent in IDE workspace
    unifiedEventBus.emit(WorkspaceEventType.AGENT_SELECTED, {
      agentId: 'agent-1',
      workspaceType: 'ide',
    });

    // Wait for sync
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify agent selected in IDE workspace
    const ideState = manager.getWorkspaceState('ide');
    expect(ideState.activeAgentId).toBe('agent-1');
  });
});
```

### Manual Testing Checklist

- [ ] Test agent selection sync across workspaces
- [ ] Test provider model auto-refresh
- [ ] Test project metadata sync
- [ ] Test RAG index updates across workspaces
- [ ] Test hot-reload for agent configs
- [ ] Test hot-reload for provider models
- [ ] Verify event activity indicators show progress
- [ ] Test event logging
- [ ] Verify no memory leaks (check with Chrome DevTools)

---

## Success Criteria

### Completion Checklist

**Cross-Cutting Concern Complete When:**
- [ ] Unified event bus implemented
- [ ] Workspace sync manager functional
- [ ] Hot-reload manager working
- [ ] Event activity indicators showing progress
- [ ] Agent selection syncs across workspaces
- [ ] Provider models auto-refresh
- [ ] Project metadata syncs across workspaces
- [ ] RAG index updates visible across workspaces
- [ ] Zero memory leaks (all subscriptions cleaned up)
- [ ] Zero TypeScript errors: `pnpm tsc --noEmit`
- [ ] All tests passing: `pnpm test`
- [ ] Manual test: Change agent in Settings → Verify reflects in all workspaces
- [ ] Performance: Event overhead <5% of total runtime

---

## Related ADRs

- **ADR-001:** Provider Store Consolidation (uses events for model loading)
- **ADR-002:** Agent Vault Architecture (uses events for selection sync)
- **ADR-003:** Conversation Thread Schema (uses events for thread changes)
- **ADR-004:** Project Workspace Binding (uses events for file operations)
- **ADR-005:** RAG Pipeline Design (uses events for indexing progress)

---

## References

- **Event Bus:** `src/lib/events/workspace-event-bus.ts`
- **Activity Indicators:** `src/presentation/components/ui/activity-indicators/`
- **Agent Events:** `src/infrastructure/persistence/stores/agents/agent-events-slice.ts`
- **RAG Events:** `src/infrastructure/persistence/stores/rag/rag-index-slice.ts`

---

## Open Questions

1. **Should we implement event replay for debugging?**
   - **Decision:** DEFER to Phase 3 (P2 priority)
   - **Reasoning:** Nice-to-have, not blocking for MVP

2. **Should we add event persistence for offline support?**
   - **Decision:** DEFER to Phase 3 (P2 priority)
   - **Reasoning:** Complex, requires careful design

3. **Should we implement event batching to reduce overhead?**
   - **Decision:** YES - implement debouncing for high-frequency events
   - **Reasoning:** Reduces event storm risk

---

**Status:** Proposed
**Next Step:** Implementation Phase 1 (Formalize Event Bus)
**Estimated Completion:** Iterations 41-50 (Sprint 1 - P1 UX)
**Risk Level:** MEDIUM (event overhead, memory leaks)

---

**Generated:** 2026-01-02
**Author:** Ralph Wiggum Loop (Phase 2 - ADR Creation)
**Review Status:** Pending stakeholder approval
**NOTE:** This is a CROSS-CUTTING concern that affects all 5 cornerstones. Implement early in Sprint 1 to enable smooth state sharing.
