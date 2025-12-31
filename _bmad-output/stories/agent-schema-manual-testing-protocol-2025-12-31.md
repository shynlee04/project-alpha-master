# Agent Schema Alignment - Manual Testing Protocol

**Date**: 2025-12-31
**Story**: STORY-2025-12-31-001 - Agent Schema Alignment
**Phase**: Phase 2 - Cross-Workspace Validation & Event Bus Testing
**Status**: ⚠️ **AWAITING MANUAL TESTING** - Do not proceed without full context

---

## Executive Summary

**Purpose**: Comprehensive end-to-end validation of Agent schema alignment across all workspaces and components.

**Scope**:
- ✅ Phase 1 COMPLETE: All critical runtime bugs fixed, 30/30 tests passing
- ⏳ Phase 2 PENDING: Cross-workspace agent selection & event bus validation
- ⏳ Phase 3 PENDING: End-to-end agent chat workflow validation
- ⏳ Phase 4 PENDING: Import path cleanup verification
- ⏳ Phase 5 PENDING: Code review against Sprint Change Proposal

---

## Architecture Context (FULL DEPENDENCY CHAIN)

### Agent Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PERSISTENCE LAYER                        │
├─────────────────────────────────────────────────────────────┤
│ • localStorage: agent-selection (activeAgentId only)        │
│ • localStorage: agents-store (full Agent objects with NEW   │
│   schema: providerId, modelId, systemPrompt, etc.)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                        │
├─────────────────────────────────────────────────────────────┤
│ • useAgentSelection() - Active agent ID                     │
│ • useAgents() - List of all agents                         │
│ • useActiveAgent(agents) - Full active agent data           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│ • AgentSelector - Dropdown to select agent                 │
│ • AgentChatPanel - Chat interface with agent               │
│ • AgentConfigDialog - Configure agents                     │
│ • StatusBar - Display active agent                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      EVENT BUS LAYER                         │
├─────────────────────────────────────────────────────────────┤
│ • Runtime events ONLY (tool execution, activity)           │
│ • NO agent configuration/selection events                   │
│ • Events: agent:tool:started, agent:tool:completed,        │
│           agent:activity:changed                           │
└─────────────────────────────────────────────────────────────┘
```

### Critical Findings from Architecture Analysis

**1. Agent Selection NOT Event-Based**
- Agent selection stored in `localStorage` via Zustand
- NO event bus integration for selection changes
- Components read directly from `useAgentSelection()` store
- **Implication**: Changes propagate via Zustand reactivity, NOT events

**2. Event Bus is for Runtime Activity ONLY**
- Events: `agent:tool:started`, `agent:tool:completed`, `agent:activity:changed`
- NO events for: `agent:selected`, `agent:config:updated`, `agent:created`
- **Implication**: Event bus validation should focus on tool execution, NOT config

**3. Cross-Workspace Communication**
- All workspaces share same `agent-selection` and `agents-store` via Zustand
- LocalStorage persistence means selection survives navigation
- **Implication**: Agent selection automatically syncs across workspaces

---

## Phase 2: Cross-Workspace Agent Selection Validation

### Test Objectives

Validate that agent selection works correctly across ALL workspaces and persists during navigation.

### Test Environment Setup

**Prerequisites**:
1. ✅ Application running (`pnpm dev`)
2. ✅ At least 2 agents configured in DEFAULT_AGENTS
3. ✅ Open browser DevTools Console for monitoring
4. ✅ Open DevTools Application → Local Storage → Monitor `agent-selection`

### Test Case 2.1: IDE Workspace Agent Selection

**Steps**:
1. Navigate to IDE workspace (`/ide`)
2. Open Agents panel (left sidebar)
3. Verify DEFAULT_AGENT appears with NEW schema properties
4. Select different agent from dropdown
5. Verify:
   - [ ] Selection persists in localStorage (check DevTools)
   - [ ] AgentSelector displays selected agent name correctly
   - [ ] StatusBar shows active agent
   - [ ] Chat panel shows selected agent in header
   - [ ] No console errors

**Expected Behavior**:
- AgentSelector shows: `Via-Gent Coder (devstral-2512:free)`
- Selection persists after page refresh
- No runtime errors accessing `.providerId` or `.modelId`

**Failure Indicators**:
- ❌ `Cannot read property 'provider' of undefined`
- ❌ `Cannot read property 'model' of undefined`
- ❌ AgentSelector shows undefined/empty values

### Test Case 2.2: Agent Selection Persists Across Workspace Navigation

**Steps**:
1. In IDE workspace, select Agent A
2. Navigate to Knowledge workspace (`/knowledge`)
3. Navigate to Study workspace (`/study`)
4. Navigate back to IDE workspace
5. Verify:
   - [ ] Agent A still selected in all workspaces
   - [ ] localStorage `agent-selection` unchanged
   - [ ] No duplicate agents created
   - [ ] Selection state consistent

**Expected Behavior**:
- Same agent selected across all workspaces
- Zustand store maintains single source of truth
- No "agent not found" errors

### Test Case 2.3: Agent Config Update Propagation

**Steps**:
1. Select Agent A in IDE workspace
2. Open AgentConfigDialog (click settings icon on agent)
3. Change `systemPrompt` or `temperature`
4. Save changes
5. Navigate to different workspace
6. Verify:
   - [ ] Updated agent config reflected immediately
   - [ ] No page refresh required
   - [ ] Changes visible in all workspaces
   - [ ] localStorage `agents-store` updated

**Expected Behavior**:
- Agent updates hot-load without refresh
- All workspaces see updated configuration
- No stale data issues

---

## Phase 3: Event Bus Runtime Validation

### Test Objectives

Validate that agent runtime events (tool execution) work correctly with NEW schema.

### Test Case 3.1: Agent Tool Execution Events

**Steps**:
1. In IDE workspace, select DEFAULT_AGENT
2. Start chat conversation
3. Ask agent to read a file: "Read package.json"
4. Monitor DevTools Console for event logs
5. Verify:
   - [ ] Event emitted: `agent:tool:started` with toolName="read"
   - [ ] Event emitted: `agent:tool:completed` with success=true
   - [ ] No errors accessing agent.providerId or agent.modelId
   - [ ] Tool execution completes successfully

**Expected Behavior**:
- Console shows: `[WorkspaceEvent] agent:tool:started`
- Agent correctly reads file using configured provider
- Tool execution result displayed in chat

**Failure Indicators**:
- ❌ `Cannot read property 'provider' of undefined` during tool execution
- ❌ Tool execution fails silently
- ❌ No events emitted

### Test Case 3.2: Agent Activity State Changes

**Steps**:
1. Select agent in IDE workspace
2. Send message requiring tool execution
3. Monitor agent activity state
4. Verify:
   - [ ] StatusBar shows agent status changing (idle → thinking → executing → idle)
   - [ ] Events: `agent:activity:changed` emitted for each state
   - [ ] No stuck states
   - [ ] Status indicator matches actual activity

**Expected Behavior**:
- Smooth state transitions
- Visual feedback accurate
- No state desynchronization

---

## Phase 4: End-to-End Agent Chat Workflow

### Test Objectives

Validate complete agent interaction workflow with NEW schema.

### Test Case 4.1: Multi-Turn Conversation with Tool Execution

**Steps**:
1. Select DEFAULT_AGENT in IDE workspace
2. Send: "List files in current directory"
3. Wait for response
4. Send: "Read package.json"
5. Wait for response
6. Send: "What dependencies are listed?"
7. Verify:
   - [ ] All tool executions use correct providerId/modelId
   - [ ] Conversation context maintained across turns
   - [ ] No "provider undefined" errors in console
   - [ ] Agent responses accurate and coherent
   - [ ] Thread saved correctly with agent metadata

**Expected Behavior**:
- Seamless multi-turn conversation
- Each tool execution succeeds
- Agent maintains context
- Conversation persists in threads store

### Test Case 4.2: Agent Switch During Conversation

**Steps**:
1. Start conversation with Agent A in IDE workspace
2. Send message, wait for response
3. Switch to Agent B using AgentSelector
4. Send new message
5. Verify:
   - [ ] New message uses Agent B's configuration
   - [ ] Conversation history preserved with correct agent attribution
   - [ ] No cross-contamination of agent configs
   - [ ] Thread messages have correct agentId/agentName

**Expected Behavior**:
- Clean agent switch
- Each message attributed to correct agent
- No config leakage between agents

---

## Phase 5: Component-Level Validation (15 Mixed-Schema Components)

### Test Objectives

Validate all 15 previously mixed-schema components now use NEW schema correctly.

### Component Validation Checklist

For each component, verify:
1. ✅ No `.provider` property access
2. ✅ No `.model` property access
3. ✅ Uses `providerId` correctly
4. ✅ Uses `modelId` correctly
5. ✅ Displays agent information correctly

**Components to Verify**:

1. [ ] `ChatConversation.tsx` - Shows agentModel correctly (line 441)
2. [ ] `AgentSelector.tsx` - Displays agents with NEW schema
3. [ ] `ChatPanel.tsx` - Uses selectedAgent.providerId (line 185)
4. [ ] `AgentsPanel.tsx` - Lists agents with NEW schema
5. [ ] `StatusBar.tsx` - Shows active agent
6. [ ] `AgentChatPanel.tsx` - Uses NEW schema properties
7. [ ] `AgentChatApprovals.tsx` - Agent attribution in approvals
8. [ ] `routes/agents.tsx` - Agent management page
9. [ ] `routes/index.tsx` - Home page agent selection
10. [ ] `routes/settings.tsx` - Settings agent config
11. [ ] `AgentSelectorTrigger.tsx` - FIXED (line 61: modelId) ✅
12. [ ] `AgentSelectorUtils.tsx` - Agent filtering with NEW schema
13. [ ] `ChatHeader.tsx` - Agent display in chat header
14. [ ] `AgentDropdownItem.tsx` - Dropdown items with NEW schema
15. [ ] `AgentChatPanelRefactored.tsx` - FIXED (lines 86-88, 116) ✅

---

## Phase 6: Import Path & Code Quality Validation

### Test Objectives

Verify import paths are clean and code quality standards met.

### Test Case 6.1: Import Path Validation

**Steps**:
1. Search for all imports from `@/mocks/agents`
2. Verify each import should use `@/core/entities/Agent` instead
3. Run TypeScript compilation check
4. Verify:
   - [ ] No imports from deleted `src/core/entities/agents.ts` file
   - [ ] All imports resolve correctly
   - [ ] No "module not found" errors

**Expected Files to Import from**:
- `@/core/entities/Agent` - Agent type definition
- `@/stores/agents-store` - Agent store
- `@/stores/agent-selection-store` - Selection store
- `@/mocks/agents` - DEFAULT_TOOLS, DEFAULT_WORKSPACE_BINDINGS constants only

### Test Case 6.2: Code Quality Standards

**Verification**:
- [ ] No unused PROVIDER_ID_MAP constants (removed) ✅
- [ ] No unused mapProviderNameToId functions
- [ ] All agent property accesses use NEW schema
- [ ] 30/30 tests passing ✅
- [ ] 0 Agent schema-related TypeScript errors ✅

---

## Phase 7: Cross-Browser Validation (3-Device Rule)

### Test Objectives

Validate Agent schema works across different browsers/devices per Sprint Change Proposal.

### Test Matrix

| Device/Browser | Agent Selection | Chat Functionality | Tool Execution | Persistence |
|----------------|----------------|-------------------|----------------|--------------|
| Chrome Desktop | [ ] | [ ] | [ ] | [ ] |
| Firefox Desktop | [ ] | [ ] | [ ] | [ ] |
| Safari Desktop | [ ] | [ ] | [ ] | [ ] |
| Mobile Chrome | [ ] | [ ] | [ ] | [ ] |
| Mobile Safari | [ ] | [ ] | [ ] | [ ] |
| Tablet Safari | [ ] | [ ] | [ ] | [ ] |

**Note**: Mobile validation critical per user's emphasis on responsive design and mobile error states.

---

## Success Criteria

### Phase Gates

**Phase 1** ✅ COMPLETE:
- [x] All PROVIDER_ID_MAP constants removed
- [x] All .provider/.model property access fixed
- [x] 30/30 tests passing
- [x] 0 Agent schema TypeScript errors

**Phase 2** - CURRENT PHASE:
- [ ] Agent selection works in IDE workspace
- [ ] Agent selection persists across workspace navigation
- [ ] Agent config updates propagate correctly
- [ ] No runtime errors during agent operations

**Phase 3**:
- [ ] Agent tool execution events work correctly
- [ ] Agent activity state changes work correctly
- [ ] Event bus receives correct agent metadata

**Phase 4**:
- [ ] Multi-turn conversations work
- [ ] Agent switch during conversation works
- [ ] Thread persistence with agent attribution works

**Phase 5**:
- [ ] All 15 components verified using NEW schema
- [ ] No regression bugs in UI components

**Phase 6**:
- [ ] Import paths clean
- [ ] Code quality standards met

**Phase 7**:
- [ ] Cross-browser validation complete (3-device rule)
- [ ] Mobile responsive agent selection works

---

## Failure Modes & Rollback Plan

### If Critical Bug Found During Testing

1. **STOP** testing immediately
2. **DOCUMENT** bug with reproduction steps
3. **CREATE** new course correction document
4. **FIX** bug following TDD cycle (RED-GREEN-REFACTOR)
5. **RETEST** from beginning
6. **VERIFY** all tests still passing

### Rollback Criteria

- Runtime crashes (agent selection, chat, tool execution)
- Data loss (agent config, conversations, threads)
- Persistence failures (localStorage corruption)
- Event bus breakage (tool execution fails)

**Note**: Since we're fixing bugs, not refactoring architecture, rollback should NOT be necessary if we follow TDD discipline.

---

## Testing Log Template

**Date**: _______________
**Tester**: _______________
**Environment**: (Dev/Prod/Staging)

### Phase 2 Results
- [ ] PASS - Agent selection in IDE workspace
- [ ] PASS - Agent selection persists across workspaces
- [ ] PASS - Agent config updates propagate
- **Notes**: _______________________________

### Phase 3 Results
- [ ] PASS - Tool execution events
- [ ] PASS - Activity state changes
- **Notes**: _______________________________

### Phase 4 Results
- [ ] PASS - Multi-turn conversations
- [ ] PASS - Agent switch during conversation
- **Notes**: _______________________________

### Issues Found
1. _______________________________
2. _______________________________
3. _______________________________

### Overall Status
- [ ] ALL PHASES PASS - Proceed to code review
- [ ] ISSUES FOUND - Create course correction

---

## Next Steps After Testing Complete

1. **If All Tests Pass**:
   - Update course correction document with test results
   - Create CODE-REVIEW document comparing changes to Sprint Change Proposal
   - Update workflow status and sprint status YAML files
   - Mark STORY-2025-12-31-001 as DONE

2. **If Issues Found**:
   - Create new course correction document
   - Follow TDD cycle to fix issues
   - Retest from beginning
   - Document all fixes

---

**Protocol Status**: ⚠️ **AWAITING EXECUTION**
**Last Updated**: 2025-12-31 21:45:00+07:00
**Agent**: BMAD Master (bmad-core-bmad-master mode)
**Next Action**: Execute Phase 2 tests when application is running
