---
name: Comprehensive Architectural Specification v3.0
description: Complete system architecture transformation blueprint following December 2025 best practices
version: 3.0.0
author: @bmad-bmm-architect
created: 2026-01-01T09:00:00+07:00
phase: Implementation
validation_score: TARGET 100/100
---

# Comprehensive Architectural Specification v3.0

**Creation Date:** 2026-01-01
**Target Validation Score:** 100/100
**Reference Documents:**
- Original Requirements: `_bmad-output/architectural-gap-analysis-2025-12-31.md`
- Codebase Analysis: `_bmad-output/codebase-analysis-report-2026-01-01.md`
- ARC Module Analysis: `_bmad-output/arc-module-gap-analysis-2025-12-31.md`

---

## Executive Summary

This specification addresses critical architectural gaps identified through comprehensive analysis:

1. **Store Duplication Crisis (P0)**: 37 stores scattered across 4 locations with confirmed duplicates
2. **Database Schema Duplication (P0)**: Two `dexie-db.ts` files with divergent implementations
3. **Missing Domain Layer (P1)**: Four-layer architecture claims non-existent `src/domain/` layer
4. **Oversized Components (P0)**: AgentConfigDialog.tsx at 1,171 lines (god class)
5. **TypeScript Errors (P1)**: 200+ errors preventing type safety
6. **State Orchestration Gaps (P0)**: No unified state management orchestration

**Target Architecture**: Clean four-layer architecture with single source of truth for all state, following December 2025 best practices for Zustand, Dexie, and TanStack Router.

---

## Part I: Four-Layer Architecture Definition

### Current State Analysis

**Claimed Architecture**:
```
src/
├── infrastructure/  (Layer 1: Infrastructure)
├── domain/          (Layer 2: Domain) ❌ MISSING
├── application/     (Layer 3: Application)
├── presentation/    (Layer 4: Presentation)
├── shared/          (Cross-cutting)
└── workspaces/      (Workspace-specific)
```

**Actual Architecture**:
```
src/
├── infrastructure/persistence/  ✓ EXISTS
├── lib/                        ❌ UNORGANIZED (mixed concerns)
├── components/                 ✓ EXISTS
├── stores/                     ❌ DUPLICATED (also in lib/state/, infrastructure/persistence/stores/)
```

### Target Architecture Specification

#### Layer 1: Infrastructure (`src/infrastructure/`)

**Purpose**: External system integrations, persistence, filesystem, WebContainer

**Structure**:
```
src/infrastructure/
├── persistence/              # Database and storage
│   ├── dexie-db.ts          # SINGLE database schema definition
│   ├── dexie-db-migrations.ts # Migration definitions
│   └── stores/              # Zustand stores with Dexie persistence
│       ├── core/            # Core application stores
│       ├── agents/          # Agent configuration stores
│       └── workspace/       # Workspace state stores
├── filesystem/              # File System Access API abstraction
│   ├── local-fs-adapter.ts
│   ├── sync-manager.ts
│   └── fsa-handles.ts
├── webcontainer/            # WebContainer integration
│   ├── manager.ts
│   ├── process.ts
│   └── shell.ts
└── events/                  # Event system
    ├── event-bus.ts
    └── event-types.ts
```

**Principles**:
- No business logic (only external system concerns)
- Provides interfaces and implementations for Layer 2
- All external dependencies isolated here

#### Layer 2: Domain (`src/domain/`) - NEW

**Purpose**: Business logic, entities, domain services, use cases

**Structure**:
```
src/domain/
├── entities/                # Domain entities with business rules
│   ├── agent.ts            # Agent entity with workspace bindings
│   ├── conversation.ts     # Conversation entity
│   ├── project.ts          # Project entity
│   └── workspace.ts        # Workspace entity
├── value-objects/          # Immutable value objects
│   ├── workspace-binding.ts
│   ├── tool-permission.ts
│   └── agent-config.ts
├── services/               # Domain services (business logic)
│   ├── agent-orchestration-service.ts
│   ├── workspace-transition-service.ts
│   └── permission-service.ts
├── repositories/           # Repository interfaces (implemented in infrastructure)
│   ├── agent-repository.ts
│   ├── conversation-repository.ts
│   └── project-repository.ts
└── use-cases/              # Application use cases (transaction scripts)
    ├── create-agent-use-case.ts
    ├── switch-workspace-use-case.ts
    └── execute-tool-use-case.ts
```

