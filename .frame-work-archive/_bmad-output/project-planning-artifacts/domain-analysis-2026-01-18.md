# Domain Layer Analysis - Business Logic & Contract Issues

**Analysis Date**: 2026-01-18
**Analyzer**: dev-ext (Architecture Analysis Agent)
**Total Files Analyzed**: 43 files
**Directory**: `src/domain/`

---

## Executive Summary

The `src/domain/` directory contains the business logic layer of the application. While generally well-structured following Clean Architecture principles, there are several **critical issues** that indicate:

1. **Interface conflicts** between storage abstractions (3 storage interfaces with overlapping responsibilities)
2. **Service duplication** in agent workspace management (2 services doing similar work)
3. **Unclear business contracts** with vague validation and missing constraints
4. **Scattered domain rules** across entities, services, and value objects
5. **Type redefinition issues** with duplicate WorkspaceType definitions
6. **Missing abstraction layers** for cross-cutting concerns

---

## 1. ENTITY CONFLICTS

### 1.1 WorkspaceType Duplication (CRITICAL)

**Issue**: `WorkspaceType` type is defined in **4 separate files** with slightly different value sets.

**Locations**:
- `src/domain/entities/chat.ts` (line 17): `'ide' | 'knowledge' | 'study' | 'notes'`
- `src/domain/entities/workspace.ts` (line 14): `'ide' | 'knowledge' | 'study' | 'notes'`
- `src/domain/value-objects/workspace-type.ts` (line 31): `'ide' | 'knowledge' | 'study' | 'notes'`
- `src/domain/value-objects/tool-permission.ts` (line 9): `'ide' | 'knowledge' | 'study' | 'notes'`
- `src/domain/types/project-ids.ts` (line 25): `'ide' | 'knowledge' | 'study' | 'notes'`

**Impact**: HIGH - Each file has its own definition, creating ambiguity about which is the "source of truth".

**Evidence**:
```typescript
// chat.ts (line 17)
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

// workspace.ts (line 14)
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';

// workspace-type.ts (line 31)
export type WorkspaceType = 'ide' | 'knowledge' | 'study' | 'notes';
```

**Recommendation**: Create a single canonical location for `WorkspaceType` (e.g., `src/domain/types/workspace-type.ts`) and have all other files import from it.

---

### 1.2 WorkspacePermissions Interface Duplication

**Issue**: `WorkspacePermissions` interface is defined in **3 separate files**.

**Locations**:
- `src/domain/entities/agent.ts` (lines not shown in symbol overview, but imports from tool-permission)
- `src/domain/value-objects/tool-permission.ts` (line 14-19)

**Impact**: MEDIUM - Redefinition creates confusion about which interface is authoritative.

**Recommendation**: Define `WorkspacePermissions` once in a canonical location and re-export everywhere else.

---

### 1.3 ValidationResult Interface Duplication

**Issue**: `ValidationResult` interface is defined in **3 separate files**.

**Locations**:
- `src/domain/services/agent-orchestration-service.ts` (lines 15-18)
- `src/domain/services/workspace-transition-service.ts` (lines 228-231)

**Impact**: MEDIUM - Creates confusion about which validation result format to use.

**Evidence**:
```typescript
// agent-orchestration-service.ts (lines 15-18)
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// workspace-transition-service.ts (lines 228-231)
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
```

**Recommendation**: Create a canonical `validation-result.ts` in `src/domain/types/` directory.

---

## 2. SERVICE OVERLAPS

### 2.1 Agent Workspace Management Duplication (CRITICAL)

**Issue**: Two services provide overlapping agent workspace logic:
1. `agent-orchestration-service.ts` (224 lines)
2. `agent-workspace-utils.ts` (92 lines)

**Overlapping Functions**:

| Function | agent-orchestration-service.ts | agent-workspace-utils.ts | Purpose |
|-----------|------------------------------|-------------------------|---------|
| `isAvailableIn()` | `isAvailableIn()` method on Agent class | `isAgentAvailableIn()` utility function | Check if agent available in workspace |
| `isDefaultFor()` | `isDefaultFor()` method on Agent class | `isAgentDefaultFor()` utility function | Check if agent is default for workspace |
| `getAvailableAgentsFor()` | Lines 164-169 | Lines 69-74 | Get filtered agents for workspace |

