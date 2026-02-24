BMAD Framework Consolidation Plan
ID: BMAD-CONSOLIDATE-2026-01-07 Status: DRAFT - Pending Approval Coverage: Full - All requirements addressed in strategic phases
Executive Summary
Current State Analysis (from 3 parallel Explore agents):
40 agents in .claude/ with 18 missing YAML frontmatter
32 skill directories with 1 empty (bmad-orchestrator) and 14 orphaned
10 modules in _bmad/ with 4 lacking manifests
2 confirmed duplicates (file-sync-specialist, workspace-architect)
3 missing workflows referenced but not created
Target State:
<8 active agent profiles (from 50+ scattered agents)
~15 consolidated skills (from 40+)
4 strategic modules (from 10+)
100% Claude Code integration (hooks, skills, commands working)
Self-regulating BMAD-Core-Master loops
Approach: 5 Phases with nested cycles, each with validation gates before proceeding.
Phase 1: Platform Integration Foundation
Objective: Fix Claude Code platform integration (hooks, skills, commands) Dependencies: None (can start immediately)
Cycle 1.1: Hook Rebuild (Hybrid Approach)
Input: .bk hook files + official Claude Code docs Output: 5 working hooks with JSON output
Hook	Source	Action	Validation
daily-governance-audit.sh	.bk reference + rebuild	Add JSON output, optimize execution	bash .claude/hooks/daily-governance-audit.sh | jq .
pre-execution.sh	.bk reference + rebuild	Add JSON output, optimize execution	bash .claude/hooks/pre-execution.sh | jq .
ralph-loop.sh	.bk reference + rebuild	Already has JSON, validate	bash .claude/hooks/ralph-loop.sh | jq .
context-bridge.sh	.bk reference + rebuild	Add JSON output	bash .claude/hooks/context-bridge.sh | jq .
context-check.sh	.bk reference + rebuild	Add JSON output	bash .claude/hooks/context-check.sh | jq .
Steps:
Research official Claude Code hooks docs via MCP (Context7/DeepWiki)
Read each .bk file to understand intended functionality
Rebuild with:
Proper JSON output ({"decision": "...", "systemMessage": "..."})
Resource efficiency (background process management)
Error handling with silent failures
Test each hook individually
Register in ~/.claude/settings.json
Cycle 1.2: Skill Frontmatter Validation
Output: All skills with proper YAML triggers Skills needing YAML frontmatter:
state-consolidation.md - Add name/description/triggers
systematic-debugging/CREATION-LOG.md - Remove or add frontmatter
writing-skills/examples/CLAUDE_MD_TESTING.md - Remove or add frontmatter
writing-skills/persuasion-principles.md - Remove or add frontmatter
Empty directory to fix:
bmad-orchestrator/ - Create SKILL.md with orchestrator triggers
Steps:
Add proper YAML frontmatter to each:

---
name: skill-name
description: This skill should be used when [trigger phrases]
version: 1.0.0
---
Validate with Claude Code skill activation test
Remove non-skill files from skill directories
Cycle 1.3: Orphaned Skills Archive
Output: 14 orphaned skills archived, clean skill tree Orphaned skills to archive (move to .claude/.archive/skills/):
brainstorming/
dispatching-parallel-agents/
executing-plans/
finishing-a-development-branch/
receiving-code-review/
requesting-code-review/
subagent-driven-development/
systematic-debugging/
test-driven-development/
using-git-worktrees/
using-superpowers/
verification-before-completion/
writing-plans/
writing-skills/
Note: These will be restored IF their functionality is unique and needed. For now, archive to reduce context load.
Cycle 1.4: Command-to-Workflow Mapping Validation
Output: All commands point to existing workflows/agents Validation Steps:
For each command in .claude/commands/bmad/**/*.md
Extract referenced workflow/agent path
Verify file exists
Remove or fix commands pointing to non-existent targets
Update unified-agent-registry.yaml
Phase 2: Agent Consolidation
Objective: Reduce 50+ agents to <8 active profiles Dependencies: Phase 1 complete
Cycle 2.1: Remove Duplicates
Output: 2 duplicate files removed
Duplicate	Keep	Delete
file-sync-specialist	.claude/agents/file-sync-specialist.md (186 lines)	.claude/agents/arc-agents/file-sync-specialist.md (36 lines)
workspace-architect	.claude/agents/workspace-architect.md (89 lines)	.claude/agents/arc-agents/workspace-architect.md (39 lines)
Cycle 2.2: Consolidate Deep-Scan Agents
Output: 1 unified analyzer agent (from 11 deep-scan agents) Consolidation strategy:
Merge all deep-scan-*-scanner.md agents into architecture-remediation-orchestrator.md
Add "Scanner Capabilities" section with sub-modes:
RAG Scanner
Architecture Scanner
State Scanner
Security Scanner
Performance Scanner
Persistence Scanner
Types Scanner
UX Scanner
Workspace Scanner
Agent-RAG Scanner
Evidence Synthesizer
Cycle 2.3: Consolidate BMAD Subdirectories
Output: 3 consolidated profiles (from 16 agents in subdirectories)
From	To	New Profile
bmad-analysis/ (4 agents)	Unified analyzer profile	.claude/agents/analyzer.md
bmad-research/ (2 agents)	Merged into analyzer	
bmad-planning/ (7 agents)	Unified planner profile	.claude/agents/planner.md
bmad-review/ (3 agents)	Unified reviewer profile	.claude/agents/reviewer.md
Cycle 2.4: Add YAML Frontmatter to All Agents
Output: 18 agents with proper YAML frontmatter Agents needing frontmatter:
All deep-scan agents (until consolidated)
agent-profile-loader.md
architecture-remediation-orchestrator.md
component-splitter.md
store-refactorer-loader.md
Root file-sync-specialist.md
Root workspace-architect.md
Cycle 2.5: Create Missing Workflows
Output: 3 missing workflows created Missing workflows (referenced but not existent):
/bmad-bmm-workflows-knowledge-sync-strategy
/bmad-bmm-workflows-notes-sync-strategy
/bmad-bmm-workflows-workspace-file-system-e2e
Action: Create these in _bmad/modules/sprint-execution/workflows/ or appropriate module.
Phase 3: Module Harmonization
Objective: Align _bmad modules with .claude structure, eliminate duplication Dependencies: Phase 2 complete
Cycle 3.1: Module Consolidation (10 → 4)
Output: 4 strategic modules
From	To	description
core-governance/, governance/, asgl/	Module A: Orchestration Core	Loop coordination, governance, context management
architecture-remediation/, architecture-refactoring/, quality/	Module B: Architecture	Deep scan, remediation, refactoring, quality scanners
sprint-execution/, BMM agents	Module C: Sprint Execution	Development workflows, stories, implementation
integration-testing/	Module D: Quality	Review, testing, validation, cross-platform sync
Cycle 3.2: Agent Profile Finalization (8 profiles)
Output: <8 active agent profiles with clear triggers
#	Profile	Consolidates	Trigger Phrases
1	orchestrator	bmad-master, asgl agents	"run BMAD", "autonomous loop", "coordinate", "orchestrate"
2	architect	architect, workspace-architect, arc-agents	"design", "architecture", "ADR", "system design"
3	analyzer	all deep-scan-*, bmad-analysis, bmad-research	"analyze", "scan", "diagnose", "health check", "investigate"
4	implementer	dev, implementer, developer agents	"implement", "build", "code", "feature", "develop"
5	refactorer	store-refactorer, component-splitter	"split", "refactor", "god store", "normalize", "eliminate god"
6	reviewer	all bmad-review, code-reviewer	"review", "code review", "validate", "audit"
7	planner	pm, sm, all bmad-planning	"plan", "sprint", "story", "epic", "backlog"
8	researcher	bmad-research, spec agents, tech-writer	"research", "spec", "document", "investigate"
Cycle 3.3: Update unified-agent-registry.yaml
Output: Clean registry with 8 profiles Location: .claude/config/unified-agent-registry.yaml Content:

