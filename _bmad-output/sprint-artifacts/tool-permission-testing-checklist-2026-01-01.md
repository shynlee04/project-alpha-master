# Tool Permission System - Manual Testing Checklist
**Phase 1: Persistence Verification**

**Date**: 2026-01-01
**Iteration**: 13
**Purpose**: Verify tool permissions persist across browser sessions

---

## Pre-Test Setup

### Environment
- [ ] Browser: Chrome/Edge (File System Access API support required)
- [ ] Dev server running: `pnpm dev`
- [ ] Browser DevTools open (IndexedDB inspection)
- [ ] Clear IndexedDB before starting (fresh state)

### Prerequisites
- [ ] Project loaded in browser
- [ ] Agent configured with API key
- [ ] ToolPermissionManager initialized
- [ ] Zustand devtools installed (optional but helpful)

---

## Test Scenario 1: Basic Persistence

### Objective
Verify trust levels persist across browser reload

### Steps
1. **Open Application**
   - [ ] Navigate to IDE workspace
   - [ ] Open agent panel
   - [ ] Verify agent is active

2. **Approve Tool (Before Persistence)**
   - [ ] Execute a file operation (e.g., `write_file`)
   - [ ] Verify approval dialog appears
   - [ ] Click "Approve" (without "Trust for session" checkbox)
   - [ ] Verify operation completes

3. **Inspect IndexedDB**
   - [ ] Open DevTools → Application → Storage → IndexedDB
   - [ ] Find `via-gent-ide-state` or `tool-permission-store`
   - [ ] Verify `write_file` trust level is saved
   - [ ] Note: Should be `'prompt'` or changed value

4. **Reload Browser**
   - [ ] Press Ctrl+R or F5
   - [ ] Wait for application to reload
   - [ ] Re-open agent panel if needed

5. **Execute Same Tool Again**
   - [ ] Execute same `write_file` operation
   - [ ] **EXPECTED**: No approval dialog (permission persisted)
   - [ ] **ACTUAL»: _________________________

6. **Verify in Store**
   - [ ] Check Zustand store state via DevTools console:
     ```javascript
     useToolPermissionStore.getState().trustLevels
     ```
   - [ ] Verify `write_file` level is persisted

### Result
- [ ] **PASS**: Trust level persisted across reload
- [ ] **FAIL**: Trust level lost (repeat prompt appeared)

---

## Test Scenario 2: Session Trust Behavior

### Objective
Verify session trust is NOT persisted (ephemeral)

### Steps
1. **Clear Previous State**
   - [ ] Reload browser
   - [ ] Reset permissions to defaults if needed

2. **Approve with Session Trust**
   - [ ] Execute `write_file` operation
   - [ ] Check "Trust for this session" checkbox
   - [ ] Click "Approve"
   - [ ] Verify operation completes

3. **Execute Again (Same Session)**
   - [ ] Execute same `write_file` operation
   - [ ] **EXPECTED**: No approval dialog (session trust active)
   - [ ] **ACTUAL**: _________________________

4. **Reload Browser**
   - [ ] Press Ctrl+R or F5
   - [ ] Wait for application to reload

5. **Execute After Reload**
   - [ ] Execute same `write_file` operation
   - [ ] **EXPECTED**: Approval dialog appears (session trust cleared)
   - [ ] **ACTUAL**: _________________________

6. **Verify Session State**
   - [ ] Check store:
     ```javascript
     useToolPermissionStore.getState().sessionTrust
     ```
   - [ ] **EXPECTED**: Empty array `[]`
   - [ ] **ACTUAL**: _________________________

### Result
- [ ] **PASS**: Session trust cleared on reload
- [ ] **FAIL**: Session trust persisted (security issue)

---

## Test Scenario 3: Change Trust Level

### Objective
Verify trust level changes persist

### Steps
1. **Open Permission Editor**
   - [ ] Navigate to agent settings
   - [ ] Find tool permission editor (if UI exists)
   - [ ] **ALTERNATIVE**: Use console to change level:
     ```javascript
     useToolPermissionStore.getState().setTrustLevel('execute_command', 'auto')
     ```

2. **Change Level**
   - [ ] Change `execute_command` from `'prompt'` to `'auto'`
   - [ ] Verify store updated:
     ```javascript
     useToolPermissionStore.getState().trustLevels.execute_command
     ```
   - [ ] **EXPECTED**: `'auto'`

3. **Reload Browser**
   - [ ] Press Ctrl+R or F5

