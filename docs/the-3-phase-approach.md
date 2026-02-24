# Overview

the below is the overall roadmap of these architecture shifts so that you can briefly understand the bigger land-scape

# 📊 STRATEGIC SYNTHESIS: Validation of Your Approaches

Now that all 5 research tasks are complete, I'll synthesize the findings against your intended approaches in `new-fundamental-truths.md`.

## Executive Validation Summary

| Your Intended Approach | Research Verdict | Score | Notes |
| --- | --- | --- | --- |
| **Project-Centric Architecture** | ✅ **VALID - Best Practice** | 9/10 | Clean separation, single source of truth |
| **Platform-Aware Plugin Selection** | ✅ **VALID - Industry Standard** | 9/10 | VS Code model validated |
| **FSA for Desktop + Dexie for Mobile** | ✅ **VALID - Optimal** | 10/10 | Research confirms this is the correct pattern |
| **TanStack AI SDK for All LLM Calls** | ⚠️ **RECONSIDER** | 6/10 | Vercel AI SDK has better client tooling |
| **Orchestrator + Domain Agents Pattern** | ✅ **VALID - Best Practice** | 9/10 | Matches proven patterns |
| **Thread per Project with Compaction** | ✅ **VALID** | 8/10 | Add pattern-based compaction |
| **BYOK with Web Crypto Encryption** | ✅ **VALID - Secure** | 8/10 | Follow OWASP guidelines |

---

<aside>
💡

HOWEVER; I feel these should be approached with more granular and end-to-end migrations - following these concrete factors:

1. **Progressive and Complete Refactor and Migration:** → meaning when designing an EPIC and double-check down to → creation of `story` and `story-context` → new code files, slices, structure and/or domains must all be registered and monitored → as so there will be:
    1. list of  100%-safe-to-archive either `code files` or `partial, sectional of in-file code` → have these deeply scanned, track with import, export, and consumptions project-wide → make dev-notes in story-related section so that dev-team can then validate once again to make complete removal and/or archiving files to prevent any legacy poisoned context
    2. another list of partially legacy → make comment notice + documents and track these files → making forecast for either of these following decisions:
        1. will become `the-a-list-to-100%-safe-to-remove` at which epics and/or stories → keeping them on tracking file
        2. will need `adaptive modification of other code files to fit` → which ones? and are there epics and stories that addressed or will address such?
    3. be very careful of `highly-inconsistent-items` (things like types, properties, arguments of schema and data models those with relationships) → these tend to create scattered, overlapping, redundancies, and even conflicts → so keep in mind of our architecture shifts are to refactored + restructure with consolidation and centralization while improve data managements (hence reduce a chunky 2000+ files codebase down to 1000+ files)
    
2. **End-to-end with complete reworks of related slices, domains and code files** →

