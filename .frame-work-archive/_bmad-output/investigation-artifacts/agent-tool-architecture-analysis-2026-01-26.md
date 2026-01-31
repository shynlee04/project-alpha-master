# Agent and Tool Architecture Gap Analysis

**Analysis Date**: 2026-01-26
**Investigation Type**: Architectural Gap Analysis
**Status**: COMPLETE

---

## Executive Summary

This analysis examines the current implementation status of the agent and tool architecture against the requirements outlined in `new-fundamental-truths.md`. The analysis reveals significant progress in tool definition and registration, but critical gaps in orchestration, agent mode switching, and TanStack AI SDK integration.

**Overall Readiness**: 55% - Significant gaps in orchestration and permission matrix implementation

---

## 1. Implementation Status Summary

| Component | Status | Completion % | Issues |
|-----------|---------|---------------|---------|
| **Orchestrator Pattern** | ⚠️ PARTIAL | 45% | Only documentation exists; no runtime implementation |
| **Domain-Specific Agents** | ⚠️ DOCUMENTATION ONLY | 20% | Agent definitions exist in `_bmad-ext` but no runtime agents |
| **Tool Registry** | ✅ COMPLETE | 100% | `CentralizedToolRegistry` fully implemented |
| **Permission Matrix** | ⚠️ PARTIAL | 60% | Types defined, but no runtime enforcement |
| **Tool Approval** | ❌ MISSING | 0% | No approval mechanism implemented |
| **Agentic Cycle** | ❌ MISSING | 0% | No sequential tool execution or retry logic |
| **TanStack AI SDK Integration** | ✅ COMPLETE | 95% | Tools use `toolDefinition` from SDK |
| **Mode Switching** | ❌ MISSING | 0% | No agent mode switching logic |
| **Sub-Agent Delegation** | ⚠️ PROTOCOL ONLY | 30% | Handoff protocol documented, not implemented |

---

## 2. Agent Inventory

| Agent Type | File Location | Status | Tools Available | System Instruction |
|-----------|---------------|---------|----------------|-------------------|
| **Orchestrator** | `_bmad-ext/orchestrator/master-orchestrator.md` | 📝 Documentation | read-only (theoretical) | Full orchestration protocol documented |
| **dev-ext** | `_bmad-ext/agents/dev-ext.md` | 📝 Documentation | Not defined | Wraps core BMM dev agent |
| **architect-ext** | `_bmad-ext/agents/architect-ext.md` | 📝 Documentation | Not defined | Architecture design specialist |
| **analyst-ext** | `_bmad-ext/agents/analyst-ext.md` | 📝 Documentation | Not defined | Requirements gathering |
| **ux-designer-ext** | `_bmad-ext/agents/ux-designer-ext.md` | 📝 Documentation | Not defined | UI/UX design |
| **tech-writer-ext** | `_bmad-ext/agents/tech-writer-ext.md` | 📝 Documentation | Not defined | Documentation |
| **tea-ext** | `_bmad-ext/agents/tea-ext.md` | 📝 Documentation | Not defined | Testing |
| **product-management-ext** | `_bmad-ext/agents/product-management-ext.md` | 📝 Documentation | Not defined | Sprint planning |

**Key Finding**: All agent definitions exist only as markdown documentation in `_bmad-ext/`. No runtime TypeScript implementations exist for these agents.

**Domain Agents (Runtime)**:
- `Agent` entity: `src/domain/entities/agent.ts` ✅
- `AgentOrchestrationService`: `src/domain/services/agent-orchestration-service.ts` ✅
- These provide domain model and business logic but are not connected to LLM orchestration

---

## 3. Tool Inventory

### 3.1 Tool Definitions (TanStack AI SDK Format)

All tools properly use `@tanstack/ai` SDK:

| Tool Name | Type | Category | Status | Permission Level |
|-----------|------|----------|---------|-----------------|
| **Note Tools** | Server/Client | `notes` | ✅ IMPLEMENTED | Not enforced |
| `create_note` | Server+Client | `notes` | ✅ `create-note-tool.ts` | Not enforced |
| `read_note` | Server+Client | `notes` | ✅ `read-note-tool.ts` | Not enforced |
| `update_note` | Server+Client | `notes` | ✅ `update-note-tool.ts` | Not enforced |
| `delete_note` | Server+Client | `notes` | ✅ `delete-note-tool.ts` | Not enforced |
| `list_notes` | Server+Client | `notes` | ✅ `list-notes-tool.ts` | Not enforced |

