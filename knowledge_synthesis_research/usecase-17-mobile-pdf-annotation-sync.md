---
id: KS-UC-17
name: "Mobile annotation: highlight PDFs + sync to desktop knowledge graph"
version: 1.0
status: draft
workspaces: [Knowledge, Notes, Canvas]
personas: [Student, Researcher]
primary_goal: "Annotate PDFs on mobile during reading sessions, sync highlights + notes to desktop, and integrate into existing knowledge graph."
---

## Scenario
A student reads research PDFs on mobile during lunch breaks, highlighting key passages and adding margin notes. On desktop, they want highlights to appear as citable nodes in the knowledge graph and linked to related concepts.

## Preconditions
- Mobile app supports PDF rendering + highlight/annotation tools.
- Annotations are stored per-document with span offsets (page, character range).
- Desktop Knowledge workspace can ingest annotations as "evidence nodes".

## Trigger
**Mobile:** User opens a PDF → highlights text → adds note.
**Desktop:** User opens Knowledge workspace → sees "5 new annotations from mobile".

## Main flow
1. **Mobile annotation:**
   - User selects text in PDF → taps "Highlight".
   - Optionally adds a note (voice or text).
   - Store annotation:
     - Document ID, page, character offsets, highlight color, note.
   - If offline, queue for sync.

2. **Sync to desktop:**
   - Upload annotations with full context (surrounding text for provenance).
   - Desktop receives batch: "5 annotations in `paper-x.pdf`".

3. **Desktop integration:**
   - Knowledge workspace auto-creates "evidence nodes":
     - Title: snippet of highlighted text (first 50 chars).
     - Body: full highlight + user note.
     - Provenance: link to PDF + page + offsets.
   - Agent analyzes annotations:
     - Detects if highlights relate to existing concepts (via embeddings).
     - Suggests linkages: "Highlight 3 relates to concept 'RAG architecture'—add edge?".

4. **Canvas visualization:**
   - User drags the PDF node onto canvas.
   - Annotation nodes appear as children.
   - Suggested edges to existing concepts are shown as dashed lines (user approves to solidify).

5. **Re-synthesis:**
   - If user accepts suggestions, agent updates:
     - Concept node metadata (adds new evidence span).
     - Neural matrix (strengthens cluster connections).

## UX requirements
- Mobile: PDF highlighting must be smooth (no lag on scroll/zoom).
- Desktop: annotation preview must show PDF context (thumbnail + page number).
- User must be able to edit annotations on desktop (edits sync back to mobile).

## AI agent behaviors
- Agent must respect user's highlight intent: if user highlights a contradictory claim, don't auto-link to agreements—flag as "potential contradiction".
- Agent must offer "summarize my highlights" action: generate a summary note from all highlights in a PDF.
- Agent must handle overlapping highlights (multiple colors) and preserve all layers.

## Failure modes & tough edges
- PDF is re-uploaded or updated → offsets drift → use fuzzy text matching to re-anchor annotations or flag as "orphaned".
- User highlights non-text (images, diagrams) → store bounding box + screenshot; agent generates image description.
- Mixed language highlights → preserve original language; agent can translate on demand.

## Acceptance criteria
- Annotations sync within 30 seconds of reconnecting to network.
- Agent suggests linkages with >70% relevance (measured by user acceptance rate in test sessions).
- User can navigate from canvas concept → highlight → PDF page in <3 clicks.

## Cross-workspace integration
- Notes workspace (mobile): PDF reader + annotation tools.
- Knowledge workspace (desktop): evidence nodes + synthesis.
- Canvas workspace: graph visualization with annotation-derived edges.
