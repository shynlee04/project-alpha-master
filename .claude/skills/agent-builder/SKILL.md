---
name: agent-builder
description: Create and manage BMAD-ext agents with proper structure, capability definitions, and integration with workflows. Use when creating new agents, editing existing agents, or extending agent capabilities.
version: 1.0.0
category: builder
parent: bmad-orchestrator
children:
  - agent-structure-generator
  - agent-capability-definer
  - agent-editor
  - agent-validator
priority: 22
agents:
  - bmad-core-master
  - platform-router
triggers:
  - create agent
  - agent builder
  - edit agent
  - /agent-builder
  - /create-agent
  - /edit-agent
---

# Agent Builder Skill

**Purpose**: Create and manage BMAD-ext agents with proper structure, capability definitions, and integration with workflows.

## When to use this skill

- Creating new agents that integrate with BMAD-ext modules
- Editing existing agents to add capabilities or modify behavior
- Extending agent capabilities with new functions
- Validating agent compliance with BMAD standards
- Managing agent handoffs and coordination

## Agent Structure Template

```
agents/{agent-name}/
├── agent.md                       # Agent definition (REQUIRED)
├── config.yaml                    # Agent configuration
├── capabilities/
│   ├── {capability-1}.yaml
│   └── {capability-2}.yaml
├── tools/
│   ├── {tool-1}.yaml
│   └── {tool-2}.yaml
└── prompts/
    ├── system-prompt.md
    └── user-prompt-templates/
        ├── template-1.md
        └── template-2.md
```

## Agent Frontmatter Template

```yaml
---
name: "{agent-name}"
version: "1.0.0"
status: "active" | "deprecated" | "beta"
type: "specialist" | "coordinator" | "scanner" | "executor"
module: "{parent-module}"
phase: "0-4"
description: "Brief agent description"
capabilities:
  - "{capability-1}"
  - "{capability-2}"
requires_tools:
  - "{tool-1}"
  - "{tool-2}"
coordinates_with:
  - "{agent-1}"
  - "{agent-2}"
triggers:
  - "{trigger-phrase-1}"
  - "{trigger-phrase-2}"
max_concurrent_tasks: 3
avg_token_efficiency: 0.75
availability: "active"
---

# Agent Title

**Purpose**: Detailed agent purpose...

## Agent Overview

[Detailed description]

## Capabilities

[Capability list]

## Usage

[Usage example]
```

## Agent Generator Functions

### 1. Generate Agent Structure

```typescript
async function generateAgentStructure(
  agentName: string,
  moduleName: string,
  options: AgentOptions
): Promise<void> {
  // Create agent directory
  await createDirectory(`_bmad-ext/modules/${moduleName}/agents/${agentName}`);
  
  // Create subdirectories
  await createDirectory(`_bmad-ext/modules/${moduleName}/agents/${agentName}/capabilities`);
  await createDirectory(`_bmad-ext/modules/${moduleName}/agents/${agentName}/tools`);
  await createDirectory(`_bmad-ext/modules/${moduleName}/agents/${agentName}/prompts`);
  
  // Generate agent.md
  await generateAgentMd(agentName, moduleName, options);
  
  // Generate config.yaml
  await generateAgentConfig(agentName, options);
}
```

### 2. Define Capabilities

```typescript
async function defineCapabilities(
  agentName: string,
  moduleName: string,
  capabilities: Capability[]
): Promise<void> {
  for (const capability of capabilities) {
    const capabilityYaml = {
      name: capability.name,
      version: '1.0.0',
      description: capability.description,
      actions: capability.actions,
      outputs: capability.outputs,
      requires: capability.requires
    };
    
    await writeFile(
      `_bmad-ext/modules/${moduleName}/agents/${agentName}/capabilities/${capability.name}.yaml`,
      yamlStringify(capabilityYaml)
    );
  }
}
```

### 3. Define Tool Requirements

```typescript
async function defineToolRequirements(
  agentName: string,
  moduleName: string,
  tools: Tool[]
): Promise<void> {
  const toolsYaml = {
    agent: agentName,
    tools: tools.map(tool => ({
      name: tool.name,
      type: tool.type,
      purpose: tool.purpose,
      required: tool.required,
      permissions: tool.permissions
    }))
  };
  
  await writeFile(
    `_bmad-ext/modules/${moduleName}/agents/${agentName}/tools/tools.yaml`,
    yamlStringify(toolsYaml)
  );
}
```

### 4. Generate System Prompt

```typescript
async function generateSystemPrompt(
  agentName: string,
  moduleName: string,
  options: PromptOptions
): Promise<string> {
  return `# System Prompt for ${agentName}

## Role

You are ${options.roleDescription}.

## Background

${options.background}