| Tool Name | Type | Category | Status | Permission Level |
|-----------|------|----------|---------|-----------------|
| **Unified Tools** | Server/Client | `unified` | ✅ IMPLEMENTED | Not enforced |
| `read_file` | Server/Client | `unified` | ✅ `read-tool.ts` | Not enforced |
| `write_file` | Server/Client | `unified` | ✅ `write-tool.ts` | Not enforced |
| `list_files` | Server/Client | `unified` | ✅ `list-tool.ts` | Not enforced |
| `delete_file` | Server/Client | `unified` | ✅ `delete-tool.ts` | Not enforced |

| Tool Name | Type | Category | Status | Permission Level |
|-----------|------|----------|---------|-----------------|
| **Agent Tools** | Server | `composite` | ✅ IMPLEMENTED | Not enforced |
| `research_tool` | Server | `composite` | ✅ `research-tool.ts` | Not enforced |
| `analyze_tool` | Server | `composite` | ✅ `analyze-tool.ts` | Not enforced |
| `plan_tool` | Server | `composite` | ✅ `plan-tool.ts` | Not enforced |
| `storyboard_tool` | Server | `composite` | ✅ `storyboard-tool.ts` | Not enforced |

| Tool Name | Type | Category | Status | Permission Level |
|-----------|------|----------|---------|-----------------|
| **Utility Tools** | Server | Various | ✅ IMPLEMENTED | Not enforced |
| `execute_command` | Server | `terminal` | ✅ `execute-command-tool.ts` | Not enforced |
| `list_files` | Server | `files` | ✅ `list-files-tool.ts` | Not enforced |
| `synthesize` | Server | `knowledge` | ✅ `synthesize-tool.ts` | Not enforced |
| `process_pdf` | Server | `web` | ✅ `process-pdf-tool.ts` | Not enforced |
| `process_url` | Server | `web` | ✅ `process-url-tool.ts` | Not enforced |
| `voice_input` | Server | `vision` | ✅ `voice-input-tool.ts` | Not enforced |

### 3.2 Tool Registry Implementation

**File**: `src/infrastructure/tools/centralized-tool-registry.ts`

**Status**: ✅ FULLY IMPLEMENTED

**Capabilities**:
- ✅ Singleton pattern
- ✅ Tool registration (`register`, `registerAll`)
- ✅ Tool retrieval (`get`, `getAll`, `getById`)
- ✅ Tool filtering by mode, workspace, category
- ✅ Server-exposed tool filtering
- ✅ Category and mode grouping
- ✅ Filter config interface

**Limitations**:
- ⚠️ No connection to actual LLM orchestration
- ⚠️ No runtime tool execution logic
- ⚠️ No permission enforcement at execution time

### 3.3 Permission Types

**File**: `src/domain/tools/tool-permissions.ts`

**Status**: ✅ TYPES DEFINED

**Types Available**:
```typescript
type ToolTrustLevel = 'auto' | 'prompt' | 'block';
type ToolCategory = 'notes' | 'knowledge' | 'search' | 'files' |
                  'terminal' | 'vision' | 'web' | 'unified' |
                  'composite' | 'provider';
type ToolRiskLevel = 'low' | 'medium' | 'high';
```

**Limitations**:
- ⚠️ No runtime permission checking logic
- ⚠️ No approval flow implementation
- ⚠️ No UI integration for permission prompts

---

## 4. Critical Gaps (Prioritized)

### P0 BLOCKERS - Must Complete Before Phase 2

| Gap | Severity | Files Affected | Impact | Phase Required |
|------|----------|----------------|--------|----------------|
| **No Runtime Orchestrator** | 🔴 CRITICAL | `_bmad-ext/orchestrator/*.md` | Agents cannot coordinate | Phase 2 |
| **Missing Agent Mode Switching** | 🔴 CRITICAL | `src/domain/services/` | Orchestrator cannot delegate | Phase 2 |
| **No Tool Approval Mechanism** | 🔴 CRITICAL | `src/domain/tools/` | Dangerous operations unchecked | Phase 2 |
| **Missing Agentic Cycle** | 🔴 CRITICAL | `src/domain/services/` | Sequential tool execution impossible | Phase 2 |
| **No Sub-Agent Delegation** | 🔴 CRITICAL | `_bmad-ext/agents/*.md` | Task decomposition impossible | Phase 2 |

