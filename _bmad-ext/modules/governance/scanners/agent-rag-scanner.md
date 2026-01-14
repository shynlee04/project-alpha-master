---
name: "agent-rag-scanner"
type: "governance-scanner"
description: "Agent/AI/RAG ecosystem analysis - MOST CLUSTER-PRONE area"
version: "1.0.0"
critical: true
---

# Agent/AI/RAG Scanner

**description**: Analyze the Agent/AI/RAG ecosystem to prevent clustering from tools, CRUD operations, RAG context, and multimodality issues.

## Why This Scanner is CRITICAL

The Agent/AI/RAG ecosystem is the **heaviest and most cluster-prone** area:

1. **Tools with CRUD**: Agents can modify state directly
2. **RAG Context**: Multiple entities for indexing and context
3. **Multimodality**: Input/output handling varies by workspace
4. **Unlocking by Stage**: Feature-rich requests need phased rollout

## Scan Scope

- **Agent Definitions**: `_bmad/agents/`, `_bmad-ext/agents/`
- **Tool Definitions**: Tool schemas and implementations
- **RAG Systems**: Indexing, entity context, conversation threads
- **Multimodality**: Input/output handling across workspaces

## Scan Process

### 1. Tool Governance Analysis

```yaml
tools_analysis:
  tools_defined: [count]
  tools_with_crud:
    - tool: "{name}"
      operations: [CREATE|READ|UPDATE|DELETE]
      risk_level: "{low|medium|high}"
      safeguards: [existing safeguards]

  concerns:
    - type: "unrestricted_crud"
      tool: "{name}"
      risk: "{what could go wrong}"
      recommendation: "{safeguard needed}"
```

### 2. RAG Context Analysis

```yaml
rag_analysis:
  entities_indexed: [count]
  context_sources: [list]
  conversation_tracking:
    current_state: "{centralized|scattered}"
    issues: [list of problems]

  concerns:
    - type: "context_poisoning"
      source: "{where}"
      impact: "{what happens}"
      mitigation: "{how to prevent}"
```

### 3. Multimodality Analysis

```yaml
multimodality_analysis:
  input_types: [text|image|audio|video]
  output_types: [text|image|audio|video]
  handling_by_workspace:
    - workspace: "{name}"
      in_page: "{yes|no}"
      tool_manipulated: "{yes|no}"
      concerns: [list]
```

### 4. Staging Analysis

```yaml
staging_analysis:
  feature_unlocking:
    current_approach: "{sprint|phase|gate}"
    issues: [problems with current approach]

  recommendations:
    - feature: "{name}"
      current_status: "{locked|unlocked}"
      recommended_stage: "{which stage}"
      dependencies: [what must come first]
```

### 5. Output Format

```yaml
agent_rag_scan_results:
  scan_date: "{date}"
  critical_findings: [list]

  tools_governance:
    total_tools: [count]
    tools_with_crud: [count]
    high_risk_tools: [count]
    recommendations: [list]

  rag_governance:
    entities_tracked: [count]
    context_issues: [count]
    centralization_needed: {yes|no}

  multimodality_governance:
    input_variations: [count]
    output_variations: [count]
    consistency_issues: [count]

  staging_governance:
    proper_staging: {yes|no}
    premature_unlocks: [list]
    recommended_phases: [list]

  overall_assessment:
    cluster_risk: "{low|medium|high}"
    priority_actions: [critical actions to take]
```

## Cluster Risk Indicators

**HIGH RISK** when:
- Tools with unrestricted CRUD
- No centralization of conversation threads
- RAG context scattered across entities
- No staging for complex features

**MEDIUM RISK** when:
- Some tool safeguards exist
- Partial context centralization
- Staging exists but not enforced

## Integration

**Used By**: context-first workflow (Step 2)

**Output**: Agent/AI/RAG analysis included in governance report

**Critical Priority**: This scanner runs FIRST due to cluster risk
