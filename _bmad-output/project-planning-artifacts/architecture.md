---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/project-planning-artifacts/prd.md
  - _bmad-output/project-planning-artifacts/ux-design-specification.md
  - _bmad-output/docs/2025-12-28/target-architecture.md
  - _bmad-output/docs/2025-12-28/investigation-report.md
  - _bmad-output/docs/2025-12-28/version-2/domain-1-llm-provider-config-research.md
  - _bmad-output/docs/2025-12-28/version-2/domain-2-agent-config-architecture-research.md
  - _bmad-output/docs/2025-12-28/version-2/domain-3-rag-infrastructure-research.md
  - _bmad-output/docs/2025-12-28/version-2/remediation-epics.md
  - _bmad-output/archive/architecture.md
documentCounts:
  prd: 1
  uxDesign: 1
  research: 5
  remediationEpics: 1
  archivedArchitecture: 1
workflowType: 'architecture'
workflowStatus: 'in_progress'
lastStep: 3
project_name: 'Project Alpha v2.0 - Knowledge Synthesis Station'
user_name: 'Admin'
date: '2025-12-28'
---

# Architecture Decision Document

## Project Alpha v2.0 - Knowledge Synthesis Station

**Version:** 2.0  
**Author:** Admin  
**Date:** 2025-12-28  
**Status:** In Progress  

---

## Section 1: Executive Summary

This architecture document addresses a **dual mandate**:

1. **Phase 1: Brownfield Stabilization** — Fix critical state management and agent architecture issues blocking reliable operation
2. **Phase 2: Knowledge Synthesis MVP** — Enable the strategic pivot from IDE-centric to Knowledge-Platform-centric architecture

**Key Insight:** Phase 1 stability is a **prerequisite** for Phase 2 features. The RAG infrastructure cannot be reliably built on a foundation with hot-reload bugs, race conditions, and incomplete agent layers.

---

## Section 2: Project Context Analysis

### 2.1 Requirements Overview

#### Functional Requirements Across Two Phases

| Phase | Domain | Count | Critical Items | Status |
|-------|--------|-------|----------------|--------|
| **Phase 1: Stabilization** | State Management | 8 | Hot-reload fix, atomic updates, CRUD completion, FSA re-grant | 🚨 P0 (Blocking) |
| **Phase 1: Stabilization** | Agent Architecture | 6 | 5-layer system, chatflow composition, tool registry | 🚨 P0 (Blocking) |
| **Phase 1: Stabilization** | WebContainer Sync | 4 | Dual-write sync (<500ms), conflict resolution, session restore | ⚠️ P1 (Important) |
| **Phase 2: Knowledge Synthesis** | RAG Infrastructure | 5 | Orama WASM vector store, client-side embeddings, hybrid search | 🔜 Future |
| **Phase 2: Knowledge Synthesis** | EdTech Features | 7 | Source ingestion, citation framework, flashcards, audio overview | 🔜 Future |

#### Brownfield Issues Identified

**Critical State Management Problems:**

| Issue ID | Problem | Root Cause | Impact | Remediation Epic |
|----------|---------|------------|--------|------------------|
| **BF-01** | Hot-reload bug | `AgentConfigDialog` uses `useState` instead of Zustand | Config changes invisible until navigation | **R-01** (P0) |
| **BF-02** | Non-atomic state updates | No optimistic UI + rollback | Race conditions, data loss | **R-02** (P0) |
| **BF-03** | Incomplete CRUD surface | Missing edit/delete in `AgentSelector` | Inconsistent UX patterns | **R-05** (P1) |
| **BF-04** | Dual-source state in `IDELayout` | Local `useState` + Zustand redundancy | Sync conflicts, memory leaks | **R-13** (P2) |
| **BF-05** | Multi-provider race conditions | Concurrent fetches, no shared loading state | API rate limits, inconsistent state | **R-14** (P2) |

**Critical Agent Architecture Gaps:**

