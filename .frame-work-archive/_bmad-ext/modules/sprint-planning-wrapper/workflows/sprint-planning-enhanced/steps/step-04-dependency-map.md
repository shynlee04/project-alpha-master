---
nextStepFile: '{installed_path}/steps/step-05-reality-validation.md'
outputFile: '{output_folder}/sprint-planning-output-{date}.md'
sprintStatus: '{implementation_artifacts}/sprint-status.yaml'
dependencyScanner: '{installed_path}/../../scanners/dependency-scanner.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'sprint-planning-enhanced'
---

# Step 4: Dependency Map

## STEP GOAL

Map cross-story dependencies and identify hidden temporal conflicts.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Run dependency scanner
- 📋 Generate dependency graph
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load Dependency Scanner

```yaml
scanner:
  location: "{dependencyScanner}"

  scan_types:
    - explicit_dependencies: "From story metadata"
    - implicit_dependencies: "Shared components, data flow"
    - temporal_conflicts: "Story ordering issues"
```

### 2. Extract Explicit Dependencies

Parse each story for declared dependencies:
```yaml
explicit_deps:
  from_story: "{story_key}"
  depends_on:
    - story: "{blocking_story}"
      type: "{hard|soft}"
      reason: "{why this dependency exists}"
```

### 3. Detect Implicit Dependencies

Scan for hidden dependencies:
```yaml
implicit_detection:
  shared_components:
    - check: "Multiple stories modifying same component"
    - flag: "Potential merge conflict"

  data_flow:
    - check: "Story A creates data used by Story B"
    - flag: "Implicit data dependency"

  api_changes:
    - check: "Story A modifies API used by Story B"
    - flag: "Breaking change risk"
```

### 4. Map Temporal Conflicts

```yaml
temporal_validation:
  for each dependency:
    - dependency_story: "{story A}"
      expected_completion: "{day}"

    - dependent_story: "{story B}"
      expected_start: "{day}"

    - conflict_if: "B starts before A completes"

    - resolution:
      - "Reorder stories"
      - "Split story into smaller chunks"
      - "Parallel work with interface contract"
```

### 5. Generate Dependency Map

Create `dependency-map.yaml`:
```yaml
dependency_graph:
  nodes:
    - {story_key}: {story_data}

  edges:
    - from: "{story A}"
      to: "{story B}"
      type: "{hard|soft|implicit}"
      risk: "{low|medium|high}"

  critical_path:
    - "{ordered list of stories on critical path}"

  conflicts:
    - "{list of temporal conflicts}"
```

### 6. Display Dependency Summary

```
═══════════════════════════════════════════════════════════
DEPENDENCY MAPPING COMPLETE
═══════════════════════════════════════════════════════════

Explicit Dependencies: {count}
Implicit Dependencies: {count}
Total Conflicts: {count}

Critical Path:
{ordered list of stories}

Conflicts Detected:
{list of temporal conflicts}

Dependency Map: {dependency-map.yaml}

Options:
[C] Continue to reality validation
[V] View full dependency map
[R] Resolve conflicts (reorder stories)
```

### 7. Handle User Choice

**C**: Dependencies acceptable → Step 5 (Reality Validation)
**V**: Review full dependency map
**R**: Conflicts found → Return to planning

### 8. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3, 4]
dependencies_mapped: true
dependency_map: "{output_folder}/dependency-map.yaml"
conflicts_detected: {count}
critical_path: [{list}]
---
```

---

## SUCCESS METRICS

- ✅ All dependencies mapped
- ✅ Implicit dependencies detected
- ✅ No critical temporal conflicts
- ✅ Critical path identified

## FAILURE METRICS

- ❌ Unresolved temporal conflicts
- ❌ Hidden dependencies not detected
- ❌ Critical path unclear

**ONLY WHEN dependencies mapped, load {nextStepFile}**
