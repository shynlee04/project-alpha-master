---
# ═══════════════════════════════════════════════════════════════════════════
# SPRINT STATUS: EPIC-40 Agent Chat Course Correction
# Generated: 2026-01-10T10:00:00+07:00
# Workflow: sprint-planning (BMAD V6)
# Type: REMEDIATION SPRINT
# ═══════════════════════════════════════════════════════════════════════════

sprint:
  id: epic-40-agent-chat-2026-01-10
  name: "EPIC-40: Agent Chat Self-Switching & Tool Registry"
  start_date: "2026-01-10T10:00:00+07:00"
  target_end_date: "2026-01-24T23:59:00+07:00"
  status: READY_FOR_EXECUTION
  phase: EPIC_40_REMEDIATION
  team: "A"  # Single team (Team A) - no parallel tracks
  predecessor: phase-2-agentic-2026-01-09
  predecessor_status: "IN_PROGRESS"
  created_by: "BMAD Correct-Course Workflow"
  sprint_type: REMEDIATION
  loop_file: ".claude/ralph-loop.local.md"
  agent_coordinator: "/bmad:core:agents:bmad-master"

# ═══════════════════════════════════════════════════════════════════════════
# SPRINT GOAL
# ═══════════════════════════════════════════════════════════════════════════

goal: |
  Fix critical agent chat limitations through centralized system prompt architecture:

  1. SELF-SWITCHING AGENT - Automatically select optimal mode based on context
  2. TOOL REGISTRY - Centralized tool management with permission filtering
  3. SERVER EXPOSURE - Fix 4-tool limitation, expose all authorized tools
  4. CONTEXT THRESHOLD - Lower compression trigger to 65%

  PHILOSOPHY: ONE centralized system prompt (not fragmented), intelligent
  routing based on context (prompt, workspace, document, conversation).

# ═══════════════════════════════════════════════════════════════════════════
# SPRINT CONTEXT
# ═══════════════════════════════════════════════════════════════════════════

context:
  trigger: "EPIC-40 Course Correction - Agent Chat Tool Enhancement"
  philosophy: "Centralized prompt architecture with context-aware self-switching"

  course_correction:
    trigger: "User feedback on Phase 3 synthesis"
    feedback: "Not fragmenting without control - ONE centralized system prompt"
    decision_document: "_bmad-output/phase3-synthesis/centralized-system-prompt-design-2026-01-10.md"
    adr: "_bmad-output/planning-artifacts/architecture/adr/ADR-032-agent-chat-self-switching-orchestrator-2026-01-10.md"

  key_documents:
    - path: "_bmad-output/phase3-synthesis/centralized-system-prompt-design-2026-01-10.md"
      type: "Design Specification"
    - path: "_bmad-output/planning-artifacts/architecture/adr/ADR-032-agent-chat-self-switching-orchestrator-2026-01-10.md"
      type: "Architecture Decision Record"
    - path: "_bmad-output/handoffs/PHASE-3-Synthesis-Complete-Mode-Aware-2026-01-10.md"
      type: "Phase 3 Handoff"

# ═══════════════════════════════════════════════════════════════════════════
# EPIC: EPIC-40 AGENT CHAT SELF-SWITCHING ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════════════