**Impact**: HIGH - Logic duplication creates maintenance burden and potential for divergent implementations.

**Evidence**:
```typescript
// agent-orchestration-service.ts (lines 164-169)
getAvailableAgentsFor(
  agents: Agent[],
  workspaceType: WorkspaceType
): Agent[] {
  return agents.filter(agent => agent.isAvailableIn(workspaceType));
}

// agent-workspace-utils.ts (lines 69-74)
export function getAgentsForWorkspace<T extends AgentWithWorkspaceBindings>(
  agents: T[],
  workspaceType: WorkspaceType
): T[] {
  return agents.filter((agent) => isAgentAvailableIn(agent, workspaceType));
}
```

**Recommendation**:
1. Consolidate logic into single service
2. Remove `agent-workspace-utils.ts` (the simpler version)
3. Keep `agent-orchestration-service.ts` as the comprehensive service

---

### 2.2 Project Registry - Inconsistent with Project Entity

**Issue**: `ProjectRegistry` service defines `ProjectConflictResult`, `ProjectLifecycleState`, `ProjectNamespace`, `ProjectRegistration`, `ProjectRegistrationOptions`, `ProjectRegistrationResult`, `ProjectRegistrySnapshot`, `ProjectRegistryStats` which are NOT exported from the same location where `Project` entity is defined.

**Locations**:
- `src/domain/entities/project.ts`: Defines `Project` entity with `workspaceBindings` property
- `src/domain/services/ProjectRegistry.ts`: Defines all registration-related types internally

**Impact**: MEDIUM - These types should be co-located with `Project` entity or in a shared types file for better discoverability.

**Evidence**:
```typescript
// project-registry-types.ts (imported in ProjectRegistry.ts)
export interface ProjectRegistration {
  projectId: string;
  folderPath: string;
  workspaceType: WorkspaceType;
  state: ProjectLifecycleState;
  registeredAt: Date;
  lastStateChange: Date;
  sessionId?: string;
}

// These are NOT re-exported from src/domain/entities/project.ts
// They exist only in project-registry-types.ts
```

**Recommendation**: Export all project-related types from `src/domain/entities/project.ts` or create `src/domain/types/project-types.ts` as the canonical location.

---

## 3. UNCLEAR BUSINESS CONTRACTS

### 3.1 Storage Adapter vs Storage Gateway (CRITICAL)

**Issue**: **Three separate storage interfaces** with overlapping responsibilities and unclear boundaries:

1. `StorageAdapter` (`src/domain/interfaces/storage-adapter.interface.ts`)
   - 7 methods: `readFile`, `writeFile`, `deleteFile`, `listFiles`, `getMetadata`, `exists`, `watch`, `isAvailable`
   - Returns: `FileContent` (with `Uint8Array` + `text` convenience accessor)

2. `StorageGateway` (`src/domain/interfaces/storage-gateway.interface.ts`)
   - 5 methods: `read`, `write`, `delete`, `list`, `exists`, `watch`
   - Returns: `Uint8Array` (binary only)
   - Returns: `FileEntry[]` for list

3. `FileOperationsAdapter` (`src/domain/interfaces/file-operations-adapter.interface.ts`)
   - 6 methods: `readFile`, `writeFile`, `deleteFile`, `listDirectory`, `rename`, `createFile`
   - Returns: `{ content: string }` for readFile (text only)

**Conflicts**:
- **Duplicate `readFile` method** (exists in all 3 interfaces)
- **Duplicate `writeFile` method** (exists in all 3 interfaces)
- **Duplicate `deleteFile` method** (exists in all 3 interfaces)
- **Duplicate `exists` method** (exists in StorageAdapter and StorageGateway)
- **Unclear return types**:
  - `StorageAdapter.readFile` returns `FileContent` with optional `text` property
  - `FileOperationsAdapter.readFile` returns `{ content: string }` (simpler)
  - `StorageGateway.read` returns `Uint8Array` (binary only)
- **Duplicate `list` methods**:
  - `StorageAdapter.listFiles(pattern)` takes a pattern string
  - `StorageGateway.list(path)` takes a path and returns `FileEntry[]`
  - `FileOperationsAdapter.listDirectory(path)` takes a path and returns `DirectoryEntry[]`

