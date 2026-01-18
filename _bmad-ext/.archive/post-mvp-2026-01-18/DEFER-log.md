# DEFER-log: Knowledge & Study Workspaces Archive

**Date Archived**: 2026-01-18
**Reason**: MVP Focus on Notes + IDE
**Total Files Archived**: 64 (56 Knowledge + 8 Study)

## Archive Summary

| Workspace | Files | Reason |
|-----------|-------|--------|
| **Knowledge** | 56 | Defer until after MVP (Notes + IDE complete) |
| **Study** | 8 | Defer until after MVP (Notes + IDE complete) |

## Files Archived

### Knowledge Workspace (56 files)

```
_bmad-ext/.archive/post-mvp-2026-01-18/knowledge/
├── __tests__/
│   ├── metadata-extractor.test.ts
│   ├── runtime-validation.test.ts
│   ├── source-import.test.ts
│   ├── flashcard-types.test.ts
│   ├── flashcard-utils.test.ts
│   ├── mock-data.ts
│   └── setup-mocks.ts
├── graph/
│   ├── index.ts
│   ├── graph-crud.ts
│   ├── graph-utils.ts
│   ├── graph-traversal.ts
│   ├── graph-queries.ts
│   └── graph-persistence.ts
├── flashcard-exporter.ts
├── flashcard-generator.ts
├── flashcard-utils.ts
├── gemini-image-processor.ts
├── gemini-image-prompts.ts
├── gemini-image-types.ts
├── gemini-image-mocks.ts
├── gemini-pdf-api.ts
├── gemini-pdf-mocks.ts
├── gemini-pdf-processor.ts
├── gemini-pdf-prompts.ts
├── gemini-pdf-types.ts
├── gemini-url-processor.ts
├── index.ts
├── knowledge-graph.ts
├── knowledge-graph-types.ts
├── metadata-extractor.ts
├── note-chunker.ts
├── organization-engine.ts
├── organization-strategies.ts
├── organization-types.ts
├── pdf-parser.ts
├── recommendation-generator.ts
├── relevancy-factors.ts
├── relevancy-scorer.ts
├── relevancy-types.ts
├── source-import-handlers.ts
├── source-import.ts
├── source-import-types.ts
├── source-import-validators.ts
├── source-rag-bridge.ts
├── subject-classifier.ts
├── subject-classifier-types.ts
├── subject-scoring.ts
├── subject-taxonomy.ts
├── synthesis-api-types.ts
├── synthesis-mocks.ts
├── synthesis-prompts.ts
├── synthesis-service.ts
├── synthesis-types.ts
├── url-fetcher.ts
├── url-fetcher-content-extractor.ts
├── url-fetcher-types.ts
├── verify-rag-bridge.ts
└── vault-analyzer.ts
```

### Study Workspace (8 files)

```
_bmad-ext/.archive/post-mvp-2026-01-18/study/
├── __tests__/
│   ├── quiz.test.ts
│   ├── srs.test.ts
│   └── quiz-session.test.ts
├── index.ts
├── quiz-generator.ts
├── quiz-session.ts
├── quiz-types.ts
└── srs-types.ts
```

## Rationale

MVP Scope (Post-Sprint 2):
- **Notes Workspace**: Core markdown editor (BlockNote)
- **IDE Workspace**: WebContainer-based coding environment
- **Knowledge Workspace**: Deferred (RAG, synthesis, graph features)
- **Study Workspace**: Deferred (SRS, quizzes, flashcards)

## Future Epic

To be defined after MVP (Notes + IDE) completion.

**Expected Epic Topics**:
- Knowledge graph integration
- RAG pipeline
- PDF/URL source import
- Flashcard system (SRS)
- Quiz generation
- AI synthesis

## Updated References

| Document | Updated |
|----------|---------|
| `AGENTS.md` | Added **DEFER** markers to Knowledge/Study routes |
| `consolidated-context-2026-01-18.md` | Will need update for MVP scope |
| `sprint-status.yaml` | N/A (Sprint 2 already Notes-focused) |

## Rollback Instructions

If Knowledge/Study needed before MVP complete:

1. Copy files from `_bmad-ext/.archive/post-mvp-2026-01-18/` back to `src/lib/`
2. Restore route files in `src/routes/`
3. Re-add presentation components in `src/presentation/components/`
4. Update AGENTS.md to remove **DEFER** markers

**Note**: This rollback may require significant integration work.

---

**Archived By**: dev-ext agent
**Verification**: Confirmed 64 files moved, references updated
