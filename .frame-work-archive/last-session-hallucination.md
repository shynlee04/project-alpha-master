- This is going to be make as a meta plugin >> people can install for any project

when people install it to their project will append the set of these folders, sub-folders including agents, plugins, (custom) tools, configurations, templates, commands, skills etc under `.opencode`  >>> something similar to these BMAD (just an example we do not use BMAD here)

```markdown
_bmad/bmm
_bmad/bmm/agents
_bmad/bmm/agents/analyst.md
_bmad/bmm/agents/architect.md
_bmad/bmm/agents/dev.md
_bmad/bmm/agents/pm.md
_bmad/bmm/agents/quick-flow-solo-dev.md
_bmad/bmm/agents/sm.md
_bmad/bmm/agents/tea.md
_bmad/bmm/agents/tech-writer.md
_bmad/bmm/agents/ux-designer.md
_bmad/bmm/data
_bmad/bmm/data/documentation-standards.md
_bmad/bmm/data/project-context-template.md
_bmad/bmm/data/README.md
_bmad/bmm/docs
_bmad/bmm/docs/images
_bmad/bmm/docs/images/workflow-method-greenfield.excalidraw.bak
_bmad/bmm/docs/images/workflow-method-greenfield.svg.bak
_bmad/bmm/teams
_bmad/bmm/testarch
_bmad/bmm/workflows
_bmad/bmm/workflows/1-analysis
_bmad/bmm/workflows/2-plan-workflows
_bmad/bmm/workflows/3-solutioning
_bmad/bmm/workflows/4-implementation
_bmad/bmm/workflows/bmad-quick-flow
_bmad/bmm/workflows/codebase-diagnostic
_bmad/bmm/workflows/document-project
_bmad/bmm/workflows/excalidraw-diagrams
_bmad/bmm/workflows/generate-project-context
_bmad/bmm/workflows/testarch
_bmad/bmm/workflows/workflow-status
_bmad/bmm/workflows/tree.md
_bmad/bmm/workflows/tree.xml
_bmad/bmm/config.yaml
_bmad/bmm/tree.json
_bmad/cis
_bmad/core
_bmad/core/agents
_bmad/core/agents/bmad-master.md
_bmad/core/resources
_bmad/core/tasks
_bmad/core/tasks/advanced-elicitation-methods.csv
_bmad/core/tasks/advanced-elicitation-methods.csv.bak
_bmad/core/tasks/advanced-elicitation.xml
_bmad/core/tasks/advanced-elicitation.xml.bak
_bmad/core/tasks/index-docs.xml
_bmad/core/tasks/index-docs.xml.bak
_bmad/core/tasks/review-adversarial-general.xml
_bmad/core/tasks/shard-doc.xml
_bmad/core/tasks/validate-workflow.xml
_bmad/core/tasks/validate-workflow.xml.bak
_bmad/core/tasks/workflow.xml
_bmad/core/tasks/workflow.xml.bak
_bmad/core/tasks/workflow.yaml
_bmad/core/tools
_bmad/core/tools/shard-doc.xml
_bmad/core/tools/shard-doc.xml.bak
_bmad/core/workflows
_bmad/core/config.yaml
_bmad/core/tree.json
_bmad/modules
_bmad/workflows
_bmad/.skills-index.yaml
_bmad/BMAD-METHOD-DOCUMENTATION-PROMPT.md
_bmad/codetree-for-analysi-2.mds

=====

## And if look closely -> the main worflows are made into 4 phases and there are some outside of these 4

_bmad/bmm/workflows
_bmad/bmm/workflows/1-analysis
_bmad/bmm/workflows/1-analysis/create-product-brief
_bmad/bmm/workflows/1-analysis/research
_bmad/bmm/workflows/2-plan-workflows
_bmad/bmm/workflows/2-plan-workflows/create-ux-design
_bmad/bmm/workflows/2-plan-workflows/prd
_bmad/bmm/workflows/3-solutioning
_bmad/bmm/workflows/3-solutioning/check-implementation-readiness
_bmad/bmm/workflows/3-solutioning/create-architecture
_bmad/bmm/workflows/3-solutioning/create-epics-and-stories
_bmad/bmm/workflows/4-implementation
_bmad/bmm/workflows/4-implementation/architectural-consolidation
_bmad/bmm/workflows/4-implementation/code-review
_bmad/bmm/workflows/4-implementation/code-review/checklist.md
_bmad/bmm/workflows/4-implementation/code-review/instructions.xml
_bmad/bmm/workflows/4-implementation/code-review/instructions.xml.bak
_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml
_bmad/bmm/workflows/4-implementation/correct-course
_bmad/bmm/workflows/4-implementation/correct-course/checklist.md
_bmad/bmm/workflows/4-implementation/correct-course/instructions.md
_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml
_bmad/bmm/workflows/4-implementation/create-story
_bmad/bmm/workflows/4-implementation/dev-story
_bmad/bmm/workflows/4-implementation/retrospective
_bmad/bmm/workflows/4-implementation/sprint-planning
_bmad/bmm/workflows/4-implementation/sprint-status
_bmad/bmm/workflows/bmad-quick-flow
_bmad/bmm/workflows/codebase-diagnostic
_bmad/bmm/workflows/codebase-diagnostic/steps
_bmad/bmm/workflows/codebase-diagnostic/steps/step-01-structure.md
_bmad/bmm/workflows/codebase-diagnostic/steps/step-02-journeys.md
_bmad/bmm/workflows/codebase-diagnostic/steps/step-03-dataflow.md
_bmad/bmm/workflows/codebase-diagnostic/steps/step-04-performance.md
_bmad/bmm/workflows/codebase-diagnostic/steps/step-05-features.md
_bmad/bmm/workflows/codebase-diagnostic/steps/step-06-integration.md
_bmad/bmm/workflows/codebase-diagnostic/steps/step-07-synthesis.md
_bmad/bmm/workflows/codebase-diagnostic/workflow.md
_bmad/bmm/workflows/document-project
_bmad/bmm/workflows/excalidraw-diagrams
_bmad/bmm/workflows/generate-project-context
_bmad/bmm/workflows/testarch
_bmad/bmm/workflows/workflow-status
_bmad/bmm/workflows/tree.md
_bmad/bmm/workflows/tree.xml
_bmad/bmm/config.yaml
_bmad/bmm/tree.json
```