| Issue ID | Problem | Root Cause | Impact | Remediation Epic |
|----------|---------|------------|--------|------------------|
| **BF-06** | Missing agent layers 3-5 | Only Layer 1 (System) + Layer 2 (Modes) exist | No dynamic context injection, task-specific instructions | **R-04** (P0) |
| **BF-07** | Static chatflow | No runtime composition of agent layers | Cannot customize per-request | **R-07** (HIGH) |
| **BF-08** | No cross-architecture context | Workspace state not shared with agents | Agents lack file tree, open files context | **R-09** (HIGH) |
| **BF-09** | Limited tool approval workflow | No granular permissions, no audit log | Security risk for destructive operations | **R-10** (MEDIUM) |

---

### 2.2 Non-Functional Requirements

#### Performance Targets

| Category | Metric | Current (Brownfield) | Target (Phase 1) | Measurement |
|----------|--------|----------------------|------------------|-------------|
| **State Updates** | UI Feedback Latency | ❌ Requires navigation | <100ms | PerformanceObserver |
| **File Operations** | Write Latency | ~800ms (measured) | <500ms | Atomic write timing |
| **Agent Response** | Time to First Token (TTFT) | ~2.5s | <2s | TanStack AI streaming |
| **WebContainer Boot** | Init Time | ~7s (cold start) | <5s | `boot()` promise |
| **FSA Re-grant** | Success Rate | ~75% (inconsistent) | >90% | Permission API metrics |

#### Reliability Targets

| Category | Metric | Current | Target | Validation |
|----------|--------|---------|--------|------------|
| **State Consistency** | Data Loss Incidents | 3-5/week (reported) | 0/week | Rollback mechanism |
| **File Sync** | Sync Success Rate | ~92% | 99%+ | SHA-256 verification |
| **Tool Execution** | Tool Success Rate | ~85% | 95%+ | Error retry logic |
| **Session Restore** | State Restoration | ~80% | 99%+ | IndexedDB + FSA handles |

---

### 2.3 Technical Constraints & Dependencies

#### Brownfield Architecture Constraints

| Constraint | Description | Architectural Impact | Remediation Strategy |
|------------|-------------|----------------------|----------------------|
| **Zustand + Dexie Dual-Persistence** | Some state in Zustand (ephemeral), some in Dexie (persistent) | State duplication, sync bugs | **Unified Store Pattern** (R-02) |
| **Local State in Components** | `AgentConfigDialog`, `IDELayout`, `MobileIDELayout` use `useState` | Non-reactive updates | **Migrate to Zustand** (R-01, R-13) |
| **Prop Drilling** | Agent config passed via props, not store subscriptions | Stale data in UI | **Selector Pattern** (R-01) |
| **FSA Handle Expiration** | File System Access handles expire on browser close | Re-grant required on reload | **Permission Lifecycle Manager** (existing, needs UX) |
| **Single WebContainer** | Only one WebContainer instance per page | Cannot run multiple projects | **Accepted Constraint** (Phase 1) |

#### Technology Stack Dependencies

| Technology | Version | Purpose | Constraint |
|------------|---------|---------|------------|
| **TanStack Router** | 1.143.3 | File-based routing | No dynamic route injection |
| **Zustand** | 5.0.9 | State management | Middleware for persistence needed |
| **Dexie.js** | 4.2.1 | IndexedDB abstraction | Schema versioning required |
| **@webcontainer/api** | 1.6.1 | Browser Node.js runtime | COOP/COEP headers mandatory |
| **Monaco Editor** | 0.55.1 | Code editor | ~3MB bundle, lazy load required |
| **@tanstack/ai** | 0.2.0 | AI agent orchestration | SSE streaming only |

#### Mandatory Security Headers

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval';
```

---

### 2.4 Cross-Cutting Concerns

#### State Synchronization Pipeline (Fixed in Phase 1)

**Current (Broken) Flow:**
```
User Edit → Component useState → (❌ No Zustand) → IndexedDB Persist → 
UI Not Updated → Navigation Trigger → Re-render
```

**Target (R-01, R-02) Flow:**
```
User Edit → Zustand Action → Optimistic UI Update (<100ms) → 
Background Persist (IndexedDB + FSA) → Success/Rollback Toast
```

**Atomic Update Pattern (R-02):**
```typescript
// Optimistic Update with Rollback
const updateAgent = async (id: string, updates: Partial<Agent>) => {
    const previousState = useAgentsStore.getState().agents;
    
    // Step 1: Optimistic update (immediate UI)
    useAgentsStore.getState().updateAgent(id, updates);
    
    try {
        // Step 2: Persist to IndexedDB
        await db.agents.update(id, updates);
        
        // Step 3: Sync to FSA (if applicable)
        await syncToLocalFS(id, updates);
        
        toast.success('Agent updated');
    } catch (error) {
        // Step 4: Rollback on failure
        useAgentsStore.setState({ agents: previousState });
        toast.error('Update failed');
    }
};
```

#### 5-Layer Agent System (R-04)

**Current (Incomplete):**
```
Layer 1: System Instruction (Always Sent, Hidden) ✅ Implemented
Layer 2: Agent Modes (User-Selectable) ✅ Implemented
Layer 3: Context/Prompt Injection ❌ Missing
Layer 4: Task-Specific Instructions ❌ Missing
Layer 5: Hidden System Directives ❌ Missing
```

**Target Architecture:**
```typescript
// System Prompt Composer (R-04)
interface LayerDefinition {
    id: string;
    priority: number; // 1 (first) to 5 (last)
    content: (config: AgentConfig, context?: PromptContext) => string;
    isHidden: boolean;
    required: boolean;
}

// Layer 3: Dynamic Context Injection
const CONTEXT_INJECTION: LayerDefinition = {
    id: 'context-injection',
    priority: 3,
    content: (config, context) => `
Project Context:
- Open files: ${context.openFiles?.join(', ')}
- Active file: ${context.activeFile}
- File tree: ${context.fileTree}

RAG Context:
${context.ragDocuments?.map(d => `- ${d.title}`).join('\n')}
    `,
    isHidden: false,
    required: false,
};

// Compose final system prompt
const systemPrompt = [
    TOOL_CONSTITUTION,      // Layer 1
    MODE_SOLO_DEV,          // Layer 2
    CONTEXT_INJECTION,      // Layer 3 (NEW)
    TASK_SPECIFIC,          // Layer 4 (NEW)
    SYSTEM_DIRECTIVES,      // Layer 5 (NEW)
].map(layer => layer.content(config, context)).join('\n\n');
```

#### Permission Lifecycle Management (Phase 1)

**FSA Permission States:**
```
[*] → NotGranted
NotGranted → Prompting: User clicks "Open Project"
Prompting → Granted: User allows
Prompting → Denied: User rejects
Granted → Expired: Browser close/reload
Expired → Prompting: Re-grant flow
Denied → Prompting: "Try Again" button
```

**UX Flow (Existing but Inconsistent):**
1. **First Visit:** Explainer Modal → Native Folder Picker → Grant
2. **Return Visit:** Dashboard "Resume" → One-click "Restore Access" → Ready
3. **Denied:** Blocking Modal → "Try Again" → Native Picker

**Phase 1 Fix:** Standardize re-grant UX across `WorkspacePage`, `IDEPage`, `HubPage`

#### Session Restoration (95%+ Success Target)

**State to Restore:**
- Open files (paths + scroll positions)
- Active file
- Cursor position per file
- Chat history (last 50 messages)
- Panel widths (left/right/center)
- Terminal history (last 100 commands)

**Storage Strategy:**
```typescript
// IndexedDB (Dexie) - Primary
interface SessionState {
    projectId: string;
    openFiles: { path: string; scrollTop: number; cursorPos: Position }[];
    activeFile: string;
    chatHistory: Message[];
    panelWidths: { left: number; center: number; right: number };
    terminalHistory: string[];
    timestamp: number;
}

// Restore on load
useEffect(() => {
    const session = await db.sessions.get(projectId);
    if (session && Date.now() - session.timestamp < 7 * 24 * 60 * 60 * 1000) {
        // Restore if <7 days old
        useIDEStore.setState(session);
    }
}, [projectId]);
```

#### Error Recovery Patterns (Phase 1)

| Error Type | Detection | Recovery Strategy | User Notification |
|------------|-----------|-------------------|-------------------|
| **WebContainer Crash** | `process.on('error')` | Auto-restart with last state | Toast: "Environment restarted" |
| **FSA Permission Denied** | `PermissionError` | Show re-grant modal | Blocking modal with "Restore Access" |
| **Sync Conflict** | SHA mismatch | Show diff dialog | Modal: "Keep Local or Reload?" |
| **Tool Execution Failure** | `ToolExecutionError` | Retry once, then prompt | Toast with "Retry" action |
| **IndexedDB Quota Exceeded** | `QuotaExceededError` | Cache cleanup prompt | Warning banner: "Storage Full" |

---

### 2.5 Scale & Complexity Indicators

| Dimension | Assessment | Rationale |
|-----------|------------|-----------|
| **Project Complexity** | **HIGH** | Novel browser-native architecture + brownfield state issues + Phase 2 RAG |
| **Primary Technical Domain** | **Hybrid** | IDE (Phase 1) + EdTech Knowledge Platform (Phase 2) |
| **Architectural Components** | **10 major layers** | Presentation → State → Agent → WebContainer → RAG (Phase 2) |
| **Brownfield Remediation Effort** | **4-6 weeks** | 14 remediation epics (P0-P2) across 3 domains |
| **Phase 2 Greenfield Effort** | **8-12 weeks** | RAG infrastructure, Orama WASM, Audio Overview |

---

### 2.6 Cross-Architecture Context Gaps (R-09)

**Current Problem:** Agents lack workspace context (file tree, open files, active file)

**Architecture Requirement:**
```typescript
// Shared Context Store (NEW in Phase 1)
interface WorkspaceContext {
    // File System State
    projectId: string;
    projectName: string;
    fileTree: FileNode[];
    openFiles: string[];
    activeFile: string | null;
    totalFiles: number;
    
    // Agent State
    activeAgentId: string | null;
    conversationHistory: Message[];
    
    // WebContainer State
    wcStatus: 'booting' | 'ready' | 'error';
    terminalOutput: string[];
    
    // Phase 2: RAG State
    ragDocuments?: RAGDocument[];
    lastQueryResults?: SearchResult[];
}

// Inject into Agent Layer 3 (Context Injection)
const contextLayer = composeLayer(3, workspaceContext);
```

**Synchronization Boundaries (R-09):**
1. **Local FS → Zustand:** FSA change events → `useIDEStore`
2. **Zustand → WebContainer:** File updates → SyncManager → WC FS
3. **Zustand → Agent Context:** Store subscription → Layer 3 injection
4. **WebContainer → Zustand:** Terminal output → `useStatusBarStore`

---

### 2.7 Performance Boundaries (Phase 1 Optimization)

| Boundary | Exclusion Pattern | Rationale | Implementation |
|----------|-------------------|-----------|----------------|
| **Sync Exclusions** | `node_modules/**`, `.git/**`, `dist/**` | Avoid syncing 100K+ files | `SyncManager.excludePatterns` |
| **Lazy Load Targets** | Monaco Editor, WebContainer API, xterm.js | Reduce initial bundle (<2s TTI) | Vite `import()` |
| **Code Splitting** | Route-based chunking | Avoid monolithic 2MB bundle | TanStack Router auto-split |
| **Vector Store (Phase 2)** | WASM embeddings in Web Worker | Prevent UI thread block | `new Worker()` |

## Section 3: Starter Template Evaluation

### 3.1 Primary Technology Domain

**Hybrid — Full-Stack Client-Side IDE + EdTech Knowledge Platform** based on project requirements analysis.

This is a **brownfield project** with an established, working codebase. **No new starter template is required.**

---

### 3.2 Deployment Architecture (Verified from `vite.config.ts`)

**Current Configuration:**

| Setting | Value | Source |
|---------|-------|--------|
| **Mode** | SSR with Hybrid Rendering | `tanstackStart()` plugin |
| **Deploy Target** | Cloudflare (default), Netlify, Node | `DEPLOY_TARGET` env var |
| **WebContainer Routes** | Client-only rendering | SSR externals configuration |
| **Security Headers** | `securityHeadersPlugin` (FIRST in plugins array) | `vite.config.ts` line 71 |

**SSR vs SPA Clarification:**

TanStack Start is **SSR-first**, but the project uses **Hybrid SSR** mode:

```typescript
// vite.config.ts (verified)
ssr: DEPLOY_TARGET === 'cloudflare'
  ? { noExternal: true } // Bundle everything for Cloudflare
  : {
    external: [
      '@xterm/xterm',          // DOM-dependent
      '@monaco-editor/react',  // DOM-dependent
      'monaco-editor',         // DOM-dependent
      '@webcontainer/api',     // SharedArrayBuffer
    ],
    noExternal: [],
  },
```

**Rationale:** These libraries are externalized from SSR bundling because they require browser APIs (DOM, SharedArrayBuffer) unavailable in Node.js SSR context. The IDE routes (`/ide/*`, `/workspace/*`) effectively render client-only due to these externals.

---

### 3.3 Security Headers Configuration (COOP/COEP)

**Required for WebContainers (SharedArrayBuffer):**

```typescript
// vite.config.ts - securityHeadersPlugin (MUST BE FIRST)
const securityHeadersPlugin: Plugin = {
  name: 'configure-security-headers',
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      // Cross-Origin Isolation (required for WebContainers)
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

      // Additional Security Headers
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

      next()
    })
  },
}
```

**⚠️ Critical:** CSP is NOT set in dev server because it blocks IndexedDB operations, File System Access API, and WebContainer internals. Production headers are handled by `server/middleware/security-headers.ts`.

---

### 3.4 Existing Technology Stack (Locked Decisions)

**Core Framework:**

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **TanStack Start** | 1.x | Full-stack React framework (Hybrid SSR) | ✅ Locked |
| **TanStack Router** | 1.143.3 | File-based routing | ✅ Locked |
| **TanStack AI** | 0.2.0 | AI agent streaming | ✅ Locked |
| **React** | 19.x | UI library | ✅ Locked |
| **TypeScript** | 5.x | Language (strict mode) | ✅ Locked |
| **Vite** | 7.x | Build tooling | ✅ Locked |

**State & Persistence:**

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Zustand** | 5.0.9 | State management | ✅ Locked (fixing issues) |
| **Dexie.js** | 4.2.1 | IndexedDB abstraction | ✅ Locked |

**UI & Styling:**

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Tailwind CSS** | 4.x | Utility-first styling | ✅ Locked |
| **Radix UI** | 1.x | Accessible primitives | ✅ Locked |
| **Lucide React** | Latest | Icon library | ✅ Locked |
| **next-themes** | Latest | Theme management | ✅ Locked |

**IDE Components:**

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **Monaco Editor** | 0.55.1 | Code editor | ✅ Locked |
| **xterm.js** | Latest | Terminal emulator | ✅ Locked |
| **@webcontainer/api** | 1.6.1 | Browser Node.js | ✅ Locked |
| **isomorphic-git** | Latest | Client-side Git | ✅ Locked |

**Internationalization:**

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| **react-i18next** | Latest | i18n framework | ✅ Locked |
| **i18next-browser-languagedetector** | Latest | Auto-detection | ✅ Locked |

---

### 3.5 Phase 2 Vector Store Strategy

**Selected Technology:** Orama WASM (Phase 2.0 MVP)

**Decision Rationale:**

| Feature | Orama (WASM) | Qdrant (Cloud/Self-hosted) |
|---------|--------------|---------------------------|
| **Deployment** | ✅ Browser-native | Requires backend server |
| **Performance** | ~1K docs recommended | 10K+ docs = fast |
| **Bundle Size** | ~180KB WASM | 0KB (external) |
| **Offline** | ✅ Full offline | ❌ Network required |
| **Cost** | $0 (client-only) | $0-25/mo (Qdrant Cloud) |
| **Zero-Backend** | ✅ Aligns with architecture | ❌ Requires infra |

**Decision:** Orama WASM for Phase 2.0 MVP

- ✅ Aligns with zero-backend, local-first architecture
- ✅ 100% browser-native (offline-first)
- ✅ Sufficient for target scale (≤1,000 educational documents per user)
- ⚠️ Future migration path to Qdrant hybrid if scale exceeds 10K+ docs

**Alternative Considered:** Qdrant (rejected for MVP due to backend requirement)

---

### 3.6 Phase 2 Technology Additions

For Knowledge Synthesis features, these will be **added** to the existing stack:

| Technology | Size (min+gzip) | Purpose | Loading Strategy |
|------------|----------------|---------|------------------|
| **Orama Core** | ~180KB | WASM vector store | Route-level code split (`/knowledge/*`) |
| **pdf.js Worker** | ~500KB | Client-side PDF parsing | Web Worker + lazy import on file upload |
| **React Flow** | ~300KB | Knowledge canvas visualization | Dynamic `import()` on canvas open |
| **mammoth.js** | ~150KB | DOCX parsing | On-demand when `.docx` detected |
| **JSZip** | ~25KB | .alpha pack creation | Lazy load on export action |

**Bundle Size Target:** <2MB total Phase 2 additions, loaded on-demand only.

**Loading Strategy Pattern:**
```typescript
// Phase 2: Lazy-loaded dependencies
const loadOrama = () => import('@orama/orama');
const loadPdfJs = () => import('pdfjs-dist');
const loadReactFlow = () => import('@xyflow/react');
const loadMammoth = () => import('mammoth');
const loadJSZip = () => import('jszip');
```

---

### 3.7 SSR Externals Configuration

```typescript
// vite.config.ts - Prevent SSR bundling of client-only deps
ssr: {
  external: [
    '@xterm/xterm',          // Terminal (DOM-dependent)
    '@xterm/addon-fit',      // Terminal addon
    '@monaco-editor/react',  // Editor wrapper
    'monaco-editor',         // Editor core (DOM-dependent)
    '@webcontainer/api',     // WebContainers (SharedArrayBuffer)
  ],
  noExternal: [],
}
```

**Rationale:** These libraries require browser APIs (DOM, SharedArrayBuffer) unavailable in Node.js SSR context. They are dynamically imported in client-side components with appropriate guards.

---

### 3.8 Platform-Specific Deployment

**Cloudflare (Default):**
```typescript
// DEPLOY_TARGET=cloudflare
ssr: { noExternal: true } // Bundle everything
```

**Netlify/Node:**
```typescript
// DEPLOY_TARGET=netlify or DEPLOY_TARGET=node
ssr: { external: ['@xterm/xterm', ...] } // Externalize browser deps
```

**Hosting Configuration:**
- **Cloudflare Pages:** Zero-config with `@cloudflare/vite-plugin`
- **Netlify:** Uses `@netlify/vite-plugin-tanstack-start`
- **Node:** Standard TanStack Start server output

---

<!-- Section 4: Core Architectural Decisions will be appended next -->

