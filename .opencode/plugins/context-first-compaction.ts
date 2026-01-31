/**
 * CONTEXT-FIRST COMPACTION PLUGIN v1.1
 * 
 * Replaces OpenCode's default compaction prompt with an advanced version that:
 * 1. Filters poisoned/drifted context
 * 2. Tracks artifact references (not full text) for hop-reading
 * 3. Maintains multi-compact chain awareness
 * 4. Preserves workflow cycles and agent role hierarchy
 * 5. Anchors turning points and user intentions
 * 6. Reminds of constitutions and BMAD status
 * 7. NEW: Injects hierarchical session context (parent/child delegations)
 * 
 * @see https://opencode.ai/docs/plugins/#compaction-hooks
 * @version 1.1.0 - Added HierarchicalCompactionEnhancer
 */

import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

// ============================================================================
// HIERARCHICAL COMPACTION ENHANCER (v1.1)
// Injects delegation chain and workflow phase context before main compaction
// ============================================================================

interface WorkflowStatus {
  current_phase?: string;
  active_epics?: string[];
  current_workflow?: string;
}

interface SprintStatus {
  active_stories?: Array<{ id: string; status: string; }>;
  sprint_goal?: string;
}

const HierarchicalCompactionEnhancer = {
  /**
   * Read YAML-like status file (simple parser)
   */
  readStatusFile(filename: string): Record<string, unknown> | null {
    const candidates = [
      path.join(process.cwd(), filename),
      path.join(process.cwd(), "_bmad-output/sprint-artifacts", path.basename(filename)),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          // Simple YAML parsing for key fields
          const lines = content.split("\n");
          const result: Record<string, unknown> = {};
          for (const line of lines) {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
              result[match[1]] = match[2].trim();
            }
          }
          return result;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Generate hierarchical context injection
   */
  generateHierarchicalContext(): string {
    const workflowStatus = this.readStatusFile("bmm-workflow-status.yaml") as WorkflowStatus | null;
    const sprintStatus = this.readStatusFile("sprint-status.yaml") as SprintStatus | null;

    let context = `
## HIERARCHICAL SESSION CONTEXT (Auto-Injected v1.1)

### Verified Workflow Phase
`;

    if (workflowStatus?.current_phase) {
      context += `- Phase: ${workflowStatus.current_phase}\n`;
    }
    if (workflowStatus?.current_workflow) {
      context += `- Workflow: ${workflowStatus.current_workflow}\n`;
    }
    if (workflowStatus?.active_epics) {
      context += `- Active Epics: ${workflowStatus.active_epics}\n`;
    }

    if (!workflowStatus) {
      context += `- ⚠️ workflow-status.yaml not found - phase unknown\n`;
    }

    context += `
### Sprint Context
`;
    if (sprintStatus?.sprint_goal) {
      context += `- Sprint Goal: ${sprintStatus.sprint_goal}\n`;
    }
    if (sprintStatus?.active_stories) {
      context += `- Active Stories: ${JSON.stringify(sprintStatus.active_stories)}\n`;
    }

    if (!sprintStatus) {
      context += `- ⚠️ sprint-status.yaml not found - sprint state unknown\n`;
    }

    context += `
### Brain Artifact Links (Long-Term Context On-Demand)
- Decisions: _bmad-output/.brain/decisions/
- Violations: _bmad-output/.brain/violations/
- Sessions: _bmad-output/.brain/sessions/
- Use \`long-term-context\` tool to query historical context

### Tier-1 SSOT Documents
- Architecture: _bmad-output/planning-artifacts/architecture.md
- PRD: _bmad-output/planning-artifacts/prd.md
- Epics: _bmad-output/planning-artifacts/epics/

---
`;
    return context;
  }
};

export const ContextFirstCompactionPlugin: Plugin = async (ctx) => {
  return {
    "experimental.session.compacting": async (input, output) => {
      // INJECT hierarchical context BEFORE main compaction prompt (v1.1)
      const hierarchicalContext = HierarchicalCompactionEnhancer.generateHierarchicalContext();

      // Replace the entire compaction prompt with our advanced version
      output.prompt = `
# CONTEXT-FIRST SESSION COMPACTION v1.1
# BMAD Beast Mode - Multi-Agent Orchestration Aware
# Enhanced with Hierarchical Session Context

You are generating a **continuation prompt** that preserves essential context for agent work in a multi-agent BMAD framework. This summary will be the ONLY context available to the next agent turn.

${hierarchicalContext}

---

## SECTION 1: MULTI-COMPACT CHAIN AWARENESS

**Check if this is a continuation:**
- Look for previous "COMPACT CHAIN" markers in the conversation
- If found, INCREMENT the compact_turn counter
- If this is turn 4+, ONLY preserve: anchors, active work, and artifact links

\`\`\`yaml
compact_chain:
  turn_number: [1 if first compact, else increment from previous]
  previous_summary_present: [true/false]
  note: "Turn 4+ requires minimal context, rely on artifact links"
\`\`\`

---

## SECTION 2: POISONED CONTEXT FILTER

**BEFORE summarizing, IDENTIFY AND EXCLUDE:**

| Poison Type | Detection | Action |
|-------------|-----------|--------|
| Stale artifacts | Discussed >24h ago, not recently referenced | EXCLUDE, note as "stale" |
| Contradicted decisions | Later decision supersedes earlier | Keep ONLY final decision |
| Failed attempts | "tried X, didn't work", debugging dead-ends | EXCLUDE, note as "ruled out" |
| Hallucinated content | Claims without verification evidence | EXCLUDE, flag as "unverified" |
| Off-topic tangents | Discussion unrelated to primary goal | EXCLUDE entirely |
| Drift context | Agent started doing something user didn't ask | FLAG, ask for correction |

\`\`\`yaml
filtered_out:
  stale: []       # Artifacts/topics not relevant anymore
  superseded: []  # Decisions replaced by later ones
  failed: []      # Approaches that didn't work
  unverified: []  # Claims without evidence
  drift: []       # Agent went off-track here
\`\`\`

---

## SECTION 3: ANCHOR PRESERVATION (CRITICAL)

### 3.1 Original Intent (Turn 1-2) - VERBATIM
Copy the user's FIRST message exactly. This is the PRIMARY ANCHOR that prevents drift.

\`\`\`yaml
anchors:
  original_intent:
    turn_1_verbatim: |
      [COPY EXACT USER FIRST MESSAGE]
    turn_2_clarification: |
      [Any clarification or understanding confirmation]
    primary_goal: "[ONE LINE: What user actually wants]"
    success_criteria: "[How we know we're done]"
\`\`\`

### 3.2 Workflow Initiation Points
Mark any NEW workflow starts from user messages mid-conversation:

\`\`\`yaml
  workflow_initiations:
    - turn: [N]
      user_said: "[Quote the request]"
      workflow_started: "[Workflow name/type]"
\`\`\`

### 3.3 Last 4 Turns (Recency Anchor)
Most recent context gets MORE detail:

\`\`\`yaml
recent_context:
  turn_minus_4: "[ACTOR]: [Brief summary]"
  turn_minus_3: "[ACTOR]: [Brief summary]"
  turn_minus_2: "[ACTOR]: [Moderate detail]"
  turn_minus_1: "[ACTOR]: [Full detail - most recent]"
  pending_action: "[What was just requested/expected next]"
\`\`\`

---

## SECTION 4: WORKFLOW & AGENT HIERARCHY

### 4.1 BMAD Phase Tracking
\`\`\`yaml
phase_tracking:
  current_phase: "[PLANNING/EXECUTION/VERIFICATION]"
  phase_transitions:
    - from: "[Phase]"
      to: "[Phase]"
      at_turn: [N]
      reason: "[Why phase changed]"
\`\`\`

### 4.2 Agent Role Hierarchy (Orchestrator View)
\`\`\`yaml
agent_hierarchy:
  orchestrator: "[ext-master / bmad-master]"
  current_executor: "[Agent currently doing work]"
  delegation_chain: "[master → sprint-manager → dev]"
  
  cycle_history:
    - cycle_type: "[main/inner]"
      agent: "[Who ran this cycle]"
      purpose: "[What this cycle accomplished]"
      status: "[complete/in-progress/blocked]"
\`\`\`

### 4.3 Workflow Cycles (Main vs Inner)
\`\`\`yaml
workflow_cycles:
  main_cycles:
    - name: "[Workflow name]"
      status: "[active/complete]"
      inner_cycles:
        - "[Inner workflow 1]"
        - "[Inner workflow 2]"
\`\`\`

---

## SECTION 5: ARTIFACT REFERENCE LINKS (NOT FULL TEXT)

**DO NOT copy artifact contents. Only store NAVIGATIONAL REFERENCES.**
These are "hop-reading" links for the next agent to consume ON DEMAND.

\`\`\`yaml
artifact_registry:
  handoff_documents:
    - path: "_bmad-output/[path]/[filename].md"
      type: "[handoff/spec/plan/analysis]"
      generated_by: "[Agent role]"
      at_turn: [N]
      purpose: "[Why this matters]"
      read_if: "[When should next agent read this]"
      
  created_this_session:
    - path: "[File path]"
      purpose: "[Brief description]"
      
  modified_this_session:
    - path: "[File path]"
      changes: "[What changed]"
      
  key_deliverable: "[Most important output file path]"
\`\`\`

---

## SECTION 6: CONSTITUTION & GOVERNANCE REMINDER

\`\`\`yaml
governance:
  constitution_reminder: |
    - Check AGENTS.md for project rules
    - Verify role permissions before acting
    - Coordinators DELEGATE, never execute directly
    - Update workflow-status.yaml after completing work
    - Update sprint-status.yaml when in story development
    
  status_updates_needed:
    workflow_status: "[true/false - did work affect workflow?]"
    sprint_status: "[true/false - is this story work?]"
    
  active_constraints:
    - "[Any constraints from AGENTS.md or governance]"
\`\`\`

---

## SECTION 7: DECISIONS & NEXT ACTIONS

### 7.1 Final Decisions (Not Superseded)
\`\`\`yaml
decisions:
  - decision: "[KEY DECISION]"
    rationale: "[Why this was chosen]"
    made_at_turn: [N]
    by_agent: "[Who decided]"
\`\`\`

### 7.2 Next Action
\`\`\`yaml
next_action:
  description: "[WHAT SHOULD HAPPEN NEXT]"
  assigned_to: "[Agent role expected to act]"
  priority: "[P0/P1/P2]"
  blocker: "[Any blocking issue, or null]"
  context_files_needed:
    - "[File path agent should read first]"
\`\`\`

---

## SECTION 8: SKILLS & TOOLS

\`\`\`yaml
skills_loaded:
  - "[Skill name that was active]"
  
tools_used:
  - name: "[Tool name]"
    for: "[Purpose]"
\`\`\`

---

## SECTION 9: BEAST-MODE SKILL SYSTEM (from beast-mode-orchestrator)

Include this context for skill-aware orchestration:

\`\`\`yaml
skill_system:
  hierarchy:
    tier_0_meta: [hierarchy-orchestration, min-max-strategy, bouncing-loops]
    tier_1_orchestration: [skill-chains, skill-combos, automation-cycles]
    tier_2_process: [brainstorming, writing-plans, context-first, story-cycle]
    tier_2_domain: [frontend-components, backend-api, etc]
    tier_2_quality: [tdd-red, systematic-debugging, verification-before-completion]
    
  min_skills_always_loaded: [using-superpowers, context-first, brownfield-guard, verification-before-completion]
  
  active_patterns:
    - "[List triggered cycles: chain:*, combo:*, cycle:*]"
    
  current_chain: 
    name: "[Chain name or null]"
    step: "[Current step number]"
    total_steps: "[Total steps in chain]"
    
  governance_commands:
    - pnpm governance
    - pnpm typecheck:fast
    - pnpm test:fast
\`\`\`

---

## OUTPUT FORMAT

Generate the summary using ALL sections above. The YAML structure is critical for potential machine parsing. Include:

1. \`compact_chain:\` - Track which compact turn this is
2. \`filtered_out:\` - What poisoned content was excluded
3. \`anchors:\` - Original intent and workflow initiations
4. \`recent_context:\` - Last 4 turns with recency weighting
5. \`phase_tracking:\` - BMAD phase transitions
6. \`agent_hierarchy:\` - Who delegated to whom
7. \`workflow_cycles:\` - Main and inner cycle tracking
8. \`artifact_registry:\` - Links to handoff documents (NOT content)
9. \`governance:\` - Constitution reminders and status update flags
10. \`decisions:\` - Final decisions only
11. \`next_action:\` - Clear instruction for continuation
12. \`skill_system:\` - Beast-mode skill tiers and active patterns

---

## CRITICAL RULES

1. **Turn 1-2 are SACRED** - Never lose the original user request
2. **Artifact LINKS, not CONTENT** - Reference files, don't copy them
3. **Filter before summarizing** - Exclude poisoned context FIRST
4. **Track compact chain** - Know if this is turn 1, 2, 3, 4+ of compaction
5. **Orchestrator view** - Include role hierarchy for coordinators
6. **Governance reminder** - Always include constitution reference

---

Generate the structured summary now. Focus on NAVIGATIONAL COMPLETENESS over CONTENT COMPLETENESS.
`
    },
  }
}

// Export as default for OpenCode plugin loader
export default ContextFirstCompactionPlugin
