---
nextStepFile: '{installed_path}/steps/step-04-test.md'
continueFile: '{installed_path}/steps/step-03b-continue.md'
outputFile: '{output_folder}/story-cycle-{story_key}-output.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{project-root}/sprint-status.yaml'
workflowName: 'story-cycle'
---

# Step 3: Implement

## STEP GOAL

Execute the development work for the story according to acceptance criteria.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Follow story acceptance criteria
- 📋 Adhere to coding standards
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Display Implementation Context

```
═══════════════════════════════════════════════════════════
IMPLEMENTATION
═══════════════════════════════════════════════════════════

Story: {story_key}
Title: {story_title}

Acceptance Criteria:
{numbered list of criteria}

Context Slices:
{relevant files from governance report}

Constraints:
{known constraints from governance}
```

### 2. Implementation Approach

```yaml
implementation_strategy:
  read_standards_first:
    - coding-style.md
    - relevant component standards
    - relevant backend standards

  follow_layered_architecture:
    - domain: types and business logic
    - infrastructure: persistence and sync
    - presentation: components and hooks

  quality_requirements:
    - follow_import_patterns: true
    - use_8_bit_styling: true
    - proper_error_handling: true
    - typescript_strict: true
```

### 3. Development Process

```
For each acceptance criterion:
  1. Identify affected files/domains
  2. Read relevant standards
  3. Implement changes
  4. Self-review against standards
  5. Document complex decisions

Track changes:
  - Files modified: {list}
  - Files created: {list}
  - Tests added: {count}
```

### 4. Implementation Menu

```
Implementation Status:
  Files Modified: {count}
  Files Created: {count}
  Lines Changed: {count}
  Tests Written: {count}/{expected}

Options:
[C] Continue to testing
[R] Review changes made
[A] Add more implementation
[H] Hold (partial completion)
```

### 5. Handle User Choice

**C**: All acceptance criteria implemented → Step 4 (Test)
**R**: Show detailed change summary
**A**: Continue implementation
**H**: Save progress, exit

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2, 3]
implementation_complete: true
files_modified: [list]
tests_written: {count}
implementation_timestamp: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ All acceptance criteria addressed
- ✅ Code follows standards
- ✅ No obvious bugs
- ✅ Tests written for new code

## FAILURE METRICS

- ❌ Acceptance criteria missed
- ❌ Standards violations
- ❌ No tests for new code
- ❌ Breaking changes

**ONLY WHEN implementation complete, load {nextStepFile}**
