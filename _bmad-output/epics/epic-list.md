# Epic List

1. **Epic 1: Project Foundation & IDE Shell** - Initialize TanStack Start project with routing and layout structure ✅
2. **Epic 2: WebContainers Integration** - Boot and manage WebContainers with terminal integration ✅
3. **Epic 3: File System Access Layer** - Local folder access, file operations, and sync to WebContainers ✅
4. **Epic 4: IDE Components** - Monaco editor, preview panel, and chat panel integration ✅
5. **Epic 5: Persistence Layer** - IndexedDB storage for projects, conversations, and state ✅
6. **Epic 10: Event Bus Architecture** - Transform sync layer to event-driven for AI observability *(NEW - Course Correction v3)*
7. **Epic 12: AI Tool Interface Layer** - Facades exposing subsystems to AI agents *(NEW - Course Correction v3)*
8. **Epic 6: AI Agent Integration** - TanStack AI with client-side tools for file and terminal operations
9. **Epic 7: Git Integration** - isomorphic-git with FSA adapter for local Git operations
10. **Epic 11: Code Splitting & Module Refactor** - Reduce file complexity (parallel track) *(NEW - Course Correction v3)*
11. **Epic 4.5: Project Fugu Enhancements** - Enhanced permissions, file watcher, clipboard, badges
12. **Epic 8: Validation & Polish** - End-to-end testing, performance validation, and UX polish
13. **Epic 9: Multi-Root Workspaces** - VS Code-style multi-root workspace support *(POST-MVP)*
14. **Epic 13: Terminal & Sync Stability** - Critical bug fixes for terminal CWD, auto-sync, and UX *(NEW - Course Correction v5)*
15. **Epic 21: Client-Side Localization (EN/VI)** - Add UI-level localization with language switcher and bundles *(NEW)*

### Epic Status Summary (Updated 2025-12-20)

| Epic | Status | Stories | Tests | Priority | Notes |
|------|--------|---------|-------|----------|-------|
| Epic 1 | ✅ Done | 5/5 | - | - | Foundation |
| Epic 2 | ✅ Done | 4/4 | - | - | WebContainers |
| Epic 3 | ✅ Done | 8/8 | 60 | - | File System (4 hotfix) |
| Epic 4 | ✅ Done | 6/6 | 66 | P0 | IDE Components |
| Epic 5 | ✅ Done | 4/4 | - | P0 | Persistence |
| Epic 10 | ⏳ Backlog | 0/5 | - | **P1** | Event Bus (Course Correction v3) |
| Epic 12 | ⏳ Backlog | 0/5 | - | **P1** | AI Tool Facades |
| Epic 6 | ⏳ Backlog | 0/5 | - | P1 | AI Agent Integration |
| Epic 7 | ⏳ Backlog | 0/4 | - | P2 | Git Integration |
| Epic 11 | ⏳ Backlog | 0/7 | - | P2 | Code Splitting (parallel) |
| Epic 4.5 | ⏳ Backlog | 0/6 | - | P3 | Project Fugu |
| Epic 8 | ⏳ Backlog | 0/8 | - | P3 | Validation & Polish |
| Epic 9 | ⏳ Backlog | 0/7 | - | P4 | Multi-Root (post-MVP) |
| **Epic 13** | **⏳ Ready** | **0/5** | - | **P0** | **Terminal/Sync Bugs (v5)** |
| Epic 21 | ⏳ Backlog | 0/7 | - | P2 | Client-side localization EN/VI |

### Recommended Implementation Order (CHAM Audit 2025-12-13)

```
Phase 1: Foundation      → Epic 4 (complete), Epic 5 (complete)
Phase 2: AI Enablement   → Epic 10 (Event Bus) → Epic 12 (AI Facades) → Epic 6 (AI Agent)
Phase 3: Full Workflow   → Epic 7 (Git)
Phase 4: Optimization    → Epic 11 (Code Splitting) - can run parallel
Phase 5: Enhancements    → Epic 4.5, 8, 9
```

---