### P1 HIGH - Must Complete for Phase 2

| Gap | Severity | Files Affected | Impact | Phase Required |
|------|----------|----------------|--------|----------------|
| **Permission Matrix Not Enforced** | 🟠 HIGH | `src/domain/tools/tool-permissions.ts` | Auto-grant tools execute without approval | Phase 2 |
| **No Tool Execution Context** | 🟠 HIGH | `src/lib/agent/tools/*` | Cannot track tool usage | Phase 2 |
| **Missing Timeout Handling** | 🟠 HIGH | `src/lib/agent/tools/tool-timeout.ts` | Tools can hang indefinitely | Phase 2 |
| **No Error Recovery** | 🟠 HIGH | All tool files | Tool failures break workflows | Phase 2 |

### P2 MEDIUM - Should Complete

| Gap | Severity | Files Affected | Impact | Phase Required |
|------|----------|----------------|--------|----------------|
| **Tool Registry Not Connected to LLM** | 🟡 MEDIUM | `src/infrastructure/tools/centralized-tool-registry.ts` | Tools not exposed to agents | Phase 2 |
| **No Audit Logging** | 🟡 MEDIUM | `src/lib/agent/tools/` | Cannot track tool usage | Phase 2 |
| **Missing Tool Usage Metrics** | 🟡 MEDIUM | `src/lib/agent/tools/` | Cannot optimize tool selection | Phase 2 |

---

## 5. TanStack AI SDK Alignment Assessment

### 5.1 Tool Definition Compliance ✅

**Status**: ✅ EXCELLENT - All tools use proper SDK format

**Evidence**:
```typescript
// ✅ CORRECT: All tools use toolDefinition from @tanstack/ai
import { toolDefinition } from '@tanstack/ai';

export const createNoteDef = toolDefinition({
  name: 'create_note',
  description: 'Create a new note with a title and content...',
  inputSchema: z.object({...}),
  outputSchema: z.object({...}),
});

// ✅ Server implementation factory
export function createCreateNoteServerTool(getNoteStore: () => {...}) {
  return createNoteDef.server(async ({ title, content, parentId }) => {
    // Implementation
  });
}

// ✅ Client implementation factory
export function createCreateNoteClientTool() {
  return createNoteDef.client(async () => {
    // Client-side: definition only
  });
}
```

**Tools Checked**: 20+ tools all follow this pattern

### 5.2 Tool Approval Configuration ❌

**Status**: ❌ MISSING - No approval mechanism

**Requirement (from `new-fundamental-truths.md`)**:
> Orchestrator must enforce tool permission matrix with approval flow

**Current State**:
- Types defined (`ToolTrustLevel`, `ToolRiskLevel`)
- No runtime approval logic
- No UI integration for permission prompts
- No approval history tracking

### 5.3 Agentic Cycle Implementation ❌

**Status**: ❌ MISSING - No sequential execution logic

**Requirement (from `new-fundamental-truths.md`)**:
> Agents must support agentic cycle: sequential tool execution, retry logic, conditional branching

**Current State**:
- Tools defined but not connected
- No cycle orchestration logic
- No retry/backoff mechanism
- No conditional branching

### 5.4 Direct Tool Definitions ⚠️

**Status**: ⚠️ ACCEPTABLE - Tools use SDK, but no orchestration layer

**Finding**:
- Tools correctly use `@tanstack/ai` SDK ✅
- No direct LLM provider calls found ✅
- Proper separation between server and client implementations ✅
- BUT: No central orchestrator to route tools to agents ⚠️

---

## 6. Code Examples

### 6.1 Current Tool Implementation Pattern ✅

```typescript
// src/domain/tools/note/create-note-tool.ts
import { toolDefinition } from '@tanstack/ai';
import { z } from 'zod';

export const createNoteDef = toolDefinition({
  name: 'create_note',
  description: 'Create a new note with a title and content. Supports markdown formatting.',
  inputSchema: z.object({
    title: z.string().min(1).describe('The title of note (required)'),
    content: z.string().describe('The content/body of note (markdown supported)'),
    parentId: z.string().optional().describe('Optional parent folder ID to organize note'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    data: z.object({...}).optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  }),
});

export function createCreateNoteServerTool(getNoteStore: () => {...}) {
  return createNoteDef.server(async ({ title, content, parentId }) => {
    // Implementation logic
  });
}
```

