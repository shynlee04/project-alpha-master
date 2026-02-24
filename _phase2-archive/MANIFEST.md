# Phase 2+ Archive Manifest
# Created: 2026-01-29
# Purpose: Track all Phase 2+ files archived for context isolation
# Restore: Copy files back to original paths when ready for Phase 2

## ARCHIVED DIRECTORIES

### 1. src/presentation/components/agent/ (85 files)
Phase: 2
Status: ARCHIVED
Original: src/presentation/components/agent/
Archived: _phase2-archive/presentation/components/agent/

### 2. src/lib/agent/ (100+ files)
Phase: 2
Status: ARCHIVED
Original: src/lib/agent/
Archived: _phase2-archive/lib/agent/

### 3. src/infrastructure/persistence/stores/agents/
Phase: 2
Status: ARCHIVED
Original: src/infrastructure/persistence/stores/agents/
Archived: _phase2-archive/infrastructure/persistence/stores/agents/

### 4. src/infrastructure/persistence/stores/providers/
Phase: 2
Status: ARCHIVED
Original: src/infrastructure/persistence/stores/providers/
Archived: _phase2-archive/infrastructure/persistence/stores/providers/

### 5. src/infrastructure/persistence/stores/conversation/
Phase: 2
Status: ARCHIVED
Original: src/infrastructure/persistence/stores/conversation/
Archived: _phase2-archive/infrastructure/persistence/stores/conversation/

### 6. src/domain/tools/
Phase: 2
Status: ARCHIVED
Original: src/domain/tools/
Archived: _phase2-archive/domain/tools/

### 7. src/infrastructure/tools/
Phase: 2
Status: ARCHIVED
Original: src/infrastructure/tools/
Archived: _phase2-archive/infrastructure/tools/

### 8. src/application/services/ProviderService.ts
Phase: 2
Status: ARCHIVED
Original: src/application/services/ProviderService.ts
Archived: _phase2-archive/application/services/ProviderService.ts

### 9. src/routes/agents.tsx
Phase: 2
Status: ARCHIVED
Original: src/routes/agents.tsx
Archived: _phase2-archive/routes/agents.tsx

### 10. src/routes/api/provider-test.ts
Phase: 2
Status: ARCHIVED
Original: src/routes/api/provider-test.ts
Archived: _phase2-archive/routes/api/provider-test.ts
Stub: src/routes/api/provider-test.ts (returns 503 Service Unavailable)

### 11. src/presentation/components/ide/AgentChatPanel.tsx
Phase: 2
Status: ARCHIVED
Original: src/presentation/components/ide/AgentChatPanel.tsx
Archived: _phase2-archive/presentation/components/ide/AgentChatPanel.tsx
Stub: src/presentation/components/ide/AgentChatPanel.tsx (returns null)

### 12. src/presentation/components/ide/AgentChatPanel/*.tsx
Phase: 2
Status: ARCHIVED
Files:
- AgentChatToolFacades.tsx
- AgentChatAPIKeyManager.tsx
- AgentChatApprovals.tsx
- useAgentChatApprovals.ts
Original: src/presentation/components/ide/AgentChatPanel/
Archived: _phase2-archive/presentation/components/ide/AgentChatPanel/
Stubs: Created with Phase 2 disabled messages

### 13. src/presentation/components/ide/EnhancedChatInterface.tsx
Phase: 2
Status: ARCHIVED
Original: src/presentation/components/ide/EnhancedChatInterface.tsx
Archived: _phase2-archive/presentation/components/ide/EnhancedChatInterface.tsx
Stub: src/presentation/components/ide/EnhancedChatInterface.tsx (returns null)

### 14. src/presentation/components/ide/AgentsPanel.tsx
Phase: 2
Status: ARCHIVED
Original: src/presentation/components/ide/AgentsPanel.tsx
Archived: _phase2-archive/presentation/components/ide/AgentsPanel.tsx
Stub: src/presentation/components/ide/AgentsPanel.tsx (returns null)

### 15. src/presentation/components/ide/hooks/useAgentChat*.ts
Phase: 2
Status: ARCHIVED
Files:
- useAgentChatApproval.ts
- useAgentChatMessages.ts
Original: src/presentation/components/ide/hooks/
Archived: _phase2-archive/presentation/components/ide/hooks/
Stubs: Created with Phase 2 disabled messages

### 16. src/infrastructure/tools/centralized-tool-registry.ts
Phase: 2
Status: ARCHIVED
Original: src/infrastructure/tools/centralized-tool-registry.ts
Archived: _phase2-archive/infrastructure/tools/centralized-tool-registry.ts
Stub: src/infrastructure/tools/centralized-tool-registry.ts (returns empty registry)

### 17. src/infrastructure/tools/tool-catalog.ts
Phase: 2
Status: ARCHIVED
Original: src/infrastructure/tools/tool-catalog.ts
Archived: _phase2-archive/infrastructure/tools/tool-catalog.ts
Stub: src/infrastructure/tools/tool-catalog.ts (returns empty catalog)

## STUB FILES CREATED

The following stub files were created to maintain import compatibility:

1. `src/lib/agent/providers/types.ts` - Provider configuration types and constants
2. `src/lib/agent/hooks/use-multi-agent-chat.ts` - Multi-agent chat hook
3. `src/lib/agent/facades/file-lock.ts` - File lock manager
4. `src/lib/agent/utils/token-estimator.ts` - Token estimation utilities
5. `src/lib/workflow/builder/types.ts` - Workflow builder types
6. `src/domain/tools/tool-permissions.ts` - Tool permission types

## RESTORATION COMMAND

```bash
# To restore all Phase 2+ code:
cp -r _phase2-archive/* src/
```

## NOTES

- These files are AI/Agent related features
- Archived to prevent context poisoning during Phase 1A
- Will be restored when Phase 2 development begins
- TypeScript errors expected after archiving - this is intentional
