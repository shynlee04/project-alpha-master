A successful refactor here should make Notes a first-class citizen in the *same* project graph as IDE/Knowledge/Study—so threads, files, permissions, and “agent context” survive workspace switches and resume instantly. This aligns with the repo’s direction toward project–workspace binding, unified cross-workspace file sync, and consistent event-driven state propagation.sprint-change-proposal-project-workspace-binding-2026-01-01.md+2

## Cross-workspace foundations

To get “resumeable, hotloaded, consistent threaded conversations” and real cross-workspace behavior, the refactor should harden these shared primitives (and remove per-workspace silos):cross-workspace-file-sync-gap-analysis-2026-01-01.md+1

-Project-centric binding + shared context: a ProjectContext/WorkspaceStore that persists projectId, workspace bindings, last workspace, and per-workspace UI state, so switching is instant and state doesn’t fragment.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1

-CrossWorkspaceEventBus as the single event spine: file-change, sync-status, permission-change, provider-config, agent-config, and workspace-change events must be emitted/consumed across all workspaces with proper cleanup (no leaked listeners).AGENTS.md+2

-Missing Notes/Study FileSync services: implement NotesFileSyncService and StudyFileSyncService (cache-first, workspace-aware cache strategy, event broadcasting) so Notes can truly CRUD project files and export/import assets.complete-system-integration-roadmap-2026-01-01.md+1

-Unified permission lifecycle: a single permission manager that supports “YOLO once” grants and per-workspace/per-tool enforcement, plus permission-change events for UI overlays and audit trails.cross-workspace-file-sync-gap-analysis-2026-01-01.md+1

Loop prompt (drop into `PROMPT.md` for your Ralph Wiggum cycle) to implement the Notes cross-workspace core end-to-end:

`text---
active: true
iteration: 1
max_iterations: 100
completion_promise: "Notes workspace can read/write synced project files, export/import assets, and resume threaded AI chats across workspace switches with zero refresh"
started_at: "2026-01-05T02:09:00+07:00"
module: "notes-cross-workspace"
---
Context:
- Notes currently has disconnected/placeholder AI and lacks real FileSync integration.
- Cross-workspace plans require Project-centric binding + FileSyncService + CrossWorkspaceEventBus + unified permission lifecycle.
Task:
- Implement NotesFileSyncService + wire it to Notes workspace.
- Ensure file-change events update IDE/Knowledge/Study views in real time.
- Persist and resume threaded conversations per project across workspace switching.
Success Criteria:
- Create/edit/delete a markdown note file from Notes and see it reflected in IDE file tree without refresh.
- Export a note as .md (and attachments as files) to local drive and re-import.
- Switch Notes ↔ IDE in same project and resume the same thread with intact context window.
Constraints:
- Max 1 background task (no constant rebuild loops).
- No routing crashes; keep workspace switching stable.
Validation:
- pnpm tsc --noEmit && pnpm test && pnpm build
Completion Signal:
- Output: <promise>Notes workspace can read/write synced project files, export/import assets, and resume threaded AI chats across workspace switches with zero refresh</promise>`

## Threaded conversations (resume + hotload)

Make conversation state project-bound and workspace-aware (instead of “chat state per page”), using the existing conversation thread direction in the repo (hierarchy + context window manager).AGENTS.md

-Thread entity + hierarchy: store threads with parent/children + folder organization and keep them keyed by projectId so a thread follows the project across workspaces.AGENTS.md

-Context window management: prune/summarize strategies should be explicit per thread to keep long sessions stable and “resumeable” without ballooning memory.AGENTS.md

-Reactive hotload: couple thread mutations (message append, tool streaming chunks, thread metadata updates) to the cross-workspace event system so an active conversation updates anywhere it’s visible.complete-system-integration-roadmap-2026-01-01.md+1

## Notes workspace: from silo → cross-workspace

The Notes remediation plan already identifies the core blockers: fake AI wiring, agent selector having no effect, editor hot-reload failures, and no file sync into the project ecosystem.notes-remediation-sprint-change-proposal-2025-12-31.md

