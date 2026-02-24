# Via-gent Project Documentation

Master index for Via-gent project documentation. Use this to navigate to specific documentation topics.

## Quick Start

| Topic | Description |
|-------|-------------|
| [Project Overview](./project-overview.md) | Executive summary and tech stack |
| [Development Guide](./development-guide.md) | Setup and coding conventions |

## Architecture & Design

| Topic | Description |
|-------|-------------|
| [Architecture](./architecture.md) | System architecture, patterns, data flow |
| [Data Models](./data-models.md) | Dexie.js schema and table definitions |
| [API Contracts](./api-contracts.md) | Server routes and client hooks |

## Implementation Details

| Topic | Description |
|-------|-------------|
| [Source Tree Analysis](./source-tree-analysis.md) | Complete directory structure |
| [Component Inventory](./component-inventory.md) | React component reference |

## External Documentation

| Topic | Description |
|-------|-------------|
| [CLAUDE.md](../CLAUDE.md) | AI agent rules and guidelines |
| [AGENTS.md](../AGENTS.md) | Project-specific development patterns |

## BMAD Method Artifacts

| Topic | Description |
|-------|-------------|
| [`_bmad-output/`](../_bmad-output/) | Sprint tracking and epic documentation |
| [`_bmad/`](../_bmad/) | BMAD method modules |

## For AI-Assisted Development

When using this documentation for AI agents:

1. **Start Here**: [Project Overview](./project-overview.md)
2. **Understand System**: [Architecture](./architecture.md)
3. **Find Components**: [Component Inventory](./component-inventory.md)
4. **Understand Data**: [Data Models](./data-models.md)
5. **Find APIs**: [API Contracts](./api-contracts.md)
6. **Setup Dev**: [Development Guide](./development-guide.md)

## Documentation Map

```
┌─────────────────────────────────────────────────────────────────┐
│                     Documentation Structure                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   project-overview.md                                           │
│        │                                                       │
│        ├──► architecture.md (System Design)                    │
│        │        │                                               │
│        │        ├──► data-models.md (Database Schema)          │
│        │        └──► api-contracts.md (APIs & Hooks)           │
│        │                                                       │
│        └──► source-tree-analysis.md (Directory Structure)      │
│                 │                                               │
│                 └──► component-inventory.md (Components)       │
│                                                                 │
│   development-guide.md (How to develop)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Naming Convention

| Pattern | Example | Description |
|---------|---------|-------------|
| `*-overview.md` | `project-overview.md` | Executive summaries |
| `*-analysis.md` | `source-tree-analysis.md` | Structural analysis |
| `*-inventory.md` | `component-inventory.md` | Component listings |
| `*.md` | `architecture.md` | Core documentation |

## Document Metadata

| Property | Value |
|----------|-------|
| Generated | 2025-12-31 |
| Scan Mode | Exhaustive |
| Project Type | Web (Monolith) |
| Framework | React 19 + Vite + TypeScript |

---

*Last Updated: 2025-12-31*
