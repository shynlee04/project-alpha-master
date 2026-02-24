---
id: KS-UC-14
name: "Mobile quick-capture to IDE: photo → code snippet → project integration"
version: 1.0
status: draft
workspaces: [Notes, IDE, Knowledge]
personas: [Student, Developer]
primary_goal: "Capture whiteboard code on mobile, OCR to text, sync to desktop IDE, and integrate into project with agent assistance."
---

## Scenario
During a lecture, a student photographs whiteboard pseudocode. On the train home (offline), they tag it with subject and desired language (TypeScript). Later, on desktop, the IDE agent converts the OCR'd text into working code, adds types, and inserts it into the correct file.

## Preconditions
- Mobile app supports offline photo capture with quick tags (subject, language, project).
- OCR runs on-device or queued for server processing.
- Desktop IDE can receive synced captures and invoke agent actions.

## Trigger
**Mobile:** User taps camera → captures whiteboard → tags "algorithms, TypeScript" → saves.
**Desktop (later):** User opens IDE workspace → sees "1 new capture" badge → clicks "Process with agent".

## Main flow
1. **Mobile capture:**
   - Store photo + metadata (timestamp, tags, OCR status: pending).
   - If online and battery >20%, run OCR immediately; else queue.

2. **Sync to desktop:**
   - On next sync, upload photo + OCR result (if available) to project vault.
   - IDE workspace shows notification: "algorithms-whiteboard-2026-01-03.jpg ready".

3. **Desktop agent processing:**
   - User selects capture and chooses "Convert to code".
   - Agent:
     - Reads OCR text (reviews confidence spans; asks user to verify low-confidence tokens if critical).
     - Infers intent (e.g., "binary search pseudocode").
     - Generates TypeScript implementation with:
       - Proper types.
       - JSDoc comments.
       - Unit test skeleton.
   - Agent asks: "Where should I add this? (A) New file `src/algorithms/binarySearch.ts` (B) Existing file (C) Scratch file".

4. **Integration:**
   - User selects option A.
   - Agent creates file, runs `pnpm tsc --noEmit`, fixes any errors, and commits.

5. **Knowledge link:**
   - Agent creates Knowledge node:
     - "Binary Search (from whiteboard capture)".
     - Links: original photo, OCR text, final code file.
     - Tags: algorithms, lecture-2026-01-03.

## UX requirements
- Mobile: capture must complete in <3 seconds (photo + tag save).
- Desktop: OCR verification UI must highlight low-confidence tokens.
- Agent must show diff before committing to project.

## AI agent behaviors
- Agent must disambiguate pseudocode intent (ask if unclear: "Is this iterative or recursive?").
- Agent must generate tests alongside implementation (TDD-lite).
- Agent must refuse to overwrite existing code without explicit confirmation.

## Failure modes & tough edges
- Whiteboard has glare/occlusion → OCR produces garbage → agent flags "manual transcription recommended".
- Pseudocode mixes languages (Python-like syntax, but tags say TypeScript) → agent asks for clarification.
- User forgets to tag → agent infers from OCR content and asks for confirmation.

## Acceptance criteria
- Captured photo is accessible in IDE within 30 seconds of desktop sync.
- Generated code compiles and passes basic smoke test.
- Knowledge node preserves full capture-to-code lineage.

## Cross-workspace integration
- Notes workspace (mobile): quick capture + offline queue.
- IDE workspace (desktop): agent-driven code generation + file integration.
- Knowledge workspace: provenance node linking photo → OCR → code.
