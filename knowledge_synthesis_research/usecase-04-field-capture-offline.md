---
id: KS-UC-04
name: "Field capture under constraints: mobile photos + voice memos → later synthesis"
version: 1.0
status: draft
workspaces: [Notes, Knowledge, Canvas]
personas: [Student, FieldResearcher]
primary_goal: "Capture learning in low-connectivity environments and synthesize once back online/charging."
---

## Scenario
During a lab session or field trip, a student captures whiteboard photos, handwriting screenshots, and voice memos on a mobile device with limited battery and unstable connectivity. They want everything to sync to desktop later and synthesize into structured knowledge.

## Preconditions
- App supports offline-first capture with a local queue.
- Sync layer can reconcile assets uploaded later without breaking references.

## Trigger
User uses **Quick Capture** repeatedly (photo + voice + short text).

## Main flow
1. **Capture:**
   - Store raw assets locally with minimal metadata (time, location optional, subject quick-tag).
2. **Deferred pre-processing:**
   - OCR/transcription/embedding are queued and run when:
     - Device is charging, or
     - User explicitly triggers “Process now”.
3. **Desktop continuation:**
   - On desktop, user opens the project; queued jobs run with progress UI.
4. **Synthesis:**
   - Synthesize captured set into:
     - A session note (timeline).
     - Concept nodes extracted from whiteboard content.
5. **Canvas:**
   - User drags session note + 2 other resources; AI suggests linkages such as “This diagram matches concept from Lecture 5”.

## UX requirements
- Must clearly show what is processed vs raw-only.
- Must support manual subject tagging quickly (one tap).
- Provide a “storage pressure” warning when local queue is large.

## AI agent behaviors
- Agent must not assume OCR correctness; must offer “verify” mode for low confidence.
- Agent should propose consolidation: merge multiple quick captures into one session.

## Failure modes & tough edges
- Timestamp drift across devices → use server time on next sync and retain original as “captured_at_device”.
- Photos include other students’ faces → offer optional face blur before saving to vault.

## Acceptance criteria
- User can capture 50 assets offline without crashes.
- After sync, all assets resolve correctly in provenance links.
