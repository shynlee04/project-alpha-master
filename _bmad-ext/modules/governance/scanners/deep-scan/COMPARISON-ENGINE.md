# Governance Deep Scan - Comparison Engine

**Scanner Type**: Core Engine  
**Purpose**: Compare artifacts/documents against actual codebase to detect staleness and drift  
**Triggered By**: 
- Governance cycle execution
- Artifact creation/update
- Correct-course trigger
- Manual invocation

---

## Purpose

The Comparison Engine is the **core mechanism** that makes governance meaningful. Without it, governance is just checking timestamps. With it, governance can:

1. **Detect Staleness**: Compare documented behavior vs actual code
2. **Identify Drift**: Find where code has diverged from specs
3. **Flag Conflicts**: Detect overlapping or contradictory implementations
4. **Validate Architecture**: Ensure code matches documented structure

---

## Comparison Dimensions

### 1. Document-to-Code Comparison

| Document Type | Code Target | What to Check |
|---------------|-------------|---------------|
| Architecture.md | `src/` structure | Folders, file names, component organization |
| ADRs | `src/` files | Implementation matches ADR decisions |
| UX Specification | `src/presentation/` | Components, states, interactions match spec |
| API Specs | `src/infrastructure/api/` | Endpoints, schemas match spec |
| Data Schemas | `src/domain/types/` | Type definitions match schema |

### 2. Artifact-to-Artifact Comparison

| Source | Target | What to Check |
|--------|--------|---------------|
| Handoffs | Story context | Hand off data matches story requirements |
| Continuations | Previous session | Continuation preserves context |
| Retrospectives | Sprint status | Retro findings reflected in status |

### 3. Code-to-Code Comparison

| Target | What to Check |
|--------|---------------|
| Domain boundaries | Components in correct domain folders |
| Import paths | No deprecated paths used |
| State management | Zustand stores properly structured |
| API contracts | Interfaces match implementations |

---

## Workflow

### Step 1: Load Comparison Targets

```yaml
comparison_step_1:
  action: "load_targets"
  inputs:
    - artifact_path: "{document_to_check}"
    - scope: "full" | "targeted" | "delta"
  
  tasks:
    1. Parse document to extract code references
    2. Identify code targets (files, components, functions)
    3. Determine comparison scope (full codebase vs affected area)
    4. Load actual code files
```

### Step 2: Execute Comparison

```yaml
comparison_step_2:
  action: "execute_comparison"
  methods:
    - "structural": Check file/folder structure
    - "semantic": Check code behavior
    - "contract": Check API contracts
    - "state": Check state management
  
  tasks:
    For each comparison method:
      1. Run structural check (if method == "structural")
      2. Run semantic check (if method == "semantic")
      3. Run contract check (if method == "contract")
      4. Run state check (if method == "state")
      5. Record findings
```

### Step 3: Generate Report

```yaml
comparison_step_3:
  action: "generate_report"
  output:
    - comparison_id: "UUID"
    - timestamp: "ISO8601"
    - document_analyzed: "{path}"
    - comparison_scope: "{full|targeted|delta}"
    - findings:
        - type: "structural" | "semantic" | "contract" | "state"
        - severity: "P0" | "P1" | "P2" | "info"
        - location: "{code_path}"
        - expected: "{what_document_says}"
        - actual: "{what_code_does}"
        - recommendation: "{what_to_fix}"
```

---

## Comparison Methods

### Method 1: Structural Comparison

**Purpose**: Check if file/folder structure matches documentation

```yaml
structural_comparison:
  document_types:
    - "architecture.md"
    - "folder-structure.md"
    - "domain-map.md"
  
  checks:
    - "Folder exists": Check if documented folder exists in code
    - "File exists": Check if documented file exists in code
    - "No extra files": Check for undocumented files in documented folders
    - "Naming convention": Check if files follow naming rules
  
  output:
    - folders_expected: [list]
    - folders_found: [list]
    - folders_missing: [list]
    - folders_extra: [list]
    - files_expected: [list]
    - files_found: [list]
    - files_missing: [list]
    - files_extra: [list]
```

### Method 2: Semantic Comparison

**Purpose**: Check if code behavior matches documented behavior

