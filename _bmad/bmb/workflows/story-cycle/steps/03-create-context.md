---
step: 3
name: "create-context"
phase: "context-creation"
agent: "@bmad-bmm-sm"
timeout: "15 min"
next: "04-validate-context.md"
on_fail: "notify-and-pause"
---

# Step 03: Create Story Context XML

> **Agent:** Story Manager (SM)
> **Output:** Context XML at `{sprint_artifacts}/{story_key}-context.xml`

---

## Instructions

### 1. Load Story File

```bash
READ: {sprint_artifacts}/{story_key}.md
```

Extract:
- Acceptance criteria
- Research requirements
- Dev notes (dependencies, integration points)

### 2. Load Architecture Patterns

```bash
READ: _bmad-output/project-planning-artifacts/architecture.md
```

Extract relevant patterns for this story.

### 3. Load Current Code State

For each file in integration points:

```bash
READ: src/{path/to/file}
```

Extract relevant code snippets (50-200 lines each).

### 4. Execute MCP Research

**For each research requirement in story file:**

```bash
# Context7 - Official docs
Context7.resolve-library-id({library_name})
Context7.get-library-docs({id}, topic="{pattern}")

# DeepWiki - GitHub patterns
DeepWiki.ask_repository("{owner}/{repo}", "{pattern query}")

# Tavily/Exa - Community solutions
Tavily.search("{pattern} best practices {year}")
```

### 5. Create Context XML File

Create: `{sprint_artifacts}/{story_key}-context.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<context story="{story_key}" created="{timestamp}" version="1.0">
  <!-- METADATA -->
  <metadata>
    <epic>{epic_number}</epic>
    <story>{story_number}</story>
    <title>{story_title}</title>
    <created_by>SM Agent</created_by>
    <sprint>{current_sprint}</sprint>
  </metadata>

  <!-- ACCEPTANCE CRITERIA -->
  <acceptance_criteria>
    <criterion id="AC-1">
      <given>{precondition}</given>
      <when>{action}</when>
      <then>{outcome}</then>
    </criterion>
    <criterion id="AC-2">
      <!-- ... -->
    </criterion>
  </acceptance_criteria>

  <!-- CURRENT CODE STATE -->
  <files>
    <file path="src/{relative_path}" language="{language}">
      <description>{what_this_file_does}</description>
      <content><![CDATA[
        // Relevant existing code snippets
        // Focus on areas to be modified
      ]]></content>
      <exports>
        <export name="{function_name}" type="{type}" />
      </exports>
      <imports>
        <import from="{package}" />
      </imports>
    </file>
    <!-- Additional files as needed -->
  </files>

  <!-- RESEARCH FINDINGS FROM MCP TOOLS -->
  <research_notes>
    <finding source="context7" query="{query}" timestamp="{timestamp}">
      <pattern><![CDATA[
        {code_pattern_or_api_signature}
      ]]></pattern>
      <insight>{what_this_means_for_implementation}</insight>
      <reference url="{doc_url}" />
    </finding>

    <finding source="deepwiki" repo="{owner}/{repo}" query="{query}">
      <pattern>{implementation_pattern_found}</pattern>
      <insight>{how_to_apply}</insight>
      <reference url="{github_url}" />
    </finding>

    <finding source="tavily" query="{search_query}">
      <insight>{community_solution_or_best_practice}</insight>
      <reference url="{article_url}" />
    </finding>
  </research_notes>

  <!-- ARCHITECTURE PATTERNS TO FOLLOW -->
  <architecture_patterns>
    <pattern name="{pattern_name}" source="architecture.md#{section}">
      <description>{what_the_pattern_is}</description>
      <rationale>{why_we_use_this_pattern}</rationale>
      <implementation><![CDATA[
        {example_or_guidance}
      ]]></implementation>
    </pattern>
  </architecture_patterns>

  <!-- TECHNICAL NOTES FOR DEVELOPER -->
  <technical_notes>
    <note priority="critical">
      {must_know_before_starting}
    </note>
    <note priority="high">
      {important_consideration}
    </note>
    <note priority="medium">
      {helpful_context}
    </note>
    <note priority="low">
      {nice_to_have}
    </note>
  </technical_notes>

  <!-- DEPENDENCIES -->
  <dependencies>
    <dependency name="{package_name}" version="{version}" type="runtime|dev|peer">
      <purpose>{why_its_needed}</purpose>
      <import_style>{named|default|namespace}</import_style>
    </dependency>
  </dependencies>

  <!-- INTEGRATION POINTS -->
  <integration_points>
    <touches file="{path}">
      <reason>{why_this_file}</reason>
      <risk>{low|medium|high}</risk>
    </touches>
    <breaks file="{path}" if_any="true">
      <breaking_change>{what_breaks}</breaking_change>
      <migration>{how_to_migrate}</migration>
    </breaks>
  </integration_points>

  <!-- TEST REQUIREMENTS -->
  <test_requirements>
    <test_type>{unit|integration|e2e}</test_type>
    <framework>{jest|vitest|playwright}</framework>
    <coverage>{minimum_coverage_%</coverage>
    <fixtures>
      <fixture name="{fixture_name}" purpose="{mock_data}" />
    </fixtures>
  </test_requirements>

  <!-- DEFINITIONS OF DONE -->
  <definition_of_done>
    <criterion>[ ] All acceptance criteria passing</criterion>
    <criterion>[ ] Unit tests created and passing</criterion>
    <criterion>[ ] Integration with existing code verified</criterion>
    <criterion>[ ] No TypeScript errors</criterion>
    <criterion>[ ] Code review approved</criterion>
  </definition_of_done>
</context>
```

### 6. Update Sprint Status

```yaml
# _bmad-output/sprint-artifacts/sprint-status.yaml

{story_key}:
  status: "ready-for-dev"
  context_created_at: {timestamp}
  context_file: "{sprint_artifacts}/{story_key}-context.xml"
```

---

## Validation (Self-Check)

Before proceeding:

- [ ] Context XML file exists at correct path
- [ ] Valid XML structure (no parse errors)
- [ ] Contains `<metadata>` with story identification
- [ ] Contains at least 1 `<file>` element with current code state
- [ ] Contains `<research_notes>` with at least 3 MCP findings
- [ ] Contains `<technical_notes>` with implementation hints
- [ ] Contains `<architecture_patterns>` from architecture.md
- [ ] File paths are correct relative paths
- [ ] Content is current (not stale)
- [ ] All acceptance criteria included
- [ ] Test requirements specified

---

## Handoff Output

```markdown
## 📋 STEP COMPLETE: 03-create-context

**Story:** {story_key}
**Status:** ready-for-dev

### Artifacts Created:
- ✅ {sprint_artifacts}/{story_key}-context.xml
- ✅ {sprint_artifacts}/sprint-status.yaml (updated)

### Research Summary:
- Context7 queries: {N}
- DeepWiki queries: {N}
- Tavily queries: {N}
- Total findings: {N}

### Next Step:
- Execute: 04-validate-context.md
- Input: Context XML path
```
