---
date: 2026-01-01
time: 08:00:00
phase: Implementation
workflow: ralph-loop-cycle-4
scope: AGENT_CONFIG_COMPLETION
---

# Ralph Loop Cycle 4: Phase 5-6 Implementation Plan

## Executive Summary

**Analysis Date:** 2026-01-01
**Current Completion:** 85% (Agent Configuration System)
**Target Completion:** 95% (Phase 5-6)
**Remaining Work:** UI gaps, integration issues, missing features

Comprehensive codebase analysis reveals that the agent configuration system has **solid foundations** but requires **UI completion** and **better integration** to achieve production-ready status.

---

## Implementation Status Summary

### ✅ FULLY IMPLEMENTED (85%)

| Component | Status | Implementation Quality |
|-----------|--------|------------------------|
| **Agent Entity** | ✅ COMPLETE | Domain model with workspaceBindings, tools, permissions |
| **Agent Store** | ✅ COMPLETE | Zustand + Dexie, workspace filtering, persistence |
| **Tool Permission System** | ✅ COMPLETE | Trust levels, session overrides, workspace-aware |
| **Workspace Binding** | ✅ COMPLETE | Immutable value objects, event-driven sync |
| **Cross-Workspace Events** | ✅ COMPLETE | Event bus with all required event types |
| **Agent Config Dialog** | ⚠️ PARTIAL | 1089 LOC god class, needs refactoring |
| **Workspace Permission Manager** | ✅ COMPLETE | Advanced UI but not integrated into main flow |
| **Tool Execution** | ✅ COMPLETE | Workspace-aware, approval system |

### ⚠️ PARTIALLY IMPLEMENTED (10%)

| Component | Status | Gap | Severity |
|-----------|--------|-----|----------|
| **ToolPermissionManager UI** | ❌ MISSING | No UI for managing global trust levels | MEDIUM |
| **Agent Import/Export** | ❌ MISSING | No backup/restore functionality | MEDIUM |
| **Workspace-Aware Chat** | ⚠️ PARTIAL | Chat doesn't filter agents by workspace | MEDIUM |
| **WorkspacePermissionManager Integration** | ⚠️ PARTIAL | Exists but not in main config flow | MEDIUM |

### ❌ MISSING (5%)

| Component | Status | Gap | Severity |
|-----------|--------|-----|----------|
| **Permission Audit Trail** | ❌ MISSING | No logging of permission decisions | LOW |
| **Agent Config Templates** | ❌ MISSING | No preset configurations | LOW |
| **Advanced Workspace Features** | ❌ MISSING | No workspace-specific prompts | LOW |

---

## Phase 5: UI Completion (Target: 95%)

### Objective
Complete missing UI components and integrate existing components into main user flows.

### 5.1 ToolPermissionManager UI Component

**Gap:** No UI for managing global trust levels. Users can't configure 'auto' vs 'prompt' vs 'block' settings.

**Implementation:**

Create [`src/presentation/components/agent/ToolTrustLevelManager.tsx`](src/presentation/components/agent/ToolTrustLevelManager.tsx):

```tsx
/**
 * Tool Trust Level Manager
 *
 * UI for managing global tool trust levels across all agents.
 * Allows users to configure which tools require approval.
 */

interface TrustLevelConfig {
  toolId: string;
  toolName: string;
  trustLevel: 'auto' | 'prompt' | 'block';
  reason: string;
}

Features:
- Grid layout showing all tools with current trust level
- Dropdown to change trust level per tool
- Explanation of each trust level
- Reset to defaults button
- Save to localStorage
```

**Integration Points:**
- Add to AgentConfigDialog "Advanced" tab
- Add to Settings page as global configuration
- Subscribe to tool permission changes

### 5.2 Agent Configuration Import/Export

**Gap:** No backup/restore functionality for agent configurations.

**Implementation:**

Create utilities in [`src/lib/agent/agent-io.ts`](src/lib/agent/agent-io.ts):