**Principles**:
- Pure business logic, no framework dependencies
- Entities enforce business invariants
- Use cases orchestrate domain operations
- Repository interfaces abstract persistence

#### Layer 3: Application (`src/application/`)

**Purpose**: Application services, coordination between layers

**Structure**:
```
src/application/
├── services/               # Application services
│   ├── agent-factory.ts    # Agent creation with tools
│   ├── chat-service.ts     # Chat orchestration
│   └── sync-service.ts     # File sync coordination
├── hooks/                  # React hooks (bridge to presentation)
│   ├── use-agent-chat.ts
│   ├── use-workspace-transition.ts
│   └── use-conversation.ts
├── stores/                 # TEMPORARY: During migration only
│   └── [will move to infrastructure/persistence/stores/]
└── dto/                    # Data Transfer Objects
    ├── agent-dto.ts
    ├── conversation-dto.ts
    └── workspace-dto.ts
```

**Principles**:
- Orchestrates domain and infrastructure
- No business logic (delegates to domain)
- Provides React hooks for presentation layer
- DTOs for layer boundary communication

#### Layer 4: Presentation (`src/presentation/`)

**Purpose**: UI components, user interactions

**Structure**:
```
src/presentation/
├── components/
│   ├── agent/             # Agent configuration UI
│   ├── chat/              # Chat interface
│   ├── ide/               # IDE panels
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── routes/                # TanStack Router routes
│   └── [will move from src/routes/]
└── hooks/                 # Presentation-specific hooks
    ├── use-responsive.ts
    └── use-keyboard-shortcuts.ts
```

**Principles**:
- Thin components (<120 lines maximum)
- No business logic (delegates to application hooks)
- State via Zustand stores (infrastructure layer)
- Pure presentation concerns

---

## Part II: Store Consolidation Plan

### Critical Issue: Store Duplication Crisis

**Current State (CRITICAL)**:
```
src/lib/state/                    (29 stores)
src/infrastructure/persistence/stores/  (22 stores)  ❌ DUPLICATE
src/lib/workspace/                (6 stores)       ❌ DUPLICATE
src/stores/                       (9 stores)       ❌ DUPLICATE
```

**Confirmed Duplicates**:
- `rag-store.ts` - exists in 3 locations ❌
- `canvas-store.ts` - exists in 2 locations ❌
- `knowledge-store.ts` - exists in 2 locations ❌
- `conversation-store.ts` - exists in 3 locations ❌
- `flashcard-store.ts`, `quiz-store.ts`, `ide-store.ts`, `study-store.ts` - all duplicated ❌

### Target State: Unified Store Architecture

**Single Source of Truth**:
```
src/infrastructure/persistence/stores/
├── core/                    # Core application state
│   ├── ide-store.ts        # IDE state (files, panels, active file)
│   ├── conversation-store.ts  # Conversation and chat state
│   ├── workspace-store.ts  # Current workspace, transition state
│   └── navigation-store.ts  # Navigation state (command palette, etc.)
│
├── agents/                  # Agent configuration state
│   ├── agents-store.ts     # Agent definitions (workspace bindings, tool permissions)
│   ├── agent-selection-store.ts  # Active agent selection
│   ├── provider-config-store.ts  # LLM provider configuration
│   └── models-loader-store.ts    # Available models
│
├── knowledge/               # Knowledge workspace state
│   ├── rag-store.ts        # RAG infrastructure state
│   ├── knowledge-store.ts  # Knowledge sources and collections
│   └── source-store.ts     # Individual source state
│
├── study/                   # Study workspace state
│   ├── flashcard-store.ts  # Flashcard state
│   └── quiz-store.ts       # Quiz state
│
└── canvas/                  # Canvas workspace state
    └── canvas-store.ts     # Canvas nodes and connections
```

### Consolidation Strategy

**Phase 1: Audit and Map (Week 1)**
1. Create store mapping document listing all 37 stores with:
   - Current location
   - Purpose and domain
   - Dependencies (imports/exports)
   - Size (LOC)
   - TypeScript errors
   - Duplicate status

