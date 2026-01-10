
## 1. Primary Directive

Execute comprehensive, end-to-end validation of the entire codebase to ensure 100% functionality across all system components. Move beyond superficial story completion by conducting deep cross-architectural analysis that identifies gaps, flaws, technical debt, and code smells. Aggressively validate all code, artifacts, controlled documents, and test suites through iterative testing cycles until the system achieves flawless operation.

## 2. Validation Scope

### 2.1 Epics Under Review

**Completed Epics (Re-verification):**
- **EPIC 6:** Verify full implementation and integration status
- **EPIC 7:** Review deferred tasks and continue development where applicable
- **EPIC 8:** Validate completed implementation against documented requirements
- **EPIC 9:** Confirm end-to-end integration and user journey mapping
- **EPIC 10 (Partial):** Validate implemented portions and identify remaining gaps

**New Epics Requiring Integration:**
- **EPIC 24:** Verify integration, end-to-end flows, component wiring, data mapping, and routing
- **EPIC 26:** Validate complete implementation and integration
- **EPIC 27:** Verify correct integration across all architectural dimensions

### 2.2 Validation Requirements

For every story within scope, execute the following checks:

1. **Existence Check:** Verify implementation exists in the codebase
2. **Compliance Check:** Compare implementation against documented requirements
3. **Specification Match:** Ensure code files align with story specifications
4. **Gap Analysis:** Identify missing or incomplete implementations
5. **Documentation Integrity:** Ensure alignment with BMAD documentation system

### 2.3 Integration Checkpoints

Validate the following integration points:
- **End-to-End Flow:** Verify data flow from input to output across all layers
- **Component Wiring:** Confirm all components are properly connected and communicate
- **Data Mapping:** Validate transformation between architectural layers
- **Requirements Coverage:** Ensure all documented requirements are met
- **User Journey Routing:** Confirm accurate routing to use cases
- **Cross-Architecture Dependencies:** Verify interdependencies are correctly handled

## 3. Success Criteria

### 3.1 Quality Standards

- **Zero Errors:** No runtime errors, build failures, linting issues, or type errors permitted
- **Zero Debt:** All technical debt identified, documented, and addressed
- **Zero Smells:** Code smells detected and refactored following established patterns

### 3.2 Coverage Requirements

All system components must function flawlessly:
- All routes (API and UI)
- All CRUD operations
- All API mappings
- All database interactions
- All RAG retrievals
- All storage mechanisms
- All state persistence logic

### 3.3 Integration Requirements

- **No Orphaned Components:** Every component must be wired and traced to user stories
- **Full Traceability:** All deferred stories must be implemented or formally resolved
- **Document Alignment:** All epics, stories, retrospectives, and workflow statuses must align with `prd.md` `epic.md`

## 4. Technical Context

### 4.1 Core Architecture

- **Framework:** BMAD (Build-Measure-Learn-Adapt-Do)
- **Environment:** Client-side application with local-first capabilities
- **Workspace/IDE Sync:** Syncs with local folders via EventBus and SyncManager
- **Database:** IndexedDB using DexieDB
- **State Management:** Zustand
- **Permissions:** Local drive access management

### 4.2 Knowledge Synthesis Workspace

Critical feature set requiring logical wiring across architectural slices:

- **Core Features:** Notion-like smart note-taking, synthesis hub with RAG, agent chat, smart canvas
- **Smart Study Space:** Integrates study, knowledge, and note-taking features
- **Agent Capabilities:** Must support multimodality (text, image, audio, video input/output)
- **RAG Requirements:** Embeddings, chunking, and retrieval functionality
- **Tech Stack:** Tanstack AI SDK with Google Gemini expanded pack
- **Embedding Strategy:** Use local embeddings with Gemini as fallback mechanism

### 4.3 Platform Considerations

- **Responsive Design:** Application behaves differently on Desktop vs. Mobile
- **Platform-Specific Validation:** Research and validate platform-specific implementations before integration
- **Cross-Platform Consistency:** Ensure feature parity across all supported platforms

## 5. Technical Directives & Standards

### 5.1 Code Quality Standards

- **File Size Limit:** Maximum 300 lines per file; split immediately if exceeded
- **Function Boundaries:** Split files containing more than 3 functions or exhibiting "God Class" behavior
- **Refactoring Protocol:** Refactoring must not break the system; update all imports and exports globally across related components

### 5.2 Component Management

- **Orphaned Components:** Do not delete. Trace to origin, wire to appropriate feature slice, and ensure contribution to requirements
- **Unimplemented Stories:** Implement immediately. If course-correction creates new epics, update documentation and create development loops

### 5.3 Self-Detection Requirements

Automatically identify:
- Missing steps in implementation
- Gaps in user journeys
- Missing imports or broken references
- Build failures
- Lint errors
- Superficial implementations (especially for agents, RAG, and multimodal features)

### 5.4 Integrity Validation

- **API Contracts:** Verify contract adherence
- **Schema Synchronization:** Ensure data schemas are synchronized
- **Schema Validation:** Validate against business requirements
- **Business Logic:** Verify correct implementation of business rules
- **Data Flow:** Validate end-to-end data transformation

