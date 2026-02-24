# Project Overview

**Via-gent** (Project Alpha v2.0) is a browser-based IDE that runs code locally using WebContainers with integrated AI agent capabilities. The project is evolving toward a **Knowledge Synthesis Station** — a local-first platform that merges Google NotebookLM-style AI synthesis with Notion-like knowledge organization.

## Executive Summary

Via-gent enables developers to write, execute, and debug code entirely in the browser by leveraging:
- **WebContainer API**: Full Node.js environment running in the browser
- **AI Agent Integration**: LLM-powered coding assistants with file/terminal tool access
- **Local-First Architecture**: File System Access API for local file operations
- **RAG Knowledge Base**: Vector search with Orama WASM for source ingestion and notes

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Runtime | React | 19.2.3 |
| Build Tool | Vite | 7.3.0 |
| Language | TypeScript | 5.9.3 |
| Router | TanStack Router | 1.144.0 |
| State Management | Zustand | 5.0.9 |
| Database | Dexie.js | 4.2.1 |
| Styling | TailwindCSS | 4.1.18 |
| UI Components | Radix UI Primitives | Headless |
| Code Editor | Monaco Editor | 0.55.1 |
| Terminal | xterm.js | 6.0.0 |
| AI Framework | TanStack AI | 0.2.0 |
| Testing | Vitest | 4.0.16 |

## Architecture Type

**Single-Part Monolith Web Application** with:
- Client-side SPA architecture (TanStack Start)
- Server-side API routes (TanStack Start SSR / Cloudflare Workers)
- Local file system integration via File System Access API
- WebContainer sandbox for execution

## Key Features

### Core IDE Features
- **File Tree**: Browse and manage local project files
- **Code Editor**: Monaco Editor with syntax highlighting
- **Terminal**: xterm.js integrated with WebContainer shell
- **Preview Panel**: Live preview for web projects
- **Status Bar**: Real-time sync status, provider status, cursor position

### AI Agent System
- **Agent Configuration**: Configure multiple AI providers (OpenRouter, OpenAI, Anthropic, Google Gemini)
- **Tool Permissions**: Granular control over file/terminal access
- **Chat Interface**: Conversational AI with streaming responses
- **Approval Workflow**: User approval required for destructive operations

### Knowledge Synthesis (Future)
- **Source Import**: PDF, URL, and text ingestion
- **Vector Search**: Orama WASM for local RAG
- **BlockNote Editor**: Structured note-taking with hierarchical organization
- **Study Artifacts**: Auto-generated flashcards and quizzes

## Project Structure

```
project-alpha-master/
├── src/
│   ├── components/          # React UI components
│   │   ├── agent/           # Agent configuration & chat
│   │   ├── chat/            # Chat interface
│   │   ├── ide/             # IDE layout components
│   │   ├── layout/          # Application shells
│   │   └── ui/              # Reusable primitives
│   ├── lib/                 # Core libraries
│   │   ├── agent/           # AI agent infrastructure
│   │   ├── filesystem/      # File System Access
│   │   ├── webcontainer/    # WebContainer lifecycle
│   │   ├── workspace/       # Workspace state
│   │   └── state/           # Zustand stores & Dexie DB
│   ├── routes/              # TanStack Router routes
│   ├── hooks/               # Custom React hooks
│   └── stores/              # Agent-specific stores
├── docs/                    # Existing documentation
├── _bmad/                   # BMAD method artifacts
└── _bmad-output/            # Generated artifacts
```

## Repository Structure

- **Type**: Monolith (single repository)
- **Version Control**: Git
- **Package Manager**: pnpm

## Development Status

**Phase 1: Core Stabilization** (Current Focus)
- Chat Cascade System: Fix composable architecture issues
- LLM Provider Configuration: Resolve hot-reload visibility bugs
- State Management: Unify Zustand + Dexie, remove Context mixing
- Mobile Support: Responsive layout with mobile-specific error states

**Phase 2: Knowledge Synthesis** (Future)
- Source ingestion (PDF, URL via client-side parsing)
- Vector store (Orama WASM) for RAG
- Knowledge canvas with blocks + connections
- Study artifact generation

## Documentation Links

- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [API Contracts](./api-contracts.md)
- [Data Models](./data-models.md)
- [Development Guide](./development-guide.md)

## For AI-Assisted Development

When using this documentation for AI agents:
1. Start with the [Architecture](./architecture.md) for system design context
2. Reference [API Contracts](./api-contracts.md) for endpoint details
3. Use [Data Models](./data-models.md) for persistence layer understanding
4. Consult [Component Inventory](./component-inventory.md) for UI patterns

---

*Generated: 2025-12-31*