**Phase 2: Select Canonical Location (Week 1)**
1. For each store, choose canonical version based on:
   - Least TypeScript errors
   - Best adherence to best practices
   - Most complete implementation
   - Proper Dexie persistence integration

**Phase 3: Migrate and Consolidate (Week 2-3)**
1. Move stores to `src/infrastructure/persistence/stores/[domain]/`
2. Update all import paths
3. Remove duplicate files
4. Add barrel exports (`index.ts`)
5. Update tests

**Phase 4: Validate (Week 4)**
1. Run TypeScript compiler (target: 0 errors)
2. Run test suite (target: 100% passing)
3. Manual smoke test all features

### Best Practices from December 2025 Standards

**Based on Zustand documentation research**:

```typescript
// ✅ CORRECT: Slice pattern for store organization
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Define slice
export interface IDEStoreState {
  openFiles: string[]
  activeFile: string | null
  panels: Panel[]
}

export interface IDEStoreActions {
  openFile: (path: string) => void
  closeFile: (path: string) => void
  setActiveFile: (path: string) => void
}

export type IDEStore = IDEStoreState & IDEStoreActions

// Create store with persistence
export const useIDEStore = create<IDEStore>()(
  persist(
    (set, get) => ({
      // State
      openFiles: [],
      activeFile: null,
      panels: [],

      // Actions
      openFile: (path) => set((state) => ({
        openFiles: [...new Set([...state.openFiles, path])],
        activeFile: path
      })),

      closeFile: (path) => set((state) => ({
        openFiles: state.openFiles.filter(f => f !== path),
        activeFile: state.activeFile === path ? null : state.activeFile
      })),

      setActiveFile: (path) => set({ activeFile: path })
    }),
    {
      name: 'ide-store',  // Unique storage key
      storage: createJSONStorage(() => localStorage),  // Explicit storage
      partialize: (state) => ({  // Only persist essential state
        openFiles: state.openFiles,
        activeFile: state.activeFile,
        panels: state.panels
      })
    }
  )
)
```

**Migration Checklist**:
- ✅ Single canonical location per store
- ✅ Type-safe state and actions
- ✅ Dexie persistence middleware
- ✅ Partial state persistence (exclude derived state)
- ✅ Custom merge logic for nested objects
- ✅ Barrel export in domain directory
- ✅ Comprehensive test coverage
- ✅ Zero TypeScript errors

---

## Part III: Database Schema Consolidation

### Critical Issue: Duplicate Database Definitions

**Current State (CRITICAL)**:
```
src/lib/state/dexie-db.ts           (1,272 lines) ❌
src/infrastructure/persistence/dexie-db.ts  (1,063 lines) ❌
```

**Impact**:
- Schema divergence
- Migration conflicts
- Type safety violations
- Unclear single source of truth

### Target State: Unified Database Schema

**Canonical Location**:
```
src/infrastructure/persistence/
├── dexie-db-class.ts              # Main database class definition
├── dexie-db-schema.ts             # Schema version definitions
├── dexie-db-migrations.ts         # Migration implementations
├── dexie-db-types/                # Type definitions
│   ├── core-types.ts             # Core record types
│   ├── ai-types.ts               # AI-related types
│   ├── session-types.ts          # Session and sync types
│   └── knowledge-types.ts        # Knowledge workspace types
└── dexie-db-utils.ts             # Database utilities
```

### Schema Version Strategy

**Based on Dexie.js documentation research**:

```typescript
import Dexie, { Table } from 'dexie';

import type {
  ProjectRecord,
  ConversationRecord,
  // ... other imports
} from './dexie-db-types';

import { registerMigrations } from './dexie-db-migrations';

/**
 * Via-Gent Database (Single Source of Truth)
 *
 * Schema Version Management:
 * - Increment version for breaking schema changes
 * - Use upgrade() for data migrations
 * - Document changes in migration comments
 */
export class ViaGentDatabase extends Dexie {
  // Core Tables
  projects!: Table<ProjectRecord, number>;
  conversations!: Table<ConversationRecord, number>;

  // AI Tables
  taskContexts!: Table<TaskContextRecord, number>;
  toolExecutions!: Table<ToolExecutionRecord, number>;

  // ... other table declarations

  constructor() {
    super('via-gent-persistence');

    // Register all migrations
    registerMigrations(this);
  }
}

// Singleton instance
export const db = new ViaGentDatabase();
```

