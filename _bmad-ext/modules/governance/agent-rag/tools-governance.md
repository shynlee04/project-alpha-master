---
name: "tools-governance"
type: "governance-policy"
purpose: "Track and govern tool CRUD operations to prevent unintended state changes"
version: "1.0.0"
critical: true
---

# Tools Governance

**Purpose**: Track and govern tool CRUD operations to prevent unintended state changes from agent actions.

## Problem Statement

Agents with tool access can:
- CREATE new files (uncontrolled growth)
- READ sensitive files (data leakage risk)
- UPDATE existing files (unintended modifications)
- DELETE files (data loss risk)

Without governance, this leads to:
- Uncontrolled repository growth
- Accidental deletions
- Inconsistent state
- Security vulnerabilities

## Governance Framework

### 1. Tool Registration

All tools must be registered:

```yaml
tool_registry:
  - name: "{tool_name}"
    operations: [CREATE|READ|UPDATE|DELETE]
    scope: [allowed_paths]
    risk_level: "{low|medium|high}"
    safeguards:
      - "{safeguard description}"
      required: true|false
```

### 2. CRUD Operation Tracking

When agents use tools, log:

```yaml
tool_usage_log:
  - timestamp: "{when}"
    agent: "{which agent}"
    tool: "{which tool}"
    operation: "{CRUD operation}"
    target: "{file path}"
    approved: {yes|no}
    reason: "{why approved or rejected}"
```

### 3. Safeguards Required

**High Risk Tools** (CREATE, UPDATE, DELETE) MUST have:
1. **Pre-execution validation**: Check if operation is safe
2. **Confirmation required**: For destructive operations
3. **Rollback capability**: Ability to undo changes
4. **Audit logging**: All changes tracked

**Example safeguard pattern**:
```yaml
safeguards:
  - type: "pre_validation"
    check: "File size limit"
    threshold: "1MB for writes"

  - type: "confirmation"
    required_for: [DELETE, schema_change]
    prompt_user: "{explain operation and get confirmation}"

  - type: "rollback"
    enabled: true
    mechanism: "{backup before modify}"
```

### 4. Governance Rules

```yaml
rules:
  - id: "FILE_SIZE_LIMIT"
    applies_to: [CREATE, UPDATE]
    check: "file_size < 1MB OR user_confirmed"

  - id: "DELETE_PROTECTION"
    applies_to: [DELETE]
    check: "backup_exists AND user_confirmed"

  - id: "SCHEMA_CHANGE"
    applies_to: [UPDATE schema files]
    check: "migration_plan_exists"

  - id: "MULTI_FILE_OPERATION"
    applies_to: [bulk operations]
    check: "max_10_files OR user_confirmed"
```

### 5. Monitoring

```yaml
monitoring:
  track:
    - tool_usage_frequency
    - files_changed_per_agent
    - rejected_operations
    - rollback_invocations

  alerts:
    - condition: "rejected_operations > 5 in session"
      action: "warn_user"

    - condition: "files_changed > 50 in session"
      action: "require_user_break"
```

## Integration

**Used By**: All agents with tool access

**Monitored By**: agent-rag-scanner

**Output**: Tool usage log for audit trail