version: "2.0.0"
active_profiles:
  - id: orchestrator
    file: ".claude/agents/orchestrator.md"
    triggers: ["run BMAD", "autonomous loop", "coordinate"]
  - id: architect
    file: ".claude/agents/architect.md"
    triggers: ["design", "architecture", "ADR"]
  - id: analyzer
    file: ".claude/agents/analyzer.md"
    triggers: ["analyze", "scan", "diagnose"]
  - id: implementer
    file: ".claude/agents/implementer.md"
    triggers: ["implement", "build", "code"]
  - id: refactorer
    file: ".claude/agents/refactorer.md"
    triggers: ["split", "refactor", "god store"]
  - id: reviewer
    file: ".claude/agents/reviewer.md"
    triggers: ["review", "validate", "audit"]
  - id: planner
    file: ".claude/agents/planner.md"
    triggers: ["plan", "sprint", "story"]
  - id: researcher
    file: ".claude/agents/researcher.md"
    triggers: ["research", "spec", "document"]
Phase 4: BMAD-Core-Master Activation
Objective: Enable self-regulating loops with context filtering Dependencies: Phase 3 complete
Cycle 4.1: Enhance BMAD-Core-Master Agent
Output: Updated bmad-master.md with self-regulation Additions needed:
Context TTL filtering: Ignore artifacts older than 24 hours
Frontmatter parsing: Read only headers before consuming full artifact
Metadata validation: Check status (validated/outdated) before loading
Time-boxing: Trigger deep-investigation if story >30 mins
Loop-within-loop: Sprint loop → Story loop → Task loop
Cycle 4.2: AGENT-STATE.yaml Schema Update
Output: Enhanced schema for handoffs and subagents Add sections:

handoffs:
  pending: []
  completed: []

subagents:
  active: []
  completed: []

context_filtering:
  ttl_hours: 24
  frontmatter_only: true
  metadata_required: true
Cycle 4.3: Create Loop Governance Status Files
Output: YAML files for loop state tracking Files to create:
_bmad/modules/orchestration-core/loop-state.yaml - Sprint-level state
_bmad/modules/orchestration-core/story-state.yaml - Story-level state
_bmad/modules/orchestration-core/context-filter.yaml - TTL rules
Phase 5: Validation & Governance Enforcement
Objective: Verify all changes, update governance docs Dependencies: Phase 4 complete
Cycle 5.1: Hook Validation
Check: All 5 hooks output valid JSON

for hook in .claude/hooks/*.sh; do
  echo "Testing: $hook"
  bash "$hook" 2>/dev/null | jq . > /dev/null && echo "✅ PASS" || echo "❌ FAIL"
done
Cycle 5.2: Agent Registry Validation
Check: All 8 profiles exist and have triggers

for profile in orchestrator architect analyzer implementer refactorer reviewer planner researcher; do
  file=".claude/agents/$profile.md"
  if [[ -f "$file" ]]; then
    grep -q "^name:" "$file" && echo "✅ $profile has frontmatter" || echo "❌ $profile missing frontmatter"
  else
    echo "❌ $profile does not exist"
  fi
done
Cycle 5.3: Skill Registry Validation
Check: All active skills have proper YAML

for skill_dir in .claude/skills/*/; do
  if [[ -f "$skill_dir/SKILL.md" ]]; then
    grep -q "^name:" "$skill_dir/SKILL.md" && echo "✅ $(basename $skill_dir)" || echo "❌ $(basename $skill_dir)"
  fi
done
Cycle 5.4: Command Mapping Validation
Check: All commands point to existing targets

find .claude/commands -name "*.md" -exec grep -l "action:" {} \; | while read cmd; do
  # Extract referenced workflow/agent and verify existence
  # Report any broken references
done
Cycle 5.5: Governance Documentation Update
Output: Updated AGENTS.md, CLAUDE.md Updates:
Add new 8-profile structure to AGENTS.md
Update platform integration section
Document new module structure (4 modules)
Add loop governance documentation
Success Metrics
Metric	Before	After	Target
Active agent profiles	50+	<8	✅ 8
Skill directories	32	~15	✅ Reduced
Duplicate files	~10	0	✅ None
Hooks with JSON	1/5	5/5	✅ 100%
Agents with frontmatter	~50%	100%	✅ All
Modules	10	4	✅ Consolidated
Commands broken	Unknown	0	✅ All valid
Critical Files to Modify
Files to CREATE:
.claude/agents/orchestrator.md
.claude/agents/analyzer.md
.claude/agents/implementer.md
.claude/agents/refactorer.md
.claude/agents/reviewer.md
.claude/agents/planner.md
.claude/agents/researcher.md
.claude/agents/architect.md
.claude/skills/bmad-orchestrator/SKILL.md
.claude/.archive/skills/ (directory for 14 orphaned skills)
_bmad/modules/orchestration-core/loop-state.yaml
Files to MODIFY:
.claude/config/unified-agent-registry.yaml
.claude/AGENT-STATE.yaml
.claude/hooks/daily-governance-audit.sh
.claude/hooks/pre-execution.sh
.claude/hooks/context-bridge.sh
.claude/hooks/context-check.sh
AGENTS.md
_bmad/core/agents/bmad-master.md
Files to DELETE:
.claude/agents/arc-agents/file-sync-specialist.md (duplicate)
.claude/agents/arc-agents/workspace-architect.md (duplicate)
.claude/codetree-for
.claude/codetree-for-analysi-2.mdstree
Execution Order (Sequential)
Phase 1 (Platform Integration) → Foundation for everything else
Phase 2 (Agent Consolidation) → Reduce clutter
Phase 3 (Module Harmonization) → Align _bmad and .claude
Phase 4 (BMAD-Core-Master) → Enable self-regulation
Phase 5 (Validation) → Verify everything works
Rollback Plan
If any phase fails:
Restore from backup (all .bk files available)
Document failure reason
Adjust approach
Retry phase
Status: Ready for execution upon approval Estimated Duration: 4-6 hours across all phases Next Action: Execute Phase 1, Cycle 1.1 (Hook Rebuild)
User approved the plan
Plan Approved! 🎯 Initiating BMAD Framework Consolidation - Full execution with strategic pauses.
Update Todos

Phase 1: Platform Integration Foundation

Cycle 1.1: Hook Rebuild (5 hooks)

Cycle 1.2: Skill Frontmatter Validation

Cycle 1.3: Orphaned Skills Archive (14 skills)

Cycle 1.4: Command Mapping Validation

Phase 2: Agent Consolidation

Phase 3: Module Harmonization

Phase 4: BMAD-Core-Master Activation

