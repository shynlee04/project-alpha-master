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