## 6. Implementation Requirements

### 6.1 Frontend Requirements

- **Routing:** All UI components properly routed and rendered without error
- **Styling:** Strict adherence to the 8-bit dark theme
- **Accessibility:** Verify contrast ratios against the dark theme
- **Responsiveness:** Validate behavior on both Desktop and Mobile platforms

### 6.2 Backend & API Requirements

- **Integration:** API endpoints fully integrated with frontend
- **Data Flow:** Validate end-to-end flow and cross-service dependencies

### 6.3 Installation & Dependencies

- Identify and install missing dependencies
- Validate all configuration files
- Ensure dependency tree is complete and conflict-free

## 7. Workflow Procedures

### 7.1 Primary Validation Loop

1. Initialize validation at `@_bmad-output/validation/sweeping-validation.md`
2. Utilize `/ado-research` MCP servers for comprehensive checks
3. Apply `*correct-course` workflow upon identifying issues
4. Iterate through `@.kilocode/workflows/story-dev-cycle.md` for every identified issue
5. Repeat loop until all issues are resolved

### 7.2 Course-Correction Protocol

When integration issues or missing implementations are detected:

1. Apply BMAD framework's course-correction workflow
2. Follow development-cycle workflows for remediation
3. Document all corrections in appropriate sprint artifacts
4. Re-validate after every correction cycle

### 7.3 Gatekeeping Strategy

Set validation gates at:
- Epic boundary checkpoints
- Integration handoffs between components
- Data transformation points
- User journey transition points

## 8. Reference Documentation

### 8.1 Sprint Artifacts

**Retrospectives:**
- `epic-1-retro-2025-12-28.md`, `epic-1-retrospective.md`
- `EPIC-2-RETRO.md`, `epic-2-retrospective.md`
- `epic-3-code-review.md`, `epic-3-retrospective.md`
- `epic-4-retrospective.md`, `epic-5-retrospective.md`
- `epic-6-retrospective-2025-12-30.md`, `epic-6-retrospective.md`
- `epic-9-retrospective.md`, `epic-10-retrospective.md`
- `epic-13-retrospective.md`, `epic-22-retrospective.md`
- `epic-25-retrospective.md`
- `epic-AI-25-retro-phase-1.md`

**Implementation Plans & Research:**
- `epic-25-11-06-research-analysis-request.md`
- `epic-25-12-06-multilingual-ai-agent-support.md`
- `epic-25-12-06-openaicompatible-support.md`
- `epic-25-12-28-master-implementation-plan.md`
- `epic-25-12-28-readiness-analysis.md`
- `homepage-layout-redesign-sprint-plan-2025-12-27.md`
- `refinement-sprint-knowledge-hub-2025-12-30.md`

**MVP & Agent Documentation:**
- `epic-MVP-ai-agent.md`
- `mvp-1-agent-configuration.md`
- `MVP-1-E2E-agent-config-verification.md`
- `mvp-2-chat-interface-streaming.md`
- `MVP-2-E2E-chat-interface-verification.md`
- `mvp-3-tool-execution-files-implementation-2025-12-25.md`
- `mvp-3-tool-execution-files.md`
- `mvp-4-tool-execution-terminal.md`

**Validation & Risk:**
- `MVP-E2E-verification-checklist-2025-12-27.md`
- `mvp-risk-register-2025-12-24.md`
- `mvp-sprint-plan-2025-12-24.md`
- `mvp-story-validation-2025-12-24.md`
- `p0-governance-fixes-2025-12-26.md`
- `production-readiness-epic-13-report.md`
- `ralph-loop-revalidation-2025-12-29.md`
- `rc-001-hook-violation-fix-2025-12-29.md`
- `rc-002-file-size-validation-2025-12-29.md`

**Mobile Adaptation:**
- `MRT-4-filetree-mobile-adaptation.md`
- `MRT-5-monaco-mobile-optimization.md`

**Audit & Status:**
- `epics-and-stories-completion-audit-2025-12-22.md`
- `refactored-sprint-plan-2025-12-27.md`
- `sprint-status.yaml`

### 8.2 Project Planning Documentation

- `architecture-enhanced-2025-12-29.md`
- `architecture.md`
- `epics-enhanced-2025-12-29.md`
- `prd-enhanced-2025-12-29.md`
- `prd.md`
- `project-context.md`
- `ux-design-specification-enhanced-2025-12-29.md`
- `ux-design-specification.md`

### 8.3 Rules & Workflows

- `@.claude/rules/general-rules.md`
- `@_bmad-output/validation/sweeping-validation.md`
- `@.kilocode/workflows/story-dev-cycle.md`

## 9. End Condition

The validation process is complete only when all conditions are satisfied:

1. All scoped stories are implemented and validated
2. All integration points function correctly
3. Frontend routing and UI components are fully implemented
4. Backend integration is verified
5. Cross-architecture dependencies are resolved
6. UX/UI requirements are satisfied for Desktop and Mobile
7. The 8-bit dark theme is consistent with proper contrast
8. `sprint-status.yaml` and `workflow-status` files are updated

**Note:** Focus validation efforts strictly on artifacts with corresponding code implementations in the codebase.