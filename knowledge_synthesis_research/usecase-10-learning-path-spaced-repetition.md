---
id: KS-UC-10
name: "From knowledge to action: generate a learning path + spaced repetition"
version: 1.0
status: draft
workspaces: [Knowledge, Study, Notes, Canvas]
personas: [Student]
primary_goal: "Turn synthesized knowledge clusters into an adaptive learning path with spaced repetition and progress tracking."
---

## Scenario
After importing an entire semester vault, a student wants the app to propose a learning path (prerequisites → advanced topics), then schedule spaced repetition and quizzes that adapt based on performance.

## Preconditions
- Neural matrix clusters exist with prerequisite edges (inferred or user-approved).
- Study workspace supports quiz/flashcard items and progress metrics.

## Trigger
User clicks **Generate Learning Path** on a cluster or on the whole project.

## Main flow
1. **Path generation:**
   - Build a DAG of concepts: prerequisites first.
   - Identify missing prerequisites by checking the vault coverage.
2. **User calibration:**
   - Ask 3–5 quick diagnostic questions to estimate baseline.
3. **Study plan output:**
   - Produce weekly plan with:
     - Daily reading nodes.
     - Practice nodes (quiz).
     - Review nodes (spaced repetition intervals).
4. **Feedback loop:**
   - After each quiz, adjust the next week’s plan.
   - If a concept is weak, surface additional resources from Knowledge workspace.

## UX requirements
- Learning path must be editable (drag to reorder prerequisites).
- Show “why this is next” explanation.

## Failure modes & tough edges
- Hallucinated prerequisites → require user approval for inferred edges.
- Overwhelming plan → cap daily workload and allow “light/standard/intense” modes.

## Acceptance criteria
- User can generate a path and start studying within 3 clicks from a cluster view.
- Plan adapts after quiz results without breaking existing user notes.
