---
name: workflow-builder
description: Create and manage BMAD-ext workflows with proper step structure, hop-reading patterns, and integration with existing workflows. Use when creating new workflows, editing existing workflows, or extending workflow capabilities.
version: 1.0.0
category: builder
parent: bmad-orchestrator
children:
  - workflow-structure-generator
  - workflow-step-generator
  - workflow-editor
  - workflow-validator
priority: 21
agents:
  - bmad-core-master
  - bmm-sm
triggers:
  - create workflow
  - workflow builder
  - edit workflow
  - /workflow-builder
  - /create-workflow
  - /edit-workflow
---

# Workflow Builder Skill

**Purpose**: Create and manage BMAD-ext workflows with proper step structure, hop-reading patterns, and integration.

## When to use this skill

- Creating new workflows that integrate with BMAD-ext modules
- Editing existing workflows to add steps or modify flow
- Extending workflow capabilities with new steps
- Validating workflow compliance with BMAD standards
- Managing workflow handoffs between modules

## Workflow Structure Template

```
workflows/{workflow-name}/
├── workflow.md                    # Workflow definition (REQUIRED)
├── config.yaml                    # Workflow configuration
└── steps/
    ├── step-01-xxx.md            # Step 1
    ├── step-02-xxx.md            # Step 2
    ├── step-03-xxx.md            # Step 3
    └── ...
```

## Workflow Frontmatter Template

```yaml
---
name: "{workflow-name}"
version: "1.0.0"
status: "active" | "draft" | "deprecated"
module: "{parent-module}"
phase: "0-4"
description: "Brief workflow description"
entry_point: "step-01-xxx.md"
exit_point: "step-N-xxx.md"
parallel_steps: []  # Steps that can run in parallel
sequential_steps: [] # Steps that must run in sequence
depends_on:
  - "{workflow-1}"
  - "{workflow-2}"
produces:
  - "{artifact-1}"
  - "{artifact-2}"
---

# Workflow Title

**Purpose**: Detailed workflow purpose...

## Workflow Overview

[Detailed description]

## Steps

[Step list with descriptions]

## Integration Points

[Integration details]

## Usage

[Usage example]
```

## Step Frontmatter Template

```yaml
---
name: "{step-name}"
version: "1.0.0"
order: 1
workflow: "{workflow-name}"
description: "Brief step description"
prev_step: "step-00-xxx.md"  # null for first step
next_step: "step-02-xxx.md"  # null for last step
parallel_with: []  # Steps that can run in parallel
triggers:
  - "{trigger-1}"
actions:
  - "{action-1}"
produces:
  - "{artifact-1}"
requires:
  - "{artifact-2}"
---

# Step Title

**Purpose**: Detailed step purpose...

## Actions

[Step actions]

## Output

[Step outputs]

## Next Step

[Transition to next step]
```

## Workflow Generator Functions

### 1. Generate Workflow Structure

```typescript
async function generateWorkflowStructure(
  workflowName: string,
  moduleName: string,
  options: WorkflowOptions
): Promise<void> {
  // Create workflow directory
  await createDirectory(`_bmad-ext/modules/${moduleName}/workflows/${workflowName}`);
  
  // Create steps directory
  await createDirectory(`_bmad-ext/modules/${moduleName}/workflows/${workflowName}/steps`);
  
  // Generate workflow.md
  await generateWorkflowMd(workflowName, moduleName, options);
  
  // Generate config.yaml
  await generateWorkflowConfig(workflowName, options);
  
  // Generate step files
  for (let i = 1; i <= options.stepCount; i++) {
    await generateStepFile(workflowName, moduleName, i, options);
  }
}
```

### 2. Generate Step Files

