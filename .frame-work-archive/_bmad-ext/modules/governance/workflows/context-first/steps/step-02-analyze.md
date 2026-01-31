---
nextStepFile: '{installed_path}/steps/step-03-contextualize.md'
outputFile: '{output_folder}/context-first-output-{date}.md'
workflowName: 'context-first'
---

# Step 2: Analyze

## STEP GOAL

Execute the configured scanners and analyze the codebase to gather context slices.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on analysis and data gathering
- 🚫 FORBIDDEN to skip or optimize scans
- 💾 Update frontmatter when complete

## SEQUENCE OF INSTRUCTIONS

### 1. Report Scan Plan

Display to user:
```
═══════════════════════════════════════════════════════════
RUNNING CONTEXT SCAN
═══════════════════════════════════════════════════════════

Scanners: {domains from step 1}
Depth: {depth from step 1}
Target: {project_root}

This may take a moment...
```

### 2. Execute Scanners

For each scanner in the configured domains:

**Pattern**:
1. Load scanner definition from `_bmad-ext/modules/governance/scanners/{scanner}.md`
2. Execute scan according to depth level
3. Collect results

**Depth Levels**:
- **Shallow**: Basic structure, key files only
- **Medium**: Structure + relationships, moderate detail
- **Deep**: Full trace, all relationships, complete analysis

### 3. Collect Context Slices

For each scanner, document:
```yaml
{scanner_name}_results:
  files_scanned: [list of files]
  findings: [key findings]
  relationships: [related components]
  issues: [potential issues found]
  recommendations: [if any]
```

### 4. Update Output Document

Append to `{outputFile}`:

```markdown
## Scan Analysis Results

### Scanner Results

{For each scanner: detailed findings}

### Context Slices Identified

{List of files/domains to include in transformed prompt}

### Relationships Discovered

{Key relationships between components}
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2]
scan_results:
  scanners_run: [list of scanners executed]
  files_analyzed: [count]
  findings_count: [count]
```

### 5. Present Analysis Summary

Display summary to user:
```
═══════════════════════════════════════════════════════════
SCAN COMPLETE
═══════════════════════════════════════════════════════════

Scanners Run: {count}
Files Analyzed: {count}
Key Findings: {count}
Context Slices: {count}

Ready to contextualize prompt.

[C] Continue to Step 3: Contextualize
[R] Review detailed results
```

---

## SUCCESS METRICS

- ✅ All configured scanners executed
- ✅ Context slices identified
- ✅ Output document updated with findings
- ✅ Frontmatter updated with stepsCompleted: [1, 2]

## FAILURE METRICS

- ❌ Skipped configured scanners
- ❌ Not updating output document
- ❌ Missing frontmatter update

**ONLY WHEN complete, load `{nextStepFile}`**