---

### So these are my proposal of how we refactor, split and structure our set

base on our concepts of what have been so far discuss

```markdown
what make our meta framework different? We enforce on these:

- Automation -> auto governance + validation 
- Automation with guardrails of multi-level cycles of loops between agents loading different workflows and profiles >> execute parallel or sequential  tasks that are 4-phase, and with improved workflows of BMAD
- Advanced context and Agents as expert 
- Improved on more methods and multple aspects of guardrails, validation and  controlled check list
```

→ So, apart from those that belong specific to a phase; and the agents that must be under .opencode → I will phase those that can ben used across the developments, across phases and also as  these are core values of this framework → into  `governance` and `context-first` and `intelligence` (and they are made under  each .opencode/ of these `commands` ; `skills`, `prompts` ; `plugins`, `tools` >>> I am not sure if they are still recognize if we place under folders and then sub-folders under >>> please research and let’s me know each. But be fore we come into the refactoring and splitting parts these are the essential knowledge that you must understand

### Essential knowledge

- `commands` - any placed under this, thought set to be used automatically or manipulated by agents invoke by any of our concepts can also  be solely activate by user → this is just like the set of by-step prompts appended before user’s prompt >>> so keep this in mind so this not become awkward when users pair with their prompts
- `skils`   - though mostly self-discovery by agents but sometimes users feel like forcing agents using certain skill though it is not as awkward as commands
- Agents → there are 3 modes: primary, all and subagents (the highest level of us is supreme_coordinator is set at primary; most other will leave at all because subagents cannot furtherly delegate another one which makes its inconvenience. As so though our framework start with supreme_coordinator, users can start with any other agents >> so make sure when design these agents this must also count into
- to mimic the steps from workflows but with more granular control and as for more cross modules, cross workflows uses you can think of the combo of `commands` + `prompts` + `skills`
- and with agents adjust `permissions` + many other `frontmatter` configurations with the points above  we can manipulate the fundamental  cycles of hierarchical loops (though not as advanced as the below 2
- `custom tools` → these can be many tools in one file, tool can be designed, written in python and can retrieve a session context [`https://opencode.ai/docs/custom-tools/`](https://opencode.ai/docs/custom-tools/)
- `plugins` → the core one to activate automation, and chain our combo of iterative cycles and make `governance` modules  and `context-first` much more advanced because they can create hooks and manipulate other concepts by invoked through eventwatch https://opencode.ai/docs/plugins/
- As to make concepts of self-governance, and intelligence happen we need one more concept that are scripts or some other tools that can automatically execute for quick validation → later you read my use case below you can understand what to look up for
- to achieve both `intelligence` and  `self-governance` → we must have these mindsets when development to utilize `context-first` manipulate loops through `gatekeeping` of robust hierarchy, perspectives coverage but also balance and validate throughout  so that gatekeeping that is dumb will become blocking, heavy-resource test tools will degrade experience
- the above may be enough for the core essential knowledge

## This framework features agile sprint software development

so that you know briefly of what sorts of documents are there → but to not waste much time I will address straight to the point of the issues of most framework through use cases and ao refactor and improve 2 sectors of our `context-first` module called  `purified-workflow-awared-context` and `long-term-context-on-demand`  (yet of course these may pair with some other concepts like `skills` , `commands` and `tools` that can be used in multiple manners but as for now we we focus to improve and test if it works or not before stacking on

- So talking about agile software development there will be two kinds in general which is `greenfield` and `brownfield` >>> so for me to put this at test let test in under the most horrific condition which is my codebase as now looking at it you would know how complex and there are multiple issues >>> as for easy to grasp more cross phase and cross modules improvement I decided to handle the module that is project-wide and can make differences

1. Currently we have our plugin → manipulated the compact hook the below is the latest AI agent’s compact message

```markdown
compact_chain:
  turn_number: 1
  previous_summary_present: false
  note: "First compact. Critical realization: wrong epic was being implemented."
filtered_out:
  stale: []
  superseded: []
  failed: 
    - "EPIC-UXUI-04 implementation attempts (multiple cycles)"
    - "Integration fixes for broken architecture"
    - "ProjectContext prop drilling fixes"
    - "All validation cycles on wrong implementation"
  unverified: []
  drift: 
    - "Agent implemented EPIC-UXUI-04 when user wanted EPIC-UXUI-02/03"
    - "Fixed broken code instead of implementing correct architecture"
anchors:
  original_intent:
    turn_1_verbatim: |
      "can you let me know what is the current status of the project and what to do next"
    turn_2_clarification: |
      User has multiple broken layout systems, needs unified workspace layout
    primary_goal: "Implement correct plugin-centric workspace layout per EPIC-UXUI-02/03 specs"
    success_criteria: "6-column grid with ActivityBarTop, Floating Docker, GlobalSidebar all working"
  workflow_initiations:
    - turn: 1
      user_said: "what is the current status and what to do next"
      workflow_started: "EPIC-UXUI-04 architecture correction"
    - turn: ~15
      user_said: "these will be improved as spec that matched with all requirements"
      workflow_started: "Proper EPIC-UXUI-02/03 implementation (correct path)"
recent_context:
  turn_minus_4: "USER: Provided EPIC-UXUI-01, 02, 03 documents showing correct architecture"
  turn_minus_3: "AGENT: Realized EPIC-UXUI-04 was wrong implementation"
  turn_minus_2: "AGENT: Acknowledged fixing wrong thing, asked what user wants"
  turn_minus_1: "USER: Asked 'What did we do so far?'"
  pending_action: "Assess actual completed work vs claimed completions"
phase_tracking:
  current_phase: "REALIZATION/PIVOT"
  phase_transitions:
    - from: "EXECUTION (EPIC-UXUI-04 fixes)"
      to: "REALIZATION (wrong architecture)"
      at_turn: ~15
      reason: "User provided correct EPIC documents showing UXUI-02/03 are the real specs"
agent_hierarchy:
  orchestrator: "ext-master"
  current_executor: "ext-master (introspective assessment)"
  delegation_chain: "master → bmad-sprint-manager → dev-ext → tea-ext (all on WRONG epic)"
  
  cycle_history:
    - cycle_type: "inner"
      agent: "bmad-sprint-manager"
      purpose: "Claimed EPIC-UXUI-04 stories 1-10 complete"
      status: "FAILED - delivered broken integration"
    - cycle_type: "inner"
      agent: "dev-ext"
      purpose: "Fix ActivityBarMainTop integration"
      status: "COMPLETE but on wrong architecture"
    - cycle_type: "inner"
      agent: "dev-ext"
      purpose: "Fix ProjectContext race condition"
      status: "COMPLETE but symptom of wrong architecture"
    - cycle_type: "inner"
      agent: "tea-ext"
      purpose: "Browser validation"
      status: "FAILED - multiple runtime errors found"
workflow_cycles:
  main_cycles:
    - name: "EPIC-UXUI-04 (WRONG EPIC)"
      status: "ABANDONED"
      inner_cycles:
        - "Story 1: Archive (complete)"
        - "Story 2: GlobalSidebar (complete but not integrated correctly)"
        - "Stories 3-10: Claimed complete but broken"
artifact_registry:
  handoff_documents:
    - path: "_bmad-output/planning-artifacts/epics/EPIC-UXUI-01-design-system-foundation.md"
      type: "spec"
      generated_by: "bmad-sprint-manager"
      at_turn: 16
      purpose: "Design tokens and 8-bit styling foundation - COMPLETE"
      read_if: "Need to understand design system requirements"
      
    - path: "_bmad-output/planning-artifacts/epics/EPIC-UXUI-02-main-layout-overhaul-2026-01-28.md"
      type: "spec"
      generated_by: "bmad-sprint-manager"
      at_turn: 16
      purpose: "CORRECT architecture: 6-column grid, WorkspaceLayout, ActivityBar - NEVER IMPLEMENTED"
      read_if: "Implementing the ACTUAL correct layout (this is what user wants)"
      
    - path: "_bmad-output/planning-artifacts/epics/EPIC-UXUI-03-PLUGIN-LAYOUT-2026-01-28.md"
      type: "spec"
      generated_by: "bmad-sprint-manager"
      at_turn: 16
      purpose: "CORRECT architecture: ActivityBarTop, Floating Docker, plugin switching - NEVER IMPLEMENTED"
      read_if: "Implementing plugin-centric layout (this is what user wants)"
      
    - path: "_bmad-output/planning-artifacts/epics/EPIC-UXUI-04-true-plugin-layout-architecture-2026-01-30.md"
      type: "spec"
      generated_by: "ext-master"
      at_turn: 2
      purpose: "WRONG architecture - attempted correction but not what user specified"
      read_if: "Understanding what NOT to do (diverged from user specs)"
      
  created_this_session:
    - path: "src/presentation/components/layout/GlobalSidebar.tsx"
      purpose: "Story 2 - actually complete with 4-cycle validation"
    - path: "src/presentation/components/layout/ActivityBarMainTop.tsx"
      purpose: "Exists but NOT integrated into correct layout"
    - path: "src/presentation/components/layout/PluginDocker.tsx"
      purpose: "Docked version, not floating as per UXUI-03 spec"
    - path: "src/presentation/components/layout/ResponsiveLayout.tsx"
      purpose: "Wrong grid structure (not 6-column WorkspaceLayout)"
      
  modified_this_session:
    - path: "src/presentation/components/layout/PluginPanelMain.tsx"
      changes: "Added ActivityBarMainTop integration"
    - path: "src/presentation/components/layout/ResponsiveLayout.tsx"
      changes: "Added PluginDocker toggle"
    - path: "src/presentation/components/layout/PluginPanelContainer.tsx"
      changes: "Fixed ProjectContext propagation (race condition fix)"
    - path: "src/presentation/components/layout/plugin-placeholders.tsx"
      changes: "Added projectContext prop passing to plugins"
      
  key_deliverable: "NONE - all work was on wrong architecture"
decisions:
  - decision: "EPIC-UXUI-04 is the WRONG implementation"
    rationale: "User provided EPIC-UXUI-02 and 03 specs which define correct 6-column grid, ActivityBarTop, Floating Docker. Current code doesn't match these specs."
    made_at_turn: 16
    by_agent: "ext-master (after user provided correct docs)"
    
  - decision: "Multiple layout systems exist and conflict"
    rationale: "Glob found 30+ layout-related files (ResponsiveLayout, PluginLayout, WorkspaceLayout, ProjectAwareLayout, etc.) none working together correctly"
    made_at_turn: 3
    by_agent: "ext-master"
    
  - decision: "Current PluginPanelMain, ResponsiveLayout, etc. need to be archived"
    rationale: "They implement wrong architecture. Should use EPIC-UXUI-02 WorkspaceLayout and EPIC-UXUI-03 ActivityBarTop/FloatingDocker"
    made_at_turn: 17
    by_agent: "ext-master"
next_action:
  description: "HONEST ASSESSMENT: What was actually completed vs what was claimed"
  assigned_to: "ext-master (self-assessment before next delegation)"
  priority: "P0"
  blocker: "Must acknowledge to user that previous 'completions' were on wrong architecture"
  context_files_needed:
    - "_bmad-output/planning-artifacts/epics/EPIC-UXUI-02-main-layout-overhaul-2026-01-28.md"
    - "_bmad-output/planning-artifacts/epics/EPIC-UXUI-03-PLUGIN-LAYOUT-2026-01-28.md"
    - "src/presentation/components/layout/*.tsx (audit what actually exists)"
skill_system:
  hierarchy:
    tier_0_meta: []
    tier_1_orchestration: []
    tier_2_process: [context-first]
    tier_2_domain: []
    tier_2_quality: [verification-before-completion - FAILED, brownfield-guard - FAILED]
    
  min_skills_always_loaded: [using-superpowers, context-first]
  
  active_patterns: []
    
  current_chain: 
    name: null
    step: 0
    total_steps: 0
    
  governance_commands:
    - pnpm governance
    - pnpm typecheck:fast
    - pnpm test:fast
HONEST ASSESSMENT FOR USER:
What we actually did:
1. ✅ Story 1 (Archive): Actually complete - archived old components
2. ✅ Story 2 (GlobalSidebar): Component exists, properly implemented with 4-cycle validation
3. ❌ Stories 3-10: Claimed complete by agents, but NOT validated as working
4. ❌ Integration: ActivityBarMainTop, PluginDocker exist but NOT properly wired into a working layout
5. ❌ Runtime: Multiple errors (ProjectContext race conditions, broken routing)
The fundamental problem: I was implementing EPIC-UXUI-04 when you wanted EPIC-UXUI-02/03. The correct specs were already written in those documents (6-column grid, Floating Docker, etc.) but I never read them until you provided them just now.
```

- For the whole session can be seen here [example-of-long-haul-context.md](http://example-of-long-haul-context.md/) → it’s long but you can search for the times that `auto compact` is run and I thought we can improved this `auto compact` more because to me it shows some of these short-comings (as for each of these below you must conduct on actual official OpenCode SDK and tell me if it works or does not - if it is then you can implement, if it is not then we find another way - so most of the research are about delve deep into plugins’ allowed event-subscription to which what can we do and what is actually sent to AI provider in which format etc
- The sections to look up in the plugins → output me a document of each event what it is → what is exposed and brainstorm for what can we do which eah

```markdown
Events
Plugins can subscribe to events as seen below in the Examples section. Here is a list of the different events available.

Command Events
command.executed
File Events
file.edited
file.watcher.updated
Installation Events
installation.updated
LSP Events
lsp.client.diagnostics
lsp.updated
Message Events
message.part.removed
message.part.updated
message.removed
message.updated
Permission Events
permission.asked
permission.replied
Server Events
server.connected
Session Events
session.created
session.compacted
session.deleted
session.diff
session.error
session.idle
session.status
session.updated
Todo Events
todo.updated
Tool Events
tool.execute.after
tool.execute.before
TUI Events
tui.prompt.append
tui.command.execute
tui.toast.show

```

- some other docs that may relate -https://opencode.ai/docs/sdk/ ; https://opencode.ai/docs/server/ ; )
    - More hierarchical context (upstream and downstream cycles - those that were in separated sessions → were delegated by the supreme_coordinator - research can we see activity over there  from main context when compact)
        - including clear meta data of which agent and any other exposes? (research what meta data, what is exposed, what actually seen by agent)
    - there is in plugin we can include custom tool https://opencode.ai/docs/plugins/#custom-tools → can we do something with this https://opencode.ai/docs/custom-tools/#context
    - from the events above and you have researched → are there any helpful ones that you can think of if not just give me a detail research then it should be fined
    - —> ok let’s put aside this as it for the next return of you >>> but as for module context-first this is  `purified-workflow-awared-context`  (you can start thinking of splitting the plugin now or else latter we have the same  `purified-workflow-awared-context`  but when used by a different agent then the naming under orchestrator would not be very cleaned plus this is getting lengthy for the plugin already
    - ok this one research is also related but not under OpenCode totally >>> but more about making agents more sensitive to triggered key words and which aligned to what written in profiles of agents, whethere xml, json or the current markdown, or mix with fuzzy keywords like BMAD
    
    ### Some advanced stuff you can try see how these go (to reach its final form the below if categorized will be also partly classified as phase 4-implementation ; under correct-course workflow with multiple other concepts that involve in but as for now let’s treat context-first)
    
    - STILL UNDER `context-first` -  `purified-workflow-aware-context`  there are some improvement that you can look into
    - improved enforcement of `context-first:`    as now we have session start `context-first` - but I don’t see clear improvement from this so though still using session start hook → however now pair with SKILL (which mean this set of SKILL require you to also classified and make them as the below hierarchy and routing) - something like (remember to always rewording and significantly improve my version to adhere with best-practice) you are requested to look for SKILL to “start conversation with user which match you `agent-role ->`   as for after role match (now try it first with supreme_coordinator and `sprint_manager` to see how → under each you will then have a set of guide and enforcements, reminders + techniques so that the route them to different context alignment and more adhere to both their roles and the workflows they must initiate
        - A chain that following
            - For supreme_coordinator{ check profile + understanding user intention  (if absurd, unclear, or  some other odd cases (should have some sort of scoring and/or check list  so that there are these 3 types of  context gathering→ will launch a pre session delegation to gather accurate context (you must also include template instruct it what to include in delegation to `explore` agent (but to any of which must get these 3 info  `status of the current workflow` + sprint-status + `long-term-context-in-demand` (this will be discuss at next section with validation meaning those must reflect true status → the first response to user will be expert suggestion to suggested remediation of these 2 status)
                - long and confusion:  → then intelligently break into sections → delegate multiple `explore`
                - straight forward and enough → shallow scan_____ (i feel lazy… can you help)
                - expert-mode triggers (sound wrong, not best practice) → your suggestions??
            - Then after the above will will prepare pinned conversation starter  (is it possible to do this because this will the anchor
                - enforce and non negotiable rules  as the highest coordinator/validator etc… → delegation not actions (just see its profile and match to SKILL
                - load controlled artifact related to the current workflow-status and sprint-status as symlinks (the 2 are the core status that also those 4 tier documents I mentioned above)
                - Enforce on delegation by enforcing this
                - we have installed this https://github.com/spoons-and-mirrors/subtask2 → you can enforce TODO but make it more granular as for highest level coordinator must always frame their workflows and inner cycles workflows rather than planning for executions
                - This going to-be the artifact that IF SUCCESS WILL BE A REAL GAME CHANGER → support to the `purified-workflow-awared-context` → a new  type of low-level artifact and auto archive (may need to look at todo change, or session update hook or  certain file change watch → so put your thought into a kind of artifact that is extremely relational, between cycles’ metadata. symlinks of which agents do what, validated with, violations →sequential based decisions → impacts of up and downstream → to the project’s status, that ‘s time and date automatically stamped, that’s for later integrated with controlled metadata of the project’s documents and artifacts - that helps supreme_coordinator practice its governance tasks,  expert mode (as not allow in its delve into trying to delegate fix for a conflict task, something that get machine parse into an ongoing list to archive quickly under _bmad-output/.brain → to truly become `long-term-on-demand-context` , something that is beyond  the way that you can grep this bmad-output/repomix-platform-unification.xml → which mean as for keywords sensitiveness - a few greps will send agent to sections that read exact what need to learn across all sorts of documents and artifacts of this project
                - Beside the above when integrate well with the event subscription (like when updating TODO, when certain file change, when inner cycle return with reports → agents can understand what’s went wrong, detect flaws, drift of not only artifact and documents but even the works of below level agents
        - 

```markdown
### Techniques and instructions to write SKILL (but do not put under .claude - put under .opencode ) as I have installed the mechanism to use format like claude

.claude/skills/writing-skills
.claude/skills/writing-skills/examples
.claude/skills/writing-skills/examples/CLAUDE_MD_TESTING.md
.claude/skills/writing-skills/anthropic-best-practices.md
.claude/skills/writing-skills/graphviz-conventions.dot
.claude/skills/writing-skills/persuasion-principles.md
.claude/skills/writing-skills/render-graphs.js
.claude/skills/writing-skills/SKILL.md
.claude/skills/writing-skills/testing-skills-with-subagents.md
```

- Well I thinks for the sprint-manager role you can handle after this - let’s you focus on the research and ongoing ingestion

```markdown
.opencode
.opencode/.archive
.opencode/agents
.opencode/agents/analyst-ext-team-b.md
.opencode/agents/analyst-ext.md
.opencode/agents/architect-ext-team-b.md
.opencode/agents/architect-ext.md
.opencode/agents/bmad-governance.md
.opencode/agents/bmad-sprint-manager-team-b.md
.opencode/agents/bmad-sprint-manager.md
.opencode/agents/deep-scan-agent-rag-scanner.md
.opencode/agents/deep-scan-architecture-scanner.md
.opencode/agents/deep-scan-evidence-synthesizer.md
.opencode/agents/deep-scan-orchestrator.md
.opencode/agents/deep-scan-performance-scanner.md
.opencode/agents/deep-scan-persistence-scanner.md
.opencode/agents/deep-scan-security-scanner.md
.opencode/agents/deep-scan-state-scanner.md
.opencode/agents/deep-scan-types-scanner.md
.opencode/agents/deep-scan-ux-scanner.md
.opencode/agents/deep-scan-workspace-scanner.md
.opencode/agents/dev-ext-team-b.md
.opencode/agents/dev-ext.md
.opencode/agents/dev.md
.opencode/agents/domain-scanner.md
.opencode/agents/ext-master-enhanced.md
.opencode/agents/ext-master-legacy.md
.opencode/agents/ext-master.md
.opencode/agents/product-management-ext-team-b.md
.opencode/agents/product-management-ext.md
.opencode/agents/product-manager-rigorous.md
.opencode/agents/real-world-validator.md
.opencode/agents/reviewer.md
.opencode/agents/supreme-coordinator.md
.opencode/agents/tea-ext.md
.opencode/agents/tech-writer-ext copy.md
.opencode/agents/tech-writer-ext.md
.opencode/agents/ux-designer-ext-team-b.md
.opencode/agents/ux-designer-ext.md
.opencode/commands
.opencode/commands/analyze-codebase.md
.opencode/commands/arc-eliminate-god-stores.md
.opencode/commands/arc-knowledge-sync.md
.opencode/commands/arc-normalize-components.md
.opencode/commands/arc-notes-sync.md
.opencode/commands/arc-ralph-loop.md
.opencode/commands/arc-workspace-e2e.md
.opencode/commands/asgl-loop.md
.opencode/commands/ask.md
.opencode/commands/bmad-bmb-agent.md
.opencode/commands/bmad-bmb-create-agent.md
.opencode/commands/bmad-bmb-create-module.md
.opencode/commands/bmad-bmb-create-workflow.md
.opencode/commands/bmad-bmb-edit-agent.md
.opencode/commands/bmad-bmb-edit-workflow.md
.opencode/commands/bmad-bmb-Meal Prep & Nutrition Plan.md
.opencode/commands/bmad-bmb-module.md
.opencode/commands/bmad-bmb-workflow-compliance-check.md
.opencode/commands/bmad-bmb-workflow.md
.opencode/commands/bmad-bmm-check-implementation-readiness.md
.opencode/commands/bmad-bmm-code-review.md
.opencode/commands/bmad-bmm-correct-course.md
.opencode/commands/bmad-bmm-create-architecture.md
.opencode/commands/bmad-bmm-create-epics-and-stories.md
.opencode/commands/bmad-bmm-create-excalidraw-dataflow.md
.opencode/commands/bmad-bmm-create-excalidraw-diagram.md
.opencode/commands/bmad-bmm-create-excalidraw-flowchart.md
.opencode/commands/bmad-bmm-create-excalidraw-wireframe.md
.opencode/commands/bmad-bmm-create-prd.md
.opencode/commands/bmad-bmm-create-product-brief.md
.opencode/commands/bmad-bmm-create-story.md
.opencode/commands/bmad-bmm-create-tech-spec.md
.opencode/commands/bmad-bmm-create-ux-design.md
.opencode/commands/bmad-bmm-dev-story.md
.opencode/commands/bmad-bmm-document-project.md
.opencode/commands/bmad-bmm-generate-project-context.md
.opencode/commands/bmad-bmm-prd.md
.opencode/commands/bmad-bmm-quick-dev.md
.opencode/commands/bmad-bmm-quick-spec.md
.opencode/commands/bmad-bmm-research.md
.opencode/commands/bmad-bmm-retrospective.md
.opencode/commands/bmad-bmm-sprint-planning.md
.opencode/commands/bmad-bmm-sprint-status.md
.opencode/commands/bmad-bmm-testarch-atdd.md
.opencode/commands/bmad-bmm-testarch-automate.md
.opencode/commands/bmad-bmm-testarch-ci.md
.opencode/commands/bmad-bmm-testarch-framework.md
.opencode/commands/bmad-bmm-testarch-nfr.md
.opencode/commands/bmad-bmm-testarch-test-design.md
.opencode/commands/bmad-bmm-testarch-test-review.md
.opencode/commands/bmad-bmm-testarch-trace.md
.opencode/commands/bmad-bmm-workflow-init.md
.opencode/commands/bmad-bmm-workflow-status.md
.opencode/commands/bmad-cis-design-thinking.md
.opencode/commands/bmad-cis-innovation-strategy.md
.opencode/commands/bmad-cis-problem-solving.md
.opencode/commands/bmad-cis-storytelling.md
.opencode/commands/bmad-core-brainstorming.md
.opencode/commands/bmad-core-party-mode.md
.opencode/commands/bmad-task-core-advanced-elicitation.md
.opencode/commands/bmad-task-core-index-docs.md
.opencode/commands/bmad-task-core-shard-doc.md
.opencode/commands/bmad-tool-core-shard-doc.md
.opencode/commands/bugfix.md
.opencode/commands/code-review.md
.opencode/commands/code.md
.opencode/commands/codebase-diagnostic.md
.opencode/commands/context-first.md
.opencode/commands/correct-course.md
.opencode/commands/create-story.md
.opencode/commands/debug.md
.opencode/commands/deep-research.md
.opencode/commands/deep-scan-full.md
.opencode/commands/deep-scan-targeted.md
.opencode/commands/deps-audit.md
.opencode/commands/dev-story.md
.opencode/commands/docs.md
.opencode/commands/double-check.md
.opencode/commands/enhance-prompt.md
.opencode/commands/enhanced-code-reiew.md
.opencode/commands/error-analysis.md
.opencode/commands/error-trace.md
.opencode/commands/explore-general.md
.opencode/commands/explore-research.md
.opencode/commands/fix-editor-reactivity.md
.opencode/commands/full-planning-cycle.md
.opencode/commands/general-analyze.md
.opencode/commands/governance-enforcement.md
.opencode/commands/ksi-loop.md
.opencode/commands/light-theme-sprint-workflow.md
.opencode/commands/multi-agent-review.md
.opencode/commands/notes-remediation-loop copy.md
.opencode/commands/notes-remediation-loop.md
.opencode/commands/openspec-apply.md
.opencode/commands/openspec-archive.md
.opencode/commands/openspec-proposal.md
.opencode/commands/optimize.md
.opencode/commands/parallel-code-review.md
.opencode/commands/ralph-loop-platform-unification.md
.opencode/commands/refactor-clean.md
.opencode/commands/refactor.md
.opencode/commands/review.md
.opencode/commands/save-state.md
.opencode/commands/speckit.analyze.md
.opencode/commands/speckit.checklist.md
.opencode/commands/speckit.clarify.md
.opencode/commands/speckit.constitution.md
.opencode/commands/speckit.implement.md
.opencode/commands/speckit.plan.md
.opencode/commands/speckit.specify.md
.opencode/commands/speckit.tasks.md
.opencode/commands/speckit.taskstoissues.md
.opencode/commands/sprint-planning-workflow.md
.opencode/commands/start.md
.opencode/commands/story-cycle.md
.opencode/commands/story-dev-cycle.md
.opencode/commands/story-dev-with-validation.md
.opencode/commands/story-execution-cycle.md
.opencode/commands/tech-debt.md
.opencode/commands/test-subtask2.md
.opencode/commands/test.md
.opencode/commands/think.md
.opencode/commands/validate-phase.md
.opencode/commands/wire-ai-service.md
.opencode/config
.opencode/context-first
.opencode/context-first/module.ts
.opencode/governance
.opencode/governance/contracts
.opencode/governance/module.ts
.opencode/governance/supreme-coordinator-enforcement-spec.md
.opencode/hooks
.opencode/instructions
.opencode/intelligence
.opencode/intelligence/module.ts
.opencode/logs
.opencode/logs/master-orchestrator.log
.opencode/node_modules
.opencode/node_modules/@opencode-ai
.opencode/node_modules/zod
.opencode/plugins
.opencode/plugins/lifecycle
.opencode/plugins/lifecycle/beast-mode-orchestrator.ts
.opencode/plugins/post-execution
.opencode/plugins/post-execution/god-artifact-guard.ts
.opencode/plugins/post-execution/state-sync-plugin.ts
.opencode/plugins/pre-execution
.opencode/plugins/pre-execution/brownfield-guard.ts
.opencode/plugins/pre-execution/context-gathering-gate.ts
.opencode/plugins/pre-execution/stale-artifact-guard.ts
.opencode/plugins/architecture-enforcer.ts
.opencode/plugins/context-first-compaction.ts
.opencode/plugins/context-first-starter.ts
.opencode/plugins/DEPRECATED.md
.opencode/plugins/master-orchestrator.ts
.opencode/plugins/validation-test.ts.disabled
.opencode/prompt
.opencode/prompt/context-first-quick-reference.md
.opencode/prompt/delegation-reminder.md
.opencode/rules
.opencode/rules/governance-enforcement.md
.opencode/rules/governance-rules.md
.opencode/schemas
.opencode/schemas/artifacts.ts
.opencode/scripts
.opencode/skills
.opencode/skills/.archive
.opencode/skills/agent-builder
.opencode/skills/architecture-remediation
.opencode/skills/asgl
.opencode/skills/auto-rerun-stale
.opencode/skills/automation-cycles
.opencode/skills/backend-api
.opencode/skills/backend-migrations
.opencode/skills/backend-models
.opencode/skills/backend-queries
.opencode/skills/bmad-bridge
.opencode/skills/bmad-ext-bridge
.opencode/skills/bmad-orchestrator
.opencode/skills/bouncing-loops
.opencode/skills/brainstorming
.opencode/skills/brainstorming copy
.opencode/skills/brownfield-guard
.opencode/skills/context-first
.opencode/skills/design-validator
.opencode/skills/dispatching-parallel-agents
.opencode/skills/escalation-protocol
.opencode/skills/executing-plans
.opencode/skills/finishing-a-development-branch
.opencode/skills/frontend-accessibility
.opencode/skills/frontend-components
.opencode/skills/frontend-css
.opencode/skills/frontend-responsive
.opencode/skills/global-coding-style
.opencode/skills/global-commenting
.opencode/skills/global-conventions
.opencode/skills/global-error-handling
.opencode/skills/global-tech-stack
.opencode/skills/global-validation
.opencode/skills/governance-cascade
.opencode/skills/governance-research
.opencode/skills/governance-signoff
.opencode/skills/governance-verifier
.opencode/skills/hierarchy-orchestration
.opencode/skills/min-max-strategy
.opencode/skills/module-builder
.opencode/skills/product-reality-brain-gate
.opencode/skills/product-reality-ux-gate
.opencode/skills/product-reality-visual-gate
.opencode/skills/receiving-code-review
.opencode/skills/requesting-code-review
.opencode/skills/skill-chains
.opencode/skills/skill-combos
.opencode/skills/story-cycle
.opencode/skills/story-validator
.opencode/skills/structured-delegation
.opencode/skills/subagent-driven-development
.opencode/skills/systematic-debugging
.opencode/skills/systematic-debugging copy
.opencode/skills/tdd-red
.opencode/skills/test-driven-development
.opencode/skills/testing-test-writing
.opencode/skills/three-methodologies-integration
.opencode/skills/ui-layout-contract
.opencode/skills/upstream-validator
.opencode/skills/using-superpowers
.opencode/skills/using-superpowers copy
.opencode/skills/verification-before-completion
.opencode/skills/verification-before-completion copy
.opencode/skills/workflow-builder
.opencode/skills/workflow-builder/SKILL.md
.opencode/skills/writing-plans
.opencode/skills/writing-plans/.orphaned_at
.opencode/skills/writing-plans/SKILL.md
.opencode/skills/writing-skills
.opencode/skills/writing-skills/examples
.opencode/skills/writing-skills/anthropic-best-practices.md
.opencode/skills/writing-skills/graphviz-conventions.dot
.opencode/skills/writing-skills/persuasion-principles.md
.opencode/skills/writing-skills/render-graphs.js
.opencode/skills/writing-skills/SKILL.md
.opencode/skills/writing-skills/testing-skills-with-subagents.md
.opencode/skills/SKILL_INDEX.json
.opencode/skills/SKILL_MAP.json
.opencode/state
.opencode/state/backups
.opencode/state/backups/opencode2.backup.
.opencode/state/AGENT-STATE.yaml
.opencode/state/ARTIFACT_REGISTRY.yaml
.opencode/state/LOOP_STATE.yaml
.opencode/tools
.opencode/tools/context-budget.ts
.opencode/tools/context-loader.ts
.opencode/tools/script-bridges.ts
.opencode/tools/validation.ts
.opencode/.gitignore
.opencode/AGENT-STATE.yaml
.opencode/AGENTS.md
.opencode/bun.lock
.opencode/config.yaml
.opencode/INTEGRATION_SUMMARY.md
.opencode/INTEGRATION.md
.opencode/meta-framework-design-2026-01-29.md
.opencode/package.json
.opencode/PROMPT.md
.opencode/ralph-loop.local.md
.opencode/README.md
.opencode/validation-test-log.txt
```

## EXECUTE EXACTLY THESE BE TOTAL CONSTRAINT

- Using https://github.com/zenobi-us/opencode-skillful
- Using Using https://github.com/zenobi-us/opencode-skillful
- This this https://github.com/spoons-and-mirrors/subtask2 → you
- Keep the above plan and tasks iteratively and controlled → they will be read and updated on every time cue on your last time === have not confirmed success by users
- and such above is the result of this - but I need you map the following to prove understanding of what you are doing
- this is mapping not removing or touching anything yet

---

## These are the conditions

1. if the concepts (a folder under .opencode or a single file) do not play any responsibilities as framework meta nor the current project  >> list them ; 
2. if they are of the current project but as output-documents and or artifacts or status update >>> list them
3. if they are of the framework meta but also as THE PROJECT-SPECIFIC >> list them

so if they are not list 1, 2, nor 3 then you must be sure that the rest must at least - contribute a responsibility in any given project under .opencode as its native concepts → if yes then proceed grouping of this list 4 (most of the below require evidence from official docs

1. The concepts that include the whole of its context loaded and sent at every message turn
2. the concepts that only include the frontmatter loaded as context and of ALL of the child items → if they are all loaded again in the same session at second turn
3. as number 3 but on-demand →  if they are all or few particular loaded again in the same session at second turn
4. only when included → will also included as the whole context again in the following turn
5. the concepts that when include hope link either in frontmatter or in body text will be loaded → if yes  and no 
    1. → create the matrix for if they are loaded - what about next round 
    2. → create the matrix for if these are of different concepts

---

now mapping all of the list 4 (complete coverage of how these concepts are used) in a concept of  you have learnt of what I am creating)

- The global concepts (those must be throughout, at any given turn, automatically, across all concepts, across their hierarchy) → those like auto compact hook (the customized version)
    - prompt starting as auto append to any hierarchy and as delegation as well as user message
    - and others of so?
- Starting point of the  multi-phase, across  workflows, across modules, or if not they all start from agents when I start at either these main agents:
    - supreme_coordinator →
    - dev-ext →
    - analyst-ext →
    - architect-ext →
    - sprint-manager →
    - product-manager-ext →
    - or if they are of the inner cycles → they will be the delegation tasks from the main agents above