Phase 5: Validation & Governance Enforcement
🚀 PHASE 1: Platform Integration Foundation
Cycle 1.1: Hook Rebuild (Hybrid Approach)
First, let me read the backup hook files and research official Claude Code documentation:
Read ralph-loop.sh.bk
Read daily-governance-audit.sh.bk
Read pre-execution.sh.bk
Read context-bridge.sh.bk
Read context-check.sh.bk
Good! I've read all 5 backup hooks. Now let me check the current active hooks (non-.bk versions) and also research the official Claude Code hooks documentation:
Read ralph-loop.sh
Read daily-governance-audit.sh
Read pre-execution.sh
The active hooks don't exist - only the .bk versions are present. Let me check what exists in the hooks directory:
Bash List hooks directory contents
IN
ls -la /Users/apple/Documents/coding-projects/project-alpha-master/.claude/hooks/

OUT
total 152
drwxr-xr-x   9 apple  staff    288 Jan  7 00:50 .
drwxr-xr-x@ 29 apple  staff    928 Jan  7 01:33 ..
-rw-r--r--@  1 apple  staff   6148 Jan  7 00:50 .DS_Store
-rwx--x--x   1 apple  staff   9849 Jan  6 20:12 context-bridge.sh.bk
-rwx--x--x   1 apple  staff   3950 Jan  6 20:12 context-check.sh.bk
-rwx--x--x   1 apple  staff   9185 Jan  6 23:16 daily-governance-audit.sh.bk
-rwx--x--x   1 apple  staff  19803 Jan  6 22:23 pre-execution.sh.bk
-rwx--x--x   1 apple  staff  18116 Jan  6 23:18 ralph-loop.sh.bk
drwxr-xr-x   3 apple  staff     96 Jan  6 20:12 templates
Now I understand. All hooks are disabled (.bk only). Let me also research the official Claude Code hooks documentation and then rebuild the hooks properly:
mcp__web-reader__webReader
IN
{
  "url": "https://code.claude.com/docs/en/hooks",
  "return_format": "markdown"
}
OUT
"{"title":"Hooks reference - Claude Code Docs","description":"This page provides reference documentation for implementing hooks in Claude Code.","url":"https://code.claude.com/docs/en/hooks\",\"content\":\"## Configuration\n\nClaude Code hooks are configured in your settings files:\n\n- ~/.claude/settings.json - User settings\n- .claude/settings.json - Project settings\n- .claude/settings.local.json - Local project settings (not committed)\n- Enterprise managed policy settings\n\n### Structure\n\nHooks are organized by matchers, where each matcher can have multiple hooks:\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"EventName\\\": [\\n      {\\n        \\\"matcher\\\": \\\"ToolPattern\\\",\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"your-command-here\\\"\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n- matcher: Pattern to match tool names, case-sensitive (only applicable for\n  PreToolUse, PermissionRequest, and PostToolUse)\n  - Simple strings match exactly: Write matches only the Write tool\n  - Supports regex: Edit|Write or Notebook.*\n  - Use * to match all tools. You can also use empty string (\\\"\\\") or leave\n    matcher blank.\n- hooks: Array of hooks to execute when the pattern matches\n  - type: Hook execution type - \\\"command\\\" for bash commands or \\\"prompt\\\" for LLM-based evaluation\n  - command: (For type: \\\"command\\\") The bash command to execute (can use $CLAUDE_PROJECT_DIR environment variable)\n  - prompt: (For type: \\\"prompt\\\") The prompt to send to the LLM for evaluation\n  - timeout: (Optional) How long a hook should run, in seconds, before canceling that specific hook\n\nFor events like UserPromptSubmit, Stop, and SubagentStop\nthat don’t use matchers, you can omit the matcher field:\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"UserPromptSubmit\\\": [\\n      {\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"/path/to/prompt-validator.py\\\"\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n### Project-Specific Hook Scripts\n\nYou can use the environment variable CLAUDE_PROJECT_DIR (only available when\nClaude Code spawns the hook command) to reference scripts stored in your project,\nensuring they work regardless of Claude’s current directory:\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"PostToolUse\\\": [\\n      {\\n        \\\"matcher\\\": \\\"Write|Edit\\\",\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"\\\\\\\"$CLAUDE_PROJECT_DIR\\\\\\\"/.claude/hooks/check-style.sh\\\"\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n### Plugin hooks\n\nPlugins can provide hooks that integrate seamlessly with your user and project hooks. Plugin hooks are automatically merged with your configuration when plugins are enabled.\n__How plugin hooks work__:\n\n- Plugin hooks are defined in the plugin’s hooks/hooks.json file or in a file given by a custom path to the hooks field.\n- When a plugin is enabled, its hooks are merged with user and project hooks\n- Multiple hooks from different sources can respond to the same event\n- Plugin hooks use the ${CLAUDE_PLUGIN_ROOT} environment variable to reference plugin files\n\n__Example plugin hook configuration__:\n\n\\n{\\n  \\\"description\\\": \\\"Automatic code formatting\\\",\\n  \\\"hooks\\\": {\\n    \\\"PostToolUse\\\": [\\n      {\\n        \\\"matcher\\\": \\\"Write|Edit\\\",\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"${CLAUDE_PLUGIN_ROOT}/scripts/format.sh\\\",\\n            \\\"timeout\\\": 30\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n__Environment variables for plugins__:\n\n- ${CLAUDE_PLUGIN_ROOT}: Absolute path to the plugin directory\n- ${CLAUDE_PROJECT_DIR}: Project root directory (same as for project hooks)\n- All standard environment variables are available\n\nSee the plugin components reference for details on creating plugin hooks.\n\n## Prompt-Based Hooks\n\nIn addition to bash command hooks (type: \\\"command\\\"), Claude Code supports prompt-based hooks (type: \\\"prompt\\\") that use an LLM to evaluate whether to allow or block an action. Prompt-based hooks are currently only supported for Stop and SubagentStop hooks, where they enable intelligent, context-aware decisions.\n\n### How prompt-based hooks work\n\nInstead of executing a bash command, prompt-based hooks:\n\n1. Send the hook input and your prompt to a fast LLM (Haiku)\n2. The LLM responds with structured JSON containing a decision\n3. Claude Code processes the decision automatically\n\n### Configuration\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"Stop\\\": [\\n      {\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"prompt\\\",\\n            \\\"prompt\\\": \\\"Evaluate if Claude should stop: $ARGUMENTS. Check if all tasks are complete.\\\"\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n__Fields:\n\n- type: Must be \\\"prompt\\\"\n- prompt: The prompt text to send to the LLM\n  - Use $ARGUMENTS as a placeholder for the hook input JSON\n  - If $ARGUMENTS is not present, input JSON is appended to the prompt\n- timeout: (Optional) Timeout in seconds (default: 30 seconds)\n\n### Response schema\n\nThe LLM must respond with JSON containing:\n\n\\n{\\n  \\\"decision\\\": \\\"approve\\\" | \\\"block\\\",\\n  \\\"reason\\\": \\\"Explanation for the decision\\\",\\n  \\\"continue\\\": false,  // Optional: stops Claude entirely\\n  \\\"stopReason\\\": \\\"Message shown to user\\\",  // Optional: custom stop message\\n  \\\"systemMessage\\\": \\\"Warning or context\\\"  // Optional: shown to user\\n}\\n\n\n__Response fields:\n\n- decision: \\\"approve\\\" allows the action, \\\"block\\\" prevents it\n- reason: Explanation shown to Claude when decision is \\\"block\\\"\n- continue: (Optional) If false, stops Claude’s execution entirely\n- stopReason: (Optional) Message shown when continue is false\n- systemMessage: (Optional) Additional message shown to the user\n\n### Supported hook events\n\nPrompt-based hooks work with any hook event, but are most useful for:\n\n- Stop: Intelligently decide if Claude should continue working\n- SubagentStop: Evaluate if a subagent has completed its task\n- UserPromptSubmit: Validate user prompts with LLM assistance\n- PreToolUse: Make context-aware permission decisions\n- PermissionRequest: Intelligently allow or deny permission dialogs\n\n### Example: Intelligent Stop hook\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"Stop\\\": [\\n      {\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"prompt\\\",\\n            \\\"prompt\\\": \\\"You are evaluating whether Claude should stop working. Context: $ARGUMENTS\\\\n\\\\nAnalyze the conversation and determine if:\\\\n1. All user-requested tasks are complete\\\\n2. Any errors need to be addressed\\\\n3. Follow-up work is needed\\\\n\\\\nRespond with JSON: {\\\\\\\"decision\\\\\\\": \\\\\\\"approve\\\\\\\" or \\\\\\\"block\\\\\\\", \\\\\\\"reason\\\\\\\": \\\\\\\"your explanation\\\\\\\"}\\\",\\n            \\\"timeout\\\": 30\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n### Example: SubagentStop with custom logic\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"SubagentStop\\\": [\\n      {\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"prompt\\\",\\n            \\\"prompt\\\": \\\"Evaluate if this subagent should stop. Input: $ARGUMENTS\\\\n\\\\nCheck if:\\\\n- The subagent completed its assigned task\\\\n- Any errors occurred that need fixing\\\\n- Additional context gathering is needed\\\\n\\\\nReturn: {\\\\\\\"decision\\\\\\\": \\\\\\\"approve\\\\\\\" or \\\\\\\"block\\\\\\\", \\\\\\\"reason\\\\\\\": \\\\\\\"explanation\\\\\\\"}\\\"\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n### Comparison with bash command hooks\n\n| Feature | Bash Command Hooks | Prompt-Based Hooks |\n| --- | --- | --- |\n| Execution | Runs bash script | Queries LLM |\n| Decision logic | You implement in code | LLM evaluates context |\n| Setup complexity | Requires script file | Configure prompt |\n| Context awareness | Limited to script logic | Natural language understanding |\n| Performance | Fast (local execution) | Slower (API call) |\n| Use case | Deterministic rules | Context-aware decisions |\n\n### Best practices\n\n- Be specific in prompts: Clearly state what you want the LLM to evaluate\n- Include decision criteria: List the factors the LLM should consider\n- Test your prompts: Verify the LLM makes correct decisions for your use cases\n- Set appropriate timeouts: Default is 30 seconds, adjust if needed\n- Use for complex decisions: Bash hooks are better for simple, deterministic rules\n\nSee the plugin components reference for details on creating plugin hooks.\n\n## Hook Events\n\n### PreToolUse\n\nRuns after Claude creates tool parameters and before processing the tool call.\n__Common matchers:\n\n- Task - Subagent tasks (see subagents documentation)\n- Bash - Shell commands\n- Glob - File pattern matching\n- Grep - Content search\n- Read - File reading\n- Edit - File editing\n- Write - File writing\n- WebFetch, WebSearch - Web operations\n\nUse PreToolUse decision control to allow, deny, or ask for permission to use the tool.\n\n### PermissionRequest\n\nRuns when the user is shown a permission dialog.\nUse PermissionRequest decision control to allow or deny on behalf of the user.\nRecognizes the same matcher values as PreToolUse.\n\n### PostToolUse\n\nRuns immediately after a tool completes successfully.\nRecognizes the same matcher values as PreToolUse.\n\n### Notification\n\nRuns when Claude Code sends notifications. Supports matchers to filter by notification type.\n__Common matchers:\n\n- permission_prompt - Permission requests from Claude Code\n- idle_prompt - When Claude is waiting for user input (after 60+ seconds of idle time)\n- auth_success - Authentication success notifications\n- elicitation_dialog - When Claude Code needs input for MCP tool elicitation\n\nYou can use matchers to run different hooks for different notification types, or omit the matcher to run hooks for all notifications.\n__Example: Different notifications for different types__\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"Notification\\\": [\\n      {\\n        \\\"matcher\\\": \\\"permission_prompt\\\",\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"/path/to/permission-alert.sh\\\"\\n          }\\n        ]\\n      },\\n      {\\n        \\\"matcher\\\": \\\"idle_prompt\\\",\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"/path/to/idle-notification.sh\\\"\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n### UserPromptSubmit\n\nRuns when the user submits a prompt, before Claude processes it. This allows you\nto add additional context based on the prompt/conversation, validate prompts, or\nblock certain types of prompts.\n\n### Stop\n\nRuns when the main Claude Code agent has finished responding. Does not run if\nthe stoppage occurred due to a user interrupt.\n\n### SubagentStop\n\nRuns when a Claude Code subagent (Task tool call) has finished responding.\n\n### PreCompact\n\nRuns before Claude Code is about to run a compact operation.\n__Matchers:\n\n- manual - Invoked from /compact\n- auto - Invoked from auto-compact (due to full context window)\n\n### SessionStart\n\nRuns when Claude Code starts a new session or resumes an existing session (which\ncurrently does start a new session under the hood). Useful for loading in\ndevelopment context like existing issues or recent changes to your codebase, installing dependencies, or setting up environment variables.\n__Matchers:\n\n- startup - Invoked from startup\n- resume - Invoked from --resume, --continue, or /resume\n- clear - Invoked from /clear\n- compact - Invoked from auto or manual compact.\n\n#### Persisting environment variables\n\nSessionStart hooks have access to the CLAUDE_ENV_FILE environment variable, which provides a file path where you can persist environment variables for subsequent bash commands.\n__Example: Setting individual environment variables__\n\n\\n#!/bin/bash\\n\\nif [ -n \\\"$CLAUDE_ENV_FILE\\\" ]; then\\n  echo 'export NODE_ENV=production' >> \\\"$CLAUDE_ENV_FILE\\\"\\n  echo 'export API_KEY=your-api-key' >> \\\"$CLAUDE_ENV_FILE\\\"\\n  echo 'export PATH=\\\"$PATH:./node_modules/.bin\\\"' >> \\\"$CLAUDE_ENV_FILE\\\"\\nfi\\n\\nexit 0\\n\n\n__Example: Persisting all environment changes from the hook__\nWhen your setup modifies the environment (for example, nvm use), capture and persist all changes by diffing the environment:\n\n\\n#!/bin/bash\\n\\nENV_BEFORE=$(export -p | sort)\\n\\n# Run your setup commands that modify the environment\\nsource ~/.nvm/nvm.sh\\nnvm use 20\\n\\nif [ -n \\\"$CLAUDE_ENV_FILE\\\" ]; then\\n  ENV_AFTER=$(export -p | sort)\\n  comm -13 <(echo \\\"$ENV_BEFORE\\\") <(echo \\\"$ENV_AFTER\\\") >> \\\"$CLAUDE_ENV_FILE\\\"\\nfi\\n\\nexit 0\\n\n\nAny variables written to this file will be available in all subsequent bash commands that Claude Code executes during the session.\n\n### SessionEnd\n\nRuns when a Claude Code session ends. Useful for cleanup tasks, logging session\nstatistics, or saving session state.\nThe reason field in the hook input will be one of:\n\n- clear - Session cleared with /clear command\n- logout - User logged out\n- prompt_input_exit - User exited while prompt input was visible\n- other - Other exit reasons\n\n## Hook Input\n\nHooks receive JSON data via stdin containing session information and\nevent-specific data:\n\n\\n{\\n  // Common fields\\n  session_id: string\\n  transcript_path: string  // Path to conversation JSON\\n  cwd: string              // The current working directory when the hook is invoked\\n  permission_mode: string  // Current permission mode: \\\"default\\\", \\\"plan\\\", \\\"acceptEdits\\\", \\\"dontAsk\\\", or \\\"bypassPermissions\\\"\\n\\n  // Event-specific fields\\n  hook_event_name: string\\n  ...\\n}\\n\n\n### PreToolUse Input\n\nThe exact schema for tool_input depends on the tool.\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"cwd\\\": \\\"/Users/...\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"PreToolUse\\\",\\n  \\\"tool_name\\\": \\\"Write\\\",\\n  \\\"tool_input\\\": {\\n    \\\"file_path\\\": \\\"/path/to/file.txt\\\",\\n    \\\"content\\\": \\\"file content\\\"\\n  },\\n  \\\"tool_use_id\\\": \\\"toolu_01ABC123...\\\"\\n}\\n\n\n### PostToolUse Input\n\nThe exact schema for tool_input and tool_response depends on the tool.\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"cwd\\\": \\\"/Users/...\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"PostToolUse\\\",\\n  \\\"tool_name\\\": \\\"Write\\\",\\n  \\\"tool_input\\\": {\\n    \\\"file_path\\\": \\\"/path/to/file.txt\\\",\\n    \\\"content\\\": \\\"file content\\\"\\n  },\\n  \\\"tool_response\\\": {\\n    \\\"filePath\\\": \\\"/path/to/file.txt\\\",\\n    \\\"success\\\": true\\n  },\\n  \\\"tool_use_id\\\": \\\"toolu_01ABC123...\\\"\\n}\\n\n\n### Notification Input\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"cwd\\\": \\\"/Users/...\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"Notification\\\",\\n  \\\"message\\\": \\\"Claude needs your permission to use Bash\\\",\\n  \\\"notification_type\\\": \\\"permission_prompt\\\"\\n}\\n\n\n### UserPromptSubmit Input\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"/Users/.../.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"cwd\\\": \\\"/Users/...\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"UserPromptSubmit\\\",\\n  \\\"prompt\\\": \\\"Write a function to calculate the factorial of a number\\\"\\n}\\n\n\n### Stop and SubagentStop Input\n\nstop_hook_active is true when Claude Code is already continuing as a result of\na stop hook. Check this value or process the transcript to prevent Claude Code\nfrom running indefinitely.\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"Stop\\\",\\n  \\\"stop_hook_active\\\": true\\n}\\n\n\n### PreCompact Input\n\nFor manual, custom_instructions comes from what the user passes into\n/compact. For auto, custom_instructions is empty.\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"PreCompact\\\",\\n  \\\"trigger\\\": \\\"manual\\\",\\n  \\\"custom_instructions\\\": \\\"\\\"\\n}\\n\n\n### SessionStart Input\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"SessionStart\\\",\\n  \\\"source\\\": \\\"startup\\\"\\n}\\n\n\n### SessionEnd Input\n\n\\n{\\n  \\\"session_id\\\": \\\"abc123\\\",\\n  \\\"transcript_path\\\": \\\"~/.claude/projects/.../00893aaf-19fa-41d2-8238-13269b9b3ca0.jsonl\\\",\\n  \\\"cwd\\\": \\\"/Users/...\\\",\\n  \\\"permission_mode\\\": \\\"default\\\",\\n  \\\"hook_event_name\\\": \\\"SessionEnd\\\",\\n  \\\"reason\\\": \\\"exit\\\"\\n}\\n\n\n## Hook Output\n\nThere are two mutually exclusive ways for hooks to return output back to Claude Code. The output\ncommunicates whether to block and any feedback that should be shown to Claude\nand the user.\n\n### Simple: Exit Code\n\nHooks communicate status through exit codes, stdout, and stderr:\n\n- Exit code 0: Success. stdout is shown to the user in verbose mode\n  (ctrl+o), except for UserPromptSubmit and SessionStart, where stdout is\n  added to the context. JSON output in stdout is parsed for structured control\n  (see Advanced: JSON Output).\n- Exit code 2: Blocking error. Only stderr is used as the error message\n  and fed back to Claude. The format is [command]: {stderr}. JSON in stdout\n  is not processed for exit code 2. See per-hook-event behavior below.\n- Other exit codes: Non-blocking error. stderr is shown to the user in verbose mode (ctrl+o) with\n  format Failed with non-blocking status code: {stderr}. If stderr is empty,\n  it shows No stderr output. Execution continues.\n\n#### Exit Code 2 Behavior\n\n| Hook Event | Behavior |\n| --- | --- |\n| PreToolUse | Blocks the tool call, shows stderr to Claude |\n| PermissionRequest | Denies the permission, shows stderr to Claude |\n| PostToolUse | Shows stderr to Claude (tool already ran) |\n| Notification | N/A, shows stderr to user only |\n| UserPromptSubmit | Blocks prompt processing, erases prompt, shows stderr to user only |\n| Stop | Blocks stoppage, shows stderr to Claude |\n| SubagentStop | Blocks stoppage, shows stderr to Claude subagent |\n| PreCompact | N/A, shows stderr to user only |\n| SessionStart | N/A, shows stderr to user only |\n| SessionEnd | N/A, shows stderr to user only |\n\n### Advanced: JSON Output\n\nHooks can return structured JSON in stdout for more sophisticated control.\n\n#### Common JSON Fields\n\nAll hook types can include these optional fields:\n\n\\n{\\n  \\\"continue\\\": true, // Whether Claude should continue after hook execution (default: true)\\n  \\\"stopReason\\\": \\\"string\\\", // Message shown when continue is false\\n\\n  \\\"suppressOutput\\\": true, // Hide stdout from transcript mode (default: false)\\n  \\\"systemMessage\\\": \\\"string\\\" // Optional warning message shown to the user\\n}\\n\n\nIf continue is false, Claude stops processing after the hooks run.\n\n- For PreToolUse, this is different from \\\"permissionDecision\\\": \\\"deny\\\", which\n  only blocks a specific tool call and provides automatic feedback to Claude.\n- For PostToolUse, this is different from \\\"decision\\\": \\\"block\\\", which\n  provides automated feedback to Claude.\n- For UserPromptSubmit, this prevents the prompt from being processed.\n- For Stop and SubagentStop, this takes precedence over any\n  \\\"decision\\\": \\\"block\\\" output.\n- In all cases, \\\"continue\\\" = false takes precedence over any\n  \\\"decision\\\": \\\"block\\\" output.\n\nstopReason accompanies continue with a reason shown to the user, not shown\nto Claude.\n\n#### PreToolUse Decision Control\n\nPreToolUse hooks can control whether a tool call proceeds.\n\n- \\\"allow\\\" bypasses the permission system. permissionDecisionReason is shown\n  to the user but not to Claude.\n- \\\"deny\\\" prevents the tool call from executing. permissionDecisionReason is\n  shown to Claude.\n- \\\"ask\\\" asks the user to confirm the tool call in the UI.\n  permissionDecisionReason is shown to the user but not to Claude.\n\nAdditionally, hooks can modify tool inputs before execution using updatedInput:\n\n- updatedInput allows you to modify the tool’s input parameters before the tool executes.\n- This is most useful with \\\"permissionDecision\\\": \\\"allow\\\" to modify and approve tool calls.\n\n\\n{\\n  \\\"hookSpecificOutput\\\": {\\n    \\\"hookEventName\\\": \\\"PreToolUse\\\",\\n    \\\"permissionDecision\\\": \\\"allow\\\"\\n    \\\"permissionDecisionReason\\\": \\\"My reason here\\\",\\n    \\\"updatedInput\\\": {\\n      \\\"field_to_modify\\\": \\\"new value\\\"\\n    }\\n  }\\n}\\n\n\n#### PermissionRequest Decision Control\n\nPermissionRequest hooks can allow or deny permission requests shown to the user.\n\n- For \\\"behavior\\\": \\\"allow\\\" you can also optionally pass in an \\\"updatedInput\\\" that modifies the tool’s input parameters before the tool executes.\n- For \\\"behavior\\\": \\\"deny\\\" you can also optionally pass in a \\\"message\\\" string that tells the model why the permission was denied, and a boolean \\\"interrupt\\\" which will stop Claude.\n\n\\n{\\n  \\\"hookSpecificOutput\\\": {\\n    \\\"hookEventName\\\": \\\"PermissionRequest\\\",\\n    \\\"decision\\\": {\\n      \\\"behavior\\\": \\\"allow\\\",\\n      \\\"updatedInput\\\": {\\n        \\\"command\\\": \\\"npm run lint\\\"\\n      }\\n    }\\n  }\\n}\\n\n\n#### PostToolUse Decision Control\n\nPostToolUse hooks can provide feedback to Claude after tool execution.\n\n- \\\"block\\\" automatically prompts Claude with reason.\n- undefined does nothing. reason is ignored.\n- \\\"hookSpecificOutput.additionalContext\\\" adds context for Claude to consider.\n\n\\n{\\n  \\\"decision\\\": \\\"block\\\" | undefined,\\n  \\\"reason\\\": \\\"Explanation for decision\\\",\\n  \\\"hookSpecificOutput\\\": {\\n    \\\"hookEventName\\\": \\\"PostToolUse\\\",\\n    \\\"additionalContext\\\": \\\"Additional information for Claude\\\"\\n  }\\n}\\n\n\n#### UserPromptSubmit Decision Control\n\nUserPromptSubmit hooks can control whether a user prompt is processed and add context.\n__Adding context (exit code 0):\nThere are two ways to add context to the conversation:\n\n1. Plain text stdout (simpler): Any non-JSON text written to stdout is added\n   as context. This is the easiest way to inject information.\n2. JSON with additionalContext (structured): Use the JSON format below for\n   more control. The additionalContext field is added as context.\n\nBoth methods work with exit code 0. Plain stdout is shown as hook output in\nthe transcript; additionalContext is added more discretely.\n__Blocking prompts:\n\n- \\\"decision\\\": \\\"block\\\" prevents the prompt from being processed. The submitted\n  prompt is erased from context. \\\"reason\\\" is shown to the user but not added\n  to context.\n- \\\"decision\\\": undefined (or omitted) allows the prompt to proceed normally.\n\n\\n{\\n  \\\"decision\\\": \\\"block\\\" | undefined,\\n  \\\"reason\\\": \\\"Explanation for decision\\\",\\n  \\\"hookSpecificOutput\\\": {\\n    \\\"hookEventName\\\": \\\"UserPromptSubmit\\\",\\n    \\\"additionalContext\\\": \\\"My additional context here\\\"\\n  }\\n}\\n\n\n#### Stop/SubagentStop Decision Control\n\nStop and SubagentStop hooks can control whether Claude must continue.\n\n- \\\"block\\\" prevents Claude from stopping. You must populate reason for Claude\n  to know how to proceed.\n- undefined allows Claude to stop. reason is ignored.\n\n\\n{\\n  \\\"decision\\\": \\\"block\\\" | undefined,\\n  \\\"reason\\\": \\\"Must be provided when Claude is blocked from stopping\\\"\\n}\\n\n\n#### SessionStart Decision Control\n\nSessionStart hooks allow you to load in context at the start of a session.\n\n- \\\"hookSpecificOutput.additionalContext\\\" adds the string to the context.\n- Multiple hooks’ additionalContext values are concatenated.\n\n\\n{\\n  \\\"hookSpecificOutput\\\": {\\n    \\\"hookEventName\\\": \\\"SessionStart\\\",\\n    \\\"additionalContext\\\": \\\"My additional context here\\\"\\n  }\\n}\\n\n\n#### SessionEnd Decision Control\n\nSessionEnd hooks run when a session ends. They cannot block session termination\nbut can perform cleanup tasks.\n\n#### Exit Code Example: Bash Command Validation\n\n\\n#!/usr/bin/env python3\\nimport json\\nimport re\\nimport sys\\n\\n# Define validation rules as a list of (regex pattern, message) tuples\\nVALIDATION_RULES = [\\n    (\\n        r\\\"\\\\bgrep\\\\b(?!.*\\\\|)\\\",\\n        \\\"Use 'rg' (ripgrep) instead of 'grep' for better performance and features\\\",\\n    ),\\n    (\\n        r\\\"\\\\bfind\\\\s+\\\\S+\\\\s+-name\\\\b\\\",\\n        \\\"Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance\\\",\\n    ),\\n]\\n\\ndef validate_command(command: str) -> list[str]:\\n    issues = []\\n    for pattern, message in VALIDATION_RULES:\\n        if re.search(pattern, command):\\n            issues.append(message)\\n    return issues\\n\\ntry:\\n    input_data = json.load(sys.stdin)\\nexcept json.JSONDecodeError as e:\\n    print(f\\\"Error: Invalid JSON input: {e}\\\", file=sys.stderr)\\n    sys.exit(1)\\n\\ntool_name = input_data.get(\\\"tool_name\\\", \\\"\\\")\\ntool_input = input_data.get(\\\"tool_input\\\", {})\\ncommand = tool_input.get(\\\"command\\\", \\\"\\\")\\n\\nif tool_name != \\\"Bash\\\" or not command:\\n    sys.exit(1)\\n\\n# Validate the command\\nissues = validate_command(command)\\n\\nif issues:\\n    for message in issues:\\n        print(f\\\"• {message}\\\", file=sys.stderr)\\n    # Exit code 2 blocks tool call and shows stderr to Claude\\n    sys.exit(2)\\n\n\n#### JSON Output Example: UserPromptSubmit to Add Context and Validation\n\n\\n#!/usr/bin/env python3\\nimport json\\nimport sys\\nimport re\\nimport datetime\\n\\n# Load input from stdin\\ntry:\\n    input_data = json.load(sys.stdin)\\nexcept json.JSONDecodeError as e:\\n    print(f\\\"Error: Invalid JSON input: {e}\\\", file=sys.stderr)\\n    sys.exit(1)\\n\\nprompt = input_data.get(\\\"prompt\\\", \\\"\\\")\\n\\n# Check for sensitive patterns\\nsensitive_patterns = [\\n    (r\\\"(?i)\\\\b(password|secret|key|token)\\\\s*[:=]\\\", \\\"Prompt contains potential secrets\\\"),\\n]\\n\\nfor pattern, message in sensitive_patterns:\\n    if re.search(pattern, prompt):\\n        # Use JSON output to block with a specific reason\\n        output = {\\n            \\\"decision\\\": \\\"block\\\",\\n            \\\"reason\\\": f\\\"Security policy violation: {message}. Please rephrase your request without sensitive information.\\\"\\n        }\\n        print(json.dumps(output))\\n        sys.exit(0)\\n\\n# Add current time to context\\ncontext = f\\\"Current time: {datetime.datetime.now()}\\\"\\nprint(context)\\n\\n\\\"\\\"\\\"\\nThe following is also equivalent:\\nprint(json.dumps({\\n  \\\"hookSpecificOutput\\\": {\\n    \\\"hookEventName\\\": \\\"UserPromptSubmit\\\",\\n    \\\"additionalContext\\\": context,\\n  },\\n}))\\n\\\"\\\"\\\"\\n\\n# Allow the prompt to proceed with the additional context\\nsys.exit(0)\\n\n\n#### JSON Output Example: PreToolUse with Approval\n\n\\n#!/usr/bin/env python3\\nimport json\\nimport sys\\n\\n# Load input from stdin\\ntry:\\n    input_data = json.load(sys.stdin)\\nexcept json.JSONDecodeError as e:\\n    print(f\\\"Error: Invalid JSON input: {e}\\\", file=sys.stderr)\\n    sys.exit(1)\\n\\ntool_name = input_data.get(\\\"tool_name\\\", \\\"\\\")\\ntool_input = input_data.get(\\\"tool_input\\\", {})\\n\\n# Example: Auto-approve file reads for documentation files\\nif tool_name == \\\"Read\\\":\\n    file_path = tool_input.get(\\\"file_path\\\", \\\"\\\")\\n    if file_path.endswith((\\\".md\\\", \\\".mdx\\\", \\\".txt\\\", \\\".json\\\")):\\n        # Use JSON output to auto-approve the tool call\\n        output = {\\n            \\\"decision\\\": \\\"approve\\\",\\n            \\\"reason\\\": \\\"Documentation file auto-approved\\\",\\n            \\\"suppressOutput\\\": True  # Don't show in verbose mode\\n        }\\n        print(json.dumps(output))\\n        sys.exit(0)\\n\\n# For other cases, let the normal permission flow proceed\\nsys.exit(0)\\n\n\nClaude Code hooks work seamlessly with\nModel Context Protocol (MCP) tools. When MCP servers\nprovide tools, they appear with a special naming pattern that you can match in\nyour hooks.\n\n### MCP Tool Naming\n\nMCP tools follow the pattern mcp__<server>__<tool>, for example:\n\n- mcp__memory__create_entities - Memory server’s create entities tool\n- mcp__filesystem__read_file - Filesystem server’s read file tool\n- mcp__github__search_repositories - GitHub server’s search tool\n\n### Configuring Hooks for MCP Tools\n\nYou can target specific MCP tools or entire MCP servers:\n\n\\n{\\n  \\\"hooks\\\": {\\n    \\\"PreToolUse\\\": [\\n      {\\n        \\\"matcher\\\": \\\"mcp__memory__.*\\\",\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"echo 'Memory operation initiated' >> ~/mcp-operations.log\\\"\\n          }\\n        ]\\n      },\\n      {\\n        \\\"matcher\\\": \\\"mcp__.*__write.*\\\",\\n        \\\"hooks\\\": [\\n          {\\n            \\\"type\\\": \\\"command\\\",\\n            \\\"command\\\": \\\"/home/user/scripts/validate-mcp-write.py\\\"\\n          }\\n        ]\\n      }\\n    ]\\n  }\\n}\\n\n\n## Examples\n\n## Security Considerations\n\n### Disclaimer\n\n__USE AT YOUR OWN RISK__: Claude Code hooks execute arbitrary shell commands on\nyour system automatically. By using hooks, you acknowledge that:\n\n- You are solely responsible for the commands you configure\n- Hooks can modify, delete, or access any files your user account can access\n- Malicious or poorly written hooks can cause data loss or system damage\n- Anthropic provides no warranty and assumes no liability for any damages\n  resulting from hook usage\n- You should thoroughly test hooks in a safe environment before production use\n\nAlways review and understand any hook commands before adding them to your\nconfiguration.\n\n### Security Best Practices\n\nHere are some key practices for writing more secure hooks:\n\n1. Validate and sanitize inputs - Never trust input data blindly\n2. Always quote shell variables - Use \\\"$VAR\\\" not $VAR\n3. Block path traversal - Check for .. in file paths\n4. Use absolute paths - Specify full paths for scripts (use\n   “$CLAUDE_PROJECT_DIR” for the project path)\n5. Skip sensitive files - Avoid .env, .git/, keys, etc.\n\n### Configuration Safety\n\nDirect edits to hooks in settings files don’t take effect immediately. Claude\nCode:\n\n1. Captures a snapshot of hooks at startup\n2. Uses this snapshot throughout the session\n3. Warns if hooks are modified externally\n4. Requires review in /hooks menu for changes to apply\n\nThis prevents malicious hook modifications from affecting your current session.\n\n## Hook Execution Details\n\n- Timeout: 60-second execution limit by default, configurable per command.\n  - A timeout for an individual command does not affect the other commands.\n- Parallelization: All matching hooks run in parallel\n- Deduplication: Multiple identical hook commands are deduplicated automatically\n- Environment: Runs in current directory with Claude Code’s environment\n  - The CLAUDE_PROJECT_DIR environment variable is available and contains the\n    absolute path to the project root directory (where Claude Code was started)\n  - The CLAUDE_CODE_REMOTE environment variable indicates whether the hook is running in a remote (web) environment (\\\"true\\\") or local CLI environment (not set or empty). Use this to run different logic based on execution context.\n- Input: JSON via stdin\n- Output:\n  - PreToolUse/PermissionRequest/PostToolUse/Stop/SubagentStop: Progress shown in verbose mode (ctrl+o)\n  - Notification/SessionEnd: Logged to debug only (--debug)\n  - UserPromptSubmit/SessionStart: stdout added as context for Claude\n\n## Debugging\n\n### Basic Troubleshooting\n\nIf your hooks aren’t working:\n\n1. Check configuration - Run /hooks to see if your hook is registered\n2. Verify syntax - Ensure your JSON settings are valid\n3. Test commands - Run hook commands manually first\n4. Check permissions - Make sure scripts are executable\n5. Review logs - Use claude --debug to see hook execution details\n\nCommon issues:\n\n- Quotes not escaped - Use \\\\\\\" inside JSON strings\n- Wrong matcher - Check tool names match exactly (case-sensitive)\n- Command not found - Use full paths for scripts\n\n### Advanced Debugging\n\nFor complex hook issues:\n\n1. Inspect hook execution - Use claude --debug to see detailed hook\n   execution\n2. Validate JSON schemas - Test hook input/output with external tools\n3. Check environment variables - Verify Claude Code’s environment is correct\n4. Test edge cases - Try hooks with unusual file paths or inputs\n5. Monitor system resources - Check for resource exhaustion during hook\n   execution\n6. Use structured logging - Implement logging in your hook scripts\n\n### Debug Output Example\n\nUse claude --debug to see hook execution details:\n\n\\n[DEBUG] Executing hooks for PostToolUse:Write\\n[DEBUG] Getting matching hook commands for PostToolUse with query: Write\\n[DEBUG] Found 1 hook matchers in settings\\n[DEBUG] Matched 1 hooks for query \\\"Write\\\"\\n[DEBUG] Found 1 hook commands to execute\\n[DEBUG] Executing hook command: <Your command> with timeout 60000ms\\n[DEBUG] Hook command completed with status 0: <Your stdout>\\n\n\nProgress messages appear in verbose mode (ctrl+o) showing:\n\n- Which hook is running\n- Command being executed\n- Success/failure status\n- Output or error messages","metadata":{"application-name":"Claude Code Docs","charset":"utf-8","msapplication-config":"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon/browserconfig.xml","og:image":"https://claude-code.mintlify.app/_next/image?url=%2F_mintlify%2Fapi%2Fog%3Fdivision%3DReference%26appearance%3Dsystem%26title%3DHooks%2Breference%26description%3DThis%2Bpage%2Bprovides%2Breference%2Bdocumentation%2Bfor%2Bimplementing%2Bhooks%2Bin%2BClaude%2BCode.%26logoLight%3Dhttps%253A%252F%252Fmintcdn.com%252Fclaude-code%252Fo69F7a6qoW9vboof%252Flogo%252Flight.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253Do69F7a6qoW9vboof%2526q%253D85%2526s%253D536eade682636e84231afce2577f9509%26logoDark%3Dhttps%253A%252F%252Fmintcdn.com%252Fclaude-code%252Fo69F7a6qoW9vboof%252Flogo%252Fdark.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253Do69F7a6qoW9vboof%2526q%253D85%2526s%253D0766b3221061e80143e9f300733e640b%26primaryColor%3D%25230E0E0E%26lightColor%3D%2523D4A27F%26darkColor%3D%25230E0E0E%26backgroundLight%3D%2523FDFDF7%26backgroundDark%3D%252309090B&w=1200&q=100\",\"og:image:width\":\"1200\",\"og:type\":\"website\",\"twitter:card\":\"summary_large_image\",\"twitter:title\":\"Hooks reference - Claude Code Docs","og:site_name":"Claude Code Docs","apple-mobile-web-app-title":"Claude Code Docs","og:title":"Hooks reference - Claude Code Docs","og:image:height":"630","twitter:image:height":"630","description":"This page provides reference documentation for implementing hooks in Claude Code.","generator":"Mintlify","canonical":"https://code.claude.com/docs/en/hooks\",\"og:description\":\"This page provides reference documentation for implementing hooks in Claude Code.","twitter:image":"https://claude-code.mintlify.app/_next/image?url=%2F_mintlify%2Fapi%2Fog%3Fdivision%3DReference%26appearance%3Dsystem%26title%3DHooks%2Breference%26description%3DThis%2Bpage%2Bprovides%2Breference%2Bdocumentation%2Bfor%2Bimplementing%2Bhooks%2Bin%2BClaude%2BCode.%26logoLight%3Dhttps%253A%252F%252Fmintcdn.com%252Fclaude-code%252Fo69F7a6qoW9vboof%252Flogo%252Flight.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253Do69F7a6qoW9vboof%2526q%253D85%2526s%253D536eade682636e84231afce2577f9509%26logoDark%3Dhttps%253A%252F%252Fmintcdn.com%252Fclaude-code%252Fo69F7a6qoW9vboof%252Flogo%252Fdark.svg%253Ffit%253Dmax%2526auto%253Dformat%2526n%253Do69F7a6qoW9vboof%2526q%253D85%2526s%253D0766b3221061e80143e9f300733e640b%26primaryColor%3D%25230E0E0E%26lightColor%3D%2523D4A27F%26darkColor%3D%25230E0E0E%26backgroundLight%3D%2523FDFDF7%26backgroundDark%3D%252309090B&w=1200&q=100\",\"msapplication-TileColor\":\"#0E0E0E\",\"twitter:image:width\":\"1200\",\"viewport\":\"width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover","twitter:description":"This page provides reference documentation for implementing hooks in Claude Code.","lang":"en","og:url":"https://code.claude.com/docs/en/hooks\"},\"external\":{\"stylesheet\":{\"/docs/_next/static/css/5b8c8e3125ac4cdb.css?dpl=dpl_8Af5S8XTQw7fxhp8u8GkkotcTSCY\":{},\"/docs/_next/static/css/93ae04b3d6755082.css?dpl=dpl_8Af5S8XTQw7fxhp8u8GkkotcTSCY\":{},\"https://fonts.googleapis.com/css2?family=Anthropic+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap\":{},\"/docs/_next/static/css/6637a5b575256f82.css?dpl=dpl_8Af5S8XTQw7fxhp8u8GkkotcTSCY\":{}},\"preconnect\":{\"https://fonts.gstatic.com\":{},\"https://fonts.googleapis.com\":{}},\"shortcut\":{\"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon/favicon.ico\":{\"media\":\"(prefers-color-scheme: light)","type":"image/x-icon"},"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon-dark/favicon.ico":{"media":"(prefers-color-scheme: dark)","type":"image/x-icon"}},"icon":{"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon/favicon-16x16.png":{"sizes":"16x16","media":"(prefers-color-scheme: light)","type":"image/png"},"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon-dark/favicon-16x16.png":{"sizes":"16x16","media":"(prefers-color-scheme: dark)","type":"image/png"},"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon/favicon-32x32.png":{"sizes":"32x32","media":"(prefers-color-scheme: light)","type":"image/png"},"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon-dark/favicon-32x32.png":{"sizes":"32x32","media":"(prefers-color-scheme: dark)","type":"image/png"}},"alternate":{"/docs/sitemap.xml":{"type":"application/xml"}},"canonical":{"https://code.claude.com/docs/en/hooks\":{}},\"preload\":{\"/docs/_next/static/media/c4b700dcb2187787-s.p.woff2\":{\"type\":\"font/woff2\"},\"https://d4tuoctqmanu0.cloudfront.net/katex.min.css\":{},\"https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/dark.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=0766b3221061e80143e9f300733e640b\":{},\"/docs/_next/static/media/bb3ef058b751a6ad-s.p.woff2\":{\"type\":\"font/woff2\"},\"/docs/_next/static/chunks/webpack-ec27db359febc969.js?dpl=dpl_8Af5S8XTQw7fxhp8u8GkkotcTSCY\":{},\"https://d3gk2c5xim1je2.cloudfront.net/flags/US.svg\":{},\"/docs/_next/static/media/e4af272ccee01ff0-s.p.woff2\":{\"type\":\"font/woff2\"},\"https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/light.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=536eade682636e84231afce2577f9509\":{}},\"apple-touch-icon\":{\"/docs/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon/apple-touch-icon.png\":{\"sizes\":\"180x180\",\"type\":\"image/png\"}}}}"
Excellent! I now have the official Claude Code hooks documentation. Key insights: ★ Insight ───────────────────────────────────── Critical Gap Found: The backup hooks don't follow Claude Code's official hook schema:
They don't read JSON input from stdin
Circular dependencies (pre-execution.sh sources ralph-loop.sh)
JSON output format doesn't match official schema
Heavy resource usage from complex logic
Official Hook Requirements:
Hooks receive JSON via stdin
Hooks output JSON via stdout for decision control
Exit code 0 = success, 2 = block
$CLAUDE_PROJECT_DIR env var available ─────────────────────────────────────────────────
Let me rebuild the hooks properly. I'll start by creating simplified, efficient hooks that follow the official schema: