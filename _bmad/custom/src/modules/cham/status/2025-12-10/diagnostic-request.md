# **VIA-GENT COMPREHENSIVE DIAGNOSTIC REQUEST**
## **Problem Statement for AI Agent Investigation**

***

## **META-CONTEXT: Purpose of This Document**

This document serves as a **structured diagnostic inquiry** to be consumed by AI agents responsible for investigating the Via-Gent codebase. The goal is NOT to provide solutions, but to **comprehensively and systematically describe the issues** such that an investigative agent can:

1. **Understand the full scope** of architectural, framework, and implementation problems
2. **Generate investigation frameworks** (similar to the 10-category diagnostic framework previously demonstrated)
3. **Conduct targeted code scans** across the repository at [https://github.com/shynlee04/via-gent](https://github.com/shynlee04/via-gent)
4. **Research deep technical context** for modern stack integrations
5. **Produce actionable diagnostic reports** with evidence-based findings

**Key Principle**: This is an **issue description document**, not a solution specification. The AI agent must derive investigation methodologies, diagnostic categories, and remediation strategies from understanding these problems.

***

## **SECTION 1: FRAMEWORK INTEGRATION CRISIS**

### **1.1 The Core Problem: Modern Stack Knowledge Gaps**

The Via-Gent project integrates **bleeding-edge frameworks** (TanStack Start, TanStack AI, WebContainers) that are:
- Recently released (2024-2025 timeframe)
- Poorly represented in LLM training data cutoffs
- Fundamentally different from predecessor patterns (Next.js, Vercel AI SDK, traditional Node.js environments)

**Manifestation**: AI agents developing this project consistently apply **outdated patterns** or **misunderstood abstractions** because they lack deep comprehension of:

#### **TanStack Start's Isomorphic Execution Model**
- **Issue**: Agents confuse server-only vs. client-only vs. isomorphic code boundaries
- **Evidence Needed**: Scan codebase for:
  - Server functions (`createServerFn()`) incorrectly called from client components
  - Browser APIs (localStorage, window) referenced in server-rendered contexts without guards
  - Route files that don't properly separate data loading (server) from rendering (client)
- **Documentation References**:
  - [Execution Model Guide](https://tanstack.com/start/latest/docs/framework/react/guide/execution-model)
  - [Code Execution Patterns](https://tanstack.com/start/latest/docs/framework/react/guide/code-execution-patterns)

#### **TanStack Start's File-Based Routing Conventions**
- **Issue**: Agents create routes that violate framework conventions, causing unexpected behavior
- **Evidence Needed**: Validate against routing rules:
  - Incorrect usage of `createFileRoute()` API
  - Route tree generation mismatches (`routeTree.gen.ts` vs. actual file structure)
  - Misunderstanding of layout inheritance and nested route boundaries
- **Documentation References**:
  - [Routing Guide](https://tanstack.com/start/latest/docs/framework/react/guide/routing)
  - [Client Entry Point](https://tanstack.com/start/latest/docs/framework/react/guide/client-entry-point)

#### **TanStack AI vs. Vercel AI SDK Confusion**
- **Issue**: The project recently migrated from Vercel AI SDK to TanStack AI, but legacy patterns persist
- **Evidence Needed**: Identify hybrid implementations:
  - Custom `useChat` hooks that don't use `@tanstack/ai-react`'s actual `useChat`
  - Tool definitions using incorrect schemas (not `toolDefinition()` pattern from TanStack AI)
  - Streaming endpoints that don't use TanStack AI's `toServerSentEventsStream()`
  - **Recent Failure** (per `REMEDIATION-HONEST-REPORT-2025-12-10.md`): Cluster 1 implemented custom agent patterns instead of TanStack AI official APIs
- **Documentation References**:
  - [TanStack AI Guides](https://tanstack.com/ai/latest/docs/guides/tools)
  - [Agentic Cycle](https://tanstack.com/ai/latest/docs/guides/agentic-cycle)
  - [Client Tools](https://tanstack.com/ai/latest/docs/guides/client-tools)
  - [Tool Architecture](https://tanstack.com/ai/latest/docs/guides/tool-architecture)

#### **WebContainers API Misuse**
- **Issue**: WebContainers provide a Node.js runtime in the browser with SIGNIFICANT limitations
- **Evidence Needed**: Detect violations:
  - Synchronous filesystem operations where async is required (OPFS constraints)
  - Unsupported Node.js APIs being called (e.g., child_process.exec with pipes)
  - Process lifecycle mismanagement (zombie processes, unclosed streams)
  - Missing browser compatibility checks (SharedArrayBuffer, COOP/COEP headers)
- **Documentation References**:
  - [WebContainers API](https://webcontainers.io/api)
  - [Browser Support Matrix](https://webcontainers.io/guides/browser-support)

**Impact on Development**: Agents produce code that **compiles but fails at runtime** or **works in isolation but breaks integration**, leading to:
- 46+ failing tests (as of Dec 10, 2025 report)
- 100+ TypeScript errors
- Broken agent chat functionality
- Hydration mismatches in production

***

### **1.2 Cross-Dependency Complexity**

The project's architecture involves **tightly coupled modern libraries** where missteps in one area cascade:

#### **TanStack Query + TanStack Router + TanStack Store Integration**
- **Issue**: State management is fragmented across three TanStack libraries plus React Context
- **Evidence Needed**: Map state ownership:
  - Which state lives in TanStack Query cache? (server data, optimistic updates)
  - Which state lives in TanStack Store? (domain stores in `src/core/state/RootStore.ts`)
  - Which state lives in React Context? (`ApiKeyProvider`, `DomainProvider`)
  - Where are conflicts? (duplicate state, stale reads, missing invalidations)

#### **Drizzle ORM + Neon Serverless + PGlite Client-Side Postgres**
- **Issue**: Unclear database selection strategy (when to use cloud vs. local)
- **Evidence Needed**: Trace database calls:
  - When is Neon serverless database used? (server-side only? cross-user data?)
  - When is PGlite (client-side WASM Postgres) used? (offline-first? local projects?)
  - Are schemas synchronized between cloud and local databases?
  - Is there migration drift between environments?

#### **Monaco Editor + WebContainers Filesystem + File Tree UI**
- **Issue**: Three representations of "files" must stay synchronized:
  - Monaco editor models (in-memory text)
  - WebContainers virtual filesystem (OPFS-backed)
  - React UI file tree state (visual representation)
- **Evidence Needed**: Identify desync scenarios:
  - File saved in Monaco but not written to WebContainers FS
  - File tree showing stale directory structure after programmatic changes
  - Multiple editor instances for same file causing conflicts

**Consequence**: Agents don't understand **where state authority lives**, leading to race conditions, stale data, and unpredictable behavior.

***

## **SECTION 2: ARCHITECTURAL FRAGMENTATION**

### **2.1 The Intended Architecture vs. Reality**

**Intended Design** (per documentation in `docs/architecture/`):
- **Hexagonal Architecture** (Ports & Adapters)
- **Domain-Driven Design** with bounded contexts:
  - `domains/agent` - AI agent orchestration
  - `domains/ide` - Code editor, file tree, terminal
  - `domains/project` - Project lifecycle management
  - `domains/llm` - LLM provider integrations
  - `domains/memory` - Conversation history
- **Clear API boundaries** enforced through `domains/*/api/contracts.ts`
- **Event-driven communication** via centralized `EventBus`

**Current Reality** (evidence from codebase):
- **Cross-domain coupling**: Direct imports from `domains/*/core/*` bypassing public APIs
- **Circular dependencies**: Agent domain imports IDE domain, IDE imports Agent domain
- **Unclear ownership**: Multiple domains manipulating same state (e.g., file system)
- **Event chaos**: 100+ event types with no versioning strategy, unclear handlers

### **2.2 Specific Architectural Violations to Investigate**

#### **Domain Boundary Breaches**
- **Evidence Needed**: Scan for forbidden import patterns:
  ```typescript
  // VIOLATION: Component importing from domain core directly
  import { IDEService } from '@/domains/ide/core/IDEService'
  
  // CORRECT: Component should import from domain public API
  import { IDEService } from '@/domains/ide'
  ```
- **Investigation Focus**: Audit `src/components/**`, `src/app/**` for direct core imports

#### **State Ownership Confusion**
- **Evidence Needed**: Map state mutation authority:
  - Who owns file tree state? (IDE domain? Project domain? UI component?)
  - Who owns conversation history? (Memory domain? Agent domain? React Query cache?)
  - Can multiple domains write to the same state simultaneously?

#### **Event Bus Complexity**
- **Evidence Needed**: Analyze `src/core/events/EventBus.ts`:
  - How many event types exist? (schema in `eventSchemas.ts`)
  - Are events versioned? (per `docs/architecture/event-versioning.md`)
  - Are there circular event chains? (Event A triggers Event B triggers Event A)
  - Are event handlers properly unsubscribed? (memory leaks?)

**Symptom**: Recent remediation effort (Dec 10, 2025) attempted to fix domain API enforcement but **failed** because:
- Tests still import from `domains/*/core/*`
- Components bypass domain APIs
- Inconsistent enforcement across codebase

***

### **2.3 Routing Architecture Inconsistencies**

#### **File Structure Does Not Match Routes**
- **Issue**: Legacy `src/routes/ide/` directory should have been deleted but still exists
- **Evidence Needed**:
  - Does `src/routes/_workspace/ide/` conflict with `src/routes/ide/`?
  - Is `routeTree.gen.ts` correctly generated from current file structure?
  - Are there duplicate route definitions?

#### **Search Parameter Validation**
- **Issue**: IDE uses search params (`?projectId=123&file=app.ts`) but validation is incomplete
- **Evidence Needed**:
  - Is `zodValidator` properly configured with `@tanstack/zod-adapter`? (dependency missing per report)
  - Does `src/lib/ide-search.ts` schema match actual route usage?

#### **SPA vs. SSR Mode Confusion**
- **Issue**: TanStack Start supports SPA mode (client-only) vs. full SSR mode, but project's choice is unclear
- **Evidence Needed**:
  - Check `app.config.ts` or equivalent configuration
  - Are routes configured for SSR with proper loader functions?
  - Or is this meant to be a pure SPA? (relevant for WebContainers client-side focus)

**Consequence**: Navigation breaks, routes resolve unexpectedly, search params lost on refresh.

***

## **SECTION 3: AGENT ORCHESTRATION DEFICIENCIES**

### **3.1 The Vision vs. Implementation Gap**

**Product Vision** (per `docs/complete-new-approach/prd-draft.md`):
- **Multi-agent system** with specialized agents (coder, architect, tester, documentation writer)
- **Role-based workflows** where agents coordinate on complex tasks
- **Pipeline execution** (sequential, parallel, conditional branching)
- **Agent profiles** with customizable system prompts, tool access, model selection
- **Conversation management** with threads, topics, workspace organization

**Current Implementation**:
- **Single agent** implementation (coordinator agent only)
- **No agent registry** or profile management system
- **No workflow orchestration** infrastructure
- **Basic conversation storage** without threading or topic organization
- **Minimal UX** for agent interaction (no agent switcher, no workflow controls)

### **3.2 Conversation & Memory Management Issues**

#### **Chat History Persistence**
- **Evidence Needed**: Investigate `src/domains/memory/core/MemoryService.ts`:
  - How are messages serialized? (JSON? Binary? Compression?)
  - Where are they stored? (Neon DB? PGlite? IndexedDB? localStorage?)
  - Is context window managed? (token counting, pruning old messages?)
  - Are conversations resumable across sessions?

#### **Multi-Turn Context Management**
- **Issue**: Long conversations exceed context windows, but no summarization or RAG retrieval
- **Evidence Needed**:
  - Is there a strategy for context compression? (summarization, semantic chunking?)
  - Are conversations checkpointed? (save critical decisions, resume from checkpoints?)
  - How are code changes reflected in conversation context?

#### **Agent State Isolation**
- **Issue**: If multiple agents exist, they must not interfere with each other's state
- **Evidence Needed** (when multi-agent is implemented):
  - Does each agent maintain separate conversation history?
  - Can agents share context? (handoff mechanisms?)
  - Are tool executions isolated per agent?

**Recent Failure Evidence** (per `REMEDIATION-HONEST-REPORT-2025-12-10.md`):
- TanStack AI integration broken (custom patterns instead of official APIs)
- Agent chat completely non-functional after remediation attempt
- Tool definitions don't match TanStack AI's `toolDefinition()` pattern

***

### **3.3 Agent Configuration & Extensibility**

#### **Missing Agent Profile System**
- **Evidence Needed**: Search for agent configuration structures:
  - Is there an agent registry? (`AgentProfile[]` with metadata?)
  - Can users create custom agents? (UI for agent builder?)
  - Are agent capabilities defined? (tools, models, constraints per agent?)

#### **System Prompt Management**
- **Issue**: System instructions likely hardcoded, not version-controlled or A/B testable
- **Evidence Needed**:
  - Where are system prompts defined? (in code? in database? in config files?)
  - Are they templated? (dynamic variables like `{userName}`, `{projectContext}`?)
  - Is there prompt versioning? (track prompt changes over time?)

#### **Workflow Pipeline Absence**
- **Issue**: No infrastructure for multi-step agentic workflows
- **Evidence Needed**:
  - Is there a workflow definition schema? (DAG? state machine? event-driven?)
  - Can workflows branch conditionally? (if tests fail, run fixer agent)
  - Are workflows resumable after failures?

**UX Implication**: Users cannot switch agents, configure agent behavior, or orchestrate complex multi-agent workflows because **infrastructure doesn't exist**.

***

## **SECTION 4: IDE INTEGRATION CHALLENGES**

### **4.1 Monaco Editor Integration Issues**

#### **Editor Lifecycle Management**
- **Issue**: Monaco editor instances must be properly created, disposed, and reused
- **Evidence Needed**: Analyze `src/components/ide/MonacoEditor.tsx`:
  - Are editor models disposed on component unmount? (prevent memory leaks)
  - Are models reused when same file reopened? (performance)
  - Is multi-file editing supported? (multiple models, tab switching)

#### **Language Server Integration**
- **Issue**: TypeScript IntelliSense, diagnostics, and code actions require language server setup
- **Evidence Needed**:
  - Is `monaco.languages.typescript` configured?
  - Are compiler options set correctly? (match project's `tsconfig.json`)
  - Are diagnostics reported in UI? (error markers, hover tooltips)

#### **File Synchronization**
- **Issue**: Monaco → WebContainers FS sync must be bidirectional and conflict-free
- **Evidence Needed**:
  - When is file saved to WebContainers? (on every keystroke? debounced? explicit save?)
  - How are external file changes detected? (WebContainers fs.watch API)
  - What happens on conflicts? (both editor and FS modified file simultaneously)

**Recent Test Failures**: `MonacoEditor.test.tsx` failures may indicate editor lifecycle issues.

***

### **4.2 Terminal (XTerm) Integration Issues**

#### **Process Binding**
- **Issue**: XTerm must bind to WebContainers shell process with proper I/O streaming
- **Evidence Needed**: Analyze `src/components/ide/XTerminal.tsx`:
  - Is WebContainer shell process spawned correctly? (`webcontainer.spawn('jsh')`)
  - Are input and output streams properly piped? (stdin → terminal input, stdout → terminal output)
  - Are ANSI escape sequences handled? (colors, cursor movement)

#### **Multi-Terminal Management**
- **Issue**: Users may want multiple terminals (for dev server, tests, build)
- **Evidence Needed**:
  - Can multiple terminal instances exist? (separate processes, separate tabs)
  - Are processes isolated? (killing one terminal doesn't affect others)
  - Is terminal history persisted? (across project switches, page reloads)

**Recent Test Failures**: `XTerminal.test.tsx` timeout failures suggest process lifecycle issues.

***

### **4.3 File Tree & Preview Panel**

#### **Virtual Filesystem Representation**
- **Issue**: File tree UI must efficiently render large directory structures
- **Evidence Needed**: Analyze `src/components/ide/FileTree.tsx`:
  - Is file tree lazily loaded? (expand folder on demand)
  - Are file watchers set up? (detect external changes from terminal commands)
  - Is tree state persisted? (expanded folders, scroll position)

#### **Preview Rendering**
- **Issue**: Live preview must show running app, hot reload on changes
- **Evidence Needed**: Analyze `src/components/ide/PreviewPanel.tsx`:
  - How is preview served? (WebContainers dev server? iframe src?)
  - Is hot module replacement working? (HMR, live reload)
  - Are CORS issues handled? (iframe same-origin policy)

**File Tree Test Failures**: `FileTree.test.tsx` failures indicate UI-filesystem desync issues.

***

## **SECTION 5: CLIENT-SIDE PERSISTENCE COMPLEXITY**

### **5.1 Local File System Access API Usage**

#### **Permission Management**
- **Issue**: File System Access API requires explicit user permission grants
- **Evidence Needed**: Investigate `src/infrastructure/file-systems/LocalFileSystem.ts`:
  - When are permissions requested? (on project init? on first file access?)
  - Are permissions persisted? (handle restoration across sessions)
  - What happens if user denies permission? (fallback to virtual FS only?)

#### **Dual Filesystem Synchronization**
- **Issue**: `DualFileSystem.ts` must coordinate WebContainers (virtual) ↔ Local FS (persistent)
- **Evidence Needed**:
  - Is sync unidirectional or bidirectional? (WebContainers → Local FS? Both ways?)
  - When does sync trigger? (on every file save? periodic batch sync? manual sync button?)
  - How are conflicts resolved? (timestamp-based? user prompt?)

**Browser Compatibility**: File System Access API not supported in all browsers (Firefox limited), needs fallback strategy.

***

### **5.2 Database Strategy Confusion**

#### **PGlite (Client-Side WASM Postgres) vs. Neon Serverless**
- **Issue**: Two Postgres options with unclear selection criteria
- **Evidence Needed**:
  - **When to use PGlite?** (local project data? offline-first? user-specific settings?)
  - **When to use Neon?** (shared data? user authentication? backend APIs?)
  - Are schemas identical? (same tables, migrations applied to both?)

#### **Schema Migration Management**
- **Issue**: Drizzle migrations must apply to both databases consistently
- **Evidence Needed**: Scan `db/migrations/**`:
  - Are migrations versioned? (incremental, revertible)
  - Is migration state tracked per database? (know which migrations applied)
  - What happens on schema breaking changes? (data migration scripts?)

**Recent Failures**: `PGliteClient.test.ts` failures suggest database initialization issues.

***

### **5.3 State Rehydration Performance**

#### **Cold Start Optimization**
- **Issue**: Application must load quickly, even with large persisted state
- **Evidence Needed**:
  - What is rehydration order? (critical state first, lazy load non-critical)
  - Are there loading skeletons? (UI feedback during rehydration)
  - Is state normalized? (reduce deserialization overhead)

#### **Persistence Middleware Issues**
- **Issue**: `PersistMiddleware.ts` must handle quota limits, corrupted data
- **Evidence Needed**:
  - What is storage quota management strategy? (prune old data, LRU eviction)
  - Are there data migrations? (handle schema changes in persisted state)
  - Is corrupted state handled gracefully? (fallback to defaults, error boundary)

**Performance Impact**: Slow rehydration causes "white screen" on load, poor UX.

***

## **SECTION 6: PROJECT & WORKSPACE MANAGEMENT GAPS**

### **6.1 Project Lifecycle Issues**

#### **Project Bootstrapping**
- **Issue**: Creating new projects must install dependencies, generate files, initialize git
- **Evidence Needed**: Trace `src/app/workflows/BootstrapFlow.ts`:
  - What happens on "Create Project"? (template selection, dependency install via WebContainers)
  - Are there default templates? (React, Vue, vanilla JS starters)
  - What if bootstrap fails midway? (cleanup, error recovery)

#### **Multi-Project Switching**
- **Issue**: Users may work on multiple projects, switching must be fast and safe
- **Evidence Needed**:
  - How is project context isolated? (separate WebContainer instances? shared instance with namespace?)
  - Are resources cleaned up on switch? (close file handles, kill processes)
  - Is project state persisted per project? (open files, terminal commands, settings)

#### **Git Integration**
- **Issue**: Local git support must enable commits, branches, GitHub sync
- **Evidence Needed**:
  - Is isomorphic-git used? (pure JS git implementation for browser)
  - Are git operations supported? (init, add, commit, push, pull, branch, merge)
  - Is GitHub authentication handled? (OAuth, personal access tokens)

**Critical for Product**: Without multi-project support, Via-Gent is limited to single-project toy usage.

***

### **6.2 Workspace UI Organization**

#### **Workspace Types**
- **Vision**: Different workspace modes (IDE, Dashboard, Research, Asset Studio) for different user roles
- **Evidence Needed**:
  - Are workspace types defined? (enum? discriminated union?)
  - Does layout change per workspace? (IDE has editor+terminal, Dashboard has metrics)
  - Is workspace state isolated? (switching workspace doesn't lose IDE state)

#### **Layout Persistence**
- **Issue**: Panel sizes, tab arrangements must persist across sessions
- **Evidence Needed**:
  - Is layout state serialized? (panel widths, split orientation)
  - Where is it stored? (localStorage? database?)
  - Is it responsive? (adapt to different screen sizes)

**UX Requirement**: Professional users expect customizable, persistent layouts (like VS Code).

***

## **SECTION 7: TESTING & QUALITY ASSURANCE FAILURES**

### **7.1 Current Test Crisis**

**As of Dec 10, 2025 Remediation Report**:
- **46 failing tests** (out of 476 total)
- **Test categories**:
  - 12 tests: Import path failures (EventBus not found)
  - 18 tests: State isolation issues (shared state between test runs)
  - 10 tests: Type mismatches (missing `id`, `timestamp` in messages)
  - 6 tests: Filesystem operation failures (AsyncIterator issues)

### **7.2 Test Infrastructure Issues**

#### **State Isolation Failures**
- **Issue**: Tests pollute global state, causing subsequent tests to fail
- **Evidence Needed**: Analyze test setup files (`vitest.setup.ts`):
  - Are stores reset between tests? (`RootStore` cleanup)
  - Are event listeners unsubscribed? (prevent handler accumulation)
  - Are timers/intervals cleared? (async test stability)

#### **Test-Code Coupling**
- **Issue**: Tests break when implementation details change (brittle tests)
- **Evidence Needed**:
  - Are tests testing behavior (black box) or implementation (white box)?
  - Are tests over-mocked? (testing mocks, not real code)
  - Are integration tests actually integrating? (or just unit tests with more setup)

#### **Test Coverage Gaps**
- **Evidence Needed**: Run coverage report:
  - Which critical paths are untested? (agent tool execution, file sync, state persistence)
  - Are edge cases covered? (network failures, quota exceeded, permission denied)
  - Are error boundaries tested? (error recovery flows)

**Consequence**: Cannot confidently refactor or add features without breaking existing functionality.

***

### **7.3 TypeScript Compilation Errors**

**As of Dec 10, 2025 Remediation Report**:
- **100+ TypeScript errors**
- **Top error categories**:
  - 50+ errors: Event payloads missing `version` field (schema mismatch)
  - 20+ errors: TanStack AI type mismatches (`MessagePart` doesn't have `content`)
  - 15+ errors: Test files missing required message fields (`id`, `timestamp`)

**Investigation Needed**:
- Are type definitions up to date with dependencies? (TanStack AI, WebContainers)
- Are custom types properly extending library types? (not conflicting)
- Is `tsconfig.json` configured correctly? (strict mode, path aliases)

***

## **SECTION 8: DOCUMENTATION & KNOWLEDGE ARTIFACT CHAOS**

### **8.1 Documentation Drift & Conflicts**

#### **Multiple Document Versions**
- **Issue**: Documentation exists in multiple locations with conflicting information
- **Evidence Needed**: Scan `docs/**` subdirectories:
  - `docs/legacy-planning/` - outdated? still relevant?
  - `docs/new-ADR-total-client-side/` - current architecture?
  - `docs/complete-new-approach/` - future vision? in-progress?
  - Which documents are authoritative? (precedence hierarchy)

#### **Stale Code Examples**
- **Issue**: Documentation shows old patterns (Vercel AI SDK, pre-TanStack Start)
- **Evidence Needed**:
  - Do examples in `docs/` match current codebase?
  - Are there broken code snippets? (syntax errors, missing imports)
  - Are references outdated? (links to old library versions)

**Impact on AI Agents**: Conflicting documentation causes agents to hallucinate hybrid implementations combining old and new patterns.

***

### **8.2 Agent Context Poisoning**

#### **Legacy Context Remnants**
- **Issue**: Spec-driven implementation documents in `.bmad/`, `.agent/`, `.kilocode/` may contain outdated guidance
- **Evidence Needed**:
  - When were these documents last updated? (timestamp audit)
  - Do they reference deprecated libraries? (e.g., Vercel AI SDK)
  - Are there conflicting architectural decisions across documents?

#### **Context Hierarchy Ambiguity**
- **Issue**: When agents encounter conflicts (code says X, docs say Y), which to trust?
- **Evidence Needed**:
  - Is there a documented precedence rule? (code > recent docs > legacy docs)
  - Are deprecation markers used? (flagging outdated patterns)
  - Is there a context refresh policy? (update docs on code changes)

**Remediation Insight** (from Dec 10 report):
- Agents implementing remediations followed specs literally but **didn't understand underlying why**
- Resulted in custom patterns that superficially matched specs but missed intent

***

## **SECTION 9: CODE ORGANIZATION & MAINTAINABILITY**

### **9.1 File Structure Inconsistencies**

#### **Directory Hierarchy Violations**
- **Issue**: Files placed in wrong directories, unclear naming conventions
- **Evidence Needed**: Audit entire `src/` structure:
  - Are tests co-located with code or centralized? (both patterns exist)
  - Are index files used consistently? (barrel exports)
  - Are `__tests__` directories empty? (cleanup incomplete)

#### **Naming Convention Inconsistencies**
- **Issue**: Mix of kebab-case, PascalCase, camelCase without clear rules
- **Evidence Needed**:
  - File names: `AgentService.ts` (PascalCase) vs. `agent-api.ts` (kebab-case)
  - Export names: default exports vs. named exports (inconsistent)
  - Directory names: `use-cases` (kebab) vs. `domains` (singular)

**Consequence**: Agents struggle to locate files, make incorrect assumptions about module structure.

***

### **9.2 Dependency Management Issues**

#### **Version Conflicts**
- **Evidence Needed**: Analyze `package.json` and `pnpm-lock.yaml`:
  - Are peer dependencies satisfied? (React 19 with older libraries)
  - Are there duplicate packages? (multiple React versions in tree)
  - Are deprecated packages used? (security vulnerabilities)

#### **Bundle Size Concerns**
- **Evidence Needed**: Run bundle analysis:
  - What are the largest dependencies? (Monaco Editor, TanStack libs)
  - Are imports optimized? (tree-shaking, dynamic imports)
  - Are there unnecessary dependencies? (dev-only libs in production bundle)

**Performance Impact**: Large bundles slow initial load, especially on slow networks.

***

## **SECTION 10: DEPLOYMENT & PRODUCTION READINESS**

### **10.1 Netlify Deployment Configuration**

#### **Build Configuration**
- **Evidence Needed**: Analyze `netlify.toml`:
  - Is build command correct? (`pnpm build` using TanStack Start build)
  - Is publish directory correct? (`.output/public` or equivalent)
  - Are environment variables configured? (Neon DB URL, API keys)

#### **Edge Function Limitations**
- **Issue**: Netlify edge functions have constraints (execution time, memory)
- **Evidence Needed**:
  - Are SSR routes compatible with edge runtime? (Node.js API usage)
  - Are cold starts optimized? (bundle size, lazy imports)
  - Are timeouts configured? (prevent hanging requests)

***

### **10.2 Environment Configuration**

#### **Missing Variables**
- **Evidence Needed**: Compare `.env.example` to actual usage:
  - Are all required variables documented?
  - Are defaults provided for optional variables?
  - Are variables validated on startup? (fail fast if misconfigured)

#### **Feature Flags Absence**
- **Issue**: No infrastructure for gradual feature rollouts
- **Evidence Needed**:
  - Can features be toggled without code deploy? (runtime config)
  - Are features environment-specific? (enable in staging, disable in prod)

**Deployment Risk**: Without feature flags, risky changes must be all-or-nothing deployed.

***

## **SECTION 11: CROSS-CUTTING CONCERNS**

### **11.1 Error Handling Inconsistencies**

- **Evidence Needed**: Scan error handling patterns:
  - Are errors typed? (custom error classes, discriminated unions)
  - Are errors logged? (structured logging, error tracking service)
  - Are errors shown to users? (error boundaries, toast notifications)

### **11.2 Performance Monitoring Absence**

- **Evidence Needed**: Check for observability:
  - Are there performance metrics? (Web Vitals, custom timings)
  - Is user behavior tracked? (analytics, session replay)
  - Are errors monitored? (Sentry, error reporting)

### **11.3 Accessibility Gaps**

- **Evidence Needed**: Audit accessibility:
  - Are keyboard shortcuts supported? (Monaco editor, terminal navigation)
  - Is ARIA markup present? (screen reader support)
  - Is color contrast sufficient? (WCAG AA compliance)

***

## **DIRECTIVE TO INVESTIGATIVE AI AGENT**

Given the above comprehensive problem description, you must:

1. **Generate Investigation Framework**
   - Create systematic diagnostic categories (minimum 10 major categories)
   - Define specific investigation targets per category
   - List required evidence types (code scans, pattern analysis, dependency graphs)

2. **Conduct Deep Code Scanning**
   - Access [https://github.com/shynlee04/via-gent](https://github.com/shynlee04/via-gent) repository
   - Execute targeted scans per investigation framework
   - Extract evidence (file paths, code snippets, test failures)

3. **Research Technical Context**
   - Study official documentation for TanStack Start, TanStack AI, WebContainers
   - Understand migration paths (Vercel AI SDK → TanStack AI)
   - Catalog best practices, anti-patterns, common pitfalls

4. **Produce Diagnostic Report**
   - Severity classification (critical, major, minor)
   - Evidence-based findings (not speculation)
   - Root cause analysis (why issues exist, not just what)
   - Prioritized remediation roadmap

5. **Enhance Agent Context**
   - Update technical documentation to prevent future confusion
   - Create decision trees for architectural choices
   - Document investigation methodology for reuse

**Success Criteria**: The diagnostic report enables a separate remediation agent to:
- Understand exact problems without ambiguity
- Prioritize fixes by impact and dependencies
- Execute remediations with confidence (validated at each step)
- Avoid repeating past mistakes (December 10, 2025 failed remediation)

***

**END OF DIAGNOSTIC REQUEST**

This document intentionally describes problems, not solutions. Your role is to investigate, analyze, and report—not to fix prematurely.