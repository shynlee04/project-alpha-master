---
name: create-context
description: Create context XML for story development. Use when user says "create context", "build context", or after story validation. Generates the developer context XML with all relevant files, research findings, and implementation guidance.
version: 2.0.0
# =============================================================================
# HIERARCHICAL TAXONOMY (BMAD Skills Manifest v3.0)
# =============================================================================
category: workflow
parent: story-cycle
children: []
priority: 58
agents:
  - bmad-bmm-sm
triggers:
  - create context
  - build context
  - story context
  - /create-context
---

# Step 03: Create Context

**Purpose**: Build context XML for story development with all relevant files, research findings, and implementation guidance.

## When to use

- After story validation passes
- User says "create context" or "build context"
- Before development begins
- Manual context creation checkpoint

## Instructions

### 1. Load Story and Architecture
```bash
READ: {sprint_artifacts}/{story_key}.md
READ: _bmad-output/project-planning-artifacts/architecture.md
READ: _bmad-output/epics.md
READ: .claude/rules/governance-rules.md
```

### 2. Create Context XML

**Location**: `{sprint_artifacts}/{story_key}-context.xml`

**Template**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<context>
  <meta>
    <story_key>{epic}-{story}-{slug}</story_key>
    <epic>{epic_number}</epic>
    <story>{story_number}</story>
    <created_at>{timestamp}</created_at>
    <status>ready-for-development</status>
  </meta>

  <requirements>
    <user_story>
      <as_a>{role}</as_a>
      <i_want>{action}</i_want>
      <so_that>{benefit}</so_that>
    </user_story>
    <acceptance_criteria>
      <criterion id="AC-1">
        <name>{criteria_name}</name>
        <given>{precondition}</given>
        <when>{action}</when>
        <then>{outcome}</then>
      </criterion>
      <!-- ... at least 3 ACs -->
    </acceptance_criteria>
  </requirements>

  <architecture>
    <patterns>
      <pattern>
        <name>{pattern_name}</name>
        <source>{architecture.md}#section</source>
        <rationale>{why_this_pattern}</rationale>
      </pattern>
    </patterns>
    <constraints>
      <constraint>{file_size_limit}</constraint>
      <constraint>{import_pattern}</constraint>
      <constraint>{typescript_version}</constraint>
    </constraints>
  </architecture>

  <research>
    <context7_queries>
      <query>
        <library>{library_name}</library>
        <topic>{specific_pattern}</topic>
        <tokens>3000</tokens>
      </query>
    </context7_queries>
    <deepwiki_queries>
      <query>
        <repo>{owner/repo}</repo>
        <question>{implementation_pattern}</question>
      </query>
    </deepwiki_queries>
  </research>

  <implementation>
    <files_to_create>
      <file>
        <path>{path/to/file.ts}</path>
        <purpose>{purpose}</purpose>
      </file>
    </files_to_create>
    <files_to_modify>
      <file>
        <path>{path/to/file.ts}</path>
        <changes>{summary}</changes>
      </file>
    </files_to_modify>
    <integration_points>
      <point>{module_or_file}</point>
    </integration_points>
  </implementation>

  <testing>
    <unit_tests>
      <target>{function_or_component}</target>
    </unit_tests>
    <integration_tests>
      <target>{interaction}</target>
    </integration_tests>
  </testing>

  <references>
    <ref type="epic">{epics.md}#epic-{N}</ref>
    <ref type="architecture">{architecture.md}#section</ref>
    <ref type="related">{story_keys}</ref>
  </references>
</context>
```

### 3. Include Key Files

For each file mentioned in context:
- Read full content
- Include relevant sections
- Note line numbers for changes

### 4. Update Story Status

```yaml
# Update story file
{story_key}:
  status: "context-ready"
  context_created_at: {timestamp}
  context_file: {story_key}-context.xml
```

## Validation

Before proceeding:
- [ ] Context XML file created
- [ ] XML is well-formed
- [ ] All ACs included
- [ ] Architecture patterns referenced
- [ ] Research queries specified
- [ ] Implementation plan included
- [ ] Files to create/modify listed
- [ ] Test strategy documented

## Next Step

Proceed to: [validate-context](../validate-context/SKILL.md)

---

**Source**: `_bmad/bmb/workflows/story-cycle/steps/03-create-context.md`
