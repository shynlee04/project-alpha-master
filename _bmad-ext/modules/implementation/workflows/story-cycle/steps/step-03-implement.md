---
nextStepFile: '{installed_path}/steps/step-04-test.md'
continueFile: '{installed_path}/steps/step-03b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 3: Implement - Deep Implementation with Conflict Detection

## STEP GOAL

Execute development work with:
- ENFORCED grep/glob context loading BEFORE any code writing
- Architectural conflict detection and spin-down to related cycles
- Systematic code analysis to avoid dead code and overlaps
- Deep project understanding integration

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Load context via grep/glob BEFORE writing any code
- 📋 Run architectural conflict detection
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Context via Systematic Code Analysis (REQUIRED)

Before writing ANY code, execute these commands:

```yaml
context_loading_required:
  # Step 1a: Glob all related files
  glob_patterns:
    - pattern: "src/**/*.{ts,tsx}"
      scope: "Related to {feature}"
      
    - pattern: "src/**/{component,feature}*/**"
      scope: "Feature directory"
      
    - pattern: "src/presentation/components/**/{Component}*"
      scope: "Related components"
      
    - pattern: "src/infrastructure/persistence/stores/**/*Store*"
      scope: "Related stores"
      
    - pattern: "src/domain/{types,services}/**"
      scope: "Domain layer"

  # Step 1b: Grep for related patterns
  grep_patterns:
    - name: "imports_of_related"
      pattern: "import.*{RelatedModule}"
      include: "*.ts,*.tsx"
      
    - name: "usages_of_related"
      pattern: "{RelatedComponent}|{RelatedHook}"
      include: "*.ts,*.tsx"
      
    - name: "route_definitions"
      pattern: "{route_path}"
      include: "*.ts"
      
    - name: "store_subscriptions"
      pattern: "useStore|useShallow.*({Store})"
      include: "*.ts,*.tsx"
      
    - name: "type_definitions"
      pattern: "interface.*{TypeName}|type.*{TypeName}"
      include: "*.ts"

  # Step 1c: Read key files for understanding
  read_files:
    - path: "src/presentation/components/{Component}/{Component}.tsx"
      purpose: "Understand existing component structure"
      
    - path: "src/infrastructure/persistence/stores/{Store}/{Store}.ts"
      purpose: "Understand store patterns"
      
    - path: "src/domain/types/{Type}.ts"
      purpose: "Understand type definitions"
      
    - path: "src/routes/{route}/route.ts"
      purpose: "Understand routing"
```

### 2. Architectural Conflict Detection (REQUIRED)

```yaml
architectural_conflict_detection:
  # Clean Architecture Violations
  clean_architecture_checks:
    - type: "cross_layer_import"
      description: "Presentation importing from Infrastructure directly"
      pattern: "@/infrastructure.*@/presentation"
      severity: "CRITICAL"
      action: "Redirect through domain layer"
      
    - type: "domain_logic_in_infrastructure"
      description: "Business logic in persistence layer"
      pattern: "@/infrastructure/.*business|.*logic"
      severity: "MAJOR"
      action: "Move to domain/services"
      
    - type: "presentation_logic_in_domain"
      description: "UI concerns in domain types"
      pattern: "@/domain/types/.*Component|.*UI"
      severity: "MINOR"
      action: "Move to presentation"
      
  # Circular Dependency Detection
  circular_dependency_checks:
    - type: "circular_import"
      pattern: "A imports B, B imports A"
      severity: "CRITICAL"
      command: "pnpm deptcheck || npm run check-deps"
      action: "Refactor to break cycle"
      
    - type: "store_circular"
      pattern: "Store A subscribes to Store B, B subscribes to A"
      severity: "CRITICAL"
      action: "Unify stores or use facade"
      
  # God Pattern Detection
  god_pattern_checks:
    - type: "god_component"
      pattern: "Component > 300 lines"
      severity: "MAJOR"
      command: "glob '**/*.tsx' | xargs wc -l | sort -rn | head"
      action: "Split into child components"
      
    - type: "god_store"
      pattern: "Store > 120 lines"
      severity: "MAJOR"
      command: "glob '**/*Store*.ts' | xargs wc -l | sort -rn"
      action: "Split into focused slices"
      
    - type: "god_file"
      pattern: "File > 500 lines"
      severity: "MINOR"
      action: "Refactor into smaller files"
      
  # Import Pattern Violations
  import_pattern_checks:
    - type: "relative_import_too_deep"
      pattern: "import.*from '\\.\\.\\.\\.\\.\\.'"
      severity: "MINOR"
      action: "Use @/ alias"
      
    - type: "wrong_alias"
      pattern: "import.*from '@/.*/lib/'"
      severity: "MINOR"
      action: "Use correct @/ path"
```

