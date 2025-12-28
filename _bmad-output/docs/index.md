---
title: Via-gent Documentation Index
version: 1.0.0
date: 2025-12-28
phase: Documentation
agent_mode: bmad-bmm-tech-writer
team: Documentation Team
---

# Via-gent Documentation Index

**Master AI Entry Point for Via-gent Project**

This index provides quick access to all documentation for the Via-gent browser-based IDE project. Use this document as your primary reference when working with AI agents or understanding the project structure.

## Quick Navigation

| Topic | Document | Description |
|-------|----------|-------------|
| [Project Overview](./project-overview-2025-12-28.md) | Executive summary, value proposition, technical foundation |
| [Architecture Analysis](./architecture-analysis-2025-12-28.md) | System architecture, components, data flows, security |
| [Source Tree Analysis](./source-tree-analysis-2025-12-28.md) | Directory structure, file organization, key patterns |
| [Tech Stack Documentation](./tech-stack-documentation-2025-12-28.md) | All dependencies, integration patterns, configuration |
| [Development Patterns](./development-patterns-conventions-2025-12-28.md) | Coding conventions, component patterns, state management |

## Project Summary

**Via-gent** is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities.

### Core Capabilities

- **Monaco Editor**: Full-featured code editing with tabbed interface
- **WebContainer Integration**: Execute code directly in the browser
- **File System Sync**: Bidirectional sync between local File System Access API and WebContainers
- **AI Agent System**: Multi-provider support (OpenRouter, Anthropic, etc.) via TanStack AI
- **Internationalization**: English and Vietnamese language support
- **Project Persistence**: IndexedDB for project metadata and conversations

### Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 with TypeScript |
| Build Tool | Vite |
| Routing | TanStack Router |
| State Management | Zustand |
| Database | Dexie.js (IndexedDB) |
| AI Integration | TanStack AI |
| Code Editor | Monaco Editor |
| Terminal | xterm.js |
| Browser Runtime | WebContainer API |
| Styling | Tailwind CSS v4 |
| UI Components | Radix UI Primitives |

## Documentation Structure

### Phase 1: Project Understanding

1. **[Project Overview](./project-overview-2025-12-28.md)**
   - Project identity and branding
   - Value proposition
   - Target users and use cases
   - Technical foundation overview
   - Current development status

2. **[Architecture Analysis](./architecture-analysis-2025-12-28.md)**
   - High-level system architecture
   - Core components and their responsibilities
   - Data flow diagrams
   - Security considerations
   - Integration points

3. **[Source Tree Analysis](./source-tree-analysis-2025-12-28.md)**
   - Directory structure overview
   - Key directories and their purposes
   - File organization patterns
   - Component hierarchy
   - Module relationships

### Phase 2: Technical Details

4. **[Tech Stack Documentation](./tech-stack-documentation-2025-12-28.md)**
   - Complete dependency list
   - Integration patterns
   - Configuration guidelines
   - Version information
   - External services

5. **[Development Patterns and Conventions](./development-patterns-conventions-2025-12-28.md)**
   - TypeScript conventions
   - Component patterns
   - State management patterns
   - API patterns
   - Error handling
   - Testing patterns

## Key Concepts

### File System Architecture

```
Local FS (FSA) ←→ LocalFSAdapter ←→ SyncManager ←→ WebContainer FS
      ↑                                    ↑
   IndexedDB (ProjectStore)         File Change Events
```

**Important Principles:**
- Local FS is the source of truth
- WebContainer mirrors local files
- No reverse sync from WebContainer to local drive
- Singleton WebContainer instance per page

### AI Agent Architecture

```
UI Components (AgentChatPanel, AgentConfigDialog)
         ↓
useAgentChat Hook (with tools)
         ↓
AgentFactory (creates adapters)
         ↓
ProviderAdapter (OpenRouter, Anthropic, etc.)
         ↓
TanStack AI (chat streaming)
         ↓
Agent Tools (FileTools, TerminalTools)
         ↓
Facades (abstract over WebContainer/LocalFS)
```

### State Management

| State Type | Storage | Examples |
|------------|---------|----------|
| Persisted | IndexedDB | Open files, active file, panels |
| Ephemeral | In-memory | WebContainer status, sync status |
| Agent Config | localStorage | API keys, provider settings |
| UI State | React Context | Theme, workspace context |

## Development Workflow

### MVP Story Sequence

The project follows a sequential story approach:

1. **MVP-1**: Agent Configuration & Persistence
2. **MVP-2**: Chat Interface with Streaming
3. **MVP-3**: Tool Execution - File Operations
4. **MVP-4**: Tool Execution - Terminal Commands
5. **MVP-5**: Approval Workflow
6. **MVP-6**: Real-time UI Updates
7. **MVP-7**: E2E Integration Testing

**Critical Requirement**: Each story requires browser E2E verification before completion.

### Essential Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Extract translation keys
pnpm i18n:extract

# Type checking
pnpm tsc --noEmit
```

## Critical Gotchas

### WebContainer Cross-Origin Isolation

⚠️ **Required Headers**: The Vite configuration must include:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Resource-Policy: cross-origin`

The `crossOriginIsolationPlugin` must be FIRST in the plugins array.

### File System Sync

- **Local FS is source of truth**
- **No reverse sync** from WebContainer to local drive
- **Sync exclusions**: `.git`, `node_modules`, `.DS_Store`, `Thumbs.db`
- **Singleton WebContainer**: Only one instance per page

### Terminal Working Directory

The shell spawns at WebContainer root by default. Pass `projectPath` to `XTerminal` component or `adapter.startShell(projectPath)`.

### File System Access API Permissions

Permissions are ephemeral (single session by default). Use `permission-lifecycle.ts` utilities to manage persistence.

## Common Operations

### Adding New Agent Tools

1. Create tool in `src/lib/agent/tools/`
2. Add tool schema with `zod` validation
3. Implement tool handler (read from facade, execute, return result)
4. Register in `src/lib/agent/tools/index.ts`
5. Add to agent configuration in `useAgentChatWithTools`
6. Write tests in `src/lib/agent/tools/__tests__/`

### Adding New AI Providers

1. Add provider config to `model-registry.ts`
2. Implement adapter in `provider-adapter.ts` following `ProviderAdapter` interface
3. Register in `providerAdapterFactory.createAdapter()`
4. Add to `AgentConfigDialog` provider selector
5. Test with `/api/chat` endpoint

### Adding New Features

1. Create component in appropriate feature directory (`ide/`, `ui/`, `layout/`)
2. Add barrel export in directory's `index.ts`
3. Add translations using `t()` hook
4. Write tests in adjacent `__tests__/` directory
5. Run `pnpm i18n:extract` if adding new translation keys

## File Locations Reference

| Category | Location |
|----------|----------|
| AI Agent System | `src/lib/agent/` |
| Chat UI Components | `src/components/chat/` |
| Chat API | `src/routes/api/chat.ts` |
| Agent Configuration | `src/components/agent/AgentConfigDialog.tsx` |
| File System Logic | `src/lib/filesystem/` |
| WebContainer Manager | `src/lib/webcontainer/manager.ts` |
| Workspace State | `src/lib/workspace/` |
| Zustand Stores | `src/lib/state/`, `src/stores/` |
| Translation Keys | `src/i18n/{en,vi}.json` |

## BMAD Artifacts

| Artifact | Location |
|----------|----------|
| Sprint Status | `_bmad-output/sprint-artifacts/sprint-status-consolidated.yaml` |
| MVP Sprint Plan | `_bmad-output/sprint-artifacts/mvp-sprint-plan-2025-12-24.md` |
| Story Validation | `_bmad-output/sprint-artifacts/mvp-story-validation-2025-12-24.md` |
| Workflow Status | `_bmad-output/bmm-workflow-status-consolidated.yaml` |
| State Audit | `_bmad-output/state-management-audit-2025-12-24.md` |

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| WebContainer not loading | Check COOP/COEP headers in vite.config.ts |
| File sync issues | Verify FSA permissions granted |
| Terminal not responding | Ensure projectPath is passed to XTerminal |
| Translation keys missing | Run `pnpm i18n:extract` |
| Agent tool not executing | Verify tool registration and credentials |
| Chat API 401 | Check credential vault for API keys |

## Documentation Maintenance

This documentation was generated on **2025-12-28** via pure codebase scan. All documents are AI-optimized with:

- Structured frontmatter for tracking
- Clear section hierarchy
- Cross-references between documents
- Code examples with comments
- Version and date stamps

**Update Frequency**: When making significant changes to the codebase, update relevant documentation sections.

---

**Document Information**
- Version: 1.0.0
- Created: 2025-12-28
- Agent: bmad-bmm-tech-writer
- Phase: Documentation
- Purpose: Master AI entry point for Via-gent project