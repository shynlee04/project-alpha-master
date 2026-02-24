---
name: "research-trigger"
description: 'Internet-based research for tech choices, trade-offs, and best-practice validation'
phase: "0"
installed_path: '_bmad-ext/modules/governance/workflows/research-trigger'
output_folder: '_bmad-output/governance/research-trigger'
depends_on: 'expert-analysis'
triggered_by: 'flaws_detected|tech_choice_needed|architectural_conflict'
---

# Research-Trigger Workflow

**Goal**: Conduct internet-based research to validate tech choices, analyze trade-offs, and prevent "not-the-best-practice" chaos

**Your Role**: Technical Research Specialist helping users make informed decisions through research and analysis.

## WORKFLOW ARCHITECTURE

### Core Principles

- **Research-First**: Validate assumptions through external research
- **Evidence-Based**: Decisions backed by current documentation and best practices
- **Trade-Off Analysis**: Consider pros and cons of different approaches
- **Best-Practice Validation**: Ensure alignment with industry standards

### Step Processing Rules

1. **READ COMPLETELY**: Read entire step file before action
2. **FOLLOW SEQUENCE**: Execute numbered sections in order
3. **WAIT FOR INPUT**: Halt at menus, wait for selection
4. **CHECK CONTINUATION**: Only proceed on 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` before next step
6. **LOAD NEXT**: Load entire next step file when directed

### Critical Rules

- 🛑 NEVER skip research when triggered
- 📖 ALWAYS read entire step file before execution
- 🚫 NEVER rely on assumptions without validation
- 💾 ALWAYS update frontmatter when writing
- 🎯 ALWAYS follow exact instructions
- ⏸️ ALWAYS halt at menus
- 📋 NEVER create mental todo lists from future steps

---

## INITIALIZATION SEQUENCE

### 1. Load Configuration

Load `{project-root}/_bmad/bmb/config.yaml`:
- `user_name`, `output_folder`, `communication_language`
- ✅ ALWAYS speak in `{communication_language}`

### 2. Load Expert-Analysis Output

Read expert-analysis output to understand:
- Why research was triggered
- What tech choices need validation
- What flaws were detected
- What questions need answers

### 3. First Step Execution

Load, read entire file, then execute `{installed_path}/steps/step-01-init.md`

---

## WORKFLOW OUTPUT

Output file: `{output_folder}/research-trigger-output-{date}.md`

### Frontmatter Template
```yaml
---
workflow: "research-trigger"
date: "YYYY-MM-DD"
user: "{user_name}"
stepsCompleted: [1, 2, 3, 4]
status: "complete"
research_report:
  trigger_reason: "{why research was needed}"
  topics_researched: [list]
  findings: [key findings]
  recommendations: [based on research]
  decision: "proceed" | "warn" | "stop"
---
```

---

## RESEARCH TRIGGERS

This workflow is triggered when:

1. **Tech Choice Needed**
   - New library/framework selection
   - Architecture pattern decisions
   - Technology stack changes

2. **Trade-Off Analysis**
   - Performance vs maintainability
   - Speed vs correctness
   - Simplicity vs flexibility

3. **Best-Practice Validation**
   - Avoiding anti-patterns
   - Following industry standards
   - Preventing "not-the-best-practice" chaos

4. **Architectural Concerns**
   - Breaking changes evaluation
   - Migration complexity assessment
   - Impact analysis

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS
- Research questions answered
- Evidence gathered for decision
- Trade-offs analyzed
- Best practices validated
- Clear recommendation made

### ❌ SYSTEM FAILURE
- Skipping research due to assumptions
- Not validating tech choices
- Missing trade-off analysis
- Ignoring best-practice concerns

**Master Rule**: Research prevents costly mistakes by validating assumptions BEFORE implementation.

---

**Version**: 1.0.0
**Last Updated**: 2026-01-15
**Schema Version**: 1.0.0 (Frontmatter applied)
