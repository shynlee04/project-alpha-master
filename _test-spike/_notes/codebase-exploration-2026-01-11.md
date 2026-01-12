---
date: 2026-01-11
phase: Exploration
team: Team A (Test Spike)
---

# Codebase Exploration Report

## Executive Summary

This exploration identifies core agentic components in the Project Alpha codebase that need to be mirrored into `_test-spike/_mirror/` for real agentic workflow testing. The codebase follows **Clean Architecture** with clear separation between domain, infrastructure, and presentation layers.

## 1. Tool Registry Components

### Core Files
| File Path | Purpose | Exports | Dependencies |
|-----------|---------|---------|--------------|
| [`src/domain/tools/tool-definition.ts`](src/domain/tools/tool-definition.ts) | Tool registry types, metadata, filter config | `ToolMetadata`, `ToolFilterConfig`, `RegisteredTool`, `IToolRegistry`, `AgentMode`, `ToolExecutionSide`, `createToolMetadata()`, `createRegisteredTool()` | `@tanstack/ai`, `WorkspaceType`, `ToolTrustLevel`, `ToolCategory`, `ToolRiskLevel` |
| [`src/domain/tools/tool-permissions.ts`](src/domain/tools/tool-permissions.ts) | Permission types and categories | `ToolTrustLevel`, `ToolCategory`, `ToolRiskLevel` | None (pure types) |
| [`src/domain/tools/index.ts`](src/domain/tools/index.ts) | Barrel export | All tool definitions and permissions | None |
| [`src/domain/tools/note/index.ts`](src/domain/tools/note/index.ts) | Note tool exports | CRUD tools for notes | `@tanstack/ai` |

### Tool Categories Identified
- `files`, `terminal`, `knowledge`, `vision`, `search`, `web`, `notes`, `unified`, `composite`, `provider`

### Trust Levels
- `auto`: Executes without prompting
- `prompt`: User must approve each execution
- `block`: Tool is blocked from execution

### Risk Levels
- `low`, `medium`, `high` - for approval flow prioritization

### Key Interfaces
```typescript
interface IToolRegistry {
  register(tool: RegisteredTool): void;
  unregister(id: string): boolean;
  get(id: string): RegisteredTool | undefined;
  getFilteredTools(config: ToolFilterConfig): RegisteredTool[];
  getServerExposedTools(config?: Omit<ToolFilterConfig, 'serverExposedOnly'>): RegisteredTool[];
}
```

---

## 2. Agent Execution Layer

### Core Files
| File Path | Purpose | Key Functions | State Management |
|-----------|---------|---------------|------------------|
| [`src/domain/entities/agent.ts`](src/domain/entities/agent.ts) | Agent entity with business logic | `isAvailableIn()`, `isDefaultFor()`, `canExecuteTool()`, `getEnabledToolsFor()`, `withUpdates()` | Immutable class pattern with validation |
| [`src/domain/services/agent-orchestration-service.ts`](src/domain/services/agent-orchestration-service.ts) | Stateless agent business logic | `selectAgentForWorkspace()`, `validateAgentConfiguration()`, `needsReselection()`, `getAgentsWithTools()` | Stateless service |
| [`src/domain/services/agent-workspace-utils.ts`](src/domain/services/agent-workspace-utils.ts) | Workspace-aware utilities | `isAgentAvailableIn()`, `isAgentDefaultFor()`, `getAgentsForWorkspace()`, `getDefaultAgentForWorkspace()` | Pure functions |

### Agent Store Architecture
| File Path | Purpose | Slice Pattern |
|-----------|---------|---------------|
| [`src/infrastructure/persistence/stores/agents/agent-selection-store.ts`](src/infrastructure/persistence/stores/agents/agent-selection-store.ts) | Agent CRUD operations | Slice pattern |
| [`src/infrastructure/persistence/stores/agents/slices/agent-selection-actions.ts`](src/infrastructure/persistence/stores/agents/slices/agent-selection-actions.ts) | Agent selection actions | Slice pattern |
| [`src/infrastructure/persistence/stores/agents/slices/agent-selection-state.ts`](src/infrastructure/persistence/stores/agents/slices/agent-selection-state.ts) | Agent state definitions | Slice pattern |
| [`src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts`](src/infrastructure/persistence/stores/agents/slices/agent-validation-slice.ts) | Agent validation logic | Slice pattern |

### Agent Tool Execution
| File Path | Purpose | Key Methods |
|-----------|---------|------------|
| [`src/infrastructure/persistence/stores/chat/slices/tool-execution-slice.ts`](src/infrastructure/persistence/stores/chat/slices/tool-execution-slice.ts) | Tool call tracking and approval | `createToolCall()`, `updateToolCall()`, `approveToolCall()`, `denyToolCall()`, `autoApproveToolCall()` |