**Strengths**:
- ✅ Proper SDK usage
- ✅ Clear input/output schemas
- ✅ Server/client separation
- ✅ Type-safe with Zod

**Weaknesses**:
- ⚠️ No permission checking
- ⚠️ No timeout handling
- ⚠️ No error recovery
- ⚠️ Not connected to orchestrator

### 6.2 Tool Registry Pattern ✅

```typescript
// src/infrastructure/tools/centralized-tool-registry.ts
class CentralizedToolRegistry implements IToolRegistry {
  private static instance: CentralizedToolRegistry | null = null;
  private tools: Map<string, RegisteredTool> = new Map();

  static getInstance(): CentralizedToolRegistry {
    if (!CentralizedToolRegistry.instance) {
      CentralizedToolRegistry.instance = new CentralizedToolRegistry();
    }
    return CentralizedToolRegistry.instance;
  }

  register(tool: RegisteredTool): void {
    if (this.tools.has(tool.metadata.id)) {
      throw new Error(`Tool with id "${tool.metadata.id}" is already registered`);
    }
    this.tools.set(tool.metadata.id, tool);
  }

  getFilteredTools(config: ToolFilterConfig = {}): RegisteredTool[] {
    return this.getAll().filter((tool) => this.matchesFilter(tool, config));
  }

  private matchesFilter(tool: RegisteredTool, config: ToolFilterConfig): boolean {
    const { metadata } = tool;

    // Filter by mode
    if (config.mode && !metadata.allowedModes.includes(config.mode)) {
      return false;
    }

    // Filter by workspace type
    if (config.workspaceType &&
        !metadata.allowedWorkspaces.includes(config.workspaceType)) {
      return false;
    }

    // Filter by category
    if (config.category && metadata.category !== config.category) {
      return false;
    }

    // Filter by server exposure
    if (config.serverExposedOnly && !metadata.serverExposed) {
      return false;
    }

    return true;
  }
}
```

**Strengths**:
- ✅ Singleton pattern
- ✅ Type-safe filtering
- ✅ Comprehensive filter support
- ✅ Well-documented

**Weaknesses**:
- ⚠️ No connection to LLM SDK
- ⚠️ No runtime tool execution
- ⚠️ No permission enforcement

### 6.3 Agent Entity Pattern ✅

```typescript
// src/domain/entities/agent.ts
export class Agent {
  readonly id: string;
  readonly name: string;
  readonly providerId: string;
  readonly model: string;
  readonly systemPrompt: string;
  readonly workspaceBindings: WorkspaceBinding[];
  readonly tools: AgentToolBinding[];

  isAvailableIn(workspaceType: WorkspaceType): boolean {
    return this.workspaceBindings.some(
      binding => binding.workspaceType === workspaceType && binding.isAvailable
    );
  }

  canExecuteTool(toolId: string, workspaceType: WorkspaceType): boolean {
    const toolBinding = this.tools.find(t => t.toolId === toolId);
    if (!toolBinding || !toolBinding.isEnabled) {
      return false;
    }
    return toolBinding.isPermittedIn(workspaceType);
  }

  getEnabledToolsFor(workspaceType: WorkspaceType): AgentToolBinding[] {
    return this.tools.filter(tool => {
      if (!tool.isEnabled) return false;
      if (!this.isAvailableIn(workspaceType)) return false;
      return tool.isPermittedIn(workspaceType);
    });
  }
}
```

**Strengths**:
- ✅ Clear business rules
- ✅ Immutable value objects
- ✅ Workspace and tool bindings
- ✅ Permission checking at entity level

**Weaknesses**:
- ⚠️ No connection to LLM SDK
- ⚠️ No runtime execution
- ⚠️ No orchestrator integration

### 6.4 Problematic Code Example - Missing Orchestrator ❌