as both your above research and investigation and the [`new-fundamental-truths.md`](http://new-fundamental-truths.md/) has addressed  of the roadmap for related slices and domains that would properly need complete `reworks`and `redesigns` → so handle the up-coming ADR; Epics more strategically → each epic should totally demonstrate at least a complete end-to-end user journey toward a core feature with zero gaps, zero drifts, nor debts, nor conflicts nor overlapping trash files

1. Greater control over granular implementation tasks → more analysis and 
- investigation before creation of an epic → these (especially those related to the ai-related, tools, agents, multimodality, complex data flow) should be designed under the principles of “complexity layering” + “trial-errors with human feedbacks” → this means instead of wasting-time on nonsensical guardrails and patching of typescript errors
- when addressing problems with research and codebase investigation → conduct both horizontal and vertical approaches → making sure to maximize all capabilities and tools related to `search` groups as `grep`, `glob`, `list`, serena mcp, search tools, commands to list complete tree of code files, apply critical thinking and high reasoning caps → think about naming conventions, synonyms can be cases that create overlapping code files if not thoroughly assessed

</aside>

# The 3-phase approach

the below are just my very bare-bone skeleton of each phase and very few bullet points as requirements → your job is to conduct thorough investigation to complete each phase with clear-defined requirements, acceptance criteria, other measurable indicators, evidences and complete back-links references across documents, artifacts, tracking files, governance artifacts, status files etc.

## Phase 1A: The non-ai core & foundational set up

from now on I don’t want to keep repeating the complete end-to-end or having to list the related entities of the same slices/domains.

- All of the project-related features - from creation of the new one, accessing the created projects, routing, id, ux and ui, and scope toward different devices → must be stable, contains no legacy nor confusing context (even the ux and ui)
- From project to each plugin and to plugins across each other: data mapping, responsibilities of each plugin, states vs. persistence and reactive + the sequence and orders of calls ; toward CRUD capabilities from users; eventbus managements, files synchronization, mirroring and rendering etc of the following entities:
    - Terminal and the Webcontainer API to creation of sandboxing environment → terminal can run actual commands
    - Monaco editor - hot load reactive with syntax highlights of different languages and file types → auto saved and synchronize to file system
    - filetree + the project - this is of the group of always-loaded-plugin → snapshots to help with incremental sync instead of starting from the beginning ; persistent permission per project; support nested project; support most file types and take all files of folder and child sub-folders to the deepest level. Project can load almost instantaneously from selection → this selector is synchronized with the projects that have been created
    - preview → can run preview such as `pnpm dev` to open preview in an embedding window

—>> I may not address a complete list from the above ; but in-short the above plugins when paired and loaded together can offer the essential VS-code-like non-ai IDE features on the browser

## Phase 1B: the BYOK and Note features

please refer to [`new-fundamental-truths.md`](http://new-fundamental-truths.md/) for these 2 designs  and complete the list

-

-

-

## Phase 2: Chat cascade vs. thread managements and the agents concepts

this will be done later as I need to decide and research more indepth toward Vercel AI SDK vs. Tanstack AI  and LangGraph

-

-

-

-

## Phase 3: the advanced combined concepts of cross-plugins, multi agentic patterns, tooling and patterns vs. RAG

-

-

-

-

<aside>
💡

All the Phase 2 and phase 3 should be address following “complexity layering” + “trial-errors with human feedbacks” → at most of them should be trial with a quick prototype of end-to-end then field test with `real-life-cases` as I will directly in-charge of the testing cases. 

</aside>

# Common pitfalls

1. Lacking  in-depth understanding of workflows VS. the 4 phases >>> the below `tree` can show you are more overview of the 4 phases and BMAD workflows (as workflows are usually run with `commands` or `skill` by domain-specialist agents

```markdown
> tree
.
├── 1-analysis
│   ├── create-product-brief
│   │   ├── product-brief.template.md
│   │   ├── steps
│   │   │   ├── step-01-init.md
│   │   │   ├── step-01b-continue.md
│   │   │   ├── step-02-vision.md
│   │   │   ├── step-03-users.md
│   │   │   ├── step-04-metrics.md
│   │   │   ├── step-05-scope.md
│   │   │   └── step-06-complete.md
│   │   └── workflow.md
│   └── research
│       ├── domain-steps
│       │   ├── step-01-init.md
│       │   ├── step-02-domain-analysis.md
│       │   ├── step-03-competitive-landscape.md
│       │   ├── step-04-regulatory-focus.md
│       │   ├── step-05-technical-trends.md
│       │   └── step-06-research-synthesis.md
│       ├── market-steps
│       │   ├── step-01-init.md
│       │   ├── step-02-customer-behavior.md
│       │   ├── step-02-customer-insights.md
│       │   ├── step-03-customer-pain-points.md
│       │   ├── step-04-customer-decisions.md
│       │   ├── step-05-competitive-analysis.md
│       │   └── step-06-research-completion.md
│       ├── research.template.md
│       ├── technical-steps
│       │   ├── step-01-init.md
│       │   ├── step-02-technical-overview.md
│       │   ├── step-03-integration-patterns.md
│       │   ├── step-04-architectural-patterns.md
│       │   ├── step-05-implementation-research.md
│       │   └── step-06-research-synthesis.md
│       └── workflow.md
├── 2-plan-workflows
│   ├── create-ux-design
│   │   ├── steps
│   │   │   ├── step-01-init.md
│   │   │   ├── step-01b-continue.md
│   │   │   ├── step-02-discovery.md
│   │   │   ├── step-03-core-experience.md
│   │   │   ├── step-04-emotional-response.md
│   │   │   ├── step-05-inspiration.md
│   │   │   ├── step-06-design-system.md
│   │   │   ├── step-07-defining-experience.md
│   │   │   ├── step-08-visual-foundation.md
│   │   │   ├── step-09-design-directions.md
│   │   │   ├── step-10-user-journeys.md
│   │   │   ├── step-11-component-strategy.md
│   │   │   ├── step-12-ux-patterns.md
│   │   │   ├── step-13-responsive-accessibility.md
│   │   │   └── step-14-complete.md
│   │   ├── ux-design-template.md
│   │   └── workflow.md
│   └── prd
│       ├── data
│       │   ├── domain-complexity.csv
│       │   ├── prd-purpose.md
│       │   └── project-types.csv
│       ├── domain-complexity.csv.bak
│       ├── project-types.csv.bak
│       ├── steps
│       ├── steps-c
│       │   ├── step-01-init.md
│       │   ├── step-01b-continue.md
│       │   ├── step-02-discovery.md
│       │   ├── step-03-success.md
│       │   ├── step-04-journeys.md
│       │   ├── step-05-domain.md
│       │   ├── step-06-innovation.md
│       │   ├── step-07-project-type.md
│       │   ├── step-08-scoping.md
│       │   ├── step-09-functional.md
│       │   ├── step-10-nonfunctional.md
│       │   ├── step-11-polish.md
│       │   └── step-12-complete.md
│       ├── steps-e
│       │   ├── step-e-01-discovery.md
│       │   ├── step-e-01b-legacy-conversion.md
│       │   ├── step-e-02-review.md
│       │   ├── step-e-03-edit.md
│       │   └── step-e-04-complete.md
│       ├── steps-v
│       │   ├── step-v-01-discovery.md
│       │   ├── step-v-02-format-detection.md
│       │   ├── step-v-02b-parity-check.md
│       │   ├── step-v-03-density-validation.md
│       │   ├── step-v-04-brief-coverage-validation.md
│       │   ├── step-v-05-measurability-validation.md
│       │   ├── step-v-06-traceability-validation.md
│       │   ├── step-v-07-implementation-leakage-validation.md
│       │   ├── step-v-08-domain-compliance-validation.md
│       │   ├── step-v-09-project-type-validation.md
│       │   ├── step-v-10-smart-validation.md
│       │   ├── step-v-11-holistic-quality-validation.md
│       │   ├── step-v-12-completeness-validation.md
│       │   └── step-v-13-report-complete.md
│       ├── templates
│       │   └── prd-template.md
│       ├── validation-report-prd-workflow.md
│       └── workflow.md
├── 3-solutioning
│   ├── check-implementation-readiness
│   │   ├── steps
│   │   │   ├── step-01-document-discovery.md
│   │   │   ├── step-02-prd-analysis.md
│   │   │   ├── step-03-epic-coverage-validation.md
│   │   │   ├── step-04-ux-alignment.md
│   │   │   ├── step-05-epic-quality-review.md
│   │   │   └── step-06-final-assessment.md
│   │   ├── templates
│   │   │   └── readiness-report-template.md
│   │   └── workflow.md
│   ├── create-architecture
│   │   ├── architecture-decision-template.md
│   │   ├── data
│   │   │   ├── domain-complexity.csv
│   │   │   ├── domain-complexity.csv.bak
│   │   │   ├── project-types.csv
│   │   │   └── project-types.csv.bak
│   │   ├── steps
│   │   │   ├── step-01-init.md
│   │   │   ├── step-01b-continue.md
│   │   │   ├── step-02-context.md
│   │   │   ├── step-03-starter.md
│   │   │   ├── step-04-decisions.md
│   │   │   ├── step-05-patterns.md
│   │   │   ├── step-06-structure.md
│   │   │   ├── step-07-validation.md
│   │   │   └── step-08-complete.md
│   │   └── workflow.md
│   └── create-epics-and-stories
│       ├── steps
│       │   ├── step-01-validate-prerequisites.md
│       │   ├── step-02-design-epics.md
│       │   ├── step-03-create-stories.md
│       │   └── step-04-final-validation.md
│       ├── templates
│       │   └── epics-template.md
│       └── workflow.md
├── 4-implementation
│   ├── architectural-consolidation
│   │   ├── steps
│   │   │   ├── step-01-init.md
│   │   │   ├── step-02-provider-foundation.md
│   │   │   ├── step-03-agent-vault.md
│   │   │   ├── step-04-chat-unification.md
│   │   │   └── step-05-phase0-validation.md
│   │   └── workflow.yaml
│   ├── code-review
│   │   ├── checklist.md
│   │   ├── instructions.xml
│   │   ├── instructions.xml.bak
│   │   └── workflow.yaml
│   ├── correct-course
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── create-story
│   │   ├── checklist.md
│   │   ├── instructions.xml
│   │   ├── instructions.xml.bak
│   │   ├── template.md
│   │   └── workflow.yaml
│   ├── dev-story
│   │   ├── checklist.md
│   │   ├── instructions.xml
│   │   ├── instructions.xml.bak
│   │   └── workflow.yaml
│   ├── retrospective
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── sprint-planning
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   ├── sprint-status-template.yaml
│   │   └── workflow.yaml
│   └── sprint-status
│       ├── instructions.md
│       └── workflow.yaml
├── bmad-quick-flow
│   ├── create-tech-spec
│   ├── quick-dev
│   │   ├── steps
│   │   │   ├── step-01-mode-detection.md
│   │   │   ├── step-02-context-gathering.md
│   │   │   ├── step-03-execute.md
│   │   │   ├── step-04-self-check.md
│   │   │   ├── step-05-adversarial-review.md
│   │   │   └── step-06-resolve-findings.md
│   │   └── workflow.md
│   └── quick-spec
│       ├── steps
│       │   ├── step-01-understand.md
│       │   ├── step-02-investigate.md
│       │   ├── step-03-generate.md
│       │   └── step-04-review.md
│       ├── tech-spec-template.md
│       └── workflow.md
├── codebase-diagnostic
│   ├── steps
│   │   ├── step-01-structure.md
│   │   ├── step-02-journeys.md
│   │   ├── step-03-dataflow.md
│   │   ├── step-04-performance.md
│   │   ├── step-05-features.md
│   │   ├── step-06-integration.md
│   │   └── step-07-synthesis.md
│   └── workflow.md
├── document-project
│   ├── checklist.md
│   ├── documentation-requirements.csv
│   ├── documentation-requirements.csv.bak
│   ├── instructions.md
│   ├── templates
│   │   ├── deep-dive-template.md
│   │   ├── index-template.md
│   │   ├── project-overview-template.md
│   │   ├── project-scan-report-schema.json
│   │   ├── project-scan-report-schema.json.bak
│   │   └── source-tree-template.md
│   ├── workflow.yaml
│   └── workflows
│       ├── deep-dive-instructions.md
│       ├── deep-dive.yaml
│       ├── full-scan-instructions.md
│       └── full-scan.yaml
├── excalidraw-diagrams
│   ├── _shared
│   │   ├── excalidraw-library.json
│   │   ├── excalidraw-library.json.bak
│   │   └── excalidraw-templates.yaml
│   ├── create-dataflow
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── create-diagram
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── create-flowchart
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   └── create-wireframe
│       ├── checklist.md
│       ├── instructions.md
│       └── workflow.yaml
├── generate-project-context
│   ├── project-context-template.md
│   ├── steps
│   │   ├── step-01-discover.md
│   │   ├── step-02-generate.md
│   │   └── step-03-complete.md
│   └── workflow.md
├── testarch
│   ├── atdd
│   │   ├── atdd-checklist-template.md
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── automate
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── ci
│   │   ├── checklist.md
│   │   ├── github-actions-template.yaml
│   │   ├── gitlab-ci-template.yaml
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── framework
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   └── workflow.yaml
│   ├── nfr-assess
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   ├── nfr-report-template.md
│   │   └── workflow.yaml
│   ├── test-design
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   ├── test-design-template.md
│   │   └── workflow.yaml
│   ├── test-review
│   │   ├── checklist.md
│   │   ├── instructions.md
│   │   ├── test-review-template.md
│   │   └── workflow.yaml
│   └── trace
│       ├── checklist.md
│       ├── instructions.md
│       ├── trace-template.md
│       └── workflow.yaml
├── tree.md
├── tree.xml
└── workflow-status
    ├── init
    │   ├── instructions.md
    │   └── workflow.yaml
    ├── instructions.md
    ├── paths
    │   ├── enterprise-brownfield.yaml
    │   ├── enterprise-greenfield.yaml
    │   ├── method-brownfield.yaml
    │   └── method-greenfield.yaml
    ├── project-levels.yaml
    ├── workflow-status-template.yaml
    └── workflow.yaml
```

1. some BMAD workflows execution as certain events of a specific phase, stage of workflow-step (most of these are event-watch workflows executions - requiring BMAD-Master as orchestrator and coordinator to initiate as events detected). Those can be these
    1. `*correct-course` workflow >> this workflow can happen in phase-4 `the implementation` → and as these are to address bugs, errors as they are detected → However, if played strictly by the `BMAD-play-book` - these can be either `story-level` - `epic-level` or `architecture-level` (as higher up more linked artifacts, documents, workflows must be executed to make updates, remediation of the artifacts and controlled documents first 
    2. `*retrospective` workflow >> this belongs to phase 4 >> continue filling this
    3. `*sprint-planning` → help me fill this
    4. the rest of the status updating and validation workflows 
    5. the updates and governance workflows to make sure artifacts, documents, are up-to-date, consolidated, clear-off poisoned context
2. Lacking of organizing and cross-checking; cross-validating for integrations; completions; hierarchical alignments;  non-governance and mis-matched of meta data of key indicators , measures of success metrics, acceptance criteria, requirements of both functional and non-functional, edge cases etc (following sprint and agile project development). And the above lacks and inefficiently updated manners happen for the following entities
    1.   artifacts, documents of the lower-level phase (phase-4) - and their higher-up-phase (Phase 3 and phase 2) controlled  documents - these are tons of flows when mentioning this sector:
        1. the core and governance (of phase 2 and  phase 3 planning and solution workflows) documents are these following the phase 2: `prd.md` → [`ux-specification.md`](http://ux-specification.md) (optional in BMAD but required in our project)  then phase 3: [`architecture.md`](http://architecture.md) → `epics.md`(this include epics and stories and are extracted and derived from the previous 3 with all the meta data as I mentioned above ) — — SO, IN OTHER WORDS → these must always be checked and make upstream links, cross-referenced, with iterations of sections as level of changes happens in the project → these are the single-source-of-truth >> hence, only making updates and iterations and are located at `_bmad-output/planning-artifacts`
        2. the above core documents are glued hierarchically by their related artifacts → but as these are wildly numbered, naming with all sorts of what come up to the agents’ mind → heavily context poisoning PLUS the main cause of incomplete address so
            1. ADR documents → directly impact the [architecture.md](http://architecture.md) (so hand down this must make a section of log and updates → besides as ADR documents will resultin new epics (or additional stories to a planned epic) → not only *sprint-planning must be running to make relevant and oneness update to sprint-status.yaml → but also references into [epics.md](http://epics.md) and [prd.md](http://prd.md) (to the requirements sections) need to consider too
            2. as so any sort of new epics or stories introduced as remediation or feature-add-in → these must be run with sprint-planning, audit and recompile the related documents and artifacts
        3. and so many more but you may understand why this trouble some full of [dot.md](http://dot.md) files in `_bmad-output` are the causes and those are all from the neglected and careless works of you and the agents teams