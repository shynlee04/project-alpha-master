---
name: create-story-enhanced
description: Create a new story file from epic backlog with EXPANDED epic context and comprehensive analysis. Use when user says "create story", "new story", or specifies epic/story numbers. Generates story file with deep epic understanding, cross-impact analysis, and research requirements.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 56
agents:
  - bmad-bmm-sm
triggers:
  - create story
  - new story
  - add story
  - /create-story
  - story from epic
  - enhanced create story
---

# Step 01: Create Story - Enhanced with Epic Expansion

**description**: Create story file from epic backlog with DEEP epic understanding, cross-impact analysis, and comprehensive research requirements.

## Problem Statement (Why v2.0)

**Old Approach**: Create story from compact epic specification - shallow, no project understanding.

**New Approach**: Expand epic context, analyze cross-impacts, understand project architecture - deep, comprehensive.

## When to use

- User says "create story" or "new story"
- User specifies epic number to create story from
- User provides epic=N story=N parameters
- Starting a new story from backlog

## Instructions

### 1. Load Comprehensive Epic Context

```bash
# REQUIRED: Read these files for deep understanding
READ: _bmad-output/planning-artifacts/epics.md
READ: _bmad-output/sprint-artifacts/sprint-status.yaml
READ: _bmad-output/planning-artifacts/architecture.md
READ: _bmad/bmb/config.yaml
READ: .claude/rules/governance-rules.md

# NEW: Also read related epics for context
READ: _bmad-output/planning-artifacts/epics.md | grep -A50 "EPIC-{N-1}"
READ: _bmad-output/planning-artifacts/epics.md | grep -A50 "EPIC-{N+1}"
```

### 2. Deep Epic Analysis (NEW - Required)

```yaml
epic_analysis:
  epic_basics:
    number: {N}
    name: "{epic_name}"
    status: "{status}"
    progress: "{percentage}%"
    
  epic_goals:
    primary_goal: "{main goal of this epic}"
    secondary_goals:
      - "{goal 1}"
      - "{goal 2}"
    success_criteria:
      - "{criterion 1}"
      - "{criterion 2}"
      
  epic_scope:
    stories_total: {count}
    stories_completed: {count}
    stories_planned: {count}
    current_story_number: {N}
    
  epic_dependencies:
    upstream_epics:
      - epic: "EPIC-{N-1}"
        status: "done|pending"
        relationship: "{how it relates}"
        
    downstream_epics:
      - epic: "EPIC-{N+1}"
        status: "pending"
        relationship: "{how this epic enables it}"
        
  epic_patterns:
    architectural_patterns:
      - pattern: "{from architecture.md}"
        applied_in: "{file}"
        
    design_patterns:
      - pattern: "{name}"
        examples_in: "{files}"
        
    common_components:
      - component: "{name}"
        used_by_stories: ["{story_keys}"]
```

### 3. Cross-Impact Analysis (NEW - Required)

```yaml
cross_impact_analysis:
  workspace_impact:
    ide_workspace:
      affected: true/false
      features: ["{list}"]
      files: ["{list}"]
      
    notes_workspace:
      affected: true/false
      features: ["{list}"]
      files: ["{list}"]
      
    knowledge_workspace:
      affected: true/false
      features: ["{list}"]
      files: ["{list}"]
      
    shared_components:
      - component: "{name}"
        impact: "{how this story affects it}"
        
  feature_interconnections:
    stories_this_depends_on:
      - story: "{story_key}"
        reason: "{why dependency}"
        
    stories_that_depend_on_this:
      - story: "{story_key}"
        reason: "{why dependency}"
        
    shared_functionality:
      - functionality: "{name}"
        shared_with: ["{stories}"]
```

### 4. Story Specification Expansion (NEW - Required)

Instead of just compact specifications, expand with:

```yaml
story_expansion:
  user_story_expansion:
    as_a: "{role}"
    i_want: "{action - expanded with context}"
    so_that: "{benefit - expanded with user impact}"
    
    # Add context from epic
    context_from_epic: |
      From EPIC-{N} goals: {relevant_goals}
      This story supports: {specific_goal}
      
  acceptance_criteria_expansion:
    # Each AC expanded with:
    - name: "{AC name}"
      given: "{precondition - with real examples}"
      when: "{action - with specific triggers}"
      then: "{outcome - with measurable results}"
      
      # Add implementation hints
      implementation_hints:
        - file: "{path}"
          reason: "{why this file is relevant}"
          
        - pattern: "{from architecture}"
          reason: "{why this pattern}"
          
      # Add edge cases
      edge_cases:
        - case: "{description}"
          handling: "{how to handle}"
          
  tasks_expansion:
    - task: "{description}"
      type: "research|implementation|testing|refactor"
      depends_on: "{other task}"
      effort_estimate: "1h|2h|4h"
      
    # Add research tasks for complex areas
    - task: "Research {complex area}"
      type: "research"
      mcp_tools:
        - "Context7: {library}"
        - "DeepWiki: {repo}"
      expected_outcome: "{what to find}"
```

### 5. Create Enhanced Story File

**Location**: `{sprint_artifacts}/{epic}-{story}-{slug}.md`

