---
id: KS-UC-18
name: "Mobile collaborative review: share canvas snapshots + voice comments"
version: 1.0
status: draft
workspaces: [Canvas, Notes, Knowledge]
personas: [StudentTeam]
primary_goal: "Enable async collaboration: capture canvas state on mobile, record voice comments, and sync for desktop review."
---

## Scenario
A study group is distributed. One member reviews the shared canvas on mobile during their commute, records voice comments on specific nodes, and shares a snapshot. Other members review on desktop, listen to comments, and respond.

## Preconditions
- Mobile Canvas workspace supports read-only or limited-edit mode.
- Voice comments can be anchored to nodes/edges.
- Sync supports versioned canvas snapshots.

## Trigger
**Mobile:** User opens Canvas → reviews → taps a node → "Add voice comment" → records → saves snapshot.
**Desktop (team):** Notification: "[User] added comments to canvas 'Exam prep map'".

## Main flow
1. **Mobile review:**
   - User opens canvas (synced from desktop).
   - Taps a node → "Add comment" → chooses voice.
   - Records 30-second comment: "This concept is unclear, can we add examples?".
   - Comment is anchored to node ID + timestamp.

2. **Snapshot creation:**
   - User taps "Share snapshot".
   - System creates a canvas version:
     - Layout state (node positions).
     - Comment anchors.
     - Metadata (author, timestamp).
   - Upload snapshot to shared project.

3. **Desktop review:**
   - Team member opens canvas → sees "3 new comments" badge.
   - Clicks node with comment → audio player appears.
   - Listens to comment → adds text reply or voice reply.

4. **Resolution workflow:**
   - Original commenter sees reply on mobile.
   - If issue is resolved, marks comment as "Done" → comment badge turns green.

5. **Knowledge audit trail:**
   - All comments are stored as a "Review thread" in Knowledge workspace.
   - Linked to canvas snapshot + node provenance.

## UX requirements
- Mobile: voice recording must handle background noise (noise cancellation).
- Desktop: audio comments must be playable without leaving canvas view.
- Provide "Comment history" timeline for each node.

## AI agent behaviors
- Agent can transcribe voice comments (optional) for searchability.
- Agent can suggest related nodes when a comment mentions a concept: "You mentioned 'RAG'—link to node X?".
- Agent must not auto-resolve comments; only user can mark "Done".

## Failure modes & tough edges
- Comment anchored to a node that another member deleted → mark comment as "orphaned" and suggest re-anchoring.
- Voice file fails to upload → queue retry; show "pending upload" badge.
- Multiple members comment on same node simultaneously → merge as a thread (chronological order).

## Acceptance criteria
- Voice comments are playable within 2 seconds of tapping.
- Snapshot includes all comments + canvas state; can be restored as a version.
- Team can resolve comments via mobile or desktop; resolution syncs bidirectionally.

## Cross-workspace integration
- Canvas workspace (mobile): read + voice comment capture.
- Canvas workspace (desktop): full edit + audio playback.
- Knowledge workspace: comment threads archived as searchable nodes.
- Notes workspace: user can add detailed text follow-ups.