```typescript
/**
 * Export agent configurations to JSON
 */
export function exportAgents(): string {
  const agents = useAgentsStore.getState().agents;
  return JSON.stringify(agents, null, 2);
}

/**
 * Import agent configurations from JSON
 */
export function importAgents(json: string): Agent[] {
  const agents = JSON.parse(json);
  // Validate with Zod schema
  // Merge with existing agents
  return agents;
}
```

**UI Components:**
- Export button in AgentConfigDialog toolbar
- Import button with file picker
- Validation feedback
- Merge strategy UI (replace vs merge vs cancel)

### 5.3 WorkspacePermissionManager Integration

**Gap:** [`WorkspacePermissionManager.tsx`](src/presentation/components/agent/WorkspacePermissionManager.tsx) exists but is not integrated into main agent configuration flow.

**Implementation:**

Update [`AgentConfigDialog.tsx`](src/presentation/components/agent/AgentConfigDialog.tsx):

```tsx
// In Workspace tab, add:
<WorkspacePermissionManager
  agentId={agent.id}
  bindings={agent.workspaceBindings}
  tools={agent.tools}
  onChange={(updates) => handleWorkspacePermissionChange(updates)}
/>
```

**Current State:**
- WorkspacePermissionManager is standalone component
- Need to embed it in AgentConfigDialog
- Wire up save/cancel handlers

### 5.4 Agent Config Dialog Refactoring

**Gap:** AgentConfigDialog.tsx is 1089 LOC god class (violates 120-line limit).

**Implementation:**

Split into focused components:

```
src/presentation/components/agent/AgentConfigDialog/
├── index.tsx                    # Main dialog orchestration
├── BasicConfigTab.tsx          # Basic info (name, description)
├── WorkspaceConfigTab.tsx      # Workspace bindings
├── ToolPermissionsTab.tsx       # Tool permissions grid
├── AdvancedConfigTab.tsx        # LLM parameters
└── types.ts                     # Shared types
```

**File Sizes:**
- Each component <120 lines
- Main orchestration <150 lines
- Total ~600 lines (45% reduction)

---

## Phase 6: Enhanced Integration (Target: 95%)

### Objective
Deep integration of workspace-aware features across all interfaces.

### 6.1 Workspace-Aware Agent Selection in Chat

**Gap:** Chat interface doesn't filter agents by current workspace.

**Implementation:**

Update [`src/presentation/components/ide/AgentChatPanel/AgentSelector.tsx`](src/presentation/components/ide/AgentChatPanel/AgentSelector.tsx):

```tsx
import { useAgentsStore } from '@/stores/agents-store';
import { detectWorkspace } from '@/lib/workspace/workspace-detector';

function AgentSelector() {
  const currentWorkspace = detectWorkspace();
  const agents = useAgentsStore(state =>
    state.agents.filter(agent =>
      state.getAgentsForWorkspace(currentWorkspace).includes(agent)
    )
  );

  // Only show agents available in current workspace
  return (
    <select>
      {agents.map(agent => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
    </select>
  );
}
```

**Components to Update:**
- AgentChatPanel agent selector
- UnifiedChatPanel agent dropdown
- Quick agent switcher (if exists)

### 6.2 Workspace-Specific Agent Behavior

**Gap:** Agents don't have workspace-specific prompts or configurations.

**Implementation:**

Extend Agent entity (optional enhancement):

```typescript
export interface Agent {
  // ... existing fields

  // NEW: Workspace-specific overrides
  workspaceOverrides?: {
    [workspaceId: string]: {
      systemPrompt?: string;      // Custom prompt for this workspace
      enabledTools?: string[];     // Override enabled tools
      uiVariant?: 'full' | 'compact';
    };
  };
}
```

**Priority:** LOW (nice-to-have, not critical)

### 6.3 Permission Audit Trail

**Gap:** No logging of permission decisions for debugging.

**Implementation:**

Create [`src/lib/agent/permission-audit.ts`](src/lib/agent/permission-audit.ts):

