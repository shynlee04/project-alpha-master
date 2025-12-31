---
name: Ralph Loop Consolidation Plan
description: Systematic architectural gap resolution with complete logical coverage
version: 1.0.0
author: @bmad-bmm-dev
created: 2026-01-01T19:30:00+07:00
phase: Implementation
iteration: 4 (Ralph Loop)
ralph_loop: true
---

# Ralph Loop: Comprehensive Architectural Gap Resolution

**Trigger:** Recursive autonomous loop to address all architectural gaps
**Validation Framework:** BMAD v6 + Ralph Wiggum Loop
**Coverage Target:** 100% - Complete Logical Coverage
**Quality Standard:** Production-ready with December 2025 best practices

---

## Executive Summary

The **Ralph Loop** systematically addresses all architectural gaps identified in:
- `_bmad-output/architectural-gap-analysis-2025-12-31.md`
- `_bmad-output/arc-module-gap-analysis-2025-12-31.md`
- `_bmad-output/validation/sweeping-validation.md`

Using the dev cycle prompt methodology, this plan ensures **complete logical coverage** for maintainability, accessibility, performance, and scalability.

### Gap Analysis Summary

| Gap Category | Severity | Current State | Target State |
|--------------|----------|---------------|--------------|
| **Agent Workspace Bindings** | 🔴 HIGH | Missing `workspaceBindings` field | Full workspace-aware agents |
| **Tool Workspace Permissions** | 🔴 HIGH | `workspacePermissions` not implemented | Fine-grained conditional access |
| **Cross-Workspace Event Wiring** | 🟡 MEDIUM | Partial (event bus exists) | Full reactivity across all stores |
| **AgentConfigDialog God Class** | 🟡 MEDIUM | 1,171 lines (limit: 200) | Broken into focused components |
| **Canvas Store Duplication** | 🟡 MEDIUM | 2 duplicates (621 lines each) | 5 slices (<120 lines each) |
| **TypeScript Errors** | 🟡 MEDIUM | 200+ errors | Zero errors with real validation |
| **IndexedDB Quota Handling** | 🟢 LOW | Not implemented | User warnings + cleanup |
| **Database Schema Duplication** | 🟢 LOW | Multiple dexie-db.ts files | Single canonical schema |

**Overall Score:** 87/100 (CONDITIONAL PASS) → Target: 100/100

---

## Part I: Critical Gap Resolution (HIGH Priority)

### Gap 1: Agent Workspace Bindings

**Problem:** Agent type missing `workspaceBindings` field, preventing per-workspace availability configuration.

**Impact:** Cannot configure agents to be available only in specific workspaces (IDE, Knowledge, Study, Canvas).

**Solution:**

```typescript
// src/core/entities/Agent.ts (NEW FILE - Domain Layer)
export interface WorkspaceBindings {
  ide: boolean;
  knowledge: boolean;
  study: boolean;
  canvas: boolean;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  providerId: string;
  modelId: string;
  workspaceBindings: WorkspaceBindings; // ✨ NEW
  toolBindings: AgentToolBinding[];
  capabilities: AgentCapabilities;
  createdAt: number;
  updatedAt: number;
}
```

**Implementation Steps:**
1. Create `src/core/entities/Agent.ts` with workspace-aware Agent entity
2. Update `src/stores/agents-store.ts` to include `workspaceBindings`
3. Add `setWorkspaceBindings()` action to agents store
4. Update AgentConfigDialog UI to configure workspace bindings
5. Emit `agent:workspace-bindings-updated` event on change
6. Cross-workspace sync: filter agents by current workspace type

**Validation:**
- ✅ Agents can be configured per-workspace
- ✅ Agent selector filters by current workspace
- ✅ Event-driven reactivity across workspaces
- ✅ Zero breaking changes (default: all workspaces enabled)

---

### Gap 2: Tool Workspace Permissions

**Problem:** `AgentToolBinding.workspacePermissions` not implemented, breaking conditional tool access.

**Impact:** Cannot restrict tools to specific workspace types, violating workspace isolation principles.

**Solution:**

```typescript
// src/core/entities/Agent.ts (continued)
export interface WorkspacePermissions {
  ide: boolean;
  knowledge: boolean;
  study: boolean;
  canvas: boolean;
}

export interface AgentToolBinding {
  toolName: string;
  enabled: boolean;
  workspacePermissions: WorkspacePermissions; // ✨ NEW
  config?: Record<string, unknown>;
}

export interface AgentTool {
  name: string;
  description: string;
  category: 'file' | 'terminal' | 'rag' | 'knowledge';
  workspacePermissions: WorkspacePermissions; // ✨ NEW - Default permissions
  requiresApproval: boolean;
}
```

