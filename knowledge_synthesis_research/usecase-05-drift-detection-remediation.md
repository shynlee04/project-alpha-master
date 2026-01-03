---
id: KS-UC-05
name: "Multi-project drift: updated specs invalidate old knowledge"
version: 1.0
status: draft
workspaces: [Knowledge, IDE, Notes, Canvas]
personas: [Developer, Student]
primary_goal: "Detect when updated documents make existing embeddings/links stale and guide the user through re-synthesis."
---

## Scenario
A developer imports API specs and design docs, synthesizes them, and creates a canvas map for implementation. Two weeks later, the specs change. The app must detect drift, highlight broken assumptions, and offer partial re-processing rather than a full rebuild.

## Preconditions
- System stores document revisions and links each synthesized artifact to revision IDs.
- Embeddings can be recomputed per changed chunk.

## Trigger
A file changes on disk (sync detects hash difference) or user re-imports a newer version.

## Main flow
1. **Change detection:**
   - Compute diff at chunk level; classify changes as: minor text edit, structural move, semantic change.
2. **Drift impact analysis:**
   - Identify:
     - Links whose evidence spans moved/changed.
     - Tags that no longer match.
     - Agent answers cached from prior context (if any) that reference stale claims.
3. **User remediation UI:**
   - Present “drift dashboard” with:
     - What changed.
     - Which canvases are impacted.
     - A recommended remediation plan (re-embed only changed chunks; re-run synthesis on affected docs).
4. **Partial re-synthesis:**
   - Re-run synthesis for impacted nodes only.
   - Preserve user edits and annotations; mark AI-generated sections updated.

## UX requirements
- Drift warnings must be non-blocking but visible.
- Provide “pin this claim” option: user can keep an older claim for historical record.

## AI agent behaviors
- Agent must surface drift warnings when answering questions that touch impacted areas.
- Agent must offer side-by-side comparison when user asks “what changed?”.

## Failure modes & tough edges
- Massive refactor changes all chunk IDs → require robust mapping (hash + fuzzy match).
- User annotations anchored to removed text → anchor migration attempts, else mark “orphaned annotation”.

## Acceptance criteria
- Drift dashboard identifies impacted canvases with >95% recall in a synthetic test set.
- Partial re-synthesis completes faster than full rebuild for small edits.
