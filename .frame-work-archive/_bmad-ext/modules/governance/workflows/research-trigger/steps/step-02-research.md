---
nextStepFile: '{installed_path}/steps/step-03-analyze.md'
outputFile: '{output_folder}/research-trigger-output-{date}.md'
workflowName: 'research-trigger'
---

# Step 2: Research

## STEP GOAL

Conduct internet-based research to answer the defined questions.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on gathering information
- 🚫 FORBIDDEN to use assumptions or outdated knowledge
- 💾 Update output with findings

## SEQUENCE OF INSTRUCTIONS

### 1. Report Research Plan

Display:
```
═══════════════════════════════════════════════════════════
CONDUCTING RESEARCH
═══════════════════════════════════════════════════════════

Topics: {count from step 1}
Sources: Web search, official docs, community resources

This may take several minutes...
```

### 2. Research Strategy

For each topic:
1. **Web Search**: Use `WebSearch` to find current information
2. **Documentation**: Use `WebFetch` to read official docs
3. **Community**: Check community forums (if needed)
4. **Evidence**: Gather sources and dates

### 3. Conduct Research

For each research topic, document:

**Tech Choice Research**:
```yaml
{topic_name}:
  options:
    - name: "{option A}"
      pros: [list advantages]
      cons: [list disadvantages]
      use_case: "{when to use}"
      sources: [URLs, dates]
    - name: "{option B}"
      pros: [list advantages]
      cons: [list disadvantages]
      use_case: "{when to use}"
      sources: [URLs, dates]
  recommendation: "{which option and why}"
```

**Trade-Off Analysis**:
```yaml
{trade_off_topic}:
  factors:
    - factor: "{name}"
      weight: "high|medium|low"
      analysis: "{findings}"
  decision: "{how to balance}"
  sources: [URLs, dates]
```

**Best-Practice Validation**:
```yaml
{practice_to_validate}:
  current_best_practice: "{what industry recommends}"
  alignment: "{aligned|partial|conflicting}"
  concerns: [if any]
  sources: [URLs, dates]
```

### 4. Update Output Document

Append to `{outputFile}`:

```markdown
## Research Findings

### {Topic 1}
{Detailed findings}

### {Topic 2}
{Detailed findings}
...
```

Update frontmatter:
```yaml
stepsCompleted: [1, 2]
research_findings:
  topics_researched: [count]
  sources_consulted: [count]
  evidence_gathered: true
```

### 5. Present Research Summary

```
═══════════════════════════════════════════════════════════
RESEARCH COMPLETE
═══════════════════════════════════════════════════════════

Topics Researched: {count}
Sources Consulted: {count}

[C] Continue to Step 3: Analyze Findings
[R] Review detailed research
```

---

## SUCCESS METRICS

- ✅ All topics researched
- ✅ Current sources consulted (check dates)
- ✅ Evidence gathered with sources
- ✅ Multiple options considered (for tech choices)
- ✅ Output updated

## FAILURE METRICS

- ❌ Using outdated knowledge without verification
- ❌ Not consulting current sources
- ❌ Missing source attribution
- ❌ Single-option analysis

**ONLY WHEN complete, load `{nextStepFile}`**
