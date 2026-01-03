---
id: KS-UC-08
name: "Collaborative lab group: merge & reconcile synthesized knowledge"
version: 1.0
status: draft
workspaces: [Knowledge, Notes, Canvas]
personas: [StudentTeam]
primary_goal: "Allow multiple contributors to import and synthesize without duplicating or corrupting shared structure."
---

## Scenario
A lab group of 4 students each imports their own notes and screenshots. They want to combine into a single project knowledge graph while preserving attribution, handling duplicates, and resolving conflicts (different interpretations of the same concept).

## Preconditions
- System supports per-item authorship metadata.
- Sync supports merging assets from multiple devices/users.

## Trigger
User shares a project or imports another member’s export bundle.

## Main flow
1. **Merge ingestion:**
   - Ingest new assets; detect duplicates by hash and semantic similarity.
2. **Conflict detection:**
   - When two synthesized nodes claim conflicting definitions:
     - Mark as “conflict cluster”.
     - Ask the group to choose preferred definition or keep both.
3. **Canvas review:**
   - AI suggests linkages across members’ materials.
   - Provide “attribution badges” on nodes.
4. **Neural matrix:**
   - Auto-group by topic and by author; allow toggling view.

## UX requirements
- “Merge preview” shows what will be added/merged.
- Conflict clusters require explicit resolution (or acceptance of multiple viewpoints).

## Failure modes & tough edges
- One member’s malicious or low-quality content pollutes tags → weight tags by trust/approval.
- Different naming conventions → alias system (synonyms).

## Acceptance criteria
- Deduplication reduces duplicates without deleting unique annotations.
- Conflicts are visible and traceable to original evidence.
