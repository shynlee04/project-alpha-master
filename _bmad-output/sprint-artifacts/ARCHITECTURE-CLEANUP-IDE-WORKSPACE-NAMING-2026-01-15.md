# 🚨 ARCHITECTURE MESS REPORT: IDE/WORKSPACE/PROJECT Naming Chaos

**Generated:** 2026-01-15  
**Scope:** `src/` directory  
**Status:** CRITICAL - Requires immediate cleanup

---

## 📊 Executive Summary

### The Problem
The codebase has a **naming crisis** causing:
- 3+ different implementations of the same concepts
- 100+ files with inconsistent naming (`fsaHandle`, `directoryHandle`, `handle`)
- Duplicate stores scattered across `lib/workspace/` and `infrastructure/persistence/stores/`
- Confusion between "workspace" (container) and "workspace type" (IDE, Notes, Knowledge, Study)

### Root Cause
- **IDE is treated as separate** from workspaces when it should be a *type* of workspace
- **Project** (the data) is conflated with **Workspace** (the container)
- No clear ownership - `lib/workspace/` duplicates `infrastructure/persistence/stores/`

---

## 🔴 MESS VISUALIZATION

### Current State (THE CHAOS)

```
src/
├── lib/workspace/                      ← 41 files - SHOULDN'T EXIST!
│   ├── project-store/                  ← DUPLICATE of infrastructure/persistence/stores/project/
│   ├── project-*.ts                    ← DUPLICATE types
│   ├── workspace-*.ts                  ← DUPLICATE types
│   ├── hooks/                          ← DUPLICATE slices
│   └── file-sync-status-store/         ← Should be in sync layer
│
├── infrastructure/persistence/stores/  ← 60+ files - SHOULD BE AUTHORITATIVE
│   ├── project/                        ← 11 files - AUTHORITATIVE for projects
│   ├── workspace/                      ← 16 files - AUTHORITATIVE for workspace state
│   ├── ide/                            ← 11 files - IDE-specific state
│   ├── providers/                      ← Provider state
│   ├── chat/                           ← Chat state
│   └── study/                          ← Study state
│
├── lib/ide/                            ← 2 files - Minimal, OK
├── presentation/components/
│   ├── ide/                            ← 80 files - IDE components (OK as type)
│   └── workspace/                      ← 5 files - What is this?
│
├── routes/
│   ├── ide.tsx                         ← IDE route
│   ├── ide.$projectId.tsx              ← IDE with project
│   ├── workspace/$projectId.tsx        ← GENERIC workspace route
│   ├── notes.$projectId.lazy.tsx       ← NOTES type
│   ├── knowledge.$projectId.lazy.tsx   ← KNOWLEDGE type
│   └── study.$projectId.lazy.tsx       ← STUDY type
│
├── domain/entities/
│   ├── project.ts                      ← Project entity (OK)
│   └── workspace.ts                    ← Workspace entity (CONFUSING!)
```

---

## 📈 DUPLICATION ANALYSIS

### Level 1: CRITICAL Duplication (DELETE)

| File/Directory | Size | Duplicate Of | Action |
|----------------|------|--------------|--------|
| `src/lib/workspace/` | 41 files | `infrastructure/persistence/stores/` | **DELETE ENTIRELY** |
| `src/lib/workspace/project-store.ts` | 2.7KB | `infrastructure/persistence/stores/project/` | DELETE |
| `src/lib/workspace/project-types.ts` | 2.2KB | `infrastructure/persistence/stores/project/project-types.ts` | DELETE |
| `src/lib/workspace/workspace-types.ts` | - | `infrastructure/persistence/stores/workspace/workspace-types.ts` | DELETE |

### Level 2: MODERATE Duplication (MERGE)

| File/Directory | Exists In | Conflict With | Action |
|----------------|-----------|---------------|--------|
| `src/presentation/components/workspace/` | 5 files | `infrastructure/persistence/stores/workspace/` | MERGE or DELETE |
| `src/routes/workspace/$projectId.tsx` | 1 file | `routes/ide.$projectId.tsx` | RENAME to match pattern |

### Level 3: MINOR Inconsistency (RENAME)

