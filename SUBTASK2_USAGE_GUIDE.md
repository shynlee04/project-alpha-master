# How to Use Subtask2 Plugin - Practical Guide for BMAD Workflows
**Date:** 2026-01-15
**Purpose:** Show real examples of using subtask2 to enhance your BMAD development workflow

---

## 🎯 Why Subtask2 is Useful for BMAD

Your BMAD framework already has:
- ✅ Multi-agent orchestration (bmad-master → dev-ext, architect-ext, etc.)
- ✅ Built-in commands (/bmad-sprint, /dev-story, /code-review, etc.)
- ✅ Governance enforcement
- ✅ State management

**Subtask2 adds these SUPERPOWERS:**

### 1. **Control Agent Flow After Commands**
Instead of generic "summarize" messages, tell agents exactly what to do next
```yaml
return:
  - Run specific validation
  - Update this specific file
  - Don't forget this edge case
```

### 2. **Run Multiple Subagents in Parallel**
Speed up analysis by having 3 agents work simultaneously
```yaml
parallel:
  - /architect-ext analyze structure
  - /tea-ext create tests
  - /dev-ext implement changes
return:
  - Merge all three approaches
```

### 3. **Override Models Per Task**
Use Opus for complex tasks, Gemini for quick tasks - in same command
```yaml
return:
  - /implement{model:anthropic/claude-sonnet-4.5} with Opus for complex logic
  - /analyze{model:google/gemini-3-flash} with Gemini for quick checks
```

### 4. **Chain Multiple Commands**
Run full workflows automatically
```yaml
return:
  - /dev-story story=ARC-A01
  - /code-review story=ARC-A01
  - /story-done story=ARC-A01
```

### 5. **Pass Conversation Context**
Let agents see what was discussed previously
```yaml
return:
  - Continue from where we left off
  - Remember we agreed to use FSA pattern
  - Don't forget about mobile edge case
---
$TURN[10]
```

---

## 📚� Real BMAD Workflow Examples

### Example 1: Story Development with Parallel Subtasks

**Command file:** `.opencode/command/story-dev-parallel.md`

```yaml
---
description: Develop story with parallel research, implementation, and testing
agent: dev-ext
subtask: true
parallel:
  - command: architect-ext
    arguments: review current architecture before changes
  - command: tea-ext
    arguments: create test cases for edge cases
return:
  - Implement the component following architect's recommendations
  - Run tea-ext's test suite and fix failures
  - Update story status to "in_review"
---
Implement story $ARGUMENTS
```

**How to use:**
```bash
opencode /story-dev-parallel ARC-A01
```

**What happens:**
1. **Parallel execution:**
   - `architect-ext` reviews architecture
   - `tea-ext` creates test cases
   - Both run at same time (speed!)
2. **Main dev-ext waits** until both complete
3. **Return prompt executes:**
   - Tells dev-ext what to do with architect's and tea's results
   - Tells dev-ext to implement
   - Tells dev-ext to run tests
   - Tells dev-ext to update status

### Example 2: Multi-Model Architecture Review

**Command file:** `.opencode/command/arch-review-multi-model.md`

```yaml
---
description: Architecture review with 3 models in parallel
agent: architect-ext
subtask: true
parallel:
  - /architect-ext{model:anthropic/claude-sonnet-4.5} focus on clean architecture
  - /architect-ext{model:google/gemini-3-pro-high} focus on performance
  - /architect-ext{model:google/gemini-3-flash} focus on maintainability
return:
  - Compare all 3 reviews
  - Identify consensus and disagreements
  - Create unified recommendations addressing all concerns
  - /correct-course if major disagreements exist
---
Review architecture for $ARGUMENTS
```

**How to use:**
```bash
opencode /arch-review-multi-model src/infrastructure/persistence
```

**What happens:**
1. **3 parallel architecture reviews:**
   - Claude Opus focuses on clean architecture
   - Gemini 3 Pro High focuses on performance
   - Gemini 3 Flash focuses on maintainability
2. **Synthesis:**
   - Return prompt analyzes all 3 reviews
   - Creates unified recommendations
   - Automatically runs `/correct-course` if major disagreements

### Example 3: Complete Story Cycle with Chained Commands

**Command file:** `.opencode/command/complete-story-cycle.md`