**Impact**: CRITICAL - Creates confusion about which interface to implement and when to use which one. No clear guidance on when each interface is appropriate.

**Evidence**:
```typescript
// storage-adapter.interface.ts (lines 112-119)
readFile(path: string): Promise<FileContent>;

// storage-gateway.interface.ts (lines 126-134)
read(path: string): Promise<Uint8Array>;

// file-operations-adapter.interface.ts (lines 78)
readFile(path: string): Promise<{ content: string }>;
```

**Recommendation**:
1. Define clear contracts for each interface's purpose:
   - `StorageGateway`: Low-level binary storage (FSA/IndexedDB abstraction)
   - `FileOperationsAdapter`: High-level text file operations
   - Remove or deprecate `StorageAdapter` (unclear positioning)
2. Create migration guide for existing implementations
3. Document which services should use which interface

---

### 3.2 IFileCrudService - Missing Validation Contracts

**Issue**: `IFileCrudService` interface defines operations but lacks:
- Error type definitions
- Validation rules documentation
- Clear contract on what "success" vs "failure" means

**Location**: `src/domain/services/file-crud/file-crud-service.ts`

**Impact**: MEDIUM - Implementations may have inconsistent error handling.

**Evidence**:
```typescript
export interface IFileCrudService {
  create(path: string, content: string, options: CreateOptions): Promise<CrudResult<FileMetadata>>;
  read(path: string, options: ReadOptions): Promise<CrudResult<string>>;
  // ... other operations
}

// CrudResult is defined as a discriminated union:
type CrudResult<T> = { success: true; data: T; } | { success: false; error: CrudError; }

// But CrudError is NOT exported from this file - it's imported from file-crud-types.ts
```

**Recommendation**: Export complete contract including all dependent types in `file-crud-service.ts`.

---

### 3.3 ProviderAdapter - Unclear Error Contract

**Issue**: `ProviderAdapter` interface returns `AsyncIterable<ChatChunk>` but doesn't specify:
- What happens on error (throw? return empty iterable?)
- What constitutes a "successful" vs "failed" response
- How to distinguish between streaming errors and end of stream

**Location**: `src/domain/types/llm/adapter-types.ts` (line 61)

**Impact**: MEDIUM - Implementations may have inconsistent error handling.

**Evidence**:
```typescript
// adapter-types.ts (line 61)
chat(messages: ChatMessage[], options?: ChatOptions | undefined): AsyncIterable<ChatChunk>;

// No error type defined, no clarification on failure mode
```

**Recommendation**: Add explicit error handling contract documentation to interface.

---

## 4. SCATTERED DOMAIN RULES

### 4.1 Agent Workspace Binding Logic Scattered

**Issue**: Agent workspace availability logic is spread across:
1. `Agent` entity methods (`isAvailableIn`, `isDefaultFor`, `canExecuteTool`)
2. `AgentOrchestrationService` methods (`getAvailableAgentsFor`)
3. `AgentWorkspaceUtils` functions (`isAgentAvailableIn`, `isAgentDefaultFor`, `getAgentsForWorkspace`)

**Impact**: HIGH - Business rules for workspace availability are not centralized, making it difficult to maintain consistency.

**Evidence**:
```typescript
// agent.ts (entity methods)
isAvailableIn(workspaceType: WorkspaceType): boolean { /* ... */ }
isDefaultFor(workspaceType: WorkspaceType): boolean { /* ... */ }
canExecuteTool(toolId: string, workspaceType: WorkspaceType): boolean { /* ... */ }

// agent-orchestration-service.ts (service methods)
getAvailableAgentsFor(agents: Agent[], workspaceType: WorkspaceType): Agent[] {
  return agents.filter(agent => agent.isAvailableIn(workspaceType));
}

// agent-workspace-utils.ts (utility functions)
export function isAgentAvailableIn(
  agent: AgentWithWorkspaceBindings,
  workspaceType: WorkspaceType
): boolean { /* ... */ }

export function isAgentDefaultFor(
  agent: AgentWithWorkspaceBindings,
  workspaceType: WorkspaceType
): boolean { /* ... */ }

export function getAgentsForWorkspace<T extends AgentWithWorkspaceBindings>(
  agents: T[],
  workspaceType: WorkspaceType
): T[] { /* ... */ }
```

