---
nextStepFile: '{installed_path}/steps/step-03-cohesion-check.md'
continueFile: '{installed_path}/steps/step-02b-continue.md'
outputFile: '{output_folder}/sprint-planning-output-{date}.md'
epicLocation: '{planning_artifacts}'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
sprintStatus: '{implementation_artifacts}/sprint-status.yaml'
workflowName: 'sprint-planning-enhanced'
---

# Step 2: Generate Status

## STEP GOAL

Execute BMAD sprint-planning workflow to generate baseline sprint-status.yaml.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Load BMAD sprint-planning workflow
- 📋 Execute original workflow
- 🔄 Update frontmatter on completion

## SEQUENCE OF INSTRUCTIONS

### 1. Load BMAD Sprint-Planning Workflow

```yaml
bmad_workflow:
  location: "{project-root}/_bmad/bmm/workflows/4-implementation/sprint-planning"

  files:
    workflow: "workflow.yaml"
    instructions: "instructions.md"
    checklist: "checklist.md"
    template: "sprint-status-template.yaml"

  approach: "CONSUME_ONLY"
  # Use BMAD workflow as reference, execute via our step pattern
```

### 2. Generate Baseline Sprint Status

Parse epics and generate sprint-status.yaml:
```yaml
status_generation:
  input:
    - epic_files from Step 1

  output:
    file: "{project-root}/_bmad-output/implementation-artifacts/sprint-status.yaml"

  structure:
    epics:
      {epic_key}:
        status: "{backlog|in-progress|done}"
        targets:
          {track}:
            completed_stories: {count}

    development_status:
      {story_key}:
        status: "{backlog|ready-for-dev|in-progress|review|done}"
        title: "{story title}"
        points: {estimate}
        epic: "{epic_key}"
```

### 3. Run BMAD Instructions

Follow BMAD sprint-planning instructions:
1. Parse all epics for story extraction
2. Validate story format and completeness
3. Generate sprint-status.yaml with all stories
4. Run checklist validation

### 4. Display Status Summary

```
═══════════════════════════════════════════════════════════
SPRINT STATUS GENERATED
═══════════════════════════════════════════════════════════

File: {sprintStatus}

Epics: {count}
Stories: {total}

Status Breakdown:
├─ Backlog: {count}
├─ Ready for Dev: {count}
├─ In Progress: {count}
├─ Review: {count}
└─ Done: {count}

BMAD Checklist: {PASS|FAIL}

Options:
[C] Continue to cohesion check
[V] View generated status
[R] Re-generate status
```

### 5. Handle User Choice

**C**: Proceed to Step 3 (Cohesion Check)
**V**: Display full sprint-status.yaml
**R**: Re-run status generation

### 6. Update Frontmatter

```yaml
---
stepsCompleted: [1, 2]
sprint_status_generated: true
sprint_status_file: "{path}"
checklist_passed: {true|false}
generated_at: "{timestamp}"
---
```

---

## SUCCESS METRICS

- ✅ BMAD workflow loaded successfully
- ✅ sprint-status.yaml generated
- ✅ All stories included
- ✅ BMAD checklist passed

## FAILURE METRICS

- ❌ BMAD workflow not found
- ❌ Status generation failed
- ❌ Checklist validation failed

**ONLY WHEN status generated, load {nextStepFile}**