### Agent Entity Properties
```typescript
interface AgentProps {
  id: string;
  name: string;
  providerId: string;
  model: string;
  systemPrompt: string;
  workspaceBindings: WorkspaceBindingInput[];
  tools: AgentToolBindingInput[];
  status?: AgentStatus;
  createdAt: number;
  updatedAt: number;
}
```

---

## 3. Filesystem & Permissions

### Permission System Architecture
| File Path | Purpose | Permission Checks | CRUD Operations |
|-----------|---------|-------------------|-----------------|
| [`src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`](src/infrastructure/persistence/stores/permissions/tool-permission-store.ts) | Workspace-scoped tool permissions | `setTrustLevel()`, `getTrustLevel()`, `isYOLOActive()`, `isCategoryApproved()` | Zustand persist with Dexie storage |
| [`src/infrastructure/persistence/stores/permissions/types.ts`](src/infrastructure/persistence/stores/permissions/types.ts) | Permission state interfaces | `ToolPermissionState`, `YOLOMode`, `CategoryApprovalState` | Type definitions |
| [`src/infrastructure/persistence/stores/permissions/slices/permission-actions-slice.ts`](src/infrastructure/persistence/stores/permissions/slices/permission-actions-slice.ts) | Permission actions | Permission management actions | Slice pattern |
| [`src/infrastructure/persistence/stores/permissions/selectors.ts`](src/infrastructure/persistence/stores/permissions/selectors.ts) | Permission selectors | `selectNeedsApproval()`, `selectCanExecute()`, `selectToolsByLevel()` | Zustand selectors |
| [`src/infrastructure/persistence/stores/filesystem/snapshot-types.ts`](src/infrastructure/persistence/stores/filesystem/snapshot-types.ts) | Filesystem snapshot types | `FileSnapshot`, `SnapshotMetadata` | Type definitions |

### Permission Profiles
- **Trust Levels**: `auto`, `prompt`, `block` per tool per workspace
- **YOLO Mode**: Temporary full-auto permission (24h expiry)
- **Category Approvals**: Workspace-specific category-level approval

### Value Objects
| File Path | Purpose |
|-----------|---------|
| [`src/domain/value-objects/workspace-binding.ts`](src/domain/value-objects/workspace-binding.ts) | Agent workspace binding |
| [`src/domain/value-objects/tool-permission.ts`](src/domain/value-objects/tool-permission.ts) | Tool permission binding |
| [`src/domain/value-objects/workspace-type.ts`](src/domain/value-objects/workspace-type.ts) | Workspace type enum |

---

## 4. Backend Routes

### Current State
| Route | Purpose | Handler | Required For |
|-------|---------|---------|--------------|
| `api/index.js` | API entry point | Basic index | Basic routing |

### Architecture Notes
- **TanStack Start** handles server functions automatically
- No traditional API routes - uses server functions in `src/routes/`
- Tool execution happens via TanStack AI runtime, not HTTP endpoints

### Backend Functions Location
- `src/routes/` - TanStack Router routes with server functions
- `src/infrastructure/` - Infrastructure layer for server operations

---

## 5. Shared Domain Services

| Service | Location | Purpose | Agent Dependencies |
|---------|----------|---------|-------------------|
| `AgentOrchestrationService` | [`src/domain/services/agent-orchestration-service.ts`](src/domain/services/agent-orchestration-service.ts) | Agent selection and validation | Stateless, uses Agent entity |
| `agent-workspace-utils` | [`src/domain/services/agent-workspace-utils.ts`](src/domain/services/agent-workspace-utils.ts) | Workspace-aware agent utilities | Pure functions, no deps |
| `ProjectRegistry` | [`src/domain/services/ProjectRegistry.ts`](src/domain/services/ProjectRegistry.ts) | Project namespace management | Uses Dexie for persistence |
| `UniversalProviderRegistry` | [`src/domain/services/universal-provider-registry.ts`](src/domain/services/universal-provider-registry.ts) | LLM provider management | Stateless registry |
| `UniversalAdapterFactory` | [`src/domain/services/universal-adapter-factory.ts`](src/domain/services/universal-adapter-factory.ts) | Provider adapter creation | Uses provider registry |