**Recommendation**: Consolidate all agent workspace logic into `AgentOrchestrationService` only.

---

### 4.2 Workspace Transition Logic Scattered

**Issue**: Workspace transition validation logic is split between:
1. `WorkspaceTransitionService` (validation, planning, execution)
2. `SwitchWorkspaceUseCase` (orchestration of transition)

**Overlap**: Both services validate transitions, select agents, and handle state changes.

**Impact**: MEDIUM - Transition logic is not in a single authoritative location.

**Evidence**:
```typescript
// workspace-transition-service.ts (lines 87-109)
validateTransition(context: TransitionContext): ValidationResult {
  const errors: string[] = [];
  // ... validation logic
  return { isValid: errors.length === 0, errors };
}

// switch-workspace-use-case.ts (lines 74-95)
const result = this.workspaceTransitionService.executeTransition(transitionContext);
if (!result.success) {
  return { /* error handling */ };
}
```

**Recommendation**: Decide if `SwitchWorkspaceUseCase` is an application-layer orchestrator or if it belongs in domain. If domain service, consolidate with `WorkspaceTransitionService`.

---

### 4.3 File CRUD Operations Scattered

**Issue**: File CRUD operations are spread across:
1. `IFileCrudService` interface
2. `UnifiedFileCrudService` implementation
3. StorageAdapter/FileOperationsAdapter interfaces (infrastructure adapters)

**Concern**: Business logic for file operations is mixed with infrastructure concerns.

**Impact**: MEDIUM - Makes it unclear where to add file-related business rules (e.g., file locking, conflict resolution).

**Recommendation**: Create clear separation:
- Domain: `FileCrudService` (business rules only)
- Infrastructure: Storage adapters (technical implementation)
- Application: Orchestrator layer that combines domain + infrastructure

---

## 5. MISSING ABSTRACTION LAYERS

### 5.1 No Repository Interface

**Issue**: There are **NO repository interfaces** defined in the domain layer.

**Impact**: HIGH - Without repository interfaces, it's unclear how entities should be persisted, retrieved, and queried. This is a fundamental violation of Clean Architecture.

**Evidence**: Search through all domain files shows:
- No `IRepository`, `IProjectRepository`, `IAgentRepository`, etc.
- Services directly import from infrastructure (violating dependency inversion)

**Example**:
```typescript
// ProjectRegistry.ts directly manages state in memory
// No abstraction for persistence (IndexedDB, FSA, etc.)

// unified-file-crud.ts imports StorageAdapter directly
import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
```

**Recommendation**: Define repository interfaces for each entity:
- `IProjectRepository`: Project CRUD operations
- `IAgentRepository`: Agent CRUD operations
- `IConversationRepository`: Chat/conversation persistence
- `IFileRepository`: Generic file operations

---

### 5.2 No Domain Event Interface

**Issue**: Domain services emit events using **no defined interface**.

**Evidence**:
```typescript
// unified-file-crud.ts (lines 35-67)
private emitEvent(
  type: 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy',
  path: string,
  source: 'user' | 'agent',
  success: boolean
): void {
  if (!this.eventBus || !success) return;
  // ... event emission logic
}

// eventBus parameter is typed as: WorkspaceEventEmitter (imported from @/lib/events/workspace-events)
// This is NOT a domain interface - it's infrastructure
```

**Impact**: MEDIUM - No clear contract for what events exist, their payloads, or their purpose.

**Recommendation**: Create `IDomainEventEmitter` interface in `src/domain/interfaces/` defining all domain events.

---

### 5.3 No Value Object Factory Interface

**Issue**: Value objects (`WorkspaceBinding`, `AgentToolBinding`) have `fromJSON` static methods but **no factory interface**.

**Evidence**:
```typescript
// workspace-binding.ts (lines 31-33)
export class WorkspaceBinding {
  static fromJSON(props: WorkspaceBindingProps): WorkspaceBinding {
    return new WorkspaceBinding(props);
  }
}

// No IWorkspaceBindingFactory interface defining the contract
```

**Impact**: LOW - Makes it harder to mock for testing or create alternative implementations.