| File | Current Name | Should Be |
|------|--------------|-----------|
| `src/lib/ide/` | `lib/ide` | Keep, but document as IDE-type components |
| `src/routes/workspace/$projectId.tsx` | `workspace/` | Rename to `generic.$projectId.tsx` |

---

## 🎯 NAMING CONFUSION MATRIX

### The Core Problem

| Term | Current Usage | Should Mean |
|------|---------------|-------------|
| **Workspace** | Everything (container + type) | Container only (IDE, Notes, Knowledge, Study are types) |
| **IDE** | Separate route/component | One TYPE of workspace |
| **Project** | Passed to workspaces | The DATA being worked on |
| **Workspace Type** | `WorkspaceType` enum | The TYPE of workspace (IDE, NOTES, KNOWLEDGE, STUDY) |

### Current Naming Chaos

```
# Handle naming (100+ occurrences)
fsaHandle              ← WRONG - implementation detail leaked
directoryHandle       ← BETTER - describes what it IS
handle                ← TOO VAGUE

# Project storage
fsaHandles (table)    ← WRONG - implementation detail
storageMetadata       ← BETTER - describes purpose

# Workspace vs Type  
workspace/            ← CONFUSING - is this the CONTAINER or TYPE?
workspace-type/       ← Better for TYPE-specific
workspaces/           ← Better for plural container
```

---

## 🏗️ PROPOSED CLEAN ARCHITECTURE

### New Structure

```
src/
├── infrastructure/persistence/stores/    ← AUTHORITATIVE (keep)
│   ├── project/                          ← Project entity & CRUD
│   │   ├── index.ts                      # useProjectStore, project hooks
│   │   ├── project-types.ts              # Project, ProjectMetadata
│   │   ├── project-crud-slice.ts
│   │   ├── project-bindings-slice.ts
│   │   ├── project-permissions-slice.ts
│   │   └── __tests__/
│   │
│   ├── workspace/                        ← Workspace CONTAINER state
│   │   ├── index.ts                      # useWorkspaceStore
│   │   ├── workspace-types.ts            # Workspace, WorkspaceConfig
│   │   ├── workspace-context.tsx         # React context
│   │   ├── workspace-provider.tsx        # React provider
│   │   └── slices/
│   │
│   ├── workspace-type/                   ← NEW: Workspace TYPE implementations
│   │   ├── ide/                          ← IDE-type specific
│   │   │   ├── ide-types.ts
│   │   │   ├── ide-slice.ts
│   │   │   └── ide-layout-slice.ts
│   │   │
│   │   ├── notes/                        ← NOTES-type specific
│   │   ├── knowledge/                    ← KNOWLEDGE-type specific
│   │   └── study/                        ← STUDY-type specific
│   │
│   └── shared/                           ← Shared across types
│       ├── file-sync/                     # Unified file sync
│       └── cross-workspace/               # Cross-type features
│
├── domain/entities/                       ← Keep (Clean Architecture)
│   ├── project.ts                        # Project entity
│   └── workspace.ts                      # Workspace entity (simplified)
│
├── presentation/components/               ← Keep (may need refactoring)
│   ├── ide/                              # IDE-type UI (keep as-is)
│   ├── notes/                            # NOTES-type UI
│   ├── knowledge/                        # KNOWLEDGE-type UI
│   └── study/                            # STUDY-type UI
│
└── routes/                                ← Simplify routing
    ├── ide.$projectId.tsx                # IDE with project
    ├── notes.$projectId.lazy.tsx         # NOTES with project
    ├── knowledge.$projectId.lazy.tsx     # KNOWLEDGE with project
    └── study.$projectId.lazy.tsx         # STUDY with project
```

### Terminology Standardization

| Old Term | New Term | Usage |
|----------|----------|-------|
| `fsaHandle` | `directoryHandle` | The FSA handle |
| `storageMetadata` | `fsaConfig` or `handleConfig` | Handle metadata |
| `workspace` (generic) | `workspaceContainer` | The container |
| `workspace-type` | `workspaceKind` or `workspaceType` | The type enum |
| `lib/workspace/` | (delete) | Use infrastructure/persistence/stores/ |

---

