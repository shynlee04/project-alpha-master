# Tech-Spec: MVP Completion - Agentic Coding Vertical Slice

**Created:** 2025-12-27T08:00:00+07:00  
**Status:** Ready for Development  
**Document ID:** `tech-spec-mvp-completion-2025-12-27.md`  
**Research Source:** `_bmad-output/research/agentic-coding-deep-research-2025-12-27.md`

---

## Overview

### Problem Statement

The Via-gent MVP has foundational code implemented but requires **end-to-end verification and gap fixes** to complete the vertical slice. The initial gap analysis from conversation research suggested multiple NOT_IMPLEMENTED criteria, but code investigation reveals:

- **Most functionality IS implemented** at the code level
- The gap is in **E2E verification and wiring consistency**
- Need to update sprint-status.yaml with accurate status after browser testing

### Solution

Execute a **verification-first approach**:
1. Run the application in browser
2. Verify each MVP acceptance criterion manually
3. Fix only the genuine gaps discovered
4. Capture E2E screenshot evidence
5. Update sprint-status.yaml with accurate status

### Scope

**In Scope:**
- MVP-1 through MVP-7 acceptance criteria verification
- Fix genuine gaps discovered during E2E testing
- Screenshot/recording evidence capture
- Sprint status updates

**Out of Scope:**
- Context engineering (Phase 2)
- Advanced features (mode switching, multi-thread)
- Performance optimization

---

## Context for Development

### Codebase Patterns

Based on code investigation:

| Component | File | Pattern | Status |
|-----------|------|---------|--------|
| Agent Config Dialog | `src/components/agent/AgentConfigDialog.tsx` (895 lines) | Zod validation, multi-tab, provider configs | ✅ Complete |
| Agents Store | `src/stores/agents-store.ts` (157 lines) | Zustand + persist middleware | ✅ Complete |
| Agent Chat Panel | `src/components/ide/AgentChatPanel.tsx` (648 lines) | useAgentChatWithTools hook integration | ✅ Complete |
| Model Registry | `src/lib/agent/providers/model-registry.ts` | API fetch + caching + fallback | ✅ Complete |
| Credential Vault | `src/lib/agent/providers/credential-vault.ts` | Secure localStorage storage | ✅ Complete |
| Approval Overlay | `src/components/chat/ApprovalOverlay.tsx` | Modal/inline approval UI | ✅ Complete |
| Chat API Route | `src/routes/api/chat.ts` | TanStack Start SSE streaming | ✅ Complete |
| Tool Definitions | `src/lib/agent/tools/*.ts` | TanStack AI toolDefinition pattern | ✅ Complete |

### Files to Reference

**Primary Implementation Files:**
```
src/components/agent/AgentConfigDialog.tsx    # Configuration UI
src/stores/agents-store.ts                    # Agent persistence
src/lib/agent/providers/                      # Provider infrastructure
  ├── credential-vault.ts                     # API key storage
  ├── model-registry.ts                       # Model catalog
  └── provider-adapter.ts                     # LLM adapter factory
src/components/ide/AgentChatPanel.tsx         # Chat interface
src/lib/agent/hooks/use-agent-chat-with-tools.ts  # Chat hook
src/components/chat/ApprovalOverlay.tsx       # Tool approval UI
src/routes/api/chat.ts                        # API endpoint
```

**Test Files (for understanding expectations):**
```
src/components/agent/__tests__/AgentConfigDialog.test.tsx
src/components/chat/__tests__/ApprovalOverlay.test.tsx
src/components/ide/__tests__/AgentChatPanel.test.tsx
```

### Technical Decisions

1. **Agent State:** Zustand with `persist` middleware → localStorage `via-gent-agents`
2. **Credentials:** `credentialVault` → localStorage with encryption keys
3. **Models:** `modelRegistry.getModels()` → API fetch with 5-min cache + fallback to FREE_MODELS
4. **Chat:** `useAgentChatWithTools` → TanStack AI `useChat` + client tools
5. **Approval:** `pendingApprovals` → ApprovalOverlay with `currentApproval` pattern
6. **Streaming:** SSE via `/api/chat` → TanStack Start server handlers

---

## Implementation Plan

### Phase 1: E2E Verification (MVP-1)

**Location:** Browser at `localhost:5173` or deployed URL

**Tasks:**

