# Shard 6: Requirements & User Stories - Master Index

**Shard ID**: ARCH-SHARD-06
**Parent**: ARCH-REMEDIATION-INDEX-2026-01-14
**Status**: MASTER INDEX - References Detailed Stories

---

## User Stories by Feature Group

### BYOK Vault System (Detailed: shard-03-01-byok.md)

| ID | Name | Priority | Acceptance Criteria | Technical Reqs |
|----|------|----------|---------------------|----------------|
| BYOK-01 | Secure Key Storage | P0 | 5 AC | 3 TR + 4 EC + 4 CU + 4 NFR + 4 Tests |
| BYOK-02 | Provider Key Management | P0 | 5 AC | 3 TR + 4 EC + 3 CU + 3 NFR + 4 Tests |
| BYOK-03 | BYOK + Project Space Integration | P1 | 4 AC | 3 TR + 3 EC + 3 CU + 3 NFR + 3 Tests |
| BYOK-04 | Key Security & Audit | P2 | 4 AC | 3 TR + 3 EC + 3 CU + 4 NFR + 4 Tests |

### Project Space Boundaries (Detailed: shard-03-02-project-space.md)

| ID | Name | Priority | Acceptance Criteria | Technical Reqs |
|----|------|----------|---------------------|----------------|
| PS-01 | Desktop File System Access | P0 | 6 AC | 4 TR + 6 EC + 3 CU + 4 NFR + 4 Tests |
| PS-02 | Browser Database Fallback | P0 | 5 AC | 4 TR + 5 EC + 3 CU + 4 NFR + 4 Tests |
| PS-03 | Unified Storage Abstraction | P0 | 6 AC | 5 TR + 4 EC + 3 CU + 4 NFR + 4 Tests |
| PS-04 | Desktop ↔ Browser Sync | P1 | 5 AC | 4 TR + 4 EC + 3 CU + 4 NFR + 4 Tests |
| PS-05 | Project Space Routing | P0 | 5 AC | 3 TR + 4 EC + 3 CU + 3 NFR + 3 Tests |

### Agent/LLM Orchestration (Detailed: shard-03-03-agent-llm.md)

| ID | Name | Priority | Acceptance Criteria | Technical Reqs |
|----|------|----------|---------------------|----------------|
| AGENT-01 | Mode-Based Agent Behavior | P0 | 6 AC | 4 TR + 4 EC + 3 CU + 3 NFR + 3 Tests |
| AGENT-02 | Tool Execution with Permissions | P0 | 5 AC | 4 TR + 4 EC + 3 CU + 3 NFR + 4 Tests |
| AGENT-03 | RAG-Powered Context | P0 | 5 AC | 4 TR + 5 EC + 3 CU + 4 NFR + 4 Tests |
| AGENT-04 | Multimodal Input/Output | P1 | 5 AC | 4 TR + 4 EC + 3 CU + 4 NFR + 4 Tests |
| AGENT-05 | Tool Error Handling & Retry | P1 | 5 AC | 4 TR + 4 EC + 3 CU + 4 NFR + 4 Tests |

### Cascade Chat Flow (Detailed: shard-03-04-chat-flow.md)

| ID | Name | Priority | Acceptance Criteria | Technical Reqs |
|----|------|----------|---------------------|----------------|
| CHAT-01 | Conversation Auto-Creation | P0 | 5 AC | 4 TR + 4 EC + 3 CU + 3 NFR + 3 Tests |
| CHAT-02 | Thread Management | P0 | 6 AC | 4 TR + 4 EC + 3 CU + 3 NFR + 3 Tests |
| CHAT-03 | Message History & Search | P1 | 6 AC | 4 TR + 4 EC + 3 CU + 3 NFR + 4 Tests |
| CHAT-04 | Context Window Management | P1 | 5 AC | 4 TR + 4 EC + 3 CU + 3 NFR + 4 Tests |
| CHAT-05 | Tool Execution in Chat | P0 | 5 AC | 4 TR + 4 EC + 3 CU + 3 NFR + 3 Tests |

---

## Story Template Used

Each story includes:
- **User Story**: As a... I want... So that...
- **Priority**: P0/P1/P2
- **Estimation**: Days/hours
- **Acceptance Criteria**: 4-6 checkboxes
- **Technical Requirements**: 3-5 implementation details
- **Edge Cases**: 3-6 scenarios
- **Combined Uses**: 2-3 multi-feature scenarios
- **Non-Functional Requirements**: 3-4 performance metrics
- **Tests Required**: 3-4 test types

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Stories | 17 |
| P0 Stories | 10 |
| P1 Stories | 6 |
| P2 Stories | 1 |
| Deferred to Phase 3 | 2 |
| Total Acceptance Criteria | ~80 |
| Total Technical Requirements | ~65 |
| Total Edge Cases | ~60 |

---

*Back to [ARCH-INDEX.md](./ARCH-INDEX.md)*
*Next: [Shard 07 - File Change Manifest](./shard-07-file-change-manifest.md)*
