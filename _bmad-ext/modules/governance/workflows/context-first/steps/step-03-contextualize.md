---
nextStepFile: '{installed_path}/steps/step-04-transform.md'
outputFile: '{output_folder}/context-first-output-{date}.md'
workflowName: 'context-first'
---

# Step 3: Contextualize

## STEP GOAL

Transform the user's original prompt by injecting relevant context slices to create an improved, context-rich prompt.

## MANDATORY EXECUTION RULES

- 📖 READ COMPLETELY before execution
- 🎯 Focus ONLY on prompt transformation
- 🚫 FORBIDDEN to change user's core intent
- 💾 Update frontmatter when complete

## SEQUENCE OF INSTRUCTIONS

### 1. Present Original User Intent

Display to user:
```
═══════════════════════════════════════════════════════════
PROMPT TRANSFORMATION
═══════════════════════════════════════════════════════════

Original Request:
{user_intent from Step 1}

Context Slices Available:
{list from Step 2}
```

### 2. Gather Context Details

For each context slice, gather:
- **File path**: Full path to relevant file
- **description**: Why this context is relevant
- **Key content**: Brief summary of what it contains
- **Relationships**: How it connects to the request

### 3. Create Context Package

Structure context as:
```yaml
context_package:
  user_intent: "{original request}"
  depth: {depth level}
  primary_context:
    - file: {path}
      description: {why relevant}
      summary: {brief}
  secondary_context:
    - file: {path}
      description: {why relevant}
      summary: {brief}
  relationships:
    - {from} -> {to}: {relationship type}
  warnings:
    - {potential issues to watch}
```

### 4. Draft Transformed Prompt

Create transformed prompt that:
1. **Preserves user's original intent**
2. **Injects relevant context at the beginning**
3. **Provides structured background**
4. **Includes warnings/cautions discovered**

**Template**:
```markdown
# Context: {brief description}

## Background
{Summarize context gathered from scan}

## Relevant Files
{List key files with their description}

## Relationships
{Describe key relationships found}

## Warnings
{Any issues or cautions from scan}

---

# Original Request
{User's original request here}

## Additional Context Needed
{Any questions or clarifications needed}
```

### 5. Present Transformed Prompt

Display the transformed prompt and ask for user feedback:
```
═══════════════════════════════════════════════════════════
TRANSFORMED PROMPT READY
═══════════════════════════════════════════════════════════

{Display transformed prompt}

Options:
[A] Accept and proceed
[E] Edit transformed prompt
[R] Regenerate with different emphasis
```

### 6. Update Output Document

Append transformed prompt to output file.

Update frontmatter:
```yaml
stepsCompleted: [1, 2, 3]
transformed_prompt: {path to transformed prompt in output}
context_package:
  primary_files: [count]
  secondary_files: [count]
  relationships: [count]
```

---

## SUCCESS METRICS

- ✅ User's original intent preserved
- ✅ Relevant context injected
- ✅ Warnings included from scan
- ✅ User accepts transformed prompt
- ✅ Frontmatter updated

## FAILURE METRICS

- ❌ Changed user's core intent
- ❌ Missing relevant context
- ❌ No user confirmation
- ❌ Not updating output document

**ONLY WHEN user accepts, load `{nextStepFile}`**
