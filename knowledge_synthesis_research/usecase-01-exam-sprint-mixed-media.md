---
id: KS-UC-01
name: "Exam Sprint: mixed media folder → neural matrix"
version: 1.0
status: draft
workspaces: [Knowledge, Notes, Study, Canvas]
personas: [Student]
primary_goal: "Convert a chaotic semester folder into a queryable, exam-ready knowledge map and study plan."
---

## Scenario
A university student drags a semester folder into the app containing PDFs (slides), DOCX (assignment briefs), Markdown notes, screenshots of handwritten derivations, and 2–3 hours of audio lecture recordings. The goal is to synthesize the material into a single, exam-focused vault while preserving provenance and allowing the student to challenge or correct the AI when it misreads handwriting.

## Preconditions
- The user has an active Project that spans multiple workspaces (Knowledge/Notes/Study) and a local vault path.
- The ingestion pipeline supports PDF/DOCX/MD/images/audio and can run in incremental batches.
- The user has not yet curated tags; the system must bootstrap metadata without requiring manual taxonomy.

## Trigger
User selects **Import → Folder** and chooses a folder containing mixed-format materials for multiple subjects.

## Main flow (spec-driven)
1. **Ingestion (multi-modal):**
   - Parse PDFs/DOCX/MD into text and structural blocks.
   - Run OCR on handwriting screenshots and diagram-heavy images; store OCR confidence per span.
   - Transcribe audio; align timestamps to slide pages if possible (heuristic: filename similarity + time windows).
2. **Pre-processing:**
   - Chunk by semantic boundaries (headings, slide boundaries, transcript segments).
   - Generate embeddings per chunk + per-document summary embedding.
   - Create a “source-of-truth” manifest linking each derived chunk back to its raw asset and offsets.
3. **Synthesis action:**
   - User presses **Synthesize** on the imported set.
   - The synthesis engine generates:
     - Frontmatter (title, course, topic, date range, source types).
     - A short summary and 5–12 semantic tags.
     - A list of “exam-likely” concepts (ranked) with confidence.
4. **Canvas & suggestions:**
   - Student drags 3+ synthesized resources onto a Canvas.
   - System suggests 3–7 linkages (e.g., “Derivation A explains formula used in Assignment 2”) with one-click “accept link / reject link”.
5. **Neural matrix:**
   - Auto-group nodes into clusters by subject + timeframe.
   - Provide a “misread handwriting” filter: show only nodes with OCR confidence < threshold.
6. **Study workspace output:**
   - Generate a study plan: 7-day sprint with daily objectives mapped to clusters.
   - Create flashcard candidates (user must approve before creation).

## UX requirements
- Import progress must be granular (per file + per stage: parse → OCR/transcribe → embed → synthesize).
- Every AI-generated linkage must be explainable via “Why?” showing source citations (file + span/time).
- Provide a “Fix OCR” affordance: user can edit an OCR snippet; edits create a new revision without deleting the original.

## AI agent behaviors
- When user asks questions in chat, answers must include provenance links back to the source chunks.
- If OCR confidence is low, the agent must ask a clarifying question instead of confidently asserting.
- If a concept appears in multiple subjects, the agent must propose disambiguation tags.

## Failure modes & tough edges
- Audio transcription errors on technical terms → mitigate via a “course glossary” learned from PDFs.
- Folder includes duplicates (same PDF exported twice) → detect via hashing and de-duplicate without losing user annotations.
- Mixed Vietnamese/English notes → auto-detect language per chunk; keep bilingual tags.

## Acceptance criteria
- Importing 200 mixed assets completes without UI freeze; user can switch workspaces mid-import.
- At least 90% of Canvas suggestions are supported by at least 2 distinct evidence spans (unless flagged “speculative”).
- User can correct OCR/transcript and see the neural matrix update without re-importing raw files.
