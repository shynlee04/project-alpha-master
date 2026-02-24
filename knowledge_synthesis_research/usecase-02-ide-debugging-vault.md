---
id: KS-UC-02
name: "IDE-first debugging vault: errors → concepts → knowledge links"
version: 1.0
status: draft
workspaces: [IDE, Knowledge, Notes, Canvas]
personas: [Student, JuniorDeveloper]
primary_goal: "Turn debugging sessions into reusable knowledge and prevent repeated mistakes across projects."
---

## Scenario
A student uses the IDE workspace to build a project and keeps hitting similar TypeScript and runtime errors. They want the app to capture context (error logs, code snippets, docs) and synthesize a searchable “debugging brain” that links fixes to underlying concepts.

## Preconditions
- IDE workspace can capture terminal output, stack traces, and file diffs (or paste-in logs as a fallback).
- Knowledge workspace supports document nodes with frontmatter + semantic tags.

## Trigger
User clicks **Capture Debug Session** after an error occurs (or selects a log + relevant files and chooses “Synthesize Debug Note”).

## Main flow
1. **Ingestion (structured + semi-structured):**
   - Collect stack trace, error message, environment info (OS, Node version), and relevant code excerpts.
   - Attach any referenced docs pages or MD notes.
2. **Pre-processing:**
   - Normalize stack traces and extract symbols (functions, files, dependencies).
   - Chunk the captured context into: symptoms → environment → attempted fixes → final fix.
3. **Synthesis:**
   - Generate a Debug Note with:
     - “Root cause hypothesis” (ranked, with confidence).
     - “Minimal reproducible steps” (as checklist).
     - “Fix pattern” (generalized) + “Local patch” (specific diff).
     - Tags: framework, error family, language feature.
4. **Canvas & link suggestions:**
   - Drag 3+ Debug Notes onto Canvas; system suggests:
     - Shared root cause clusters.
     - A “common anti-pattern” node.
5. **Knowledge reinforcement:**
   - Create a “Concept Card” if the same concept appears across ≥3 Debug Notes (e.g., “Zustand selector anti-pattern”).

## UX requirements
- A “sanitize before saving” step must let the user redact secrets/paths.
- The user can opt-out of storing full code; store only selected snippets.
- Debug Notes must support quick recall: single screen shows symptom, fix, and provenance.

## AI agent behaviors
- Agent must refuse to execute unsafe shell commands; only suggest with explicit user confirmation.
- When answering, agent must distinguish between general guidance and project-specific fix.

## Failure modes & tough edges
- Prompt injection via error logs (e.g., malicious dependency printing instructions) → treat logs as untrusted input and isolate from system prompts.
- High churn codebase: fixes become stale → drift detector flags Debug Notes tied to files that changed significantly.

## Acceptance criteria
- Capturing a session produces a Debug Note in <60s after context is selected (excluding embeddings time if queued).
- Drift detector flags stale notes within 1 minute of detecting file changes (on next sync/index cycle).