## Core Principles

${options.corePrinciples.map((principle, i) => `${i + 1}. ${principle}`).join('\n')}

## Capabilities

${options.capabilities.map((cap, i) => `- ${cap}`).join('\n')}

## Constraints

${options.constraints.map((constraint, i) => `${i + 1}. ${constraint}`).join('\n')}

## Output Format

${options.outputFormat}

## Integration

${options.integrationNotes}
`;
}
```

### 5. Validate Agent Compliance

```typescript
async function validateAgentCompliance(
  agentName: string,
  moduleName: string
): Promise<ValidationResult> {
  const checks = [
    { check: 'agent.md exists', required: true },
    { check: 'config.yaml exists', required: true },
    { check: 'Frontmatter is valid YAML', required: true },
    { check: 'Status is valid', required: true },
    { check: 'Type is valid', required: true },
    { check: 'Capabilities are defined', required: true },
    { check: 'Tool requirements are specified', required: false },
    { check: 'Coordinates with agents are valid', required: false },
    { check: 'System prompt exists', required: true }
  ];
  
  const results = [];
  for (const check of checks) {
    const passed = await runAgentCheck(agentName, moduleName, check);
    results.push({ check: check.check, passed, required: check.required });
  }
  
  return {
    agent: agentName,
    module: moduleName,
    total_checks: checks.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    results
  };
}
```

## Agent Types

### Specialist Agent

**Purpose**: Focused expertise in specific domain

**Example**: `store-refactorer`, `component-splitter`

**Characteristics**:
- Single domain focus
- Deep expertise
- Coordinates with scanners

### Coordinator Agent

**Purpose**: Orchestrate multiple agents or workflows

**Example**: `bmad-core-master`, `platform-router`

**Characteristics**:
- Multi-agent coordination
- Routing decisions
- State management

### Scanner Agent

**Purpose**: Analyze and report on codebase

**Example**: `domain-scanner`, `context-validator`

**Characteristics**:
- Evidence-based analysis
- Generates reports
- No code modification

### Executor Agent

**Purpose**: Execute code changes or fixes

**Example**: `bmm-dev`, `typescript-fixer`

**Characteristics**:
- Makes code changes
- Runs tests
- Validates output

## Agent Coordination Patterns

### Sequential Coordination

```
Agent A (Scanner) → Agent B (Planner) → Agent C (Executor)
```

**Use Case**: Linear workflow where each agent passes results to next

### Parallel Coordination

```
Agent A (Coordinator)
    ├──→ Agent B (Scanner 1)
    ├──→ Agent C (Scanner 2)
    └──→ Agent D (Scanner 3)
```

**Use Case**: Multiple independent analyses needed

### Hierarchical Coordination

```
Agent A (Master)
    └──→ Agent B (Subordinate 1)
    └──→ Agent C (Subordinate 2)
            └──→ Agent D (Subordinate 2a)
```

**Use Case**: Complex tasks with nested subtasks

## Capability Definition Format

```yaml
# capabilities/{capability-name}.yaml
capability:
  name: "{capability-name}"
  version: "1.0.0"
  description: "What the agent can do"
  
  actions:
    - action: "{action-1}"
      description: "Description of action"
      parameters:
        - name: "{param-1}"
          type: "string"
          required: true
      returns:
        type: "{return-type}"
        description: "What it returns"
    
    - action: "{action-2}"
      # ...

  examples:
    - "Example usage 1"
    - "Example usage 2"
  
  error_handling:
    - error: "{error-type}"
      handling: "{how to handle}"
```

## Quick Commands

| Command | Action |
|---------|--------|
| `/agent-builder` | Load agent builder skill |
| `/create-agent name={agent} module={module}` | Create new agent |
| `/edit-agent name={agent} module={module}` | Edit existing agent |
| `/validate-agent name={agent} module={module}` | Validate agent |
| `/add-capability agent={agent} module={module}` | Add capability |

## Agent Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Specialist | `{domain}-{role}` | `store-refactorer`, `component-splitter` |
| Coordinator | `{role}` | `bmad-core-master`, `platform-router` |
| Scanner | `{target}-scanner` | `domain-scanner`, `context-validator` |
| Executor | `{action}-executor` | `remediation-executor` |

## Example: Creating New Agent

```bash
# Step 1: Load agent builder
/agent-builder

# Step 2: Create agent structure
/create-agent name="new-specialist" module="implementation" type="specialist"

# Step 3: Add capabilities
/add-capability agent="new-specialist" module="implementation"

# Step 4: Validate compliance
/validate-agent name="new-specialist" module="implementation"
```

---

**Source**: `_bmad-ext/modules/{module}/agents/`
**Version**: 1.0.0
**Last Updated**: 2026-01-11
