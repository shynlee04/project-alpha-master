---
date: 2026-01-12
phase: Documentation
team: Team A (Test Spike)
---

# Progressive Modification Workflow

This document describes the workflow for making progressive modifications to the test-spike architecture and validating changes.

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROGRESSIVE MODIFICATION WORKFLOW             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. IDENTIFY     2. ISOLATE     3. MODIFY     4. VALIDATE       │
│  ───────────     ──────────     ─────────     ──────────       │
│  Find target     Create new     Apply         Run TUI           │
│  component       test copy      changes       harness           │
│       │              │              │              │            │
│       └──────────────┴──────────────┴──────────────┘            │
│                           │                                      │
│                           ▼                                      │
│                  5. DOCUMENT                                     │
│                  ───────────                                     │
│                  Update logs &                                   │
│                  validation report                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Process

### Step 1: Identify Target Component

**Location:** `_test-spike/_mirror/` for mirrored code, `_test-spike/_harness/` for harness code

**Commands:**
```bash
# List all mirrored components
ls -la _test-spike/_mirror/src/domain/

# Search for specific functionality
grep -r "function_name" _test-spike/_mirror/

# Check file timestamps
find _test-spike -type f -name "*.ts" -exec stat -f "%m %N" {} \;
```

### Step 2: Create Isolated Test Copy

**description:** Prevent modification of production mirrored code during experimentation

**Commands:**
```bash
# Create timestamped test directory
mkdir -p _test-spike/_test-$(date +%Y%m%d-%H%M%S)

# Copy target component
cp -r _test-spike/_mirror/src/domain/services/agent-orchestration-service.ts \
      _test-spike/_test-YYYYMMDD-HHMMSS/

# Create parallel harness directory
mkdir -p _test-spike/_test-YYYYMMDD-HHMMSS/_harness
```

**Naming Convention:** `_test-{timestamp}` where timestamp is `YYYYMMDD-HHMMSS`

### Step 3: Apply Modifications

**Guidelines:**
- **Minimal Changes:** Modify only what's necessary
- **Single Responsibility:** One logical change per modification
- **Revert Points:** Document original behavior before changes

**Example Modification Pattern:**

```typescript
// BEFORE (original)
function executeTool(tool: ToolDefinition): Promise<Result> {
  return tool.execute();
}

// AFTER (modified with logging)
function executeTool(tool: ToolDefinition): Promise<Result> {
  console.log(`[TRACE] Executing tool: ${tool.name}`);
  const startTime = Date.now();
  const result = await tool.execute();
  const duration = Date.now() - startTime;
  console.log(`[TRACE] Tool ${tool.name} completed in ${duration}ms`);
  return result;
}
```

### Step 4: Validate with TUI Harness

**Execution:**
```bash
cd _test-spike
pnpm exec tsx _harness/index.ts
```

**Validation Checklist:**
- [ ] Scenario 1: Agent Tool Execution runs without errors
- [ ] Scenario 2: Filesystem CRUD respects permission profiles
- [ ] Scenario 3: State Management creates/restores snapshots
- [ ] Scenario 4: Prompt/Mode Testing shows version changes

**Comparison with Baseline:**
```bash
# Compare test output with baseline
diff _test-spike/_notes/run-log.txt \
     _test-spike/_test-YYYYMMDD-HHMMSS/run-log.txt

# Compare JSON logs
diff <(jq -S .) _test-spike/_notes/run-log.json \
        <(jq -S .) _test-spike/_test-YYYYMMDD-HHMMSS/run-log.json
```

### Step 5: Document Changes

**Required Artifacts:**

1. **Change Log Entry** in `_test-spike/_notes/modification-log.md`:
```markdown
## Modification: [Timestamp]
- **Component:** agent-orchestration-service.ts
- **Type:** [Feature|Bugfix|Experiment|Refactor]
- **Description:** [Brief description]
- **Rationale:** [Why this change]
- **Expected Outcome:** [What should happen]
- **Actual Outcome:** [What actually happened]
- **Regression Check:** [Pass/Fail]
```

2. **Validation Update:**
   - Run baseline validation again
   - Update `_test-spike/_notes/baseline-validation-YYYY-MM-DD.md`

3. **Handoff Document:**
   - Create if change is significant
   - Reference in next validation report

## Modification Types

### Type A: Feature Addition
**Risk:** Medium  
**Isolation:** Create new module in `_test-spike/_test-{timestamp}/`  
**Validation:** Full TUI harness run

### Type B: Bug Fix
**Risk:** Low-Medium  
**Isolation:** Copy original, apply fix, compare behavior  
**Validation:** Targeted scenario testing

### Type C: Experiment
**Risk:** High  
**Isolation:** Full test directory  
**Validation:** All scenarios, compare with baseline

