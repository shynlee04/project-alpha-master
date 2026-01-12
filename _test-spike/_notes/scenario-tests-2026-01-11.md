# Test Scenarios Specification

**Document ID:** scenario-tests-2026-01-11  
**Created:** 2026-01-11  
**Author:** Test Spike Harness Implementation  
**Phase:** Implementation

## Overview

This document describes the test scenarios for the Test-Spike Harness. Each scenario tests a specific aspect of agent behavior, permission enforcement, and system functionality.

## Scenario Types

### 1. Agent Tool Execution Test

**Purpose:** Validate that tools are invoked correctly and permissions are enforced.

**Test Cases:**

| Case | Description | Expected Result |
|------|-------------|-----------------|
| read_file | Test read_file operation with various profiles | Success/failure based on profile |
| write_to_file | Test write_to_file operation with various profiles | Success/failure based on profile |
| delete_file | Test delete operation with various profiles | Success/failure based on profile |
| execute | Test execute operation with various profiles | Success/failure based on profile |
| list_files | Test list_files operation with various profiles | Success/failure based on profile |

**Runner:** `AgentToolExecutionRunner`

**Implementation:**

```typescript
export class AgentToolExecutionRunner {
  async run(profile: PermissionProfile): Promise<ScenarioResult> {
    // Register test tools (mock implementations)
    const tools = registerMockTools();
    
    // Create test agent with profile
    const agent = createTestAgent({
      tools,
      profile,
      logger,
    });
    
    // Execute multi-step workflow
    await agent.executeWorkflow([
      { tool: 'read_file', params: { path: '/test/file.txt' } },
      { tool: 'write_to_file', params: { path: '/test/output.txt', content: 'test' } },
      { tool: 'list_files', params: { path: '/test' } },
    ]);
    
    // Assert tools were invoked correctly
    // Assert permissions enforced
    // Return results with logs
  }
}
```

**Validation Criteria:**
- [ ] All tools invoked with correct parameters
- [ ] Permissions enforced as expected
- [ ] Logs captured for each tool call
- [ ] Errors handled gracefully

### 2. Filesystem CRUD Test

**Purpose:** Validate filesystem operations with permission profiles.

**Test Matrix:**

| Operation | read-only | write-only | full-access | path-restricted |
|-----------|-----------|------------|-------------|-----------------|
| Create | ❌ | ✅ | ✅ | ⚠️ (allowed paths) |
| read_file | ✅ | ❌ | ✅ | ⚠️ (allowed paths) |
| Update | ❌ | ✅ | ✅ | ⚠️ (allowed paths) |
| Delete | ❌ | ❌ | ✅ | ⚠️ (allowed paths) |
| List | ✅ | ❌ | ✅ | ⚠️ (allowed paths) |

**Runner:** `FilesystemCRUDRunner`

**Implementation:**

```typescript
export class FilesystemCRUDRunner {
  async run(profile: PermissionProfile): Promise<ScenarioResult> {
    // Create isolated test workspace
    const workspace = await createIsolatedWorkspace();
    
    // Test read operations
    const readResult = await this.testRead(workspace, profile);
    expect(readResult.success).toBe(profile === 'read-only' || profile === 'full-access');
    
    // Test write operations
    const writeResult = await this.testWrite(workspace, profile);
    expect(writeResult.success).toBe(profile === 'write-only' || profile === 'full-access');
    
    // Test delete operations
    const deleteResult = await this.testDelete(workspace, profile);
    expect(deleteResult.success).toBe(profile === 'full-access');
    
    // Test path restrictions
    const pathResult = await this.testPathRestrictions(workspace, profile);
    
    // Assert predictable failures
    // Audit log completeness
  }
}
```

**Validation Criteria:**
- [ ] Create operations work correctly
- [ ] read_file operations work correctly
- [ ] Update operations work correctly
- [ ] Delete operations work correctly
- [ ] Path restrictions enforced
- [ ] Logs capture all operations

### 3. State Management Test

**Purpose:** Validate state snapshot and restore functionality.

**Test Cases:**

| Case | Description | Expected Result |
|------|-------------|-----------------|
| Snapshot | Create initial state snapshot | Snapshot created successfully |
| Modify | Execute operations after snapshot | Operations complete |
| Restore | Restore to previous snapshot | State restored to exact point |
| Verify | Verify deterministic restore | State matches original snapshot |

**Runner:** `StateManagementRunner`

**Implementation:**

```typescript
export class StateManagementRunner {
  async run(): Promise<ScenarioResult> {
    // Create agent state snapshot
    const snapshot1 = await agent.createSnapshot();
    
    // Execute some operations
    await agent.execute({ tool: 'read_file', path: '/test/file1.txt' });
    await agent.execute({ tool: 'write_to_file', path: '/test/file2.txt', content: 'test' });
    
    // Create restore point
    const restorePoint = await agent.createRestorePoint();
    
    // Execute more operations
    await agent.execute({ tool: 'delete_file', path: '/test/file3.txt' });
    
    // Restore to snapshot
    await agent.restore(restorePoint);
    
    // Assert deterministic restore
    const currentState = await agent.getState();
    expect(currentState).toEqual(snapshot1);
    
    // Document state boundaries
    return {
      success: true,
      stateBoundaries: {
        memory: '512MB',
        disk: '1GB',
        time: '5 minutes',
      },
    };
  }
}
```

