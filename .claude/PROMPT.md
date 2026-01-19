To get AI to scan to the *true* cause (and stop “sticky” loops), force it to work like a debugger: **reproduce → isolate invariant → trace dataflow → prove with evidence → only then patch**. Your logs show the classic failure mode: the agent “fixes the URL” but misses the deeper invariant: **projectId semantics are inconsistent (namespaced vs bare), so any routing fix becomes whack‑a‑mole**. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/157398260/07d7f78f-e12e-4f99-b904-4b2685d1c2ce/paste.txt)

## What makes this sticky (root pattern)
- There is a “namespaced project id” format like `ide:proj_...` and routes like `/notes/$projectId` that implicitly assume a different id space (either `notes:proj_...` or bare `proj_...`). [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/157398260/07d7f78f-e12e-4f99-b904-4b2685d1c2ce/paste.txt)
- An AI will keep “fixing navigation strings” unless you force it to answer: **Which identifier is the canonical primary key in Dexie, and which ids are only presentation/routing aliases?** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/157398260/07d7f78f-e12e-4f99-b904-4b2685d1c2ce/paste.txt)
- This is exactly the kind of drift your governance remediation warns about: partial fixes without completing the architecture contract (ex: state/persistence decisions violated) cause repeated regressions. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/157398260/94d2dbe1-57e2-4d6a-91ab-b368a708b6dc/governance-violation-remediation-2026-01-19.yaml)

## The best way: make the agent prove invariants first
Give the agent a **hard invariant checklist** it must satisfy before it can propose code changes:

**Invariant set (must be proven with code evidence):**
- **I1: Canonical ProjectId** — Dexie primary key format (exact string) and all loaders query using that exact format (or explicit adapter).  
- **I2: Route param contract** — each route declares what format it accepts (`namespaced` or `bare`) and loaders normalize accordingly.  
- **I3: Workspace switching** — moving between IDE/Notes does *not* mutate the canonical project id; it only changes the “active workspace view”.  
- **I4: One normalization function** — exactly one utility like `normalizeProjectIdForRoute()` used everywhere; zero ad-hoc string slicing.  

Your paste shows the agent did the opposite (ad-hoc stripping `ide:`) and immediately hit the predictable second-order failure: loader can’t find the project in Dexie because Dexie still stores the namespaced id. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/157398260/07d7f78f-e12e-4f99-b904-4b2685d1c2ce/paste.txt)

## Copy/paste “scan to true cause” prompt
Use this prompt when things are sticky. It prevents premature patching and forces the AI to identify the *single* broken contract.

```markdown
You are an expert repo diagnostician. Do NOT fix anything until the root invariant is proven.

Objective: determine the true root cause of sticky routing/workspace bugs involving namespaced project IDs (e.g., ide:proj_...) and routes /notes/$projectId.

Rules:
1) No code edits until you complete the “Invariant Proof” section with citations (file path + line range + snippet).
2) If you propose a fix, it must be a contract-level fix (normalize at boundaries), not scattered string changes.
3) Every claim must be backed by evidence from the repo. No assumptions.

Steps:

A) Reproduction evidence
- Provide the exact failing URL(s) and the observed behavior.
- Identify which route loader runs and where it queries Dexie.

B) Invariant Proof (must fill all)
I1 Canonical ProjectId:
- Show Dexie schema/table key and how projects are stored (exact id format).
- Show the createProject() code path and what id it writes.
I2 Route param contract:
- For /ide/$projectId and /notes/$projectId, show what format each expects today.
- Show how params are transformed (if at all) before DB queries.
I3 Workspace switching:
- Locate the navigation code for switching workspaces and show what id it passes.
- Prove whether it passes the same id or mutates it.
I4 Single normalization:
- Search for all projectId parsing/formatting utilities.
- List all call sites where projectId is modified inline (must be eliminated).

C) Root Cause Statement (one sentence)
Format:
“Bug occurs because <broken invariant>, causing <specific failing query/redirect> when <trigger>.”

D) Fix Design (choose ONE and justify)
Option 1: Canonical = namespaced id everywhere; routes accept namespaced, loaders query namespaced.
Option 2: Canonical = bare id everywhere; namespacing is derived; migration required.
Option 3: Canonical = bare id, but store alias mapping table for legacy namespaced ids.

E) Minimal Patch Plan
- Exact files to edit.
- Add 2-3 tests that fail before fix and pass after fix (route loader + workspace switch).
- Validation commands: pnpm tsc --noEmit && pnpm test && pnpm build.

Output:
- Write a YAML diagnosis artifact: bmad-output/diagnostics/diagnosis-projectId-contract.yaml
```

## Add a “stop condition” so AI can’t wander
Require the agent to stop and ask for decision once it finds the contract fork:

- If Dexie stores `ide:proj_...` today, you must choose between:
  - **Keep canonical = namespaced** (fastest, least migration)  
  - **Migrate canonical = bare** (cleaner long-term, but requires migration + adapters)

Without this explicit decision, the AI will keep oscillating (strip prefix → loader fails → re-add prefix → other workspace breaks), which is exactly what your paste shows. [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/157398260/07d7f78f-e12e-4f99-b904-4b2685d1c2ce/paste.txt)

Plain question (no citations):  
Which direction do you want as the single source of truth for project ids: **namespaced** (`ide:proj_...`) or **bare** (`proj_...`)?