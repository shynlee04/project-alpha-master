---
trigger: always_on
---

## Project Overview

**Via-gent** is a browser-based IDE that runs code locally using WebContainers. It provides:
- Monaco Editor for code editing with tabbed interface
- xterm.js-based terminal integrated with WebContainers
- Bidirectional file sync between local File System Access API and WebContainers
- Multi-language support (English, Vietnamese) with i18next
- Project persistence via IndexedDB
- React 19 + TypeScript + Vite + TanStack Router stack

## Essential Development Commands

```bash
# Start development server (port 3000 with cross-origin isolation headers)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test

# Extract translation keys
pnpm i18n:extract
```

## Dependencies Github repos and docs links:
Based on my research, here's a comprehensive list of official documentation and GitHub repository links for your stack dependencies:

## Core UI & Component Libraries

### @radix-ui (Dialog, Dropdown Menu, Label, Select, Separator, Slot, Switch, Tabs)
- **Docs**: [https://www.radix-ui.com/primitives](https://www.radix-ui.com/primitives)[1]
- **GitHub**: [https://github.com/radix-ui/primitives](https://github.com/radix-ui/primitives)[2]

### @monaco-editor/react
- **Docs**: [https://github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)[3]
- **GitHub**: [https://github.com/suren-atoyan/monaco-react](https://github.com/suren-atoyan/monaco-react)[3]

### monaco-editor
- **Docs**: [https://microsoft.github.io/monaco-editor/](https://microsoft.github.io/monaco-editor/)[4]
- **GitHub**: [https://github.com/microsoft/monaco-editor](https://github.com/microsoft/monaco-editor)[5]

### lucide-react
- **Docs**: [https://lucide.dev](https://lucide.dev)[6]
- **GitHub**: [https://github.com/lucide-icons/lucide](https://github.com/lucide-icons/lucide)[7]

## Styling & Theming

### tailwindcss & @tailwindcss/vite
- **Docs**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)[8]
- **GitHub**: [https://github.com/tailwindlabs/tailwindcss.com](https://github.com/tailwindlabs/tailwindcss.com)[9]

### class-variance-authority
- **Docs**: [https://cva.style](https://cva.style)[10]
- **GitHub**: [https://github.com/joe-bell/cva](https://github.com/joe-bell/cva)[10]

### next-themes
- **Docs**: [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)[11]
- **GitHub**: [https://github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes)[11]

### clsx & tailwind-merge
- **clsx GitHub**: [https://github.com/lukeed/clsx](https://github.com/lukeed/clsx)
- **tailwind-merge GitHub**: [https://github.com/dcastil/tailwind-merge](https://github.com/dcastil/tailwind-merge)

## TanStack Ecosystem

### @tanstack/react-router, @tanstack/react-router-devtools, @tanstack/react-router-ssr-query, @tanstack/react-start, @tanstack/router-plugin
- **Docs**: [https://tanstack.com/router](https://tanstack.com/router)[12]
- **GitHub**: [https://github.com/TanStack/router](https://github.com/TanStack/router)[13]

### @tanstack/ai, @tanstack/ai-gemini, @tanstack/ai-react
- **Docs**: [https://tanstack.com/ai](https://tanstack.com/ai)[14]
- **GitHub**: [https://github.com/TanStack/ai](https://github.com/TanStack/ai)[15]

### @tanstack/store
- **Docs**: [https://tanstack.com](https://tanstack.com)[16]
- **GitHub**: [https://github.com/TanStack](https://github.com/TanStack)

### @tanstack/react-devtools
- **Docs**: [https://tanstack.com](https://tanstack.com)[16]
- **GitHub**: [https://github.com/TanStack](https://github.com/TanStack)

## Data & State Management

### zustand
- **Docs**: [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)[17]
- **GitHub**: [https://github.com/pmndrs/zustand](https://github.com/pmndrs/zustand)[18]

### dexie & dexie-react-hooks
- **Docs**: [https://dexie.org](https://dexie.org)[19]
- **GitHub**: [https://github.com/dexie/Dexie.js](https://github.com/dexie/Dexie.js)[20]

### idb
- **Docs**: [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)[21]
- **GitHub**: [https://github.com/jakearchibald/idb](https://github.com/jakearchibald/idb)[21]

### zod
- **Docs**: [https://zod.dev](https://zod.dev)[22]
- **GitHub**: [https://github.com/colinhacks/zod](https://github.com/colinhacks/zod)[23]

## Development Tools & Utilities

### @webcontainer/api
- **Docs**: [https://developer.stackblitz.com/platform/api/webcontainer-api](https://developer.stackblitz.com/platform/api/webcontainer-api)[24]
- **GitHub**: [https://github.com/stackblitz/webcontainer-docs](https://github.com/stackblitz/webcontainer-docs)[25]

### @xterm/xterm & @xterm/addon-fit
- **Docs**: [http://xtermjs.org](http://xtermjs.org)[26]
- **GitHub**: [https://github.com/xtermjs/xterm.js](https://github.com/xtermjs/xterm.js)[27]

### isomorphic-git
- **Docs**: [https://isomorphic-git.org](https://isomorphic-git.org)[28]
- **GitHub**: [https://github.com/isomorphic-git/isomorphic-git](https://github.com/isomorphic-git/isomorphic-git)[29]

## Internationalization

### i18next, i18next-browser-languagedetector, react-i18next
- **Docs**: [https://www.i18next.com](https://www.i18next.com)[30]
- **GitHub**: [https://github.com/i18next/i18next](https://github.com/i18next/i18next)[31]

## UI Utilities

### react-resizable-panels
- **Docs**: [https://react-resizable-panels.vercel.app](https://react-resizable-panels.vercel.app)[32]
- **GitHub**: [https://github.com/bvaughn/react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)[33]

### sonner
- **Docs**: [https://sonner.emilkowal.ski](https://sonner.emilkowal.ski)
- **GitHub**: [https://github.com/emilkowalski/sonner](https://github.com/emilkowalski/sonner)

### eventemitter3
- **Docs**: [http://nodejs.org/api/events.html](http://nodejs.org/api/events.html)[34]
- **GitHub**: [https://github.com/primus/eventemitter3](https://github.com/primus/eventemitter3)[34]

## Observability

### @sentry/react
- **Docs**: [https://docs.sentry.io/platforms/javascript/guides/react/](https://docs.sentry.io/platforms/javascript/guides/react/)[35]
- **GitHub**: [https://github.com/getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript)[36]

## React Core

### react & react-dom
- **Docs**: [https://react.dev](https://react.dev)
- **GitHub**: [https://github.com/facebook/react](https://github.com/facebook/react)

### vite-tsconfig-paths
- **GitHub**: [https://github.com/aleclarson/vite-tsconfig-paths](https://github.com/aleclarson/vite-tsconfig-paths)

- Use innate search tools, grep, etc. for codebase exploration
- Use Context7 MCP tools for official documentation (2 sequential steps per turn based on scoring)
- Use Deepwiki for semantic questions about specific tech stacks (TanStack Router, WebContainer, xterm.js, etc.)
- Use Tavily and Exa MCP tools for semantic repo search
- Use Repomix MCP tools for granular codebase analysis
- Create controlled documents/artifacts with IDs, variables, naming, date stamps for context preservation
- Prioritize iteration, insertion, updates on single-source of truth
- When generating new files, isolate with new folders and date-time-stamp marking

> ⚠️ **MANDATORY MCP RESEARCH PROTOCOL (2025-12-24) - ENFORCEABLE**
>
> **COMPLIANCE REQUIRED**: Following critical incident INC-2025-12-24-001, this protocol is now strictly enforced. All agents MUST complete the research workflow before implementing unfamiliar patterns or using libraries for the first time.
>
> ### Enforcement Mechanism
> - **Pre-Commit Validation**: Research artifacts required for all unfamiliar patterns
> - **Code Review Requirements**: Reviewers must verify research traceability
> - **Automated Checks**: Story completion blocked without validated research
> - **Escalation Path**: Non-compliance results in story blocking and remediation
>
> ### Sequential Research Workflow (MANDATORY)
>
> 1. **API Research (Context7)**
>    - Query exact API signatures, parameters, and return types
>    - Verify function definitions against official documentation
>    - Document all API usages with source links
>    - Validation: ✅ Function signatures confirmed | ✅ Parameter types verified
>
> 2. **Architecture Understanding (Deepwiki)**
>    - Analyze repository-specific architectural decisions
>    - Understand component interactions and design patterns
>    - Document integration points and constraints
>    - Validation: ✅ Design patterns understood | ✅ Integration points identified
>
> 3. **Best Practices Search (Tavily/Exa)**
>    - Research 2025 current industry best practices
>    - Find production-ready examples from authoritative sources
>    - Compare multiple approaches and select optimal pattern
>    - Validation: ✅ 2024-2025 sources verified | ✅ Multiple approaches compared
>
> 4. **Codebase Analysis (Repomix)**
>    - Analyze existing patterns in the Via-gent codebase
>    - Identify naming conventions and file organization
>    - Find reference implementations for consistency
>    - Validation: ✅ Existing patterns documented | ✅ Naming conventions identified
>
> 5. **Cross-Validation**
>    - Cross-reference all findings for consistency
>    - Resolve any conflicts by preferring official sources
>    - Document validation status and source authority
>    - Validation: ✅ No conflicts between sources | ✅ Patterns align with codebase
>
> 6. **Research Documentation**
>    - Create research artifact using required template
>    - Complete all sections with detailed findings
>    - Include sources, validation status, and implementation decision
>    - Validation: ✅ Research artifact created | ✅ All sections completed
>
> 7. **Approval Workflow**
>    - Self-validation checklist completed
>    - Peer review for high-risk implementations
>    - Approval required before implementation
>    - Validation: ✅ Checklist completed | ✅ Approval obtained
>
> ### Tool Selection Decision Tree
>
> Use this decision tree to determine which MCP tool(s) to use:
>
> ```
> flowchart TD
>     Start["Need to research?"] --> Q1{"What am I<br/>researching?"}
>
>     Q1 --> |"API signatures,<br/>function params"| C7["Context7<br/>(Primary)"]
>     Q1 --> |"Architecture<br/>decisions"| DW["Deepwiki<br/>(Primary)"]
>     Q1 --> |"Current best<br/>practices"| Tavily["Tavily/Exa<br/>(Primary)"]
>     Q1 --> |"Existing codebase<br/>patterns"| RM["Repomix<br/>(Primary)"]
>     Q1 --> |"General<br/>documentation"| Brave["Brave Search<br/>(Primary)"]
>
>     C7 --> Q2{"Found what<br/>I needed?"}
>     DW --> Q2
>     Tavily --> Q2
>     RM --> Q2
>     Brave --> Q2
>
>     Q2 --> |"Yes"| Validate["Validate findings<br/>against 2nd source"]
>     Q2 --> |"No"| Alt["Try alternative<br/>tool from matrix"]
>
>     Alt --> Q2
>
>     Validate --> Doc["Document<br/>findings"]
>     Doc --> Implement["Proceed to<br/>implementation"]
> ```
>
> ### Research Artifact Requirements
>
> Every implementation involving unfamiliar patterns MUST have an associated research artifact stored in:
> ```
> _bmad-output/research/[feature-name]-research-YYYY-MM-DD.md
> ```
>
> **Required Template Sections:**
> 1. Research Objective
> 2. MCP Tools Consulted (with queries and results)
> 3. Detailed Findings (API signatures, architecture, best practices, codebase patterns)
> 4. Sources (with authority level and verification dates)
> 5. Validation Status (cross-validation confirmation)
> 6. Implementation Decision (selected approach with justification)
> 7. Risks and Uncertainties (with mitigation strategies)
> 8. Approval (self-validation and peer review status)
>
> ### Integration with Sprint Planning
>
> **Story Acceptance Criteria Updates:**
> All stories involving unfamiliar patterns MUST include:
>
> ```markdown
> ### Research Requirements (MANDATORY)
>
> **Pre-Implementation Research:**
> - [ ] MCP research workflow completed
> - [ ] Research artifact created: `_bmad-output/research/[name].md`
> - [ ] API signatures verified (Context7)
> - [ ] Architecture patterns understood (Deepwiki)
> - [ ] 2025 best practices confirmed (Tavily/Exa)
> - [ ] Codebase patterns analyzed (Repomix)
>
> **Research Validation:**
> - [ ] Pre-implementation checklist completed
> - [ ] Cross-validation passed
> - [ ] Peer review completed (if high-risk)
> ```
>
> ### Quality Gates and Enforcement
>
> **Gate 1: Research Completeness**
> - [ ] All required MCP tools consulted
> - [ ] Research artifact created with all sections
> - [ ] Sources documented and verified
> - **Enforcement:** Cannot proceed to implementation
>
> **Gate 2: Validation Passed**
> - [ ] Pre-implementation checklist completed
> - [ ] Cross-validation performed
> - [ ] No unresolved conflicts
> - **Enforcement:** Cannot proceed to implementation
>
> **Gate 3: Implementation Traceability**
> - [ ] Code references research artifact
> - [ ] Implementation matches documented patterns
> - [ ] No undocumented API usages
> - **Enforcement:** Code review must verify traceability
>
> ### Common Pitfalls and Remediation
>
> **Pitfall 1: Skipping Research for "Simple" Changes**
> - **Remediation:** ALWAYS verify API signatures with Context7
> - **Remediation:** No change is "too simple" for verification
> - **Remediation:** Document even quick lookups
>
> **Pitfall 2: Using Training Data Instead of Current Docs**
> - **Remediation:** Always query MCP tools, even for "known" libraries
> - **Remediation:** Check version-specific documentation
> - **Remediation:** Verify with 2024-2025 dated sources
>
> **Pitfall 3: Single-Source Research**
> - **Remediation:** Use minimum 2 tools for cross-validation
> - **Remediation:** Context7 + Deepwiki for API work
> - **Remediation:** Tavily + Repomix for pattern work
>
> **Pitfall 4: Not Analyzing Existing Codebase**
> - **Remediation:** Always run Repomix analysis before new implementations
> - **Remediation:** Find reference implementations in the codebase
> - **Remediation:** Follow established conventions
>
> **Pitfall 5: Superficial Research Artifacts**
> - **Remediation:** Research artifacts must have complete sections
> - **Remediation:** All sources must be linked
> - **Remediation:** Validation checklist must be completed honestly
>
> ### Complete Documentation Reference
>
> For detailed guidelines, see: [_bmad-output/guidelines/mcp-research-protocol-2025-12-24.md](file:///Users/apple/Documents/coding-projects/project-alpha-master/_bmad-output/guidelines/mcp-research-protocol-2025-12-24.md)
>
> **This protocol is MANDATORY and ENFORCEABLE. Non-compliance will result in blocked stories and escalation.**

## Advanced Method to Use Deepwiki MCP Server's Tools to ask semantic questions of a particular dependency repo
- condition: provide correct link to Github's repo of the stack/dependency and/or (try both) direct link to Deepwiki page of it 
- Then start to ask semantic questions as long or as complex but only for the concepts of the dependency/repo. 
- The bellow are the collection of our frequently used and core dependencies used for this project. 

- **Tanstack AI:** https://github.com/TanStack/ai/ ; https://deepwiki.com/TanStack/ai

- **Tanstack Devtools:** https://github.com/TanStack/devtools ; https://deepwiki.com/TanStack/devtools

- **Webcontainer Core:** https://github.com/stackblitz/webcontainer-core ; https://deepwiki.com/stackblitz/webcontainer-core

- **Webcontainer documentation:** https://deepwiki.com/stackblitz/webcontainer-docs ; https://github.com/stackblitz/webcontainer-docs

- **Webcontainer API:** https://deepwiki.com/stackblitz/webcontainer-api ; https://github.com/stackblitz/webcontainer-api

- **Dexie.js:** https://deepwiki.com/dexie/dexie.js ; https://github.com/dexie/Dexie.js

- **Xterm.js:** https://deepwiki.com/xtermjs/xterm.js ; https://github.com/xtermjs/xterm.js

- **Monaco Editor:** https://deepwiki.com/microsoft/monaco-editor ; https://github.com/microsoft/monaco-editor

- **Rehype Raw:** https://deepwiki.com/rehypejs/rehype-raw ; https://github.com/rehypejs/rehype-raw

- **Rehype Sanitize:** https://deepwiki.com/rehypejs/rehype-sanitize ; https://github.com/rehypejs/rehype-sanitize

- **Zustand:** https://deepwiki.com/pmndrs/zustand ; https://github.com/pmndrs/zustand

- **EventEmitter3:** https://deepwiki.com/primus/eventemitter3 ; https://github.com/primus/eventemitter3 


>