-Replace placeholder “AI Magic” with real agent execution: Notes AI calls should use the same agent/provider system (selected agent + provider credentials) so behavior matches IDE/Knowledge.notes-remediation-sprint-change-proposal-2025-12-31.md

-Add Notes export/import and event emission: implement markdown export/import and emit note-created/note-updated events so Knowledge can index Notes for RAG and IDE can treat outputs as usable project assets.notes-remediation-sprint-change-proposal-2025-12-31.md

## Multimodal (Gemini) + export to drive

For multimodality, wire your agent tools to the official Google Gen AI TypeScript SDK and treat uploads/attachments as first-class “artifacts” that can be saved back to local drive. The SDK entry point is the Google `js-genai` repository (TypeScript/JS SDK) with docs at [googleapis/js-genai](https://github.com/googleapis/js-genai) and its documentation site.[github](https://github.com/googleapis/js-genai)

-Start with the official quickstart and build upward: [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart) and the SDK/library guidance page.[google+1](https://ai.google.dev/gemini-api/docs/quickstart)

-Use the Files API pattern for large PDFs/audio/images so they can be referenced in prompts without embedding bytes inline (and so uploads can be reused across steps).[google+1](https://ai.google.dev/api/files)

-Implement “auto model switching” at the tool-router level (not UI): e.g., low-latency multimodal steps can use a Flash-class model name like `gemini-2.0-flash-001` as shown in the SDK docs, while deep research routes to longer-context reasoning models (with the router deciding based on modality + task).[github](https://github.com/googleapis/js-genai)

## 10 wow-factor ideas (Notes × cross-workspace)

These are designed to *showcase* Notes as a “live paper” workspace that generates assets reusable in IDE, while remaining bilingual (VI/EN) per your product constraints.[ppl-ai-file-upload.s3.amazonaws+1](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_2cab8c2e-c9d5-4a2e-9eef-65269cca35a8/87964c9b-4d07-420c-8731-076f88da62b9/ux-design-specification.md)

-1) “Live Brief → PRD → Epics” generator: user drops a rough Vietnamese voice note + a repo folder; Notes produces PRD/epics/stories, then pushes `epics.md` + `sprint-status.yaml` updates as files into the project (with reviewable diffs).

-2) “Bottom 1/5 floating copilot” with page-aware context: a persistent mini-chat panel that automatically scopes to the current note block selection and the active project folder, switching tone between research vs coding.

-3) Multi-agent debate tiles: one tap spawns 3 agent perspectives (PM/Architect/Reviewer) arguing in parallel; Notes merges into a single decision record and saves it as `ADR-*.md`.

-4) “Asset Forge” blocks: any diagram/code/table can be rendered as an HTML artifact pane, then exported as `artifact.html` (and optionally captured as PDF) into `/docs/artifacts/`.

-5) “Repo-aware bilingual rewrite”: highlight text → generate EN and VI variants side-by-side, preserving code blocks and terminology, and saving a translation memory file into the repo.

-6) “Meeting-to-commit pipeline”: upload audio → transcript → action items → generate branch plan → produce commit-ready TODO markdown inside the repo.

-7) “Interactive tutorial note”: Notes turns a note into a step-by-step interactive walkthrough that can open files, annotate diffs, and generate exercises; outputs become onboarding docs in `/docs/`.

-8) “Contextual linting for notes”: when a note references code symbols, Notes verifies symbol existence in the repo and flags stale references; fixes can be applied as patch files.

-9) “Research → citations → code scaffolds”: Notes runs deep research, stores citations, then generates implementation scaffolds (components/services/tests) directly as repo files ready for IDE workspace work.

-10) “Cross-workspace snapshot time-travel”: every meaningful AI action (research, transform, export) emits an event and creates a recoverable snapshot; user can rewind a thread and restore the exact artifacts/files produced.

If the top priority is “Notes cross workspace + resumeable threads,” choose one: should Notes sync as **markdown files in the project folder** (source of truth = filesystem), or remain Dexie-first with filesystem as an export target?

