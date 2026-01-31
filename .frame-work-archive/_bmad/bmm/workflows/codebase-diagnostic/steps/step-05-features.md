---
name: 'step-05-features'
description: 'Phase 4: Isolate and analyze each feature/workspace independently'

workflow_path: '{project-root}/_bmad/bmm/workflows/codebase-diagnostic'
thisStepFile: '{workflow_path}/steps/step-05-features.md'
nextStepFile: '{workflow_path}/steps/step-06-integration.md'
outputPath: '{output_folder}/diagnostics/codebase-diagnostic-{date}/phase-4'
---

# Step 5: Feature Isolation Analysis (Phase 4)

## STEP GOAL

Analyze each feature/workspace in complete isolation to identify internal issues before examining cross-feature problems.

## MANDATORY EXECUTION RULES

- 🛑 Execute ALL 6 sub-agent prompts
- 📖 Each feature analyzed independently
- 💾 Each feature saved separately
- 🎯 Do NOT assume cross-feature knowledge

---

## SUB-AGENT PROMPT 4.1: Notes Feature Deep Scan

```
OBJECTIVE: Complete isolated analysis of Notes feature.

SCOPE (ONLY these files):
- src/routes/notes*.tsx
- src/presentation/components/notes/*.tsx
- src/lib/notes/*.ts
- Related types in src/shared/types/
- Related stores (note-store, etc.)

ANALYZE:
1. Entry Points
   - Route definitions
   - How user enters Notes workspace

2. Component Tree
   - NotesPage or StableNotesWorkspace
   - Child components (Sidebar, Editor, Chat)
   - Component hierarchy

3. State Management
   - Zustand stores used
   - Local useState/useReducer
   - Prop drilling vs context

4. Database Tables
   - notes table schema
   - CRUD operations
   - useLiveQuery usage

5. External Dependencies
   - BlockNote editor
   - AI chat integration
   - File system (if any)

6. User Flows Within Notes
   - Create note
   - Edit note
   - Delete note
   - Search notes
   - Toggle favorite

OUTPUT FORMAT:
## Notes Feature Analysis

### Entry Points
| Route | File | Component |
|-------|------|-----------|

### Component Tree
NotesPage
├── NoteSidebar
│   ├── NoteList
│   └── SearchInput
├── NoteEditor
│   ├── BlockNoteEditor
│   └── AISlashCommand
└── ChatPanel
    └── UnifiedChatPanel

### State Sources
| Component | State Source | Type |
|-----------|--------------|------|

### Database Operations
| Operation | File | Table | Trigger |
|-----------|------|-------|---------|

### Internal Issues Found
| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|

### Dependencies on Other Features
| Dependency | Why | Risk |
|------------|-----|------|

SAVE TO: {outputPath}/feature-notes.md
```

---

## SUB-AGENT PROMPT 4.2: IDE Feature Deep Scan

```
OBJECTIVE: Complete isolated analysis of IDE feature.

SCOPE (ONLY these files):
- src/routes/ide*.tsx
- src/presentation/components/ide/*.tsx
- src/lib/ide/*.ts
- WebContainer related
- Monaco editor related

ANALYZE SAME PATTERN AS NOTES, plus:
1. WebContainer lifecycle
2. File system integration
3. Terminal integration
4. Git integration
5. Project file sync

SPECIAL FOCUS:
- How IDE differs from other workspaces
- WebContainer initialization blocking
- Monaco editor lazy loading

SAVE TO: {outputPath}/feature-ide.md
```

---

## SUB-AGENT PROMPT 4.3: Knowledge Feature Deep Scan

```
OBJECTIVE: Complete isolated analysis of Knowledge feature.

SCOPE (ONLY these files):
- src/routes/knowledge*.tsx
- src/presentation/components/knowledge/*.tsx
- src/lib/rag/*.ts
- src/lib/knowledge/*.ts
- Vector store related

ANALYZE SAME PATTERN AS NOTES, plus:
1. RAG pipeline components
2. Source import/indexing
3. Embedding generation
4. Similarity search
5. Knowledge graph (if any)

SPECIAL FOCUS:
- Heavy computation paths
- Background processing
- Index building

SAVE TO: {outputPath}/feature-knowledge.md
```

