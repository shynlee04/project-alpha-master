---
title: "6-4 Source Metadata Extraction"
epic: "Epic 6: Source Ingestion & Management"
story: "6-4-source-metadata-extraction"
status: "done"
priority: "P1"
points: 5
created: "2025-12-30"
sprint: "SPRINT-6"
team: "Team A"
dependencies:
  - "6-1-source-import-pipeline"
  - "6-3-source-management"
---

## User Story

**As a** user reviewing sources,
**I want** automatic metadata extraction (title, summary, key concepts),
**So that** I can quickly understand a source before reading.

## Acceptance Criteria

### AC-1: Basic Metadata Extraction
**Given** a PDF is imported
**When** processing completes
**Then** metadata is extracted locally where possible:
- Title (from PDF metadata or filename)
- Page count (for PDFs)
- Word count/Character count
- File size

### AC-2: AI-Powered Analysis
**Given** metadata extraction runs
**When** it completes
**Then** AI (Gemini) generates:
- 3-sentence summary
- 5 key concepts (as tags)
- Suggested questions to explore

### AC-3: Metadata Persistence
**Given** metadata is extracted
**When** the source is saved
**Then** all metadata fields are persisted to `SourceRecord` in Dexie DB
**And** updates trigger UI refresh

### AC-4: View and Edit Metadata
**Given** a user views source metadata
**When** they expand the card details
**Then** they can view the summary and tags
**And** they can edit the summary or add/remove tags
**And** corrections are saved

## Tasks / Subtasks

## Tasks / Subtasks

### Task 1: Define Metadata Schema & Store Actions
- [x] Update `SourceRecord` interface in `dexie-db.ts`
  - [x] Add `metadata` field (summary, concepts, authors, etc.)
  - [x] Add `processingStatus` (pending, processing, completed, failed)
- [x] Update `useKnowledgeStore`
  - [x] Add `updateSourceMetadata(id, metadata)` action
  - [x] Add `updateProcessingStatus(id, status)` action

### Task 2: Implement Metadata Extractor Service
- [x] Create `src/lib/knowledge/metadata-extractor.ts`
  - [x] Implement `extractBasicMetadata(file)` (local)
  - [x] Implement `generateAIAnalysis(content)` (Gemini/LLM)
  - [x] Use `ProviderAdapterFactory` for LLM calls (or `useAgentChat` pattern) - *Used direct GoogleGenAI for simplicity as per existing pattern*
  - [x] Handle errors and fallbacks

### Task 3: Integrate with Import Pipeline
- [x] Update `source-import.ts`
  - [x] Trigger metadata extraction after text extraction
  - [x] Update status to 'processing' -> 'completed'
  - [x] Ensure non-blocking (async)

### Task 4: UI Implementation
- [x] Create `MetadataView` component -> `SourceMetadataDialog`
  - [x] Display summary, tags, and stats
  - [x] "Edit" mode for summary and tags
- [x] Integrate into `SourceCard`
  - [x] Add "Expand" button or utilize existing expanded state -> Added "View Metadata" to context menu
  - [x] Show loading state for metadata

### Task 5: Integration Testing
- [x] Test extraction flow (mock LLM)
- [x] Test persistence
- [x] Test UI editing

## Research Requirements
- [ ] Check `src/lib/agent/providers` for best way to call LLM for non-chat tasks (System Prompt Composer?)
- [ ] Check `SourceCard` expansion logic from Story 6-2

## Dev Notes
- Use `src/lib/agent/providers/credential-vault.ts` for API keys.
- Keep the AI prompts in `src/lib/knowledge/prompts.ts` or similar for easy tuning.
- Ensure large PDFs don't blow up the prompt context window (truncate or chunk if necessary).

---

## Dev Agent Record

### Agent Model Used
_Claude Sonnet 4.5 (Story creation)_

### Implementation Summary

Story 6-4 (Source Metadata Extraction) is fully implemented. 

**Key Components Created:**
- **`MetadataExtractor`**: A service using `@google/genai` to analyze content. It extracts 3-sentence summaries, key concepts (tags), and suggests follow-up questions. It falls back to basic stats (reading time, word count) if AI is unavailable.
- **`SourceMetadata` Types**: Updated `SourceRecord` in `dexie-db.ts` to include `metadata` and `processingStatus`.
- **`SourceMetadataDialog`**: A comprehensive UI for viewing analysis results, with capability to Edit/Save manual changes and "Regenerate" metadata if needed.

**Integration:**
- The `SourceImportPipeline` now triggers `triggerMetadataExtraction` asynchronously after a source is saved. It updates `processingStatus` to 'processing' -> 'completed'.
- `SourceCard` now includes a "View Metadata" option in the context menu.

**Testing:**
- Unit tests for `MetadataExtractor` verify both basic stats logic and AI mocking.
- Integration tests confirm `source-import` triggers extraction without errors.

Status: Done. Ready for QA.