### 3. Dead Code and Overlap Detection (REQUIRED)

```yaml
dead_code_overlap_detection:
  dead_code:
    - type: "orphaned_file"
      description: "File with no imports"
      command: "glob 'src/**/*.{ts,tsx}' | xargs -I{} sh -c 'grep -l \"import.*{}\" src/**/*.ts 2>/dev/null || echo {}'"
      action: "Delete or wire up"
      
    - type: "unused_export"
      description: "Exported function never used"
      command: "grep -r \"export.*function\" src/ | grep -v \"import.*from\" | xargs -I{} sh -c 'grep -l \"{}.*\" src/**/*.ts 2>/dev/null || echo {}'"
      action: "Remove export or add usage"
      
    - type: "commented_code"
      description: "Code commented out > 7 days"
      command: "grep -r \"/\\*\\*.*\\*/\" src/ --include=\"*.ts\" | head -20"
      action: "Delete commented code"
      
  overlaps:
    - type: "duplicate_logic"
      description: "Similar logic in multiple files"
      command: "grep -r \"function.*similar.*name\" src/ || echo \"Use cpd (copy-paste detector)\""
      action: "Extract to shared utility"
      
    - type: "duplicate_types"
      description: "Same type defined multiple times"
      command: "grep -r \"interface.*Name\" src/ | cut -d: -f2 | sort | uniq -d"
      action: "Consolidate to single source"
      
    - type: "conflicting_changes"
      description: "Multiple stories modifying same file"
      command: "git diff --name-only HEAD~1..HEAD | grep -E \"\\.(ts|tsx)$\""
      action: "Coordinate with other stories"
```

### 4. Implementation Execution (TDD with Context)

```yaml
implementation_approach:
  read_standards_first:
    - "READ: agent-os/standards/global/coding-style.md"
    - "READ: agent-os/standards/backend/models.md"
    - "READ: agent-os/standards/frontend/components.md"
    - "READ: agent-os/standards/frontend/css.md"
    
  layered_architecture_enforcement:
    domain_layer:
      files: "src/domain/{types,services}/"
      purpose: "Business logic and type definitions"
      must_follow: "domain models standards"
      
    infrastructure_layer:
      files: "src/infrastructure/{persistence,sync}/"
      purpose: "Data persistence and sync"
      must_follow: "Dexie patterns"
      
    presentation_layer:
      files: "src/presentation/{components,hooks}/"
      purpose: "UI components and state hooks"
      must_follow: "8-bit design, component standards"
      
    routes_layer:
      files: "src/routes/"
      purpose: "Route definitions"
      must_follow: "TanStack Router patterns"

  quality_requirements:
    - import_order: "React → 3rd party → @/ → Domain → Relative"
    - store_pattern: "useShallow for multiple selectors"
    - component_limit: "≤300 lines per component"
    - store_limit: "≤120 lines per store slice"
    - styling: "8-bit design (0px or 2px border-radius)"
```

### 5. Implementation Progress Tracking