```typescript
/**
 * Audit trail for permission decisions
 */
export class PermissionAuditLogger {
  static logDecision(decision: {
    toolId: string;
    agentId: string;
    workspaceId: string;
    granted: boolean;
    reason: string;
    timestamp: Date;
  }) {
    // Store in IndexedDB for audit trail
    // Keep last 1000 decisions
    // Export to JSON for analysis
  }
}
```

**UI Component:**
- Permission audit viewer in Settings
- Filter by tool, agent, workspace, date range
- Export audit log

**Priority:** LOW (debugging tool, not production-critical)

---

## Component Size Refactoring Plan

### AgentConfigDialog Decomposition

**Current:** 1089 LOC in single file (violates 120-line limit)

**Target:** Split into 6 focused components

```
Before:                          After:
AgentConfigDialog.tsx (1089)   AgentConfigDialog/
                                    ├── index.tsx (150) - Orchestration
                                    ├── BasicConfigTab.tsx (80)
                                    ├── WorkspaceConfigTab.tsx (100)
                                    ├── ToolPermissionsTab.tsx (120)
                                    ├── AdvancedConfigTab.tsx (90)
                                    └── types.ts (60)
```

**Benefits:**
- Each component <120 lines (✅ compliant)
- Single responsibility per component
- Easier testing and maintenance
- Better code organization

---

## Implementation Priority Order

### Sprint 1 (Immediate - 1-2 days)

1. ✅ **Tool Trust Level Manager UI** - Most visible gap
2. ✅ **Agent Import/Export** - High user value
3. ✅ **WorkspacePermissionManager Integration** - Complete existing feature

### Sprint 2 (Short-term - 2-3 days)

4. ✅ **Workspace-Aware Chat** - Critical UX improvement
5. ✅ **AgentConfigDialog Refactoring** - Code quality improvement
6. ✅ **Permission Audit Trail** - Debugging tool

### Sprint 3 (Future - 1-2 weeks)

7. ⏳ **Workspace-Specific Agent Overrides** - Advanced feature
8. ⏳ **Agent Config Templates** - User convenience
9. ⏳ **Advanced Analytics** - Usage insights

---

## Validation Against Sweeping-Validation.md

### ✅ LEVEL 1: STATE INTEGRITY
- [x] Single source of truth for agents
- [x] Persistent across sessions (Dexie)
- [x] Reactive updates (event bus)

### ✅ LEVEL 2: CODE HYGIENE
- [x] No duplicate stores (consolidated)
- [ ] AgentConfigDialog <300 lines (⚠️ 1089 LOC - refactoring needed)

### ✅ LEVEL 3: NAMING CONSISTENCY
- [x] Consistent naming (agentId, workspaceId, toolId)
- [x] Event handler conventions

### ⏳ LEVEL 4: DEPENDENCY SANITY
- [x] No circular imports
- [x] Barrel exports used
- [ ] Components <120 lines (refactoring needed)

### ⏳ LEVEL 5-10: PENDING
- Mobile responsiveness
- I18N wiring
- Performance optimization
- Security validation

---

## Success Metrics

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Agent Config Completion | 85% | 95% | +10% |
| Code Hygiene (God Classes) | 1 (1089 LOC) | 0 | -100% |
| UI Component Coverage | 80% | 95% | +15% |
| Workspace Integration | Partial | Full | +25% |
| Missing Features | 5 major | 1 minor | -80% |

---

## Next Steps

1. **Immediate:** Implement ToolTrustLevelManager UI
2. **Today:** Integrate WorkspacePermissionManager into AgentConfigDialog
3. **This Week:** Complete agent config import/export
4. **Next Week:** Workspace-aware chat integration

**Implementation Ready:** ✅ Phase 5-6 plan complete, ready for execution.

---

**Author:** BMAD Architect Agent
**Framework:** Ralph Loop Cycle 4
**Validation:** Architectural Gap Analysis 2025-12-31
**Status:** ✅ Ready for Implementation
