# Spike-to-Cluster Mapping

**Generated:** 2025-12-10T10:15:00+07:00  
**Purpose:** Cross-reference between Advanced IDE Spike files and MVP-0 Remediation Cluster tasks

---

## Overview

This document maps validated patterns from `spikes/advanced-ide-spike` to their corresponding remediation cluster tasks. Use this as the canonical reference when implementing cluster tasks.

---

## Cluster 1: TanStack AI Integration

| Task | Spike Reference | Key Patterns |
|------|-----------------|--------------|
| 1.1 Refactor useAgentChat | `src/routes/workspace/ide.tsx:63-120` | `useChat()` with `fetchServerSentEvents`, message state management |
| 1.2 Convert tool definitions | `src/lib/tools/definitions.ts:1-150` | `toolDefinition()` with Zod schemas, `needsApproval` flag |
| 1.3 Update agent API | `app/api/chat.ts:1-140` | `createGemini()`, `chat()`, `toStreamResponse()` |
| 1.4 Align tool registry | `src/lib/agent/tools.ts:1-80` | Client tool wiring, tool executor pattern |
| 1.5 Update chat panel | `src/routes/workspace/ide.tsx:180-250` | Message rendering, tool call display |
| 1.6 GeminiAdapter | `app/api/chat.ts:20-40` | `createGemini(apiKey)` pattern |
| 1.7 Coordinator agent | N/A (may be obsoleted by `useChat` loop) | Evaluate if still needed |
| **1.8 Chat persistence** | `src/lib/persistence/layer.ts:1-60` | `idb-keyval`, load/save/clear, restore indicator |
| **1.9 FileManager sync** | `src/lib/file-manager.ts:1-200` | Hub & Spoke, `showDirectoryPicker()`, WebContainer mount |

---

## Cluster 2: Route Structure Consolidation

| Task | Spike Reference | Key Patterns |
|------|-----------------|--------------|
| 2.1 Delete legacy routes | N/A (cleanup task) | Remove `src/routes/ide/` |
| 2.2 Verify primary IDE route | `src/routes/workspace/ide.tsx` | SSR disabled, client-only component |
| 2.3 Extract search schema | `src/routes/workspace/ide.tsx:1-30` | `zodValidator`, search params |
| 2.4 Add zodValidator | `src/routes/workspace/ide.tsx:15-25` | `validateSearch: zodValidator(...)` |
| 2.5 Fix Link typing | N/A (TypeScript fix) | Ensure `Link` params match route |
| 2.6 Verify route tree | `src/routeTree.gen.ts` | Auto-generated, verify `/workspace/ide` registered |

---

## Cluster 3: Test Consolidation

| Task | Spike Reference | Key Patterns |
|------|-----------------|--------------|
| 3.1-3.8 Test structure | `tests/tools.test.ts:1-73` | Tool definition tests, Zod validation, approval flags |

**Additional test coverage needed for spike patterns:**
- TanStack AI `useChat` integration tests
- FileManager + WebContainer sync tests
- Chat persistence load/save tests
- Tool execution with mock WebContainer

---

## Cluster 4: Domain API Enforcement

| Task | Spike Reference | Key Patterns |
|------|-----------------|--------------|
| 4.1-4.5 Domain boundaries | `src/lib/file-manager.ts` | FileManager as infrastructure, not domain-internal |

**Spike informs:**
- FileManager should be infrastructure layer (`src/infrastructure/` or `src/lib/`)
- Tools wire to FileManager, not directly to domain stores
- Domain APIs expose high-level operations, infrastructure handles low-level FS

---

## Cluster 5: Cleanup & Hygiene

| Task | Spike Reference | Key Patterns |
|------|-----------------|--------------|
| 5.1 Delete empty dirs | N/A | Standard cleanup |
| 5.2 coordinator-agent.ts | Spike uses `useChat` loop | May be obsoleted |
| 5.3 gemini-client.ts | `app/api/chat.ts` uses `createGemini()` | Migrate to TanStack AI pattern |
| 5.4 app-store.ts | Spike uses component-local state | Evaluate migration |
| 5.5 Import aliases | All spike files | Use `@/` alias consistently |

---

## Canonical File Index

### Core Architecture

| Spike File | Purpose | Main App Target |
|------------|---------|-----------------|
| `app/api/chat.ts` | Server-side chat endpoint | `src/routes/api/chat.ts` |
| `src/routes/workspace/ide.tsx` | IDE route with useChat | `src/routes/_workspace/ide/index.tsx` |
| `src/lib/file-manager.ts` | Hub & Spoke FS manager | `src/lib/file-manager.ts` |
| `src/lib/persistence/layer.ts` | Chat history persistence | `src/lib/persistence/chat-persistence.ts` |

### Tool System

| Spike File | Purpose | Main App Target |
|------------|---------|-----------------|
| `src/lib/tools/definitions.ts` | Shared tool schemas | `src/lib/agent-tools.ts` |
| `src/lib/agent/tools.ts` | Client tool wiring | `src/domains/agent/core/ToolRegistry.ts` |
| `app/api/chat.ts:50-120` | Server tool implementations | `src/lib/agent-api.ts` |

### Infrastructure

| Spike File | Purpose | Main App Target |
|------------|---------|-----------------|
| `src/lib/webcontainer.ts` | WebContainer manager | `src/lib/webcontainer-manager.ts` |
| `src/lib/db/pglite-demo.ts` | PGlite evidence | Post-MVP-0 |

---

## Version Compatibility

Validated package versions from spike (must match main app):

```json
{
  "@tanstack/ai": "0.0.3",
  "@tanstack/ai-gemini": "0.0.3",
  "@tanstack/react-start": "1.140.0",
  "@tanstack/react-router": "1.140.0",
  "@webcontainer/api": "1.4.0",
  "isomorphic-git": "1.27.0",
  "idb-keyval": "6.2.1",
  "zod": "4.1.11"
}
```

---

## Usage Instructions

When implementing a cluster task:

1. **Find the task** in the tables above
2. **Open the spike file** at the referenced path
3. **Copy the pattern** adapting to main app file structure
4. **Verify types** match between spike and main app
5. **Run validation** (`pnpm typecheck`, `pnpm test`)

---

## Related Documents

- `agent-os/specs/mvp-0-remediation/README.md` - Cluster overview
- `docs/bmm-workflow-status.yaml` - Execution status tracking
- `docs/analysis/spikes/unified-architecture-blueprint-2025-12-10.md` - Architecture blueprint