**Validation Criteria:**
- [ ] Snapshot creation successful
- [ ] State modifications tracked
- [ ] Restore point created successfully
- [ ] Deterministic restore verified
- [ ] State boundaries documented

### 4. Prompt and Mode Testing

**Purpose:** Validate prompt versions and mode switching.

**Test Matrix:**

| Mode | Prompt v1 | Prompt v2 | Prompt v3 |
|------|-----------|-----------|-----------|
| code | ✅ | ✅ | ✅ |
| debug | ✅ | ✅ | ✅ |
| architect | ✅ | ✅ | ✅ |
| ask | ✅ | ✅ | ✅ |

**Runner:** `PromptModeTestingRunner`

**Implementation:**

```typescript
export class PromptModeTestingRunner {
  async run(): Promise<ScenarioResult> {
    // Test different prompt versions
    const promptV1Result = await this.testPromptVersion('v1');
    const promptV2Result = await this.testPromptVersion('v2');
    const promptV3Result = await this.testPromptVersion('v3');
    
    // Test mode switching per message/run
    const modeSwitchResult = await this.testModeSwitching();
    expect(modeSwitchResult.success).toBe(true);
    
    // Assert mode is persisted
    const persistedMode = await agent.getCurrentMode();
    expect(persistedMode).toBe('code');
    
    // Assert mode changes are explainable
    const modeChangeReason = await agent.getModeChangeReason();
    expect(modeChangeReason).toBeDefined();
    
    // Validate prompt-modes matrix
    const matrixValidation = await this.validatePromptModeMatrix();
    expect(matrixValidation.valid).toBe(true);
  }
  
  private async testPromptVersion(version: string): Promise<TestResult> {
    const prompt = await loadPromptVersion(version);
    const result = await agent.execute(prompt);
    return {
      version,
      success: result.success,
      responseTime: result.responseTime,
    };
  }
}
```

**Validation Criteria:**
- [ ] All prompt versions work correctly
- [ ] Mode switching functions properly
- [ ] Mode persistence verified
- [ ] Mode change reasons documented
- [ ] Prompt-modes matrix validated

## Scenario Execution Flow

### Execution Order

```
1. Agent Tool Execution
   ↓ (pass)
2. Filesystem CRUD
   ↓ (pass)
3. State Management
   ↓ (pass)
4. Prompt and Mode Testing
   ↓ (pass)
5. Generate Report
```

### Failure Handling

| Scenario | On Failure | Retry |
|----------|------------|-------|
| Agent Tool Execution | Log error, continue | Yes (2x) |
| Filesystem CRUD | Abort scenario | No |
| State Management | Log error, continue | Yes (1x) |
| Prompt and Mode | Log error, continue | Yes (2x) |

## Expected Metrics

### Scenario Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Execution Time | < 30s | TBD |
| Success Rate | > 95% | TBD |
| Error Rate | < 5% | TBD |
| Memory Usage | < 512MB | TBD |

### Tool Call Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Tool Calls | All tracked | TBD |
| Permission Checks | All logged | TBD |
| State Transitions | All captured | TBD |

## Test Data

### Sample Scenarios

**Scenario 1: Basic read_file**

```yaml
name: "basic-read"
profile: "read-only"
steps:
  - tool: "read_file"
    params:
      path: "/test/file.txt"
    expected: "success"
```

**Scenario 2: write_to_file with Restriction**

```yaml
name: "write-restricted"
profile: "path-restricted"
steps:
  - tool: "write_to_file"
    params:
      path: "/allowed/file.txt"
    expected: "success"
  - tool: "write_to_file"
    params:
      path: "/etc/passwd"
    expected: "denied"
```

**Scenario 3: Mode Switch**

```yaml
name: "mode-switch"
initial_mode: "code"
steps:
  - mode: "debug"
    expected: "mode_switched"
  - mode: "ask"
    expected: "mode_switched"
```

## Validation Checklist

### Pre-Execution

- [ ] All dependencies installed
- [ ] Test workspace created
- [ ] Profiles loaded
- [ ] Logger initialized
- [ ] Metrics collector ready

### During Execution

- [ ] Tool calls tracked
- [ ] Permissions checked
- [ ] State transitions logged
- [ ] Errors captured

### Post-Execution

- [ ] Results validated
- [ ] Metrics computed
- [ ] Report generated
- [ ] Cleanup performed

## References

- Source: [`_test-spike/_harness/src/runners/`](_test-spike/_harness/src/runners/)
- Related: [TUI Implementation](tui-implementation-2026-01-11.md)
- Related: [Logging Specification](logging-spec-2026-01-11.md)
- Related: [Permission Profiles](permission-profiles-2026-01-11.md)

---

**End of Document**
