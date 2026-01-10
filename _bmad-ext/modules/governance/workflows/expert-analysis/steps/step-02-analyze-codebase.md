---
nextStepFile: '{installed_path}/steps/step-03-compare-approach.md'
outputFile: '{output_folder}/expert-analysis-output-{date}.md'
workflowName: 'expert-analysis'
projectRoot: '{project-root}'
---

# Step 2: Analyze Codebase

## STEP GOAL

Analyze the actual codebase to understand current implementation and identify relevant patterns.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on codebase analysis
- 🚫 FORBIDDEN to make assumptions without reading code
- 💾 Update output document with findings

## SEQUENCE OF INSTRUCTIONS

### 1. Report Analysis Plan

Display:
```
═══════════════════════════════════════════════════════════
CODEBASE ANALYSIS
═══════════════════════════════════════════════════════════

Target Areas: {from context-first}
Analyzing: {project_root}

This involves reading actual code files to understand:
- Current implementation patterns
- Component relationships
- Data flow and state management
- API contracts and schemas
```

### 2. Identify Target Files

Based on context package from context-first, identify specific files to analyze:

**Pattern**:
- For each domain in context package
- Find relevant implementation files
- Read and understand current patterns

**Tools to use**:
- `Glob` - Find files by pattern
- `Grep` - Search for specific patterns
- `Read` - Read file contents

### 3. Analyze Implementation

For each target file, document:
```yaml
{filename}:
  type: component|store|hook|util|api
  purpose: {what it does}
  patterns: {patterns used}
  dependencies: [imports/uses]
  state_management: {if applicable}
  api_contracts: [if applicable]
  issues: [any observed issues]
```

### 4. Identify Relationships

Document how files relate to each other:
```yaml
relationships:
  - from: {file}
    to: {file}
    type: imports|uses|extends|provides
  - ...
```

### 5. Update Output Document

Append to `{outputFile}`:

```markdown
## Codebase Analysis Results

### Files Analyzed
{List of files with summaries}

### Patterns Observed
{Key patterns found in codebase}

### Relationships Mapped
{Component relationships}

### Potential Issues
{Any issues observed during analysis}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2]
codebase_analysis:
  files_analyzed: [count]
  patterns_found: [list]
  relationships_mapped: [count]
```

### 6. Present Summary

```
═══════════════════════════════════════════════════════════
ANALYSIS COMPLETE
═══════════════════════════════════════════════════════════

Files Analyzed: {count}
Patterns Found: {count}
Relationships Mapped: {count}

[C] Continue to Step 3: Compare Approach
[R] Review detailed findings
```

---

## SUCCESS METRICS

- ✅ Target files identified from context package
- ✅ Actual code read and analyzed
- ✅ Patterns documented
- ✅ Relationships mapped
- ✅ Output updated

## FAILURE METRICS

- ❌ Assuming patterns without reading code
- ❌ Skipping relationship mapping
- ❌ Not updating output document

**ONLY WHEN complete, load `{nextStepFile}`**
