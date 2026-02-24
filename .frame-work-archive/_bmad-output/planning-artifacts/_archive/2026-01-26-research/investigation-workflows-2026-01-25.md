# Investigation Workflow Proposals

**Created**: 2026-01-25
**Author**: architect-ext
**Purpose**: Define structured investigation frameworks for bmad-master coordination

---

## Overview

These investigation workflows are designed to be executed by specialized agents under bmad-master coordination. Each investigation produces a report that informs remediation decisions.

---

## Investigation A: TypeScript Debt Mapping

### Objective
Systematically scan all TypeScript errors, categorize by domain, and prioritize by user-journey impact.

### Workflow Steps

```yaml
investigation_a:
  id: "INV-TS-MAPPING"
  name: "TypeScript Debt Mapping"
  agent: "analyst-ext OR dev-ext (read-only)"
  duration: "1-2 hours"
  
  steps:
    - step: 1
      action: "Run pnpm tsc --noEmit 2>&1 > ts-errors.txt"
      output: "ts-errors.txt"
      
    - step: 2
      action: "Parse errors by file path"
      categorization:
        - domain: "agent"
          pattern: "src/lib/agent/**"
        - domain: "notes"
          pattern: "src/lib/notes/**"
        - domain: "plugins"
          pattern: "src/plugins/**"
        - domain: "presentation"
          pattern: "src/presentation/**"
        - domain: "infrastructure"
          pattern: "src/infrastructure/**"
          
    - step: 3
      action: "Map errors to user journeys"
      journeys:
        - "Create project → Use notes → Chat with AI"
        - "Open project → Edit code in IDE → Run terminal"
        - "Import knowledge → Study flashcards"
        
    - step: 4
      action: "Prioritize by journey impact"
      priority_rules:
        P0: "Blocks core journey (notes, chat)"
        P1: "Degrades experience"
        P2: "No user impact (lint, unused)"
        
  output:
    artifact: "_bmad-output/investigation-reports/INV-TS-MAPPING-2026-01-25.md"
    format:
      - Error inventory by domain
      - User journey impact matrix
      - Prioritized remediation backlog
```

---

## Investigation B: ADR Dependency Validation

### Objective
Map all ADR references in codebase and identify code depending on superseded ADRs.

### Workflow Steps

```yaml
investigation_b:
  id: "INV-ADR-DEPS"
  name: "ADR Dependency Validation"
  agent: "analyst-ext"
  duration: "30-60 minutes"
  
  steps:
    - step: 1
      action: "Grep for ADR references in codebase"
      patterns:
        - "ADR-033"
        - "ADR-034"
        - "ADR-035"
        - "ADR-036"
        - "workspace-centric"
        - "project-centric"
        
    - step: 2
      action: "Identify code patterns from superseded ADRs"
      patterns:
        - "workspace: 'ide' | 'notes' | 'knowledge'"  # Old pattern
        - "getWorkspaceType()"  # Old pattern
        - "WorkspaceContext"  # Old pattern
        
    - step: 3
      action: "Map to ADR-034 equivalents"
      migrations:
        workspace_to_plugin: "WorkspaceContext → PluginContext"
        workspace_type: "getWorkspaceType() → getActivePlugin()"
        
    - step: 4
      action: "Create migration path"
      
  output:
    artifact: "_bmad-output/investigation-reports/INV-ADR-DEPS-2026-01-25.md"
    format:
      - ADR reference inventory
      - Superseded pattern locations
      - Migration path per pattern
```

---

## Investigation C: E2E User Journey Testing

### Objective
Define and test 5 critical user journeys across all device types.

### Workflow Steps

