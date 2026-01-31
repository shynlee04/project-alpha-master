# Story 38-08: Update application layer to use domain entities

**Status**: PENDING
**Story Points**: 3
**Assignee**: Team B
**Epic**: EPIC-38 (Domain Layer Implementation)

## Description
Update the application layer (`src/lib/`) to import and use the newly created domain entities (`Project`, `Agent`, `Workspace`, `rag`, `knowledge`, `study`). This ensures that the application layer depends on the domain layer, following Clean Architecture principles.

## Acceptance Criteria
- [ ] Identify application files using legacy types for Project, Agent, Workspace
- [ ] Update imports to point to `@/core/entities/*` (or infrastructure types that extend them)
- [ ] Verify `src/lib/templates/template-types.ts`
- [ ] Verify `src/lib/events/cross-workspace-event-bus.ts`
- [ ] Verify `src/lib/workspace/ProjectContext.tsx`
- [ ] Zero TypeScript errors in modified files

## Technical Notes
- `src/lib/workspace/project-store` was already updated in Story 38-04.
- Focus on other `src/lib` modules.

## Tasks
1. Scan `src/lib` for legacy type usages
2. Update `template-types.ts`
3. Update `cross-workspace-event-bus.ts`
4. Update `ProjectContext.tsx`
5. Verify build
