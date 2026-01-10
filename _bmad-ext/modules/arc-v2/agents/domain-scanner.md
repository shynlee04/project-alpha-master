---
name: "domain-scanner"
description: "6-Domain Targeted Scanner"
version: "1.0.0"
type: "diagnostic"
domains:
  - persistence
  - sync
  - state
  - routing
  - agents
  - ux
---

# Domain Scanner Agent

**Role**: Targeted diagnostic scanner for 6 architectural domains
**Purpose**: Generate fresh evidence before any remediation

---

## 6 Domains

| Domain | Scope | Key Files | Primary Issues |
|--------|-------|-----------|----------------|
| **PERSISTENCE** | Dexie, IndexedDB, quota | `src/infrastructure/persistence/dexie/` | Quota, schema, data loss |
| **SYNC** | FSA, IndexedDB sync | `src/infrastructure/sync/`, `src/lib/filesync/` | Platform divergence, conflicts |
| **STATE** | Zustand, React state | `src/infrastructure/persistence/stores/` | God stores, boundaries |
| **ROUTING** | Workspaces, navigation | `src/routes/`, `src/lib/workspace/` | Cross-workspace, loops |
| **AGENTS** | CRUD, permissions, keys | `src/infrastructure/persistence/stores/agents/` | Key passing, provider mgmt |
| **UX** | Components, journeys | `src/presentation/components/` | God components, error bounds |

---

## Scan Protocol

### 1. Domain Selection

```yaml
input: target_domain | "all"
if: target_domain == "all"
  run: all 6 scans in sequence
else:
  run: specific domain scan
```

### 2. Per-Domain Scan

#### PERSISTENCE Domain

```bash
# Find all Dexie-related files
find src -name "*dexie*" -o -name "*indexed*" 2>/dev/null

# Check for quota handling
grep -r "QuotaExceeded" src --include="*.ts" 2>/dev/null

# Check schema files
find src -name "*schema*" -path "*/persistence/*" 2>/dev/null

# Output metrics
metrics:
  - dexie_files: count
  - quota_handlers: count
  - schema_versions: list
  - unhandled_writes: count
```

#### SYNC Domain

```bash
# Find sync managers
find src -name "*sync*" -type f 2>/dev/null

# Check for FSA usage (desktop)
grep -r "showOpenFilePicker\|showSaveFilePicker" src --include="*.ts" 2>/dev/null

# Check for IndexedDB sync (mobile)
grep -r "navigator.storage" src --include="*.ts" 2>/dev/null

# Output metrics
metrics:
  - sync_managers: count
  - fsa_usage: count
  - indexeddb_sync: count
  - conflict_handlers: count
```

#### STATE Domain

```bash
# Find all Zustand stores
find src -name "*store*" -o -name "*slice*" 2>/dev/null

# Count lines in each store
find src -name "*store*.ts" -exec wc -l {} \; | sort -rn

# Check for god stores (>300 lines)
find src -name "*store*.ts" -exec wc -l {} \; | awk '$1 > 300'

# Check for useShallow usage
grep -r "useShallow" src --include="*.tsx" 2>/dev/null | wc -l

# Output metrics
metrics:
  - total_stores: count
  - god_stores: count (>300 lines)
  - useShallow_usage: count
  - circular_deps: detected
```

#### ROUTING Domain

```bash
# Find all route files
find src/routes -name "*.tsx" -o -name "*.ts" 2>/dev/null

# Check for error boundaries
grep -r "ErrorBoundary" src/routes --include="*.tsx" 2>/dev/null

# Check workspace access patterns
grep -r "workspace" src/lib/workspace --include="*.ts" 2>/dev/null

# Check for redirect loops
grep -r "navigate\|redirect" src/routes --include="*.tsx" 2>/dev/null

# Output metrics
metrics:
  - route_files: count
  - error_boundary_coverage: percentage
  - workspace_helpers: count
  - redirect_patterns: count
```

#### AGENTS Domain

```bash
# Find agent-related stores
find src -path "*agents*" -name "*.ts" 2>/dev/null

# Check for provider CRUD
grep -r "setProvider\|deleteProvider" src --include="*.ts" 2>/dev/null

# Check for key management
grep -r "apiKey\|setApiKey" src --include="*.ts" 2>/dev/null

# Output metrics
metrics:
  - agent_stores: count
  - provider_crud: count
  - key_management: count
  - permission_checks: count
```

#### UX Domain

```bash
# Find components
find src/presentation/components -name "*.tsx" 2>/dev/null

# Count lines in each component
find src/presentation/components -name "*.tsx" -exec wc -l {} \; | sort -rn

# Check for god components (>300 lines)
find src/presentation/components -name "*.tsx" -exec wc -l {} \; | awk '$1 > 300'

# Check for error boundaries
grep -r "ErrorBoundary" src/presentation --include="*.tsx" 2>/dev/null

# Output metrics
metrics:
  - total_components: count
  - god_components: count (>300 lines)
  - error_boundaries: count
  - accessibility_tags: count
```

---

## Output Format

Each scan produces:

```yaml
# _bmad-output/scans/{domain}-scan-{date}.yaml

scan_metadata:
  domain: "{domain}"
  scanned_at: "{ISO_timestamp}"
  files_analyzed: {count}
  lines_analyzed: {count}
  
health_score: {0-100}

findings:
  critical: []   # Must fix immediately
  high: []       # Fix in current sprint
  medium: []     # Plan for next sprint
  low: []        # Nice to have

god_artifacts:
  - path: "{file_path}"
    lines: {count}
    issue: "Exceeds threshold"
    
recommendations:
  - action: "{what to do}"
    priority: "{P0|P1|P2}"
    estimated_hours: {number}
    target_files: [...]
```

---

## Scan Thresholds

```yaml
thresholds:
  store_max_lines: 120
  component_max_lines: 300
  max_dependencies: 10
  max_nesting_depth: 3
  
  health_score_weights:
    god_artifacts: 30%
    error_handling: 25%
    test_coverage: 20%
    code_quality: 15%
    documentation: 10%
```

---

## Integration

### Registers Artifacts

```yaml
artifact:
  id: "scan-{domain}-{date}-{uuid}"
  type: "DOMAIN_SCAN"
  path: "_bmad-output/scans/{domain}-scan-{date}.yaml"
  ttl_hours: 4
  
registers_in: "_bmad-ext/state/ARTIFACT_REGISTRY.yaml"
```

### Triggers Next Steps

```yaml
if: health_score < 50
  recommend: "arc-v2/workflows/domain-remediation.md"
  priority: "critical"
  
if: god_artifacts.length > 0
  recommend: "arc-v2/workflows/god-elimination.md"
  
if: findings.critical.length > 0
  recommend: "immediate-fix"
  escalate: true
```

---

**Agent Owner**: arc-v2
**Invoked By**: context-validator, diagnostic-first workflow
**Last Updated**: 2026-01-10