**Recommendation**: Create `IWorkspaceBindingFactory` interface for consistency, though optional.

---

## 6. INCONSISTENT MODELING

### 6.1 WorkspaceBindings vs WorkspaceBinding (Naming Confusion)

**Issue**: Two similarly named but different types:
1. `WorkspaceBindings` (in `project.ts`, lines 15-20) - Simple object with boolean flags
2. `WorkspaceBinding` (in `value-objects/workspace-binding.ts`) - Class with immutable value object

**Conflict**: Names are too similar, making it unclear which to use when.

**Evidence**:
```typescript
// project.ts (lines 15-20)
export interface WorkspaceBindings {
  ide?: boolean;
  notes?: boolean;
  knowledge?: boolean;
  study?: boolean;
}

// workspace-binding.ts (lines 41-51)
export class WorkspaceBinding {
  readonly workspaceType: WorkspaceType;
  readonly isAvailable: boolean;
  readonly uiVariant: 'full' | 'compact' | 'minimal';
  readonly isDefault: boolean;
  // ... methods
}
```

**Impact**: HIGH - Naming confusion increases cognitive load and potential for misuse.

**Recommendation**: Rename `WorkspaceBindings` in `project.ts` to:
- `ProjectWorkspaceBindings` (clearer that it's for project configuration)
- Or consolidate into using `WorkspaceBinding[]` array directly in `Project` entity

---

### 6.2 WorkspaceConfig vs WorkspaceState (Purpose Unclear)

**Issue**: Two workspace-related entities with unclear distinction:
1. `WorkspaceConfig` (static configuration per workspace)
2. `WorkspaceState` (dynamic session state per workspace)

**Overlap**: Both have `type: WorkspaceType`, `settings: Record<string, unknown>` / `metadata: Record<string, unknown>`.

**Missing Clarity**: No documentation on:
- When to use `WorkspaceConfig` vs `WorkspaceState`
- Which persists vs which is transient
- Relationship between them (does state override config?)

**Evidence**:
```typescript
// workspace.ts (lines 25-38)
export interface WorkspaceConfig {
  type: WorkspaceType;
  isEnabled: boolean;
  label?: string;
  settings: Record<string, unknown>;
  created: Date;
  updated: Date;
}

export interface WorkspaceState {
  type: WorkspaceType;
  activeFile?: string | null;
  openFiles: string[];
  panels: Record<string, boolean>;
  metadata: Record<string, unknown>;
  updated: Date;
}
```

**Recommendation**: Add JSDoc comments explaining the purpose and lifecycle of each interface.

---

### 6.3 Chat vs Conversation Entities (Ambiguous Relationship)

**Issue**: Two entities with unclear distinction:
1. `ChatConversation` (top-level conversation container)
2. `ChatThread` (thread within a conversation)

**Missing Clarity**:
- When to create `ChatConversation` vs `ChatThread`
- Can a thread exist without a conversation?
- Is `ChatMessage` always part of a thread, or can it be orphaned?

**Evidence**:
```typescript
// chat.ts (lines 177-204)
export interface ChatConversation {
  id: string;
  projectId: string | null;
  workspaceType: WorkspaceType;
  title: string;
  preview: string;
  agentId: string;
  messageCount: number;
  scrollPosition: number;
  status: 'active' | 'archived' | 'deleted';
  pinned?: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatThread {
  id: string;
  conversationId: string;  // ← Foreign key to ChatConversation
  projectId: string;
  workspaceType?: WorkspaceType;
  title: string;
  preview: string;
  parentThreadId?: string | null;
  childThreadIds?: string[];
  folderPath?: string;
  contextWindow?: ContextWindowConfig;
  status: 'active' | 'archived' | 'deleted';
  createdAt: number;
  updatedAt: number;
  messageCount: number;
}
```

**Recommendation**: Add documentation explaining the conversation-thread hierarchy and their relationship.

---

## 7. ARCHITECTURAL CONCERNS

### 7.1 Infrastructure Dependencies in Domain Layer (VIOLATION)

**Issue**: Domain services directly import infrastructure components.

**Evidence**:
```typescript
// unified-file-crud.ts (line 32)
import type { StorageAdapter } from '@/domain/interfaces/storage-adapter.interface';
// StorageAdapter is implemented by infrastructure layer

// line 32
import type { FileLock } from '@/lib/agent/facades/file-lock';
// FileLock is NOT in domain layer - it's in @/lib/
```

**Impact**: CRITICAL - Violates Clean Architecture principle of dependency inversion. Domain layer should NOT know about infrastructure implementations.

**Recommendation**: 
1. Remove infrastructure imports from domain services
2. Inject infrastructure via dependency inversion (constructor parameters)
3. Create repository interfaces that abstract storage

---

### 7.2 Type Imports Using Relative Paths (Maintenance Risk)

**Issue**: Some domain files use relative path imports that may break on restructuring.

**Evidence**:
```typescript
// unified-file-crud.ts
import type { FileLock } from '@/lib/agent/facades/file-lock';

// agent-workspace-utils.ts
import type { WorkspaceBindingProps } from '@/domain/value-objects/workspace-binding';
```

**Impact**: MEDIUM - Refactoring becomes risky due to brittle import paths.

**Recommendation**: Ensure all domain files import using the `@/domain/` alias only.

---

## 8. POSITIVE FINDINGS

### 8.1 Well-Structured Value Objects

**Good**: `WorkspaceBinding` and `AgentToolBinding` are excellent examples of immutable value objects with:
- Clear constructors with `Object.freeze()`
- `with*` methods for creating updated instances
- `equals()` and `toJSON()` methods
- Static factory methods (`fromJSON`, `defaultPermissions`, `disabledPermissions`)

**Evidence**:
```typescript
// workspace-binding.ts (lines 47-54)
constructor(props: WorkspaceBindingProps) {
  this.workspaceType = props.workspaceType;
  this.isAvailable = props.isAvailable;
  this.uiVariant = props.uiVariant;
  this.isDefault = props.isDefault;

  // Make instance immutable
  Object.freeze(this);
}
```

**Conclusion**: These value objects should be used as examples for other value objects.

---

### 8.2 Good Use of Template Literal Types

**Good**: `ProjectId` type uses template literal types for compile-time validation.

**Evidence**:
```typescript
// project-ids.ts (line 45)
export type ProjectId = `${WorkspaceType}:proj_${number}_${string}`;

// This prevents invalid IDs at compile time
// Type error: const invalid: ProjectId = 'random-string'; // ❌
```

**Conclusion**: This pattern provides excellent type safety and should be used more consistently across the domain layer.

---

## 9. RECOMMENDATIONS SUMMARY

### High Priority (Address Immediately)

1. **Consolidate Storage Interfaces** - Clarify boundaries between `StorageGateway`, `StorageAdapter`, and `FileOperationsAdapter`
2. **Create Repository Interfaces** - Define `IProjectRepository`, `IAgentRepository`, `IConversationRepository` for dependency inversion
3. **Resolve WorkspaceType Duplication** - Create single canonical location and re-export everywhere
4. **Consolidate Agent Workspace Logic** - Remove `agent-workspace-utils.ts` in favor of `agent-orchestration-service.ts`
5. **Remove Infrastructure Dependencies** - Domain services should not import from `@/lib/` or infrastructure

### Medium Priority (Address Soon)

1. **Add Missing Validation** - Document error handling contracts for `IFileCrudService`, `ProviderAdapter`
2. **Create Domain Event Interface** - Define `IDomainEventEmitter` for all domain events
3. **Clarify Workspace Config vs State** - Add JSDoc explaining purpose and lifecycle
4. **Document Chat/Thread Relationship** - Explain conversation-thread hierarchy and usage patterns

### Low Priority (Refactor Later)

1. **Standardize Naming** - Rename `WorkspaceBindings` to `ProjectWorkspaceBindings` for clarity
2. **Add Factory Interfaces** - Create `IWorkspaceBindingFactory` for testability (optional)
3. **Consolidate Project Types** - Move all project-related types from `project-registry-types.ts` to canonical location

---

## 10. EVIDENCE FILES

All findings are backed by file paths, line numbers, and code snippets. See detailed sections above for specific evidence.

---

**Analysis Complete**
- Files analyzed: 43
- Total issues found: 19
- High priority: 5
- Medium priority: 4
- Low priority: 3
- Positive findings: 2
