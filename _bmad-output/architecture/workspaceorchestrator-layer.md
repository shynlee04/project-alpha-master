# WorkspaceOrchestrator Layer

**Status:** Future consolidation target  
**Depends On:** Epic 10 (Event Bus), Epic 11 (Code Splitting)

### Design Rationale

Current WorkspaceContext mixes state management with side effects. WorkspaceOrchestrator will:
- Coordinate all subsystems through a unified interface
- Manage lifecycle (boot, mount, sync, shutdown)
- Provide observable state via event bus
- Enable multi-root workspace support (Epic 9)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        UI Layer                                 │
│  (IDELayout, FileTree, Terminal, Editor, Preview, Chat)        │
├─────────────────────────────────────────────────────────────────┤
│                    WorkspaceOrchestrator                        │
│  • boot() → WebContainer + FSA handle                          │
│  • sync() → LocalFS ↔ WebContainer                             │
│  • spawn() → Process management                                 │
│  • close() → Cleanup and persist                               │
├──────────┬──────────┬───────────┬──────────┬──────────────────┤
│  Local   │  Sync    │ Container │ Terminal │   Git Layer      │
│FSAdapter │ Engine   │  Manager  │  Adapter │  (isomorphic)    │
├──────────┴──────────┴───────────┴──────────┴──────────────────┤
│                       Event Bus                                 │
│              (WorkspaceEventEmitter)                           │
├─────────────────────────────────────────────────────────────────┤
│                    Persistence Layer                            │
│     (ProjectStore, ConversationStore, LayoutStore)             │
└─────────────────────────────────────────────────────────────────┘
```

---