**Implementation Steps:**
1. Extend `AgentToolBinding` with `workspacePermissions`
2. Extend `AgentTool` registry with default permissions
3. Update tool execution facade to check workspace permissions
4. Add `setToolWorkspacePermissions()` action to agents store
5. Visual indicators in UI for workspace-restricted tools
6. Graceful degradation when tool not available in current workspace

**Validation:**
- ✅ Tools filtered by current workspace at runtime
- ✅ UI shows disabled state for unavailable tools
- ✅ Tool validation errors include workspace context
- ✅ Workspace permission manager UI for bulk configuration

---

## Part II: Event-Driven Reactivity (MEDIUM Priority)

### Gap 3: Cross-Workspace Event Wiring

**Problem:** Event bus exists but not fully wired between all stores, causing stale state across workspace transitions.

**Impact:** User changes in one workspace don't reflect in others until manual refresh.

**Solution:**

```typescript
// Cross-workspace event protocol
export const CROSS_WORKSPACE_EVENTS = {
  // Provider events
  'provider:key-set': (providerId: string) => void,
  'provider:removed': (providerId: string) => void,

  // Agent events
  'agent:created': (agentId: string) => void,
  'agent:updated': (agentId: string) => void,
  'agent:deleted': (agentId: string) => void,
  'agent:workspace-bindings-updated': (agentId: string) => void,

  // Workspace events
  'workspace:changed': (workspaceType: WorkspaceType) => void,
  'project:changed': (projectId: string) => void,

  // Conversation events
  'conversation:created': (conversationId: string) => void,
  'conversation:active-changed': (conversationId: string) => void,

  // RAG events
  'rag:index-ready': (projectId: string) => void,
  'rag:index-deleted': (projectId: string) => void,
} as const;
```

**Implementation Steps:**
1. Create `src/lib/events/cross-workspace-event-protocol.ts` (event catalog)
2. Subscribe all stores to relevant cross-workspace events
3. Add event emission to all state-changing actions
4. Implement workspace transition event sequence
5. Add event logging for debugging
6. Test event propagation across all workspaces

**Event Sequence Example:**

```typescript
// User switches from IDE to Knowledge workspace
1. emit('workspace:changed', 'knowledge')
2. ConversationStore: setCurrentWorkspace('knowledge')
3. RAGStore: setCurrentWorkspace('knowledge')
4. AgentSelectionStore: filterAgentsByWorkspace('knowledge')
5. ToolValidationService: updateToolPermissions('knowledge')
6. UI: Re-render with filtered agents/tools/conversations
```

---

## Part III: Code Hygiene (MEDIUM Priority)

### Gap 4: AgentConfigDialog God Class Refactoring

**Problem:** AgentConfigDialog.tsx is 1,171 lines (limit: 200 lines), violating single responsibility principle.

**Impact:** Unmaintainable, difficult to test, blocks UI enhancements.

**Solution:**

Break into focused components (<200 lines each):

```
src/presentation/components/agent/
├── AgentConfigDialog.tsx (MAIN ORCHESTRATOR - <150 lines)
│   ├── Manages dialog state
│   ├── Routes to sub-dialogs
│   └── Handles event subscriptions
│
├── agent-config/
│   ├── ProviderConfigPanel.tsx (<150 lines)
│   │   ├── Provider selection
│   │   ├── API key input
│   │   └── Model loader
│   │
│   ├── AgentConfigPanel.tsx (<150 lines)
│   │   ├── Agent list
│   │   ├── Create/edit agent
│   │   └── Workspace bindings UI ✨ NEW
│   │
│   ├── ToolConfigPanel.tsx (<150 lines)
│   │   ├── Tool list
│   │   ├── Tool permissions ✨ NEW
│   │   └── Approval settings
│   │
│   └── AgentPreviewPanel.tsx (<120 lines)
│       ├── Agent capabilities display
│       ├── Test chat interface
│       └── Workspace availability preview ✨ NEW
│
└── shared/
    ├── WorkspaceBindingToggle.tsx (<80 lines)
    │   └── Checkbox group for workspace selection ✨ NEW
    │
    └── ToolPermissionGrid.tsx (<120 lines)
        └── Checkbox grid for tool workspace permissions ✨ NEW
```