```typescript
// ❌ PROBLEM: No orchestrator connects agents to tools

// We have:
// 1. Tool registry with definitions
const registry = CentralizedToolRegistry.getInstance();
const tools = registry.getFilteredTools({ mode: 'coding' });

// 2. Agent entity with tool bindings
const agent = new Agent({
  id: 'dev-ext',
  name: 'Development Agent',
  tools: [
    { toolId: 'read_file', isEnabled: true, workspacePermissions: { ide: true } }
  ],
  // ...
});

// 3. BUT: No orchestrator to:
// - Select appropriate agent for task
// - Filter tools by agent permissions
// - Execute tools with approval checks
// - Handle sequential tool calls
// - Retry on failure

// ❌ MISSING: Runtime orchestrator implementation
// ❌ MISSING: Agent switching logic
// ❌ MISSING: Tool approval flow
// ❌ MISSING: Agentic cycle execution
```

**What's Missing**:
```typescript
// ❌ DOES NOT EXIST:
class AgentOrchestrator {
  selectAgent(task: string, workspace: WorkspaceType): Agent;
  switchMode(currentMode: AgentMode, targetMode: AgentMode): Agent;
  executeTool(agent: Agent, toolId: string, params: any): Promise<any>;
  approveToolExecution(tool: RegisteredTool, params: any): Promise<boolean>;
  executeAgenticCycle(
    agent: Agent,
    initialTask: string,
    maxIterations: number
  ): Promise<CycleResult>;
}
```

---

## 7. Phase 2 Blockers (Critical)

### 7.1 Must Complete Before Phase 2 Can Start

#### Blocker 1: Runtime Orchestrator Implementation
- **Status**: ❌ NOT STARTED
- **Impact**: Agents cannot coordinate or switch modes
- **Estimated Effort**: 8-12 hours
- **Dependencies**: None
- **Files to Create**:
  - `src/domain/services/agent-orchestrator-runtime.ts`
  - `src/infrastructure/orchestration/agent-runtime-adapter.ts`

#### Blocker 2: Agent Mode Switching Logic
- **Status**: ❌ NOT STARTED
- **Impact**: Orchestrator cannot delegate to domain-specific agents
- **Estimated Effort**: 4-6 hours
- **Dependencies**: Blocker 1
- **Files to Create**:
  - `src/domain/services/agent-mode-switcher.ts`
  - `src/domain/services/agent-delegation-service.ts`

#### Blocker 3: Tool Approval Mechanism
- **Status**: ❌ NOT STARTED
- **Impact**: Dangerous operations execute without user confirmation
- **Estimated Effort**: 6-8 hours
- **Dependencies**: Blocker 1
- **Files to Create**:
  - `src/infrastructure/tools/tool-approval-service.ts`
  - `src/domain/services/tool-permission-enforcer.ts`

#### Blocker 4: Agentic Cycle Implementation
- **Status**: ❌ NOT STARTED
- **Impact**: Sequential tool execution impossible
- **Estimated Effort**: 8-12 hours
- **Dependencies**: Blocker 1, 2, 3
- **Files to Create**:
  - `src/domain/services/agentic-cycle-executor.ts`
  - `src/infrastructure/orchestration/cycle-executor.ts`

#### Blocker 5: Sub-Agent Delegation
- **Status**: ⚠️ PROTOCOL EXISTS, NO IMPLEMENTATION
- **Impact**: Task decomposition and specialist delegation impossible
- **Estimated Effort**: 6-10 hours
- **Dependencies**: Blocker 1, 2
- **Files to Create**:
  - `src/domain/services/sub-agent-delegation-service.ts`
  - `src/infrastructure/orchestration/handoff-processor.ts`

### 7.2 Implementation Order

```
Blocker 1: Runtime Orchestrator (8-12h)
    ↓
Blocker 2: Mode Switching (4-6h)
    ↓
Blocker 3: Tool Approval (6-8h)
    ↓
Blocker 4: Agentic Cycle (8-12h)
    ↓
Blocker 5: Sub-Agent Delegation (6-10h)
    ↓
Phase 2: Agent Development (READY)
```

**Total Estimated Effort**: 32-48 hours (4-6 days)

---

## 8. Recommendations

### 8.1 Immediate Actions (This Week)

1. **Create Runtime Orchestrator**
   - Implement `AgentOrchestratorRuntime` class
   - Connect to TanStack AI SDK chat interface
   - Implement agent selection logic

2. **Implement Tool Approval Flow**
   - Create approval service with UI integration
   - Implement permission checking at execution
   - Add approval history tracking

3. **Connect Tool Registry to LLM**
   - Hook `CentralizedToolRegistry` to TanStack AI chat
   - Implement tool filtering by agent mode
   - Add server-exposed tool routing

