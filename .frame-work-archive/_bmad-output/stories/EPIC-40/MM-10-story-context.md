# MM-10: Code-Aware Chunking

**Epic**: EPIC-40 - Multimodal Chat Unification
**Story**: MM-10
**Title**: Code-Aware Chunking
**Effort**: 3 hours
**Priority**: P1
**Status**: IN_PROGRESS
**Track**: C
**Created**: 2026-01-10T03:00:00+07:00

## Overview

Implement code-aware chunking for RAG system. When code blocks or file references are present in messages, chunk them intelligently to preserve syntax and context. This improves retrieval accuracy for code-related queries.

## Dependencies

- MM-09: Context Window Manager (DONE) - provides token estimation and context limits

## Acceptance Criteria

1. **Code Detection**
   - Detect code blocks (fenced with ```)
   - Detect inline code (backtick-wrapped)
   - Detect file references (paths, imports)

2. **Semantic Chunking**
   - Preserve function/class boundaries
   - Chunk at logical statement breaks
   - Maintain import statements with dependent chunks

3. **Metadata Enrichment**
   - Add language/type metadata to chunks
   - Track line numbers and file origins
   - Link related chunks (parent-child relationships)

4. **RAG Integration**
   - Use `getContextUsage()` from MM-09 to respect context limits
   - Prioritize code chunks for indexing
   - Support hybrid text + code retrieval

## Implementation Tasks

1. Create code-chunker utility with language-aware parsing
2. Add `CodeChunk` entity to domain types
3. Implement `chunkCodeBlock()` function
4. Add `chunkMessage()` to context window slice
5. Create code-chunk-store for chunk metadata
6. Integrate with RAG indexing pipeline

## Files to Create

- `src/lib/rag/utils/code-chunker.ts`
- `src/domain/entities/code-chunk.ts`
- `src/infrastructure/persistence/stores/code-chunk-store.ts`

## Files to Modify

- `src/infrastructure/persistence/stores/chat/unified-chat-types.ts` - Add code chunk references

## Quality Gates

- TypeScript: Zero new errors
- Chunk size: ≤8000 tokens per chunk (configurable)
- No syntax breaking: Chunks must be valid code snippets
- Test coverage: ≥80% for chunking logic

## Notes

- Code chunks are indexed separately from text for hybrid search
- Language detection based on fence info or file extension
- Chunks include context (surrounding lines) for disambiguation
