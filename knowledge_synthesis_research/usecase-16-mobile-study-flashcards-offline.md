---
id: KS-UC-16
name: "Mobile study mode: flashcards + spaced repetition on the go"
version: 1.0
status: draft
workspaces: [Study, Knowledge, Notes]
personas: [Student]
primary_goal: "Practice flashcards during commute with offline support, adaptive scheduling, and progress sync to desktop."
---

## Scenario
A student has generated 200 flashcards from their desktop knowledge vault. On mobile, they want to study in spaced-repetition mode during their 45-minute commute (offline). Progress must sync to desktop to update the learning path.

## Preconditions
- Study workspace on mobile has offline-first flashcard storage (IndexedDB).
- Spaced repetition algorithm runs locally (no server dependency).
- Desktop and mobile share progress state via sync.

## Trigger
User opens mobile app → Study workspace → "Daily review (23 cards due)".

## Main flow
1. **Offline study session:**
   - Load due cards from local IndexedDB.
   - Present cards one-by-one:
     - Show prompt.
     - User self-rates: "Again" / "Hard" / "Good" / "Easy".
   - Algorithm updates next review timestamps locally.

2. **Adaptive micro-adjustments:**
   - If user rates "Again" 3 times in a row for the same card:
     - Agent suggests: "This concept is tricky. Show related notes?" (loads linked Knowledge node from cache).
   - If user completes session early:
     - Offer bonus cards (optional, from upcoming queue).

3. **Sync on reconnect:**
   - Upload review history (card IDs, ratings, timestamps).
   - Desktop merges progress and updates:
     - Learning path (adjust weak areas).
     - Neural matrix (highlight struggling clusters).

4. **Desktop feedback loop:**
   - Next time user opens desktop, Study workspace shows:
     - "Mobile progress: 23 cards reviewed. 3 concepts need reinforcement."
   - Agent proposes: "Add 5 more cards for [concept X]?" (generates from Knowledge vault).

## UX requirements
- Mobile: study session must not require network after initial sync.
- Cards must render in <200ms (text-only cards; images preloaded).
- Provide "Pause and resume" without losing progress.

## AI agent behaviors
- Agent must not overwhelm: cap daily review at user-configured max (default 50 cards).
- Agent must detect review fatigue: if user rates "Hard" on 10+ consecutive cards, suggest a break.
- Agent must preserve user edits to cards (if user corrects a typo mid-review).

## Failure modes & tough edges
- Sync conflict (desktop and mobile both reviewed the same card) → merge using server timestamp or flag for user resolution.
- Mobile storage limit reached → agent prompts to archive old cards or increase limit.
- User loses mobile device → desktop must allow manual rollback of last N reviews if needed.

## Acceptance criteria
- User can complete a 50-card session offline without crashes or data loss.
- Sync completes within 10 seconds after reconnect (for 50 review events).
- Desktop learning path reflects mobile progress accurately within 1 sync cycle.

## Cross-workspace integration
- Study workspace (mobile): flashcard UI + spaced repetition logic.
- Knowledge workspace: linked concept nodes for reinforcement.
- Notes workspace: user can add clarifications mid-review (syncs to desktop).
