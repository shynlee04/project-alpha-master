---
id: KS-UC-03
name: "Citation-grade research synthesis: papers + notes + datasets"
version: 1.0
status: draft
workspaces: [Knowledge, Notes, Canvas]
personas: [Student, Researcher]
primary_goal: "Create a trustworthy literature map with provenance, contradictions, and a citation-ready outline."
---

## Scenario
A student imports 30 research PDFs, 10 DOCX notes, and a folder of dataset README files. They need the system to synthesize a literature graph, detect contradictions, and produce a thesis outline with citations.

## Preconditions
- PDF ingestion extracts text + headings + references section (best-effort).
- System can store per-claim provenance (paper + page span).

## Trigger
User selects a folder and chooses **Synthesize → Literature Review**.

## Main flow
1. **Ingestion:**
   - Extract abstract/introduction/method/results/limitations when detectable.
   - Parse references into structured entries when possible.
2. **Pre-processing:**
   - Chunk by section; embed chunks; detect entities (methods, datasets, metrics).
3. **Synthesis:**
   - Produce:
     - Paper cards (summary, key claims, limitations).
     - A contradictions list (claim A vs claim B) with evidence.
     - A “method taxonomy” tag set.
4. **Neural matrix:**
   - Auto-group by method family and by dataset.
   - Visualize citation edges (if reference parsing succeeded) and “semantic edges” (topic similarity).
5. **Canvas workflow:**
   - User drags 3+ papers; AI proposes:
     - “Compare/contrast” edges.
     - Suggested missing papers (if the vault indicates gaps).

## UX requirements
- Every claim shown in UI must link back to a page span.
- Contradictions must be marked as “possible” unless both claims have strong evidence.
- Allow user to pin a preferred taxonomy (custom tags override auto-tags).

## AI agent behaviors
- Agent must answer with citations and must surface uncertainty.
- Agent can generate a thesis outline but must label any inferred structure as “draft”.

## Failure modes & tough edges
- OCR’d scanned PDFs with low quality → system must label “low confidence” and encourage manual verification.
- Duplicate papers (arXiv vs journal) → detect near-duplicates and merge while retaining both sources.

## Acceptance criteria
- A generated outline includes at least one citation per subsection.
- Contradiction detection produces explainable pairs with evidence spans for each side.
