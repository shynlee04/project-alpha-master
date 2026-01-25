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