## 📋 CLEANUP ACTION PLAN

### Phase 1: DELETE Obvious Duplicates (IMMEDIATE)

```bash
# DELETE these entirely - they are duplicates
rm -rf src/lib/workspace/
rm -rf src/presentation/components/workspace/
rm -rf src/routes/workspace/
```

**Impact:** ~50 files deleted, 0 functionality lost (duplicates)

### Phase 2: MERGE Conflicting Stores (After Phase 1)

1. Merge `lib/workspace/project-*` into `infrastructure/persistence/stores/project/`
2. Keep the more complete implementation from infrastructure
3. Update imports in consumers

### Phase 3: RENAME for Clarity

| Old | New | File |
|-----|-----|------|
| `fsaHandle` | `directoryHandle` | Global replace |
| `storageMetadata` | `handleConfig` | Global replace |
| `WorkspaceType` enum values | `ide`, `notes`, `knowledge`, `study` | Keep |

### Phase 4: Simplify Routing

| Old Route | New Route | Notes |
|-----------|-----------|-------|
| `routes/workspace/$projectId.tsx` | DELETE | Not needed |
| Keep `routes/ide.$projectId.tsx` | Keep | IDE is a type |
| Keep `routes/notes.$projectId.lazy.tsx` | Keep | NOTES is a type |

---

## 🚨 FILES AFFECTED

### DELETE (53 files)

```
src/lib/workspace/                          (41 files)
src/lib/workspace/project-store.test.ts
src/lib/workspace/project-store.ts
src/lib/workspace/project-types.ts
src/lib/workspace/workspace-types.ts
src/presentation/components/workspace/     (5 files)
src/routes/workspace/                      (2 files)
src/routes/ide.$projectId.tsx.bak          (1 file)
```

### RENAME (Variable)

```
# Global search/replace for:
fsaHandle → directoryHandle
storageMetadata → handleConfig
```

### ADAPT IMPORTS (~50 files)

After DELETE, update imports in:
- Routes
- Components
- Sync services
- Event handlers

---

## ✅ VALIDATION CHECKLIST

- [ ] `src/lib/workspace/` deleted
- [ ] `src/presentation/components/workspace/` deleted
- [ ] `src/routes/workspace/` deleted
- [ ] No `fsaHandle` in codebase (replaced with `directoryHandle`)
- [ ] No `storageMetadata` in codebase (replaced with `handleConfig`)
- [ ] IDE is treated as `workspaceType = 'ide'`
- [ ] 4 workspace types documented: IDE, NOTES, KNOWLEDGE, STUDY
- [ ] `infrastructure/persistence/stores/` is authoritative
- [ ] All imports updated
- [ ] TypeScript compilation succeeds
- [ ] Tests pass

---

## 📞 RELATIONSHIP TO PS-04

This naming cleanup **BLOCKS** PS-04 because:

1. PS-04 needs to update `project-types.ts` but which one?
   - `src/lib/workspace/project-types.ts`? 
   - `src/infrastructure/persistence/stores/project/project-types.ts`?
   
2. PS-04 needs to update `project-crud-slice.ts` but which one?
   - `src/lib/workspace/project-store/project-crud-slice.ts`?
   - `src/infrastructure/persistence/stores/project/project-crud-slice.ts`?

3. PS-04 references `fsaHandleManager` which exists in BOTH:
   - `src/lib/filesystem/fsa-handle-manager.ts`
   - `src/infrastructure/persistence/dexie-db-helpers/fsa-handle-helpers.ts`

**DECISION:** Clean up duplication FIRST, then implement PS-04.

---

## 🎯 RECOMMENDATION

**IMMEDIATE ACTION:**
1. DELETE `src/lib/workspace/` (41 files - pure duplication)
2. DELETE `src/presentation/components/workspace/` (5 files)
3. DELETE `src/routes/workspace/` (2 files)
4. DELETE `src/routes/ide.$projectId.tsx.bak` (garbage)
5. Then implement PS-04 with clean single source of truth

**Estimated Time:** 2-4 hours for DELETE + 1 hour for PS-04
**Risk:** LOW (all are duplicates)
**Benefit:** MASSIVE - eliminates confusion, single source of truth