4. **Verify Persistence**
   - [ ] Check store again:
     ```javascript
     useToolPermissionStore.getState().trustLevels.execute_command
     ```
   - [ ] **EXPECTED**: Still `'auto'`
   - [ ] **ACTUAL**: _________________________

5. **Test Execution**
   - [ ] Execute a command
   - [ ] **EXPECTED**: Runs immediately without approval
   - [ ] **ACTUAL**: _________________________

### Result
- [ ] **PASS**: Trust level change persisted
- [ ] **FAIL**: Trust level reverted to default

---

## Test Scenario 4: Multiple Tools

### Objective
Verify permissions persist for multiple tools

### Steps
1. **Set Different Levels**
   - [ ] Set `read_file` to `'auto'` (already default)
   - [ ] Set `write_file` to `'prompt'` (already default)
   - [ ] Set `delete_file` to `'block'` (already default)
   - [ ] Set `execute_command` to `'auto'` (change)

2. **Verify Store State**
   ```javascript
     useToolPermissionStore.getState().trustLevels
     ```
   - [ ] Verify all 4 levels set correctly

3. **Reload Browser**
   - [ ] Press Ctrl+R or F5

4. **Verify All Persisted**
   ```javascript
     useToolPermissionStore.getState().trustLevels
     ```
   - [ ] `read_file` still `'auto'`
   - [ ] `write_file` still `'prompt'`
   - [ ] `delete_file` still `'block'`
   - [ ] `execute_command` still `'auto'`

### Result
- [ ] **PASS**: All tool permissions persisted
- [ ] **FAIL**: Some permissions lost

---

## Test Scenario 5: Blocked Tools

### Objective
Verify blocked tools cannot execute

### Steps
1. **Ensure Tool Blocked**
   - [ ] Check `delete_file` trust level is `'block'`
   - [ ] If not, set it:
     ```javascript
     useToolPermissionStore.getState().setTrustLevel('delete_file', 'block')
     ```

2. **Attempt Execution**
   - [ ] Try to delete a file via agent
   - [ ] **EXPECTED**: Error message / blocked notification
   - [ ] **ACTUAL**: _________________________

3. **Reload Browser**
   - [ ] Press Ctrl+R or F5

4. **Verify Still Blocked**
   - [ ] Try to delete same file
   - [ ] **EXPECTED**: Still blocked
   - [ ] **ACTUAL**: _________________________

### Result
- [ ] **PASS**: Blocked status persisted
- [ ] **FAIL**: Block status lost

---

## Test Scenario 6: Reset to Defaults

### Objective
Verify reset functionality works

### Steps
1. **Modify Permissions**
   - [ ] Change `write_file` to `'auto'`
   - [ ] Change `execute_command` to `'block'`

2. **Reset**
   - [ ] Call reset:
     ```javascript
     useToolPermissionStore.getState().resetToDefaults()
     ```

3. **Verify Reset**
   - [ ] Check store:
     ```javascript
     useToolPermissionStore.getState().trustLevels
     ```
   - [ ] `write_file` back to `'prompt'`
   - [ ] `execute_command` back to `'prompt'`

### Result
- [ ] **PASS**: Reset restored defaults
- [ ] **FAIL**: Reset didn't work

---

## UI Component Testing (If WorkspacePermissionEditor exists)

### Test Scenario 7: Permission Editor UI

### Objective
Verify WorkspacePermissionEditor component works

### Steps
1. **Render Component**
   - [ ] Navigate to agent settings page
   - [ ] Verify WorkspacePermissionEditor visible
   - [ ] Verify all 4 workspace tabs shown (IDE, Knowledge, Study, Notes)

2. **Check Tools Listed**
   - [ ] Verify `read_file` shown
   - [ ] Verify `write_file` shown
   - [ ] Verify `delete_file` shown
   - [ ] Verify `execute_command` shown

3. **Change Permission via UI**
   - [ ] Select "Execute Command" row
   - [ ] Change dropdown to "Auto-approve"
   - [ ] **EXPECTED**: Badge color changes to green
   - [ ] **ACTUAL**: _________________________

4. **Verify Store Update**
   - [ ] Check store:
     ```javascript
     useToolPermissionStore.getState().trustLevels.execute_command
     ```
   - [ ] **EXPECTED**: `'auto'`
   - [ ] **ACTUAL**: _________________________

