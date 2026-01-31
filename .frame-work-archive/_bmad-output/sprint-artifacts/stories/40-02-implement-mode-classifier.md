---
story_key: "40-02-implement-mode-classifier"
epic: 40
story: 2
status: "DONE"
created_at: "2026-01-10T12:46:00+07:00"
points: 3
---

# Story 40-02: Implement Mode Classifier

## User Story

**As a** system architect
**I want** a Mode Classifier that analyzes context and selects appropriate agent mode
**So that** the agent automatically switches between coding, knowledge, and orchestrator modes

## Acceptance Criteria

### AC-1: Context Source Analysis
**Given** multiple context sources available
**When** I invoke ModeClassifier.classify()
**Then** it should analyze 4 sources: prompt text, workspace type, active documents, conversation history

### AC-2: Workspace-Based Routing
**Given** the user is in a notes workspace
**When** I classify the mode
**Then** it should route to 'knowledge' mode with higher confidence

### AC-3: Prompt Keyword Analysis
**Given** a prompt containing keywords like "create note", "search notes", "summarize"
**When** I analyze the prompt
**Then** it should bias toward 'knowledge' mode

### AC-4: Conversation History Consideration
**Given** previous conversation context
**When** I classify the current mode
**Then** it should consider recent mode selections for consistency

### AC-5: Confidence Scoring
**Given** multiple mode signals
**When** I calculate the final mode
**Then** it should return a confidence score (0-1) indicating selection certainty

## Tasks

- [x] T1: Create mode-classifier-types.ts with AgentMode, ContextSources, ClassificationResult
- [x] T2: Implement ModeClassifier class in mode-classifier.ts
- [x] T3: Add workspace-based routing logic (notes→knowledge, code→coding)
- [x] T4: Add prompt keyword analysis for mode hints
- [x] T5: Add conversation history consideration
- [x] T6: Add confidence scoring algorithm
- [x] T7: Write unit tests for all classification paths
- [x] T8: Verify TypeScript compilation

## Research Requirements

### Required MCP Research
- [x] Context7: TanStack AI agent mode patterns
- [x] Codebase: Existing mode usage

### Architecture Patterns to Follow
- Pattern: Strategy Pattern for mode analysis
- Rationale: Each context source (workspace, prompt, document, conversation) contributes independently to final classification

## Dev Notes

### Dependencies
- Story 40-01 (Tool Registry) - DONE ✅
- AgentMode type from src/domain/tools/tool-definition.ts

### Integration Points
- Touches: src/lib/agent/hooks/use-agent-chat-with-tools.ts (will use classifier)
- Touches: src/presentation/components/agent/UnifiedAgentSelector.tsx (mode display)
- Breaks: None (additive change)

### Files Created
- src/lib/agent/mode-classifier-types.ts (125 lines) - Type definitions
- src/lib/agent/mode-classifier.ts (465 lines) - Classifier implementation
- src/lib/agent/__tests__/mode-classifier.test.ts (336 lines) - Unit tests

### Implementation Summary

**TanStack AI Pattern Applied:**
- Adapter Map pattern adapted for mode classification
- Each context source acts as a "strategy" contributing signals
- Weighted signal aggregation similar to `combineStrategies()`

**Keyword Analysis:**
- Multi-word keywords are split and checked for all words (order-independent)
- Example: "fix bug" matches "fix this bug in my code" (both words present)
- Single-word keywords use direct substring matching

**Workspace Routing:**
- notes → knowledge (weight 0.7)
- knowledge → knowledge (weight 0.7)
- ide → coding (weight 0.7)
- code → coding (weight 0.7)
- unknown → orchestrator (default)

**Document Analysis:**
- Code extensions (.ts, .tsx, .js, .py, etc.) → coding mode
- Knowledge extensions (.md, .txt, .pdf, etc.) → knowledge mode
- Unknown → default mode

**Confidence Scoring:**
- 0.85+: High confidence (keyword match ≥0.6)
- 0.7-0.85: Medium confidence (multiple aligned signals)
- 0.5-0.7: Low confidence (mixed signals)
- <0.5: Falls back to default mode (orchestrator)

## Tests Created (36 tests - all passing)

### Workspace Analysis (5 tests)
- should route notes workspace to knowledge mode
- should route knowledge workspace to knowledge mode
- should route ide workspace to coding mode
- should route code workspace to coding mode
- should use default mode for unknown workspace

### Prompt Keyword Analysis (7 tests)
- should detect knowledge mode from "create note" keyword
- should detect knowledge mode from "search notes" keyword
- should detect knowledge mode from "summarize" keyword
- should detect coding mode from "fix bug" keyword
- should detect coding mode from "implement" keyword
- should detect coding mode from "npm install" command
- should detect orchestrator mode from "plan" keyword

### Document Analysis (4 tests)
- should detect coding mode from .ts file extension
- should detect coding mode from .py file extension
- should detect knowledge mode from .md file extension
- should detect knowledge mode from .pdf file extension

### Conversation History Analysis (3 tests)
- should consider recent mode selections
- should favor most common recent mode
- should handle empty conversation history

### Confidence Scoring (4 tests)
- should return high confidence for single dominant signal
- should return medium confidence for aligned signals
- should return lower confidence for mixed signals
- should include confidence in classification result

### Signal Aggregation (2 tests)
- should include all context sources in signals
- should provide reasoning for each signal

### Singleton (2 tests)
- should return same instance on subsequent calls
- should create new instance when config provided

### Quick Classification (1 test)
- should classify mode using singleton

### Configuration (5 tests)
- should allow custom default mode
- should allow custom min confidence
- should allow custom keyword patterns
- should update config dynamically
- should return current config

### Edge Cases (3 tests)
- should handle empty context
- should handle null active document
- should handle undefined workspace type

## References

- Epic: `_bmad-output/sprint-artifacts/epic-40-agent-chat-remediation-sprint-2026-01-10.md`
- Architecture: `_bmad-output/planning-artifacts/architecture/adr/ADR-032-agent-chat-self-switching-orchestrator-2026-01-10.md`
- Design: `_bmad-output/phase3-synthesis/centralized-system-prompt-design-2026-01-10.md`
- Related Stories: 40-01 (Tool Registry - DONE), 40-03 (Context Threshold - DONE), 40-07 (Prompt Orchestrator)

## Code Review

**Reviewed At:** 2026-01-10T05:52:00+07:00
**Result:** ✅ PASS (self-review)

### Tests Passed
- Total: 36 tests
- Passing: 36 (100%)

### TypeScript Verification
- No new errors in Story 40-02 files

### Acceptance Criteria Status
| AC | Status | Notes |
|----|--------|-------|
| AC-1: Context Source Analysis | ✅ PASS | Analyzes 4 sources: workspace, prompt, document, conversation |
| AC-2: Workspace-Based Routing | ✅ PASS | 5 tests covering all workspace types |
| AC-3: Prompt Keyword Analysis | ✅ PASS | 7 tests with order-independent multi-word matching |
| AC-4: Conversation History | ✅ PASS | 3 tests including empty history |
| AC-5: Confidence Scoring | ✅ PASS | 4 tests with fallback to default when <0.5 |

## Status History

| Status | Timestamp | Agent | Notes |
|--------|-----------|-------|-------|
| backlog | 2026-01-10T10:00:00+07:00 | SM | Created from EPIC-40 remediation |
| drafted | 2026-01-10T12:46:00+07:00 | SM | Story file created |
| implementation-complete | 2026-01-10T05:52:00+07:00 | Dev | 3 files created, 36 tests passing |
| DONE | 2026-01-10T05:52:00+07:00 | Dev | All AC met, story complete |