epics:
  EPIC-40:
    id: "EPIC-40"
    name: "Agent Chat Self-Switching Orchestrator"
    priority: "P0-CRITICAL"
    status: "PROPOSED"
    total_stories: 9
    total_effort_hours: 21
    description: "Implement centralized system prompt with context-aware mode selection and tool registry"

    stories:
      40-01:
        id: "40-01"
        name: "Create Centralized Tool Registry"
        priority: "P0"
        status: "NOT_STARTED"
        effort_hours: 3
        dependencies: []
        acceptance_criteria:
          - "IToolDefinition interface with modes, permissions, categories"
          - "CentralizedToolRegistry class with getFilteredTools()"
          - "All existing tools registered in registry"
          - "Permission filtering works correctly"
          - "Unit tests for registry operations"
        files:
          - "src/domain/tools/centralized-tool-registry.ts"
          - "src/domain/tools/tool-definition.ts"
          - "src/infrastructure/tools/tool-registry-impl.ts"

      40-02:
        id: "40-02"
        name: "Implement Mode Classifier"
        priority: "P0"
        status: "NOT_STARTED"
        effort_hours: 3
        dependencies: ["40-01"]
        acceptance_criteria:
          - "ModeClassifier analyzes 4 context sources"
          - "Workspace-based routing (notes→knowledge mode)"
          - "Prompt keyword analysis (create note→knowledge mode)"
          - "Conversation history consideration"
          - "Confidence scoring for mode selection"
        files:
          - "src/lib/agent/mode-classifier.ts"
          - "src/lib/agent/mode-classifier-types.ts"
          - "src/__tests__/agent/mode-classifier.test.ts"

      40-03:
        id: "40-03"
        name: "Update Context Threshold to 65%"
        priority: "P0"
        status: "NOT_STARTED"
        effort_hours: 1
        dependencies: []
        acceptance_criteria:
          - "DEFAULT_COMPRESSION_THRESHOLD changed from 80 to 65"
          - "Context warning triggers at 65% usage"
          - "Compression target remains at 70%"
          - "Tests verify new threshold behavior"
        files:
          - "src/infrastructure/persistence/stores/chat/slices/context-window/internal.ts"

      40-04:
        id: "40-04"
        name: "Create Note CRUD Tool Definitions"
        priority: "P0"
        status: "NOT_STARTED"
        effort_hours: 2
        dependencies: ["40-01"]
        acceptance_criteria:
          - "create_note tool with title, content, folderId"
          - "read_note tool with note id"
          - "update_note tool with note id and content"
          - "delete_note tool with note id"
          - "list_notes tool with pagination"
          - "All tools tagged with KNOWLEDGE mode"
        files:
          - "src/domain/tools/note/create-note-tool.ts"
          - "src/domain/tools/note/read-note-tool.ts"
          - "src/domain/tools/note/update-note-tool.ts"
          - "src/domain/tools/note/delete-note-tool.ts"
          - "src/domain/tools/note/list-notes-tool.ts"

      40-05:
        id: "40-05"
        name: "Wire search_notes to Tool Registry"
        priority: "P0"
        status: "NOT_STARTED"
        effort_hours: 1
        dependencies: ["40-01"]
        acceptance_criteria:
          - "search_notes registered in CentralizedToolRegistry"
          - "Tagged with KNOWLEDGE mode"
          - "Factory exports tool definition"
          - "RAG integration maintained"
        files:
          - "src/lib/agent/factory.ts"
          - "src/lib/agent/tools/search-notes-tool.ts"

      40-06:
        id: "40-06"
        name: "Update Server-Side getTools() with Registry"
        priority: "P0"
        status: "NOT_STARTED"
        effort_hours: 2
        dependencies: ["40-01", "40-04", "40-05"]
        acceptance_criteria:
          - "chat.ts getTools() uses CentralizedToolRegistry"
          - "Server exposes mode-filtered tools to LLM"
          - "Permission validation on server-side"
          - "All 5 note tools server-exposed"
          - "search_notes server-exposed"
        files:
          - "src/routes/api/chat.ts"
          - "src/routes/api/chat/user-permissions.ts"

      40-07:
        id: "40-07"
        name: "Implement Prompt Orchestrator"
        priority: "P1"
        status: "NOT_STARTED"
        effort_hours: 4
        dependencies: ["40-02"]
        acceptance_criteria:
          - "PromptOrchestrator uses ONE centralized template"
          - "Dynamic mode injection based on ModeClassifier"
          - "Tool descriptions filtered by mode"
          - "Context injection (workspace, documents, conversation)"
          - "Integration with 5-layer prompt composer"
        files:
          - "src/lib/agent/prompt-orchestrator.ts"
          - "src/lib/agent/prompt-composer.ts"

      40-08:
        id: "40-08"
        name: "Integrate Self-Switching with useAgentChatWithTools"
        priority: "P1"
        status: "NOT_STARTED"
        effort_hours: 3
        dependencies: ["40-02", "40-07"]
        acceptance_criteria:
          - "Hook calls ModeClassifier on each message"
          - "System prompt updates dynamically"
          - "Mode switching logged for observability"
          - "Smooth transitions between modes"
        files:
          - "src/lib/agent/hooks/use-agent-chat-with-tools.ts"
          - "src/lib/agent/mode-transition-logger.ts"

      40-09:
        id: "40-09"
        name: "E2E Testing for Self-Switching Agent"
        priority: "P1"
        status: "NOT_STARTED"
        effort_hours: 2
        dependencies: ["40-06", "40-07", "40-08"]
        acceptance_criteria:
          - "Test: 'Create a note' → knowledge mode selected"
          - "Test: 'Fix this bug' → coding mode selected"
          - "Test: 'Summarize my notes' → knowledge mode selected"
          - "Test: Mode switches during conversation"
          - "All note tools work via agent"
          - "search_notes returns relevant results"
        files:
          - "src/__tests__/e2e/agent-self-switching.test.ts"
          - "src/__tests__/e2e/note-tools-agent.test.ts"

# ═══════════════════════════════════════════════════════════════════════════
# PROGRESS METRICS
# ═══════════════════════════════════════════════════════════════════════════

metrics:
  total_stories: 9
  stories_not_started: 9
  stories_in_progress: 0
  stories_done: 0
  stories_blocked: 0

  total_effort_hours: 21
  effort_completed: 0
  effort_remaining: 21

  completion_percentage: 0

  last_updated: "2026-01-10T10:00:00+07:00"

# ═══════════════════════════════════════════════════════════════════════════
# PRIORITY QUEUE (Execution Order)
# ═══════════════════════════════════════════════════════════════════════════

