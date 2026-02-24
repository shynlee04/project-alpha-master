# ado-discovery

Execute ADO Phase 1: Discovery - Requirements gathering, research, and constraint definition.

## Overview

This command initiates the **Discovery Phase** of the ADO development lifecycle. It combines mandatory research, requirements gathering, and constraint definition before any architectural decisions or code implementation.

## Prerequisites

- ADO module installed at `.bmad/ado/`
- Project goals or issues to investigate
- Optional: tasks.md or requirements document

## Usage

```
/ado-discovery [scope]
```

**Parameters:**
- `scope`: Optional description of what to discover (e.g., "agentic-coder pipeline failures", "new feature requirements")

## Phase 1: Discovery Workflow

### Step 1: Load Workflow
1. **Load workflow configuration** from `.bmad/ado/workflows/ado-discovery/workflow.yaml`
2. **Read checklist** from `.bmad/ado/workflows/ado-discovery/checklist.md`
3. **Load template** from `.bmad/ado/workflows/ado-discovery/template.md`

### Step 2: Research-First Approach
**MANDATORY**: Research before any decisions

1. **Execute MCP research queries**:
   - `*query-deepwiki` - Research GitHub repositories for patterns
   - `*query-context7` - Pull official documentation
   - `*research-sync` - Orchestrate multiple tools

2. **Research cache** with confidence scores:
   - Library/framework documentation
   - Similar implementations and patterns
   - Common pitfalls and solutions
   - Best practices and anti-patterns

3. **Document findings**:
   - Key insights and discoveries
   - Recommended approaches
   - Potential risks and constraints

### Step 3: Requirements Gathering
1. **Define scope**:
   - What problem are we solving?
   - What are the success criteria?
   - What are the boundaries?

2. **Identify constraints**:
   - Technical constraints (existing codebase, dependencies)
   - Resource constraints (time, complexity)
   - Platform constraints (tools, infrastructure)

3. **Document assumptions**:
   - What do we assume to be true?
   - What needs validation?
   - What is unknown?

### Step 4: Gate 1 Validation
Before proceeding to Planning phase, verify:
- [ ] Research completed on all critical dependencies
- [ ] Scope clearly defined and documented
- [ ] Constraints identified and documented
- [ ] Success criteria established
- [ ] Risk assessment completed

## Research Tools

The discovery phase heavily emphasizes research using available MCP tools:

### DeepWiki
- Research GitHub repositories
- Analyze similar projects
- Extract architectural patterns
- Review issue discussions

### Context7
- Pull official documentation
- API references and guides
- Framework best practices
- Library-specific patterns

### Tavily
- Multi-source semantic search
- Community solutions
- Stack Overflow discussions
- Technical blogs and articles

### Repomix
- Analyze packed repository code
- Understand implementation patterns
- Review codebase structure
- Extract reusable patterns

## Outputs

All outputs saved to `docs/ado-artifacts/ado-phase-outputs/discovery/`:

```
docs/ado-artifacts/ado-phase-outputs/discovery/
├── research-cache/              # MCP research results
│   ├── deepwiki-results.md      # DeepWiki query findings
│   ├── context7-results.md      # Documentation pulls
│   ├── tavily-results.md        # Semantic search results
│   └── repomix-analysis.md      # Repository analysis
├── requirements.md              # Documented requirements
├── constraints.md               # Technical and resource constraints
├── scope-definition.md          # Problem statement and boundaries
├── assumptions.md               # Assumptions and unknowns
├── risks-and-mitigations.md     # Risk assessment
└── discovery-report.md          # Comprehensive phase report
```

## Checklist

Progress tracked in `.bmad/ado/workflows/ado-discovery/checklist.md`:

- [ ] 1.1: MCP tools research completed
- [ ] 1.2: Official documentation reviewed
- [ ] 1.3: Similar projects analyzed
- [ ] 1.4: Requirements documented
- [ ] 1.5: Constraints identified
- [ ] 1.6: Scope defined
- [ ] 1.7: Success criteria established
- [ ] 1.8: Assumptions documented
- [ ] 1.9: Risks assessed
- [ ] 1.10: Gate 1 validation passed

## Success Criteria

Discovery phase is complete when:
- Research cache contains all necessary information
- Requirements clearly documented and validated
- Constraints identified and classified
- Scope defined with clear boundaries
- Success criteria measurable and agreed upon
- Risks documented with mitigation strategies
- Gate 1 validation checklist 100% complete

## Examples

### Investigate Broken Pipeline
```
/ado-discovery agentic-coder pipeline failures
```
**Result**: Research phase investigating the broken agentic-coder pipeline, documenting requirements and constraints for refactoring.

### New Feature Discovery
```
/ado-discovery new AI feature with OpenAI integration
```
**Result**: Discovery phase for new feature including research on OpenAI SDK, integration patterns, and requirements gathering.

### General Research
```
/ado-discovery
```
**Result**: General discovery workflow - prompts for scope and begins research phase.

## Common Use Cases

1. **Refactoring Projects**: Understand current state, identify issues, define refactoring goals
2. **New Features**: Research dependencies, gather requirements, establish constraints
3. **Bug Investigation**: Research root causes, understand patterns, document findings
4. **Technology Evaluation**: Research alternatives, compare approaches, document recommendations

## Integration with ADO

- **Next Phase**: `ado-planning` (Phase 2)
- **Prerequisites**: None (can start immediately)
- **Gate**: Must pass Gate 1 before proceeding to Planning
- **Workflows**: Uses `ado-research-sync` for MCP orchestration
- **Agents**: Primarily `ado-analyst` with support from other agents as needed

## Notes

- **Research is mandatory** - no code decisions without research
- **Document everything** - findings, requirements, constraints, assumptions
- **Validate scope** - ensure problem is well-defined before proceeding
- **Risk assessment** - identify and plan for potential issues
- **Evidence-based** - base all decisions on research findings

For more information, see:
- `.bmad/ado/workflows/ado-discovery/workflow.yaml`
- `.bmad/ado/workflows/ado-discovery/checklist.md`
- `.bmad/ado/README.md`
