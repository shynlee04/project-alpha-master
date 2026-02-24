---
id: KS-UC-15
name: "Mobile voice brainstorm → desktop canvas synthesis"
version: 1.0
status: draft
workspaces: [Notes, Knowledge, Canvas]
personas: [Student, CreativeProfessional]
primary_goal: "Record brainstorming voice memos on mobile during commute, transcribe + synthesize on desktop, and visualize as a canvas mind-map."
---

## Scenario
A student records 3 voice memos (5 min each) during their commute, discussing project ideas. On desktop, they want the app to transcribe, extract key concepts, and auto-generate a canvas mind-map with linkages.

## Preconditions
- Mobile app supports voice recording with pause/resume and quick tagging.
- Transcription can run on-device (Whisper-tiny) or server-side.
- Canvas workspace can ingest structured concept nodes and auto-layout.

## Trigger
**Mobile:** User records voice memos, tags "project-ideas".
**Desktop:** User opens Canvas workspace → clicks "Synthesize from voice notes".

## Main flow
1. **Mobile recording:**
   - Store audio files locally with metadata (date, tag, duration).
   - Show transcription status: "Pending (will process when charging)" or "Processing…".

2. **Sync + transcription:**
   - On desktop sync, upload audio files.
   - Run transcription (if not done on mobile).
   - Store transcript with timestamps.

3. **Desktop synthesis:**
   - User selects 3 transcripts and triggers **Synthesize**.
   - Synthesis engine:
     - Extracts concepts (phrases repeated, named entities, action items).
     - Groups concepts by topic (clustering).
     - Detects linkages (co-occurrence, causal phrases: "because", "leads to").
   - Outputs:
     - Concept nodes (title, snippet from transcript, timestamp reference).
     - Suggested edges (with confidence scores).

4. **Canvas auto-layout:**
   - Agent creates a mind-map:
     - Central node: "Project Ideas Brainstorm 2026-01-03".
     - Child nodes: concept clusters.
     - Edges: suggested linkages.
   - User can:
     - Accept/reject edges.
     - Drag nodes to reorganize.
     - Click a node to hear the audio snippet (timestamp jump).

5. **Knowledge persistence:**
   - Save the canvas as a Knowledge node.
   - Link each concept back to transcript + audio timestamp.

## UX requirements
- Mobile: voice recording must work offline and handle interruptions (calls).
- Desktop: canvas layout must be readable (no overlapping nodes).
- Audio playback from canvas must support timeline scrubbing.

## AI agent behaviors
- Agent must handle filler words and false starts gracefully (transcription cleanup).
- Agent must detect speaker uncertainty ("maybe", "not sure") and flag concepts as tentative.
- Agent must offer "Expand this concept" action: generate follow-up questions based on transcript context.

## Failure modes & tough edges
- Background noise corrupts transcription → agent flags low-confidence segments and requests manual review.
- Concepts are too granular (100+ nodes) → agent clusters aggressively and offers "detail level" slider.
- User speaks in mixed Vietnamese/English → transcription must detect code-switching; canvas must support bilingual labels.

## Acceptance criteria
- Transcription accuracy >90% for clear audio (measured on test set).
- Canvas auto-layout produces a readable graph without manual adjustment for ≤20 concept nodes.
- Timestamp links work: clicking a concept plays the audio segment within 2 seconds.

## Cross-workspace integration
- Notes workspace (mobile): voice capture + local queue.
- Knowledge workspace (desktop): concept extraction + synthesis.
- Canvas workspace: interactive mind-map with audio playback.