---

## SUB-AGENT PROMPT 4.4: Study Feature Deep Scan

```
OBJECTIVE: Complete isolated analysis of Study feature.

SCOPE (ONLY these files):
- src/routes/study*.tsx
- src/presentation/components/study/*.tsx
- src/lib/study/*.ts
- Flashcard related
- Quiz related

ANALYZE SAME PATTERN AS NOTES, plus:
1. Flashcard state machine
2. Quiz generation logic
3. Spaced repetition algorithm
4. Study session tracking
5. Progress persistence

SPECIAL FOCUS:
- Complex state transitions
- Timer/session state
- Data generation from AI

SAVE TO: {outputPath}/feature-study.md
```

---

## SUB-AGENT PROMPT 4.5: Hub Feature Deep Scan

```
OBJECTIVE: Complete isolated analysis of Hub feature.

SCOPE (ONLY these files):
- src/routes/hub.tsx
- src/routes/index.tsx
- src/presentation/components/hub/*.tsx
- Project selection related

ANALYZE:
1. Landing page behavior
2. Project listing
3. Dashboard metrics
4. Quick actions
5. Workspace navigation

SPECIAL FOCUS:
- Multiple database queries for metrics
- Summary card performance
- Project picker behavior

SAVE TO: {outputPath}/feature-hub.md
```

---

## SUB-AGENT PROMPT 4.6: Agent Configuration Feature Deep Scan

```
OBJECTIVE: Complete isolated analysis of Agent/LLM configuration.

SCOPE (ONLY these files):
- src/routes/agents.tsx
- src/routes/settings.tsx
- src/presentation/components/agent/*.tsx
- src/lib/agent/*.ts
- src/infrastructure/persistence/stores/agents/*.ts
- LLM provider related

ANALYZE:
1. Agent configuration UI
2. Provider API key management
3. Model selection
4. Agent personas
5. Cross-workspace agent sync

SPECIAL FOCUS:
- "API Key missing" message cause
- Agent config persistence
- Cross-workspace sync events

SAVE TO: {outputPath}/feature-agents.md
```

---

## ORCHESTRATOR SYNTHESIS

After ALL 6 sub-agents complete:

1. **Create Feature Comparison Matrix:**

```markdown
# Phase 4 Summary: Feature Analysis

## Feature Overview
| Feature | Components | Stores | DB Tables | Complexity |
|---------|------------|--------|-----------|------------|
| Notes | X | X | notes | Medium |
| IDE | X | X | projects, files | High |
| Knowledge | X | X | sources, vectors | High |
| Study | X | X | flashcards, quizzes | Medium |
| Hub | X | X | projects | Low |
| Agents | X | X | agentConfigs | Medium |

## Pattern Inconsistencies
| Pattern | Notes | IDE | Knowledge | Study |
|---------|-------|-----|-----------|-------|
| Route structure | ✅ | ❌ Different | ✅ | ✅ |
| Workspace access | ✅ | ❌ Different | ✅ | ✅ |

## Feature-Specific Issues
| Feature | Issue Count | Critical |
|---------|-------------|----------|

## Common Issues Across Features
1. [Issue found in multiple features]
2. [Another common issue]
```

2. **Save:** `{outputPath}/phase-4-summary.md`

---

## MENU OPTIONS

- **[C] Continue** → Load step-06-integration.md
- **[R] Review** → Examine feature outputs
- **[RE] Re-execute** → Re-run specific feature

---

## SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- All 6 feature files created
- Each feature completely documented
- Pattern inconsistencies identified

### ❌ FAILURE:
- Missing feature files
- Incomplete analysis
- Cross-feature assumptions made