```
═══════════════════════════════════════════════════════════════════
IMPLEMENTATION TRACKER
═══════════════════════════════════════════════════════════════════

Story: {story_key}

┌─────────────────────────────────────────────────────────────────┐
│ CONTEXT LOADED                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Files Globbed: {count}                                          │
│ Files Grepped: {count}                                          │
│ Files Read: {count}                                             │
│                                                                 │
│ Key Files Analyzed:                                            │
│   - {file}:{line} - Component structure                         │
│   - {file}:{line} - Store patterns                              │
│   - {file}:{line} - Type definitions                            │
│   - {file}:{line} - Route configuration                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ARCHITECTURAL CONFLICT CHECK                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Clean Architecture Violations: {count}                          │
│   - NONE ✅ / FLAGS FOUND                                       │
│                                                                 │
│ Circular Dependencies: {count}                                  │
│   - NONE ✅ / FLAGS FOUND                                       │
│                                                                 │
│ God Patterns Detected: {count}                                  │
│   - NONE ✅ / FLAGS FOUND                                       │
│                                                                 │
│ Import Violations: {count}                                      │
│   - NONE ✅ / FLAGS FOUND                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ DEAD CODE/OVERLAP DETECTION                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Orphaned Files: {count}                                         │
│ Duplicate Logic: {count}                                        │
│ Conflicting Changes: {count}                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ACCEPTANCE CRITERIA PROGRESS                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ AC-1: [✅/🔄/❌] {description}                                   │
│ AC-2: [✅/🔄/❌] {description}                                   │
│ AC-3: [✅/🔄/❌] {description}                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ FILES CHANGED                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Files Created: {count}                                          │
│   - {path}                                                      │
│                                                                 │
│ Files Modified: {count}                                         │
│   - {path}                                                      │
│                                                                 │
│ Files Deleted: {count}                                          │
│   - {path}                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TESTS CREATED                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Unit Tests: {count} / {expected}                                │
│ Integration Tests: {count} / {expected}                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Handle Implementation Choice

**C**: All acceptance criteria implemented → Step 4 (Test)
**R**: Show detailed change summary
**A**: Continue implementation
**H**: Save progress, exit

### 7. Update Frontmatter

```yaml
---
stepsCompleted: [1, "1a", 2, "3a", 3]
implementationComplete: true
implementationTimestamp: "{timestamp}"

# Context Loading Evidence
contextLoaded:
  filesGlobbed: {count}
  filesGrepped: {count}
  filesRead: {count}
  keyFilesAnalyzed:
    - file: "{path}"
      purpose: "{description}"
      lines: "{N}"

# Architectural Conflict Detection
architecturalConflicts:
  cleanArchitectureViolations: {count}
  circularDependencies: {count}
  godPatternsDetected: {count}
  importViolations: {count}
  conflictsResolved: {count}
  conflictsDeferred: {list with rationale}

# Dead Code Detection
deadCodeDetection:
  orphanedFiles: {count}
  duplicateLogic: {count}
  conflictingChanges: {count}
  actionsTaken: {list}

# Acceptance Criteria Progress
acceptanceCriteriaProgress:
  AC-1: "IMPLEMENTED|TODO|BLOCKED"
  AC-2: "IMPLEMENTED|TODO|BLOCKED"
  AC-3: "IMPLEMENTED|TODO|BLOCKED"

# Files Changed
filesModified: [{path, changes_summary}]
filesCreated: [{path, purpose}]
filesDeleted: [{path, reason}]

# Tests Written
testsWritten: {count}
testCoverage: "{percentage}%"
---
```

---

## SUCCESS METRICS

- ✅ Context loaded via grep/glob before any code writing
- ✅ Architectural conflict detection executed
- ✅ Dead code/overlap detection performed
- ✅ All acceptance criteria addressed
- ✅ Code follows clean architecture
- ✅ Tests written for new code

## FAILURE METRICS

- ❌ Context not loaded before coding
- ❌ Architectural violations not detected/resolved
- ❌ Dead code not documented
- ❌ Acceptance criteria missed

## ARCHITECTURAL CONFLICT HANDLING

If architectural conflicts are detected:

1. **CRITICAL**: STOP immediately, spin down to correct-course workflow
2. **MAJOR**: Document and create follow-up story
3. **MINOR**: Note for refactoring, proceed with warning

**ONLY WHEN implementation complete, load {nextStepFile}**