**Implementation Steps:**
1. Create component structure following slice pattern
2. Extract state management to dedicated hooks
3. Implement WorkspaceBindingToggle component
4. Implement ToolPermissionGrid component
5. Update main dialog to orchestrate sub-panels
6. Test all configurations still functional
7. Update accessibility (keyboard nav, ARIA labels)

**Validation:**
- ✅ All components <200 lines
- ✅ Each component has single responsibility
- ✅ Full feature parity maintained
- ✅ Improved testability and maintainability
- ✅ Workspace binding UI functional
- ✅ Tool permission grid functional

---

## Part IV: Store Consolidation (MEDIUM Priority)

### Gap 5: Canvas Store Duplication

**Status:** Already planned (see `canvas-store-consolidation-plan-2026-01-01.md`)

**Implementation:** Create 5 focused slices (<120 lines each)
- Viewport slice (80 lines)
- Nodes slice (115 lines)
- Edges slice (115 lines)
- Persistence slice (115 lines)
- Metadata slice (95 lines)

**Estimated Completion:** 1-2 hours

---

## Part V: Quality Assurance (MEDIUM-HIGH Priority)

### Gap 6: TypeScript Error Resolution

**Problem:** 200+ TypeScript errors blocking deployment.

**Solution:**

```typescript
// Real validation with Gemini API
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI('AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ');

async function validateTypeScriptWithAI(code: string, errors: TypeScriptError[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro-latest' });

  const prompt = `
    You are a TypeScript expert. Analyze these TypeScript errors and provide fixes:

    Code:
    ${code}

    Errors:
    ${errors.map(e => e.message).join('\n')}

    Provide corrected code with proper types.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

**Implementation Steps:**
1. Run `pnpm tsc --noEmit` to capture all errors
2. Categorize errors by type (missing imports, type mismatches, etc.)
3. Batch-fix similar errors with AI assistance
4. Add missing type definitions
5. Fix import/export inconsistencies
6. Validate fixes with compiler
7. Add pre-commit hook for type checking

**Target:** Zero TypeScript errors

---

### Gap 7: IndexedDB Quota Handling

**Problem:** No quota monitoring or user warnings when storage is full.

**Solution:**

```typescript
// src/infrastructure/persistence/quota-manager.ts (NEW FILE)
export class QuotaManager {
  private WARNING_THRESHOLD = 0.9; // 90%
  private CRITICAL_THRESHOLD = 0.95; // 95%

  async checkStorage(): Promise<{ usage: number; quota: number; percentage: number }> {
    const estimation = await navigator.storage.estimate();
    if (!estimation) throw new Error('StorageManager not available');

    const usage = estimation.usage || 0;
    const quota = estimation.quota || 0;
    const percentage = quota > 0 ? usage / quota : 0;

    if (percentage >= this.CRITICAL_THRESHOLD) {
      await this.handleCriticalQuota(usage, quota);
    } else if (percentage >= this.WARNING_THRESHOLD) {
      await this.handleWarningQuota(usage, quota);
    }

    return { usage, quota, percentage };
  }

  private async handleWarningQuota(usage: number, quota: number) {
    toast.warning(
      'Storage almost full',
      {
        description: `Using ${formatBytes(usage)} of ${formatBytes(quota)}. Consider cleaning up old data.`,
        action: {
          label: 'Cleanup',
          onClick: () => this.cleanupOldData(),
        },
      }
    );
  }

  private async handleCriticalQuota(usage: number, quota: number) {
    toast.error(
      'Storage full',
      {
        description: 'Cannot save data. Please clean up old data to continue.',
        action: {
          label: 'Cleanup Now',
          onClick: () => this.cleanupOldData(),
        },
      }
    );
  }

  private async cleanupOldData() {
    // LRU cleanup strategy
    const useRAGStore = await import('@/infrastructure/persistence/stores/rag/rag-store');
    const useConversationStore = await import('@/infrastructure/persistence/stores/conversation/conversation-store');

    // Clean old conversations
    useConversationStore.getState().cleanupOldConversations();

    // Clean old search cache
    useRAGStore.getState().clearSearchCache();

    toast.success('Storage cleaned up successfully');
  }
}
```

---

## Part VI: Implementation Sequence

### Phase 1: Critical Gaps (Days 1-2)

1. ✅ **Agent Workspace Bindings** (4 hours)
   - Create Agent entity with workspaceBindings
   - Update agents store
   - Add UI configuration panel
   - Cross-workspace sync

2. ✅ **Tool Workspace Permissions** (4 hours)
   - Extend AgentToolBinding with workspacePermissions
   - Update tool validation service
   - Add permission manager UI
   - Implement runtime filtering

