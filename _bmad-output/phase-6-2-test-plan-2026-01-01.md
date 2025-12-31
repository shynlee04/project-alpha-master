# Phase 6.2 - End-to-End User Journey Testing

**Date**: 2026-01-01
**Phase**: 6.2 - End-to-End User Journey Testing
**Status**: 🔄 IN PROGRESS
**Agent**: BMAD Master - Dev Mode

---

## Test Plan

### Test Environment
- **Dev Server**: http://localhost:3000
- **Browser**: Chrome/Edge (WebContainer support)
- **Test Data**: Default agents, custom agent with workspace permissions

---

## Test Journey 1: Configure Agent Workspace Permissions

### Steps

1. **Navigate to Agents Panel**
   - Open application
   - Click on "Agents" in sidebar
   - Verify agents list displays

2. **Create New Agent with Workspace Permissions**
   - Click "Create New Agent" button
   - Fill in Basic tab:
     - Name: "Test Workspace Agent"
     - Description: "Testing workspace permissions"
     - Provider: OpenRouter
     - Model: Any free model
   - Click "Workspace" tab
   - Configure availability:
     - IDE: ✅ Enabled
     - Knowledge: ✅ Enabled
     - Study: ✅ Enabled
     - Notes: ❌ Disabled
   - Configure tool permissions:
     - Read File: IDE ✓, Knowledge ✓, Study ✓, Notes ✗
     - Write File: IDE ✓, Knowledge ✗, Study ✗, Notes ✗
     - Execute Command: IDE ✓, Knowledge ✗, Study ✗, Notes ✗
     - Synthesize: IDE ✗, Knowledge ✓, Study ✓, Notes ✗
   - Click "Create Agent"

3. **Verify Agent Created**
   - Check agent appears in agents list
   - Verify agent has workspace icon indicators
   - Verify tool availability badges show

**Expected Results**:
- ✅ Agent created successfully
- ✅ Workspace permissions saved
- ✅ Tool permissions configured per workspace

---

## Test Journey 2: Switch Workspaces and See Tool Availability Change

### Steps

1. **Select Test Workspace Agent**
   - Click on agent in agents list
   - Verify agent is now active

2. **Check Tool Availability in IDE Workspace**
   - Verify current workspace: IDE (💻)
   - Check available tools:
     - Read File: Available
     - Write File: Available
     - Execute Command: Available
     - Synthesize: Not Available

3. **Switch to Knowledge Workspace**
   - Click workspace switcher in header
   - Select "Knowledge" (📚)
   - Verify workspace changed

4. **Check Tool Availability in Knowledge Workspace**
   - Verify current workspace: Knowledge (📚)
   - Check available tools:
     - Read File: Available
     - Write File: Not Available
     - Execute Command: Not Available
     - Synthesize: Available

5. **Switch to Study Workspace**
   - Click workspace switcher
   - Select "Study" (🎓)
   - Verify workspace changed

6. **Check Tool Availability in Study Workspace**
   - Verify current workspace: Study (🎓)
   - Check available tools:
     - Read File: Available
     - Write File: Not Available
     - Execute Command: Not Available
     - Synthesize: Available

7. **Attempt to Switch to Notes Workspace**
   - Click workspace switcher
   - Note: Notes is disabled for this agent
   - Verify agent is NOT available in Notes

**Expected Results**:
- ✅ Workspace switch updates available tools
- ✅ Tool availability indicators reflect current workspace
- ✅ Agent re-selection triggers when switching workspaces
- ✅ Disabled workspaces show agent as unavailable

---

## Test Journey 3: Agent Blocks Tool with Clear Explanation

### Steps

1. **Set Up Test Scenario**
   - Current workspace: Knowledge (📚)
   - Active agent: Test Workspace Agent
   - Tool availability: Write File is disabled

2. **Attempt to Use Blocked Tool**
   - Start a chat conversation
   - Ask agent: "Create a file called test.txt with content 'Hello World'"
   - Wait for agent response

3. **Verify Permission Check**
   - Check if agent attempts to use write_file tool
   - Check if permission check triggers
   - Verify denial response

**Expected Results**:
- ✅ Agent checks workspace permissions before tool execution
- ✅ Tool execution denied with clear error message
- ✅ Error message explains:
  - Tool name: "Write File"
  - Workspace: "knowledge"
  - Reason: Not available in this workspace

**Expected Error Message Format**:
```
Tool "Write File" is not available in the "knowledge" workspace.
Contact your administrator to configure workspace permissions.
```

---

## Test Journey 4: Edit Agent Workspace Permissions

### Steps

1. **Open Agent Configuration**
   - Click "Configure" on Test Workspace Agent
   - Verify Workspace tab shows current permissions

2. **Modify Workspace Permissions**
   - Enable Notes workspace
   - Enable Write File for Knowledge workspace
   - Disable Synthesize for Study workspace

3. **Save Changes**
   - Click "Update Agent"
   - Verify success message

