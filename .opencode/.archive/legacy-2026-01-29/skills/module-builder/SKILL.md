---
name: module-builder
description: Create and manage BMAD-ext modules with proper structure, frontmatter, and integration points. Use when creating new modules that wrap BMAD core and BMM functionality, or extending existing BMAD-ext modules.
version: 1.0.0
category: builder
parent: bmad-orchestrator
children:
  - module-structure-generator
  - module-frontmatter-generator
  - module-integration-configurator
priority: 20
agents:
  - bmad-core-master
triggers:
  - create module
  - module builder
  - new module
  - /module-builder
  - /create-module
---

# Module Builder Skill

**description**: Create and manage BMAD-ext modules with proper structure, frontmatter, and integration points.

## When to use this skill

- Creating new BMAD-ext modules that wrap BMAD core and BMM
- Extending existing BMAD-ext modules with new functionality
- Generating module structure from templates
- Configuring module integration points
- Validating module compliance with BMAD standards

## Module Structure Template

```
_bmad-ext/modules/{module-name}/
├── MODULE.md                      # Module definition (REQUIRED)
├── config/
│   ├── module.yaml                # Module configuration
│   └── {module}-config.yaml       # Module-specific config
├── workflows/
│   └── {workflow-name}/
│       ├── workflow.md            # Workflow definition
│       └── steps/
│           ├── step-01-xxx.md
│           ├── step-02-xxx.md
│           └── ...
├── agents/
│   └── {agent-name}.md            # Agent definitions
├── scanners/
│   └── {scanner-name}.md          # Scanner definitions
├── policies/
│   └── {policy-name}.md           # Policy documents
└── utils/
    └── {utility-name}.{ts,js,py}  # Utility scripts
```

## Module Frontmatter Template

```yaml
---
name: "{module-name}"
version: "1.0.0"
status: "active" | "deprecated" | "pending"
phase: "0-4"
tier: "governance" | "execution" | "remediation"
description: "Brief module description"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
requires:
  - "{module-1}"
  - "{module-2}"
provides:
  - "{workflow-1}"
  - "{agent-1}"
integrates_with:
  - "_bmad/core/"
  - "_bmad/bmm/"
  - "_bmad-ext/modules/{other-module}/"
---

# Module Title

**description**: Detailed module description...

## Module Overview

[Detailed description]

## Workflows

[List of workflows]

## Integration Points

[Integration details]

## Dependencies

[Module dependencies]

## Quick Start

[Usage example]
```

## Module Generator Functions

### 1. Generate Module Structure

```typescript
async function generateModuleStructure(moduleName: string, options: ModuleOptions): Promise<void> {
  // Create directory structure
  const directories = [
    '',
    'config',
    'workflows',
    'agents',
    'scanners',
    'policies',
    'utils'
  ];
  
  for (const dir of directories) {
    await createDirectory(`_bmad-ext/modules/${moduleName}/${dir}`);
  }
  
  // Generate MODULE.md
  await generateModuleMd(moduleName, options);
  
  // Generate module.yaml
  await generateModuleYaml(moduleName, options);
}
```

### 2. Generate Module Frontmatter

```typescript
async function generateModuleFrontmatter(moduleName: string): Promise<string> {
  const frontmatter = {
    name: moduleName,
    version: '1.0.0',
    status: 'active',
    phase: determinePhase(moduleName),
    tier: determineTier(moduleName),
    description: generateDescription(moduleName),
    created: getCurrentDate(),
    updated: getCurrentDate(),
    requires: [],
    provides: [],
    integrates_with: []
  };
  
  return yamlStringify(frontmatter);
}
```

### 3. Configure Integration Points

```typescript
async function configureIntegrationPoints(moduleName: string): Promise<void> {
  const integrations = {
    reads_from: [
      '_bmad-ext/state/LOOP_STATE.yaml',
      '_bmad-ext/state/ARTIFACT_REGISTRY.yaml',
      `bmm-workflow-status.yaml`
    ],
    writes_to: [
      '_bmad-ext/state/LOOP_STATE.yaml',
      `_bmad-output/${moduleName}/`
    ],
    invoked_by: [
      '_bmad-ext/orchestrator/master-orchestrator.md',
      '.claude/hooks/'
    ]
  };
  
  await writeFile(
    `_bmad-ext/modules/${moduleName}/config/integrations.yaml`,
    yamlStringify(integrations)
  );
}
```