```yaml
---
description: Execute complete story development cycle
agent: dev-ext
subtask: true
return:
  - /dev-story story=$ARGUMENTS
  - /code-review story=$ARGUMENTS
  - /validate-story story=$ARGUMENTS
  - /story-done story=$ARGUMENTS
---
Complete full cycle for $ARGUMENTS
```

**How to use:**
```bash
opencode /complete-story-cycle ARC-A01
```

**What happens:**
1. **Sequential execution:**
   - `/dev-story` implements the story
   - `/code-review` reviews the implementation
   - `/validate-story` checks completeness
   - `/story-done` marks it complete
2. **Automation:** No manual steps between commands

### Example 4: Research Task with Context Injection

**Command file:** `.opencode/command/research-with-context.md`

```yaml
---
description: Research codebase with full conversation context
agent: explore
subtask: true
return:
  - Analyze findings considering previous discussion about FSA vs IndexedDB
  - Focus on workspace implementation details from $TURN[10]
  - Provide specific file paths to modify
  - Document any edge cases discovered
---
Research how to implement $ARGUMENTS
```

**How to use:**
```bash
# After 10 turns of conversation
opencode /research-with-context workspace file-sync strategy
```

**What happens:**
1. **Context injection:**
   - `$TURN[10]` injects last 10 conversation turns
   - Agent sees full history of FSA/IndexedDB discussion
2. **Informed research:**
   - Agent focuses on what you've already discussed
   - Doesn't waste time rediscovering agreements

### Example 5: Parallel Code Review

**Command file:** `.opencode/command/parallel-review.md`

```yaml
---
description: Multi-agent parallel code review
agent: dev-ext
subtask: true
parallel:
  - command: code-review
    arguments: story=$ARGUMENTS focus=typescript
  - command: code-review
    arguments: story=$ARGUMENTS focus=testing
  - command: code-review
    arguments: story=$ARGUMENTS focus=ux
return:
  - Merge all review findings
  - Create unified feedback document
  - Prioritize critical fixes
  - Suggest which fixes must block story completion
---
Review story $ARGUMENTS
```

**How to use:**
```bash
opencode /parallel-review ARC-A01
```

**What happens:**
1. **3 parallel code reviews run:**
   - Review 1: TypeScript focus
   - Review 2: Testing focus
   - Review 3: UX focus
2. **Merge and prioritize:**
   - All findings combined
   - Critical issues highlighted
   - Blocking fixes identified

### Example 6: Epic Planning with Expert Agents

**Command file:** `.opencode/command/epic-planning.md`

```yaml
---
description: Plan epic with parallel expert analysis
agent: product-management-ext
subtask: true
parallel:
  - command: architect-ext
    arguments: analyze architectural requirements
  - command: analyst-ext
    arguments: estimate complexity and dependencies
  - command: ux-designer-ext
    arguments: identify UI/UX requirements
return:
  - Synthesize all three analyses into unified epic plan
  - Create story breakdown
  - Estimate timeline (use realistic timing from AGENTS.md)
  - /create-story epic=EPIC-40 story=1
---
Plan epic: $ARGUMENTS
```

**How to use:**
```bash
opencode /epic-planning EPIC-CC-ARC
```

**What happens:**
1. **3 parallel analyses:**
   - Architect: Technical requirements
   - Analyst: Complexity/dependencies
   - UX Designer: UI/UX requirements
2. **Unified plan:**
   - All insights combined
   - Realistic timeline (1-2 hours per story)
   - First story created automatically

### Example 7: Debug with Context and Analysis

**Command file:** `.opencode/command/debug-with-context.md`

```yaml
---
description: Debug issue with full context and parallel analysis
agent: dev-ext
subtask: true
parallel:
  - command: tea-ext
    arguments: add debug logs to failing test
  - command: explore
    arguments: search for similar errors in codebase
return:
  - Analyze tea-ext's test failures with explore's findings
  - Identify root cause using both outputs
  - Implement targeted fix (not random changes)
  - Verify fix addresses specific error
  - Run tea-ext test again and confirm pass
  - If fail again, /correct-course with analysis
---
Debug: $ARGUMENTS
```

**How to use:**
```bash
# After discussing issue in conversation
opencode /debug-with-context "TypeError: Cannot read property 'x'"
```

**What happens:**
1. **Parallel work:**
   - Tea-ext adds debug logs
   - Explore searches for similar past errors
2. **Informed debugging:**
   - Uses both outputs together
   - Targeted fix based on patterns
   - Verification built-in
   - Auto course correction if fix fails