### 8.2 Next Week Actions

4. **Implement Agent Mode Switching**
   - Create mode switcher service
   - Implement delegation protocol
   - Add context preservation across switches

5. **Build Agentic Cycle Executor**
   - Implement sequential tool execution
   - Add retry logic with exponential backoff
   - Implement conditional branching

6. **Implement Sub-Agent Delegation**
   - Create handoff processing
   - Implement context isolation
   - Add delegation tracking

### 8.3 Longer-Term Actions

7. **Add Tool Usage Metrics**
   - Track execution frequency
   - Monitor success rates
   - Optimize tool selection

8. **Implement Audit Logging**
   - Log all tool executions
   - Track permission approvals
   - Generate usage reports

---

## 9. Architecture Diagrams

### 9.1 Current State

```
┌─────────────────────────────────────────────────────────────────┐
│                    CURRENT STATE (55%)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐          │
│  │ Tool Definitions │      │  Tool Registry  │          │
│  │ (20+ tools)     │─────▶│ (Singleton)     │          │
│  │ @tanstack/ai     │      │ ✅ Complete    │          │
│  └──────────────────┘      └────────┬─────────┘          │
│                                    │                       │
│  ┌──────────────────┐             │                      │
│  │ Agent Entities    │◀──────────┘                      │
│  │ (domain model)   │              │                      │
│  │ ✅ Complete     │              │                      │
│  └──────────────────┘              │                      │
│                                   │                      │
│  ┌──────────────────┐              │                      │
│  │ Orchestrator     │              │                      │
│  │ (documentation) │              │                      │
│  │ ⚠️ NO RUNTIME  │              │                      │
│  └──────────────────┘              │                      │
│                                   │                      │
│                                   ❌                     │
│                             NO CONNECTION                 │
│                                  TO LLM                      │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Target State (Phase 2 Ready)

```
┌─────────────────────────────────────────────────────────────────┐
│                 TARGET STATE (100%)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐          │
│  │ Tool Definitions │─────▶│  Tool Registry  │          │
│  │ (20+ tools)     │      │ (Singleton)     │          │
│  └──────────────────┘      └────────┬─────────┘          │
│                                    │                       │
│  ┌──────────────────┐             │                      │
│  │   Orchestrator   │◀────────────┘                      │
│  │    (Runtime)     │             │                      │
│  │  ✅ Complete    │────┐        │                      │
│  └──────────────────┘    │        │                      │
│                           │        │                      │
│         ┌────────────────┼────────┴─────┐              │
│         │              │              │              │
│  ┌────┴────┐  ┌────┴────┐  ┌────┴────┐         │
│  │ dev-ext  │  │arch-ext │  │analyst  │         │
│  │ (code)   │  │(design) │  │(research)│         │
│  └────┬────┘  └────┬────┘  └────┬────┘         │
│       │             │             │              │
│       └─────────────┴─────────────┘              │
│                     │                             │
│  ┌──────────────────┴──────────────────┐          │
│  │     Agentic Cycle Executor          │          │
│  │  (sequential + retry)             │          │
│  └──────────────────┬──────────────────┘          │
│                     │                             │
│  ┌──────────────────┴──────────────────┐          │
│  │    Tool Approval Service              │          │
│  │   (permission + UI integration)      │          │
│  └──────────────────┬──────────────────┘          │
│                     │                             │
│                     ▼                             │
│              ┌──────────┐                          │
│              │   LLM    │                          │
│              │ (TanStack│                          │
│              │    AI)   │                          │
│              └──────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. File Structure Analysis

### 10.1 Existing Files ✅

```
src/
├── domain/
│   ├── entities/
│   │   └── agent.ts ✅ (Entity with business rules)
│   ├── services/
│   │   └── agent-orchestration-service.ts ✅ (Domain logic)
│   ├── value-objects/
│   │   ├── workspace-binding.ts ✅
│   │   ├── tool-permission.ts ✅
│   │   └── workspace-type.ts ✅
│   └── tools/
│       ├── tool-definition.ts ✅ (Domain types)
│       └── tool-permissions.ts ✅ (Permission types)
├── infrastructure/
│   └── tools/
│       └── centralized-tool-registry.ts ✅ (Registry implementation)
└── lib/agent/tools/
    ├── note/ ✅ (5 tools)
    ├── unified/ ✅ (4 tools)
    ├── composite/ ✅ (4 tools)
    └── [8 utility tools] ✅
```

