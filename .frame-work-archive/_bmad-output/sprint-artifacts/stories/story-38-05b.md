# Story 38-05b: Create domain/entities/rag.ts

**Status**: PENDING
**Story Points**: 3
**Assignee**: Team B
**Epic**: EPIC-38 (Domain Layer Implementation)

## Description
Implement the RAG (Retrieval-Augmented Generation) domain entities following the Clean Architecture pattern established in `Project.ts`. This involves creating pure TypeScript interfaces for RAG collections, documents, and chunks, ensuring they are decoupled from infrastructure concerns (like vector stores or specific databases).

## Acceptance Criteria
- [ ] Create `src/core/entities/rag.ts`
- [ ] Define `RagCollection` interface (id, name, description, created, updated, metadata)
- [ ] Define `RagDocument` interface (id, collectionId, title, content, metadata, status)
- [ ] Define `RagChunk` interface (id, documentId, content, embedding, metadata)
- [ ] Pure TypeScript with NO framework imports (no React, Zustand, Dexie, Orama)
- [ ] 100% testable without mocking (no async operations, no browser APIs)
- [ ] Follow `Agent.ts` and `Project.ts` pattern
- [ ] Include `CreateParams` and `UpdateParams` types for each entity
- [ ] Document business rules in JSDoc comments
- [ ] Zero TypeScript errors in production code

## Technical Notes
- Use `src/core/entities/Project.ts` as the reference implementation.
- `RagChunk` embedding should be `number[]`.
- `RagDocument` status should be a union type (e.g., `'pending' | 'processing' | 'indexed' | 'error'`).
- Ensure strict typing for metadata (Record<string, unknown> or specific interface).

## Tasks
1. Create `src/core/entities/rag.ts`
2. Create `src/core/entities/__tests__/rag.test.ts`
3. Implement interfaces and types
4. Write unit tests
5. Verify coverage and types