```yaml
semantic_comparison:
  document_types:
    - "ADR/*.md"
    - "specs/*.md"
    - "ux-specification.md"
  
  checks:
    - "Function exists": Check if documented function exists
    - "Function signature": Check if signature matches spec
    - "Behavior documented": Check if behavior is as documented
    - "No anti-patterns": Check for documented anti-patterns
  
  output:
    - functions_expected: [list]
    - functions_found: [list]
    - functions_mismatched: [list]
    - anti_patterns_found: [list]
```

### Method 3: Contract Comparison

**Purpose**: Check if API contracts match implementation

```yaml
contract_comparison:
  document_types:
    - "api-spec.md"
    - "openapi.yaml"
    - "interface-definitions.md"
  
  checks:
    - "Endpoint exists": Check if documented endpoint exists
    - "Method matches": Check if HTTP method matches spec
    - "Schema matches": Check if request/response schema matches
    - "Status codes": Check if status codes match spec
  
  output:
    - endpoints_expected: [list]
    - endpoints_found: [list]
    - endpoints_mismatched: [list]
    - schemas_mismatched: [list]
```

### Method 4: State Comparison

**Purpose**: Check if state management matches documented patterns

```yaml
state_comparison:
  document_types:
    - "state-management.md"
    - "store-architecture.md"
  
  checks:
    - "Store exists": Check if documented store exists
    - "State shape": Check if state shape matches spec
    - "Actions defined": Check if actions are defined
    - "No god stores": Check for oversized stores
  
  output:
    - stores_expected: [list]
    - stores_found: [list]
    - stores_oversized: [list]
    - state_shapes_mismatched: [list]
```

---

## Integration Points

### With Governance Cycle

```yaml
governance_cycle:
  step: "deep_scan"
  actions:
    - "Run comparison engine on active artifacts"
    - "Flag mismatches as governance issues"
    - "If P0/P1 mismatch detected: trigger correct-course"
```

### With Correct-Course Workflow

```yaml
correct_course_trigger:
  condition: "comparison_engine.findings.severity in ['P0', 'P1']"
  actions:
    - "Create issue report from comparison findings"
    - "Route to correct-course for remediation"
    - "Pass comparison report to remediation workflow"
```

### With Artifact Registration

```yaml
artifact_registration:
  trigger: "artifact_created"
  actions:
    - "Schedule comparison when artifact is referenced in code"
    - "Track comparison results in ARTIFACT_REGISTRY"
    - "Flag artifact as 'verified' | 'stale' | 'conflict'"
```

---

## Example Usage

### Check Architecture Drift

```yaml
# Input
check:
  document: "_bmad-output/planning-artifacts/architecture.md"
  scope: "full"
  methods: ["structural", "semantic"]

# Execution
comparison_engine.execute(document, scope, methods)

# Output
findings:
  - type: "structural"
    severity: "P1"
    location: "src/presentation/components"
    expected: "Flat structure with components per feature"
    actual: "Nested folders: ui/, forms/, layouts/"
    recommendation: "Restructure to match architecture or update architecture"
  
  - type: "semantic"
    severity: "P0"
    location: "src/domain/services/auth-service.ts"
    expected: "JWT-based authentication"
    actual: "Session-based authentication"
    recommendation: "Update ADR or refactor implementation"
```

### Check API Spec Compliance

```yaml
# Input
check:
  document: "_bmad-output/planning-artifacts/api-spec.md"
  scope: "targeted"
  target: "/api/notes"
  methods: ["contract"]

# Execution
comparison_engine.execute(document, scope, methods, target)

# Output
findings:
  - type: "contract"
    severity: "P2"
    location: "GET /api/notes"
    expected: "Returns array of Note objects"
    actual: "Returns paginated response with metadata"
    recommendation: "Update spec or implementation for consistency"
```

---

## Metrics to Track

| Metric | Description | Target |
|--------|-------------|--------|
| `comparisons_run` | Number of comparisons executed | N/A |
| `mismatches_found` | Total mismatches found | Decreasing |
| `p0_mismatches` | Critical mismatches (P0) | 0 |
| `p1_mismatches` | High mismatches (P1) | < 5 |
| `false_positives` | Invalid mismatch reports | < 10% |
| `avg_comparison_time` | Time to complete comparison | < 30s |

---

## Version

**Version**: 1.0.0  
**Created**: 2026-01-11  
**Updated**: 2026-01-11

---

## Related Files

- `document-scanner.md` - Scan documents for staleness
- `domain-scanner.md` - Scan domain structures
- `correct-course-governance.md` - Integration with remediation