A solid “cross-workspace Notes + threaded agent chat” refactor should make **projects** the shared unit of context, so conversations, file sync, and permissions stay consistent when switching between IDE ↔ Notes ↔ Knowledge ↔ Study.  It also needs to eliminate “decorative AI” in Notes by wiring the Notes UI to the real agent system, and by giving Notes the same FileSync + eventbus capabilities already expected across the platform.notes-remediation-sprint-change-proposal-2025-12-31.md+2

## Architecture north star

Design around a project-centric shell: when a user opens a project from Hub, they pick which workspaces are bound (IDE/Notes/Knowledge/Study), and all bound workspaces share the same project context, file tree snapshot, and navigation state.  This matches the repo’s own proposed direction: persist file snapshots in IndexedDB for instant reloads, provide a shared ProjectContextProvider, and enable fast workspace switching without re-reading the full filesystem each time.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1

## Core subsystems to refactor

- Unified state (Zustand + persisted storage): converge the current “multiple patterns” (WorkspaceContext + ProjectContext + per-workspace Zustand) into a single WorkspaceStore pattern with persisted project/workspace state and selector-based subscriptions to avoid re-render loops. A related internal guideline explicitly warns against destructuring Zustand stores and recommends individual selectors to prevent maximum-update-depth crashes and high CPU usage.cross-workspace-file-sync-gap-analysis-2026-01-01.md+1
- Persistence layer (Dexie/IndexedDB): use a cache-first snapshot model (metadata tree first, lazy content later) so the Notes workspace can open and render project assets quickly, and later stream content on demand.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1
- Cross-workspace eventbus: standardize on an EventEmitter3-style singleton CrossWorkspaceEventBus for file-change + sync-status + (critically) permission-change events so UI, tools, and stores hot-update across workspaces without refresh.complete-system-integration-roadmap-2026-01-01.md+1
- File sync per workspace: your gap analysis explicitly states StudyFileSyncService and NotesFileSyncService are missing, which blocks file operations outside IDE/Knowledge and breaks “cross-workspace” promises. The proposed fix is to implement workspace-specific FileSyncService implementations that broadcast file change events, then subscribe in workspace UI to refresh views immediately.cross-workspace-file-sync-gap-analysis-2026-01-01.md+1
- Notes workspace reality check: a sprint proposal documents that Notes currently returns mock “AI Magic” output and does not call AgentFactory/real providers, which is a trust-killer and must be corrected before any “wow factor” features.notes-remediation-sprint-change-proposal-2025-12-31.md
- Threaded conversations (resume + hierarchy): the repo already describes a conversation-threads store supporting parent/child threads, folder paths, and context-window pruning strategies (summarize/drop-oldest/truncate), which is exactly what “consistent threaded conversations that are resumable” should build on.AGENTS.md

## Permissions + local drive exports

Implement a unified permission manager that can enforce per-workspace File System Access requirements, cache permission state, and apply fallback strategies when access is denied (import/template/readonly).  Pair that with workspace-aware agent tool facades so tools don’t assume “IDE context”; the gap analysis explicitly calls out that agent file tools currently assume LocalFSAdapter and lack workspace validation.complete-system-integration-roadmap-2026-01-01.md+1

For “everything exportable to local drive,” Notes should not remain an IndexedDB-only silo: the Notes remediation plan proposes a NoteFileSyncAdapter that can export notes to Markdown, import Markdown into notes, and sync a directory—this is the right backbone for saving artifacts (HTML, diagrams, transcripts) into the same project folder so they become assets usable in IDE.notes-remediation-sprint-change-proposal-2025-12-31.md

## Sprint planning (BMAD-ready)

A pragmatic sprint plan aligned with the repo’s own roadmaps would be:

