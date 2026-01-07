# Story 38-05c: Create domain/entities/knowledge.ts

**Status**: PENDING
**Story Points**: 2
**Assignee**: Team B
**Epic**: EPIC-38 (Domain Layer Implementation)

## Description
Implement the Knowledge domain entities following the Clean Architecture pattern established in `Project.ts`. This involves creating pure TypeScript interfaces for knowledge sources (files, URLs) and the knowledge graph structure (nodes, edges), ensuring they are decoupled from infrastructure concerns.

## Acceptance Criteria
- [ ] Create `src/core/entities/knowledge.ts`
- [ ] Define `KnowledgeSource` interface (id, projectId, type, uri, title, metadata, status, created, updated)
- [ ] Define `KnowledgeNode` interface (id, label, type, properties, created, updated)
- [ ] Define `KnowledgeEdge` interface (id, sourceId, targetId, type, properties, created, updated)
- [ ] Pure TypeScript with NO framework imports (no React, Zustand, Dexie, Cytoscape)
- [ ] 100% testable without mocking (no async operations, no browser APIs)
- [ ] Follow `Project.ts` and `rag.ts` pattern
- [ ] Include `CreateParams` and `UpdateParams` types for each entity
- [ ] Document business rules in JSDoc comments
- [ ] Zero TypeScript errors in production code

## Technical Notes
- Use `src/core/entities/Project.ts` as the reference implementation.
- `KnowledgeSource` types: `'file' | 'url' | 'note'`.
- `KnowledgeNode` types: `'concept' | 'entity' | 'resource'`.
- `KnowledgeEdge` types: `'relates_to' | 'contains' | 'references'`.
- Ensure strict typing for metadata/properties (Record<string, unknown>).

## Tasks
1. Create `src/core/entities/knowledge.ts`
2. Create `src/core/entities/__tests__/knowledge.test.ts`
3. Implement interfaces and types
4. Write unit tests
5. Verify coverage and types
