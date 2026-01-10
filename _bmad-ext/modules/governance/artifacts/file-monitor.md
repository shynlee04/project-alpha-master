---
name: "file-monitor"
type: "governance-policy"
purpose: "Monitor folder and file changes for artifact management"
version: "1.0.0"
critical: true
---

# File Monitor

**Purpose**: Track folder and file changes to detect orphaned artifacts, unexpected modifications, and maintain registry accuracy.

## Monitoring Scope

```yaml
monitored_directories:
  governance:
    - "_bmad-ext/modules/governance/"
    - "_bmad-ext/modules/governance/workflows/"
    - "_bmad-ext/modules/governance/scanners/"
    - "_bmad-ext/modules/governance/agent-rag/"
    - "_bmad-ext/modules/governance/artifacts/"

  output:
    - "_bmad-output/"
    - "_bmad-output/planning-artifacts/"
    - "_bmad-output/governance-reports/"
    - "_bmad-output/conversations/"
    - "_bmad-output/.archive/"

  status:
    - "sprint-status.yaml"
    - "bmm-workflow-status.yaml"
```

## Change Detection

```yaml
change_types:
  created:
    - "New file appeared in monitored directory"
    - "Not in registry"
    - action: "register and categorize"

  modified:
    - "File timestamp updated"
    - "Content hash changed"
    - action: "update registry timestamp"

  deleted:
    - "File removed from filesystem"
    - "Still in registry"
    - action: "mark as deleted, investigate"

  moved:
    - "File path changed"
    - "Registry has old path"
    - action: "update registry path"
```

## Monitoring Schedule

```yaml
schedule:
  real_time:
    - "workflow-status.yaml"
    - "sprint-status.yaml"
    - "active conversation files"

  frequent: "Every 15 minutes"
    - "_bmad-output/conversations/"
    - "Active workflow files"

  regular: "Daily"
    - "_bmad-ext/modules/governance/"
    - "_bmad-output/planning-artifacts/"

  periodic: "Weekly"
    - "Full registry validation"
    - "Archive scanning"
```

## Anomaly Detection

```yaml
anomalies:
  orphaned_files:
    definition: "File exists but not in registry"
    severity: "medium"
    action: "register or flag for review"

  registry_ghosts:
    definition: "Registry entry but file missing"
    severity: "high"
    action: "investigate, update registry"

  unexpected_deletions:
    definition: "Active file deleted"
    severity: "critical"
    action: "immediate alert, check if intentional"

  stale_tracking:
    definition: "Registry timestamp > file timestamp"
    severity: "low"
    action: "update registry from file"

  rapid_changes:
    definition: "Same file modified > 5 times in hour"
    severity: "medium"
    action: "flag potential issue or thrashing"
```

## Monitoring Output

```yaml
monitoring_report:
  timestamp: "{when}"
  scan_duration: "{seconds}"
  directories_scanned: {count}

  changes_detected:
    created: [count]
    modified: [count]
    deleted: [count]
    moved: [count]

  anomalies:
    orphaned_files: [list]
    registry_ghosts: [list]
    unexpected_deletions: [list]
    stale_tracking: [list]

  recommendations:
    - "{action for each anomaly}"
```

## File State Tracking

```yaml
file_state:
  path: "{relative_path}"
  hash: "{content_hash}"
  size_bytes: {number}

  timestamps:
    created: "{filesystem creation time}"
    modified: "{filesystem modification time}"
    registered: "{when added to registry}"

  status:
    in_registry: {true|false}
    matches_registry: {true|false}
    is_stale: {true|false}
    has_anomalies: {true|false}
```

## Integration with Registry

```yaml
registry_sync:
  on_create:
    - "Calculate file hash"
    - "Register in artifacts/registry.yaml"
    - "Set review date"

  on_modify:
    - "Update hash and timestamp"
    - "Check for content changes"
    - "Update freshness status"

  on_delete:
    - "Verify deletion intentional"
    - "Mark as deleted in registry"
    - "Archive registry entry if needed"

  on_anomaly:
    - "Create monitoring alert"
    - "Log anomaly type"
    - "Suggest remediation"
```

## Alert Thresholds

```yaml
alerts:
  critical:
    - "Unexpected deletion of active file"
    - "Registry corruption detected"
    - "Multiple files missing"

  warning:
    - "Orphaned files > 10"
    - "Registry ghosts > 5"
    - "Stale tracking > 20%"

  info:
    - "Normal changes detected"
    - "Registry updated"
    - "Files archived"
```

## Automation Triggers

```yaml
triggers:
  on_orphaned_file:
    - "Attempt to categorize"
    - "Add to registry if valid artifact"
    - "Flag for review if unclear"

  on_registry_ghost:
    - "Verify file actually missing"
    - "Remove from registry if confirmed"
    - "Investigate if suspicious"

  on_rapid_changes:
    - "Identify responsible workflow"
    - "Check for thrashing or loops"
    - "Suggest pause if problematic"
```

## Quick Reference

```yaml
quick_reference:
  scan_frequency: "daily for most, real-time for status"
  key_anomalies: "orphans, ghosts, unexpected deletions"
  alert_levels: "critical, warning, info"
  registry_sync: "automatic on all changes"
```

## Integration

**Runs**: Periodically and on-demand

**Output**: Monitoring report to governance-report workflow

**Location**: `_bmad-ext/modules/governance/artifacts/file-monitor.md`

---

`★ Insight ─────────────────────────────────────`
1. File monitoring keeps registry accurate
2. Anomaly detection catches problems early
3. Automated sync prevents registry drift
`─────────────────────────────────────────────────`