### State Stores
| Store | Location | Purpose |
|-------|----------|---------|
| `useToolPermissionStore` | [`src/infrastructure/persistence/stores/permissions/tool-permission-store.ts`](src/infrastructure/persistence/stores/permissions/tool-permission-store.ts) | Permission trust levels |
| `useAgentSelectionStore` | [`src/infrastructure/persistence/stores/agents/agent-selection-store.ts`](src/infrastructure/persistence/stores/agents/agent-selection-store.ts) | Agent CRUD |
| `useUnifiedChatStore` | [`src/infrastructure/persistence/stores/chat/unified-chat-store.ts`](src/infrastructure/persistence/stores/chat/unified-chat-store.ts) | Chat and tool execution |
| `useIDEStore` | [`src/infrastructure/persistence/stores/ide/useIDEStore.ts`](src/infrastructure/persistence/stores/ide/useIDEStore.ts) | IDE state |

---

## Dependency Map

```
[Tool Registry] → [Agent Orchestrator] → [Filesystem Abstraction]
       ↓                    ↓                       ↓
[Permissions]         [State Stores]          [Backend Routes]
       ↓                    ↓                       ↓
[YOLO Mode]      [Agent Selection]       [TanStack Start]
       ↓                    ↓                       ↓
[Category        [Workspace              [Server Functions]
 Approval]       Bindings]
```

---

## Files to Copy (Priority List)

### Must Copy (Critical for Agent Runtime)
1. `src/domain/tools/tool-definition.ts` - Tool registry core
2. `src/domain/tools/tool-permissions.ts` - Permission types
3. `src/domain/entities/agent.ts` - Agent entity
4. `src/domain/services/agent-orchestration-service.ts` - Orchestration logic
5. `src/domain/services/agent-workspace-utils.ts` - Workspace utilities
6. `src/domain/value-objects/workspace-binding.ts` - Workspace binding VO
7. `src/domain/value-objects/tool-permission.ts` - Tool permission VO
8. `src/domain/value-objects/workspace-type.ts` - Workspace type VO
9. `src/infrastructure/persistence/stores/permissions/tool-permission-store.ts` - Permission store
10. `src/infrastructure/persistence/stores/permissions/types.ts` - Permission types
11. `src/infrastructure/persistence/stores/permissions/selectors.ts` - Permission selectors
12. `src/infrastructure/persistence/stores/chat/slices/tool-execution-slice.ts` - Tool execution

### Should Copy (Enhances Testing Fidelity)
1. `src/infrastructure/persistence/stores/agents/` - Agent store with slices
2. `src/infrastructure/persistence/stores/permissions/slices/` - Permission actions slice
3. `src/domain/services/ProjectRegistry.ts` - Project registry service
4. `src/domain/services/universal-provider-registry.ts` - Provider registry
5. `src/domain/services/universal-adapter-factory.ts` - Adapter factory

### Nice to Copy (Optional Enhancements)
1. `src/infrastructure/persistence/stores/filesystem/` - Filesystem snapshots
2. `src/infrastructure/persistence/stores/chat/unified-chat-store.ts` - Full chat store
3. `src/domain/tools/note/` - Note tool implementations
4. `src/domain/tools/provider/` - Provider tool implementations

---

## Notes & Observations

### Architecture Strengths
- **Clean Architecture**: Clear separation between domain, infrastructure, and presentation
- **Slice Pattern**: Eliminates God Store anti-pattern (ADR-024)
- **Type Safety**: TypeScript throughout with strict typing
- **Immutable Entities**: Agent entity uses immutable pattern with validation
- **Persistence**: Zustand with Dexie storage for offline capability

### Missing Components for Test Spike
1. **No traditional API routes** - Uses TanStack Start server functions
2. **WebContainer dependency** - Requires browser environment for filesystem operations
3. **TanStack AI runtime** - Tool execution tied to AI framework
4. **Browser-specific APIs** - crypto.randomUUID(), IndexedDB via Dexie

### Architecture Concerns
1. **Tight coupling** between permission store and Dexie persistence
2. **WebContainer dependency** for real filesystem operations
3. **Browser-only features** (YOLO mode expiry checking)
4. **Circular dependencies** in agent-selection-store (story AC-1.5)

### Dependencies to Mock/Stub
- `@tanstack/ai` - AI runtime for tool execution
- `dexie` - IndexedDB wrapper for persistence
- `zustand` - State management
- `@webcontainer/api` - Browser filesystem
- `crypto.randomUUID()` - Browser crypto API

---

## Exploration Checklist
- [x] All tool registry files identified
- [x] Agent execution layer fully mapped
- [x] Filesystem abstraction layer documented
- [x] Permission enforcement mechanisms understood
- [x] Backend routes cataloged
- [x] Dependency map created
- [x] Priority copy list generated

---

*Generated: 2026-01-11 | Team: Team A (Test Spike) | Phase: Exploration*