priority_queue:
  # Team A Sequential Execution Order (no parallel tracks)

  # Phase 1: Foundation
  - story_id: "40-01"
    reason: "Tool registry is foundation for all other work"
    phase: "Foundation"

  - story_id: "40-03"
    reason: "Quick win, no dependencies (can run parallel with 40-01)"
    phase: "Foundation"

  # Phase 2: Registry & Classifier
  - story_id: "40-02"
    reason: "Mode classifier needs registry structure"
    phase: "Registry Integration"
    depends_on: "40-01"

  - story_id: "40-04"
    reason: "Note tools need registry"
    phase: "Registry Integration"
    depends_on: "40-01"

  - story_id: "40-05"
    reason: "Wire search_notes to registry"
    phase: "Registry Integration"
    depends_on: "40-01"

  # Phase 3: Server Integration
  - story_id: "40-06"
    reason: "Server integration needs all tools registered"
    phase: "Server Integration"
    depends_on: ["40-01", "40-04", "40-05"]

  - story_id: "40-07"
    reason: "Orchestrator needs classifier"
    phase: "Server Integration"
    depends_on: "40-02"

  # Phase 4: Final Integration & Testing
  - story_id: "40-08"
    reason: "Hook integration needs orchestrator and classifier"
    phase: "Testing & Validation"
    depends_on: ["40-02", "40-07"]

  - story_id: "40-09"
    reason: "E2E testing needs all implementation complete"
    phase: "Testing & Validation"
    depends_on: ["40-06", "40-07", "40-08"]

# ═══════════════════════════════════════════════════════════════════════════
# GATE CRITERIA
# ═══════════════════════════════════════════════════════════════════════════

gate_criteria:
  agent_self_switching:
    description: "Agent automatically switches modes based on context"
    criteria:
      - "Mode classifier analyzes prompt, workspace, documents, conversation"
      - "Coding tasks trigger CODING mode"
      - "Note tasks trigger KNOWLEDGE mode"
      - "Complex tasks trigger ORCHESTRATOR mode"
      - "Mode transitions logged and observable"
    status: PENDING

  tool_registry:
    description: "Centralized tool registry manages all tools"
    criteria:
      - "All tools registered in CentralizedToolRegistry"
      - "Tools filtered by mode, workspace, permissions"
      - "Server exposes filtered tools to LLM"
      - "Client tools and server tools in sync"
    status: PENDING

  note_tools:
    description: "All 5 note CRUD tools work via agent"
    criteria:
      - "create_note: Agent creates note with title/content"
      - "read_note: Agent reads note content"
      - "update_note: Agent updates existing note"
      - "delete_note: Agent deletes note"
      - "list_notes: Agent lists notes with pagination"
      - "search_notes: Agent searches notes with RAG"
    status: PENDING

  context_threshold:
    description: "Context compression at 65% threshold"
    criteria:
      - "DEFAULT_COMPRESSION_THRESHOLD = 65"
      - "Warning triggered at 65% context usage"
      - "Compression target at 70% of max tokens"
      - "Tests verify threshold behavior"
    status: PENDING

  user_journeys:
    description: "End-to-end user journeys work"
    criteria:
      - "J1: 'Create a note about TypeScript' → Agent creates note"
      - "J2: 'What are my notes about AI?' → Agent searches notes"
      - "J3: 'Fix this bug in utils.ts' → Agent reads, fixes file"
      - "J4: 'Summarize this project' → Agent reads files, summarizes"
      - "J5: Mode switches during conversation (file→note→file)"
    status: PENDING

# ═══════════════════════════════════════════════════════════════════════════
# IMPLEMENTATION TRACKS
# ═══════════════════════════════════════════════════════════════════════════

tracks:
  foundation:
    name: "Foundation"
    stories: ["40-01", "40-03"]
    can_parallel: true  # These two can run in parallel
    estimated_hours: 4

  registry_integration:
    name: "Registry Integration"
    stories: ["40-02", "40-04", "40-05"]
    depends_on: "foundation"
    estimated_hours: 8

  server_integration:
    name: "Server Integration"
    stories: ["40-06", "40-07"]
    depends_on: "registry_integration"
    estimated_hours: 6

  testing_validation:
    name: "Testing & Validation"
    stories: ["40-08", "40-09"]
    depends_on: "server_integration"
    estimated_hours: 5

# ═══════════════════════════════════════════════════════════════════════════
# SUCCESS CRITERIA
# ═══════════════════════════════════════════════════════════════════════════

success_criteria:
  must_have:
    - "Centralized tool registry operational"
    - "Mode classifier analyzes 4 context sources"
    - "All 5 note CRUD tools implemented"
    - "search_notes wired and working via agent"
    - "Server exposes mode-filtered tools to LLM"
    - "Context threshold at 65%"
    - "E2E tests passing"

  should_have:
    - "Prompt orchestrator with dynamic mode injection"
    - "Self-switching agent operational"
    - "Mode transitions observable"
    - "Tool usage analytics"

  nice_to_have:
    - "Voice tools exposed (KNOWLEDGE mode)"
    - "Research tools server-exposed"
    - "Custom mode configuration per user"