```yaml
investigation_c:
  id: "INV-E2E-JOURNEYS"
  name: "E2E User Journey Testing"
  agent: "real-world-validator"
  duration: "2-3 hours"
  
  tool_constraints:
    write: true  # Reports only
    edit: false  # NO code modifications
    bash: true   # Browser automation
    task: true   # Can delegate
    
  journeys:
    - journey: "J1-PROJECT-CREATE"
      description: "Create new project with FSA folder"
      devices: ["desktop-chrome", "desktop-firefox"]
      steps:
        - "Click 'New Project'"
        - "Select folder via FSA picker"
        - "Configure project settings"
        - "Verify project appears in sidebar"
        
    - journey: "J2-NOTES-CRUD"
      description: "Create, edit, save, delete note"
      devices: ["desktop-fsa", "desktop-indexeddb", "tablet", "mobile"]
      steps:
        - "Open project"
        - "Create new note"
        - "Add content with BlockNote"
        - "Save and verify persistence"
        - "Delete note"
        
    - journey: "J3-CHAT-AI"
      description: "Chat with AI agent"
      devices: ["desktop", "mobile"]
      steps:
        - "Open chat panel"
        - "Send message"
        - "Receive AI response"
        - "Verify tool calls work"
        
    - journey: "J4-IDE-EDIT"
      description: "Edit code in Monaco"
      devices: ["desktop-fsa"]  # Desktop only
      steps:
        - "Open file tree"
        - "Select file"
        - "Edit in Monaco"
        - "Save changes"
        - "Verify persistence"
        
    - journey: "J5-PLUGIN-SWITCH"
      description: "Switch between plugins"
      devices: ["desktop", "tablet", "mobile"]
      steps:
        - "Start with FileTree visible"
        - "Switch to Notes plugin"
        - "Switch to Chat plugin"
        - "Verify state preserved"
        
  output:
    artifact: "_bmad-output/investigation-reports/INV-E2E-JOURNEYS-2026-01-25.md"
    format:
      - Journey test results (pass/fail/partial)
      - Screenshots of failures
      - Device-specific issues
      - Remediation recommendations
```

---

## Investigation D: Plugin Integration Audit

### Objective
Verify all 5 plugins work correctly in PluginLayout.

### Workflow Steps

```yaml
investigation_d:
  id: "INV-PLUGIN-AUDIT"
  name: "Plugin Integration Audit"
  agent: "real-world-validator"
  duration: "1-2 hours"
  
  plugins:
    - plugin: "FileTree"
      file: "src/plugins/filetree/FileTreePlugin.tsx"
      tests:
        - "Renders in sidebar"
        - "Expands/collapses folders"
        - "Opens files"
        
    - plugin: "Monaco"
      file: "src/plugins/monaco/MonacoPlugin.tsx"
      tests:
        - "Renders in main panel"
        - "Opens selected file"
        - "Saves changes"
        
    - plugin: "Notes"
      file: "src/plugins/notes/NotesPlugin.tsx"
      tests:
        - "Lists notes"
        - "Opens BlockNote editor"
        - "Saves changes"
        
    - plugin: "Terminal"
      file: "src/plugins/terminal/TerminalPlugin.tsx"
      tests:
        - "Renders xterm"
        - "Accepts input"
        - "Shows output"
        
    - plugin: "Chat"
      file: "src/plugins/chat/ChatPlugin.tsx"
      tests:
        - "Shows thread list"
        - "Opens conversation"
        - "Sends messages"
        
  integration_tests:
    - "Plugin switching preserves state"
    - "Plugin reordering works"
    - "Plugin persistence across reload"
    - "Mobile bottom nav shows plugins"
    
  output:
    artifact: "_bmad-output/investigation-reports/INV-PLUGIN-AUDIT-2026-01-25.md"
    format:
      - Plugin test results matrix
      - Integration test results
      - Issues found with severity
      - Remediation backlog
```

---

## Execution Priority

| Investigation | Priority | Depends On | Duration |
|---------------|----------|------------|----------|
| A: TS Mapping | P1 | None | 1-2h |
| B: ADR Deps | P2 | None | 30-60m |
| C: E2E Journeys | P0 | App running | 2-3h |
| D: Plugin Audit | P1 | ARCH-03-06 done | 1-2h |

---

## Coordination Notes

1. **Investigation A & B** can run in parallel (both read-only)
2. **Investigation C & D** require running application
3. **All investigations** produce artifacts for sprint planning
4. **bmad-master** should queue these after EPIC-CTX-CLEAN completes

---

## Output Summary

Each investigation produces:
1. **Report artifact** in `_bmad-output/investigation-reports/`
2. **Remediation backlog** items for sprint planning
3. **Evidence** (screenshots, logs) for verification

These feed into sprint planning for next development cycle.