- P0 (foundation): implement NotesFileSyncService + StudyFileSyncService + CrossWorkspaceEventBus so file operations and real-time sync are possible in every workspace.cross-workspace-file-sync-gap-analysis-2026-01-01.md+1
- P0/P1 (trust + UX): fix Notes “fake AI” by wiring note-ai-service to the actual agent/provider stores; fix NoteEditor hot-reload so switching notes updates immediately.notes-remediation-sprint-change-proposal-2025-12-31.md
- P1 (coherence): unify state management into a single WorkspaceStore, then migrate workspace components to it (with hydration-safe UI).complete-system-integration-roadmap-2026-01-01.md+1
- P1 (security + tool UX): add workspace-aware tool execution with permission checks + “approval request” UX for sensitive operations (write/delete/execute).complete-system-integration-roadmap-2026-01-01.md
- P2 (delight/optimization): add workspace-specific caching strategies, analytics, sync-status UI, and conflict resolution dialogs (so the system stays fast and understandable as projects grow).cross-workspace-file-sync-gap-analysis-2026-01-01.md

## 10 “wow-factor” Notes ideas (cross-workspace + savable)

Each idea is intentionally “Notes-first,” but produces assets that can be saved into the project folder and reused in IDE planning/coding.

- **Live Paper → Build Plan**: turn a note into an interactive “living doc” that can generate (and save) `epics.md`, story breakdowns, and implementation checklists directly into the repo when the project is bound across workspaces.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1
- **Thread-to-PRD branching**: one note spawns child conversation threads per subtopic (UX, data model, security), using hierarchical threads + context-window pruning so long programs stay coherent and resumable.AGENTS.md
- **Cross-workspace “asset sidebar”**: Notes shows a project-wide asset panel (diagrams, HTML artifacts, Markdown exports) that updates instantly when IDE/Knowledge writes new files, powered by file-change events.cross-workspace-file-sync-gap-analysis-2026-01-01.md
- **“Explain this code” deep-link notes**: from IDE, select code → generate an explainer note in Notes as Markdown saved into the project folder, so the explanation becomes versionable documentation.notes-remediation-sprint-change-proposal-2025-12-31.md
- **Multi-agent debate blocks**: inside a note, spawn 2–3 agents that produce competing solutions (e.g., state architecture options), then store the debate as a threaded conversation subtree for later resumption.AGENTS.md
- **Notebook-level “sync to repo”**: one-click export of the current note (and embedded artifacts) to a deterministic path like `docs/notes/{slug}.md`, using the proposed Notes export/import + FileSync integration.notes-remediation-sprint-change-proposal-2025-12-31.md+1
- **Permission-aware “YOLO mode”**: a toggle that switches permission prompts between “ask every time” and “trust for this project/workspace,” emitting permission-change events so UI and agent tools react immediately.complete-system-integration-roadmap-2026-01-01.md
- **Multimodal “evidence pack” blocks**: attach PDFs/images/audio, run extraction/summarization, then persist outputs as files next to the note; this relies on a Gemini-capable multimodal SDK and the platform’s ability to export results.[github+1](https://github.com/googleapis/js-genai)
- **“Spec → scaffold” routing**: detect whether the user is in the same project folder and auto-route outputs: in Notes, generate product/spec artifacts; in IDE, generate code scaffolds and tasks—without losing thread continuity when switching workspaces.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1
- **Deep Research mode in Notes**: a “Lab-like” workflow that runs multi-step gathering + synthesis and stores the full provenance (sources, intermediate drafts, final artifacts) into the project as Markdown/JSON for reproducibility.notes-remediation-sprint-change-proposal-2025-12-31.md

## Gemini TypeScript SDK links (multimodal)

- Official Google GenAI TypeScript/JavaScript SDK repo: [googleapis/js-genaigithub](https://github.com/googleapis/js-genai)
- Gemini API quickstart: [Gemini API quickstartgoogle](https://ai.google.dev/gemini-api/docs/quickstart)
- Libraries overview (Google recommends GenAI SDK): [Gemini API librariesgoogle](https://ai.google.dev/gemini-api/docs/libraries)
- Files API docs (media upload + reuse): [Gemini Files APIgoogle](https://ai.google.dev/gemini-api/docs/files)
- Migration guide to the newer GenAI SDK: [Migrate to Google GenAI SDKgoogle](https://ai.google.dev/gemini-api/docs/migrate)

## Architecture north star

Design around a project-centric shell: when a user opens a project from Hub, they pick which workspaces are bound (IDE/Notes/Knowledge/Study), and all bound workspaces share the same project context, file tree snapshot, and navigation state.  This matches the repo’s own proposed direction: persist file snapshots in IndexedDB for instant reloads, provide a shared ProjectContextProvider, and enable fast workspace switching without re-reading the full filesystem each time.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1

## Core subsystems to refactor

- Unified state (Zustand + persisted storage): converge the current “multiple patterns” (WorkspaceContext + ProjectContext + per-workspace Zustand) into a single WorkspaceStore pattern with persisted project/workspace state and selector-based subscriptions to avoid re-render loops. A related internal guideline explicitly warns against destructuring Zustand stores and recommends individual selectors to prevent maximum-update-depth crashes and high CPU usage.cross-workspace-file-sync-gap-analysis-2026-01-01.md+1
- Persistence layer (Dexie/IndexedDB): use a cache-first snapshot model (metadata tree first, lazy content later) so the Notes workspace can open and render project assets quickly, and later stream content on demand.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1
- Cross-workspace eventbus: standardize on an EventEmitter3-style singleton CrossWorkspaceEventBus for file-change + sync-status + (critically) permission-change events so UI, tools, and stores hot-update across workspaces without refresh.complete-system-integration-roadmap-2026-01-01.md+1
- File sync per workspace: your gap analysis explicitly states StudyFileSyncService and NotesFileSyncService are missing, which blocks file operations outside IDE/Knowledge and breaks “cross-workspace” promises. The proposed fix is to implement workspace-specific FileSyncService implementations that broadcast file change events, then subscribe in workspace UI to refresh views immediately.cross-workspace-file-sync-gap-analysis-2026-01-01.md+1
- Notes workspace reality check: a sprint proposal documents that Notes currently returns mock “AI Magic” output and does not call AgentFactory/real providers, which is a trust-killer and must be corrected before any “wow factor” features.notes-remediation-sprint-change-proposal-2025-12-31.md
- Threaded conversations (resume + hierarchy): the repo already describes a conversation-threads store supporting parent/child threads, folder paths, and context-window pruning strategies (summarize/drop-oldest/truncate), which is exactly what “consistent threaded conversations that are resumable” should build on.AGENTS.md

## Permissions + local drive exports

Implement a unified permission manager that can enforce per-workspace File System Access requirements, cache permission state, and apply fallback strategies when access is denied (import/template/readonly).  Pair that with workspace-aware agent tool facades so tools don’t assume “IDE context”; the gap analysis explicitly calls out that agent file tools currently assume LocalFSAdapter and lack workspace validation.complete-system-integration-roadmap-2026-01-01.md+1

For “everything exportable to local drive,” Notes should not remain an IndexedDB-only silo: the Notes remediation plan proposes a NoteFileSyncAdapter that can export notes to Markdown, import Markdown into notes, and sync a directory—this is the right backbone for saving artifacts (HTML, diagrams, transcripts) into the same project folder so they become assets usable in IDE.notes-remediation-sprint-change-proposal-2025-12-31.md

## Sprint planning (BMAD-ready)

A pragmatic sprint plan aligned with the repo’s own roadmaps would be:

- P0 (foundation): implement NotesFileSyncService + StudyFileSyncService + CrossWorkspaceEventBus so file operations and real-time sync are possible in every workspace.cross-workspace-file-sync-gap-analysis-2026-01-01.md+1
- P0/P1 (trust + UX): fix Notes “fake AI” by wiring note-ai-service to the actual agent/provider stores; fix NoteEditor hot-reload so switching notes updates immediately.notes-remediation-sprint-change-proposal-2025-12-31.md
- P1 (coherence): unify state management into a single WorkspaceStore, then migrate workspace components to it (with hydration-safe UI).complete-system-integration-roadmap-2026-01-01.md+1
- P1 (security + tool UX): add workspace-aware tool execution with permission checks + “approval request” UX for sensitive operations (write/delete/execute).complete-system-integration-roadmap-2026-01-01.md
- P2 (delight/optimization): add workspace-specific caching strategies, analytics, sync-status UI, and conflict resolution dialogs (so the system stays fast and understandable as projects grow).cross-workspace-file-sync-gap-analysis-2026-01-01.md

## 10 “wow-factor” Notes ideas (cross-workspace + savable)

Each idea is intentionally “Notes-first,” but produces assets that can be saved into the project folder and reused in IDE planning/coding.

- **Live Paper → Build Plan**: turn a note into an interactive “living doc” that can generate (and save) `epics.md`, story breakdowns, and implementation checklists directly into the repo when the project is bound across workspaces.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1
- **Thread-to-PRD branching**: one note spawns child conversation threads per subtopic (UX, data model, security), using hierarchical threads + context-window pruning so long programs stay coherent and resumable.AGENTS.md
- **Cross-workspace “asset sidebar”**: Notes shows a project-wide asset panel (diagrams, HTML artifacts, Markdown exports) that updates instantly when IDE/Knowledge writes new files, powered by file-change events.cross-workspace-file-sync-gap-analysis-2026-01-01.md
- **“Explain this code” deep-link notes**: from IDE, select code → generate an explainer note in Notes as Markdown saved into the project folder, so the explanation becomes versionable documentation.notes-remediation-sprint-change-proposal-2025-12-31.md
- **Multi-agent debate blocks**: inside a note, spawn 2–3 agents that produce competing solutions (e.g., state architecture options), then store the debate as a threaded conversation subtree for later resumption.AGENTS.md
- **Notebook-level “sync to repo”**: one-click export of the current note (and embedded artifacts) to a deterministic path like `docs/notes/{slug}.md`, using the proposed Notes export/import + FileSync integration.notes-remediation-sprint-change-proposal-2025-12-31.md+1
- **Permission-aware “YOLO mode”**: a toggle that switches permission prompts between “ask every time” and “trust for this project/workspace,” emitting permission-change events so UI and agent tools react immediately.complete-system-integration-roadmap-2026-01-01.md
- **Multimodal “evidence pack” blocks**: attach PDFs/images/audio, run extraction/summarization, then persist outputs as files next to the note; this relies on a Gemini-capable multimodal SDK and the platform’s ability to export results.[github+1](https://github.com/googleapis/js-genai)
- **“Spec → scaffold” routing**: detect whether the user is in the same project folder and auto-route outputs: in Notes, generate product/spec artifacts; in IDE, generate code scaffolds and tasks—without losing thread continuity when switching workspaces.sprint-change-proposal-project-workspace-binding-2026-01-01.md+1
- **Deep Research mode in Notes**: a “Lab-like” workflow that runs multi-step gathering + synthesis and stores the full provenance (sources, intermediate drafts, final artifacts) into the project as Markdown/JSON for reproducibility.notes-remediation-sprint-change-proposal-2025-12-31.md

## Gemini TypeScript SDK links (multimodal)

- Official Google GenAI TypeScript/JavaScript SDK repo: [googleapis/js-genaigithub](https://github.com/googleapis/js-genai)
- Gemini API quickstart: [Gemini API quickstartgoogle](https://ai.google.dev/gemini-api/docs/quickstart)
- Libraries overview (Google recommends GenAI SDK): [Gemini API librariesgoogle](https://ai.google.dev/gemini-api/docs/libraries)
- Files API docs (media upload + reuse): [Gemini Files APIgoogle](https://ai.google.dev/gemini-api/docs/files)
- Migration guide to the newer GenAI SDK: [Migrate to Google GenAI SDKgoogle](https://ai.google.dev/gemini-api/docs/migrate)

If the next step is to translate this into a BMAD sprint board, which sprint horizon is preferred (1 week “P0 trust + FileSync” vs 2 weeks “P0+P1 coherence”) and which workspace is the demo priority (Notes-first or IDE-first)?