```typescript
async function generateStepFile(
  workflowName: string,
  moduleName: string,
  stepNumber: number,
  options: WorkflowOptions
): Promise<void> {
  const stepName = `step-${stepNumber.toString().padStart(2, '0')}-${options.stepPrefix}`;
  
  const frontmatter = {
    name: stepName,
    version: '1.0.0',
    order: stepNumber,
    workflow: workflowName,
    description: `Step ${stepNumber} of ${options.stepCount}`,
    prev_step: stepNumber > 1 
      ? `step-${(stepNumber - 1).toString().padStart(2, '0')}-${options.stepPrefix}.md`
      : null,
    next_step: stepNumber < options.stepCount
      ? `step-${(stepNumber + 1).toString().padStart(2, '0')}-${options.stepPrefix}.md`
      : null,
    parallel_with: [],
    triggers: [],
    actions: [],
    produces: [],
    requires: []
  };
  
  const content = `# Step ${stepNumber}: ${options.stepPrefix}\n\n**Purpose**: ${options.stepPurpose}\n\n## Actions\n\n- TODO: Add actions\n\n## Output\n\n- TODO: Define outputs\n`;
  
  await writeFile(
    `_bmad-ext/modules/${moduleName}/workflows/${workflowName}/steps/${stepName}.md`,
    `---\n${yamlStringify(frontmatter)}---\n\n${content}`
  );
}
```

### 3. Hop-Reading Pattern Generator

```typescript
async function generateHopReadingPattern(
  workflowName: string,
  moduleName: string
): Promise<string> {
  return `# Hop-Reading Pattern for ${workflowName}

\`\`\`yaml
# Step 1: Load workflow frontmatter (lightweight)
Load: "_bmad-ext/modules/${moduleName}/workflows/${workflowName}/workflow.md"
Extract:
  - name
  - version
  - phase
  - entry_point
  - steps

# Step 2: Load step frontmatter sequentially
Load: "_bmad-ext/modules/${moduleName}/workflows/${workflowName}/steps/step-01-xxx.md"
Execute: Step 1 actions

Load: "_bmad-ext/modules/${moduleName}/workflows/${workflowName}/steps/step-02-xxx.md"
Execute: Step 2 actions

# ... continue for all steps

# Step 3: Update LOOP_STATE on completion
Update: "_bmad-ext/state/LOOP_STATE.yaml"
With:
  workflow: "${workflowName}"
  status: "completed"
  timestamp: "${new Date().toISOString()}"
\`\`\`
`;
}
```

### 4. Validate Workflow Compliance

```typescript
async function validateWorkflowCompliance(
  workflowName: string,
  moduleName: string
): Promise<ValidationResult> {
  const checks = [
    { check: 'workflow.md exists', required: true },
    { check: 'steps directory exists', required: true },
    { check: 'First step file exists', required: true },
    { check: 'All step files exist', required: true },
    { check: 'Frontmatter is valid YAML', required: true },
    { check: 'Step order is sequential', required: true },
    { check: 'Next/prev references are valid', required: true },
    { check: 'Hop-reading pattern is documented', required: true }
  ];
  
  const results = [];
  for (const check of checks) {
    const passed = await runWorkflowCheck(workflowName, moduleName, check);
    results.push({ check: check.check, passed, required: check.required });
  }
  
  return {
    workflow: workflowName,
    module: moduleName,
    total_checks: checks.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}
```

## Workflow Patterns

### Linear Workflow (Sequential Steps)

```
Step 1 → Step 2 → Step 3 → Step 4
```

**Use Case**: Simple workflows where each step depends on the previous

### Branching Workflow (Conditional Routing)

```
Step 1
    ├── Condition A → Step 2A
    ├── Condition B → Step 2B
    └── Condition C → Step 2C
            ↓
        Step 3 (converge)
```

**Use Case**: Workflows with conditional logic based on input

### Parallel Workflow (Concurrent Steps)

```
Step 1
    ├──→ Step 2A ─┐
    ├──→ Step 2B ─┼─→ Step 3
    └──→ Step 2C ─┘
```

**Use Case**: Workflows with independent steps that can run concurrently

### Loop Workflow (Iterative Steps)

```
Step 1 → Step 2 → [Condition?] → Yes → Step 3 → Back to Step 2
                              └── No ──→ Step 4
```

**Use Case**: Workflows requiring iteration until condition is met

## Handoff Protocol

```yaml
# Handoff between workflows
handoff:
  from:
    workflow: "{workflow-1}"
    step: "step-03-xxx.md"
  to:
    workflow: "{workflow-2}"
    step: "step-01-xxx.md"
  artifacts:
    - "{artifact-1}"
    - "{artifact-2}"
  context:
    - "{context-1}"
    - "{context-2}"
```

## Quick Commands

| Command | Action |
|---------|--------|
| `/workflow-builder` | Load workflow builder skill |
| `/create-workflow name={workflow} module={module}` | Create new workflow |
| `/edit-workflow name={workflow} module={module}` | Edit existing workflow |
| `/validate-workflow name={workflow} module={module}` | Validate workflow |
| `/add-step workflow={workflow} module={module}` | Add step to workflow |

## Workflow Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Linear | `workflow-name` | `story-cycle`, `context-first` |
| Enhanced | `name-enhanced` | `sprint-planning-enhanced` |
| Diagnostic | `name-first` | `diagnostic-first` |
| Corrective | `correct-course` | `correct-course` |

## Example: Creating New Workflow

```bash
# Step 1: Load workflow builder
/workflow-builder

# Step 2: Create workflow structure
/create-workflow name="new-workflow" module="governance" steps=5

# Step 3: Edit workflow steps
/edit-workflow name="new-workflow" module="governance"

# Step 4: Validate compliance
/validate-workflow name="new-workflow" module="governance"
```

---

**Source**: `_bmad-ext/modules/{module}/workflows/`
**Version**: 1.0.0
**Last Updated**: 2026-01-11