- [ ] **T1.1:** Start dev server (`pnpm dev`) and open in browser
- [ ] **T1.2:** Navigate to IDE page with a project loaded
- [ ] **T1.3:** Open Agent Configuration Dialog (gear icon on agent card)
- [ ] **T1.4:** Verify provider dropdown shows: OpenRouter, OpenAI, Anthropic, Google, OpenAI Compatible
- [ ] **T1.5:** Select OpenRouter provider
- [ ] **T1.6:** Verify model dropdown populates with free models (no API key needed)
- [ ] **T1.7:** Enter API key → Save → Verify models reload from API
- [ ] **T1.8:** Click "Test Connection" → Verify success/failure toast
- [ ] **T1.9:** Save agent configuration → Verify stored in agents-store
- [ ] **T1.10:** Refresh browser → Verify agent config persists
- [ ] **T1.11:** **Capture screenshot evidence** for each criterion

**Gap Fix (if discovered):**
- If model dropdown empty: Check `loadModels()` console logs
- If persistence fails: Check localStorage `via-gent-agents` key
- If test connection fails: Check `providerAdapterFactory.testConnection()` logs

### Phase 2: E2E Verification (MVP-2 - Chat Interface)

- [ ] **T2.1:** Click on configured agent to activate chat
- [ ] **T2.2:** Send "Hello, can you read the README.md file?" message
- [ ] **T2.3:** Verify message appears in chat (user bubble)
- [ ] **T2.4:** Verify SSE streaming starts (loading indicator)
- [ ] **T2.5:** Verify response streams in real-time (assistant bubble)
- [ ] **T2.6:** Verify markdown formatting in response
- [ ] **T2.7:** Verify code blocks have syntax highlighting
- [ ] **T2.8:** Refresh browser → Verify chat history persists (Dexie threads)
- [ ] **T2.9:** **Capture screenshot evidence**

**Gap Fix (if discovered):**
- If no response: Check browser console for API errors
- If 404 on /api/chat: Verify route registration in TanStack Start
- If no streaming: Check `fetchServerSentEvents` configuration

### Phase 3: E2E Verification (MVP-3 - File Tool Execution)

- [ ] **T3.1:** Send message requesting to read a file (e.g., "Read the package.json file")
- [ ] **T3.2:** Verify tool call appears in response
- [ ] **T3.3:** Verify ApprovalOverlay appears (if low-risk tool auto-approves, this may skip)
- [ ] **T3.4:** Approve tool execution
- [ ] **T3.5:** Verify file contents appear in response
- [ ] **T3.6:** Request file write: "Create a test.txt file with 'Hello World'"
- [ ] **T3.7:** Verify ApprovalOverlay shows diff/preview
- [ ] **T3.8:** Approve → Verify file created in FileTree
- [ ] **T3.9:** Verify Monaco editor can open the new file
- [ ] **T3.10:** **Capture screenshot evidence**

**Gap Fix (if discovered):**
- If no tool call: Check system prompt includes tool definitions
- If ApprovalOverlay not showing: Check `pendingApprovals.length` in hook
- If file not syncing: Check SyncManager and EventBus connection

### Phase 4: E2E Verification (MVP-4 - Terminal Tool Execution)

- [ ] **T4.1:** Send "Run npm --version command"
- [ ] **T4.2:** Verify terminal tool call appears
- [ ] **T4.3:** Approve execution
- [ ] **T4.4:** Verify command output captured in response
- [ ] **T4.5:** Verify terminal panel shows command execution (if visible)
- [ ] **T4.6:** **Capture screenshot evidence**

**Gap Fix (if discovered):**
- If command fails: Check WebContainer terminal integration
- If no output: Check `terminalTools` facade implementation

### Phase 5: E2E Verification (MVP-5 - Approval Workflow)

- [ ] **T5.1:** Trigger a write_file tool call
- [ ] **T5.2:** Verify ApprovalOverlay displays with:
  - Tool name (write_file)
  - Description (file path, action)
  - Risk level indicator (medium/high)
  - Proposed content preview
  - Approve/Reject buttons
- [ ] **T5.3:** Click Reject → Verify rejection message in chat
- [ ] **T5.4:** Trigger same tool again → Approve → Verify success
- [ ] **T5.5:** **Capture screenshot evidence**

**Gap Fix (if discovered):**
- If risk level not showing: Check `riskLevel` prop in ApprovalOverlay
- If reject not working: Check `rejectToolCall()` implementation

### Phase 6: E2E Verification (MVP-6 - Real-time UI Updates)

- [ ] **T6.1:** After file write, verify FileTree refreshes automatically
- [ ] **T6.2:** Open modified file in Monaco → Verify content updated
- [ ] **T6.3:** Refresh browser → Verify:
  - Agent config persists
  - Chat thread persists
  - Project state persists
- [ ] **T6.4:** **Capture screenshot evidence**

**Gap Fix (if discovered):**
- If FileTree not refreshing: Check EventBus subscription in FileTree component
- If Monaco stale: Check file change event propagation

### Phase 7: Integration Testing (MVP-7)

