# Workspace Permission Integration - Implementation Plan

**Date**: 2026-01-01 17:00:00+07:00
**Cycle**: 2 of Autonomous Loop
**Constitution**: Maintainability, Accessibility, Performance, Scalability
**Approach**: Sequential Thinking + User Journey Centered

---

## 🎯 User Journey Analysis

### Journey 1: Configure Agent Workspace Permissions

**User Goal**: "I want to restrict the 'Execute Command' tool to only work in the IDE workspace"

**Current Journey** (BROKEN):
1. User opens Agent Config Dialog ✅
2. User sees tool permissions (trust levels) ✅
3. User tries to set workspace-specific permissions ❌ **FEATURE MISSING**
4. User confused - "Why is Execute Command running in Notes workspace?" ❌

**Target Journey** (AFTER FIX):
1. User opens Agent Config Dialog ✅
2. User navigates to "Workspace Permissions" tab ✅
3. User sees grid: [Workspaces] × [Tools] with toggle switches ✅ **NEW**
4. User toggles Execute Command: IDE=ON, Knowledge=OFF, Study=OFF, Notes=OFF ✅ **NEW**
5. User saves - permissions persist across sessions ✅
6. User switches to Notes workspace - Execute Command tool hidden ✅ **NEW**
7. User tries to use agent - Execute Command blocked with clear message ✅ **NEW**

**Required Components**:
- `WorkspaceToolPermissionsConfig.tsx` - Grid UI for workspace × tool permissions
- Store for workspace permission state
- Integration with agent save flow

### Journey 2: Switch Workspaces and See Tool Availability Change

**User Goal**: "When I switch from IDE to Knowledge, I expect different tools to be available"

**Current Journey** (BROKEN):
1. User clicks workspace switcher ✅
2. User selects "Knowledge" ✅
3. Workspace changes - but tool list doesn't update ❌
4. User confused - "Why can I still see Execute Command?" ❌

**Target Journey** (AFTER FIX):
1. User clicks workspace switcher ✅
2. User selects "Knowledge" ✅
3. **Event emitted**: `workspace:changed` { from: 'ide', to: 'knowledge' } ✅ **NEW**
4. **AgentSelector filters**: Only show agents available in Knowledge ✅ **NEW**
5. **Tool list updates**: Show only tools enabled for Knowledge ✅ **NEW**
6. **Visual feedback**: Toast message "3 tools available in Knowledge workspace" ✅ **NEW**
7. User configures agent - only Knowledge-compatible tools shown ✅ **NEW**

**Required Components**:
- Workspace switcher enhanced with event emission
- AgentSelector with workspace filtering
- Tool list with workspace filtering
- Toast notification system
- State orchestration layer

### Journey 3: Agent Blocks Tool with Clear Explanation

**User Goal**: "Understand why a tool isn't available in current workspace"

**Current Journey** (BROKEN):
1. User in Knowledge workspace ✅
2. User asks agent to write file ✅
3. Agent tries to execute write_file ✅
4. **NO CHECK** - Tool executes even though disabled ❌
5. Security breach - tool runs in wrong workspace ❌

**Target Journey** (AFTER FIX):
1. User in Knowledge workspace ✅
2. User asks agent to write file ✅
3. Agent tries to execute write_file ✅
4. **Workspace check triggered**: ✅ **NEW**
   - Current workspace: 'knowledge'
   - Tool permissions: write_file { knowledge: false }
   - Result: BLOCKED
5. **Clear error message**: ✅ **NEW**
   ```
   ⛔ Cannot execute 'write_file' in Knowledge workspace

   This tool is only available in:
   • IDE workspace
   • Notes workspace

   Enable 'write_file' for Knowledge workspace in Agent Settings?
   [Enable] [Cancel]
   ```
6. User understands restriction and can fix it ✅

**Required Components**:
- Workspace permission check in tool execution flow
- User-friendly error messages with workspace context
- Quick link to agent settings
- Fallback to read-only operations

---

## 🏗️ Architecture Orchestration Plan

### State Management Layers

**Current State** (Fragmented):
- 10+ Zustand stores with unclear boundaries
- Event bus exists but underutilized
- No orchestration layer for workspace transitions
- State sync issues between stores