**Template**:
```markdown
---
story_key: "{epic}-{story}-{slug}"
epic: {N}
story: {N}
status: "drafted"
created_at: {timestamp}
version: "2.0"
points: {estimate}
---

# {story_title}

## User Story

**As a** {role}
**I want** {action}
**So that** {benefit}

### Epic Context (NEW)
From **EPIC-{N}: {epic_name}**
- Epic Goal: {primary_goal}
- This Story Supports: {specific_goal}
- Epic Progress: {percentage}% complete

## Acceptance Criteria

### AC-1: {criteria_name}

**Given** {precondition}
**When** {action}
**Then** {outcome}

#### Implementation Hints
- Relevant Files: {file1}, {file2}
- Architecture Pattern: {pattern}
- Related Stories: {story_keys}

#### Edge Cases to Handle
- {case 1}
- {case 2}

### AC-2: {criteria_name}
### AC-3: {criteria_name}

## Deep Analysis (NEW)

### Cross-Impact Mapping

#### Workspace Impact
| Workspace | Affected | Impact Level | Key Files |
|-----------|----------|--------------|-----------|
| IDE | ✅/❌ | LOW/MEDIUM/HIGH | {files} |
| Notes | ✅/❌ | LOW/MEDIUM/HIGH | {files} |
| Knowledge | ✅/❌ | LOW/MEDIUM/HIGH | {files} |
| Shared UI | ✅/❌ | LOW/MEDIUM/HIGH | {files} |

#### Dependencies
- **Depends On**: {story_keys or "None"}
- **Required By**: {story_keys or "None"}

#### Architectural Impact
- **Layers Touched**: {domain|infrastructure|presentation|routes}
- **Clean Architecture**: ✅ COMPLIANT / ⚠️ WARNINGS
- **Potential Conflicts**: {list or "None detected"}

### Dead Code & Overlap Detection (NEW)

#### Files to Check
- {file} - potential overlap with {story}
- {file} - may be orphaned

#### Recommendations
- {recommendation 1}
- {recommendation 2}

## Tasks

- [ ] T1: {task_description} ({type}) - {effort}
- [ ] T2: {task_description} ({type}) - {effort}
- [ ] T3: {research_task} - {effort}
      MCP: Context7: {lib}, DeepWiki: {repo}
- [ ] T4: {test_task} - {effort}
- [ ] T5: {implementation_task} - {effort}

## Research Requirements (Enhanced)

### Required MCP Research
- [ ] **Context7**: {library} documentation for {specific_pattern}
  - Query: "{detailed query}"
  - Expected: "{what to find}"
  
- [ ] **DeepWiki**: {owner/repo} implementation patterns
  - Query: "How does {pattern} work in this codebase?"
  - Expected: "{what to find}"
  
- [ ] **Codebase Analysis**: Use Repomix to find:
  - Similar implementations in {related area}
  - Existing patterns to follow or avoid

### External Resources
- [ ] {url} - {description}
- [ ] {url} - {description}

## Architecture Patterns (Expanded)

### Patterns to Follow
- **Pattern**: {pattern_name}
  - Source: {architecture.md}#section
  - Rationale: {why this pattern}
  - Example: {file}:{line}

### Constraints
- Component size: ≤300 lines
- Store size: ≤120 lines
- Import order: React → 3rd party → @/ → Domain → Relative
- Styling: 8-bit design (0 or 2px border-radius)

## Dev Notes

### Integration Points
- **Touches**: {files}
- **Breaks**: {none or list}
- **Shared With**: {stories}

### Technical Considerations
- {consideration 1}
- {consideration 2}

## References

- **Epic**: {epics.md}#epic-{N}
- **Architecture**: {architecture.md}#section
- **Related Stories**:
  - {story_key}: {relationship}
  - {story_key}: {relationship}

## Dev Agent Record
*Populated during development phase*

## Code Review
*Populated during review phase*

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | {timestamp} | SM | From epic backlog |
| drafted | {timestamp} | SM | Story file created v2.0 |
| validated | {timestamp} | SM | Passed validation |
| context-ready | {timestamp} | SM | Context XML created |
| ready-for-implementation | {timestamp} | SM | Pre-planning passed |
| implementation-complete | {timestamp} | Dev | Code written |
| review-approved | {timestamp} | Reviewer | Code review passed |
| done | {timestamp} | SM | Story complete |
```

### 6. Update Sprint Status

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml
stories:
  {story_key}:
    status: "drafted"
    created_at: {timestamp}
    epic: {N}
    story: {N}
    points: {estimate}
    version: "2.0"
```

## Enhanced Validation (Self-Check)

Before proceeding:
- [ ] Story file exists at correct path
- [ ] User story format complete (As a/I want/So that)
- [ ] At least 3 acceptance criteria with Given/When/Then
- [ ] **Epic context included** (NEW)
- [ ] **Cross-impact analysis complete** (NEW)
- [ ] **Dead code detection attempted** (NEW)
- [ ] Tasks section has at least 5 checkboxes
- [ ] Research Requirements section populated
- [ ] Dev Notes references architecture.md
- [ ] Status set to `drafted`
- [ ] Sprint status updated

## v2.0 Improvements

| Aspect | v1.0 | v2.0 Enhanced |
|--------|------|---------------|
| Epic Context | None | Full epic analysis with goals |
| Cross-Impact | None | Workspace + story dependencies |
| Dead Code Detection | None | Systematic overlap analysis |
| AC Expansion | Basic GWT | GWT + hints + edge cases |
| Research | Generic | Specific MCP queries with expected outcomes |
| Validation | Basic | Evidence-based checklist |

## Next Step

Proceed to: [validate-story](../validate-story/SKILL.md)

---

**Source**: `_bmad-ext/modules/implementation/workflows/story-cycle/steps/step-01-init.md`
**Version**: 2.0.0
**Last Updated**: 2026-01-12