3. ✅ **Cross-Workspace Event Wiring** (6 hours)
   - Create event protocol catalog
   - Subscribe all stores
   - Add event emissions
   - Test event propagation

**Deliverable:** Workspace-aware agents and tools with full reactivity

---

### Phase 2: Code Hygiene (Days 3-4)

4. ✅ **AgentConfigDialog Refactoring** (8 hours)
   - Break into 8 focused components
   - Extract state to hooks
   - Implement workspace binding UI
   - Implement tool permission grid
   - Test all configurations

5. ✅ **Canvas Store Consolidation** (4 hours)
   - Create 5 slices
   - Update imports
   - Delete duplicates
   - Update tests

**Deliverable:** God class eliminated, all components <200 lines

---

### Phase 3: Quality Assurance (Days 5-6)

6. ✅ **TypeScript Error Resolution** (6 hours)
   - Run type checker
   - Batch-fix errors with AI
   - Add missing types
   - Pre-commit hook

7. ✅ **IndexedDB Quota Handling** (4 hours)
   - Implement QuotaManager
   - Add monitoring to all stores
   - User warnings
   - Cleanup functionality

8. ✅ **Tree Command + Documentation Update** (2 hours)
   - Run tree command
   - Update CLAUDE.md
   - Update AGENTS.md

**Deliverable:** Zero errors, production-ready quality

---

## Part VII: Validation Checklist

### Using `_bmad-output/validation/sweeping-validation.md`

**LEVEL 1: STATE INTEGRITY**
- [ ] No Dual-Source State Leaks
- [ ] Persist Middleware Naming Collision
- [ ] Selector Hydration Race Conditions
- [ ] State Flow Completeness

**LEVEL 2: CODE HYGIENE**
- [ ] No Unused Imports
- [ ] No Orphaned Event Listeners
- [ ] No Dead Code Branches
- [ ] No Duplicate Utilities

**LEVEL 3: NAMING CONSISTENCY**
- [ ] Prop Naming Standardization
- [ ] Boolean Prop Unification
- [ ] Event Handler Convention
- [ ] API Response Shape Stability

**LEVEL 4: DEPENDENCY SANITY**
- [ ] No Circular Imports
- [ ] Barrel Export Compliance
- [ ] Component Decoupling
- [ ] Store Cross-Import Prevention

**LEVEL 5: INTEGRATION REALITY**
- [ ] FSA Handle Lifecycle
- [ ] WebContainer Boot Guards
- [ ] IndexedDB Quota Handling

**LEVEL 6: WORKSPACE REACTIVITY**
- [ ] Agent Workspace Bindings ✨
- [ ] Tool Workspace Permissions ✨
- [ ] Cross-Workspace Event Wiring ✨
- [ ] Workspace Isolation Enforcement

---

## Part VIII: Success Metrics

### Quantitative Targets

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Agent Workspace Bindings | 0% | 100% | All agents configurable |
| Tool Workspace Permissions | 0% | 100% | All tools filtered |
| Cross-Workspace Events | 30% | 100% | All stores reactive |
| Component Size Violations | 1 major | 0 | All <200 lines |
| TypeScript Errors | 200+ | 0 | `pnpm tsc --noEmit` |
| IndexedDB Quota Monitoring | 0% | 100% | All stores monitored |

### Qualitative Targets

- ✅ **Single-Source-of-Truth**: Provider config, agents, tools all centralized
- ✅ **Workspace Awareness**: All state managers track current workspace
- ✅ **Event-Driven Reactivity**: User changes propagate across all workspaces
- ✅ **Clean Architecture**: 4-layer separation enforced
- ✅ **Production Ready**: Zero errors, quota handling, graceful degradation

---

## Part IX: Next Actions

**Immediate (This Session):**
1. Create Agent entity with workspaceBindings
2. Implement agent workspace binding UI
3. Extend AgentToolBinding with workspacePermissions
4. Implement tool permission manager UI

**Subsequent Sessions:**
5. Complete cross-workspace event wiring
6. Refactor AgentConfigDialog (break god class)
7. Complete canvas store consolidation
8. Resolve all TypeScript errors
9. Implement IndexedDB quota manager
10. Run tree command + update documentation

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-01T19:30:00+07:00
**Author**: @bmad-bmm-dev
**Status**: READY FOR RALPH LOOP EXECUTION
**Gemini API Key**: AIzaSyBDdeIqJ01SCftRWM64oN3dncoGFHSvOgQ
