# Spike Directory Structure

**Created:** 2026-01-16
**Purpose:** Isolated testing environment for routing and user journey validation

This directory contains ACTUAL COPIED CODE from main app, not shared imports.

## Directory Structure

```
src/spike/
├── routes/                          ← Spike routes (already exist, update imports)
├── components/
│   ├── ide/                       ← IDE components (SELECTIVE COPY)
│   ├── notes/                      ← Notes components (SELECTIVE COPY)
│   └── common/                      ← Shared components (SELECTIVE COPY)
├── stores/                         ← Zustand stores (SELECTIVE COPY)
├── infrastructure/
│   ├── persistence/                  ← Dexie DB (SELECTIVE COPY)
│   └── filesystem/                   ← Platform/Storage (SELECTIVE COPY)
└── lib/                            ← Utilities (SELECTIVE COPY)
```

## Copy Strategy

**SELECTIVE COPY ONLY** - Files that demonstrate user journeys for Notes/IDE:
- Desktop: Create project → enter IDE → hotload → file tree loads → CRUD
- Mobile: Create project → enter Notes (IDE blocked) → hotload

**DO NOT COPY:**
- ❌ AI/Agent components (AISlashCommand, AgentChatPanel, etc.)
- ❌ RAG components (NotesRAGSearch)
- ❌ Knowledge/Study components (deferred)
- ❌ Dead code/orphanage (unless in same folder as relevant code)
- ❌ Block components NOT used by Notes/IDE journey