5. **Test Persistence**
   - [ ] Reload browser
   - [ ] Re-open permission editor
   - [ ] **EXPECTED**: "Execute Command" still shows "Auto-approve"
   - [ ] **ACTUAL**: _________________________

### Result
- [ ] **PASS**: UI works and persists
- [ ] **FAIL**: UI doesn't persist changes

---

## Integration Tests

### Test Scenario 8: Facade Integration

### Objective
Verify ToolPermissionManager facade works with new store

### Steps
1. **Get Instance**
   - [ ] In console, run:
     ```javascript
     import { ToolPermissionManager } from '@/lib/agent/tool-permission-manager';
     const mgr = ToolPermissionManager.getInstance();
     ```

2. **Check Permission**
   - [ ] Run:
     ```javascript
     mgr.checkPermission('write_file')
     ```
   - [ ] **EXPECTED**: Returns object with `needsApproval: true`
   - [ ] **ACTUAL**: _________________________

3. **Set Level**
   - [ ] Run:
     ```javascript
     mgr.setTrustLevel('write_file', 'auto')
     ```
   - [ ] Check store updated:
     ```javascript
     useToolPermissionStore.getState().trustLevels.write_file
     ```
   - [ ] **EXPECTED**: `'auto'`
   - [ ] **ACTUAL**: _________________________

4. **Verify Backwards Compatibility**
   - [ ] All existing agent tool calls work
   - [ ] File operations work
   - [ ] Terminal operations work

### Result
- [ ] **PASS**: Facade integration works
- [ ] **FAIL**: Facade methods broken

---

## Performance Tests

### Test Scenario 9: Store Performance

### Objective
Verify store operations are fast

### Steps
1. **Store Initialization**
   - [ ] Reload browser
   - [ ] Measure time to store ready
   - [ ] **EXPECTED**: <100ms
   - [ ] **ACTUAL**: _________________________ ms

2. **Permission Check Speed**
   - [ ] Run 100 permission checks:
     ```javascript
     console.time('100-checks');
     for (let i = 0; i < 100; i++) {
       useToolPermissionStore.getState().getTrustLevel('write_file');
     }
     console.timeEnd('100-checks');
     ```
   - [ ] **EXPECTED**: <10ms total
   - [ ] **ACTUAL**: _________________________ ms

3. **IndexedDB Write Speed**
   - [ ] Change permission:
     ```javascript
     console.time('db-write');
     useToolPermissionStore.getState().setTrustLevel('test', 'auto');
     console.timeEnd('db-write');
     ```
   - [ ] **EXPECTED**: <50ms
   - [ ] **ACTUAL**: _________________________ ms

### Result
- [ ] **PASS**: Performance acceptable
- [ ] **FAIL**: Performance too slow

---

## Edge Cases

### Test Scenario 10: Unknown Tools

### Objective
Verify unknown tools default to 'prompt'

### Steps
1. **Check Unknown Tool**
   - [ ] Run:
     ```javascript
     useToolPermissionStore.getState().getTrustLevel('unknown_tool_xyz')
     ```
   - [ ] **EXPECTED**: Returns `'prompt'` (safe default)
   - [ ] **ACTUAL**: _________________________

2. **Permission Check for Unknown**
   - [ ] Run:
     ```javascript
     ToolPermissionManager.getInstance().checkPermission('unknown_tool_xyz')
     ```
   - [ ] **EXPECTED**: `needsApproval: true`
   - [ ] **ACTUAL**: _________________________

### Result
- [ ] **PASS**: Safe defaults work
- [ ] **FAIL**: Unsafe defaults

---

## Summary

### Tests Passed
- [ ] Scenario 1: Basic Persistence
- [ ] Scenario 2: Session Trust Behavior
- [ ] Scenario 3: Change Trust Level
- [ ] Scenario 4: Multiple Tools
- [ ] Scenario 5: Blocked Tools
- [ ] Scenario 6: Reset to Defaults
- [ ] Scenario 7: Permission Editor UI
- [ ] Scenario 8: Facade Integration
- [ ] Scenario 9: Store Performance
- [ ] Scenario 10: Unknown Tools

### Overall Result
- **PASS COUNT**: _____ / 10
- **FAIL COUNT**: _____ / 10

### Issues Found
1. _________________________
2. _________________________
3. _________________________

### Recommendations
- [ ] All tests pass → Ready for Phase 2
- [ ] Some failures → Fix before proceeding
- [ ] Critical failures → Block Phase 2

---

**Testing Completed By**: _________________________
**Date**: _________________________
**Browser**: _________________________