- [ ] **T7.1:** Run full workflow: Configure → Chat → Tool Execute → Approve → Iterate
- [ ] **T7.2:** Record browser session (screen recording)
- [ ] **T7.3:** Verify TypeScript build passes: `pnpm build`
- [ ] **T7.4:** Verify no console errors during workflow
- [ ] **T7.5:** Save recording to `_bmad-output/e2e-verification/`
- [ ] **T7.6:** Update sprint-status.yaml with final status

---

## Acceptance Criteria

### MVP-1: Agent Configuration & Persistence

- [TO_VERIFY] User can select AI provider (OpenRouter/Anthropic)
- [TO_VERIFY] API keys stored securely in localStorage
- [TO_VERIFY] Model selection from provider catalog
- [TO_VERIFY] Configuration persists across browser sessions
- [TO_VERIFY] Connection test passes before saving
- [TO_VERIFY] Agent status shows 'Ready' when configured
- [TO_VERIFY] Configuration dialog accessible from IDE

### MVP-2: Chat Interface with Streaming

- [TO_VERIFY] Chat panel opens and displays messages
- [TO_VERIFY] Messages send to /api/chat endpoint
- [TO_VERIFY] Responses stream in real-time using SSE
- [TO_VERIFY] Rich text formatting for responses
- [TO_VERIFY] Code blocks with syntax highlighting
- [TO_VERIFY] Error handling for failed requests
- [TO_VERIFY] Chat history persists in localStorage

### MVP-3: Tool Execution - File Operations

- [TO_VERIFY] AI can request to read project files
- [TO_VERIFY] Approval dialog shows file path and content preview
- [TO_VERIFY] AI can request to write/update files
- [TO_VERIFY] File changes sync to local filesystem
- [TO_VERIFY] Monaco editor reflects changes in real-time

### MVP-4: Tool Execution - Terminal Commands

- [TO_VERIFY] AI can request terminal commands
- [TO_VERIFY] Commands execute in WebContainer terminal
- [TO_VERIFY] Output captured and displayed in real-time

### MVP-5: Approval Workflow

- [TO_VERIFY] Tool calls displayed in chat UI
- [TO_VERIFY] Approval overlay shows clear context
- [TO_VERIFY] User can approve or deny each tool call

### MVP-6: Real-time UI Updates

- [TO_VERIFY] File sync status updates in UI
- [TO_VERIFY] All IDE panels stay synchronized
- [TO_VERIFY] State survives browser refresh

### MVP-7: E2E Integration Testing

- [TO_VERIFY] Full workflow test passes
- [TO_VERIFY] Browser automation test passes
- [TO_VERIFY] Demo video recorded

---

## Additional Context

### Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `@tanstack/ai-react` | Chat hooks | Latest |
| `zustand` | State management with persist | ^4.x |
| `dexie` | IndexedDB for threads | ^4.x |
| `sonner` | Toast notifications | Latest |
| `zod` | Form validation | ^3.x |

### Testing Strategy

1. **Manual E2E Testing:** Primary verification method for this sprint
2. **Screenshot Evidence:** Required for each acceptance criterion
3. **Console Monitoring:** Check for errors during workflow
4. **Build Verification:** `pnpm build` must pass clean

### Notes

**Key Insight from Code Review:**

The codebase is **more complete than the gap analysis suggested**. The research document was based on sprint-status.yaml which had many criteria marked as NOT_IMPLEMENTED, but:

1. `AgentConfigDialog.tsx` (895 lines) has full model selection, API key management, connection testing
2. `AgentChatPanel.tsx` (648 lines) properly wires `useAgentChatWithTools` with approval handling
3. `ApprovalOverlay.tsx` is fully integrated and receiving `pendingApprovals` from the hook
4. Persistence is implemented via Zustand persist + Dexie threads

**Risk Assessment:**
- LOW: Most functionality exists, just needs verification
- MEDIUM: Some wiring issues may be discovered during E2E testing
- Action: Fix gaps as discovered, do not assume they exist before testing

---

## Quick Reference

**Sprint Status File:** `_bmad-output/sprint-status.yaml`

**After Verification Updates:**
```yaml
# When AC verified in browser:
status: "NOT_IMPLEMENTED" → "implemented"
e2e_verified: false → true
e2e_evidence: "_bmad-output/e2e-verification/{story}-screenshot.png"
```

**Workflow After Tech-Spec:**
1. Run `/story-dev-cycle` for verification tasks
2. Start dev server and browser
3. Execute tasks systematically
4. Capture evidence
5. Update sprint-status.yaml
6. Mark story as DONE when all criteria verified

---

*Generated by BMAD Tech-Spec Workflow - 2025-12-27*
