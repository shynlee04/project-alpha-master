# COMPREHENSIVE ARCHITECTURE REFINEMENT PLAN (2025-12-31)

## 1. Executive Summary
Transform BMAD platform into a cohesive, maintainable system with 100% refactoring coverage.

## 2. Architectural Foundation
### 2.1 Layer Architecture (The 5-Layer Stack)
- **L5 Presentation**: UI/UX (AgentSelector, ChatPanel). No business logic.
- **L4 Application**: Services (ChatService, ContextManager). Cross-workspace.
- **L3 Domain**: Agent Vault. Pure business logic.
- **L2 Provider**: LLM Connectivity.
- **L1 Infrastructure**: Persistence (Dexie), Encryption (Vault), Events.

### 2.2 Cross-Workspace Communication
- **Intra**: Zustand Stores.
- **Inter**: Event Bus (`store-events.ts`).
- **Shared**: Hooks/Utils (`useAgent`, `useChat`).

## 3. Core Configuration Systems
### 3.1 LLM Provider (Step 02)
- Hardcoded BaseURLs for built-ins.
- Custom Provider support (OpenAI-compatible).
- Reactive Key persistence -> Model Auto-load.

### 3.2 Agent Configuration (Step 03)
- Persistent Hotload.
- Conditional Tool Access (per workspace).
- Workspace Bindings (IDE, Knowledge, Study, Notes).

## 4. Conversation & Thread Management (Step 04)
- Unified Chat Flow.
- Thread/Branching support.
- Context Window Management (Token counting).

## 5. Brownfield Integration (Step 07)
- **Project Management**: FileTree sync to Knowledge.
- **Monaco/Notes**: Unified editor experience.
- **WebContainer/Terminal**: Context-aware integration.

## 6. Database & State (Step 05)
- **Schema**: Dexie tables (providers, agents, conversations, etc.).
- **Zustand**: Reorganized stores (`stores/core`, `stores/agent`, etc.).

## 7. Clean Architecture (Step 08)
- File limits (< 300 lines).
- No "God Classes".
- Strict Module boundaries.

## 8. UX/UI Enhancement
- Unified Design System.
- Consistent Configuration Flows.

## 9. Deliverables
- Architecture Diagram.
- Schema Definitions.
- API Contracts.
- Validation Criteria.