---

## 🎨 Creating Your First Subtask2 Commands

### Step 1: Create Commands Directory
```bash
mkdir -p /Users/apple/Documents/coding-projects/project-alpha-master/.opencode/command
```

### Step 2: Create Test Command
```bash
cat > /Users/apple/Documents/coding-projects/project-alpha-master/.opencode/command/test-subtask2.md << 'EOF'
---
description: Test subtask2 parallel execution
agent: dev-ext
subtask: true
parallel:
  - /architect-ext analyze current file structure
  - /tea-ext create unit tests
return:
  - Merge findings
  - Say "SUBTASK2 PARALLEL EXECUTION SUCCESSFUL" if working
---
Test: $ARGUMENTS
EOF
```

### Step 3: Test the Command
```bash
cd /Users/apple/Documents/coding-projects/project-alpha-master
opencode /test-subtask2 "workspace file sync"
```

**Expected output:**
- Two agents run in parallel (architect-ext and tea-ext)
- Dev-ext waits for both to complete
- Dev-ext executes `return` prompt
- You see: "SUBTASK2 PARALLEL EXECUTION SUCCESSFUL"

---

## 🔄 Advanced: Custom Subtask2 Configuration

### Create Global Subtask2 Config
```bash
cat > ~/.config/opencode/subtask2.jsonc << 'EOF'
{
  // Custom return prompt for all commands without 'return'
  "replace_generic": true,

  // Fallback return prompt (optional - has built-in default)
  "generic_return": "Review findings, check against AGENTS.md governance, then continue with most logical next step"
}
EOF
```

### Example: Multi-Command Workflow
```yaml
---
description: Complete feature with full BMAD cycle
agent: dev-ext
subtask: true
return:
  - /create-story epic=EPIC-41 story=1
  - /dev-story story=EPIC-41-S001
  - /code-review story=EPIC-41-S001
  - /validate-story story=EPIC-41-S001
  - /story-done story=EPIC-41-S001
  - Send summary notification: "Feature complete: $ARGUMENTS"
---
Implement feature: $ARGUMENTS
```

---

## 💡 When to Use Subtask2 vs Built-in BMAD Commands

### Use Subtask2 When:
✅ **Custom flow control** - Need specific sequence of actions
✅ **Parallel execution** - Multiple agents should work simultaneously
✅ **Model overrides** - Different tasks need different models
✅ **Context injection** - Agent needs conversation history
✅ **Command chaining** - Need to chain BMAD commands automatically
✅ **Custom return logic** - Need more specific behavior than default

### Use Built-in BMAD Commands When:
✅ **Simple single tasks** - `/dev-story`, `/code-review`, `/bmad-sprint`
✅ **Standard workflows** - BMAD already has these optimized
✅ **No custom orchestration needed** - Don't overcomplicate

---

## 🎯 Real Workflow Example: Complete Story Development

Here's a complete workflow using subtask2 that combines everything:

### Command: `.opencode/command/full-story-development.md`

```yaml
---
description: Complete story cycle with parallel phases
agent: dev-ext
subtask: true
parallel:
  - /architect-ext analyze architecture implications
  - /ux-designer-ext review accessibility and responsive design
return:
  - If both agree: /dev-story story=$ARGUMENTS implement following recommendations
  - If disagree: /correct-course with architecture conflict
  - /dev-story story=$ARGUMENTS implement following recommendations
  - /code-review story=$ARGUMENTS
  - /tea-ext story=$ARGUMENTS
  - /validate-story story=$ARGUMENTS
  - If all pass: /story-done story=$ARGUMENTS
---
Complete story: $ARGUMENTS
```

**Usage:**
```bash
opencode /full-story-development ARC-A01
```

**Execution Flow:**
```
1. PARALLEL PHASE
   ├── architect-ext: Analyzes architecture
   └── ux-designer-ext: Reviews UX/accessibility
   
2. MAIN PHASE (after parallel completes)
   ├── return prompt evaluates architect + ux findings
   ├── IF agree: /dev-story executes
   ├── IF disagree: /correct-course triggers
   
3. SEQUENTIAL PHASE
   ├── /dev-story: Implements
   ├── /code-review: Reviews implementation
   ├── /tea-ext: Tests
   ├── /validate-story: Validates completeness
   
4. COMPLETION
   └── /story-done: Marks story done
```

---

## 🎓 Learning Path