4. **Verify Changes Applied**
   - Switch to Knowledge workspace
   - Check if Write File is now available
   - Switch to Study workspace
   - Check if Synthesize is now disabled
   - Switch to Notes workspace
   - Check if agent is available

**Expected Results**:
- ✅ Workspace permissions update correctly
- ✅ Changes reflect immediately in UI
- ✅ Tool availability updates after permission changes

---

## Test Journey 5: Agent Re-selection Logic

### Steps

1. **Create Two Agents with Different Workspace Bindings**
   - Agent A: Available in IDE and Knowledge
   - Agent B: Available in Study and Notes

2. **Select Agent A in IDE Workspace**
   - Set current workspace: IDE
   - Select Agent A
   - Verify Agent A is active

3. **Switch to Study Workspace**
   - Click workspace switcher
   - Select Study workspace
   - Verify automatic agent re-selection:
     - Agent A is no longer available
     - Agent B is automatically selected (if marked as default)

4. **Verify Agent Re-selection Message**
   - Check console for re-selection logs
   - Verify workspace:transition:complete event fired

**Expected Results**:
- ✅ Agent re-selection triggers automatically
- ✅ Default agent selected for workspace
- ✅ Event bus emits transition events
- ✅ No agent selected if none available

---

## Test Journey 6: Concurrent Workspace Switches

### Steps

1. **Test Rapid Workspace Switching**
   - Quickly switch: IDE → Knowledge → Study → Notes → IDE
   - Verify no state corruption
   - Verify tool availability updates correctly

2. **Verify Concurrency Protection**
   - Check isTransitioning flag in WorkspaceTransitionManager
   - Verify second transition waits for first to complete

**Expected Results**:
- ✅ Rapid switches handled gracefully
- ✅ No state corruption
- ✅ Concurrency protection works

---

## Test Journey 7: Edge Cases

### Edge Case 1: Agent Unavailable in All Workspaces

**Steps**:
1. Create agent with all workspaces disabled
2. Try to select agent
3. Verify behavior

**Expected Results**:
- ✅ Agent not selectable
- ✅ Clear message: "Agent not available in any workspace"

### Edge Case 2: All Tools Disabled in Current Workspace

**Steps**:
1. Create agent with all tools disabled in IDE
2. Switch to IDE workspace
3. Try to use agent

**Expected Results**:
- ✅ Agent available but has no tools
- ✅ Clear message in UI: "No tools available in this workspace"

### Edge Case 3: Missing Workspace Bindings (Backward Compatibility)

**Steps**:
1. Load agent created before workspace feature
2. Verify default bindings applied

**Expected Results**:
- ✅ Default bindings: IDE (enabled, default), others enabled
- ✅ No crashes or errors

---

## Test Results

### Journey 1: Configure Agent Workspace Permissions
- [ ] Agent created successfully
- [ ] Workspace permissions saved
- [ ] Tool permissions configured per workspace

### Journey 2: Switch Workspaces and See Tool Availability Change
- [ ] Workspace switch updates available tools
- [ ] Tool availability indicators reflect current workspace
- [ ] Agent re-selection triggers when switching workspaces
- [ ] Disabled workspaces show agent as unavailable

### Journey 3: Agent Blocks Tool with Clear Explanation
- [ ] Agent checks workspace permissions before tool execution
- [ ] Tool execution denied with clear error message
- [ ] Error message explains tool name, workspace, and reason

### Journey 4: Edit Agent Workspace Permissions
- [ ] Workspace permissions update correctly
- [ ] Changes reflect immediately in UI
- [ ] Tool availability updates after permission changes

### Journey 5: Agent Re-selection Logic
- [ ] Agent re-selection triggers automatically
- [ ] Default agent selected for workspace
- [ ] Event bus emits transition events
- [ ] No agent selected if none available

### Journey 6: Concurrent Workspace Switches
- [ ] Rapid switches handled gracefully
- [ ] No state corruption
- [ ] Concurrency protection works

### Journey 7: Edge Cases
- [ ] Agent unavailable in all workspaces handled
- [ ] All tools disabled in workspace handled
- [ ] Missing workspace bindings handled with defaults

---

## Performance Metrics

### Transition Latency

**Expected**: ~3-5ms per workspace switch
**Actual**: [To be measured]

**Breakdown**:
- Permission checks: < 1ms
- Store updates: < 1ms
- Agent filtering: < 1ms
- Agent re-selection: < 1ms
- Event emission: < 0.5ms

### UI Responsiveness

**Expected**: Instantaneous (imperceptible delay)
**Actual**: [To be measured]

---

## Known Issues

### Issue 1: [To be discovered during testing]

**Description**: [Description of issue]

**Severity**: [P0/P1/P2]

**Workaround**: [Workaround if available]

---

## Conclusion

**Status**: Testing in progress

**Next Steps**:
1. Execute all test journeys
2. Document results
3. Fix any discovered issues
4. Re-test after fixes
5. Complete Phase 7: Documentation

---

**End of Test Plan**