**Target Architecture** (Orchestrated):

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (UI Components - Workspace Switcher, Agent Selector, etc.)   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 WORKSPACE CONTEXT LAYER (NEW)               │
│  - Current workspace: 'ide' | 'knowledge' | 'study' | 'notes'  │
│  - Active project: ProjectMetadata                           │
│  - Available agents: filtered by workspace                  │
│  - Available tools: filtered by workspace × agent           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  ORCHESTRATION LAYER (NEW)                  │
│  - WorkspaceTransitionManager (coordinates state updates)  │
│  - AgentWorkspaceFilter (filters agents by workspace)      │
│  - ToolPermissionFilter (filters tools by workspace)       │
│  - EventCoordinator (emits cross-workspace events)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     STATE LAYER (Zustand)                    │
│  - useWorkspaceStore (NEW - single source of truth)        │
│  - useAgentsStore (existing)                               │
│  - useToolPermissionStore (NEW - workspace-aware)          │
│  - useProviderStore (existing)                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  EVENT BUS LAYER                             │
│  - CrossWorkspaceEventBus (existing - needs enhancement)   │
│  - WorkspaceEventBus (existing)                             │
└─────────────────────────────────────────────────────────────┘
```

### Sequential Refactoring Checklist

**Phase 1: Foundation** (DO NOT BREAK EXISTING FUNCTIONALITY)
- [ ] Create `useWorkspaceStore` - Single source of truth for workspace state
- [ ] Create `WorkspaceTransitionManager` - Orchestrates workspace changes
- [ ] Add `workspace:changed` event to `CrossWorkspaceEventBus`
- [ ] Test: Workspace switcher still works (no regression)

**Phase 2: Permission Integration** (ADD NEW FUNCTIONALITY)
- [ ] Wire `WorkspacePermissionManager` into tool execution flow
- [ ] Add workspace checks in `use-agent-chat-with-tools.ts`
- [ ] Add workspace checks in `factory.ts` tool creation
- [ ] Test: Tools blocked in wrong workspace (NEW FUNCTIONALITY)

**Phase 3: UI Components** (FILL VISUAL GAPS)
- [ ] Create `WorkspaceToolPermissionsConfig.tsx`
- [ ] Create `ToolAvailabilityIndicator.tsx`
- [ ] Enhance `AgentSelector` with workspace filtering
- [ ] Enhance `WorkspaceSwitcher` with tool counts
- [ ] Test: UI shows correct tool availability per workspace

**Phase 4: State Orchestration** (COORDINATE STATE UPDATES)
- [ ] Implement `WorkspaceTransitionManager`
- [ ] Wire state updates on workspace change
- [ ] Coordinate agent re-selection if needed
- [ ] Coordinate tool list refresh
- [ ] Test: State updates propagate correctly on workspace switch

**Phase 5: User Experience** (POLISH INTERACTIONS)
- [ ] Add toast notifications for workspace changes
- [ ] Add visual indicators for blocked tools
- [ ] Add "Enable in this workspace" quick actions
- [ ] Add workspace-specific help text
- [ ] Test: User understands why tools are blocked

**Phase 6: Documentation** (UPDATE RECORDS)
- [ ] Run `tree` command to get file structure
- [ ] Update `CLAUDE.md` with new components
- [ ] Update `AGENTS.md` with new patterns
- [ ] Create integration guide
- [ ] Test: Documentation matches implementation

---

## 🎨 Missing UI Components Specification

### Component 1: WorkspaceToolPermissionsConfig

**Purpose**: Configure tool permissions per workspace
**Location**: `src/presentation/components/agent/WorkspaceToolPermissionsConfig.tsx`
**Size Estimate**: 350-400 lines

**Props**:
```typescript
interface WorkspaceToolPermissionsConfigProps {
  agent: Agent;
  onAgentUpdate: (updates: Partial<Agent>) => void;
  workspaceContext: 'ide' | 'knowledge' | 'study' | 'notes';
}
```

**UI Structure**:
```
┌──────────────────────────────────────────────────────────┐
│  Workspace Tool Permissions                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Tool         │ IDE │ Knowledge │ Study │ Notes │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Read File    │  ON │    ON    │  ON  │  ON  │   │
│  │ Write File   │  ON │   OFF    │  ON  │  ON  │   │
│  │ Exec Cmd     │  ON │   OFF    │ OFF  │ OFF  │   │
│  │ Synthesize   │ OFF │   ON    │  ON  │  ON  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Copy to All Workspaces] [Reset to Defaults]           │
└──────────────────────────────────────────────────────────┘
```

**Interactions**:
- Click toggle → Updates `agent.tools[i].workspacePermissions[workspace]`
- "Copy to All" → Sets current tool's permissions to all workspaces
- "Reset" → Resets to default (IDE-only)
- Save → Persists to `useAgentsStore`

### Component 2: ToolAvailabilityIndicator

**Purpose**: Show which tools are available in current workspace
**Location**: `src/presentation/components/agent/ToolAvailabilityIndicator.tsx`
**Size Estimate**: 120-150 lines

**Props**:
```typescript
interface ToolAvailabilityIndicatorProps {
  agent: Agent;
  workspace: 'ide' | 'knowledge' | 'study' | 'notes';
  variant?: 'compact' | 'detailed';
}
```

**UI Structure** (Compact):
```
🔧 4 tools available in IDE workspace
```

**UI Structure** (Detailed):
```
┌────────────────────────────────────────────┐
│ Available Tools (4)                         │
│ ✓ Read File  ✓ Write File  ✓ Exec Cmd    │
│ ⚠ Synthesize (disabled)                   │
└────────────────────────────────────────────┘
```

### Component 3: WorkspaceAwareAgentSelector

**Purpose**: Enhanced agent selector filtered by workspace
**Location**: `src/presentation/components/agent/WorkspaceAwareAgentSelector.tsx`
**Size Estimate**: 200-250 lines

**Enhancement**:
- Filter agent list by `workspaceBindings[workspace].isAvailable`
- Show UI variant icon (full/compact/minimal)
- Show "Agent not available" message if no agents for workspace
- Quick action: "Make agent available in this workspace"

### Component 4: WorkspaceEnhancedSwitcher

**Purpose**: Enhanced workspace switcher with tool counts
**Location**: `src/presentation/components/common/WorkspaceEnhancedSwitcher.tsx`
**Size Estimate**: 180-220 lines

**Enhancement**:
- Show tool count badge per workspace
- Show current workspace highlight
- Emit `workspace:changed` event on selection
- Toast notification: "Switched to [Workspace] • X tools available"

---

## 🔌 Wiring Plan: Workspace Permission Checks

### Injection Point 1: Agent Factory

**File**: `src/lib/agent/factory.ts`
**Location**: Lines 66-142 (`createClientFileTools`)

**Current Code**:
```typescript
const readFile = readFileDef.client(async (args: unknown) => {
  const input = args as ReadFileInput;
  const tools = getFileTools();
  // No workspace check here ❌
```

**Refactored Code**:
```typescript
const readFile = readFileDef.client(async (args: unknown) => {
  // Step 1: Get workspace context (from ProjectContext)
  const workspaceContext = getWorkspaceContext();

  // Step 2: Get agent configuration
  const agent = getActiveAgent();

  // Step 3: Check workspace permission
  const permissionCheck = workspacePermissionManager.checkWorkspacePermission(
    'read_file',
    agent.tools,
    agent.workspaceBindings,
    workspaceContext.type
  );

  if (!permissionCheck.canExecute) {
    return {
      success: false,
      error: `Tool not available in ${workspaceContext.type} workspace`,
      blocked: true,
      code: 'WORKSPACE_PERMISSION_DENIED',
    };
  }

  // Step 4: Execute tool
  const input = args as ReadFileInput;
  const tools = getFileTools();
  // ... rest of implementation
```

### Injection Point 2: Tool Execution Hook

**File**: `src/lib/agent/hooks/use-agent-chat-with-tools.ts`
**Location**: Lines 432-499 (pending approvals extraction)

**Add Before Tool Execution**:
```typescript
// Extract pending tool approvals
const pendingApprovals = parts
  .filter((part) => part.type === 'tool-call' && part.state === 'approval-requested')
  .map((part) => {
    // NEW: Check workspace permission before approval
    const agent = useAgentsStore.getState().getAgent(activeAgentId);
    const workspaceContext = useWorkspaceStore.getState();

    const workspaceCheck = workspacePermissionManager.checkWorkspacePermission(
      part.name,
      agent.tools,
      agent.workspaceBindings,
      workspaceContext.currentWorkspace
    );

    return {
      id: part.id,
      toolName: part.name,
      canExecute: workspaceCheck.canExecute,
      workspaceBlocked: !workspaceCheck.canExecute,
      reason: workspaceCheck.reason,
    };
  });
```

---

## 📊 State Management Orchestration

### New Store: useWorkspaceStore

**Purpose**: Single source of truth for workspace state
**Location**: `src/lib/state/workspace-store.ts`
**Size Estimate**: 250-300 lines

**State Interface**:
```typescript
interface WorkspaceState {
  // Current workspace
  currentWorkspace: 'ide' | 'knowledge' | 'study' | 'notes';
  currentProjectId: string | null;

  // Workspace-specific agent availability
  availableAgents: Agent[]; // Filtered by workspaceBindings

  // Workspace-specific tool availability
  availableTools: Map<string, ToolAvailability>; // agentId → tools

  // Transition state
  isTransitioning: boolean;
  transitionFrom: WorkspaceType | null;
}

interface WorkspaceActions {
  switchWorkspace: (workspace: WorkspaceType) => Promise<void>;
  refreshAvailability: () => Promise<void>;
  getAvailableAgents: () => Agent[];
  getAvailableTools: (agentId: string) => ToolAvailability[];
}
```

**Key Features**:
- Emits `workspace:changed` event on switch
- Filters agents by `workspaceBindings.isAvailable`
- Filters tools by `workspacePermissions[workspace]`
- Coordinates state updates across all stores

### New Manager: WorkspaceTransitionManager

**Purpose**: Orchestrates state updates during workspace transitions
**Location**: `src/lib/workspace/workspace-transition-manager.ts`
**Size Estimate**: 200-250 lines

**Responsibilities**:
```typescript
class WorkspaceTransitionManager {
  // Coordinate state updates across stores
  async transitionTo(workspace: WorkspaceType): Promise<void> {
    // 1. Start transition
    // 2. Save current state
    // 3. Update workspace store
    // 4. Emit workspace:changed event
    // 5. Filter agents for new workspace
    // 6. Check if current agent still available
    // 7. Re-select agent if needed
    // 8. Refresh tool availability
    // 9. Update UI state
    // 10. End transition
  }

  // Check if agent needs re-selection
  private shouldReselectAgent(currentAgent: Agent, newWorkspace: WorkspaceType): boolean

  // Find best available agent
  private findAvailableAgent(agents: Agent[], workspace: WorkspaceType): Agent | null

  // Coordinate event emissions
  private emitWorkspaceChangedEvent(from: WorkspaceType, to: WorkspaceType): void
}
```

---

## ✅ Validation Checklist

Before marking implementation complete, validate:

### Functionality
- [ ] Tools blocked in wrong workspace
- [ ] Agents filtered by workspace availability
- [ ] Workspace switcher emits events
- [ ] State updates propagate correctly
- [ ] No regression in existing functionality

### User Experience
- [ ] Clear error messages for blocked tools
- [ ] Visual indicators for tool availability
- [ ] Smooth workspace transitions
- [ ] Toast notifications for changes
- [ ] Help text where needed

### Performance
- [ ] Workspace switches < 500ms
- [ ] Permission checks don't block UI
- [ ] State updates don't cause re-renders
- [ ] Memory leaks prevented

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announcements
- [ ] Color contrast WCAG AA
- [ ] Touch targets ≥ 44×44px

### Code Quality
- [ ] No TypeScript errors
- [ ] Tests passing (≥ 80% coverage)
- [ ] No god classes (< 300 lines)
- [ ] Single responsibility respected

---

## 📅 Implementation Timeline

**Week 1: Foundation**
- Day 1-2: Create useWorkspaceStore + WorkspaceTransitionManager
- Day 3-4: Wire workspace permission checks in tool execution
- Day 5: Testing and validation

**Week 2: UI Components**
- Day 1-2: Create WorkspaceToolPermissionsConfig
- Day 3-4: Create ToolAvailabilityIndicator + enhance switcher
- Day 5: Integration testing

**Week 3: Polish & Documentation**
- Day 1-2: State orchestration and coordination
- Day 3-4: UX improvements and accessibility
- Day 5: Documentation updates (CLAUDE.md, AGENTS.md)

---

**Prepared by**: BMAD Orchestrator (Autonomous Mode)
**Last Updated**: 2026-01-01 17:00:00+07:00
**Status**: READY FOR EXECUTION - Awaiting Approval