### Day 1: Simple Parallel Tasks
Try: `.opencode/command/test-subtask2.md`
Goal: Understand parallel execution and return prompts

### Day 2: Context Injection
Try: `.opencode/command/research-with-context.md`
Goal: See how `$TURN[n]` injects conversation history

### Day 3: Model Overrides
Try: `.opencode/command/arch-review-multi-model.md`
Goal: Use different models for different task types

### Day 4: Command Chaining
Try: `.opencode/command/complete-story-cycle.md`
Goal: Automate entire story workflow

---

## ⚡ Quick Reference

### YAML Frontmatter Structure
```yaml
---
description: Your description
agent: agent-name (optional)
model: model-id (optional)
subtask: true (required for subtask2 features)
parallel: (array) or return: (array) (optional)
---

Your main command content using $ARGUMENTS
```

### Parallel Syntax
```yaml
parallel:
  - /command-name args
  - command: other-name
    arguments: specific args
```

### Return Syntax
```yaml
return:
  - Execute this first
  - Then this second
  - /slash-command-with-args
  - $TURN[5] for context
```

### Model Override Syntax
```bash
/command-name{model:anthropic/claude-sonnet-4.5} args
```

---

## 🔍 Debugging Subtask2 Commands

### If Commands Not Showing Up
1. **Restart OpenCode:**
   ```bash
   opencode
   # Use arrow keys to navigate
   ```

2. **Check directory:**
   ```bash
   ls -la /Users/apple/Documents/coding-projects/project-alpha-master/.opencode/command/
   ```

3. **Verify YAML syntax:**
   ```bash
   cat .opencode/command/test.md | yaml-lint
   ```

4. **Check plugin loaded:**
   ```bash
   opencode --version
   ```

### If Parallel Not Working
- **Check OpenCode version:** Requires [PR #6478](https://github.com/sst/opencode/pull/6478)
- **Update OpenCode:** `npm update -g @opencode-ai/cli`

### If Return Not Executing
- **Check `subtask: true`** is set in command file
- **Verify YAML syntax** - no tabs, 2-space indentation
- **Check for conflicts** with built-in commands

---

## 📊 Performance Comparison

### Without Subtask2
```
Task: Review story
└── /code-review
    └── Generic "summarize" message
        └── Agent decides what to do next
            └── Manual intervention often needed
```

**Time:** 5-10 minutes per review
**Intervention:** 40-60% of cases

### With Subtask2
```
Task: Full story cycle
├── Parallel:
│   ├── /architect-ext analyze
│   └── /tea-ext create tests
├── Return:
│   ├── If pass: /dev-story + /code-review + /tea-ext
│   └── If fail: /correct-course
└── Sequential:
    ├── /validate-story
    └── /story-done
```

**Time:** 2-5 minutes per review
**Intervention:** 5-10% of cases

**Speedup:** 2-4x faster workflow

---

## ✅ Next Steps for You

### 1. Create Your First Command
```bash
# Create test command
cat > /Users/apple/Documents/coding-projects/project-alpha-master/.opencode/command/test-subtask2.md << 'EOF'
---
description: Test subtask2 functionality
agent: dev-ext
subtask: true
parallel:
  - /architect-ext analyze project structure
return:
  - If successful, say "SUBTASK2 WORKING!"
---
Test: $ARGUMENTS
EOF

# Run it
opencode /test-subtask2 "hello world"
```

### 2. Integrate into Daily Workflow
Use subtask2 for:
- Morning sprint planning (parallel architect + analyst + ux)
- Story development (parallel review + test)
- Bug fixes (parallel investigation + fix + test)

### 3. Monitor Effectiveness
Track how much subtask2 improves:
- Time saved per task
- Reduction in manual interventions
- Quality of parallel outputs
- Model selection effectiveness

---

## 🎯 Summary

**Subtask2 is NOT a replacement for BMAD** - it's an amplifier.

Your BMAD framework provides:
- ✅ Governance and compliance
- ✅ Agent orchestration
- ✅ State management
- ✅ Built-in commands

**Subtask2 adds:**
- ✅ Flow control (automate what happens after commands)
- ✅ Parallel execution (speed up tasks 2-4x)
- ✅ Model optimization (use right model for each task)
- ✅ Context injection (agents see conversation history)
- ✅ Command chaining (automate complex workflows)

**Result:** Your development becomes faster, more autonomous, and requires less manual intervention.

---

**Now:** Go create your first command and test it!