### 10.2 Missing Files ❌

```
src/
├── domain/
│   └── services/
│       ├── agent-orchestrator-runtime.ts ❌ (RUNTIME orchestrator)
│       ├── agent-mode-switcher.ts ❌ (Mode switching)
│       ├── agent-delegation-service.ts ❌ (Delegation)
│       ├── agentic-cycle-executor.ts ❌ (Cycle execution)
│       └── tool-permission-enforcer.ts ❌ (Permission enforcement)
└── infrastructure/
    ├── orchestration/
    │   ├── agent-runtime-adapter.ts ❌ (LLM adapter)
    │   ├── cycle-executor.ts ❌ (Cycle runtime)
    │   └── handoff-processor.ts ❌ (Handoff processing)
    └── tools/
        └── tool-approval-service.ts ❌ (Approval + UI)
```

---

## 11. Testing Considerations

### 11.1 Current Test Coverage

- ✅ Tool definition tests exist (`__tests__/`)
- ✅ Tool registry tests exist
- ✅ Agent entity tests exist
- ❌ No orchestrator tests (doesn't exist)
- ❌ No mode switching tests
- ❌ No tool approval tests
- ❌ No agentic cycle tests

### 11.2 Test Requirements for Phase 2

**Must Create**:
1. Agent orchestrator integration tests
2. Mode switching unit tests
3. Tool approval flow tests
4. Agentic cycle execution tests
5. Sub-agent delegation tests
6. Permission enforcement tests
7. Error recovery tests

---

## 12. Conclusion

### 12.1 Summary

The codebase has made excellent progress in:
- ✅ TanStack AI SDK tool definition (100% complete)
- ✅ Centralized tool registry (100% complete)
- ✅ Agent domain model (100% complete)
- ✅ Permission types (100% complete)

**Critical Gaps**:
- ❌ Runtime orchestrator (0% complete)
- ❌ Agent mode switching (0% complete)
- ❌ Tool approval mechanism (0% complete)
- ❌ Agentic cycle execution (0% complete)
- ❌ Sub-agent delegation (0% complete)

### 12.2 Phase 2 Readiness

**Current Status**: ❌ NOT READY - 5 P0 blockers

**Effort Required**: 32-48 hours (4-6 days)

**Critical Path**:
1. Runtime orchestrator (8-12h)
2. Mode switching (4-6h)
3. Tool approval (6-8h)
4. Agentic cycle (8-12h)
5. Sub-agent delegation (6-10h)

### 12.3 Risk Assessment

| Risk | Severity | Mitigation |
|-------|----------|------------|
| Underestimating complexity | 🟠 MEDIUM | Start with simple orchestrator, iterate |
| LLM SDK integration issues | 🟠 MEDIUM | Use official SDK patterns and examples |
| Permission UX complexity | 🟡 LOW | Start with basic prompts, enhance later |
| Tool execution performance | 🟡 LOW | Monitor and optimize after implementation |

---

## Appendix A: Key Files Reference

### A.1 Documentation Files

- `_bmad-ext/orchestrator/master-orchestrator.md` - Orchestrator protocol
- `_bmad-ext/agents/*.md` - Agent definitions (9 agents)
- `_bmad-ext/orchestrator/sub-agent-definitions.md` - Sub-agent types
- `_bmad-ext/modules/implementation/config/agent-tool-spec-template.yaml` - Tool spec template
- `new-fundamental-truths.md` - Architecture requirements

### A.2 Implementation Files

- `src/domain/entities/agent.ts` - Agent entity
- `src/domain/services/agent-orchestration-service.ts` - Domain logic
- `src/domain/tools/tool-definition.ts` - Tool types
- `src/domain/tools/tool-permissions.ts` - Permission types
- `src/infrastructure/tools/centralized-tool-registry.ts` - Registry

### A.3 Tool Files (20+ tools)

- `src/domain/tools/note/*.ts` - Note CRUD (5 tools)
- `src/lib/agent/tools/unified/*.ts` - File operations (4 tools)
- `src/lib/agent/tools/composite/*.ts` - Agent workflows (4 tools)
- `src/lib/agent/tools/*.ts` - Utility tools (8 tools)

---

**Analysis Completed**: 2026-01-26
**Next Review**: After Phase 2 blockers complete
