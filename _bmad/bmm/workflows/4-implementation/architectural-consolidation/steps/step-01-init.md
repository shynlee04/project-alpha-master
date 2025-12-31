# Step 1: Initialization and Phase 0 Setup

**Step Goal:** Initialize the architectural consolidation workflow, verify inputs, and prepare Phase 0 (Showcase Critical) execution.

---

## 1.1 CONFIGURATION VERIFICATION

### Load Required Documents

1. **Sprint Change Proposal:**
   - Location: `_bmad-output/sprint-change-proposal-2025-12-31.md`
   - Verify sections: 1-9 present
   - Extract Phase 0 stories

2. **Architecture Document:**
   - Location: `_bmad-output/project-planning-artifacts/architecture.md`
   - Extract relevant patterns (Section 4.2, 4.3)

3. **Validation Frameworks:**
   - `_bmad-output/validation/sweeping-validation.md`
   - `_bmad-output/validation/12-level-framework-integration-2025-12-29.md`

### CHECKPOINT: Configuration Loaded

Display to user:
```
✅ CONFIGURATION LOADED

📄 Sprint Change Proposal: Found
📄 Architecture: Found
📄 Sweeping Validation: Found
📄 12-Level Framework: Found

🎯 PHASE 0: Showcase Critical
📅 Deadline: Tomorrow (Jan 1, 2025)
📋 Stories: 3

Proceed with Phase 0 execution? [Y/N]
```

**HALT and WAIT for user input.**

---

## 1.2 PHASE 0 STORY EXTRACTION

From Sprint Change Proposal Section 4.1, extract:

### Story AC-01: Provider Store Reactivity

**Objective:** LLM Provider store with event emission for cross-workspace reactivity

**Files to Create/Modify:**
- `src/stores/provider-models-store.ts` (MODIFY)
- `src/lib/events/store-events.ts` (CREATE)

**Acceptance Criteria:**
- [ ] AC-01.1: API key set → models load automatically
- [ ] AC-01.2: Model selection persists across navigation
- [ ] AC-01.3: Custom OpenAI-compatible provider support
- [ ] AC-01.4: Event emission for cross-workspace sync

---

### Story AC-02: Agent Selector Unification

**Objective:** Single AgentSelector component with variants across all workspaces

**Files to Create/Modify:**
- `src/components/agent/AgentSelector.tsx` (MODIFY)
- `src/components/knowledge/KnowledgePage.tsx` (MODIFY)
- `src/components/study/StudyPage.tsx` (MODIFY)
- `src/components/notes/NotePage.tsx` (MODIFY)

**Acceptance Criteria:**
- [ ] AC-02.1: AgentSelector visible in Knowledge workspace
- [ ] AC-02.2: AgentSelector visible in Study workspace
- [ ] AC-02.3: AgentSelector visible in Notes workspace
- [ ] AC-02.4: Variant prop for compact/full display

---

### Story AC-03: Chat Panel Standardization

**Objective:** Workspace-agnostic ChatPanel that embeds in any workspace

**Files to Create/Modify:**
- `src/components/chat/ChatPanel.tsx` (REVIEW)
- `src/components/chat/ChatPanelCompact.tsx` (CREATE if needed)
- `src/components/chat/ChatContext.tsx` (CREATE)
- `src/components/chat/index.ts` (MODIFY)

**Acceptance Criteria:**
- [ ] AC-03.1: Chat works in Knowledge workspace
- [ ] AC-03.2: Streaming responses functional
- [ ] AC-03.3: Tool execution badges visible
- [ ] AC-03.4: Conversation persists across navigation

---

## 1.3 CONTEXT XML GENERATION

Generate context XML for Phase 0:

```xml
<context workflow="architectural-consolidation" phase="0" created="{timestamp}">
  <phase_info>
    <name>Showcase Critical</name>
    <deadline>2025-01-01</deadline>
    <stories count="3">
      <story id="AC-01">Provider Store Reactivity</story>
      <story id="AC-02">Agent Selector Unification</story>
      <story id="AC-03">Chat Panel Standardization</story>
    </stories>
  </phase_info>
  
  <validation_config>
    <sweeping_levels>1, 2, 3, 5, 6</sweeping_levels>
    <gate_level>1</gate_level>
    <device_test required="true">
      <device>Desktop Chrome (macOS)</device>
      <device>Mobile Safari (iOS 16+)</device>
      <device>Android Chrome</device>
    </device_test>
  </validation_config>
  
  <architecture_patterns source="architecture.md">
    <pattern name="Zustand + Dexie Middleware">
      Use persist middleware with createDexieStorage for IndexedDB persistence
    </pattern>
    <pattern name="Event Bus Cross-Store">
      Use EventEmitter3 for cross-store communication, avoid store imports
    </pattern>
    <pattern name="Selector Pattern">
      Use Zustand selectors for reactive subscriptions, not full store access
    </pattern>
  </architecture_patterns>
  
  <code_state>
    <!-- Populated by reading current file contents -->
  </code_state>
</context>
```

Save to: `_bmad-output/sprint-artifacts/architectural-consolidation-phase-0-context.xml`

---

## 1.4 PHASE 0 MENU

Display menu to user:

```
═══════════════════════════════════════════════════════════════════
🏗️ ARCHITECTURAL CONSOLIDATION - PHASE 0 READY
═══════════════════════════════════════════════════════════════════

Stories to implement:
  [1] AC-01: Provider Store Reactivity
  [2] AC-02: Agent Selector Unification
  [3] AC-03: Chat Panel Standardization

Commands:
  [S] Start with Story AC-01 (recommended)
  [V] View validation checkpoints
  [R] Run pre-implementation research
  [C] Continue to implementation
  [H] Help / Documentation

═══════════════════════════════════════════════════════════════════
Enter selection:
```

**HALT and WAIT for user input.**

---

## NEXT STEP ROUTING

| User Input | Action |
|------------|--------|
| `1`, `S`, or `AC-01` | Load `step-02-story-ac01.md` |
| `2` or `AC-02` | Load `step-03-story-ac02.md` |
| `3` or `AC-03` | Load `step-04-story-ac03.md` |
| `V` | Display validation checkpoints |
| `R` | Execute research protocol |
| `C` | Proceed to step-02 |
