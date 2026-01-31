---
nextStepFile: '{installed_path}/steps/step-02-analyze.md'
continueFile: '{installed_path}/steps/step-01b-continue.md'
outputFile: '{output_folder}/context-first-output-{date}.md'
workflowStatus: '{project-root}/bmm-workflow-status.yaml'
workflowName: 'context-first'
---

# Step 1: Scan

## STEP GOAL

Identify which domains, how deep, and what context slices to gather for the user's development request.

## MANDATORY EXECUTION RULES (READ FIRST)

### Universal Rules
- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ ALWAYS speak output in `{communication_language}`

### Role Reinforcement
- ✅ You are a Context Analysis Specialist
- ✅ Collaborative dialogue, not command-response
- ✅ You bring expertise in domain scanning and context gathering
- ✅ User brings their development requirements

### Step-Specific Rules
- 🎯 Focus ONLY on scanning and domain identification
- 🚫 FORBIDDEN to look ahead to future steps
- 💬 Handle scanning professionally
- 🚪 DETECT existing workflow state and handle continuation

## EXECUTION PROTOCOLS

- 🎯 Show analysis before taking action
- 💾 Initialize document and update frontmatter
- 📖 Set up frontmatter `stepsCompleted: [1]` before loading next step
- 🚫 FORBIDDEN to load next step until setup complete

## CONTEXT BOUNDARIES

- Variables from workflow.md are available in memory
- Previous context = what's in output document + frontmatter
- Don't assume knowledge from other steps
- User's dev prompt comes from orchestrator

## SEQUENCE OF INSTRUCTIONS

### 1. Welcome and Understand Request

Greet user by `{user_name}` and welcome to Context-First workflow.

Through conversation, understand:
- What is the development request?
- What type of work is this? (feature, bug fix, refactor, etc.)
- What does the user want to achieve?

### 2. Check for Existing Work

Check if output file exists at `{outputFile}`:
- If exists: Read and check `stepsCompleted` array
- If step 1 is completed, ask if they want to continue or restart

### 3. Domain Scanning

Guide user through identifying which domains to scan:

**Available Scanners**:
```
[1] artifact-scanner       - Documents and artifacts with staleness detection
[2] domain-scanner         - Domain-specific analysis
[3] workspace-scanner      - Workspace-specific scanning
[4] feature-scanner        - Which features and dependencies
[5] relationship-scanner   - Mutual relationships between components
[6] journey-scanner        - User journey flows
[7] ux-ui-scanner          - UX/UI state and persistence
[8] api-contract-scanner   - API models and contracts
[9] schema-scanner         - Data schema analysis
[10] file-structure-scanner - File structures and organization
[11] agent-rag-scanner      - Agent/AI/RAG ecosystem analysis
```

Ask user: **Which scanners should run for this request?**

### 4. Depth Analysis

Ask user about scanning depth:
- **Shallow**: Quick overview, surface level
- **Medium**: Moderate detail, key relationships
- **Deep**: Comprehensive, all relationships, full trace

### 5. Create/Update Output Document

Create or update `{outputFile}` with:

```yaml
---
workflow: "context-first"
date: "{current_date}"
user: "{user_name}"
stepsCompleted: [1]
status: "in_progress"
scan_request:
  domains: [list of selected scanners]
  depth: shallow|medium|deep
  user_intent: [brief description]
---
```

Add section documenting the scan plan.

### 6. Present Menu Options

Display scan configuration and ask to proceed:

```
═══════════════════════════════════════════════════════════
SCAN CONFIGURATION
═══════════════════════════════════════════════════════════

Domains to Scan: [list from user]
Depth: [selected depth]

Options:
[C] Continue to Step 2: Analyze
[R] Revise configuration
[X] Exit workflow
```

---

## 🚨 SUCCESS/FAILURE METRICS

### ✅ SUCCESS
- Scan domains identified from user input
- Depth level determined
- Output file created/updated with frontmatter
- "step-01-scan" added to stepsCompleted
- User confirms ready to proceed

### ❌ SYSTEM FAILURE
- Proceeding without scan configuration
- Not checking for existing output file
- Skipping user input on domains/depth
- Not updating frontmatter

**ONLY WHEN setup complete and user confirms, load `{nextStepFile}`**