### 4. Validate Module Compliance

```typescript
async function validateModuleCompliance(moduleName: string): Promise<ValidationResult> {
  const checks = [
    { check: 'MODULE.md exists', required: true },
    { check: 'config/module.yaml exists', required: true },
    { check: 'Frontmatter is valid YAML', required: true },
    { check: 'Status is valid', required: true },
    { check: 'Phase is valid (0-4)', required: true },
    { check: 'Integration points defined', required: false },
    { check: 'Workflows have steps', required: false }
  ];
  
  const results = [];
  for (const check of checks) {
    const passed = await runComplianceCheck(moduleName, check);
    results.push({ check: check.check, passed, required: check.required });
  }
  
  return {
    module: moduleName,
    total_checks: checks.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}
```

## Module Types

### Governance Module (Phase 0)

**description**: Self-governance, artifact lifecycle, context filtering

**Structure**:
```
governance/
├── MODULE.md
├── config/
│   ├── module.yaml
│   ├── retention-policy.yaml
│   └── domains.yaml
├── policies/
│   ├── artifact-lifecycle.md
│   └── context-strategy.md
├── scanners/
│   ├── artifact-scanner.md
│   └── context-scanner.md
└── workflows/
    ├── context-first/
    ├── expert-analysis/
    └── research-trigger/
```

### Architecture Remediation Module (Phase 0 - Special)

**description**: Architecture refactoring, god-store elimination, component normalization

**Structure**:
```
arc-v2/
├── MODULE.md
├── agents/
│   ├── context-validator.md
│   ├── domain-scanner.md
│   └── ...
├── workflows/
│   └── diagnostic-first.md
├── scanners/
│   ├── persistence-scan.md
│   ├── state-scan.md
│   └── ...
└── config/
    ├── domains.yaml
    └── thresholds.yaml
```

### Sprint Planning Wrapper (Phase 2)

**description**: Enhanced sprint planning with cohesion validation

**Structure**:
```
sprint-planning-wrapper/
├── MODULE.md
├── workflows/
│   └── sprint-planning-enhanced/
│       ├── workflow.md
│       └── steps/
├── scanners/
│   ├── cohesion-scanner.md
│   ├── dependency-scanner.md
│   └── nonsense-detector.md
└── config/
    ├── gating-rules.yaml
    └── cohesion-patterns.yaml
```

### Implementation Module (Phase 4)

**description**: Story execution, bug fixes, remediation

**Structure**:
```
implementation/
├── MODULE.md
├── workflows/
│   ├── story-cycle/
│   └── correct-course/
├── agents/
│   └── ...
├── templates/
│   └── enhanced-story-template.md
└── config/
    └── agent-tool-spec-template.yaml
```

## Quick Commands

| Command | Action |
|---------|--------|
| `/module-builder` | Load module builder skill |
| `/create-module name={module}` | Create new module structure |
| `/validate-module name={module}` | Validate module compliance |
| `/add-workflow module={module}` | Add workflow to module |
| `/add-agent module={module}` | Add agent to module |

## Module Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Governance | `{name}` | `governance`, `artifact-lifecycle` |
| Remediation | `arc-v2` | `arc-v2`, `store-refactorer` |
| Wrapper | `{name}-wrapper` | `sprint-planning-wrapper` |
| Implementation | `{name}` | `implementation` |

## Module Phase Assignment

| Phase | Description | Module Types |
|-------|-------------|--------------|
| 0 | Governance Foundation | governance, arc-v2 |
| 1 | Governance Consolidation | - |
| 2 | Sprint Planning | sprint-planning-wrapper |
| 3 | Orchestrator Update | - |
| 4 | Implementation | implementation |
| 5 | Enhanced Agents | - |

## Example: Creating New Module

```bash
# Step 1: Load module builder
/module-builder

# Step 2: Create module structure
/create-module name="new-feature-module" phase="4" tier="execution"

# Step 3: Add workflow
/add-workflow module="new-feature-module" workflow="feature-development"

# Step 4: Validate compliance
/validate-module name="new-feature-module"
```

---

**Source**: `_bmad-ext/modules/MODULE-HIERARCHY.md`
**Version**: 1.0.0
**Last Updated**: 2026-01-11