**Migration Best Practices** (from Dexie docs):

```typescript
// dexie-db-migrations.ts
export function registerMigrations(db: ViaGentDatabase) {
  // Version 1: Initial schema
  db.version(1).stores({
    projects: '++id, name, createdAt',
    conversations: '++id, projectId, agentId, createdAt'
  });

  // Version 2: Add workspace support
  db.version(2).stores({
    projects: '++id, name, workspaceType, createdAt',  // Add workspaceType index
    conversations: '++id, projectId, agentId, workspaceType, createdAt'
  }).upgrade(async (tx) => {
    // Migration logic: Add default workspaceType to existing records
    await tx.table('projects').toCollection().modify(project => {
      if (!project.workspaceType) {
        project.workspaceType = 'ide';
      }
    });
  });

  // Version 3: Add tool permissions
  db.version(3).stores({
    agents: '++id, name, createdAt'
  }).upgrade(async (tx) => {
    // Migrate agent tool permissions
  });
}
```

**Consolidation Steps**:
1. ✅ Choose canonical schema (infrastructure/persistence version)
2. ✅ Extract type definitions to separate files
3. ✅ Consolidate migration logic
4. ✅ Remove duplicate schema file
5. ✅ Update all imports
6. ✅ Add migration documentation
7. ✅ Test data migration path

---

## Part IV: Domain Layer Creation

### Critical Issue: Missing Business Logic Layer

**Current State**: Business logic scattered across:
- Infrastructure (filesystem, persistence)
- Application (services, hooks)
- Presentation (components)

**Problem**: No clear separation of concerns, business logic coupled to framework details

### Target Domain Layer Structure

#### Entities (Business Objects with Behavior)

```typescript
// src/domain/entities/agent.ts

import { WorkspaceBinding } from '../value-objects/workspace-binding';
import { AgentToolBinding } from '../value-objects/tool-permission';

/**
 * Agent Entity
 *
 * Business Rules:
 * - Agent must have at least one workspace binding
 * - Agent must have at least one enabled tool
 * - Agent cannot be deleted if active in any conversation
 */
export class Agent {
  readonly id: string;
  readonly name: string;
  readonly providerId: string;
  readonly model: string;
  readonly systemPrompt: string;
  readonly workspaceBindings: WorkspaceBinding[];
  readonly tools: AgentToolBinding[];

  constructor(props: AgentProps) {
    this.validateAgentProps(props);
    Object.assign(this, props);
  }

  // Business rule: Agent must be available in at least one workspace
  private validateAgentProps(props: AgentProps): void {
    if (!props.workspaceBindings || props.workspaceBindings.length === 0) {
      throw new Error('Agent must have at least one workspace binding');
    }

    if (!props.tools || props.tools.length === 0) {
      throw new Error('Agent must have at least one tool');
    }

    const hasEnabledTools = props.tools.some(t => t.isEnabled);
    if (!hasEnabledTools) {
      throw new Error('Agent must have at least one enabled tool');
    }
  }

  // Business logic: Check if agent is available in workspace
  isAvailableIn(workspaceType: WorkspaceType): boolean {
    const binding = this.workspaceBindings.find(b => b.workspaceType === workspaceType);
    return binding?.isAvailable ?? false;
  }

  // Business logic: Get UI variant for workspace
  getUIVariant(workspaceType: WorkspaceType): 'full' | 'compact' | 'minimal' {
    const binding = this.workspaceBindings.find(b => b.workspaceType === workspaceType);
    return binding?.uiVariant ?? 'minimal';
  }

  // Business logic: Check if tool is enabled and permitted in workspace
  canExecuteTool(toolId: string, workspaceType: WorkspaceType): boolean {
    const tool = this.tools.find(t => t.toolId === toolId);

    if (!tool || !tool.isEnabled) {
      return false;
    }

    return tool.workspacePermissions[workspaceType] ?? false;
  }
}
```

#### Value Objects (Immutable Types)