### Type D: Refactoring
**Risk:** Medium  
**Isolation:** Copy original, refactor, verify identical output  
**Validation:** Behavioral equivalence testing

## Common Modification Patterns

### Pattern 1: Add New Permission Profile

**File:** `_test-spike/_harness/permission-profiles.ts`

```typescript
// Existing profiles
export const permissionProfiles = {
  readonly: { read: true, write: false, delete: false },
  writeonly: { read: false, write: true, delete: true },
  fullaccess: { read: true, write: true, delete: true },
  restricted: { read: true, write: true, delete: false, paths: ['/allowed/*'] },
};

// Add new profile
export const permissionProfiles = {
  // ... existing
  auditonly: { read: true, write: false, delete: false, logAll: true },
};
```

### Pattern 2: Extend Test Scenario

**File:** `_test-spike/_harness/src/runners/agent-tool-execution.ts`

```typescript
// Add new assertion
async function runAgentToolExecution(): Promise<void> {
  // ... existing tests
  
  // NEW: Test tool permission enforcement
  await test('Tool respects permission profiles', async () => {
    const profile = permissionProfiles.readonly;
    const tool = createTestTool();
    
    // read operations should succeed
    expect(await tool.canExecute('read', profile)).toBe(true);
    
    // write operations should fail
    expect(await tool.canExecute('write', profile)).toBe(false);
  });
}
```

### Pattern 3: Modify State Snapshot Format

**File:** `_test-spike/_harness/src/runners/state-management.ts`

```typescript
// Current format
interface StateSnapshot {
  version: string;
  timestamp: number;
  state: Record<string, unknown>;
}

// Modified format
interface StateSnapshot {
  version: string;
  timestamp: number;
  state: Record<string, unknown>;
  checksum: string;  // NEW: for integrity verification
  metadata: {        // NEW: additional metadata
    createdBy: string;
    tags: string[];
  };
}
```

## Rollback Procedure

If modifications cause issues:

1. **Immediate Rollback:**
```bash
# Restore from backup
cp _test-spike/_test-TIMESTAMP/backup/file.ts \
   _test-spike/_mirror/src/domain/file.ts
```

2. **Clean Test Directory:**
```bash
# Remove test directory (logs preserved)
rm -rf _test-spike/_test-TIMESTAMP
```

3. **Restore Baseline:**
```bash
# Re-run baseline validation
cd _test-spike
pnpm tsc --noEmit
# Check for errors
```

4. **Document Incident:**
```markdown
## Rollback Incident: [Timestamp]
- **Issue:** [Description]
- **Impact:** [What broke]
- **Resolution:** [How it was fixed]
- **Prevention:** [Future safeguards]
```

## Best Practices

1. **Always Create Backup Before Modification**
   ```bash
   cp original.ts original.ts.bak
   ```

2. **Test in Isolation First**
   - Never modify `_mirror/` directly
   - Always copy to `_test-{timestamp}/` first

3. **Validate Before Integration**
   - Run full TUI harness
   - Compare with baseline output
   - Document any deviations

4. **Incremental Changes**
   - One logical change per modification
   - Test each change independently
   - Revert if unexpected behavior

5. **Preserve Logs**
   - Keep all run logs in `_test-spike/_notes/`
   - Use consistent naming: `run-log-{timestamp}.txt`
   - Include both human-readable and JSON formats

## Automation Scripts

### Quick Modification Script

```bash
#!/bin/bash
# save as _test-spike/scripts/modify.sh

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TEST_DIR="_test-$TIMESTAMP"

# Create test directory
mkdir -p $TEST_DIR

# Copy current harness
cp -r _harness/* $TEST_DIR/_harness/

echo "Created $TEST_DIR for modifications"
echo "Run: cd $TEST_DIR && pnpm exec tsx _harness/index.ts"
```

### Validation Comparison Script

```bash
#!/bin/bash
# save as _test-spike/scripts/compare.sh

BASELINE="_test-spike/_notes/run-log.txt"
CURRENT="$1"

if [ -z "$CURRENT" ]; then
  echo "Usage: ./compare.sh <log-file>"
  exit 1
fi

echo "Comparing baseline with $CURRENT..."
diff -u "$BASELINE" "$CURRENT" || true

echo ""
echo "Summary:"
echo "- Added lines: $(grep -c '^+' <(diff -u "$BASELINE" "$CURRENT" 2>/dev/null) 2>/dev/null || echo 0)"
echo "- Removed lines: $(grep -c '^-' <(diff -u "$BASELINE" "$CURRENT" 2>/dev/null) 2>/dev/null || echo 0)"
```

---

*Document ID: DOC-WORKFLOW-2026-01-12*
*Related: baseline-validation-2026-01-12.md*