```typescript
// src/domain/value-objects/workspace-binding.ts

/**
 * Workspace Binding Value Object
 *
 * Immutable: Once created, cannot be modified
 */
export class WorkspaceBinding {
  readonly workspaceType: WorkspaceType;
  readonly isAvailable: boolean;
  readonly uiVariant: 'full' | 'compact' | 'minimal';
  readonly isDefault: boolean;

  constructor(props: WorkspaceBindingProps) {
    Object.assign(this, props);
    Object.freeze(this);  // Make immutable
  }

  withAvailability(isAvailable: boolean): WorkspaceBinding {
    return new WorkspaceBinding({ ...this, isAvailable });
  }

  withUIVariant(uiVariant: 'full' | 'compact' | 'minimal'): WorkspaceBinding {
    return new WorkspaceBinding({ ...this, uiVariant });
  }
}
```

#### Domain Services (Stateless Business Logic)

```typescript
// src/domain/services/agent-orchestration-service.ts

import { Agent } from '../entities/agent';
import { WorkspaceType } from '../value-objects/workspace-type';

/**
 * Agent Orchestration Domain Service
 *
 * Stateless business logic for agent selection and validation
 */
export class AgentOrchestrationService {
  /**
   * Select best available agent for workspace
   *
   * Business Rules:
   * 1. Prefer agents marked as default for workspace
   * 2. Fall back to first available agent
   * 3. Return null if no agents available
   */
  selectAgentForWorkspace(
    agents: Agent[],
    workspaceType: WorkspaceType
  ): Agent | null {
    const availableAgents = agents.filter(agent =>
      agent.isAvailableIn(workspaceType)
    );

    if (availableAgents.length === 0) {
      return null;
    }

    // Prefer default agent
    const defaultAgent = availableAgents.find(agent =>
      agent.workspaceBindings.find(b =>
        b.workspaceType === workspaceType && b.isDefault
      )
    );

    return defaultAgent ?? availableAgents[0];
  }

  /**
   * Validate agent configuration
   *
   * Business Rules:
   * 1. At least one agent must be available in each workspace
   * 2. Each workspace must have a default agent
   */
  validateAgentConfiguration(agents: Agent[], workspaceTypes: WorkspaceType[]): ValidationResult {
    const errors: string[] = [];

    for (const workspaceType of workspaceTypes) {
      const availableAgents = agents.filter(a => a.isAvailableIn(workspaceType));

      if (availableAgents.length === 0) {
        errors.push(`No agents available for workspace: ${workspaceType}`);
      }

      const defaultAgent = availableAgents.find(a =>
        a.workspaceBindings.find(b => b.workspaceType === workspaceType && b.isDefault)
      );

      if (!defaultAgent) {
        errors.push(`No default agent for workspace: ${workspaceType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

#### Use Cases (Transaction Scripts)

```typescript
// src/domain/use-cases/switch-workspace-use-case.ts

import { Agent } from '../entities/agent';
import { WorkspaceType } from '../value-objects/workspace-type';
import { AgentOrchestrationService } from '../services/agent-orchestration-service';
import { AgentRepository } from '../repositories/agent-repository';

/**
 * Switch Workspace Use Case
 *
 * Transaction script that orchestrates workspace transition
 */
export class SwitchWorkspaceUseCase {
  constructor(
    private agentRepo: AgentRepository,
    private agentService: AgentOrchestrationService
  ) {}

  async execute(targetWorkspace: WorkspaceType): Promise<WorkspaceTransitionResult> {
    // 1. Get all agents
    const agents = await this.agentRepo.findAll();

    // 2. Select appropriate agent for new workspace
    const selectedAgent = this.agentService.selectAgentForWorkspace(agents, targetWorkspace);

    if (!selectedAgent) {
      throw new Error(`No agents available for workspace: ${targetWorkspace}`);
    }

    // 3. Emit domain event
    // (handled by application layer)

    return {
      success: true,
      workspace: targetWorkspace,
      agentId: selectedAgent.id
    };
  }
}
```

---

## Part V: State Orchestration Blueprint

### Critical Issue: No Unified State Management

**Current State**:
- Stores update independently
- No coordination between related state changes
- Race conditions in workspace transitions
- Inconsistent state across components

### Target: Event-Driven State Orchestration

#### Event Bus Architecture

```typescript
// src/infrastructure/events/event-bus.ts

import EventEmitter from 'eventemitter3';

/**
 * Domain Events
 */
export enum DomainEventType {
  // Workspace events
  WORKSPACE_TRANSITION_STARTED = 'workspace:transition:started',
  WORKSPACE_TRANSITION_COMPLETED = 'workspace:transition:completed',
  WORKSPACE_TRANSITION_FAILED = 'workspace:transition:failed',

  // Agent events
  AGENT_SELECTED = 'agent:selected',
  AGENT_CONFIG_UPDATED = 'agent:config:updated',

  // Conversation events
  CONVERSATION_CREATED = 'conversation:created',
  CONVERSATION_MESSAGE_ADDED = 'conversation:message:added',

  // Provider events
  PROVIDER_KEY_SET = 'provider:key:set',
  PROVIDER_MODELS_FETCHED = 'provider:models:fetched'
}

export interface DomainEvent {
  type: DomainEventType;
  payload: unknown;
  timestamp: number;
  correlationId?: string;
}

/**
 * Event Bus (Infrastructure)
 *
 * Cross-cutting event system for state coordination
 */
export class EventBus {
  private emitter = new EventEmitter();
  private eventLog: DomainEvent[] = [];

  emit<T>(eventType: DomainEventType, payload: T, correlationId?: string): void {
    const event: DomainEvent = {
      type: eventType,
      payload,
      timestamp: Date.now(),
      correlationId
    };

    this.eventLog.push(event);
    this.emitter.emit(eventType, event);
  }

  on<T>(
    eventType: DomainEventType,
    handler: (event: DomainEvent & { payload: T }) => void
  ): () => void {
    this.emitter.on(eventType, handler);

    // Return unsubscribe function
    return () => this.emitter.off(eventType, handler);
  }

  once<T>(
    eventType: DomainEventType,
    handler: (event: DomainEvent & { payload: T }) => void
  ): void {
    this.emitter.once(eventType, handler);
  }

  getEventLog(): DomainEvent[] {
    return [...this.eventLog];
  }
}

// Singleton instance
export const eventBus = new EventBus();
```

#### State Orchestrator

```typescript
// src/infrastructure/persistence/state-orchestrator.ts

import { eventBus, DomainEventType } from '../events/event-bus';
import { useWorkspaceStore } from './stores/workspace-store';
import { useAgentSelectionStore } from './stores/agents/agent-selection-store';
import { useAgentsStore } from './stores/agents/agents-store';

/**
 * State Orchestrator
 *
 * Coordinates state updates across multiple stores
 */
export class StateOrchestrator {
  private isTransitioning = false;

  constructor() {
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    // Workspace transition handler
    eventBus.on(
      DomainEventType.WORKSPACE_TRANSITION_STARTED,
      this.handleWorkspaceTransitionStarted.bind(this)
    );

    // Provider key set handler
    eventBus.on(
      DomainEventType.PROVIDER_KEY_SET,
      this.handleProviderKeySet.bind(this)
    );

    // Agent config updated handler
    eventBus.on(
      DomainEventType.AGENT_CONFIG_UPDATED,
      this.handleAgentConfigUpdated.bind(this)
    );
  }

  private async handleWorkspaceTransitionStarted(event: DomainEvent & {
    payload: { from: WorkspaceType; to: WorkspaceType }
  }): Promise<void> {
    if (this.isTransitioning) {
      console.warn('[StateOrchestrator] Transition already in progress');
      return;
    }

    try {
      this.isTransitioning = true;

      const { from, to } = event.payload;

      // Step 1: Update workspace store
      useWorkspaceStore.getState().setCurrentWorkspace(to);

      // Step 2: Filter agents for new workspace
      const allAgents = useAgentsStore.getState().agents;
      const availableAgents = allAgents.filter(agent =>
        agent.isAvailableIn(to)
      );

      // Step 3: Check if current agent needs re-selection
      const currentAgentId = useAgentSelectionStore.getState().activeAgentId;
      const currentAgent = allAgents.find(a => a.id === currentAgentId);
      const agentNeedsReselection = !currentAgent || !currentAgent.isAvailableIn(to);

      // Step 4: Re-select agent if needed
      if (agentNeedsReselection) {
        // Find default agent for new workspace
        const defaultAgent = availableAgents.find(agent =>
          agent.workspaceBindings.find(b =>
            b.workspaceType === to && b.isDefault
          )
        );

        // Fall back to first available agent
        const newAgent = defaultAgent ?? availableAgents[0];

        if (newAgent) {
          useAgentSelectionStore.getState().setActiveAgent(newAgent.id);
        }
      }

      // Step 5: Emit completion event
      eventBus.emit(
        DomainEventType.WORKSPACE_TRANSITION_COMPLETED,
        { from, to, agentId: useAgentSelectionStore.getState().activeAgentId },
        event.correlationId
      );

    } catch (error) {
      eventBus.emit(
        DomainEventType.WORKSPACE_TRANSITION_FAILED,
        { error: error.message },
        event.correlationId
      );
    } finally {
      this.isTransitioning = false;
    }
  }

  private async handleProviderKeySet(event: DomainEvent & {
    payload: { providerId: string; apiKey: string }
  }): Promise<void> {
    const { providerId } = event.payload;

    // Trigger model fetch for provider
    // (handled by provider-config-store)
  }

  private async handleAgentConfigUpdated(event: DomainEvent & {
    payload: { agentId: string }
  }): Promise<void> {
    // Refresh agent selections if needed
    const currentAgentId = useAgentSelectionStore.getState().activeAgentId;
    const updatedAgent = useAgentsStore.getState().getAgent(event.agentId);

    if (updatedAgent && currentAgentId === event.agentId) {
      // Emit agent re-selected event to trigger UI updates
      eventBus.emit(
        DomainEventType.AGENT_SELECTED,
        { agentId: updatedAgent.id, workspaceType: useWorkspaceStore.getState().currentWorkspace }
      );
    }
  }
}

// Singleton instance
export const stateOrchestrator = new StateOrchestrator();
```

---

## Part VI: Implementation Roadmap

### Sprint 1: Foundation (Week 1-2)

**Objective**: Establish architectural foundation

**Tasks**:
1. ✅ Create domain layer structure
2. ✅ Implement event bus infrastructure
3. ✅ Create state orchestrator
4. ✅ Audit and map all stores
5. ✅ Choose canonical store versions

**Deliverables**:
- `src/domain/` directory with entities, value objects, services
- Event bus implementation
- Store mapping document
- Architecture Decision Records (ADRs)

### Sprint 2: Store Consolidation (Week 3-4)

**Objective**: Eliminate store duplication

**Tasks**:
1. ✅ Consolidate stores to `src/infrastructure/persistence/stores/`
2. ✅ Update all import paths
3. ✅ Remove duplicate files
4. ✅ Add barrel exports
5. ✅ Fix TypeScript errors in stores

**Deliverables**:
- 37 stores consolidated to single locations
- Zero duplicate store files
- All import paths updated
- TypeScript compilation successful

### Sprint 3: Database Consolidation (Week 5)

**Objective**: Unify database schema

**Tasks**:
1. ✅ Consolidate `dexie-db.ts` to single file
2. ✅ Extract type definitions
3. ✅ Consolidate migrations
4. ✅ Update all imports
5. ✅ Test data migration

**Deliverables**:
- Single database schema definition
- Migration documentation
- Data migration tested

### Sprint 4: Component Refactoring (Week 6-8)

**Objective**: Eliminate god classes

**Tasks**:
1. ✅ Refactor AgentConfigDialog.tsx (1,171 → <200 lines)
2. ✅ Split into smaller components
3. ✅ Extract business logic to domain/use-cases
4. ✅ Implement workspace permissions UI
5. ✅ Add comprehensive tests

**Deliverables**:
- AgentConfigDialog refactored to <200 lines
- Workspace permission UI complete
- Test coverage >90%

### Sprint 5: Type Safety (Week 9-10)

**Objective**: Eliminate TypeScript errors

**Tasks**:
1. ✅ Fix production errors (306)
2. ✅ Fix test errors (866)
3. ✅ Add missing type definitions
4. ✅ Correct API mismatches
5. ✅ Enable strict mode

**Deliverables**:
- Zero TypeScript errors
- Strict mode enabled
- Type safety verified

### Sprint 6: Integration & Validation (Week 11-12)

**Objective**: End-to-end validation

**Tasks**:
1. ✅ Execute 12-level sweeping validation
2. ✅ Performance profiling
3. ✅ 3-device rule testing
4. ✅ User journey validation
5. ✅ Documentation updates

**Deliverables**:
- 100/100 validation score
- Performance benchmarks met
- Documentation complete

---

## Part VII: Architecture Decision Records

### ADR-001: Domain Layer Creation

**Status**: Accepted
**Date**: 2026-01-01
**Context**: Business logic scattered across infrastructure, application, and presentation layers
**Decision**: Create explicit domain layer with entities, value objects, services, and use cases
**Consequences**:
- ✅ Clear separation of concerns
- ✅ Business logic independent of frameworks
- ✅ Improved testability
- ⚠️ Increased code structure complexity
- ⚠️ Migration effort required

### ADR-002: Store Consolidation

**Status**: Accepted
**Date**: 2026-01-01
**Context**: 37 stores duplicated across 4 locations causing maintenance nightmare
**Decision**: Consolidate all stores to `src/infrastructure/persistence/stores/` with domain-based organization
**Consequences**:
- ✅ Single source of truth for state
- ✅ Easier maintenance and refactoring
- ✅ Clear domain boundaries
- ⚠️ Breaking changes for all imports
- ⚠️ Migration complexity

### ADR-003: Event-Driven State Orchestration

**Status**: Accepted
**Date**: 2026-01-01
**Context**: No coordination between store updates causing race conditions
**Decision**: Implement event bus with state orchestrator for cross-store coordination
**Consequences**:
- ✅ Coordinated state updates
- ✅ Eliminated race conditions
- ✅ Better debugging with event log
- ⚠️ Added architectural complexity
- ⚠️ Learning curve for developers

### ADR-004: Component Size Limit (120 lines)

**Status**: Accepted
**Date**: 2026-01-01
**Context**: Components exceeding 300 lines (AgentConfigDialog at 1,171 lines)
**Decision**: Enforce 120-line maximum for components, extract business logic to domain layer
**Consequences**:
- ✅ Improved maintainability
- ✅ Better single responsibility
- ✅ Easier testing
- ⚠️ More files to manage
- ⚠️ Increased indirection

---

## Part VIII: Quality Standards

### Code Quality Metrics

**Component Standards**:
- ✅ Maximum 120 lines per component
- ✅ Maximum 3 functions per module
- ✅ Maximum 5 dependencies per component
- ✅ Maximum 3 nesting levels
- ✅ Maximum 5 parameters per function

**Store Standards**:
- ✅ Single source of truth (no duplicates)
- ✅ Dexie persistence for all persistent state
- ✅ Type-safe state and actions
- ✅ Partial state persistence (exclude derived state)
- ✅ Comprehensive test coverage

**TypeScript Standards**:
- ✅ Zero TypeScript errors
- ✅ Strict mode enabled
- ✅ No `any` types (use `unknown` if necessary)
- ✅ Interface over type for props
- ✅ Explicit return types

### Testing Standards

**Coverage Requirements**:
- ✅ Unit tests: >90% coverage
- ✅ Integration tests: Critical paths covered
- ✅ E2E tests: User journeys covered

**Test Organization**:
```
src/
├── domain/
│   └── entities/
│       └── __tests__/
│           └── entity.test.ts
├── infrastructure/
│   └── persistence/
│       └── stores/
│           └── __tests__/
│               └── store.test.ts
└── presentation/
    └── components/
        └── __tests__/
            └── component.test.tsx
```

---

## Conclusion

This architectural specification provides a complete blueprint for transforming the codebase to a clean, maintainable, scalable architecture following December 2025 best practices.

**Key Transformations**:
1. ✅ Domain layer creation for business logic
2. ✅ Store consolidation (37 stores → organized structure)
3. ✅ Database schema unification
4. ✅ Event-driven state orchestration
5. ✅ Component refactoring (1,171 lines → <200 lines)
6. ✅ Type safety (200+ errors → 0 errors)

**Target Validation Score**: 100/100

**Implementation Timeline**: 12 weeks (3 sprints)

**Next Steps**:
1. Review and approve specification
2. Begin Sprint 1: Foundation
3. Create GitHub issues for each task
4. Set up CI/CD quality gates

---

**Document Version**: 3.0.0
**Last Updated**: 2026-01-01T09:00:00+07:00
**Author**: @bmad-bmm-architect
**Status**: READY FOR IMPLEMENTATION
